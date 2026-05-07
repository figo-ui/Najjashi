/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#022c22',
          900: '#064e3b',
          800: '#065f46',
          700: '#047857',
          600: '#059669',
          500: '#10b981',
          300: '#6ee7b7',
          100: '#d1fae5',
        },
        amber: {
          400: '#fbbf24',
        },
      },
      fontFamily: {
        arabic: ['System'],
      },
    },
  },
  plugins: [],
};
