import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          porcelain: "#FFF8FD",
          pearl: "#F8EEFF",
          champagne: "#FFD66B",
          blush: "#FF8AC2",
          plum: "#7C2D92",
          aubergine: "#24102E",
          sage: "#24B7A4",
          clay: "#FF8A5B",
          cream: "#FFF6DD",
          peach: "#FFB3D1",
          rose: "#FF4FA3",
          lila: "#EAD7FF",
          lavender: "#8F3FFC",
          ink: "#24102E",
        },
      },
      backgroundImage: {
        "grad-hero":
          "linear-gradient(135deg, #FFF8FD 0%, #F8EEFF 38%, #FFF6DD 70%, #FFE4F3 100%)",
        "grad-soft":
          "linear-gradient(135deg, rgba(255,248,253,.94) 0%, rgba(234,215,255,.52) 45%, rgba(255,214,107,.28) 100%)",
        "grad-glass":
          "linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,248,253,.58))",
        "grad-button":
          "linear-gradient(135deg, #24102E 0%, #7C2D92 44%, #FF4FA3 76%, #FFD66B 118%)",
        "grad-accent":
          "linear-gradient(135deg, rgba(143,63,252,.16), rgba(255,79,163,.14), rgba(255,214,107,.18))",
      },
      boxShadow: {
        soft: "0 18px 48px -28px rgba(124,45,146,.36)",
        pop: "0 28px 78px -34px rgba(255,79,163,.5)",
        glass: "0 22px 70px -36px rgba(124,45,146,.42)",
        inset: "inset 0 1px 0 rgba(255,255,255,.72)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 6px)",
        sm: "calc(var(--radius) - 10px)",
        xl: "calc(var(--radius) + 6px)",
        "2xl": "calc(var(--radius) + 12px)",
      },
      opacity: {
        35: "0.35",
        45: "0.45",
        55: "0.55",
        58: "0.58",
        65: "0.65",
        68: "0.68",
        72: "0.72",
        82: "0.82",
        85: "0.85",
        88: "0.88",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2.4s linear infinite",
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backdropBlur: {
        xs: "4px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
