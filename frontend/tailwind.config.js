/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0a0a0a',
        surface: '#141414',
        borderCustom: '#2a2a2a',
        ink: '#ffffff',
        bodyText: '#d8d8d8',
        mutedText: '#9e9e9e',
        placeholderText: '#858585',
        gradStart: '#e03a1e',
        gradEnd: '#f97316',
      },
      fontFamily: {
        main: ['Barlow', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        btn: '6px',
        card: '12px',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #e03a1e, #f97316)',
      }
    },
  },
  plugins: [],
}
