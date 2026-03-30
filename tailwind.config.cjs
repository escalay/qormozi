/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './App.tsx', './index.tsx', './components/**/*.{ts,tsx}', './utils/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Courier Prime', 'monospace'],
        mono: ['Courier Prime', 'monospace'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        paper: '#F2F0E9',
        ink: '#1A1A1A',
        gold: '#C5A059',
        accent: '#2C3E50',
      },
    },
  },
  plugins: [],
};
