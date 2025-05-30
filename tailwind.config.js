/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",      // all files in app directory (Next.js App Router)
      "./pages/**/*.{js,ts,jsx,tsx}",    // all files in pages directory (if you have it)
      "./components/**/*.{js,ts,jsx,tsx}"// all component files
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  