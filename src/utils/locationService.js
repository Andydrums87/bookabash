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
         
              return extractedPostcode;
            }
          }
          
          // Fallback to direct postcode
          if (location.postcode) {
 
            return location.postcode;
          }
        }
        
        // Fallback to owner address postcode
        if (partyPlan?.venue?.originalSupplier?.owner?.address?.postcode) {
          const postcode = partyPlan.venue.originalSupplier.owner.address.postcode;
 
          return postcode;
        }
        
        
        return null;
      } catch (error) {
        console.error('❌ Error getting venue location:', error);
        return null;
      }
    }
    
    // Get appropriate comparison location based on supplier category
    static getComparisonLocation(category, partyLocation) {
    
      
      // For venues, use the party location (user's preference)
      if (category === 'Venues' || category === 'venue') {
     
        return partyLocation;
      }
      
      // For all other suppliers (mobile services), use the venue location
      const venueLocation = this.getVenueLocation();
      if (venueLocation) {

        return venueLocation;
      }
      
  
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
    static arePostcodesNearby(supplierLocation, targetLocation, maxDistance = 'district') {
      if (!supplierLocation || !targetLocation) return true;
      
      // Extract postcodes from venue strings if needed
      let supplierPostcode = supplierLocation;
      let targetPostcode = targetLocation;
      
      // If target location looks like a venue string, extract postcode
      if (targetLocation.includes(',')) {
        const extractedPostcode = this.extractPostcodeFromVenueString(targetLocation);
        if (extractedPostcode) {
          targetPostcode = extractedPostcode;
        }
      }
      
      // If supplier location looks like a venue string, extract postcode
      if (supplierLocation.includes(',')) {
        const extractedPostcode = this.extractPostcodeFromVenueString(supplierLocation);
        if (extractedPostcode) {
          supplierPostcode = extractedPostcode;
        }
      }
      
      const supplierIsDescriptive = this.isDescriptiveLocation(supplierPostcode);
      const supplierIsValidPostcode = this.isValidPostcode(supplierPostcode);
      const targetIsValidPostcode = this.isValidPostcode(targetPostcode);
      
      // Handle descriptive locations (mock suppliers)
      if (supplierIsDescriptive) {
        if (maxDistance === 'all' || maxDistance === 'wide') {
          return true;
        } else {
          return false;
        }
      }
      
      // If target location is not a valid postcode, be more lenient
      if (!targetIsValidPostcode) {
        return true;
      }
      
      // If supplier doesn't have a valid postcode but target does, only allow for wide coverage
      if (!supplierIsValidPostcode && targetIsValidPostcode) {
        return maxDistance === 'all' || maxDistance === 'wide';
      }
      
      // Both have valid postcodes - do proper distance checking
      const supplierArea = this.getPostcodeArea(supplierPostcode);
      const targetArea = this.getPostcodeArea(targetPostcode);
      const supplierDistrict = this.getPostcodeDistrict(supplierPostcode);
      const targetDistrict = this.getPostcodeDistrict(targetPostcode);
      
      // ✅ EXACT POSTCODE MATCH (highest priority) - Always return true with high confidence
      const normalizedSupplier = supplierPostcode.toUpperCase().replace(/\s/g, '');
      const normalizedTarget = targetPostcode.toUpperCase().replace(/\s/g, '');
      
      if (normalizedSupplier === normalizedTarget) {
        console.log(`🎯 EXACT postcode match: ${supplierPostcode} === ${targetPostcode}`);
        return true; // Always allow exact matches regardless of maxDistance
      }
      
      // ✅ SAME DISTRICT MATCH (e.g., W4 4BZ and W4 5XX) - Very close
      if (supplierDistrict === targetDistrict) {
        console.log(`📍 Same district match: ${supplierDistrict}`);
        return true; // Same district is close enough for venues
      }
      
      // ✅ SAME AREA MATCH (e.g., W4 and W3) - Nearby in same area
      if (supplierArea === targetArea) {
        console.log(`📍 Same area match: ${supplierArea}`);
        // For venues (maxDistance === 'exact'), same area is acceptable
        // W3 and W4 are both West London, very close
        return true;
      }
      
      // For exact distance requirement (venues), stop here if not same area
      if (maxDistance === 'exact') {
    
        return false;
      }
      
      // Adjacent areas (London adjacency map) - for wider search
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
      
      if (isAdjacent && (maxDistance === 'district' || maxDistance === 'wide' || maxDistance === 'all')) {
        console.log(`📍 Adjacent areas: ${supplierArea} <-> ${targetArea}`);
        return true;
      }
      
      console.log(`❌ Too far: ${supplierArea} vs ${targetArea}`);
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