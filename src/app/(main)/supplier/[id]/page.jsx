"use client"

import { useState } from "react"
import { useMemo } from "react";
import { useEffect } from "react";
import { use } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContextualBreadcrumb } from '@/components/ContextualBreadcrumb';
import { useContextualNavigation } from '@/hooks/useContextualNavigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSupplier } from '@/utils/mockBackend';
import { usePartyPlan } from '@/utils/partyPlanBackend'; 
// Add this import at the top of your supplier profile page
import ServiceDetailsDisplay from "../serviceDetailsDisplay";
import { suppliersAPI } from '@/utils/mockBackend'
import {
  Star,
  MapPin,
  Calendar,
  Shield,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Award,
  CheckCircle,
  Phone,
  Mail,
  Share,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  Menu,
  AlertCircle,
  Info,
  Users,
  Settings,
  User,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SupplierProfilePage({ params }) {

 
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedPackageId, setSelectedPackageId] = useState('premium')
  const [selectedImage, setSelectedImage] = useState(null);
const [selectedImageIndex, setSelectedImageIndex] = useState(0);
const [showAllImages, setShowAllImages] = useState(false);


const [visibleImageCount, setVisibleImageCount] = useState(6);
  const [isAddingToPlan, setIsAddingToPlan] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  });
  const [selectedDate, setSelectedDate] = useState(15)
  const [showAllCredentials, setShowAllCredentials] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [notification, setNotification] = useState(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const resolvedParams = use(params);

  const id = useMemo(() => resolvedParams.id, [resolvedParams.id]);

  console.log('📍 Stable ID:', id);


  // const supplier = {
  //   id: "magic-moments",
  //   name: "Magic Moments Entertainment",
  //   avatar: "/placeholder.svg?height=80&width=80",
  //   rating: 4.9,
  //   reviewCount: 127,
  //   location: "London, UK",
  //   activeSince: "2020",
  //   description:
  //     "Professional children's entertainers specializing in superhero-themed parties. We bring magic, laughter, and unforgettable memories to your special day.",
  //   verified: true,
  //   highlyRated: true,
  //   fastResponder: true,
  //   responseTime: "Within 2 hours",
  //   phone: "+44 7123 456 789",
  //   email: "hello@magicmoments.co.uk",
  // }
  const { supplier: backendSupplier, loading: supplierLoading, error, refetch } = useSupplier(id);
  console.log('2. useSupplier returned');


  console.log('1. ID extracted:', id);
  const { partyPlan, addSupplier, addAddon, hasAddon } = usePartyPlan();



  const { navigateWithContext, navigationContext } = useContextualNavigation();
  console.log('4. useContextualNavigation returned');




  
  // FIXED CODE (add packages field):
  const supplier = useMemo(() => {
    if (!backendSupplier) return null;
    
    return {
      id: backendSupplier.id,
      name: backendSupplier.name,
      avatar: "/placeholder.jpg",
      rating: backendSupplier.rating,
      reviewCount: backendSupplier.reviewCount,
      location: backendSupplier.location,
      activeSince: "2020",
      description: backendSupplier.description,
      verified: true,
      highlyRated: backendSupplier.badges?.includes("Highly Rated") || false,
      fastResponder: true,
      responseTime: "Within 2 hours",
      phone: "+44 7123 456 789",
      email: "hello@" + backendSupplier.name.toLowerCase().replace(/[^a-z0-9]/g, '') + ".co.uk",
      image: backendSupplier.image,
      category: backendSupplier.category,
      priceFrom: backendSupplier.priceFrom,
      priceUnit: backendSupplier.priceUnit,
      badges: backendSupplier.badges,
      availability: backendSupplier.availability,
      packages: backendSupplier.packages || [], // ✅ ADD THIS LINE
      portfolioImages: backendSupplier.portfolioImages || [],
      portfolioVideos: backendSupplier.portfolioVideos || [],
      coverPhoto: backendSupplier.coverPhoto,
      workingHours: backendSupplier.workingHours,
      unavailableDates: backendSupplier.unavailableDates,
      busyDates: backendSupplier.busyDates,
      availabilityNotes: backendSupplier.availabilityNotes,
      advanceBookingDays: backendSupplier.advanceBookingDays,
      maxBookingDays: backendSupplier.maxBookingDays,
      serviceDetails: backendSupplier?.serviceDetails
    };
  }, [backendSupplier]);



  const packages = useMemo(() => {
    console.log('📦 Building packages for supplier:', supplier?.name);
    console.log('📦 Supplier packages data:', supplier?.packages);
    console.log('📦 Full supplier object:', supplier);
    
    if (!supplier) return [];
    
    // Use real packages if available
    if (supplier.packages && supplier.packages.length > 0) {
      console.log('📦 Using real packages from supplier profile:', supplier.packages);
      return supplier.packages.map((pkg, index) => ({
        id: pkg.id || `real-${index}`,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        features: pkg.whatsIncluded || [],
        popular: index === 0,
        description: pkg.description
      }));
    }
    
    // Improved fallback packages with proper defaults
    console.log('📦 Using fallback packages for:', supplier.name);
    
    // Safe defaults
    const basePrice = supplier.priceFrom || 100; // Default to £100 if no price
    const priceUnit = supplier.priceUnit || "per event"; // Default unit
    const category = supplier.category || "service"; // Default category
    const serviceName = category.toLowerCase();
    
    return [
      {
        id: "basic",
        name: "Basic Package",
        price: Math.round(basePrice * 1.0),
        duration: priceUnit,
        features: [
          "Standard service", 
          "Up to 15 children", 
          "Basic setup",
          "Professional service"
        ],
        description: `Basic ${serviceName} package with essential features`
      },
      {
        id: "premium",
        name: "Premium Package", 
        price: Math.round(basePrice * 1.5),
        duration: priceUnit,
        features: [
          "Enhanced service", 
          "Professional setup", 
          "Up to 25 children", 
          "Extended duration",
          "Additional features"
        ],
        popular: true,
        description: `Enhanced ${serviceName} package with premium features`
      },
      {
        id: "deluxe",
        name: "Deluxe Package",
        price: Math.round(basePrice * 2.0),
        duration: priceUnit,
        features: [
          "Premium service", 
          "Full setup & cleanup", 
          "Up to 35 children", 
          "Additional extras", 
          "Priority support",
          "Extended time"
        ],
        description: `Complete ${serviceName} package with all the extras`
      },
    ];
  }, [supplier]);

  const portfolioImages = useMemo(() => {
    // Use real portfolio images if available
    if (supplier?.portfolioImages && supplier.portfolioImages.length > 0) {
      console.log('📸 Using real portfolio images:', supplier.portfolioImages.length);
      return supplier.portfolioImages.map((img, index) => ({
        id: img.id,
        title: img.title || `Portfolio Image ${index + 1}`,
        image: img.src,
        description: img.description,
        alt: img.alt || img.title
      }));
    }
    
    // Fallback to main image if no portfolio
    console.log('📸 Using fallback image - no portfolio images found');
    return [{
      id: 'main',
      title: "Main Service Photo",
      image: supplier?.image || "/placeholder.jpg",
      description: `${supplier?.name} main service image`
    }];
  }, [supplier?.portfolioImages, supplier?.image, supplier?.name]);
  
const credentials = [
  {
    title: "DBS Certificate",
    subtitle: "Enhanced - Valid until Dec 2025",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    title: "Public Liability",
    subtitle: "£2M Coverage - Valid",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    title: "First Aid Certified",
    subtitle: "Pediatric First Aid - 2024",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    title: "ID Verified",
    subtitle: "Identity confirmed by BookABash",
    icon: <Award className="w-5 h-5" />,
  },
]

useEffect(() => {
  if (!supplierLoading && backendSupplier) {
    setHasLoadedOnce(true);
  }
}, [supplierLoading, backendSupplier]);

const getSupplierInPartyDetails = () => {
  if (!supplier) return { inParty: false, currentPackage: null, supplierType: null }
  
  const isInAddons = hasAddon(supplier.id)
  const mainSlots = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags']
  const supplierInMainSlot = mainSlots.find(slot => partyPlan[slot]?.id === supplier.id)
  
  if (isInAddons) {
    const addon = partyPlan.addons?.find(addon => addon.id === supplier.id)
    return { 
      inParty: true, 
      currentPackage: addon?.packageId || null, 
      supplierType: 'addon',
      currentSupplierData: addon
    }
  }
  
  if (supplierInMainSlot) {
    const supplierData = partyPlan[supplierInMainSlot]
    return { 
      inParty: true, 
      currentPackage: supplierData?.packageId || null, 
      supplierType: supplierInMainSlot,
      currentSupplierData: supplierData
    }
  }
  
  return { inParty: false, currentPackage: null, supplierType: null }
}

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


// const handleAddToPlan = async (packageId) => {
//   if (!supplier) return;
  
  
//   setSelectedPackage(packageId);
//   setIsAddingToPlan(true);
//   setLoadingStep(0);

//   try {
//     // Find the selected package
//     const selectedPkg = packages.find(pkg => pkg.id === packageId);
    
//     await new Promise((resolve) => setTimeout(resolve, 800));
//     setLoadingStep(1);

//     await new Promise((resolve) => setTimeout(resolve, 800));
//     setLoadingStep(2);

//     // CLEANER LOGIC: Determine if this should be added as main supplier or addon
//     // Based on what slots are available and supplier category
    
//     let result;
    
//     // Check supplier category and decide where it goes
//     if (supplier.category === 'Venues') {
//       // Always add venues as main supplier
//       result = await addSupplier(backendSupplier, selectedPkg);
//     } 
//     else if (supplier.category === 'Catering') {
//       // Always add catering as main supplier  
//       result = await addSupplier(backendSupplier, selectedPkg);
//     }
//     else if (supplier.category === 'Party Bags') {
//       // Always add party bags as main supplier
//       result = await addSupplier(backendSupplier, selectedPkg);
//     }
//     else if (supplier.category === 'Face Painting') {
//       // Face painting goes to facePainting slot
//       result = await addSupplier(backendSupplier, selectedPkg);
//     }
  
//     else if (supplier.category === 'Entertainment') {
      
//       // Entertainment can go to main entertainment slot OR addon
//       // Try main supplier first, if it fails, add as addon
//       result = await addSupplier(backendSupplier, selectedPkg);
      
//       if (!result.success && result.error?.includes('already')) {
//         // Main entertainment slot is full, add as addon instead
//         const addonData = {
//           id: supplier.id,
//           name: supplier.name,
//           description: supplier.description,
//           price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
//           image: supplier.image,
//           category: supplier.category,
//           duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
//           rating: supplier.rating,
//           reviewCount: supplier.reviewCount,
//           popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
//           limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
//           packageId: selectedPkg?.id || null
//         };
//         result = await addAddon(addonData);
//       }
//     }
//     else if (supplier.category === 'Activities') {
//       // Activities can go to face painting slot OR addon
//       result = await addSupplier(backendSupplier, selectedPkg);
      
//       if (!result.success && result.error?.includes('already')) {
//         // Face painting slot is full, add as addon instead
//         const addonData = {
//           id: supplier.id,
//           name: supplier.name,
//           description: supplier.description,
//           price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
//           image: supplier.image,
//           category: supplier.category,
//           duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
//           rating: supplier.rating,
//           reviewCount: supplier.reviewCount,
//           popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
//           limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
//           packageId: selectedPkg?.id || null
//         };
//         result = await addAddon(addonData);
//       }
//     }
//     else {
//       // Everything else (Photography, Decorations, etc.) goes to addons
//       const addonData = {
//         id: supplier.id,
//         name: supplier.name,
//         description: supplier.description,
//         price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
//         image: supplier.image,
//         category: supplier.category,
//         duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
//         rating: supplier.rating,
//         reviewCount: supplier.reviewCount,
//         popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
//         limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
//         packageId: selectedPkg?.id || null
//       };
//       result = await addAddon(addonData);
//     }

//     setLoadingStep(3);
//     await new Promise((resolve) => setTimeout(resolve, 800));
//     setLoadingStep(4);

//     if (result.success) {
//       // Show success notification
//       setNotification({
//         type: 'success',
//         message: `${supplier.name} has been added to your party plan!`
//       });
      
//       await new Promise((resolve) => setTimeout(resolve, 1000));
      
//       // Navigate back based on context
//       if (navigationContext === 'dashboard') {
//         navigateWithContext('/dashboard', 'supplier-detail');
//       } else {
//         router.push('/dashboard');
//       }
//     } else {
//       throw new Error(result.error || 'Failed to add to party plan');
//     }
    
//   } catch (error) {
//     console.error("Error adding to plan:", error);
//     setNotification({
//       type: 'error',
//       message: 'Failed to add to party plan. Please try again.'
//     });
//     setIsAddingToPlan(false);
//     setSelectedPackage(null);
//   }
// }

// 👈 ADD THIS FUNCTION TO GET BUTTON STATE


const handleAddToPlan = async () => {
  if (!supplier || !selectedPackageId) return;
  
  const partyDetails = getSupplierInPartyDetails()
  
  setIsAddingToPlan(true);
  setLoadingStep(0);

  try {
    const selectedPkg = packages.find(pkg => pkg.id === selectedPackageId);
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingStep(1);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingStep(2);

    let result;
    
    // REMOVE THIS OLD CHECK - we want to allow updates now
    // if (isSupplierInParty()) {
    //   setNotification({
    //     type: 'warning',
    //     message: `${supplier.name} is already in your party plan!`
    //   });
    //   setTimeout(() => setNotification(null), 3000);
    //   return;
    // }
    
    // NEW LOGIC: Check if supplier is already in party and handle accordingly
    if (partyDetails.inParty) {
      // If trying to select the same package that's already selected
      if (partyDetails.currentPackage === selectedPackageId) {
        setNotification({
          type: 'info',
          message: `${supplier.name} with ${packages.find(p => p.id === selectedPackageId)?.name || 'this package'} is already in your dashboard!`
        });
        setIsAddingToPlan(false);
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      console.log('🔄 Updating existing supplier package from', partyDetails.currentPackage, 'to', selectedPackageId);
      
      if (partyDetails.supplierType === 'addon') {
        // Update addon - remove old and add new with different package
        await removeAddon(supplier.id);
        const addonData = {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
          image: supplier.image,
          category: supplier.category,
          duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
          rating: supplier.rating,
          reviewCount: supplier.reviewCount,
          popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
          limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
          packageId: selectedPkg?.id || null
        };
        result = await addAddon(addonData);
      } else {
        // Update main supplier slot
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: `Package updated to ${selectedPkg?.name || 'new package'}!`
        });
      }
    } else {
      // NEW SUPPLIER - use existing logic
      if (supplier.category === 'Venues') {
        result = await addSupplier(backendSupplier, selectedPkg);
      } 
      else if (supplier.category === 'Catering') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else if (supplier.category === 'Party Bags') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else if (supplier.category === 'Face Painting') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else if (supplier.category === 'Activities') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else if (supplier.category === 'Entertainment') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else {
        // Everything else goes to addons
        const addonData = {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
          image: supplier.image,
          category: supplier.category,
          duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
          rating: supplier.rating,
          reviewCount: supplier.reviewCount,
          popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
          limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
          packageId: selectedPkg?.id || null
        };
        result = await addAddon(addonData);
      }
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: `${supplier.name} has been added to your party plan!`
        });
      }
    }

    setLoadingStep(3);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingStep(4);

    if (result.success) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate back based on context
      if (navigationContext === 'dashboard') {
        navigateWithContext('/dashboard', 'supplier-detail');
      } else {
        router.push('/dashboard');
      }
    } else {
      throw new Error(result.error || 'Failed to update party plan');
    }
    
  } catch (error) {
    console.error("Error updating party plan:", error);
    setNotification({
      type: 'error',
      message: 'Failed to update party plan. Please try again.'
    });
  } finally {
    setIsAddingToPlan(false); // Make sure to reset loading state
  }
}

const getAddToPartyButtonState = (packageId) => {
  const partyDetails = getSupplierInPartyDetails()
  const isLoading = isAddingToPlan && selectedPackageId === packageId
  
  // If loading this specific package
  if (isLoading) {
    return {
      disabled: true,
      className: "bg-primary-500",
      text: (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          {partyDetails.inParty ? 'Updating...' : 'Adding...'}
        </>
      )
    }
  }
  
  // If this package is currently in the party plan
  if (partyDetails.inParty && partyDetails.currentPackage === packageId) {
    return {
      disabled: true,
      className: "bg-green-500 hover:bg-green-500 text-white cursor-not-allowed",
      text: (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          In Plan
        </>
      )
    }
  }
  
  // For all other cases (new supplier, or different package for existing supplier)
  return {
    disabled: false,
    className: "bg-primary-500 hover:bg-primary-600 text-white",
    text: "Select Package"
  }
}

const reviews = [
  {
    id: 1,
    name: "Sarah Thompson",
    avatar: "/placeholder.jpg",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely fantastic! The team made my son's 6th birthday unforgettable. The superhero theme was executed perfectly, and all the kids were completely engaged throughout the party.",
    images: ["/placeholder.svg?height=60&width=60", "/placeholder.svg?height=60&width=60"],
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "/placeholder.jpg",
    rating: 5,
    date: "1 month ago",
    text: "Professional, punctual, and incredibly entertaining. The magic show had everyone mesmerized, and the face painting was top quality. Highly recommend!",
  },
  {
    id: 3,
    name: "Emma Davis",
    avatar: "/placeholder.jpg",
    rating: 4,
    date: "2 months ago",
    text: "Great entertainment value and the kids loved every minute. Setup was quick and professional. Only minor issue was running slightly over time, but overall excellent service.",
  },
]

const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

const renderCalendar = () => {
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selectedDate === day
    const isToday = day === 15

    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(day)}
        className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
          isSelected ? "bg-primary-500 text-white" : isToday ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
        }`}
      >
        {day}
      </button>,
    )
  }

  return days
}
const isDateUnavailable = (date, supplier) => {
  if (!supplier?.unavailableDates) return false;
  return supplier.unavailableDates.some(unavailableDate => {
    const unavailable = new Date(unavailableDate);
    return date.toDateString() === unavailable.toDateString();
  });
};

const isDateBusy = (date, supplier) => {
  if (!supplier?.busyDates) return false;
  return supplier.busyDates.some(busyDate => {
    const busy = new Date(busyDate);
    return date.toDateString() === busy.toDateString();
  });
};

const isDayAvailable = (date, supplier) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  return supplier?.workingHours?.[dayName]?.active || false;
};

const getDateStatus = (date, supplier) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Past dates
  if (date < today) return 'past';
  
  // Check booking window
  const advanceDays = supplier?.advanceBookingDays || 0;
  const maxDays = supplier?.maxBookingDays || 365;
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + advanceDays);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);
  
  if (date < minDate || date > maxDate) return 'outside-window';
  
  // Check specific unavailable dates
  if (isDateUnavailable(date, supplier)) return 'unavailable';
  if (isDateBusy(date, supplier)) return 'busy';
  
  // Check if working day
  if (!isDayAvailable(date, supplier)) return 'closed';
  
  return 'available';
};

// Enhanced renderCalendar function:
const renderEnhancedCalendar = () => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isSelected = selectedDate === day;
    const status = getDateStatus(date, supplier);
    
    // Get styling based on status
    const getDateStyling = (status, isSelected) => {
      if (isSelected) {
        return "bg-blue-500 text-white ring-2 ring-blue-300";
      }
      
      switch (status) {
        case 'available':
          return "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300";
        case 'unavailable':
          return "bg-red-100 text-red-800 cursor-not-allowed border border-red-300";
        case 'busy':
          return "bg-yellow-100 text-yellow-800 cursor-not-allowed border border-yellow-300";
        case 'closed':
          return "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300";
        case 'past':
          return "bg-gray-50 text-gray-400 cursor-not-allowed line-through";
        case 'outside-window':
          return "bg-gray-50 text-gray-400 cursor-not-allowed";
        default:
          return "hover:bg-gray-100 border border-gray-200";
      }
    };

    days.push(
      <button
        key={day}
        onClick={() => status === 'available' ? setSelectedDate(day) : null}
        className={`h-8 w-8 rounded text-sm font-medium transition-colors relative ${getDateStyling(status, isSelected)}`}
        title={
          status === 'available' ? 'Available for booking' :
          status === 'unavailable' ? 'Unavailable' :
          status === 'busy' ? 'Busy/Booked' :
          status === 'closed' ? 'Closed' :
          status === 'past' ? 'Past date' :
          status === 'outside-window' ? 'Outside booking window' :
          'Contact for availability'
        }
      >
        {day}
        {/* Status indicator dot */}
        {status !== 'available' && status !== 'past' && (
          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
            status === 'unavailable' ? 'bg-red-500' :
            status === 'busy' ? 'bg-yellow-500' :
            status === 'closed' ? 'bg-gray-500' :
            'bg-gray-400'
          }`}></div>
        )}
      </button>
    );
  }

  return days;
};
const AddingToPlanModal = ({ isAddingToPlan, loadingStep, theme = 'default' }) => {
  const [visibleImages, setVisibleImages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const partyImages = [
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473245/iStock-1150333197_bw6j3b.jpg",
      alt: "Kids enjoying party games"
    },
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473373/iStock-469207460_romywt.jpg", 
      alt: "Children celebrating at party"
    },
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473689/iStock-1369813086_osxnjy.jpg",
      alt: "Fun party activities"
    }
  ];

  const themeEmojis = {
    'spiderman': '🕷️',
    'taylor-swift': '🎤',
    'princess': '👑',
    'dinosaur': '🦕',
    'unicorn': '🦄',
    'science': '🔬',
    'superhero': '🦸',
    'default': '🎉'
  };

  const stepMessages = [
    "Checking availability...",
    "Confirming package details...",
    "Updating your party plan...",
    "Finalizing your perfect party...",
    "🎉 Successfully added to your plan! 🎉"
  ];

  const currentEmoji = themeEmojis[theme] || themeEmojis['default'];
  const progress = Math.min((loadingStep + 1) * 25, 100);

  // Handle image popping animations
  useEffect(() => {
    if (!isAddingToPlan) {
      setVisibleImages([]);
      return;
    }

    const addRandomImage = () => {
      const randomImage = partyImages[Math.floor(Math.random() * partyImages.length)];
      
      // Calculate position to avoid center area
      let top, left;
      const placement = Math.random();
      
      if (placement < 0.4) {
        // Top area
        top = Math.random() * 20 + 5;
        left = Math.random() * 80 + 10;
      } else if (placement < 0.8) {
        // Bottom area
        top = Math.random() * 20 + 75;
        left = Math.random() * 80 + 10;
      } else {
        // Side areas
        top = Math.random() * 60 + 20;
        if (Math.random() < 0.5) {
          left = Math.random() * 15 + 2;
        } else {
          left = Math.random() * 15 + 83;
        }
      }
      
      const randomPosition = {
        top,
        left,
        size: Math.random() * 100 + 120, // 120px to 220px
        rotation: Math.random() * 20 - 10,
        id: Date.now() + Math.random()
      };

      setVisibleImages(prev => [...prev, { ...randomImage, ...randomPosition }]);

      setTimeout(() => {
        setVisibleImages(prev => prev.filter(img => img.id !== randomPosition.id));
      }, 4000);
    };

    setTimeout(addRandomImage, 200);
    
    const interval = setInterval(() => {
      addRandomImage();
    }, 1500);

    return () => clearInterval(interval);
  }, [isAddingToPlan]);

  // Handle message updates based on loading step
  useEffect(() => {
    if (loadingStep < stepMessages.length - 1) {
      setCurrentMessageIndex(loadingStep);
    } else {
      setCurrentMessageIndex(stepMessages.length - 1);
    }
  }, [loadingStep]);

  if (!isAddingToPlan) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
      
      {/* Animated party images popping around the screen */}
      {visibleImages.map((image) => (
        <div
          key={image.id}
          className="absolute pointer-events-none animate-bounce-in-scale z-30"
          style={{
            top: `${image.top}%`,
            left: `${image.left}%`,
            transform: `rotate(${image.rotation}deg)`,
            animationDuration: '0.6s',
            animationFillMode: 'forwards'
          }}
        >
          <div 
            className="rounded-2xl shadow-2xl border-4 border-white overflow-hidden opacity-85 hover:opacity-100 transition-opacity duration-500"
            style={{
              width: `${image.size}px`,
              height: `${image.size}px`
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>
      ))}

      {/* Main content container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 max-w-lg mx-4 text-center relative z-20">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">
            {loadingStep >= 4 ? '🎉' : currentEmoji}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {loadingStep >= 4 ? 'Added to Plan!' : 'Adding to Your Plan'}
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            {loadingStep >= 4 
              ? 'Your party selection has been successfully added!'
              : 'Securing your perfect party addition...'
            }
          </p>
        </div>

        {/* Progress section */}
        <div className="mb-8">
          <div className="bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#FF6B4A] to-[#FF8A70] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-2xl font-bold text-[#FF6B4A] mb-6">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Loading message */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
          <p className="text-base text-gray-700 font-medium leading-relaxed animate-pulse">
            {stepMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Step indicators */}
        <div className="w-full space-y-3 mb-8">
          {["Checking availability", "Confirming details", "Updating plan", "Finalizing"].map(
            (step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index < loadingStep
                      ? "bg-green-500 shadow-lg"
                      : index === loadingStep
                        ? "bg-[#FF6B4A] animate-pulse shadow-lg"
                        : "bg-gray-200"
                  }`}
                >
                  {index < loadingStep ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === loadingStep ? "bg-white animate-pulse" : "bg-gray-400"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    index < loadingStep
                      ? "text-green-600"
                      : index === loadingStep
                        ? "text-[#FF6B4A]"
                        : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            )
          )}
        </div>

        {/* Success Message */}
        {loadingStep >= 4 && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl w-full">
            <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
              <Check className="w-6 h-6" />
              <span className="font-bold text-lg">Success!</span>
            </div>
            <p className="text-sm text-green-600 font-medium">Redirecting to your dashboard...</p>
          </div>
        )}

        {/* Loading dots (only show when not complete) */}
        {loadingStep < 4 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-[#FF6B4A] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounce-in-scale {
          0% {
            transform: scale(0) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(${Math.random() * 20 - 10}deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) rotate(var(--final-rotation));
            opacity: 0.85;
          }
        }
        
        .animate-bounce-in-scale {
          animation: bounce-in-scale 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotation)); }
          50% { transform: translateY(-10px) rotate(var(--rotation)); }
        }
        
        .animate-bounce-in-scale:hover {
          animation: gentle-float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};



  console.log('5. About to render main content');

  const showLoading = supplierLoading && !hasLoadedOnce;

if (showLoading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
    </div>
  );
}




const openImageModal = (image, index) => {
  setSelectedImage(image);
  setSelectedImageIndex(index);
};

const closeImageModal = () => {
  setSelectedImage(null);
  setSelectedImageIndex(0);
};

const navigateImage = (direction) => {
  if (direction === 'next' && selectedImageIndex < portfolioImages.length - 1) {
    const nextIndex = selectedImageIndex + 1;
    setSelectedImageIndex(nextIndex);
    setSelectedImage(portfolioImages[nextIndex]);
  } else if (direction === 'prev' && selectedImageIndex > 0) {
    const prevIndex = selectedImageIndex - 1;
    setSelectedImageIndex(prevIndex);
    setSelectedImage(portfolioImages[prevIndex]);
  }
};

const loadMoreImages = () => {
  setVisibleImageCount(prev => Math.min(prev + 6, portfolioImages.length));
};

const showLessImages = () => {
  setVisibleImageCount(6);
  // Scroll back to top of gallery
  document.querySelector('[data-gallery-top]')?.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
};


  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    <div className="pb-20 md:pb-8">
    <div className="px-4 py-3 bg-gray-50">
    <ContextualBreadcrumb currentPage="supplier-detail" />
  </div>
      {/* Mobile-First Supplier Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-8">
        
        <div className="space-y-4">
          
          {/* Mobile Layout */}
          <div className="md:hidden">
  {/* Mobile Header with Background Image */}
  <div className="relative rounded-lg overflow-hidden mb-4 min-h-[280px]">
  {/* Background Image - Use cover photo if available */}
  <Image
    src={supplier?.coverPhoto || supplier?.image || "/placeholder.svg"}
    alt={supplier?.name || "Supplier"}
    fill
    className="object-cover"
  />
  {/* Dark overlay for text readability */}
  <div className="absolute inset-0 bg-black/40" />
    
    {/* Content on top of background */}
    <div className="relative z-10 p-4 text-white h-full flex flex-col">
      {/* Top section with avatar and basic info */}
      <div className="flex items-start space-x-4 mb-4">
        <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-white/30">
          <AvatarImage src={supplier?.avatar || "/placeholder.jpg"} alt={supplier?.name} />
          <AvatarFallback className="text-white bg-white/20">
            {supplier?.name?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white drop-shadow-md mb-2">{supplier?.name}</h1>
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm text-white">{supplier?.rating}</span>
            <span className="text-sm text-white/80">({supplier?.reviewCount})</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{supplier?.location}</span>
          </div>
        </div>
      </div>

      {/* Mobile Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {supplier?.verified && (
          <Badge className="bg-gray-900/80 text-white text-xs border border-white/30">
            <Check className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
        {supplier?.highlyRated && (
          <Badge className="bg-yellow-500/80 text-white border border-yellow-300/50 text-xs">
            <Star className="w-3 h-3 mr-1 fill-yellow-300" />
            Highly Rated
          </Badge>
        )}
        {supplier?.fastResponder && (
          <Badge className="bg-green-500/80 text-white border border-green-300/50 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Fast Responder
          </Badge>
        )}
        {getSupplierInPartyDetails().inParty && (
          <Badge className="bg-primary-500/80 text-white text-xs border border-primary-300/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            In Party
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="flex-1 flex items-end">
        <p className="text-white/90 text-sm leading-relaxed line-clamp-3">{supplier?.description}</p>
      </div>
    </div>
  </div>
</div>
         
          {/* Desktop Layout */}
<div className="hidden md:block">
  <div className="relative flex items-start gap-6 p-6 rounded-lg overflow-hidden min-h-[300px]">
    {/* Background Image */}
    <Image
      src={supplier?.image || "/placeholder.jpg"}
      alt={supplier?.name || "Supplier"}
      fill
      className="object-cover"
    />
    {/* Dark overlay for text readability */}
    <div className="absolute inset-0 bg-black/20" />
    
    {/* Content on top of background */}
    <div className="relative z-10 flex items-start gap-6 w-full">
      <Avatar className="w-20 h-20">
        <AvatarImage src={supplier?.avatar || "/placeholder.jpg"} alt={supplier?.name} />
        <AvatarFallback className="text-white bg-white/20">{supplier?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{supplier?.name}</h1>
          {supplier?.verified && (
            <Badge className="bg-gray-900 text-white">
              <Check className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {supplier?.highlyRated && (
            <Badge variant="outline" className="text-yellow-300 border-yellow-300 bg-yellow-300/20">
              <Star className="w-3 h-3 mr-1 fill-yellow-300" />
              Highly Rated
            </Badge>
          )}
          {getSupplierInPartyDetails().inParty && (
  <Badge className="bg-green-500 text-white text-xs">
    <CheckCircle className="w-3 h-3 mr-1" />
    In Party
  </Badge>
)}
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-white">{supplier?.rating}</span>
            <span className="text-white/90">({supplier?.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{supplier?.location}</span>
          </div>
        </div>

        <p className="text-white/90 mb-6 max-w-2xl">{supplier?.description}</p>

        <div className="flex gap-4">
        <Button
                        className={getAddToPartyButtonState("basic").className}
                        disabled={getAddToPartyButtonState("basic").disabled}
                        onClick={() => handleAddToPlan("basic")}
                      >
                        {getAddToPartyButtonState("basic").text}
                      </Button>
          <Button variant="outline" className="border-white/30 text-white bg-black hover:bg-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            Check Availability
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>
      </div>

      {/* Mobile-First Content */}
      <div className="space-y-6 p-4 md:p-0">
        <div className="hidden">
        <ServiceDetailsDisplay supplier={supplier} />
        </div>
   
        {/* Service Packages - Mobile First */}
 
        <Card className="md:hidden border-gray-300">
        {supplier?.serviceDetails ? (
            <ServiceDetailsDisplay supplier={supplier} />
          ) : (
            /* Mobile-Optimized Fallback Service Details */
            <div className="space-y-4">
       

              {/* About This Service */}
              <Card className="border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About This Service</h2>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {supplier?.description || 
                      "We are professional entertainers specializing in creating magical experiences for children's parties and family celebrations. With over 5 years of experience, we bring joy, laughter, and unforgettable memories to every event we attend."}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Our service combines high-energy entertainment with interactive activities that engage children of all ages. We pride ourselves on being punctual, professional, and fully prepared to handle any party scenario.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Service Specialities */}
              <Card className="border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Service Specialities</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { title: "Magic Shows", icon: "✨" },
                      { title: "Balloon Modeling", icon: "🎈" },
                      { title: "Face Painting", icon: "🎨" },
                      { title: "Party Games", icon: "🎲" },
                      { title: "Music & Dancing", icon: "🎵" },
                      { title: "Puppet Shows", icon: "🎭" }
                    ].map((specialty, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg">{specialty.icon}</div>
                        <h3 className="font-medium text-gray-900 text-sm">{specialty.title}</h3>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Duration & Pricing */}
              <Card className="border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Duration & Pricing</h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-lg font-bold text-blue-600 mb-1">1hr</div>
                        <div className="text-sm font-semibold text-gray-900">£120</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-lg font-bold text-green-600 mb-1">1.5hr</div>
                        <div className="text-sm font-semibold text-gray-900">£160</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-lg font-bold text-purple-600 mb-1">2hr</div>
                        <div className="text-sm font-semibold text-gray-900">£200</div>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <h4 className="font-medium text-amber-900 mb-2 text-sm">What's Included:</h4>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• Professional entertainment tailored to your group</li>
                        <li>• All props, materials, and equipment included</li>
                        <li>• Setup and cleanup handled by our team</li>
                        <li>• Flexible start times to fit your schedule</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Standards */}
              <Card className="border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Service Standards</h2>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 text-sm">Our Commitments</h3>
                      <ul className="space-y-1">
                        {[
                          "Arrive 15 minutes early for setup",
                          "Professional appearance and behavior",
                          "Age-appropriate content and activities",
                          "Clean and sanitized equipment"
                        ].map((commitment, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-xs text-gray-700">{commitment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900 text-xs">100% Satisfaction</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900 text-xs">No Hidden Fees</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Details */}
              <Card className="border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Service Details</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 text-sm">Equipment & Materials</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-1 text-xs">We Provide:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Professional sound system</li>
                            <li>• Magic props and equipment</li>
                            <li>• Balloon modeling supplies</li>
                            <li>• Face painting materials</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2 text-sm">Age Groups & Capacity</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-700 text-xs">Ages 3-6</div>
                          <div className="text-xs text-gray-600">Up to 15</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-700 text-xs">Ages 7-10</div>
                          <div className="text-xs text-gray-600">Up to 20</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <div className="font-medium text-purple-700 text-xs">Mixed Ages</div>
                          <div className="text-xs text-gray-600">Adapted</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications & Safety */}
              <Card className="border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Certifications & Safety</h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { title: "Enhanced DBS Check", status: "Current", icon: "🛡️" },
                        { title: "Public Liability", status: "£2M Coverage", icon: "📋" },
                        { title: "First Aid Certified", status: "Renewed 2024", icon: "🚑" },
                        { title: "Professional Member", status: "Equity", icon: "🎭" }
                      ].map((cert, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm">{cert.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900 text-xs">{cert.title}</div>
                            <div className="text-xs text-green-700">{cert.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meet Your Supplier */}
              <Card className="border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Meet Your Supplier</h2>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {supplier?.ownerName?.charAt(0) || supplier?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {supplier?.ownerName || 'Alex Thompson'}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">Professional Children's Entertainer</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>📍 London</span>
                        <span>⭐ 127 reviews</span>
                        <span>🎭 5+ years</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-700">
                      "Hi! I'm Alex, and I've been bringing smiles to children's faces for over 5 years. My passion for entertaining started when I was performing magic tricks for my younger siblings."
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Magic Specialist</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Balloon Artist</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Face Painter</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <CardContent className="p-4">
           

            <h2 className="text-lg font-bold text-gray-900 mb-4">Service Packages</h2>
            <div className="space-y-4">
            {packages.map((pkg) => {
  const buttonState = getAddToPartyButtonState(pkg.id);
  const partyDetails = getSupplierInPartyDetails();
  const isCurrentPackage = partyDetails.inParty && partyDetails.currentPackage === pkg.id;
  
  return (
    <div
      key={pkg.id}
      className={`border-2 rounded-lg p-4 transition-all cursor-pointer bg-white ${
        selectedPackageId === pkg.id ? "border-primary-500 ring-2 ring-primary-200" : 
        isCurrentPackage ? "border-green-500 bg-green-50" :
        pkg.popular ? "border-orange-400" :
        "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => setSelectedPackageId(pkg.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{pkg.name}</h3>
        <div className="flex items-center gap-2">
          {pkg.popular && (
            <Badge className="bg-orange-500 text-white">Popular</Badge>
          )}
          {isCurrentPackage && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Current
            </Badge>
          )}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 mb-1">£{pkg.price}</div>
      <div className="text-xs text-gray-600 mb-3">• {pkg.duration}</div>
      
      {/* Show description if it exists (for real packages) */}
      {pkg.description && (
        <p className="text-xs text-gray-600 mb-3">{pkg.description}</p>
      )}
      
      <ul className="space-y-1 mb-4">
        {pkg.features.map((feature, i) => (
          <li key={i} className="text-xs text-gray-700">
            • {feature}
          </li>
        ))}
      </ul>
      
      <Button
        onClick={() => setSelectedPackageId(pkg.id)}
        variant={selectedPackageId === pkg.id ? "default" : "outline"}
        className={selectedPackageId === pkg.id ? "bg-primary-500 text-white" : ""}
      >
        {selectedPackageId === pkg.id ? "✓ Selected" : "Select Package"}
      </Button>
    </div>
  );
})}

              </div>
            </CardContent>
          </Card>


        {/* Portfolio Gallery - Mobile Optimized */}
        <Card className="md:hidden border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Portfolio Gallery</h2>
              <Sheet open={showGallery} onOpenChange={setShowGallery}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Portfolio Gallery</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {portfolioImages.map((item, index) => (
                        <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={item?.image || "/placeholder.jpg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {portfolioImages.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setShowGallery(true)}
                >
                  <Image
                    src={item.image || "/placeholder.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                  {index === 3 && portfolioImages.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">+{portfolioImages.length - 4} more</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification & Credentials - Mobile Optimized */}
        <Card className="md:hidden border-gray-300">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Verification & Credentials</h2>
            <div className="space-y-3">
              {credentials.slice(0, showAllCredentials ? credentials.length : 2).map((credential, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    {credential.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{credential.title}</h3>
                    <p className="text-xs text-gray-600">{credential.subtitle}</p>
                  </div>
                </div>
              ))}
              {credentials.length > 2 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllCredentials(!showAllCredentials)}
                  className="w-full text-sm"
                >
                  {showAllCredentials ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Show All Credentials <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Reviews - Mobile Optimized */}
        <Card className="md:hidden border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 font-semibold text-sm">4.9</span>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={review?.avatar || "/placeholder.jpg"} alt={review.name} />
                      <AvatarFallback>
                        {review?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{review.name}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{review.text}</p>
                      {review.images && (
                        <div className="flex gap-2">
                          {review.images.map((img, i) => (
                            <div key={i} className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                              <Image
                                src={img || "/placeholder.jpg"}
                                alt="Review photo"
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length > 2 && (
                <Button variant="ghost" onClick={() => setShowAllReviews(!showAllReviews)} className="w-full text-sm">
                  {showAllReviews ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      View All Reviews ({reviews.length}) <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
         {/* Availability Calendar */}
         <Card className="border-gray-300 md:hidden">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Availability Calendar</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                          }
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                          }
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
  <div key={`day-${index}`} className="h-8 flex items-center justify-center">
    {day}
  </div>
))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span>Your selected date</span>
                    </div>
                    <div className="text-sm text-gray-500">Unavailable</div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-gray-300 md:hidden">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-semibold">{supplier?.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Parties Completed</span>
                      <span className="font-semibold">150+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Repeat Customers</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Years Experience</span>
                      <span className="font-semibold">5 years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
      


{/* Desktop Layout */}
<div className="hidden md:block container px-10 min-w-screen py-8">
  {/* Top Row - Service Details (50%) + Right Column Content (50%) */}
  <div className="grid lg:grid-cols-2 gap-8 mb-8">
    {/* Left Half - Service Details */}
    <div>
      {supplier?.serviceDetails ? (
        <ServiceDetailsDisplay supplier={supplier} />
      ) : (
        /* Comprehensive Fallback Service Details for Prototype */
        <div className="space-y-6">
     

          {/* About This Service */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Service</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {supplier?.description || 
                  "We are professional entertainers specializing in creating magical experiences for children's parties and family celebrations. With over 5 years of experience, we bring joy, laughter, and unforgettable memories to every event we attend."}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our service combines high-energy entertainment with interactive activities that engage children of all ages. We pride ourselves on being punctual, professional, and fully prepared to handle any party scenario. Every performance is tailored to your specific needs and the age group of your guests.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Safety is our top priority, and all our activities are designed with child welfare in mind. We carry full public liability insurance and have enhanced DBS checks for your peace of mind.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Specialities */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Specialities</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Magic Shows",
                    description: "Interactive magic performances with audience participation",
                    icon: "✨"
                  },
                  {
                    title: "Balloon Modeling",
                    description: "Creative balloon animals and sculptures for all children",
                    icon: "🎈"
                  },
                  {
                    title: "Face Painting",
                    description: "Professional face painting with hypoallergenic paints",
                    icon: "🎨"
                  },
                  {
                    title: "Party Games",
                    description: "Age-appropriate games and activities to keep everyone engaged",
                    icon: "🎲"
                  },
                  {
                    title: "Music & Dancing",
                    description: "High-energy music sessions with dance competitions",
                    icon: "🎵"
                  },
                  {
                    title: "Puppet Shows",
                    description: "Entertaining puppet performances with beloved characters",
                    icon: "🎭"
                  }
                ].map((specialty, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{specialty.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{specialty.title}</h3>
                      <p className="text-sm text-gray-600">{specialty.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Duration & Pricing */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Duration & Pricing</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-2">1 Hour</div>
                    <div className="text-lg font-semibold text-gray-900 mb-1">£120</div>
                    <div className="text-sm text-gray-600">Perfect for smaller gatherings</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-2">1.5 Hours</div>
                    <div className="text-lg font-semibold text-gray-900 mb-1">£160</div>
                    <div className="text-sm text-gray-600">Most popular choice</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600 mb-2">2 Hours</div>
                    <div className="text-lg font-semibold text-gray-900 mb-1">£200</div>
                    <div className="text-sm text-gray-600">Extended entertainment</div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">What's Included in Every Package:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Professional entertainment tailored to your group</li>
                    <li>• All props, materials, and equipment included</li>
                    <li>• Setup and cleanup handled by our team</li>
                    <li>• Flexible start times to fit your schedule</li>
                    <li>• Backup indoor activities for weather contingencies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Standards */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Standards</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Our Commitments</h3>
                  <ul className="space-y-2">
                    {[
                      "Arrive 15 minutes early for setup",
                      "Professional appearance and behavior",
                      "Age-appropriate content and activities",
                      "Respectful interaction with all family members",
                      "Clean and sanitized equipment",
                      "Punctual start and finish times"
                    ].map((commitment, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{commitment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quality Guarantee</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">100% Satisfaction</h4>
                        <p className="text-sm text-gray-600">If you're not happy, we'll make it right</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">No Hidden Fees</h4>
                        <p className="text-sm text-gray-600">Transparent pricing with everything included</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Details</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Equipment & Materials</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">We Provide:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Professional sound system</li>
                        <li>• Magic props and equipment</li>
                        <li>• Balloon modeling supplies</li>
                        <li>• Face painting materials</li>
                        <li>• Party games and activities</li>
                        <li>• Costumes and character outfits</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">You Provide:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Performance space (indoor/outdoor)</li>
                        <li>• Access to power outlet if needed</li>
                        <li>• Parking space if possible</li>
                        <li>• Table for equipment setup</li>
                        <li>• Water access for cleanup</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Age Groups & Capacity</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-700">Ages 3-6</div>
                      <div className="text-sm text-gray-600">Up to 15 children</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-700">Ages 7-10</div>
                      <div className="text-sm text-gray-600">Up to 20 children</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-semibold text-purple-700">Mixed Ages</div>
                      <div className="text-sm text-gray-600">Adapted activities</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications & Safety */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications & Safety</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                    <div className="space-y-3">
                      {[
                        {
                          title: "Enhanced DBS Check",
                          status: "Current",
                          icon: "🛡️"
                        },
                        {
                          title: "Public Liability Insurance",
                          status: "£2M Coverage",
                          icon: "📋"
                        },
                        {
                          title: "First Aid Certified",
                          status: "Renewed 2024",
                          icon: "🚑"
                        },
                        {
                          title: "Professional Entertainer",
                          status: "Equity Member",
                          icon: "🎭"
                        }
                      ].map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-xl">{cert.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{cert.title}</div>
                            <div className="text-sm text-green-700">{cert.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Safety Measures</h3>
                    <ul className="space-y-2">
                      {[
                        "All equipment regularly safety tested",
                        "Hypoallergenic face paints used",
                        "Risk assessment completed for each venue",
                        "COVID-19 safety protocols followed",
                        "Emergency contact information available",
                        "Age-appropriate activity modifications"
                      ].map((measure, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 text-sm">{measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meet Your Supplier */}
          <Card className="border-gray-300">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Meet Your Supplier</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {supplier?.ownerName?.charAt(0) || supplier?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {supplier?.ownerName || 'Alex Thompson'}
                  </h3>
                  <p className="text-gray-600 mb-2">Professional Children's Entertainer</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📍 Based in London</span>
                    <span>⭐ 127 reviews</span>
                    <span>🎭 5+ years experience</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700">
                  "Hi! I'm Alex, and I've been bringing smiles to children's faces for over 5 years. My passion for entertaining started when I was performing magic tricks for my younger siblings, and it's grown into a career I absolutely love."
                </p>
                <p className="text-gray-700">
                  "Every party is unique, and I take pride in tailoring my performance to make your child feel special on their big day. I believe that laughter is the best gift we can give to children, and I'm committed to creating magical moments that families will treasure forever."
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Magic Specialist</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Balloon Artist</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Face Painter</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Party Games Expert</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>

    {/* Right Half - Right Column Content */}
    <div className="space-y-6">
      {/* Service Packages */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Service Packages</h2>
          <div className="space-y-4">
            {packages.map((pkg, index) => {
              const buttonState = getAddToPartyButtonState(pkg.id);
              const partyDetails = getSupplierInPartyDetails();
              const isCurrentPackage = partyDetails.inParty && partyDetails.currentPackage === pkg.id;
              
              return (
                <div
                  key={`pkg-${index}`}
                  className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                    pkg.popular ? "border-primary-500 bg-primary-50" : 
                    selectedPackageId === pkg.id ? "border-primary-500 bg-primary-100 ring-2 ring-primary-200" : 
                    isCurrentPackage ? "border-green-500 bg-green-50" :
                    "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPackageId(pkg.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <div className="flex items-center gap-2">
                      {pkg.popular && <Badge className="bg-primary-500 text-white">Popular</Badge>}
                      {isCurrentPackage && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          In Plan
                        </Badge>
                      )}
                      {selectedPackageId === pkg.id && (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-2">£{pkg.price}</div>
                  <div className="text-sm text-gray-600 mb-3">• {pkg.duration}</div>
                  
                  {pkg.description && (
                    <p className="text-sm text-gray-600 mb-3 italic">{pkg.description}</p>
                  )}
                  
                  <ul className="space-y-1 mb-4">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => {
                      console.log('🔄 Manually refreshing supplier data...');
                      refetch();
                    }}
                    className="mb-4"
                  >
                    Refresh Supplier Data
                  </Button>
                </div>
              );
            })}
            <Button 
              onClick={() => {
                console.log('🔄 Manually refreshing...');
                refetch();
              }}
            >
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Availability Calendar */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Availability Calendar</h2>
            {supplier?.advanceBookingDays > 0 && (
              <div className="text-sm text-gray-600">
                Book {supplier.advanceBookingDays}+ days ahead
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={`day-${index}`} className="h-8 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">{renderEnhancedCalendar()}</div>

            {/* Legend */}
            <div className="space-y-3 mt-6">
              <h4 className="font-medium text-gray-900 text-sm">Legend:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-gray-600">Unavailable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span className="text-gray-600">Busy/Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-gray-600">Closed</span>
                </div>
              </div>
              
              {/* Selected date info */}
              {selectedDate && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-900">
                      Selected: {currentMonth.toLocaleDateString("en-US", { month: "long" })} {selectedDate}, {currentMonth.getFullYear()}
                    </span>
                  </div>
                  {(() => {
                    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
                    const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
                    const daySchedule = supplier?.workingHours?.[dayName];
                    
                    return daySchedule?.active ? (
                      <p className="text-blue-800 text-sm mt-1">
                        Available {daySchedule.start} - {daySchedule.end}
                      </p>
                    ) : (
                      <p className="text-blue-800 text-sm mt-1">Contact for availability</p>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Working hours summary */}
            {supplier?.workingHours && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Typical Working Hours:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(supplier.workingHours).map(([day, schedule]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-gray-600">{day.substring(0, 3)}:</span>
                      <span className={schedule.active ? "text-gray-900" : "text-gray-400"}>
                        {schedule.active ? `${schedule.start} - ${schedule.end}` : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability notes */}
            {supplier?.availabilityNotes && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Special Notes
                </h4>
                <p className="text-amber-800 text-sm">{supplier.availabilityNotes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Response Time</span>
              <span className="font-semibold">{supplier?.responseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Parties Completed</span>
              <span className="font-semibold">150+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Repeat Customers</span>
              <span className="font-semibold">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Years Experience</span>
              <span className="font-semibold">5 years</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  {/* Bottom Row - Full Width Content */}
  <div className="space-y-8">
    {/* Portfolio Gallery */}
    <Card className="border-gray-300">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Portfolio Gallery ({portfolioImages.length} {portfolioImages.length === 1 ? 'photo' : 'photos'})
        </h2>
        
        {portfolioImages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">No portfolio images yet</p>
            <p className="text-gray-600">Check back soon to see examples of this supplier's work</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {portfolioImages.slice(0, visibleImageCount).map((item, index) => (
                <div
                  key={item.id || index}
                  className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => openImageModal(item, index)}
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.title || `Portfolio image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 rounded-full p-3">
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-2 left-2">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {portfolioImages.length > 6 && (
              <div className="flex gap-2 justify-center">
                {visibleImageCount < portfolioImages.length && (
                  <Button 
                    variant="outline" 
                    onClick={loadMoreImages}
                    className="flex-1 max-w-xs"
                  >
                    Load More ({portfolioImages.length - visibleImageCount} remaining)
                  </Button>
                )}
                
                {visibleImageCount > 6 && (
                  <Button 
                    variant="ghost" 
                    onClick={showLessImages}
                    className="flex-1 max-w-xs"
                  >
                    Show Less
                  </Button>
                )}
              </div>
            )}
            
            {portfolioImages.length <= 6 && portfolioImages.length > 3 && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Showing all {portfolioImages.length} portfolio images
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>

    {/* Verification & Credentials */}
    <Card className="border-gray-300">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Verification & Credentials</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {credentials.map((credential, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white">
                {credential.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{credential.title}</h3>
                <p className="text-sm text-gray-600">{credential.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Customer Reviews */}
    <Card className="border-gray-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 font-semibold">4.9 out of 5</span>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.avatar || "/placeholder.jpg"} alt={review.name} />
                  <AvatarFallback>
                    {review.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{review.name}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{review.text}</p>
                  {review.images && (
                    <div className="flex gap-2">
                      {review.images.map((img, i) => (
                        <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={img || "/placeholder.jpg"}
                            alt="Review photo"
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-6">
          View All Reviews (127)
        </Button>
      </CardContent>
    </Card>
  </div>
</div>
      </div>
    </div>

    {/* Mobile Fixed Bottom Action Bar */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
      <div className="flex space-x-3">
        <Button
          variant="outline"
          className="flex-1 border-gray-200"
          onClick={() => window.open(`tel:${supplier.phone}`)}
        >
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button
            className={`flex-1 ${getAddToPartyButtonState("basic").className}`}
            onClick={() => handleAddToPlan("basic")}
            disabled={getAddToPartyButtonState("basic").disabled}
          >
            {getAddToPartyButtonState("basic").text}
          </Button>
      </div>
    </div>

    {/* Enhanced Loading Overlay */}
    {isAddingToPlan && (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <div className="bg-white rounded-xl p-6 md:p-8 max-w-sm md:max-w-md w-full mx-4 shadow-2xl">
          <div className="flex flex-col items-center">
            {/* Loading Spinner */}
            <div className="w-16 h-16 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-primary-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary-500 font-bold">{Math.min(loadingStep + 1, 4)}/4</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Adding to Your Party Plan</h3>

            {/* Current Step */}
            <div className="text-primary-500 font-medium text-center mb-6">
              {loadingStep === 0 && "Checking availability..."}
              {loadingStep === 1 && "Confirming package details..."}
              {loadingStep === 2 && "Updating your party plan..."}
              {loadingStep === 3 && "Almost ready..."}
              {loadingStep >= 4 && "Complete!"}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((loadingStep + 1) * 25, 100)}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="w-full space-y-3">
              {["Checking availability", "Confirming package details", "Updating your party plan", "Finalizing"].map(
                (step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        index < loadingStep
                          ? "bg-green-500"
                          : index === loadingStep
                            ? "bg-primary-500 animate-pulse"
                            : "bg-gray-200"
                      }`}
                    >
                      {index < loadingStep ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <div
                          className={`w-2 h-2 rounded-full ${index === loadingStep ? "bg-white" : "bg-gray-400"}`}
                        ></div>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        index < loadingStep
                          ? "text-green-600"
                          : index === loadingStep
                            ? "text-primary-500 font-medium"
                            : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ),
              )}
            </div>

            {/* Success Message */}
            {loadingStep >= 4 && (
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg w-full">
                <div className="flex items-center gap-2 text-green-800">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Successfully added to your party plan!</span>
                </div>
                <p className="text-sm text-green-600 mt-1 text-center">Redirecting to dashboard...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
  )
}
