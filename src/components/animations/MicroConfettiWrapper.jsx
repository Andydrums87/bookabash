// MicroConfettiWrapper.jsx - with detailed logging
"use client"
import { useState, useEffect, useRef } from 'react'

const MicroConfettiWrapper = ({ 
  children, 
  isNewlyAdded, 
  onAnimationComplete,
  duration = 2500
}) => {
  const [showEffect, setShowEffect] = useState(false)
  const hasAnimated = useRef(false)
  const animationTimeout = useRef(null)



  useEffect(() => {
   
    
    if (isNewlyAdded && !hasAnimated.current) {

      hasAnimated.current = true
      setShowEffect(true)
      
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
      
      animationTimeout.current = setTimeout(() => {

        setShowEffect(false)
        onAnimationComplete?.()

      }, duration)
      
      return () => {

        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current)
        }
      }
    }
    
    // ✅ CRITICAL: Reset when isNewlyAdded becomes false
    if (!isNewlyAdded && hasAnimated.current) {
     
      hasAnimated.current = false
      setShowEffect(false) // ✅ Force hide the badge
    }
  }, [isNewlyAdded, duration, onAnimationComplete])

  useEffect(() => {
    return () => {
      console.log('🧹 MicroConfetti unmounting')
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
    }
  }, [])



  return (
    <div className={`relative ${showEffect ? 'animate-card-shake' : ''}`}>
      {children}
      
      {showEffect && (
        <div className="absolute -top-3 -right-3 z-20 animate-snappy-slide-in">
          <div className="bg-teal-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 border-2 border-white">
            <img 
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361706/xpqvbguxzwdbtxnez0ew.png"
              alt="Snappy"
              className="w-10 h-10 rounded-full bg-white p-0.5"
            />
            <span className="text-sm font-bold">Added!</span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes snappy-slide-in {
          0% { 
            transform: translateX(120px) scale(0.3) rotate(-20deg); 
            opacity: 0; 
          }
          30% { 
            transform: translateX(-15px) scale(1.2) rotate(5deg); 
            opacity: 1; 
          }
          50% { 
            transform: translateX(8px) scale(0.9) rotate(-2deg); 
          }
          70% { 
            transform: translateX(-3px) scale(1.05) rotate(1deg); 
          }
          100% { 
            transform: translateX(0) scale(1) rotate(0deg); 
            opacity: 1; 
          }
        }
        
        @keyframes card-bounce {
          0% { 
            transform: scale(1); 
          }
          25% { 
            transform: scale(1.05); 
          }
          50% { 
            transform: scale(0.98); 
          }
          75% { 
            transform: scale(1.02); 
          }
          100% { 
            transform: scale(1); 
          }
        }
        
        .animate-snappy-slide-in {
          animation: snappy-slide-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-card-shake {
          animation: card-bounce 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default MicroConfettiWrapper