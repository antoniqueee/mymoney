const defaultAuthenticatedPath = "/dashboard";

export function getSafeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return defaultAuthenticatedPath;
  }

  try {
    const parsed = new URL(value, "https://my-money.local");
    if (parsed.origin !== "https://my-money.local") return defaultAuthenticatedPath;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return defaultAuthenticatedPath;
  }
}

export function getApplicationOrigin(fallbackOrigin: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredOrigin) return fallbackOrigin;

  try {
    const parsed = new URL(configuredOrigin);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.origin
      : fallbackOrigin;
  } catch {
    return fallbackOrigin;
  }
}

export { defaultAuthenticatedPath };
