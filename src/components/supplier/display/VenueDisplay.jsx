// components/supplier/display/VenueDisplay.jsx
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building,
  MapPin,
  DollarSign,
  Users,
  Settings,
  Car,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
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

  // Handle different address formats
  let addressString;
  
  if (venueAddress) {
    // New venueAddress format: { addressLine1, addressLine2, city, postcode, country }
    const parts = [
      venueAddress.addressLine1,
      venueAddress.addressLine2,
      venueAddress.city,
      venueAddress.postcode,
      venueAddress.country
    ].filter(Boolean); // Remove empty strings
    
    addressString = parts.join(', ');
  } else if (address) {
    // Original address format: { street, city, postcode }
    addressString = `${address.street}, ${address.city}, ${address.postcode}`;
  } else {
    return null;
  }

  const encodedAddress = encodeURIComponent(addressString);
  
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


const VenueDisplay = ({ supplier, serviceDetails }) => {

  // State for expandable sections
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [showAllSetupOptions, setShowAllSetupOptions] = useState(false);
  const [showAllCateringOptions, setShowAllCateringOptions] = useState(false);
  const [showAllRestrictions, setShowAllRestrictions] = useState(false);
  const [showAllRules, setShowAllRules] = useState(false);



  // Helper function to render expandable badge list
  const renderExpandableBadges = (items, title, icon, colorClass, showAll, setShowAll, maxInitial = 6) => {
    if (!items?.length) return null;
    
    const displayItems = showAll ? items : items.slice(0, maxInitial);
    const hasMore = items.length > maxInitial;
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
          {icon && <span className="w-4 h-4">{icon}</span>}
          {title}
          {items.length > 0 && (
            <span className="text-sm text-gray-500 font-normal">({items.length})</span>
          )}
        </h4>
        
        <div className="space-y-3">
          {/* Grid layout for better organization */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayItems.map((item, index) => (
              <Badge key={index} variant="outline" className={`${colorClass} justify-center text-center`}>
                {item}
              </Badge>
            ))}
          </div>
          
          {/* Show more/less button */}
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show {items.length - maxInitial} more
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render age groups
  const renderAgeGroups = (ageGroups) => {
    if (!ageGroups?.length) return null;
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Suitable Age Groups</h4>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((age, index) => (
            <Badge key={index} variant="outline" className="text-slate-700 border-slate-300 bg-slate-50">
              {age}
            </Badge>
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
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary-500" />
            Additional Services Available
          </h2>
          <p className="text-gray-600 mb-4">Optional extras you can add to enhance your booking</p>
          
          {/* Horizontal scrolling container */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 min-w-max">
              {addOnServices.map((addon, index) => {
                const categoryInfo = getCategoryInfo(addon.category);
                
                return (
                  <div key={index} className="flex-shrink-0 w-72 p-4 bg-white border border-[hsl(var(--primary-500))] rounded-lg hover:bg-primary-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-primary-500">
                          {categoryInfo.icon}
                        </div>
                        <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                      </div>
                      <span className="font-bold text-primary-600 text-lg">£{addon.price}</span>
                    </div>
                    {addon.description && (
                      <p className="text-gray-700 text-sm mt-2">{addon.description}</p>
                    )}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs text-primary-700 border-primary-300 bg-primary-100">
                        {addon.category === 'service' && 'Additional Service'}
                        {addon.category === 'access' && 'Facility Access'}
                        {addon.category === 'equipment' && 'Equipment Rental'}
                        {addon.category === 'premium' && 'Premium Upgrade'}
                        {addon.category === 'logistics' && 'Logistics'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Scroll indicator */}
          {addOnServices.length > 2 && (
            <p className="text-xs text-primary-600 mt-2 text-center">
              Scroll horizontally to see all {addOnServices.length} services
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  // Helper function to render restricted items (simplified colors)
  const renderRestrictedItems = (restrictedItems) => {
    if (!restrictedItems?.length) return null;
    
    const displayItems = showAllRestrictions ? restrictedItems : restrictedItems.slice(0, 8);
    const hasMore = restrictedItems.length > 8;

    return (
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ban className="w-5 h-5 text-gray-600" />
            Items Not Permitted
          </h2>
          <p className="text-gray-600 mb-4">Please note these items are not allowed at this venue</p>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {displayItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Ban className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-800 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllRestrictions(!showAllRestrictions)}
                className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
              >
                {showAllRestrictions ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show less restrictions
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show {restrictedItems.length - 8} more restrictions
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to render house rules (simplified colors)
  const renderHouseRules = (houseRules) => {
    if (!houseRules?.length) return null;
    
    const displayRules = showAllRules ? houseRules : houseRules.slice(0, 6);
    const hasMore = houseRules.length > 6;

    return (
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
            House Rules
          </h2>
          <p className="text-gray-600 mb-4">Please follow these important venue guidelines</p>
          
          <div className="space-y-3">
            <div className="space-y-2">
              {displayRules.map((rule, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900 text-sm">{rule}</span>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllRules(!showAllRules)}
                className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
              >
                {showAllRules ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show fewer rules
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show {houseRules.length - 6} more rules
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* About Us Section */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-gray-600" />
            About Our Venue
          </h2>
          
          {serviceDetails.aboutUs && (
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{serviceDetails.aboutUs}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Venue Information */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-gray-600" />
            Venue Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {serviceDetails.venueType && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Venue Type</h4>
                <p className="text-gray-700">{serviceDetails.venueType}</p>
              </div>
            )}
            
            {serviceDetails.capacity && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Capacity
                </h4>
                <div className="text-gray-700">
                  {serviceDetails.capacity?.min && serviceDetails.capacity?.max ? (
                    <p>{serviceDetails.capacity.min}-{serviceDetails.capacity.max} guests</p>
                  ) : serviceDetails.capacity?.max ? (
                    <p>Up to {serviceDetails.capacity.max} guests</p>
                  ) : (
                    <p>Capacity information available</p>
                  )}
                  
                  {serviceDetails.capacity?.seated && (
                    <p className="text-sm text-gray-600 mt-1">
                      {serviceDetails.capacity.seated} seated
                    </p>
                  )}
                  
                  {serviceDetails.capacity?.standing && (
                    <p className="text-sm text-gray-600">
                      {serviceDetails.capacity.standing} standing
                    </p>
                  )}
                </div>
              </div>
            )}

            {serviceDetails.availability?.minimumBookingHours && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Minimum Booking
                </h4>
                <p className="text-gray-700">{serviceDetails.availability.minimumBookingHours} hours</p>
              </div>
            )}
          </div>

          {/* Facilities with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.facilities,
            "Available Facilities",
            <Settings className="w-4 h-4" />,
            "text-gray-700 border-gray-300 bg-gray-50",
            showAllFacilities,
            setShowAllFacilities,
            8
          )}

          {/* Setup Options with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.setupOptions,
            "Setup Options",
            <Settings className="w-4 h-4" />,
            "text-gray-700 border-gray-300 bg-gray-50",
            showAllSetupOptions,
            setShowAllSetupOptions,
            6
          )}

          {/* Catering Options with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.cateringOptions,
            "Catering Options",
            <Sparkles className="w-4 h-4" />,
            "text-gray-700 border-gray-300 bg-gray-50",
            showAllCateringOptions,
            setShowAllCateringOptions,
            6
          )}

          {renderAgeGroups(serviceDetails.ageGroups)}
        </CardContent>
      </Card>

      {/* Location & Access */}
      {(supplier?.owner?.address || serviceDetails.venueDetails) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              Location & Access
            </h2>
            
            {supplier?.owner?.address && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                <p className="text-gray-800">
                  {supplier.owner.address.street}, {supplier.owner.address.city}, {supplier.owner.address.postcode}
                </p>
              </div>
            )}
            {/* Add the map widget */}
<MapWidget 
  address={supplier?.venueAddress || supplier?.owner?.address} 
  venueName={supplier?.businessName || supplier?.name}
/>

            {serviceDetails.venueDetails && (
              <div className="grid md:grid-cols-2 gap-6">
                {serviceDetails.venueDetails.parkingInfo && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      Parking
                    </h4>
                    <p className="text-gray-700">{serviceDetails.venueDetails.parkingInfo}</p>
                  </div>
                )}
                
                {serviceDetails.venueDetails.accessInstructions && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Access Instructions</h4>
                    <p className="text-gray-700">{serviceDetails.venueDetails.accessInstructions}</p>
                  </div>
                )}

                {serviceDetails.venueDetails.nearestStation && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Nearest Station</h4>
                    <p className="text-gray-700">{serviceDetails.venueDetails.nearestStation}</p>
                  </div>
                )}

                {serviceDetails.venueDetails.landmarks && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Local Landmarks</h4>
                    <p className="text-gray-700">{serviceDetails.venueDetails.landmarks}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment & Tables */}
      {serviceDetails.equipment && Object.keys(serviceDetails.equipment).some(key => serviceDetails.equipment[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Equipment & Setup
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {(serviceDetails.equipment.tables || serviceDetails.equipment.chairs) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Available Equipment</h4>
                  {serviceDetails.equipment.tables && (
                    <p className="text-gray-700">Tables: {serviceDetails.equipment.tables}</p>
                  )}
                  {serviceDetails.equipment.chairs && (
                    <p className="text-gray-700">Chairs: {serviceDetails.equipment.chairs}</p>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Equipment Available</h4>
                <div className="space-y-1">
                  {serviceDetails.equipment.soundSystem && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Sound System
                    </p>
                  )}
                  {serviceDetails.equipment.projector && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Projector/Screen
                    </p>
                  )}
                  {serviceDetails.equipment.kitchen && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Kitchen Access
                    </p>
                  )}
                  {serviceDetails.equipment.bar && (
                    <p className="text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Bar Facilities
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Venue Policies */}
      {serviceDetails.policies && Object.keys(serviceDetails.policies).some(key => serviceDetails.policies[key] !== undefined) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Venue Policies</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {serviceDetails.policies.ownFood !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {serviceDetails.policies.ownFood ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-gray-700">External food & catering allowed</span>
                </div>
              )}
              
              {serviceDetails.policies.ownDecorations !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {serviceDetails.policies.ownDecorations ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-gray-700">Own decorations allowed</span>
                </div>
              )}
              
              {serviceDetails.policies.alcohol !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {serviceDetails.policies.alcohol ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-gray-700">Alcohol permitted</span>
                </div>
              )}
              
              {serviceDetails.policies.music !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {serviceDetails.policies.music ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-gray-700">Music/Entertainment allowed</span>
                </div>
              )}

              {serviceDetails.policies.childSupervision !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {serviceDetails.policies.childSupervision ? (
                    <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                  <span className="text-gray-700">
                    {serviceDetails.policies.childSupervision 
                      ? "Adult supervision required for children" 
                      : "No supervision requirement"}
                  </span>
                </div>
              )}
            </div>

            {serviceDetails.policies.endTime && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Event End Time
                </h4>
                <p className="text-gray-800">
                  Events must end by {serviceDetails.policies.endTime === 'flexible' ? 'flexible times (arranged with venue)' : serviceDetails.policies.endTime}
                </p>
              </div>
            )}

            {serviceDetails.bookingTerms && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">Booking Terms & Conditions</h4>
                <p className="text-gray-700 text-sm">{serviceDetails.bookingTerms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add-on Services - Now with horizontal scrolling */}
      {renderAddOnServices(serviceDetails.addOnServices)}

      {/* Restricted Items - Simplified colors */}
      {renderRestrictedItems(serviceDetails.restrictedItems)}

      {/* House Rules - Simplified colors */}
      {renderHouseRules(serviceDetails.houseRules)}

      {/* Special Features */}
      {serviceDetails.specialFeatures && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Special Features</h2>
            <p className="text-gray-700 leading-relaxed">{serviceDetails.specialFeatures}</p>
          </CardContent>
        </Card>
      )}

      {/* Legacy Support */}
      {serviceDetails.aboutService && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Venue</h2>
            <p className="text-gray-700 leading-relaxed text-base">{serviceDetails.aboutService}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VenueDisplay;