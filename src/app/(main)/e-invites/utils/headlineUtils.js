// utils/headlineUtils.js

import { HEADLINE_STYLES, THEME_ADJUSTMENTS } from '../constants/inviteConstants'


// Helper function to get headline styles for different options
export const getHeadlineStyles = (headlineType, themeKey) => {
  const baseStyles = {
    position: "absolute",
    textAlign: "center",
    fontWeight: "bold",
    width: "10px",
  }

  const typeStyle = HEADLINE_STYLES[headlineType] || HEADLINE_STYLES.default
  const themeStyle = THEME_ADJUSTMENTS[themeKey]?.[headlineType] || {}

  return { ...baseStyles, ...typeStyle, ...themeStyle }
}

// Helper function to get headline options
export const getHeadlineOptions = (themeName, childName, age, selectedTheme) => {
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
export const getHeadlineText = (inviteData, selectedTheme) => {
  if (inviteData.headline === "custom") {
    return inviteData.customHeadline || `${inviteData.childName}'s ${inviteData.age}th Birthday`
  }

  const options = getHeadlineOptions(selectedTheme, inviteData.childName, inviteData.age, selectedTheme)
  const selectedOption = options.find((opt) => opt.value === inviteData.headline)
  return selectedOption ? selectedOption.text : `${inviteData.childName}'s ${inviteData.age}th Birthday`
}