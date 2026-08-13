"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Paperclip, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "../actions";
import { paymentMethodLabels, transactionTypeLabels } from "../config";
import {
  paymentMethods,
  transactionFormSchema,
  transactionTypes,
  type TransactionFormValues,
} from "../schema";
import type { CurrencyCode, TransactionOption, TransactionRecord } from "../types";

interface TransactionFormProps {
  categories: TransactionOption[];
  accounts: TransactionOption[];
  currencyCode: CurrencyCode;
  transaction?: TransactionRecord;
}

function todayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function TransactionForm({
  categories,
  accounts,
  currencyCode,
  transaction,
}: TransactionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const isEditing = Boolean(transaction);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: transaction?.type ?? "expense",
      amount: transaction ? String(transaction.amount) : "",
      category_id: transaction?.category_id ?? "",
      account_id: transaction?.account_id ?? "",
      transaction_date: transaction?.transaction_date ?? todayInputValue(),
      payment_method: transaction?.payment_method ?? "cash",
      description: transaction?.description ?? "",
    },
  });
  const selectedType = form.watch("type");
  const selectedCategory = form.watch("category_id");
  const matchingCategories = categories.filter((category) => category.type === selectedType);

  useEffect(() => {
    if (selectedCategory && !matchingCategories.some((category) => category.id === selectedCategory)) {
      form.setValue("category_id", "", { shouldValidate: false });
    }
  }, [form, matchingCategories, selectedCategory]);

  function submit(values: TransactionFormValues) {
    const body = new FormData();
    Object.entries(values).forEach(([key, value]) => body.set(key, value));
    if (attachment) body.set("attachment", attachment);
    if (removeAttachment) body.set("remove_attachment", "true");

    startTransition(async () => {
      const result = transaction
        ? await updateTransaction(transaction.id, body)
        : await createTransaction(body);
      if (!result.ok) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            const message = messages?.[0];
            if (message) form.setError(field as keyof TransactionFormValues, { message });
          });
        }
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(`/transactions/${result.transactionId}`);
      router.refresh();
    });
  }

  return (
    <Card className="max-w-3xl">
      <CardContent className="p-5 sm:p-7">
        <form className="space-y-6" onSubmit={form.handleSubmit(submit)} noValidate>
          <fieldset disabled={isPending} className="space-y-6">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1" role="group" aria-label="Tipe transaksi">
              {transactionTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => form.setValue("type", type, { shouldValidate: true })}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedType === type
                      ? type === "income"
                        ? "bg-income text-income-foreground shadow-sm"
                        : "bg-expense text-expense-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-surface",
                  )}
                  aria-pressed={selectedType === type}
                >
                  {transactionTypeLabels[type]}
                </button>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={`Jumlah (${currencyCode})`} error={form.formState.errors.amount?.message} htmlFor="amount">
                <Input
                  id="amount"
                  className="font-semibold tabular-nums"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  aria-invalid={Boolean(form.formState.errors.amount)}
                  aria-describedby={form.formState.errors.amount ? "amount-error" : undefined}
                  {...form.register("amount")}
                />
              </Field>

              <Field label="Tanggal" error={form.formState.errors.transaction_date?.message} htmlFor="transaction_date">
                <Input id="transaction_date" type="date" aria-invalid={Boolean(form.formState.errors.transaction_date)} aria-describedby={form.formState.errors.transaction_date ? "transaction_date-error" : undefined} {...form.register("transaction_date")} />
              </Field>

              <Field label="Kategori" error={form.formState.errors.category_id?.message} htmlFor="category_id">
                <Select id="category_id" aria-invalid={Boolean(form.formState.errors.category_id)} aria-describedby={form.formState.errors.category_id ? "category_id-error" : undefined} {...form.register("category_id")}>
                  <option value="">Pilih kategori</option>
                  {matchingCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}{category.is_archived ? " (diarsipkan)" : ""}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Akun" error={form.formState.errors.account_id?.message} htmlFor="account_id">
                <Select id="account_id" aria-invalid={Boolean(form.formState.errors.account_id)} aria-describedby={form.formState.errors.account_id ? "account_id-error" : undefined} {...form.register("account_id")}>
                  <option value="">Pilih akun</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}{account.is_archived ? " (diarsipkan)" : ""}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Metode pembayaran" error={form.formState.errors.payment_method?.message} htmlFor="payment_method">
                <Select id="payment_method" aria-invalid={Boolean(form.formState.errors.payment_method)} aria-describedby={form.formState.errors.payment_method ? "payment_method-error" : undefined} {...form.register("payment_method")}>
                  {paymentMethods.map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}
                </Select>
              </Field>

              <Field label="Lampiran (opsional)" htmlFor="attachment" hint="JPG, PNG, WebP, atau PDF · maks. 5 MB">
                <Input
                  id="attachment"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  aria-describedby="attachment-hint"
                  onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                />
              </Field>
            </div>

            {transaction?.attachment_path ? (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={removeAttachment}
                  onChange={(event) => setRemoveAttachment(event.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
                Hapus lampiran lama saat menyimpan
              </label>
            ) : null}

            <Field label="Deskripsi" error={form.formState.errors.description?.message} htmlFor="description" hint="Maksimal 280 karakter">
              <Textarea
                id="description"
                rows={4}
                placeholder="Contoh: Belanja kebutuhan mingguan"
                aria-invalid={Boolean(form.formState.errors.description)}
                aria-describedby={["description-hint", form.formState.errors.description ? "description-error" : null].filter(Boolean).join(" ")}
                {...form.register("description")}
              />
            </Field>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" disabled={isPending || matchingCategories.length === 0 || accounts.length === 0}>
                {attachment ? <Paperclip className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isPending ? "Menyimpan…" : isEditing ? "Simpan perubahan" : "Simpan transaksi"}
              </Button>
            </div>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p id={`${htmlFor}-error`} className="text-xs font-medium text-expense" role="alert">{error}</p> : null}
      {hint ? <p id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
