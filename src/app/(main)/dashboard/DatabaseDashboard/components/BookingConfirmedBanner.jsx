"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, PartyPopper } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import Lottie from "lottie-react"

export default function BookingConfirmedBanner({ suppliers = {}, enquiries = [], paymentDetails = null }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [supplierCount, setSupplierCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationData, setAnimationData] = useState(null);


  // Get confirmed suppliers
  const confirmedSuppliers = Object.entries(suppliers)
    .filter(([key, supplier]) => supplier && key !== "einvites")
    .map(([type, supplier]) => {
      const enquiry = enquiries.find((e) => e.supplier_category === type)
      return {
        type,
        name: supplier.name,
        category: type.charAt(0).toUpperCase() + type.slice(1),
        status: enquiry?.status || "confirmed",
      }
    })
    .filter((supplier) => supplier.status === "accepted")

    useEffect(() => {
      // Fetch Lottie animation data
      fetch('https://res.cloudinary.com/dghzq6xtd/raw/upload/v1759218476/animation_1_ciulvf.json')
        .then(response => response.json())
        .then(data => setAnimationData(data))
        .catch(error => console.error('Error loading animation:', error));
    
      // Check for payment success parameters
      const paymentSuccess = searchParams.get("payment_success") === "true"
      const bookingConfirmed = searchParams.get("booking_confirmed") === "true"
      const count = searchParams.get("supplier_count")
    
      if (paymentSuccess || bookingConfirmed) {
        setIsVisible(true)
        setSupplierCount(Number.parseInt(count) || confirmedSuppliers.length)
    
        // Trigger confetti animation
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
    
        // Clean up URL parameters after showing
        setTimeout(() => {
          const newSearchParams = new URLSearchParams(searchParams.toString())
          newSearchParams.delete("payment_success")
          newSearchParams.delete("booking_confirmed")
          newSearchParams.delete("supplier_count")
          newSearchParams.delete("timestamp")
    
          const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams}` : "")
          router.replace(newUrl, { scroll: false })
        }, 8000)
      }
    }, [searchParams, router, confirmedSuppliers.length])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="w-full mb-6 relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: ["#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#a78bfa"][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "3s",
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <Card className="border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-teal-100 shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <CardContent className="p-0 relative">
          {/* Main Content */}
          <div className="p-8 text-center relative">
            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0 z-20"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Hero Section with Mascot */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
              {/* Mascot */}
              <div className="relative">
                <div className="w-50 h-50 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg transform ">
                <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      className="w-full h-full"
    />
                </div>

                {/* Celebration effects around mascot */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center animate-pulse">
                  <PartyPopper className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Main Message */}
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-teal-500 via-primary-500 to-teal-600 bg-clip-text text-transparent">
                  IT'S OFFICIAL! 🎉
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 font-bold mb-2">Your party dream team is ready!</p>
                <p className="text-gray-600">They'll contact you within 24 hours ✨</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            

              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-primary-600 text-white font-bold py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => router.push("/e-invites")}
              >
                Create Invitations
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-2 border-teal-400 text-teal-600 hover:bg-teal-50 font-bold py-4 text-lg shadow-lg transform hover:scale-105 transition-all duration-200 bg-transparent"
                onClick={() => router.push("/gift-registry")}
              >
                Create Gift Registry
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Send stunning invites & let guests know what to bring!
            </p>

            {/* Floating celebration elements */}
            <div className="absolute top-8 left-8 w-3 h-3 bg-teal-400 rounded-full animate-ping opacity-70"></div>
            <div
              className="absolute top-12 right-16 w-2 h-2 bg-primary-400 rounded-full animate-ping opacity-60"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-8 left-16 w-2.5 h-2.5 bg-teal-500 rounded-full animate-ping opacity-50"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-12 right-12 w-2 h-2 bg-primary-500 rounded-full animate-ping opacity-60"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
