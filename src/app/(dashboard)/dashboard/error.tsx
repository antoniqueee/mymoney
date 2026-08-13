"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>Dashboard belum dapat dimuat</AlertTitle>
      <AlertDescription className="mt-2">
        Data keuangan Anda tidak berubah. Coba muat kembali ringkasan.
        <div className="mt-4">
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Coba lagi
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
