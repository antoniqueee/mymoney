import type { Config } from "tailwindcss";
import { designTokens } from "./src/config/theme";

const config = {

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/config/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: designTokens.breakpoints,
    extend: {
      fontFamily: {
        brand: [...designTokens.fonts.brand],
        madane: [...designTokens.fonts.brand],
        sans: [...designTokens.fonts.interface],
        mono: [...designTokens.fonts.mono],
      },
      fontSize: {
        display: [designTokens.typography.display[0], { ...designTokens.typography.display[1] }],
        "page-title": [designTokens.typography["page-title"][0], { ...designTokens.typography["page-title"][1] }],
        lead: [designTokens.typography.lead[0], { ...designTokens.typography.lead[1] }],
        body: [designTokens.typography.body[0], { ...designTokens.typography.body[1] }],
        label: [designTokens.typography.label[0], { ...designTokens.typography.label[1] }],
        caption: [designTokens.typography.caption[0], { ...designTokens.typography.caption[1] }],
      },
      colors: designTokens.colors,
      spacing: designTokens.spacing,
      borderRadius: designTokens.radii,
      boxShadow: designTokens.shadows,
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 500ms ease-out both",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
