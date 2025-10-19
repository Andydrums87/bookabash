"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function FloatingCTA() {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Check if we're on mobile (screen width < 1024px, which is Tailwind's lg breakpoint)
      const isMobile = window.innerWidth < 1024
      
      // Don't show on desktop at all
      if (!isMobile) {
        setShowFloatingCTA(false)
        return
      }

      // Get the mobile search form element
      const mobileForm = document.getElementById('search-form')
      
      if (!mobileForm) {
        // If mobile form doesn't exist, don't show CTA
        setShowFloatingCTA(false)
        return
      }

      // Get the position of the mobile form
      const formRect = mobileForm.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Check if mobile form is visible in viewport
      const isFormVisible = formRect.top < windowHeight && formRect.bottom > 0

      // Show CTA only if:
      // 1. We're on mobile
      // 2. User has scrolled down more than 50px
      // 3. Mobile form is NOT visible in viewport
      if (window.scrollY > 50 && !isFormVisible) {
        setShowFloatingCTA(true)
      } else {
        setShowFloatingCTA(false)
      }
    }

    // Run on mount and scroll
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    
    // Also listen for resize in case viewport changes
    window.addEventListener('resize', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
      showFloatingCTA 
        ? 'translate-y-0 opacity-100' 
        : 'translate-y-16 opacity-0 pointer-events-none'
    }`}>
      <button
        onClick={() => {
          // Scroll to the mobile search form
          const mobileForm = document.getElementById('search-form')
          if (mobileForm) {
            // Get the position of the form
            const formRect = mobileForm.getBoundingClientRect()
            const absoluteTop = formRect.top + window.pageYOffset

            // Scroll with offset to ensure form is visible and not hidden by any fixed headers
            window.scrollTo({
              top: absoluteTop - 20, // 20px offset from top
              behavior: 'smooth'
            })
          }
        }}
        className="bg-white active:scale-200 active:bg-[hsl(var(--primary-100))] hover:bg-gray-50 text-[hsl(var(--primary-500))] font-bold h-16 w-64 sm:w-72 rounded-full transition-all duration-300 transform hover:scale-105 relative overflow-hidden group border-2 border-[hsl(var(--primary-500))] animate-bounce-gentle shadow-lg hover:shadow-2xl"
        style={{
          boxShadow: '0 0 30px rgba(255, 107, 107, 0.4), 0 8px 32px rgba(0, 0, 0, 0.15)',
          animation: showFloatingCTA ? 'float 3s ease-in-out infinite' : 'none'
        }}
      >
        {/* Button background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--primary-100))] to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500 transform -skew-x-12"></div>
        
        <div className="flex items-center justify-center relative z-10 h-full">
          Plan My Party! <span className="text-2xl ml-2">🎉</span>
        </div>
      </button>
      
      {/* Snappy the crocodile */}
      <div className="w-20 h-20 absolute top-2 left-[-15px] z-200">
        <Image
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752828180/ChatGPT_Image_Jul_18_2025_09_42_44_AM_k0a9wh.png"
          alt="Snappy the crocodile"
          fill
          className="object-contain"
          sizes="100vw 100vh"
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}