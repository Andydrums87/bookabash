
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, X, Mail, Phone, Calendar, Sparkles } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

export default function BookingConfirmedBanner({ suppliers = {}, enquiries = [], paymentDetails = null }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [supplierCount, setSupplierCount] = useState(0)

  // Get confirmed suppliers with contact details
  const confirmedSuppliers = Object.entries(suppliers)
    .filter(([key, supplier]) => supplier && key !== 'einvites')
    .map(([type, supplier]) => {
      const enquiry = enquiries.find(e => e.supplier_category === type)
      return {
        type,
        name: supplier.name,
        category: type.charAt(0).toUpperCase() + type.slice(1),
        phone: enquiry?.supplier_phone || supplier.phone,
        email: enquiry?.supplier_email || supplier.email,
        status: enquiry?.status || 'confirmed'
      }
    })
    .filter(supplier => supplier.status === 'accepted')

  useEffect(() => {

    // Check for payment success parameters
    const paymentSuccess = searchParams.get('payment_success') === 'true'
    const bookingConfirmed = searchParams.get('booking_confirmed') === 'true'
    const count = searchParams.get('supplier_count')

    // Show banner if payment success or booking confirmed
    if (paymentSuccess || bookingConfirmed) {
      console.log('✅ Booking success detected, setting isVisible to true')
      setIsVisible(true)
      setSupplierCount(parseInt(count) || confirmedSuppliers.length)
      
  
      
      // Clean up URL parameters after showing the banner
      setTimeout(() => {
    
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete('payment_success')
        newSearchParams.delete('booking_confirmed')
        newSearchParams.delete('supplier_count')
        newSearchParams.delete('timestamp')
        
        const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams}` : '')

        
        router.replace(newUrl, { scroll: false })
      }, 10000) // 10 seconds to give time to read
      
    } else {

    }
  }, [searchParams, router, confirmedSuppliers.length])

  const handleDismiss = () => {
    console.log('👋 Banner dismissed by user')
    setIsVisible(false)
  }



  if (!isVisible) {

    return null
  }



  return (
    <div className="w-full mb-6">
      <Card className="border-emerald-200 bg-emerald-50 shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start space-x-4">
            {/* Success Icon */}
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                    🎉 Booking Confirmed & Payment Successful!
                  </h3>
                  <p className="text-emerald-800 mb-4">
                    Your party deposit has been paid and {supplierCount} supplier{supplierCount !== 1 ? 's' : ''} {supplierCount !== 1 ? 'have' : 'has'} been secured for your event.
                  </p>
                  
                  {/* What's Next */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                        <Phone className="w-3 h-3 text-emerald-700" />
                      </div>
                      <span className="text-emerald-800">
                        Your suppliers will contact you within 24 hours to arrange final details
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                        <Mail className="w-3 h-3 text-emerald-700" />
                      </div>
                      <span className="text-emerald-800">
                        Check your email for booking confirmation and contact details
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-emerald-700" />
                      </div>
                      <span className="text-emerald-800">
                        {paymentDetails?.remainingBalance 
                          ? `Remaining balance of £${paymentDetails.remainingBalance} due on party day`
                          : 'All set for your party day!'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Confirmed Suppliers Preview */}
                  {confirmedSuppliers.length > 0 && (
                    <div className="mt-4 p-3 bg-white/60 rounded-lg">
                      <h4 className="text-sm font-semibold text-emerald-800 mb-2">Your Party Team:</h4>
                      <div className="flex flex-wrap gap-2">
                        {confirmedSuppliers.slice(0, 4).map((supplier) => (
                          <span 
                            key={supplier.type} 
                            className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full"
                          >
                            {supplier.category}
                          </span>
                        ))}
                        {confirmedSuppliers.length > 4 && (
                          <span className="text-xs text-emerald-600">
                            +{confirmedSuppliers.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => router.push('/party-summary')}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      View Party Summary
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      onClick={() => router.push('/e-invites')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Create Invitations
                    </Button>
                  </div>
                </div>
                
                {/* Dismiss Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 -mt-1 -mr-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}