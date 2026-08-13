import type { LucideIcon } from "lucide-react";
import { Building2, CircleEllipsis, Smartphone, Wallet } from "lucide-react";

import type { AccountType } from "@/lib/validations/account";

export const ACCOUNT_TYPE_CONFIG: Record<
  AccountType,
  { label: string; description: string; icon: LucideIcon }
> = {
  cash: {
    label: "Tunai",
    description: "Uang tunai yang Anda pegang",
    icon: Wallet,
  },
  bank: {
    label: "Rekening bank",
    description: "Saldo rekening tanpa menyimpan kredensial bank",
    icon: Building2,
  },
  ewallet: {
    label: "Dompet digital",
    description: "Saldo e-wallet yang dicatat manual",
    icon: Smartphone,
  },
  other: {
    label: "Lainnya",
    description: "Akun pribadi lain yang ingin Anda pantau",
    icon: CircleEllipsis,
  },
};
