// components/supplier/display/EntertainerDisplay.jsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  User, 
  Clock,
  MapPin,
  Target,
  Settings,
  Sparkles,
  Star,
  Heart,
  Zap
} from "lucide-react";

const EntertainerDisplay = ({ supplier, serviceDetails }) => {
  console.log('🎭 EntertainerDisplay received:', { supplier: supplier?.name, serviceDetails });

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
      {/* Entertainment Details */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Entertainment Details
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {serviceDetails.performerType && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Performer Type</h4>
                <p className="text-gray-700">{serviceDetails.performerType}</p>
              </div>
            )}
            
            {serviceDetails.experienceLevel && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Experience Level</h4>
                <p className="text-gray-700">{serviceDetails.experienceLevel}</p>
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

            {serviceDetails.setupTime && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Setup Time
                </h4>
                <p className="text-gray-700">{serviceDetails.setupTime} minutes</p>
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
                    ? `${serviceDetails.groupSizeMin}-${serviceDetails.groupSizeMax} people`
                    : serviceDetails.groupSizeMin 
                      ? `${serviceDetails.groupSizeMin}+ people`
                      : `Up to ${serviceDetails.groupSizeMax} people`
                  }
                </p>
              </div>
            )}
          </div>

          {serviceDetails.performanceStyle?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Performance Styles
              </h4>
              <div className="flex flex-wrap gap-2">
                {serviceDetails.performanceStyle.map((style, index) => (
                  <Badge key={index} variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
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
                Available Themes
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

          {serviceDetails.equipment && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Equipment Provided
              </h4>
              <p className="text-gray-700 leading-relaxed">{serviceDetails.equipment}</p>
            </div>
          )}

          {serviceDetails.specialSkills && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Special Skills & Qualifications</h4>
              <p className="text-gray-700 leading-relaxed">{serviceDetails.specialSkills}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Bio */}
      {serviceDetails.personalBio && Object.keys(serviceDetails.personalBio).some(key => serviceDetails.personalBio[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-600" />
              Meet the Entertainer
            </h2>
            
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.personalBio.yearsExperience && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Years Experience</h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.yearsExperience} years</p>
                  </div>
                )}
                
                {serviceDetails.personalBio.inspiration && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      Inspiration
                    </h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.inspiration}</p>
                  </div>
                )}

                {serviceDetails.personalBio.favoriteEvent && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Favorite Event</h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.favoriteEvent}</p>
                  </div>
                )}

                {serviceDetails.personalBio.dreamClient && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Dream Celebrity Client</h4>
                    <p className="text-gray-700 italic">{serviceDetails.personalBio.dreamClient}</p>
                  </div>
                )}
              </div>
              
              {serviceDetails.personalBio.personalStory && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">My Story</h4>
                  <p className="text-gray-700 leading-relaxed">{serviceDetails.personalBio.personalStory}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Requirements */}
      {serviceDetails.performanceSpecs && Object.keys(serviceDetails.performanceSpecs).some(key => serviceDetails.performanceSpecs[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Performance Requirements
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.performanceSpecs.spaceRequired && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Space Required</h4>
                  <p className="text-gray-700">{serviceDetails.performanceSpecs.spaceRequired}</p>
                </div>
              )}

              {serviceDetails.performanceSpecs.maxGroupSize && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Maximum Group Size</h4>
                  <p className="text-gray-700">{serviceDetails.performanceSpecs.maxGroupSize} people</p>
                </div>
              )}

              {serviceDetails.performanceSpecs.powerRequired !== undefined && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Power Supply</h4>
                  <p className={`text-sm px-3 py-1 rounded-full inline-block ${
                    serviceDetails.performanceSpecs.powerRequired 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {serviceDetails.performanceSpecs.powerRequired ? 'Required' : 'Not required'}
                  </p>
                </div>
              )}

              {serviceDetails.performanceSpecs.supervisionRequired !== undefined && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Adult Supervision</h4>
                  <p className={`text-sm px-3 py-1 rounded-full inline-block ${
                    serviceDetails.performanceSpecs.supervisionRequired 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {serviceDetails.performanceSpecs.supervisionRequired 
                      ? 'Required during performance' 
                      : 'Not required'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add-on Services */}
      {renderAddOnServices(serviceDetails.addOnServices)}

      {/* Legacy Support - show old structure if no new structure exists */}
      {serviceDetails.aboutService && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Service</h2>
            <p className="text-gray-700 leading-relaxed text-base">{serviceDetails.aboutService}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EntertainerDisplay;