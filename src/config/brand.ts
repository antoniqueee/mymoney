export const brandConfig = {
  name: "My Money",
  shortName: "My Money",
  description: "Catat, pahami, dan arahkan keuangan pribadi dengan tenang.",
  copyrightNotice: "All rights reserved.",
  locale: "id-ID",
  timeZone: "Asia/Bangkok",
  defaultCurrency: "IDR",
  logo: {
    source: "/icons/my-money-logo-mark.svg",
    alt: "Logo My Money",
  },
  links: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
  },
} as const;

export type BrandConfig = typeof brandConfig;
