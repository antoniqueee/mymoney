import { Download, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { signOut } from "@/features/auth/actions";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { getSettingsProfile } from "@/features/settings/queries";
import type { ProfilePreferencesValues } from "@/features/settings/schema";

export default async function SettingsPage() {
  const { profile, error } = await getSettingsProfile();
  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Preferensi" title="Pengaturan" description="Kelola profil dan privasi aplikasi." />
        <Alert variant="destructive">{error}</Alert>
      </div>
    );
  }
  const fallback = (profile.full_name || profile.email || "MM").split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  const initialValues: ProfilePreferencesValues = { full_name: profile.full_name || profile.email, currency_code: profile.currency_code };
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preferensi" title="Pengaturan" description="Kelola profil Google, tampilan, ekspor, dan privasi data Anda." />
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Profil & tampilan</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center gap-4 rounded-xl bg-muted/60 p-4">
              <Avatar className="h-14 w-14">
                {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="Avatar profil Google" referrerPolicy="no-referrer" /> : null}
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{profile.full_name || "Profil Google"}</p>
                <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-income" aria-hidden="true" />Terhubung melalui Google
                </p>
              </div>
            </div>
            <ProfileForm initialValues={initialValues} />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Ekspor data</CardTitle><p className="text-sm text-muted-foreground">Unduh salinan data pribadi kapan saja.</p></CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-start"><a href="/api/export?format=csv"><Download aria-hidden="true" />Ekspor transaksi CSV</a></Button>
              <Button asChild variant="outline" className="justify-start"><a href="/api/export?format=json"><Download aria-hidden="true" />Unduh backup JSON</a></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Privasi & sesi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold">Kedaulatan & Penghapusan Akun</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Anda memiliki hak penuh atas data keuangan Anda. Pastikan Anda telah mengunduh cadangan transaksi (CSV / JSON) sebelum mengajukan penutupan akun. Seluruh catatan transaksi, riwayat dompet, dan profil akan dihapus secara menyeluruh dan permanen dari server.
                    </p>
                  </div>
                </div>
              </div>
              <form action={signOut}><Button type="submit" variant="destructive" className="w-full"><LogOut aria-hidden="true" />Keluar dari My Money</Button></form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
