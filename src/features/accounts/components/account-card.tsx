"use client";

import { Archive, ArchiveRestore, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ACCOUNT_TYPE_CONFIG } from "@/features/accounts/config";
import type { AccountWithBalance } from "@/features/accounts/types";
import { formatCurrency } from "@/lib/formatters/currency";

interface AccountCardProps {
  account: AccountWithBalance;
  currencyCode: string;
  isPending: boolean;
  onEdit: (account: AccountWithBalance) => void;
  onToggleArchive: (account: AccountWithBalance) => void;
}

export function AccountCard({
  account,
  currencyCode,
  isPending,
  onEdit,
  onToggleArchive,
}: AccountCardProps) {
  const config = ACCOUNT_TYPE_CONFIG[account.type];
  const Icon = config.icon;

  return (
    <Card className={account.is_archived ? "opacity-75" : undefined}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-foreground">{account.name}</h3>
              <Badge variant="outline">{config.label}</Badge>
              {account.is_archived ? <Badge variant="secondary">Diarsipkan</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3">
          <div>
            <dt className="text-xs text-muted-foreground">Saldo saat ini</dt>
            <dd className="mt-1 break-all font-semibold tabular-nums text-foreground">
              {formatCurrency(account.current_balance, currencyCode)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Saldo awal</dt>
            <dd className="mt-1 break-all text-sm font-medium tabular-nums text-foreground">
              {formatCurrency(account.opening_balance, currencyCode)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(account)}
            disabled={isPending}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onToggleArchive(account)}
            disabled={isPending}
          >
            {account.is_archived ? (
              <ArchiveRestore className="size-4" aria-hidden="true" />
            ) : (
              <Archive className="size-4" aria-hidden="true" />
            )}
            {account.is_archived ? "Pulihkan" : "Arsipkan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
