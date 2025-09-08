// utils/smartPricingSystem.js - Clean pricing logic that works behind the scenes

import { isWeekendDate, calculatePriceWithWeekendPremium } from '../utils/supplierPricingHelpers'

/**
 * Smart pricing calculator - the main function that handles all pricing logic
 */
export const calculateSmartPrice = (basePrice, supplier, selectedDate = null, options = {}) => {
  if (!basePrice || !supplier) {
    return {
      price: basePrice || 0,
      displayPrice: `£${basePrice || 0}`,
      isWeekendRate: false,
      breakdown: null
    }
  }

  // If no date selected, return base price (for "from £X" displays)
  if (!selectedDate) {
    return {
      price: basePrice,
      displayPrice: `£${basePrice}`,
      isWeekendRate: false,
      breakdown: null
    }
  }

  // Apply weekend premium if enabled
  const weekendResult = calculatePriceWithWeekendPremium(basePrice, selectedDate, supplier.weekendPremium)
  
  return {
    price: weekendResult.finalPrice,
    originalPrice: basePrice,
    displayPrice: `£${weekendResult.finalPrice}`,
    isWeekendRate: weekendResult.premiumApplied,
    premiumAmount: weekendResult.premiumAmount,
    premiumType: weekendResult.premiumType,
    tier: weekendResult.tier,
    breakdown: weekendResult.premiumApplied ? 
      `Base £${basePrice} + £${weekendResult.premiumAmount} weekend premium` : null
  }
}

/**
 * Smart package pricing - updates package arrays with smart pricing
 */
export const enhancePackagesWithSmartPricing = (packages, supplier, selectedDate = null) => {
  if (!packages || packages.length === 0) return []
  
  return packages.map(pkg => {
    const smartPricing = calculateSmartPrice(pkg.price, supplier, selectedDate)
    
    return {
      ...pkg,
      // Keep original price intact
      originalPrice: pkg.price,
      // Update displayed price with smart pricing
      price: smartPricing.price,
      displayPrice: smartPricing.displayPrice,
      // Add pricing metadata for booking confirmation
      _smartPricing: {
        isWeekendRate: smartPricing.isWeekendRate,
        premiumAmount: smartPricing.premiumAmount,
        breakdown: smartPricing.breakdown,
        calculatedFor: selectedDate
      }
    }
  })
}

/**
 * Get base price for "from £X" displays - always uses weekday pricing
 */
export const getBaseDisplayPrice = (packages, supplier) => {
  if (!packages || packages.length === 0) return 0
  
  const minPrice = Math.min(...packages.map(p => p.price))
  return minPrice
}

/**
 * Check if date should show weekend indicator (subtle UI hint)
 */
export const shouldShowWeekendIndicator = (date, supplier) => {
  return supplier?.weekendPremium?.enabled && isWeekendDate(date)
}

/**
 * Get booking confirmation pricing details
 */
export const getBookingConfirmationPricing = (packageData, supplier, bookingDate) => {
  if (!bookingDate) {
    return {
      packageName: packageData.name,
      price: packageData.price,
      displayText: `${packageData.name}: £${packageData.price}`
    }
  }

  const smartPricing = calculateSmartPrice(packageData.originalPrice || packageData.price, supplier, bookingDate)
  
  let displayText = `${packageData.name}: £${smartPricing.price}`
  
  if (smartPricing.isWeekendRate) {
    displayText += ` (weekend rate)`
  }
  
  return {
    packageName: packageData.name,
    price: smartPricing.price,
    originalPrice: packageData.originalPrice || packageData.price,
    displayText,
    isWeekendRate: smartPricing.isWeekendRate,
    premiumAmount: smartPricing.premiumAmount,
    breakdown: smartPricing.breakdown
  }
}

/**
 * Calculate total party cost with smart pricing for all suppliers
 */
export const calculatePartyTotalWithSmartPricing = (suppliers, bookingDate = null) => {
  let total = 0
  let hasWeekendPremium = false
  const supplierBreakdown = []
  
  suppliers.forEach(supplier => {
    const packageData = supplier.packageData || supplier.selectedPackage || supplier
    const basePrice = packageData.price || supplier.price || 0
    
    const smartPricing = calculateSmartPrice(basePrice, supplier, bookingDate)
    
    total += smartPricing.price
    
    if (smartPricing.isWeekendRate) {
      hasWeekendPremium = true
    }
    
    supplierBreakdown.push({
      name: supplier.name,
      category: supplier.category,
      price: smartPricing.price,
      originalPrice: basePrice,
      isWeekendRate: smartPricing.isWeekendRate,
      premiumAmount: smartPricing.premiumAmount
    })
  })
  
  return {
    total,
    hasWeekendPremium,
    supplierBreakdown,
    weekendPremiumTotal: supplierBreakdown.reduce((sum, s) => sum + (s.premiumAmount || 0), 0)
  }
}