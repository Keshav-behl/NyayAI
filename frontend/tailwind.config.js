/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: { 500: '#FF6B00', 600: '#E05E00' },
        navy:    { 800: '#0D1B3E', 900: '#071028' },
        gold:    { 400: '#F5C842', 500: '#E6B800' },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}