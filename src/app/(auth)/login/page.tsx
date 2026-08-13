import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { LogoLink } from "@/components/brand";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleLoginButton } from "@/features/auth/GoogleLoginButton";
import { getSafeNextPath } from "@/features/auth/redirects";

export const metadata: Metadata = { title: "Masuk" };

const errorMessages: Record<string, string> = {
  oauth_cancelled: "Proses masuk dibatalkan. Anda dapat mencobanya kembali kapan saja.",
  missing_oauth_code: "Respons login tidak lengkap. Silakan mulai kembali dari tombol Google.",
  oauth_callback_failed: "Sesi tidak dapat dibuat. Periksa konfigurasi OAuth atau coba kembali.",
  signout_failed: "Sesi belum berhasil ditutup. Silakan coba keluar kembali.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const messageCode = typeof params.message === "string" ? params.message : undefined;
  const nextPath = getSafeNextPath(typeof params.next === "string" ? params.next : undefined);

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-background lg:grid-cols-[0.92fr_1.08fr]">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-inverse lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="surface-grid absolute inset-0 opacity-[0.08]" />
        <div className="absolute -bottom-32 -right-32 size-[28rem] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -left-24 top-1/3 size-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <LogoLink variant="inverse" priority />
        <div className="relative max-w-xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-inverse-muted">
            <Sparkles aria-hidden="true" className="size-4 text-blue-300" />
            Keuangan terasa lebih ringan
          </p>
          <h1 className="font-brand text-5xl font-semibold leading-[1.02] tracking-[-0.035em] xl:text-6xl">
            Kembali memahami setiap langkah finansial Anda.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-inverse-muted">
            Satu ruang tenang untuk melihat transaksi, merencanakan anggaran, dan mengambil keputusan dengan lebih percaya diri.
          </p>
          <div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <ShieldCheck aria-hidden="true" className="mb-3 size-5 text-blue-300" />
              <p className="text-sm font-semibold">Privasi terjaga</p>
              <p className="mt-1 text-xs leading-relaxed text-inverse-muted">Data Anda hanya untuk Anda.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <LockKeyhole aria-hidden="true" className="mb-3 size-5 text-blue-300" />
              <p className="text-sm font-semibold">Masuk dengan aman</p>
              <p className="mt-1 text-xs leading-relaxed text-inverse-muted">Kami tidak meminta data rekening.</p>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-inverse-muted">My Money tidak pernah meminta kredensial rekening bank.</p>
      </section>
      <section className="flex min-h-screen items-start justify-center px-4 pb-8 pt-0 sm:px-8 lg:items-center lg:py-8">
        <div className="w-full max-w-md">
          <div className="relative -mx-4 mb-0 overflow-hidden rounded-b-[2rem] bg-navy px-5 pb-16 pt-6 text-inverse sm:-mx-8 sm:px-8 lg:hidden">
            <div className="surface-grid absolute inset-0 opacity-[0.08]" />
            <div className="absolute -right-20 -top-24 size-56 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative">
              <LogoLink variant="inverse" priority />
              <p className="mt-10 max-w-xs font-brand text-3xl font-semibold leading-tight tracking-[-0.03em]">
                Keuangan lebih tenang, mulai dari satu langkah kecil.
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-inverse-muted">
                Masuk untuk melihat gambaran uang Anda dengan lebih jernih.
              </p>
            </div>
          </div>
          <div className="relative -mt-10">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft aria-hidden="true" className="size-4" />Kembali ke beranda
          </Link>
          <Card className="rounded-2xl shadow-elevated">
            <CardHeader className="gap-3 pb-6">
              <p className="text-sm font-semibold text-primary">Selamat datang kembali</p>
              <CardTitle className="text-3xl tracking-[-0.03em]">Masuk ke My Money</CardTitle>
              <CardDescription className="text-[0.95rem]">Lanjutkan perjalanan Anda menuju keuangan yang lebih teratur dan tenang.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {errorCode ? <Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertDescription>{errorMessages[errorCode] ?? "Autentikasi belum berhasil. Silakan coba kembali."}</AlertDescription></Alert> : null}
              {messageCode === "signed_out" ? <Alert variant="success"><CheckCircle2 aria-hidden="true" /><AlertDescription>Anda telah keluar dengan aman.</AlertDescription></Alert> : null}
              <GoogleLoginButton nextPath={nextPath} />
              <div className="flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" /><span>akses cepat & aman</span><div className="h-px flex-1 bg-border" /></div>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">Dengan melanjutkan, Anda memberikan akses hanya pada informasi profil dasar Google untuk autentikasi.</p>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">Ruang pribadi untuk mengelola uang dengan lebih jernih.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
