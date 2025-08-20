// components/supplier/display/ActivitiesDisplay.jsx
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap,
  Shield,
  Wind,
  Users,
  Ruler,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Truck,
  Award,
  Sparkles,
  Home,
  MapPin,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const ActivitiesDisplay = ({ supplier, serviceDetails }) => {
  
  // State for expandable sections
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [showAllCapacities, setShowAllCapacities] = useState(false);

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
            Add-on Services
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
      {/* Equipment & Services */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-teal-600" />
            Equipment & Services
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {serviceDetails.businessType && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Business Type</h4>
                <p className="text-gray-700">{serviceDetails.businessType}</p>
              </div>
            )}

            {serviceDetails.deliveryRadius && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Delivery Area
                </h4>
                <p className="text-gray-700">{serviceDetails.deliveryRadius} mile radius</p>
              </div>
            )}

            {serviceDetails.setupRequirements && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  Space Required
                </h4>
                <p className="text-gray-700">
                  {serviceDetails.setupRequirements.spaceWidth}ft × {serviceDetails.setupRequirements.spaceLength}ft
                  {serviceDetails.setupRequirements.spaceHeight && ` × ${serviceDetails.setupRequirements.spaceHeight}ft height`}
                </p>
              </div>
            )}

            {serviceDetails.setupRequirements?.accessWidth && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Access Width Required</h4>
                <p className="text-gray-700">{serviceDetails.setupRequirements.accessWidth}ft minimum width</p>
              </div>
            )}
          </div>

          {/* Equipment Types with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.castleTypes,
            "Equipment Types",
            <Home className="w-4 h-4" />,
            "text-teal-700 border-teal-300 bg-teal-50",
            showAllTypes,
            setShowAllTypes,
            6
          )}

          {/* Themes with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.themes,
            "Available Themes",
            <Sparkles className="w-4 h-4" />,
            "text-primary-700 border-[hsl(var(--primary-300))] bg-primary-50",
            showAllThemes,
            setShowAllThemes,
            8
          )}

          {/* Capacity Options with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.capacities,
            "Capacity Options",
            <Users className="w-4 h-4" />,
            "text-green-700 border-green-300 bg-green-50",
            showAllCapacities,
            setShowAllCapacities,
            6
          )}

          {renderAgeGroups(serviceDetails.ageGroups)}
        </CardContent>
      </Card>

      {/* Setup Requirements & Space Needs */}
      {serviceDetails.setupRequirements && Object.keys(serviceDetails.setupRequirements).some(key => serviceDetails.setupRequirements[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-green-600" />
              Setup Requirements
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Ground Requirements</h4>
                <div className="space-y-2">
                  {serviceDetails.setupRequirements.levelGround && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Level ground required</span>
                    </div>
                  )}
                  
                  {serviceDetails.setupRequirements.nearPower && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Power supply within 50m</span>
                    </div>
                  )}
                </div>
              </div>

              {serviceDetails.setupRequirements.surfaceTypes?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Suitable Surfaces</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.setupRequirements.surfaceTypes.map((surface, index) => (
                      <Badge key={index} variant="outline" className="text-slate-700 border-slate-300 bg-slate-50">
                        {surface}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Features & Standards */}
      {serviceDetails.safetyFeatures?.length > 0 && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Safety Features & Standards
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {serviceDetails.safetyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Policies & Limits */}
      {serviceDetails.weatherPolicies && Object.keys(serviceDetails.weatherPolicies).some(key => serviceDetails.weatherPolicies[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wind className="w-5 h-5 text-cyan-600" />
              Weather Policies & Safety Limits
            </h2>
            
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <div className="grid md:grid-cols-2 gap-6">
                {serviceDetails.weatherPolicies.windLimit && (
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-2 flex items-center gap-1">
                      <Wind className="w-4 h-4" />
                      Wind Limit
                    </h4>
                    <p className="text-cyan-800">Maximum {serviceDetails.weatherPolicies.windLimit}mph</p>
                    <p className="text-xs text-cyan-700 mt-1">Equipment cannot be used above this wind speed</p>
                  </div>
                )}
                
                {serviceDetails.weatherPolicies.rainPolicy && (
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-2">Rain Policy</h4>
                    <p className="text-cyan-800 capitalize">
                      {serviceDetails.weatherPolicies.rainPolicy.replace('_', ' ')}
                    </p>
                  </div>
                )}

                {(serviceDetails.weatherPolicies.temperatureMin || serviceDetails.weatherPolicies.temperatureMax) && (
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-2">Temperature Range</h4>
                    <p className="text-cyan-800">
                      {serviceDetails.weatherPolicies.temperatureMin && serviceDetails.weatherPolicies.temperatureMax
                        ? `${serviceDetails.weatherPolicies.temperatureMin}°C to ${serviceDetails.weatherPolicies.temperatureMax}°C`
                        : serviceDetails.weatherPolicies.temperatureMin
                          ? `Above ${serviceDetails.weatherPolicies.temperatureMin}°C`
                          : `Below ${serviceDetails.weatherPolicies.temperatureMax}°C`
                      }
                    </p>
                  </div>
                )}

                {serviceDetails.weatherPolicies.indoorAvailable && (
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-2">Indoor Alternative</h4>
                    <p className="text-cyan-800">Indoor equipment available for poor weather</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing */}
      {serviceDetails.pricing?.dailyRates && Object.keys(serviceDetails.pricing.dailyRates).some(key => serviceDetails.pricing.dailyRates[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              Daily Hire Rates
            </h2>
            
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              {serviceDetails.pricing.dailyRates.small && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-lg font-bold text-yellow-700">£{serviceDetails.pricing.dailyRates.small}</div>
                  <div className="text-yellow-600">Small</div>
                </div>
              )}
              
              {serviceDetails.pricing.dailyRates.medium && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-lg font-bold text-yellow-700">£{serviceDetails.pricing.dailyRates.medium}</div>
                  <div className="text-yellow-600">Medium</div>
                </div>
              )}
              
              {serviceDetails.pricing.dailyRates.large && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-lg font-bold text-yellow-700">£{serviceDetails.pricing.dailyRates.large}</div>
                  <div className="text-yellow-600">Large</div>
                </div>
              )}
              
              {serviceDetails.pricing.dailyRates.extra_large && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-lg font-bold text-yellow-700">£{serviceDetails.pricing.dailyRates.extra_large}</div>
                  <div className="text-yellow-600">Extra Large</div>
                </div>
              )}
            </div>
            
            {/* Additional Fees */}
            {(serviceDetails.pricing.deliveryFee || serviceDetails.pricing.weekendSurcharge || serviceDetails.pricing.setupFee) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Additional Fees</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                  {serviceDetails.pricing.deliveryFee && (
                    <p>Delivery: £{serviceDetails.pricing.deliveryFee}</p>
                  )}
                  {serviceDetails.pricing.setupFee && (
                    <p>Setup: £{serviceDetails.pricing.setupFee}</p>
                  )}
                  {serviceDetails.pricing.weekendSurcharge && (
                    <p>Weekend surcharge: £{serviceDetails.pricing.weekendSurcharge}</p>
                  )}
                  {serviceDetails.pricing.holidaySurcharge && (
                    <p>Holiday surcharge: £{serviceDetails.pricing.holidaySurcharge}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Details & What's Included */}
      {serviceDetails.serviceDetails && Object.keys(serviceDetails.serviceDetails).some(key => serviceDetails.serviceDetails[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              Service Details & What's Included
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {serviceDetails.serviceDetails.deliveryIncluded !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceDetails.deliveryIncluded ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Delivery included in price</span>
                </div>
              )}
              
              {serviceDetails.serviceDetails.setupIncluded !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceDetails.setupIncluded ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Setup service included</span>
                </div>
              )}
              
              {serviceDetails.serviceDetails.collectionIncluded !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceDetails.collectionIncluded ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Collection service included</span>
                </div>
              )}
              
              {serviceDetails.serviceDetails.cleaningIncluded !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceDetails.cleaningIncluded ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Cleaning after use included</span>
                </div>
              )}
              
              {serviceDetails.serviceDetails.supervisionProvided !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {serviceDetails.serviceDetails.supervisionProvided ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                  <span className="text-gray-700">
                    {serviceDetails.serviceDetails.supervisionProvided 
                      ? 'Supervision/attendant provided' 
                      : 'Adult supervision required'}
                  </span>
                </div>
              )}
              
              {serviceDetails.serviceDetails.insuranceIncluded !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceDetails.insuranceIncluded ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Public liability insurance included</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Information & Credentials */}
      {serviceDetails.businessInfo && Object.keys(serviceDetails.businessInfo).some(key => serviceDetails.businessInfo[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Business Information & Credentials
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {serviceDetails.businessInfo.yearsExperience && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Years in Business</h4>
                  <p className="text-gray-700">{serviceDetails.businessInfo.yearsExperience} years</p>
                </div>
              )}
              
              {serviceDetails.businessInfo.testingFrequency && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Equipment Testing</h4>
                  <p className="text-gray-700 capitalize">{serviceDetails.businessInfo.testingFrequency.replace('_', ' ')}</p>
                </div>
              )}
            </div>

            {serviceDetails.businessInfo.certifications?.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Certifications & Memberships</h4>
                <div className="flex flex-wrap gap-2">
                  {serviceDetails.businessInfo.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                      <Shield className="w-3 h-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {serviceDetails.businessInfo.whyChooseUs && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Why Choose Us</h4>
                <p className="text-gray-700 leading-relaxed">{serviceDetails.businessInfo.whyChooseUs}</p>
              </div>
            )}

            {serviceDetails.businessInfo.story && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Our Story</h4>
                <p className="text-gray-700 leading-relaxed">{serviceDetails.businessInfo.story}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment Specifications */}
      {serviceDetails.equipment && Object.keys(serviceDetails.equipment).some(key => serviceDetails.equipment[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Equipment Specifications</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.equipment.blowers && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Blower Type</h4>
                  <p className="text-gray-700 capitalize">{serviceDetails.equipment.blowers.replace('_', ' ')}</p>
                </div>
              )}
              
              {serviceDetails.equipment.stakes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ground Stakes</h4>
                  <p className="text-gray-700 capitalize">{serviceDetails.equipment.stakes.replace('_', ' ')}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Additional Equipment</h4>
                <div className="space-y-1">
                  {serviceDetails.equipment.covers && (
                    <p className="text-gray-700">✓ Weather covers</p>
                  )}
                  {serviceDetails.equipment.extension_leads && (
                    <p className="text-gray-700">✓ Extension leads</p>
                  )}
                  {serviceDetails.equipment.safety_mats && (
                    <p className="text-gray-700">✓ Safety mats</p>
                  )}
                  {serviceDetails.equipment.first_aid && (
                    <p className="text-gray-700">✓ First aid kit</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add-on Services */}
      {renderAddOnServices(serviceDetails.addOnServices)}

      {/* Legacy Support */}
      {serviceDetails.aboutService && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About Our Service</h2>
            <p className="text-gray-700 leading-relaxed text-base">{serviceDetails.aboutService}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivitiesDisplay;