// Enhanced MobileSingleScrollSuppliers with Party Tasks Navigation

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Mail, Users, Gift } from "lucide-react"
import Image from "next/image"
import MobileSupplierCard from "../components/Cards/MobileSupplierCard"

// Keep your existing supplier sections
const supplierSections = [
  {
    id: "essentials",
    title: "Party Essentials",
    subtitle: "The must-haves for your party",
    emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753868085/ChatGPT_Image_Jul_30_2025_10_34_38_AM_ue973s.png",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749848122/oml2ieudsno9szcjlngp.jpg",
    types: ["venue", "entertainment"],
  },
  {
    id: "activities", 
    title: "Fun Activities",
    subtitle: "Keep the kids entertained",
    emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869132/ChatGPT_Image_Jul_30__2025__10_50_40_AM-removebg_orq8w2.png",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749828970/niq4bh4wemamqziw0tki.png",
    types: ["facePainting", "activities"],
  },
  {
    id: "treats",
    title: "Yummy Treats", 
    subtitle: "Food and party bags",
    emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753870206/ChatGPT_Image_Jul_30_2025_11_09_59_AM_rx1pgs.png",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749854566/lcjmipa6yfuspckl93nz.jpg",
    types: ["catering", "partyBags"],
  },
  {
    id: "finishing",
    title: "Finishing Touches",
    subtitle: "Make it picture perfect", 
    emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869447/ChatGPT_Image_Jul_30_2025_10_57_18_AM_xke5gz.png",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png",
    types: ["decorations", "balloons"],
  },
]

// Party tasks that appear in the navigation
const partyTasks = [
  {
    id: "einvites",
    title: "E-Invites",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754405084/party-invites/m02effvlanaxupepzsza.png", // Using working supplier image as fallback
    cardId: "einvites-card"
  },
  {
    id: "rsvps", 
    title: "RSVPs",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753986373/jwq8wmgxqqfue2zsophq.jpg",
    cardId: "rsvp-card"
  },
  {
    id: "gifts",
    title: "Gifts",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/okpcftsuni04yokhex1l.jpg",
    cardId: "gift-registry-card"
  }
]

function SectionHeader({ section }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
        <div className="w-20 h-20 flex-shrink-0">
          <Image
            src={section.emoji}
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
  getEnquiryTimestamp,
  // New props for party tasks
  partyTasksStatus = {},
  showPartyTasks = true
}) {
  const [activeSection, setActiveSection] = useState(0);




  const hasEnquiriesPending = enquiries.length > 0 && isSignedIn;

  // Filter suppliers based on phase (exclude einvites from main suppliers)
  const getVisibleSuppliers = () => {
    const filteredSuppliers = Object.fromEntries(
      Object.entries(suppliers).filter(([type]) => type !== 'einvites')
    );

    if (hasEnquiriesPending) {
      return Object.fromEntries(
        Object.entries(filteredSuppliers).filter(([type, supplier]) => {
          return supplier && getEnquiryStatus && getEnquiryStatus(type) === 'pending';
        })
      );
    }
    
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


  
  // Function to scroll to individual party task cards
  const scrollToPartyTask = (cardId) => {
    const element = document.getElementById(cardId);
    if (element) {
      const offset = 80; // Adjust for header height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full">
      {/* Enhanced horizontal navigation with party tasks */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 mb-6">
        <div className="px-3 py-5">
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            
            {/* Existing supplier sections */}
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
                  <div className="flex flex-col items-center">
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
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-pink-400/30 rounded-full"></div>
                      )}
                    </div>
                    
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
                  
                  {isComplete && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></div>
                  )}
                </button>
              );
            })}

            {/* Divider between suppliers and party tasks */}
            {showPartyTasks && (
              <div className="flex-shrink-0 flex items-center justify-center w-8">
                <div className="w-px h-12 bg-gray-300"></div>
              </div>
            )}

            {/* Party Tasks Navigation Items */}
            {showPartyTasks && partyTasks.map((task) => {
              const isCompleted = partyTasksStatus[task.id]?.completed;
              const count = partyTasksStatus[task.id]?.count || 0;
              const hasActivity = partyTasksStatus[task.id]?.hasActivity;

              return (
                <button
                  key={task.id}
                  onClick={() => scrollToPartyTask(task.cardId)}
                  className="flex-shrink-0 relative transition-all duration-200 hover:transform hover:scale-105"
                  style={{ minWidth: '70px' }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 overflow-hidden relative shadow-sm hover:shadow-md bg-gray-100">
                      
                      <Image
                        src={task.image}
                        alt={task.title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          console.log(`Failed to load image for ${task.title}:`, task.image);
                          // Fallback to a solid color background with text
                          e.target.style.display = 'none';
                        }}
                      />
                      
                    
                      {/* Status indicators */}
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">✓</span>
                        </div>
                      )}
                      
                      {count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">{count}</span>
                        </div>
                      )}
                      
                      {/* Activity pulse for new activity */}
                      {hasActivity && (
                        <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-30"></div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-semibold leading-tight text-gray-700">
                        {task.title}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

          </div>
        </div>
        
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      {/* Supplier Sections with Fixed Empty State */}
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

          if (hasEnquiriesPending && sectionSuppliers.length === 0) {
            return null;
          }
          
          return (
            <div key={section.id} id={section.id} className="relative">
              <SectionHeader section={section} />
              
              <div className="space-y-4 mb-8">
                {(() => {
                  // Check if section has any suppliers when in enquiries pending mode
                  const suppliersWithContent = sectionSuppliers.filter(({ supplier }) => 
                    hasEnquiriesPending ? supplier : true
                  );

                  if (suppliersWithContent.length === 0 && hasEnquiriesPending) {
                    // Show empty state once per section
                    return (
                      <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                        <div className="text-gray-400 text-2xl mb-2">📋</div>
                        <p className="text-gray-500 font-medium text-sm mb-1">No suppliers in this section</p>
                        <p className="text-gray-400 text-xs">
                          You haven't added any suppliers to this category yet
                        </p>
                      </div>
                    );
                  }

                  // Render supplier cards
                  return sectionSuppliers.map(({ type, supplier }) => {
                    if (hasEnquiriesPending && !supplier) {
                      return null
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
                        enquiryStatus={getEnquiryStatus(type)}
                        enquirySentAt={getEnquiryTimestamp ? getEnquiryTimestamp(type) : null} 
                        isSignedIn={isSignedIn}
                        enquiries={enquiries}
                        isPaymentConfirmed={isPaymentConfirmed}
                      />
                    );
                  });
                })()}
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