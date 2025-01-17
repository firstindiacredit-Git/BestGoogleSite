/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      transitionProperty: {
        theme: "background-color, border-color, color, fill, stroke",
      },
      transitionDuration: {
        200: "200ms",
      },
      transitionTimingFunction: {
        theme: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
