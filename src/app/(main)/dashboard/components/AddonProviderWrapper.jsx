"use client"

import { createContext, useContext } from 'react'
import AddonsSection from "./AddonsSection"
import RecommendedAddons from "@/components/recommended-addons"

const AddonContext = createContext()

export function AddonProvider({ children, addAddon, removeAddon, hasAddon, addons = [] }) {
  return (
    <AddonContext.Provider value={{ addAddon, removeAddon, hasAddon, addons }}>
      {children}
    </AddonContext.Provider>
  )
}

export function useAddonContext() {
  const context = useContext(AddonContext)
  if (!context) {
    throw new Error('useAddonContext must be used within an AddonProvider')
  }
  return context
}

// Enhanced Recommended Addons - Works with both dashboard types AND supports modal
export function RecommendedAddonsWrapper({
  context = "dashboard",
  maxItems = 4,
  className = "",
  onAddonClick = null, // NEW: Add support for modal approach
  partyDetails = null // Add partyDetails prop
}) {
  const { addAddon: contextAddAddon, hasAddon: contextHasAddon } = useAddonContext()
  
  const handleAddToCart = async (addon, supplierId = null) => {
    console.log("🎁 Adding addon via context:", addon.name)
    
    if (contextHasAddon(addon.id)) {
      console.log("⚠️ Add-on already exists")
      return
    }
    
    try {
      const addonWithSupplier = {
        ...addon,
        supplierId: supplierId,
        supplierName: supplierId ? 'Associated Supplier' : 'General',
        addedAt: new Date().toISOString()
      }
      
      const result = await contextAddAddon(addonWithSupplier)
      
      if (result.success) {
        console.log("✅ Add-on added successfully via context!")
      } else {
        console.error("❌ Failed to add addon via context:", result.error)
      }
    } catch (error) {
      console.error("💥 Error adding addon via context:", error)
    }
  }

  // NEW: Handle addon clicks - either modal or direct add
  const handleAddonInteraction = (addon) => {
    if (onAddonClick) {
      // Modal approach - let parent handle the click
      console.log("🎯 Opening addon modal for:", addon.name)
      onAddonClick(addon)
    } else {
      // Direct add approach (legacy)
      console.log("🎁 Direct adding addon:", addon.name)
      handleAddToCart(addon)
    }
  }

  return (
    <RecommendedAddons
      context={context}
      maxItems={maxItems}
      onAddToCart={onAddonClick ? null : handleAddToCart} // Only pass if not using modal
      onAddonClick={onAddonClick ? handleAddonInteraction : null} // NEW: Pass click handler for modal
      className={className}
      partyDetails={partyDetails}
    />
  )
}

// Updated Addons Section - Works with both dashboard types  
export function AddonsSectionWrapper({ className = "", suppliers }) {
  const { addons, removeAddon: contextRemoveAddon } = useAddonContext()
  
  const handleRemoveAddon = async (addonId) => {
    console.log("🗑️ Removing addon via context:", addonId)
    
    try {
      const result = await contextRemoveAddon(addonId)
      if (result?.success) {
        console.log("✅ Add-on removed successfully via context!")
      } else {
        console.error("❌ Failed to remove addon via context:", result?.error)
      }
    } catch (error) {
      console.error("💥 Error removing addon via context:", error)
    }
  }

  return (
    <AddonsSection 
      addons={addons}
      handleRemoveAddon={handleRemoveAddon}
      suppliers={suppliers} // NEW: Pass suppliers here
      className={className}
    />
  )
}