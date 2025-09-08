"use client"

import { useEffect, useState, useRef } from "react"
import { Check } from "lucide-react"
import Image from "next/image"

export default function AddingToPlanModal({ isAddingToPlan, loadingStep, theme = "default", progress }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const videoRef = useRef(null)

  const themeEmojis = {
    spiderman: "🕷️",
    "taylor-swift": "🎤",
    princess: "👑",
    dinosaur: "🦕",
    unicorn: "🦄",
    science: "🔬",
    superhero: "🦸",
    default: "🎉",
  }

  const stepMessages = [
    "Checking availability...",
    "Confirming package details...",
    "Updating your party plan...",
    "Finalizing your perfect party...",
    "🎉 Successfully added to your plan! 🎉",
  ]

 
  const currentEmoji = themeEmojis[theme] || themeEmojis["default"]

  useEffect(() => {
    if (!isAddingToPlan) return
    const video = videoRef.current
    if (video) {
      const handleLoaded = () => {
        video.currentTime = 1
        video.play()
      }
      video.addEventListener("loadedmetadata", handleLoaded)
      return () => video.removeEventListener("loadedmetadata", handleLoaded)
    }
  }, [isAddingToPlan])

  useEffect(() => {
    setCurrentMessageIndex(loadingStep < stepMessages.length - 1 ? loadingStep : stepMessages.length - 1)
  }, [loadingStep])

  if (!isAddingToPlan) return null

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#FFF5E6] to-white flex flex-col items-center justify-center overflow-auto px-4 text-center">
      {/* Video Animation */}
      <div className="relative w-full max-w-md mb-6 animate-fade-in-up">
        {/* <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="rounded-xl shadow-lg w-full"
          poster="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753111435/ChatGPT_Image_Jul_21_2025_04_23_41_PM_jv4v89.png"
        >
          <source
            src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753111543/output-4--unscreen_yl6to1.gif"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video> */}
        <img
  src="/output-4-.gif"
  alt="Celebration"
  className="§ rounded-xl mx-auto"
/>
      </div>

     
      {/* <p className="text-lg text-gray-600 max-w-md mb-6">
        {loadingStep >= 4
          ? "Your party selection has been successfully added!"
          : stepMessages[currentMessageIndex]}
      </p> */}

       {/* Progress Bar */}
       <div style={{  height: '20px'}} className="rounded-full bg-gray-200 md:w-[40%] w-[80%]">
  <div style={{ width: `${progress}%`, height: '100%' }} className="rounded-full bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))]" />
</div> 





      {/* Steps (icons) */}
      {/* <div className="w-full max-w-md space-y-3 mb-8">
        {["Checking availability", "Confirming details", "Updating plan", "Finalizing"].map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                index < loadingStep
                  ? "bg-green-500 shadow-lg"
                  : index === loadingStep
                  ? "bg-[#FF6B4A] animate-pulse shadow-lg"
                  : "bg-gray-200"
              }`}
            >
              {index < loadingStep ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <div
                  className={`w-3 h-3 rounded-full ${
                    index === loadingStep ? "bg-white animate-pulse" : "bg-gray-400"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                index < loadingStep
                  ? "text-green-600"
                  : index === loadingStep
                  ? "text-[#FF6B4A]"
                  : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div> */}

      {/* Success Box */}
      {loadingStep >= 4 && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl w-full max-w-md">
          <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
            <Check className="w-6 h-6" />
            <span className="font-bold text-lg">Success!</span>
          </div>
          <p className="text-sm text-green-600 font-medium">Redirecting to your dashboard...</p>
        </div>
      )}

      {/* Bouncing Dots Animation */}
      {loadingStep < 4 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-[#FF6B4A] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
