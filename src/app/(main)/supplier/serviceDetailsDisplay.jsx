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
  MapPin,
  Palette,
  ChefHat,
  Zap,
  DollarSign,
  Target,
  Wind,
  Sparkles,
  Scissors,
  Camera,
  Utensils,
  Home,
  Music,
  Wifi,
  Car,
  Truck,
  Gift
} from "lucide-react";

const ServiceDetailsDisplay = ({ supplier }) => {
  const serviceDetails = supplier?.serviceDetails;
  
  if (!serviceDetails) {
    return null;
  }
  
  console.log('Service Details:', serviceDetails);
  console.log('Supplier Category:', supplier?.category);

  // Enhanced category detection
  const detectCategory = () => {
    const indicators = [
      supplier?.category,
      supplier?.serviceType,
      serviceDetails?.cateringType,
      serviceDetails?.performerType,
      serviceDetails?.venueType,
      serviceDetails?.businessType,
      serviceDetails?.artistType
    ].filter(Boolean).map(indicator => indicator?.toLowerCase());

    // Category mappings
    if (indicators.some(i => 
      ['entertainment', 'entertainer', 'magician', 'clown', 'performer', 'character', 'princess', 'superhero'].some(k => i.includes(k))
    )) return 'entertainment';

    if (indicators.some(i => 
      ['venue', 'hall', 'function room', 'event space', 'party venue'].some(k => i.includes(k))
    )) return 'venues';

    if (indicators.some(i => 
      ['face_painting', 'face painting', 'face painter', 'body painting', 'makeup'].some(k => i.includes(k))
    )) return 'face_painting';

    if (indicators.some(i => 
      ['catering', 'caterer', 'food', 'cake', 'baker', 'dessert', 'buffet', 'pizza', 'ice cream'].some(k => i.includes(k))
    )) return 'catering';

    if (indicators.some(i => 
      ['bouncy', 'inflatable', 'soft play', 'activities', 'equipment', 'games'].some(k => i.includes(k))
    )) return 'activities';

    if (indicators.some(i => 
      ['decoration', 'balloon', 'styling', 'party planning', 'event styling', 'props'].some(k => i.includes(k))
    )) return 'decorations';

    return 'entertainment'; // Default
  };

  const category = detectCategory();
  console.log('Detected category:', category);

  // Helper function to render age groups
  const renderAgeGroups = (ageGroups) => {
    if (!ageGroups?.length) return null;
    return (
      <div>
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
      {/* Entertainment Services */}
      {category === 'entertainment' && (
        <>
          {/* Entertainer Details */}
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
                    <h4 className="font-semibold text-gray-900 mb-2">Travel Radius</h4>
                    <p className="text-gray-700">{serviceDetails.travelRadius} miles</p>
                  </div>
                )}

                {serviceDetails.setupTime && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Setup Time</h4>
                    <p className="text-gray-700">{serviceDetails.setupTime} minutes</p>
                  </div>
                )}
              </div>

              {serviceDetails.performanceStyle?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Styles</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.performanceStyle.map((style, index) => (
                      <Badge key={index} variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {renderAgeGroups(serviceDetails.ageGroups)}

              {serviceDetails.equipment && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Equipment Provided</h4>
                  <p className="text-gray-700">{serviceDetails.equipment}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Bio */}
          {serviceDetails.personalBio && (
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
                        <h4 className="font-semibold text-gray-900 mb-2">Inspiration</h4>
                        <p className="text-gray-700">{serviceDetails.personalBio.inspiration}</p>
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
        </>
      )}

      {/* Venue Services */}
      {category === 'venues' && (
        <>
          {/* Venue Details */}
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
                    <h4 className="font-semibold text-gray-900 mb-2">Capacity</h4>
                    <p className="text-gray-700">
                      {serviceDetails.capacity.min}-{serviceDetails.capacity.max} guests
                      {serviceDetails.capacity.seated && ` (${serviceDetails.capacity.seated} seated)`}
                    </p>
                  </div>
                )}
              </div>

              {serviceDetails.facilities?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Available Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {renderAgeGroups(serviceDetails.ageGroups)}
            </CardContent>
          </Card>

          {/* Venue Address & Details */}
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
                        <h4 className="font-semibold text-gray-900 mb-2">Parking</h4>
                        <p className="text-gray-700">{serviceDetails.venueDetails.parkingInfo}</p>
                      </div>
                    )}
                    
                    {serviceDetails.venueDetails.accessInstructions && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Access Instructions</h4>
                        <p className="text-gray-700">{serviceDetails.venueDetails.accessInstructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing */}
          {serviceDetails.pricing && (
            <Card className="border-gray-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  Pricing
                </h2>
                
                <div className="grid md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Face Painting Services */}
      {category === 'face_painting' && (
        <>
          {/* Face Painting Details */}
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
                    <h4 className="font-semibold text-gray-900 mb-2">Time Per Face</h4>
                    <p className="text-gray-700">{serviceDetails.timePerFace} minutes</p>
                  </div>
                )}

                {serviceDetails.travelRadius && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Travel Radius</h4>
                    <p className="text-gray-700">{serviceDetails.travelRadius} miles</p>
                  </div>
                )}
              </div>

              {serviceDetails.designStyles?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Design Styles</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.designStyles.map((style, index) => (
                      <Badge key={index} variant="outline" className="text-pink-700 border-pink-300 bg-pink-50">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {renderAgeGroups(serviceDetails.ageGroups)}

              {serviceDetails.paintBrands?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Paint Brands Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.paintBrands.map((brand, index) => (
                      <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Artist Bio */}
          {serviceDetails.artistBio && (
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
        </>
      )}

      {/* Catering & Cake Services */}
      {category === 'catering' && (
        <>
          {/* Catering Details */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-600" />
                {serviceDetails.cateringType?.includes('Cake') ? 'Cake Services' : 'Catering Services'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.cateringType && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Service Type</h4>
                    <p className="text-gray-700">{serviceDetails.cateringType}</p>
                  </div>
                )}
                
                {serviceDetails.serviceStyle && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Service Style</h4>
                    <p className="text-gray-700">{serviceDetails.serviceStyle}</p>
                  </div>
                )}

                {serviceDetails.capacity && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Guest Capacity</h4>
                    <p className="text-gray-700">{serviceDetails.capacity.minimum}-{serviceDetails.capacity.maximum} guests</p>
                  </div>
                )}

                {serviceDetails.leadTime?.minimum && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Lead Time</h4>
                    <p className="text-gray-700">{serviceDetails.leadTime.minimum} hours minimum</p>
                  </div>
                )}
              </div>

              {serviceDetails.cuisineTypes?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Cuisine Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.cuisineTypes.map((cuisine, index) => (
                      <Badge key={index} variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.specialties?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.cakeFlavors?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Available Cake Flavors</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.cakeFlavors.map((flavor, index) => (
                      <Badge key={index} variant="outline" className="text-pink-700 border-pink-300 bg-pink-50">
                        {flavor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.dietaryOptions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Dietary Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.dietaryOptions.map((diet, index) => (
                      <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        {diet}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Info */}
          {serviceDetails.businessDetails && (
            <Card className="border-gray-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Experience & Credentials
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {serviceDetails.businessDetails.yearsExperience && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Years Experience</h4>
                      <p className="text-gray-700">{serviceDetails.businessDetails.yearsExperience} years</p>
                    </div>
                  )}
                  
                  {serviceDetails.businessDetails.kitchenType && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Kitchen Type</h4>
                      <p className="text-gray-700">{serviceDetails.businessDetails.kitchenType}</p>
                    </div>
                  )}
                </div>

                {serviceDetails.businessDetails.licenses?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Licenses & Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {serviceDetails.businessDetails.licenses.map((license, index) => (
                        <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                          <Shield className="w-3 h-3 mr-1" />
                          {license}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {serviceDetails.businessDetails.story && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Our Story</h4>
                    <p className="text-gray-700">{serviceDetails.businessDetails.story}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Activities/Bouncy Castle Services */}
      {category === 'activities' && (
        <>
          {/* Equipment Details */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Equipment & Services
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.businessType && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Business Type</h4>
                    <p className="text-gray-700">{serviceDetails.businessType}</p>
                  </div>
                )}

                {serviceDetails.setupRequirements && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Space Required</h4>
                    <p className="text-gray-700">
                      {serviceDetails.setupRequirements.spaceWidth}ft × {serviceDetails.setupRequirements.spaceLength}ft
                      {serviceDetails.setupRequirements.spaceHeight && ` × ${serviceDetails.setupRequirements.spaceHeight}ft height`}
                    </p>
                  </div>
                )}
              </div>

              {serviceDetails.castleTypes?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Equipment Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.castleTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.themes?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Available Themes</h4>
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
            </CardContent>
          </Card>

          {/* Safety & Weather */}
          {(serviceDetails.safetyFeatures?.length > 0 || serviceDetails.weatherPolicies) && (
            <Card className="border-gray-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Safety & Weather Policies
                </h2>
                
                {serviceDetails.safetyFeatures?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Safety Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {serviceDetails.safetyFeatures.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {serviceDetails.weatherPolicies && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <h4 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      Weather Policy
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-cyan-800">
                      {serviceDetails.weatherPolicies.windLimit && (
                        <p>Max wind: {serviceDetails.weatherPolicies.windLimit}mph</p>
                      )}
                      {serviceDetails.weatherPolicies.rainPolicy && (
                        <p>Rain policy: {serviceDetails.weatherPolicies.rainPolicy.replace('_', ' ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing */}
          {serviceDetails.pricing?.dailyRates && (
            <Card className="border-gray-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  Daily Hire Rates
                </h2>
                
                <div className="grid md:grid-cols-4 gap-4">
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
                
                {(serviceDetails.pricing.deliveryFee || serviceDetails.pricing.weekendSurcharge) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Additional Fees</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                      {serviceDetails.pricing.deliveryFee && (
                        <p>Delivery: £{serviceDetails.pricing.deliveryFee}</p>
                      )}
                      {serviceDetails.pricing.weekendSurcharge && (
                        <p>Weekend surcharge: £{serviceDetails.pricing.weekendSurcharge}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Decorations Services */}
      {category === 'decorations' && (
        <>
          {/* Decoration Details */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" />
                Decoration Services
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.businessType && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specialist In</h4>
                    <p className="text-gray-700">{serviceDetails.businessType}</p>
                  </div>
                )}
              </div>

              {serviceDetails.decorationTypes?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Decoration Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.decorationTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-pink-700 border-pink-300 bg-pink-50">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.designStyles?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Design Styles</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.designStyles.map((style, index) => (
                      <Badge key={index} variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.colorSchemes?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Color Schemes</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.colorSchemes.map((color, index) => (
                      <Badge key={index} variant="outline" className="text-indigo-700 border-indigo-300 bg-indigo-50">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {serviceDetails.themes?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Popular Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {serviceDetails.themes.map((theme, index) => (
                      <Badge key={index} variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Portfolio */}
          {serviceDetails.portfolio && (
            <Card className="border-gray-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-600" />
                  Design Portfolio
                </h2>
                
                {serviceDetails.portfolio.specialtyProjects && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Specialty Projects</h4>
                    <p className="text-gray-700">{serviceDetails.portfolio.specialtyProjects}</p>
                  </div>
                )}

                {serviceDetails.portfolio.favoriteCreations && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Favorite Creations</h4>
                    <p className="text-gray-700">{serviceDetails.portfolio.favoriteCreations}</p>
                  </div>
                )}

                {serviceDetails.portfolio.uniqueOfferings && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What Makes Us Unique</h4>
                    <p className="text-gray-700">{serviceDetails.portfolio.uniqueOfferings}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add-on Services (common to all categories) */}
      {renderAddOnServices(serviceDetails.addOnServices)}

      {/* Legacy Support - show old structure if no new structure exists */}
      {!['entertainment', 'venues', 'catering', 'activities', 'decorations', 'face_painting'].includes(category) && (
        <>
          {/* Show the old legacy structure as fallback */}
          {serviceDetails.aboutService && (
            <Card className="border-gray-300">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  About This Service
                </h2>
                <p className="text-gray-700 leading-relaxed text-base">{serviceDetails.aboutService}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceDetailsDisplay;