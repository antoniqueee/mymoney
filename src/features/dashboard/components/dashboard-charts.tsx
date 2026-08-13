"use client";

import { Cell, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartNoAxesCombined } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/currency";
import { moneyToCents } from "@/lib/money";
import { formatShortDate } from "@/lib/formatters/date";
import { chartStyles } from "@/config/theme";
import { brandConfig } from "@/config/brand";
import type { DashboardCategoryPoint, DashboardTrendPoint } from "../types";

function chartNumber(value: string) {
  return Number(moneyToCents(value)) / 100;
}

export function DashboardCharts({ trend, categories, currency }: { trend: DashboardTrendPoint[]; categories: DashboardCategoryPoint[]; currency: string }) {
  const trendData = trend.map((point) => ({
    ...point,
    label: formatShortDate(point.date),
    incomeValue: chartNumber(point.income),
    expenseValue: chartNumber(point.expense),
  }));
  const categoryData = categories.map((item) => ({ ...item, value: chartNumber(item.total) }));
  const hasTrend = trendData.some((point) => point.incomeValue !== 0 || point.expenseValue !== 0);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader><CardTitle>Pemasukan vs pengeluaran</CardTitle><p className="text-sm text-muted-foreground">Pergerakan harian pada periode terpilih.</p></CardHeader>
        <CardContent>
          {!hasTrend ? <EmptyState compact icon={ChartNoAxesCombined} title="Belum ada tren" description="Grafik muncul setelah Anda mencatat transaksi pada periode ini." /> : <div className="h-72 w-full" role="img" aria-label={`Grafik pemasukan dan pengeluaran dengan ${trend.length} titik harian`}><ResponsiveContainer width="100%" height="100%"><LineChart accessibilityLayer data={trendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}><CartesianGrid stroke={chartStyles.grid} strokeDasharray="4 4" vertical={false} /><XAxis dataKey="label" stroke={chartStyles.axis} tickLine={false} axisLine={false} fontSize={12} minTickGap={24} /><YAxis stroke={chartStyles.axis} tickLine={false} axisLine={false} fontSize={11} tickFormatter={(value: number) => new Intl.NumberFormat(brandConfig.locale, { notation: "compact" }).format(value)} /><Tooltip formatter={(_value, name, item) => { const row = item.payload as (typeof trendData)[number]; return [formatCurrency(name === "Pemasukan" ? row.income : row.expense, currency), name]; }} contentStyle={{ ...chartStyles.tooltip }} /><Legend /><Line type="monotone" dataKey="incomeValue" name="Pemasukan" stroke={chartStyles.income} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /><Line type="monotone" dataKey="expenseValue" name="Pengeluaran" stroke={chartStyles.expense} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /></LineChart></ResponsiveContainer></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pengeluaran per kategori</CardTitle><p className="text-sm text-muted-foreground">Kategori dengan porsi pengeluaran terbesar.</p></CardHeader>
        <CardContent>
          {categoryData.length === 0 ? <EmptyState compact icon={ChartNoAxesCombined} title="Belum ada pengeluaran" description="Distribusi kategori akan tampil di sini." /> : <><div className="h-56 w-full" role="img" aria-label={`Diagram pengeluaran untuk ${categoryData.length} kategori`}><ResponsiveContainer width="100%" height="100%"><PieChart accessibilityLayer><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={2}>{categoryData.map((entry) => <Cell key={entry.category_id} fill={entry.color} />)}</Pie><Tooltip formatter={(_value, name, item) => [formatCurrency((item.payload as (typeof categoryData)[number]).total, currency), name]} contentStyle={{ ...chartStyles.tooltip }} /></PieChart></ResponsiveContainer></div><ul className="mt-2 space-y-2">{categoryData.slice(0, 5).map((item) => <li key={item.category_id} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="truncate text-muted-foreground">{item.name}</span></span><span className="shrink-0 font-semibold tabular-nums">{formatCurrency(item.total, currency)}</span></li>)}</ul></>}
        </CardContent>
      </Card>
    </div>
  );
}
