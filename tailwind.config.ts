import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep charcoal / near-black — primary dark surface & text
        ink: {
          50: "#F5F4F2",
          100: "#E6E3DE",
          200: "#C7C1B6",
          300: "#9C9284",
          400: "#6E6558",
          500: "#4C453B",
          600: "#3A342C",
          700: "#2B261F",
          800: "#1E1A15",
          900: "#17130F",
          950: "#0F0C09",
        },
        // Warm cream / off-white — primary light surface
        cream: {
          50: "#FFFDF9",
          100: "#FBF7EC",
          200: "#F4ECD8",
          300: "#EBDFC0",
          400: "#DCCBA0",
        },
        // Rich amber / burnt-orange accent
        ember: {
          50: "#FDF3E9",
          100: "#FBE3C8",
          200: "#F3C48A",
          300: "#E8A455",
          400: "#DC8A2F",
          500: "#C2700E",
          600: "#A25B0A",
          700: "#7E4708",
          800: "#5B3306",
          900: "#3E2304",
        },
        success: {
          50: "#EAF6EF",
          500: "#2E7D53",
          600: "#256242",
        },
        error: {
          50: "#FBEAE8",
          500: "#C0392B",
          600: "#9E2E22",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 2px 10px -2px rgba(23, 19, 15, 0.08), 0 1px 2px -1px rgba(23, 19, 15, 0.06)",
        lift: "0 12px 32px -8px rgba(23, 19, 15, 0.18)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
