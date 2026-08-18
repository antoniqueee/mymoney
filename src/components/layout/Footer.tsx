"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { LogoLink } from "@/components/brand";
import { brandConfig } from "@/config/brand";

const productLinks = [
  { label: "Pencatatan Transaksi", href: "/transactions", badge: "Utama" },
  { label: "Manajemen Akun & Dompet", href: "/accounts" },
  { label: "Pelacak Anggaran Bulanan", href: "/budgets", badge: "Populer" },
  { label: "Kategori & Label Kustom", href: "/categories" },
  { label: "Grafik & Analisis Arus Kas", href: "/reports" },
  { label: "Ringkasan Finansial Realtime", href: "/dashboard" },
];

const securityLinks = [
  { label: "Proteksi & Privasi Data Terenkripsi", href: "#" },
  { label: "Autentikasi Aman Akun Google", href: "#" },
  { label: "Ekspor Cadangan (CSV & JSON)", href: "/reports" },
  { label: "Kebijakan Privasi Pengguna", href: "#" },
  { label: "Standar Keamanan Finansial", href: "#" },
  { label: "Zero Bank Credential Access", href: "#" },
];

const resourceLinks = [
  { label: "Panduan Memulai (Quickstart)", href: "#" },
  { label: "Metode Budgeting 50/30/20", href: "#" },
  { label: "Catatan Rilis & Fitur Baru", href: "#", badge: "v1.2.4" },
  { label: "Roadmap Pengembangan", href: "#" },
  { label: "Pusat Bantuan & FAQ", href: "#" },
  { label: "Status Layanan Cloud", href: "#" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Silakan masukkan alamat email yang valid.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      toast.success("Terima kasih! Anda telah terdaftar di newsletter My Money.");
      setEmail("");
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-surface via-surface to-muted/40 text-foreground">
      {/* Top Background Glow Effect */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-primary/5 via-blue-400/10 to-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-[90rem] px-app-gutter pb-12 pt-16 lg:pb-16 lg:pt-20">
        {/* Section 1: Pre-footer / Interactive Newsletter CTA Card */}
        <div className="mb-16 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-navy via-slate-900 to-slate-950 p-8 text-inverse shadow-elevated sm:p-10 lg:p-12">
          <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-3 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Update Finansial Mingguan
              </div>
              <h3 className="font-brand text-2xl font-semibold tracking-tight text-inverse sm:text-3xl lg:text-4xl">
                Kelola keuangan lebih terarah & tenang.
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-inverse-muted sm:text-base">
                Dapatkan tips budgeting praktis, panduan arus kas, dan pembaruan fitur My Money langsung ke inbox Anda setiap pekan.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-inverse-muted">
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-400" aria-hidden="true" />
                  100% Bebas Spam
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-400" aria-hidden="true" />
                  Update Rilis Rutin
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-400" aria-hidden="true" />
                  Batalkan Kapan Saja
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              {isSubscribed ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/50 p-4 text-emerald-300">
                  <CheckCircle2 className="size-6 shrink-0 text-emerald-400" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Pendaftaran Berhasil!</p>
                    <p className="text-xs text-emerald-300/80">Kabar terbaru akan dikirimkan ke email Anda.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan alamat email Anda..."
                      required
                      className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 text-sm text-inverse placeholder:text-slate-500 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Langganan
                        <Send className="size-3.5" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Main 5-Column Footer Navigation Matrix */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Brand Info & Live System Status (Spans 4 columns on large screens) */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-4">
            <LogoLink size="md" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Aplikasi pencatatan dan analisis keuangan pribadi modern. Membantu Anda memahami arus kas, mengontrol pengeluaran, dan menyusun anggaran dengan rasa tenang.
            </p>

            {/* Real-time System Status Indicator Badge */}
            <div className="inline-flex items-center gap-3 rounded-lg border border-border bg-background/80 px-3.5 py-2 text-xs shadow-xs">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Sistem Operasional Normal</span>
                <span className="text-[0.6875rem] text-muted-foreground">Infrastruktur Cloud Terjamin • 99.98% Uptime</span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 rounded-md border border-border/80 bg-surface px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
                <span>Enkripsi 256-Bit SSL</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-border/80 bg-surface px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground">
                <Lock className="size-3.5 text-income" aria-hidden="true" />
                <span>Proteksi Akun Terisolasi</span>
              </div>
            </div>
          </div>

          {/* Column 2: Fitur & Produk (Spans 2 columns) */}
          <div className="space-y-4 lg:col-span-2 lg:col-start-5">
            <p className="font-brand text-xs font-bold uppercase tracking-wider text-navy">
              Fitur & Produk
            </p>
            <ul className="space-y-2.5 text-sm">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[0.625rem] font-semibold text-primary">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Keamanan & Privasi (Spans 2 columns) */}
          <div className="space-y-4 lg:col-span-2">
            <p className="font-brand text-xs font-bold uppercase tracking-wider text-navy">
              Keamanan & Privasi
            </p>
            <ul className="space-y-2.5 text-sm">
              {securityLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="inline-flex text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Sumber Daya (Spans 2 columns) */}
          <div className="space-y-4 lg:col-span-2">
            <p className="font-brand text-xs font-bold uppercase tracking-wider text-navy">
              Sumber Daya
            </p>
            <ul className="space-y-2.5 text-sm">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium text-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Standar & Layanan (Spans 2 columns) */}
          <div className="space-y-4 lg:col-span-2">
            <p className="font-brand text-xs font-bold uppercase tracking-wider text-navy">
              Standar & Layanan
            </p>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="rounded-lg border border-border bg-background/60 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Globe className="size-3 text-muted-foreground" aria-hidden="true" />
                    Region Layanan
                  </span>
                  <span className="font-medium text-foreground">Indonesia (ID)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Server className="size-3 text-muted-foreground" aria-hidden="true" />
                    Mata Uang
                  </span>
                  <span className="font-medium text-foreground">{brandConfig.defaultCurrency} (Rp)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Zona Waktu</span>
                  <span className="font-medium text-foreground">WIB (UTC+7)</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-1.5">
                  <span>Sinkronisasi</span>
                  <span className="font-semibold text-primary">Real-time Cloud</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Bottom Legal & Copyright Bar */}
        <div className="mt-14 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
            <div className="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
              <p>
                © {new Date().getFullYear()} <strong className="font-semibold text-foreground">{brandConfig.name}</strong> by Antonique. {brandConfig.copyrightNotice}
              </p>
              <p className="text-[0.6875rem] text-muted-foreground">
                Dirancang dan dibangun untuk memberikan ketenangan & kendali atas arus kas Anda.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="#" className="transition-colors hover:text-foreground">
                Kebijakan Privasi
              </Link>
              <Link href="#" className="transition-colors hover:text-foreground">
                Ketentuan Layanan
              </Link>
              <Link href="#" className="transition-colors hover:text-foreground">
                Keamanan
              </Link>
              <Link href="#" className="transition-colors hover:text-foreground">
                Preferensi Cookie
              </Link>
              
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Kembali ke atas halaman"
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>Ke Atas</span>
                <ArrowUp className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
