import { z } from "zod";
import { brandConfig } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";
import { getMonthRange } from "@/lib/formatters/date";
import type { ReportData } from "./types";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const money = z.union([z.string(), z.number()]).transform(String);
const reportSchema = z.object({
  income: money.default("0.00"), expense: money.default("0.00"), net: money.default("0.00"),
  trend: z.array(z.object({ month: z.string(), income: money, expense: money })).default([]),
  categories: z.array(z.object({ category_id: z.string(), name: z.string(), color: z.string(), total: money })).default([]),
  accounts: z.array(z.object({ account_id: z.string(), name: z.string(), income: money, expense: money, net: money })).default([]),
});

export function reportPeriod(start?: string, end?: string) {
  const { start: defaultStart, end: defaultEnd } = getMonthRange();
  const safeStart = datePattern.test(start ?? "") ? start! : defaultStart;
  const safeEnd = datePattern.test(end ?? "") ? end! : defaultEnd;
  return safeStart <= safeEnd ? { start: safeStart, end: safeEnd } : { start: safeEnd, end: safeStart };
}

export async function getReportData(start?: string, end?: string) {
  const period = reportPeriod(start, end);
  const supabase = await createClient();
  const [{ data, error }, { data: profile }] = await Promise.all([
    supabase.rpc("get_report_summary", { p_start: period.start, p_end: period.end }),
    supabase.from("profiles").select("currency_code").maybeSingle(),
  ]);
  if (error) return { data: null, period, currency: profile?.currency_code ?? brandConfig.defaultCurrency, error: error.message };
  const parsed = reportSchema.safeParse(data);
  if (!parsed.success) return { data: null, period, currency: profile?.currency_code ?? brandConfig.defaultCurrency, error: "Format ringkasan laporan tidak dikenali." };
  return { data: parsed.data as ReportData, period, currency: profile?.currency_code ?? brandConfig.defaultCurrency, error: null };
}
