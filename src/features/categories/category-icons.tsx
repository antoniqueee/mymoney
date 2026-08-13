import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Car,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Plane,
  PiggyBank,
  ReceiptText,
  ShoppingBag,
  Tag,
  Utensils,
  WalletCards,
} from "lucide-react";

import type { CategoryIcon } from "@/lib/validations/category";

export const CATEGORY_ICON_OPTIONS: ReadonlyArray<{
  value: CategoryIcon;
  label: string;
}> = [
  { value: "tag", label: "Label" },
  { value: "wallet", label: "Dompet" },
  { value: "briefcase", label: "Pekerjaan" },
  { value: "utensils", label: "Makanan" },
  { value: "shopping-bag", label: "Belanja" },
  { value: "car", label: "Transportasi" },
  { value: "home", label: "Rumah" },
  { value: "heart-pulse", label: "Kesehatan" },
  { value: "graduation-cap", label: "Pendidikan" },
  { value: "gift", label: "Hadiah" },
  { value: "gamepad-2", label: "Hiburan" },
  { value: "receipt", label: "Tagihan" },
  { value: "plane", label: "Perjalanan" },
  { value: "piggy-bank", label: "Tabungan" },
];

const ICONS: Record<CategoryIcon, LucideIcon> = {
  tag: Tag,
  wallet: WalletCards,
  briefcase: BriefcaseBusiness,
  utensils: Utensils,
  "shopping-bag": ShoppingBag,
  car: Car,
  home: House,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  gift: Gift,
  "gamepad-2": Gamepad2,
  receipt: ReceiptText,
  plane: Plane,
  "piggy-bank": PiggyBank,
};

export function getCategoryIcon(icon: string): LucideIcon {
  return ICONS[icon as CategoryIcon] ?? Tag;
}

export function CategoryIconGlyph({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "wallet": return <WalletCards className={className} />;
    case "briefcase": return <BriefcaseBusiness className={className} />;
    case "utensils": return <Utensils className={className} />;
    case "shopping-bag": return <ShoppingBag className={className} />;
    case "car": return <Car className={className} />;
    case "home": return <House className={className} />;
    case "heart-pulse": return <HeartPulse className={className} />;
    case "graduation-cap": return <GraduationCap className={className} />;
    case "gift": return <Gift className={className} />;
    case "gamepad-2": return <Gamepad2 className={className} />;
    case "receipt": return <ReceiptText className={className} />;
    case "plane": return <Plane className={className} />;
    case "piggy-bank": return <PiggyBank className={className} />;
    default: return <Tag className={className} />;
  }
}
