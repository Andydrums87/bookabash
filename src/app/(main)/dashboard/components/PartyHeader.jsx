"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, Users, MapPin, Sparkles, Clock } from "lucide-react"
import EditPartyModal from "./EditPartyModal"

// Updated party details functions to integrate with your existing system
const savePartyDetails = (details) => {
  try {
    // Get existing details from localStorage
    const existingDetails = JSON.parse(localStorage.getItem("party_details") || "{}")
    // Merge with new details
    const updatedDetails = {
      ...existingDetails,
      ...details,
      // Ensure postcode is preserved if location looks like a postcode
      postcode:
        details.postcode ||
        (details.location?.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) ? details.location : existingDetails.postcode),
    }
    localStorage.setItem("party_details", JSON.stringify(updatedDetails))
    // Trigger storage event for any listeners
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "party_details",
        newValue: JSON.stringify(updatedDetails),
      }),
    )
    return updatedDetails
  } catch (error) {
    console.error("Error saving party details:", error)
    return details
  }
}

export default function PartyHeader({ theme, partyDetails, onPartyDetailsChange }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const currentTheme = theme

  const handleSavePartyDetails = (updatedDetails) => {
    console.log("💾 Saving party details:", updatedDetails)
    // Process the date for display if it's a Date object
    const processedDetails = { ...updatedDetails }
    if (updatedDetails.date instanceof Date) {
      // Format date for display in your existing format
      const dateStr = updatedDetails.date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const timeStr = updatedDetails.time
        ? new Date(`2000-01-01T${updatedDetails.time}`).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "2:00 PM"
      const endTimeStr = updatedDetails.time
        ? new Date(new Date(`2000-01-01T${updatedDetails.time}`).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            },
          )
        : "4:00 PM"
      processedDetails.date = `${dateStr} • ${timeStr} - ${endTimeStr}`
    }
    // Save to localStorage
    const savedDetails = savePartyDetails(processedDetails)
    // Notify parent component if callback provided
    if (onPartyDetailsChange) {
      onPartyDetailsChange(savedDetails)
    }
    console.log("✅ Party details updated:", savedDetails)
  }

  const handleEditClick = () => {
    setIsEditModalOpen(true)
  }

  // Function to parse date string back to Date object for the modal
  const getModalPartyDetails = () => {
    const details = { ...partyDetails }
    // If date is a string, try to parse it back to a Date object
    if (typeof details.date === "string" && details.date.includes("•")) {
      try {
        const datePart = details.date.split("•")[0].trim()
        const parsedDate = new Date(datePart)
        if (!isNaN(parsedDate.getTime())) {
          details.date = parsedDate
        }
      } catch (error) {
        console.log("Could not parse date:", error)
        details.date = new Date() // fallback to today
      }
    }
    // Ensure all required fields exist for the modal
    return {
      childName: details.childName || "Emma",
      childAge: details.childAge || 6,
      theme: details.theme || "princess",
      date: details.date || new Date(),
      time: details.time || "14:00",
      location: details.location || "W1A 1AA",
      guestCount: details.guestCount || "",
      budget: details.budget || "",
      specialNotes: details.specialNotes || "",
      postcode: details.postcode || details.location || "W1A 1AA",
      ...details,
    }
  }

  // Format time for display
  const formatTime = (time) => {
    if (!time) return null
    try {
      const timeObj = new Date(`2000-01-01T${time}`)
      return timeObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return time
    }
  }

  // Format guest count for display
  const formatGuestCount = (count) => {
    if (!count) return "Not specified"
    return `${count} guests`
  }

  return (
    <>
      <div style={{
  backgroundImage: "url('/party-pattern.svg'), linear-gradient(hsl(12 100% 68%)), hsl(14 100% 64%))",
  backgroundRepeat: 'repeat',
  backgroundSize: '100px, cover',
  backgroundPosition: 'center',
}} className="relative rounded-2xl shadow-2xl overflow-hidden mb-8 bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-16 h-16 bg-white rounded-full animate-pulse"></div>
          <div
            className="absolute top-12 right-12 w-8 h-8 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-8 left-16 w-12 h-12 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-16 right-8 w-6 h-6 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div>

        {/* Content */}
        <div className="relative p-4 md:p-10 text-white min-h-[180px] md:min-h-[320px] flex flex-col justify-center">
          <div className="space-y-3 md:space-y-6">
            {/* Theme Badge and Edit Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-semibold backdrop-blur-sm">
                  {currentTheme?.name || currentTheme} Party
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="p-2 md:p-3 h-auto text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 group backdrop-blur-sm border border-white/20"
                title="Edit party details"
              >
                <Edit className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
            </div>

            {/* Party Title - Enhanced typography */}
            <div className="space-y-1 md:space-y-2">
              <h1
                suppressHydrationWarning={true}
                className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight tracking-tight"
                style={{
                  textShadow: "0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {partyDetails?.childName || "Emma"}'s Big Day!
              </h1>
              <p className="text-base md:text-2xl text-white/95 drop-shadow-lg font-medium">
                {currentTheme?.description || `An amazing ${currentTheme} celebration`}
              </p>
            </div>

            {/* Party Details - Compact mobile, expanded desktop */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-4 pt-2 md:pt-4">
              {/* Date & Time Combined on Mobile */}
              <div className="flex flex-col space-y-0.5 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-md md:rounded-xl p-1.5 md:p-4 border border-white/20 md:col-span-1">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="p-0.5 md:p-2 bg-white/20 rounded-full">
                    <Calendar className="w-2.5 h-2.5 md:w-5 md:h-5" />
                  </div>
                  <p className="text-[10px] md:text-sm opacity-90 font-medium">Date</p>
                </div>
                <div className="space-y-0.5">
                  <p suppressHydrationWarning={true} className="font-bold text-[10px] md:text-base leading-tight">
                    {typeof partyDetails?.date === 'string' && partyDetails.date.includes('•') 
                      ? partyDetails.date.split('•')[0].trim().split(',')[1]?.trim() || "Jun 14"
                      : partyDetails?.date || "Jun 14, 2025"
                    }
                  </p>
                  <p suppressHydrationWarning={true} className="font-medium text-[9px] md:hidden opacity-80">
                    {typeof partyDetails?.date === 'string' && partyDetails.date.includes('•') 
                      ? partyDetails.date.split('•')[1]?.split('-')[0]?.trim() || "2:00 PM"
                      : formatTime(partyDetails?.time) || "2:00 PM"
                    }
                  </p>
                </div>
              </div>

              {/* Time - Desktop Only */}
              <div className="hidden md:flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Time</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base">
                  {typeof partyDetails?.date === 'string' && partyDetails.date.includes('•') 
                    ? partyDetails.date.split('•')[1]?.trim() || formatTime(partyDetails?.time) || "2:00 PM - 4:00 PM"
                    : formatTime(partyDetails?.time) || "2:00 PM - 4:00 PM"
                  }
                </p>
              </div>

              {/* Age & Guests Combined on Mobile */}
              <div className="flex flex-col space-y-0.5 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-md md:rounded-xl p-1.5 md:p-4 border border-white/20 md:col-span-1">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="p-0.5 md:p-2 bg-white/20 rounded-full">
                    <Users className="w-2.5 h-2.5 md:w-5 md:h-5" />
                  </div>
                  <p className="text-[10px] md:text-sm opacity-90 font-medium">Age</p>
                </div>
                <div className="space-y-0.5">
                  <p suppressHydrationWarning={true} className="font-bold text-[10px] md:text-base">
                    {partyDetails?.childAge || 6} years
                  </p>
                  <p suppressHydrationWarning={true} className="font-medium text-[9px] md:hidden opacity-80">
                    {partyDetails?.guestCount || "10"} guests
                  </p>
                </div>
              </div>

              {/* Guests - Desktop Only */}
              <div className="hidden md:flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Guests</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base">
                  {formatGuestCount(partyDetails?.guestCount)}
                </p>
              </div>

              {/* Location */}
              <div className="flex flex-col space-y-0.5 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-md md:rounded-xl p-1.5 md:p-4 border border-white/20 md:col-span-1">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="p-0.5 md:p-2 bg-white/20 rounded-full">
                    <MapPin className="w-2.5 h-2.5 md:w-5 md:h-5" />
                  </div>
                  <p className="text-[10px] md:text-sm opacity-90 font-medium">Where</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-[10px] md:text-base truncate">
                  {partyDetails?.location || "W1A 1AA"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary-300 to-secondary"></div>
      </div>

      {/* Edit Modal */}
      <EditPartyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        partyDetails={getModalPartyDetails()}
        onSave={handleSavePartyDetails}
      />
    </>
  )
}