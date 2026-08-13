import type { PaymentMethod } from "./schema";
import type { Database } from "@/types/database.types";

export type CurrencyCode =
  Database["public"]["Tables"]["profiles"]["Row"]["currency_code"];

export type TransactionType = "income" | "expense";

export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  is_archived: boolean;
}

export interface TransactionAccount {
  id: string;
  name: string;
  type: "cash" | "bank" | "ewallet" | "other";
  is_archived: boolean;
}

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: string | number;
  account_id: string | null;
  category_id: string | null;
  transaction_date: string;
  payment_method: PaymentMethod;
  description: string | null;
  attachment_path: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  category: TransactionCategory | null;
  account: TransactionAccount | null;
}

export interface TransactionOption {
  id: string;
  name: string;
  type: string;
  is_archived: boolean;
  color?: string;
  icon?: string;
}

export interface TransactionActionResult {
  ok: boolean;
  message: string;
  transactionId?: string;
  fieldErrors?: Partial<Record<keyof import("./schema").TransactionFormValues, string[]>>;
}
