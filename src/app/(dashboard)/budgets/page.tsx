import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { BudgetManager } from "@/features/budgets/components/budget-manager";
import { getBudgetsPageData } from "@/features/budgets/queries";

export const metadata = {
  title: "Anggaran | My Money",
};

export default async function BudgetsPage() {
  const result = await getBudgetsPageData();

  if (!result.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Batas pengeluaran"
          title="Anggaran"
          description="Pantau pemakaian dari transaksi aktual."
        />
        <Alert variant="destructive">
          <AlertTitle>Anggaran gagal dimuat</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <BudgetManager
      budgets={result.data.budgets}
      categories={result.data.activeExpenseCategories}
      currencyCode={result.data.currencyCode}
    />
  );
}
