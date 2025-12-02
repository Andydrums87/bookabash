// Server Component Layout - optimized for SSR and streaming
import { NavServer } from "@/components/nav/NavServer";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export default function MainLayout({ children }) {
  return (
    <Providers>
      <NavServer />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </Providers>
  );
}