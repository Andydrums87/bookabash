"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, X, Mail, Clock, Users } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

export default function EnquirySuccessBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [enquiryCount, setEnquiryCount] = useState(0)

  useEffect(() => {

    
    // Check multiple possible parameter combinations
    const enquirySuccess = searchParams.get('success') === 'true'
    const enquirySent = searchParams.get('enquiry_sent') === 'true' 
    const count = searchParams.get('enquiry_count')

    
    // Show banner if either success=true OR enquiry_sent=true
    if (enquirySuccess || enquirySent) {
    
      setIsVisible(true)
      setEnquiryCount(parseInt(count) || 4)

      // Clean up URL parameters after showing the banner
      setTimeout(() => {

        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete('success')
        newSearchParams.delete('enquiry_sent')
        newSearchParams.delete('enquiry_count')
        newSearchParams.delete('timestamp')
        
        const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams}` : '')
  
        
        router.replace(newUrl, { scroll: false })
      }, 8000) // 8 seconds to give you time to see it
      
    } else {
 
    }
  }, [searchParams, router])

  const handleDismiss = () => {

    setIsVisible(false)
  }


  if (!isVisible) {

    return null
  }



  return (
    <div className="w-full mb-6">
      <Card className="border-teal-200 bg-teal-50 shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start space-x-4">
            {/* Success Icon */}
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-teal-600" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-2">
                    🎉 Enquiries Sent Successfully!
                  </h3>
                  <p className="text-green-800 mb-4">
                    Your party enquiry has been sent to {enquiryCount} suppliers. 
                    They'll contact you directly within 24 hours.
                  </p>
                  
                  {/* What's Next */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                        <Mail className="w-3 h-3 text-teal-700" />
                      </div>
                      <span className="text-teal-800">
                        Check your email for confirmation and supplier responses
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                        <Clock className="w-3 h-3 text-teal-700" />
                      </div>
                      <span className="text-teal-800">
                        Suppliers typically respond within 2-24 hours
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-6 h-6 bg-teal-200 rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 text-teal-700" />
                      </div>
                      <span className="text-teal-800">
                        Compare quotes and availability before booking
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button 
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={() => router.push('/e-invites')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Create Invitations
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-green-300 text-teal-700 hover:bg-teal-100"
                      onClick={() => router.push('/dashboard')}
                    >
                      View Party Status
                    </Button>
                  </div>
                </div>
                
                {/* Dismiss Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-teal-600 hover:text-teal-800 hover:bg-teal-100 -mt-1 -mr-1"
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
