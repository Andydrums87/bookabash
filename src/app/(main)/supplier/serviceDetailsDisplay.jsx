import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Users, 
  Shield, 
  User, 
  Heart,
  Award,
  Settings,
  Info,
  CheckCircle,
  AlertCircle,
  Building,
  Star,
  Calendar,
  MapPin
} from "lucide-react";

const ServiceDetailsDisplay = ({ supplier }) => {
  const serviceDetails = supplier?.serviceDetails;
  
  if (!serviceDetails) {
    return null; // Don't show anything if no service details
  }
  console.log(serviceDetails)

  const serviceType = supplier?.serviceType || supplier?.category || "entertainment";
  const isVenue = serviceType?.toLowerCase().includes('venue') || serviceType === 'Venues';

  return (
    <div className="space-y-6">
      {/* About Service Section */}
      {(serviceDetails.aboutService || serviceDetails.serviceHighlights) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              About This Service
            </h2>
            
            {serviceDetails.aboutService && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-base">
                  {serviceDetails.aboutService}
                </p>
              </div>
            )}

            {serviceDetails.serviceHighlights && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Key Highlights
                </h3>
                <div className="text-blue-800 whitespace-pre-line text-sm leading-relaxed">
                  {serviceDetails.serviceHighlights}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Type Specific Details */}
      {isVenue ? (
        // Venue Details
        serviceDetails.venueDetails && (
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                Venue Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.venueDetails.venueType && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Venue Type</h4>
                    <p className="text-gray-700">{serviceDetails.venueDetails.venueType}</p>
                  </div>
                )}
                
                {serviceDetails.venueDetails.capacity && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Maximum Capacity</h4>
                    <p className="text-gray-700">{serviceDetails.venueDetails.capacity} guests</p>
                  </div>
                )}
              </div>

              {serviceDetails.venueDetails.facilities?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Available Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.venueDetails.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.venueDetails.accessibility && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Accessibility Features</h4>
                  <p className="text-gray-700">{serviceDetails.venueDetails.accessibility}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      ) : (
        // Entertainer Details
        (serviceDetails.serviceIncludes?.actType || 
         serviceDetails.serviceIncludes?.performanceOptions?.length > 0 ||
         serviceDetails.serviceIncludes?.equipment) && (
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Service Specialties
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.serviceIncludes.actType && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                    <p className="text-gray-700">{serviceDetails.serviceIncludes.actType}</p>
                  </div>
                )}
                
                {serviceDetails.serviceIncludes.travelRadius && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Travel Radius</h4>
                    <p className="text-gray-700">{serviceDetails.serviceIncludes.travelRadius} miles</p>
                  </div>
                )}
              </div>

              {serviceDetails.serviceIncludes.equipment && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Equipment Provided</h4>
                  <p className="text-gray-700">{serviceDetails.serviceIncludes.equipment}</p>
                </div>
              )}

              {serviceDetails.serviceIncludes.performanceOptions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.serviceIncludes.performanceOptions.map((option, index) => (
                      <Badge key={index} variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* Duration & Pricing */}
      {(serviceDetails.durationOptions || serviceDetails.pricingInfo?.priceDescription) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Duration & Pricing
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.durationOptions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Duration Available</h4>
                  <p className="text-gray-700">
                    From {serviceDetails.durationOptions.minHours} hour{serviceDetails.durationOptions.minHours !== 1 ? 's' : ''} 
                    {' '}to {serviceDetails.durationOptions.maxHours} hour{serviceDetails.durationOptions.maxHours !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {serviceDetails.pricingInfo?.pricingModel && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pricing Model</h4>
                  <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                    {serviceDetails.pricingInfo.pricingModel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              )}
            </div>

            {serviceDetails.pricingInfo?.priceDescription && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">How Pricing Works</h4>
                <p className="text-orange-800 text-sm">{serviceDetails.pricingInfo.priceDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Standards */}
      {(serviceDetails.serviceStandards?.setupTime || 
        serviceDetails.serviceStandards?.equipmentProvided || 
        serviceDetails.serviceStandards?.setupDescription) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Service Standards
            </h2>
            
            <div className="space-y-4">
              {serviceDetails.serviceStandards.setupTime > 0 && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">
                    Setup time: {serviceDetails.serviceStandards.setupTime} minutes before event
                  </span>
                </div>
              )}
              
              {serviceDetails.serviceStandards.equipmentProvided && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">All equipment provided</span>
                </div>
              )}
              
              {serviceDetails.serviceStandards.cleanupIncluded && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Cleanup included</span>
                </div>
              )}
            </div>

            {serviceDetails.serviceStandards.setupDescription && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Setup & Service Details</h4>
                <p className="text-indigo-800 text-sm">{serviceDetails.serviceStandards.setupDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Details (Age Groups, Team Size, etc.) */}
      {(serviceDetails.serviceIncludes?.ageGroups?.length > 0 || 
        serviceDetails.serviceIncludes?.performerGenders?.length > 0 ||
        serviceDetails.serviceIncludes?.teamSize > 1) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Service Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.serviceIncludes.ageGroups?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Ages Catered For</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.serviceIncludes.ageGroups.map((age, index) => (
                      <Badge key={index} variant="outline" className="text-teal-700 border-teal-300 bg-teal-50">
                        {age}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {serviceDetails.serviceIncludes.performerGenders?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performer Gender</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.serviceIncludes.performerGenders.map((gender, index) => (
                      <Badge key={index} variant="outline" className="text-teal-700 border-teal-300 bg-teal-50">
                        {gender}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(serviceDetails.serviceIncludes.teamSize > 1 || serviceDetails.serviceIncludes.teamDescription) && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Team Information</h4>
                <p className="text-gray-700">
                  {serviceDetails.serviceIncludes.teamSize} team member{serviceDetails.serviceIncludes.teamSize !== 1 ? 's' : ''}
                  {serviceDetails.serviceIncludes.teamDescription && ` (${serviceDetails.serviceIncludes.teamDescription})`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {(serviceDetails.requirements?.spaceRequired || 
        serviceDetails.requirements?.powerNeeded || 
        serviceDetails.requirements?.indoorOutdoor?.length > 0 ||
        serviceDetails.requirements?.specialRequirements) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Service Requirements
            </h2>
            
            <div className="space-y-4">
              {serviceDetails.requirements.spaceRequired && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Space Required</h4>
                  <p className="text-gray-700">{serviceDetails.requirements.spaceRequired}</p>
                </div>
              )}
              
              {serviceDetails.requirements.powerNeeded && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-gray-700">Power outlet required</span>
                </div>
              )}
              
              {serviceDetails.requirements.indoorOutdoor?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Venue Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.requirements.indoorOutdoor.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {serviceDetails.requirements.specialRequirements && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">Special Requirements</h4>
                  <p className="text-amber-800 text-sm">{serviceDetails.requirements.specialRequirements}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {(serviceDetails.certifications?.dbsCertificate || 
        serviceDetails.certifications?.publicLiability || 
        serviceDetails.certifications?.firstAid) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Certifications & Safety
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {serviceDetails.certifications.dbsCertificate && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-900">DBS Certified</div>
                    <div className="text-green-700 text-sm">Background checked</div>
                  </div>
                </div>
              )}
              
              {serviceDetails.certifications.publicLiability && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-900">Insured</div>
                    <div className="text-green-700 text-sm">Public liability coverage</div>
                  </div>
                </div>
              )}
              
              {serviceDetails.certifications.firstAid && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-900">First Aid Certified</div>
                    <div className="text-green-700 text-sm">Safety trained</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Bio */}
      {(serviceDetails.personalBio?.yearsExperience > 0 || 
        serviceDetails.personalBio?.inspiration || 
        serviceDetails.personalBio?.favoriteEvent ||
        serviceDetails.personalBio?.dreamCelebrity ||
        serviceDetails.personalBio?.personalStory) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-600" />
              Meet Your Supplier
            </h2>
            
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.personalBio.yearsExperience > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-pink-600" />
                      Years in Events
                    </h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.yearsExperience} years experience</p>
                  </div>
                )}
                
                {serviceDetails.personalBio.inspiration && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-600" />
                      Inspiration
                    </h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.inspiration}</p>
                  </div>
                )}
                
                {serviceDetails.personalBio.favoriteEvent && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-pink-600" />
                      Favorite Event
                    </h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.favoriteEvent}</p>
                  </div>
                )}
                
                {serviceDetails.personalBio.dreamCelebrity && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-pink-600" />
                      Dream Celebrity
                    </h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.dreamCelebrity}</p>
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
    </div>
  );
};

export default ServiceDetailsDisplay;