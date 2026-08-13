"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ReportsError({ reset }: { reset: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>Laporan belum dapat dibuka</AlertTitle>
      <AlertDescription className="mt-2">
        Data keuangan Anda tidak berubah. Coba muat ulang halaman laporan.
        <div className="mt-4">
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Coba lagi
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
