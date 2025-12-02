/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          500: '#006AFA',
        },
        'bg': {
          400: '#192A44',
        },
        'text': {
          100: '#F5F5F5',
        },
      },
      fontFamily: {
        'urbanist': ['Urbanist', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

