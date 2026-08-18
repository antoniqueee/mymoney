import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { getTransactionOptions } from "@/features/transactions/queries";

export default async function CreateTransactionPage() {
  const { categories, accounts, currencyCode, error } = await getTransactionOptions();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Transaksi baru" title="Catat transaksi" description="Lengkapi detailnya untuk memperbarui saldo, anggaran, dan laporan." actions={<Button asChild variant="ghost"><Link href="/transactions"><ArrowLeft className="h-4 w-4" />Kembali</Link></Button>} />
      {error ? <Alert variant="destructive" title="Pilihan belum dapat dimuat">{error}</Alert> : null}
      {!error && (categories.length === 0 || accounts.length === 0) ? (
        <Alert title="Lengkapi pengaturan terlebih dahulu">
          <p>Anda memerlukan setidaknya satu kategori aktif dan satu akun aktif sebelum mencatat transaksi.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.length === 0 ? <Button asChild size="sm" variant="outline"><Link href="/categories">Kelola kategori</Link></Button> : null}
            {accounts.length === 0 ? <Button asChild size="sm" variant="outline"><Link href="/accounts">Kelola akun</Link></Button> : null}
          </div>
        </Alert>
      ) : null}
      <TransactionForm categories={categories} accounts={accounts} currencyCode={currencyCode} />
    </div>
  );
}
