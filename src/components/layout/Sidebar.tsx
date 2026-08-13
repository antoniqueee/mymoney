"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { LogoLink } from "@/components/brand";
import { primaryNavigation, secondaryNavigation, isNavigationActive } from "@/config/navigation";
import { cn } from "@/lib/utils";

function SidebarLink({ item, collapsed }: { item: (typeof primaryNavigation)[number]; collapsed: boolean }) {
  const pathname = usePathname();
  const active = isNavigationActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center rounded-md py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        collapsed ? "justify-center px-2" : "gap-3 px-3",
        active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon aria-hidden="true" className="size-[1.125rem] shrink-0" />
      <span className={cn(collapsed && "sr-only")}>{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
        collapsed ? "w-20" : "w-[17rem]",
      )}
    >
      <div className={cn("flex h-[4.5rem] items-center border-b border-border", collapsed ? "justify-center px-3" : "px-6")}>
        <LogoLink href="/dashboard" priority size={collapsed ? "sm" : "md"} wordmark={!collapsed} />
      </div>
      <button
        type="button"
        aria-controls="desktop-sidebar-navigation"
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Perbesar sidebar" : "Perkecil sidebar"}
        title={collapsed ? "Perbesar sidebar" : "Perkecil sidebar"}
        onClick={() => setCollapsed((current) => !current)}
        className="absolute -right-3 top-[3.625rem] z-20 flex size-7 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {collapsed ? <ChevronRight aria-hidden="true" className="size-4" /> : <ChevronLeft aria-hidden="true" className="size-4" />}
      </button>
      <nav id="desktop-sidebar-navigation" aria-label="Navigasi utama" className={cn("flex flex-1 flex-col gap-1 overflow-y-auto", collapsed ? "p-3" : "p-4")}>
        {collapsed ? null : <p className="mb-1 px-3 text-caption font-semibold uppercase tracking-[0.14em] text-muted-foreground">Keuangan saya</p>}
        {primaryNavigation.map((item) => <SidebarLink key={item.href} item={item} collapsed={collapsed} />)}
        <div className="mt-auto border-t border-border pt-3">
          {secondaryNavigation.map((item) => <SidebarLink key={item.href} item={item} collapsed={collapsed} />)}
        </div>
      </nav>
    </aside>
  );
}
