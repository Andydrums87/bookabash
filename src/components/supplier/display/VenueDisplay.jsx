// components/supplier/display/VenueDisplay.jsx
// Tagvenue-inspired professional layout for venue details
import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Car,
  Check,
  X as XIcon,
  Gift,
  Star,
  AlertCircle,
  Key,
  Music,
  Truck,
  Wifi,
  Wind,
  Volume2,
  Sun,
  ParkingCircle,
  Accessibility,
  ExternalLink,
  CheckCircle,
  Video,
  View
} from "lucide-react";

// MapWidget component for Google Maps embed
const MapWidget = ({ address, venueAddress, venueName }) => {
  const addressData = venueAddress || address;
  if (!addressData) return null;

  let addressString;
  let businessQuery = '';

  if (venueAddress) {
    const cleanPostcode = venueAddress.postcode?.trim();
    const parts = [
      venueAddress.addressLine1,
      venueAddress.addressLine2,
      venueAddress.city,
      cleanPostcode,
      venueAddress.country
    ].filter(part => part && part.trim() !== '');

    addressString = parts.join(', ');
    if (venueAddress.businessName && venueAddress.businessName.trim()) {
      businessQuery = venueAddress.businessName.trim();
    }
  } else if (address) {
    const cleanPostcode = address.postcode?.trim();
    addressString = `${address.street}, ${address.city}, ${cleanPostcode}`;
  } else {
    return null;
  }

  const queries = [
    addressString || null,
    businessQuery && addressString ? `${businessQuery}, ${addressString}` : null,
    venueAddress ? `${venueAddress.city}, ${venueAddress.postcode?.trim()}` :
                   address ? `${address.city}, ${address.postcode?.trim()}` : null
  ].filter(Boolean);

  const primaryQuery = queries[0];
  if (!primaryQuery) return null;

  const encodedAddress = encodeURIComponent(primaryQuery);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`;
  const displayName = venueAddress?.businessName || venueName || 'venue';

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <iframe
        src={mapSrc}
        width="100%"
        height="280"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing location of ${displayName}`}
      />
      <div className="p-3 bg-gray-50 flex gap-4">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1.5 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Maps
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1.5 font-medium"
        >
          <Car className="w-4 h-4" />
          Get Directions
        </a>
      </div>
    </div>
  );
};

// Section row component - Tagvenue style (label left, content right)
const SectionRow = ({ label, children, className = "" }) => (
  <div className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 md:gap-8 py-6 ${className}`}>
    <div className="text-gray-900 font-semibold text-base">{label}</div>
    <div className="text-gray-700">{children}</div>
  </div>
);

// Feature item with check or X icon
const FeatureItem = ({ text, allowed = true, bold = false }) => (
  <div className="flex items-start gap-2 py-1">
    {allowed ? (
      <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
    ) : (
      <XIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 line-through" />
    )}
    <span className={`${allowed ? 'text-gray-900' : 'text-gray-400 line-through'} ${bold ? 'font-medium' : ''}`}>
      {text}
    </span>
  </div>
);

// Capacity icon component
const CapacityIcon = ({ type }) => {
  const icons = {
    standing: (
      <div className="flex items-end justify-center w-12 h-12 text-gray-400">
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <rect x="5" y="5" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" rx="2"/>
        </svg>
      </div>
    ),
    dining: (
      <div className="flex items-center justify-center w-12 h-12 text-teal-500">
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="20" cy="20" r="8" fill="currentColor" opacity="0.3"/>
          <circle cx="12" cy="10" r="4" fill="currentColor"/>
          <circle cx="28" cy="10" r="4" fill="currentColor"/>
          <circle cx="12" cy="30" r="4" fill="currentColor"/>
          <circle cx="28" cy="30" r="4" fill="currentColor"/>
        </svg>
      </div>
    ),
    cabaret: (
      <div className="flex items-center justify-center w-12 h-12 text-teal-500">
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="10" cy="15" r="3" fill="currentColor"/>
          <circle cx="20" cy="15" r="3" fill="currentColor"/>
          <circle cx="30" cy="15" r="3" fill="currentColor"/>
          <circle cx="10" cy="25" r="3" fill="currentColor"/>
          <circle cx="20" cy="25" r="3" fill="currentColor"/>
          <circle cx="30" cy="25" r="3" fill="currentColor"/>
        </svg>
      </div>
    )
  };
  return icons[type] || icons.standing;
};

const VenueDisplay = ({
  supplier,
  serviceDetails,
  selectedAddons = [],
  onToggleAddon,
  isInteractive = false
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  // Get highlights from multiple possible locations
  const highlights = serviceDetails.highlights ||
                     supplier?.highlights ||
                     supplier?.data?.highlights ||
                     [];

  // Get address
  const venueAddress = supplier?.venueAddress || serviceDetails?.venueAddress;
  const ownerAddress = supplier?.owner?.address;

  const getAddressString = () => {
    if (venueAddress) {
      const parts = [
        venueAddress.addressLine1,
        venueAddress.addressLine2,
        venueAddress.city,
        venueAddress.postcode
      ].filter(p => p && p.trim());
      return parts.join(', ');
    }
    if (ownerAddress) {
      return `${ownerAddress.street}, ${ownerAddress.city}, ${ownerAddress.postcode}`;
    }
    return null;
  };

  // Get capacity data
  const capacity = serviceDetails.capacity;
  const hasCapacity = capacity && (capacity.max > 0 || capacity.seated > 0 || capacity.standing > 0);

  // Get policies
  const policies = serviceDetails.policies || {};

  // Determine catering features
  const cateringOptions = serviceDetails.cateringOptions || [];
  const hasInHouseCatering = cateringOptions.some(o =>
    o.toLowerCase().includes('in-house') || o.toLowerCase().includes('catering available')
  );
  const hasExternalCatering = cateringOptions.some(o =>
    o.toLowerCase().includes('external') || o.toLowerCase().includes('outside food')
  ) || policies.ownFood;
  const hasKitchenAccess = cateringOptions.some(o =>
    o.toLowerCase().includes('kitchen')
  ) || serviceDetails.equipment?.kitchen;
  const hasBar = cateringOptions.some(o =>
    o.toLowerCase().includes('bar') || o.toLowerCase().includes('alcohol')
  ) || policies.alcohol || serviceDetails.equipment?.bar;

  // Build facilities list with icons
  const getFacilityIcon = (facility) => {
    const lower = facility.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (lower.includes('air') || lower.includes('conditioning')) return <Wind className="w-4 h-4" />;
    if (lower.includes('sound') || lower.includes('pa') || lower.includes('speaker')) return <Volume2 className="w-4 h-4" />;
    if (lower.includes('light') || lower.includes('natural')) return <Sun className="w-4 h-4" />;
    if (lower.includes('parking')) return <ParkingCircle className="w-4 h-4" />;
    if (lower.includes('access') || lower.includes('wheelchair')) return <Accessibility className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  // Get add-on category info
  const getCategoryInfo = (category) => {
    const categories = {
      service: { icon: <Gift className="w-4 h-4" />, label: "Additional Service" },
      access: { icon: <Key className="w-4 h-4" />, label: "Facility Access" },
      equipment: { icon: <Music className="w-4 h-4" />, label: "Equipment Rental" },
      premium: { icon: <Star className="w-4 h-4" />, label: "Premium Upgrade" },
      logistics: { icon: <Truck className="w-4 h-4" />, label: "Logistics" },
    };
    return categories[category] || categories.service;
  };

  return (
    <div className="divide-y divide-gray-200">

      {/* About this space */}
      {serviceDetails.aboutUs && (
        <>
          <SectionRow label="About this space">
            <div>
              <p className={`text-gray-700 leading-relaxed ${!showFullDescription && serviceDetails.aboutUs.length > 300 ? 'line-clamp-4' : ''}`}>
                {serviceDetails.aboutUs}
              </p>
              {serviceDetails.aboutUs.length > 300 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-teal-600 hover:text-teal-700 font-medium text-sm mt-2 flex items-center gap-1"
                >
                  {showFullDescription ? (
                    <>- Show less</>
                  ) : (
                    <>+ Show more</>
                  )}
                </button>
              )}
            </div>
          </SectionRow>
        </>
      )}

      {/* Virtual Tour / 360 View */}
      {(serviceDetails.virtualTour || serviceDetails.videoTour) && (
        <SectionRow label="Virtual tour">
          <div className="space-y-4">
            {/* 360 Tour Embed (Momento360, Matterport, etc.) */}
            {serviceDetails.virtualTour && (
              <div>
                <div className="flex items-center gap-2 text-gray-900 font-medium mb-3">
                  <View className="w-5 h-5 text-teal-500" />
                  360° Tour
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    src={serviceDetails.virtualTour}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="360° Virtual Tour"
                  />
                </div>
              </div>
            )}

            {/* Video Tour (YouTube, Vimeo, etc.) */}
            {serviceDetails.videoTour && (
              <div>
                <div className="flex items-center gap-2 text-gray-900 font-medium mb-3">
                  <Video className="w-5 h-5 text-teal-500" />
                  Video Tour
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video">
                  <iframe
                    src={serviceDetails.videoTour}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Video Tour"
                  />
                </div>
              </div>
            )}
          </div>
        </SectionRow>
      )}

      {/* Capacity */}
      {hasCapacity && (
        <SectionRow label="Capacity">
          <div className="flex flex-wrap gap-8">
            {capacity.standing && (
              <div className="flex items-center gap-3">
                <CapacityIcon type="standing" />
                <div>
                  <div className="text-gray-500 text-sm">Standing</div>
                  <div className="font-semibold text-gray-900">up to {capacity.standing}</div>
                </div>
              </div>
            )}
            {capacity.seated && (
              <div className="flex items-center gap-3">
                <CapacityIcon type="dining" />
                <div>
                  <div className="text-gray-500 text-sm">Dining</div>
                  <div className="font-semibold text-gray-900">up to {capacity.seated}</div>
                </div>
              </div>
            )}
            {capacity.max && !capacity.seated && !capacity.standing && (
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-teal-500" />
                <div>
                  <div className="text-gray-500 text-sm">Maximum</div>
                  <div className="font-semibold text-gray-900">up to {capacity.max}</div>
                </div>
              </div>
            )}
          </div>
        </SectionRow>
      )}

      {/* Catering and drinks */}
      {(cateringOptions.length > 0 || hasBar || hasKitchenAccess) && (
        <SectionRow label="Catering and drinks">
          <div className="space-y-4">
            {/* Main catering options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {hasInHouseCatering && (
                <FeatureItem text="In-house catering available" allowed={true} bold={true} />
              )}
              {hasKitchenAccess && (
                <FeatureItem text="Kitchen access available" allowed={true} />
              )}
              {hasExternalCatering ? (
                <FeatureItem text="External catering allowed" allowed={true} />
              ) : (
                <FeatureItem text="No external catering allowed" allowed={false} />
              )}
              {hasBar && (
                <FeatureItem text="Venue provides alcohol" allowed={true} bold={true} />
              )}
              {policies.alcohol === false && (
                <FeatureItem text="No BYO alcohol allowed" allowed={false} />
              )}
            </div>

            {/* Additional catering details */}
            {cateringOptions.length > 0 && (
              <div className="pt-2">
                {cateringOptions.filter(o =>
                  !o.toLowerCase().includes('in-house') &&
                  !o.toLowerCase().includes('external') &&
                  !o.toLowerCase().includes('kitchen') &&
                  !o.toLowerCase().includes('bar')
                ).map((option, idx) => (
                  <FeatureItem key={idx} text={option} allowed={true} />
                ))}
              </div>
            )}
          </div>
        </SectionRow>
      )}

      {/* Facilities */}
      {serviceDetails.facilities?.length > 0 && (
        <SectionRow label="Facilities">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {(showAllFacilities ? serviceDetails.facilities : serviceDetails.facilities.slice(0, 6)).map((facility, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  <span className="text-teal-500">{getFacilityIcon(facility)}</span>
                  <span>{facility}</span>
                </div>
              ))}
            </div>
            {serviceDetails.facilities.length > 6 && (
              <button
                onClick={() => setShowAllFacilities(!showAllFacilities)}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm mt-3 flex items-center gap-1"
              >
                {showAllFacilities ? (
                  <>- Show less</>
                ) : (
                  <>+ Show all {serviceDetails.facilities.length} facilities</>
                )}
              </button>
            )}
          </div>
        </SectionRow>
      )}

      {/* Rules of the space */}
      {(serviceDetails.houseRules?.length > 0 || serviceDetails.restrictedItems?.length > 0 || serviceDetails.allowedItems?.length > 0) && (
        <SectionRow label="Rules of the space">
          <div className="space-y-6">
            {/* Allowed items */}
            {serviceDetails.allowedItems?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Items welcome</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  {serviceDetails.allowedItems.map((item, idx) => (
                    <FeatureItem key={idx} text={item} allowed={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Restricted items */}
            {serviceDetails.restrictedItems?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Not permitted</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  {serviceDetails.restrictedItems.map((item, idx) => (
                    <FeatureItem key={idx} text={item} allowed={false} />
                  ))}
                </div>
              </div>
            )}

            {/* House rules */}
            {serviceDetails.houseRules?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">House rules</h4>
                <div className="space-y-1">
                  {serviceDetails.houseRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 py-1">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionRow>
      )}

      {/* Accessibility */}
      {serviceDetails.facilities?.some(f =>
        f.toLowerCase().includes('access') ||
        f.toLowerCase().includes('wheelchair') ||
        f.toLowerCase().includes('lift') ||
        f.toLowerCase().includes('ground')
      ) && (
        <SectionRow label="Accessibility">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {serviceDetails.facilities.filter(f =>
              f.toLowerCase().includes('access') ||
              f.toLowerCase().includes('wheelchair') ||
              f.toLowerCase().includes('lift') ||
              f.toLowerCase().includes('ground') ||
              f.toLowerCase().includes('toilet') ||
              f.toLowerCase().includes('parking')
            ).map((facility, idx) => (
              <FeatureItem key={idx} text={facility} allowed={true} />
            ))}
          </div>
        </SectionRow>
      )}

      {/* Booking info */}
      {(serviceDetails.availability?.minimumBookingHours || serviceDetails.pricing?.setupTime || serviceDetails.pricing?.cleanupTime) && (
        <SectionRow label="Booking info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {serviceDetails.availability?.minimumBookingHours && (
              <div>
                <div className="text-gray-500 text-sm">Minimum booking</div>
                <div className="font-medium text-gray-900">{serviceDetails.availability.minimumBookingHours} hours</div>
              </div>
            )}
            {serviceDetails.pricing?.setupTime && (
              <div>
                <div className="text-gray-500 text-sm">Setup time included</div>
                <div className="font-medium text-gray-900">{serviceDetails.pricing.setupTime} minutes</div>
              </div>
            )}
            {serviceDetails.pricing?.cleanupTime && (
              <div>
                <div className="text-gray-500 text-sm">Cleanup time included</div>
                <div className="font-medium text-gray-900">{serviceDetails.pricing.cleanupTime} minutes</div>
              </div>
            )}
          </div>
        </SectionRow>
      )}

      {/* Location */}
      {(venueAddress || ownerAddress || serviceDetails.venueDetails) && (
        <SectionRow label="Location">
          <div className="space-y-4">
            {/* Address */}
            {getAddressString() && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">{getAddressString()}</p>
                  {(venueAddress?.city || ownerAddress?.city) && (
                    <p className="text-gray-500 text-sm">{venueAddress?.city || ownerAddress?.city}</p>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            <MapWidget
              venueAddress={venueAddress}
              address={ownerAddress}
              venueName={supplier?.businessName || supplier?.name}
            />

            {/* Additional location details */}
            {serviceDetails.venueDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {serviceDetails.venueDetails.parkingInfo && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-900 font-medium mb-1">
                      <Car className="w-4 h-4 text-gray-400" />
                      Parking
                    </div>
                    <p className="text-gray-600 text-sm">{serviceDetails.venueDetails.parkingInfo}</p>
                  </div>
                )}
                {serviceDetails.venueDetails.nearestStation && (
                  <div>
                    <div className="text-gray-900 font-medium mb-1">Nearest station</div>
                    <p className="text-gray-600 text-sm">{serviceDetails.venueDetails.nearestStation}</p>
                  </div>
                )}
                {serviceDetails.venueDetails.accessInstructions && (
                  <div className="sm:col-span-2">
                    <div className="text-gray-900 font-medium mb-1">Access instructions</div>
                    <p className="text-gray-600 text-sm">{serviceDetails.venueDetails.accessInstructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </SectionRow>
      )}

      {/* Additional Services / Add-ons */}
      {serviceDetails.addOnServices?.length > 0 && (
        <SectionRow label="Additional services">
          <div>
            <p className="text-gray-600 mb-4">
              {isInteractive ? 'Tap to add extras to your booking' : 'Optional extras available with your booking'}
            </p>

            {/* Horizontal scrolling container */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-4 min-w-max">
                {serviceDetails.addOnServices.map((addon, index) => {
                  const categoryInfo = getCategoryInfo(addon.category);
                  const addonId = addon.id || `addon-${index}`;
                  const isSelected = selectedAddons.some(a => (a.id || a) === addonId);

                  return (
                    <div
                      key={addonId}
                      className={`flex-shrink-0 w-64 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={isSelected ? 'text-teal-600' : 'text-gray-400'}>
                              {categoryInfo.icon}
                            </span>
                            <h4 className="font-semibold text-gray-900 text-sm">{addon.name}</h4>
                          </div>
                          <span className={`font-bold ${isSelected ? 'text-teal-600' : 'text-gray-900'}`}>
                            +£{addon.price}
                          </span>
                        </div>
                        {addon.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">{addon.description}</p>
                        )}
                      </div>

                      {/* CTA Button - only show when interactive */}
                      {isInteractive && (
                        <button
                          onClick={() => onToggleAddon && onToggleAddon(addon)}
                          className={`w-full py-2.5 px-4 font-medium text-sm transition-all flex items-center justify-center gap-2 border-t ${
                            isSelected
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Added
                            </>
                          ) : (
                            'Add to booking'
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {serviceDetails.addOnServices.length > 2 && (
              <p className="text-sm text-gray-500 mt-2">
                Scroll to see all {serviceDetails.addOnServices.length} services →
              </p>
            )}
          </div>
        </SectionRow>
      )}

      {/* Special Features */}
      {serviceDetails.specialFeatures && (
        <SectionRow label="Special features">
          <p className="text-gray-700 leading-relaxed">{serviceDetails.specialFeatures}</p>
        </SectionRow>
      )}

      {/* What We Love / Highlights */}
      {highlights.length > 0 && (
        <SectionRow label="What we love">
          <div className="space-y-2">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{highlight}</p>
              </div>
            ))}
          </div>
        </SectionRow>
      )}

      {/* Venue Type - only show if we have type but no other info displayed it */}
      {serviceDetails.venueType && !hasCapacity && (
        <SectionRow label="Venue type">
          <span className="text-gray-900">{serviceDetails.venueType}</span>
        </SectionRow>
      )}

      {/* Equipment */}
      {(serviceDetails.equipment?.tables || serviceDetails.equipment?.chairs) && (
        <SectionRow label="Equipment included">
          <div className="flex flex-wrap gap-6">
            {serviceDetails.equipment.tables && (
              <div className="text-gray-700">
                <span className="font-medium">{serviceDetails.equipment.tables}</span> tables
              </div>
            )}
            {serviceDetails.equipment.chairs && (
              <div className="text-gray-700">
                <span className="font-medium">{serviceDetails.equipment.chairs}</span> chairs
              </div>
            )}
            {serviceDetails.equipment.soundSystem && (
              <div className="text-gray-700">Sound system</div>
            )}
            {serviceDetails.equipment.projector && (
              <div className="text-gray-700">Projector</div>
            )}
          </div>
        </SectionRow>
      )}

      {/* Setup Options */}
      {serviceDetails.setupOptions?.length > 0 && (
        <SectionRow label="Setup options">
          <div className="flex flex-wrap gap-2">
            {serviceDetails.setupOptions.map((option, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                {option}
              </span>
            ))}
          </div>
        </SectionRow>
      )}

      {/* Age Groups */}
      {serviceDetails.ageGroups?.length > 0 && (
        <SectionRow label="Suitable for">
          <div className="flex flex-wrap gap-2">
            {serviceDetails.ageGroups.map((age, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                {age}
              </span>
            ))}
          </div>
        </SectionRow>
      )}

      {/* Legacy Support - About Service */}
      {serviceDetails.aboutService && !serviceDetails.aboutUs && (
        <SectionRow label="About this venue">
          <p className="text-gray-700 leading-relaxed">{serviceDetails.aboutService}</p>
        </SectionRow>
      )}
    </div>
  );
};

export default VenueDisplay;
