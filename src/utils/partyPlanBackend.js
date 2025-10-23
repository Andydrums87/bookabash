// utils/partyPlanBackend.js
// Backend for managing user's party plan (selected suppliers + add-ons)




const STORAGE_KEY = 'user_party_plan';
const CACHE_KEY = 'party_plan_cache'; // ✅ ADD THIS

const CATEGORY_TYPE_MAP = {
    'Entertainment': 'entertainment',
    'Venues': 'venue', 
    'Catering': 'catering',
    'Decorations': 'decorations',
    'Party Bags': 'partyBags',
    'Photography': 'photography',
    'Activities': 'activities',
    'Face Painting': 'facePainting',
    'Cakes' : 'cakes'
};

// Then in your saveInviteToPartyPlan function:
const saveInviteToPartyPlan = async () => {
  if (!generatedImage) return false;

  try {
    // Get current party plan using your backend
    const currentPlan = partyPlanBackend.getPartyPlan();
    
    // Update the einvites
    currentPlan.einvites = {
      id: "digital-invites",
      name: "Emma's Princess Invites",
      image: generatedImage, // 👈 This shows on dashboard
      status: "created",
      theme: selectedTheme,
      inviteData: inviteData,
      guestList: guestList
    };
    
    // Save using your backend
    partyPlanBackend.savePartyPlan(currentPlan);
    
    setIsSaved(true);
    return true;
  } catch (error) {
    console.error('Error saving:', error);
    return false;
  }
};

const getCachedPartyPlan = () => {
  if (!isClient) return null;
  
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    if (Date.now() - timestamp < 5 * 60 * 1000) {

      return data;
    }
    
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading party plan cache:', error);
    return null;
  }
};

const setCachedPartyPlan = (data) => {
  if (!isClient) return;
  
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    console.log('💾 Party plan cached');
  } catch (error) {
    console.error('Error caching party plan:', error);
  }
};



// Default empty party plan
const DEFAULT_PARTY_PLAN = {
  venue: null,
  venueCarouselOptions: [], // ✅ ADD THIS LINE
  entertainment: null,
  catering: null,
  facePainting: null,
  activities: null,
  partyBags: null,
  cakes: null,
  addons: []
};

// Check if we're in the browser
const isClient = typeof window !== 'undefined';

// Event system for real-time updates
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

const eventEmitter = new EventEmitter();

class PartyPlanBackend {
  constructor() {
    // if (isClient) {
    //   this.initializeData();
    // }
  }

  // initializeData() {
  //   if (isClient && !localStorage.getItem(STORAGE_KEY)) {
  //     this.savePartyPlan(DEFAULT_PARTY_PLAN);
  //   }
  // }

  getPartyPlan() {
    if (!isClient) {
      return DEFAULT_PARTY_PLAN;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored || stored === 'null') {
        return DEFAULT_PARTY_PLAN; // Return default but don't save it
      }
      const plan = JSON.parse(stored);
      
      if (!plan.addons) {
        plan.addons = [];
      }
      
      return plan;
    } catch (error) {
      console.error('Error getting party plan:', error);
      return DEFAULT_PARTY_PLAN;
    }
  }

  savePartyPlan(plan) {
    if (!isClient) {
      return false;
    }

    try {
      // ✅ FIXED: Ensure einvites is never saved to party plan
      const cleanPlan = { ...plan };
      if (cleanPlan.einvites) {

        delete cleanPlan.einvites;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanPlan));

      // ✅ CRITICAL: Update the cache so refetch gets fresh data
      setCachedPartyPlan(cleanPlan);

      console.log('📢 Emitting partyPlanUpdated event with updated plan');
      eventEmitter.emit('partyPlanUpdated', cleanPlan);
      console.log('✅ Event emitted successfully');
      return true;
    } catch (error) {
      console.error('Error saving party plan:', error);
      return false;
    }
  }

// Replace your addSupplierToPlan function in partyPlanBackend.js with this fixed version:

addSupplierToPlan(supplier, selectedPackage = null) {
  if (!isClient) {
    return { success: false, error: 'Not in browser environment' };
  }

  try {
    // DEBUG: Check what supplier data we're receiving
    console.log('🔍 addSupplierToPlan called with:', {
      supplierName: supplier.name,
      supplierCategory: supplier.category,
      hasWeekendPremium: !!supplier.weekendPremium,
      weekendPremium: supplier.weekendPremium,
      supplierKeys: Object.keys(supplier)
    });

    const plan = this.getPartyPlan();
    
    const supplierType = CATEGORY_TYPE_MAP[supplier.category];
    
    if (!supplierType) {
      return { success: false, error: `Unknown supplier category: ${supplier.category}` };
    }

    const packageAddons = selectedPackage?.addons || selectedPackage?.selectedAddons || [];

    // Calculate price - special handling for party bags
    let calculatedPrice = selectedPackage?.totalPrice || selectedPackage?.price || supplier.priceFrom;
    let partyBagsMetadata = null;

    const isPartyBags = supplier.category === 'Party Bags' ||
                       supplier.category?.toLowerCase().includes('party bag');

    if (isPartyBags && !selectedPackage) {
      // Get guest count for party bags calculation
      let guestCount = 10;
      try {
        const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
        guestCount = parseInt(partyDetails.guestCount) || 10;
      } catch (error) {
        // Use default
      }

      const perBagPrice = supplier.priceFrom || supplier.price || 0;
      calculatedPrice = perBagPrice * guestCount;

      // Store metadata for later reference
      partyBagsMetadata = {
        perBagPrice,
        quantity: guestCount,
        totalPrice: calculatedPrice
      };
    }

    const supplierData = {
      id: supplier.id,
      name: supplier.name,
      description: supplier.description,
      price: calculatedPrice,
      status: "pending",
      image: supplier.image,
      category: supplier.category,
      priceUnit: selectedPackage ? selectedPackage.duration : supplier.priceUnit,
      addedAt: new Date().toISOString(),
      packageId: selectedPackage?.id || null,
      originalSupplier: supplier,
      unavailableDates: supplier.unavailableDates || [],
      busyDates: supplier.busyDates || [],
      workingHours: supplier.workingHours || null,
      location: supplier.location,
      contactInfo: supplier.contactInfo,
      serviceDetails: supplier.serviceDetails,
      maxBookingDays: supplier.maxBookingDays,
      advanceBookingDays: supplier.advanceBookingDays,
      availabilityNotes: supplier.availabilityNotes,
      weekendPremium: supplier.weekendPremium, // This line was added

      packageData: selectedPackage || null,
      selectedAddons: packageAddons,
      totalPrice: calculatedPrice,
      originalPrice: selectedPackage?.originalPrice || calculatedPrice,
      addonsPriceTotal: selectedPackage?.addonsPriceTotal || 0,
      partyBagsMetadata: partyBagsMetadata // Store party bags metadata
    };

    // DEBUG: Check what we're about to save
    console.log('🔍 About to save supplierData:', {
      name: supplierData.name,
      hasWeekendPremium: !!supplierData.weekendPremium,
      weekendPremium: supplierData.weekendPremium
    });

    plan[supplierType] = supplierData;

    // If adding a venue, also add it to venueCarouselOptions if not already there
    if (supplierType === 'venue') {
      if (!plan.venueCarouselOptions) {
        plan.venueCarouselOptions = [];
      }

      // Check if this venue is already in the carousel options
      const venueExists = plan.venueCarouselOptions.some(v => v.id === supplier.id);

      if (!venueExists) {
        // Add the full supplier object to carousel options
        plan.venueCarouselOptions.push(supplier);
        console.log('✅ Added venue to carousel options:', supplier.name);
      }
    }

    this.savePartyPlan(plan);

    return {
      success: true,
      supplierType,
      supplier: supplierData
    };
  } catch (error) {
    console.error('Error adding supplier to plan:', error);
    return { success: false, error: error.message };
  }
}

// Replace the addAddonToPlan function in your PartyPlanBackend class with this corrected version:

addAddonToPlan(addon) {
  if (!isClient) {
    return { success: false, error: 'Not in browser environment' };
  }

  try {
    const plan = this.getPartyPlan(); // ✅ Keep the 'this.' prefix
    
    const existingAddonIndex = plan.addons.findIndex(existing => existing.id === addon.id);
    
    if (existingAddonIndex !== -1) {
      return { success: false, error: 'Add-on already in party plan' };
    }

    // ✅ FIXED: Preserve ALL addon properties, including supplier-related ones
    const addonData = {
      // Core addon properties (keep existing ones)
      id: addon.id,
      name: addon.name,
      description: addon.description,
      price: addon.price,
      originalPrice: addon.originalPrice || null,
      status: "pending",
      image: addon.image,
      category: addon.category,
      duration: addon.duration,
      rating: addon.rating,
      reviewCount: addon.reviewCount,
      popular: addon.popular || false,
      limitedTime: addon.limitedTime || false,
      addedAt: new Date().toISOString(),
      packageId: addon.packageId || null,
      type: 'addon',
      
      // ✅ NEW: Add supplier-related properties
      supplierId: addon.supplierId || null,
      supplierName: addon.supplierName || null,
      attachedToSupplier: addon.attachedToSupplier || false,
      isSupplierAddon: addon.isSupplierAddon || false,
      supplierType: addon.supplierType || null,
      displayId: addon.displayId || null
    };



    plan.addons.push(addonData);
    
    this.savePartyPlan(plan); // ✅ Keep the 'this.' prefix
    

    
    return { 
      success: true, 
      addon: addonData 
    };
  } catch (error) {
    console.error('Error adding add-on to plan:', error);
    return { success: false, error: error.message };
  }
}

  removeAddonFromPlan(addonId) {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }

    try {
      const plan = this.getPartyPlan();
      const addonIndex = plan.addons.findIndex(addon => addon.id === addonId);
      
      if (addonIndex === -1) {
        return { success: false, error: 'Add-on not found in party plan' };
      }
      
      const removedAddon = plan.addons[addonIndex];
      plan.addons.splice(addonIndex, 1);
      
      this.savePartyPlan(plan);
      

      
      return { success: true, removedAddon };
    } catch (error) {
      console.error('Error removing add-on from plan:', error);
      return { success: false, error: error.message };
    }
  }

  removeAddonFromSupplier(supplierType, addonId) {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }
  
    try {
      const plan = this.getPartyPlan();
      
      // Check if supplier exists
      if (!plan[supplierType]) {
        return { success: false, error: 'Supplier not found in party plan' };
      }
      
      const supplier = plan[supplierType];
      
      // Check if supplier has selectedAddons
      if (!supplier.selectedAddons || !Array.isArray(supplier.selectedAddons)) {
        return { success: false, error: 'No add-ons found for this supplier' };
      }
      
      // Find the add-on index
      const addonIndex = supplier.selectedAddons.findIndex(addon => addon.id === addonId);
      
      if (addonIndex === -1) {
        return { success: false, error: 'Add-on not found for this supplier' };
      }
      
      // Remove the add-on
      const removedAddon = supplier.selectedAddons[addonIndex];
      supplier.selectedAddons.splice(addonIndex, 1);
      
      // Update prices
      supplier.totalPrice = supplier.originalPrice + supplier.selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
      supplier.addonsPriceTotal = supplier.selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
      supplier.price = supplier.totalPrice; // Update main price
      
      this.savePartyPlan(plan);
      

      
      return { success: true, removedAddon };
    } catch (error) {
      console.error('Error removing add-on from supplier:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Also update your existing removeAddonFromPlan to handle both cases:
  removeAddonFromPlan(addonId) {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }
  
    try {
      const plan = this.getPartyPlan();
      
      // First, try to remove from global addons array
      const addonIndex = plan.addons.findIndex(addon => addon.id === addonId);
      
      if (addonIndex !== -1) {
        // Found in global addons - remove it
        const removedAddon = plan.addons[addonIndex];
        plan.addons.splice(addonIndex, 1);
        
        this.savePartyPlan(plan);

        return { success: true, removedAddon };
      }
      
      // If not found in global addons, check supplier selectedAddons
      const supplierTypes = ['venue', 'entertainment', 'catering', 'cakes', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons'];
      
      for (const supplierType of supplierTypes) {
        const supplier = plan[supplierType];
        if (supplier && supplier.selectedAddons && Array.isArray(supplier.selectedAddons)) {
          const supplierAddonIndex = supplier.selectedAddons.findIndex(addon => addon.id === addonId);
          
          if (supplierAddonIndex !== -1) {
            // Found in supplier addons - use the specific removal function
            return this.removeAddonFromSupplier(supplierType, addonId);
          }
        }
      }
      
      return { success: false, error: 'Add-on not found in party plan' };
    } catch (error) {
      console.error('Error removing add-on from plan:', error);
      return { success: false, error: error.message };
    }
  }

  removeSupplierFromPlan(supplierType) {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }

    try {
      const plan = this.getPartyPlan();
      const removedSupplier = plan[supplierType];
      
   
      plan[supplierType] = null;
      this.savePartyPlan(plan);
      
      return { success: true, removedSupplier };
    } catch (error) {
      console.error('Error removing supplier from plan:', error);
      return { success: false, error: error.message };
    }
  }

  // 🆕 NEW FUNCTIONS START HERE 🆕

  // Update supplier with new package (keeping same slot)
  updateSupplierPackage(supplierId, newPackage) {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }

    try {
      const plan = this.getPartyPlan();
      let updated = false;

      console.log('🔍 updateSupplierPackage called:', {
        lookingFor: supplierId,
        slotsWithSuppliers: Object.keys(plan).filter(key => plan[key] && plan[key].id).map(key => ({
          slot: key,
          id: plan[key].id,
          name: plan[key].name,
          matches: plan[key].id === supplierId
        }))
      });

      // Check main supplier slots - INCLUDE ALL POSSIBLE SLOTS
      const mainSlots = [
        'venue',
        'entertainment',
        'catering',
        'cakes',        // ✅ ADDED
        'facePainting',
        'activities',
        'partyBags',
        'decorations',  // ✅ ADDED
        'balloons'      // ✅ ADDED
      ];

      for (const slot of mainSlots) {
        if (plan[slot] && plan[slot].id === supplierId) {
          console.log('📦 Updating supplier package for', slot, ':', {
            oldPrice: plan[slot].price,
            newPrice: newPackage.price,
            packageId: newPackage.id
          });

          // Update the package info
          plan[slot].price = newPackage.price;
          plan[slot].originalPrice = newPackage.price; // ✅ CRITICAL: Update originalPrice too!
          plan[slot].totalPrice = newPackage.price; // ✅ Also update totalPrice
          plan[slot].priceUnit = newPackage.duration;
          plan[slot].packageId = newPackage.id;
          plan[slot].packageData = newPackage; // ✅ STORE FULL PACKAGE DATA
          plan[slot].updatedAt = new Date().toISOString();

          // ✅ If cake customization is present, update it
          if (newPackage.cakeCustomization) {
            if (!plan[slot].packageData) {
              plan[slot].packageData = {};
            }
            plan[slot].packageData.cakeCustomization = newPackage.cakeCustomization;
          }

          // ✅ If party bags quantity is present, save it to supplier object
          if (newPackage.partyBagsQuantity !== undefined) {
            plan[slot].partyBagsQuantity = newPackage.partyBagsQuantity;
            plan[slot].pricePerBag = newPackage.pricePerBag;
            console.log('🎒 Saved party bags quantity to supplier:', {
              quantity: newPackage.partyBagsQuantity,
              pricePerBag: newPackage.pricePerBag
            });
          }

          // ✅ Update features and description if provided
          if (newPackage.features) {
            plan[slot].features = newPackage.features;
          }
          if (newPackage.description) {
            plan[slot].description = newPackage.description;
          }

          console.log('✅ Supplier package updated:', {
            slot,
            newPrice: plan[slot].price,
            hasPackageData: !!plan[slot].packageData,
            hasCakeCustomization: !!plan[slot].packageData?.cakeCustomization
          });

          updated = true;
          break;
        }
      }
      
      // Check addons if not found in main slots
      if (!updated && plan.addons) {
        const addonIndex = plan.addons.findIndex(addon => addon.id === supplierId);
        if (addonIndex !== -1) {
          plan.addons[addonIndex].price = newPackage.price;
          plan.addons[addonIndex].duration = newPackage.duration;
          plan.addons[addonIndex].packageId = newPackage.id;
          plan.addons[addonIndex].updatedAt = new Date().toISOString();
          updated = true;
        }
      }
      
      if (updated) {
        console.log('💾 Saving updated party plan to localStorage...');
        this.savePartyPlan(plan);
        console.log('✅ Party plan saved successfully');
        return { success: true, message: 'Package updated successfully' };
      } else {
        console.error('❌ Supplier not found - checked all slots');
        return { success: false, error: 'Supplier not found in party plan' };
      }
      
    } catch (error) {
      console.error('Error updating supplier package:', error);
      return { success: false, error: error.message };
    }
  }

  // Get supplier details from party plan
  getSupplierFromPlan(supplierId) {
    if (!isClient) {
      return null;
    }

    try {
      const plan = this.getPartyPlan();

      // Check main supplier slots - INCLUDE ALL POSSIBLE SLOTS
      const mainSlots = [
        'venue',
        'entertainment',
        'catering',
        'cakes',        // ✅ ADDED
        'facePainting',
        'activities',
        'partyBags',
        'decorations',  // ✅ ADDED
        'balloons'      // ✅ ADDED
      ];
      
      for (const slot of mainSlots) {
        if (plan[slot] && plan[slot].id === supplierId) {
          return {
            supplier: plan[slot],
            location: 'main',
            slot: slot
          };
        }
      }
      
      // Check addons
      if (plan.addons) {
        const addon = plan.addons.find(addon => addon.id === supplierId);
        if (addon) {
          return {
            supplier: addon,
            location: 'addon',
            slot: null
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting supplier from plan:', error);
      return null;
    }
  }

  // Check if supplier is in party and get current package
  isSupplierInPartyWithPackage(supplierId) {
    const supplierData = this.getSupplierFromPlan(supplierId);
    
    if (!supplierData) {
      return { inParty: false, currentPackage: null, location: null };
    }
    
    return {
      inParty: true,
      currentPackage: supplierData.supplier.packageId || null,
      location: supplierData.location,
      slot: supplierData.slot,
      supplierData: supplierData.supplier
    };
  }

  // 🆕 NEW FUNCTIONS END HERE 🆕

  onUpdate(callback) {
    eventEmitter.on('partyPlanUpdated', callback);
    return () => eventEmitter.off('partyPlanUpdated', callback);
  }

  getTotalCost() {
    const plan = this.getPartyPlan();
    
    // Get current guest count
    let guestCount = 10;
    try {
      const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
      guestCount = parseInt(partyDetails.guestCount) || 10;
    } catch (error) {
      // Use fallback
    }
    
    const realSupplierTypes = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons', 'cakes'];
    
    const supplierCost = realSupplierTypes
      .filter(type => plan[type] !== null && plan[type] !== undefined)
      .reduce((total, type) => {
        const supplier = plan[type];
        
        // Special handling for party bags - use total price from metadata or price directly
        if (type === 'partyBags') {
          const totalPrice = supplier.partyBagsMetadata?.totalPrice ||
                            supplier.packageData?.totalPrice ||
                            supplier.price ||
                            0;
          return total + totalPrice;
        }
        
        // Normal pricing for everything else
        return total + (supplier.price || 0);
      }, 0);
    
    const addonCost = (plan.addons || [])
      .reduce((total, addon) => total + (addon.price || 0), 0);
    
    return supplierCost + addonCost;
  }
  getAddons() {
    const plan = this.getPartyPlan();
    return plan.addons || [];
  }

  hasAddon(addonId) {
    const plan = this.getPartyPlan();
    return plan.addons.some(addon => addon.id === addonId);
  }

  hasSupplierType(supplierType) {
    const plan = this.getPartyPlan();
    return plan[supplierType] !== null;
  }

  getSupplierByType(supplierType) {
    const plan = this.getPartyPlan();
    return plan[supplierType];
  }


    // ✅ FIXED: Get party summary excluding einvites
    getPartySummary() {
      const plan = this.getPartyPlan();

      // Only include real supplier types
      const realSupplierTypes = ['venue', 'entertainment', 'catering', 'cakes', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons'];
      
      const suppliers = realSupplierTypes
        .filter(type => plan[type] !== null && plan[type] !== undefined)
        .map(type => ({ ...plan[type], type }));
      
      const addons = plan.addons || [];
      const totalCost = this.getTotalCost();
      
      return {
        suppliers,
        addons,
        totalCost,
        itemCount: suppliers.length + addons.length
      };
    }
}

// Create singleton instance
export const partyPlanBackend = new PartyPlanBackend();

// Updated React hook for managing party plan with new functions
import { useState, useEffect } from 'react';

export function usePartyPlan() {

  const cachedData = getCachedPartyPlan();
  const hasCache = cachedData !== null;

  const [partyPlan, setPartyPlan] = useState(cachedData || {});
  const [loading, setLoading] = useState(!hasCache); // ✅ Skip loading if cached
  const [error, setError] = useState(null);
  const [venueCarouselOptions, setVenueCarouselOptions] = useState(cachedData?.venueCarouselOptions || []);

  useEffect(() => {
    if (isClient) {
      // ✅ If we have cache, skip loading immediately
      if (hasCache) {
        console.log('⚡ usePartyPlan: Using cached data');
        setLoading(false);
        // Still load fresh data in background
        setTimeout(loadPartyPlan, 100);
      } else {
        loadPartyPlan();
      }
      
      const unsubscribe = partyPlanBackend.onUpdate((updatedPlan) => {
        console.log('📨 usePartyPlan: Received partyPlanUpdated event', {
          hasVenue: !!updatedPlan.venue,
          hasCakes: !!updatedPlan.cakes,
          cakesPrice: updatedPlan.cakes?.price
        });
        setPartyPlan(updatedPlan);
        setVenueCarouselOptions(updatedPlan.venueCarouselOptions || []);
        // ✅ Update cache when data changes
        setCachedPartyPlan(updatedPlan);
        console.log('✅ usePartyPlan: State updated with new plan');
      });

      const handleStorageChange = (e) => {
        if (e.key === 'party_plan' || e.key === 'user_party_plan') {
          loadPartyPlan();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
      };
    } else {
      setLoading(false);
    }
  }, []);

  const loadPartyPlan = () => {
    try {
      // ✅ Check cache status at load time
      const currentCache = getCachedPartyPlan();
      const hasCacheNow = currentCache !== null;
      
      if (!hasCacheNow) {
        setLoading(true); // ✅ Only show loading if no cache
      }
      
      const storedData = localStorage.getItem(STORAGE_KEY);
      
      if (!storedData || storedData === 'null') {
        const defaultPlan = DEFAULT_PARTY_PLAN;
        setPartyPlan(defaultPlan);
        setVenueCarouselOptions([]);
        setError(null);
        setLoading(false);
        // ✅ Cache the default plan too
        setCachedPartyPlan(defaultPlan);
        return;
      }
      
      let data = partyPlanBackend.getPartyPlan();
      
      // Check for alternative storage (existing code)
      const alternativeData = localStorage.getItem('party_plan');
      if (alternativeData) {
        try {
          const altPlan = JSON.parse(alternativeData);
          if (altPlan.addons && altPlan.addons.length > 0) {
            const currentAddons = data.addons || [];
            const newAddons = altPlan.addons || [];
            
            const merged = [...currentAddons];
            newAddons.forEach(newAddon => {
              if (!merged.some(existing => existing.id === newAddon.id)) {
                merged.push(newAddon);
              }
            });
            
            data = { ...data, addons: merged };
            partyPlanBackend.savePartyPlan(data);
            localStorage.removeItem('party_plan');
          }
        } catch (e) {
          console.error('Error merging storage:', e);
        }
      }
      
      setPartyPlan(data);
      setVenueCarouselOptions(data.venueCarouselOptions || []);
      setError(null);
      
      // ✅ Cache the loaded data
      setCachedPartyPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };




const addSupplier = async (supplier, selectedPackage = null) => {
  if (!isClient) {
    return { success: false, error: 'Not in browser environment' };
  }

  try {
    setError(null);
    
    // ✅ This will create localStorage when first supplier is added
    const result = partyPlanBackend.addSupplierToPlan(supplier, selectedPackage);
    
    if (result.success) {

      return { success: true, supplierType: result.supplierType };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  }
};
  const addAddon = async (addon) => {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }

    try {
      setError(null);
      const result = partyPlanBackend.addAddonToPlan(addon);
      
      if (result.success) {

        return { success: true, addon: result.addon };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const removeAddon = async (addonId) => {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }

    try {
      setError(null);
      const result = partyPlanBackend.removeAddonFromPlan(addonId);
      
      if (result.success) {

        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

// Add this function to your usePartyPlan hook (in the return object):

const removeAddonFromSupplier = async (supplierType, addonId) => {
  if (!isClient) {
    return { success: false, error: 'Not in browser environment' };
  }

  try {
    setError(null);
    const result = partyPlanBackend.removeAddonFromSupplier(supplierType, addonId);
    
    if (result.success) {
    
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  }
};

  const removeSupplier = async (supplierType) => {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }

    try {
      setError(null);
      const result = partyPlanBackend.removeSupplierFromPlan(supplierType);
      
      if (result.success) {

        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };
  // 🆕 NEW HOOK FUNCTIONS START HERE 🆕


  const updateSupplierPackage = async (supplierId, newPackage) => {
    if (!isClient) {
      return { success: false, error: 'Not in browser environment' };
    }

    try {
      setError(null);
      const result = partyPlanBackend.updateSupplierPackage(supplierId, newPackage);
      
      if (result.success) {
   
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const getSupplierFromPlan = (supplierId) => {
    return partyPlanBackend.getSupplierFromPlan(supplierId);
  };

  const isSupplierInPartyWithPackage = (supplierId) => {
    return partyPlanBackend.isSupplierInPartyWithPackage(supplierId);
  };

  // 🆕 NEW HOOK FUNCTIONS END HERE 🆕

  const totalCost = partyPlanBackend.getTotalCost();
  const addons = partyPlan.addons || [];

  return {
    partyPlan,
    addons,
    loading,
    error,
    totalCost,
    venueCarouselOptions, // ✅ ADD THIS LINE
    addSupplier,
    addAddon,
    removeAddon,
    removeSupplier,
    refetch: loadPartyPlan,
    hasAddon: (addonId) => partyPlanBackend.hasAddon(addonId),
    getPartySummary: () => partyPlanBackend.getPartySummary(),
    updateSupplierPackage,
    getSupplierFromPlan,
    removeAddonFromSupplier, 
    isSupplierInPartyWithPackage
  };
}