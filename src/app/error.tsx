"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="flex min-h-[70vh] items-center justify-center px-4 text-center"><div className="max-w-md"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-warning-soft text-warning"><AlertTriangle aria-hidden="true" /></span><h1 className="mt-5 font-brand text-page-title font-semibold">Ada yang belum berjalan semestinya.</h1><p className="mt-3 text-sm text-muted-foreground">Data Anda tidak berubah. Coba muat ulang bagian ini.</p><Button onClick={reset} className="mt-6"><RotateCcw aria-hidden="true" />Coba lagi</Button></div></main>;
}
