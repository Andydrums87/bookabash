import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add this
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Add more weights
});

export const metadata = {
  title: "BookABash",
  icons: {
    icon: "/icon-512-clear.png",  // Path from /public
    shortcut: "/icon-512-clear.png",
    apple: "/icon-512-clear.png" // Optional, for Apple devices
  },
  description: "BookABash - Your Ultimate Children's Party Planning Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
     <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}>
        {/* <Nav /> */}
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
