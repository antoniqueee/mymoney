import Link from "next/link";
import { LogOut, Menu, Plus, UserRound } from "lucide-react";

import { LogoLink } from "@/components/brand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { allNavigation } from "@/config/navigation";
import { signOut } from "@/features/auth/actions";

import type { AppProfile } from "./types";

function getInitials(profile?: AppProfile) {
  const value = profile?.name?.trim() || profile?.email?.trim();
  if (!value) return "?";
  return value.split(/\s+|@/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function Navbar({ profile }: { profile?: AppProfile }) {
  const displayName = profile?.name?.trim() || profile?.email?.trim();
  return (
    <header className="sticky top-0 z-40 flex h-[4.5rem] items-center justify-between border-b border-border bg-background/90 px-app-gutter backdrop-blur-xl">
      <div className="flex items-center gap-3 lg:hidden">
        <details className="group relative">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md border border-input bg-surface text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="size-5" /><span className="sr-only">Buka navigasi</span>
          </summary>
          <div className="absolute left-0 top-12 w-[min(19rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-elevated">
            <nav aria-label="Navigasi seluler" className="grid gap-1">
              {allNavigation.map((item) => {
                const Icon = item.icon;
                return <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon aria-hidden="true" className="size-4 text-muted-foreground" />{item.label}</Link>;
              })}
            </nav>
          </div>
        </details>
        <LogoLink href="/dashboard" size="sm" />
      </div>
      <p className="hidden text-sm text-muted-foreground lg:block">Ruang keuangan pribadi Anda</p>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Button asChild size="sm" className="hidden sm:inline-flex"><Link href="/transactions/create"><Plus aria-hidden="true" />Catat transaksi</Link></Button>
        <details className="group relative">
          <summary
            aria-label={displayName ? `Buka menu akun ${displayName}` : "Buka menu akun"}
            className="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 pr-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
          >
            <Avatar><AvatarFallback>{getInitials(profile)}</AvatarFallback>{profile?.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={displayName ? `Avatar ${displayName}` : "Avatar Google"} referrerPolicy="no-referrer" /> : null}</Avatar>
            {displayName ? <span className="hidden max-w-40 truncate text-sm font-semibold md:block">{displayName}</span> : <UserRound aria-hidden="true" className="hidden size-4 md:block" />}
          </summary>
          <div className="absolute right-0 top-12 w-64 rounded-lg border border-border bg-popover p-2 shadow-elevated">
            {profile?.email ? <p className="truncate px-3 py-2 text-xs text-muted-foreground">{profile.email}</p> : null}
            <Link href="/settings" className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Pengaturan profil</Link>
            <form action={signOut}><button type="submit" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><LogOut aria-hidden="true" className="size-4" />Keluar</button></form>
          </div>
        </details>
      </div>
    </header>
  );
}
