// hooks/useInviteData.js

import { useState, useEffect } from 'react'
import { DEFAULT_INVITE_DATA } from '../constants/inviteConstants'

export const useInviteData = () => {
  const [selectedTheme, setSelectedTheme] = useState("princess")
  const [inviteData, setInviteData] = useState(DEFAULT_INVITE_DATA)
  const [generatedImage, setGeneratedImage] = useState(null)

  const getVenueName = (partyPlan, fallbackLocation) => {
    try {
      console.log("🏢 Extracting venue from party plan:", partyPlan)
      
      // NEW: Check for venue with venueAddress structure (your new format)
      if (partyPlan?.venue?.originalSupplier?.venueAddress) {
        const venue = partyPlan.venue
        const venueAddress = venue.originalSupplier.venueAddress
        const supplierName = venue.originalSupplier.name || venue.name
        
        console.log("✅ Found venue with venueAddress:", venueAddress)
        
        // Build full address from venueAddress structure
        const addressParts = [
          venueAddress.businessName || supplierName,
          venueAddress.addressLine1,
          venueAddress.addressLine2,
          venueAddress.city,
          venueAddress.postcode,
          venueAddress.country !== 'United Kingdom' ? venueAddress.country : null
        ].filter(Boolean)
        
        const fullVenue = addressParts.join(', ')
        console.log("✅ Complete venue from venueAddress:", fullVenue)
        
        return fullVenue
      }
      
      // NEW: Check for venue address in serviceDetails.venueAddress
      if (partyPlan?.venue?.originalSupplier?.serviceDetails?.venueAddress) {
        const venue = partyPlan.venue
        const venueAddress = venue.originalSupplier.serviceDetails.venueAddress
        const supplierName = venue.originalSupplier.name || venue.name
        
        console.log("✅ Found venue with serviceDetails.venueAddress:", venueAddress)
        
        // Build full address from serviceDetails.venueAddress structure
        const addressParts = [
          venueAddress.businessName || supplierName,
          venueAddress.addressLine1,
          venueAddress.addressLine2,
          venueAddress.city,
          venueAddress.postcode,
          venueAddress.country !== 'United Kingdom' ? venueAddress.country : null
        ].filter(Boolean)
        
        const fullVenue = addressParts.join(', ')
        console.log("✅ Complete venue from serviceDetails.venueAddress:", fullVenue)
        
        return fullVenue
      }
      
      // LEGACY: Check for venue with full address details (old data structure)
      if (partyPlan?.venue?.originalSupplier?.serviceDetails?.location?.fullAddress) {
        const venue = partyPlan.venue
        const fullAddress = venue.originalSupplier.serviceDetails.location.fullAddress
        const postcode = venue.originalSupplier.serviceDetails.location.postcode
        const venueName = venue.originalSupplier.name || venue.name
        
        console.log("✅ Found venue with legacy full address:")
        console.log("  - Name:", venueName)
        console.log("  - Address:", fullAddress)
        console.log("  - Postcode:", postcode)
        
        // Clean up the address (replace newlines with commas)
        const cleanAddress = fullAddress.replace(/\n/g, ', ').replace(/,\s*,/g, ',').trim()
        
        // Build complete address with postcode
        const completeAddress = postcode && !cleanAddress.includes(postcode) 
          ? `${cleanAddress}, ${postcode}`
          : cleanAddress
        
        const fullVenue = `${venueName.trim()}, ${completeAddress}`
        console.log("✅ Complete venue string:", fullVenue)
        
        return fullVenue
      }
      
      // Fallback: Check for venue with owner address
      if (partyPlan?.venue?.originalSupplier?.owner?.address) {
        const venue = partyPlan.venue
        const ownerAddress = venue.originalSupplier.owner.address
        const venueName = venue.originalSupplier.name || venue.name
        
        const addressParts = [
          venueName,
          ownerAddress.street,
          ownerAddress.city,
          ownerAddress.postcode
        ].filter(Boolean)
        
        if (addressParts.length > 0) {
          const fullAddress = addressParts.join(', ')
          console.log("✅ Found venue with owner address:", fullAddress)
          return fullAddress
        }
      }
      
      // Check if party_plan has venue supplier information
      if (partyPlan?.venue?.supplier_name) {
        console.log("✅ Found venue supplier name:", partyPlan.venue.supplier_name)
        return partyPlan.venue.supplier_name
      }
      
      // Check for venue name in venue object
      if (partyPlan?.venue?.name) {
        console.log("✅ Found venue name:", partyPlan.venue.name)
        return partyPlan.venue.name
      }
      
      // Check for venue_name directly
      if (partyPlan?.venue_name) {
        console.log("✅ Found venue_name:", partyPlan.venue_name)
        return partyPlan.venue_name
      }
      
      // Check if venue is stored as a string
      if (partyPlan?.venue && typeof partyPlan.venue === 'string') {
        console.log("✅ Found venue as string:", partyPlan.venue)
        return partyPlan.venue
      }
      
      console.log("⚠️ No venue found in party plan, using fallback:", fallbackLocation)
      return fallbackLocation || ""
      
    } catch (error) {
      console.error("❌ Error extracting venue name:", error)
      return fallbackLocation || ""
    }
  }

  // NEW: Helper function to format start_time and end_time from database
  const formatDatabaseTimes = (startTime, endTime) => {
    try {
      console.log("⏰ Formatting database times:", { startTime, endTime })
      
      if (!startTime && !endTime) {
        console.log("⚠️ No start or end time provided")
        return { time: "", start_time: "", end_time: "" }
      }
      
      // Convert 24-hour time to 12-hour format
      const formatTime = (timeString) => {
        if (!timeString) return ""
        
        const [hours, minutes] = timeString.split(':')
        const hour24 = parseInt(hours, 10)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
        const ampm = hour24 >= 12 ? 'pm' : 'am'
        
        return `${hour12}${minutes && minutes !== '00' ? `:${minutes}` : ''}${ampm}`
      }
      
      if (startTime && endTime) {
        const formattedStart = formatTime(startTime)
        const formattedEnd = formatTime(endTime)
        const combinedTime = `${formattedStart}-${formattedEnd}`
        
        console.log("✅ Formatted combined time:", combinedTime)
        
        return {
          time: combinedTime,           // For display: "2pm-4pm"
          start_time: startTime,        // Keep original 24h format: "14:00"
          end_time: endTime            // Keep original 24h format: "16:00"
        }
      } else if (startTime) {
        const formattedStart = formatTime(startTime)
        
        console.log("✅ Formatted start time only:", formattedStart)
        
        return {
          time: formattedStart,
          start_time: startTime,
          end_time: ""
        }
      }
      
      return { time: "", start_time: "", end_time: "" }
      
    } catch (error) {
      console.error("❌ Error formatting database times:", error)
      return { time: "", start_time: "", end_time: "" }
    }
  }

  // LEGACY: Helper function to format party time (kept for backwards compatibility)
  const formatPartyTime = (partyTime, partyPlan) => {
    try {
      console.log("⏰ Formatting legacy party time:", partyTime, "with plan:", partyPlan)
      
      if (!partyTime) {
        console.log("⚠️ No party time provided")
        return ""
      }
      
      // Convert 24-hour time to 12-hour format
      const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':')
        const hour24 = parseInt(hours, 10)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
        const ampm = hour24 >= 12 ? 'pm' : 'am'
        
        return `${hour12}${minutes && minutes !== '00' ? `:${minutes}` : ''}${ampm}`
      }
      
      const startTime = formatTime(partyTime)
      
      // Check if we have duration information in party plan
      let duration = 2 // Default 2 hours
      
      if (partyPlan?.duration) {
        duration = partyPlan.duration
      } else if (partyPlan?.party_details?.duration) {
        duration = partyPlan.party_details.duration
      }
      
      // Calculate end time
      const [hours, minutes] = partyTime.split(':')
      const startHour = parseInt(hours, 10)
      const startMinutes = parseInt(minutes, 10) || 0
      
      const endHour = startHour + duration
      const endTimeString = `${endHour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`
      const endTime = formatTime(endTimeString)
      
      const formattedTime = `${startTime} - ${endTime}`
      console.log("✅ Formatted legacy time:", formattedTime)
      
      return formattedTime
      
    } catch (error) {
      console.error("❌ Error formatting party time:", error)
      return partyTime || ""
    }
  }

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
          console.log("⏰ Party times from database:", {
            start_time: party.start_time,
            end_time: party.end_time,
            legacy_party_time: party.party_time
          })

          // Extract venue name from party plan
          const venueName = getVenueName(partyPlan, party.location)

          // NEW: Get formatted times from database
          const timeData = formatDatabaseTimes(party.start_time, party.end_time)
          
          // Fallback to legacy party_time if no start/end times
          const finalTimeData = timeData.time ? timeData : {
            time: formatPartyTime(party.party_time, partyPlan),
            start_time: party.party_time || "",
            end_time: ""
          }

          if (partyPlan.einvites) {
            const einvites = partyPlan.einvites
            console.log("✅ Found existing einvites:", einvites)

            const themeToUse = einvites.theme || party.theme || "princess"
            setSelectedTheme(themeToUse)

            const inviteDataToUse = {
              childName: party.child_name || "",
              age: party.child_age?.toString() || "",
              date: party.party_date || "",
              // NEW: Use formatted time data
              time: finalTimeData.time,
              start_time: finalTimeData.start_time,
              end_time: finalTimeData.end_time,
              venue: venueName,
              message: einvites.inviteData?.message || "Join us for an amazing adventure!",
              headline: einvites.inviteData?.headline || "default",
              // Preserve any existing einvites data
              ...einvites.inviteData
            }

            setInviteData(inviteDataToUse)

            if (einvites.image && einvites.image !== "/placeholder.jpg") {
              setGeneratedImage(einvites.image)
            }

            console.log("✅ Loaded einvites data:", {
              theme: themeToUse,
              childName: inviteDataToUse.childName,
              venue: inviteDataToUse.venue,
              time: inviteDataToUse.time,
              start_time: inviteDataToUse.start_time,
              end_time: inviteDataToUse.end_time,
              hasImage: !!einvites.image && einvites.image !== "/placeholder.jpg",
            })
          } else {
            console.log("ℹ️ No einvites yet, populating with party details")
            
            const newInviteData = {
              childName: party.child_name || "",
              age: party.child_age?.toString() || "",
              date: party.party_date || "",
              // NEW: Use formatted time data
              time: finalTimeData.time,
              start_time: finalTimeData.start_time,
              end_time: finalTimeData.end_time,
              venue: venueName,
              message: "Join us for an amazing adventure!",
              headline: "default",
            }
            
            setInviteData(newInviteData)

            console.log("✅ Set new invite data:", {
              venue: venueName,
              time: finalTimeData.time,
              start_time: finalTimeData.start_time,
              end_time: finalTimeData.end_time
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