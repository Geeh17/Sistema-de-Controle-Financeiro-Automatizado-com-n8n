import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        bg: "#0a0a0f",
        surface: "#12121a",
        border: "#1e1e2e",
        accent: "#00ff87",
        "accent-dim": "#00cc6a",
        muted: "#3a3a4a",
        subtle: "#6b6b80",
        text: "#e8e8f0",
        danger: "#ff4757",
      },
    },
  },
  plugins: [],
};

export default config;
