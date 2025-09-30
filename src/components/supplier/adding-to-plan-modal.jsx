"use client"

import { useEffect, useState } from "react"
import Lottie from "lottie-react"

export default function AddingToPlanModal({ isAddingToPlan }) {
  const [animationData, setAnimationData] = useState(null)

  // Fetch Lottie animation data
  useEffect(() => {
    fetch('https://res.cloudinary.com/dghzq6xtd/raw/upload/v1756851637/Animation_jgd2km.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error))
  }, [])

  if (!isAddingToPlan) return null

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#FFF5E6] to-white flex flex-col items-center justify-center overflow-auto px-4 text-center">
      {/* Lottie Animation */}
      <div className="relative w-1/2 max-w-md mb-2 animate-fade-in-up">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            className="rounded-xl w-full h-60"
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Message */}
      <p className="text-xl font-semibold text-gray-800 mb-4">
        Adding supplier to plan...
      </p>

      {/* Bouncing Dots Animation */}
      <div className="flex justify-center items-center space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-[#FF6B4A] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

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