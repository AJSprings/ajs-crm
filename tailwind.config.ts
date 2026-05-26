import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          500: "#3b6bff",
          600: "#2952e6",
          700: "#1f3fb8",
        },
      },
    },
  },
  plugins: [],
};
export default config;
