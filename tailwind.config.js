/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './BookingForm.tsx',
    './RoutePages.tsx',
    './LegalPages.tsx',
    './i18n.tsx',
    './i18n.ts',
    './components/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b1f33',
        gold: {
          50: '#fff8e1',
          100: '#fde7a8',
          200: '#f5d472',
          300: '#e9c248',
          400: '#d4a52a',
          500: '#a8821f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
