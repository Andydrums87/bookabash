// SupplierPackagesRouter.jsx
// Enhanced version that intercepts handleAddToPlan for cake suppliers
"use client"
import { useState, useMemo } from 'react'
import SupplierPackages from '@/components/supplier/supplier-packages'
import CakeCustomizationModal from './CakeCustomizationModal'

const SupplierPackagesRouter = ({
  supplier,
  packages,
  selectedPackageId,
  setSelectedPackageId,
  handleAddToPlan,
  getAddToPartyButtonState,
  getSupplierInPartyDetails,
  onShowNotification,
  isReplacementMode = false
}) => {
  
  // State for cake customization modal
  const [showCakeModal, setShowCakeModal] = useState(false)
  const [selectedPackageForCake, setSelectedPackageForCake] = useState(null)
  
  // Enhanced cake supplier detection using your existing backend data
  const isCakeSupplier = useMemo(() => {
    console.log('🔍 Checking if cake supplier:', {
      category: supplier?.category,
      cateringType: supplier?.serviceDetails?.cateringType,
      cakeFlavors: supplier?.serviceDetails?.cakeFlavors,
      cakeSpecialist: supplier?.serviceDetails?.cakeSpecialist
    });

    // Method 1: Check if it's a catering supplier with cake specialization
    if (supplier?.category?.toLowerCase().includes('catering')) {
      const serviceDetails = supplier?.serviceDetails
      
      // Check for cake-specific indicators from your backend
      if (serviceDetails?.cateringType?.toLowerCase().includes('cake') ||
          serviceDetails?.cateringType?.toLowerCase().includes('baker') ||
          serviceDetails?.cateringType === 'Birthday Cake Specialist' ||
          serviceDetails?.cateringType === 'Custom Cake Designer' ||
          serviceDetails?.cateringType === 'Dessert Specialist') {
        console.log('✅ Detected cake supplier via cateringType:', serviceDetails.cateringType);
        return true
      }
      
      // Check if they have cake flavors defined (from your backend form)
      if (serviceDetails?.cakeFlavors?.length > 0) {
        console.log('✅ Detected cake supplier via cakeFlavors:', serviceDetails.cakeFlavors.length, 'flavors');
        return true
      }
      
      // Check explicit cake specialist flag
      if (serviceDetails?.cakeSpecialist === true) {
        console.log('✅ Detected cake supplier via cakeSpecialist flag');
        return true
      }
    }
    
    // Method 2: Direct cake category
    if (supplier?.category?.toLowerCase().includes('cake')) {
      console.log('✅ Detected cake supplier via category');
      return true
    }
    
    // Method 3: Check supplier name for cake keywords
    const nameOrDesc = `${supplier?.name || ''} ${supplier?.description || ''}`.toLowerCase()
    if (nameOrDesc.includes('cake') || nameOrDesc.includes('bakery') || nameOrDesc.includes('patisserie')) {
      console.log('✅ Detected cake supplier via name/description');
      return true
    }
    
    console.log('❌ Not a cake supplier');
    return false
  }, [supplier])
  
  console.log('🍰 Final cake supplier detection result:', isCakeSupplier);
  
  // Enhanced handleAddToPlan that intercepts for cake suppliers
  const enhancedHandleAddToPlan = (...args) => {
    // Extract arguments - your function might be called with different signatures
    const [skipAddonModal = false, addonData = null] = args;
    
    console.log('🚀 HandleAddToPlan called:', {
      isCakeSupplier,
      selectedPackageId,
      skipAddonModal,
      hasAddonData: !!addonData,
      args
    });
    
    // If this is a cake supplier, no addon data provided, and we have a selected package
    if (isCakeSupplier && !addonData && selectedPackageId) {
      const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId)
      if (selectedPackage) {
        console.log('🎂 Intercepting add to plan for cake customization:', selectedPackage.name);
        setSelectedPackageForCake(selectedPackage)
        setShowCakeModal(true)
        return // Don't proceed with regular add to plan
      }
    }
    
    // For non-cake suppliers or when addon data is provided, use regular flow
    console.log('➡️ Proceeding with regular handleAddToPlan');
    handleAddToPlan(...args)
  }
  
  // Handle cake customization confirmation
  const handleCakeCustomizationConfirm = (enhancedPackageData) => {
    console.log('🎂 Cake customization confirmed:', {
      packageName: enhancedPackageData.name,
      flavor: enhancedPackageData.cakeCustomization.flavorName,
      message: enhancedPackageData.cakeCustomization.message
    });
    
    setShowCakeModal(false)
    setSelectedPackageForCake(null)
    
    // Call the original handleAddToPlan with skip addon modal and enhanced package data
    handleAddToPlan(true, { package: enhancedPackageData })
    
    // Show success notification
    onShowNotification?.({
      type: "success",
      message: `🎂 ${enhancedPackageData.name} with ${enhancedPackageData.cakeCustomization.flavorName} flavor added to your plan!`
    })
  }
  
  // Handle cake modal close
  const handleCakeModalClose = () => {
    console.log('🎂 Cake modal closed');
    setShowCakeModal(false)
    setSelectedPackageForCake(null)
  }
  
  return (
    <>
      {/* Regular package view for all suppliers */}
      <SupplierPackages
        packages={packages}
        selectedPackageId={selectedPackageId}
        setSelectedPackageId={setSelectedPackageId}
        handleAddToPlan={enhancedHandleAddToPlan} // Use enhanced version that intercepts
        getAddToPartyButtonState={getAddToPartyButtonState}
        getSupplierInPartyDetails={getSupplierInPartyDetails}
        onShowNotification={onShowNotification}
        isReplacementMode={isReplacementMode}
      />
      
      {/* Cake Customization Modal - only shows for cake suppliers */}
      {isCakeSupplier && (
        <CakeCustomizationModal
          isOpen={showCakeModal}
          onClose={handleCakeModalClose}
          supplier={supplier}
          selectedPackage={selectedPackageForCake}
          onConfirm={handleCakeCustomizationConfirm}
        />
      )}
    </>
  )
}

export default SupplierPackagesRouter

// Helper function to determine supplier type (can be used elsewhere)
export const getSupplierType = (supplier) => {
  if (!supplier) return 'standard'
  
  // Check for cake supplier indicators
  if (supplier?.category?.toLowerCase().includes('cake') || 
      supplier?.category?.toLowerCase().includes('catering') ||
      supplier?.serviceDetails?.specialization === 'cakes' ||
      supplier?.products?.length > 0) {
    return 'cake'
  }
  
  // Add other specialist types here in the future
  // if (supplier?.category?.toLowerCase().includes('photography')) {
  //   return 'photography'
  // }
  
  return 'standard'
}

// Data structure helper for converting regular packages to cake-aware format
export const convertPackageToCakeFormat = (packageData, cakeProduct, customization) => {
  return {
    // Keep all original package data
    ...packageData,
    
    // Add cake-specific information
    cakeProduct: {
      id: cakeProduct.id,
      name: cakeProduct.name,
      image: cakeProduct.image,
      basePrice: cakeProduct.basePrice,
      themes: cakeProduct.themes,
      colors: cakeProduct.colors
    },
    
    // Add customization details
    customization: {
      size: customization.size,
      flavor: customization.flavor,
      message: customization.message,
      childName: customization.childName,
      childAge: customization.childAge
    },
    
    // Update package metadata for backend compatibility
    packageType: 'cake',
    originalPackageId: packageData.id,
    
    // Update display information
    name: `${packageData.name} - ${cakeProduct.name}`,
    description: `${cakeProduct.description} - ${packageData.name} size with ${customization.flavor} flavor`,
    image: cakeProduct.image,
    
    // Ensure features include cake details
    features: [
      ...(packageData.features || []),
      `${customization.flavor} flavor`,
      'Custom message included',
      'Professional cake decoration'
    ]
  }
}