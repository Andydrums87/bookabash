

/** @type {import('tailwindcss').Config} */
const { fontFamily, borderRadius } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],

  safelist: [
    'rounded',
    'rounded-md',
    'rounded-lg',
    'rounded-xl',
  
    'rounded-2xl',
    'h-12',
    'border',
    'bg-primary',
    'text-primary-foreground',
    'btn-primary',
    'bg-primary',
    'hover:bg-primary',
   
    'hover:bg-primary-600',
'font-poppins'
  ],
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}", // ← if you're using /app
  ],
  
  prefix: "",
  theme: {
    screens: {
      'xs': '375px',    // Extra small devices
      'sm': '640px',    // Small devices (default)
      'md': '768px',    // Medium devices (default)
      'lg': '1024px',   // Large devices (default)
      'xl': '1280px',   // Extra large devices (default)
      "2xl": "1400px",
    },
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))", // dynamic via CSS var
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Teal
          50: "hsl(var(--secondary-50))",
          100: "hsl(var(--secondary-100))",
          200: "hsl(var(--secondary-200))",
          300: "hsl(var(--secondary-300))",
          400: "hsl(var(--secondary-400))",
          500: "hsl(var(--secondary-500))",
          600: "hsl(var(--secondary-600))",
          700: "hsl(var(--secondary-700))",
          800: "hsl(var(--secondary-800))",
          950: "hsl(var(--secondary-950))",
          foreground: "hsl(var(--secondary-foreground))", // White
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // Light Grayish Blue
          50: "hsl(var(--accent-50))",
          100: "hsl(var(--accent-100))",
          200: "hsl(var(--accent-200))",
          300: "hsl(var(--accent-300))",
          400: "hsl(var(--accent-400))",
          500: "hsl(var(--accent-500))",
          600: "hsl(var(--accent-600))",
          700: "hsl(var(--accent-700))",
          800: "hsl(var(--accent-800))",
          900: "hsl(var(--accent-900))",
          foreground: "hsl(var(--accent-foreground))", // Dark Gray
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors
        coral: {
          light: "#FF8B70", // Lighter coral for hover or accents
          DEFAULT: "#FF6E4C", // Main coral
          dark: "#FF5028", // Darker coral for active states or deeper accents
        },
        teal: {
          light: "#4DB6AC",
          DEFAULT: "#009688",
          dark: "#00796B",
        },
        "light-grayish-blue": {
          light: "#F1F3F5",
          DEFAULT: "#ADB5BD",
          dark: "#495057",
        },
        "dark-gray": "#212529",
        "light-peach": "#FFF0ED",
        "soft-blue": "#E0F2F1",
      },
      borderRadius: {
        ...borderRadius, // ✅ restores sm, md, lg, xl, 2xl, etc.
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        montserrat: ['var(--font-montserrat)', ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
        poppins: ["var(--font-poppins)", ...fontFamily.sans],


      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//     content: [
//       "./app/**/*.{js,ts,jsx,tsx}",      // all files in app directory (Next.js App Router)
//       "./pages/**/*.{js,ts,jsx,tsx}",    // all files in pages directory (if you have it)
//       "./components/**/*.{js,ts,jsx,tsx}"// all component files
//     ],
//     theme: {
//       extend: {},
//     },
//     plugins: [],
//   };
  