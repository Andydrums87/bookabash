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
  export const calculateSupplierTotalPrice = (supplier, addons = [], partyDetails = null) => {
    const basePricing = calculateSupplierPrice(supplier, partyDetails);
    const addonsPrice = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    
    return {
      basePrice: basePricing.price,
      addonsPrice,
      totalPrice: basePricing.price + addonsPrice,
      pricingInfo: basePricing
    };
  };