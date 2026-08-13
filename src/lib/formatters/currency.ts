import { moneyToCents, type MoneyValue } from "@/lib/money";
import { brandConfig } from "@/config/brand";

export function formatCurrency(
  amount: MoneyValue | bigint,
  currency: string = brandConfig.defaultCurrency,
  locale: string = brandConfig.locale,
): string {
  const cents = typeof amount === "bigint" ? amount : moneyToCents(amount);
  const negative = cents < 0n;
  const absolute = negative ? -cents : cents;
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits;
  const roundedMinorUnit = fractionDigits === 0 ? (absolute + 50n) / 100n : absolute / 100n;
  const groupedWhole = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(roundedMinorUnit);
  const fraction = String(absolute % 100n).padStart(2, "0").slice(0, fractionDigits);
  const parts = formatter.formatToParts(negative ? -1 : 0);

  return parts
    .map((part) => {
      if (part.type === "integer") return groupedWhole;
      if (part.type === "fraction") return fraction;
      return part.value;
    })
    .join("");
}
