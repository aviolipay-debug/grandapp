import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ledger: {
          DEFAULT: "#0F3D2E",
          deep: "#0A2E22",
        },
        paper: "#F3ECDC",
        paperline: "#D8CBAA",
        ink: "#17140D",
        stamp: "#B23A2E",
        gold: "#C9A227",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
