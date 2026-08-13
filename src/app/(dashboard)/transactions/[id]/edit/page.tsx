import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { getTransaction, getTransactionOptions } from "@/features/transactions/queries";
import { transactionIdSchema } from "@/features/transactions/schema";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!transactionIdSchema.safeParse(id).success) notFound();
  const detail = await getTransaction(id);
  if (!detail.transaction && !detail.error) notFound();
  if (!detail.transaction) return <Alert variant="destructive">{detail.error}</Alert>;
  if (detail.transaction.deleted_at) return <Alert title="Transaksi berada di sampah">Pulihkan transaksi sebelum mengeditnya.</Alert>;
  const options = await getTransactionOptions({
    includeArchivedIds: {
      categoryId: detail.transaction.category_id,
      accountId: detail.transaction.account_id,
    },
  });
  return <div className="space-y-6"><PageHeader eyebrow="Perbarui data" title="Edit transaksi" description="Perubahan akan langsung tercermin pada saldo, anggaran, dan laporan." actions={<Button asChild variant="ghost"><Link href={`/transactions/${id}`}><ArrowLeft className="h-4 w-4" />Batal</Link></Button>} />{options.error ? <Alert variant="destructive">{options.error}</Alert> : null}<TransactionForm transaction={detail.transaction} categories={options.categories} accounts={options.accounts} currencyCode={options.currencyCode} /></div>;
}
