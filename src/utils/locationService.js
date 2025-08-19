// utils/locationService.js - Smart location filtering for different supplier types

export class LocationService {
  
    // Extract postcode area from full postcode
    static getPostcodeArea(postcode) {
      if (!postcode) return null;
      const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
      const areaMatch = cleaned.match(/^([A-Z]{1,2})/);
      return areaMatch ? areaMatch[1] : null;
    }
    
    // Extract postcode district from full postcode  
    static getPostcodeDistrict(postcode) {
      if (!postcode) return null;
      const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
      const districtMatch = cleaned.match(/^([A-Z]{1,2}\d{1,2})/);
      return districtMatch ? districtMatch[1] : null;
    }
    
    // Extract postcode from a venue string (like "The Church, 18 Birkbeck grove, London, W3 7QD")
    static extractPostcodeFromVenueString(venueString) {
      if (!venueString) return null;
      
      // UK postcode regex pattern
      const postcodeRegex = /([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})(?:\s*,?\s*$|$)/i;
      const match = venueString.match(postcodeRegex);
      
      if (match) {
        const postcode = match[1].replace(/\s+/g, '').toUpperCase();
        // Add space before last 3 characters for proper UK postcode format
        return postcode.slice(0, -3) + ' ' + postcode.slice(-3);
      }
      
      return null;
    }
    
    // Get the venue location from party plan
    static getVenueLocation() {
      try {
        // Get venue from party plan
        const { partyPlanBackend } = require('@/utils/partyPlanBackend');
        const partyPlan = partyPlanBackend.getPartyPlan();
        
        if (partyPlan?.venue?.originalSupplier?.serviceDetails?.location) {
          const location = partyPlan.venue.originalSupplier.serviceDetails.location;
          
          // Try to get full address first
          if (location.fullAddress) {
            const extractedPostcode = this.extractPostcodeFromVenueString(location.fullAddress);
            if (extractedPostcode) {
              console.log(`🏢 Using venue postcode from address: ${extractedPostcode}`);
              return extractedPostcode;
            }
          }
          
          // Fallback to direct postcode
          if (location.postcode) {
            console.log(`🏢 Using venue postcode: ${location.postcode}`);
            return location.postcode;
          }
        }
        
        // Fallback to owner address postcode
        if (partyPlan?.venue?.originalSupplier?.owner?.address?.postcode) {
          const postcode = partyPlan.venue.originalSupplier.owner.address.postcode;
          console.log(`🏢 Using venue owner postcode: ${postcode}`);
          return postcode;
        }
        
        console.log('⚠️ No venue location found in party plan');
        return null;
      } catch (error) {
        console.error('❌ Error getting venue location:', error);
        return null;
      }
    }
    
    // Get appropriate comparison location based on supplier category
    static getComparisonLocation(category, partyLocation) {
      console.log(`🎯 Getting comparison location for category: ${category}`);
      
      // For venues, use the party location (user's preference)
      if (category === 'Venues' || category === 'venue') {
        console.log(`🏢 Using party location for venue: ${partyLocation}`);
        return partyLocation;
      }
      
      // For all other suppliers (mobile services), use the venue location
      const venueLocation = this.getVenueLocation();
      if (venueLocation) {
        console.log(`🚗 Using venue location for mobile service (${category}): ${venueLocation}`);
        return venueLocation;
      }
      
      // Fallback to party location if no venue selected
      console.log(`🔄 Fallback to party location for ${category}: ${partyLocation}`);
      return partyLocation;
    }
    
    // Check if location is a descriptive/mock location vs real postcode
    static isDescriptiveLocation(location) {
      if (!location) return false;
      
      const descriptivePatterns = [
        /central london/i,
        /london wide/i, 
        /greater london/i,
        /uk wide/i,
        /nationwide/i,
        /london$/i,
        /^london/i
      ];
      
      return descriptivePatterns.some(pattern => pattern.test(location.trim()));
    }
    
    // Check if location is a valid UK postcode
    static isValidPostcode(postcode) {
      if (!postcode) return false;
      
      // UK postcode regex pattern
      const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
      const areaOnlyRegex = /^[A-Z]{1,2}\d[A-Z\d]?$/i; // Just the area part
      
      const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
      return postcodeRegex.test(cleaned) || areaOnlyRegex.test(cleaned);
    }
    
    // Main distance checking function
    static arePostcodesNearby(supplierLocation, targetLocation, maxDistance = 'district') {
      if (!supplierLocation || !targetLocation) return true;
      
      console.log(`🔍 Checking distance: "${supplierLocation}" → "${targetLocation}" (max: ${maxDistance})`);
      
      // Extract postcodes from venue strings if needed
      let supplierPostcode = supplierLocation;
      let targetPostcode = targetLocation;
      
      // If target location looks like a venue string, extract postcode
      if (targetLocation.includes(',')) {
        const extractedPostcode = this.extractPostcodeFromVenueString(targetLocation);
        if (extractedPostcode) {
          targetPostcode = extractedPostcode;
          console.log(`📍 Extracted target postcode: "${extractedPostcode}" from "${targetLocation}"`);
        }
      }
      
      // If supplier location looks like a venue string, extract postcode
      if (supplierLocation.includes(',')) {
        const extractedPostcode = this.extractPostcodeFromVenueString(supplierLocation);
        if (extractedPostcode) {
          supplierPostcode = extractedPostcode;
          console.log(`📍 Extracted supplier postcode: "${extractedPostcode}" from "${supplierLocation}"`);
        }
      }
      
      const supplierIsDescriptive = this.isDescriptiveLocation(supplierPostcode);
      const supplierIsValidPostcode = this.isValidPostcode(supplierPostcode);
      const targetIsValidPostcode = this.isValidPostcode(targetPostcode);
      
      console.log(`📍 Analysis:`, {
        supplier: { location: supplierPostcode, isDescriptive: supplierIsDescriptive, isValid: supplierIsValidPostcode },
        target: { location: targetPostcode, isValid: targetIsValidPostcode }
      });
      
      // Handle descriptive locations (mock suppliers)
      if (supplierIsDescriptive) {
        if (maxDistance === 'all' || maxDistance === 'wide') {
          console.log(`✅ ${supplierPostcode}: Descriptive location allowed for wide distance setting`);
          return true;
        } else {
          console.log(`⚠️ ${supplierPostcode}: Descriptive location deprioritized for ${maxDistance} distance`);
          return false;
        }
      }
      
      // If target location is not a valid postcode, be more lenient
      if (!targetIsValidPostcode) {
        console.log(`⚠️ Target location "${targetPostcode}" is not a valid postcode - allowing all suppliers`);
        return true;
      }
      
      // If supplier doesn't have a valid postcode but target does, only allow for wide coverage
      if (!supplierIsValidPostcode && targetIsValidPostcode) {
        console.log(`❌ ${supplierPostcode}: Invalid postcode format, target has valid postcode`);
        return maxDistance === 'all' || maxDistance === 'wide';
      }
      
      // Both have valid postcodes - do proper distance checking
      const supplierArea = this.getPostcodeArea(supplierPostcode);
      const targetArea = this.getPostcodeArea(targetPostcode);
      
      console.log(`📮 Postcode areas: ${supplierPostcode} (${supplierArea}) → ${targetPostcode} (${targetArea})`);
      
      // Exact postcode match (highest priority)
      if (supplierPostcode.toUpperCase().replace(/\s/g, '') === targetPostcode.toUpperCase().replace(/\s/g, '')) {
        console.log(`✅ Exact postcode match`);
        return true;
      }
      
      // Same area match
      if (supplierArea === targetArea) {
        console.log(`✅ Same postcode area (${supplierArea})`);
        return true;
      }
      
      // Adjacent areas based on distance setting
      if (maxDistance === 'exact') {
        console.log(`❌ Exact distance required, different areas`);
        return false;
      }
      
      // Adjacent areas (London adjacency map)
      const londonAdjacency = {
        'SW': ['SE', 'W', 'TW', 'CR', 'SM'],
        'SE': ['SW', 'E', 'BR', 'DA', 'TN'],
        'W': ['SW', 'NW', 'TW', 'UB'],
        'E': ['SE', 'N', 'IG', 'RM'],
        'N': ['E', 'NW', 'EN', 'AL'],
        'NW': ['N', 'W', 'HA', 'WD'],
      };
      
      const isAdjacent = londonAdjacency[supplierArea]?.includes(targetArea) || 
                        londonAdjacency[targetArea]?.includes(supplierArea);
      
      if (isAdjacent) {
        console.log(`✅ Adjacent areas (${supplierArea} ↔ ${targetArea})`);
        return true;
      }
      
      console.log(`❌ Areas too far apart (${supplierArea} → ${targetArea})`);
      return false;
    }
    
    // Get service radius category based on supplier type
    static getServiceRadiusForSupplier(supplier) {
      const category = supplier.category?.toLowerCase();
      const name = supplier.name?.toLowerCase() || '';
      
      // Different supplier types have different travel willingness
      if (category === 'venues') {
        return 'exact'; // Venues don't travel
      } else if (category === 'entertainment' || name.includes('entertainer')) {
        return 'wide'; // Entertainers travel further
      } else if (category === 'catering') {
        return 'district'; // Caterers moderate travel
      } else {
        return 'district'; // Default moderate travel
      }
    }
  }