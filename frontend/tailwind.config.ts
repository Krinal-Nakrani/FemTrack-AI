import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: '#1A0A2E',
          50: '#F5F0FF',
          100: '#E8DEFF',
          200: '#D1BEFF',
          300: '#B39DDB',
          400: '#8E6CB8',
          500: '#6A3D9A',
          600: '#4A1D7A',
          700: '#2D0F52',
          800: '#1A0A2E',
          900: '#0D0517',
          950: '#060210',
        },
        rose: {
          DEFAULT: '#C94B8A',
          50: '#FFF0F6',
          100: '#FFE0EE',
          200: '#FFC2DD',
          300: '#FF94C2',
          400: '#FF6B9D',
          500: '#C94B8A',
          600: '#B03A75',
          700: '#8E2D5E',
          800: '#6B2148',
          900: '#4A1632',
        },
        lavender: {
          DEFAULT: '#B39DDB',
          50: '#F8F5FF',
          100: '#EDE7FF',
          200: '#DDD0FF',
          300: '#C5B2F0',
          400: '#B39DDB',
          500: '#9575CD',
          600: '#7E57C2',
          700: '#6A3DAA',
          800: '#4A2B7A',
          900: '#2D1A4E',
        },
        cream: {
          DEFAULT: '#F8F0FF',
          50: '#FEFCFF',
          100: '#FBF6FF',
          200: '#F8F0FF',
          300: '#F0E4FF',
          400: '#E8D6FF',
        },
        coral: {
          DEFAULT: '#FF6B9D',
          50: '#FFF5F8',
          100: '#FFE0EA',
          200: '#FFC2D6',
          300: '#FF94B8',
          400: '#FF6B9D',
          500: '#E85486',
          600: '#CC3D6F',
          700: '#A62D55',
          800: '#7F203F',
          900: '#59142B',
        },
        surface: {
          dark: '#1A0A2E',
          'dark-elevated': '#241340',
          'dark-card': 'rgba(36, 19, 64, 0.6)',
          light: '#F8F0FF',
          'light-card': 'rgba(255, 255, 255, 0.8)',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glow-rose': '0 0 20px rgba(201, 75, 138, 0.3), 0 0 40px rgba(201, 75, 138, 0.1)',
        'glow-lavender': '0 0 20px rgba(179, 157, 219, 0.3), 0 0 40px rgba(179, 157, 219, 0.1)',
        'glow-coral': '0 0 20px rgba(255, 107, 157, 0.3), 0 0 40px rgba(255, 107, 157, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-light': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-down': 'slide-down 0.6s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
