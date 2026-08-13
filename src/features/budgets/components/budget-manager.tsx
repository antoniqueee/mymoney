"use client";

import { Plus, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  createBudgetAction,
  deleteBudgetAction,
  updateBudgetAction,
} from "@/features/budgets/actions";
import { BudgetCard } from "@/features/budgets/components/budget-card";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import type {
  BudgetCategory,
  BudgetFieldErrors,
  BudgetRecord,
} from "@/features/budgets/types";
import type { BudgetFormValues } from "@/lib/validations/budget";
import { getCalendarMonth, getMonthRange } from "@/lib/formatters/date";

interface BudgetManagerProps {
  budgets: BudgetRecord[];
  categories: BudgetCategory[];
  currencyCode: string;
}

export function BudgetManager({ budgets, categories, currencyCode }: BudgetManagerProps) {
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null);
  const [pendingBudgetId, setPendingBudgetId] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState(getCalendarMonth);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<BudgetFieldErrors>();

  const visibleBudgets = useMemo(() => {
    if (!monthFilter) return budgets;
    const { start: monthStart, end: monthEnd } = getMonthRange(monthFilter);

    return budgets.filter(
      (budget) => budget.period_start <= monthEnd && budget.period_end >= monthStart,
    );
  }, [budgets, monthFilter]);

  function openCreateForm() {
    setEditingBudget(null);
    setFieldErrors(undefined);
    setMessage(null);
    setIsFormOpen(true);
  }

  function openEditForm(budget: BudgetRecord) {
    setEditingBudget(budget);
    setFieldErrors(undefined);
    setMessage(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingBudget(null);
    setFieldErrors(undefined);
  }

  function submitBudget(values: BudgetFormValues) {
    setMessage(null);
    setFieldErrors(undefined);

    startSaving(async () => {
      const result = editingBudget
        ? await updateBudgetAction(editingBudget.id, values)
        : await createBudgetAction(values);

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

  async function removeBudget(budget: BudgetRecord) {
    const confirmed = window.confirm(
      `Hapus anggaran “${budget.category.name}” untuk periode ini? Tindakan ini tidak menghapus transaksi.`,
    );

    if (!confirmed) return;

    setPendingBudgetId(budget.id);
    setMessage(null);
    try {
      const result = await deleteBudgetAction(budget.id);

      if (!result.success) {
        setMessage({ kind: "error", text: result.message });
        toast.error(result.message);
        return;
      }

      setMessage({ kind: "success", text: result.message });
      toast.success(result.message);
      if (editingBudget?.id === budget.id) closeForm();
      router.refresh();
    } catch {
      const errorMessage = "Anggaran belum dapat dihapus. Coba lagi.";
      setMessage({ kind: "error", text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setPendingBudgetId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Batas pengeluaran"
        title="Anggaran"
        description="Tetapkan target yang realistis dan pantau pemakaian dari transaksi aktual."
        action={
          <Button
            type="button"
            onClick={openCreateForm}
            disabled={isSaving || categories.length === 0}
          >
            <Plus className="size-4" aria-hidden="true" />
            Anggaran baru
          </Button>
        }
      />

      {message ? (
        <Alert variant={message.kind === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      {categories.length === 0 ? (
        <Alert>
          <AlertDescription>
            Anda memerlukan setidaknya satu kategori pengeluaran aktif sebelum membuat anggaran.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className={isFormOpen ? "grid gap-6 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]" : undefined}>
        {isFormOpen ? (
          <BudgetForm
            budget={editingBudget}
            categories={categories}
            currencyCode={currencyCode}
            isPending={isSaving}
            onCancel={closeForm}
            onSubmit={submitBudget}
            serverFieldErrors={fieldErrors}
          />
        ) : null}

        <section className="min-w-0 space-y-4" aria-labelledby="budget-list-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="budget-list-title" className="font-brand text-xl font-semibold text-foreground">
                Ringkasan anggaran
              </h2>
              <p className="text-sm text-muted-foreground">
                Peringatan muncul pada 80%, dan status terlampaui pada 100%.
              </p>
            </div>
            <div className="w-full space-y-1.5 sm:w-48">
              <Label htmlFor="budget-month-filter" className="text-xs text-muted-foreground">
                Periode yang ditampilkan
              </Label>
              <Input
                id="budget-month-filter"
                type="month"
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
              />
            </div>
          </div>

          {visibleBudgets.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Target className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground">Belum ada anggaran pada periode ini</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Tetapkan batas kategori untuk mengetahui kapan pengeluaran mendekati target.
                </p>
                {categories.length > 0 ? (
                  <Button type="button" className="mt-5" onClick={openCreateForm}>
                    <Plus className="size-4" aria-hidden="true" />
                    Buat anggaran
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {visibleBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  currencyCode={currencyCode}
                  isPending={pendingBudgetId === budget.id}
                  onEdit={openEditForm}
                  onDelete={removeBudget}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
