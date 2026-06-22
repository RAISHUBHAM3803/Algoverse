/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', '"Courier New"', 'monospace'],
      },
      colors: {
        // Our dynamic theme colors using CSS variables
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        primary: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Semantic colors
        success: '#10b981', // Emerald 500
        warning: '#f59e0b', // Amber 500
        danger: '#ef4444',  // Red 500
        
        // Backward compat aliases (used in ProblemTable during migration)
        lc: {
          bg:      'var(--background)',
          surface: 'var(--surface)',
          divider: 'var(--border)',
          gray:    'var(--text-secondary)',
          green:   '#10b981',
          red:     '#ef4444',
          orange:  '#f59e0b',
          blue:    '#6366f1',
        },
        // Carbon scale used in ProblemTable skeleton states
        carbon: {
          400: 'var(--text-muted)',
          700: 'var(--border)',
          900: 'var(--surface)',
          950: 'var(--background)',
        },
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-sm': '0 4px 15px rgba(0, 0, 0, 0.05)',
        'glow-primary': '0 0 20px rgba(6, 182, 212, 0.3)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 6s ease-in-out infinite',
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
