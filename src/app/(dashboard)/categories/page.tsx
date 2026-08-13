import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryManager } from "@/features/categories/components/category-manager";
import { getCategories } from "@/features/categories/queries";

export const metadata = {
  title: "Kategori | My Money",
};

export default async function CategoriesPage() {
  const result = await getCategories();

  if (result.error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Pengaturan pencatatan"
          title="Kategori"
          description="Kelompokkan pemasukan dan pengeluaran Anda."
        />
        <Alert variant="destructive">
          <AlertTitle>Kategori gagal dimuat</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <CategoryManager categories={result.data} />;
}
