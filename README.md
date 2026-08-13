# My Money

My Money adalah aplikasi keuangan pribadi satu pengguna untuk mencatat transaksi, menghitung saldo akun, mengelola kategori dan anggaran, melihat laporan, serta mengekspor backup data.

## Stack

- Next.js 16 App Router, React 19, dan TypeScript strict
- Supabase Auth (Google OAuth), PostgreSQL, Storage, dan Row Level Security
- Tailwind CSS, komponen bergaya shadcn/ui, Lucide, dan Recharts
- React Hook Form dan Zod
- Target deployment: Vercel

## Menjalankan secara lokal

1. Instal dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env.local`, lalu isi konfigurasi aplikasi:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   Kode juga menerima nama lama `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Service-role key tidak diperlukan oleh aplikasi dan tidak boleh diekspos ke browser.

   Jika memakai Supabase lokal, letakkan `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` dan `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` dalam file `.env` yang diabaikan Git. `supabase/config.toml` membacanya tanpa mengekspos secret ke aplikasi Next.js.

3. Terapkan migration secara berurutan melalui Supabase CLI atau SQL editor:

   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/20260813000100_complete_finance_foundation.sql`

   Migration kedua meningkatkan skema lama tanpa menghapus data, mengaktifkan RLS, membuat agregat keuangan, kategori/akun awal, dan bucket lampiran privat.

4. Aktifkan provider Google di Supabase Auth. Tambahkan callback aplikasi ke Redirect URLs Supabase:

   - Lokal: `http://localhost:3000/auth/callback`
   - Produksi: `https://your-domain.vercel.app/auth/callback`

   Pada Google Cloud, Authorized redirect URI harus menunjuk ke Auth callback milik Supabase, bukan route aplikasi:

   - Hosted: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Supabase lokal: `http://127.0.0.1:54321/auth/v1/callback`

5. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

## Deployment Vercel

Hubungkan repository ke Vercel, tambahkan environment variables yang sama untuk Production/Preview, ubah `NEXT_PUBLIC_APP_URL` ke domain produksi, lalu tambahkan domain tersebut ke daftar redirect Supabase Auth. Migration database dijalankan terpisah sebelum aplikasi produksi digunakan.

## Struktur utama

```text
src/app/                 routes, layouts, loading/error boundaries, handlers
src/features/            query, Server Action, schema, dan UI per domain
src/components/          UI, branding, dan responsive application shell
src/lib/                 Supabase clients, money math, formatter, utilities
src/types/               tipe database dan domain
supabase/migrations/     skema PostgreSQL, RLS, trigger, aggregate RPC
docs/                    spesifikasi produk, arsitektur, keamanan, dan UI
```

Dokumentasi detail tersedia di [`docs/README.md`](docs/README.md).
