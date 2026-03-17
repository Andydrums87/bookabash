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

      // Always use the user-selected theme from the dropdown
      partyTheme = selectedTheme
      themeName = themes[selectedTheme]?.name || selectedTheme || "colorful kids party"
      console.log("🎯 Using selected theme:", partyTheme, "-", themeName)

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

      // Always use the user-selected theme from the dropdown
      partyTheme = selectedTheme
      themeName = themes[selectedTheme]?.name || selectedTheme || "colorful kids party"
      console.log("🎯 Using selected theme for options:", partyTheme, "-", themeName)

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

  // Generate a single verified invite with retry logic
  // Generates ONE image, verifies with OCR, retries if fails, caps at maxAttempts
  const generateVerifiedInvite = async (maxAttempts = 7, onProgress = null) => {
    if (!validateRequiredFields(inviteData)) {
      toast.warning("Please fill in all party details before generating", {
        title: "Missing Information",
        duration: 4000
      })
      return null
    }

    setIsGeneratingAI(true)
    setAiOptions([])
    setShowAiOptions(false)

    try {
      let partyTheme = "colorful kids party"
      let themeName = "colorful kids party"

      // Always use the user-selected theme from the dropdown
      partyTheme = selectedTheme
      themeName = themes[selectedTheme]?.name || selectedTheme || "colorful kids party"
      console.log("🎯 Using selected theme for verified invite:", partyTheme, "-", themeName)

      const firstName = getFirstNameOnly(inviteData.childName)

      const prompt =
        `Create a vibrant ${themeName.toLowerCase()} themed birthday party invitation.

Include this information:
- Title: "${firstName} is turning ${inviteData.age}!" (write as one sentence)
- ${date}
- ${inviteData.time}
- ${inviteData.venue}

Design: Bright, colorful ${themeName.toLowerCase()} theme with ${getThemeElements(partyTheme)}. Fun and festive. Portrait orientation.

Important: Use only the exact information provided. No extra text.`

      let attempt = 0
      let verifiedOption = null

      while (attempt < maxAttempts && !verifiedOption) {
        attempt++
        console.log(`🎨 Attempt ${attempt}/${maxAttempts}: Generating invite...`)

        // Report progress
        if (onProgress) {
          onProgress({ attempt, maxAttempts, status: 'generating' })
        }

        try {
          // Generate one image
          const response = await fetch("/api/generate-invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: prompt,
              childName: firstName,
              date: date,
              time: inviteData.time,
              venue: inviteData.venue,
              theme: partyTheme,
              themeName: themeName,
            })
          })

          if (!response.ok) {
            console.error(`❌ Attempt ${attempt} generation failed: ${response.status}`)
            continue
          }

          const result = await response.json()

          if (!result.imageUrl) {
            console.error(`❌ Attempt ${attempt}: No image URL returned`)
            continue
          }

          console.log(`✅ Attempt ${attempt}: Image generated, verifying text...`)

          // Report progress - verifying
          if (onProgress) {
            onProgress({ attempt, maxAttempts, status: 'verifying', imageUrl: result.imageUrl })
          }

          // Verify with OCR
          const verifyResponse = await fetch('/api/verify-invite-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: result.imageUrl,
              expectedData: {
                childName: inviteData.childName,
                date: inviteData.date,
                time: inviteData.time,
                venue: inviteData.venue
              }
            })
          })

          const verifyResult = await verifyResponse.json()
          console.log(`🔍 Attempt ${attempt} verification:`, verifyResult)

          if (verifyResult.isValid) {
            // Found a valid invite!
            console.log(`🎉 Attempt ${attempt}: PASSED verification (${verifyResult.passedChecks}/${verifyResult.totalChecks})`)

            verifiedOption = {
              id: `verified-option`,
              index: 1,
              imageUrl: result.imageUrl,
              prompt: prompt,
              metadata: result.metadata,
              verification: {
                isValid: true,
                passedChecks: verifyResult.passedChecks,
                totalChecks: verifyResult.totalChecks,
                verification: verifyResult.verification,
                attempts: attempt
              }
            }
          } else {
            console.log(`⚠️ Attempt ${attempt}: Failed verification (${verifyResult.passedChecks}/${verifyResult.totalChecks}), retrying...`)
          }
        } catch (error) {
          console.error(`❌ Attempt ${attempt} error:`, error)
        }
      }

      if (verifiedOption) {
        setAiOptions([verifiedOption])
        setSelectedAiOption(verifiedOption)
        setShowAiOptions(true)
        setUseAIGeneration(true)

        const aiInviteData = {
          type: "ai-generated",
          imageUrl: verifiedOption.imageUrl,
          prompt: prompt,
          theme: partyTheme,
          themeName: themeName,
          inviteData,
          timestamp: Date.now(),
          verification: verifiedOption.verification,
        }

        setGeneratedImage(JSON.stringify(aiInviteData))

        toast.success(`Verified invite generated after ${attempt} attempt${attempt > 1 ? 's' : ''}!`, {
          title: "🎉 Perfect Invitation Created",
          duration: 5000
        })

        return verifiedOption
      } else {
        // All attempts failed - no verified invite found
        console.log(`❌ All ${maxAttempts} attempts failed verification`)

        toast.error(`Could not generate a verified invite after ${maxAttempts} attempts. You may want to simplify the venue address or try again.`, {
          title: "Generation Issue",
          duration: 8000
        })

        return null
      }
    } catch (error) {
      console.error("❌ Error in generateVerifiedInvite:", error)
      toast.error(`Failed to generate invite: ${error.message}`, {
        title: "Generation Failed",
        duration: 6000
      })
      return null
    } finally {
      setIsGeneratingAI(false)
    }
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
    generateVerifiedInvite,
    selectAiOption,
  }
}