import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ledger: {
          DEFAULT: "#00C4CC",
          deep: "#7D2AE7",
        },
        paper: "#F7F7FB",
        paperline: "#E5E7EB",
        ink: "#0E1318",
        stamp: "#FE6F61",
        gold: "#2A89DA",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
