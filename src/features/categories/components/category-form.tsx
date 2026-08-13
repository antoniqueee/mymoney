"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import {
  categorySchema,
  DEFAULT_CATEGORY_COLOR,
  type CategoryFormValues,
} from "@/lib/validations/category";
import { CATEGORY_ICON_OPTIONS } from "@/features/categories/category-icons";
import type { CategoryRecord } from "@/features/categories/types";

const NEW_CATEGORY_VALUES: CategoryFormValues = {
  name: "",
  type: "expense",
  color: DEFAULT_CATEGORY_COLOR,
  icon: "tag",
};

interface CategoryFormProps {
  category: CategoryRecord | null;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: CategoryFormValues) => void;
  serverFieldErrors?: Partial<
    Record<keyof CategoryFormValues, string[]>
  >;
}

export function CategoryForm({
  category,
  isPending,
  onCancel,
  onSubmit,
  serverFieldErrors,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: NEW_CATEGORY_VALUES,
  });

  useEffect(() => {
    reset(
      category
        ? {
            name: category.name,
            type: category.type,
            color: category.color,
            icon: category.icon as CategoryFormValues["icon"],
          }
        : NEW_CATEGORY_VALUES,
    );
  }, [category, reset]);

  useEffect(() => {
    if (!serverFieldErrors) return;

    (Object.keys(serverFieldErrors) as Array<keyof CategoryFormValues>).forEach(
      (field) => {
        const message = serverFieldErrors[field]?.[0];
        if (message) setError(field, { message });
      },
    );
  }, [serverFieldErrors, setError]);

  return (
    <Card className="h-fit lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>{category ? "Edit kategori" : "Kategori baru"}</CardTitle>
        <CardDescription>
          {category
            ? "Jenis kategori dikunci untuk menjaga konsistensi transaksi lama."
            : "Buat kategori yang mudah dikenali saat mencatat transaksi."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="category-name">Nama kategori</Label>
            <Input
              id="category-name"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "category-name-error" : undefined}
              disabled={isPending}
              {...register("name")}
            />
            {errors.name ? (
              <p id="category-name-error" className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label id="category-type-label" htmlFor="category-type">Jenis</Label>
            {category ? (
              <>
                <input type="hidden" {...register("type")} />
                <div
                  id="category-type"
                  role="textbox"
                  aria-readonly="true"
                  aria-labelledby="category-type-label"
                  aria-describedby={errors.type ? "category-type-error" : undefined}
                  className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                >
                  {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </div>
              </>
            ) : (
              <Select
                id="category-type"
                aria-invalid={Boolean(errors.type)}
                aria-describedby={errors.type ? "category-type-error" : undefined}
                disabled={isPending}
                {...register("type")}
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </Select>
            )}
            {errors.type ? (
              <p id="category-type-error" className="text-sm text-destructive" role="alert">
                {errors.type.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-icon">Ikon</Label>
            <Select
              id="category-icon"
              aria-invalid={Boolean(errors.icon)}
              aria-describedby={errors.icon ? "category-icon-error" : undefined}
              disabled={isPending}
              {...register("icon")}
            >
              {CATEGORY_ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {errors.icon ? (
              <p id="category-icon-error" className="text-sm text-destructive" role="alert">
                {errors.icon.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-color">Warna</Label>
            <div className="flex items-center gap-3">
              <Input
                id="category-color"
                type="color"
                className="h-11 w-16 cursor-pointer p-1"
                aria-invalid={Boolean(errors.color)}
                aria-describedby={`category-color-help${errors.color ? " category-color-error" : ""}`}
                disabled={isPending}
                {...register("color")}
              />
              <span id="category-color-help" className="text-sm text-muted-foreground">
                Pilih warna pembeda yang nyaman dilihat.
              </span>
            </div>
            {errors.color ? (
              <p id="category-color-error" className="text-sm text-destructive" role="alert">
                {errors.color.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isPending} disabled={isPending || (Boolean(category) && !isDirty)}>
              {category ? "Simpan perubahan" : "Buat kategori"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
