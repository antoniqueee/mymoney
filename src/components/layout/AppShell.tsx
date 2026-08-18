import { DashboardFooter } from "./DashboardFooter";
import { MobileNav } from "./MobileNav";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import type { AppProfile } from "./types";

export function AppShell({ children, profile }: { children: React.ReactNode; profile: AppProfile }) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elevated transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Lewati ke konten utama
      </a>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar profile={profile} />
          <main id="main-content" className="mx-auto w-full max-w-[90rem] flex-1 px-app-gutter py-section pb-24 lg:pb-section">
            {children}
          </main>
          <DashboardFooter />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

