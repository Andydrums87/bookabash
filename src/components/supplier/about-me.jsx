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
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutMeComponent({ supplier }) {
  const owner = supplier?.owner
  const serviceDetails = supplier?.serviceDetails
  const serviceType = supplier?.category || supplier?.serviceType || "entertainment"
  
  // Don't show for venues
  const isVenue = serviceType?.toLowerCase().includes("venue") || serviceType === "Venues"
  if (isVenue) return null

  if (!owner && !serviceDetails?.personalBio) {
    return null
  }

  const personalBio = serviceDetails?.personalBio || {}
  const profilePhoto = owner?.profilePhoto
  const name = owner?.name || owner?.firstName ? `${owner?.firstName || ''} ${owner?.lastName || ''}`.trim() : supplier?.name
  const bio = owner?.bio || personalBio?.personalStory

  return (
    <Card className="bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header Section with Profile Photo */}
        <div className="relative bg-gradient-to-r from-primary-400 to-primary-600 px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-2xl bg-white">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-600">
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                )}
              </div>
              {/* Super Supplier Badge */}
              <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                ⭐ Super Supplier
              </div>
            </div>

            {/* Name & Title */}
            <div className="text-center md:text-left text-white">
              <h1 className="text-3xl text-gray-700 md:text-4xl font-bold mb-2">{name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge className="bg-primary-500 text-white hover:bg-[hsl(var(--primary-600))]">
                  {supplier?.rating || 5.0} ⭐ ({supplier?.reviewCount || 42} reviews)
                </Badge>
                <Badge className="bg-primary-500 text-white border-white/30 hover:bg-[hsl(var(--primary-600))]">
                  {supplier?.bookings || 74} bookings
                </Badge>
                <Badge className="bg-primary-500 text-white border-white/30 hover:bg-[hsl(var(--primary-600))]">
                  📍 {supplier?.travelRadius || 11} mi travel
                </Badge>
              </div>
              
              {/* Contact Button */}
              <Button 
                size="lg" 
                className="bg-white text-primary-600 hover:bg-primary-50 font-semibold px-8 shadow-lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                MESSAGE SUPPLIER
              </Button>
            </div>
          </div>
        </div>

        {/* Bio Content */}
        <div className="p-8 bg-white">
          {personalBio && Object.values(personalBio).some((value) => value) && (
            <div className="space-y-8">
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalBio.yearsExperience && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Years in events</h3>
                      <p className="text-gray-700 font-medium">
                        {personalBio.yearsExperience === '1' 
                          ? 'Over 1 year dazzling at Corporate and Private Functions'
                          : `Over ${personalBio.yearsExperience} years dazzling at Corporate and Private Functions`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {personalBio.inspiration && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Inspiration</h3>
                      <p className="text-gray-700 font-medium">{personalBio.inspiration}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Favorite Event */}
              {personalBio.favoriteEvent && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-400">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    Favourite event
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{personalBio.favoriteEvent}</p>
                </div>
              )}

              {/* Dream Celebrity */}
              {personalBio.dreamClient && (
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-400">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Dream celebrity
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{personalBio.dreamClient}</p>
                </div>
              )}

              {/* Personal Story */}
              {personalBio.personalStory && (
                <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border-l-4 border-primary-500">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-600" />
                    My Story
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{personalBio.personalStory}</p>
                </div>
              )}
            </div>
          )}

          {/* Fallback bio if no personal bio but has owner bio */}
          {(!personalBio || !Object.values(personalBio).some((value) => value)) && bio && (
            <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
              <h3 className="font-bold text-gray-900 text-lg mb-3">About Me</h3>
              <p className="text-gray-700 leading-relaxed">{bio}</p>
            </div>
          )}

          {/* No content fallback */}
          {(!personalBio || !Object.values(personalBio).some((value) => value)) && !bio && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-primary-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Getting to know {name?.split(' ')[0] || 'this supplier'}...</h3>
              <p className="text-gray-500">Personal details coming soon!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}