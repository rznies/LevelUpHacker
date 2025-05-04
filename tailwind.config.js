/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hn-orange': '#ff6600',
        'hn-gray': '#828282',
        'hn-light-gray': '#cccccc', // Lighter gray for borders/lines
        'hn-beige': '#f6f6ef', // HN background color
      },
      fontFamily: {
        sans: ['Verdana', 'Geneva', 'sans-serif'], // Set Verdana as default sans-serif
      },
      fontSize: {
        'hn-small': '7pt', // 9.33px
        'hn-normal': '10pt', // 13.33px
        'hn-large': '11pt', // 14.67px
      },
      spacing: {
        'hn-gutter': '1rem',
        'hn-item-padding': '0.5rem',
        'hn-rank-width': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Add typography plugin for comment rendering
  ],
}