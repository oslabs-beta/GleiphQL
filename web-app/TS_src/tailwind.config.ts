/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{html,tsx,ts}',
    './components/**/*.{html,tsx,ts}',
    './app/**/*.{html,tsx,ts}',
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {
      width: {
        '1/7': '14.2857143%',
        '2/7': '28.5714286%',
        '3/7': '42.8571429%',
        '4/7': '57.1428571%',
        '5/7': '71.4285714%',
        '6/7': '85.7142857%',
      }
    }
  },
  plugins: [require('tw-elements/dist/plugin')],
  darkMode: 'class',
}

