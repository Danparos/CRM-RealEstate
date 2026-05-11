import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gold palette — primary brand accent
        gold: {
          50:  "#FDF8E7",
          100: "#FAF0C0",
          200: "#F5E07A",
          300: "#EFD040",
          400: "#E8C20A",
          500: "#B8960C",  // Primary gold
          600: "#9A7D0A",
          700: "#7D6408",
          800: "#5F4B06",
          900: "#423304",
          950: "#261D02",
        },
        // Bronze palette — secondary accent
        bronze: {
          50:  "#FDF4EB",
          100: "#FAE6CC",
          200: "#F5CC99",
          300: "#EFB366",
          400: "#E09A42",
          500: "#CD853F",  // Primary bronze
          600: "#A86D33",
          700: "#845527",
          800: "#603D1C",
          900: "#3D2610",
        },
        // Warm neutrals — backgrounds & borders
        warm: {
          50:  "#FAFAF8",
          100: "#F5F4F0",
          200: "#EDE9E2",
          300: "#E0DBCF",
          400: "#CFC8B8",
          500: "#B8AFA0",
          600: "#9A9083",
          700: "#7A7268",
          800: "#5C554E",
          900: "#3D3832",
        },
        // Semantic
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card:        { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary:     { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border:  "hsl(var(--border))",
        input:   "hsl(var(--input))",
        ring:    "hsl(var(--ring))",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        sans:  ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      boxShadow: {
        "luxury":    "0 2px 16px rgba(184,150,12,0.08), 0 1px 4px rgba(0,0,0,0.06)",
        "luxury-md": "0 4px 24px rgba(184,150,12,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        "luxury-lg": "0 8px 40px rgba(184,150,12,0.16), 0 4px 16px rgba(0,0,0,0.10)",
        "card":      "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover":"0 4px 16px rgba(184,150,12,0.10), 0 8px 32px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in":    "fadeIn 0.2s ease-out",
        "slide-in":   "slideIn 0.2s ease-out",
        "shimmer":    "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideIn: { from: { opacity: "0", transform: "translateX(-8px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
export default config;
