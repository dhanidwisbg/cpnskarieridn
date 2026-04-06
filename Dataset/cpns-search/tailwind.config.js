/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        azure: {
          light: '#3399FF',
          DEFAULT: '#007FFF',
          dark: '#0066CC',
        }
      }
    },
  },
  plugins: [],
}
