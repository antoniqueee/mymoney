import { Skeleton } from "@/components/ui/skeleton";
export default function DashboardLoading() { return <div className="space-y-6" aria-label="Memuat dashboard"><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-48" /></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36" />)}</div><div className="grid gap-5 xl:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div></div>; }

