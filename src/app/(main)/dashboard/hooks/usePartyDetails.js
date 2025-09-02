// hooks/usePartyDetails.js - Updated to work with consolidated loading
"use client"

import { useState, useEffect } from "react"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export function usePartyDetails(user = null, currentParty = null) {
  const [partyDetails, setPartyDetails] = useState(null)
  const [partyTheme, setPartyTheme] = useState("superhero")
  const [themeLoaded, setThemeLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Start as false, only true during processing

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
        startTime: partyDetails?.startTime || '14:00',
        duration: partyDetails?.duration || 2,
        displayTimeRange: partyDetails?.displayTimeRange,
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

    return mapped;
  };

  // Initialize party details - SIMPLIFIED VERSION
  useEffect(() => {
    // Don't start loading until we have determined user state
    if (user === undefined || currentParty === undefined) {
      return;
    }
    
    // Process immediately without setting loading state
    let details;
    
    if (user && currentParty) {
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
        // Database logic for signed-in users
        const result = await partyDatabaseBackend.updatePartyDetails(user.id, details);
        return result.success ? details : details;
      } else {
        // Guest user - save to localStorage
        const existingDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
        
        let updatedDetails = {
          ...existingDetails,
          ...details,
          postcode: details.postcode || (details.location?.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) ? details.location : existingDetails.postcode)
        };
        
        // If childName is being updated, extract firstName/lastName
        if (details.childName) {
          const nameParts = details.childName.split(' ');
          updatedDetails.firstName = nameParts[0] || '';
          updatedDetails.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // If firstName/lastName are provided directly, use those
        if (details.firstName !== undefined) {
          updatedDetails.firstName = details.firstName;
        }
        if (details.lastName !== undefined) {
          updatedDetails.lastName = details.lastName;
        }
        
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

  // Handle party details update - SIMPLIFIED
  const handlePartyDetailsUpdate = async (updatedDetails) => {
    // Only set loading during actual processing
    setIsLoading(true);
    
    try {
      const savedDetails = await savePartyDetails(updatedDetails);
      setPartyDetails(savedDetails);
      
      // Update theme if changed
      if (updatedDetails.theme && updatedDetails.theme !== partyTheme) {
        setPartyTheme(updatedDetails.theme);
      }
    } catch (error) {
      console.error('Error updating party details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle name submission (for welcome popup)
  const handleNameSubmit = async ({ childName, childAge }) => {
    await handlePartyDetailsUpdate({ childName, childAge });
  };

  return {
    partyDetails,
    partyTheme,
    themeLoaded,
    isLoading, // Only true during actual processing, not initialization
    getPartyDetails: user && currentParty ? () => getPartyDetailsFromDatabase(currentParty) : getPartyDetailsFromLocalStorage,
    savePartyDetails,
    handleNameSubmit,
    handlePartyDetailsUpdate,
    setPartyDetails,
    setPartyTheme
  };
}