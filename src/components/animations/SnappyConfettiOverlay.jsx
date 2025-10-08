"use client"
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const SnappyConfettiOverlay = ({ 
  isNewlyAdded, 
  onAnimationComplete,
  duration = 2000 // 2 seconds
}) => {
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationData, setAnimationData] = useState(null)

  // Load the animation data
  useEffect(() => {
    fetch('https://res.cloudinary.com/dghzq6xtd/raw/upload/v1759218476/animation_1_ciulvf.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Failed to load Snappy animation:', error))
  }, [])

  useEffect(() => {
    if (isNewlyAdded) {
      console.log('🎊 Showing Snappy confetti animation')
      setShowAnimation(true)
      
      const timer = setTimeout(() => {
        setShowAnimation(false)
        onAnimationComplete?.()
        console.log('✅ Snappy confetti animation completed')
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isNewlyAdded, duration, onAnimationComplete])

  if (!showAnimation || !animationData) {
    return null
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
      <div className="w-full h-full">
        <Lottie 
          animationData={animationData}
          loop={false}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}

export default SnappyConfettiOverlay