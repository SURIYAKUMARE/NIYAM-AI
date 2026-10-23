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
        navy: {
          950: "#07121E",
          900: "#0A192F",
          850: "#0F2537",
          800: "#1E3A8A",
          700: "#1D4ED8",
          600: "#2563EB",
          100: "#DBEAFE",
          50: "#EFF6FF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
