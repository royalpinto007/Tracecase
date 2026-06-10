import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0b",
        surface: "#141417",
        border: "#26262b",
        muted: "#8a8a93",
        text: "#e9e9ec",
        accent: "#5b9dff",
        good: "#3fb950",
        bad: "#f85149",
        warn: "#d29922",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
