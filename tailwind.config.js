/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        canvas: "#F3F5F8",
        surface: "#FFFFFF",
        subtle: "#EDF1F5",
        line: "#D5DCE5",
        "line-strong": "#A7B3C1",
        ink: "#0F1F2E",
        body: "#324A61",
        muted: "#5F7387",
        primary: {
          DEFAULT: "#0E4C7E",
          hover: "#0A3A61",
          subtle: "#E6EEF6",
        },
        accent: {
          DEFAULT: "#0F6E62",
          hover: "#0B564C",
          subtle: "#E2F0EE",
        },
        success: {
          DEFAULT: "#15803D",
          subtle: "#E8F5EC",
        },
        danger: {
          DEFAULT: "#B42318",
          subtle: "#FCEBE9",
        },
        warning: {
          DEFAULT: "#A85B08",
          subtle: "#FBF1E4",
        },
      },
      fontSize: {
        meta: ["0.75rem", { lineHeight: "1.05rem" }],
        sm: ["0.8125rem", { lineHeight: "1.15rem" }],
        base: ["0.875rem", { lineHeight: "1.35rem" }],
        lg: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.1875rem", { lineHeight: "1.6rem" }],
        "2xl": ["1.5rem", { lineHeight: "1.9rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      borderRadius: {
        DEFAULT: "4px",
        md: "5px",
        lg: "7px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 31, 46, 0.06)",
        pop: "0 8px 24px rgba(15, 31, 46, 0.14)",
      },
      transitionTimingFunction: {
        exit: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [],
};
