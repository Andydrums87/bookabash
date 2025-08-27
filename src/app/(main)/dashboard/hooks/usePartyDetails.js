"use client"

import { useState, useEffect } from "react"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export function usePartyDetails(user = null, currentParty = null) {
  const [partyDetails, setPartyDetails] = useState(null)
  const [partyTheme, setPartyTheme] = useState("superhero")
  const [themeLoaded, setThemeLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Add loading state

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
        // FIX: Read the new time fields
        startTime: partyDetails?.startTime || '14:00', // NEW
        duration: partyDetails?.duration || 2, // NEW
        displayTimeRange: partyDetails?.displayTimeRange, // NEW
        time: partyDetails?.time || '14:00', // Keep for backward compatibility
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
    
    console.log('🔍 getPartyDetailsFromDatabase received:', party);
    
    // Extract first and last name from child_name for UI components
    let firstName = "";
    let lastName = "";
    
    if (party.child_name) {
      const nameParts = party.child_name.trim().split(' ');
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(' ') || "";
    }
    
    // Format the date properly for display
    let formattedDate = party.party_date;
    if (party.party_date && party.party_date !== 'Saturday, June 14, 2025 • 2:00 PM - 4:00 PM') {
      formattedDate = party.party_date;
    }
    
    const mapped = {
      childName: party.child_name || 'Emma',
      firstName: firstName,
      lastName: lastName,
      date: formattedDate,
      childAge: party.child_age || 6,
      location: party.location || 'W1A 1AA',
      theme: party.theme || 'superhero',
      time: party.party_time || '14:00',
      guestCount: party.guest_count || '',
      budget: party.budget || '',
      specialNotes: party.special_requirements || '',
      postcode: party.postcode || 'W1A 1AA',
      timeSlot: party.time_slot || (party.party_time && (party.party_time.startsWith('0') || party.party_time.startsWith('1')) ? 'morning' : 'afternoon'),
      duration: party.duration || 2,
      id: party.id 
    };
    
    console.log('✅ Mapped database party to component format:', mapped);
    return mapped;
  };

  // Initialize party details - FIXED VERSION
  useEffect(() => {
    console.log('🔄 usePartyDetails useEffect triggered:', { 
      hasUser: !!user, 
      hasCurrentParty: !!currentParty,
      currentPartyId: currentParty?.id,
      currentPartyChildName: currentParty?.child_name 
    });
    
    setIsLoading(true); // Start loading
    
    // Wait for user state to be determined before proceeding
    if (user === undefined || currentParty === undefined) {
      // Still loading user/party data - don't set anything yet
      console.log("⏳ Still waiting for user/party data to load...");
      return;
    }
    
    let details;
    
    if (user && currentParty) {
      // Signed-in user with party data - use database
      console.log("👤 Loading party details from database");
      console.log("🔍 currentParty data:", currentParty);
      details = getPartyDetailsFromDatabase(currentParty);
      console.log("✅ Database details processed:", details);
    } else {
      // Guest user (user is null) OR signed-in user without party (currentParty is null)
      console.log("📦 Loading party details from localStorage (user:", !!user, "currentParty:", !!currentParty, ")");
      details = getPartyDetailsFromLocalStorage();
      console.log("✅ localStorage details processed:", details);
    }
    console.log("🎯 Setting partyDetails to:", details);
    setPartyDetails(details);

    // Set theme
    if (details.theme) {
      console.log("🎨 Setting theme to:", details.theme);
      setPartyTheme(details.theme);
    }
    setThemeLoaded(true);
    setIsLoading(false); // Finish loading
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
    isLoading, // NEW: Expose loading state
    getPartyDetails: user && currentParty ? () => getPartyDetailsFromDatabase(currentParty) : getPartyDetailsFromLocalStorage,
    savePartyDetails,
    handleNameSubmit,
    handlePartyDetailsUpdate,
    setPartyDetails,
    setPartyTheme
  };
}