import Nav from "@/components/Nav"; // Assuming Nav.jsx is in components/
import Footer from "@/components/Footer"; // Assuming Footer.jsx is in components/
import { ToastProvider } from '@/components/ui/toast'

export default function MainLayout({ children }) {
  return (
    <>
       <ToastProvider>
      <Nav />
      <main className="flex-grow"> {/* Optional: Add class for main content styling if needed */}
        {children}
      </main>
      <Footer />
      </ToastProvider>
    </>
  );
}