import { Geist, Geist_Mono, Poppins, Montserrat, Fredoka, Orbitron } from "next/font/google";
import { getBaseUrl } from "@/utils/env";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import Script from "next/script";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: true,
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
  metadataBase: new URL(getBaseUrl()),
  title: "PartySnap",
  description: "PartySnap - Your Ultimate Children's Party Planning Platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`scroll-to-top ${montserrat.variable} ${poppins.variable} ${orbitron.variable} ${fredoka.variable}`}>
      <head>
        {/* Block analytics by default until consent */}
        <Script id="gtag-consent" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });
          `}
        </Script>

        {/* Load Google Analytics */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-BEX0E68R87"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BEX0E68R87');
          `}
        </Script>
      </head>
      
      <body className={`${montserrat.className} antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}