"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PartyPopper, Wand2, Cake, Gift, Palette } from "lucide-react"
import Image from "next/image"

const funMessages = [
  "Stirring up the perfect celebration...",
  "Inflating the fun balloons...",
  "Sprinkling some party magic...",
  "Choosing the bestest theme ever...",
  "Getting the party started...",
  "Unleashing the confetti cannons!",
]

const icons = [
  <PartyPopper key="popper" className="h-12 w-12 text-primary-500" />,
  <Wand2 key="wand" className="h-12 w-12 text-pink-500" />,
  <Cake key="cake" className="h-12 w-12 text-yellow-500" />,
  <Gift key="gift" className="h-12 w-12 text-green-500" />,
  <Palette key="palette" className="h-12 w-12 text-purple-500" />,
]

export default function PlanningPartyPage() {
  const router = useRouter()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [currentIconIndex, setCurrentIconIndex] = useState(0)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % funMessages.length)
    }, 1500) // Change message every 1.5 seconds

    const iconInterval = setInterval(() => {
      setCurrentIconIndex((prevIndex) => (prevIndex + 1) % icons.length)
    }, 750) // Change icon faster

    // Simulate planning time and then redirect
    const planningTimeout = setTimeout(
      () => {
        router.push("/dashboard?show_welcome=true")
      },
      funMessages.length * 1500 + 500,
    ) // Total time based on messages

    return () => {
      clearInterval(messageInterval)
      clearInterval(iconInterval)
      clearTimeout(planningTimeout)
    }
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-100 via-pink-50 to-yellow-50 p-6 text-center">
      <div className="mb-8">
        <Image src="/logo-darker.png" alt="BookABash" width={200} height={60} className="object-contain" />
      </div>
      <div className="relative w-24 h-24 mb-8">
        {icons.map((icon, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${
              index === currentIconIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {icon}
          </div>
        ))}
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Hold on to your party hats!</h1>
      <p className="text-xl text-gray-700 animate-pulse">{funMessages[currentMessageIndex]}</p>
      <div className="mt-10 w-full max-w-md bg-white/50 p-3 rounded-full shadow-lg">
        <div
          className="h-4 bg-primary-500 rounded-full animate-loading-bar"
          style={{ animationDuration: `${funMessages.length * 1.5}s` }}
        ></div>
      </div>
      <style jsx global>{`
        @keyframes loading-bar-animation {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar-animation linear forwards;
        }
      `}</style>
    </div>
  )
}
