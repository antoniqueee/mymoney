"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function TransactionsError({ reset }: { reset: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>Transaksi belum dapat dimuat</AlertTitle>
      <AlertDescription className="mt-2">
        Data Anda tetap aman. Coba muat kembali halaman transaksi.
        <div className="mt-4">
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Coba lagi
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
