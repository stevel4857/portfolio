/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./about.html",
    "./blog.html",
    "./work/syndeo.html",
    "./components/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}

