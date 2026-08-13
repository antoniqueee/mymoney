import { brandConfig } from "@/config/brand";

function asDate(value: string | Date) {
  if (value instanceof Date) return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(value);
}

export function getCalendarMonth(
  date = new Date(),
  timeZone = brandConfig.timeZone,
): string {
  const parts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    timeZone,
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) throw new Error("Bulan kalender tidak dapat ditentukan.");
  return `${year}-${month}`;
}

export function getMonthRange(month = getCalendarMonth()) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error("Format bulan harus YYYY-MM.");
  }
  const [year, monthNumber] = month.split("-").map(Number);
  const end = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
  return { value: month, start: `${month}-01`, end };
}

export function formatDate(dateValue: string | Date, locale = brandConfig.locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? "UTC" : undefined,
  }).format(asDate(dateValue));
}

export function formatShortDate(dateValue: string | Date, locale = brandConfig.locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? "UTC" : undefined,
  }).format(asDate(dateValue));
}
