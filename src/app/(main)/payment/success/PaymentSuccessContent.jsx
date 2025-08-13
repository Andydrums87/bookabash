"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, Download, Share, Home } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [loading, setLoading] = useState(true)

  const paymentIntentId = searchParams.get('payment_intent')

  useEffect(() => {
    // You could fetch payment details here if needed
    // For now, we'll just show a success message
    setLoading(false)
  }, [paymentIntentId])

  const handleReturnToDashboard = () => {
    router.push('/dashboard?payment_success=true&booking_confirmed=true&supplier_count=3&timestamp=' + Date.now())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Confirming your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-6 md:mb-8">
          {/* <CHANGE> Added Snappy the crocodile image with bounce animation */}
          <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 mb-6 animate-bounce">
            <img 
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753433572/kzz1v3k6lrtmyvqlcmsi.png"
              alt="Snappy the crocodile celebrating"
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4">
            🎉 Payment Successful!
          </h1>
          <p className="text-lg md:text-xl text-primary-700 mb-2">
            Your party booking is confirmed
          </p>
          <p className="text-gray-600 text-sm md:text-base">
            Payment ID: {paymentIntentId?.slice(-12).toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* What happens next */}
          <Card className="h-full">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What happens next?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email confirmation sent</h4>
                    <p className="text-sm text-gray-600">Check your inbox for booking details and receipts</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Suppliers notified</h4>
                    <p className="text-sm text-gray-600">Your party team will receive final booking confirmations</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Final details coordination</h4>
                    <p className="text-sm text-gray-600">We'll help coordinate any final details before your party</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important reminders */}
          <Card className="h-full">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Important Reminders
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Party Date</h4>
                    <p className="text-sm text-gray-600">Your party is scheduled for [Party Date]</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Remaining Balance</h4>
                    <p className="text-sm text-gray-600">£X due on the day of your party</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Share className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Need Changes?</h4>
                    <p className="text-sm text-gray-600">Contact us at least 48 hours before your party</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* <CHANGE> Improved action buttons with better mobile layout and primary colors */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
          <Button 
            onClick={handleReturnToDashboard}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 px-6"
            style={{
              background: `hsl(var(--primary-600))`,
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
          
          <Button 
            variant="outline"
            className="border-primary-300 text-primary-700 hover:bg-primary-50 rounded-xl py-3 px-6"
            onClick={() => {
              // Download booking confirmation
              console.log('Download booking confirmation')
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Confirmation
          </Button>
          
          <Button 
            variant="outline"
            className="border-primary-300 text-primary-700 hover:bg-primary-50 rounded-xl py-3 px-6"
            onClick={() => {
              // Share party details
              console.log('Share party details')
            }}
          >
            <Share className="w-4 h-4 mr-2" />
            Share Party Details
          </Button>
        </div>

        {/* <CHANGE> Updated support section with primary colors */}
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-4 md:p-6 text-center">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              Need Help?
            </h3>
            <p className="text-primary-800 mb-4">
              Our party planning team is here to help make your day perfect
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button 
                variant="outline" 
                className="border-primary-300 text-primary-700 hover:bg-primary-100 rounded-xl"
              >
                📞 Call Support
              </Button>
              <Button 
                variant="outline" 
                className="border-primary-300 text-primary-700 hover:bg-primary-100 rounded-xl"
              >
                💬 Live Chat
              </Button>
              <Button 
                variant="outline" 
                className="border-primary-300 text-primary-700 hover:bg-primary-100 rounded-xl"
              >
                📧 Email Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
