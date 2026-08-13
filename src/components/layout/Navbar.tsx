import Link from "next/link";
import { LogOut, Plus, UserRound } from "lucide-react";

import { LogoLink } from "@/components/brand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center lg:hidden">
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
