// components/supplier/hooks/useSupplierData.js
"use client"

import { useMemo } from 'react'
import { Shield, Award, CheckCircle } from "lucide-react"

// Transform backend supplier data to frontend format




const transformSupplierData = (backendSupplier) => {

  if (!backendSupplier) return null

  return {
    id: backendSupplier.id,
    name: backendSupplier.name,
    avatar: backendSupplier.avatar || "/placeholder.jpg",
    rating: backendSupplier.rating,
    reviewCount: backendSupplier.reviewCount,
    location: backendSupplier.location,
    activeSince: backendSupplier.activeSince || "2020",
    description: backendSupplier.description,
    verified: backendSupplier.verified || true,
    highlyRated: backendSupplier.badges?.includes("Highly Rated") || false,
    fastResponder: backendSupplier.fastResponder || true,
    responseTime: backendSupplier.responseTime || "Within 2 hours",
    phone: backendSupplier.phone || "+44 7123 456 789",
    email: backendSupplier.email || "hello@" + backendSupplier.name?.toLowerCase().replace(/[^a-z0-9]/g, "") + ".co.uk",
    image: backendSupplier.image || "/placeholder.jpg",
    category: backendSupplier.category,
    priceFrom: backendSupplier.priceFrom,
    priceUnit: backendSupplier.priceUnit,
    badges: backendSupplier.badges || [],
    availability: backendSupplier.availability,
    packages: backendSupplier.packages || [],
    portfolioImages: backendSupplier.portfolioImages || [],
    portfolioVideos: backendSupplier.portfolioVideos || [],
    coverPhoto: backendSupplier.coverPhoto || backendSupplier.image || "/placeholder.jpg",
    workingHours: backendSupplier.workingHours,
    unavailableDates: backendSupplier.unavailableDates,
    busyDates: backendSupplier.busyDates,
    availabilityNotes: backendSupplier.availabilityNotes,
    advanceBookingDays: backendSupplier.advanceBookingDays,
    maxBookingDays: backendSupplier.maxBookingDays,
    serviceDetails: backendSupplier?.serviceDetails,
    stats: backendSupplier?.stats,
    ownerName: backendSupplier?.ownerName,
    owner: backendSupplier?.owner,
    weekendPremium: backendSupplier.weekendPremium, // ✅ ADD THIS LINE
    venueAddress: backendSupplier?.venueAddress
  }
}

// Generate packages from supplier data (your exact logic)
const generatePackages = (supplier, selectedPackageId = null) => {
  if (!supplier) return []
  
  if (supplier.packages && supplier.packages.length > 0) {
    return supplier.packages.map((pkg, index) => ({
      id: pkg.id || `real-${index}`,
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      image: pkg.image,
      features: pkg.whatsIncluded || pkg.features || [],
      popular: pkg.id === selectedPackageId || (!selectedPackageId && index === 0),
      description: pkg.description,
      // Keep all original package properties
      ...pkg
    }))
  }
  
  // Generate default packages if none exist (your exact logic)
  const basePrice = supplier.priceFrom || 100
  const priceUnit = supplier.priceUnit || "per event"
  const category = supplier.category || "service"
  const serviceName = category.toLowerCase()
  
  const defaultPackages = [
    {
      id: "basic",
      name: "Basic Package",
      price: Math.round(basePrice * 1.0),
      duration: priceUnit,
      features: ["Standard service", "Up to 15 children", "Basic setup"],
      description: `Basic ${serviceName} package`,
    },
    {
      id: "premium",
      name: "Premium Package",
      price: Math.round(basePrice * 1.5),
      duration: priceUnit,
      features: ["Enhanced service", "Professional setup", "Up to 25 children"],
      description: `Enhanced ${serviceName} package`,
    },
    {
      id: "deluxe",
      name: "Deluxe Package",
      price: Math.round(basePrice * 2.0),
      duration: priceUnit,
      features: ["Premium service", "Full setup & cleanup", "Up to 35 children"],
      description: `Complete ${serviceName} package`,
    },
  ]
  
  return defaultPackages.map((pkg, index) => ({
    ...pkg,
    popular: pkg.id === selectedPackageId || (!selectedPackageId && index === 0),
  }))
}

// Generate portfolio images (your exact logic)
const generatePortfolioImages = (supplier) => {
  const defaultImages = [
    { id: "default-main", title: "Fun Party Main", image: `/placeholder.jpg`, alt: "Main party event image" },
    { id: "default-small-1", title: "Kids Playing", image: `/placeholder.jpg`, alt: "Kids playing at party" },
    { id: "default-small-2", title: "Party Games", image: `/placeholder.jpg`, alt: "Fun party games" },
    { id: "default-extra-1", title: "Decorations", image: `/placeholder.jpg`, alt: "Colorful party decorations" },
    { id: "default-extra-2", title: "Happy Children", image: `/placeholder.jpg`, alt: "Happy children celebrating" },
    { id: "default-extra-3", title: "Birthday Cake", image: `/placeholder.jpg`, alt: "Birthday cake with candles" },
  ]

  if (supplier?.portfolioImages && supplier.portfolioImages.length > 0) {
    const supplierProvidedImages = supplier.portfolioImages.map((img, index) => ({
      id: img.id || `portfolio-${index}`,
      title: img.title || `Portfolio Image ${index + 1}`,
      image: img.image || img.src || `/placeholder.svg?height=400&width=300&query=portfolio+${index + 1}`,
      description: img.description,
      alt: img.alt || img.title || `Portfolio image ${index + 1}`,
    }))
    return [...supplierProvidedImages, ...defaultImages.slice(supplierProvidedImages.length)].slice(0, 6)
  }
  return defaultImages.slice(0, 6)
}

// Generate credentials (your exact logic)
const generateCredentials = (supplier) => {
  const allCredentials = [
    {
      title: "DBS Certificate",
      subtitle: "Enhanced - Valid until Dec 2025",
      icon: <Shield className="w-5 h-5" />,
      verified: supplier?.serviceDetails?.certifications?.dbsCertificate,
    },
    {
      title: "Public Liability",
      subtitle: "£2M Coverage - Valid",
      icon: <Shield className="w-5 h-5" />,
      verified: supplier?.serviceDetails?.certifications?.publicLiability,
    },
    {
      title: "First Aid Certified",
      subtitle: "Pediatric First Aid - 2024",
      icon: <CheckCircle className="w-5 h-5" />,
      verified: supplier?.serviceDetails?.certifications?.firstAid,
    },
    {
      title: "ID Verified",
      subtitle: "Identity confirmed",
      icon: <Award className="w-5 h-5" />,
      verified: supplier?.verified,
    },
  ]
  
  return allCredentials.filter((cred) => cred.verified)
}

// Generate mock reviews (your exact logic)
const generateReviews = () => [
  {
    id: 1,
    name: "Sarah T.",
    avatar: "/andrew.jpg",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely fantastic! Made my son's 6th birthday unforgettable.",
    images: ["/placeholder.jpg", "/placeholder.jpg"],
  },
  {
    id: 2,
    name: "Mike J.",
    avatar: "/andrew.jpg",
    rating: 5,
    date: "1 month ago",
    text: "Professional, punctual, and incredibly entertaining.",
  },
  {
    id: 3,
    name: "Emma D.",
    avatar: "/andrew.jpg",
    rating: 4,
    date: "2 months ago",
    text: "Great entertainment value. Kids loved it.",
  },
]

// Detect if supplier is a cake specialist (your exact logic)
const detectCakeSupplier = (supplier) => {


  if (!supplier) return false

  // Method 1: Check if it's a catering supplier with cake specialization
  if (supplier?.category?.toLowerCase().includes('catering') || supplier?.category === 'Cakes') {
    const serviceDetails = supplier?.serviceDetails
    
    // Check for cake-specific indicators from your backend
    if (serviceDetails?.cateringType?.toLowerCase().includes('cake') ||
        serviceDetails?.cateringType?.toLowerCase().includes('baker') ||
        serviceDetails?.cateringType === 'Birthday Cake Specialist' ||
        serviceDetails?.cateringType === 'Custom Cake Designer' ||
        serviceDetails?.cateringType === 'Dessert Specialist') {
  
      return true
    }
    
    // Check if they have cake flavors defined (from your backend form)
    if (serviceDetails?.cakeFlavors?.length > 0) {

      return true
    }
    
    // Check explicit cake specialist flag
    if (serviceDetails?.cakeSpecialist === true) {
      
      return true
    }
  }
  
  // Method 2: Direct cake category
  if (supplier?.category?.toLowerCase().includes('cake')) {

    return true
  }
  
  // Method 3: Check supplier name for cake keywords
  const nameOrDesc = `${supplier?.name || ''} ${supplier?.description || ''}`.toLowerCase()
  if (nameOrDesc.includes('cake') || nameOrDesc.includes('bakery') || nameOrDesc.includes('patisserie')) {

    return true
  }
  

  return false
}

// Main hook that takes selectedPackageId as parameter to set popular flags
export const useSupplierData = (backendSupplier, selectedPackageId = null) => {
  // Transform supplier data
  const supplier = useMemo(() => 
    transformSupplierData(backendSupplier), 
    [backendSupplier]
  )
  
  // Generate packages (now includes selectedPackageId for popular flag)
  const packages = useMemo(() => 
    generatePackages(supplier, selectedPackageId), 
    [supplier, selectedPackageId]
  )
  
  // Generate portfolio
  const portfolioImages = useMemo(() => 
    generatePortfolioImages(supplier), 
    [supplier]
  )
  
  // Generate credentials  
  const credentials = useMemo(() => 
    generateCredentials(supplier), 
    [supplier]
  )
  
  // Generate reviews (static for now)
  const reviews = useMemo(() => 
    generateReviews(), 
    []
  )
  
  // Detect cake supplier
  const isCakeSupplier = useMemo(() => 
    detectCakeSupplier(supplier), 
    [supplier]
  )
  
  return {
    supplier,
    packages,
    portfolioImages,
    credentials,
    reviews,
    isCakeSupplier
  }
}

// Export individual functions in case they're needed elsewhere
export {
  transformSupplierData,
  generatePackages,
  generatePortfolioImages,
  generateCredentials,
  generateReviews,
  detectCakeSupplier
}