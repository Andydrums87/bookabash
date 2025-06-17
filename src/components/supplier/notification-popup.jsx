"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function NotificationPopup({ notification }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (notification) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  if (!notification || !isVisible) {
    return null
  }

  let bgColor = "bg-red-500"
  let IconComponent = AlertCircle

  if (notification.type === "success") {
    bgColor = "bg-green-500"
    IconComponent = CheckCircle
  } else if (notification.type === "warning") {
    bgColor = "bg-yellow-500"
  } else if (notification.type === "info") {
    bgColor = "bg-blue-500"
    IconComponent = AlertCircle
  }

  return (
    <div
      className={`fixed top-4 right-4 z-[100] p-4 rounded-lg shadow-lg max-w-sm text-white ${bgColor} transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex items-center">
        <IconComponent className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">{notification.message}</span>
      </div>
    </div>
  )
}