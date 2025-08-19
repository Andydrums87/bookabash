// utils/venueHelpers.js - Simplified version with direct imports

import { partyPlanBackend } from '@/utils/partyPlanBackend'
import { useState, useEffect } from 'react'

// Get full venue information from party plan data
export const getFullVenueInfo = (fallbackVenue = null) => {
  try {
    console.log('🔍 Getting venue info using partyPlanBackend');
    
    // Get venue from party plan backend (not localStorage directly)
    const partyPlan = partyPlanBackend.getPartyPlan()
    
    console.log('📋 Party plan from backend:', partyPlan);
    console.log('📋 Party plan venue:', partyPlan?.venue);
    
    if (partyPlan?.venue) {
      const venue = partyPlan.venue
      
      console.log('🏢 Venue object keys:', Object.keys(venue));
      console.log('🏢 Original supplier exists:', !!venue.originalSupplier);
      
      if (venue.originalSupplier) {
        console.log('🏢 Original supplier keys:', Object.keys(venue.originalSupplier));
        console.log('🏢 Service details exists:', !!venue.originalSupplier.serviceDetails);
        
        if (venue.originalSupplier.serviceDetails) {
          console.log('🏢 Service details keys:', Object.keys(venue.originalSupplier.serviceDetails));
          console.log('🏢 Location exists:', !!venue.originalSupplier.serviceDetails.location);
          
          if (venue.originalSupplier.serviceDetails.location) {
            const location = venue.originalSupplier.serviceDetails.location;
            console.log('🏢 Location keys:', Object.keys(location));
            console.log('🏢 Full address value:', location.fullAddress);
            console.log('🏢 Postcode value:', location.postcode);
          }
        }
      }
      
      // Check if we have originalSupplier with serviceDetails
      if (venue.originalSupplier?.serviceDetails?.location?.fullAddress) {
        const fullAddress = venue.originalSupplier.serviceDetails.location.fullAddress
        const postcode = venue.originalSupplier.serviceDetails.location.postcode
        const venueName = venue.originalSupplier.name || venue.name
        
        console.log('✅ FOUND ADDRESS DATA:');
        console.log('  - Full address:', `"${fullAddress}"`);
        console.log('  - Postcode:', `"${postcode}"`);
        console.log('  - Venue name:', `"${venueName}"`);
        
        // Clean up the address (replace newlines with commas)
        const cleanAddress = fullAddress.replace(/\n/g, ', ').replace(/,\s*,/g, ',').trim()
        console.log('  - Clean address:', `"${cleanAddress}"`);
        
        // Build complete address with postcode
        const completeAddress = postcode && !cleanAddress.includes(postcode) 
          ? `${cleanAddress}, ${postcode}`
          : cleanAddress
        console.log('  - Complete address:', `"${completeAddress}"`);
        
        const result = {
          name: venueName.trim(),
          address: completeAddress,
          postcode: postcode,
          fullVenue: `${venueName.trim()}, ${completeAddress}`
        };
        
        console.log('✅ RETURNING VENUE RESULT:', result);
        return result;
      } else {
        console.log('❌ ADDRESS PATH CHECK FAILED:');
        console.log('  - originalSupplier exists:', !!venue.originalSupplier);
        console.log('  - serviceDetails exists:', !!venue.originalSupplier?.serviceDetails);
        console.log('  - location exists:', !!venue.originalSupplier?.serviceDetails?.location);
        console.log('  - fullAddress exists:', !!venue.originalSupplier?.serviceDetails?.location?.fullAddress);
        console.log('  - fullAddress value:', venue.originalSupplier?.serviceDetails?.location?.fullAddress);
      }
      
      // Fallback: Check owner address if venue address not available
      if (venue.originalSupplier?.owner?.address) {
        const ownerAddress = venue.originalSupplier.owner.address
        const venueName = venue.originalSupplier.name || venue.name
        
        // Build address from owner address components
        const addressParts = [
          ownerAddress.street,
          ownerAddress.city,
          ownerAddress.postcode
        ].filter(Boolean)
        
        if (addressParts.length > 0) {
          const fullAddress = addressParts.join(', ')
          
          console.log('🏢 Found venue address in owner data:', fullAddress);
          
          return {
            name: venueName.trim(),
            address: fullAddress,
            postcode: ownerAddress.postcode,
            fullVenue: `${venueName.trim()}, ${fullAddress}`
          }
        }
      }
      
      // Fallback: Use just postcode if available
      if (venue.originalSupplier?.serviceDetails?.location?.postcode || venue.originalSupplier?.location) {
        const venueName = venue.originalSupplier.name || venue.name
        const postcode = venue.originalSupplier.serviceDetails?.location?.postcode || venue.originalSupplier.location
        
        console.log('🏢 Using venue with postcode only:', venueName, postcode);
        
        return {
          name: venueName.trim(),
          address: postcode,
          postcode: postcode,
          fullVenue: `${venueName.trim()}, ${postcode}`
        }
      }
      
      // Final fallback: venue name only
      console.log('🏢 No address found, using venue name only:', venue.name);
      return {
        name: venue.name.trim(),
        address: null,
        postcode: null,
        fullVenue: venue.name.trim()
      }
    }
    
    // Parse fallback venue if it contains address info
    if (fallbackVenue) {
      console.log('🔄 Analyzing fallback venue:', fallbackVenue);
      
      // Check if fallback already contains address (has comma)
      if (fallbackVenue.includes(',')) {
        const parts = fallbackVenue.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          return {
            name: parts[0],
            address: parts.slice(1).join(', '),
            postcode: null, // Could try to extract postcode from address string if needed
            fullVenue: fallbackVenue
          }
        }
      }
      
      // Single venue name
      return {
        name: fallbackVenue.trim(),
        address: null,
        postcode: null,
        fullVenue: fallbackVenue.trim()
      }
    }
    
    // Final fallback
    return {
      name: 'Venue TBD',
      address: null,
      postcode: null,
      fullVenue: 'Venue TBD'
    }
    
  } catch (error) {
    console.error('❌ Error getting venue info:', error);
    
    return {
      name: fallbackVenue?.trim() || 'Venue TBD',
      address: null,
      postcode: null,
      fullVenue: fallbackVenue?.trim() || 'Venue TBD'
    }
  }
}

// Format venue for display (with smart truncation if needed)
export const formatVenueForDisplay = (venueInfo, maxLength = 80) => {
  if (!venueInfo?.fullVenue) return 'Venue TBD'
  
  const fullVenue = venueInfo.fullVenue
  
  if (fullVenue.length <= maxLength) {
    return fullVenue
  }
  
  // Smart truncation - try to keep venue name intact
  if (venueInfo.name && venueInfo.address) {
    const name = venueInfo.name
    const address = venueInfo.address
    
    // If name + ", " + partial address fits
    const remainingSpace = maxLength - name.length - 2 // 2 for ", "
    
    if (remainingSpace > 10) {
      const truncatedAddress = address.length > remainingSpace 
        ? address.substring(0, remainingSpace - 3) + '...'
        : address
      
      return `${name}, ${truncatedAddress}`
    }
  }
  
  // Last resort: truncate the full string
  return fullVenue.substring(0, maxLength - 3) + '...'
}

// React hook for venue information
export const useVenueInfo = (fallbackVenue = null) => {
  const [venueInfo, setVenueInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadVenueInfo = () => {
      try {
        setLoading(true)
        // Always try to get enhanced info first, regardless of fallback
        const info = getFullVenueInfo() // Don't pass fallback here
        console.log('🏢 Loaded venue info:', info)
        
        // If we got enhanced info, use it
        if (info && info.address) {
          setVenueInfo(info)
        } else if (fallbackVenue) {
          // Only use fallback if no enhanced info was found
          console.log('🏢 Using fallback venue:', fallbackVenue)
          setVenueInfo({
            name: fallbackVenue.trim(),
            address: null,
            postcode: null,
            fullVenue: fallbackVenue.trim()
          })
        } else {
          setVenueInfo(info) // Use whatever getFullVenueInfo returned
        }
      } catch (error) {
        console.error('Error loading venue info:', error)
        setVenueInfo({
          name: fallbackVenue?.trim() || 'Venue TBD',
          address: null,
          postcode: null,
          fullVenue: fallbackVenue?.trim() || 'Venue TBD'
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadVenueInfo()
  }, []) // Remove fallbackVenue from dependencies to prevent re-runs
  
  return { venueInfo, loading }
}

// Debug helper to see venue data structure
export const debugVenueData = () => {
  try {
    console.log('\n🔍 VENUE DEBUG INFO USING BACKEND:');
    const partyPlan = partyPlanBackend.getPartyPlan()
    
    console.log('📋 Full party plan from backend:', partyPlan);
    console.log('🏢 Venue object:', partyPlan?.venue);
    
    if (partyPlan?.venue?.originalSupplier) {
      const supplier = partyPlan.venue.originalSupplier
      console.log('🏢 Original supplier name:', supplier.name);
      console.log('🏢 Service details:', supplier.serviceDetails);
      console.log('🏢 Location data:', supplier.serviceDetails?.location);
      console.log('🏢 Full address:', supplier.serviceDetails?.location?.fullAddress);
      console.log('🏢 Postcode:', supplier.serviceDetails?.location?.postcode);
      console.log('🏢 Owner address:', supplier.owner?.address);
    } else {
      console.log('❌ No venue or originalSupplier found in party plan');
    }
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}