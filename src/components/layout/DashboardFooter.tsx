import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";

import { brandConfig } from "@/config/brand";

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-surface/50 py-4 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-3 px-app-gutter sm:flex-row">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium text-foreground">
            {brandConfig.name}
          </span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1 text-[0.6875rem] text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Enkripsi & Privasi Terproteksi
          </span>
          <span className="text-border hidden sm:inline">•</span>
          <span className="text-[0.6875rem] text-muted-foreground hidden sm:inline">
            v1.2.4 (IDR • WIB)
          </span>
        </div>

        <div className="flex items-center gap-4 text-[0.75rem]">
          <Link href="/reports" className="transition-colors hover:text-foreground">
            Laporan
          </Link>
          <Link href="/settings" className="transition-colors hover:text-foreground">
            Pengaturan
          </Link>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <ShieldCheck className="size-3 text-primary" aria-hidden="true" />
            Data Terenkripsi
          </span>
        </div>
      </div>
    </footer>
  );
}
