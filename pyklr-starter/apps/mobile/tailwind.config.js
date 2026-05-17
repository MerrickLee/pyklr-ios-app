/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // PYKLR brand
        brand: {
          green: '#67BF69',
          'green-dark': '#4FA547',
          'green-light': '#EAF5E5',
          lime: '#A8E66A',           // Dark-mode primary
          'lime-dark': '#0A1F08',    // Text on lime buttons
          blue: '#4493CC',
          'blue-light': '#E4F0F8',
        },
        // Semantic
        bg: {
          light: '#FAFAF7',
          dark: '#0B0B0B',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#161616',
          'dark-2': '#1F1F1F',
        },
        border: {
          light: '#F0F0F0',
          dark: '#262626',
        },
        text: {
          light: '#0F0F0F',
          'light-muted': '#666666',
          'light-faint': '#999999',
          dark: '#FFFFFF',
          'dark-muted': '#9A9A9A',
          'dark-faint': '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        display: ['Inter', 'System'],   // 900 italic for wordmark
        pixel: ['Sink', 'Courier New'],
      },
      borderRadius: {
        'md': '12px',
        'lg': '18px',
        'xl': '28px',
      },
    },
  },
  plugins: [],
};
