import { BIRTHDAY_COLORS, THEME_ELEMENTS } from '../constants/inviteConstants'

// Helper function to format date nicely
export const formatDateForDisplay = (dateString) => {
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
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]

    const dayName = dayNames[date.getDay()]
    const day = date.getDate()
    const monthName = monthNames[date.getMonth()]

    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th"
      switch (day % 10) {
        case 1: return "st"
        case 2: return "nd"
        case 3: return "rd"
        default: return "th"
      }
    }

    return `${dayName} ${day}${getOrdinalSuffix(day)} ${monthName}`
  } catch (error) {
    console.warn("Date formatting error:", error)
    return dateString
  }
}

// Get birthday color based on theme
export const getBirthdayColor = (theme) => {
  return BIRTHDAY_COLORS[theme] || "#FF69B4" // Default hot pink
}

// Helper function to get theme-specific visual elements
export const getThemeElements = (theme) => {
  return THEME_ELEMENTS[theme] || "colorful party decorations and balloons"
}

// Track changes to determine if there are unsaved changes
export const getCurrentState = (selectedTheme, inviteData, guestList, generatedImage, useAIGeneration) => {
  return {
    selectedTheme,
    inviteData,
    guestList: guestList.map((g) => ({ ...g })),
    generatedImage,
    useAIGeneration,
  }
}

// Check if current state differs from last saved state
export const checkForUnsavedChanges = (lastSavedState, currentState) => {
  if (!lastSavedState) return false
  return JSON.stringify(currentState) !== JSON.stringify(lastSavedState)
}

// Generate unique invite ID
export const generateInviteId = () => {
  return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Copy text to clipboard with fallback
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy link:", error)
    // Fallback method
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
    return true
  }
}

// Generate WhatsApp message
export const generateWhatsAppMessage = (inviteData, shareableLink) => {
  return `🎉 You're invited to ${inviteData.childName}'s Birthday Party!\n\n📅 ${inviteData.date}\n🕐 ${inviteData.time}\n📍 ${inviteData.venue}\n\n${inviteData.message}\n\nView your invitation: ${shareableLink}\n\nRSVP by replying to this message!`
}

// Generate email content
export const generateEmailContent = (inviteData, shareableLink) => {
  return {
    subject: `You're invited to ${inviteData.childName}'s Birthday Party!`,
    body: `View your invitation: ${shareableLink}`
  }
}

// Clean phone number for WhatsApp
export const cleanPhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/\D/g, "")
}

// Generate WhatsApp URL
export const generateWhatsAppUrl = (phoneNumber, message) => {
  const cleanNumber = cleanPhoneNumber(phoneNumber)
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
}

// Generate mailto URL
export const generateMailtoUrl = (email, subject, body) => {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// Validate required fields for AI generation
export const validateRequiredFields = (inviteData) => {
  return !!(inviteData.childName && inviteData.date && inviteData.time && inviteData.venue)
}

// Format display name for theme
export const formatThemeDisplayName = (useAIGeneration, selectedTheme, themes) => {
  return useAIGeneration ? "AI Generated" : themes[selectedTheme]?.name || selectedTheme
}