"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export default function PartyBuilderLoader({ isVisible, theme, childName, progress }) {
  const [stage, setStage] = useState(0)

  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Ensure metadata is loaded before seeking
      const handleLoaded = () => {
        video.currentTime = 1
        video.play()
      }

      video.addEventListener("loadedmetadata", handleLoaded)
      return () => video.removeEventListener("loadedmetadata", handleLoaded)
    }
  }, [])

  const snappyFrames = [
    "https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853460/4_2_rifigx.png", // arms crossed
    "https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853548/2_t6hlea.png", // thinking
    "https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853551/1_1_lxuiqa.png", // balloon
    "https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853457/3_1_i0xvku.png", // pointing
  ]

  const messages = [
    `Snappy's planning the perfect ${theme} party...`,
    `Looking for awesome venues and entertainers...`,
    `Decorating with balloons and sparkles...`,
    `Final touches for ${childName}'s big day!`,
  ]

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % snappyFrames.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-400 bg-gradient-to-br from-[#FFF5E6] to-white flex flex-col items-center justify-center px-4 text-center">
      
      {/* Snappy Animation */}
      <div className="relative w-70 h-50 mb-6 animate-fade-in-up">
        {/* <Image
          src={snappyFrames[stage]}
          alt="Snappy building the party"
          fill
          className="object-contain"
        /> */}
     <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="rounded-xl shadow-lg w-full"
        poster="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753083738/ChatGPT_Image_Jul_21_2025_08_42_11_AM_tznmag.png"
      >
        <source
          src="https://res.cloudinary.com/dghzq6xtd/video/upload/v1753083603/wQEAljVs5VrDNI1dyE8t8_output_nowo6h.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
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
