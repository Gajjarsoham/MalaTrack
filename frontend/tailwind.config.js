/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        hindi: ["'Noto Sans Devanagari'", "sans-serif"],
      },
      colors: {
        saffron: {
          50: "#fff8ed",
          100: "#ffefd4",
          200: "#ffdba8",
          300: "#ffc071",
          400: "#ff9e38",
          500: "#ff7d10",
          600: "#f05e06",
          700: "#c74308",
          800: "#a0350e",
          900: "#812e0f",
        },
        maroon: {
          50: "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc5c5",
          300: "#ff9d9d",
          400: "#ff6464",
          500: "#f83b3b",
          600: "#e51c1c",
          700: "#c11414",
          800: "#8b0000",
          900: "#7a0808",
        },
        gold: {
          50: "#fffde7",
          100: "#fff9c4",
          200: "#fff176",
          300: "#ffee58",
          400: "#ffca28",
          500: "#ffa000",
          600: "#fb8c00",
          700: "#e65100",
          800: "#bf360c",
          900: "#4e342e",
        },
        cream: "#fdf8f0",
      },
      backgroundImage: {
        "saffron-gradient": "linear-gradient(135deg, #ff7d10 0%, #ffa000 50%, #c74308 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(253,248,240,0.95) 100%)",
      },
      boxShadow: {
        "saffron": "0 4px 24px rgba(255,125,16,0.25)",
        "card": "0 2px 20px rgba(139,0,0,0.08), 0 0 0 1px rgba(255,125,16,0.1)",
      },
    },
  },
  plugins: [],
};
