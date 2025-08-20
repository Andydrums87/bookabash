// components/supplier/display/DecorationsDisplay.jsx
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles,
  Palette,
  Camera,
  Star,
  Users,
  Info,
  Clock,
  MapPin,
  Heart,
  Scissors,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const DecorationsDisplay = ({ supplier, serviceDetails }) => {
  
  // State for expandable sections
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);

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
        <h4 className="font-semibold text-gray-900 mb-3">Age Groups We Design For</h4>
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
        {/* About Us Section */}
        {serviceDetails.aboutUs && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-600" />
              About Us
            </h2>
            
            <div className=" rounded-lg p-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {serviceDetails.aboutUs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Decoration Services */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Decoration Services
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {serviceDetails.businessType && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Specialist In</h4>
                <p className="text-gray-700">{serviceDetails.businessType}</p>
              </div>
            )}

            {serviceDetails.travelRadius && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Service Area
                </h4>
                <p className="text-gray-700">{serviceDetails.travelRadius} miles radius</p>
              </div>
            )}

            {serviceDetails.setupTime && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Setup Time
                </h4>
                <p className="text-gray-700">{serviceDetails.setupTime} hours</p>
              </div>
            )}

            {serviceDetails.capacity && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Event Size
                </h4>
                <p className="text-gray-700">
                  {serviceDetails.capacity.minimum && serviceDetails.capacity.maximum
                    ? `${serviceDetails.capacity.minimum}-${serviceDetails.capacity.maximum} guests`
                    : serviceDetails.capacity.maximum
                      ? `Up to ${serviceDetails.capacity.maximum} guests`
                      : 'Any size event'}
                </p>
              </div>
            )}
          </div>

          {/* Decoration Types with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.decorationTypes,
            "Decoration Types",
            <Scissors className="w-4 h-4" />,
            "text-primary-700 border-[hsl(var(--primary-300))] bg-primary-50",
            showAllTypes,
            setShowAllTypes,
            6
          )}

          {/* Design Styles with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.designStyles,
            "Design Styles",
            <Palette className="w-4 h-4" />,
            "text-teal-700 border-teal-300 bg-teal-50",
            showAllStyles,
            setShowAllStyles,
            6
          )}

          {/* Color Schemes with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.colorSchemes,
            "Color Schemes",
            <Palette className="w-4 h-4" />,
            "text-indigo-700 border-indigo-300 bg-indigo-50",
            showAllColors,
            setShowAllColors,
            6
          )}

          {/* Themes with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.themes,
            "Popular Themes",
            <Star className="w-4 h-4" />,
            "text-slate-700 border-slate-300 bg-slate-50",
            showAllThemes,
            setShowAllThemes,
            8
          )}

          {renderAgeGroups(serviceDetails.ageGroups)}
        </CardContent>
      </Card>

      {/* Service Capabilities */}
      {serviceDetails.serviceCapabilities && Object.keys(serviceDetails.serviceCapabilities).some(key => serviceDetails.serviceCapabilities[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-600" />
              Service Capabilities
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {serviceDetails.serviceCapabilities.delivery !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${serviceDetails.serviceCapabilities.delivery ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700">Delivery service</span>
                </div>
              )}
              
              {serviceDetails.serviceCapabilities.setup !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${serviceDetails.serviceCapabilities.setup ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700">Setup service</span>
                </div>
              )}
              
              {serviceDetails.serviceCapabilities.collection !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${serviceDetails.serviceCapabilities.collection ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700">Collection service</span>
                </div>
              )}
              
              {serviceDetails.serviceCapabilities.customDesign !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${serviceDetails.serviceCapabilities.customDesign ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700">Custom design consultation</span>
                </div>
              )}
              
              {serviceDetails.serviceCapabilities.sameDay !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${serviceDetails.serviceCapabilities.sameDay ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700">Same day service available</span>
                </div>
              )}
              
              {serviceDetails.serviceCapabilities.onSiteConsultation !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${serviceDetails.serviceCapabilities.onSiteConsultation ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700">On-site consultation</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Design Portfolio & Unique Offerings */}
      {serviceDetails.portfolio && Object.keys(serviceDetails.portfolio).some(key => serviceDetails.portfolio[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              Design Portfolio & Expertise
            </h2>
            
            {serviceDetails.portfolio.specialtyProjects && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Specialty Projects</h4>
                <p className="text-gray-700 leading-relaxed">{serviceDetails.portfolio.specialtyProjects}</p>
              </div>
            )}

            {serviceDetails.portfolio.favoriteCreations && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Favorite Creations
                </h4>
                <p className="text-gray-700 leading-relaxed">{serviceDetails.portfolio.favoriteCreations}</p>
              </div>
            )}

            {serviceDetails.portfolio.uniqueOfferings && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">What Makes Us Unique</h4>
                <p className="text-gray-700 leading-relaxed">{serviceDetails.portfolio.uniqueOfferings}</p>
              </div>
            )}

            {serviceDetails.portfolio.awards && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Awards & Recognition</h4>
                <p className="text-gray-700">{serviceDetails.portfolio.awards}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      {serviceDetails.pricing && Object.keys(serviceDetails.pricing).some(key => serviceDetails.pricing[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.pricing.consultationFee && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Design Consultation</h4>
                  <p className="text-gray-700">
                    {serviceDetails.pricing.consultationFee === 0 
                      ? 'Free consultation' 
                      : `£${serviceDetails.pricing.consultationFee} consultation fee`
                    }
                  </p>
                </div>
              )}
              
              {serviceDetails.pricing.minimumOrder && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Minimum Order</h4>
                  <p className="text-gray-700">£{serviceDetails.pricing.minimumOrder}</p>
                </div>
              )}
              
              {serviceDetails.pricing.deliveryFee && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery</h4>
                  <p className="text-gray-700">
                    {serviceDetails.pricing.deliveryFee === 0
                      ? 'Free delivery within service area'
                      : `£${serviceDetails.pricing.deliveryFee} delivery fee`
                    }
                  </p>
                </div>
              )}

              {serviceDetails.pricing.setupFee && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Setup Service</h4>
                  <p className="text-gray-700">
                    {serviceDetails.pricing.setupFee === 0
                      ? 'Setup included'
                      : `£${serviceDetails.pricing.setupFee} setup fee`
                    }
                  </p>
                </div>
              )}
            </div>

            {serviceDetails.pricing.packageDeals && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-200 rounded-lg">
                <h4 className="font-semibold text-primary-900 mb-2">Package Deals Available</h4>
                <p className="text-primary-800 text-sm">{serviceDetails.pricing.packageDeals}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Information */}
      {serviceDetails.businessInfo && Object.keys(serviceDetails.businessInfo).some(key => serviceDetails.businessInfo[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About Our Design Team</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {serviceDetails.businessInfo.yearsExperience && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Years Experience</h4>
                  <p className="text-gray-700">{serviceDetails.businessInfo.yearsExperience} years in party decoration</p>
                </div>
              )}
              
              {serviceDetails.businessInfo.teamSize && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Team Size</h4>
                  <p className="text-gray-700">{serviceDetails.businessInfo.teamSize} designers</p>
                </div>
              )}
            </div>

            {serviceDetails.businessInfo.designPhilosophy && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Design Philosophy</h4>
                <p className="text-gray-700 leading-relaxed">{serviceDetails.businessInfo.designPhilosophy}</p>
              </div>
            )}

            {serviceDetails.businessInfo.inspiration && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  What Inspires Us
                </h4>
                <p className="text-gray-700">{serviceDetails.businessInfo.inspiration}</p>
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

      {/* Materials & Quality */}
      {serviceDetails.materials && Object.keys(serviceDetails.materials).some(key => serviceDetails.materials[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Materials & Quality</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.materials.balloonQuality && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Balloon Quality</h4>
                  <p className="text-gray-700">{serviceDetails.materials.balloonQuality}</p>
                </div>
              )}
              
              {serviceDetails.materials.ecoFriendly !== undefined && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Eco-Friendly Options</h4>
                  <p className="text-gray-700">
                    {serviceDetails.materials.ecoFriendly 
                      ? 'Biodegradable and eco-friendly materials available'
                      : 'Standard materials used'
                    }
                  </p>
                </div>
              )}
              
              {serviceDetails.materials.durability && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Event Duration</h4>
                  <p className="text-gray-700">Decorations last {serviceDetails.materials.durability}</p>
                </div>
              )}
              
              {serviceDetails.materials.weatherResistant !== undefined && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Weather Resistance</h4>
                  <p className="text-gray-700">
                    {serviceDetails.materials.weatherResistant 
                      ? 'Suitable for outdoor events'
                      : 'Indoor use recommended'
                    }
                  </p>
                </div>
              )}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">About Our Decoration Service</h2>
            <p className="text-gray-700 leading-relaxed text-base">{serviceDetails.aboutService}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DecorationsDisplay;