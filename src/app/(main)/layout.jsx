// Server Component Layout - optimized for SSR and streaming
import { NavServer } from "@/components/nav/NavServer";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export default function MainLayout({ children }) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <NavServer />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
  );
}