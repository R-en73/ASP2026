/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#00E5FF',
        'brand-blue': '#0088FF',
        'brand-pink': '#FF66B2',
        'brand-yellow': '#FFEA00',
      },
      fontFamily: {
        cursive: ['"Caveat"', '"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
};
