import { Geist, Geist_Mono, Poppins, Montserrat, Fredoka, Orbitron } from "next/font/google";
import { getBaseUrl } from "@/utils/env";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import SitePasswordGate from "@/components/SitePasswordGate";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import PageViewTracker from "@/components/PageViewTracker";

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
          src="https://www.googletagmanager.com/gtag/js?id=G-94HSGBH0MK"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-94HSGBH0MK');
          `}
        </Script>

        {/* Meta Pixel - blocked by default until consent */}
        <Script id="meta-pixel-base" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];
            t=b.createElement(e);t.async=!0;
            t.src=v;
            s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s);
            }(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            window.fbq = fbq;
            fbq('init', '2673808906339700');
          `}
        </Script>
      </head>
      
      <body className={`${montserrat.className} antialiased`}>
        <SitePasswordGate>
          {children}
          <CookieConsent />
        </SitePasswordGate>
        <Analytics />
        <PageViewTracker />
      </body>
    </html>
  );
}