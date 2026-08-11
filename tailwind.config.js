/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/marketing/**/*.{js,jsx,ts,tsx}'],
  // No selector prefix / important wrapper — global * margin reset is scoped to #app,
  // so landing Tailwind utilities (mx-auto, text-center, spacing) apply normally.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1640',
          mid: '#0F1E55',
          light: '#162566',
        },
        orange: {
          DEFAULT: '#FF5C35',
          dim: '#CC4829',
        },
        green: {
          DEFAULT: '#1DB87A',
          dim: '#16945F',
        },
        'text-muted': '#8A92B2',
        'text-mid': '#C2C8E0',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        radius: '12px',
        'radius-lg': '20px',
      },
      transitionTimingFunction: {
        custom: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        220: '220ms',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s both',
        'fade-in': 'fadeIn 0.3s ease',
      },
    },
  },
  plugins: [],
};
