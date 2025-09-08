// utils/supplierPricingHelpers.js
/**
 * Reusable helper functions for supplier pricing calculations
 * Handles lead-time detection, party bag calculations, and payment types
 */

/**
 * Detect if supplier requires full payment upfront (lead-time based)
 */
export const isLeadTimeSupplier = (supplier) => {
  const leadTimeCategories = ['cakes', 'party bags', 'decorations'];
  
  // Check by category name (multiple variations)
  const categoryCheck = supplier?.category?.toLowerCase();
  if (categoryCheck) {
    if (leadTimeCategories.some(cat => categoryCheck.includes(cat))) {
      return true;
    }
  }
  
  // Check by supplier type
  const typeCheck = supplier?.type?.toLowerCase();
  if (typeCheck && leadTimeCategories.includes(typeCheck)) {
    return true;
  }
  
  // Check by package data
  if (supplier?.packageData?.paymentType === 'full_payment' ||
      supplier?.packageData?.supplierType?.includes('lead_time')) {
    return true;
  }
  
  return false;
};

/**
 * Get guest count from various sources with fallback
 */
export const getGuestCount = (partyDetails = null) => {
  let guestCount = 10; // Default fallback
  
  // Priority 1: From partyDetails parameter
  if (partyDetails?.guestCount && partyDetails.guestCount > 0) {
    guestCount = parseInt(partyDetails.guestCount);
  }
  // Priority 2: From localStorage party_details
  else if (typeof window !== 'undefined') {
    try {
      const storedPartyDetails = localStorage.getItem('party_details');
      if (storedPartyDetails) {
        const parsed = JSON.parse(storedPartyDetails);
        if (parsed.guestCount && parsed.guestCount > 0) {
          guestCount = parseInt(parsed.guestCount);
        }
      }
    } catch (error) {
      console.warn('Could not get guest count from localStorage:', error);
    }
  }
  
  return guestCount;
};

/**
 * Calculate supplier price including party bag calculations
 */
export const calculateSupplierPrice = (supplier, partyDetails = null) => {
  if (!supplier) {
    return {
      price: 0,
      breakdown: null,
      isPartyBag: false,
      isLeadTime: false
    };
  }
  
  const isLeadTime = isLeadTimeSupplier(supplier);
  
  // Check if this is a party bag supplier
  const isPartyBag = supplier.category?.toLowerCase().includes('party bag') || 
                     supplier.category === 'Party Bags' || 
                     supplier.type === 'partyBags';
  
  if (isPartyBag) {
    const pricePerBag = supplier.packageData?.basePrice || 
                        supplier.pricePerBag || 
                        supplier.price || 
                        5.00;
    
    const guestCount = getGuestCount(partyDetails);
    const totalPrice = pricePerBag * guestCount;
    
    return {
      price: totalPrice,
      breakdown: `${guestCount} bags × £${pricePerBag.toFixed(2)}`,
      isPartyBag: true,
      isLeadTime,
      pricePerBag,
      guestCount
    };
  }
  
  // For non-party bag suppliers, return regular price
  return {
    price: supplier.price || 0,
    breakdown: null,
    isPartyBag: false,
    isLeadTime,
    pricePerBag: null,
    guestCount: null
  };
};

/**
 * Calculate payment amounts based on supplier types (for payment page)
 */
export const calculatePaymentAmounts = (suppliers, partyDetails = null) => {
  let depositAmount = 0;
  let fullPaymentAmount = 0;
  const paymentDetails = [];
  
  suppliers.forEach(supplier => {
    const pricingInfo = calculateSupplierPrice(supplier, partyDetails);
    const supplierPrice = pricingInfo.price;
    
    if (pricingInfo.isLeadTime) {
      fullPaymentAmount += supplierPrice;
      paymentDetails.push({
        ...supplier,
        paymentType: 'full_payment',
        amountToday: supplierPrice,
        remaining: 0,
        pricingInfo
      });
    } else {
      const deposit = Math.max(50, supplierPrice * 0.2);
      depositAmount += deposit;
      paymentDetails.push({
        ...supplier,
        paymentType: 'deposit',
        amountToday: deposit,
        remaining: supplierPrice - deposit,
        pricingInfo
      });
    }
  });
  
  return {
    depositAmount,
    fullPaymentAmount,
    totalPaymentToday: depositAmount + fullPaymentAmount,
    totalCost: depositAmount + fullPaymentAmount + paymentDetails.reduce((sum, s) => sum + s.remaining, 0),
    remainingBalance: paymentDetails.reduce((sum, s) => sum + s.remaining, 0),
    hasDeposits: depositAmount > 0,
    hasFullPayments: fullPaymentAmount > 0,
    paymentDetails
  };
};

/**
 * Get payment type display text
 */
export const getPaymentTypeDisplay = (supplier, partyDetails = null) => {
  const pricingInfo = calculateSupplierPrice(supplier, partyDetails);
  
  if (pricingInfo.isLeadTime) {
    return 'Full Payment';
  } else {
    return 'Deposit';
  }
};

/**
 * Get supplier price with addons
 */
/**
 * Get supplier price with addons AND weekend pricing
 */
export const calculateSupplierTotalPrice = (supplier, addons = [], partyDetails = null) => {


  const basePricing = calculateSupplierPrice(supplier, partyDetails);
  const addonsPrice = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  
  
  // Apply weekend pricing only to NON-lead-time suppliers
  let finalBasePrice = basePricing.price;
  let weekendPremiumApplied = false;
  let weekendPremiumAmount = 0;
  
  // Check if this is a time-slot based supplier (not lead-time)
  const isLeadTimeSupplier = basePricing.isLeadTime;
 
  
  // Get party date inline
  let partyDate = null;
  if (partyDetails?.date) {
    partyDate = partyDetails.date;
  } else if (typeof window !== 'undefined') {
    try {
      const storedPartyDetails = localStorage.getItem('party_details');
      if (storedPartyDetails) {
        const parsed = JSON.parse(storedPartyDetails);
        partyDate = parsed.date;
      }
    } catch (error) {
      console.warn('Could not get party date from localStorage:', error);
    }
  }

  
  if (!isLeadTimeSupplier && partyDate && supplier?.weekendPremium) {
    console.log('🔍 Applying weekend pricing...');
    const weekendResult = calculatePriceWithWeekendPremium(
      basePricing.price, 
      partyDate, 
      supplier.weekendPremium
    );
    
   
    
    if (weekendResult.premiumApplied) {
      finalBasePrice = weekendResult.finalPrice;
      weekendPremiumApplied = true;
      weekendPremiumAmount = weekendResult.premiumAmount;

    } else {
      console.log('❌ Weekend premium not applied');
    }
  } else {
    console.log('❌ Weekend pricing conditions not met');
  }
  
  const result = {
    basePrice: basePricing.price,
    finalBasePrice,
    addonsPrice,
    totalPrice: finalBasePrice + addonsPrice,
    pricingInfo: basePricing,
    weekendPremiumApplied,
    weekendPremiumAmount,
    displayPrice: `£${finalBasePrice + addonsPrice}`
  };
  

  
  return result;
};

/**
 * Check if a given date falls on a weekend (Saturday or Sunday)
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if weekend, false otherwise
 */
export const isWeekendDate = (date) => {
  if (!date) return false
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const dayOfWeek = dateObj.getDay() // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6
  } catch (error) {
    console.error('Error checking weekend date:', error)
    return false
  }
}

/**
 * Calculate weekend premium pricing based on supplier settings
 * @param {number} basePrice - The base price before any premiums
 * @param {Date|string} selectedDate - The date to check for weekend pricing
 * @param {object} weekendPremium - Weekend premium configuration from supplier
 * @returns {object} - Pricing calculation result
 */
export const calculatePriceWithWeekendPremium = (basePrice, selectedDate, weekendPremium = null) => {
  // Default response for no premium
  const defaultResult = {
    finalPrice: basePrice,
    premiumApplied: false,
    premiumAmount: 0,
    premiumType: null,
    tier: null
  }
  
  // Early returns for invalid inputs
  if (!basePrice || !selectedDate) {
    return defaultResult
  }
  
  // Check if weekend premium is enabled
  if (!weekendPremium || !weekendPremium.enabled) {
    return defaultResult
  }
  
  // Check if the selected date is a weekend
  if (!isWeekendDate(selectedDate)) {
    return defaultResult
  }
  
  try {
    let premiumAmount = 0
    let premiumType = 'fixed'
    
    // Calculate premium based on type
    if (weekendPremium.type === 'percentage' && weekendPremium.percentage) {
      premiumAmount = Math.round((basePrice * weekendPremium.percentage) / 100)
      premiumType = 'percentage'
    } else if (weekendPremium.type === 'fixed' && weekendPremium.amount) {
      premiumAmount = weekendPremium.amount
      premiumType = 'fixed'
    } else if (weekendPremium.type === 'tiered' && weekendPremium.tiers) {
      // Tiered pricing based on base price ranges
      const tier = weekendPremium.tiers.find(t => 
        basePrice >= (t.minPrice || 0) && 
        basePrice <= (t.maxPrice || Infinity)
      )
      
      if (tier) {
        if (tier.type === 'percentage') {
          premiumAmount = Math.round((basePrice * tier.percentage) / 100)
        } else {
          premiumAmount = tier.amount || 0
        }
        premiumType = 'tiered'
      }
    }
    
    const finalPrice = basePrice + premiumAmount
    
    return {
      finalPrice,
      premiumApplied: premiumAmount > 0,
      premiumAmount,
      premiumType,
      tier: weekendPremium.type === 'tiered' ? 
        weekendPremium.tiers?.find(t => 
          basePrice >= (t.minPrice || 0) && 
          basePrice <= (t.maxPrice || Infinity)
        ) : null
    }
    
  } catch (error) {
    console.error('Error calculating weekend premium:', error)
    return defaultResult
  }
}


/**
 * Extract party duration from party details
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
export const calculateDurationFromTimes = (startTime, endTime) => {
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
 * Calculate duration premium pricing for a supplier
 * @param {Object} supplier - Supplier object
 * @param {number} packagePrice - Base package price
 * @param {number} partyDuration - Party duration in hours
 * @returns {Object} Duration pricing breakdown
 */
export const calculateDurationPricing = (supplier, packagePrice, partyDuration = 2) => {
  const standardDuration = 2; // All packages assume 2 hours
  
  // ✅ FIXED: Check both locations for extraHourRate
  const extraHourRate = supplier?.extraHourRate || supplier?.serviceDetails?.extraHourRate || 0;
  
  // No extra cost if within standard duration or no rate set
  if (partyDuration <= standardDuration || !extraHourRate) {
    return {
      basePrice: packagePrice,
      extraHours: 0,
      extraCost: 0,
      totalPrice: packagePrice,
      hasDurationPremium: false,
      durationNote: `${standardDuration} hours included`
    };
  }
  
  const extraHours = partyDuration - standardDuration;
  const extraCost = extraHours * extraHourRate;
  const totalPrice = packagePrice + extraCost;
  
  return {
    basePrice: packagePrice,
    extraHours,
    extraCost,
    totalPrice,
    hasDurationPremium: true,
    durationNote: `${standardDuration}h included + ${extraHours}h extra`
  };
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
  
  // Default to false for unknown categories (safer assumption)
  return false;
};

/**
 * Enhanced supplier total price calculation with both weekend and duration premiums
 * @param {Object} supplier - Supplier object
 * @param {Array} addons - Selected addons
 * @param {Object} partyDetails - Party details including date and duration
 * @returns {Object} Complete pricing breakdown
 */
/**
 * Enhanced supplier total price calculation with both weekend and duration premiums
 * FIXED: Prevents double weekend premium application
 * @param {Object} supplier - Supplier object
 * @param {Array} addons - Selected addons
 * @param {Object} partyDetails - Party details including date and duration
 * @returns {Object} Complete pricing breakdown
 */
/**
 * Enhanced supplier total price calculation with both weekend and duration premiums
 * Handles cases where weekend premium wasn't pre-applied
 */
export const calculateEnhancedSupplierPrice = (supplier, addons = [], partyDetails = {}) => {
  console.log('🔍 Enhanced pricing calculation for:', supplier.name, {
    supplierPrice: supplier.price,
    originalPrice: supplier.originalPrice,
    weekendPremium: supplier.weekendPremium,
    partyDate: partyDetails.date
  });
  
  let currentPrice = supplier.price || 0;
  let weekendInfo = null;
  let durationInfo = null;
  
  // Check if weekend premium needs to be applied
  const isWeekend = partyDetails.date && isWeekendDate(partyDetails.date);
  const hasWeekendPremium = supplier.weekendPremium?.enabled;
  const weekendNotApplied = supplier.price === supplier.originalPrice; // Same price means no premium applied
  
  console.log('Weekend check:', {
    isWeekend,
    hasWeekendPremium,
    weekendNotApplied,
    needsWeekendPremium: isWeekend && hasWeekendPremium && weekendNotApplied
  });
  
  // Apply weekend premium if it hasn't been applied yet
  if (isWeekend && hasWeekendPremium && weekendNotApplied) {
    console.log('Applying weekend premium to base price:', currentPrice);
    
    const weekendResult = calculatePriceWithWeekendPremium(
      currentPrice, 
      partyDetails.date, 
      supplier.weekendPremium
    );
    
    if (weekendResult.premiumApplied) {
      currentPrice = weekendResult.finalPrice;
      weekendInfo = {
        originalPrice: supplier.price,           // 250
        adjustedPrice: currentPrice,             // 280
        premiumAmount: weekendResult.premiumAmount // 30
      };
      
      console.log('Weekend premium applied:', {
        from: supplier.price,
        to: currentPrice,
        premium: weekendResult.premiumAmount
      });
    }
  } else if (supplier.originalPrice && supplier.price > supplier.originalPrice) {
    // Weekend premium already applied - extract info for display
    const premiumAmount = supplier.price - supplier.originalPrice;
    weekendInfo = {
      originalPrice: supplier.originalPrice,
      adjustedPrice: supplier.price,
      premiumAmount: premiumAmount
    };
    console.log('Weekend premium already applied:', premiumAmount);
  }
  
  // Apply duration premium to the current price (which may now include weekend premium)
  if (isTimeBasedSupplier(supplier)) {
    const partyDuration = getPartyDuration(partyDetails);
    
    console.log('Applying duration pricing to price:', currentPrice, 'for duration:', partyDuration);
    
    // Apply duration premium to current price (base + weekend if applicable)
    durationInfo = calculateDurationPricing(supplier, currentPrice, partyDuration);
    currentPrice = durationInfo.totalPrice;
    
    console.log('Duration pricing applied:', {
      basePrice: durationInfo.basePrice,
      extraHours: durationInfo.extraHours,
      extraCost: durationInfo.extraCost,
      newTotal: currentPrice
    });
  } else {
    // For non-time-based suppliers, no duration premium
    durationInfo = {
      basePrice: currentPrice,
      extraHours: 0,
      extraCost: 0,
      totalPrice: currentPrice,
      hasDurationPremium: false,
      durationNote: 'Fixed price (not time-based)'
    };
    
    console.log('No duration pricing for non-time-based supplier:', supplier.category);
  }
  
  // Add addon costs
  const addonsCost = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const finalPrice = currentPrice + addonsCost;
  
  const result = {
    basePrice: supplier.originalPrice || supplier.price, // Original package price
    weekendInfo,
    durationInfo,
    addonsCost,
    totalPrice: finalPrice,
    isTimeBased: isTimeBasedSupplier(supplier),
    breakdown: {
      original: supplier.originalPrice || supplier.price,
      afterWeekend: weekendInfo ? weekendInfo.adjustedPrice : (supplier.originalPrice || supplier.price),
      afterDuration: currentPrice,
      afterAddons: finalPrice
    }
  };
  
  console.log('✅ Final enhanced pricing result:', {
    supplierName: supplier.name,
    originalPrice: result.basePrice,
    weekendPremium: weekendInfo?.premiumAmount || 0,
    durationPremium: durationInfo?.extraCost || 0,
    addons: addonsCost,
    finalTotal: result.totalPrice,
    breakdown: result.breakdown
  });
  
  return result;
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

