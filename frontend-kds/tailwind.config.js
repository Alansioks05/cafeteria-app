/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          dark: '#2C1E16',    // Marrón oscuro para textos
          primary: '#6F4E37', // Marrón café principal
          light: '#F5EBE1',   // Fondo crema
          accent: '#D4A373',  // Detalles
        }
      }
    },
  },
  plugins: [],
}