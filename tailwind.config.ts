import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FFFFFF",
        paper: "#FFFFFF",
        ink: "#1F1A17",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
          soft: "rgb(var(--color-primary-soft) / <alpha-value>)",
        },
        info: {
          DEFAULT: "#344054",
          soft: "#EAECF0",
        },
        success: {
          DEFAULT: "#15803D",
          soft: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#A16207",
          soft: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#B91C1C",
          soft: "#FEE2E2",
        },
      },
      boxShadow: {
        card: "0 18px 60px -42px rgba(31, 26, 23, 0.55)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
