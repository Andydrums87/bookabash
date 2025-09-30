"use client"
import { useState, useEffect } from "react"
import Lottie from "lottie-react"

export default function PartyBuilderLoader({ isVisible, theme, childName, progress }) {
  const [stage, setStage] = useState(0)
  const [animationData, setAnimationData] = useState(null)

  // Fetch Lottie animation data
  useEffect(() => {
    fetch('https://res.cloudinary.com/dghzq6xtd/raw/upload/v1759218865/animation_2_qv5kcd.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error))
  }, [])

  const messages = [
    `Snappy's planning the perfect ${theme} party...`,
    `Looking for awesome venues and entertainers...`,
    `Decorating with balloons and sparkles...`,
    `Final touches for ${childName}'s big day!`,
  ]

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % messages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible, messages.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-400 bg-gradient-to-br from-[#FFF5E6] to-white flex flex-col items-center justify-center px-4 text-center">
      
      {/* Snappy Animation */}
      <div className="relative w-70 h-50 mb-6 animate-fade-in-up">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Text */}
      <h1 className="text-3xl font-black text-gray-800 mb-4">Building Your Party!</h1>
      <p className="text-lg text-gray-600 max-w-md mb-6">
        {messages[stage]}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-gray-200 h-4 rounded-full overflow-hidden mb-4">
        <div
          className="bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] h-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xl font-bold text-primary-600">{Math.round(progress)}%</div>

      {/* Animation */}
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