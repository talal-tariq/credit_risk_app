/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f5f5f5',
          light: '#ffffff',
          dark: '#ebebeb',
        },
        secondary: {
          DEFAULT: '#f0f0f0',
          light: '#e8e8e8',
          hover: '#e0e0e0',
        },
        accent: {
          DEFAULT: '#1a5a7a',
          light: '#2980b9',
          dark: '#0d4a6a',
          success: '#27ae60',
          warning: '#f39c12',
          info: '#3498db',
        },
        surface: {
          DEFAULT: '#ffffff',
          light: '#fafafa',
          dark: '#f5f5f5',
        },
        border: {
          DEFAULT: '#e0e0e0',
          light: '#d5d5d5',
          focus: '#b0b0b0',
        },
        text: {
          primary: '#2c3e50',
          secondary: '#5a6a7a',
          muted: '#8a9aaa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
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
