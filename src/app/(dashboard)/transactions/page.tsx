import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Plus, ReceiptText } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { paymentMethodLabels, transactionTypeLabels } from "@/features/transactions/config";
import { TransactionActions } from "@/features/transactions/components/transaction-actions";
import { TransactionFiltersForm } from "@/features/transactions/components/transaction-filters";
import { getTransactionOptions, getTransactions } from "@/features/transactions/queries";
import type { TransactionFilters } from "@/features/transactions/schema";

interface TransactionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function transactionPageHref(filters: TransactionFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.start) params.set("start", filters.start);
  if (filters.end) params.set("end", filters.end);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.account) params.set("account", filters.account);
  if (filters.search) params.set("search", filters.search);
  if (filters.trash === "true") params.set("trash", "true");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const raw = await searchParams;
  const simple = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const [{ transactions, filters, pagination, error }, options] = await Promise.all([
    getTransactions(simple),
    getTransactionOptions({ includeArchived: true }),
  ]);
  const isTrash = filters.trash === "true";

  if (pagination.totalCount > 0 && pagination.page > pagination.totalPages) {
    redirect(transactionPageHref(filters, pagination.totalPages));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arus kas"
        title={isTrash ? "Sampah transaksi" : "Transaksi"}
        description={isTrash ? "Pulihkan transaksi yang tidak sengaja dihapus." : "Catat dan telusuri setiap pemasukan serta pengeluaran."}
        actions={
          <>
            <Button asChild variant="outline"><a href={`/api/export?format=csv${filters.start ? `&start=${filters.start}` : ""}${filters.end ? `&end=${filters.end}` : ""}`}><Download className="h-4 w-4" />CSV</a></Button>
            {!isTrash ? <Button asChild><Link href="/transactions/create"><Plus className="h-4 w-4" />Tambah transaksi</Link></Button> : null}
          </>
        }
      />

      <TransactionFiltersForm filters={filters} categories={options.categories} accounts={options.accounts} />
      {error || options.error ? <Alert variant="destructive" title="Data belum dapat dimuat">{error ?? options.error}</Alert> : null}

      {transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={isTrash ? "Sampah masih kosong" : "Belum ada transaksi"}
          description={isTrash ? "Transaksi yang dihapus akan muncul di sini." : "Mulai dari transaksi pertama agar saldo dan laporan dapat dihitung."}
          action={!isTrash ? <Button asChild><Link href="/transactions/create"><Plus className="h-4 w-4" />Tambah transaksi</Link></Button> : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-5 py-3 font-semibold">Transaksi</th><th className="px-5 py-3 font-semibold">Akun</th><th className="px-5 py-3 font-semibold">Tanggal</th><th className="px-5 py-3 text-right font-semibold">Jumlah</th><th className="px-5 py-3"><span className="sr-only">Aksi</span></th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-5 py-4"><Link href={`/transactions/${transaction.id}`} className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: transaction.category?.color }} /><span className="font-semibold text-foreground group-hover:text-primary">{transaction.description || transaction.category?.name || "Transaksi"}</span></div><div className="mt-1 text-xs text-muted-foreground">{transaction.category?.name ?? "Kategori tidak tersedia"} · {paymentMethodLabels[transaction.payment_method]}</div></Link></td>
                      <td className="px-5 py-4 text-muted-foreground">{transaction.account?.name ?? "Akun tidak tersedia"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{formatDate(transaction.transaction_date)}</td>
                      <td className={`whitespace-nowrap px-5 py-4 text-right font-bold tabular-nums ${transaction.type === "income" ? "text-income-text" : "text-expense"}`}><span className="sr-only">{transactionTypeLabels[transaction.type]} </span>{transaction.type === "income" ? "+" : "−"}{formatCurrency(transaction.amount, options.currencyCode)}</td>
                      <td className="px-5 py-4 text-right">{isTrash ? <TransactionActions id={transaction.id} deleted compact /> : <Button asChild variant="ghost" size="sm"><Link href={`/transactions/${transaction.id}`}>Detail</Link></Button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {transactions.map((transaction) => (
                <article key={transaction.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><Link href={`/transactions/${transaction.id}`} className="rounded-sm font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{transaction.description || transaction.category?.name || "Transaksi"}</Link><p className="mt-1 truncate text-xs text-muted-foreground">{transaction.category?.name ?? "Tanpa kategori"} · {transaction.account?.name ?? "Tanpa akun"}</p></div>
                    <p className={`shrink-0 font-bold tabular-nums ${transaction.type === "income" ? "text-income-text" : "text-expense"}`}>{transaction.type === "income" ? "+" : "−"}{formatCurrency(transaction.amount, options.currencyCode)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between"><Badge variant="secondary">{formatDate(transaction.transaction_date)}</Badge>{isTrash ? <TransactionActions id={transaction.id} deleted compact /> : <Button asChild variant="ghost" size="sm"><Link href={`/transactions/${transaction.id}`}>Lihat detail</Link></Button>}</div>
                </article>
              ))}
            </div>

            {pagination.totalPages > 1 ? (
              <nav
                className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                aria-label="Navigasi halaman transaksi"
              >
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Menampilkan {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.totalCount,
                  )} dari {pagination.totalCount} transaksi
                </p>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  {pagination.page > 1 ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={transactionPageHref(filters, pagination.page - 1)}>Sebelumnya</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
                  )}
                  <span className="whitespace-nowrap text-sm font-medium tabular-nums">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  {pagination.page < pagination.totalPages ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={transactionPageHref(filters, pagination.page + 1)}>Berikutnya</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>Berikutnya</Button>
                  )}
                </div>
              </nav>
            ) : null}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
