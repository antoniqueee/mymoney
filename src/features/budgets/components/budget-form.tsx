"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type {
  BudgetCategory,
  BudgetFieldErrors,
  BudgetRecord,
} from "@/features/budgets/types";
import {
  budgetSchema,
  type BudgetFormValues,
} from "@/lib/validations/budget";
import { getMonthRange } from "@/lib/formatters/date";

function currentMonthRange() {
  const { start, end } = getMonthRange();
  return { period_start: start, period_end: end };
}

interface BudgetFormProps {
  budget: BudgetRecord | null;
  categories: BudgetCategory[];
  currencyCode: string;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: BudgetFormValues) => void;
  serverFieldErrors?: BudgetFieldErrors;
}

export function BudgetForm({
  budget,
  categories,
  currencyCode,
  isPending,
  onCancel,
  onSubmit,
  serverFieldErrors,
}: BudgetFormProps) {
  const monthRange = useMemo(() => currentMonthRange(), []);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: "",
      amount: "",
      ...monthRange,
    },
  });

  useEffect(() => {
    reset(
      budget
        ? {
            category_id: budget.category_id,
            period_start: budget.period_start,
            period_end: budget.period_end,
            amount: budget.amount,
          }
        : {
            category_id: "",
            amount: "",
            ...monthRange,
          },
    );
  }, [budget, monthRange, reset]);

  useEffect(() => {
    if (!serverFieldErrors) return;

    (Object.keys(serverFieldErrors) as Array<keyof BudgetFormValues>).forEach(
      (field) => {
        const message = serverFieldErrors[field]?.[0];
        if (message) setError(field, { message });
      },
    );
  }, [serverFieldErrors, setError]);

  const selectableCategories = budget?.category.is_archived
    ? [budget.category, ...categories.filter((item) => item.id !== budget.category.id)]
    : categories;

  return (
    <Card className="h-fit lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>{budget ? "Edit anggaran" : "Anggaran baru"}</CardTitle>
        <CardDescription>
          Tetapkan batas kategori pengeluaran untuk bulan atau rentang khusus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="budget-category">Kategori pengeluaran</Label>
            <Select
              id="budget-category"
              disabled={isPending || selectableCategories.length === 0}
              aria-invalid={Boolean(errors.category_id)}
              aria-describedby={[
                selectableCategories.length === 0 ? "budget-category-help" : null,
                errors.category_id ? "budget-category-error" : null,
              ].filter(Boolean).join(" ") || undefined}
              {...register("category_id")}
            >
              <option value="">Pilih kategori</option>
              {selectableCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  disabled={category.is_archived}
                >
                  {category.name}{category.is_archived ? " (diarsipkan)" : ""}
                </option>
              ))}
            </Select>
            {selectableCategories.length === 0 ? (
              <p id="budget-category-help" className="text-sm text-warning-foreground" role="status">
                Buat kategori pengeluaran aktif sebelum menetapkan anggaran.
              </p>
            ) : null}
            {errors.category_id ? (
              <p id="budget-category-error" className="text-sm text-destructive" role="alert">
                {errors.category_id.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-amount">Jumlah anggaran ({currencyCode})</Label>
            <Input
              id="budget-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="1500000.00"
              disabled={isPending}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={`budget-amount-help${errors.amount ? " budget-amount-error" : ""}`}
              {...register("amount")}
            />
            <p id="budget-amount-help" className="text-xs text-muted-foreground">
              Gunakan titik untuk desimal, tanpa pemisah ribuan.
            </p>
            {errors.amount ? (
              <p id="budget-amount-error" className="text-sm text-destructive" role="alert">
                {errors.amount.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget-start">Mulai</Label>
              <Input
                id="budget-start"
                type="date"
                disabled={isPending}
                aria-invalid={Boolean(errors.period_start)}
                aria-describedby={errors.period_start ? "budget-start-error" : undefined}
                {...register("period_start")}
              />
              {errors.period_start ? (
                <p id="budget-start-error" className="text-sm text-destructive" role="alert">
                  {errors.period_start.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-end">Selesai</Label>
              <Input
                id="budget-end"
                type="date"
                disabled={isPending}
                aria-invalid={Boolean(errors.period_end)}
                aria-describedby={errors.period_end ? "budget-end-error" : undefined}
                {...register("period_end")}
              />
              {errors.period_end ? (
                <p id="budget-end-error" className="text-sm text-destructive" role="alert">
                  {errors.period_end.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              disabled={
                isPending ||
                selectableCategories.length === 0 ||
                (Boolean(budget) && !isDirty)
              }
            >
              {budget ? "Simpan perubahan" : "Buat anggaran"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
