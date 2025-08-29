"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, X, CreditCard, Clock } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

export default function EnquirySuccessBanner({ partyId }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check multiple possible parameter combinations
    const enquirySuccess = searchParams.get('success') === 'true'
    const enquirySent = searchParams.get('enquiry_sent') === 'true' 
    
    // Show banner if either success=true OR enquiry_sent=true
    if (enquirySuccess || enquirySent) {
      setIsVisible(true)

      // Clean up URL parameters after showing the banner
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete('success')
        newSearchParams.delete('enquiry_sent')
        newSearchParams.delete('enquiry_count')
        newSearchParams.delete('supplier_name')
        newSearchParams.delete('timestamp')
        
        const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams}` : '')
        router.replace(newUrl, { scroll: false })
      }, 8000)
    }
  }, [searchParams, router])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  const handleSecureBooking = () => {

      
    if (partyId) {
      router.push(`/payment/secure-party?party_id=${partyId}`)
    } else {
      // Fallback - go to dashboard and let user navigate from there
      router.push('/dashboard')
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="w-full mb-6">
      <Card 
        className="border-2 shadow-lg bg-primary-50 border-[hsl(var(--primary-100))]"
       
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start space-x-4">
            {/* Success Icon */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'hsl(11 100% 76%)' }}
            >
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'hsl(11 80% 49%)' }}
                  >
                    Enquiry Sent - Supplier is Waiting!
                  </h3>
                  <p 
                    className="mb-4"
                    style={{ color: 'hsl(10 80% 42%)' }}
                  >
                    Your supplier is ready to confirm your booking. Secure your spot by paying the deposit now.
                  </p>
                  
                  {/* Urgency indicator */}
                  <div className="flex items-center space-x-2 mb-4 text-sm">
                    <Clock className="w-4 h-4" style={{ color: 'hsl(11 80% 49%)' }} />
                    <span style={{ color: 'hsl(10 80% 42%)' }}>
                      Don't wait - popular dates fill up fast!
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    className="text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 bg-teal-500 hover:bg-teal-600"
                    onClick={handleSecureBooking}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Secure Booking Now
                  </Button>
                </div>
                
                {/* Dismiss Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 -mt-1 -mr-1"
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