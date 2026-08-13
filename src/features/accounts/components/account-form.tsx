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
import { ACCOUNT_TYPE_CONFIG } from "@/features/accounts/config";
import type {
  AccountFieldErrors,
  AccountWithBalance,
} from "@/features/accounts/types";
import {
  ACCOUNT_TYPES,
  accountSchema,
  type AccountFormValues,
} from "@/lib/validations/account";

const NEW_ACCOUNT_VALUES: AccountFormValues = {
  name: "",
  type: "cash",
  opening_balance: "0.00",
};

interface AccountFormProps {
  account: AccountWithBalance | null;
  currencyCode: string;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: AccountFormValues) => void;
  serverFieldErrors?: AccountFieldErrors;
}

export function AccountForm({
  account,
  currencyCode,
  isPending,
  onCancel,
  onSubmit,
  serverFieldErrors,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: NEW_ACCOUNT_VALUES,
  });

  useEffect(() => {
    reset(
      account
        ? {
            name: account.name,
            type: account.type,
            opening_balance: account.opening_balance,
          }
        : NEW_ACCOUNT_VALUES,
    );
  }, [account, reset]);

  useEffect(() => {
    if (!serverFieldErrors) return;

    (Object.keys(serverFieldErrors) as Array<keyof AccountFormValues>).forEach(
      (field) => {
        const message = serverFieldErrors[field]?.[0];
        if (message) setError(field, { message });
      },
    );
  }, [serverFieldErrors, setError]);

  return (
    <Card className="h-fit lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>{account ? "Edit akun" : "Akun baru"}</CardTitle>
        <CardDescription>
          Catat saldo secara manual. My Money tidak menyimpan kredensial bank.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="account-name">Nama akun</Label>
            <Input
              id="account-name"
              placeholder="Contoh: Dompet harian"
              autoComplete="off"
              disabled={isPending}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "account-name-error" : undefined}
              {...register("name")}
            />
            {errors.name ? (
              <p id="account-name-error" className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-type">Jenis akun</Label>
            <Select
              id="account-type"
              disabled={isPending}
              aria-invalid={Boolean(errors.type)}
              aria-describedby={errors.type ? "account-type-error" : undefined}
              {...register("type")}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_CONFIG[type].label}
                </option>
              ))}
            </Select>
            {errors.type ? (
              <p id="account-type-error" className="text-sm text-destructive" role="alert">
                {errors.type.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening-balance">Saldo awal ({currencyCode})</Label>
            <Input
              id="opening-balance"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              disabled={isPending}
              aria-invalid={Boolean(errors.opening_balance)}
              aria-describedby={`opening-balance-help${errors.opening_balance ? " opening-balance-error" : ""}`}
              {...register("opening_balance")}
            />
            <p id="opening-balance-help" className="text-xs text-muted-foreground">
              Gunakan titik untuk desimal, tanpa pemisah ribuan. Saldo boleh negatif.
            </p>
            {errors.opening_balance ? (
              <p id="opening-balance-error" className="text-sm text-destructive" role="alert">
                {errors.opening_balance.message}
              </p>
            ) : null}
          </div>

          {account ? (
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-foreground">
              Mengubah saldo awal akan menghitung ulang saldo akun berdasarkan seluruh transaksi aktif.
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              disabled={isPending || (Boolean(account) && !isDirty)}
            >
              {account ? "Simpan perubahan" : "Buat akun"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
