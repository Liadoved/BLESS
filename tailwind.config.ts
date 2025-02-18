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
        primary: "#4285F4",
        secondary: "#34A853",
        accent: "#EA4335",
        background: "#F8FAFC",
      },
      fontFamily: {
        sans: ["Assistant", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
