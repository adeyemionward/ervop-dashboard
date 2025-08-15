import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        primary: {
          '50': '#f6effe',
          '100': '#ecdcfc',
          '200': '#dbb9fa',
          '300': '#c996f8',
          '400': '#b873f6',
          '500': '#a650f4',
          '600': '#8430ce', // <-- The '600' shade
          '700': '#6b26a6',
          '800': '#521d80',
          '900': '#3f1763',
          '950': '#2c1045',
        },
      },
    },
  },
  plugins: [],
};
export default config;