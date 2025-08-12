"use client"

import { useState, useEffect } from "react"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export function usePartyDetails(user = null, currentParty = null) {
  const [partyDetails, setPartyDetails] = useState(null)
  const [partyTheme, setPartyTheme] = useState("superhero")
  const [themeLoaded, setThemeLoaded] = useState(false)

  // Get party details from localStorage (for guests)
  const getPartyDetailsFromLocalStorage = () => {
    try {
      const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
      return {
        childName: partyDetails?.childName || 'Emma',
        date: partyDetails?.date || 'Saturday, June 14, 2025 • 2:00 PM - 4:00 PM',
        childAge: partyDetails?.childAge || 6,
        location: partyDetails?.postcode || partyDetails?.location || 'W1A 1AA',
        theme: partyDetails?.theme || 'superhero',
        time: partyDetails?.time || '14:00',
        guestCount: partyDetails?.guestCount || '',
        budget: partyDetails?.budget || '',
        specialNotes: partyDetails?.specialNotes || '',
        postcode: partyDetails?.postcode || 'W1A 1AA'
      };
    } catch {
      return {
        childName: 'Emma',
        date: 'Saturday, June 14, 2025 • 2:00 PM - 4:00 PM', 
        childAge: 6,
        location: 'W1A 1AA',
        theme: 'superhero',
        time: '14:00',
        guestCount: '',
        budget: '',
        specialNotes: '',
        postcode: 'W1A 1AA'
      };
    }
  };

 
 
const getPartyDetailsFromDatabase = (party) => {
  if (!party) return getPartyDetailsFromLocalStorage();
  
  // Extract first and last name from child_name for UI components
  let firstName = "";
  let lastName = "";
  
  if (party.child_name) {
    const nameParts = party.child_name.trim().split(' ');
    firstName = nameParts[0] || "";
    lastName = nameParts.slice(1).join(' ') || "";
  }
  
  return {
    childName: party.child_name || 'Emma', // Main name field from database
    firstName: firstName, // Extracted for UI components
    lastName: lastName, // Extracted for UI components
    date: party.party_date || 'Saturday, June 14, 2025 • 2:00 PM - 4:00 PM',
    childAge: party.child_age || 6,
    location: party.location || 'W1A 1AA',
    theme: party.theme || 'superhero',
    time: party.party_time || '14:00',
    guestCount: party.guest_count || '',
    budget: party.budget || '',
    specialNotes: party.special_requirements || '',
    postcode: party.postcode || 'W1A 1AA',
    timeSlot: party.time_slot || 'afternoon',
    duration: party.duration || 2,
    id: party.id 
  };

};

  // Initialize party details
  useEffect(() => {
    let details;
    
    if (user && currentParty) {
      // Signed-in user with party data - use database
      console.log("👤 Loading party details from database")
      details = getPartyDetailsFromDatabase(currentParty);

  
    } else {

      details = getPartyDetailsFromLocalStorage();
    }
    
    setPartyDetails(details);

    
    // Set theme
    if (details.theme) {
      setPartyTheme(details.theme);
    }
    setThemeLoaded(true);
  }, [user, currentParty]);


  const savePartyDetails = async (details) => {
    try {
      if (user) {
        // Database logic (existing code)
      } else {
        // Guest user - save to localStorage
        console.log("👻 Saving party details to localStorage:", details)
        
        const existingDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
        
        // If we're updating the childName, also update firstName/lastName
        let updatedDetails = {
          ...existingDetails,
          ...details,
          postcode: details.postcode || (details.location?.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) ? details.location : existingDetails.postcode)
        };
        
        // IMPORTANT FIX: If childName is being updated, extract firstName/lastName
        if (details.childName) {
          const nameParts = details.childName.split(' ');
          updatedDetails.firstName = nameParts[0] || '';
          updatedDetails.lastName = nameParts.slice(1).join(' ') || '';
          console.log("📝 Extracted names from childName:", {
            childName: details.childName,
            firstName: updatedDetails.firstName,
            lastName: updatedDetails.lastName
          });
        }
        
        // If firstName/lastName are provided directly, use those
        if (details.firstName !== undefined) {
          updatedDetails.firstName = details.firstName;
        }
        if (details.lastName !== undefined) {
          updatedDetails.lastName = details.lastName;
        }
        
        console.log("💾 Final details to store:", updatedDetails);
        localStorage.setItem('party_details', JSON.stringify(updatedDetails));
        
        // Trigger storage event
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'party_details',
          newValue: JSON.stringify(updatedDetails)
        }));
        
        return updatedDetails;
      }
    } catch (error) {
      console.error('Error saving party details:', error);
      return details;
    }
  };
// Handle party details update
const handlePartyDetailsUpdate = async (updatedDetails) => {
  console.log("🔄 Updating party details:", updatedDetails);
  
  const savedDetails = await savePartyDetails(updatedDetails);
  setPartyDetails(savedDetails);
  
  // Update theme if changed
  if (updatedDetails.theme && updatedDetails.theme !== partyTheme) {
    setPartyTheme(updatedDetails.theme);
  }
  
  console.log("✅ Party details updated:", savedDetails);
};
  // Handle name submission (for welcome popup)
  const handleNameSubmit = async ({ childName, childAge }) => {
    await handlePartyDetailsUpdate({ childName, childAge });
    console.log('✅ Child info saved:', { childName, childAge });
  };

  return {
    partyDetails,
    partyTheme,
    themeLoaded,
    getPartyDetails: user && currentParty ? () => getPartyDetailsFromDatabase(currentParty) : getPartyDetailsFromLocalStorage,
    savePartyDetails,
    handleNameSubmit,
    handlePartyDetailsUpdate,
    setPartyDetails,
    setPartyTheme
  };
}