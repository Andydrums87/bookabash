"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import Image from "next/image"

export default function AddingToPlanModal({ isAddingToPlan, loadingStep, theme = "default" }) {
  const [visibleImages, setVisibleImages] = useState([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  const partyImages = [
    { src: "/placeholder.svg?height=150&width=150", alt: "Kids enjoying party games" },
    { src: "/placeholder.svg?height=150&width=150", alt: "Children celebrating at party" },
    { src: "/placeholder.svg?height=150&width=150", alt: "Fun party activities" },
  ]

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
  const progress = Math.min((loadingStep + 1) * 25, 100)

  useEffect(() => {
    if (!isAddingToPlan) {
      setVisibleImages([])
      return
    }
    const addRandomImage = () => {
      const randomImage = partyImages[Math.floor(Math.random() * partyImages.length)]
      let top, left
      const placement = Math.random()
      if (placement < 0.4) {
        top = Math.random() * 20 + 5
        left = Math.random() * 80 + 10
      } else if (placement < 0.8) {
        top = Math.random() * 20 + 75
        left = Math.random() * 80 + 10
      } else {
        top = Math.random() * 60 + 20
        left = Math.random() < 0.5 ? Math.random() * 15 + 2 : Math.random() * 15 + 83
      }
      const randomPosition = {
        top,
        left,
        size: Math.random() * 100 + 120,
        rotation: Math.random() * 20 - 10,
        id: Date.now() + Math.random(),
      }
      setVisibleImages((prev) => [...prev, { ...randomImage, ...randomPosition }])
      setTimeout(() => setVisibleImages((prev) => prev.filter((img) => img.id !== randomPosition.id)), 4000)
    }
    setTimeout(addRandomImage, 200)
    const interval = setInterval(addRandomImage, 1500)
    return () => clearInterval(interval)
  }, [isAddingToPlan])

  useEffect(() => {
    setCurrentMessageIndex(loadingStep < stepMessages.length - 1 ? loadingStep : stepMessages.length - 1)
  }, [loadingStep, stepMessages.length])

  if (!isAddingToPlan) return null

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
      {visibleImages.map((image) => (
        <div
          key={image.id}
          className="absolute pointer-events-none animate-bounce-in-scale z-30"
          style={{
            top: `${image.top}%`,
            left: `${image.left}%`,
            transform: `rotate(${image.rotation}deg)`,
            animationDuration: "0.6s",
            animationFillMode: "forwards",
          }}
        >
          <div
            className="rounded-2xl shadow-2xl border-4 border-white overflow-hidden opacity-85 hover:opacity-100 transition-opacity duration-500"
            style={{ width: `${image.size}px`, height: `${image.size}px` }}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              width={image.size}
              height={image.size}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>
        </div>
      ))}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 max-w-lg mx-4 text-center relative z-20">
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">{loadingStep >= 4 ? "🎉" : currentEmoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {loadingStep >= 4 ? "Added to Plan!" : "Adding to Your Plan"}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {loadingStep >= 4
              ? "Your party selection has been successfully added!"
              : "Securing your perfect party addition..."}
          </p>
        </div>
        <div className="mb-8">
          <div className="bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FF6B4A] to-[#FF8A70] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-2xl font-bold text-[#FF6B4A] mb-6">{Math.round(progress)}%</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
          <p className="text-base text-gray-700 font-medium leading-relaxed animate-pulse">
            {stepMessages[currentMessageIndex]}
          </p>
        </div>
        <div className="w-full space-y-3 mb-8">
          {["Checking availability", "Confirming details", "Updating plan", "Finalizing"].map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${index < loadingStep ? "bg-green-500 shadow-lg" : index === loadingStep ? "bg-[#FF6B4A] animate-pulse shadow-lg" : "bg-gray-200"}`}
              >
                {index < loadingStep ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <div
                    className={`w-3 h-3 rounded-full ${index === loadingStep ? "bg-white animate-pulse" : "bg-gray-400"}`}
                  />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-300 ${index < loadingStep ? "text-green-600" : index === loadingStep ? "text-[#FF6B4A]" : "text-gray-400"}`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
        {loadingStep >= 4 && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl w-full">
            <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
              <Check className="w-6 h-6" />
              <span className="font-bold text-lg">Success!</span>
            </div>
            <p className="text-sm text-green-600 font-medium">Redirecting to your dashboard...</p>
          </div>
        )}
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
      </div>
      <style jsx>{`
        @keyframes bounce-in-scale { 0% { transform: scale(0) rotate(${Math.random() * 360}deg); opacity: 0; } 50% { transform: scale(1.1) rotate(${Math.random() * 20 - 10}deg); opacity: 0.9; } 100% { transform: scale(1) rotate(var(--final-rotation, 0deg)); opacity: 0.85; } }
        .animate-bounce-in-scale { animation: bounce-in-scale 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      `}</style>
    </div>
  )
}
