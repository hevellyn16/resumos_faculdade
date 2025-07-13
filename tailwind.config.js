// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adicione as cores personalizadas que estavam no seu HTML original
        'primary-red': '#9F002B',
        'dark-red': '#7F0022',
        'light-red': '#FDF0F2',
      },
    },
  },
  plugins: [],
};