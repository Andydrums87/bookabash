"use client"

import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Check, Clock, Calendar, CheckCircle, ImageIcon, XIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function SupplierHeader({
  supplier,
  portfolioImages,
  getSupplierInPartyDetails,
  getAddToPartyButtonState,
  handleAddToPlan,
}) {
  const [showGallerySheet, setShowGallerySheet] = useState(false)

  // Close gallery on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showGallerySheet) {
        setShowGallerySheet(false)
      }
    }
    
    if (showGallerySheet) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showGallerySheet])

  if (!supplier) return null

  const headerGalleryImages = portfolioImages || []
  const mainDisplayImage = headerGalleryImages[0] || {
    image: supplier.coverPhoto || supplier.image || "/placeholder.png",
    alt: supplier.name || "Supplier main image",
  }
  const smallImage1 = headerGalleryImages[1] // Will be top-right
  const smallImage2 = headerGalleryImages[2] // Will be bottom-right

console.log(supplier)

  // Calculate remaining images for the bubble, after the main image and the two small ones
  const remainingImagesCount = Math.max(0, headerGalleryImages.length - 3)

  const { inParty } = getSupplierInPartyDetails()
  const firstPackageId = supplier.packages?.[0]?.id || "basic"
  const mainButtonState = getAddToPartyButtonState(firstPackageId)

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Desktop Header Image Gallery */}
      <div className="hidden md:block h-[400px] lg:h-[450px] relative bg-rose-50 overflow-hidden p-2">
        <div className="flex gap-2 h-full">
          {/* Main Image (70%) */}
          <div
            className="flex-[0_0_70%] relative rounded-l-2xl rounded-r-[60px] overflow-hidden cursor-pointer group shadow-lg"
            onClick={() => setShowGallerySheet(true)}
          >
            <Image
              src={mainDisplayImage.image || "/placeholder.png"}
              alt={mainDisplayImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>

          {/* Right Column for Small Images & Bubble (30%) */}
          <div className="flex-[0_0_30%] flex flex-col gap-2 h-full">
            {/* Top Small Image */}
            <div
              className="flex-1 relative rounded-3xl overflow-hidden cursor-pointer group shadow-md"
              onClick={() => setShowGallerySheet(true)}
            >
              {smallImage1 ? (
                <Image
                  src={smallImage1.image || "/placeholder.png"}
                  alt={smallImage1.alt || "Portfolio image 2"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-rose-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-rose-300" />
                </div>
              )}
            </div>

            {/* Bottom Small Image with Potential Overlay */}
            <div
              className="flex-1 relative rounded-3xl overflow-hidden shadow-md cursor-pointer group"
              onClick={() => setShowGallerySheet(true)}
            >
              {smallImage2 ? (
                <Image
                  src={smallImage2.image || "/placeholder.png"}
                  alt={smallImage2.alt || "Portfolio image 3"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-rose-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-rose-300" />
                </div>
              )}
              {/* Overlay for remaining images count */}
              {remainingImagesCount > 0 && (
                <div className="absolute inset-0 bg-[#A4C4C4]/70  flex items-center justify-center text-gray-800 font-bold text-3xl shadow-inner group-hover:bg-[#93B3B3]/80 transition-colors">
                  +{remainingImagesCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={showGallerySheet} onOpenChange={setShowGallerySheet}>
        {/* Mobile Header Image - Full width */}
        <div className="md:hidden relative h-75 sm:h-80">
          <Image
            src={mainDisplayImage.image || "/placeholder.png"}
            alt={mainDisplayImage.alt}
            fill
            className="object-cover rounded-b-3xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-b-3xl" />
          <div className="absolute bottom-4 right-4">
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg px-4 py-2"
              >
                <ImageIcon className="w-4 h-4 mr-2" /> View Gallery ({portfolioImages.length})
              </Button>
            </SheetTrigger>
          </div>
        </div>

        {/* Content Section (Avatar, Name, Badges, Description) - Wrapped in a container */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 w-full">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg -mt-16 md:-mt-20 flex-shrink-0 z-10 rounded-3xl">
              <AvatarImage
                src={supplier.avatar || "/placeholder.png"}
                alt={supplier.name}
                className="rounded-2xl"
              />
              <AvatarFallback className="text-gray-700 bg-gray-100 text-2xl font-bold rounded-2xl">
                {supplier.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2 md:pt-0">
              <div className="flex flex-wrap items-center gap-3 md:gap-3 mb-2 md:mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{supplier.name}</h1>
                {supplier.verified && (
                  <Badge className="bg-gray-900 text-white md:text-sm py-1 px-3 rounded-full">
                    <Check className="w-3 h-3 mr-1.5" />
                    Verified
                  </Badge>
                )}
                {supplier.highlyRated && (
                  <Badge className="bg-yellow-500 text-white text-sm py-1 px-3 rounded-full">
                    <Star className="w-3 h-3 mr-1.5 fill-white" />
                    Highly Rated
                  </Badge>
                )}
                {inParty && (
                  <Badge className="bg-green-500 text-white text-sm py-1 px-3 rounded-full">
                    <CheckCircle className="w-3 h-3 mr-1.5" />
                    In Party
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3 md:mb-4 text-sm md:text-base">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{supplier.rating}</span>
                  <span className="text-gray-600">({supplier.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{supplier.location}</span>
                </div>
                {supplier.fastResponder && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Fast Responder</span>
                  </div>
                )}
              </div>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4 md:mb-6 max-w-2xl">
                {supplier.description}
              </p>
              <div className="hidden md:flex gap-3">
                <Button
                  className={`py-3 px-6 rounded-xl ${mainButtonState.className}`}
                  disabled={mainButtonState.disabled}
                  onClick={() => handleAddToPlan()}
                >
                  {mainButtonState.text}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-xl"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Check Availability
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Sheet with Close Button */}
        <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col rounded-t-2xl">
          <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
            <SheetTitle>Portfolio Gallery ({portfolioImages.length})</SheetTitle>
            {/* Close button for gallery sheet */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowGallerySheet(false)}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {portfolioImages.map((item, index) => (
                <div
                  key={item.id || index}
                  className="relative aspect-square bg-gray-200 rounded-2xl overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.alt || item.title || `Image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}