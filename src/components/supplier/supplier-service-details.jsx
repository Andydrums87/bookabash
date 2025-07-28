import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Info,
  Star,
  Users,
  Clock,
  Settings,
  Shield,
  User,
  Calendar,
  Heart,
  Building,
  CheckCircle,
  Sparkles,
  Award,
  Zap,
  MapPin,
  ChefHat,
  Camera,
  Music,
  Target,
  Accessibility,
  Gift
} from "lucide-react"

export default function SupplierServiceDetails({ supplier }) {
  const serviceDetails = supplier?.serviceDetails
  const serviceType = supplier?.category || supplier?.serviceType || "entertainment"

  if (!serviceDetails) {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">About This Amazing Service</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {supplier?.description || "Get ready for an unforgettable experience that will create magical memories for years to come! 🎉"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">What Makes Us Special</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { text: "Mind-Blowing Magic", emoji: "✨", color: "from-primary-400 to-primary-500" },
                { text: "Balloon Artistry", emoji: "🎈", color: "from-primary-300 to-primary-400" },
                { text: "Face Painting Fun", emoji: "🎨", color: "from-primary-500 to-primary-600" },
                { text: "Interactive Games", emoji: "🎲", color: "from-primary-200 to-primary-300" }
              ].map((item, i) => (
                <div key={i} className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-semibold text-lg">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isEntertainer = serviceType?.toLowerCase().includes("entertain") || serviceType === "Entertainment"
  const isVenue = serviceType?.toLowerCase().includes("venue") || serviceType === "Venues"
  const isCatering = serviceType?.toLowerCase().includes("catering") || serviceType === "Catering"

  // Category definitions
  const categories = {
    'enhancement': { emoji: '✨', label: 'Enhancement' },
    'time': { emoji: '⏰', label: 'Time Extension' },
    'premium': { emoji: '🌟', label: 'Premium Upgrade' },
    'logistics': { emoji: '🚗', label: 'Logistics' },
    'seasonal': { emoji: '🎄', label: 'Seasonal' }
  }

  return (
    <div className="space-y-6">
      {/* About Service */}
      {(serviceDetails.aboutService || serviceDetails.serviceHighlights) && (
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="py-8 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              The Magic Behind Our Service ✨
            </CardTitle>
            <CardDescription className="text-base">
              Here's what makes us absolutely amazing
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            
            {serviceDetails.aboutService && (
              <div className="mb-8">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="prose prose-lg max-w-none">
                    {serviceDetails.aboutService.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
{/*             
            {serviceDetails.serviceHighlights && serviceDetails.serviceHighlights.length > 0 && (
              <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-2xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  🌟 Why We're Simply The Best
                </h3>
                <div className="text-gray-700 space-y-3">
                  {serviceDetails?.serviceHighlights && serviceDetails?.serviceHighlights?.map((highlight, index) => (
                    highlight && (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-primary-600 mt-1">•</span>
                        <span className="leading-relaxed">{highlight}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )} */}
          </CardContent>
        </Card>
      )}

      {/* ENTERTAINER SPECIFIC DETAILS */}
      {isEntertainer && (
        <>
          {/* Performance Details */}
          <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] pt-8">
          <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">🎭 Our Entertainment Superpowers</h2>
                  <p className="text-gray-600">What makes our performances absolutely magical</p>
                </div>
              </div>
          </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {serviceDetails.performerType && (
                  <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      ⭐ What We Do Best
                    </h4>
                    <p className="text-gray-700 font-medium">{serviceDetails.performerType}</p>
                  </div>
                )}
                
                {serviceDetails.travelRadius && (
                  <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      🚗 We'll Come To You
                    </h4>
                    <p className="text-gray-700 font-medium">Within {serviceDetails.travelRadius} miles of pure fun!</p>
                  </div>
                )}

                {(serviceDetails.groupSizeMin || serviceDetails.groupSizeMax) && (
                  <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      👥 Group Size
                    </h4>
                    <p className="text-gray-700 font-medium">
                      {serviceDetails.groupSizeMin && serviceDetails.groupSizeMax 
                        ? `${serviceDetails.groupSizeMin} - ${serviceDetails.groupSizeMax} guests`
                        : serviceDetails.groupSizeMin 
                        ? `From ${serviceDetails.groupSizeMin} guests`
                        : `Up to ${serviceDetails.groupSizeMax} guests`
                      }
                    </p>
                  </div>
                )}

                {serviceDetails.equipment && (
                  <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      🎪 Equipment Provided
                    </h4>
                    <p className="text-gray-700">{serviceDetails.equipment}</p>
                  </div>
                )}

                {serviceDetails.setupTime && (
                  <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      ⏰ Setup Time
                    </h4>
                    <p className="text-gray-700">{serviceDetails.setupTime} minutes</p>
                  </div>
                )}

                {serviceDetails.specialSkills && (
                  <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      ⭐ Special Skills
                    </h4>
                    <p className="text-gray-700">{serviceDetails.specialSkills}</p>
                  </div>
                )}
              </div>

              {/* Age Groups */}
              {serviceDetails.ageGroups && serviceDetails.ageGroups.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    🎯 Perfect For These Ages
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {serviceDetails.ageGroups.map((age, index) => (
                      <Badge key={index} className="bg-primary-200 hover:bg-primary-300 text-gray-900 px-3 py-1 text-sm font-medium transition-colors duration-200">
                        👶 {age}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Performance Styles */}
              {serviceDetails.performanceStyle && serviceDetails.performanceStyle.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">🎨 Performance Styles</h4>
                  <div className="flex flex-wrap gap-3">
                    {serviceDetails.performanceStyle.map((style, index) => (
                      <Badge key={index} className="bg-gradient-to-r from-primary-200 to-primary-300 hover:from-primary-300 hover:to-primary-400 text-gray-900 px-3 py-1 text-sm font-medium transition-all duration-200">
                        🎪 {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Themes */}
              {serviceDetails.themes && serviceDetails.themes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">🌟 Available Themes</h4>
                  <div className="flex flex-wrap gap-3">
                    {serviceDetails.themes.map((theme, index) => (
                      <Badge key={index} className="bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-300 hover:to-pink-300 text-gray-900 px-3 py-1 text-sm font-medium transition-all duration-200">
                        ✨ {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add-on Services - Objects Only */}
          {/* {serviceDetails.addOnServices && serviceDetails.addOnServices.length > 0 && (
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="py-8 bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  🎁 Optional Add-on Services
                </CardTitle>
                <CardDescription className="text-base">
                  Extra magic to make your party even more special
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceDetails.addOnServices.map((addon) => {
                    const categoryInfo = categories[addon.category] || null
                    
                    return (
                      <div key={addon.id} className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-amber-400">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xl">✨</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold text-gray-900">{addon.name}</span>
                                {categoryInfo && (
                                  <span className="text-xs px-2 py-1 bg-amber-400 text-white rounded-full">
                                    {categoryInfo.emoji} {categoryInfo.label}
                                  </span>
                                )}
                              </div>
                              {addon.description && (
                                <p className="text-xs text-gray-600">{addon.description}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-amber-600 font-bold ml-2">£{addon.price}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-amber-100 rounded-xl">
                  <p className="text-sm text-amber-800 font-medium">
                    💡 These optional extras can be added to any package. Contact us for custom pricing!
                  </p>
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Performance Requirements */}
          {serviceDetails.performanceSpecs && (serviceDetails.performanceSpecs.spaceRequired || serviceDetails.performanceSpecs.powerRequired || serviceDetails.performanceSpecs.supervisionRequired) && (
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="py-8 bg-gradient-to-r from-red-50 to-red-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  📋 What We Need for the Perfect Show
                </CardTitle>
                <CardDescription className="text-base">
                  Simple requirements to ensure an amazing performance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                
                <div className="grid md:grid-cols-2 gap-6">
                  {serviceDetails.performanceSpecs.spaceRequired && (
                    <div className="p-5 bg-white rounded-xl shadow-md border-l-4 border-red-400">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        📐 Space Required
                      </h4>
                      <p className="text-gray-700">{serviceDetails.performanceSpecs.spaceRequired}</p>
                    </div>
                  )}
                  
                  {serviceDetails.performanceSpecs.powerRequired && (
                    <div className="p-5 bg-white rounded-xl shadow-md border-l-4 border-red-400">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        ⚡ Power Required
                      </h4>
                      <p className="text-gray-700">Standard power outlet needed</p>
                    </div>
                  )}
                  
                  {serviceDetails.performanceSpecs.supervisionRequired && (
                    <div className="p-5 bg-white rounded-xl shadow-md border-l-4 border-red-400">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        👨‍👩‍👧‍👦 Adult Supervision
                      </h4>
                      <p className="text-gray-700">At least one responsible adult must be present</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-5 bg-gradient-to-r from-red-100 to-red-200 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">🛡️ Safety First</h4>
                  <p className="text-gray-700 text-sm">
                    These simple requirements ensure both the children's safety and the best possible performance. 
                    We're fully insured and follow all safeguarding guidelines.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* VENUE SPECIFIC DETAILS */}
      {isVenue && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">🏛️ Your Perfect Venue Awaits</h2>
                <p className="text-gray-600">Everything you need for an epic celebration</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {serviceDetails.venueType && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🎪 Venue Type
                  </h4>
                  <p className="text-gray-700">{serviceDetails.venueType}</p>
                </div>
              )}
              {serviceDetails.capacity && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    👥 Capacity
                  </h4>
                  <p className="text-gray-700">Up to {serviceDetails.capacity} amazing guests!</p>
                </div>
              )}
              {serviceDetails.indoorOutdoor && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🌤️ Setting
                  </h4>
                  <p className="text-gray-700">{serviceDetails.indoorOutdoor}</p>
                </div>
              )}
              {serviceDetails.parkingSpaces && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🚗 Parking
                  </h4>
                  <p className="text-gray-700">{serviceDetails.parkingSpaces}</p>
                </div>
              )}
              {serviceDetails.bookingNotice && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    📅 Booking Notice
                  </h4>
                  <p className="text-gray-700">{serviceDetails.bookingNotice} days minimum</p>
                </div>
              )}
              {serviceDetails.securityDeposit && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    💰 Security Deposit
                  </h4>
                  <p className="text-gray-700">{serviceDetails.securityDeposit}</p>
                </div>
              )}
            </div>
            
            {serviceDetails.facilities && serviceDetails.facilities.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">🎯 Epic Facilities Included</h4>
                <div className="flex flex-wrap gap-3">
                  {serviceDetails.facilities.map((facility, index) => (
                    <Badge key={index} className="bg-primary-200 hover:bg-primary-300 text-gray-900 px-3 py-1 text-sm font-medium transition-colors duration-200">
                      ✅ {facility}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {serviceDetails.cateringOptions && serviceDetails.cateringOptions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">🍽️ Catering Options</h4>
                <div className="flex flex-wrap gap-3">
                  {serviceDetails.cateringOptions.map((option, index) => (
                    <Badge key={index} className="bg-green-200 hover:bg-green-300 text-gray-900 px-3 py-1 text-sm font-medium transition-colors duration-200">
                      🍴 {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {serviceDetails.accessibility && (
              <div className="mb-6 p-5 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl shadow-md">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Accessibility className="w-5 h-5" />
                  ♿ Accessibility Features
                </h4>
                <p className="text-gray-700">{serviceDetails.accessibility}</p>
              </div>
            )}

            {serviceDetails.ageRestrictions && (
              <div className="p-5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl shadow-md">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  📋 Policies & Restrictions
                </h4>
                <p className="text-gray-700">{serviceDetails.ageRestrictions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CATERING SPECIFIC DETAILS */}
      {isCatering && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">🍽️ Delicious Catering Services</h2>
                <p className="text-gray-600">Tasty treats for your special celebration</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {serviceDetails.cateringType && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md">
                  <h4 className="font-semibold text-gray-900 mb-2">🍰 Catering Style</h4>
                  <p className="text-gray-700">{serviceDetails.cateringType}</p>
                </div>
              )}
              {serviceDetails.servingStyle && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md">
                  <h4 className="font-semibold text-gray-900 mb-2">🎪 Service Style</h4>
                  <p className="text-gray-700">{serviceDetails.servingStyle}</p>
                </div>
              )}
              {(serviceDetails.groupSizeMin || serviceDetails.groupSizeMax) && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    👥 Group Size
                  </h4>
                  <p className="text-gray-700">
                    {serviceDetails.groupSizeMin && serviceDetails.groupSizeMax 
                      ? `${serviceDetails.groupSizeMin} - ${serviceDetails.groupSizeMax} guests`
                      : serviceDetails.groupSizeMin 
                      ? `From ${serviceDetails.groupSizeMin} guests`
                      : `Up to ${serviceDetails.groupSizeMax} guests`
                    }
                  </p>
                </div>
              )}
              {serviceDetails.setupTime && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    ⏰ Setup Time
                  </h4>
                  <p className="text-gray-700">{serviceDetails.setupTime} minutes</p>
                </div>
              )}
            </div>

            {serviceDetails.cuisineTypes && serviceDetails.cuisineTypes.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">🌍 Cuisine Types</h4>
                <div className="flex flex-wrap gap-3">
                  {serviceDetails.cuisineTypes.map((cuisine, index) => (
                    <Badge key={index} className="bg-primary-200 hover:bg-primary-300 text-gray-900 px-3 py-1 text-sm font-medium">
                      🍽️ {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {serviceDetails.serviceStyle && serviceDetails.serviceStyle.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">🎯 Service Styles</h4>
                <div className="flex flex-wrap gap-3">
                  {serviceDetails.serviceStyle.map((style, index) => (
                    <Badge key={index} className="bg-blue-200 hover:bg-blue-300 text-gray-900 px-3 py-1 text-sm font-medium">
                      🎪 {style}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {serviceDetails.dietaryOptions && serviceDetails.dietaryOptions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">🥗 Dietary Options</h4>
                <div className="flex flex-wrap gap-3">
                  {serviceDetails.dietaryOptions.map((option, index) => (
                    <Badge key={index} className="bg-green-200 hover:bg-green-300 text-gray-900 px-3 py-1 text-sm font-medium">
                      ✅ {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {serviceDetails.kitchenRequired && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  🍳 Kitchen Required
                </h4>
                <p className="text-gray-700">Kitchen facilities needed at venue</p>
              </div>
            )}

            {serviceDetails.equipmentProvided && (
              <div className="mb-6 p-5 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl shadow-md">
                <h4 className="font-semibold text-gray-900 mb-3">🎪 Equipment & Supplies Provided</h4>
                <p className="text-gray-700">{serviceDetails.equipmentProvided}</p>
              </div>
            )}

            {serviceDetails.menuSamples && (
              <div className="mb-6 p-5 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl shadow-md">
                <h4 className="font-semibold text-gray-900 mb-3">🍴 Sample Menus & Specialties</h4>
                <p className="text-gray-700">{serviceDetails.menuSamples}</p>
              </div>
            )}

            {serviceDetails.allergeyPolicies && (
              <div className="p-5 bg-gradient-to-r from-red-100 to-red-200 rounded-xl shadow-md">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  🛡️ Allergy & Safety Policies
                </h4>
                <p className="text-gray-700">{serviceDetails.allergeyPolicies}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certifications - Works for all service types */}
      {serviceDetails.certifications && (serviceDetails.certifications.dbsCertificate || serviceDetails.certifications.publicLiability || serviceDetails.certifications.firstAid) && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">🛡️ Safety First, Fun Always</h2>
                <p className="text-gray-600">Your peace of mind is our priority</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {serviceDetails.certifications.dbsCertificate && (
                <div className="p-5 bg-gradient-to-br from-white to-primary-50/30 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 border-t-4 border-primary">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-gray-900">✅ Background Checked</div>
                  <div className="text-gray-600 text-sm mt-1">DBS Certified Professional</div>
                </div>
              )}
              {serviceDetails.certifications.publicLiability && (
                <div className="p-5 bg-gradient-to-br from-white to-primary-50/30 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 border-t-4 border-primary">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-gray-900">🛡️ Fully Insured</div>
                  <div className="text-gray-600 text-sm mt-1">Public Liability Covered</div>
                </div>
              )}
              {serviceDetails.certifications.firstAid && (
                <div className="p-5 bg-gradient-to-br from-white to-primary-50/30 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 border-t-4 border-primary">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-gray-900">❤️ First Aid Trained</div>
                  <div className="text-gray-600 text-sm mt-1">Safety Expert On Board</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Bio */}
    
    </div>
  )
}