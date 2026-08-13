import type { Json, Tables } from "@/types/database.types";

export type TransactionType = "income" | "expense";
export type AccountType = "cash" | "bank" | "ewallet" | "other";
export type PaymentMethod =
  | "cash"
  | "debit_card"
  | "credit_card"
  | "bank_transfer"
  | "e_wallet"
  | "other";

export type SavingsGoalStatus = "active" | "paused" | "completed" | "cancelled";

export type Profile = Tables<"profiles">;
export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;
export type Transaction = Tables<"transactions">;
export type Budget = Tables<"budgets">;
export type SavingsGoal = Tables<"savings_goals">;

export type TransactionWithRelations = Transaction & {
  account: Pick<Account, "id" | "name" | "type" | "is_archived"> | null;
  category: Pick<Category, "id" | "name" | "type" | "color" | "icon" | "is_archived"> | null;
};

export type AccountWithBalance = Account & {
  current_balance: string;
};

export type BudgetWithUsage = Budget & {
  category: Pick<Category, "id" | "name" | "color" | "icon"> | null;
  used_amount: string;
  remaining_amount: string;
  usage_percentage: number;
};

export interface DashboardTrendPoint {
  date: string;
  income: string;
  expense: string;
}

export interface DashboardCategoryTotal {
  category_id: string;
  name: string;
  color: string;
  total: string;
}

export interface DashboardRecentTransaction {
  id: string;
  type: TransactionType;
  amount: string;
  transaction_date: string;
  description: string | null;
  category_name: string;
  category_color: string;
  account_name: string;
}

export interface DashboardBudgetSummary {
  id: string;
  category_id: string;
  category_name: string;
  amount: string;
  used: string;
}

export interface DashboardSummary {
  total_balance: string;
  period_income: string;
  period_expense: string;
  net_cash_flow: string;
  trend: DashboardTrendPoint[];
  expenses_by_category: DashboardCategoryTotal[];
  recent_transactions: DashboardRecentTransaction[];
  budgets: DashboardBudgetSummary[];
}

export interface ReportTrendPoint {
  month: string;
  income: string;
  expense: string;
}

export interface ReportAccountTotal {
  account_id: string;
  name: string;
  income: string;
  expense: string;
  net: string;
}

export interface ReportSummary {
  income: string;
  expense: string;
  net: string;
  trend: ReportTrendPoint[];
  categories: DashboardCategoryTotal[];
  accounts: ReportAccountTotal[];
}

/** Narrow an RPC JSON result only after runtime validation (for example Zod). */
export type RpcJson = Json;
