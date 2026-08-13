"use client";

import { Plus, Tags } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import {
  createCategoryAction,
  setCategoryArchivedAction,
  updateCategoryAction,
} from "@/features/categories/actions";
import { CategoryCard } from "@/features/categories/components/category-card";
import { CategoryForm } from "@/features/categories/components/category-form";
import type {
  CategoryFieldErrors,
  CategoryRecord,
} from "@/features/categories/types";
import type { CategoryFormValues } from "@/lib/validations/category";

type CategoryView = "active" | "archived";

interface CategoryManagerProps {
  categories: CategoryRecord[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [view, setView] = useState<CategoryView>("active");
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CategoryFieldErrors>();

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.is_archived === (view === "archived")),
    [categories, view],
  );
  const activeCount = categories.filter((category) => !category.is_archived).length;
  const archivedCount = categories.length - activeCount;

  function openCreateForm() {
    setEditingCategory(null);
    setFieldErrors(undefined);
    setMessage(null);
    setIsFormOpen(true);
  }

  function openEditForm(category: CategoryRecord) {
    setEditingCategory(category);
    setFieldErrors(undefined);
    setMessage(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFieldErrors(undefined);
  }

  function submitCategory(values: CategoryFormValues) {
    setMessage(null);
    setFieldErrors(undefined);

    startSaving(async () => {
      const result = editingCategory
        ? await updateCategoryAction(editingCategory.id, values)
        : await createCategoryAction(values);

      if (!result.success) {
        setMessage({ kind: "error", text: result.message });
        setFieldErrors(result.fieldErrors);
        toast.error(result.message);
        return;
      }

      setMessage({ kind: "success", text: result.message });
      toast.success(result.message);
      closeForm();
      router.refresh();
    });
  }

  async function toggleArchive(category: CategoryRecord) {
    const nextArchived = !category.is_archived;
    const confirmed = window.confirm(
      nextArchived
        ? `Arsipkan kategori “${category.name}”? Kategori tetap ada pada transaksi lama.`
        : `Pulihkan kategori “${category.name}”?`,
    );

    if (!confirmed) return;

    setPendingCategoryId(category.id);
    setMessage(null);
    try {
      const result = await setCategoryArchivedAction({
        id: category.id,
        is_archived: nextArchived,
      });

      if (!result.success) {
        setMessage({ kind: "error", text: result.message });
        toast.error(result.message);
        return;
      }

      setMessage({ kind: "success", text: result.message });
      toast.success(result.message);
      if (editingCategory?.id === category.id) closeForm();
      router.refresh();
    } catch {
      const errorMessage = "Status kategori belum dapat diperbarui. Coba lagi.";
      setMessage({ kind: "error", text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setPendingCategoryId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pengaturan pencatatan"
        title="Kategori"
        description="Kelompokkan pemasukan dan pengeluaran tanpa menghilangkan riwayat lama."
        action={
          <Button type="button" onClick={openCreateForm} disabled={isSaving}>
            <Plus className="size-4" aria-hidden="true" />
            Kategori baru
          </Button>
        }
      />

      {message ? (
        <Alert variant={message.kind === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <div className={isFormOpen ? "grid gap-6 lg:grid-cols-[minmax(17rem,0.75fr)_minmax(0,1.5fr)]" : undefined}>
        {isFormOpen ? (
          <CategoryForm
            category={editingCategory}
            isPending={isSaving}
            onCancel={closeForm}
            onSubmit={submitCategory}
            serverFieldErrors={fieldErrors}
          />
        ) : null}

        <section className="min-w-0 space-y-4" aria-labelledby="category-list-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="category-list-title" className="font-brand text-xl font-semibold text-foreground">
                Daftar kategori
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeCount} aktif dan {archivedCount} diarsipkan
              </p>
            </div>
            <Select
              className="w-full sm:w-48"
              aria-label="Tampilkan status kategori"
              value={view}
              onChange={(event) => setView(event.target.value as CategoryView)}
            >
              <option value="active">Aktif ({activeCount})</option>
              <option value="archived">Diarsipkan ({archivedCount})</option>
            </Select>
          </div>

          {visibleCategories.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Tags className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {view === "active" ? "Belum ada kategori aktif" : "Tidak ada kategori arsip"}
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {view === "active"
                    ? "Buat kategori pertama agar transaksi lebih mudah ditelusuri."
                    : "Kategori yang Anda arsipkan akan tetap aman dan muncul di sini."}
                </p>
                {view === "active" ? (
                  <Button type="button" className="mt-5" onClick={openCreateForm}>
                    <Plus className="size-4" aria-hidden="true" />
                    Buat kategori
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isPending={pendingCategoryId === category.id}
                  onEdit={openEditForm}
                  onToggleArchive={toggleArchive}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
