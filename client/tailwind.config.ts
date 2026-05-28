import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        muted: "#687586",
        paper: "#F5F1E8",
        porcelain: "#F9FAF7",
        brand: "#2D6A4F",
        "brand-dark": "#1b4332",
        saffron: "#F2A93B",
        coral: "#E76F51",
        ocean: "#277DA1",
        sidebar: "#1a1a2e"
      },
      boxShadow: {
        soft: "0 4px 16px rgba(23, 32, 42, 0.08)",
        glow: "0 0 24px rgba(242, 169, 59, 0.2)",
        card: "0 1px 3px rgba(23, 32, 42, 0.06), 0 4px 16px rgba(23, 32, 42, 0.04)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"]
      },
      borderRadius: {
        "2xl": "14px",
        "3xl": "20px"
      },
      animation: {
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite"
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" }
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" }
        }
      }
    }
  },
  plugins: []
};

export default config;
