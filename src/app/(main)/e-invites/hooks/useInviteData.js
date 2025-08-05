// hooks/useInviteData.js

import { useState, useEffect } from 'react'
import { DEFAULT_INVITE_DATA } from '../constants/inviteConstants'

export const useInviteData = () => {
  const [selectedTheme, setSelectedTheme] = useState("princess")
  const [inviteData, setInviteData] = useState(DEFAULT_INVITE_DATA)
  const [generatedImage, setGeneratedImage] = useState(null)

  // Load existing invite data on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log("🔍 Loading existing e-invite data...")
        const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
        const partyResult = await partyDatabaseBackend.getCurrentParty()

        console.log("📊 Party result:", partyResult)

        if (partyResult.success && partyResult.party) {
          const party = partyResult.party
          const partyPlan = party.party_plan || {}

          console.log("🎉 Found party:", party.id, "-", party.child_name)
          console.log("📋 Party plan keys:", Object.keys(partyPlan))

          if (partyPlan.einvites) {
            const einvites = partyPlan.einvites
            console.log("✅ Found existing einvites:", einvites)

            const themeToUse = einvites.theme || party.theme || "princess"
            setSelectedTheme(themeToUse)

            const inviteDataToUse = einvites.inviteData || {
              childName: party.child_name || "",
              age: party.child_age?.toString() || "",
              date: party.party_date || "",
              time: party.party_time || "",
              venue: party.location || "",
              message: "Join us for an amazing adventure!",
              headline: "default",
            }

            setInviteData(inviteDataToUse)

            if (einvites.image && einvites.image !== "/placeholder.jpg") {
              setGeneratedImage(einvites.image)
            }

            console.log("✅ Loaded einvites data:", {
              theme: themeToUse,
              childName: inviteDataToUse.childName,
              hasImage: !!einvites.image && einvites.image !== "/placeholder.jpg",
            })
          } else {
            console.log("ℹ️ No einvites yet, populating with party details")
            setInviteData({
              childName: party.child_name || "",
              age: party.child_age?.toString() || "",
              date: party.party_date || "",
              time: party.party_time || "",
              venue: party.location || "",
              message: "Join us for an amazing adventure!",
              headline: "default",
            })

            if (party.theme) {
              setSelectedTheme(party.theme)
            }
          }
        } else {
          console.log("⚠️ No current party found, using empty defaults")
          setInviteData(DEFAULT_INVITE_DATA)
        }
      } catch (error) {
        console.error("❌ Error loading existing invite data:", error)
      }
    }

    loadExistingData()
  }, [])

  const handleInputChange = (field, value) => {
    setInviteData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return {
    selectedTheme,
    setSelectedTheme,
    inviteData,
    setInviteData,
    generatedImage,
    setGeneratedImage,
    handleInputChange,
  }
}