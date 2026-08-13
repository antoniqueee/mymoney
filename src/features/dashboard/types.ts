export interface DashboardTrendPoint {
  date: string;
  income: string;
  expense: string;
}

export interface DashboardCategoryPoint {
  category_id: string;
  name: string;
  color: string;
  total: string;
}

export interface DashboardRecentTransaction {
  id: string;
  type: "income" | "expense";
  amount: string;
  transaction_date: string;
  description: string | null;
  category_name: string | null;
  category_color: string | null;
  account_name: string | null;
}

export interface DashboardBudget {
  id: string;
  category_id: string;
  category_name: string;
  amount: string;
  used: string;
}

export interface DashboardData {
  total_balance: string;
  period_income: string;
  period_expense: string;
  net_cash_flow: string;
  trend: DashboardTrendPoint[];
  expenses_by_category: DashboardCategoryPoint[];
  recent_transactions: DashboardRecentTransaction[];
  budgets: DashboardBudget[];
}

