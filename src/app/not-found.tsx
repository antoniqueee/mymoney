import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-background px-4 text-center"><div><Logo size="lg" wordmark={false} className="mx-auto" /><p className="mt-6 text-label font-semibold uppercase tracking-[0.14em] text-primary">Halaman tidak ditemukan</p><h1 className="mt-2 font-brand text-page-title font-semibold">Sepertinya Anda tersesat.</h1><p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p><Button asChild className="mt-6"><Link href="/"><ArrowLeft aria-hidden="true" />Kembali ke beranda</Link></Button></div></main>;
}
