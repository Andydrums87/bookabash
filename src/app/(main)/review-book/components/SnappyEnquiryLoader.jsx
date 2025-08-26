"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

export default function SnappyEnquiryLoader({ 
  isOpen, 
  currentStep = 0,
  supplierCount = 0,
  error = null,
  childName = "your child"
}) {
  const [showConfetti, setShowConfetti] = useState(false)
  const videoRef = useRef(null)

  // Messages based on steps
  const stepMessages = [
    {
      title: "Getting Ready...",
      message: "Snappy's preparing to contact your amazing suppliers!"
    },
    {
      title: "Saving Your Party! 🎉",
      message: `Securing all the details for ${childName}'s special day...`
    },
    {
      title: "Booking Magic! ✨",
      message: `Snappy's securing ${supplierCount} amazing suppliers right now!`
    },
    {
      title: "Final Step! 🚀",
      message: `Taking you to payment to complete ${childName}'s amazing party!`
    }
  ]

  const currentMessage = stepMessages[currentStep] || stepMessages[0]

  // Handle video setup for all steps
  useEffect(() => {
    const video = videoRef.current
    if (video && isOpen) {
      const handleLoaded = () => {
        video.currentTime = 1
        video.play()
      }
      video.addEventListener("loadedmetadata", handleLoaded)
      return () => video.removeEventListener("loadedmetadata", handleLoaded)
    }
  }, [isOpen])

  // Show confetti on success
  useEffect(() => {
    if (currentStep === 3) {
      setShowConfetti(true)
      // Trigger confetti animation
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.confetti) {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Error state
  if (error) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-red-50 to-orange-50 border-0">
          <div className="text-center py-8">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-4xl">🐊</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops! Snappy Hit a Snag 🐊
            </h2>
            
            <div className="bg-white rounded-xl p-4 mb-6 border-2 border-red-200">
              <p className="text-red-700 font-medium mb-2">Something went wrong:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            
            <p className="text-gray-600 text-sm">
              Don't worry! Your party details are safe. Please try again or contact our support team.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-[#FFF5E6] to-white border-0">
        <div className="text-center py-8">
          
          {/* Snappy Video - Show during loading (steps 0-2) */}
          {currentStep < 3 && (
            <div className="relative w-50 h-50 mx-auto mb-8">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="rounded-xl w-full h-full object-contain"
                poster="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753083738/ChatGPT_Image_Jul_21_2025_08_42_11_AM_tznmag.png"
              >
                <source
                  src="https://res.cloudinary.com/dghzq6xtd/video/upload/v1753903344/output_9_q9q2cu.mp4"
                  type="video/mp4"
                />
                {/* Fallback if video doesn't load */}
                <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-6xl">🐊</span>
                </div>
              </video>
              
              {/* Floating sparkles around video during work */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-8 left-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-6 right-4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-12 left-8 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
              </div>
            </div>
          )}

          {/* Success Snappy - Static happy image for step 3 */}
          {currentStep === 3 && (
            <div className="w-50 h-50 mx-auto mb-8">
              <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-xl flex items-center justify-center border-2 border-[hsl(var(--primary-100))]">
                <span className="text-8xl animate-bounce"><img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753433572/kzz1v3k6lrtmyvqlcmsi.png" alt="" /></span>
              </div>
            </div>
          )}

          {/* Title and Message */}
          <h2 className="text-3xl font-black text-gray-800 mb-4">
            {currentMessage.title}
          </h2>
          
          <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
            {currentMessage.message}
          </p>

          {/* Progress Indicator - Only show during loading (steps 0-2) */}
          {currentStep < 3 && (
            <div className="space-y-4">
              {/* Fun progress bar */}
              <div className="w-full max-w-sm mx-auto bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] h-full transition-all duration-1000 ease-out"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              
              {/* Bouncing dots */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              
              <p className="text-sm text-gray-500">
                Snappy's working his magic... 🪄
              </p>
            </div>
          )}

          {/* Confetti overlay */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    fontSize: `${Math.random() * 10 + 15}px`
                  }}
                >
                  {['🎉', '🎊', '✨', '🎈', '🎂'][Math.floor(Math.random() * 5)]}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}