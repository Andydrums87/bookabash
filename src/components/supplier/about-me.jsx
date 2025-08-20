import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Calendar,
  Heart,
  Zap,
  Sparkles,
  MapPin,
  Mail,
  User,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutMeComponent({ supplier }) {
const owner = supplier.owner.name
  const serviceDetails = supplier?.serviceDetails
  const serviceType = supplier?.category || supplier?.serviceType || "entertainment"
  
  // Don't show for venues
  const isVenue = serviceType?.toLowerCase().includes("venue") || serviceType === "Venues"
  if (isVenue) return null

  if (!owner && !serviceDetails?.personalBio) {
    return null
  }

  const personalBio = serviceDetails?.personalBio || {}
  const profilePhoto = supplier.owner?.profilePhoto || "/placeholder.png"
  const name = owner?.name || owner?.firstName ? `${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() : supplier?.name
  const bio = owner?.bio || personalBio?.personalStory

  return (
    <Card className="border-gray-300 bg-white shadow-sm">
      <CardContent className="p-0">
        {/* Main Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-8 py-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="w-7 h-7 text-primary-600" />
            Meet the Snappy Supplier
          </h2>
        </div>

        <div className="p-8">
          {/* Profile Section with Name */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-4 ring-white shadow-lg">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">{supplier?.owner?.name}</h3>
              <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-300 px-3 py-1">
                ⭐ Super Supplier
              </Badge>
            </div>
          </div>

          {personalBio && Object.values(personalBio).some((value) => value) && (
            <div className="space-y-6">
              {/* Key Stats - Simple Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalBio.yearsExperience && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">Experience</h3>
                    </div>
                    <p className="text-gray-700">
                      {personalBio.yearsExperience === '1' 
                        ? 'Over 1 year in events'
                        : `Over ${personalBio.yearsExperience} years in events`
                      }
                    </p>
                  </div>
                )}

                {personalBio.inspiration && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">Inspiration</h3>
                    </div>
                    <p className="text-gray-700">{personalBio.inspiration}</p>
                  </div>
                )}
              </div>

              {/* Additional Details - Clean List */}
              <div className="space-y-4">
                {personalBio.favoriteEvent && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-600" />
                      Favourite Event
                    </h4>
                    <p className="text-gray-700">{personalBio.favoriteEvent}</p>
                  </div>
                )}

                {personalBio.dreamClient && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-600" />
                      Dream Celebrity
                    </h4>
                    <p className="text-gray-700">{personalBio.dreamClient}</p>
                  </div>
                )}

                {personalBio.personalStory && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      My Story
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{personalBio.personalStory}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback bio if no personal bio but has owner bio */}
          {(!personalBio || !Object.values(personalBio).some((value) => value)) && bio && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
              <p className="text-gray-700 leading-relaxed">{bio}</p>
            </div>
          )}

          {/* No content fallback */}
          {(!personalBio || !Object.values(personalBio).some((value) => value)) && !bio && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Getting to know {name?.split(' ')[0] || 'this supplier'}...</h3>
              <p className="text-gray-500">Personal details coming soon!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}