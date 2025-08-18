// hooks/useAIGen.js

import { useState } from 'react'
import { validateRequiredFields, getThemeElements } from '../utils/helperFunctions'
import { themes } from '@/lib/themes'
import { formatDateForDisplay } from '../utils/helperFunctions'
import { useToast } from '@/components/ui/toast'

export const useAIGen = (inviteData, selectedTheme, setGeneratedImage) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [useAIGeneration, setUseAIGeneration] = useState(false)
  const [aiOptions, setAiOptions] = useState([])
  const [selectedAiOption, setSelectedAiOption] = useState(null)
  const [showAiOptions, setShowAiOptions] = useState(false)

  // Helper function to get first name only
  const getFirstNameOnly = (fullName) => {
    if (!fullName) return ""
    return fullName.split(' ')[0]
  }

  const { toast } = useToast()
  const date = formatDateForDisplay(inviteData.date)

  // Generate AI-powered invite
  const generateAIInvite = async () => {
    if (!validateRequiredFields(inviteData)) {
      toast.warning("Please fill in all party details before generating AI invite", {
        title: "Missing Information",
        duration: 4000
      })
      return
    }

    setIsGeneratingAI(true)

    try {
      let partyTheme = "colorful kids party"
      let themeName = "colorful kids party"

      try {
        const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
        const partyResult = await partyDatabaseBackend.getCurrentParty()

        if (partyResult.success && partyResult.party) {
          partyTheme = partyResult.party.theme || selectedTheme
          themeName = themes[partyTheme]?.name || partyTheme || "colorful kids party"
          console.log("🎯 Using party theme from database:", partyTheme, "-", themeName)
        } else {
          partyTheme = selectedTheme
          themeName = themes[selectedTheme]?.name || "colorful kids party"
          console.log("🔄 Using fallback theme:", partyTheme, "-", themeName)
        }
      } catch (error) {
        console.warn("⚠️ Could not load party theme, using selected theme:", error)
        partyTheme = selectedTheme
        themeName = themes[selectedTheme]?.name || "colorful kids party"
      }

      // Extract first name only
      const firstName = getFirstNameOnly(inviteData.childName)
      console.log("Using first name:", firstName)

      const prompt = `Create a complete, high-quality 2D digital birthday party invitation for a ${themeName.toLowerCase()} theme. MAIN HEADING (large, prominent): "Join us for ${firstName}'s Birthday Party!"

PARTY DETAILS (clear and readable):
📅 Date: ${date}
🕐 Time: ${inviteData.time}  
📍 Location: ${inviteData.venue}

DESIGN REQUIREMENTS:
- Use vibrant, playful colors perfect for kids
- Include ${getThemeElements(partyTheme)} decorations throughout
- Make ALL text clearly readable with good contrast
- Portrait orientation (3:4 aspect ratio)
- Professional invitation layout with proper text hierarchy
- Leave some white space around text for clarity
- Make it print-ready and visually appealing

The invitation should look complete and ready to send, with all party information clearly displayed.`

      console.log("🎨 Generating AI invite with party theme:", partyTheme)

      const response = await fetch("/api/generate-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          childName: firstName, // Send first name only
          date: date,
          time: inviteData.time,
          venue: inviteData.venue,
          message: inviteData.message,
          theme: partyTheme,
          themeName: themeName,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.imageUrl) {
        const aiInviteData = {
          type: "ai-generated",
          imageUrl: result.imageUrl,
          prompt: prompt,
          theme: partyTheme,
          themeName: themeName,
          inviteData,
          timestamp: Date.now(),
        }

        setGeneratedImage(JSON.stringify(aiInviteData))
        setUseAIGeneration(true)
        console.log("✅ AI invite generated successfully with theme:", partyTheme)
        
        toast.success(`AI invite generated successfully using ${themeName} theme!`, {
          title: "🎉 Invitation Created",
          duration: 5000
        })
      } else {
        throw new Error(result.error || "Failed to generate AI invite")
      }
    } catch (error) {
      console.error("❌ Error generating AI invite:", error)
      toast.error(`Failed to generate AI invite: ${error.message}`, {
        title: "Generation Failed",
        duration: 6000
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Generate 5 AI-powered invite options
  const generateAIOptions = async () => {
    if (!validateRequiredFields(inviteData)) {
      toast.warning("Please fill in all party details before generating AI options", {
        title: "Missing Information",
        duration: 4000
      })
      return
    }

    setIsGeneratingAI(true)
    setAiOptions([])
    setShowAiOptions(false)

    try {
      let partyTheme = "colorful kids party"
      let themeName = "colorful kids party"

      try {
        const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
        const partyResult = await partyDatabaseBackend.getCurrentParty()

        if (partyResult.success && partyResult.party) {
          partyTheme = partyResult.party.theme || selectedTheme
          themeName = themes[partyTheme]?.name || partyTheme || "colorful kids party"
          console.log("🎯 Using party theme from database:", partyTheme, "-", themeName)
        } else {
          partyTheme = selectedTheme
          themeName = themes[selectedTheme]?.name || "colorful kids party"
          console.log("🔄 Using fallback theme:", partyTheme, "-", themeName)
        }
      } catch (error) {
        console.warn("⚠️ Could not load party theme, using selected theme:", error)
        partyTheme = selectedTheme
        themeName = themes[selectedTheme]?.name || "colorful kids party"
      }

      // Extract first name only
      const firstName = getFirstNameOnly(inviteData.childName)
      console.log("Using first name for options:", firstName)

      // Simple prompt with first name only
      const prompt = 
        `Create a vibrant ${themeName.toLowerCase()} themed birthday party invitation.

Include this information:
- Title: "${firstName} is turning ${inviteData.age}!" (write as one sentence)
- ${date}
- ${inviteData.time}
- ${inviteData.venue}

Design: Bright, colorful ${themeName.toLowerCase()} theme with ${getThemeElements(partyTheme)}. Fun and festive. Portrait orientation.

Important: Use only the exact information provided. No extra text.`

      const generatePromises = Array.from({ length: 5 }, (_, index) =>
        fetch("/api/generate-invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
            childName: firstName, // Send first name only
            date: date,
            time: inviteData.time,
            venue: inviteData.venue,
            theme: partyTheme,
            themeName: themeName,
          })
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Option ${index + 1} failed: ${response.status}`)
            }
            const result = await response.json()
            console.log('🔍 FRONTEND RECEIVED:', result)
            console.log('🔍 IMAGE URL:', result.imageUrl)
            console.log('🔍 IMAGE URL TYPE:', typeof result.imageUrl)
            return {
              id: `option-${index + 1}`,
              index: index + 1,
              imageUrl: result.imageUrl,
              prompt: result.prompt,
              metadata: result.metadata,
            }
          })
          .catch((error) => {
            console.error(`❌ Option ${index + 1} failed:`, error)
            return {
              id: `option-${index + 1}`,
              index: index + 1,
              error: error.message,
              imageUrl: null,
            }
          }),
      )

      const results = await Promise.all(generatePromises)
      const successfulOptions = results.filter((option) => option.imageUrl && !option.error)

      console.log(`✅ Generated ${successfulOptions.length}/5 AI invite options successfully`)

      if (successfulOptions.length > 0) {
        setAiOptions(successfulOptions)
        setShowAiOptions(true)
        setUseAIGeneration(true)
        
        toast.success(`Generated ${successfulOptions.length} AI invite options! Choose your favorite.`, {
          title: "🎉 Options Ready",
          duration: 5000
        })
      } else {
        throw new Error("All AI generation attempts failed")
      }
    } catch (error) {
      console.error("❌ Error generating AI options:", error)
      toast.error(`Failed to generate AI invites: ${error.message}`, {
        title: "Generation Failed",
        duration: 6000
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Select an AI option directly (no inpainting)
  const selectAiOption = async (option) => {
    setSelectedAiOption(option)
    
    // If option is null, we're clearing the AI selection
    if (!option) {
      console.log('✅ Cleared AI selection - switching to template mode')
      return
    }
    
    console.log(`✅ Selected AI option ${option.index} - no inpainting needed`)

    const aiInviteData = {
      type: "ai-generated",
      imageUrl: option.imageUrl,
      prompt: option.prompt,
      theme: selectedTheme,
      themeName: themes[selectedTheme]?.name,
      inviteData,
      timestamp: Date.now(),
      selectedOption: option.index,
    }

    setGeneratedImage(JSON.stringify(aiInviteData))
  }

  return {
    isGeneratingAI,
    useAIGeneration,
    setUseAIGeneration,
    aiOptions,
    selectedAiOption,
    showAiOptions,
    generateAIInvite,
    generateAIOptions,
    selectAiOption,
  }
}