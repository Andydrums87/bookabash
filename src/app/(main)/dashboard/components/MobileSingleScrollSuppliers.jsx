// Updated MobileSingleScrollSuppliers component with e-invites section removed

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles } from "lucide-react"
import Image from "next/image"
import MobileSupplierCard from "../components/Cards/MobileSupplierCard"

// Remove the e-invites section from supplierSections
const supplierSections = [
  {
    id: "essentials",
    title: "Party Essentials",
    subtitle: "The must-haves for your party",
    emoji: "🎪",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753868085/ChatGPT_Image_Jul_30_2025_10_34_38_AM_ue973s.png",
    types: ["venue", "entertainment"],
  },
  {
    id: "activities", 
    title: "Fun Activities",
    subtitle: "Keep the kids entertained",
    emoji: "🎨",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869132/ChatGPT_Image_Jul_30__2025__10_50_40_AM-removebg_orq8w2.png",
    types: ["facePainting", "activities"],
  },
  {
    id: "treats",
    title: "Yummy Treats", 
    subtitle: "Food and party bags",
    emoji: "🍰",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753870206/ChatGPT_Image_Jul_30_2025_11_09_59_AM_rx1pgs.png",
    types: ["catering", "partyBags"],
  },
  {
    id: "finishing",
    title: "Finishing Touches",
    subtitle: "Make it picture perfect", 
    emoji: "✨",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869447/ChatGPT_Image_Jul_30_2025_10_57_18_AM_xke5gz.png",
    types: ["decorations", "balloons"],
  },
  // Removed the e-invites section entirely
]

function SectionHeader({ section }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
        <div className="w-20 h-20 flex-shrink-0">
          <Image
            src={section.image}
            alt={section.title}
            width={50}
            height={50}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <p>{section.title}</p>    
        <p className="text-gray-400 text-base mb-4">{section.subtitle}</p>
        </div>
      </h2>
    </div>
  );
}

export default function MobileSingleScrollSuppliers({
  suppliers,
  loadingCards = [],
  suppliersToDelete = [],
  openSupplierModal,
  handleDeleteSupplier,
  getSupplierDisplayName,
  addons = [],
  handleRemoveAddon,
  getEnquiryStatus,
  isSignedIn = false,
  isPaymentConfirmed = false,
  enquiries = [],
  handleAddSupplier,
  getEnquiryTimestamp
}) {
  const [activeSection, setActiveSection] = useState(0);

  // Check if we're in awaiting response phase
  const hasEnquiriesPending = enquiries.length > 0 && isSignedIn;

  // Filter suppliers based on phase (exclude einvites from main suppliers)
  const getVisibleSuppliers = () => {
    // Filter out einvites from all suppliers
    const filteredSuppliers = Object.fromEntries(
      Object.entries(suppliers).filter(([type]) => type !== 'einvites')
    );

    if (hasEnquiriesPending) {
      // Only show suppliers with enquiries sent (einvites already excluded)
      return Object.fromEntries(
        Object.entries(filteredSuppliers).filter(([type, supplier]) => {
          // Only include suppliers that have both a supplier AND an enquiry status of 'pending'
          return supplier && getEnquiryStatus && getEnquiryStatus(type) === 'pending';
        })
      );
    }
    
    // Show all suppliers except einvites (normal state)
    return filteredSuppliers;
  };

  const visibleSuppliers = getVisibleSuppliers();

  const scrollToSection = (sectionId, index) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(index);
    }
  };

  return (
    <div className="w-full">
      {/* Improved horizontal navigation inspired by The Clubroom */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 mb-6">
        {/* Navigation container with proper scrolling */}
        <div className="px-3 py-5">
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {supplierSections.map((section, index) => {
              const sectionSuppliers = section.types.map(type => ({
                type,
                supplier: visibleSuppliers[type]
              })).filter(({ supplier }) => {
                if (isPaymentConfirmed) {
                  return supplier !== null && supplier !== undefined;
                }
                return true;
              });

              if (isPaymentConfirmed && sectionSuppliers.length === 0) {
                return null;
              }

              // Hide sections with no visible suppliers during awaiting response phase
              if (hasEnquiriesPending && sectionSuppliers.length === 0) {
                return null;
              }

              const completedCount = sectionSuppliers.filter(({supplier}) => supplier).length;
              const isComplete = completedCount === sectionSuppliers.length && sectionSuppliers.length > 0;
              const isActive = activeSection === index;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id, index)}
                  className={`flex-shrink-0 relative transition-all duration-200 ${
                    isActive ? 'transform scale-105' : 'hover:transform hover:scale-105'
                  }`}
                  style={{ minWidth: '70px' }}
                >
                  {/* Circular container */}
                  <div className="flex flex-col items-center">
                    {/* Main circle with image */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 overflow-hidden relative ${
                      isActive 
                        ? 'shadow-lg ring-2 ring-orange-300' 
                        : 'hover:shadow-md'
                    }`}>
                      <Image
                        src={section.image}
                        alt={section.title}
                        width={56}
                        height={56}
                        className={`w-full h-full object-cover rounded-full ${
                          isActive ? 'opacity-90' : ''
                        }`}
                      />
                      {/* Overlay for active state */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-pink-400/30 rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Title */}
                    <div className="text-center">
                      <p className={`text-xs font-semibold leading-tight ${
                        isActive ? 'text-orange-700' : 'text-gray-700'
                      }`}>
                        {section.title.split(' ').map((word, i) => (
                          <span key={i} className="block">{word}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Completion indicator */}
                  {isComplete && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Optional: Add fade effect for scrollable area */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      {/* Supplier Sections */}
      <div className="space-y-8 px-4">
        {supplierSections.map((section) => {
          const sectionSuppliers = section.types.map(type => ({
            type,
            supplier: visibleSuppliers[type]
          })).filter(({ supplier }) => {
            if (isPaymentConfirmed) {
              return supplier !== null && supplier !== undefined;
            }
            return true;
          });
          
          if (isPaymentConfirmed && sectionSuppliers.length === 0) {
            return null;
          }

          // Hide sections with no visible suppliers during awaiting response phase
          if (hasEnquiriesPending && sectionSuppliers.length === 0) {
            return null;
          }
          
          const completedCount = sectionSuppliers.filter(({supplier}) => supplier).length;
          const totalCount = sectionSuppliers.length;

          return (
            <div key={section.id} id={section.id} className="relative">
              <SectionHeader section={section} />
              
              <div className="space-y-4 mb-8">
                {sectionSuppliers.map(({ type, supplier }) => {
                  // Skip empty suppliers during awaiting response phase
                  if (hasEnquiriesPending && !supplier) {
                    return null;
                  }

                  return (
                    <MobileSupplierCard
                      key={type}
                      supplier={supplier}
                      type={type}
                      loadingCards={loadingCards}
                      suppliersToDelete={suppliersToDelete}
                      openSupplierModal={openSupplierModal}
                      handleDeleteSupplier={handleDeleteSupplier}
                      getSupplierDisplayName={getSupplierDisplayName}
                      addons={addons}
                      handleRemoveAddon={handleRemoveAddon}
                      enquiryStatus={getEnquiryStatus ? getEnquiryStatus(type) : null}
      enquirySentAt={getEnquiryTimestamp ? getEnquiryTimestamp(type) : null} 
                      isSignedIn={isSignedIn}
                      enquiries={enquiries}
                      isPaymentConfirmed={isPaymentConfirmed}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}