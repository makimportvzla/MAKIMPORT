import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0F172A",
          darker: "#090D16",
          navy: "#1E293B",
          card: "#162032",
          orange: "#EA580C",
          "orange-hover": "#C2410C",
          amber: "#F59E0B",
          gold: "#D97706",
          accent: "#38BDF8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
