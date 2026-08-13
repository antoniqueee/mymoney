import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  LayoutDashboard,
  Landmark,
  PiggyBank,
  Settings,
  Tags,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  mobile?: boolean;
}

export const primaryNavigation: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, mobile: true },
  { label: "Transaksi", href: "/transactions", icon: ArrowLeftRight, mobile: true },
  { label: "Akun", href: "/accounts", icon: Landmark, mobile: true },
  { label: "Kategori", href: "/categories", icon: Tags },
  { label: "Anggaran", href: "/budgets", icon: PiggyBank, mobile: true },
  { label: "Laporan", href: "/reports", icon: ChartNoAxesCombined },
];

export const secondaryNavigation: readonly NavigationItem[] = [
  { label: "Pengaturan", href: "/settings", icon: Settings, mobile: true },
];

export const allNavigation = [...primaryNavigation, ...secondaryNavigation] as const;

export function isNavigationActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
