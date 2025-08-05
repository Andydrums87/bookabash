// hooks/useSaveState.js

import { useState, useEffect } from 'react'
import { AlertCircle, Check, Send } from 'lucide-react'
import { getCurrentState, checkForUnsavedChanges, generateInviteId, copyToClipboard, formatThemeDisplayName } from '../utils/helperFunctions'
import { SAVE_BUTTON_STATES } from '../constants/inviteConstants'

export const useSaveState = (selectedTheme, inviteData, guestList, generatedImage, useAIGeneration, themes) => {
  const [isSaved, setIsSaved] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedState, setLastSavedState] = useState(null)
  const [shareableLink, setShareableLink] = useState("")

  // Update unsaved changes status
  useEffect(() => {
    const currentState = getCurrentState(selectedTheme, inviteData, guestList, generatedImage, useAIGeneration)
    const hasChanges = checkForUnsavedChanges(lastSavedState, currentState)
    setHasUnsavedChanges(hasChanges)
    if (hasChanges && isSaved) {
      setIsSaved(false)
    }
  }, [selectedTheme, inviteData, guestList, generatedImage, lastSavedState, useAIGeneration])

  // Generate shareable link
  const generateShareableLink = async () => {
    console.log("🔍 generateShareableLink called")
    const inviteId = generateInviteId()
    const link = `${window.location.origin}/e-invites/${inviteId}`
    console.log("🔗 Generated link:", link)
    console.log("🌐 Window location origin:", window.location.origin)
    setShareableLink(link)

    try {
      // Import the database backend
      const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
      
      // Get current party ID
      const partyResult = await partyDatabaseBackend.getCurrentParty()
      
      if (partyResult.success && partyResult.party) {
        // Create public invite record in database
        const publicInviteResult = await partyDatabaseBackend.createPublicInvite({
          inviteId,
          partyId: partyResult.party.id,
          theme: selectedTheme,
          inviteData: inviteData,
          generatedImage: generatedImage,
          generationType: useAIGeneration ? "ai" : "template",
          shareableLink: link,
        })

        if (publicInviteResult.success) {
          console.log("✅ Public invite saved to database")
        } else {
          console.error("❌ Database save failed, using localStorage")
          // Fallback to localStorage
          const publicInvite = {
            id: inviteId,
            theme: selectedTheme,
            inviteData,
            generatedImage,
            generationType: useAIGeneration ? "ai" : "template",
            createdAt: new Date().toISOString(),
          }
          localStorage.setItem(`public_invite_${inviteId}`, JSON.stringify(publicInvite))
        }
      }
    } catch (error) {
      console.error("❌ Error:", error)
      // Fallback to localStorage
      const publicInvite = {
        id: inviteId,
        theme: selectedTheme,
        inviteData,
        generatedImage,
        generationType: useAIGeneration ? "ai" : "template",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(`public_invite_${inviteId}`, JSON.stringify(publicInvite))
    }

    return link
  }

  // Copy shareable link
  const copyShareableLink = async () => {
    const link = await generateShareableLink() 
    const success = await copyToClipboard(link)
    if (success) {
      alert("Invite link copied to clipboard!")
    }
  }

  // Save invite to database
  const saveInviteToPartyPlan = async (finalImageUrl = null) => {
    const imageToSave = finalImageUrl || generatedImage
    
    if (!imageToSave) {
      console.error("No invite image generated yet")
      alert("Please wait for the invite to generate before saving.")
      return false
    }

    try {
      const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
      console.log("🔍 Getting current party...")
      const partyResult = await partyDatabaseBackend.getCurrentParty()

      console.log("📊 Party result:", partyResult)

      if (!partyResult.success) {
        console.error("❌ Failed to get current party:", partyResult.error)
        alert(
          `No active party found. Please create a party first from the Party Builder.\n\nError: ${partyResult.error}`,
        )
        return false
      }

      if (!partyResult.party) {
        console.error("❌ No party data returned")
        alert("No active party found. Please create a party first from the Party Builder.")
        return false
      }

      const party = partyResult.party
      console.log("✅ Found party:", party.id, "-", party.child_name)

      const currentPlan = party.party_plan || {}
      console.log("📋 Current party plan keys:", Object.keys(currentPlan))

      const themeForDisplay = formatThemeDisplayName(useAIGeneration, selectedTheme, themes)

      const einvitesData = {
        id: "digital-invites",
        name: `${inviteData.childName}'s ${themeForDisplay} Invites`,
        description: useAIGeneration
          ? `Custom AI-generated digital invitations`
          : `Custom ${selectedTheme} themed digital invitations`,
        price: 25,
        status: "completed",
        image: imageToSave,
        category: "Digital Services",
        priceUnit: "per set",
        theme: selectedTheme,
        inviteData: inviteData,
        guestList: guestList,
        shareableLink: shareableLink,
        generationType: useAIGeneration ? "ai" : "template",
        addedAt: currentPlan.einvites?.addedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log("💾 Preparing to save einvites data:", {
        partyId: party.id,
        generationType: useAIGeneration ? "AI" : "Template",
        theme: selectedTheme,
        childName: inviteData.childName,
      })

      currentPlan.einvites = einvitesData

      console.log("📤 Calling updatePartyPlan...")
      const updateResult = await partyDatabaseBackend.updatePartyPlan(party.id, currentPlan)

      console.log("📊 Update result:", updateResult)

      if (updateResult.success) {
        setIsSaved(true)
        setHasUnsavedChanges(false)
        setLastSavedState(getCurrentState(selectedTheme, inviteData, guestList, generatedImage, useAIGeneration))

        console.log("✅ E-invite saved to database successfully!")
        console.log("🔍 Saved to party ID:", party.id)

        alert(
          `✅ E-invite saved successfully!\n\nParty: ${party.child_name}'s Birthday\nType: ${useAIGeneration ? "AI Generated" : themeForDisplay}\nParty ID: ${party.id}`,
        )

        return true
      } else {
        console.error("❌ Failed to update party plan:", updateResult.error)
        alert(`Failed to save e-invite to database.\n\nError: ${updateResult.error}`)
        return false
      }
    } catch (error) {
      console.error("❌ Error saving invite to database:", error)
      alert(`Error saving e-invite: ${error.message}`)
      return false
    }
  }

  // Get save button state
  const getSaveButtonState = () => {
    if (!generatedImage) {
      return {
        disabled: true,
        className: "bg-gray-400",
        text: "Generating...",
        icon: <AlertCircle className="w-4 h-4 mr-2" />,
      }
    }

    if (isSaved && !hasUnsavedChanges) {
      return {
        disabled: false,
        className: "bg-green-600 hover:bg-green-700",
        text: "Saved to Dashboard",
        icon: <Check className="w-4 h-4 mr-2" />,
      }
    }

    if (hasUnsavedChanges) {
      return {
        disabled: false,
        className: "bg-orange-600 hover:bg-orange-700",
        text: "Save Changes",
        icon: <AlertCircle className="w-4 h-4 mr-2" />,
      }
    }

    return {
      disabled: false,
      className: "bg-blue-600 hover:bg-blue-700",
      text: "Save to Dashboard",
      icon: <Send className="w-4 h-4 mr-2" />,
    }
  }

  return {
    isSaved,
    setIsSaved,
    hasUnsavedChanges,
    lastSavedState,
    setLastSavedState,
    shareableLink,
    setShareableLink,
    generateShareableLink,
    copyShareableLink,
    saveInviteToPartyPlan,
    getSaveButtonState,
  }
}