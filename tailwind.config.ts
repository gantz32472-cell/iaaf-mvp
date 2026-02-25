import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f7f6",
          100: "#d5e5e0",
          200: "#afccc2",
          500: "#2f7c6d",
          700: "#1f574d",
          900: "#12322c"
        }
      }
    }
  },
  plugins: []
};

export default config;
