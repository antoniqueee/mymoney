"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { allNavigation, isNavigationActive } from "@/config/navigation";
import { cn } from "@/lib/utils";

const mobileNavigation = allNavigation.filter((item) => item.mobile);

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi bawah" className="safe-bottom fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-surface/95 px-1 pt-1 backdrop-blur-xl md:hidden">
      {mobileNavigation.map((item) => {
        const active = isNavigationActive(pathname, item.href);
        const Icon = item.icon;
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-sm px-1 py-1.5 text-[0.625rem] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}><Icon aria-hidden="true" className="size-5" /><span className="max-w-full truncate">{item.label}</span></Link>;
      })}
    </nav>
  );
}
