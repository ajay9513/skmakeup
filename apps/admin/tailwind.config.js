/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A962',
          light: '#E2C88A',
          dark: '#A68B4B',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          light: '#2A2A2A',
          dark: '#0F0F0F',
        },
        ivory: {
          DEFAULT: '#FAF8F5',
          dark: '#F0EBE3',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 4px 24px rgba(0, 0, 0, 0.08)',
        gold: '0 4px 20px rgba(201, 169, 98, 0.15)',
      },
    },
  },
  plugins: [],
};
