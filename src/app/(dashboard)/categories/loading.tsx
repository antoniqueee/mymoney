import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat kategori">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-full max-w-lg" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardHeader className="flex-row items-center gap-3">
              <Skeleton className="size-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
