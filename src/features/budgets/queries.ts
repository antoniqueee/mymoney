import "server-only";

import { compareMoney, moneyPercentage } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import type {
  BudgetCategory,
  BudgetRecord,
  BudgetsQueryResult,
} from "@/features/budgets/types";

export async function getBudgetsPageData(): Promise<BudgetsQueryResult> {
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

  // Budget usage is aggregated in PostgreSQL. This avoids incomplete totals
  // when a date range contains more rows than PostgREST's response limit.
  const [budgetsResult, categoriesResult, profileResult] = await Promise.all([
    supabase.rpc("get_budgets_with_usage"),
    supabase
      .from("categories")
      .select("id,name,color,icon,is_archived")
      .eq("user_id", user.id)
      .eq("type", "expense")
      .eq("is_archived", false)
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("currency_code")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (
    budgetsResult.error ||
    categoriesResult.error ||
    profileResult.error ||
    !profileResult.data
  ) {
    return {
      data: null,
      error: "Anggaran belum dapat dimuat. Coba muat ulang halaman.",
    };
  }

  const activeExpenseCategories = (categoriesResult.data ?? []) as BudgetCategory[];
  const budgets: BudgetRecord[] = (budgetsResult.data ?? []).map((budget) => {
    const usagePercentage = moneyPercentage(budget.used, budget.amount);

    return {
      id: budget.id,
      category_id: budget.category_id,
      period_start: budget.period_start,
      period_end: budget.period_end,
      amount: budget.amount,
      created_at: budget.created_at,
      updated_at: budget.updated_at,
      category: {
        id: budget.category_id,
        name: budget.category_name,
        color: budget.category_color,
        icon: budget.category_icon,
        is_archived: budget.category_is_archived,
      },
      used_amount: budget.used,
      remaining_amount: budget.remaining,
      usage_percentage: usagePercentage,
      status:
        compareMoney(budget.used, budget.amount) >= 0
          ? "exceeded"
          : usagePercentage >= 80
            ? "warning"
            : "safe",
    };
  });

  return {
    data: {
      budgets,
      activeExpenseCategories,
      currencyCode: profileResult.data.currency_code,
    },
    error: null,
  };
}
