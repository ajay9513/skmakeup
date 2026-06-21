/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8D5A3',
          dark: '#A68B4B',
        },
        rosegold: {
          DEFAULT: '#B76E79',
          light: '#D4A0A8',
        },
        champagne: {
          DEFAULT: '#F7E7CE',
          dark: '#EDE0C8',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          light: '#2A2A2A',
          dark: '#111111',
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
        gold: '0 4px 20px rgba(212, 175, 55, 0.35)',
        editorial: '0 20px 60px rgba(0, 0, 0, 0.12)',
      },
      letterSpacing: {
        luxury: '0.2em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
