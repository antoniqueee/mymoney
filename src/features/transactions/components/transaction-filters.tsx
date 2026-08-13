import Link from "next/link";
import { Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { TransactionFilters } from "../schema";
import type { TransactionOption } from "../types";

export function TransactionFiltersForm({ filters, categories, accounts }: { filters: TransactionFilters; categories: TransactionOption[]; accounts: TransactionOption[] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input type="hidden" name="trash" value={filters.trash} />
          <FilterField label="Cari" htmlFor="search" className="sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="search" name="search" defaultValue={filters.search} placeholder="Cari deskripsi…" className="pl-9" />
            </div>
          </FilterField>
          <FilterField label="Tipe" htmlFor="type">
            <Select id="type" name="type" defaultValue={filters.type}>
              <option value="all">Semua tipe</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option>
            </Select>
          </FilterField>
          <FilterField label="Kategori" htmlFor="category">
            <Select id="category" name="category" defaultValue={filters.category ?? ""}>
              <option value="">Semua kategori</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}{item.is_archived ? " (diarsipkan)" : ""}</option>)}
            </Select>
          </FilterField>
          <FilterField label="Akun" htmlFor="account">
            <Select id="account" name="account" defaultValue={filters.account ?? ""}>
              <option value="">Semua akun</option>
              {accounts.map((item) => <option key={item.id} value={item.id}>{item.name}{item.is_archived ? " (diarsipkan)" : ""}</option>)}
            </Select>
          </FilterField>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1"><SlidersHorizontal className="h-4 w-4" />Terapkan</Button>
            <Button asChild type="button" variant="outline" size="icon" aria-label="Reset filter"><Link href={filters.trash === "true" ? "/transactions?trash=true" : "/transactions"}>×</Link></Button>
          </div>
          <FilterField label="Mulai" htmlFor="start">
            <Input id="start" name="start" type="date" defaultValue={filters.start} />
          </FilterField>
          <FilterField label="Sampai" htmlFor="end">
            <Input id="end" name="end" type="date" defaultValue={filters.end} />
          </FilterField>
          <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
            <Button asChild variant="ghost" size="sm">
              <Link href={filters.trash === "true" ? "/transactions" : "/transactions?trash=true"}>
                <Trash2 className="h-4 w-4" />{filters.trash === "true" ? "Kembali ke transaksi" : "Lihat sampah"}
              </Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FilterField({ label, htmlFor, className, children }: { label: string; htmlFor: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><Label htmlFor={htmlFor} className="mb-2 block text-xs">{label}</Label>{children}</div>;
}
