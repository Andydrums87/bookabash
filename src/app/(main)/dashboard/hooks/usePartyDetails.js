"use client"

import { useState, useEffect } from "react"

export function usePartyDetails() {
  const [partyDetails, setPartyDetails] = useState(null)
  const [partyTheme, setPartyTheme] = useState("superhero")
  const [themeLoaded, setThemeLoaded] = useState(false)

  // Get party details from localStorage
  const getPartyDetails = () => {
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

  // Save party details to localStorage
  const savePartyDetails = (details) => {
    try {
      const existingDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
      const updatedDetails = {
        ...existingDetails,
        ...details,
        postcode: details.postcode || (details.location?.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) ? details.location : existingDetails.postcode)
      };
      
      localStorage.setItem('party_details', JSON.stringify(updatedDetails));
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'party_details',
        newValue: JSON.stringify(updatedDetails)
      }));
      
      return updatedDetails;
    } catch (error) {
      console.error('Error saving party details:', error);
      return details;
    }
  };

  // Initialize party details
  useEffect(() => {
    const details = getPartyDetails();
    setPartyDetails(details);
  }, []);

  // Load theme
  useEffect(() => {
    if (themeLoaded) return;
    
    try {
      const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
      const storedTheme = partyDetails.theme;
      
      if (storedTheme) {
        setPartyTheme(storedTheme);
      } else {
        console.log('🎪 No theme found, using default: superhero');
        setPartyTheme('superhero');
      }
      
      setThemeLoaded(true);
    } catch (error) {
      console.error('Error loading theme:', error);
      setPartyTheme('superhero');
      setThemeLoaded(true);
    }
  }, [themeLoaded]);

  // Handle name submission (for welcome popup)
  const handleNameSubmit = ({ childName, childAge }) => {
    try {
      const currentDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
      const updatedDetails = {
        ...currentDetails,
        childName: childName,
        childAge: childAge
      };
      
      localStorage.setItem('party_details', JSON.stringify(updatedDetails));
      setPartyDetails(getPartyDetails());
      
      console.log('✅ Child info saved:', { childName, childAge });
    } catch (error) {
      console.error('❌ Error saving child info:', error);
    }
  };

  // Handle party details update
  const handlePartyDetailsUpdate = (updatedDetails) => {
    const savedDetails = savePartyDetails(updatedDetails);
    setPartyDetails(savedDetails);
    
    // Update theme if changed
    if (updatedDetails.theme && updatedDetails.theme !== partyTheme) {
      setPartyTheme(updatedDetails.theme);
    }
    
    console.log("Dashboard received updated party details:", savedDetails);
  };

  return {
    partyDetails,
    partyTheme,
    themeLoaded,
    getPartyDetails,
    savePartyDetails,
    handleNameSubmit,
    handlePartyDetailsUpdate,
    setPartyDetails,
    setPartyTheme
  };
}