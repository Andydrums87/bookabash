// Enhanced SupplierPackages component with replacement mode support
"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, Plus, X, Clock, Users, Star } from "lucide-react"

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [breakpoint])
  return isMobile
}

const PackageDetailsModal = ({ pkg, isOpen, onClose }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="relative h-64">
          <Image
            src={pkg.image || pkg.imageUrl || "/placeholder.png"}
            alt={pkg.name}
            fill
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 rounded-full p-2 shadow-md transition-colors"
          >
            <X size={20} className="text-gray-600 cursor-pointer" />
          </button>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-2xl font-bold text-gray-900">{pkg.name}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-3xl font-bold text-primary">£{pkg.price}</span>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{pkg.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* What's Included */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
            <div className="flex flex-wrap gap-2">
              {pkg.features?.map((item, i) => (
                <span key={i} className="bg-primary-500 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Package Details</h3>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {pkg.description}
              </div>
            </div>
          </div>

          {/* Package Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-primary-700 mx-auto mb-2" />
              <div className="text-sm text-primary-700">Duration</div>
              <div className="font-semibold text-primary-700">{pkg.duration}</div>
            </div>
            <div className="bg-primary-500 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-white mx-auto mb-2" />
              <div className="text-sm text-white">Price Type</div>
              <div className="font-semibold text-white capitalize">{pkg.priceType}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ ENHANCED: PackageCard with replacement mode awareness
const PackageCard = ({
  pkg,
  isSelected,
  onSelect,
  onAddToPlan,
  addToPlanButtonState,
  isInPlan,
  isInPlanPackage,
  onShowNotification,
  isReplacementMode = false // ✅ NEW: Replacement mode flag
}) => {
  const [showModal, setShowModal] = useState(false)
  const isMobile = useIsMobile(640)

  const features = Array.isArray(pkg.whatsIncluded) ? pkg.whatsIncluded : []
  const visibleCount = isMobile ? 1 : 2
  const extraCount = Math.max(0, features.length - visibleCount)

  const truncate = (text) => (isMobile && text.length > 15 ? `${text.slice(0, 12)}…` : text)

  // ✅ ENHANCED: Handle package selection with replacement context storage
  const handlePackageSelection = (packageId) => {

    
    // ✅ STORE: Package data in replacement context when selected
    if (isReplacementMode && packageId) {
      try {
        const selectedPackage = pkg // Current package data
        
        // Get existing context
        const existingContext = sessionStorage.getItem('replacementContext')
        let context = existingContext ? JSON.parse(existingContext) : {}
        
        // Update context with selected package
        const enhancedPackageData = {
          id: selectedPackage.id,
          name: selectedPackage.name,
          price: selectedPackage.price,
          duration: selectedPackage.duration || '2 hours',
          features: selectedPackage.features || [],
          description: selectedPackage.description || `${selectedPackage.name} package`,
          
          // Additional metadata
          originalPrice: selectedPackage.originalPrice || selectedPackage.price,
          totalPrice: selectedPackage.totalPrice || selectedPackage.price,
          basePrice: selectedPackage.basePrice || selectedPackage.price,
          addonsPriceTotal: selectedPackage.addonsPriceTotal || 0,
          addons: selectedPackage.addons || [],
          selectedAddons: selectedPackage.selectedAddons || [],
          
          // Selection tracking
          selectedAt: new Date().toISOString(),
          selectionSource: 'package_card_click',
          isReplacementSelection: true
        }
        
        context.selectedPackageId = packageId
        context.selectedPackageData = enhancedPackageData
        context.packageSelectedAt = new Date().toISOString()
        
        sessionStorage.setItem('replacementContext', JSON.stringify(context))
        console.log('💾 Stored package data in replacement context:', enhancedPackageData)
        
      } catch (error) {
        console.error('❌ Error storing package data:', error)
      }
    }
    
    // Call the original selection handler
    onSelect(packageId)
  }

  return (
    <>
      <div
        className={`bg-white rounded-3xl p-3 sm:p-4 pt-0 mb-5 flex flex-col text-center shadow-lg transition-all duration-300 relative overflow-hidden group ${
          isInPlanPackage
            ? "ring-2 ring-green-500 scale-[1.02] cursor-pointer"
            : isSelected
            ? "ring-2 ring-[hsl(var(--primary-500))] scale-[1.02] cursor-pointer hover:scale-[1.04] hover:shadow-2xl"
            : "cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-gray-200"
        } ${
          // ✅ ENHANCED: Special styling for replacement mode
          isReplacementMode ? " bg-white" : ""
        }`}
        onClick={() => {
          if (isInPlanPackage) {
            onShowNotification?.({
              type: "info",
              message: `${pkg.name} is already in your party plan! You can view details or manage it from your dashboard.`
            })
          } else if (!isSelected) {
            handlePackageSelection(pkg.id) // ✅ Use enhanced selection handler
          }
        }}
        style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* ✅ NEW: Replacement mode indicator */}
        {isReplacementMode && (
          <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Replacement
          </div>
        )}

        {/* Image */}
        <div
          className="relative w-50 h-50 md:h-[200px] md:w-full mask-image mx-auto mt-3 sm:mt-5 mb-2 sm:mb-3"
          style={{
            WebkitMaskImage: 'url("/image.svg")',
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            WebkitMaskPosition: "center",
            maskImage: 'url("/image.svg")',
            maskRepeat: "no-repeat",
            maskSize: "contain",
            maskPosition: "center"
          }}
        >
          <Image
            src={pkg.image || pkg.imageUrl || "/placeholder.png"}
            alt={pkg.name || "package image"}
            fill
            className="object-cover group-hover:brightness-110 transition-all duration-300"
            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 200px"
          />
        </div>

        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 truncate mb-1 px-1 sm:px-2 group-hover:text-gray-900 transition-colors duration-200">
          {pkg.name}
        </h3>

        {/* Price + Meta */}
        <div className="mb-2 sm:mb-4">
          <p className="text-base sm:text-lg font-bold text-primary group-hover:text-primary transition-colors duration-200">
            £{pkg.price}
          </p>
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{pkg.duration}</span>
            </div>
            <span className="capitalize">{pkg.priceType?.replace("_", " ")}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mb-2 sm:mb-4 px-1 sm:px-2">
          {features.slice(0, visibleCount).map((feature, i) => (
            <span
              key={i}
              className="bg-[#fff0ee] text-gray-900 text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full group-hover:bg-[#ffebe8] group-hover:scale-105 transition-all duration-200"
            >
              {truncate(feature)}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">
              +{extraCount} more
            </span>
          )}
        </div>

        {/* ✅ ENHANCED: Buttons with replacement mode handling */}
        {isInPlanPackage ? (
          <div className="mt-auto space-y-1 sm:space-y-2">
            <Button
              className="w-full py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold bg-teal-500 hover:bg-teal-500 text-white cursor-not-allowed"
              disabled
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              In Plan
            </Button>
            <button
              className="w-full py-1 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        ) : isSelected ? (
          <div className="mt-auto space-y-1 sm:space-y-2">
            {/* ✅ ENHANCED: Show different button text in replacement mode */}
            {isReplacementMode ? (
              <div className="space-y-2">
                <Button
                  className="w-full py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Don't call onAddToPlan in replacement mode - just show selection
         
                  }}
                >
                  Selected for Review
                </Button>
                <p className="text-xs text-primary-600 font-medium">
                  Return to dashboard to approve this package
                </p>
              </div>
            ) : (
              <Button
                className={`w-full py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold ${addToPlanButtonState.className}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToPlan()
                }}
                disabled={addToPlanButtonState.disabled}
              >
                {addToPlanButtonState.text} 
              </Button>
            )}
            
            <button
              className="w-full py-1 sm:py-2 text-xs sm:text-sm text-gray-600 transition-colors cursor-pointer hover:text-[hsl(var(--primary-700))]"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        ) : (
          <div className="mt-auto space-y-1 sm:space-y-2">
            <Button
              variant="default"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold group-hover:bg-[hsl(var(--primary-500))] group-hover:text-white transform group-hover:scale-100 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                handlePackageSelection(pkg.id) // ✅ Use enhanced selection handler
              }}
            >
              {isReplacementMode ? "Select for Replacement" : "Select Package"}
            </Button>
            <button
              className="w-full py-1 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-[hsl(var(--primary-500))] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        )}

        {(isSelected || isInPlanPackage) && (
          <div
            className={`absolute top-2 sm:top-3 right-2 sm:right-3 rounded-full p-1 sm:p-1.5 shadow-md ${
              isInPlanPackage ? "bg-teal-500" : isReplacementMode ? "bg-primary-500" : "bg-primary"
            } text-white transform transition-all duration-300 ${
              !isInPlanPackage ? "group-hover:scale-110 group-hover:rotate-12" : ""
            }`}
          >
            <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        )}

        {isSelected && !isInPlanPackage && (
          <button
            className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gray-500 hover:bg-red-500 text-white rounded-full p-1 shadow-md transition-all duration-200 opacity-80 hover:opacity-100 transform hover:scale-110"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(null)
              
              // ✅ CLEAR: Package data from replacement context when deselected
              if (isReplacementMode) {
                try {
                  const existingContext = sessionStorage.getItem('replacementContext')
                  if (existingContext) {
                    const context = JSON.parse(existingContext)
                    delete context.selectedPackageId
                    delete context.selectedPackageData
                    delete context.packageSelectedAt
                    sessionStorage.setItem('replacementContext', JSON.stringify(context))
                    console.log('🗑️ Cleared package data from replacement context')
                  }
                } catch (error) {
                  console.error('❌ Error clearing package data:', error)
                }
              }
            }}
            title="Deselect package"
          >
            <X size={12} className="sm:w-[14px] sm:h-[14px]" />
          </button>
        )}
      </div>

      {/* Modal */}
      <PackageDetailsModal pkg={pkg} isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

// ✅ ENHANCED: Main component with replacement mode support
export default function SupplierPackages({
  packages,
  selectedPackageId,
  setSelectedPackageId,
  handleAddToPlan,
  getAddToPartyButtonState,
  getSupplierInPartyDetails,
  onShowNotification,
  isReplacementMode = false // ✅ NEW: Add replacement mode prop
}) {
  if (!packages || packages.length === 0) return null

  const partyDetails = getSupplierInPartyDetails()
  const packagesData = packages

  return (
    <div className="px-4 md:px-0">
      {/* ✅ ENHANCED: Different header for replacement mode */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {isReplacementMode ? "Choose Replacement Package" : "Choose a Package"}
      </h2>
      
      {/* ✅ NEW: Replacement mode instructions */}
      {isReplacementMode && (
        <div className="bg-primary-50 border border-[hsl(var(--primary-200))] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
           <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753965530/ChatGPT_Image_Jul_31_2025_01_38_43_PM_ozbvja.png" className="h-10 w-10" alt="" />
            <div>
              <h3 className="font-semibold text-primary-900">Replacement Mode</h3>
              <p className="text-sm text-primary-700">
                Select a package to replace your previous choice. You can review and approve it from your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6 md:gap-8">
        {packagesData.map((pkg) => {
          const isInPlanPackage = partyDetails.inParty && partyDetails.currentPackage === pkg.id
          const isSelected = pkg.id === selectedPackageId && !isInPlanPackage
          return (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isSelected={isSelected}
              isInPlan={partyDetails.inParty}
              isInPlanPackage={isInPlanPackage}
              onSelect={setSelectedPackageId}
              onAddToPlan={handleAddToPlan}
              addToPlanButtonState={getAddToPartyButtonState(pkg.id)}
              onShowNotification={onShowNotification}
              isReplacementMode={isReplacementMode} // ✅ Pass replacement mode flag
            />
          )
        })}
      </div>
    </div>
  )
}