// utils/unifiedPricing.js - FIXED version that prevents double-enhancement

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
    if (matches) {

    }
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

  // UPDATED: Use the price we explicitly set (package-specific), don't fall back to priceFrom
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
* Main pricing calculator - FIXED to prevent double enhancement
* @param {Object} supplier - Supplier object with pricing data
* @param {Object} partyDetails - Party details (date, duration, guestCount)
* @param {Array} addons - Array of selected addons
* @returns {Object} Complete pricing breakdown
*/
export const calculateFinalPrice = (supplier, partyDetails = {}, addons = []) => {
if (!supplier) {
  return {
    finalPrice: 0,
    breakdown: { base: 0, weekend: 0, extraHours: 0, addons: 0 },
    details: { isWeekend: false, extraHours: 0, hasAddons: false, isLeadBased: false }
  }
}



// Check if this is a lead-based supplier
const isLeadBased = isLeadBasedSupplier(supplier);

// 1. ALWAYS start from true base price - never from enhanced price
const basePrice = getTrueBasePrice(supplier, partyDetails);

// 2. Calculate weekend premium FRESH (don't use existing)
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

// 3. Calculate extra hour costs FRESH
let extraHourCost = 0;
let extraHours = 0;
const standardDuration = 2;
const partyDuration = partyDetails.duration || standardDuration;
const extraHourRate = supplier.serviceDetails?.extraHourRate || supplier.extraHourRate || 0;

if (!isLeadBased && partyDuration > standardDuration && extraHourRate > 0) {
  extraHours = partyDuration - standardDuration;
  extraHourCost = extraHours * extraHourRate;

} else if (isLeadBased && partyDuration > standardDuration) {
  console.log('⏰ Extra hour cost SKIPPED for lead-based supplier');
}

// 4. Calculate addons total
const addonsTotal = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);

// 5. Calculate final price
const finalPrice = basePrice + weekendPremium + extraHourCost + addonsTotal;



return {
  finalPrice,
  basePrice, // This is now the TRUE base price
  breakdown: {
    base: basePrice,
    weekend: weekendPremium,
    extraHours: extraHourCost,
    addons: addonsTotal
  },
  details: {
    isWeekend,
    weekendAmount: weekendPremium,
    extraHours,
    extraHourRate,
    hasAddons: addons.length > 0,
    guestCount: getGuestCount(partyDetails),
    isLeadBased
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
    standaloneAddons: standaloneAddonsTotal
  },
  hasWeekendPremium: totalWeekendPremium > 0,
  hasExtraHourCosts: totalExtraHourCost > 0
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

// Export helper functions
export { isWeekendDate };