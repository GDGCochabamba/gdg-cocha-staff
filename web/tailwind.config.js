/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gBlue: "#4285F4",
        gRed: "#EA4335",
        gYellow: "#FBBC04",
        gGreen: "#34A853",
      },
      fontFamily: {
        sans: ['"Google Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

