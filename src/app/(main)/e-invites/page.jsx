"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  X,
  Share2,
  Send,
  MessageCircle,
  Users,
  Mail,
  Link,
  Check,
  ChevronLeft,
  AlertCircle,
  Sparkles,
  Palette,
  Wand2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { themes } from "@/lib/themes"
import ReactDraggableInvite from "./components/ReactDraggableInvite"

const EInvitesPage = ({ onSaveSuccess }) => {
  const router = useRouter()
  const canvasRef = useRef(null)

  // State management
  const [selectedTheme, setSelectedTheme] = useState("princess")
  const [generatedImage, setGeneratedImage] = useState(null)
  const [guestList, setGuestList] = useState([])
  const [newGuest, setNewGuest] = useState({ name: "", contact: "", type: "email" })
  const [shareableLink, setShareableLink] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedState, setLastSavedState] = useState(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [useAIGeneration, setUseAIGeneration] = useState(false)
  const [aiOptions, setAiOptions] = useState([])
  const [selectedAiOption, setSelectedAiOption] = useState(null)
  const [showAiOptions, setShowAiOptions] = useState(false)

  const [inviteData, setInviteData] = useState({
    childName: "",
    age: "",
    date: "",
    time: "",
    venue: "",
    message: "Join us for an amazing adventure!",
    headline: "default",
  })

  // HELPER FUNCTIONS - All properly organized inside component
  // Track changes to determine if there are unsaved changes
  const getCurrentState = () => {
    return {
      selectedTheme,
      inviteData,
      guestList: guestList.map((g) => ({ ...g })),
      generatedImage,
      useAIGeneration,
    }
  }

  // Check if current state differs from last saved state
  const checkForUnsavedChanges = () => {
    if (!lastSavedState) return false
    const currentState = getCurrentState()
    return JSON.stringify(currentState) !== JSON.stringify(lastSavedState)
  }

  // Helper function to format date nicely
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""
    try {
      let date
      // Check if it's already in a nice format (contains letters)
      if (/[a-zA-Z]/.test(dateString)) {
        return dateString // Already formatted nicely
      }

      // Try different parsing approaches
      if (dateString.includes("-")) {
        const parts = dateString.split("-")
        if (parts[0].length === 4) {
          date = new Date(dateString) // YYYY-MM-DD format
        } else {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) // DD-MM-YYYY format
        }
      } else if (dateString.includes("/")) {
        date = new Date(dateString)
      } else {
        date = new Date(dateString)
      }

      if (isNaN(date.getTime())) {
        return dateString // Return original if can't parse
      }

      // Format as "Sunday 27th August"
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]

      const dayName = dayNames[date.getDay()]
      const day = date.getDate()
      const monthName = monthNames[date.getMonth()]

      // Add ordinal suffix (st, nd, rd, th)
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th"
        switch (day % 10) {
          case 1:
            return "st"
          case 2:
            return "nd"
          case 3:
            return "rd"
          default:
            return "th"
        }
      }

      return `${dayName} ${day}${getOrdinalSuffix(day)} ${monthName}`
    } catch (error) {
      console.warn("Date formatting error:", error)
      return dateString
    }
  }

  // Helper function to get headline styles for different options
  const getHeadlineStyles = (headlineType, themeKey) => {
    const baseStyles = {
      position: "absolute",
      textAlign: "center",
      fontWeight: "bold",
      width: "10px",
    }

    const headlineStyles = {
      default: { fontSize: "38px", lineHeight: "1.2", fontWeight: "700" },
      simple: { fontSize: "32px", lineHeight: "1.1", fontWeight: "600" },
      invite: { fontSize: "30px", lineHeight: "1.3", fontWeight: "600" },
      celebrate: { fontSize: "28px", lineHeight: "1.2", fontWeight: "700" },
      theme: { fontSize: "34px", lineHeight: "1.1", fontWeight: "700", fontStyle: "italic" },
      custom: { fontSize: "32px", lineHeight: "1.2", fontWeight: "600" },
    }

    const themeAdjustments = {
      space_v2: {
        default: { fontSize: "40px", fontFamily: "'Orbitron', sans-serif" },
        simple: { fontSize: "36px", fontFamily: "'Orbitron', sans-serif" },
        invite: { fontSize: "32px", fontFamily: "'Orbitron', sans-serif" },
        celebrate: { fontSize: "30px", fontFamily: "'Orbitron', sans-serif" },
        theme: { fontSize: "38px", fontFamily: "'Orbitron', sans-serif" },
        custom: { fontSize: "34px", fontFamily: "'Orbitron', sans-serif" },
      },
      rocket_space: {
        default: { fontSize: "40px", fontFamily: "'Orbitron', sans-serif" },
        simple: { fontSize: "36px", fontFamily: "'Orbitron', sans-serif" },
        invite: { fontSize: "32px", fontFamily: "'Orbitron', sans-serif" },
        celebrate: { fontSize: "30px", fontFamily: "'Orbitron', sans-serif" },
        theme: { fontSize: "38px", fontFamily: "'Orbitron', sans-serif" },
        custom: { fontSize: "34px", fontFamily: "'Orbitron', sans-serif" },
      },
      dinosaur_v1: {
        default: { fontSize: "80px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
        simple: { fontSize: "72px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
        invite: { fontSize: "68px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.9" },
        celebrate: { fontSize: "64px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
        theme: { fontSize: "76px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
        custom: { fontSize: "70px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
      },
    }

    const typeStyle = headlineStyles[headlineType] || headlineStyles.default
    const themeStyle = themeAdjustments[themeKey]?.[headlineType] || {}

    return { ...baseStyles, ...typeStyle, ...themeStyle }
  }

  // Helper function to get headline options
  const getHeadlineOptions = (themeName, childName, age) => {
    const baseOptions = [
      { value: "default", label: "Default", text: `${childName}'s ${age}th Birthday` },
      { value: "simple", label: "Simple", text: `${childName} is turning ${age}!` },
      { value: "invite", label: "Invitation Style", text: `You're invited to ${childName}'s Birthday Party!` },
      { value: "celebrate", label: "Celebration", text: `Let's Celebrate ${childName}'s ${age}th Birthday!` },
    ]

    const themeSpecific = {
      princess: { value: "theme", label: "Princess Theme", text: `Princess ${childName}'s Royal ${age}th Birthday!` },
      superhero_blue: {
        value: "theme",
        label: "Superhero Theme",
        text: `${childName} is turning ${age} - Super Hero Party!`,
      },
      superhero_red: {
        value: "theme",
        label: "Superhero Theme",
        text: `${childName} is turning ${age} - Super Hero Party!`,
      },
      dinosaur: { value: "theme", label: "Dinosaur Theme", text: `Roar! ${childName}'s ${age}th Dino-mite Birthday!` },
      safari: { value: "theme", label: "Safari Theme", text: `Join ${childName}'s Wild ${age}th Safari Adventure!` },
      space: { value: "theme", label: "Space Theme", text: `Blast off with ${childName} for his ${age}th Birthday!` },
      pirate: { value: "theme", label: "Pirate Theme", text: `Ahoy! ${childName} turns ${age} - Pirate Party!` },
    }

    if (themeSpecific[selectedTheme]) {
      return [...baseOptions, themeSpecific[selectedTheme]]
    }

    return baseOptions
  }

  // Get the actual headline text based on selection
  const getHeadlineText = () => {
    if (inviteData.headline === "custom") {
      return inviteData.customHeadline || `${inviteData.childName}'s ${inviteData.age}th Birthday`
    }

    const options = getHeadlineOptions(selectedTheme, inviteData.childName, inviteData.age)
    const selectedOption = options.find((opt) => opt.value === inviteData.headline)
    return selectedOption ? selectedOption.text : `${inviteData.childName}'s ${inviteData.age}th Birthday`
  }

  // Get birthday color based on theme
  const getBirthdayColor = () => {
    const birthdayColors = {
      princess: "#FFD700", // Gold
      princess_v2: "#FF69B4", // Hot pink
      superhero_blue: "#00BFFF", // Deep sky blue
      superhero_red: "#FF4500", // Orange red
      dinosaur_v1: "#FFD700", // Yellow/Gold ✨
      safari: "#FFA500", // Orange
      space_v2: "#FFD700", // Gold
      rocket_space: "#FF6347", // Tomato
      pirate: "#DAA520", // Goldenrod
    }

    return birthdayColors[selectedTheme] || "#FF69B4" // Default hot pink
  }

  // Helper function to get theme-specific visual elements
  const getThemeElements = (theme) => {
    const themeElements = {
      princess: "crowns, castles, magic wands, and sparkles",
      princess_v2: "floral crowns, fairy tale elements, and magical sparkles",
      superhero_blue: "city skylines, comic-style rays, and superhero symbols",
      superhero_red: "action bursts, superhero emblems, and dynamic shapes",
      dinosaur: "friendly dinosaurs, prehistoric plants, and volcano silhouettes",
      safari: "jungle animals, safari hats, and tropical leaves",
      space: "rockets, planets, stars, and astronauts",
      pirate: "treasure chests, pirate ships, and tropical islands",
    }

    return themeElements[theme] || "colorful party decorations and balloons"
  }

  // END HELPER FUNCTIONS

  // Update unsaved changes status
  useEffect(() => {
    const hasChanges = checkForUnsavedChanges()
    setHasUnsavedChanges(hasChanges)
    if (hasChanges && isSaved) {
      setIsSaved(false)
    }
  }, [selectedTheme, inviteData, guestList, generatedImage, lastSavedState, useAIGeneration])

  // Breadcrumb component
  const Breadcrumb = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">E-Invites</span>
          {hasUnsavedChanges && (
            <div className="flex items-center ml-4 text-orange-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Unsaved changes</span>
            </div>
          )}
        </nav>
      </div>
    </div>
  )

  const generateInvite = async () => {
    if (useAIGeneration) {
      return // AI generation handled separately
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // No need to look for preview element - just generate the data
      const theme = themes[selectedTheme]
      const inviteDetails = {
        type: "template",
        theme: selectedTheme,
        backgroundUrl: theme.backgroundUrl,
        inviteData,
        timestamp: Date.now(),
      }

      setGeneratedImage(JSON.stringify(inviteDetails))
      console.log("✅ Template invite generated successfully")
    } catch (error) {
      console.error("Error generating invite:", error)
    }
  }

  // Generate AI-powered invite
  const generateAIInvite = async () => {
    if (!inviteData.childName || !inviteData.date || !inviteData.time || !inviteData.venue) {
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

        console.warn("⚠️ Could not load party theme, using selected theme:", error)
        partyTheme = selectedTheme
        themeName = themes[selectedTheme]?.name || "colorful kids party"
      }

      const prompt = `Create a complete, high-quality 2D digital birthday party invitation for a ${themeName.toLowerCase()} theme. MAIN HEADING (large, prominent): "Join us for ${inviteData.childName}'s Birthday Party!"

PARTY DETAILS (clear and readable):
📅 Date: ${inviteData.date}
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
          date: inviteData.date,
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
    if (!inviteData.childName || !inviteData.date || !inviteData.time || !inviteData.venue) {
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

      const prompt = `Create a complete birthday party invitation for a ${themeName.toLowerCase()} theme with ALL text included:

TITLE (large, festive font): "Join us for ${inviteData.childName}'s Birthday Party!"

DETAILS (clear, readable):
📅 ${inviteData.date}
🕐 ${inviteData.time}
📍 ${inviteData.venue}

DESIGN: Vibrant ${themeName.toLowerCase()} theme with ${getThemeElements(partyTheme)}. Use bright, kid-friendly colors. Make all text bold and easy to read. Portrait layout perfect for printing or sharing digitally.`

      console.log("🎨 Generating 5 AI invite options for:", inviteData.childName)

      const generatePromises = Array.from({ length: 5 }, (_, index) =>
        fetch("/api/generate-invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
            childName: inviteData.childName,
            date: inviteData.date,
            time: inviteData.time,
            venue: inviteData.venue,
            message: inviteData.message,
            theme: partyTheme,
            themeName: themeName,
            optionIndex: index + 1,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Option ${index + 1} failed: ${response.status}`)
            }
            const result = await response.json()
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

  useEffect(() => {
    if (!useAIGeneration) {
      generateInvite()
    }
  }, [selectedTheme, inviteData, useAIGeneration])

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
            setGuestList(einvites.guestList || [])
            setShareableLink(einvites.shareableLink || "")

            if (einvites.image && einvites.image !== "/placeholder.jpg") {
              setGeneratedImage(einvites.image)
              setIsSaved(true)

              try {
                const parsedImage = JSON.parse(einvites.image)
                if (parsedImage.type === "ai-generated") {
                  setUseAIGeneration(true)
                }
              } catch (e) {
                // Not JSON, probably template-based
              }
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

          setTimeout(() => {
            setLastSavedState(getCurrentState())
          }, 100)
        } else {
          console.log("⚠️ No current party found, using empty defaults")
          setInviteData({
            childName: "",
            age: "",
            date: "",
            time: "",
            venue: "",
            message: "Join us for an amazing adventure!",
            headline: "default",
          })
        }
      } catch (error) {
        console.error("❌ Error loading existing invite data:", error)
      }
    }

    loadExistingData()
  }, [])

  // Save invite to database
  const saveInviteToPartyPlan = async () => {
    if (!generatedImage) {
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

      const themeForDisplay = useAIGeneration ? "AI Generated" : themes[selectedTheme]?.name || selectedTheme

      const einvitesData = {
        id: "digital-invites",
        name: `${inviteData.childName}'s ${themeForDisplay} Invites`,
        description: useAIGeneration
          ? `Custom AI-generated digital invitations`
          : `Custom ${selectedTheme} themed digital invitations`,
        price: 25,
        status: "created",
        image: generatedImage,
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
        setLastSavedState(getCurrentState())

        console.log("✅ E-invite saved to database successfully!")
        console.log("🔍 Saved to party ID:", party.id)

        alert(
          `✅ E-invite saved successfully!\n\nParty: ${party.child_name}'s Birthday\nType: ${useAIGeneration ? "AI Generated" : themeForDisplay}\nParty ID: ${party.id}`,
        )

        if (onSaveSuccess) {
          onSaveSuccess(einvitesData)
        }
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

  // Generate shareable link
  const generateShareableLink = async () => {
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const link = `${window.location.origin}/party-invite/${inviteId}`
    setShareableLink(link)

    const publicInvite = {
      id: inviteId,
      theme: selectedTheme,
      inviteData,
      generatedImage,
      generationType: useAIGeneration ? "ai" : "template",
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(`public_invite_${inviteId}`, JSON.stringify(publicInvite))
    console.log("✅ Public invite saved to localStorage")
    return link
  }

  // Guest management functions
  const addGuest = () => {
    if (newGuest.name.trim() && newGuest.contact.trim()) {
      const guest = {
        id: Date.now(),
        name: newGuest.name.trim(),
        contact: newGuest.contact.trim(),
        type: newGuest.type,
        status: "pending",
        addedAt: new Date().toISOString(),
      }

      setGuestList((prev) => [...prev, guest])
      setNewGuest({ name: "", contact: "", type: "email" })
    }
  }

  const removeGuest = (guestId) => {
    setGuestList((prev) => prev.filter((guest) => guest.id !== guestId))
  }

  const sendViaWhatsApp = (guest) => {
    const message = `🎉 You're invited to ${inviteData.childName}'s Birthday Party!\n\n📅 ${inviteData.date}\n🕐 ${inviteData.time}\n📍 ${inviteData.venue}\n\n${inviteData.message}\n\nView your invitation: ${shareableLink || generateShareableLink()}\n\nRSVP by replying to this message!`
    const whatsappUrl = `https://wa.me/${guest.contact.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    setGuestList((prev) =>
      prev.map((g) => (g.id === guest.id ? { ...g, status: "sent", sentAt: new Date().toISOString() } : g)),
    )
  }

  const sendViaEmail = (guest) => {
    const subject = `You're invited to ${inviteData.childName}'s Birthday Party!`
    const body = `View your invitation: ${shareableLink || generateShareableLink()}`
    const mailtoUrl = `mailto:${guest.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl)

    setGuestList((prev) =>
      prev.map((g) => (g.id === guest.id ? { ...g, status: "sent", sentAt: new Date().toISOString() } : g)),
    )
  }

  const copyShareableLink = async () => {
    const link = shareableLink || generateShareableLink()
    try {
      await navigator.clipboard.writeText(link)
      alert("Invite link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy link:", error)
      const textArea = document.createElement("textarea")
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      alert("Invite link copied to clipboard!")
    }
  }

  const handleInputChange = (field, value) => {
    setInviteData((prev) => ({
      ...prev,
      [field]: value,
    }))
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

  const saveButtonState = getSaveButtonState()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
      <Breadcrumb />

      {/* Enhanced Hero Section */}
      <div className="relative w-full h-[40vh] md:h-[45vh] lg:h-[50vh] overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-16 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-16 left-20 w-3 h-3 bg-white/25 rounded-full animate-pulse delay-700"></div>
          <Sparkles className="absolute top-16 right-10 w-6 h-6 text-white/30 animate-pulse delay-500" />
        </div>

        <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl leading-tight">
              Create Your Own
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                Themed Invite
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-2xl font-semibold">
              Design beautiful birthday invitations and send to guests in seconds!
            </p>

            {/* Floating elements */}
            <div className="flex justify-center space-x-4 opacity-80">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                🎨 AI-Powered Design
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium hidden sm:block">
                📱 Instant Sharing
              </div>
            </div>
          </div>
        </div>

        {/* Smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Generation Options & Customization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generation Mode Toggle */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  Create Your Invite
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <button
                    onClick={() => {
                      setUseAIGeneration(false)
                      generateInvite()
                    }}
                    className={`flex-1 min-w-0 p-4 sm:p-6 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                      !useAIGeneration
                        ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-lg"
                        : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎨</div>
                    <div className="font-bold text-base sm:text-lg text-gray-900">Use Templates</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Choose from pre-made themes</div>
                  </button>
                  <button
                    onClick={() => setUseAIGeneration(true)}
                    className={`flex-1 min-w-0 p-4 sm:p-6 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                      useAIGeneration
                        ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-lg"
                        : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🤖</div>
                    <div className="font-bold text-base sm:text-lg text-gray-900">AI Generator</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Create custom designs with AI</div>
                  </button>
                </div>

                {useAIGeneration && (
                  <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] p-4 sm:p-6 rounded-xl border border-[hsl(var(--primary-200))]">
                    <h3 className="font-bold text-base sm:text-lg text-[hsl(var(--primary-900))] mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      AI Invite Generator
                    </h3>
                    <p className="text-xs sm:text-sm text-[hsl(var(--primary-700))] mb-4">
                      Fill in your party details below, then click generate to create a custom invite with AI!
                    </p>
                    <Button
                      onClick={generateAIOptions}
                      disabled={isGeneratingAI}
                      className="w-full bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                    >
                      {isGeneratingAI ? (
                        <>
                          <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Generating 5 AI Options...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Generate 5 AI Options
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Theme Selection - Only show for template mode */}
            {!useAIGeneration && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary-600" />
                    Choose Your Theme
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(themes).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTheme(key)}
                        className={`relative p-3 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                          selectedTheme === key
                            ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-lg"
                            : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
                        }`}
                      >
                        <div className="relative w-full h-20 mb-3 rounded-lg overflow-hidden">
                          <img
                            src={theme.backgroundUrl || "/placeholder.svg"}
                            alt={theme.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                        <div className="font-bold text-xs text-center px-1 text-gray-900">{theme.name}</div>
                        {selectedTheme === key && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Options Selection - Show after generation */}
            {showAiOptions && aiOptions.length > 0 && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[hsl(var(--primary-600))]" />
                    Choose Your Favorite AI Design
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Click on your favorite design below. The selected option will be used for your invitation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => selectAiOption(option)}
                        className={`relative p-3 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                          selectedAiOption?.id === option.id
                            ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] ring-2 ring-[hsl(var(--primary-200))] shadow-lg"
                            : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
                        }`}
                      >
                        <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                          <img
                            src={option.imageUrl || "/placeholder.svg"}
                            alt={`AI Option ${option.index}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/10"></div>
                          {selectedAiOption?.id === option.id && (
                            <div className="absolute top-2 left-2 bg-[hsl(var(--primary-600))] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-sm text-gray-900">Option {option.index}</div>
                        {selectedAiOption?.id === option.id && (
                          <div className="text-xs text-[hsl(var(--primary-600))] font-bold mt-1">
                            ✨ Selected & Ready
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedAiOption && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] border border-[hsl(var(--primary-200))] rounded-xl">
                      <div className="flex items-center text-[hsl(var(--primary-700))]">
                        <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-bold">
                          Option {selectedAiOption.index} selected! Your invitation is ready to save.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Button
                      onClick={generateAIOptions}
                      disabled={isGeneratingAI}
                      variant="outline"
                      className="w-full border-2 border-[hsl(var(--primary-300))] text-[hsl(var(--primary-700))] hover:bg-[hsl(var(--primary-50))] font-medium py-3 bg-transparent"
                    >
                      🔄 Generate 5 New Options
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Party Details */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Party Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Child's Name</label>
                    <Input
                      value={inviteData.childName}
                      onChange={(e) => handleInputChange("childName", e.target.value)}
                      placeholder="Enter child's name"
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                    <Input
                      value={inviteData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="Age"
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                    />
                  </div>

                  {/* Headline Options - Only show for template mode */}
                  {!useAIGeneration && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Invitation Headline
                        <span className="text-xs text-gray-500 ml-2 font-normal">
                          Choose how you want to announce the party
                        </span>
                      </label>
                      <div className="space-y-3">
                        <select
                          value={inviteData.headline}
                          onChange={(e) => handleInputChange("headline", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
                        >
                          {getHeadlineOptions(selectedTheme, inviteData.childName, inviteData.age).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}: "{option.text}"
                            </option>
                          ))}
                          <option value="custom">Custom headline</option>
                        </select>
                        {inviteData.headline === "custom" && (
                          <Input
                            value={inviteData.customHeadline || ""}
                            onChange={(e) => handleInputChange("customHeadline", e.target.value)}
                            placeholder="Enter your custom headline"
                            className="mt-2 border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                          />
                        )}
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <div className="text-sm font-bold text-gray-600 mb-2">Preview:</div>
                          <div
                            style={{
                              ...getHeadlineStyles(inviteData.headline, selectedTheme),
                              position: "relative",
                              transform: "none",
                              color: "#333",
                              textShadow: "none",
                            }}
                          >
                            "{getHeadlineText()}"
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Style: {getHeadlineStyles(inviteData.headline, selectedTheme).fontSize} •{" "}
                            {getHeadlineStyles(inviteData.headline, selectedTheme).fontWeight} •{" "}
                            {getHeadlineStyles(inviteData.headline, selectedTheme).fontFamily || "Default Font"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                    <Input
                      value={inviteData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      placeholder="Party date (e.g., 27/08/2025 or August 27, 2025)"
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                    />
                    {inviteData.date && (
                      <div className="mt-1 text-xs text-gray-600">
                        Will display as: <span className="font-bold">"{formatDateForDisplay(inviteData.date)}"</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                    <Input
                      value={inviteData.time}
                      onChange={(e) => handleInputChange("time", e.target.value)}
                      placeholder="Party time"
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Venue</label>
                    <Input
                      value={inviteData.venue}
                      onChange={(e) => handleInputChange("venue", e.target.value)}
                      placeholder="Party venue"
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Special Message</label>
                    <Textarea
                      value={inviteData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Add a special message for your guests"
                      rows={3}
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Management */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Guest List & Sending
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Guest name"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest((prev) => ({ ...prev, name: e.target.value }))}
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                    />
                    <Input
                      placeholder={newGuest.type === "email" ? "Email address" : "Phone number"}
                      value={newGuest.contact}
                      onChange={(e) => setNewGuest((prev) => ({ ...prev, contact: e.target.value }))}
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={newGuest.type}
                      onChange={(e) => setNewGuest((prev) => ({ ...prev, type: e.target.value }))}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 font-medium"
                    >
                      <option value="email">Email</option>
                      <option value="phone">WhatsApp</option>
                    </select>
                    <Button
                      onClick={addGuest}
                      className="flex-1 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Guest
                    </Button>
                  </div>
                </div>

                {guestList.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h3 className="font-bold text-gray-900">Guests ({guestList.length})</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {guestList.map((guest) => (
                        <div
                          key={guest.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="font-bold text-sm text-gray-900">{guest.name}</div>
                            <div className="text-xs text-gray-600">{guest.contact}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                guest.status === "sent"
                                  ? "bg-green-50 text-green-700 border-green-200 font-bold"
                                  : guest.status === "pending"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200 font-bold"
                                    : "bg-gray-50 text-gray-700 border-gray-200 font-bold"
                              }
                            >
                              {guest.status}
                            </Badge>
                            {guest.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => (guest.type === "phone" ? sendViaWhatsApp(guest) : sendViaEmail(guest))}
                                className="h-8 px-3 border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-medium"
                              >
                                {guest.type === "phone" ? (
                                  <MessageCircle className="w-3 h-3" />
                                ) : (
                                  <Mail className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeGuest(guest.id)}
                              className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {guestList.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-bold py-3 bg-transparent"
                      onClick={() => {
                        const pendingGuests = guestList.filter((g) => g.status === "pending")
                        pendingGuests.forEach((guest) => {
                          if (guest.type === "phone") {
                            setTimeout(() => sendViaWhatsApp(guest), 100)
                          } else {
                            setTimeout(() => sendViaEmail(guest), 100)
                          }
                        })
                      }}
                      disabled={!guestList.some((g) => g.status === "pending")}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to All Pending
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 bg-transparent"
                      onClick={copyShareableLink}
                      disabled={!generatedImage}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Invite Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  Live Preview
                </h2>
                <div className="mb-6">
                  {useAIGeneration && selectedAiOption ? (
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                        <img
                          src={selectedAiOption.imageUrl || "/placeholder.svg"}
                          alt="Selected AI Generated Invite"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[hsl(var(--primary-600))] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                          AI Option {selectedAiOption.index}
                        </div>
                      </div>
                    </div>
                  ) : useAIGeneration && !selectedAiOption ? (
                    <div className="flex justify-center">
                      <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl border-2 border-dashed border-[hsl(var(--primary-300))] flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
                        <div className="text-center text-[hsl(var(--primary-600))]">
                          <div className="text-4xl mb-4">🤖</div>
                          <div className="font-bold text-lg">AI Options Ready</div>
                          <div className="text-sm">Choose your favorite design above</div>
                        </div>
                      </div>
                    </div>
                  ) : !useAIGeneration ? (
                    <ReactDraggableInvite
                      themeKey={selectedTheme}
                      inviteData={{
                        ...inviteData,
                        headlineText: getHeadlineText(),
                        formattedDate: formatDateForDisplay(inviteData.date),
                        headlineStyles: getHeadlineStyles(inviteData.headline, selectedTheme),
                        birthdayColor: getBirthdayColor(),
                      }}
                      onLayoutSave={(customLayout) => {
                        console.log("Custom layout saved:", customLayout)
                        // Save to your database/state
                      }}
                    />
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-4">🤖</div>
                          <div className="font-bold text-lg">AI Invite Generator</div>
                          <div className="text-sm">Fill in details and click generate</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      saveInviteToPartyPlan()
                      if (!shareableLink) generateShareableLink()
                    }}
                    className={`w-full font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${saveButtonState.className}`}
                    disabled={saveButtonState.disabled}
                  >
                    {saveButtonState.icon}
                    {saveButtonState.text}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 bg-transparent"
                    onClick={copyShareableLink}
                    disabled={!generatedImage}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Copy Invite Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">
                  {useAIGeneration
                    ? "AI Generated Invite"
                    : `Current Theme: ${themes[selectedTheme]?.name || selectedTheme}`}
                </h3>
                {useAIGeneration ? (
                  <div className="relative w-full h-24 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))]">
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                      🤖 AI Generated
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-24 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={themes[selectedTheme]?.backgroundUrl || "/placeholder.jpg"}
                      alt={themes[selectedTheme]?.name || selectedTheme}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Your invite will be automatically saved and can be used on your dashboard.
                </div>

                {hasUnsavedChanges && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center text-orange-700">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-xs font-bold">You have unsaved changes. Don't forget to save!</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} width={600} height={800} />
      </div>
    </div>
  )
}

export default EInvitesPage
