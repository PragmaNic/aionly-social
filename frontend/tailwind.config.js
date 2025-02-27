/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#5eead4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        secondary: {
          400: '#c084fc', // Neon purple
          500: '#a855f7',
          600: '#9333ea',
        },
        verify: {
          success: '#2ecc71',
          error: '#e74c3c'
        },
        matrix: {
          bg: '#0f1117',
          code: '#5eead4',
          accent: '#5eead4',
          dark: '#080b14',
          glow: '#5eead4',    // Matrix glow effect
          highlight: '#f472b6', // Pink highlight
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        gray: {
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        semantic: {
          // Semantic colors for specific meanings
          positive: '#10b981',
          negative: '#ef4444',
          neutral: '#6b7280',
          highlight: '#8b5cf6',
        }
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.primary.400"), 0 0 20px theme("colors.primary.500")',
        'error': '0 0 5px theme("colors.verify.error")',
        'glow': '0 0 10px rgba(94, 234, 212, 0.5)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'matrix-fall': 'matrix-fall 20s linear infinite',
      },
      keyframes: {
        'matrix-fall': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      },
      spacing: {
        // These match the CSS variables we added to index.css
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}