/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mutant: {
          dark: '#0A0A0A',
          card: '#141414',
          accent: '#22C55E', // Green for allowed
          danger: '#EF4444', // Red for denied
          text: '#EDEDED'
        }
      }
    },
  },
  plugins: [],
}
