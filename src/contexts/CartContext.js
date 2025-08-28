// contexts/CartContext.js
"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartData, setCartData] = useState({
    suppliers: [],
    totalDeposit: 0,
    totalCost: 0
  })
  const router = useRouter()

  const updateCartData = (newCartData) => {
    setCartData(newCartData || {
      suppliers: [],
      totalDeposit: 0,
      totalCost: 0
    })
  }

  const clearCart = () => {
    setCartData({
      suppliers: [],
      totalDeposit: 0,
      totalCost: 0
    })
  }

  const handlePaymentReady = () => {
    router.push('/payment/secure-party')
  }

  return (
    <CartContext.Provider value={{
      cartData,
      updateCartData,
      clearCart,
      handlePaymentReady
    }}>
      {children}
    </CartContext.Provider>
  )
}