import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Luxury Emerald & Gold theme
        primary: {
          DEFAULT: "#0B3B2E", // Main Emerald
          foreground: "#F8F7F3", // Gallery Ivory
        },
        secondary: {
          DEFAULT: "#07241D", // Deep Accent (Hero Dark Green)
          foreground: "#F8F7F3",
        },
        accent: {
          DEFAULT: "#D4B06A", // Champagne Gold
          foreground: "#0B3B2E",
        },
        base: {
          DEFAULT: "#F8F7F3", // Gallery Ivory background
          foreground: "#1A1A1A", // Premium Dark Text
        },

        // Back-compat aliases used across the app
        gold: "#D4B06A",
        beige: "#F8F7F3",
        "dark-gray": "#1A1A1A",

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
        serif: ["var(--font-nunito)", "sans-serif"],
        brand: ["'Times New Roman'", "Times", "serif"],
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-gold": {
          '0%, 100%': { boxShadow: "0 0 0 0 rgba(212, 176, 106, 0.55)" },
          '50%': { boxShadow: "0 0 0 10px rgba(212, 176, 106, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-in",
        "slide-up": "slide-up 0.6s ease-out",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
      },
      backgroundImage: {
        gradient: "linear-gradient(135deg, #07241D 0%, #0B3B2E 100%)",
        "gradient-gold": "linear-gradient(135deg, #D4B06A 0%, #E6C78B 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
