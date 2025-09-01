// 1. Fix EmptySupplierCard.jsx - Remove window usage
"use client"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Send } from "lucide-react"
import { useState, useEffect } from "react"

export default function EmptySupplierCard({
  type,
  openSupplierModal,
  getSupplierDisplayName,
  currentPhase = "planning",
  isSignedIn = false,
  enquiries = []
}) {
  // ✅ FIX: Handle client-side rendering safely
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getDisplayName = (supplierType) => {
    if (getSupplierDisplayName) {
      return getSupplierDisplayName(supplierType)
    }
    const displayNames = {
      venue: "Venue",
      entertainment: "Entertainment", 
      catering: "Catering",
      facePainting: "Face Painting",
      activities: "Activities",
      decorations: "Decorations",
      balloons: "Balloons",
      cakes: "Cakes",
      partyBags: "Party Bags",
    }
    return displayNames[supplierType] || supplierType.charAt(0).toUpperCase() + supplierType.slice(1)
  }

  const getPhaseContent = () => {
    switch (currentPhase) {
      case "planning":
        return {
          badgeText: "Available",
          badgeClass: "bg-gray-500 text-white",
          buttonText: `Snap Me Up! ${getDisplayName(type)} 🎉`,
          buttonIcon: <Plus className="w-5 h-5 mr-2" />,
          subtitle: "Snappy is excited to help you pick the perfect option!"
        }
      
      case "awaiting_responses":
        return {
          badgeText: "Add to Party",
          badgeClass: "bg-blue-500 text-white",
          buttonText: `Add ${getDisplayName(type)} Now`,
          buttonIcon: <Send className="w-5 h-5 mr-2" />,
          subtitle: "Send individual enquiry to expand your party team!"
        }
      
      case "confirmed":
        return {
          badgeText: "Add More",
          badgeClass: "bg-green-500 text-white", 
          buttonText: `Add ${getDisplayName(type)} Too`,
          buttonIcon: <Plus className="w-5 h-5 mr-2" />,
          subtitle: "Ready to expand your confirmed party team?"
        }
      
      default:
        return {
          badgeText: "Available",
          badgeClass: "bg-gray-500 text-white",
          buttonText: `Add ${getDisplayName(type)}`,
          buttonIcon: <Plus className="w-5 h-5 mr-2" />,
          subtitle: "Add to your party!"
        }
    }
  }

  const phaseContent = getPhaseContent()

  // ✅ Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <Card className="overflow-hidden rounded-2xl border-2 border-white shadow-xl h-80 animate-pulse">
        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="p-6">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className="overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative cursor-pointer group hover:shadow-2xl"
      onClick={() => openSupplierModal(type)}
    >
      <div className="relative h-48 sm:h-56 md:h-64 w-full bg-gradient-to-br from-[hsl(var(--primary-200))] via-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-8 w-16 h-16 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-16 right-12 w-8 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-12 left-16 w-12 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-20 right-8 w-6 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-800/50 to-gray-900/70" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-32 sm:w-36 md:w-40 h-32 sm:h-36 md:h-40 group-hover:scale-110 transition-transform duration-300">
            <div className="absolute inset-8 sm:inset-10 h-16 sm:h-20 md:h-30 w-16 sm:w-18 md:w-20 mx-auto bg-white rounded-full z-0" />
            <Image
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753875890/ChatGPT_Image_Jul_30_2025_12_44_41_PM_n9xltj.png"
              alt="Pick me!"
              fill
              className="object-contain drop-shadow-lg z-10"
            />
          </div>
        </div>

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge className="bg-[hsl(var(--primary-600))] text-white shadow-lg backdrop-blur-sm text-xs sm:text-sm">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
            <Badge className={`${phaseContent.badgeClass} shadow-lg backdrop-blur-sm text-xs sm:text-sm`}>
              {phaseContent.badgeText}
            </Badge>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 bg-white">
        <Button
          className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white shadow-lg text-sm sm:text-base"
          size="lg" // ✅ FIX: Use fixed size instead of window check
          onClick={() => {
            console.log('🔴 EmptySupplierCard clicked for type:', type)
            openSupplierModal(type)
          }}
        >
          {phaseContent.buttonIcon}
          {phaseContent.buttonText}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-3">
          {phaseContent.subtitle}
        </p>
      </div>
    </Card>
  )
}