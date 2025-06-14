/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00A3E0', // VMware blue
          dark: '#0077B5',
        },
        secondary: {
          DEFAULT: '#00B140', // VMware green
          dark: '#008F3A',
        },
        background: {
          light: '#F8FAFC',
          dark: '#1A1B1E',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#2C2E33',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 