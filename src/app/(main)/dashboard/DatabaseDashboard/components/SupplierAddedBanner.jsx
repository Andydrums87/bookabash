"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, CheckCircle } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

export default function SupplierAddedBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [supplierName, setSupplierName] = useState("")
  const [supplierCategory, setSupplierCategory] = useState("")

  useEffect(() => {
    // Check for supplier added parameter
    const supplierAdded = searchParams.get("supplier_added") === "true"
    const name = searchParams.get("supplier_name")
    const category = searchParams.get("supplier_category")

    if (supplierAdded) {
      setIsVisible(true)
      setSupplierName(name || "")
      setSupplierCategory(category || "Supplier")

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 5000)

      // Clean up URL parameters
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete("supplier_added")
        newSearchParams.delete("supplier_name")
        newSearchParams.delete("supplier_category")

        const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams}` : "")
        router.replace(newUrl, { scroll: false })
      }, 500)
    }
  }, [searchParams, router])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="w-full mb-6 animate-in slide-in-from-top duration-300">
      <Card className="border border-gray-200 bg-white shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Success Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[hsl(var(--primary-500))] rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Supplier Added! ✨
              </h3>
              {supplierName && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{supplierName}</span> has been added to your party
                </p>
              )}
              {!supplierName && supplierCategory && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{supplierCategory}</span> added to your party
                </p>
              )}
              {!supplierName && !supplierCategory && (
                <p className="text-sm text-gray-600">
                  Your new supplier has been added to your party
                </p>
              )}
            </div>

            {/* Dismiss Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
