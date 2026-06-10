import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08080a",
        surface: "#111114",
        "surface-2": "#17171c",
        border: "#26262e",
        "border-soft": "#1d1d23",
        muted: "#8b8b96",
        text: "#ededf2",
        accent: "#6e8bff",
        "accent-2": "#36d6c3",
        good: "#3fb950",
        bad: "#f85149",
        warn: "#e3a008",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(110,139,255,0.25), 0 8px 30px -8px rgba(110,139,255,0.35)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(110,139,255,0.12), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
