/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 99Dresses strict color scheme
        'brand': {
          'bg': '#2B2B2B',           // Primary background (charcoal black)
          'header': '#4B2D4F',        // Header background (deep purple)
          'card': '#FFFFFF',          // Card background (white)
          'purple': '#7A3B8F',        // Primary accent (purple buttons)
          'gold': '#F5C542',          // Secondary accent (price tags/gold)
        },
        'text': {
          'heading': '#FFFFFF',       // Headings
          'body': '#CFCFCF',          // Body text on dark bg
          'card': '#333333',          // Text on white cards
        },
      },
    },
  },
  plugins: [],
};
