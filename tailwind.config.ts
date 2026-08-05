import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    // ---- 上書き（extend ではない）----
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    boxShadow: {
      none: "none",
      sm: "2px 2px 0 0 var(--fc-shadow)",
      DEFAULT: "4px 4px 0 0 var(--fc-shadow)",
      md: "4px 4px 0 0 var(--fc-shadow)",
      lg: "6px 6px 0 0 var(--fc-shadow)",
    },
    fontSize: {
      xs: ["12px", "16px"],
      sm: ["14px", "20px"],
      base: ["16px", "24px"],
      lg: ["20px", "28px"],
      xl: ["24px", "32px"],
      "2xl": ["32px", "40px"],
    },
    extend: {
      colors: {
        fc: {
          ink: "var(--fc-ink)",
          paper: "#FCFCFC",
          gray: "#BCBCBC",
          graydk: "#7C7C7C",
          blue: "#3CBCFC",
          bluedk: "#0058F8",
          red: "#F83800",
          yellow: "#F8B800",
          green: "#00A800",
          purple: "#6844FC",
        },
      },
      borderWidth: {
        DEFAULT: "2px",
        4: "4px",
      },
      fontFamily: {
        sans: [
          "var(--font-dot)",
          "ui-sans-serif",
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic UI"',
          "Meiryo",
          "sans-serif",
        ],
      },
      keyframes: {
        "fc-pulse": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
      },
      animation: {
        pulse: "fc-pulse 800ms steps(2, end) infinite",
      },
      transitionTimingFunction: {
        DEFAULT: "steps(2, end)",
      },
      transitionDuration: {
        DEFAULT: "100ms",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};

export default config;
