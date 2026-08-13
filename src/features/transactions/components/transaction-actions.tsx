"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { restoreTransaction, softDeleteTransaction } from "../actions";

export function TransactionActions({ id, deleted = false, compact = false }: { id: string; deleted?: boolean; compact?: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    const prompt = deleted
      ? "Pulihkan transaksi ini? Saldo dan laporan akan menghitungnya kembali."
      : "Pindahkan transaksi ini ke sampah? Saldo dan laporan tidak akan menghitungnya.";
    if (!window.confirm(prompt)) return;
    startTransition(async () => {
      const result = deleted ? await restoreTransaction(id) : await softDeleteTransaction(id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(deleted ? "/transactions?trash=true" : "/transactions");
      router.refresh();
    });
  }

  return (
    <Button type="button" variant={deleted ? "outline" : "destructive"} size={compact ? "sm" : "default"} disabled={pending} onClick={run}>
      {deleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
      {pending ? "Memproses…" : deleted ? "Pulihkan" : "Hapus"}
    </Button>
  );
}
