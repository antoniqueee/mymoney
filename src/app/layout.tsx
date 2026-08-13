import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { brandConfig } from "@/config/brand";
import { getApplicationOrigin } from "@/features/auth/redirects";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getApplicationOrigin("https://money.antonique.web.id")),
  title: {
    default: `${brandConfig.name} — Keuangan pribadi, lebih jernih`,
    template: `%s | ${brandConfig.name}`,
  },
  description: brandConfig.description,
  applicationName: brandConfig.name,
  icons: [{ rel: "icon", url: brandConfig.logo.source }],
  openGraph: {
    title: brandConfig.name,
    description: brandConfig.description,
    type: "website",
    locale: "id_ID",
    images: [{ url: brandConfig.logo.source, alt: brandConfig.logo.alt }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F8FAFC",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
