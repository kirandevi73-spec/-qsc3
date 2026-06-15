/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'var(--bg-primary, #050510)',
          surface: 'var(--bg-surface, #0f172a)',
        },
        neon: {
          cyan: 'var(--neon-cyan, #00f3ff)',
          purple: 'var(--neon-purple, #bc13fe)',
          green: '#00ff88',
          amber: '#ffb800'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3)',
        'neon-purple': '0 0 10px rgba(188, 19, 254, 0.5), 0 0 20px rgba(188, 19, 254, 0.3)',
        'card-glow': '0 4px 20px rgba(0, 243, 255, 0.1)',
      },
      animation: {
        'flicker': 'flicker 2s infinite alternate',
        'glow-pulse': 'glow-pulse 3s infinite alternate',
        'matrix-fall': 'matrix-fall 10s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: 1 },
          '20%, 24%, 55%': { opacity: 0.5 },
        },
        'glow-pulse': {
          '0%': { boxShadow: '0 0 10px rgba(0, 243, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 243, 255, 0.6)' },
        },
        'matrix-fall': {
          '0%': { backgroundPosition: '0% -100%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
