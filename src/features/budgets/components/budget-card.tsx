"use client";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { brandConfig } from "@/config/brand";
import { CategoryIconGlyph } from "@/features/categories/category-icons";
import type { BudgetRecord } from "@/features/budgets/types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

interface BudgetCardProps {
  budget: BudgetRecord;
  currencyCode: string;
  isPending: boolean;
  onEdit: (budget: BudgetRecord) => void;
  onDelete: (budget: BudgetRecord) => void;
}

const STATUS_COPY = {
  safe: { label: "Terkendali", variant: "success" as const },
  warning: { label: "Mendekati batas", variant: "warning" as const },
  exceeded: { label: "Batas terlampaui", variant: "destructive" as const },
};

export function BudgetCard({
  budget,
  currencyCode,
  isPending,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const status = STATUS_COPY[budget.status];
  const progressValue = Math.min(Math.max(budget.usage_percentage, 0), 100);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-inverse shadow-sm"
            style={{ backgroundColor: budget.category.color }}
            aria-hidden="true"
          >
            <CategoryIconGlyph icon={budget.category.icon} className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-foreground">{budget.category.name}</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
              {budget.category.is_archived ? <Badge variant="outline">Kategori diarsipkan</Badge> : null}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDate(budget.period_start)} – {formatDate(budget.period_end)}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Terpakai</p>
              <p className="font-semibold tabular-nums text-foreground">
                {formatCurrency(budget.used_amount, currencyCode)}
              </p>
            </div>
            <p className="text-sm tabular-nums text-muted-foreground">
              dari {formatCurrency(budget.amount, currencyCode)}
            </p>
          </div>
          <Progress
            value={progressValue}
            tone={budget.status}
            aria-label={`Penggunaan anggaran ${budget.category.name}: ${budget.usage_percentage.toLocaleString(brandConfig.locale, { maximumFractionDigits: 2 })} persen`}
          />
          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {budget.usage_percentage.toLocaleString(brandConfig.locale, { maximumFractionDigits: 2 })}% terpakai
            </span>
            <span className={budget.status === "exceeded" ? "font-medium text-destructive" : undefined}>
              {budget.status === "exceeded" ? "Melebihi" : "Sisa"}: {formatCurrency(
                budget.status === "exceeded"
                  ? budget.remaining_amount.replace(/^-/u, "")
                  : budget.remaining_amount,
                currencyCode,
              )}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(budget)}
            disabled={isPending || budget.category.is_archived}
            title={budget.category.is_archived ? "Pulihkan kategori sebelum mengedit anggaran" : undefined}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(budget)}
            disabled={isPending}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
