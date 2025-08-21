"use client"

import { Button } from "@/components/ui/button"
import { Heart, CheckCircle } from "lucide-react"
import SupplierAvailabilityCalendar from "@/components/supplier/supplier-availability-calendar"
import { useFavorites } from "@/app/(main)/favorites/hooks/useFavoritesHook"

export default function SupplierSidebar({
  supplier,
  packages,
  selectedPackageId,
  handleAddToPlan,
  getAddToPartyButtonState,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  credentials,
  isFromDashboard = false,
  partyDate = null,
  // ✅ UPDATED: Use openCakeModal function instead of individual state setters
  openCakeModal,
  showCakeModal,
  isCakeSupplier = false
}) {

  const { toggleFavorite, isFavorite } = useFavorites()
  const isSupplierFavorite = supplier ? isFavorite(supplier.id) : false

  const handleToggleFavorite = () => {
    if (supplier) {
      toggleFavorite(supplier)
    }
  }

  const selectedPkgDetails = packages?.find((pkg) => pkg.id === selectedPackageId)
  const addToPlanButtonState = getAddToPartyButtonState(selectedPackageId)

  // ✅ ENHANCED: Check if selected package is customizable for cake suppliers
  const isCustomizablePackage = (packageData) => {
    if (!isCakeSupplier || !packageData) return false
    
    // For cake suppliers, default to customizable UNLESS explicitly set to non-customizable
    if (packageData?.packageType === 'non-customizable' || packageData?.packageType === 'fixed') {
      return false
    }
    
    // Show customization for most cake packages
    return packageData?.packageType === 'customizable' ||
           packageData?.cakeCustomization ||
           packageData?.name?.toLowerCase().includes('custom') ||
           packageData?.features?.some(feature => 
             feature.toLowerCase().includes('custom') || 
             feature.toLowerCase().includes('personalized')
           ) ||
           !packageData?.packageType // Default to customizable if not specified
  }

  // ✅ FIXED: Sidebar add to plan with proper cake modal opening
  const handleSidebarAddToPlan = () => {
    console.log('🎂 Sidebar: Checking for cake customization need:', {
      isCakeSupplier,
      selectedPackageId,
      selectedPackage: selectedPkgDetails?.name,
      packageType: selectedPkgDetails?.packageType,
      isCustomizable: isCustomizablePackage(selectedPkgDetails),
      hasOpenCakeModal: !!openCakeModal
    })

    // Check if this is a customizable cake package
    if (isCakeSupplier && selectedPkgDetails && openCakeModal) {
      // For cake suppliers, we should show the modal for most packages
      // unless it's explicitly a non-customizable package
      const shouldShowModal = isCustomizablePackage(selectedPkgDetails)
      
      console.log('🎂 Sidebar: Should show modal?', shouldShowModal)
      
      if (shouldShowModal) {
        console.log('🎂 Sidebar: Opening cake modal with package:', selectedPkgDetails.name)
        openCakeModal(selectedPkgDetails)
        return
      } else {
        console.log('🎂 Sidebar: Package marked as non-customizable, proceeding normally')
      }
    } else if (isCakeSupplier && !openCakeModal) {
      console.warn('🎂 Sidebar: isCakeSupplier is true but openCakeModal function not provided')
    }

    // Otherwise, proceed with normal add to plan
    console.log('➡️ Sidebar: Proceeding with regular add to plan')
    handleAddToPlan()
  }

  // Use the passed credentials prop if available, otherwise fallback to supplier.serviceDetails
  const verificationDocs =
    credentials?.map((cred) => ({ name: cred.title, verified: cred.verified })) ||
    [
      { name: "DBS Certificate", verified: supplier?.serviceDetails?.certifications?.dbsCertificate },
      { name: "Public Liability Insurance", verified: supplier?.serviceDetails?.certifications?.publicLiability },
      { name: "First Aid Certified", verified: supplier?.serviceDetails?.certifications?.firstAid },
      { name: "ID Verified", verified: supplier?.verified },
    ].filter((doc) => doc.verified !== undefined)

  return (
    <div className="space-y-6 sticky top-8">

      {/* Select Package / Add to Plan Section */}
      {selectedPkgDetails && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-1">Selected Package</h3>
          <p className="text-md text-gray-800 font-semibold mb-1">{selectedPkgDetails.name}</p>
          <p className="text-lg text-primary-600 font-bold mb-4">£{selectedPkgDetails.price}</p>
          
          
          
          {/* ✅ ENHANCED: Use custom handler instead of direct handleAddToPlan */}
          <Button
            className={`w-full py-3 text-base ${getAddToPartyButtonState().className}`}
            onClick={handleSidebarAddToPlan}
            disabled={getAddToPartyButtonState().disabled}
          >
        
              { addToPlanButtonState.text}
            
          </Button>
        </div>
      )}

      {/* Availability Calendar Section */}
      {supplier && (
        <SupplierAvailabilityCalendar
          supplier={supplier}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isFromDashboard={isFromDashboard}
          partyDate={partyDate}
          readOnly={isFromDashboard}
        />
      )}

      {/* Verification Documents Section */}
      {verificationDocs && verificationDocs.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Verification documents</h3>
          <ul className="space-y-3">
            {verificationDocs.map((doc) => (
              <li key={doc.name} className="flex items-center">
                <CheckCircle
                  className={`w-5 h-5 mr-3 ${doc.verified ? "text-green-500" : "text-gray-300"}`}
                  fill={doc.verified ? "currentColor" : "none"}
                />
                <span className={`${doc.verified ? "text-gray-700" : "text-gray-400"}`}>{doc.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add to Favorites Button */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <Button 
          variant="outline" 
          className={`w-full py-3 text-base transition-all duration-200 ${
            isSupplierFavorite 
              ? 'border-primary-300 bg-pink-50 text-primary-700 hover:bg-[hsl(var(--primary-50))]' 
              : 'border-gray-300 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))]'
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart 
            className={`w-5 h-5 mr-2 transition-all duration-200 ${
              isSupplierFavorite 
                ? 'fill-[hsl(vaR(--primary-500))] text-primary-500' 
                : 'text-gray-500'
            }`} 
          />
          {isSupplierFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </Button>
      </div>
    
    </div>
  )
}