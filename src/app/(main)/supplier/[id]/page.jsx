"use client"

import { useState, useMemo, useEffect, use, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useContextualNavigation } from "@/hooks/useContextualNavigation"
import { useSupplier } from "@/utils/mockBackend"

import { Shield, Award, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

import { usePartyPlan } from '@/utils/partyPlanBackend'

import AddonSelectionModal from "@/components/supplier/addon-selection-modal"
import SupplierHeader from "@/components/supplier/supplier-header"
import SupplierPackages from "@/components/supplier/supplier-packages"
import SupplierReviews from "@/components/supplier/supplier-reviews"
import SupplierActionBar from "@/components/supplier/supplier-action-bar"
import AddingToPlanModal from "@/components/supplier/adding-to-plan-modal"
import NotificationPopup from "@/components/supplier/notification-popup"
import SupplierBadges from "@/components/supplier/supplier-badges"
import SupplierSidebar from "@/components/supplier/supplier-sidebar"
import MobileBookingBar from "@/components/supplier/mobile-booking-bar"
import AlaCarteModal from "../components/AddToCartModal"

import SupplierServiceDetails from "@/components/supplier/supplier-service-details"
import SupplierPortfolioGallery from "@/components/supplier/supplier-portfolio-gallery"
import SupplierCredentials from "@/components/supplier/supplier-credentials"
import SupplierQuickStats from "@/components/supplier/supplier-quick-stats"
import SupplierAvailabilityCalendar from "@/components/supplier/supplier-availability-calendar"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import AboutMeComponent from "@/components/supplier/about-me"
import PendingEnquiryModal from "@/components/supplier/PendingEnquiryModal"

import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"


const SelectedDateBanner = ({ selectedDate, currentMonth, onClearDate }) => {
  if (!selectedDate || !currentMonth) return null
  
  const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900 text-sm">
              Perfect! Party date selected
            </h4>
            <p className="text-sm text-green-700">
              {dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <button
          onClick={onClearDate}
          className="text-sm text-green-700 hover:text-green-800 underline transition-colors"
        >
          Change date
        </button>
      </div>
    </div>
  )
}

// Move this function outside the component to prevent recreation on every render
const hasValidPartyPlanDebug = () => {
  try {
    const localPlan = localStorage.getItem('user_party_plan')
    const localDetails = localStorage.getItem('party_details')
    
    if (!localPlan && !localDetails) {
      return false
    }
    
    let hasValidPlan = false
    let hasValidDetails = false
    
    if (localPlan) {
      try {
        const parsedPlan = JSON.parse(localPlan)
        const supplierCategories = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons']
        
        const validSuppliers = supplierCategories.filter(category => {
          const supplier = parsedPlan[category]
          return supplier && typeof supplier === 'object' && supplier.name
        })
        
        hasValidPlan = validSuppliers.length > 0
      } catch (error) {
        hasValidPlan = false
      }
    }
    
    if (localDetails) {
      try {
        const parsedDetails = JSON.parse(localDetails)
        const checks = {
          hasTheme: parsedDetails.theme && parsedDetails.theme !== 'general',
          hasDate: !!parsedDetails.date,
          hasChildName: parsedDetails.childName && parsedDetails.childName !== 'Emma',
          hasGuestCount: !!parsedDetails.guestCount,
          hasPostcode: !!parsedDetails.postcode,
          isAlaCarteSource: parsedDetails.source === 'a_la_carte'
        }
        
        hasValidDetails = Object.values(checks).some(check => check)
      } catch (error) {
        hasValidDetails = false
      }
    }
    
    return hasValidPlan || hasValidDetails
  } catch (error) {
    console.error('❌ Error in hasValidPartyPlan:', error)
    return false
  }
}

// Helper function to map supplier categories to party plan keys
const getCategoryMapping = (category) => {
  const mapping = {
    'Entertainment': 'entertainment',
    'Venues': 'venue',
    'Catering': 'catering',
    'Face Painting': 'facePainting',
    'Activities': 'activities',
    'Party Bags': 'partyBags',
    'Decorations': 'decorations'
  }
  return mapping[category] || 'entertainment'
}

export default function SupplierProfilePage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  
  // State variables
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [isAddingToPlan, setIsAddingToPlan] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [notification, setNotification] = useState(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [showAddonModal, setShowAddonModal] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [showAlaCarteModal, setShowAlaCarteModal] = useState(false)
  const [hasValidPlan, setHasValidPlan] = useState(false)
  const [finalPackageData, setFinalPackageData] = useState(null)
  const [progress, setProgress] = useState(0)
  const [showPendingEnquiryModal, setShowPendingEnquiryModal] = useState(false)
  // NEW: Add enquiry status state
const [enquiryStatus, setEnquiryStatus] = useState({
  isAwaiting: false,
  pendingCount: 0,
  enquiries: [],
  loading: false
})

  const id = useMemo(() => resolvedParams.id, [resolvedParams.id])

  
  // Hooks
  const { supplier: backendSupplier, loading: supplierLoading, error: supplierError } = useSupplier(id)
  const { partyPlan, addSupplier, addAddon, removeAddon, hasAddon } = usePartyPlan()
  const { navigateWithContext, navigationContext } = useContextualNavigation()

  // Memoized helper functions
  const hasPartyDate = useCallback(() => {
    try {
      const partyDetails = localStorage.getItem('party_details')
      if (!partyDetails) return false
      const parsed = JSON.parse(partyDetails)
      return !!(parsed.date)
    } catch (error) {
      return false
    }
  }, [])
  
  const getPartyDate = useCallback(() => {
    try {
      const partyDetails = localStorage.getItem('party_details')
      if (!partyDetails) return null
      const parsed = JSON.parse(partyDetails)
      return parsed.date ? new Date(parsed.date) : null
    } catch (error) {
      return null
    }
  }, [])
  
  const isFromDashboard = useCallback(() => {
    return navigationContext === 'dashboard' || hasPartyDate()
  }, [navigationContext, hasPartyDate])

  // Memoized supplier object
  const supplier = useMemo(() => {
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
    }
  }, [backendSupplier])


// NEW: Database-based enquiry checking
const checkEnquiryStatus = useCallback(async () => {
  try {
    setEnquiryStatus(prev => ({ ...prev, loading: true }))
    
    // Get current party ID from database
    const partyIdResult = await partyDatabaseBackend.getCurrentPartyId()
    
    if (!partyIdResult.success || !partyIdResult.partyId) {
      console.log('ℹ️ No current party found - user can modify plan freely')
      setEnquiryStatus({
        isAwaiting: false,
        pendingCount: 0,
        enquiries: [],
        loading: false
      })
      return { canModifyPlan: true, reason: 'no_current_party' }
    }
    
    // Check if party is awaiting responses
    const awaitingResult = await partyDatabaseBackend.isPartyAwaitingResponses(partyIdResult.partyId)
    
    if (awaitingResult.success) {
      setEnquiryStatus({
        isAwaiting: awaitingResult.isAwaiting,
        pendingCount: awaitingResult.pendingCount || 0,
        enquiries: awaitingResult.enquiries || [],
        loading: false
      })
      
      return {
        canModifyPlan: !awaitingResult.isAwaiting,
        reason: awaitingResult.isAwaiting ? 'awaiting_responses' : 'can_modify',
        pendingCount: awaitingResult.pendingCount || 0
      }
    } else {
      console.error('❌ Error checking enquiry status:', awaitingResult.error)
      // Default to allowing modifications if there's an error
      setEnquiryStatus({
        isAwaiting: false,
        pendingCount: 0,
        enquiries: [],
        loading: false
      })
      return { canModifyPlan: true, reason: 'error_default_allow' }
    }
    
  } catch (error) {
    console.error('❌ Exception checking enquiry status:', error)
    setEnquiryStatus({
      isAwaiting: false,
      pendingCount: 0,
      enquiries: [],
      loading: false
    })
    return { canModifyPlan: true, reason: 'exception_default_allow' }
  }
}, [])

// NEW: Effect to check enquiry status on component mount
useEffect(() => {
  if (hasValidPlan) {
    checkEnquiryStatus()
  }
}, [hasValidPlan, checkEnquiryStatus])

const hasEnquiriesPending = useCallback(() => {
  return enquiryStatus.isAwaiting
}, [enquiryStatus.isAwaiting])

const getPendingEnquiriesCount = useCallback(() => {
  return enquiryStatus.pendingCount
}, [enquiryStatus.pendingCount])



  // NEW: Function to check if user can modify the plan
  const canModifyPartyPlan = useCallback(async () => {
    const status = await checkEnquiryStatus()
    return status.canModifyPlan
  }, [checkEnquiryStatus])


  // Fix the party plan validation with stable reference
  useEffect(() => {
    const checkAndSetValidity = () => {
      const isValid = hasValidPartyPlanDebug()
      setHasValidPlan(prevValid => {
        if (prevValid !== isValid) {
          return isValid
        }
        return prevValid
      })
    }
    
    checkAndSetValidity()
    
    let timeoutId
    const handleStorageChange = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkAndSetValidity, 100)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearTimeout(timeoutId)
    }
  }, [])

  // Use the state value instead of calling the function
  const hasValidPartyPlan = useCallback(() => hasValidPlan, [hasValidPlan])

  // Memoized packages
  const packages = useMemo(() => {
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
      }))
    }
    
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
  }, [supplier, selectedPackageId])

  // Other memoized values (portfolio, credentials, reviews)
  const portfolioImages = useMemo(() => {
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
  }, [supplier?.portfolioImages])

  const credentials = useMemo(() => [
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
  ].filter((cred) => cred.verified), [supplier?.serviceDetails?.certifications, supplier?.verified])

  const reviews = useMemo(() => [
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
  ], [])

  // Effect for initial package selection - fix dependencies
  useEffect(() => {
    if (!supplierLoading && !hasLoadedOnce && packages.length > 0) {
      setHasLoadedOnce(true)
      
      const partyDetails = getSupplierInPartyDetails()
      
      if (partyDetails.inParty && partyDetails.currentPackage) {
        setSelectedPackageId(partyDetails.currentPackage)
      } else if (!selectedPackageId) {
        setSelectedPackageId(packages[0].id)
      }
    }
  }, [supplierLoading, hasLoadedOnce, packages, selectedPackageId])

  // Stable function references
  const getSupplierInPartyDetails = useCallback(() => {
    if (!supplier) return { inParty: false, currentPackage: null, supplierType: null }
    
    const isInAddons = hasAddon(supplier.id)
    const mainSlots = ["venue", "entertainment", "catering", "facePainting", "activities", "partyBags"]
    const supplierInMainSlot = mainSlots.find((slot) => partyPlan[slot]?.id === supplier.id)

    if (isInAddons) {
      const addon = partyPlan.addons?.find((addon) => addon.id === supplier.id)
      return {
        inParty: true,
        currentPackage: addon?.packageId || null,
        supplierType: "addon",
        currentSupplierData: addon,
      }
    }
    
    if (supplierInMainSlot) {
      const supplierData = partyPlan[supplierInMainSlot]
      return {
        inParty: true,
        currentPackage: supplierData?.packageId || null,
        supplierType: supplierInMainSlot,
        currentSupplierData: supplierData,
      }
    }
    
    return { inParty: false, currentPackage: null, supplierType: null }
  }, [supplier, hasAddon, partyPlan])

  const handleAlaCarteBooking = useCallback(async (partyDetails) => {
    console.log('🎯 handleAlaCarteBooking STARTED')
    console.log('📝 Received party details:', partyDetails)
    
    try {
      setShowAlaCarteModal(false)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setIsAddingToPlan(true)
      setLoadingStep(0)
      setProgress(10)
  
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackageId)
      
      localStorage.setItem('party_details', JSON.stringify({
        ...partyDetails,
        createdAt: new Date().toISOString(),
        source: 'a_la_carte'
      }))
  
      setLoadingStep(1)
      setProgress(40)
  
      // Create party plan with supplier - UPDATED with addon support
      const supplierCategory = getCategoryMapping(supplier.category)
      const partyPlan = {
        venue: null,
        entertainment: null,
        catering: null,
        facePainting: null,
        activities: null,
        partyBags: null,
        decorations: null,
        [supplierCategory]: {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          price: partyDetails.totalPrice || selectedPkg.price, // NEW: Use total price including addons
          status: "pending",
          image: supplier.image,
          category: supplier.category,
          priceUnit: supplier.priceUnit || "per event",
          packageId: selectedPkg.id,
          packageData: {
            ...selectedPkg,
            // NEW: Include addon information in package data
            selectedAddons: partyDetails.selectedAddons || [],
            totalPrice: partyDetails.totalPrice || selectedPkg.price,
            basePrice: partyDetails.basePrice || selectedPkg.price,
            addonsPriceTotal: (partyDetails.totalPrice || selectedPkg.price) - (partyDetails.basePrice || selectedPkg.price)
          },
          // NEW: Store addon information at supplier level too
          selectedAddons: partyDetails.selectedAddons || [],
          totalPrice: partyDetails.totalPrice || selectedPkg.price,
          basePrice: partyDetails.basePrice || selectedPkg.price,
          addedAt: new Date().toISOString(),
          originalSupplier: supplier
        },
        einvites: {
          id: "digital-invites",
          name: "Digital Party Invites",
          description: "Digital e-invitations with RSVP tracking",
          price: 25,
          status: "confirmed",
          image: "/placeholder.jpg",
          category: "Digital Services",
          priceUnit: "per set",
          addedAt: new Date().toISOString()
        },
        addons: []
      }
  
      setLoadingStep(3)
      setProgress(90)
  
      localStorage.setItem('user_party_plan', JSON.stringify(partyPlan))
  
      setLoadingStep(4)
      setProgress(100)
  
      await new Promise(resolve => setTimeout(resolve, 800))
  
      // NEW: Enhanced notification message with addon info
      const addonMessage = partyDetails.selectedAddons?.length > 0 
        ? ` with ${partyDetails.selectedAddons.length} exciting add-on${partyDetails.selectedAddons.length > 1 ? 's' : ''}` 
        : ''
      
      setNotification({ 
        type: "success", 
        message: `${supplier.name} added to your party plan${addonMessage}!` 
      })
  
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/dashboard")
  
    } catch (error) {
      console.error("❌ Error creating a la carte booking:", error)
      setNotification({ 
        type: "error", 
        message: "Failed to create party plan. Please try again." 
      })
    } finally {
      setIsAddingToPlan(false)
      setProgress(0)
    }
  }, [packages, selectedPackageId, supplier, router])



  // Other callback functions with proper dependencies
  const handleAddToPlan = useCallback(async (skipAddonModal = false, addonData = null) => {
    if (!supplier || !selectedPackageId) {
      setNotification({ type: "error", message: "Please select a package first." })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    if (hasValidPartyPlan()) {
      const canModify = await canModifyPartyPlan()

     
      if (!canModify) {
        console.log('🚫 Cannot modify plan - party is awaiting supplier responses')
        setShowPendingEnquiryModal(true)
        return
      }
    }

     // Check if we need a date first (calendar-first flow)
     if (!hasValidPartyPlan() && !selectedDate) {
      // Scroll to calendar with smooth animation
      const calendarElement = document.getElementById('availability-calendar')
      if (calendarElement) {
        calendarElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        })
        
        // Add a gentle highlight effect
        calendarElement.classList.add('ring-4', 'ring-orange-300', 'ring-opacity-75', 'transition-all', 'duration-500')
        setTimeout(() => {
          calendarElement?.classList.remove('ring-4', 'ring-orange-300', 'ring-opacity-75')
        }, 2500)
      }
      
      setNotification({ 
        type: "info", 
        message: "📅 Please select an available date from the calendar below first!",
        duration: 4000
      })
      setTimeout(() => setNotification(null), 4000)
      return
    }


    if (!hasValidPartyPlan()) {
      setShowAlaCarteModal(true)
      return
    }

    const selectedPkg = packages.find((pkg) => pkg.id === selectedPackageId)
    if (!selectedPkg) {
      setNotification({ type: "error", message: "Selected package not found." })
      return
    }
  
    const isEntertainer = supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"
    const hasAddons = supplier?.serviceDetails?.addOnServices?.length > 0
  
    if (isEntertainer && hasAddons && !skipAddonModal) {
      setShowAddonModal(true)
      return
    }
  
    const partyDetails = getSupplierInPartyDetails()
    setIsAddingToPlan(true)
    setLoadingStep(0)
    setProgress(10)
  
    try {
      const packageToAdd = addonData || selectedPkg
      const finalPrice = addonData ? addonData.totalPrice : selectedPkg.price
      
      const enhancedPackage = {
        ...packageToAdd.package || selectedPkg,
        addons: addonData?.addons || [],
        originalPrice: selectedPkg.price,
        totalPrice: finalPrice,
        addonsPriceTotal: addonData ? (addonData.totalPrice - selectedPkg.price) : 0
      }
  
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(1)
      setProgress(30)
  
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(2)
      setProgress(55)
  
      let result
      if (partyDetails.inParty) {
        if (partyDetails.currentPackage === selectedPackageId && !addonData) {
          setNotification({
            type: "info",
            message: `${supplier.name} with ${selectedPkg?.name || "this package"} is already in your dashboard!`,
          })
          setIsAddingToPlan(false)
          setProgress(0)
          setTimeout(() => setNotification(null), 3000)
          return
        }
  
        if (partyDetails.supplierType === "addon") {
          await removeAddon(supplier.id)
          const addonDataToAdd = {
            ...supplier,
            price: finalPrice,
            packageId: enhancedPackage.id,
            selectedAddons: enhancedPackage.addons,
            packageData: enhancedPackage
          }
          result = await addAddon(addonDataToAdd)
        } else {
          result = await addSupplier(backendSupplier, enhancedPackage)
        }
  
        if (result.success) {
          const addonMessage = addonData?.addons?.length > 0 ? ` with ${addonData.addons.length} add-on${addonData.addons.length > 1 ? 's' : ''}` : ''
          setNotification({ 
            type: "success", 
            message: `Package updated to ${selectedPkg?.name || "new package"}${addonMessage}!` 
          })
        }
      } else {
        const mainCategories = ["Venues", "Catering", "Party Bags", "Face Painting", "Activities", "Entertainment"]
        if (mainCategories.includes(supplier.category || "")) {
          result = await addSupplier(backendSupplier, enhancedPackage)
        } else {
          const addonDataToAdd = {
            ...supplier,
            price: finalPrice,
            packageId: enhancedPackage.id,
            selectedAddons: enhancedPackage.addons,
            packageData: enhancedPackage
          }
          result = await addAddon(addonDataToAdd)
        }
  
        if (result.success) {
          const addonMessage = addonData?.addons?.length > 0 ? ` with ${addonData.addons.length} exciting add-on${addonData.addons.length > 1 ? 's' : ''}` : ''
          setNotification({ 
            type: "success", 
            message: `${supplier.name} has been added to your party plan${addonMessage}!` 
          })
        }
      }
  
      setLoadingStep(3)
      setProgress(80)
      await new Promise((resolve) => setTimeout(resolve, 800))
  
      setLoadingStep(4)
      setProgress(100)
  
      if (result.success) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        if (navigationContext === "dashboard") {
          navigateWithContext("/dashboard", "supplier-detail")
        } else {
          router.push("/dashboard")
        }
      } else {
        throw new Error(result.error || "Failed to update party plan")
      }
    } catch (error) {
      console.error("Error updating party plan:", error)
      setNotification({ type: "error", message: error.message || "Failed to update party plan. Please try again." })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsAddingToPlan(false)
      setProgress(0)
      setShowAddonModal(false)
      setSelectedAddons([])
      setFinalPackageData(null)
    }
  }, [supplier, hasEnquiriesPending, selectedPackageId, hasValidPartyPlan, selectedDate, packages, getSupplierInPartyDetails, addSupplier, addAddon, removeAddon, backendSupplier, navigationContext, navigateWithContext, router])

  const handleAddonConfirm = useCallback((addonData) => {
    setSelectedAddons(addonData.addons)
    setFinalPackageData(addonData)
    setShowAddonModal(false)

    addonData.addons.forEach(addon => {
      const enhancedAddon = {
        ...addon,
        supplierId: supplier?.id,
        supplierName: supplier?.name,
        packageId: addonData.package?.id,
        addedAt: new Date().toISOString()
      }
      addAddon(enhancedAddon)
    })
    
    handleAddToPlan(true, addonData)
  }, [supplier, addAddon, handleAddToPlan])
  
  const handleAddonModalClose = useCallback(() => {
    setShowAddonModal(false)
    setSelectedAddons([])
    setFinalPackageData(null)
  }, [])

  const getSelectedCalendarDate = useCallback(() => {
    if (!selectedDate || !currentMonth) return null
    
    // Create the date object with local timezone (no UTC conversion)
    const selectedDateObj = new Date(
      currentMonth.getFullYear(), 
      currentMonth.getMonth(), 
      selectedDate
    )
    
    // Use local date methods instead of toISOString() to avoid timezone issues
    const year = selectedDateObj.getFullYear()
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0') // +1 because getMonth() is 0-based
    const day = String(selectedDateObj.getDate()).padStart(2, '0')
    
    // Format as YYYY-MM-DD using local date components
    return `${year}-${month}-${day}`
  }, [selectedDate, currentMonth])
  

  const getAddToPartyButtonState = useCallback((packageIdToCompare) => {
    const currentPackageId = packageIdToCompare || selectedPackageId
    const partyDetails = getSupplierInPartyDetails()
    const isLoadingThisPackage = isAddingToPlan && selectedPackageId === currentPackageId
    const hasPartyPlan = hasValidPartyPlan()
    
    if (isLoadingThisPackage) {
      return {
        disabled: true,
        className: "bg-gray-400",
        text: (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {partyDetails.inParty && partyDetails.currentPackage === currentPackageId ? "Updating..." : "Adding..."}
          </>
        ),
      }
    }
    
    if (partyDetails.inParty && partyDetails.currentPackage === currentPackageId && hasPartyPlan) {
      return {
        disabled: true,
        className: "bg-green-500 hover:bg-green-500 text-white cursor-not-allowed",
        text: (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            In Plan
          </>
        ),
      }
    }
    
    if (!currentPackageId) {
      return {
        disabled: true,
        className: "bg-gray-300 text-gray-500 cursor-not-allowed",
        text: "Select a Package",
      }
    }
    
    // NEW: Check if date is required for booking
    if (!hasPartyPlan && !selectedDate) {
      return {
        disabled: true,
        className: "bg-orange-400 hover:bg-orange-500 text-white cursor-pointer",
        text: (
          <>
            <Calendar className="w-4 h-4 mr-2" />
            Pick a Date First
          </>
        ),
        requiresDate: true // NEW: Add this flag
      }
    }
    
    const buttonText = hasPartyPlan ? "Add to Plan" : "Book This Supplier"
    
    return { 
      disabled: false, 
      className: "bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white", 
      text: buttonText 
    }
  }, [selectedPackageId, getSupplierInPartyDetails, isAddingToPlan, hasValidPartyPlan, selectedDate])

  // Loading and error states
  if (supplierLoading && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (hasLoadedOnce && (supplierError || !supplier)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {supplierError ? "Error Loading Supplier" : "Oops! Supplier Not Found"}
        </h1>
        <p className="text-gray-600 mb-6">
          {supplierError
            ? "We encountered an error trying to load the supplier details. Please try again later."
            : "We couldn't find the supplier you're looking for. It might have been removed or the link is incorrect."}
        </p>
        <Button onClick={() => router.push("/")}>Go to Homepage</Button>
      </div>
    )
  }

  if (supplierLoading || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Compute these values once
  const dashboardContext = isFromDashboard()
  const userPartyDate = getPartyDate()



  return (
    <div className="bg-[#F4F5F7] min-h-screen font-sans">
      <NotificationPopup notification={notification} />

      <ContextualBreadcrumb currentPage="supplier-detail" />
      
      <SupplierHeader
        supplier={supplier}
        portfolioImages={portfolioImages}
        getSupplierInPartyDetails={getSupplierInPartyDetails}
        getAddToPartyButtonState={getAddToPartyButtonState}
        handleAddToPlan={handleAddToPlan}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2 space-y-8">
            <SupplierPackages
              packages={packages}
              selectedPackageId={selectedPackageId}
              setSelectedPackageId={setSelectedPackageId}
              handleAddToPlan={handleAddToPlan}
              getAddToPartyButtonState={getAddToPartyButtonState}
              getSupplierInPartyDetails={getSupplierInPartyDetails}
            />
            {/* NEW: Add selected date confirmation */}
  <SelectedDateBanner 
    selectedDate={selectedDate}
    currentMonth={currentMonth}
    onClearDate={() => setSelectedDate(null)}
  />
            <SupplierServiceDetails supplier={supplier} />
            <SupplierPortfolioGallery 
              portfolioImages={supplier?.portfolioImages || []} 
              portfolioVideos={supplier?.portfolioVideos || []}
            />
            <SupplierCredentials credentials={credentials} />
            <SupplierReviews reviews={reviews} />
            <SupplierBadges supplier={supplier} />
            <SupplierQuickStats supplier={supplier} />
            <AboutMeComponent supplier={supplier} />
          </main>
          
          <aside className="hidden md:block lg:col-span-1">
            <SupplierSidebar
              supplier={supplier}
              packages={packages}
              selectedPackageId={selectedPackageId}
              handleAddToPlan={handleAddToPlan}
              getAddToPartyButtonState={getAddToPartyButtonState}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              credentials={credentials}
              isFromDashboard={dashboardContext}
              partyDate={userPartyDate}
            />
          </aside>
        </div>
      </div>

      <SupplierActionBar
        supplierPhoneNumber={supplier.phone}
        getAddToPartyButtonState={() => getAddToPartyButtonState(selectedPackageId)}
        handleAddToPlan={handleAddToPlan}
      />

      <AddonSelectionModal
        isOpen={showAddonModal}
        onClose={handleAddonModalClose}
        onConfirm={handleAddonConfirm}
        supplier={supplier}
        selectedPackage={packages.find(pkg => pkg.id === selectedPackageId)}
        isEntertainer={supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"}
      />

      <AddingToPlanModal
        isAddingToPlan={isAddingToPlan}
        loadingStep={loadingStep}
        theme={partyPlan?.theme || "default"}
        progress={progress}
      />


<MobileBookingBar 
  selectedPackage={packages.find(pkg => pkg.id === selectedPackageId) || packages[0] || null}
  supplier={supplier}
  onAddToPlan={handleAddToPlan}
  addToPlanButtonState={getAddToPartyButtonState(selectedPackageId)}
  selectedDate={selectedDate}
  currentMonth={currentMonth}
  setSelectedDate={setSelectedDate}
  setCurrentMonth={setCurrentMonth}
  hasValidPartyPlan={hasValidPartyPlan}
  isFromDashboard={dashboardContext}
  partyDate={userPartyDate}
  onSaveForLater={(data) => {
    setNotification({ 
      type: "success", 
      message: `${supplier.name} saved for later!` 
    });
    setTimeout(() => setNotification(null), 3000);
  }}
  showAddonModal={showAddonModal}
  setShowAddonModal={setShowAddonModal}
  onAddonConfirm={handleAddonConfirm}
  isAddingToPlan={isAddingToPlan}
  // NEW: Add these props for pending enquiry functionality
  hasEnquiriesPending={hasEnquiriesPending}
  onShowPendingEnquiryModal={() => setShowPendingEnquiryModal(true)}
  pendingCount={getPendingEnquiriesCount()}
/>

      {/* Only render modal when it should be open AND we have valid data */}
      {showAlaCarteModal && supplier && (
        <AlaCarteModal
          isOpen={showAlaCarteModal}
          onClose={() => setShowAlaCarteModal(false)}
          supplier={supplier}
          selectedPackage={packages.find(pkg => pkg.id === selectedPackageId)}
          onBuildFullParty={() => {
            setShowAlaCarteModal(false)
            router.push('/party-builder')
          }}
          onJustBookSupplier={handleAlaCarteBooking}
          preSelectedDate={getSelectedCalendarDate()} 
        />
      )}
 <PendingEnquiryModal
        isOpen={showPendingEnquiryModal}
        onClose={() => setShowPendingEnquiryModal(false)}
        supplier={supplier}
        pendingCount={getPendingEnquiriesCount()}
        enquiries={enquiryStatus.enquiries} // NEW: Pass actual enquiry data
        estimatedResponseTime="24 hours"
        onViewDashboard={() => {
          setShowPendingEnquiryModal(false)
          router.push('/dashboard')
        }}
      />
    </div>
  )
}