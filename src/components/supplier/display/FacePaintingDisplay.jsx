// components/supplier/display/FacePaintingDisplay.jsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette,
  User,
  Clock,
  MapPin,
  Users,
  Star,
  Shield,
  Sparkles,
  Heart,
  Award,
  Brush,
  Camera,
  CheckCircle
} from "lucide-react";

const FacePaintingDisplay = ({ supplier, serviceDetails }) => {
 

  // Helper function to render age groups
  const renderAgeGroups = (ageGroups) => {
    if (!ageGroups?.length) return null;
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Age Groups</h4>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((age, index) => (
            <Badge key={index} variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
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
            <Sparkles className="w-5 h-5 text-purple-600" />
            Add-on Services
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {addOnServices.map((addon, index) => (
              <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-purple-900">{addon.name}</h4>
                  <span className="font-bold text-purple-700">£{addon.price}</span>
                </div>
                {addon.description && (
                  <p className="text-purple-800 text-sm">{addon.description}</p>
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
      {/* Face Painting Services */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-600" />
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

          {serviceDetails.designStyles?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
                <Brush className="w-4 h-4" />
                Design Styles
              </h4>
              <div className="flex flex-wrap gap-2">
                {serviceDetails.designStyles.map((style, index) => (
                  <Badge key={index} variant="outline" className="text-pink-700 border-pink-300 bg-pink-50">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {serviceDetails.themes?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
                <Star className="w-4 h-4" />
                Popular Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {serviceDetails.themes.map((theme, index) => (
                  <Badge key={index} variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {renderAgeGroups(serviceDetails.ageGroups)}

          {serviceDetails.paintBrands?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Paint Brands Used
              </h4>
              <div className="flex flex-wrap gap-2">
                {serviceDetails.paintBrands.map((brand, index) => (
                  <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {serviceDetails.specialties?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {serviceDetails.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
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
              <User className="w-5 h-5 text-pink-600" />
              Meet the Artist
            </h2>
            
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
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
              <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-2">Package Deals</h4>
                <p className="text-pink-800">{serviceDetails.pricing.packageDeals}</p>
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