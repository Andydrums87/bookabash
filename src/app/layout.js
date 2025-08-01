import { Geist, Geist_Mono, Poppins, Montserrat, Fredoka, Orbitron } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import NavigationTracker from "@/components/NavigationTracker";

// Add this
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Add more weights
});

// ✅ FIX 1: Only load the font you actually use, with only needed weights
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // ✅ Only load weights you actually use
  display: 'swap', // ✅ Improve font loading performance
  preload: true, // ✅ Preload the font
});

const fredoka = Fredoka({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka'
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron'
});

export const metadata = {
  title: "PartySnap",
  description: "PartySnap - Your Ultimate Children's Party Planning Platform",
  icons: {
    icon: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1752616713/Head_Only_lsotd1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable}  ${orbitron.variable} ${fredoka.variable}`}>
      <body className={`${montserrat.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}