// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#5eead4', // Bright cyberpunk cyan
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
          glow: '#5eead4',    // Matrix glow effect
          bg: '#0f172a',      // Deep space background
          code: '#86efac',    // Green "Matrix" code
          highlight: '#f472b6', // Pink highlight
        }
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.primary.400"), 0 0 20px theme("colors.primary.500")',
        'error': '0 0 5px theme("colors.verify.error")',
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', 'monospace'],
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
      }
    },
  },
  plugins: [],
}