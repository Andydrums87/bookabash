"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, ChevronRight } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"

export default function NextStepsWelcomeCard({ suppliers = {}, enquiries = [] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check for booking confirmed parameter (initial booking only)
    const paymentSuccess = searchParams.get("payment_success") === "true"
    const bookingConfirmed = searchParams.get("booking_confirmed") === "true"

    if (paymentSuccess || bookingConfirmed) {
      setIsVisible(true)

      // Clean up URL parameters after showing
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete("payment_success")
        newSearchParams.delete("booking_confirmed")
        newSearchParams.delete("supplier_count")
        newSearchParams.delete("timestamp")

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
    <div className="w-full mb-6 flex justify-center">
      <Card className="border border-gray-200 bg-white shadow-lg overflow-hidden max-w-5xl w-full">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-6 md:p-8">
          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 p-0 z-10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Success Icon and Title */}
          <div className="flex items-center gap-4 max-w-3xl">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 pr-8">
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                Party Booked Successfully! 🎉
              </h2>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content Section */}
        <CardContent className="p-6 md:p-8">
          {/* Venue confirmation info */}
          <p className="text-sm text-gray-600 mb-6">
            Your venue will confirm within 24 hours. Once confirmed, you'll be able to create and send digital invitations!
          </p>

          {/* Clear instruction */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              What you can do right now:
            </h3>
          </div>

          {/* Action Items - Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* Guest List */}
            <button
              onClick={() => router.push("/e-invites")}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-primary-300 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                  <Image
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753986373/jwq8wmgxqqfue2zsophq.jpg"
                    alt="Guest List"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900 text-base mb-1">Build Your Guest List</h4>
                  <p className="text-sm text-gray-600">Add everyone who's invited to the party</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
              </div>
            </button>

            {/* Gift Registry */}
            <button
              onClick={() => router.push("/gift-registry")}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-primary-300 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                  <Image
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/okpcftsuni04yokhex1l.jpg"
                    alt="Gift Registry"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900 text-base mb-1">Create Gift Registry</h4>
                  <p className="text-sm text-gray-600">Help guests know what to bring</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
              </div>
            </button>
          </div>

          {/* Digital Invitations - Locked - Full Width */}
          <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 opacity-60 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1754405084/party-invites/m02effvlanaxupepzsza.png"
                  alt="Digital Invitations"
                  fill
                  className="object-cover grayscale"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-700 text-base mb-1">Digital Invitations</h4>
                <p className="text-sm text-gray-600">Unlocks once your venue confirms</p>
              </div>
            </div>
          </div>

          {/* Add more suppliers note */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <span className="font-semibold">Need something else?</span> You can always browse and add more suppliers from the categories below.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
