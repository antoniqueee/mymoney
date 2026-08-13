import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return <div className="space-y-6" aria-label="Memuat transaksi"><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-52" /><Skeleton className="h-4 w-full max-w-md" /></div><Skeleton className="h-40 w-full" /><Skeleton className="h-80 w-full" /></div>;
}

