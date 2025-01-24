const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    flowbite.content(),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          "50": "#fafaf9",
          "100": "#f5f5f4",
          "200": "#e7e5e4",
          "300": "#d6d3d1",
          "400": "#a8a29e",
          "500": "#78716c",
          "600": "#57534e",
          "700": "#44403c",
          "800": "#292524",
          "900": "#1c1917",
          "950": "#0c0a09"
        }
      }
    },
    fontFamily: {
      'body': ['Open Sans', 'sans-serif'],
      'sans': ['Open Sans', 'sans-serif']
    }
  },
  plugins: [flowbite.plugin(),],
};
