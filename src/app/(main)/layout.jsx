
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ToastProvider } from '@/components/ui/toast'

// Change the function name from MainLayout to just Layout
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