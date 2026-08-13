"use client";

import { Archive, ArchiveRestore, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIconGlyph } from "@/features/categories/category-icons";
import type { CategoryRecord } from "@/features/categories/types";

interface CategoryCardProps {
  category: CategoryRecord;
  isPending: boolean;
  onEdit: (category: CategoryRecord) => void;
  onToggleArchive: (category: CategoryRecord) => void;
}

export function CategoryCard({
  category,
  isPending,
  onEdit,
  onToggleArchive,
}: CategoryCardProps) {
  return (
    <Card className={category.is_archived ? "opacity-75" : undefined}>
      <CardContent className="flex items-start gap-3 p-4 sm:p-5">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-inverse shadow-sm"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        >
          <CategoryIconGlyph icon={category.icon} className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{category.name}</h3>
            <Badge variant={category.type === "income" ? "income" : "expense"}>
              {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
            </Badge>
            {category.is_default ? <Badge variant="outline">Bawaan</Badge> : null}
            {category.is_archived ? <Badge variant="secondary">Diarsipkan</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.is_archived
              ? "Tetap tampil pada transaksi lama, tetapi tidak dapat dipilih untuk transaksi baru."
              : "Siap digunakan untuk pencatatan transaksi."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onEdit(category)}
              disabled={isPending}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onToggleArchive(category)}
              disabled={isPending}
            >
              {category.is_archived ? (
                <ArchiveRestore className="size-4" aria-hidden="true" />
              ) : (
                <Archive className="size-4" aria-hidden="true" />
              )}
              {category.is_archived ? "Pulihkan" : "Arsipkan"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
