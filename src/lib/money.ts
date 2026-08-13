/**
 * A decimal money value as it crosses the application/database boundary.
 *
 * Prefer strings. Numbers are accepted for interoperability with PostgREST,
 * but are converted from their decimal representation before any arithmetic.
 */
export type MoneyValue = string | number;

/** An exact amount expressed in the currency's minor unit (for IDR: cents). */
export type MoneyCents = bigint;

const MONEY_PATTERN = /^([+-]?)(?:(\d+)(?:[.,](\d{0,2}))?|[.,](\d{1,2}))$/;
const MAX_STORED_MONEY_CENTS = 99_999_999_999_999n;

function expandExponential(value: string): string {
  const match = /^([+-]?)(\d+)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(value);

  if (!match) {
    return value;
  }

  const [, sign, whole, fraction = "", exponentText] = match;
  const exponent = Number(exponentText);
  const digits = `${whole}${fraction}`;
  const decimalIndex = whole.length + exponent;

  if (decimalIndex <= 0) {
    return `${sign}0.${"0".repeat(-decimalIndex)}${digits}`;
  }

  if (decimalIndex >= digits.length) {
    return `${sign}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  }

  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

function inputToDecimal(value: MoneyValue): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!Number.isFinite(value)) {
    throw new TypeError("Money must be a finite decimal value.");
  }

  return expandExponential(Object.is(value, -0) ? "0" : value.toString());
}

/** Convert a decimal amount to exact bigint minor units without float math. */
export function moneyToCents(value: MoneyValue): MoneyCents {
  const input = inputToDecimal(value);
  const match = MONEY_PATTERN.exec(input);

  if (!match) {
    throw new TypeError(
      "Money must be a plain decimal with no grouping and at most two decimal places.",
    );
  }

  const [, sign, wholeFromMatch, fractionFromWhole, fractionWithoutWhole] = match;
  const whole = (wholeFromMatch ?? "0").replace(/^0+(?=\d)/, "");
  const fraction = (fractionFromWhole ?? fractionWithoutWhole ?? "").padEnd(2, "0");
  const unsignedCents = BigInt(whole) * 100n + BigInt(fraction || "0");
  const cents = sign === "-" && unsignedCents !== 0n ? -unsignedCents : unsignedCents;

  return cents;
}

/** Convert exact bigint minor units to a canonical signed decimal string. */
export function centsToMoney(cents: MoneyCents): string {
  const isNegative = cents < 0n;
  const absolute = isNegative ? -cents : cents;
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, "0");

  return `${isNegative ? "-" : ""}${whole.toString()}.${fraction}`;
}

/** Normalize form/PostgREST input to the canonical database representation. */
export function normalizeMoneyInput(value: string): string {
  const cents = moneyToCents(value);
  if (cents > MAX_STORED_MONEY_CENTS || cents < -MAX_STORED_MONEY_CENTS) {
    throw new RangeError("Money exceeds the PostgreSQL numeric(14,2) range.");
  }
  return centsToMoney(cents);
}

/** Alias intended for controlled input values and mutation payloads. */
export function formatMoneyInput(value: MoneyValue): string {
  return normalizeMoneyInput(inputToDecimal(value));
}

/** Add decimal amounts exactly and return a canonical database string. */
export function addMoney(values: readonly MoneyValue[]): string {
  return centsToMoney(values.reduce<bigint>((total, value) => total + moneyToCents(value), 0n));
}

/** Subtract two decimal amounts exactly and return a canonical database string. */
export function subtractMoney(minuend: MoneyValue, subtrahend: MoneyValue): string {
  return centsToMoney(moneyToCents(minuend) - moneyToCents(subtrahend));
}

/**
 * Return a percentage rounded to two decimal places. The result is deliberately
 * not capped, so callers can distinguish warning and exceeded budget states.
 */
export function moneyPercentage(used: MoneyValue, limit: MoneyValue): number {
  const usedCents = moneyToCents(used);
  const limitCents = moneyToCents(limit);

  if (limitCents <= 0n) {
    throw new RangeError("Percentage limit must be greater than zero.");
  }

  const sign = usedCents < 0n ? -1n : 1n;
  const absoluteUsed = usedCents < 0n ? -usedCents : usedCents;
  const scaled = (absoluteUsed * 10_000n + limitCents / 2n) / limitCents;

  return Number(sign * scaled) / 100;
}

export function compareMoney(left: MoneyValue, right: MoneyValue): -1 | 0 | 1 {
  const leftCents = moneyToCents(left);
  const rightCents = moneyToCents(right);

  return leftCents < rightCents ? -1 : leftCents > rightCents ? 1 : 0;
}
