// components/supplier/display/CateringDisplay.jsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChefHat,
  Users,
  Clock,
  Heart,
  Award,
  Shield,
  Utensils,
  Sparkles,
  Star,
  CheckCircle
} from "lucide-react";

const CateringDisplay = ({ supplier, serviceDetails }) => {
  console.log('🍰 CateringDisplay received:', { supplier: supplier?.name, serviceDetails });

  const isCakeSpecialist = serviceDetails?.cateringType?.toLowerCase().includes('cake') || 
                          serviceDetails?.cateringType?.toLowerCase().includes('baker');

  // Helper function to render age groups
  const renderAgeGroups = (ageGroups) => {
    if (!ageGroups?.length) return null;
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Age Groups We Cater For</h4>
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
      {/* Catering/Cake Service Details */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-600" />
            {isCakeSpecialist ? 'Cake Services' : 'Catering Services'}
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
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Guest Capacity
                </h4>
                <p className="text-gray-700">
                  {serviceDetails.capacity.minimum && serviceDetails.capacity.maximum
                    ? `${serviceDetails.capacity.minimum}-${serviceDetails.capacity.maximum} guests`
                    : serviceDetails.capacity.maximum
                      ? `Up to ${serviceDetails.capacity.maximum} guests`
                      : 'Flexible capacity'}
                </p>
              </div>
            )}

            {serviceDetails.leadTime?.minimum && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Lead Time
                </h4>
                <p className="text-gray-700">{serviceDetails.leadTime.minimum} hours minimum notice</p>
              </div>
            )}
          </div>

          {/* Food-specific sections */}
          {!isCakeSpecialist && serviceDetails.cuisineTypes?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
                <Utensils className="w-4 h-4" />
                Cuisine Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {serviceDetails.cuisineTypes.map((cuisine, index) => (
                  <Badge key={index} variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Cake-specific sections */}
          {isCakeSpecialist && serviceDetails.cakeFlavors?.length > 0 && (
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

          {serviceDetails.specialties?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
                <Star className="w-4 h-4" />
                Specialties
              </h4>
              <div className="flex flex-wrap gap-2">
                {serviceDetails.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {serviceDetails.dietaryOptions?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Dietary Options
              </h4>
              <div className="flex flex-wrap gap-2">
                {serviceDetails.dietaryOptions.map((diet, index) => (
                  <Badge key={index} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {renderAgeGroups(serviceDetails.ageGroups)}
        </CardContent>
      </Card>

      {/* Equipment & Service Capabilities */}
      {serviceDetails.equipment && Object.keys(serviceDetails.equipment).some(key => serviceDetails.equipment[key] !== undefined) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isCakeSpecialist ? 'Cake Services & Delivery Options' : 'Equipment & Service Capabilities'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {isCakeSpecialist ? (
                // Cake-specific services
                <>
                  {serviceDetails.equipment.cakeDelivery !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 ${serviceDetails.equipment.cakeDelivery ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-gray-700">Delivery service available</span>
                    </div>
                  )}
                  
                  {serviceDetails.equipment.cakeSetup !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 ${serviceDetails.equipment.cakeSetup ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-gray-700">Setup cake at venue</span>
                    </div>
                  )}
                  
                  {serviceDetails.equipment.cakeStand !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 ${serviceDetails.equipment.cakeStand ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-gray-700">Provide cake stands/pedestals</span>
                    </div>
                  )}
                  
                  {serviceDetails.equipment.cakeCandles !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 ${serviceDetails.equipment.cakeCandles ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-gray-700">Include candles and cake server</span>
                    </div>
                  )}
                </>
              ) : (
                // Food catering services
                <>
                  {serviceDetails.equipment.providesServing !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 ${serviceDetails.equipment.providesServing ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-gray-700">Provide serving dishes and utensils</span>
                    </div>
                  )}
                  
                  {serviceDetails.equipment.providesStaff !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 ${serviceDetails.equipment.providesStaff ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-gray-700">Provide serving staff</span>
                    </div>
                  )}
                  
                  {serviceDetails.equipment.providesEquipment !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 ${serviceDetails.equipment.providesEquipment ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-gray-700">Provide tables and chairs</span>
                    </div>
                  )}
                  
                  {serviceDetails.equipment.needsPower !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 ${serviceDetails.equipment.needsPower ? 'text-orange-600' : 'text-green-600'}`} />
                      <span className="text-gray-700">
                        {serviceDetails.equipment.needsPower ? 'Requires power supply at venue' : 'No power supply needed'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Details & Credentials */}
      {serviceDetails.businessDetails && Object.keys(serviceDetails.businessDetails).some(key => serviceDetails.businessDetails[key]) && (
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
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Licenses & Certifications
                </h4>
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

            {serviceDetails.businessDetails.signature && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Signature Dish/Specialty</h4>
                <p className="text-gray-700 italic">{serviceDetails.businessDetails.signature}</p>
              </div>
            )}

            {serviceDetails.businessDetails.inspiration && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">What Inspires Us</h4>
                <p className="text-gray-700">{serviceDetails.businessDetails.inspiration}</p>
              </div>
            )}

            {serviceDetails.businessDetails.story && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Our Story</h4>
                <p className="text-gray-700 leading-relaxed">{serviceDetails.businessDetails.story}</p>
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
              {serviceDetails.pricing.priceFrom && serviceDetails.pricing.priceTo && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Price Range</h4>
                  <p className="text-gray-700">
                    £{serviceDetails.pricing.priceFrom} - £{serviceDetails.pricing.priceTo} per {serviceDetails.pricing.model?.replace('_', ' ') || 'person'}
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
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Fee</h4>
                  <p className="text-gray-700">£{serviceDetails.pricing.deliveryFee}</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              About Our {isCakeSpecialist ? 'Cake' : 'Catering'} Service
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">{serviceDetails.aboutService}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CateringDisplay;