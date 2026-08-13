import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleDollarSign, Plus, ReceiptText, Scale } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { brandConfig } from "@/config/brand";
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { getDashboardData } from "@/features/dashboard/queries";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { moneyPercentage, moneyToCents } from "@/lib/money";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const result = await getDashboardData(month);
  const monthLabel = new Intl.DateTimeFormat(brandConfig.locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${result.period.start}T00:00:00Z`));

  if (!result.data) return <div className="space-y-5"><PageHeader eyebrow="Ringkasan" title="Dashboard" description="Kesehatan keuangan Anda dalam satu tampilan." /><Alert variant="destructive" title="Ringkasan belum dapat dimuat">{result.error}</Alert></div>;
  const data = result.data;
  const currency = result.currency;
  const netPositive = moneyToCents(data.net_cash_flow) >= 0n;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Ringkasan keuangan" title="Dashboard" description={`Gambaran keuangan untuk ${monthLabel}.`} actions={<><form method="get" className="flex items-center gap-2"><label className="sr-only" htmlFor="month">Pilih bulan</label><input id="month" name="month" type="month" defaultValue={result.period.value} className="h-10 min-w-0 rounded-lg border border-input bg-surface px-3 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /><Button type="submit" variant="outline">Terapkan</Button></form><Button asChild><Link href="/transactions/create"><Plus className="h-4 w-4" />Tambah transaksi</Link></Button></>} />
      {result.error ? <Alert title="Sebagian data profil belum dapat dimuat">{result.error}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan angka">
        <SummaryCard title="Total saldo saat ini" value={formatCurrency(data.total_balance, currency)} icon={CircleDollarSign} tone="primary" helper="Saldo awal + seluruh arus kas" />
        <SummaryCard title="Pemasukan periode" value={formatCurrency(data.period_income, currency)} icon={ArrowUpRight} tone="income" helper={monthLabel} />
        <SummaryCard title="Pengeluaran periode" value={formatCurrency(data.period_expense, currency)} icon={ArrowDownRight} tone="expense" helper={monthLabel} />
        <SummaryCard title="Arus kas bersih" value={formatCurrency(data.net_cash_flow, currency)} icon={Scale} tone={netPositive ? "income" : "expense"} helper={netPositive ? "Surplus periode" : "Defisit periode"} />
      </section>

      <DashboardCharts trend={data.trend} categories={data.expenses_by_category} currency={currency} />

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Transaksi terbaru</CardTitle><p className="mt-1 text-sm text-muted-foreground">Aktivitas terkini dari semua akun.</p></div><Button asChild variant="ghost" size="sm"><Link href="/transactions">Lihat semua<ArrowRight className="h-4 w-4" /></Link></Button></CardHeader>
          <CardContent>
            {data.recent_transactions.length === 0 ? <EmptyState compact icon={ReceiptText} title="Belum ada transaksi" description="Catat transaksi pertama untuk mulai membangun ringkasan." action={<Button asChild size="sm"><Link href="/transactions/create"><Plus className="h-4 w-4" />Tambah</Link></Button>} /> : <div className="divide-y divide-border">{data.recent_transactions.map((item) => <Link key={item.id} href={`/transactions/${item.id}`} className="flex items-center justify-between gap-4 rounded-lg px-1 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex min-w-0 items-center gap-3"><span className="h-9 w-9 shrink-0 rounded-xl border border-border" style={{ backgroundColor: item.category_color ? `${item.category_color}1A` : undefined }}><span className="sr-only">Kategori</span></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.description || item.category_name || "Transaksi"}</p><p className="truncate text-xs text-muted-foreground">{formatDate(item.transaction_date)} · {item.account_name ?? "Tanpa akun"}</p></div></div><p className={`shrink-0 text-sm font-bold tabular-nums ${item.type === "income" ? "text-income-text" : "text-expense"}`}>{item.type === "income" ? "+" : "−"}{formatCurrency(item.amount, currency)}</p></Link>)}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Anggaran berjalan</CardTitle><p className="mt-1 text-sm text-muted-foreground">Pemakaian anggaran pada periode ini.</p></div><Button asChild variant="ghost" size="sm"><Link href="/budgets">Kelola<ArrowRight className="h-4 w-4" /></Link></Button></CardHeader>
          <CardContent>
            {data.budgets.length === 0 ? <EmptyState compact icon={Scale} title="Belum ada anggaran" description="Tetapkan batas kategori agar pengeluaran lebih terarah." action={<Button asChild variant="outline" size="sm"><Link href="/budgets">Buat anggaran</Link></Button>} /> : <div className="space-y-5">{data.budgets.slice(0, 4).map((budget) => { const usage = moneyPercentage(budget.used, budget.amount); const state = usage >= 100 ? "exceeded" : usage >= 80 ? "warning" : "safe"; return <div key={budget.id} className="space-y-2"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold">{budget.category_name}</p><Badge variant={state === "exceeded" ? "expense" : state === "warning" ? "warning" : "secondary"}>{Math.round(usage)}%</Badge></div><Progress value={Math.min(usage, 100)} tone={state} /><div className="flex justify-between text-xs text-muted-foreground"><span>{formatCurrency(budget.used, currency)} terpakai</span><span>{formatCurrency(budget.amount, currency)}</span></div></div>; })}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, helper, icon: Icon, tone }: { title: string; value: string; helper: string; icon: typeof CircleDollarSign; tone: "primary" | "income" | "expense" }) {
  const styles = { primary: "bg-primary-soft text-primary", income: "bg-income-soft text-income-text", expense: "bg-expense-soft text-expense" };
  return <Card><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{title}</p><p className="mt-2 break-words text-2xl font-bold tracking-tight tabular-nums text-foreground">{value}</p></div><span className={`rounded-xl p-2.5 ${styles[tone]}`}><Icon className="h-5 w-5" /></span></div><p className="mt-3 text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
