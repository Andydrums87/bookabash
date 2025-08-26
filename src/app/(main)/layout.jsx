import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ToastProvider } from '@/components/ui/toast'


export default function MainLayout({ children }) {
  return (
    <>

        <ToastProvider>
          <Nav />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ToastProvider>

    </>
  );
}