// components/ui/SnappyHelpSpot.jsx
"use client"
import { useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"

const SnappyHelpSpot = ({ 
  content, 
  side = "top", 
  className = "",
  snappyMessage = "Hey there! 👋"
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative inline-flex z-1000 ${className}`} >
      {/* Snappy Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 animate-bounce"
        style={{ animationDuration: '2s', animationIterationCount: '3' }}
      >
        <Image
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361706/xpqvbguxzwdbtxnez0ew.png"
          alt="Snappy Help"
          width={32}
          height={32}
          className="rounded-full"
        />
        
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full border-2 border-primary-300 animate-ping opacity-75"></div>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Snappy's Speech Bubble */}
          <div className={`absolute z-1000 w-72 bg-white rounded-2xl shadow-2xl border-2 border-primary-200 ${
            side === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'
          } left-1/2 transform -translate-x-1/2`}>
            
            {/* Header with Snappy */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-t-xl border-b border-primary-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-md">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361706/xpqvbguxzwdbtxnez0ew.png"
                  alt="Snappy"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary-700 text-sm">Snappy Says:</h4>
                <p className="text-xs text-primary-600">{snappyMessage}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Message Content */}
            <div className="p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
            </div>
            
            {/* Speech Bubble Arrow */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 ${
              side === 'top' 
                ? 'top-full' 
                : 'bottom-full'
            }`}>
              <div className={`w-0 h-0 ${
                side === 'top'
                  ? 'border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-white'
                  : 'border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-white'
              }`} />
              <div className={`absolute left-1/2 transform -translate-x-1/2 ${
                side === 'top' ? '-top-[1px]' : '-bottom-[1px]'
              }`}>
                <div className={`w-0 h-0 ${
                  side === 'top'
                    ? 'border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-primary-200'
                    : 'border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-primary-200'
                }`} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SnappyHelpSpot