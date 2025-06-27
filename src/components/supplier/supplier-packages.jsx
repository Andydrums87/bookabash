"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, Plus, X, Clock, Users, Star } from "lucide-react"
import { useState } from "react"

const PackageDetailsModal = ({ pkg, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="relative h-64">
          <Image
            src={pkg.image || pkg.imageUrl || '/placeholder.jpg'}
            alt={pkg.name}
            fill
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 rounded-full p-2 shadow-md transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-4">
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
              {pkg.whatsIncluded?.map((item, i) => (
                <span key={i} className="bg-[#fff0ee] text-gray-900 text-sm font-medium px-3 py-1.5 rounded-full">
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
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold text-gray-900">{pkg.duration}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Price Type</div>
              <div className="font-semibold text-gray-900 capitalize">{pkg.priceType?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PackageCard = ({ pkg, isSelected, onSelect, onAddToPlan, addToPlanButtonState, isInPlan, isInPlanPackage, onShowNotification }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className={`bg-white rounded-3xl p-4 pt-0 flex flex-col text-center shadow-lg transition-all duration-300 relative overflow-hidden group ${
          isInPlanPackage 
            ? "ring-2 ring-green-500 transform scale-[1.02] cursor-pointer" 
            : isSelected 
            ? "ring-2 ring-[#ff795b] transform scale-[1.02] cursor-pointer hover:scale-[1.04] hover:shadow-2xl" 
            : "cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-gray-200"
        }`}
        onClick={() => {
          if (isInPlanPackage) {
            onShowNotification({
              type: "info",
              message: `${pkg.name} is already in your party plan! You can view details or manage it from your dashboard.`
            });
          } else if (!isSelected) {
            onSelect(pkg.id);
          }
        }}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* SVG Clip Path defined locally for this card */}
        <svg
          width="0"
          height="0"
          style={{
            position: "absolute",
            overflow: "hidden",
            top: "-9999px",
            left: "-9999px",
          }}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={`funCloudClip-${pkg.id}`} clipPathUnits="objectBoundingBox">
              <circle cx="0.5" cy="0.5" r="0.35" />
              <circle cx="0.5" cy="0.2" r="0.2" />
              <circle cx="0.75" cy="0.35" r="0.22" />
              <circle cx="0.7" cy="0.65" r="0.2" />
              <circle cx="0.5" cy="0.8" r="0.22" />
              <circle cx="0.25" cy="0.65" r="0.2" />
              <circle cx="0.3" cy="0.35" r="0.22" />
            </clipPath>
          </defs>
        </svg>

        {/* Image container with clip path */}
        <div className="relative w-full h-56 md:h-70 mx-auto mb-4 -mt-px group-hover:scale-105 transition-transform duration-300">
          <div
            className="absolute inset-5"
            style={{
              clipPath: `url(#funCloudClip-${pkg.id})`,
              WebkitClipPath: `url(#funCloudClip-${pkg.id})`,
            }}
          >
            <Image
              src={pkg.image || pkg.imageUrl || `/placeholder.svg?height=256&width=256&query=${pkg.name.replace(/\s+/g, "+")}+package`}
              alt={pkg.name}
              fill
              className="object-cover group-hover:brightness-110 transition-all duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
        
        <h3 className="font-bold text-xl text-gray-800 truncate mb-1 px-2 group-hover:text-gray-900 transition-colors duration-200">{pkg.name}</h3>
        
        {/* Enhanced pricing and duration info */}
        <div className="mb-4">
          <p className="text-lg font-bold text-primary group-hover:text-primary transition-colors duration-200">£{pkg.price}</p>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{pkg.duration}</span>
            </div>
            <span className="capitalize">{pkg.priceType?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Short description preview */}
        <div className="mb-4 px-2 flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">
            {pkg.description?.split('\n')[0]?.replace(/👑|📚|🎉|📸|🎂|⏰|✨/g, '').trim()}
          </p>
        </div>

        {/* Enhanced features display */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-4 px-2">
          {pkg.whatsIncluded?.slice(0, 2).map((feature, i) => (
            <span key={i} className="bg-[#fff0ee] text-gray-900 text-xs font-medium px-2.5 py-1 rounded-full group-hover:bg-[#ffebe8] group-hover:scale-105 transition-all duration-200">
              {feature}
            </span>
          ))}
          {pkg.whatsIncluded?.length > 2 && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
              +{pkg.whatsIncluded.length - 2} more
            </span>
          )}
        </div>
        
        {/* Updated button logic */}
        {isInPlanPackage ? (
          <div className="mt-auto space-y-2">
            <Button
              className="w-full py-3 rounded-xl text-base font-semibold bg-green-500 hover:bg-green-500 text-white cursor-not-allowed"
              disabled={true}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              In Plan
            </Button>
            <button 
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        ) : isSelected ? (
          <div className="mt-auto space-y-2">
            <Button
              className={`w-full py-3 rounded-xl text-base font-semibold ${addToPlanButtonState.className}`}
              onClick={(e) => {
                e.stopPropagation()
                onAddToPlan()
              }}
              disabled={addToPlanButtonState.disabled}
            >
              {addToPlanButtonState.text}
            </Button>
            <button 
              className="w-full py-2 text-sm text-gray-600 transition-colors cursor-pointer hover:text-[hsl(var(--primary-700))]"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        ) : (
          <div className="mt-auto space-y-2">
            <Button
              variant="default"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-base font-semibold group-hover:bg-[hsl(var(--primary-500))] group-hover:text-white transform group-hover:scale-100 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(pkg.id)
              }}
            >
              Select Package
            </Button>
            <button 
              className="w-full py-2 text-sm text-gray-600 hover:text-[hsl(var(--primary-500))] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        )}
        
        {/* Checkmark for selected/in-plan packages */}
        {(isSelected || isInPlanPackage) && (
          <div className={`absolute top-3 right-3 rounded-full p-1.5 shadow-md ${
            isInPlanPackage ? 'bg-green-500' : 'bg-primary'
          } text-white transform transition-all duration-300 ${
            !isInPlanPackage ? 'group-hover:scale-110 group-hover:rotate-12' : ''
          }`}>
            <CheckCircle size={18} />
          </div>
        )}

        {/* Small X icon for deselecting - only show on selected (not in-plan) packages */}
        {isSelected && !isInPlanPackage && (
          <button
            className="absolute top-3 left-3 bg-gray-500 hover:bg-red-500 text-white rounded-full p-1 shadow-md transition-all duration-200 opacity-80 hover:opacity-100 transform hover:scale-110"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(null)
            }}
            title="Deselect package"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Modal */}
      <PackageDetailsModal 
        pkg={pkg} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  )
}

export default function SupplierPackages({ 
  packages, 
  selectedPackageId, 
  setSelectedPackageId, 
  handleAddToPlan, 
  getAddToPartyButtonState,
  getSupplierInPartyDetails,
  onShowNotification
}) {
  if (!packages || packages.length === 0) {
    return null
  }

  console.log('Raw packages data:', packages)
  
  // Check if supplier is already in party plan
  const partyDetails = getSupplierInPartyDetails()
  
  // Use packages as-is, don't modify the image property
  const packagesData = packages

  return (
    <div className="px-4 md:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Package</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {packagesData.map((pkg) => {
          const isInPlanPackage = partyDetails.inParty && partyDetails.currentPackage === pkg.id;
          const isSelected = pkg.id === selectedPackageId && !isInPlanPackage;
          
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
            />
          );
        })}
      </div>
    </div>
  )
}