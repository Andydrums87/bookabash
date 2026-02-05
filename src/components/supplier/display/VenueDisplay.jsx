// components/supplier/display/VenueDisplay.jsx
import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Car,
  Clock,
  CheckCircle,
  Ban,
  Gift,
  Star,
  AlertTriangle,
  Key,
  Music,
  Truck
} from "lucide-react";

// Add this MapWidget component at the top of your VenueDisplay.jsx file
// Place it right after your imports and before the main VenueDisplay component



const MapWidget = ({ address, venueAddress, venueName }) => {
  // Determine which address format to use
  const addressData = venueAddress || address;

  if (!addressData) return null;

  console.log('Full addressData received:', addressData);

  // Handle different address formats with better formatting
  let addressString;
  let businessQuery = '';
  
  if (venueAddress) {
 
    
    // Clean up the postcode by trimming whitespace
    const cleanPostcode = venueAddress.postcode?.trim();
    
    // Build address parts array
    const parts = [
      venueAddress.addressLine1,
      venueAddress.addressLine2,
      venueAddress.city,
      cleanPostcode,
      venueAddress.country
    ].filter(part => part && part.trim() !== ''); // Remove empty/null/undefined strings
    

    
    addressString = parts.join(', ');

    
    // If we have a business name, create a separate business query
    if (venueAddress.businessName && venueAddress.businessName.trim()) {
      businessQuery = venueAddress.businessName.trim();

    }
  } else if (address) {

    // Original address format: { street, city, postcode }
    const cleanPostcode = address.postcode?.trim();
    addressString = `${address.street}, ${address.city}, ${cleanPostcode}`;

  } else {
    console.log('No valid address data found');
    return null;
  }

  // Try multiple search strategies
  const queries = [
    // First try just the address (often more reliable)
    addressString || null,
    // Then try with business name if available  
    businessQuery && addressString ? `${businessQuery}, ${addressString}` : null,
    // Finally try with just postcode and city as fallback
    venueAddress ? `${venueAddress.city}, ${venueAddress.postcode?.trim()}` : 
                   address ? `${address.city}, ${address.postcode?.trim()}` : null
  ].filter(Boolean);



  // Use the first (most specific) query for the map
  const primaryQuery = queries[0];

  
  if (!primaryQuery) {
    console.error('No valid query could be generated');
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-900 mb-2">Address Error</h4>
        <p className="text-red-700">Unable to generate a valid address for mapping.</p>
      </div>
    );
  }
  
  const encodedAddress = encodeURIComponent(primaryQuery);
  
  // Google Maps embed URL
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`;

  // Use venue business name if available, otherwise fall back to venueName prop
  const displayName = venueAddress?.businessName || venueName || 'venue';

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-gray-900 mb-3">Location Map</h4>
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <iframe
          src={mapSrc}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing location of ${displayName}`}
        />
      </div>
      <div className="my-5 flex gap-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <MapPin className="w-4 h-4" />
          Open in Google Maps
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <Car className="w-4 h-4" />
          Get Directions
        </a>
      </div>
      
   
    </div>
  );
};


const VenueDisplay = ({
  supplier,
  serviceDetails,
  // Add-on selection props (optional - for interactive mode)
  selectedAddons = [],
  onToggleAddon,
  isInteractive = false
}) => {

  // State for expandable sections
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [showAllSetupOptions, setShowAllSetupOptions] = useState(false);
  const [showAllCateringOptions, setShowAllCateringOptions] = useState(false);
  const [showAllRestrictions, setShowAllRestrictions] = useState(false);
  const [showAllRules, setShowAllRules] = useState(false);
  const [showAllAllowedItems, setShowAllAllowedItems] = useState(false); // NEW: State for allowed items



  // Helper function to render expandable item list - Airbnb minimal style
  const renderExpandableBadges = (items, title, _icon, _colorClass, showAll, setShowAll, maxInitial = 6) => {
    if (!items?.length) return null;

    const displayItems = showAll ? items : items.slice(0, maxInitial);
    const hasMore = items.length > maxInitial;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {title}
        </h4>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {displayItems.map((item, index) => (
              <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">
                {item}
              </span>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium underline"
            >
              {showAll ? 'Show less' : `Show all ${items.length}`}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render age groups - Airbnb minimal
  const renderAgeGroups = (ageGroups) => {
    if (!ageGroups?.length) return null;
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Suitable age groups</h4>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((age, index) => (
            <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm">
              {age}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to get category icon and color
  const getCategoryInfo = (category) => {
    const categories = {
      service: { icon: <Gift className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
      access: { icon: <Key className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
      equipment: { icon: <Music className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
      premium: { icon: <Star className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
      logistics: { icon: <Truck className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
    };
    return categories[category] || categories.service;
  };

  // Helper function to render add-on services with horizontal scroll
  const renderAddOnServices = (addOnServices) => {
    if (!addOnServices?.length) return null;

    return (
      <div className="mb-6">
        <SectionHeader>Additional Services</SectionHeader>
        <p className="text-base text-gray-600 mb-4">
          {isInteractive ? 'Tap to add extras to your booking' : 'Optional extras you can add to enhance your booking'}
        </p>

          {/* Horizontal scrolling container */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 min-w-max">
              {addOnServices.map((addon, index) => {
                const categoryInfo = getCategoryInfo(addon.category);
                const addonId = addon.id || `addon-${index}`;
                const isSelected = selectedAddons.some(a => (a.id || a) === addonId);

                return (
                  <div
                    key={addonId}
                    className={`flex-shrink-0 w-72 rounded-xl overflow-hidden transition-all shadow-sm ${
                      isSelected
                        ? 'ring-2 ring-green-500 shadow-green-100'
                        : 'ring-1 ring-gray-200 hover:ring-primary-300 hover:shadow-md'
                    }`}
                  >
                    {/* Card content */}
                    <div className={`p-4 ${isSelected ? 'bg-green-50' : 'bg-white'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`${isSelected ? 'text-green-500' : 'text-primary-500'}`}>
                            {categoryInfo.icon}
                          </div>
                          <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                        </div>
                        <span className={`font-bold text-lg ${isSelected ? 'text-green-600' : 'text-primary-600'}`}>
                          +£{addon.price}
                        </span>
                      </div>
                      {addon.description && (
                        <p className="text-gray-600 text-sm mt-2">{addon.description}</p>
                      )}
                      <div className="mt-3">
                        <Badge variant="outline" className={`text-xs ${
                          isSelected
                            ? 'text-green-700 border-green-300 bg-green-100'
                            : 'text-gray-600 border-gray-200 bg-gray-50'
                        }`}>
                          {addon.category === 'service' && 'Additional Service'}
                          {addon.category === 'access' && 'Facility Access'}
                          {addon.category === 'equipment' && 'Equipment Rental'}
                          {addon.category === 'premium' && 'Premium Upgrade'}
                          {addon.category === 'logistics' && 'Logistics'}
                          {!addon.category && 'Extra'}
                        </Badge>
                      </div>
                    </div>

                    {/* CTA Button - only show when interactive */}
                    {isInteractive && (
                      <button
                        onClick={() => onToggleAddon && onToggleAddon(addon)}
                        className={`w-full py-3 px-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-primary-500 hover:bg-primary-600 text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Added to Booking
                          </>
                        ) : (
                          <>
                            Add to Booking
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll indicator */}
          {addOnServices.length > 2 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Scroll horizontally to see all {addOnServices.length} services
            </p>
          )}
      </div>
    );
  };

  // NEW: Helper function to render allowed items
  const renderAllowedItems = (allowedItems) => {
    if (!allowedItems?.length) return null;
    
    const displayItems = showAllAllowedItems ? allowedItems : allowedItems.slice(0, 8);
    const hasMore = allowedItems.length > 8;

    return (
      <div className="mb-6">
        <SectionHeader>Items We Welcome</SectionHeader>
        <p className="text-sm text-gray-500 mb-4">These items and equipment are welcome at our venue</p>

        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
            {displayItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 py-1">
                <CheckCircle className="w-4 h-4 text-[hsl(var(--primary-500))] flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAllAllowedItems(!showAllAllowedItems)}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium underline"
            >
              {showAllAllowedItems ? 'Show less' : `Show all ${allowedItems.length}`}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render restricted items (simplified colors)
  const renderRestrictedItems = (restrictedItems) => {
    if (!restrictedItems?.length) return null;
    
    const displayItems = showAllRestrictions ? restrictedItems : restrictedItems.slice(0, 8);
    const hasMore = restrictedItems.length > 8;

    return (
      <div className="mb-6">
        <SectionHeader>Items Not Permitted</SectionHeader>
        <p className="text-sm text-gray-500 mb-4">Please note these items are not allowed at this venue</p>

        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
            {displayItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 py-1">
                <Ban className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">{item}</span>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAllRestrictions(!showAllRestrictions)}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium underline"
            >
              {showAllRestrictions ? 'Show less' : `Show all ${restrictedItems.length}`}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render house rules (simplified colors)
  const renderHouseRules = (houseRules) => {
    if (!houseRules?.length) return null;
    
    const displayRules = showAllRules ? houseRules : houseRules.slice(0, 6);
    const hasMore = houseRules.length > 6;

    return (
      <div className="mb-6">
        <SectionHeader>House Rules</SectionHeader>
        <p className="text-sm text-gray-500 mb-4">Please follow these important venue guidelines</p>

        <div className="space-y-2">
          <div className="space-y-1">
            {displayRules.map((rule, index) => (
              <div key={index} className="flex items-start gap-2 py-1">
                <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{rule}</span>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAllRules(!showAllRules)}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium underline"
            >
              {showAllRules ? 'Show less' : `Show all ${houseRules.length}`}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Consistent section header style - Airbnb minimal
  const SectionHeader = ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      {children}
    </h2>
  );

  // Get highlights from multiple possible locations
  const highlights = serviceDetails.highlights ||
                     supplier?.highlights ||
                     supplier?.data?.highlights ||
                     [];

  return (
    <div className="space-y-8">
      {/* About Us Section */}
      {serviceDetails.aboutUs && (
        <div className="mb-6">
          <SectionHeader>About Our Venue</SectionHeader>
          <p className="text-base text-gray-700 leading-relaxed">{serviceDetails.aboutUs}</p>
        </div>
      )}

      {/* Venue Information */}
      <div className="mb-6">
        <SectionHeader>Venue Information</SectionHeader>
          
          {/* Capacity - Minimal inline */}
          {serviceDetails.capacity && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  Up to {serviceDetails.capacity?.max || serviceDetails.capacity?.min || '—'} guests
                </span>
                {serviceDetails.capacity?.seated && (
                  <span className="text-gray-500">· {serviceDetails.capacity.seated} seated</span>
                )}
                {serviceDetails.capacity?.standing && (
                  <span className="text-gray-500">· {serviceDetails.capacity.standing} standing</span>
                )}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {serviceDetails.venueType && (
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Venue Type</h4>
                <p className="text-base text-gray-700">{serviceDetails.venueType}</p>
              </div>
            )}

            {serviceDetails.availability?.minimumBookingHours && (
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Minimum Booking
                </h4>
                <p className="text-base text-gray-700">{serviceDetails.availability.minimumBookingHours} hours</p>
              </div>
            )}

            {/* Tables & Chairs */}
            {(serviceDetails.equipment?.tables || serviceDetails.equipment?.chairs) && (
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Tables & Chairs</h4>
                <div className="text-base text-gray-700">
                  {serviceDetails.equipment.tables && <p>{serviceDetails.equipment.tables} tables</p>}
                  {serviceDetails.equipment.chairs && <p>{serviceDetails.equipment.chairs} chairs</p>}
                </div>
              </div>
            )}
          </div>

          {/* Facilities with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.facilities,
            "Available Facilities",
            null,
            null,
            showAllFacilities,
            setShowAllFacilities,
            8
          )}

          {/* Setup Options with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.setupOptions,
            "Setup Options",
            null,
            null,
            showAllSetupOptions,
            setShowAllSetupOptions,
            6
          )}

          {/* Catering Options with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.cateringOptions,
            "Catering Options",
            null,
            null,
            showAllCateringOptions,
            setShowAllCateringOptions,
            6
          )}

          {renderAgeGroups(serviceDetails.ageGroups)}
      </div>

      {/* Location & Access */}
      {(supplier?.owner?.address || supplier?.venueAddress || serviceDetails?.venueAddress || serviceDetails?.venueDetails) && (
        <div className="mb-6">
          <SectionHeader>Location & Access</SectionHeader>

            {supplier?.owner?.address && (
              <div className="mb-4">
                <h4 className="font-bold text-lg text-gray-900 mb-2">Address</h4>
                <p className="text-base text-gray-700">
                  {supplier.owner.address.street}, {supplier.owner.address.city}, {supplier.owner.address.postcode}
                </p>
              </div>
            )}
            {(supplier?.venueAddress || serviceDetails?.venueAddress) && (
               <div className="mb-4">
               <h4 className="font-bold text-lg text-gray-900 mb-2">Address</h4>
               {(() => {
                 const addr = supplier?.venueAddress || serviceDetails?.venueAddress;
                 const parts = [
                   addr?.addressLine1,
                   addr?.addressLine2,
                   addr?.city,
                   addr?.postcode
                 ].filter(p => p && p.trim());
                 return <p className="text-base text-gray-700">{parts.join(', ')}</p>;
               })()}
             </div>
            )}
            {/* Add the map widget */}
            <MapWidget
              venueAddress={supplier?.venueAddress || serviceDetails?.venueAddress}
              address={supplier?.owner?.address}
              venueName={supplier?.businessName || supplier?.name}
            />

            {serviceDetails.venueDetails && (
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {serviceDetails.venueDetails.parkingInfo && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Parking
                    </h4>
                    <p className="text-base text-gray-700">{serviceDetails.venueDetails.parkingInfo}</p>
                  </div>
                )}

                {serviceDetails.venueDetails.accessInstructions && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Access Instructions</h4>
                    <p className="text-base text-gray-700">{serviceDetails.venueDetails.accessInstructions}</p>
                  </div>
                )}

                {serviceDetails.venueDetails.nearestStation && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Nearest Station</h4>
                    <p className="text-base text-gray-700">{serviceDetails.venueDetails.nearestStation}</p>
                  </div>
                )}

                {serviceDetails.venueDetails.landmarks && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Local Landmarks</h4>
                    <p className="text-base text-gray-700">{serviceDetails.venueDetails.landmarks}</p>
                  </div>
                )}
              </div>
            )}
        </div>
      )}

      {/* Items We Welcome */}
      {renderAllowedItems(serviceDetails.allowedItems)}

      {/* Restricted Items - Simplified colors */}
      {renderRestrictedItems(serviceDetails.restrictedItems)}

      {/* House Rules - Simplified colors */}
      {renderHouseRules(serviceDetails.houseRules)}

      {/* Add-On Services */}
      {renderAddOnServices(serviceDetails.addOnServices)}

      {/* Special Features */}
      {serviceDetails.specialFeatures && (
        <div className="mb-6">
          <SectionHeader>Special Features</SectionHeader>
          <p className="text-base text-gray-700 leading-relaxed">{serviceDetails.specialFeatures}</p>
        </div>
      )}

      {/* Legacy Support */}
      {serviceDetails.aboutService && (
        <div className="mb-6">
          <SectionHeader>About This Venue</SectionHeader>
          <p className="text-base text-gray-700 leading-relaxed">{serviceDetails.aboutService}</p>
        </div>
      )}

      {/* What We Love Section - at the bottom */}
      {highlights.length > 0 && (
        <div className="mb-6">
          <SectionHeader>What We Love</SectionHeader>
          <div className="space-y-3">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3">
                <Star className="w-4 h-4 text-[hsl(var(--primary-500))] flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueDisplay;