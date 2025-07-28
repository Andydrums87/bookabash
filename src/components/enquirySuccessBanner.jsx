// components/EnquirySuccessBanner.js
// Success banner to show when enquiries have been sent

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
    // Check if user just sent enquiries
    const enquirySent = searchParams.get('enquiry_sent')
    const count = searchParams.get('enquiry_count')
    
    if (enquirySent === 'true') {
      setIsVisible(true)
      setEnquiryCount(parseInt(count) || 4) // Default to 4 if not specified
      
      // Clean up URL parameters
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('enquiry_sent')
      newSearchParams.delete('enquiry_count')
      
      const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams}` : '')
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <Card className="border-green-200 bg-green-50 shadow-lg mb-6">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start space-x-4">
          {/* Success Icon */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
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
                      <Mail className="w-3 h-3 text-green-700" />
                    </div>
                    <span className="text-green-800">
                      Check your email for confirmation and supplier responses
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                      <Clock className="w-3 h-3 text-green-700" />
                    </div>
                    <span className="text-green-800">
                      Suppliers typically respond within 2-24 hours
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                      <Users className="w-3 h-3 text-green-700" />
                    </div>
                    <span className="text-green-800">
                      Compare quotes and availability before booking
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => router.push('/e-invites')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Create Invitations
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-green-300 text-green-700 hover:bg-green-100"
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
                className="text-green-600 hover:text-green-800 hover:bg-green-100 -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Alternative compact version for mobile
export function CompactEnquirySuccessBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const enquirySent = searchParams.get('enquiry_sent')
    if (enquirySent === 'true') {
      setIsVisible(true)
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => setIsVisible(false), 10000)
      
      // Clean up URL
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('enquiry_sent')
      const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams}` : '')
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:hidden">
      <Card className="border-green-200 bg-green-50 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 text-sm">Enquiries Sent! 🎉</h4>
              <p className="text-xs text-green-700">Suppliers will contact you within 24 hours</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-green-600 hover:bg-green-100 w-8 h-8 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}