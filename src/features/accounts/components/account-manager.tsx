"use client";

import { Plus, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import {
  createAccountAction,
  setAccountArchivedAction,
  updateAccountAction,
} from "@/features/accounts/actions";
import { AccountCard } from "@/features/accounts/components/account-card";
import { AccountForm } from "@/features/accounts/components/account-form";
import type {
  AccountFieldErrors,
  AccountWithBalance,
} from "@/features/accounts/types";
import type { AccountFormValues } from "@/lib/validations/account";

type AccountView = "active" | "archived";

export function AccountManager({
  accounts,
  currencyCode,
}: {
  accounts: AccountWithBalance[];
  currencyCode: string;
}) {
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithBalance | null>(null);
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const [view, setView] = useState<AccountView>("active");
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AccountFieldErrors>();

  const visibleAccounts = useMemo(
    () => accounts.filter((account) => account.is_archived === (view === "archived")),
    [accounts, view],
  );
  const activeCount = accounts.filter((account) => !account.is_archived).length;
  const archivedCount = accounts.length - activeCount;

  function openCreateForm() {
    setEditingAccount(null);
    setFieldErrors(undefined);
    setMessage(null);
    setIsFormOpen(true);
  }

  function openEditForm(account: AccountWithBalance) {
    setEditingAccount(account);
    setFieldErrors(undefined);
    setMessage(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingAccount(null);
    setFieldErrors(undefined);
  }

  function submitAccount(values: AccountFormValues) {
    setMessage(null);
    setFieldErrors(undefined);

    startSaving(async () => {
      const result = editingAccount
        ? await updateAccountAction(editingAccount.id, values)
        : await createAccountAction(values);

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

  async function toggleArchive(account: AccountWithBalance) {
    const nextArchived = !account.is_archived;
    const confirmed = window.confirm(
      nextArchived
        ? `Arsipkan akun “${account.name}”? Akun tetap tampil pada transaksi lama.`
        : `Pulihkan akun “${account.name}”?`,
    );

    if (!confirmed) return;

    setPendingAccountId(account.id);
    setMessage(null);
    try {
      const result = await setAccountArchivedAction({
        id: account.id,
        is_archived: nextArchived,
      });

      if (!result.success) {
        setMessage({ kind: "error", text: result.message });
        toast.error(result.message);
        return;
      }

      setMessage({ kind: "success", text: result.message });
      toast.success(result.message);
      if (editingAccount?.id === account.id) closeForm();
      router.refresh();
    } catch {
      const errorMessage = "Status akun belum dapat diperbarui. Coba lagi.";
      setMessage({ kind: "error", text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setPendingAccountId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sumber dana"
        title="Akun & dompet"
        description="Pantau saldo tunai, bank, dan dompet digital dari transaksi yang Anda catat."
        action={
          <Button type="button" onClick={openCreateForm} disabled={isSaving}>
            <Plus className="size-4" aria-hidden="true" />
            Akun baru
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
          <AccountForm
            account={editingAccount}
            currencyCode={currencyCode}
            isPending={isSaving}
            onCancel={closeForm}
            onSubmit={submitAccount}
            serverFieldErrors={fieldErrors}
          />
        ) : null}

        <section className="min-w-0 space-y-4" aria-labelledby="account-list-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="account-list-title" className="font-brand text-xl font-semibold text-foreground">
                Daftar akun
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeCount} aktif dan {archivedCount} diarsipkan
              </p>
            </div>
            <Select
              className="w-full sm:w-48"
              aria-label="Tampilkan status akun"
              value={view}
              onChange={(event) => setView(event.target.value as AccountView)}
            >
              <option value="active">Aktif ({activeCount})</option>
              <option value="archived">Diarsipkan ({archivedCount})</option>
            </Select>
          </div>

          {visibleAccounts.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <WalletCards className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {view === "active" ? "Belum ada akun aktif" : "Tidak ada akun arsip"}
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {view === "active"
                    ? "Buat akun pertama agar saldo dan transaksi dapat dihitung dengan akurat."
                    : "Akun yang Anda arsipkan akan tetap aman dan muncul di sini."}
                </p>
                {view === "active" ? (
                  <Button type="button" className="mt-5" onClick={openCreateForm}>
                    <Plus className="size-4" aria-hidden="true" />
                    Buat akun
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  currencyCode={currencyCode}
                  isPending={pendingAccountId === account.id}
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
