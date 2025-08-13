"use client"

import { useState, useMemo, useEffect, use, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useContextualNavigation } from "@/hooks/useContextualNavigation"
import { useSupplier } from "@/utils/mockBackend"
import { useUserTypeDetection, getHandleAddToPlanBehavior } from '@/hooks/useUserTypeDetection'

import { supabase } from "@/lib/supabase"

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
import SupplierUnavailableModal from "@/components/supplier/supplier-unavailable-modal"

import SupplierServiceDetails from "@/components/supplier/supplier-service-details"
import SupplierPortfolioGallery from "@/components/supplier/supplier-portfolio-gallery"
import SupplierCredentials from "@/components/supplier/supplier-credentials"
import SupplierQuickStats from "@/components/supplier/supplier-quick-stats"
import SupplierAvailabilityCalendar from "@/components/supplier/supplier-availability-calendar"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import AboutMeComponent from "@/components/supplier/about-me"
import PendingEnquiryModal from "@/components/supplier/PendingEnquiryModal"

import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"


const UserDetectionDebugger = () => {
  const [localStorageData, setLocalStorageData] = useState({})
  const [authUser, setAuthUser] = useState(null)
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setAuthUser(user)
    }
    checkAuth()
  }, [])
  
  useEffect(() => {
    const checkStorage = () => {
      setLocalStorageData({
        partyPlan: localStorage.getItem('user_party_plan'),
        partyDetails: localStorage.getItem('party_details'),
        hasValidPlan: hasValidPartyPlanDebug()
      })
    }
    
    checkStorage()
    const interval = setInterval(checkStorage, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Get the actual behavior
  const behavior = getHandleAddToPlanBehavior(userType, userContext, supplier, selectedDate)
  const buttonState = getAddToPartyButtonState(selectedPackageId)
  
  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-sm text-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-sm">🔍 User Detection Debug</h4>
        <button onClick={() => setDebugMode(false)} className="text-red-500">×</button>
      </div>
      
      <div className="space-y-2">
        {/* Auth Status */}
        <div className="bg-gray-50 p-2 rounded">
          <div className="font-semibold">Authentication:</div>
          <div>User ID: <span className="font-mono">{authUser?.id || 'None'}</span></div>
          <div>Email: <span className="font-mono">{authUser?.email || 'None'}</span></div>
        </div>
        
        {/* Storage Status */}
        <div className="bg-gray-50 p-2 rounded">
          <div className="font-semibold">Local Storage:</div>
          <div>Party Plan: <strong>{!!localStorageData.partyPlan ? 'Yes' : 'No'}</strong></div>
          <div>Party Details: <strong>{!!localStorageData.partyDetails ? 'Yes' : 'No'}</strong></div>
          <div>Has Valid Plan: <strong>{localStorageData.hasValidPlan ? 'Yes' : 'No'}</strong></div>
        </div>
        
        {/* User Type Detection */}
        <div className="bg-blue-50 p-2 rounded">
          <div className="font-semibold">User Type Detection:</div>
          <div>Loading: <strong>{loading ? 'Yes' : 'No'}</strong></div>
          <div>User Type: <strong className="text-blue-600">{userType || 'null'}</strong></div>
          <div>Data Source: <strong>{userContext?.dataSource || 'null'}</strong></div>
          <div>Needs Date: <strong>{userContext?.needsDateSelection ? 'Yes' : 'No'}</strong></div>
        </div>
        
        {/* Calendar State */}
        <div className="bg-green-50 p-2 rounded">
          <div className="font-semibold">Calendar State:</div>
          <div>Selected Date: <strong>{selectedDate || 'None'}</strong></div>
          <div>Current Month: <strong>{currentMonth?.getMonth() + 1}/{currentMonth?.getFullYear()}</strong></div>
        </div>
        
        {/* Behavior Logic */}
        <div className="bg-yellow-50 p-2 rounded">
          <div className="font-semibold">Behavior Logic:</div>
          <div>Show Date Picker: <strong>{behavior?.shouldShowDatePicker ? 'Yes' : 'No'}</strong></div>
          <div>Show À La Carte: <strong>{behavior?.shouldShowAlaCarteModal ? 'Yes' : 'No'}</strong></div>
          <div>Check Category: <strong>{behavior?.shouldCheckCategoryOccupation ? 'Yes' : 'No'}</strong></div>
          <div>Send Enquiry: <strong>{behavior?.shouldSendEnquiry ? 'Yes' : 'No'}</strong></div>
        </div>
        
        {/* Button State */}
        <div className="bg-purple-50 p-2 rounded">
          <div className="font-semibold">Button State:</div>
          <div>Text: <strong className="text-purple-600">"{behavior?.buttonText}"</strong></div>
          <div>Disabled: <strong>{behavior?.buttonDisabled ? 'Yes' : 'No'}</strong></div>
          <div>Actual Text: <strong>"{typeof buttonState?.text === 'string' ? buttonState.text : 'JSX'}"</strong></div>
          <div>Actual Disabled: <strong>{buttonState?.disabled ? 'Yes' : 'No'}</strong></div>
        </div>
        
        {/* Actions */}
        <div className="pt-2 border-t">
          <button 
            onClick={() => {
              console.log('🔄 Manual behavior check:', behavior)
              console.log('🔄 Manual button state:', buttonState)
              console.log('🔄 Selected package ID:', selectedPackageId)
              console.log('🔄 Packages:', packages)
            }}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded mr-2"
          >
            Log Details
          </button>
          <button 
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
          >
            Clear & Reload
          </button>
        </div>
      </div>
    </div>
  )
}


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


export default function SupplierProfilePage({ backendSupplier }) {
  const router = useRouter()

  const { userType, userContext, loading: userTypeLoading } = useUserTypeDetection()
  const { partyPlan, addSupplier, addAddon, removeAddon, hasAddon } = usePartyPlan()
  const { navigateWithContext, navigationContext } = useContextualNavigation()
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [debugMode, setDebugMode] = useState(false)
  const [currentPartyId, setCurrentPartyId] = useState(null)
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
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)
  const [enquiryStatus, setEnquiryStatus] = useState({
  isAwaiting: false,
  pendingCount: 0,
  enquiries: [],
  loading: false
})


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



// Add handler functions for the unavailable modal:
const handleSelectNewDate = useCallback(() => {
  setShowUnavailableModal(false)
  // Scroll to calendar
  const calendarElement = document.getElementById('availability-calendar')
  if (calendarElement) {
    calendarElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center'
    })
    
    // Clear selected date to force new selection
    setSelectedDate(null)
    
    // Add highlight effect
    calendarElement.classList.add('ring-4', 'ring-blue-300', 'ring-opacity-75', 'transition-all', 'duration-500')
    setTimeout(() => {
      calendarElement?.classList.remove('ring-4', 'ring-blue-300', 'ring-opacity-75')
    }, 3000)
  }
  
  setNotification({ 
    type: "info", 
    message: "📅 Please select a different date when the supplier is available",
    duration: 4000
  })
  setTimeout(() => setNotification(null), 4000)
}, [])


const getSelectedCalendarDate = useCallback(() => {
  if (!selectedDate || !currentMonth) {
    console.log('❌ No selected date or current month:', { selectedDate, currentMonth })
    return null
  }
  
  try {
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
    const dateString = `${year}-${month}-${day}`
    console.log('📅 Generated calendar date string:', dateString)
    return dateString
  } catch (error) {
    console.error('❌ Error generating calendar date:', error)
    return null
  }
}, [selectedDate, currentMonth])

const handleViewAlternatives = useCallback(() => {
  setShowUnavailableModal(false)
  // Navigate to supplier search with same category and date filters
  const searchParams = new URLSearchParams({
    category: supplier.category || '',
    date: getSelectedCalendarDate() || '',
    available: 'true'
  })
  
  router.push(`/suppliers?${searchParams.toString()}`)
}, [supplier, getSelectedCalendarDate, router])
  // Add this useEffect to get party ID:
useEffect(() => {
  const getPartyId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const partyIdResult = await partyDatabaseBackend.getCurrentPartyId()
      if (partyIdResult.success) {
        setCurrentPartyId(partyIdResult.partyId)
      }
    }
  }
  getPartyId()
}, [])
useEffect(() => {
  if (!userTypeLoading && backendSupplier) {
    // Small delay to ensure smooth transition
    setTimeout(() => setIsLoaded(true), 100)
  }
}, [userTypeLoading, backendSupplier])


// NEW: Database-based enquiry checking
const checkEnquiryStatus = useCallback(async () => {

  // Early return if no valid plan
 

  try {
    setEnquiryStatus(prev => ({ ...prev, loading: true }))

    
    const { data: { user } } = await supabase.auth.getUser()


    if (!user) {

      setEnquiryStatus({
        isAwaiting: false,
        pendingCount: 0,
        enquiries: [],
        loading: false
      })
      return { canModifyPlan: true, reason: 'no_auth' }
    }
    
    // FIX: Get the party ID first
    const partyIdResult = await partyDatabaseBackend.getCurrentPartyId()



    
    if (!partyIdResult.success || !partyIdResult.partyId) {
  
      setEnquiryStatus({
        isAwaiting: false,
        pendingCount: 0,
        enquiries: [],
        loading: false
      })
      return { canModifyPlan: true, reason: 'no_party_id' }
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
}, [hasValidPlan])

// Actually, even better - make it always run:
// Try this:
useEffect(() => {

  checkEnquiryStatus()
}, []) // Empty dependency array to run once on mount

// OR try this to run it when the component is ready:
useEffect(() => {
  if (isLoaded && !userTypeLoading) {

    checkEnquiryStatus()
  }
}, [isLoaded, userTypeLoading])

const hasEnquiriesPending = useCallback(() => {
  return enquiryStatus.isAwaiting
}, [enquiryStatus.isAwaiting])

const getPendingEnquiriesCount = useCallback(() => {
  return enquiryStatus.pendingCount
}, [enquiryStatus.pendingCount])


const checkSupplierAvailability = useCallback((dateToCheck) => {
  console.log('🔍 === AVAILABILITY CHECK START ===')
  console.log('🔍 Date to check:', dateToCheck)
  console.log('🔍 Supplier name:', supplier?.name)
  console.log('🔍 Supplier unavailable dates (raw):', supplier?.unavailableDates)
  
  if (!supplier || !dateToCheck) {
    console.log('❌ No supplier or date to check')
    return true
  }
  
  try {
    // Parse the date we're checking (user's party date)
    const checkDate = new Date(dateToCheck + 'T12:00:00') // Add noon to avoid timezone edge cases
    if (isNaN(checkDate.getTime())) {
      console.log('❌ Invalid date to check:', dateToCheck)
      return true
    }
    
    console.log('🔍 Parsed check date:', checkDate)
    console.log('🔍 Check date in London timezone:', checkDate.toLocaleDateString('en-GB'))
    
    // Check unavailable dates with timezone awareness
    if (supplier.unavailableDates && supplier.unavailableDates.length > 0) {
      console.log('🔍 Checking against unavailable dates...')
      
      const isUnavailable = supplier.unavailableDates.some((unavailableDate, index) => {
        console.log(`🔍 [${index}] Checking unavailable date:`, unavailableDate)
        
        try {
          // Parse the database timestamp
          const unavailableDateTime = new Date(unavailableDate)
          
          if (isNaN(unavailableDateTime.getTime())) {
            console.log(`❌ [${index}] Invalid unavailable date format:`, unavailableDate)
            return false
          }
          
          // Convert both dates to local date strings for comparison
          const checkDateString = checkDate.toLocaleDateString('en-GB') // DD/MM/YYYY
          const unavailableDateString = unavailableDateTime.toLocaleDateString('en-GB') // DD/MM/YYYY
          
          console.log(`🔍 [${index}] Comparing local dates:`)
          console.log(`🔍 [${index}]   Check date: ${checkDateString}`)
          console.log(`🔍 [${index}]   Unavailable: ${unavailableDateString}`)
          
          const isSameDate = checkDateString === unavailableDateString
          
          if (isSameDate) {
            console.log(`❌ [${index}] MATCH FOUND! ${unavailableDate} matches ${dateToCheck}`)
            console.log(`❌ [${index}] Database timestamp ${unavailableDate} = ${unavailableDateString} in London time`)
          }
          
          return isSameDate
        } catch (error) {
          console.log(`❌ [${index}] Error parsing unavailable date:`, unavailableDate, error)
          return false
        }
      })
      
      console.log(`🔍 Final unavailable check result: ${isUnavailable}`)
      
      if (isUnavailable) {
        console.log(`❌ Supplier ${supplier.name} is UNAVAILABLE on ${dateToCheck}`)
        return false
      }
    }
    
    // Check working hours
    const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    console.log(`🔍 Day of week: ${dayOfWeek}`)
    
    if (supplier.workingHours && supplier.workingHours[dayOfWeek]) {
      const workingDay = supplier.workingHours[dayOfWeek]
      if (!workingDay.active || workingDay.active === false) {
        console.log(`❌ Supplier ${supplier.name} is not working on ${dayOfWeek}`)
        return false
      }
    }
    
    // Check busy dates (similar timezone handling)
    if (supplier.busyDates && supplier.busyDates.length > 0) {
      const isBusy = supplier.busyDates.some(busyDate => {
        try {
          const busyDateTime = new Date(busyDate)
          const checkDateString = checkDate.toLocaleDateString('en-GB')
          const busyDateString = busyDateTime.toLocaleDateString('en-GB')
          return checkDateString === busyDateString
        } catch (error) {
          console.log('❌ Error parsing busy date:', busyDate, error)
          return false
        }
      })
      
      if (isBusy) {
        console.log(`⚠️ Supplier ${supplier.name} is busy on ${dateToCheck} but might still be available`)
        return true // Treat busy as available for now
      }
    }
    
    console.log(`✅ Supplier ${supplier.name} is AVAILABLE on ${dateToCheck}`)
    return true
    
  } catch (error) {
    console.error('❌ Error checking supplier availability:', error)
    return true // Default to available on error
  }
}, [supplier])





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

  useEffect(() => {
    if (packages.length > 0 && !selectedPackageId) {
      const partyDetails = getSupplierInPartyDetails()
      
      if (partyDetails.inParty && partyDetails.currentPackage) {
        setSelectedPackageId(partyDetails.currentPackage)
      } else {
        setSelectedPackageId(packages[0].id)
      }
    }
  }, [packages, selectedPackageId, getSupplierInPartyDetails])


  const handleAlaCarteBooking = useCallback(async (partyDetails) => {
  
    if (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0) {
      console.log('🚫 User trying to add supplier - showing pending enquiry modal')
      setShowPendingEnquiryModal(true)
      return // Exit early
    }
  
    try {
      // Close modal first
      setShowAlaCarteModal(false)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Start loading states
      setIsAddingToPlan(true)
      setLoadingStep(0)
      setProgress(10)
  
      // ✅ FIX 1: Validate required data
      if (!partyDetails) {
        throw new Error('No party details provided')
      }
  
      if (!supplier) {
        throw new Error('No supplier data available')
      }
  
      // Get selected package
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackageId)
      if (!selectedPkg) {
        throw new Error('No package selected')
      }
      
      console.log('📦 Selected package:', selectedPkg)
      console.log('🏪 Supplier:', { id: supplier.id, name: supplier.name, category: supplier.category })
      
      setProgress(25)
  
      const enhancedPartyDetails = {
        // Essential party info
        childName: partyDetails.childName || 'Your Child',
        childAge: parseInt(partyDetails.childAge) || 6,
        date: partyDetails.date || new Date().toISOString().split('T')[0], // Fallback to today
        time: partyDetails.time || '14:00',
        location: partyDetails.location || 'London',
        postcode: partyDetails.postcode || 'SW1A 1AA',
        guestCount: parseInt(partyDetails.guestCount) || 10,
        theme: partyDetails.theme || 'superhero',
        
        // Pricing
        totalPrice: partyDetails.totalPrice || selectedPkg.price,
        basePrice: partyDetails.basePrice || selectedPkg.price,
        selectedAddons: partyDetails.selectedAddons || [],
        
        // Metadata
        createdAt: new Date().toISOString(),
        source: 'a_la_carte',
        
        // ✅ PRESERVE A-LA-CARTE SPECIFIC FIELDS - This was missing!
        firstName: partyDetails.firstName, // Preserve first name
        lastName: partyDetails.lastName,   // Preserve last name  
        skipWelcomePopup: partyDetails.skipWelcomePopup, // Preserve skip flag
        timeSlot: partyDetails.timeSlot,   // Preserve time slot
        
        // Add essential fields that might be missing
        duration: partyDetails.duration || '2 hours',
        budget: partyDetails.totalPrice || selectedPkg.price
      }
      
      console.log('✨ Enhanced party details:', enhancedPartyDetails)
  
      setProgress(40)
  
      // ✅ FIX 4: Save party details with error handling
      try {
        localStorage.setItem('party_details', JSON.stringify(enhancedPartyDetails))
        console.log('💾 Party details saved to localStorage')
        
        // Verify it was saved
        const saved = localStorage.getItem('party_details')
        if (!saved) {
          throw new Error('Failed to save party details to localStorage')
        }
      } catch (storageError) {
        console.error('❌ Storage error:', storageError)
        throw new Error('Failed to save party details')
      }
  
      setProgress(60)
  
      // ✅ FIX 5: Improved category mapping with debug
      const getCategoryMapping = (category) => {
        const mapping = {
          'Entertainment': 'entertainment',
          'Venues': 'venue',
          'Venue': 'venue', 
          'Catering': 'catering',
          'Face Painting': 'facePainting',
          'Activities': 'activities',
          'Party Bags': 'partyBags',
          'Decorations': 'decorations',
          'Balloons': 'balloons',
          'Photography': 'photography'
        }
        
        const result = mapping[category] || 'entertainment'
        console.log('🎯 Category mapping:', category, '→', result)
        return result
      }
  
      const supplierCategory = getCategoryMapping(supplier.category)
  
      // ✅ FIX 6: Create robust party plan structure
      const partyPlan = {
        // Initialize all possible slots
        venue: null,
        entertainment: null,
        catering: null,
        facePainting: null,
        activities: null,
        partyBags: null,
        decorations: null,
        balloons: null,
        photography: null,
        
        // Add the selected supplier to correct category
        [supplierCategory]: {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description || `${supplier.category} service`,
          price: enhancedPartyDetails.totalPrice,
          status: "confirmed", // ✅ FIX: Set as confirmed for à la carte
          image: supplier.image || supplier.coverPhoto || supplier.avatar,
          category: supplier.category,
          priceUnit: supplier.priceUnit || "per event",
          packageId: selectedPkg.id,
          packageData: {
            ...selectedPkg,
            selectedAddons: enhancedPartyDetails.selectedAddons,
            totalPrice: enhancedPartyDetails.totalPrice,
            basePrice: enhancedPartyDetails.basePrice,
            addonsPriceTotal: enhancedPartyDetails.totalPrice - enhancedPartyDetails.basePrice
          },
          selectedAddons: enhancedPartyDetails.selectedAddons,
          totalPrice: enhancedPartyDetails.totalPrice,
          basePrice: enhancedPartyDetails.basePrice,
          addedAt: new Date().toISOString(),
          originalSupplier: {
            ...supplier,
            // Include backend data if available
            ...(backendSupplier || {})
          },
          // ✅ FIX 7: Add à la carte specific fields
          bookingMethod: 'a_la_carte',
          confirmed: true
        },
        
    
        
        // Initialize empty addons array
        addons: [],
        
        // ✅ FIX 8: Add metadata
        createdAt: new Date().toISOString(),
        source: 'a_la_carte',
        theme: enhancedPartyDetails.theme
      }
  
      console.log('🎪 Created party plan:')
      console.log('  - Supplier category:', supplierCategory)
      console.log('  - Supplier data:', partyPlan[supplierCategory])
      console.log('  - Total slots filled:', Object.keys(partyPlan).filter(key => 
        partyPlan[key] && typeof partyPlan[key] === 'object' && partyPlan[key].name
      ).length)
  
      setProgress(80)
  
      // ✅ FIX 9: Save party plan with verification
      try {
        localStorage.setItem('user_party_plan', JSON.stringify(partyPlan))
        console.log('💾 Party plan saved to localStorage')
        
        // Verify it was saved correctly
        const savedPlan = localStorage.getItem('user_party_plan')
        if (!savedPlan) {
          throw new Error('Failed to save party plan to localStorage')
        }
        
        const parsedPlan = JSON.parse(savedPlan)
        if (!parsedPlan[supplierCategory] || !parsedPlan[supplierCategory].name) {
          throw new Error('Party plan structure is incorrect after saving')
        }
        
        console.log('✅ Party plan verified in localStorage')
      } catch (storageError) {
        console.error('❌ Storage error:', storageError)
        throw new Error('Failed to save party plan')
      }
  
      setProgress(95)
  
      // ✅ FIX 10: Success notification
      const addonMessage = enhancedPartyDetails.selectedAddons?.length > 0 
        ? ` with ${enhancedPartyDetails.selectedAddons.length} add-on${enhancedPartyDetails.selectedAddons.length > 1 ? 's' : ''}` 
        : ''
      
      setNotification({ 
        type: "success", 
        message: `🎉 ${supplier.name} added to your party plan${addonMessage}!` 
      })
  
      setProgress(100)
      console.log('✅ À la carte booking completed successfully')
  
      // Wait for progress animation and notification
      await new Promise(resolve => setTimeout(resolve, 1500))
  
      // ✅ FIX 11: Navigate with proper URL parameters
      console.log('🚀 Navigating to dashboard with welcome flag')
      router.push("/dashboard?show_welcome=true&source=a_la_carte")
  
    } catch (error) {
      console.error("❌ Error in handleAlaCarteBooking:", error)
      console.error("❌ Error stack:", error.stack)
      
      setNotification({ 
        type: "error", 
        message: `Failed to create party plan: ${error.message}. Please try again.` 
      })
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000)
    } finally {
      // ✅ FIX 12: Always clean up loading states
      setIsAddingToPlan(false)
      setProgress(0)
      setLoadingStep(0)
      console.log('🔧 Cleanup completed')
    }
  }, [packages, selectedPackageId, supplier, backendSupplier, router])
  const handleAddToPlan = useCallback(async (skipAddonModal = false, addonData = null) => {
    console.log('🚀 === HANDLE ADD TO PLAN START ===')
    console.log('🚀 userType:', userType)
    console.log('🚀 selectedDate:', selectedDate)
    console.log('🚀 skipAddonModal:', skipAddonModal)
    console.log('🚀 addonData:', addonData)
  
    // Check if user has pending enquiries
    if (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0) {
      console.log('🚫 User has pending enquiries - showing pending enquiry modal')
      setShowPendingEnquiryModal(true)
      return
    }
  
    // Basic validation
    if (!supplier || !selectedPackageId) {
      setNotification({ type: "error", message: "Please select a package first." })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    // Get behavior based on user type
    const behavior = getHandleAddToPlanBehavior(userType, userContext, supplier, selectedDate)
    console.log('🚀 Behavior:', behavior)
    
    // 1. DATE PICKER FLOW - For anonymous/new users who need to select a date first
    if (behavior.shouldShowDatePicker) {
      console.log('📅 Showing date picker prompt')
      const calendarElement = document.getElementById('availability-calendar')
      if (calendarElement) {
        calendarElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        })
        
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
  
    // 2. AVAILABILITY CHECK #1 - For users with calendar selected dates
    if (selectedDate && currentMonth) {
      const dateString = getSelectedCalendarDate()
      console.log('🔍 CALENDAR DATE AVAILABILITY CHECK')
      console.log('🔍 selectedDate:', selectedDate)
      console.log('🔍 currentMonth:', currentMonth)
      console.log('🔍 dateString:', dateString)
      
      if (dateString) {
        const isAvailable = checkSupplierAvailability(dateString)
        console.log('🔍 Calendar date availability result:', isAvailable)
        
        if (!isAvailable) {
          console.log('🚫 Supplier unavailable on calendar selected date - showing unavailable modal')
          setShowUnavailableModal(true)
          return
        }
      }
    }
  
    // 3. AVAILABILITY CHECK #2 - For users with party dates from localStorage/database
    if (!selectedDate && (userType === 'LOCALSTORAGE_USER' || userType === 'DATABASE_USER' || userType === 'MIGRATION_NEEDED')) {
      let partyDateToCheck = null
      
      console.log('🔍 PARTY DATE AVAILABILITY CHECK')
      console.log('🔍 userType:', userType)
      
      // For localStorage users, check party_details
      if (userType === 'LOCALSTORAGE_USER' || userType === 'MIGRATION_NEEDED') {
        try {
          const partyDetails = localStorage.getItem('party_details')
          if (partyDetails) {
            const parsed = JSON.parse(partyDetails)
            partyDateToCheck = parsed.date
            console.log('🔍 Party date from localStorage:', partyDateToCheck)
          }
        } catch (error) {
          console.log('❌ Could not parse party details for date check:', error)
        }
      }
      
      // For database users, check their party data
      if (userType === 'DATABASE_USER' && userContext?.partyData?.date) {
        partyDateToCheck = userContext.partyData.date
        console.log('🔍 Party date from database:', partyDateToCheck)
      }
      
      if (partyDateToCheck) {
        console.log('🔍 Checking availability for party date:', partyDateToCheck)
        const isAvailable = checkSupplierAvailability(partyDateToCheck)
        console.log('🔍 Party date availability result:', isAvailable)
        
        if (!isAvailable) {
          console.log('🚫 Supplier unavailable on party date - showing unavailable modal')
          // Set selectedDate temporarily for modal display
          try {
            const tempDate = new Date(partyDateToCheck + 'T12:00:00')
            setSelectedDate(tempDate.getDate())
            setCurrentMonth(new Date(tempDate.getFullYear(), tempDate.getMonth(), 1))
          } catch (error) {
            console.log('❌ Error setting temporary date for modal:', error)
          }
          setShowUnavailableModal(true)
          return
        }
      }
    }
  
    // 4. À LA CARTE FLOW - For anonymous users with selected dates
    if (behavior.shouldShowAlaCarteModal) {
      console.log('🎪 Opening à la carte modal for anonymous user with date')
      setShowAlaCarteModal(true)
      return
    }
    
    // 5. CATEGORY OCCUPATION CHECK - For database users
    if (behavior.shouldCheckCategoryOccupation && userContext.currentPartyId) {
      console.log('🔍 Checking category occupation for database user')
      try {
        const partyResult = await partyDatabaseBackend.getCurrentParty()
        if (partyResult.success && partyResult.party?.party_plan) {
          const dbPartyPlan = partyResult.party.party_plan
          
          const categoryMap = {
            'Entertainment': 'entertainment',
            'Venues': 'venue', 
            'Catering': 'catering',
            'Decorations': 'decorations',
            'Party Bags': 'partyBags',
            'Photography': 'photography',
            'Activities': 'activities',
            'Face Painting': 'facePainting'
          }
          
          const slotName = categoryMap[supplier.category]
          const isSlotOccupied = slotName && dbPartyPlan[slotName] && dbPartyPlan[slotName].name
          
          if (isSlotOccupied) {
            console.log('🚫 Database user - category occupied, blocking')
            setNotification({ 
              type: "info", 
              message: `You already have a ${supplier.category.toLowerCase()} provider (${dbPartyPlan[slotName].name}). Remove them first to add ${supplier.name}.`,
              duration: 4000
            })
            setTimeout(() => setNotification(null), 4000)
            return
          } else {
            console.log('✅ Database user - category empty, proceeding with auto-enquiry')
          }
        }
      } catch (error) {
        console.log('❌ Database check failed, continuing...', error)
      }
    }
    
    // 6. PACKAGE VALIDATION
    const selectedPkg = packages.find((pkg) => pkg.id === selectedPackageId)
    if (!selectedPkg) {
      setNotification({ type: "error", message: "Selected package not found." })
      setTimeout(() => setNotification(null), 3000)
      return
    }
  
    // 7. ADDON MODAL CHECK - Show addon modal if supplier has addons and we haven't skipped it
    const isEntertainer = supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"
    const hasAddons = supplier?.serviceDetails?.addOnServices?.length > 0
  
    if (isEntertainer && hasAddons && !skipAddonModal) {
      console.log('🎭 Showing addon modal (availability already checked)')
      setShowAddonModal(true)
      return
    }
  
    // 8. START ADDING PROCESS
    console.log('🚀 Starting add to plan process')
    setIsAddingToPlan(true)
    setLoadingStep(0)
    setProgress(10)
  
    try {
      // Prepare package data
      const packageToAdd = addonData || selectedPkg
      const finalPrice = addonData ? addonData.totalPrice : selectedPkg.price
      
      const enhancedPackage = {
        ...packageToAdd.package || selectedPkg,
        addons: addonData?.addons || [],
        originalPrice: selectedPkg.price,
        totalPrice: finalPrice,
        addonsPriceTotal: addonData ? (addonData.totalPrice - selectedPkg.price) : 0
      }
  
      console.log('🎯 Enhanced package:', enhancedPackage)
      setProgress(30)
  
      let result
      setLoadingStep(1)
  
      // 9. DATABASE USER FLOW
      if (userType === 'DATABASE_USER' || userType === 'DATA_CONFLICT') {
        console.log('📊 Database user - adding supplier to database')
        setProgress(50)
        
        const addResult = await partyDatabaseBackend.addSupplierToParty(
          userContext.currentPartyId,
          backendSupplier,
          enhancedPackage
        )
        
        setProgress(70)
        setLoadingStep(2)
        
        if (addResult.success && behavior.shouldSendEnquiry) {
          console.log('📧 Sending auto-enquiry for empty category')
          setLoadingStep(3)
          const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
            userContext.currentPartyId,
            backendSupplier,
            enhancedPackage,
            `Added to expand party team for your ${supplier.category.toLowerCase()} needs`
          )
          
          if (enquiryResult.success) {
            console.log('✅ Auto-enquiry sent successfully')
          }
        }
        
        result = addResult
      }
      // 10. LOCALSTORAGE USER FLOW
      else if (userType === 'LOCALSTORAGE_USER' || userType === 'MIGRATION_NEEDED') {
        console.log('📦 LocalStorage user - adding supplier to localStorage')
        setProgress(50)
        setLoadingStep(2)
        
        const partyDetails = getSupplierInPartyDetails()
        if (partyDetails.inParty) {
          if (partyDetails.supplierType === "addon") {
            await removeAddon(supplier.id)
            result = await addSupplier(backendSupplier, enhancedPackage)
          } else {
            result = await addSupplier(backendSupplier, enhancedPackage)
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
        }
      }
  
      setLoadingStep(4)
      setProgress(100)
  
      // 11. SUCCESS HANDLING
      if (result?.success) {
        const addonMessage = addonData?.addons?.length > 0 ? ` with ${addonData.addons.length} add-on${addonData.addons.length > 1 ? 's' : ''}` : ''
        
        if (behavior.shouldSendEnquiry) {
          setNotification({ 
            type: "success", 
            message: `${supplier.name} added and enquiry sent${addonMessage}!` 
          })
        } else {
          setNotification({ 
            type: "success", 
            message: `${supplier.name} added to your party${addonMessage}!` 
          })
        }
        
        setTimeout(() => setNotification(null), 3000)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Navigate based on context
        if (navigationContext === "dashboard") {
          navigateWithContext("/dashboard", "supplier-detail")
        } else {
          router.push("/dashboard")
        }
      } else {
        throw new Error(result?.error || "Failed to add supplier")
      }
  
    } catch (error) {
      console.error("❌ Error in handleAddToPlan:", error)
      setNotification({ 
        type: "error", 
        message: error.message || "Failed to add supplier. Please try again." 
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      // 12. CLEANUP
      setIsAddingToPlan(false)
      setProgress(0)
      setLoadingStep(0)
      setShowAddonModal(false)
      setSelectedAddons([])
      setFinalPackageData(null)
      console.log('🔧 handleAddToPlan cleanup completed')
    }
  }, [
    userType, 
    userContext, 
    supplier, 
    selectedPackageId, 
    selectedDate, 
    currentMonth,
    packages, 
    getSupplierInPartyDetails, 
    addSupplier, 
    addAddon, 
    removeAddon, 
    backendSupplier, 
    navigationContext, 
    navigateWithContext, 
    router, 
    checkSupplierAvailability, 
    getSelectedCalendarDate,
    enquiryStatus
  ])

  const getAddToPartyButtonState = useCallback((packageIdToCompare) => {
    const currentPackageId = packageIdToCompare || selectedPackageId
    const partyDetails = getSupplierInPartyDetails()
    const isLoadingThisPackage = isAddingToPlan && selectedPackageId === currentPackageId
    

    
    // Handle loading state first
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
    
    // Get behavior from user type detection
    const behavior = getHandleAddToPlanBehavior(userType, userContext, supplier, selectedDate)
 
    
    // ✅ FIXED: Handle different user types correctly
    switch (userType) {
      case 'ANONYMOUS':
      case 'ERROR_FALLBACK':
        // Only anonymous users need date selection flow
        if (!selectedDate) {
          return {
            disabled: false,
            className: "bg-teal-500 hover:bg-teal-600 text-white",
            text: "📅 Pick a Date First"
          }
        } else {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-primary-600 text-white",
            text: "Book This Supplier"
          }
        }
        
      case 'LOCALSTORAGE_USER':
      case 'MIGRATION_NEEDED':
        // Show "In Plan" for localStorage users with the same package
        if (partyDetails.inParty && partyDetails.currentPackage === currentPackageId) {
          return {
            disabled: true,
            className: "bg-teal-500 hover:bg-teal-500 text-white cursor-not-allowed",
            text: (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                In Plan
              </>
            ),
          }
        } else {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-primary-600 text-white",
            text: "Add to Plan"
          }
        }
        
      case 'DATABASE_USER':
      case 'DATA_CONFLICT':
        // Database users - always show "Add to Plan" (category check happens in handler)
        return {
          disabled: false,
          className: "bg-primary-500 hover:bg-primary-600 text-white",
          text: "Add to Plan"
        }
        
      default:
        // Unknown user type - check if package is selected
        if (!currentPackageId) {
          return {
            disabled: true,
            className: "bg-gray-300 text-gray-500 cursor-not-allowed",
            text: "Select a Package",
          }
        }
        
        // Fallback to behavior text
        return { 
          disabled: behavior.buttonDisabled || false, 
          className: behavior.buttonDisabled 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-primary-500 hover:bg-primary-600 text-white", 
          text: behavior.buttonText
        }
    }
  }, [userType, userContext, supplier, selectedDate, selectedPackageId, getSupplierInPartyDetails, isAddingToPlan])
  


  



  const handleAddonConfirm = useCallback((addonData) => {
    setSelectedAddons(addonData.addons)
    setFinalPackageData(addonData)
    setShowAddonModal(false)

    // addonData.addons.forEach(addon => {
    //   const enhancedAddon = {
    //     ...addon,
    //     supplierId: supplier?.id,
    //     supplierName: supplier?.name,
    //     packageId: addonData.package?.id,
    //     addedAt: new Date().toISOString()
    //   }
    //   addAddon(enhancedAddon)
    // })
    
    handleAddToPlan(true, addonData)
  }, [supplier, addAddon, handleAddToPlan])
  
  const handleAddonModalClose = useCallback(() => {
    setShowAddonModal(false)
    setSelectedAddons([])
    setFinalPackageData(null)
  }, [])


  



 

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

  // UPDATE your loading check to include user type loading:
if (userTypeLoading) {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Detecting user type...</p>
        <p className="text-sm text-gray-500 mt-2">
          User type: {userType || 'detecting...'} | Data source: {userContext?.dataSource || 'unknown'}
        </p>
      </div>
    </div>
  )
}



  // Compute these values once
  const dashboardContext = isFromDashboard()
  const userPartyDate = getPartyDate()



  return (
    <div className="bg-[#F4F5F7] min-h-screen font-sans">
      {debugMode && <UserDetectionDebugger />}
      <NotificationPopup notification={notification} />
{/* Add the new unavailable modal */}
<SupplierUnavailableModal
      isOpen={showUnavailableModal}
      onClose={() => setShowUnavailableModal(false)}
      supplier={supplier}
      selectedDate={getSelectedCalendarDate()}
      onSelectNewDate={handleSelectNewDate}
      onViewAlternatives={handleViewAlternatives}
    />
      <ContextualBreadcrumb currentPage="supplier-detail" supplierName={backendSupplier?.name} />

      
      <SupplierHeader
        supplier={supplier}
        portfolioImages={portfolioImages}
        getSupplierInPartyDetails={getSupplierInPartyDetails}
        getAddToPartyButtonState={getAddToPartyButtonState}
        handleAddToPlan={handleAddToPlan}
      />
<button 
  onClick={() => setDebugMode(!debugMode)}
  className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded-full z-50 shadow-lg"
  title="Toggle Debug Mode"
>
  🐛
</button>
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