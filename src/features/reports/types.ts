export interface ReportTrendPoint { month: string; income: string; expense: string }
export interface ReportCategoryPoint { category_id: string; name: string; color: string; total: string }
export interface ReportAccountPoint { account_id: string; name: string; income: string; expense: string; net: string }
export interface ReportData {
  income: string;
  expense: string;
  net: string;
  trend: ReportTrendPoint[];
  categories: ReportCategoryPoint[];
  accounts: ReportAccountPoint[];
}

