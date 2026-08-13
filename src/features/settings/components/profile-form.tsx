"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { updatePreferences } from "../actions";
import {
  currencyCodes,
  profilePreferencesSchema,
  type ProfilePreferencesValues,
} from "../schema";

const currencyLabels: Record<(typeof currencyCodes)[number], string> = {
  IDR: "Rupiah Indonesia (IDR)",
  USD: "Dolar AS (USD)",
  SGD: "Dolar Singapura (SGD)",
};

export function ProfileForm({ initialValues }: { initialValues: ProfilePreferencesValues }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<ProfilePreferencesValues>({
    resolver: zodResolver(profilePreferencesSchema),
    defaultValues: initialValues,
  });

  function submit(values: ProfilePreferencesValues) {
    startTransition(async () => {
      const result = await updatePreferences(values);
      if (!result.ok) {
        Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof ProfilePreferencesValues, { message: messages[0] });
          }
        });
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  const fullNameError = form.formState.errors.full_name?.message;
  const currencyError = form.formState.errors.currency_code?.message;

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate>
      <fieldset disabled={pending} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nama tampilan</Label>
          <Input
            id="full_name"
            autoComplete="name"
            aria-invalid={Boolean(fullNameError)}
            aria-describedby={fullNameError ? "full-name-error" : undefined}
            {...form.register("full_name")}
          />
          {fullNameError ? (
            <p id="full-name-error" className="text-xs font-medium text-expense" role="alert">
              {fullNameError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency_code">Mata uang tampilan</Label>
          <Select
            id="currency_code"
            aria-invalid={Boolean(currencyError)}
            aria-describedby={`currency-help${currencyError ? " currency-error" : ""}`}
            {...form.register("currency_code")}
          >
            {currencyCodes.map((code) => (
              <option key={code} value={code}>{currencyLabels[code]}</option>
            ))}
          </Select>
          <p id="currency-help" className="text-xs text-muted-foreground">
            Mengubah format tampilan, bukan nilai tersimpan.
          </p>
          {currencyError ? (
            <p id="currency-error" className="text-xs font-medium text-expense" role="alert">
              {currencyError}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" isLoading={pending} loadingText="Menyimpan…" disabled={pending}>
            <Save className="h-4 w-4" />
            Simpan preferensi
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

