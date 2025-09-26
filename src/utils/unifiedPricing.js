// utils/unifiedPricing.js - Updated with additional entertainer logic

/**
 * Check if supplier is lead-based (fixed price, not affected by date/duration)
 * @param {Object} supplier - Supplier object
 * @returns {boolean} True if lead-based supplier
 */
export const isLeadBasedSupplier = (supplier) => {
  if (!supplier) return false;
  
  const category = supplier.category?.toLowerCase() || '';
  const type = supplier.type?.toLowerCase() || '';
  
  // Lead-based supplier categories (prepared in advance, fixed pricing)
  const leadBasedCategories = [
    'party bags',
    'party bag', 
    'partybags',
    'cakes',
    'cake', 
    'decorations',
    'decoration',
    'balloons',
    'balloon',
    'photography'
  ];
  
  const isLeadBased = leadBasedCategories.some(leadCategory => {
    const matches = category.includes(leadCategory) || type.includes(leadCategory);
    return matches;
  });
  
  // Additional specific checks for edge cases
  if (!isLeadBased) {
    if (category.includes('party') && category.includes('bag')) {
      return true;
    }
    if (type.includes('party') && type.includes('bag')) {
      return true;
    }
    if (type === 'partybags' || category === 'partybags') {
      return true;
    }
  }

  return isLeadBased;
};

/**
 * Get the extra hour rate for a supplier
 * For venues: use their hourly rate
 * For other suppliers: use their set extraHourRate
 * @param {Object} supplier - Supplier object
 * @returns {number} Extra hour rate
 */
const getExtraHourRate = (supplier) => {
  if (!supplier) return 0;

  // For venues, extra hours are charged at their standard hourly rate
  if (supplier.serviceType === 'venue' || supplier.category === 'Venues') {
    const hourlyRate = supplier.serviceDetails?.pricing?.hourlyRate || 0;
    console.log('🏢 VENUE: Using hourly rate for extra hours:', hourlyRate);
    return hourlyRate;
  }

  // For all other suppliers, use their set extra hour rate
  const extraHourRate = supplier.serviceDetails?.extraHourRate || supplier.extraHourRate || 0;
  console.log('👥 NON-VENUE: Using extra hour rate:', extraHourRate);
  return extraHourRate;
};

/**
 * Calculate additional entertainer requirements and costs
 * @param {Object} supplier - Supplier object
 * @param {number} guestCount - Number of guests at the party
 * @returns {Object} Additional entertainer calculation result
 */
const calculateAdditionalEntertainerCost = (supplier, guestCount) => {
  // Only apply to entertainment suppliers
  if (!supplier || supplier.category !== 'Entertainment') {
    return { 
      additionalEntertainers: 0, 
      additionalEntertainerCost: 0, 
      guestsPerEntertainer: 0 
    };
  }

  const serviceDetails = supplier.serviceDetails || {};
  const groupSizeMax = serviceDetails.groupSizeMax || supplier.groupSizeMax || 30;
  const additionalEntertainerPrice = serviceDetails.additionalEntertainerPrice || supplier.additionalEntertainerPrice || 0;

  console.log('🎭 ENTERTAINER: Additional entertainer calculation:', {
    supplier: supplier.name,
    guestCount,
    groupSizeMax,
    additionalEntertainerPrice
  });

  // If no additional entertainer price is set, they don't offer this service
  if (additionalEntertainerPrice <= 0) {
    return { 
      additionalEntertainers: 0, 
      additionalEntertainerCost: 0, 
      guestsPerEntertainer: groupSizeMax 
    };
  }

  // Calculate how many additional entertainers are needed
  if (guestCount > groupSizeMax) {
    const excessGuests = guestCount - groupSizeMax;
    const additionalEntertainers = Math.ceil(excessGuests / groupSizeMax);
    const additionalEntertainerCost = additionalEntertainers * additionalEntertainerPrice;

    console.log('🎭 ENTERTAINER: Additional entertainers required:', {
      excessGuests,
      additionalEntertainers,
      additionalEntertainerCost
    });

    return {
      additionalEntertainers,
      additionalEntertainerCost,
      guestsPerEntertainer: groupSizeMax
    };
  }

  return { 
    additionalEntertainers: 0, 
    additionalEntertainerCost: 0, 
    guestsPerEntertainer: groupSizeMax 
  };
};

/**
* Get the true base price - always the original price, never enhanced
* @param {Object} supplier - Supplier object
* @param {Object} partyDetails - Party details (for guest count calculation)
* @returns {number} Base price
*/
const getTrueBasePrice = (supplier, partyDetails = {}) => {
  if (!supplier) return 0;

  console.log('🔍 UNIFIED DEBUG: getTrueBasePrice input:', {
    name: supplier.name,
    price: supplier.price,
    originalPrice: supplier.originalPrice,
    priceFrom: supplier.priceFrom,
    packageDataPrice: supplier.packageData?.price,
    packageDataOriginalPrice: supplier.packageData?.originalPrice
  });

  // Special handling for party bags
  if (supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')) {
    const pricePerBag = supplier.originalPrice || supplier.price || supplier.priceFrom || 5.00;
    const guestCount = getGuestCount(partyDetails);
    const total = pricePerBag * guestCount;
    console.log('🔍 UNIFIED DEBUG: Party bags calculation:', { pricePerBag, guestCount, total });
    return total;
  }

  // Use the price we explicitly set (package-specific), don't fall back to priceFrom
  let basePrice = 0;

  if (supplier.originalPrice) {
    basePrice = supplier.originalPrice;
    console.log('🔍 UNIFIED DEBUG: Using supplier.originalPrice:', basePrice);
  } else if (supplier.price) {
    basePrice = supplier.price;
    console.log('🔍 UNIFIED DEBUG: Using supplier.price:', basePrice);
  } else if (supplier.packageData?.originalPrice) {
    basePrice = supplier.packageData.originalPrice;
    console.log('🔍 UNIFIED DEBUG: Using supplier.packageData.originalPrice:', basePrice);
  } else if (supplier.packageData?.price) {
    basePrice = supplier.packageData.price;
    console.log('🔍 UNIFIED DEBUG: Using supplier.packageData.price:', basePrice);
  } else if (supplier.priceFrom) {
    basePrice = supplier.priceFrom;
    console.log('🔍 UNIFIED DEBUG: Using supplier.priceFrom as fallback:', basePrice);
  }

  console.log('🔍 UNIFIED DEBUG: Final base price:', basePrice);
  return basePrice;
};

/**
* Main pricing calculator with venue-specific extra hour logic and additional entertainer costs
* @param {Object} supplier - Supplier object with pricing data
* @param {Object} partyDetails - Party details (date, duration, guestCount)
* @param {Array} addons - Array of selected addons
* @returns {Object} Complete pricing breakdown
*/
export const calculateFinalPrice = (supplier, partyDetails = {}, addons = []) => {
  if (!supplier) {
    return {
      finalPrice: 0,
      breakdown: { base: 0, weekend: 0, extraHours: 0, addons: 0, additionalEntertainers: 0 },
      details: { 
        isWeekend: false, 
        extraHours: 0, 
        hasAddons: false, 
        isLeadBased: false,
        additionalEntertainers: 0,
        guestsPerEntertainer: 0
      }
    }
  }

  // Check if this is a lead-based supplier
  const isLeadBased = isLeadBasedSupplier(supplier);
  const guestCount = getGuestCount(partyDetails);

  // 1. ALWAYS start from true base price - never from enhanced price
  const basePrice = getTrueBasePrice(supplier, partyDetails);

  // 2. Calculate additional entertainer costs (NEW)
  const entertainerCalc = calculateAdditionalEntertainerCost(supplier, guestCount);

  // 3. Calculate weekend premium FRESH (don't use existing)
  let weekendPremium = 0;
  const isWeekend = partyDetails.date ? isWeekendDate(partyDetails.date) : false;

  if (!isLeadBased && isWeekend && supplier.weekendPremium?.enabled) {
    if (supplier.weekendPremium.type === 'fixed') {
      weekendPremium = supplier.weekendPremium.amount || 0;
    } else if (supplier.weekendPremium.type === 'percentage') {
      weekendPremium = Math.round((basePrice * supplier.weekendPremium.percentage) / 100);
    }
  } else if (isLeadBased && isWeekend) {
    console.log('🌅 Weekend premium SKIPPED for lead-based supplier');
  }

  // 4. Calculate extra hour costs FRESH - with venue-specific logic
  let extraHourCost = 0;
  let extraHours = 0;
  const standardDuration = 2;
  const partyDuration = partyDetails.duration || standardDuration;
  
  // Get the correct extra hour rate (venue-specific logic)
  const extraHourRate = getExtraHourRate(supplier);

  if (!isLeadBased && partyDuration > standardDuration && extraHourRate > 0) {
    extraHours = partyDuration - standardDuration;
    extraHourCost = extraHours * extraHourRate;
    
    console.log('⏰ Extra hour calculation:', {
      supplier: supplier.name,
      isVenue: supplier.serviceType === 'venue',
      partyDuration,
      standardDuration,
      extraHours,
      extraHourRate,
      extraHourCost
    });
  } else if (isLeadBased && partyDuration > standardDuration) {
    console.log('⏰ Extra hour cost SKIPPED for lead-based supplier');
  }

  // 5. Calculate addons total
  const addonsTotal = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);

  // 6. Calculate final price (including additional entertainers)
  const finalPrice = basePrice + weekendPremium + extraHourCost + addonsTotal + entertainerCalc.additionalEntertainerCost;

  return {
    finalPrice,
    basePrice, // This is now the TRUE base price
    breakdown: {
      base: basePrice,
      weekend: weekendPremium,
      extraHours: extraHourCost,
      addons: addonsTotal,
      additionalEntertainers: entertainerCalc.additionalEntertainerCost
    },
    details: {
      isWeekend,
      weekendAmount: weekendPremium,
      extraHours,
      extraHourRate,
      hasAddons: addons.length > 0,
      guestCount,
      isLeadBased,
      isVenue: supplier.serviceType === 'venue' || supplier.category === 'Venues',
      additionalEntertainers: entertainerCalc.additionalEntertainers,
      guestsPerEntertainer: entertainerCalc.guestsPerEntertainer,
      additionalEntertainerPrice: supplier.serviceDetails?.additionalEntertainerPrice || supplier.additionalEntertainerPrice || 0
    }
  }
}

/**
* Helper function to get guest count from various sources
* @param {Object} partyDetails - Party details object
* @returns {number} Guest count
*/
const getGuestCount = (partyDetails) => {
  // Try from party details first
  if (partyDetails?.guestCount && partyDetails.guestCount > 0) {
    return partyDetails.guestCount;
  }

  // Try from localStorage
  try {
    const storedDetails = localStorage.getItem('party_details');
    if (storedDetails) {
      const parsed = JSON.parse(storedDetails);
      if (parsed.guestCount && parsed.guestCount > 0) {
        return parsed.guestCount;
      }
    }
  } catch (error) {
    console.warn('Could not get guest count from localStorage:', error);
  }

  return 10;
};

/**
* Calculate total party cost for all suppliers
* @param {Object} suppliers - Object with supplier types as keys
* @param {Array} addons - Global addons array
* @param {Object} partyDetails - Party details
* @returns {Object} Total party cost breakdown
*/
export const calculatePartyTotal = (suppliers, addons = [], partyDetails = {}) => {
  let total = 0;
  const supplierBreakdown = [];
  let totalWeekendPremium = 0;
  let totalExtraHourCost = 0;
  let totalAdditionalEntertainerCost = 0;

  // Calculate each supplier using FRESH pricing
  Object.entries(suppliers).forEach(([type, supplier]) => {
    if (!supplier) return;

    // Get addons for this specific supplier
    const supplierAddons = addons.filter(addon => 
      addon.supplierId === supplier.id || 
      addon.supplierType === type ||
      addon.attachedToSupplier === type
    );

    // ALWAYS use fresh calculation
    const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
    
    total += pricing.finalPrice;
    totalWeekendPremium += pricing.breakdown.weekend;
    totalExtraHourCost += pricing.breakdown.extraHours;
    totalAdditionalEntertainerCost += pricing.breakdown.additionalEntertainers;

    supplierBreakdown.push({
      type,
      name: supplier.name,
      ...pricing
    });
  });

  // Add standalone addons (not attached to any supplier)
  const standaloneAddons = addons.filter(addon => 
    !addon.supplierId && !addon.supplierType && !addon.attachedToSupplier
  );
  const standaloneAddonsTotal = standaloneAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  total += standaloneAddonsTotal;

  return {
    total,
    supplierBreakdown,
    totals: {
      weekend: totalWeekendPremium,
      extraHours: totalExtraHourCost,
      additionalEntertainers: totalAdditionalEntertainerCost,
      standaloneAddons: standaloneAddonsTotal
    },
    hasWeekendPremium: totalWeekendPremium > 0,
    hasExtraHourCosts: totalExtraHourCost > 0,
    hasAdditionalEntertainerCosts: totalAdditionalEntertainerCost > 0
  };
};

/**
* Get display price for a supplier (used in cards, lists, etc.)
* @param {Object} supplier - Supplier object
* @param {Object} partyDetails - Party details
* @param {Array} addons - Supplier's addons
* @returns {string} Formatted price string
*/
export const getDisplayPrice = (supplier, partyDetails = {}, addons = []) => {
  const pricing = calculateFinalPrice(supplier, partyDetails, addons);

  // Special display for party bags
  if (supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')) {
    const pricePerBag = supplier.originalPrice || supplier.price || supplier.priceFrom || 5.00;
    const guestCount = getGuestCount(partyDetails);
    return `£${pricePerBag} per bag (${guestCount} bags = £${pricing.finalPrice} total)`;
  }

  return `£${pricing.finalPrice}`;
};

/**
* Get price breakdown text for display
* @param {Object} supplier - Supplier object
* @param {Object} partyDetails - Party details
* @param {Array} addons - Supplier's addons
* @returns {string} Breakdown text
*/
export const getPriceBreakdownText = (supplier, partyDetails = {}, addons = []) => {
  const pricing = calculateFinalPrice(supplier, partyDetails, addons);
  const parts = [];

  // Special handling for party bags
  if (supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')) {
    const pricePerBag = supplier.originalPrice || supplier.price || supplier.priceFrom || 5.00;
    const guestCount = getGuestCount(partyDetails);
    parts.push(`${guestCount} bags × £${pricePerBag}`);
  } else {
    parts.push(`Base £${pricing.basePrice}`);
  }

  if (pricing.breakdown.weekend > 0) {
    parts.push(`Weekend +£${pricing.breakdown.weekend}`);
  }

  if (pricing.breakdown.extraHours > 0) {
    parts.push(`Extra ${pricing.details.extraHours}h +£${pricing.breakdown.extraHours}`);
  }

  if (pricing.breakdown.additionalEntertainers > 0) {
    const count = pricing.details.additionalEntertainers;
    parts.push(`+${count} entertainer${count > 1 ? 's' : ''} +£${pricing.breakdown.additionalEntertainers}`);
  }

  if (pricing.breakdown.addons > 0) {
    parts.push(`Add-ons +£${pricing.breakdown.addons}`);
  }

  return parts.join(' • ');
};

/**
* Helper function to check if date is weekend
* @param {Date|string} date - Date to check
* @returns {boolean} True if weekend
*/
const isWeekendDate = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6;
  } catch (error) {
    console.error('Error checking weekend date:', error);
    return false;
  }
};

/**
* Determine if a supplier is time-based (charges per hour) or item-based (fixed price per item/service)
* @param {Object} supplier - Supplier object
* @returns {boolean} True if time-based, false if item-based
*/
export const isTimeBasedSupplier = (supplier) => {
  if (!supplier) return false;

  const category = supplier.category?.toLowerCase() || '';
  const type = supplier.type?.toLowerCase() || '';

  // Time-based supplier categories
  const timeBasedCategories = [
    'entertainment',
    'face painting', 
    'activities',
    'venue', // Some venues charge hourly
    'performer',
    'magician',
    'clown',
    'animator',
    'games'
  ];

  // Item-based supplier categories
  const itemBasedCategories = [
    'party bags',
    'cakes', 
    'cake',
    'catering',
    'decorations',
    'balloons',
    'photography', // Usually package-based
    'bouncy castle' // Usually daily rate
  ];

  // Check for explicit item-based categories first
  if (itemBasedCategories.some(itemCategory => 
    category.includes(itemCategory) || type.includes(itemCategory)
  )) {
    return false;
  }

  // Check for time-based categories
  if (timeBasedCategories.some(timeCategory => 
    category.includes(timeCategory) || type.includes(timeCategory)
  )) {
    return true;
  }

  // Check if supplier has extraHourRate set (indicates time-based pricing)
  if (supplier.extraHourRate && supplier.extraHourRate > 0) {
    return true;
  }

  if (supplier.serviceDetails?.extraHourRate && supplier.serviceDetails.extraHourRate > 0) {
    return true;
  }

  // Default to false for unknown categories (safer assumption)
  return false;
};

/**
* Get party duration from various sources
* @param {Object} partyDetails - Party details object
* @returns {number} Duration in hours
*/
export const getPartyDuration = (partyDetails = null) => {
  // Try from provided party details first
  if (partyDetails?.duration) {
    return partyDetails.duration;
  }

  // Try to calculate from start/end time
  if (partyDetails?.startTime && partyDetails?.endTime) {
    return calculateDurationFromTimes(partyDetails.startTime, partyDetails.endTime);
  }

  // Try from localStorage
  try {
    const stored = localStorage.getItem('party_details');
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Check if duration is directly stored
      if (parsed.duration) {
        return parsed.duration;
      }
      
      // Check if we can calculate from time strings
      if (parsed.startTime && parsed.endTime) {
        return calculateDurationFromTimes(parsed.startTime, parsed.endTime);
      }
      
      // Check for nested time object
      if (parsed.time) {
        const startTime = parsed.time.start || parsed.time.startTime;
        const endTime = parsed.time.end || parsed.time.endTime;
        if (startTime && endTime) {
          return calculateDurationFromTimes(startTime, endTime);
        }
      }
    }
  } catch (error) {
    console.warn('Could not get party duration from localStorage:', error);
  }

  // Default to 2 hours if we can't determine
  return 2;
};

/**
* Calculate duration from time strings
* @param {string} startTime - Start time (e.g., "2:00 PM", "14:00")
* @param {string} endTime - End time (e.g., "5:00 PM", "17:00")
* @returns {number} Duration in hours
*/
const calculateDurationFromTimes = (startTime, endTime) => {
  try {
    const start = parseTimeString(startTime);
    const end = parseTimeString(endTime);
    
    if (!start || !end) {
      console.warn('Could not parse start/end times:', { startTime, endTime });
      return 2;
    }
    
    // Calculate difference in hours
    let duration = end - start;
    
    // Handle next day scenarios (e.g., 11 PM to 1 AM)
    if (duration < 0) {
      duration += 24;
    }
    
    // Reasonable bounds check
    if (duration < 0.5 || duration > 12) {
      console.warn('Calculated duration seems unreasonable:', duration, 'hours');
      return 2;
    }
    
    return duration;
  } catch (error) {
    console.warn('Error calculating duration from times:', error);
    return 2;
  }
};

/**
* Parse time string to decimal hours
* @param {string} timeStr - Time string
* @returns {number|null} Hours in decimal format (e.g., 14.5 for 2:30 PM)
*/
const parseTimeString = (timeStr) => {
  if (!timeStr) return null;

  // Remove extra spaces
  timeStr = timeStr.trim();

  // Handle 12-hour format (e.g., "2:00 PM")
  const twelveHourMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (twelveHourMatch) {
    let hours = parseInt(twelveHourMatch[1]);
    const minutes = parseInt(twelveHourMatch[2]);
    const ampm = twelveHourMatch[3].toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return hours + (minutes / 60);
  }

  // Handle 24-hour format (e.g., "14:00")
  const twentyFourHourMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (twentyFourHourMatch) {
    const hours = parseInt(twentyFourHourMatch[1]);
    const minutes = parseInt(twentyFourHourMatch[2]);
    return hours + (minutes / 60);
  }

  return null;
};

/**
* Format duration for display
* @param {number} hours - Duration in hours
* @returns {string} Formatted duration string
*/
export const formatDuration = (hours) => {
  if (hours === Math.floor(hours)) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0) {
    return `${minutes} minutes`;
  }

  return `${wholeHours}h ${minutes}m`;
};

/**
* Check if supplier has valid extra hour pricing configured
* @param {Object} supplier - Supplier object
* @returns {boolean} True if extra hour pricing is available
*/
export const hasExtraHourPricing = (supplier) => {
  if (!supplier) return false;
  
  // For venues, check if they have an hourly rate set
  if (supplier.serviceType === 'venue' || supplier.category === 'Venues') {
    return (supplier.serviceDetails?.pricing?.hourlyRate || 0) > 0;
  }
  
  // For other suppliers, check if they have an extra hour rate set
  return (supplier.serviceDetails?.extraHourRate || supplier.extraHourRate || 0) > 0;
};

/**
* Get extra hour rate for display purposes
* @param {Object} supplier - Supplier object
* @returns {number} Extra hour rate
*/
export const getExtraHourRateForDisplay = (supplier) => {
  return getExtraHourRate(supplier);
};

/**
* Check if supplier requires additional entertainers for given guest count
* @param {Object} supplier - Supplier object
* @param {number} guestCount - Number of guests
* @returns {boolean} True if additional entertainers are required
*/
export const requiresAdditionalEntertainers = (supplier, guestCount) => {
  if (supplier?.category !== 'Entertainment') return false;
  
  const groupSizeMax = supplier.serviceDetails?.groupSizeMax || supplier.groupSizeMax || 30;
  const additionalEntertainerPrice = supplier.serviceDetails?.additionalEntertainerPrice || supplier.additionalEntertainerPrice || 0;
  
  return guestCount > groupSizeMax && additionalEntertainerPrice > 0;
};

/**
* Get additional entertainer info for display
* @param {Object} supplier - Supplier object
* @param {number} guestCount - Number of guests
* @returns {Object} Additional entertainer display info
*/
export const getAdditionalEntertainerInfo = (supplier, guestCount) => {
  const calc = calculateAdditionalEntertainerCost(supplier, guestCount);
  
  if (calc.additionalEntertainers === 0) {
    return null;
  }
  
  return {
    count: calc.additionalEntertainers,
    totalCost: calc.additionalEntertainerCost,
    priceEach: supplier.serviceDetails?.additionalEntertainerPrice || supplier.additionalEntertainerPrice || 0,
    message: `${calc.additionalEntertainers} additional entertainer${calc.additionalEntertainers > 1 ? 's' : ''} required for ${guestCount} guests`
  };
};

// Export all helper functions
export { isWeekendDate };