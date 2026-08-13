import { z } from "zod";
import { brandConfig } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import { getCalendarMonth, getMonthRange } from "@/lib/formatters/date";
import type { DashboardData } from "./types";

const money = z.union([z.string(), z.number()]).transform(String);
const dashboardSchema = z.object({
  total_balance: money.default("0.00"),
  period_income: money.default("0.00"),
  period_expense: money.default("0.00"),
  net_cash_flow: money.default("0.00"),
  trend: z.array(z.object({ date: z.string(), income: money, expense: money })).default([]),
  expenses_by_category: z.array(z.object({ category_id: z.string(), name: z.string(), color: z.string(), total: money })).default([]),
  recent_transactions: z.array(z.object({
    id: z.string(), type: z.enum(["income", "expense"]), amount: money,
    transaction_date: z.string(), description: z.string().nullable().default(null),
    category_name: z.string().nullable().default(null), category_color: z.string().nullable().default(null),
    account_name: z.string().nullable().default(null),
  })).default([]),
  budgets: z.array(z.object({ id: z.string(), category_id: z.string(), category_name: z.string(), amount: money, used: money })).default([]),
});

export function parseMonth(value?: string) {
  const candidate = /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "") ? value! : getCalendarMonth();
  return getMonthRange(candidate);
}

export async function getDashboardData(monthValue?: string) {
  const period = parseMonth(monthValue);
  const supabase = await createClient();
  const [{ data, error }, { data: profile, error: profileError }] = await Promise.all([
    supabase.rpc("get_dashboard_summary", { p_start: period.start, p_end: period.end }),
    supabase.from("profiles").select("currency_code").maybeSingle(),
  ]);
  if (error) {
    return { data: null, period, currency: profile?.currency_code ?? brandConfig.defaultCurrency, error: error.message };
  }
  const parsed = dashboardSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, period, currency: profile?.currency_code ?? brandConfig.defaultCurrency, error: "Ringkasan keuangan memiliki format yang tidak dikenali." };
  }
  return { data: parsed.data as DashboardData, period, currency: profile?.currency_code ?? brandConfig.defaultCurrency, error: profileError?.message ?? null };
}
