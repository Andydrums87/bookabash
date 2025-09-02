// utils/partyPlanBackend.js
// Backend for managing user's party plan (selected suppliers + add-ons)

const STORAGE_KEY = 'user_party_plan';

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


// Default empty party plan
const DEFAULT_PARTY_PLAN = {
  venue: null,
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
      eventEmitter.emit('partyPlanUpdated', cleanPlan);
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
    const plan = this.getPartyPlan();
    
    const supplierType = CATEGORY_TYPE_MAP[supplier.category];
    
    if (!supplierType) {
      return { success: false, error: `Unknown supplier category: ${supplier.category}` };
    }

    // ✅ FIXED: Extract add-ons from selectedPackage if they exist
    const packageAddons = selectedPackage?.addons || selectedPackage?.selectedAddons || [];
    

    // ✅ FIXED: Enhanced supplier data that preserves add-ons
    const supplierData = {
      id: supplier.id,
      name: supplier.name,
      description: supplier.description,
      // ✅ Use total price (base + add-ons) instead of just base price
      price: selectedPackage?.totalPrice || selectedPackage?.price || supplier.priceFrom,
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
      
      
      // ✅ NEW: Store the complete package data with add-ons
      packageData: selectedPackage || null,
      selectedAddons: packageAddons, // ✅ FIXED: Use extracted add-ons
      totalPrice: selectedPackage?.totalPrice || selectedPackage?.price || supplier.priceFrom,
      originalPrice: selectedPackage?.originalPrice || selectedPackage?.price || supplier.priceFrom,
      addonsPriceTotal: selectedPackage?.addonsPriceTotal || 0
    };

    plan[supplierType] = supplierData;
    
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
      const supplierTypes = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons'];
      
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
      
      // Check main supplier slots
      const mainSlots = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags'];
      
      for (const slot of mainSlots) {
        if (plan[slot] && plan[slot].id === supplierId) {
          // Update the package info
          plan[slot].price = newPackage.price;
          plan[slot].priceUnit = newPackage.duration;
          plan[slot].packageId = newPackage.id;
          plan[slot].updatedAt = new Date().toISOString();
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
        this.savePartyPlan(plan);
        return { success: true, message: 'Package updated successfully' };
      } else {
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
      
      // Check main supplier slots
      const mainSlots = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags'];
      
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
        
        // Special handling for party bags - calculate based on current guest count
        if (type === 'partyBags') {
          const basePrice = supplier.packageData?.basePrice || supplier.pricePerBag || supplier.price || 5.00;
          return total + (basePrice * guestCount);
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
      const realSupplierTypes = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons'];
      
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
  const [partyPlan, setPartyPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  useEffect(() => {
    if (isClient) {
      loadPartyPlan();
      
      const unsubscribe = partyPlanBackend.onUpdate((updatedPlan) => {

        setPartyPlan(updatedPlan);
      });

       // NEW: Add storage event listener for cross-component sync
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

// UPDATE: Enhanced loadPartyPlan function
const loadPartyPlan = () => {
  try {
    setLoading(true);
    
    // Check if localStorage actually has data
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData || storedData === 'null') {
      // ✅ No localStorage data - return default but don't save it

      setPartyPlan(DEFAULT_PARTY_PLAN);
      setError(null);
      setLoading(false);
      return;
    }
    
    // Get the main plan (only if it exists)
    let data = partyPlanBackend.getPartyPlan();
    
    // Check if there are addons in the alternative 'party_plan' key
    const alternativeData = localStorage.getItem('party_plan');
    if (alternativeData) {
      try {
        const altPlan = JSON.parse(alternativeData);
        if (altPlan.addons && altPlan.addons.length > 0) {
   
          
          // Merge addons (avoid duplicates)
          const currentAddons = data.addons || [];
          const newAddons = altPlan.addons || [];
          
          const merged = [...currentAddons];
          newAddons.forEach(newAddon => {
            if (!merged.some(existing => existing.id === newAddon.id)) {
              merged.push(newAddon);
            }
          });
          
          data = { ...data, addons: merged };
          
          // Save merged data to main storage and clear alternative
          partyPlanBackend.savePartyPlan(data);
          localStorage.removeItem('party_plan');
          

        }
      } catch (e) {
        console.error('Error merging storage:', e);
      }
    }
    
    setPartyPlan(data);
    setError(null);
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