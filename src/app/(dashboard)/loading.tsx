import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return <div aria-label="Memuat halaman" className="space-y-6"><div><Skeleton className="h-9 w-56" /><Skeleton className="mt-2 h-4 w-80 max-w-full" /></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-lg" />)}</div><Skeleton className="h-80 rounded-lg" /></div>;
}
