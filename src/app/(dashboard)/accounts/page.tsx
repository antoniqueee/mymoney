import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { AccountManager } from "@/features/accounts/components/account-manager";
import { getAccountsWithBalances } from "@/features/accounts/queries";

export const metadata = {
  title: "Akun | My Money",
};

export default async function AccountsPage() {
  const result = await getAccountsWithBalances();

  if (!result.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Sumber dana"
          title="Akun & dompet"
          description="Pantau saldo dari transaksi yang Anda catat."
        />
        <Alert variant="destructive">
          <AlertTitle>Akun gagal dimuat</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AccountManager
      accounts={result.data.accounts}
      currencyCode={result.data.currencyCode}
    />
  );
}
