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
  ChevronUp
} from "lucide-react";

const VenueDisplay = ({ supplier, serviceDetails }) => {

  // State for expandable sections
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [showAllSetupOptions, setShowAllSetupOptions] = useState(false);
  const [showAllCateringOptions, setShowAllCateringOptions] = useState(false);

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

  // Helper function to render add-on services
  const renderAddOnServices = (addOnServices) => {
    if (!addOnServices?.length) return null;
    return (
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Additional Services
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {addOnServices.map((addon, index) => (
              <div key={index} className="p-4 bg-teal-50 border border-teal-300 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                  <span className="font-bold text-teal-600">£{addon.price}</span>
                </div>
                {addon.description && (
                  <p className="text-gray-700 text-sm">{addon.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
        <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-green-600" />
            About Us
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {serviceDetails.aboutUs && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Venue Type</h4>
                <p className="text-gray-700">{serviceDetails.aboutUs}</p>
              </div>
            )}
            
          
          </div>

        </CardContent>
      </Card>
      {/* Venue Information */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-green-600" />
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
            "text-green-700 border-green-300 bg-green-50",
            showAllFacilities,
            setShowAllFacilities,
            8
          )}

          {/* Setup Options with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.setupOptions,
            "Setup Options",
            <Settings className="w-4 h-4" />,
            "text-teal-700 border-teal-300 bg-teal-50",
            showAllSetupOptions,
            setShowAllSetupOptions,
            6
          )}

          {/* Catering Options with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.cateringOptions,
            "Catering Options",
            <Sparkles className="w-4 h-4" />,
            "text-primary-700 border-[hsl(var(--primary-300))] bg-primary-50",
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
              <MapPin className="w-5 h-5 text-blue-600" />
              Location & Access
            </h2>
            
            {supplier?.owner?.address && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Address</h4>
                <p className="text-blue-800">
                  {supplier.owner.address.street}, {supplier.owner.address.city}, {supplier.owner.address.postcode}
                </p>
              </div>
            )}

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

      {/* Pricing */}
      {serviceDetails.pricing && Object.keys(serviceDetails.pricing).some(key => serviceDetails.pricing[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              Pricing
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {serviceDetails.pricing.hourlyRate && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">£{serviceDetails.pricing.hourlyRate}</div>
                  <div className="text-yellow-600">per hour</div>
                </div>
              )}
              
              {serviceDetails.pricing.halfDayRate && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">£{serviceDetails.pricing.halfDayRate}</div>
                  <div className="text-yellow-600">half day</div>
                </div>
              )}
              
              {serviceDetails.pricing.fullDayRate && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">£{serviceDetails.pricing.fullDayRate}</div>
                  <div className="text-yellow-600">full day</div>
                </div>
              )}
            </div>

            {/* Additional Fees */}
            {(serviceDetails.pricing.cleaningFee || serviceDetails.pricing.securityDeposit || serviceDetails.pricing.minimumSpend) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Additional Fees</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                  {serviceDetails.pricing.cleaningFee && (
                    <p>Cleaning fee: £{serviceDetails.pricing.cleaningFee}</p>
                  )}
                  {serviceDetails.pricing.securityDeposit && (
                    <p>Security deposit: £{serviceDetails.pricing.securityDeposit}</p>
                  )}
                  {serviceDetails.pricing.minimumSpend && (
                    <p>Minimum spend: £{serviceDetails.pricing.minimumSpend}</p>
                  )}
                </div>
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
              <Settings className="w-5 h-5 text-indigo-600" />
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
                    <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
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
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Event End Time
                </h4>
                <p className="text-blue-800">
                  Events must end by {serviceDetails.policies.endTime === 'flexible' ? 'flexible times (arranged with venue)' : serviceDetails.policies.endTime}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Special Features */}
      {serviceDetails.specialFeatures && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Special Features</h2>
            <p className="text-gray-700 leading-relaxed">{serviceDetails.specialFeatures}</p>
          </CardContent>
        </Card>
      )}

      {/* Add-on Services */}
      {renderAddOnServices(serviceDetails.addOnServices)}

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