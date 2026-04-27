/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#171715',
          800: '#111110',
          900: '#0a0a0a',
        },
        gold: {
          400: '#c9a96b',
          500: '#8a7548',
        },
        saffron: {
          500: '#c9a96b',
          600: '#8a7548',
        },
        rule: '#26231d',
        ink: {
          DEFAULT: '#f5f1e8',
          2: '#d8d2c2',
          3: '#8a8478',
          4: '#5a5448',
        },
      },
      fontFamily: {
        heading: ['"Instrument Serif"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}