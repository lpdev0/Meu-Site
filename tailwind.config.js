/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { ink: '#0C0C0C', silver: '#D7E2EA' }, fontFamily: { sans: ['Kanit', 'sans-serif'] } } },
  plugins: [],
}
