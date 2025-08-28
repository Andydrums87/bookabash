"use client"

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ToastProvider } from '@/components/ui/toast'
import { CartProvider } from "@/contexts/CartContext" // Add this import

export default function MainLayout({ children }) {
  return (
    <CartProvider>
      <ToastProvider>
        <Nav />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </ToastProvider>
    </CartProvider>
  );
}