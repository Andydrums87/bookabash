"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const paymentIntentId = searchParams.get("payment_intent")

  const handleReturnToDashboard = () => {
    router.push("/dashboard?payment_success=true&booking_confirmed=true&supplier_count=3&timestamp=" + Date.now())
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-4">🎉 Dream Party Secured!</h1>

        <p className="text-gray-600 mb-2">Amazing! Your child's perfect party is all booked and ready to go.</p>
        <p className="text-gray-600 mb-8">We'll send you a confirmation email with all the exciting details shortly!</p>
        {/* </CHANGE> */}

        <Button onClick={handleReturnToDashboard} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2">
          <Home className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Button>

        {paymentIntentId && (
          <p className="text-xs text-gray-400 mt-6">Reference: {paymentIntentId.slice(-8).toUpperCase()}</p>
        )}
      </div>
    </div>
  )
}
