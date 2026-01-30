/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand': {
          'pink': '#F4A6B8',
          'pink-light': '#F7B6C8',
          'pink-hover': '#E895A8',
          'grey-light': '#F2F2F2',
        },
        'text': {
          'primary': '#333333',
          'secondary': '#9B9B9B',
        },
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
