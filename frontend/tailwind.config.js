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
          black: '#000000',
          dark: '#121212',
          neon: '#00ff00',
          danger: '#ff4444',
          text: '#ffffff',
          gray: '#888888'
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
