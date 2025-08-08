// hooks/useAIGen.js

import { useState } from 'react'
import { validateRequiredFields, getThemeElements } from '../utils/helperFunctions'
import { themes } from '@/lib/themes'
import { formatDateForDisplay } from '../utils/helperFunctions'

export const useAIGen = (inviteData, selectedTheme, setGeneratedImage) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [useAIGeneration, setUseAIGeneration] = useState(false)
  const [aiOptions, setAiOptions] = useState([])
  const [selectedAiOption, setSelectedAiOption] = useState(null)
  const [showAiOptions, setShowAiOptions] = useState(false)

  const date = formatDateForDisplay(inviteData.date)



  // Generate AI-powered invite
  const generateAIInvite = async () => {
    if (!validateRequiredFields(inviteData)) {
      alert("Please fill in all party details before generating AI invite")
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

      const prompt = `Create a complete, high-quality 2D digital birthday party invitation for a ${themeName.toLowerCase()} theme. MAIN HEADING (large, prominent): "Join us for ${inviteData.childName}'s Birthday Party!"

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
          childName: inviteData.childName,
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
        alert(`🎉 AI invite generated successfully using ${themeName} theme!`)
      } else {
        throw new Error(result.error || "Failed to generate AI invite")
      }
    } catch (error) {
      console.error("❌ Error generating AI invite:", error)
      alert(`Failed to generate AI invite: ${error.message}`)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Generate 5 AI-powered invite options
  const generateAIOptions = async () => {
    if (!validateRequiredFields(inviteData)) {
      alert("Please fill in all party details before generating AI options")
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

      const referenceImageUrl = "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754315489/invite-ref_ic1e1w.png"
      const prompt = 
        `URGENT: Create a birthday party invitation with a ${themeName.toLowerCase()} theme.

**CRITICAL - COMPLETE THEME REPLACEMENT:**

- CREATE a bright, colorful ${themeName.toLowerCase()} theme instead

- REPLACE ALL decorations with ${themeName.toLowerCase()} elements only
- This must look like a ${themeName.toLowerCase()} party invitation

**EXACT TEXT AND POSITIONING:**
- Main heading: "${inviteData.childName} is turning ${inviteData.age}!"
- Date information layout: "${date}" on the LEFT, "PARTY TIME" in the CENTER circle/bubble, "${inviteData.time}" on the RIGHT
- Venue: "${inviteData.venue}"

**SPECIFIC LAYOUT REQUIREMENTS:**
- Use the three-section layout for date/center-text/time (left-center-right)
- Put celebratory text like "JOIN US" or "PARTY TIME" in the middle circular element
- Date goes on the left side of the middle section
- Time goes on the right side of the middle section

**VISUAL STYLE:** Bright, cheerful ${themeName.toLowerCase()} theme with ${getThemeElements(partyTheme)}. Professional layout but 100% ${themeName.toLowerCase()} decorations.`

      const generatePromises = Array.from({ length: 5 }, (_, index) =>
        fetch("/api/generate-invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
            childName: inviteData.childName,
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
        alert(`🎉 Generated ${successfulOptions.length} AI invite options! Choose your favorite.`)
      } else {
        throw new Error("All AI generation attempts failed")
      }
    } catch (error) {
      console.error("❌ Error generating AI options:", error)
      alert(`Failed to generate AI invites: ${error.message}`)
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