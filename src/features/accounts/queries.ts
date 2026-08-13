import "server-only";

import { brandConfig } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import type {
  AccountsQueryResult,
  AccountWithBalance,
} from "@/features/accounts/types";

export async function getAccountsWithBalances(): Promise<AccountsQueryResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: null,
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  // The database performs the aggregate so every transaction is included,
  // independent of PostgREST's row response limit.
  const [accountsResult, profileResult] = await Promise.all([
    supabase.rpc("get_account_balances"),
    supabase
      .from("profiles")
      .select("currency_code")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (accountsResult.error || profileResult.error || !profileResult.data) {
    return {
      data: null,
      error: "Akun belum dapat dimuat. Coba muat ulang halaman.",
    };
  }

  const accounts: AccountWithBalance[] = (accountsResult.data ?? [])
    .map((account) => ({
      id: account.account_id,
      name: account.name,
      type: account.type,
      opening_balance: account.opening_balance,
      is_archived: account.is_archived,
      created_at: account.created_at,
      updated_at: account.updated_at,
      current_balance: account.current_balance,
    }))
    .sort(
      (left, right) =>
        Number(left.is_archived) - Number(right.is_archived) ||
        left.name.localeCompare(right.name, brandConfig.locale),
    );

  return {
    data: { accounts, currencyCode: profileResult.data.currency_code },
    error: null,
  };
}
