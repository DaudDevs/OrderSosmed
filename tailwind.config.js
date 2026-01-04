/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Kita sudah menggunakan arbitrary values (misal: bg-[#0f172a]) di App.jsx, 
      // tapi kamu bisa menambahkan preset warna di sini jika mau.
    },
  },
  plugins: [],
}