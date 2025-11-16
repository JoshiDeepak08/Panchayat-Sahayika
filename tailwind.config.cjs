/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        softBeige: "#FFF9F0",
        cardBeige: "#FDF3E2",
        cardBorder: "#F4E0BD",
        textMain: "#14532D",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Devanagari", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 12px rgba(22, 101, 52, 0.08)",
      },
    },
  },
  plugins: [],
};
