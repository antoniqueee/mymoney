import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-card"><Skeleton className="h-8 w-40" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-2 h-4 w-4/5" /><Skeleton className="mt-8 h-12 w-full" /></div></main>;
}
