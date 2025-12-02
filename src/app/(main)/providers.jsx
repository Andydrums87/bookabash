"use client"

import { ToastProvider } from '@/components/ui/toast'
import { CartProvider } from "@/contexts/CartContext"

export function Providers({ children }) {
  return (
    <CartProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </CartProvider>
  )
}
