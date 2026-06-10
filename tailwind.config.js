/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Ocean depth palette — semantic tokens
        surface: {
          50: "#E6F4FF",
          100: "#BAE0FF",
          200: "#7CC4FA",
          300: "#47A3F3",
          400: "#2186EB",
          500: "#0967D2"
        },
        abyss: {
          50: "#0B2545",
          100: "#0A1E3F",
          200: "#081838",
          300: "#061330",
          400: "#040E27",
          500: "#02081C",
          600: "#010512",
          700: "#000308"
        },
        bio: {
          // Glow accents
          cyan: "#22E4FF",
          aqua: "#5FF7E0",
          jade: "#7CFFC2",
          violet: "#A78BFA",
          coral: "#FF7E9D",
          amber: "#FFB86B"
        },
        glass: {
          white: "rgba(255,255,255,0.06)",
          edge: "rgba(255,255,255,0.14)"
        }
      },
      fontFamily: {
        display: ["Sora_700Bold"],
        body: ["Inter_400Regular"],
        mono: ["JetBrainsMono_400Regular"]
      },
      borderRadius: {
        "4xl": "28px",
        "5xl": "36px"
      }
    }
  },
  plugins: []
};
