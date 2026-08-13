import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Scale,
  type LucideIcon,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { ReportCharts } from "@/features/reports/components/report-charts";
import { getReportData } from "@/features/reports/queries";
import type { ReportAccountPoint } from "@/features/reports/types";
import { getTransactions } from "@/features/transactions/queries";
import type { TransactionRecord } from "@/features/transactions/types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

interface ReportsPageProps {
  searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const report = await getReportData(params.start, params.end);
  const details = await getTransactions({
    start: report.period.start,
    end: report.period.end,
    type: "all",
    trash: "false",
  });
  const exportQuery = new URLSearchParams({
    start: report.period.start,
    end: report.period.end,
  });

  if (!report.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analisis"
          title="Laporan"
          description="Tinjau pola keuangan berdasarkan rentang tanggal."
        />
        <Alert variant="destructive" title="Laporan belum dapat dibuat">
          {report.error}
        </Alert>
      </div>
    );
  }

  const data = report.data;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analisis"
        title="Laporan keuangan"
        description="Tinjau tren, peringkat kategori, akun, dan rincian transaksi."
        actions={
          <>
            <Button asChild variant="outline">
              <a href={`/api/export?format=csv&${exportQuery}`}>
                <Download aria-hidden="true" />CSV
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`/api/export?format=json&${exportQuery}`}>
                <Download aria-hidden="true" />Backup JSON
              </a>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <form method="get" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label htmlFor="report-start" className="mb-2 block">Tanggal mulai</Label>
              <Input id="report-start" name="start" type="date" defaultValue={report.period.start} />
            </div>
            <div>
              <Label htmlFor="report-end" className="mb-2 block">Tanggal akhir</Label>
              <Input id="report-end" name="end" type="date" defaultValue={report.period.end} />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Terapkan rentang</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Ringkasan laporan">
        <Metric title="Pemasukan" value={formatCurrency(data.income, report.currency)} icon={ArrowUpRight} tone="income" />
        <Metric title="Pengeluaran" value={formatCurrency(data.expense, report.currency)} icon={ArrowDownRight} tone="expense" />
        <Metric title="Arus kas bersih" value={formatCurrency(data.net, report.currency)} icon={Scale} tone="primary" />
      </section>

      <ReportCharts trend={data.trend} categories={data.categories} currency={report.currency} />
      <AccountSummary accounts={data.accounts} currency={report.currency} />
      <TransactionDetails transactions={details.transactions} currency={report.currency} error={details.error} />
    </div>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  tone: "income" | "expense" | "primary";
}) {
  const style = tone === "income"
    ? "bg-income-soft text-income-text"
    : tone === "expense"
      ? "bg-expense-soft text-expense"
      : "bg-primary-soft text-primary";

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <span className={`shrink-0 rounded-xl p-2.5 ${style}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function AccountSummary({ accounts, currency }: { accounts: ReportAccountPoint[]; currency: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan akun</CardTitle>
        <p className="text-sm text-muted-foreground">Arus kas bersih per akun pada periode terpilih.</p>
      </CardHeader>
      <CardContent className="p-0">
        {accounts.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Belum ada aktivitas akun pada rentang ini.</p>
        ) : (
          <>
            <div className="divide-y divide-border md:hidden">
              {accounts.map((account) => (
                <article key={account.account_id} className="space-y-3 p-5">
                  <h3 className="font-semibold">{account.name}</h3>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Pemasukan</dt>
                    <dd className="text-right font-semibold tabular-nums text-income-text">{formatCurrency(account.income, currency)}</dd>
                    <dt className="text-muted-foreground">Pengeluaran</dt>
                    <dd className="text-right font-semibold tabular-nums text-expense">{formatCurrency(account.expense, currency)}</dd>
                    <dt className="text-muted-foreground">Bersih</dt>
                    <dd className="text-right font-bold tabular-nums">{formatCurrency(account.net, currency)}</dd>
                  </dl>
                </article>
              ))}
            </div>

            <table className="hidden w-full text-sm md:table">
              <thead className="border-y border-border bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Akun</th>
                  <th className="px-5 py-3 text-right">Pemasukan</th>
                  <th className="px-5 py-3 text-right">Pengeluaran</th>
                  <th className="px-5 py-3 text-right">Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.map((account) => (
                  <tr key={account.account_id}>
                    <td className="px-5 py-3 font-semibold">{account.name}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-income-text">{formatCurrency(account.income, currency)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-expense">{formatCurrency(account.expense, currency)}</td>
                    <td className="px-5 py-3 text-right font-bold tabular-nums">{formatCurrency(account.net, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionDetails({
  transactions,
  currency,
  error,
}: {
  transactions: TransactionRecord[];
  currency: string;
  error: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rincian transaksi</CardTitle>
        <p className="text-sm text-muted-foreground">Maksimal 250 transaksi ditampilkan; ekspor mencakup seluruh data dalam rentang.</p>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="p-5"><Alert variant="destructive">{error}</Alert></div>
        ) : transactions.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Tidak ada transaksi dalam rentang ini.</p>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((item) => (
              <Link
                key={item.id}
                href={`/transactions/${item.id}`}
                className="flex flex-col gap-2 px-5 py-3 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.description || item.category?.name || "Transaksi"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.transaction_date)} · {item.account?.name ?? "Tanpa akun"}</p>
                </div>
                <p className={`shrink-0 text-sm font-bold tabular-nums ${item.type === "income" ? "text-income-text" : "text-expense"}`}>
                  <span className="sr-only">{item.type === "income" ? "Pemasukan" : "Pengeluaran"}: </span>
                  {item.type === "income" ? "+" : "−"}{formatCurrency(item.amount, currency)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
