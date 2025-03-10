/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mainbg: "#513a7a",
        secondbg: "#28283a",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        body: ["Poppins", "sans-serif"],
      },
      transitionProperty: {
        theme: "background-color, border-color, color, fill, stroke",
      },
      transitionDuration: {
        200: "200ms",
      },
      transitionTimingFunction: {
        theme: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      animation: {
        blob: "blob 7s infinite",
        "fade-in": "fade-in 0.5s linear forwards",
        spotlight: "spotlight 2s ease .75s 1 forwards",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        "fade-in": {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
      },
      backgroundImage: {
        "grid-gray-900":
          "linear-gradient(to right, rgb(17 24 39 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(17 24 39 / 0.1) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
