// utils/locationUtils.js
// Enhanced location matching for supplier filtering

// UK postcode area mappings
const POSTCODE_AREAS = {
    // London postcodes
    'W': { region: 'london', area: 'West London', zones: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14'] },
    'SW': { region: 'london', area: 'South West London', zones: ['SW1', 'SW2', 'SW3', 'SW4', 'SW5', 'SW6', 'SW7', 'SW8', 'SW9', 'SW10', 'SW11', 'SW12', 'SW13', 'SW14', 'SW15', 'SW16', 'SW17', 'SW18', 'SW19', 'SW20'] },
    'SE': { region: 'london', area: 'South East London', zones: ['SE1', 'SE2', 'SE3', 'SE4', 'SE5', 'SE6', 'SE7', 'SE8', 'SE9', 'SE10', 'SE11', 'SE12', 'SE13', 'SE14', 'SE15', 'SE16', 'SE17', 'SE18', 'SE19', 'SE20', 'SE21', 'SE22', 'SE23', 'SE24', 'SE25', 'SE26', 'SE27', 'SE28'] },
    'E': { region: 'london', area: 'East London', zones: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'E18', 'E20'] },
    'N': { region: 'london', area: 'North London', zones: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N16', 'N17', 'N18', 'N19', 'N20', 'N21', 'N22'] },
    'NW': { region: 'london', area: 'North West London', zones: ['NW1', 'NW2', 'NW3', 'NW4', 'NW5', 'NW6', 'NW7', 'NW8', 'NW9', 'NW10', 'NW11'] },
    'EC': { region: 'london', area: 'East Central London', zones: ['EC1', 'EC2', 'EC3', 'EC4'] },
    'WC': { region: 'london', area: 'West Central London', zones: ['WC1', 'WC2'] },
    
    // Major UK cities
    'M': { region: 'manchester', area: 'Manchester', zones: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26', 'M27', 'M28', 'M29', 'M30', 'M31', 'M32', 'M33', 'M34', 'M35', 'M38', 'M40', 'M41', 'M43', 'M44', 'M45', 'M46', 'M50', 'M60', 'M90'] },
    'B': { region: 'birmingham', area: 'Birmingham', zones: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30', 'B31', 'B32', 'B33', 'B34', 'B35', 'B36', 'B37', 'B38', 'B40', 'B42', 'B43', 'B44', 'B45', 'B46', 'B47', 'B48', 'B49', 'B50', 'B60', 'B61', 'B62', 'B63', 'B64', 'B65', 'B66', 'B67', 'B68', 'B69', 'B70', 'B71', 'B72', 'B73', 'B74', 'B75', 'B76', 'B77', 'B78', 'B79', 'B80', 'B90', 'B91', 'B92', 'B93', 'B94', 'B95', 'B96', 'B97', 'B98', 'B99'] },
    'LS': { region: 'leeds', area: 'Leeds', zones: ['LS1', 'LS2', 'LS3', 'LS4', 'LS5', 'LS6', 'LS7', 'LS8', 'LS9', 'LS10', 'LS11', 'LS12', 'LS13', 'LS14', 'LS15', 'LS16', 'LS17', 'LS18', 'LS19', 'LS20', 'LS21', 'LS22', 'LS23', 'LS24', 'LS25', 'LS26', 'LS27', 'LS28', 'LS29'] },
    'L': { region: 'liverpool', area: 'Liverpool', zones: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'L21', 'L22', 'L23', 'L24', 'L25', 'L26', 'L27', 'L28', 'L29', 'L30', 'L31', 'L32', 'L33', 'L34', 'L35', 'L36', 'L37', 'L38', 'L39', 'L40', 'L67', 'L68', 'L69', 'L70', 'L71', 'L72', 'L73', 'L74', 'L75'] },
    'BS': { region: 'bristol', area: 'Bristol', zones: ['BS1', 'BS2', 'BS3', 'BS4', 'BS5', 'BS6', 'BS7', 'BS8', 'BS9', 'BS10', 'BS11', 'BS13', 'BS14', 'BS15', 'BS16', 'BS20', 'BS21', 'BS22', 'BS23', 'BS24', 'BS25', 'BS26', 'BS27', 'BS28', 'BS29', 'BS30', 'BS31', 'BS32', 'BS34', 'BS35', 'BS36', 'BS37', 'BS39', 'BS40', 'BS41', 'BS48', 'BS49', 'BS80', 'BS99'] }
  };
  
  // Extract postcode area from full postcode
  const extractPostcodeArea = (postcode) => {
    if (!postcode) return null;
    
    const clean = postcode.replace(/\s/g, '').toUpperCase();
    
    // Try to match longest possible area first (e.g., SW, NW, EC, WC)
    const twoLetterMatch = clean.match(/^([A-Z]{2})/);
    if (twoLetterMatch && POSTCODE_AREAS[twoLetterMatch[1]]) {
      return {
        area: twoLetterMatch[1],
        district: clean.match(/^([A-Z]{2}\d+)/)?.[1] || twoLetterMatch[1],
        ...POSTCODE_AREAS[twoLetterMatch[1]]
      };
    }
    
    // Try single letter areas (e.g., W, E, N, M, B, L)
    const oneLetterMatch = clean.match(/^([A-Z])/);
    if (oneLetterMatch && POSTCODE_AREAS[oneLetterMatch[1]]) {
      return {
        area: oneLetterMatch[1],
        district: clean.match(/^([A-Z]\d+)/)?.[1] || oneLetterMatch[1],
        ...POSTCODE_AREAS[oneLetterMatch[1]]
      };
    }
    
    return null;
  };
  
  // Calculate distance category between two postcodes
  const calculateLocationMatch = (userPostcode, supplierLocation) => {
    if (!userPostcode || !supplierLocation) return { matches: false, distance: 'unknown' };
    
    const userArea = extractPostcodeArea(userPostcode);
    
    // Check if supplier serves this area specifically
    const supplierLocationLower = supplierLocation.toLowerCase();
    
    // Direct postcode match
    if (supplierLocationLower.includes(userPostcode.toLowerCase().replace(/\s/g, ''))) {
      return { matches: true, distance: 'exact', score: 100 };
    }
    
    // UK Wide coverage
    if (supplierLocationLower.includes('uk wide') || 
        supplierLocationLower.includes('nationwide') ||
        supplierLocationLower.includes('all uk')) {
      return { matches: true, distance: 'nationwide', score: 90 };
    }
    
    if (!userArea) {
      // If we can't parse the user's postcode, fall back to text matching
      if (supplierLocationLower.includes('london') && userPostcode.toLowerCase().includes('london')) {
        return { matches: true, distance: 'city', score: 70 };
      }
      return { matches: false, distance: 'unknown', score: 0 };
    }
    
    // Region-specific matching
    if (userArea.region === 'london') {
      // London-specific checks
      if (supplierLocationLower.includes('london') || 
          supplierLocationLower.includes('greater london') ||
          supplierLocationLower.includes('home counties')) {
        
        // Check for specific area matches
        if (supplierLocationLower.includes(userArea.area.toLowerCase()) ||
            supplierLocationLower.includes(userArea.district.toLowerCase())) {
          return { matches: true, distance: 'local', score: 95 };
        }
        
        return { matches: true, distance: 'city', score: 80 };
      }
      
      // Check for surrounding areas
      if (supplierLocationLower.includes('surrounding') || 
          supplierLocationLower.includes('home counties')) {
        return { matches: true, distance: 'regional', score: 75 };
      }
    } else {
      // Non-London city matching
      const cityName = userArea.area.toLowerCase();
      if (supplierLocationLower.includes(cityName) ||
          supplierLocationLower.includes(userArea.region)) {
        return { matches: true, distance: 'city', score: 85 };
      }
      
      // Check for regional coverage
      if (supplierLocationLower.includes('north') && ['manchester', 'leeds', 'liverpool'].includes(userArea.region)) {
        return { matches: true, distance: 'regional', score: 70 };
      }
      
      if (supplierLocationLower.includes('midlands') && userArea.region === 'birmingham') {
        return { matches: true, distance: 'regional', score: 70 };
      }
    }
    
    return { matches: false, distance: 'outside_area', score: 0 };
  };
  
  // Enhanced filter function for suppliers based on location
  const filterSuppliersByLocation = (suppliers, userPostcode, distancePreference = '10') => {
    if (!userPostcode || distancePreference === 'all') {
      return suppliers.map(supplier => ({ ...supplier, locationMatch: { matches: true, distance: 'any', score: 50 } }));
    }
    
    return suppliers.map(supplier => {
      const locationMatch = calculateLocationMatch(userPostcode, supplier.location);
      return {
        ...supplier,
        locationMatch
      };
    }).filter(supplier => {
      const { locationMatch } = supplier;
      
      // Always include if matches
      if (locationMatch.matches) {
        // Filter by distance preference
        switch (distancePreference) {
          case '5':
            return ['exact', 'local'].includes(locationMatch.distance);
          case '10':
            return ['exact', 'local', 'city'].includes(locationMatch.distance);
          case '15':
            return ['exact', 'local', 'city', 'regional'].includes(locationMatch.distance);
          default:
            return true;
        }
      }
      
      return false;
    }).sort((a, b) => {
      // Sort by location score (closer/more relevant first)
      return (b.locationMatch?.score || 0) - (a.locationMatch?.score || 0);
    });
  };
  
  // Get user-friendly location description
  const getLocationDescription = (postcode) => {
    const area = extractPostcodeArea(postcode);
    if (!area) return postcode;
    
    return `${area.area} (${area.district})`;
  };
  
  // Export functions
  export {
    extractPostcodeArea,
    calculateLocationMatch,
    filterSuppliersByLocation,
    getLocationDescription,
    POSTCODE_AREAS
  };
  
  // Usage example for your supplier modal:
  /*
  // In your SupplierSelectionModal component, replace the distance filter logic:
  
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers;
    
    // 1. Category filter (existing)
    filtered = filtered.filter(supplier => {
      // Your existing category logic
    });
    
    // 2. Location/Distance filter (NEW - enhanced)
    if (userPostcode) {
      filtered = filterSuppliersByLocation(filtered, userPostcode, distance);
    }
    
    // 3. Other filters (price, rating, availability)
    // Your existing filter logic
    
    return filtered;
  }, [suppliers, userPostcode, distance, ...other dependencies]);
  */