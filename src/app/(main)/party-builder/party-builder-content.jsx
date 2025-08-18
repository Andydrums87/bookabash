"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePartyBuilder } from "@/utils/partyBuilderBackend"
import DashboardOnboardingRedesigned from "../dashboard/components/DashboardOnboarding"

export default function PartyBuilderPage() {
  const router = useRouter()
  const { buildParty } = usePartyBuilder()
  const [isBuilding, setIsBuilding] = useState(false)

  // Helper functions (moved from dashboard router)
  const mapThemeValue = (formTheme) => {
    const themeMapping = {
      spiderman: "spiderman",
      "spider-man": "spiderman", 
      "taylor-swift": "taylor-swift",
      "taylor swift": "taylor-swift",
      swiftie: "taylor-swift",
      princess: "princess",
      dinosaur: "dinosaur",
      dino: "dinosaur",
      unicorn: "unicorn",
      science: "science",
      scientist: "science",
      laboratory: "science",
      superhero: "superhero",
      superheroes: "superhero",
      hero: "superhero",
      action: "superhero",
      "fairy-tale": "princess",
      "fairy tale": "princess",
      royal: "princess",
      prehistoric: "dinosaur",
      jurassic: "dinosaur",
      magic: "unicorn",
      magical: "unicorn",
      rainbow: "unicorn",
      stem: "science",
      experiment: "science",
      chemistry: "science",
    }

    const lowerTheme = formTheme?.toLowerCase() || ""
    return themeMapping[lowerTheme] || lowerTheme || "superhero"
  }

  const mapPostcodeToLocation = (postcode) => {
    const postcodeMap = {
      "w3-7qd": "West London",
      "sw1-1aa": "Central London", 
      "e1-6an": "East London",
      "n1-9gu": "North London",
      "se1-9sg": "South London",
    }
    return postcodeMap[postcode] || "London"
  }

  const handlePartyBuilderSubmit = async (formData) => {
    if (isBuilding) return
    
    try {
      setIsBuilding(true)
      
      console.log("🎯 Party Builder: Processing form data:", formData)
      
      const partyDetails = {
        date: formData.date,
        theme: mapThemeValue(formData.theme),
        guestCount: Number.parseInt(formData.guestCount),
        location: mapPostcodeToLocation(formData.postcode || formData.location),
        postcode: formData.postcode || formData.location,
        childName: "Emma", // Default - can be updated later
        childAge: 6, // Default - can be updated later
        budget: formData.budget || 500,
        
        // NEW: Enhanced time handling from the redesigned form
        startTime: formData.startTime, // Already in 24-hour format: "14:00"
        endTime: formData.endTime, // Already calculated: "16:00"
        duration: formData.duration || 2,
        
        // Time preference metadata
        timePreference: formData.timePreference || {
          type: 'specific',
          startTime: formData.startTime,
          endTime: formData.endTime,
          duration: formData.duration
        }
      }

      console.log("🎯 Party Builder: Processed party details:", partyDetails)
      
      // Call the buildParty function
      const result = await buildParty(partyDetails)
  
      if (result.success) {
        console.log("✅ Party built successfully from Party Builder!")
        console.log("⏰ Time information:", {
          startTime: result.startTime,
          endTime: result.endTime,
          duration: result.duration
        })
        
        // Redirect to dashboard with welcome popup
        router.push("/dashboard?show_welcome=true")
        
      } else {
        console.error("❌ Failed to build party:", result.error)
        // TODO: Show error message to user
      }
      
    } catch (error) {
      console.error('❌ Error creating party plan:', error)
      // TODO: Show error message to user
    } finally {
      setIsBuilding(false)
    }
  }

  return (
    <DashboardOnboardingRedesigned 
      onFormSubmit={handlePartyBuilderSubmit}
      isSubmitting={isBuilding}
    />
  )
}