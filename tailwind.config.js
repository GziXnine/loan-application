/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // LendSwift Brand Palette
        primary: {
          50: '#e8edf8',
          100: '#c5d2ee',
          200: '#9eb5e3',
          300: '#7798d8',
          400: '#5a82cf',
          500: '#1F4E79', // Primary Blue
          600: '#1b4570',
          700: '#163a63',
          800: '#122f56',
          900: '#0b1e3e',
        },
        accent: {
          50: '#e5f6ec',
          100: '#bfe9d0',
          200: '#95dbb1',
          300: '#6bcd92',
          400: '#4bc37b',
          500: '#27AE60', // Accent Green
          600: '#239e56',
          700: '#1d8b4b',
          800: '#177840',
          900: '#0e592e',
        },
        error: {
          50: '#fdeaea',
          100: '#f9caca',
          200: '#f5a7a7',
          300: '#f18484',
          400: '#ee6a6a',
          500: '#E74C3C', // Error Red
          600: '#d04436',
          700: '#b53b30',
          800: '#9a3229',
          900: '#70231d',
        },
        warning: {
          50: '#fef3e6',
          100: '#fde1c0',
          200: '#fbcd96',
          300: '#f9b96c',
          400: '#f8aa4d',
          500: '#F39C12', // Warning Amber
          600: '#db8d10',
          700: '#bf7b0e',
          800: '#a3690c',
          900: '#784d08',
        },
        surface: {
          50: '#fafbfc',
          100: '#f5f7fa',
          200: '#eef1f6',
          300: '#e2e8f0',
          400: '#cbd5e1',
          500: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.05), 0 12px 24px rgba(0, 0, 0, 0.05)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'glow-primary': '0 0 20px rgba(31, 78, 121, 0.15)',
        'glow-accent': '0 0 20px rgba(39, 174, 96, 0.15)',
        'glow-error': '0 0 20px rgba(231, 76, 60, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'progress': 'progress 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
      spacing: {
        '11': '2.75rem',
        '13': '3.25rem',
      },
    },
  },
  plugins: [],
};
