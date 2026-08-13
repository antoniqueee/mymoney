import Link from "next/link";
import { ArrowRight, BarChart3, Check, LockKeyhole, ReceiptText, WalletCards } from "lucide-react";

import { LogoLink } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { brandConfig } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";

const benefits = [
  { icon: ReceiptText, title: "Pencatatan yang ringan", description: "Catat pemasukan dan pengeluaran tanpa alur yang berbelit." },
  { icon: BarChart3, title: "Gambaran yang jernih", description: "Pahami arus kas, kategori belanja, dan kemajuan anggaran dalam satu tempat." },
  { icon: LockKeyhole, title: "Privasi sebagai fondasi", description: "Data keuangan dilindungi autentikasi dan aturan akses per pengguna." },
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
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary"><LockKeyhole aria-hidden="true" className="size-3.5" />Keuangan pribadi, tetap pribadi</p>
            <h1 className="font-brand text-display font-semibold text-navy">Uang Anda,<br /><span className="text-primary">lebih mudah dipahami.</span></h1>
            <p className="mt-7 max-w-2xl text-lead text-muted-foreground">My Money membantu Anda mencatat keseharian, melihat pola, dan membuat keputusan finansial dengan lebih tenang—tanpa kerumitan yang tidak perlu.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto"><Link href={destination}>{user ? "Lanjut ke dashboard" : "Mulai dengan Google"}<ArrowRight aria-hidden="true" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto"><Link href="#cara-kerja">Lihat cara kerja</Link></Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Tidak memerlukan koneksi rekening bank atau kredensial finansial.</p>
          </div>

          <Card className="relative overflow-hidden border-primary/15 bg-surface/90 shadow-elevated animate-fade-up [animation-delay:120ms]">
            <div className="border-b border-border bg-primary-soft/70 p-5"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><WalletCards aria-hidden="true" /></span><div><p className="font-brand text-lg font-semibold">Satu ruang yang tenang</p><p className="text-xs text-muted-foreground">Untuk seluruh kebiasaan finansial Anda</p></div></div></div>
            <CardContent className="space-y-3 p-5">
              {["Catat transaksi dalam alur singkat", "Pantau anggaran dari data aktual", "Ekspor laporan dan cadangan kapan saja"].map((item) => <div key={item} className="flex items-center gap-3 rounded-md border border-border bg-background/60 p-3 text-sm font-medium"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-income-soft text-income"><Check aria-hidden="true" className="size-4" /></span>{item}</div>)}
            </CardContent>
          </Card>
        </section>

        <section id="manfaat" className="border-y border-border bg-surface py-20 scroll-mt-20">
          <div className="mx-auto max-w-[90rem] px-app-gutter"><div className="max-w-2xl"><p className="text-label font-semibold uppercase tracking-[0.14em] text-primary">Dibuat untuk satu orang</p><h2 className="mt-2 font-brand text-page-title font-semibold">Semua yang penting. Tidak lebih.</h2><p className="mt-3 text-muted-foreground">Fokus pada pencatatan akurat, navigasi sederhana, dan wawasan yang bisa langsung digunakan.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{benefits.map(({ icon: Icon, title, description }) => <Card key={title}><CardContent className="p-6"><span className="mb-5 flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon aria-hidden="true" /></span><h3 className="font-brand text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></CardContent></Card>)}</div></div>
        </section>

        <section id="cara-kerja" className="mx-auto max-w-[90rem] px-app-gutter py-24 scroll-mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-label font-semibold uppercase tracking-[0.14em] text-primary">Langkah Mudah</p>
            <h2 className="mt-2 font-brand text-page-title font-semibold text-navy">
              Cara kerja My Money dalam 3 langkah sederhana.
            </h2>
            <p className="mt-3 text-lead text-muted-foreground">
              Dari autentikasi instan hingga pencatatan transaksi dan analisis grafik real-time.
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {/* Step 1: Login & CLI/Terminal Auth */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft font-brand text-lg font-bold text-primary">
                  01
                </div>
                <h3 className="font-brand text-2xl font-semibold text-navy">
                  1. Masuk & Autentikasi Instan
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Cukup masuk menggunakan akun Google. Sesi Anda dilindungi oleh arsitektur autentikasi Supabase dengan kebijakan akses per pengguna (RLS), memastikan data keuangan Anda tetap pribadi.
                </p>
                <ul className="space-y-2 pt-2 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-income-soft text-income">
                      <Check aria-hidden="true" className="size-3.5" />
                    </span>
                    Tanpa perlu mendaftar ulang password
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-income-soft text-income">
                      <Check aria-hidden="true" className="size-3.5" />
                    </span>
                    Enkripsi sesi standar industri
                  </li>
                </ul>
              </div>

              {/* Terminal Window Mockup */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-elevated">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500/80" />
                    <span className="size-3 rounded-full bg-yellow-500/80" />
                    <span className="size-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-xs text-slate-400">my-money-cli — bash</span>
                  <div className="size-4" />
                </div>
                <div className="p-5 font-mono text-xs leading-relaxed space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400">$</span>
                    <span>my-money auth login --provider google</span>
                  </div>
                  <div className="text-emerald-400">✔ Membuka browser untuk autentikasi Google...</div>
                  <div className="text-slate-300">✔ Token Google OAuth2 diterima</div>
                  <div className="text-blue-400">✔ Terhubung ke Supabase Auth (Session Active)</div>
                  <div className="rounded bg-slate-900 p-2.5 text-slate-300 border border-slate-800/80">
                    <span className="text-purple-400">STATUS:</span> Authenticated as <span className="text-amber-300">pengguna@gmail.com</span><br />
                    <span className="text-purple-400">POLICY:</span> Row Level Security (RLS) Active
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

            {/* Step 3: Fast Transaction Recording & Terminal Analytics Stream */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft font-brand text-lg font-bold text-primary">
                  03
                </div>
                <h3 className="font-brand text-2xl font-semibold text-navy">
                  3. Catat Transaksi & Lihat Grafik Realtime
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tambahkan transaksi pengeluaran atau pemasukan hanya dalam beberapa detik. Seluruh laporan, tren bulanan, dan perbandingan arus kas langsung ter-update secara otomatis.
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

              {/* Live Transaction Stream Terminal */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-elevated">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500/80" />
                    <span className="size-3 rounded-full bg-yellow-500/80" />
                    <span className="size-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono text-xs text-slate-400">transaction-stream.log</span>
                  <div className="size-4" />
                </div>
                <div className="p-5 font-mono text-xs leading-relaxed space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400">$</span>
                    <span>my-money tx add --type expense --amount 45000 --cat "Kopi & Makan"</span>
                  </div>
                  <div className="text-emerald-400">✔ Transaksi berhasil disimpan ke PostgreSQL</div>
                  <div className="text-blue-400">ℹ [EVENT] Arus Kas Realtime diperbarui</div>
                  <div className="rounded border border-emerald-500/30 bg-emerald-950/40 p-3 text-emerald-300 space-y-1">
                    <div className="font-bold">+ RECENT TRANSACTION</div>
                    <div>Jenis: Pengeluaran | Kategori: Makanan & Minuman</div>
                    <div>Jumlah: Rp 45.000 | Akun: GoPay</div>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-amber-400">⚡ SUMMARY:</span> Pemasukan Rp 8.500.000 | Pengeluaran Rp 3.245.000 | Arus Kas Net +Rp 5.255.000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface"><div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-app-gutter py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><LogoLink size="sm" /><p>© {new Date().getFullYear()} {brandConfig.name}. {brandConfig.copyrightNotice}</p></div></footer>
    </div>
  );
}
