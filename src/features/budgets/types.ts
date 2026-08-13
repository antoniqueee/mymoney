import type { Database } from "@/types/database.types";
import type { BudgetFormValues } from "@/lib/validations/budget";

type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"];

export type BudgetCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_archived: boolean;
};

export type BudgetRecord = Pick<
  BudgetRow,
  | "id"
  | "category_id"
  | "period_start"
  | "period_end"
  | "amount"
  | "created_at"
  | "updated_at"
> & {
  category: BudgetCategory;
  used_amount: string;
  remaining_amount: string;
  usage_percentage: number;
  status: "safe" | "warning" | "exceeded";
};

export type BudgetFieldErrors = Partial<
  Record<keyof BudgetFormValues, string[]>
>;

export type BudgetActionResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: BudgetFieldErrors;
    };

export type BudgetsPageData = {
  budgets: BudgetRecord[];
  activeExpenseCategories: BudgetCategory[];
  currencyCode: string;
};

export type BudgetsQueryResult =
  | { data: BudgetsPageData; error: null }
  | { data: null; error: string };
