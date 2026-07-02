/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./about.html",
    "./blog.html",
    "./work/syndeo.html",
    "./work/wordcut.html",
    "./components/**/*.html",
    "./demos/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      keyframes: {
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring-scale": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "100%": { transform: "scale(1.55)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "morph-blob": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        "draw-line": {
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        "float-gentle": "float-gentle 3.2s ease-in-out infinite",
        "pulse-ring-scale": "pulse-ring-scale 2.1s ease-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "morph-blob": "morph-blob 8s ease-in-out infinite",
        "draw-line": "draw-line 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
}

