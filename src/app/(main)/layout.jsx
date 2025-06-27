import Nav from "@/components/Nav"; // Assuming Nav.jsx is in components/
import Footer from "@/components/Footer"; // Assuming Footer.jsx is in components/

export default function MainLayout({ children }) {
  return (
    <>
      <Nav />
      <main className="flex-grow bg-primary-100"> {/* Optional: Add class for main content styling if needed */}
        {children}
      </main>
      <Footer />
    </>
  );
}