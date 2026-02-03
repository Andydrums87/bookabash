"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function CartIndicator({ className = "" }) {
  const [cartData, setCartData] = useState({ suppliers: [], totalDeposit: 0 })
  const [partyId, setPartyId] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const updateCartFromStorage = () => {
      try {
        const storedCart = sessionStorage.getItem('cartData')
        if (storedCart) {
          const parsed = JSON.parse(storedCart)
          if (Date.now() - parsed.timestamp < 30000) {
            setCartData(parsed)
            if (parsed.partyId) {
              setPartyId(parsed.partyId)
            }
          } else {
            setCartData({ suppliers: [], totalDeposit: 0 })
          }
        }

        // Try to get party ID from localStorage
        const storedPartyId = localStorage.getItem('selectedPartyId') || localStorage.getItem('currentPartyId')
        if (storedPartyId) {
          setPartyId(storedPartyId)
        }
      } catch (error) {
        console.error('Error reading cart data:', error)
      }
    }

    updateCartFromStorage()
    const interval = setInterval(updateCartFromStorage, 3000)
    return () => clearInterval(interval)
  }, [isClient])

  const supplierCount = cartData.suppliers?.length || 0

  if (supplierCount === 0) {
    return null
  }

  const handlePaymentClick = () => {
    if (partyId) {
      // If only one supplier, pass add_supplier params for better receipt/success messaging
      if (supplierCount === 1 && cartData.suppliers?.[0]) {
        const supplier = cartData.suppliers[0]
        const params = new URLSearchParams({
          party_id: partyId,
          add_supplier: 'true',
          ...(supplier.name && { supplier_name: supplier.name }),
          ...(supplier.category && { supplier_category: supplier.category })
        })
        router.push(`/payment/secure-party?${params.toString()}`)
      } else {
        router.push(`/payment/secure-party?party_id=${partyId}`)
      }
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handlePaymentClick}
      className={`relative flex items-center gap-2 h-10 px-3 border-none transition-all hover:shadow-md ${className}`}
    >
      <div className="relative">
        <ShoppingCart className="w-4 h-4" />
        <Badge className="absolute -top-4 -right-4 h-5 min-w-5 text-xs bg-primary-500 text-white border-white px-1">
          {supplierCount}
        </Badge>
      </div>

      <div className="sm:hidden">
        <span className="text-xs font-medium">£{cartData.totalDeposit.toFixed(2)}</span>
      </div>
    </Button>
  )
}

export default CartIndicator
