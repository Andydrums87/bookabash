// components/supplier/display/FacePaintingDisplay.jsx
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Palette,
  User,
  Clock,
  Info,
  MapPin,
  Users,
  Star,
  Shield,
  Sparkles,
  Heart,
  Award,
  Brush,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const FacePaintingDisplay = ({ supplier, serviceDetails }) => {
  
  // State for expandable sections
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

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
        <h4 className="font-semibold text-gray-900 mb-3">Age Groups</h4>
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
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {serviceDetails.aboutUs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Face Painting Services */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-600" />
            Face Painting Services
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {serviceDetails.artistType && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Artist Type</h4>
                <p className="text-gray-700">{serviceDetails.artistType}</p>
              </div>
            )}
            
            {serviceDetails.experienceLevel && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Experience Level</h4>
                <p className="text-gray-700">{serviceDetails.experienceLevel}</p>
              </div>
            )}

            {serviceDetails.timePerFace && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Time Per Face
                </h4>
                <p className="text-gray-700">{serviceDetails.timePerFace} minutes</p>
              </div>
            )}

            {serviceDetails.travelRadius && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Travel Radius
                </h4>
                <p className="text-gray-700">{serviceDetails.travelRadius} miles</p>
              </div>
            )}

            {(serviceDetails.groupSizeMin || serviceDetails.groupSizeMax) && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Group Size
                </h4>
                <p className="text-gray-700">
                  {serviceDetails.groupSizeMin && serviceDetails.groupSizeMax 
                    ? `${serviceDetails.groupSizeMin}-${serviceDetails.groupSizeMax} children`
                    : serviceDetails.groupSizeMin 
                      ? `${serviceDetails.groupSizeMin}+ children`
                      : `Up to ${serviceDetails.groupSizeMax} children`
                  }
                </p>
              </div>
            )}

            {serviceDetails.setupTime && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Setup Time</h4>
                <p className="text-gray-700">{serviceDetails.setupTime} minutes</p>
              </div>
            )}
          </div>

          {/* Design Styles with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.designStyles,
            "Design Styles",
            <Brush className="w-4 h-4" />,
            "text-primary-700 border-[hsl(var(--primary-300))] bg-primary-50",
            showAllStyles,
            setShowAllStyles,
            6
          )}

          {/* Themes with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.themes,
            "Popular Themes",
            <Star className="w-4 h-4" />,
            "text-teal-700 border-teal-300 bg-teal-50",
            showAllThemes,
            setShowAllThemes,
            8
          )}

          {renderAgeGroups(serviceDetails.ageGroups)}

          {/* Paint Brands with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.paintBrands,
            "Paint Brands Used",
            <Shield className="w-4 h-4" />,
            "text-green-700 border-green-300 bg-green-50",
            showAllBrands,
            setShowAllBrands,
            4
          )}

          {/* Specialties with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.specialties,
            "Specialties",
            <Sparkles className="w-4 h-4" />,
            "text-slate-700 border-slate-300 bg-slate-50",
            showAllSpecialties,
            setShowAllSpecialties,
            6
          )}
        </CardContent>
      </Card>

      {/* Safety & Materials */}
      {(serviceDetails.paintBrands?.length > 0 || serviceDetails.safetyMeasures?.length > 0 || serviceDetails.allergenInfo) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Safety & Materials
            </h2>
            
            <div className="space-y-6">
              {serviceDetails.allergenInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Allergen Information</h4>
                  <p className="text-green-800">{serviceDetails.allergenInfo}</p>
                </div>
              )}

              {serviceDetails.safetyMeasures?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Safety Measures</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {serviceDetails.safetyMeasures.map((measure, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{measure}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.paintQuality && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Paint Quality</h4>
                  <p className="text-gray-700">{serviceDetails.paintQuality}</p>
                </div>
              )}

              {serviceDetails.hygienePractices && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Hygiene Practices</h4>
                  <p className="text-gray-700">{serviceDetails.hygienePractices}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Artist Bio */}
      {serviceDetails.artistBio && Object.keys(serviceDetails.artistBio).some(key => serviceDetails.artistBio[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Meet the Artist
            </h2>
            
            <div className="bg-gradient-to-br from-primary-50 to-teal-50 border border-primary-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.artistBio.yearsExperience && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Years Experience</h4>
                    <p className="text-gray-700">{serviceDetails.artistBio.yearsExperience} years</p>
                  </div>
                )}
                
                {serviceDetails.artistBio.artisticBackground && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Artistic Background</h4>
                    <p className="text-gray-700">{serviceDetails.artistBio.artisticBackground}</p>
                  </div>
                )}

                {serviceDetails.artistBio.specializations && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specializations</h4>
                    <p className="text-gray-700">{serviceDetails.artistBio.specializations}</p>
                  </div>
                )}

                {serviceDetails.artistBio.inspiration && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      Inspiration
                    </h4>
                    <p className="text-gray-700">{serviceDetails.artistBio.inspiration}</p>
                  </div>
                )}
              </div>
              
              {serviceDetails.artistBio.favoriteDesigns && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Favorite Designs</h4>
                  <p className="text-gray-700">{serviceDetails.artistBio.favoriteDesigns}</p>
                </div>
              )}

              {serviceDetails.artistBio.personalStory && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">My Story</h4>
                  <p className="text-gray-700 leading-relaxed">{serviceDetails.artistBio.personalStory}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio & Design Gallery */}
      {serviceDetails.portfolio && Object.keys(serviceDetails.portfolio).some(key => serviceDetails.portfolio[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              Design Portfolio
            </h2>
            
            {serviceDetails.portfolio.signature && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Signature Designs</h4>
                <p className="text-gray-700 leading-relaxed">{serviceDetails.portfolio.signature}</p>
              </div>
            )}

            {serviceDetails.portfolio.specialtyWork && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Specialty Work</h4>
                <p className="text-gray-700">{serviceDetails.portfolio.specialtyWork}</p>
              </div>
            )}

            {serviceDetails.portfolio.awards && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Awards & Recognition
                </h4>
                <p className="text-gray-700">{serviceDetails.portfolio.awards}</p>
              </div>
            )}

            {serviceDetails.portfolio.clientTestimonial && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">Client Testimonial</h4>
                <p className="text-indigo-800 italic">"{serviceDetails.portfolio.clientTestimonial}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Options & Packages */}
      {serviceDetails.serviceOptions && Object.keys(serviceDetails.serviceOptions).some(key => serviceDetails.serviceOptions[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Service Options</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {serviceDetails.serviceOptions.partyPackages !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceOptions.partyPackages ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Party packages available</span>
                </div>
              )}
              
              {serviceDetails.serviceOptions.individualSessions !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceOptions.individualSessions ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Individual sessions available</span>
                </div>
              )}
              
              {serviceDetails.serviceOptions.groupWorkshops !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceOptions.groupWorkshops ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Group workshops available</span>
                </div>
              )}
              
              {serviceDetails.serviceOptions.photoSession !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceOptions.photoSession ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Photo session included</span>
                </div>
              )}
              
              {serviceDetails.serviceOptions.takeHomeCards !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceOptions.takeHomeCards ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Take-home care cards provided</span>
                </div>
              )}
              
              {serviceDetails.serviceOptions.glitterTattoos !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${serviceDetails.serviceOptions.glitterTattoos ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-gray-700">Glitter tattoos available</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      {serviceDetails.pricing && Object.keys(serviceDetails.pricing).some(key => serviceDetails.pricing[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.pricing.hourlyRate && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Hourly Rate</h4>
                  <p className="text-gray-700">£{serviceDetails.pricing.hourlyRate} per hour</p>
                </div>
              )}
              
              {serviceDetails.pricing.minimumBooking && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Minimum Booking</h4>
                  <p className="text-gray-700">{serviceDetails.pricing.minimumBooking} hours</p>
                </div>
              )}
              
              {serviceDetails.pricing.travelFee && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Travel Fee</h4>
                  <p className="text-gray-700">
                    {serviceDetails.pricing.travelFee === 0
                      ? 'Free within service area'
                      : `£${serviceDetails.pricing.travelFee} outside standard area`
                    }
                  </p>
                </div>
              )}

              {serviceDetails.pricing.weekendSurcharge && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Weekend Rate</h4>
                  <p className="text-gray-700">£{serviceDetails.pricing.weekendSurcharge} weekend surcharge</p>
                </div>
              )}
            </div>

            {serviceDetails.pricing.packageDeals && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-200 rounded-lg">
                <h4 className="font-semibold text-primary-900 mb-2">Package Deals</h4>
                <p className="text-primary-800">{serviceDetails.pricing.packageDeals}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment & Setup */}
      {serviceDetails.equipment && Object.keys(serviceDetails.equipment).some(key => serviceDetails.equipment[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Equipment & Setup</h2>
            
            <div className="space-y-4">
              {serviceDetails.equipment.stationSetup && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Station Setup</h4>
                  <p className="text-gray-700">{serviceDetails.equipment.stationSetup}</p>
                </div>
              )}

              {serviceDetails.equipment.chairsRequired !== undefined && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Seating Requirements</h4>
                  <p className="text-gray-700">
                    {serviceDetails.equipment.chairsRequired 
                      ? 'Chairs required (please provide suitable seating)'
                      : 'Can work standing or with any seating arrangement'}
                  </p>
                </div>
              )}

              {serviceDetails.equipment.lighting && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Lighting Requirements</h4>
                  <p className="text-gray-700">{serviceDetails.equipment.lighting}</p>
                </div>
              )}

              {serviceDetails.equipment.spaceNeeded && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Space Needed</h4>
                  <p className="text-gray-700">{serviceDetails.equipment.spaceNeeded}</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">About Our Face Painting Service</h2>
            <p className="text-gray-700 leading-relaxed text-base">{serviceDetails.aboutService}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacePaintingDisplay;