/** @type {import('tailwindcss').Config} */
//const path = require('path');

module.exports = { 
  content: [ 
    './pages/**/*.{js,ts,jsx,tsx}', 
    './components/**/*.{js,ts,jsx,tsx}', 
    './app/**/*.{js,ts,jsx,tsx}', 
  ], 
  theme: { 
    extend: {}, 
  }, 
  plugins: [], 
}

// module.exports = {
//   content: [
//     path.join(__dirname, './TS_src/**/*.{js, ts, jsx, tsx}'),
//     path.join(__dirname, './TS_src/client/index.html'),
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/*
https://github.com/sanity-io/sanity/issues/3884
https://github.com/tailwindlabs/tailwindcss/issues/6393#issuecomment-1080723375

^ Helped resolve properly updating the tailwind and postcss configuration files


https://stackoverflow.com/questions/69429172/module-not-found-cant-resolve-mui-material-utils-v5-which-included-a-na

^Helped resolve a mui_material_styles where nothing was rendering on the front end after all the updated tailwind/postcss configs

*/