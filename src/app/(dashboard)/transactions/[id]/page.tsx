import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Edit3, Paperclip } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { paymentMethodLabels, transactionTypeLabels } from "@/features/transactions/config";
import { TransactionActions } from "@/features/transactions/components/transaction-actions";
import { getTransaction } from "@/features/transactions/queries";
import { transactionIdSchema } from "@/features/transactions/schema";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!transactionIdSchema.safeParse(id).success) notFound();
  const { transaction, attachmentUrl, currencyCode, error } = await getTransaction(id);
  if (!transaction && !error) notFound();
  if (!transaction) return <Alert variant="destructive" title="Transaksi tidak dapat dimuat">{error}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Rincian transaksi" title={transaction.description || transaction.category?.name || "Transaksi"} description="Informasi sumber yang dipakai untuk menghitung saldo dan laporan." actions={<><Button asChild variant="ghost"><Link href="/transactions"><ArrowLeft className="h-4 w-4" />Kembali</Link></Button>{!transaction.deleted_at ? <Button asChild variant="outline"><Link href={`/transactions/${id}/edit`}><Edit3 className="h-4 w-4" />Edit</Link></Button> : null}<TransactionActions id={id} deleted={Boolean(transaction.deleted_at)} /></>} />
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <Card className="max-w-3xl">
        <CardContent className="p-5 sm:p-7">
          <div className="border-b border-border pb-6 text-center">
            <Badge variant={transaction.type === "income" ? "income" : "expense"}>{transactionTypeLabels[transaction.type]}</Badge>
            <p className={`mt-3 text-3xl font-bold tabular-nums sm:text-4xl ${transaction.type === "income" ? "text-income-text" : "text-expense"}`}>{transaction.type === "income" ? "+" : "−"}{formatCurrency(transaction.amount, currencyCode)}</p>
            {transaction.deleted_at ? <p className="mt-2 text-sm font-medium text-warning-foreground">Transaksi ini berada di sampah dan tidak dihitung.</p> : null}
          </div>
          <dl className="divide-y divide-border">
            <DetailRow label="Tanggal" value={formatDate(transaction.transaction_date)} />
            <DetailRow label="Kategori" value={transaction.category?.name ?? "Kategori tidak tersedia"} />
            <DetailRow label="Akun" value={transaction.account?.name ?? "Akun tidak tersedia"} />
            <DetailRow label="Metode" value={paymentMethodLabels[transaction.payment_method]} />
            <DetailRow label="Deskripsi" value={transaction.description || "Tidak ada deskripsi"} />
          </dl>
          {attachmentUrl ? <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-medium"><Paperclip className="h-4 w-4 text-primary" />Lampiran pribadi</div><Button asChild size="sm" variant="outline"><a href={attachmentUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" />Buka</a></Button></div><p className="mt-2 text-xs text-muted-foreground">Tautan aman ini kedaluwarsa dalam 10 menit.</p></div> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="break-words text-sm font-semibold text-foreground">{value}</dd></div>;
}
