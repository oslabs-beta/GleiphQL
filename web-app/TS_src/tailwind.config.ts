/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{html,tsx,ts}',
    './components/**/*.{html,tsx,ts}',
    './app/**/*.{html,tsx,ts}',
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tw-elements/dist/plugin')],
  darkMode: 'class',
}

