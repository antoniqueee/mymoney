import Link from "next/link";
import { ArrowRight, BarChart3, Check, LockKeyhole, ReceiptText, WalletCards } from "lucide-react";

import { LogoLink } from "@/components/brand";
import { Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { brandConfig } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";

const benefits = [
  { icon: ReceiptText, title: "Catat tanpa ribet", description: "Simpan pemasukan dan pengeluaran sehari-hari dalam beberapa langkah." },
  { icon: BarChart3, title: "Mudah dilihat kembali", description: "Lihat arus kas, kebiasaan belanja, dan kemajuan anggaran dalam satu tempat." },
  { icon: LockKeyhole, title: "Data tetap milik Anda", description: "Catatan keuangan Anda terlindungi dan hanya dapat diakses oleh Anda." },
] as const;

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const destination = user ? brandConfig.links.dashboard : brandConfig.links.login;

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="relative z-20 mx-auto flex h-20 max-w-[90rem] items-center justify-between px-app-gutter">
        <LogoLink priority />
        <nav aria-label="Navigasi halaman utama" className="flex items-center gap-2">
          <Link href="#manfaat" className="hidden rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex">Manfaat</Link>
          <Button asChild size="sm"><Link href={destination}>{user ? "Buka dashboard" : "Masuk"}<ArrowRight aria-hidden="true" /></Link></Button>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-[90rem] gap-12 px-app-gutter pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute -right-36 -top-40 size-[34rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="relative max-w-3xl animate-fade-up">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary"><LockKeyhole aria-hidden="true" className="size-3.5" />Teman sederhana untuk keuangan sehari-hari</p>
            <h1 className="font-brand text-display font-semibold text-navy">Kenali uang Anda,<br /><span className="text-primary">tanpa bikin pusing.</span></h1>
            <p className="mt-7 max-w-2xl text-lead text-muted-foreground">Catat pemasukan dan pengeluaran, pantau kebiasaan, lalu susun rencana keuangan dari satu tempat yang nyaman.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto"><Link href={destination}>{user ? "Lanjut ke dashboard" : "Yuk, mulai dengan Google"}<ArrowRight aria-hidden="true" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto"><Link href="#cara-kerja">Lihat cara kerja</Link></Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Tak perlu menghubungkan rekening bank. Mulai dari catatan sederhana saja.</p>
          </div>

          <Card className="relative overflow-hidden border-primary/15 bg-surface/90 shadow-elevated animate-fade-up [animation-delay:120ms]">
            <div className="border-b border-border bg-primary-soft/70 p-5"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><WalletCards aria-hidden="true" /></span><div><p className="font-brand text-lg font-semibold">Semua catatan, satu tempat</p><p className="text-xs text-muted-foreground">Lebih mudah dirapikan, lebih enak dipahami</p></div></div></div>
            <CardContent className="space-y-3 p-5">
              {["Catat transaksi dalam alur singkat", "Pantau anggaran dari data aktual", "Ekspor laporan dan cadangan kapan saja"].map((item) => <div key={item} className="flex items-center gap-3 rounded-md border border-border bg-background/60 p-3 text-sm font-medium"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-income-soft text-income"><Check aria-hidden="true" className="size-4" /></span>{item}</div>)}
            </CardContent>
          </Card>
        </section>

        <section id="manfaat" className="border-y border-border bg-surface py-20 scroll-mt-20">
          <div className="mx-auto max-w-[90rem] px-app-gutter"><div className="max-w-2xl"><p className="text-label font-semibold uppercase tracking-[0.14em] text-primary">Dibuat untuk keseharian Anda</p><h2 className="mt-2 font-brand text-page-title font-semibold">Kelola keuangan tanpa terasa rumit.</h2><p className="mt-3 text-muted-foreground">Semua yang Anda perlukan untuk mencatat, memahami, dan merencanakan keuangan dengan lebih nyaman.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{benefits.map(({ icon: Icon, title, description }) => <Card key={title}><CardContent className="p-6"><span className="mb-5 flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon aria-hidden="true" /></span><h3 className="font-brand text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div></div>
        </section>

        <section id="cara-kerja" className="mx-auto max-w-[90rem] px-app-gutter py-24 scroll-mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-label font-semibold uppercase tracking-[0.14em] text-primary">Mulai pelan-pelan</p>
            <h2 className="mt-2 font-brand text-page-title font-semibold text-navy">
              Tiga langkah untuk membuat keuangan lebih rapi.
            </h2>
            <p className="mt-3 text-lead text-muted-foreground">
              Masuk, siapkan akun, lalu mulai mencatat. Ringkasan Anda akan ikut diperbarui.
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {/* Step 1: Login & Instant Financial Setup */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft font-brand text-lg font-bold text-primary">
                  01
                </div>
                <h3 className="font-brand text-2xl font-semibold text-navy">
                  1. Akses Aman & Personalisasi Finansial
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Cukup masuk menggunakan akun Google terverifikasi tanpa perlu mengingat password baru. Ruang data keuangan Anda langsung siap digunakan secara privat dengan proteksi keamanan terenkripsi dan terisolasi penuh.
                </p>
                <ul className="space-y-2 pt-2 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-income-soft text-income">
                      <Check aria-hidden="true" className="size-3.5" />
                    </span>
                    Akses instan 1-klik tanpa registrasi berbelit
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-income-soft text-income">
                      <Check aria-hidden="true" className="size-3.5" />
                    </span>
                    Data keuangan 100% privat dan terisolasi milik Anda
                  </li>
                </ul>
              </div>

              {/* Terminal Window Mockup: Smart Workspace Setup */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-elevated">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500/80" />
                    <span className="size-3 rounded-full bg-yellow-500/80" />
                    <span className="size-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>my-money-engine — setup-workspace</span>
                  </div>
                  <div className="size-4" />
                </div>
                <div className="p-5 font-mono text-xs leading-relaxed space-y-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="font-bold text-primary">❯</span>
                    <span>my-money init --profile <span className="text-amber-300">&quot;Personal &amp; Family Wealth&quot;</span></span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span>✔</span>
                      <span>Ruang Finansial Pribadi aktif (Mata Uang: IDR • Zona: WIB)</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span>✔</span>
                      <span>3 Pos Dompet Siap: [BCA Utama] [E-Wallet Harian] [Dana Darurat]</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <span>✔</span>
                      <span>Sistem Alokasi Anggaran 50/30/20 diaktifkan otomatis</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-slate-300 space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[0.7rem] font-semibold tracking-wider text-slate-400 uppercase">
                      <span>STATUS KESIAPAN FINANSIAL</span>
                      <span className="text-emerald-400">SIAP DIGUNAKAN</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[0.7rem]">
                      <div>
                        <span className="text-slate-500">Proteksi Data:</span>{" "}
                        <span className="font-medium text-emerald-300">Terkunci &amp; Privat</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Target Anggaran:</span>{" "}
                        <span className="font-medium text-cyan-300">6 Kategori Aktif</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Akses Rekening:</span>{" "}
                        <span className="font-medium text-amber-300">Zero-Credential</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Laporan Otomatis:</span>{" "}
                        <span className="font-medium text-purple-300">Real-time Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Dashboard UI Screenshot / Mockup */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="order-last lg:order-first overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-elevated">
                <div className="rounded-lg border border-border bg-background p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-primary" />
                      <span className="font-brand text-sm font-semibold">Ringkasan Dompet & Akun</span>
                    </div>
                    <span className="rounded bg-income-soft px-2 py-0.5 text-xs font-semibold text-income">Aktif</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-border bg-surface p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Bank BCA Utama</p>
                      <p className="text-base font-bold tabular-nums text-foreground">Rp 18.500.000</p>
                    </div>
                    <div className="rounded-md border border-border bg-surface p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">E-Wallet (GoPay / OVO)</p>
                      <p className="text-base font-bold tabular-nums text-foreground">Rp 2.750.000</p>
                    </div>
                  </div>
                  <div className="rounded-md border border-primary/20 bg-primary-soft/50 p-3">
                    <div className="flex justify-between text-xs font-semibold text-primary">
                      <span>Anggaran Bulanan Makanan</span>
                      <span>72% Terpakai</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/20">
                      <div className="h-full w-[72%] rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft font-brand text-lg font-bold text-primary">
                  02
                </div>
                <h3 className="font-brand text-2xl font-semibold text-navy">
                  2. Atur Dompet & Anggaran Belanja
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Kelola berbagai akun seperti Rekening Bank, E-Wallet, atau Tunai. Buat batas anggaran per kategori belanja untuk memastikan pengeluaran Anda tetap terkontrol.
                </p>
                <ul className="space-y-2 pt-2 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-income-soft text-income">
                      <Check aria-hidden="true" className="size-3.5" />
                    </span>
                    Multi-akun (Bank, E-Wallet, Cash)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-income-soft text-income">
                      <Check aria-hidden="true" className="size-3.5" />
                    </span>
                    Batas anggaran otomatis terhitung dari transaksi
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3: Fast Transaction Recording & Financial Health Stream */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft font-brand text-lg font-bold text-primary">
                  03
                </div>
                <h3 className="font-brand text-2xl font-semibold text-navy">
                  3. Catat Transaksi & Analisis Cerdas Realtime
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tambahkan transaksi pengeluaran atau pemasukan hanya dalam beberapa detik. Seluruh laporan, tren arus kas, sisa anggaran, dan kalkulasi surplus langsung dihitung secara otomatis.
                </p>
                <div className="pt-2">
                  <Button asChild size="lg">
                    <Link href={destination}>
                      {user ? "Buka Dashboard Saya" : "Mulai Pencatatan Sekarang"}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Live Financial Health & Transaction Stream Terminal */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-elevated">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500/80" />
                    <span className="size-3 rounded-full bg-yellow-500/80" />
                    <span className="size-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>my-money-intelligence — live-analytics &amp; audit</span>
                  </div>
                  <div className="size-4" />
                </div>
                <div className="p-5 font-mono text-xs leading-relaxed space-y-3.5">
                  <div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="font-bold text-primary">❯</span>
                      <span>my-money record --expense <span className="text-amber-300">&quot;Belanja Bulanan Supermarket&quot;</span> --amount <span className="text-emerald-300">450.000</span> --wallet <span className="text-cyan-300">&quot;GoPay&quot;</span></span>
                    </div>
                    <div className="mt-1.5 space-y-1 text-slate-300">
                      <div className="text-emerald-400">✔ Pengeluaran Rp 450.000 berhasil dicatat di pos &apos;Kebutuhan Pokok&apos;</div>
                      <div className="text-slate-400">ℹ Sisa Anggaran Bulanan: <span className="font-semibold text-emerald-300">Rp 2.550.000</span> (Aman • 64% tersisa)</div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2.5">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="font-bold text-primary">❯</span>
                      <span>my-money audit --health-score --period <span className="text-purple-300">&quot;Bulan Ini&quot;</span></span>
                    </div>
                    <div className="mt-2 space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                        <span>📊 FINANCIAL HEALTH SCORE: 94 / 100</span>
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[0.65rem] uppercase text-emerald-300">Kondisi Prima</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[0.7rem] text-slate-300">
                        <div>• Total Pemasukan: <span className="font-semibold text-emerald-400">Rp 12.500.000</span></div>
                        <div>• Total Belanja: <span className="font-semibold text-rose-400">Rp 4.850.000</span></div>
                        <div>• Rasio Pengeluaran: <span className="font-semibold text-cyan-300">38.8% (Terkendali)</span></div>
                        <div>• Surplus Bersih: <span className="font-bold text-emerald-300">+Rp 7.650.000</span></div>
                      </div>
                      <div className="border-t border-emerald-500/20 pt-1.5 text-[0.6875rem] text-amber-300">
                        ⚡ <strong>Saran Cerdas:</strong> Surplus dapat dialokasikan 50% ke &apos;Pos Tabungan &amp; Investasi&apos;.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
