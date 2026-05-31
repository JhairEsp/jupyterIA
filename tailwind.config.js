// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        jupyterBg: "#05050A",
        jupyterGlowBlue: "#0EA5E9",
        jupyterGlowPurple: "#8B5CF6",
        jupyterText: "#E2E8F0",
      },
    },
  },
  plugins: [],
}
