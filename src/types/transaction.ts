import type { DatabaseMoney } from "@/types/database.types";

export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: "cash" | "bank" | "ewallet" | "other";
  opening_balance: DatabaseMoney;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  account_id: string;
  amount: DatabaseMoney;
  type: TransactionType;
  description: string | null;
  transaction_date: string;
  payment_method: "cash" | "debit_card" | "credit_card" | "bank_transfer" | "e_wallet" | "other";
  attachment_path: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  account?: Account | null;
}

export interface TransactionFilter {
  type?: TransactionType | "all";
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  includeDeleted?: boolean;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: DatabaseMoney;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  spent_amount?: DatabaseMoney;
}
