/**
 * Central design-system contract for My Money.
 *
 * Theme-specific color values live as CSS variables in `globals.css`; every
 * component consumes the semantic names below instead of palette literals.
 */
export const designTokens = {
  rawColors: {
    primary: "#2563EB",
    lightBackground: "#F8FAFC",
  },
  colors: {
    border: "hsl(var(--border) / <alpha-value>)",
    input: "hsl(var(--input) / <alpha-value>)",
    ring: "hsl(var(--ring) / <alpha-value>)",
    background: "hsl(var(--background) / <alpha-value>)",
    foreground: "hsl(var(--foreground) / <alpha-value>)",
    surface: "hsl(var(--surface) / <alpha-value>)",
    navy: "hsl(var(--navy) / <alpha-value>)",
    inverse: {
      DEFAULT: "hsl(var(--inverse-foreground) / <alpha-value>)",
      muted: "hsl(var(--inverse-muted) / <alpha-value>)",
    },
    primary: {
      DEFAULT: "hsl(var(--primary) / <alpha-value>)",
      hover: "hsl(var(--primary-hover) / <alpha-value>)",
      foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
      soft: "hsl(var(--primary-soft) / <alpha-value>)",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
      foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
      foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
      soft: "hsl(var(--destructive-soft) / <alpha-value>)",
    },
    muted: {
      DEFAULT: "hsl(var(--muted) / <alpha-value>)",
      foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
    },
    accent: {
      DEFAULT: "hsl(var(--accent) / <alpha-value>)",
      foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
    },
    popover: {
      DEFAULT: "hsl(var(--popover) / <alpha-value>)",
      foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
    },
    card: {
      DEFAULT: "hsl(var(--card) / <alpha-value>)",
      foreground: "hsl(var(--card-foreground) / <alpha-value>)",
    },
    income: {
      DEFAULT: "hsl(var(--income) / <alpha-value>)",
      text: "hsl(var(--income-text) / <alpha-value>)",
      foreground: "hsl(var(--income-foreground) / <alpha-value>)",
      soft: "hsl(var(--income-soft) / <alpha-value>)",
    },
    expense: {
      DEFAULT: "hsl(var(--expense) / <alpha-value>)",
      foreground: "hsl(var(--expense-foreground) / <alpha-value>)",
      soft: "hsl(var(--expense-soft) / <alpha-value>)",
    },
    warning: {
      DEFAULT: "hsl(var(--warning) / <alpha-value>)",
      foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
      soft: "hsl(var(--warning-soft) / <alpha-value>)",
    },
    chart: {
      1: "hsl(var(--chart-1) / <alpha-value>)",
      2: "hsl(var(--chart-2) / <alpha-value>)",
      3: "hsl(var(--chart-3) / <alpha-value>)",
      4: "hsl(var(--chart-4) / <alpha-value>)",
      5: "hsl(var(--chart-5) / <alpha-value>)",
    },
  },
  fonts: {
    brand: ["var(--font-brand)", "ui-sans-serif", "sans-serif"],
    interface: ["var(--font-interface)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
    mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"],
  },
  spacing: {
    "app-gutter": "var(--space-app-gutter)",
    section: "var(--space-section)",
    card: "var(--space-card)",
    control: "var(--space-control)",
  },
  radii: {
    xs: "var(--radius-xs)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    full: "9999px",
  },
  shadows: {
    xs: "var(--shadow-xs)",
    card: "var(--shadow-card)",
    elevated: "var(--shadow-elevated)",
    focus: "var(--shadow-focus)",
  },
  breakpoints: {
    xs: "360px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1440px",
  },
  typography: {
    display: ["clamp(2.75rem, 7vw, 5.75rem)", { lineHeight: "0.98", letterSpacing: "-0.045em" }],
    "page-title": ["clamp(1.75rem, 4vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
    lead: ["1.125rem", { lineHeight: "1.75rem" }],
    body: ["0.9375rem", { lineHeight: "1.5rem" }],
    label: ["0.8125rem", { lineHeight: "1.125rem", letterSpacing: "0.01em" }],
    caption: ["0.75rem", { lineHeight: "1rem" }],
  },
} as const;

export const chartStyles = {
  grid: "hsl(var(--border))",
  axis: "hsl(var(--muted-foreground))",
  income: "hsl(var(--income))",
  expense: "hsl(var(--expense))",
  tooltip: {
    backgroundColor: "hsl(var(--popover))",
    borderColor: "hsl(var(--border))",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-card)",
    color: "hsl(var(--popover-foreground))",
  },
} as const;

export const componentStyles = {
  button: {
    base: "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variants: {
      default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:translate-y-px",
      destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
      outline: "border border-input bg-surface text-foreground shadow-xs hover:border-primary/30 hover:bg-primary-soft hover:text-primary",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/75",
      ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      success: "bg-income-text text-inverse shadow-xs hover:bg-income-text/90",
    },
    sizes: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-sm px-3 text-xs",
      lg: "h-12 rounded-lg px-6 text-base",
      icon: "size-10",
      "icon-sm": "size-9",
    },
  },
  card: "rounded-lg border border-border bg-card text-card-foreground shadow-card",
  control: "flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
  badge: {
    base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variants: {
      default: "border-transparent bg-primary text-primary-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      destructive: "border-transparent bg-destructive-soft text-destructive",
      outline: "border-border bg-surface text-foreground",
      success: "border-transparent bg-income-soft text-income-text",
      warning: "border-transparent bg-warning-soft text-warning-foreground",
      income: "border-transparent bg-income-soft text-income-text",
      expense: "border-transparent bg-expense-soft text-expense",
    },
  },
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
} as const;

