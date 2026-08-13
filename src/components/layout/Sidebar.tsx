"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoLink } from "@/components/brand";
import { primaryNavigation, secondaryNavigation, isNavigationActive } from "@/config/navigation";
import { cn } from "@/lib/utils";

function SidebarLink({ item }: { item: (typeof primaryNavigation)[number] }) {
  const pathname = usePathname();
  const active = isNavigationActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon aria-hidden="true" className="size-[1.125rem]" />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-[4.5rem] items-center border-b border-border px-6">
        <LogoLink href="/dashboard" priority />
      </div>
      <nav aria-label="Navigasi utama" className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        <p className="mb-1 px-3 text-caption font-semibold uppercase tracking-[0.14em] text-muted-foreground">Keuangan saya</p>
        {primaryNavigation.map((item) => <SidebarLink key={item.href} item={item} />)}
        <div className="mt-auto border-t border-border pt-3">
          {secondaryNavigation.map((item) => <SidebarLink key={item.href} item={item} />)}
        </div>
      </nav>
    </aside>
  );
}
