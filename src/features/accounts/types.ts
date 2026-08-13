import type { Database } from "@/types/database.types";
import type { AccountFormValues } from "@/lib/validations/account";

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];

export type AccountRecord = Pick<
  AccountRow,
  | "id"
  | "name"
  | "type"
  | "opening_balance"
  | "is_archived"
  | "created_at"
  | "updated_at"
>;

export type AccountWithBalance = AccountRecord & {
  current_balance: string;
};

export type AccountFieldErrors = Partial<
  Record<keyof AccountFormValues, string[]>
>;

export type AccountActionResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: AccountFieldErrors;
    };

export type AccountsPageData = {
  accounts: AccountWithBalance[];
  currencyCode: string;
};

export type AccountsQueryResult =
  | { data: AccountsPageData; error: null }
  | { data: null; error: string };
