"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function CategoriesError({ reset }: { reset: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>Terjadi kesalahan saat membuka kategori</AlertTitle>
      <AlertDescription className="mt-2">
        Data Anda tidak berubah. Muat ulang tampilan untuk mencoba lagi.
        <div className="mt-4">
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Coba lagi
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
