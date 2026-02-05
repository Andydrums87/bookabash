"use client"

import { useState, useEffect } from "react"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { calculateFinalPrice } from '@/utils/unifiedPricing' // ✅ Import pricing system

export function usePartyDetails(user = null, currentParty = null, cachedPartyDetails = null, cachedPartyTheme = null) {
  const [partyDetails, setPartyDetails] = useState(cachedPartyDetails)
  const [partyTheme, setPartyTheme] = useState(cachedPartyTheme || "superhero")
  const [themeLoaded, setThemeLoaded] = useState(!!cachedPartyDetails) // ✅ Already loaded if cached
  const [isLoading, setIsLoading] = useState(!cachedPartyDetails) // ✅ Not loading if cached
  const [isRebuilding, setIsRebuilding] = useState(false) // ✅ Track when rebuilding for age-specific party

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
        childPhoto: partyDetails?.childPhoto || null,
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
    
    let firstName = "";
    let lastName = "";
    
    if (party.child_name) {
      const nameParts = party.child_name.trim().split(' ');
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(' ') || "";
    }
    
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

  // Initialize party details
  useEffect(() => {

    // If we already have cached data, don't reload
    if (cachedPartyDetails && partyDetails) {
      console.log('⚡ Using cached party details, skipping load')
      return
    }

    // Wait for user/currentParty to be determined (not undefined)
    if (user === undefined || currentParty === undefined) {
      // Don't set loading state until we know what we're loading
      return;
    }

    setIsLoading(true);

    let details;

    if (user && currentParty) {
      // Database user with party - load from database
      details = getPartyDetailsFromDatabase(currentParty);
    } else if (user === null && currentParty === null) {
      // Confirmed no user/party - use localStorage

      details = getPartyDetailsFromLocalStorage();

    } else {
      // Still waiting for data
      return;
    }

    setPartyDetails(details);

    if (details.theme) {
      setPartyTheme(details.theme);
    }
    setThemeLoaded(true);
    setIsLoading(false);
  }, [user, currentParty, cachedPartyDetails]);

  // ✅ NEW: Function to recalculate supplier pricing when party details change
  const recalculateSupplierPricing = (updatedPartyDetails) => {
    try {
      console.log('🔄 Recalculating supplier pricing for updated party details...');
      
      // Get current party plan
      const partyPlanString = localStorage.getItem('user_party_plan');
      if (!partyPlanString) {
        console.log('📝 No party plan found, skipping pricing recalculation');
        return;
      }

      const partyPlan = JSON.parse(partyPlanString);
      const addons = partyPlan.addons || [];
      let hasChanges = false;

      // Process each supplier in the party plan
      Object.entries(partyPlan).forEach(([category, supplier]) => {
        // ✅ FIX: Skip addons, einvites, and suppliers without original data
        if (!supplier || category === 'addons' || category === 'einvites' || !supplier.originalSupplier) {
          return; // Skip non-suppliers or suppliers without original data
        }

        try {
          // Get addons for this specific supplier
          const supplierAddons = addons.filter(addon => 
            addon.supplierId === supplier.id || 
            addon.supplierType === category ||
            addon.attachedToSupplier === category
          );

          // Calculate fresh pricing using the original supplier data
          const pricingResult = calculateFinalPrice(
            supplier.originalSupplier, 
            updatedPartyDetails, 
            supplierAddons
          );

          // Check if price changed
          const oldPrice = supplier.price || 0;
          const newPrice = pricingResult.finalPrice;

          if (oldPrice !== newPrice) {
            console.log(`💰 Price updated for ${supplier.name}: £${oldPrice} → £${newPrice}`, {
              isWeekend: pricingResult.details.isWeekend,
              weekendPremium: pricingResult.breakdown.weekend,
              extraHours: pricingResult.breakdown.extraHours
            });

            // Update the supplier with new pricing
            partyPlan[category] = {
              ...supplier,
              price: newPrice,
              lastPricingUpdate: new Date().toISOString(),
              currentPricing: pricingResult
            };

            hasChanges = true;
          }

        } catch (pricingError) {
          console.error(`❌ Error recalculating pricing for ${category}:`, pricingError);
        }
      });

      // Save updated party plan if there were changes
      if (hasChanges) {
        localStorage.setItem('user_party_plan', JSON.stringify(partyPlan));
        
        // Trigger storage event so other components update
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user_party_plan',
          newValue: JSON.stringify(partyPlan)
        }));

        console.log('✅ Supplier pricing recalculated and saved');
      } else {
        console.log('📝 No pricing changes needed');
      }

    } catch (error) {
      console.error('❌ Error in recalculateSupplierPricing:', error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'party_details') {
        console.log('🔄 localStorage changed, updating party details');
        const updatedDetails = JSON.parse(e.newValue || '{}');
        setPartyDetails(updatedDetails);
        
        if (updatedDetails.theme) {
          setPartyTheme(updatedDetails.theme);
        }
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const savePartyDetails = async (details) => {
    try {
      if (user) {
        // Database logic (existing code)
      } else {
        // Guest user - save to localStorage
        const existingDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
        
        let updatedDetails = {
          ...existingDetails,
          ...details,
          postcode: details.postcode || (details.location?.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) ? details.location : existingDetails.postcode)
        };
        
        // Handle name extraction
        if (details.childName) {
          const nameParts = details.childName.split(' ');
          updatedDetails.firstName = nameParts[0] || '';
          updatedDetails.lastName = nameParts.slice(1).join(' ') || '';
 
        }
        
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

  // ✅ FIXED: Enhanced party details update with automatic pricing recalculation
  const handlePartyDetailsUpdate = async (updatedDetails) => {
    console.log('🔄 Handling party details update with pricing recalculation:', updatedDetails);
    
    // Save the updated details
    const savedDetails = await savePartyDetails(updatedDetails);
    setPartyDetails(savedDetails);
    
    // Update theme if changed
    if (updatedDetails.theme && updatedDetails.theme !== partyTheme) {
      setPartyTheme(updatedDetails.theme);
    }
    
    // ✅ NEW: Check if pricing-affecting fields changed and recalculate if needed
    const pricingAffectingFields = ['date', 'startTime', 'duration', 'guestCount'];
    const hasPricingChanges = pricingAffectingFields.some(field => 
      updatedDetails.hasOwnProperty(field)
    );

    if (hasPricingChanges) {
      console.log('💰 Pricing-affecting fields changed, recalculating supplier pricing...');
      
      // Create enhanced party details for pricing calculation
      const enhancedPartyDetails = {
        ...partyDetails,
        ...savedDetails,
        // Ensure date is a proper Date object for pricing calculations
        date: savedDetails.date ? new Date(savedDetails.date) : new Date()
      };

      // Recalculate supplier pricing
      recalculateSupplierPricing(enhancedPartyDetails);
    }
  };

  // Handle name submission (for welcome popup)
  // For age-specific parties (toddlers, teens, etc.), we rebuild the party plan with appropriate recommendations
  const handleNameSubmit = async ({ childName, childAge, firstName, lastName }) => {
    // Check if we need to rebuild for age-specific recommendations BEFORE updating
    const needsRebuild = childAge && childAge <= 2; // Toddler party (ages 1-2)
    // Future: Add more age-specific rebuilds here (e.g., teen parties, etc.)

    // Set rebuilding state BEFORE closing the popup so dashboard shows loading
    if (needsRebuild) {
      setIsRebuilding(true);
    }

    await handlePartyDetailsUpdate({ childName, childAge, firstName, lastName });

    // AGE-SPECIFIC PARTY REBUILD: Rebuild the party plan with age-appropriate recommendations
    if (needsRebuild) {
      console.log(`👶 Toddler party detected (age ${childAge}) - rebuilding party plan`);
      try {
        const { partyBuilderBackend } = await import('@/utils/partyBuilderBackend');
        const existingDetails = JSON.parse(localStorage.getItem('party_details') || '{}');

        const rebuildResult = await partyBuilderBackend.buildParty({
          ...existingDetails,
          childName,
          childAge,
          firstName,
          lastName
        });

        if (rebuildResult.success) {
          console.log('👶 Party plan rebuilt for toddler:', rebuildResult);
          // Trigger storage event so components update
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'user_party_plan',
            newValue: localStorage.getItem('user_party_plan')
          }));
        }
      } catch (rebuildError) {
        console.error('Error rebuilding party for toddler:', rebuildError);
      } finally {
        // Always clear rebuilding state
        setIsRebuilding(false);
      }
    }
  };

  return {
    partyDetails,
    partyTheme,
    themeLoaded,
    isLoading,
    isRebuilding, // ✅ Track when rebuilding for age-specific party (shows loading skeletons)
    getPartyDetails: user && currentParty ? () => getPartyDetailsFromDatabase(currentParty) : getPartyDetailsFromLocalStorage,
    savePartyDetails,
    handleNameSubmit,
    handlePartyDetailsUpdate, // ✅ Now includes automatic pricing recalculation
    setPartyDetails,
    setPartyTheme,
    // ✅ NEW: Expose the pricing recalculation function for manual use if needed
    recalculateSupplierPricing
  };
}