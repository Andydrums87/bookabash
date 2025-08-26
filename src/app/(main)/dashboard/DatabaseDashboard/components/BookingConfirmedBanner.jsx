"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles, ArrowRight } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

export default function BookingConfirmedBanner({ suppliers = {}, enquiries = [], paymentDetails = null }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [supplierCount, setSupplierCount] = useState(0)

  // Get confirmed suppliers
  const confirmedSuppliers = Object.entries(suppliers)
    .filter(([key, supplier]) => supplier && key !== 'einvites')
    .map(([type, supplier]) => {
      const enquiry = enquiries.find(e => e.supplier_category === type)
      return {
        type,
        name: supplier.name,
        category: type.charAt(0).toUpperCase() + type.slice(1),
        status: enquiry?.status || 'confirmed'
      }
    })
    .filter(supplier => supplier.status === 'accepted')

  useEffect(() => {
    // Check for payment success parameters
    const paymentSuccess = searchParams.get('payment_success') === 'true'
    const bookingConfirmed = searchParams.get('booking_confirmed') === 'true'
    const count = searchParams.get('supplier_count')

    if (paymentSuccess || bookingConfirmed) {
      setIsVisible(true)
      setSupplierCount(parseInt(count) || confirmedSuppliers.length)
      
      // Clean up URL parameters after showing
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete('payment_success')
        newSearchParams.delete('booking_confirmed')
        newSearchParams.delete('supplier_count')
        newSearchParams.delete('timestamp')
        
        const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams}` : '')
        router.replace(newUrl, { scroll: false })
      }, 8000) // Clean up after 8 seconds
    }
  }, [searchParams, router, confirmedSuppliers.length])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="w-full mb-6">
      <Card className="border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {/* Celebration Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 relative">
            
            {/* Floating sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-6 left-16 w-1 h-1 bg-white/50 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-1">
                  Your Party Team is Secured!
                </h2>
                <p className="text-white/90 text-base md:text-lg font-medium">
                  {supplierCount} amazing supplier{supplierCount !== 1 ? 's' : ''} locked in and ready to make magic happen
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              {/* Left: Quick summary */}
              <div className="flex-1">
                <div className="bg-white/60 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    What happens next?
                  </h3>
                  <p className="text-emerald-700 text-sm leading-relaxed">
                    Your suppliers will contact you within 24 hours with their contact details and to finalize the party magic. 
                    Check your email for booking confirmations!
                  </p>
                </div>

                {/* Supplier tags preview */}
                {confirmedSuppliers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {confirmedSuppliers.slice(0, 5).map((supplier) => (
                      <span 
                        key={supplier.type} 
                        className="text-xs bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full font-medium"
                      >
                        {supplier.category}
                      </span>
                    ))}
                    {confirmedSuppliers.length > 5 && (
                      <span className="text-xs text-emerald-600 px-3 py-1.5 font-medium">
                        +{confirmedSuppliers.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Single clear action */}
              <div className="lg:w-80">
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <h4 className="font-bold text-emerald-800 mb-3">
                    Ready for the next step?
                  </h4>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
                    onClick={() => router.push('/e-invites')}
                  >
                    Create Party Invitations
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-emerald-600 mt-2">
                    Send beautiful invites to your guests
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}