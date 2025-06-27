import { Card, CardContent } from "@/components/ui/card"
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
  BuildingIcon,
  CheckCircle,
  Sparkles,
  Award,
  Zap,
} from "lucide-react"

export default function SupplierServiceDetails({ supplier }) {
  const serviceDetails = supplier?.serviceDetails

  if (!serviceDetails) {
    return (
      <div className="md:hidden space-y-4">
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
                <div key={i} className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-br hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))]`}>
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

  const serviceType = supplier?.category || "entertainment"
  const isVenue = serviceType?.toLowerCase().includes("venue") || serviceType === "Venues"

  return (
    <div className="space-y-z">
      {/* About Service - Clean White */}
      {(serviceDetails.aboutService || serviceDetails.serviceHighlights) && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">The Magic Behind Our Service ✨</h2>
                <p className="text-gray-600">Here's what makes us absolutely amazing</p>
              </div>
            </div>
            
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
            
            {serviceDetails.serviceHighlights && (
              <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-2xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  🌟 Why We're Simply The Best
                </h3>
                <div className="text-gray-700 space-y-3">
                  {serviceDetails.serviceHighlights.split('\n').map((highlight, index) => (
                    highlight.trim() && (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-primary-600 mt-1">•</span>
                        <span className="leading-relaxed">{highlight.trim()}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Venue Details */}
      {isVenue && serviceDetails.venueDetails && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <BuildingIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">🏛️ Your Perfect Venue Awaits</h2>
                <p className="text-gray-600">Everything you need for an epic celebration</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {serviceDetails.venueDetails.venueType && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🎪 Venue Vibe
                  </h4>
                  <p className="text-gray-700">{serviceDetails.venueDetails.venueType}</p>
                </div>
              )}
              {serviceDetails.venueDetails.capacity && (
                <div className="p-4 bg-gradient-to-br from-white to-primary-50/40 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    👥 Party Size
                  </h4>
                  <p className="text-gray-700">Up to {serviceDetails.venueDetails.capacity} amazing guests!</p>
                </div>
              )}
            </div>
            
            {serviceDetails.venueDetails.facilities?.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">🎯 Epic Facilities Included</h4>
                <div className="flex flex-wrap gap-3">
                  {serviceDetails.venueDetails.facilities.map((facility, index) => (
                    <Badge key={index} className="bg-primary-200 hover:bg-[hsl(var(--primary-300))] text-gray-900 px-3 py-1 text-sm font-medium transition-colors duration-200">
                      ✅ {facility}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Specialties */}
      {!isVenue && (serviceDetails.serviceIncludes?.actType || serviceDetails.serviceIncludes?.performanceOptions?.length > 0) && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">🎭 Our Superpowers</h2>
                <p className="text-gray-600">These are the things we absolutely rock at</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {serviceDetails.serviceIncludes.actType && (
                <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-[hsl(var(--primary-500))]">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    ⭐ What We Do Best
                  </h4>
                  <p className="text-gray-700 font-medium">{serviceDetails.serviceIncludes.actType}</p>
                </div>
              )}
              {serviceDetails.serviceIncludes.travelRadius && (
                <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-[hsl(var(--primary-600))]">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🚗 We'll Come To You
                  </h4>
                  <p className="text-gray-700 font-medium">Within {serviceDetails.serviceIncludes.travelRadius} miles of pure fun!</p>
                </div>
              )}
            </div>
            
            {serviceDetails.serviceIncludes.performanceOptions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">🎨 Choose Your Adventure</h4>
                <div className="flex flex-wrap gap-3">
                  {serviceDetails.serviceIncludes.performanceOptions.map((option, index) => (
                    <Badge key={index} className="bg-gradient-to-r from-primary-200 to-primary-300 hover:from-[hsl(var(--primary-300))] hover:to-[hsl(var(--primary-400))] text-gray-900 px-3 py-1 text-sm font-medium transition-all duration-200">
                      🎪 {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {(serviceDetails.certifications?.dbsCertificate || serviceDetails.certifications?.publicLiability || serviceDetails.certifications?.firstAid) && (
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
                <div className="p-5 bg-gradient-to-br from-white to-primary-50/30 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-br hover:from-[hsl(var(--primary-50))] hover:to-[hsl(var(--primary-100))] border-t-4 border-[hsl(var(--primary-500))]">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-gray-900">✅ Background Checked</div>
                  <div className="text-gray-600 text-sm mt-1">DBS Certified Professional</div>
                </div>
              )}
              {serviceDetails.certifications.publicLiability && (
                <div className="p-5 bg-gradient-to-br from-white to-primary-50/30 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-br hover:from-[hsl(var(--primary-50))] hover:to-[hsl(var(--primary-100))] border-t-4 border-[hsl(var(--primary-600))]">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-gray-900">🛡️ Fully Insured</div>
                  <div className="text-gray-600 text-sm mt-1">Public Liability Covered</div>
                </div>
              )}
              {serviceDetails.certifications.firstAid && (
                <div className="p-5 bg-gradient-to-br from-white to-primary-50/30 rounded-xl shadow-md text-center hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-br hover:from-[hsl(var(--primary-50))] hover:to-[hsl(var(--primary-100))] border-t-4 border-[hsl(var(--primary-700))]">
                  <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
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
      {serviceDetails.personalBio && Object.values(serviceDetails.personalBio).some((value) => value) && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">👋 Meet Your Party Hero</h2>
                <p className="text-gray-600">The amazing person behind the magic</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {serviceDetails.personalBio.yearsExperience > 0 && (
                  <div className="text-center p-5 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl hover:from-[hsl(var(--primary-200))] hover:to-[hsl(var(--primary-300))] transition-all duration-300 shadow-md">
                    <Calendar className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">🎉 Experience</h4>
                    <p className="text-gray-700 text-xl font-bold">{serviceDetails.personalBio.yearsExperience} Years</p>
                    <p className="text-gray-600 text-sm">of creating smiles!</p>
                  </div>
                )}
                {serviceDetails.personalBio.inspiration && (
                  <div className="text-center p-5 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl hover:from-[hsl(var(--primary-200))] hover:to-[hsl(var(--primary-300))] transition-all duration-300 shadow-md">
                    <Heart className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">💖 Inspiration</h4>
                    <p className="text-gray-700 font-medium">{serviceDetails.personalBio.inspiration}</p>
                  </div>
                )}
              </div>
              
              {serviceDetails.personalBio.personalStory && (
                <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl p-5 shadow-md border-l-4 border-[hsl(var(--primary-500))]">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📖 My Story
                  </h4>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    {serviceDetails.personalBio.personalStory.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="italic">
                        "{paragraph.trim()}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duration & Pricing */}
      {(serviceDetails.durationOptions || serviceDetails.pricingInfo?.priceDescription) && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">⏰ Time & Investment</h2>
                <p className="text-gray-600">Great value for unforgettable memories</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.durationOptions && (
                <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2">🕐 Duration Options</h4>
                  <p className="text-gray-700 text-lg font-bold">
                    {serviceDetails.durationOptions.minHours} - {serviceDetails.durationOptions.maxHours} Hours
                  </p>
                  <p className="text-gray-600 text-sm mt-1">of pure entertainment!</p>
                </div>
              )}
              {serviceDetails.pricingInfo?.pricingModel && (
                <div className="p-5 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h4 className="font-semibold text-gray-900 mb-2">💰 Pricing Style</h4>
                  <Badge className="bg-primary-200 text-gray-800 px-3 py-1 text-sm hover:bg-[hsl(var(--primary-300))] transition-colors duration-200">
                    {serviceDetails.pricingInfo.pricingModel.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </div>
              )}
            </div>
            
            {serviceDetails.pricingInfo?.priceDescription && (
              <div className="mt-6 p-5 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl shadow-md">
                <h4 className="font-semibold text-gray-900 mb-3">💡 How Our Pricing Works</h4>
                <div className="text-gray-700 space-y-2">
                  {serviceDetails.pricingInfo.priceDescription.split('\n').map((line, index) => (
                    line.trim() && (
                      <p key={index} className="font-medium">{line.trim()}</p>
                    )
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}