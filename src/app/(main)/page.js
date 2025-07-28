"use client"
import { useState } from "react"

import { useRouter } from "next/navigation"
import { usePartyBuilder } from "@/utils/partyBuilderBackend"
import Hero from "@/components/Home/Hero"
import MobileSearchForm from "@/components/Home/MobileSearchForm"
import PartyBuildingLoader from "@/components/Home/PartyBuildingLoader"
import TrustIndicators from "@/components/Home/TrustIndicators"
import CategoryGrid from "@/components/Home/CategoryGrid"
import HowItWorks from "@/components/Home/HowItWorks"
import CustomerStories from "@/components/Home/CustomerStories"
import FinalCTA from "@/components/Home/FinalCTA"

export default function HomePage() {
  const router = useRouter()
  const { buildParty, loading, error } = usePartyBuilder()

  // Form state
  const [formData, setFormData] = useState({
    date: "2025-08-16",
    theme: "princess",
    guestCount: "15",
    postcode: "",
    childName: "",
    childAge: 6,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPartyLoader, setShowPartyLoader] = useState(false)
  const [buildingProgress, setBuildingProgress] = useState(0)
  const [postcodeValid, setPostcodeValid] = useState(true)

  const handleFieldChange = (field, value) => {
    console.log("🔄 handleFieldChange called with:", { field, value })
    if (field === "postcode") {
      console.log("🚨 POSTCODE field update detected!")
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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

  const validateAndFormatPostcode = (postcode) => {
    if (!postcode) return { isValid: true, formatted: "" }
    const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i
    const isValid = UK_POSTCODE_REGEX.test(postcode.trim())

    let formatted = postcode
    if (isValid) {
      const clean = postcode.replace(/\s/g, "").toUpperCase()
      if (clean.length >= 5) {
        formatted = clean.slice(0, -3) + " " + clean.slice(-3)
      }
    }
    return { isValid, formatted }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setTimeout(() => {
        setShowPartyLoader(true)
        setBuildingProgress(0)
      }, 200)

      const partyDetails = {
        date: formData.date,
        theme: mapThemeValue(formData.theme),
        guestCount: Number.parseInt(formData.guestCount),
        location: mapPostcodeToLocation(formData.postcode), // Keep this as "London" 
        postcode: formData.postcode, // ← ADD THIS - save the actual postcode
        childName: formData.childName || "Your Child",
        childAge: formData.childAge,
        budget: 500,
      }

      console.log("🎪 Submitting party with theme:", partyDetails.theme)

      setBuildingProgress(15)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setBuildingProgress(30)
      await new Promise((resolve) => setTimeout(resolve, 600))
      setBuildingProgress(50)

      const result = await buildParty(partyDetails)
      setBuildingProgress(75)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setBuildingProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 600))

      if (result.success) {
        setBuildingProgress(100)
        console.log("✅ Party built successfully with themed entertainment!")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        router.push("/dashboard?show_welcome=true")
      } else {
        console.error("Failed to build party:", result.error)
        setIsSubmitting(false)
        setShowPartyLoader(false)
        setBuildingProgress(0)
      }
    } catch (error) {
      console.error("Error during party building:", error)
      setIsSubmitting(false)
      setShowPartyLoader(false)
      setBuildingProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">

      <PartyBuildingLoader
        isVisible={showPartyLoader}
        theme={mapThemeValue(formData.theme)}
        childName={formData.childName || "Your Child"}
        progress={buildingProgress}
      />

      <Hero
        handleSearch={handleSearch}
        formData={formData}
        handleFieldChange={handleFieldChange}
        postcodeValid={postcodeValid}
        setPostcodeValid={setPostcodeValid}
        validateAndFormatPostcode={validateAndFormatPostcode}
        isSubmitting={isSubmitting}
      />

      <MobileSearchForm
        handleSearch={handleSearch}
        formData={formData}
        handleFieldChange={handleFieldChange}
        postcodeValid={postcodeValid}
        setPostcodeValid={setPostcodeValid}
        validateAndFormatPostcode={validateAndFormatPostcode}
        isSubmitting={isSubmitting}
      />

      <TrustIndicators />
      <CategoryGrid />
      <HowItWorks />
      <CustomerStories />
      <FinalCTA />
    </div>
  )
}
