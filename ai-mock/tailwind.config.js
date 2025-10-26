/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all your React files
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        'primary-hover': '#4F46E5',
        secondary: '#10B981',
        background: '#0F172A',
        surface: {
          DEFAULT: '#1E293B',
          light: '#F8FAFC',
          dark: '#0F172A'
        },
        text: {
          main: '#F8FAFC',
          muted: '#94A3B8'
        }
      },
      backgroundColor: theme => ({
        ...theme('colors'),
        surface: theme('colors.surface.DEFAULT')
      }),
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}