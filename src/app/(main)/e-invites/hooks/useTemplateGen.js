// hooks/useTemplateGen.js - Template-based invite generation using Canvas API

import { useState } from 'react'
import { validateRequiredFields } from '../utils/helperFunctions'
import { useToast } from '@/components/ui/toast'

export const useTemplateGen = (inviteData, selectedTheme, setGeneratedImage) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedInvite, setGeneratedInvite] = useState(null)

  const { toast } = useToast()

  // Helper function to get first name only
  const getFirstNameOnly = (fullName) => {
    if (!fullName) return ""
    return fullName.split(' ')[0]
  }

  // Generate invite using Canvas API (server-side node-canvas)
  const generateTemplateInvite = async () => {
    if (!validateRequiredFields(inviteData)) {
      toast.warning("Please fill in all party details before generating invite", {
        title: "Missing Information",
        duration: 4000
      })
      return null
    }

    setIsGenerating(true)

    try {
      const firstName = getFirstNameOnly(inviteData.childName)
      console.log("🎨 Generating canvas invite for:", firstName)

      const response = await fetch("/api/generate-canvas-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childName: firstName,
          age: inviteData.age,
          date: inviteData.date,
          time: inviteData.time,
          venue: inviteData.venue,
          theme: selectedTheme,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Generation failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.imageUrl) {
        const canvasInviteData = {
          type: "canvas",
          imageUrl: result.imageUrl,
          theme: selectedTheme,
          inviteData,
          metadata: result.metadata,
          timestamp: Date.now(),
        }

        setGeneratedInvite(canvasInviteData)
        setGeneratedImage(JSON.stringify(canvasInviteData))

        console.log("✅ Canvas invite generated successfully")

        toast.success("Your invitation has been created!", {
          title: "🎉 Invitation Ready",
          duration: 5000
        })

        return canvasInviteData
      } else {
        throw new Error(result.error || "Failed to generate invite")
      }
    } catch (error) {
      console.error("❌ Error generating canvas invite:", error)
      toast.error(`Failed to generate invite: ${error.message}`, {
        title: "Generation Failed",
        duration: 6000
      })
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  // Clear generated invite
  const clearInvite = () => {
    setGeneratedInvite(null)
    setGeneratedImage(null)
  }

  return {
    isGenerating,
    generatedInvite,
    generateTemplateInvite,
    clearInvite,
  }
}
