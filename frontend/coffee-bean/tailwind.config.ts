import type { Config } from "tailwindcss";
import forms from '@tailwindcss/forms';

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: {
          bg: '#121212',
          surface: '#1D1D1F',
          border: '#2D2D2F',
        },
      },
    },
  },
  plugins: [forms],
};

export default config;
