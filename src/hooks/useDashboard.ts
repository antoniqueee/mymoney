"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import type { DashboardRecentTransaction } from "@/features/dashboard/types";

const money = z.union([z.string(), z.number()]).transform(String);
const clientDashboardSchema = z.object({
  total_balance: money,
  period_income: money,
  period_expense: money,
  net_cash_flow: money,
  recent_transactions: z.array(z.object({
    id: z.string(),
    type: z.enum(["income", "expense"]),
    amount: money,
    transaction_date: z.string(),
    description: z.string().nullable(),
    category_name: z.string().nullable(),
    category_color: z.string().nullable(),
    account_name: z.string().nullable(),
  })).default([]),
});

export interface DashboardSummary {
  totalBalance: string;
  totalIncome: string;
  totalExpense: string;
  netCashFlow: string;
  recentTransactions: DashboardRecentTransaction[];
}

const emptySummary: DashboardSummary = {
  totalBalance: "0.00",
  totalIncome: "0.00",
  totalExpense: "0.00",
  netCashFlow: "0.00",
  recentTransactions: [],
};

function currentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const month = String(monthIndex + 1).padStart(2, "0");
  return {
    start: `${year}-${month}-01`,
    end: new Date(Date.UTC(year, monthIndex + 1, 0)).toISOString().slice(0, 10),
  };
}

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const period = currentPeriod();
      const { data, error: queryError } = await supabase.rpc("get_dashboard_summary", {
        p_start: period.start,
        p_end: period.end,
      });
      if (queryError) throw queryError;
      const parsed = clientDashboardSchema.safeParse(data);
      if (!parsed.success) throw new Error("Format dashboard tidak valid.");
      setSummary({
        totalBalance: parsed.data.total_balance,
        totalIncome: parsed.data.period_income,
        totalExpense: parsed.data.period_expense,
        netCashFlow: parsed.data.net_cash_flow,
        recentTransactions: parsed.data.recent_transactions,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Dashboard gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return { summary, loading, error, refetch: fetchDashboardData };
}
