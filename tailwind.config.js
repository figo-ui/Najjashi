/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Primary: Deep Emerald ───
        emerald: {
          950: '#011a12',
          900: '#022c22',
          850: '#033d30',
          800: '#065f46',
          700: '#047857',
          600: '#059669',
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
          200: '#a7f3d0',
          100: '#d1fae5',
          50: '#ecfdf5',
        },
        // ─── Accent: Matte Gold ───
        gold: {
          600: '#92702a',
          500: '#b8860b',
          400: '#d4a843',
          300: '#e8c547',
          200: '#f0d875',
          100: '#f7e9a0',
          50: '#fdf8e1',
        },
        // ─── Accent: Midnight Blue ───
        midnight: {
          900: '#0c1426',
          800: '#111d35',
          700: '#1a2d4a',
          600: '#253d5e',
          500: '#345070',
        },
        // ─── Neutral: Warm Ivory & Charcoal ───
        ivory: {
          100: '#faf8f0',
          200: '#f5f0e3',
          300: '#e8e0cc',
          400: '#d4c9a8',
        },
        charcoal: {
          950: '#080c0a',
          900: '#0d1210',
          800: '#141c18',
          700: '#1e2a24',
          600: '#2a3830',
          500: '#3d4f45',
          400: '#5a7068',
          300: '#7a9488',
          200: '#a0b8ac',
          100: '#c8d8d0',
        },
        // ─── Semantic ───
        amber: {
          400: '#fbbf24',
        },
        spiritual: {
          calm: '#1a3a2a',
          warm: '#2a1a0a',
          peace: '#0a1a2a',
          focus: '#1a2a1a',
        },
      },
      fontFamily: {
        arabic: ['System'],
        sans: ['System'],
        mono: ['System'],
      },
      fontSize: {
        'arabic-sm': ['18px', { lineHeight: '32px' }],
        'arabic-base': ['22px', { lineHeight: '40px' }],
        'arabic-lg': ['28px', { lineHeight: '50px' }],
        'arabic-xl': ['36px', { lineHeight: '64px' }],
        'arabic-2xl': ['44px', { lineHeight: '76px' }],
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(16,185,129,0.15)',
        'glow-gold': '0 0 20px rgba(212,168,67,0.15)',
        'glow-strong': '0 0 40px rgba(16,185,129,0.25)',
        'soft': '0 2px 8px rgba(0,0,0,0.3)',
        'card': '0 4px 16px rgba(0,0,0,0.2)',
        'elevated': '0 8px 32px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(16,185,129,0.1)' },
          '100%': { boxShadow: '0 0 24px rgba(16,185,129,0.3)' },
        },
      },
    },
  },
  plugins: [],
};
