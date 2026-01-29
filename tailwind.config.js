/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ THIS enables dark mode via class

  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./public/index.html"
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },

        dark: {
          100: "#1e293b",
          200: "#334155",
          300: "#475569",
        },
      },
    },
  },

  plugins: [],
};
