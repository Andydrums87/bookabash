"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/AuthModal"
import { Card, CardContent } from "@/components/ui/card"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import {
  CheckCircle,
  Music,
  Utensils,
  Palette,
  Building,
  Info,
  Send,
  LogIn,
  Clock,
  Star,
  Heart,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
import RecommendedAddons from "@/components/recommended-addons"

// Import the new components
import PartySummaryCard from "./components/PartySummaryCard"
import TotalPriceSummaryCard from "./components/TotalPriceSummaryCard"
import SelectedSuppliersCard from "./components/SelectedSuppliersCard"
import SelectedAddonsCard from "./components/SelectedAddonsCard"
import ContactInformationForm from "./components/ContactInformationForm"
import SpecialRequirementsForm from "./components/SpecialRequirementsForm"
import AdditionalMessageForm from "./components/AdditionalMessageForm"
import AddonDetailsModal from "@/components/AddonDetailsModal"
import SnappyEnquiryLoader from "./components/SnappyEnquiryLoader"

// Import auth and database functions
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export function EnhancedURLDebugger() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [urlHistory, setUrlHistory] = useState([])
  
  useEffect(() => {
    const currentInfo = {
      timestamp: new Date().toISOString(),
      fullUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      searchParamsEntries: Object.fromEntries(searchParams.entries()),
      directUrlParams: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
      referrer: document.referrer
    }
    
    setUrlHistory(prev => [...prev.slice(-4), currentInfo]) // Keep last 5 entries
    console.log('🔍 URL Debug Info:', currentInfo)
  }, [searchParams])
  
  return (
    <Card className="border-red-200 bg-red-50 shadow-lg mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold text-red-900 mb-2">🔍 Enhanced URL Debugger</h3>
        
        {/* Current URL Info */}
        <div className="mb-4">
          <h4 className="font-medium text-red-800 mb-1">Current URL:</h4>
          <div className="text-sm space-y-1">
            <div><strong>Full:</strong> {urlHistory[urlHistory.length - 1]?.fullUrl}</div>
            <div><strong>Search:</strong> {urlHistory[urlHistory.length - 1]?.search || 'none'}</div>
            <div><strong>useSearchParams:</strong> {JSON.stringify(urlHistory[urlHistory.length - 1]?.searchParamsEntries)}</div>
            <div><strong>Direct parsing:</strong> {JSON.stringify(urlHistory[urlHistory.length - 1]?.directUrlParams)}</div>
            <div><strong>Referrer:</strong> {urlHistory[urlHistory.length - 1]?.referrer || 'none'}</div>
          </div>
        </div>
        
        {/* URL History */}
        {urlHistory.length > 1 && (
          <div className="mb-4">
            <h4 className="font-medium text-red-800 mb-1">Recent URL Changes:</h4>
            <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
              {urlHistory.slice(-5).map((entry, index) => (
                <div key={index} className="border-l-2 border-red-300 pl-2">
                  <div><strong>{entry.timestamp}</strong></div>
                  <div>URL: {entry.fullUrl}</div>
                  <div>Params: {JSON.stringify(entry.searchParamsEntries)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Test buttons */}
        <div className="space-y-2">
          <ParameterTests />
          
          <button 
            onClick={() => {
              console.log('🧪 Testing problematic URL...')
              const testUrl = '/dashboard?enquiry_sent=true&enquiry_count=3'
              console.log('Target:', testUrl)
              window.location.href = testUrl
            }}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            🧪 Test Problematic URL
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReviewBookPage() {
  const router = useRouter()
  
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [isMigrating, setIsMigrating] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(null)
  const [customerProfile, setCustomerProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [partyDetails, setPartyDetails] = useState({})
  const [selectedSuppliers, setSelectedSuppliers] = useState([])
  const [authRequired, setAuthRequired] = useState(false) // New state for auth requirement
  const [selectedAddon, setSelectedAddon] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingError, setLoadingError] = useState(null)
  const [supplierCount, setSupplierCount] = useState(0)
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)
  const [fullSupplierData, setFullSupplierData] = useState({})

  useEffect(() => {
    const originalError = console.error
    console.error = (...args) => {
      if (args[0]?.includes?.('AuthSessionMissingError')) {
        console.trace('AUTH ERROR TRACE:')
      }
      originalError(...args)
    }
    
    return () => {
      console.error = originalError
    }
  }, [])

    // Handle addon clicks to open modal
    const handleAddonClick = (addon) => {
      console.log('🎯 Review Book: Addon clicked:', addon)
      setSelectedAddon(addon)
      setIsAddonModalOpen(true)
    }
  
    const handleAddonModalClose = () => {
      setIsAddonModalOpen(false)
      setSelectedAddon(null)
    }

     // Handle adding addon from modal
  const handleAddAddonFromModal = async (addon) => {
    console.log("🎁 Review Book: Adding addon from modal:", addon.name)
    
    try {
      // Get existing party plan from localStorage
      const existingPlan = JSON.parse(localStorage.getItem('party_plan') || '{}')
      const existingAddons = existingPlan.addons || []
      
      // Check if already added
      if (existingAddons.some(existing => existing.id === addon.id)) {
        console.log("⚠️ Add-on already exists")
        return { success: false, error: "Already added" }
      }
      
      // Add the addon with additional metadata
      const addonWithMetadata = {
        ...addon,
        addedAt: new Date().toISOString(),
        addedFrom: 'review-book', // Track where it was added from
        supplierName: 'Quick Add-on'
      }
      
      const updatedAddons = [...existingAddons, addonWithMetadata]
      
      const updatedPlan = {
        ...existingPlan,
        addons: updatedAddons
      }
      
      // Save back to localStorage
      localStorage.setItem('party_plan', JSON.stringify(updatedPlan))
      
      // Trigger storage event so other components can react
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'party_plan',
        newValue: JSON.stringify(updatedPlan)
      }))
      
      console.log("✅ Add-on added successfully from review book modal!")
      
      // Optional: Update any local state if you're tracking addons in this component
      // setYourLocalAddonsState(updatedAddons)
      
      return { success: true }
      
    } catch (error) {
      console.error("❌ Error adding addon from review book:", error)
      return { success: false, error: error.message }
    }
  }
  const hasAddon = (addonId) => {
    try {
      const partyPlan = localStorage.getItem('party_plan')
      const userPartyPlan = localStorage.getItem('user_party_plan')
      
      let addons = []
      if (partyPlan) {
        const planData = JSON.parse(partyPlan)
        addons = planData.addons || []
      } else if (userPartyPlan) {
        const planData = JSON.parse(userPartyPlan)
        addons = planData.addons || []
      }
      
      const hasIt = addons.some(addon => addon.id === addonId)
      console.log('🔍 DEBUG: hasAddon check for', addonId, ':', hasIt)
      return hasIt
    } catch {
      return false
    }
  }
// Add remove addon handler
const handleRemoveAddon = async (addonId) => {
  console.log("🗑️ Review Book: Removing addon:", addonId)
  
  try {
    // Determine which localStorage key to use
    const partyPlanExists = localStorage.getItem('party_plan')
    const userPartyPlanExists = localStorage.getItem('user_party_plan')
    const storageKey = partyPlanExists ? 'party_plan' : 'user_party_plan'
    
    const existingPlan = JSON.parse(localStorage.getItem(storageKey) || '{}')
    const existingAddons = existingPlan.addons || []
    
    // Filter out the addon to remove
    const updatedAddons = existingAddons.filter(addon => addon.id !== addonId)
    
    const updatedPlan = {
      ...existingPlan,
      addons: updatedAddons
    }
    
    console.log("💾 Review Book: Saving updated plan without addon:", updatedPlan)
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedPlan))
    
    // Update local state immediately
    setSelectedAddons(updatedAddons)
    
    // Trigger storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: storageKey,
      newValue: JSON.stringify(updatedPlan)
    }))
    
    console.log("✅ Review Book: Addon removed successfully!")
    
  } catch (error) {
    console.error("❌ Review Book: Error removing addon:", error)
  }
}


  const [formData, setFormData] = useState({
    parentName: "",
    phoneNumber: "",
    email: "",
    numberOfChildren: "",
    dietaryRequirements: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      nutAllergy: false,
    },
    accessibilityRequirements: {
      wheelchairAccessible: false,
      sensoryFriendly: false,
    },
    additionalMessage: "",
  })

  // Load data on mount
  useEffect(() => {
    loadPartyDataFromLocalStorage()
    checkAuthStatusAndLoadProfile()
  }, [])

  // Show auth modal immediately if user is not signed in
  useEffect(() => {
    console.log("🔄 Auth effect triggered:", { 
      loadingProfile, 
      user: !!user, 
      authRequired, 
      showAuthModal 
    })
    
    if (!loadingProfile && !user && !authRequired) {
      console.log("🔐 User not authenticated, showing auth modal")
      setAuthRequired(true)
      setShowAuthModal(true)
    } else if (!loadingProfile && user && authRequired) {
      console.log("✅ User authenticated, clearing auth requirement")
      setAuthRequired(false)
      setShowAuthModal(false)
    }
  }, [loadingProfile, user, authRequired, showAuthModal])


  const loadPartyDataFromLocalStorage = () => {
    try {
      // Get party details
      const details = JSON.parse(localStorage.getItem("party_details") || "{}")
      
      // Format date for display
      const formatDateForDisplay = (dateInput) => {
        if (!dateInput) return "TBD";
        
        let date;
        
        if (dateInput instanceof Date) {
          date = dateInput;
        } else if (typeof dateInput === 'string') {
          // If it's already in display format, return as is
          if (dateInput.includes('th ') || dateInput.includes('st ') || dateInput.includes('nd ') || dateInput.includes('rd ')) {
            return dateInput;
          }
          date = new Date(dateInput);
        } else {
          return "TBD";
        }
        
        if (isNaN(date.getTime())) {
          return "TBD";
        }
        
        // Format as "12th July, 2025"
        const day = date.getDate();
        const suffix = getDaySuffix(day);
        const month = date.toLocaleDateString('en-GB', { month: 'long' });
        const year = date.getFullYear();
        
        return `${day}${suffix} ${month}, ${year}`;
      };
  
      const getDaySuffix = (day) => {
        if (day >= 11 && day <= 13) {
          return 'th';
        }
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
  
      // Format time for display - prioritize startTime over timeSlot
      const formatTimeForDisplay = (details) => {
        // Priority 1: Check for startTime (new format)
        if (details.startTime) {
          const duration = details.duration || 2
          
          try {
            // Format start time
            const [hours, minutes] = details.startTime.split(':')
            const startDate = new Date()
            startDate.setHours(parseInt(hours), parseInt(minutes || 0))
            
            const formattedStart = startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: minutes && minutes !== '00' ? '2-digit' : undefined,
              hour12: true,
            })
            
            // Calculate end time
            const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000))
            const formattedEnd = endDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: endDate.getMinutes() > 0 ? '2-digit' : undefined,
              hour12: true,
            })
            
            return `${formattedStart} - ${formattedEnd}`
          } catch (error) {
            console.error('Error formatting startTime:', error)
            return "TBD"
          }
        }
  
        // Priority 2: Legacy time field (already formatted)
        if (details.time && details.time.includes('-')) {
          return details.time
        }
  
        // Priority 3: Convert legacy timeSlot to time range (backwards compatibility)
        if (details.timeSlot && details.duration) {
          const timeSlotTimes = {
            morning: "10:00",
            afternoon: "14:00"
          }
          
          const startTime = timeSlotTimes[details.timeSlot]
          if (startTime) {
            try {
              const [hours, minutes] = startTime.split(':')
              const startDate = new Date()
              startDate.setHours(parseInt(hours), parseInt(minutes))
              
              const formattedStart = startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
              
              const endDate = new Date(startDate.getTime() + (details.duration * 60 * 60 * 1000))
              const formattedEnd = endDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
              
              return `${formattedStart} - ${formattedEnd}`
            } catch (error) {
              console.error('Error converting timeSlot:', error)
            }
          }
        }
        
        // Priority 4: Legacy time field as-is
        if (details.time) {
          return details.time
        }
        
        return "TBD"
      };
  
      // Set formatted party details
      setPartyDetails({
        date: formatDateForDisplay(details.date),
        time: formatTimeForDisplay(details),
        theme: details.theme || "Party",
        location: details.location || "TBD",
        age: details.childAge || "TBD",
        childName: details.childName || "Your Child",
        
        // Keep raw data for migration and PartySummaryCard
        rawDate: details.date,
        rawStartTime: details.startTime,
        startTime: details.startTime,
        duration: details.duration,
        postcode: details.postcode
      })
  
      // ✅ FIXED: Process party plan and EXCLUDE einvites
      const partyPlan = JSON.parse(localStorage.getItem("user_party_plan") || "{}")
      const suppliers = []
      const fullSupplierData = {}
  
      // ✅ FIXED: Only process real supplier types, NOT einvites
      const realSupplierTypes = [
        'venue', 'entertainment', 'catering', 'decorations', 
        'facePainting', 'activities', 'partyBags', 'balloons', 'cakes'
      ]
  
      realSupplierTypes.forEach((key) => {
        const supplier = partyPlan[key]
        
        // Only include if supplier exists and has a name
        if (supplier && supplier.name) {
          const iconMap = {
            venue: <Building className="w-5 h-5" />,
            entertainment: <Music className="w-5 h-5" />,
            catering: <Utensils className="w-5 h-5" />,
            decorations: <Palette className="w-5 h-5" />,
            facePainting: <Palette className="w-5 h-5" />,
            activities: <Music className="w-5 h-5" />,
            partyBags: <Palette className="w-5 h-5" />,
            balloons: <Palette className="w-5 h-5" />,
            cakes: <Palette className="w-5 h-5" />,
          }
      
          suppliers.push({
            id: supplier.id || key,
            name: supplier.name,
            category: supplier.category || key.charAt(0).toUpperCase() + key.slice(1),
            icon: iconMap[key] || <Info className="w-5 h-5" />,
            image: supplier.image || supplier.imageUrl || supplier.originalSupplier?.image,
            price: supplier.price,
            description: supplier.description,
          })
          
          fullSupplierData[key] = supplier
        }
      })
  
      // ✅ FIXED: Clean up any einvites from localStorage if it exists
      if (partyPlan.einvites) {
        console.log('🧹 Removing einvites from user_party_plan during review load')
        delete partyPlan.einvites
        localStorage.setItem("user_party_plan", JSON.stringify(partyPlan))
      }
  
      // Get add-ons from party plan
      const addons = partyPlan.addons || []
      setSelectedAddons(addons)
      setSelectedSuppliers(suppliers)
      setFullSupplierData(fullSupplierData)
  
      console.log("📋 Loaded party data from localStorage:", {
        details,
        suppliers: suppliers.length,
        addons: addons.length,
        formattedDate: formatDateForDisplay(details.date),
        formattedTime: formatTimeForDisplay(details),
        excludedEinvites: !!partyPlan.einvites // Shows if we cleaned up einvites
      })
    } catch (error) {
      console.error("❌ Error loading party data:", error)
    }
  }
  

  const checkAuthStatusAndLoadProfile = async () => {
    try {
      setLoadingProfile(true)
      console.log("🔍 Checking auth status...")
      
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      console.log("👤 Auth check result:", { user: !!user, error })

      if (user && !error) {
        console.log("✅ Found authenticated user:", user.email)

        // Check if this is a CUSTOMER (not a supplier)
        const { data: supplierRecord } = await supabase
          .from("suppliers")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle()

        if (supplierRecord) {
          // This is a supplier account, not a customer - treat as not signed in
          console.log("🔍 Detected supplier account, treating as not signed in for customer flow")
          setUser(null)
          setCustomerProfile(null)
          setLoadingProfile(false)
          return
        }

        setUser(user)

        // Get or create customer profile
        const result = await partyDatabaseBackend.getCurrentUser()
        if (result.success) {
          console.log("✅ Found customer profile:", result.user)
          setCustomerProfile(result.user)

          // Auto-populate form with customer data
          setFormData((prev) => ({
            ...prev,
            parentName: `${result.user.first_name || ""} ${result.user.last_name || ""}`.trim() || prev.parentName,
            email: result.user.email || user.email || prev.email,
            phoneNumber: result.user.phone || prev.phoneNumber,
          }))

          console.log("✅ Form auto-populated with customer data")
        } else {
          console.log("⚠️ No customer profile found, will create one during migration")
          // Still populate what we can from auth user
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
            parentName: user.user_metadata?.full_name || prev.parentName,
            phoneNumber: user.user_metadata?.phone || prev.phoneNumber,
          }))
        }
      } else {
        console.log("❌ No authenticated user found")
        setUser(null)
        setCustomerProfile(null)
      }
    } catch (error) {
      console.error("❌ Error checking auth status:", error)
      setUser(null)
      setCustomerProfile(null)
    } finally {
      setLoadingProfile(false)
    }
  }

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCheckboxChange = (category, field, checked) => {
    console.log('🔄 Checkbox clicked:', { category, field, checked })
    console.log('📋 Current formData before update:', formData[category])
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: checked,
        },
      }
      
      console.log('✅ Updated formData:', updated[category])
      return updated
    })
  }
  


  
  // Enhanced loading with debugging
  useEffect(() => {
    const loadAddons = () => {
      try {
        // Check both possible localStorage keys
        const partyPlan = localStorage.getItem('party_plan')
        const userPartyPlan = localStorage.getItem('user_party_plan')
        
        // Try party_plan first
        let addons = []
        if (partyPlan) {
          const planData = JSON.parse(partyPlan)
          addons = planData.addons || []
        }
        
        // If no addons, try user_party_plan
        if (addons.length === 0 && userPartyPlan) {
          const userPlanData = JSON.parse(userPartyPlan)
          addons = userPlanData.addons || []
        }
        
        
        setSelectedAddons(addons)
      } catch (error) {
        console.error('❌ DEBUG: Error loading addons:', error)
        setSelectedAddons([])
      }
    }
    
    loadAddons()
    
    // Enhanced storage listener
    const handleStorageChange = (e) => {
      console.log('🔄 DEBUG: Storage change event:', e.key, e.newValue)
      if (e.key === 'party_plan' || e.key === 'user_party_plan') {
        console.log('🔄 DEBUG: Party plan changed, reloading addons')
        loadAddons()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

// Updated migration function to handle new time format
const migratePartyToDatabase = async (authenticatedUser) => {
  try {
    setIsMigrating(true)
    console.log("🔄 Starting party migration to database...")

    // Get localStorage data
    const partyDetailsLS = JSON.parse(localStorage.getItem("party_details") || "{}")
    const partyPlanLS = JSON.parse(localStorage.getItem("user_party_plan") || "{}")

    console.log("📋 localStorage data:", { partyDetailsLS, partyPlanLS })

    // Ensure user profile exists (create if needed)
    const userResult = await partyDatabaseBackend.createOrGetUser({
      firstName: formData.parentName.split(" ")[0] || partyDetailsLS.childName || "Party Host",
      lastName: formData.parentName.split(" ").slice(1).join(" ") || "",
      email: authenticatedUser.email,
      phone: formData.phoneNumber || authenticatedUser.user_metadata?.phone || "",
      postcode: partyDetailsLS.postcode || partyDetailsLS.location || "",
    })

    if (!userResult.success) {
      throw new Error(`Failed to create user profile: ${userResult.error}`)
    }

    console.log("✅ User profile ready:", userResult.user.id)

    // Handle time data - prioritize new format
    const getTimeData = () => {
      // Priority 1: Check for startTime (new format)
      if (partyDetailsLS.startTime) {
        console.log("✅ Using new startTime format:", partyDetailsLS.startTime)
        const endTime = calculateEndTime(partyDetailsLS.startTime, partyDetailsLS.duration || 2)
        return {
          time: partyDetailsLS.startTime, // Keep for backwards compatibility
          startTime: partyDetailsLS.startTime, // New start_time column
          endTime: endTime, // New end_time column
          duration: partyDetailsLS.duration || 2,
          timePreference: {
            type: 'specific',
            startTime: partyDetailsLS.startTime,
            duration: partyDetailsLS.duration || 2,
            endTime: endTime
          }
        }
      }
      
      // Priority 2: Legacy timeSlot format
      if (partyDetailsLS.timeSlot) {
        console.log("⚠️ Using legacy timeSlot format:", partyDetailsLS.timeSlot)
        const timeSlotToTime = {
          morning: "10:00",
          afternoon: "14:00"
        }
        const startTime = timeSlotToTime[partyDetailsLS.timeSlot] || "14:00"
        const endTime = calculateEndTime(startTime, partyDetailsLS.duration || 2)
        
        return {
          time: startTime, // Keep for backwards compatibility
          startTime: startTime, // New start_time column
          endTime: endTime, // New end_time column
          duration: partyDetailsLS.duration || 2,
          timePreference: {
            type: 'flexible',
            slot: partyDetailsLS.timeSlot,
            duration: partyDetailsLS.duration || 2,
            startTime: startTime
          }
        }
      }
      
      // Priority 3: Legacy time format
      if (partyDetailsLS.time) {
        console.log("⚠️ Using legacy time format:", partyDetailsLS.time)
        // If it's already formatted (contains '-'), extract start time
        if (partyDetailsLS.time.includes('-')) {
          // Try to extract start time from "11am - 1pm" format
          const timeMatch = partyDetailsLS.time.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i)
          if (timeMatch) {
            let hour = parseInt(timeMatch[1])
            const minute = timeMatch[2] || '00'
            const ampm = timeMatch[3].toLowerCase()
            
            if (ampm === 'pm' && hour !== 12) hour += 12
            if (ampm === 'am' && hour === 12) hour = 0
            
            const rawStartTime = `${hour.toString().padStart(2, '0')}:${minute}`
            const endTime = calculateEndTime(rawStartTime, partyDetailsLS.duration || 2)
            
            return {
              time: rawStartTime, // Keep for backwards compatibility
              startTime: rawStartTime, // New start_time column
              endTime: endTime, // New end_time column
              duration: partyDetailsLS.duration || 2,
              timePreference: {
                type: 'specific',
                duration: partyDetailsLS.duration || 2
              }
            }
          } else {
            // Fallback if parsing fails
            const endTime = calculateEndTime("14:00", partyDetailsLS.duration || 2)
            return {
              time: "14:00",
              startTime: "14:00",
              endTime: endTime,
              duration: partyDetailsLS.duration || 2,
              timePreference: {
                type: 'specific',
                duration: partyDetailsLS.duration || 2
              }
            }
          }
        } else {
          // If it's raw time like "14:00", use it
          const endTime = calculateEndTime(partyDetailsLS.time, partyDetailsLS.duration || 2)
          return {
            time: partyDetailsLS.time, // Keep for backwards compatibility
            startTime: partyDetailsLS.time, // New start_time column
            endTime: endTime, // New end_time column
            duration: partyDetailsLS.duration || 2,
            timePreference: {
              type: 'specific',
              startTime: partyDetailsLS.time,
              duration: partyDetailsLS.duration || 2,
              endTime: endTime
            }
          }
        }
      }
      
      // Fallback
      console.log("⚠️ No time data found, using default")
      return {
        time: "14:00", // Keep for backwards compatibility
        startTime: "14:00", // New start_time column
        endTime: "16:00", // New end_time column
        duration: 2,
        timePreference: {
          type: 'flexible',
          slot: 'afternoon',
          duration: 2,
          startTime: "14:00"
        }
      }
    }

    // Helper function to format time for database storage
    const formatTimeForDatabase = (startTime, duration) => {
      try {
        const [hours, minutes] = startTime.split(':')
        const startDate = new Date()
        startDate.setHours(parseInt(hours), parseInt(minutes || 0))
        
        // Format start time
        const formattedStart = startDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: minutes && minutes !== '00' ? '2-digit' : undefined,
          hour12: true,
        })
        
        // Calculate end time
        const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000))
        const formattedEnd = endDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: endDate.getMinutes() > 0 ? '2-digit' : undefined,
          hour12: true,
        })
        
        return `${formattedStart} - ${formattedEnd}`
      } catch (error) {
        console.error("Error formatting time for database:", error)
        return startTime
      }
    }

    // Helper function to calculate end time
    const calculateEndTime = (startTime, duration) => {
      try {
        const [hours, minutes] = startTime.split(':')
        const startDate = new Date()
        startDate.setHours(parseInt(hours), parseInt(minutes || 0))
        
        const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000))
        
        return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
      } catch (error) {
        console.error("Error calculating end time:", error)
        return "16:00" // Default fallback
      }
    }

    const timeData = getTimeData()
    console.log("⏰ Final time data for database:", timeData)

    // Create party in database with separate start/end times
    const partyData = {
      childName: partyDetailsLS.childName || "Your Child",
      childAge: parseInt(partyDetailsLS.childAge) || 6,
      date: partyDetailsLS.date || new Date().toISOString().split("T")[0],
      
      // Legacy time field (keep for backwards compatibility)
      time: timeData.time,
      
      // New separate time columns - try both naming conventions
      startTime: timeData.startTime,   // camelCase
      start_time: timeData.startTime,  // snake_case
      endTime: timeData.endTime,       // camelCase  
      end_time: timeData.endTime,      // snake_case
      
      duration: timeData.duration,
      
      guestCount: parseInt(formData.numberOfChildren?.split("-")[0]) || parseInt(partyDetailsLS.guestCount) || 15,
      location: partyDetailsLS.location || "TBD",
      postcode: partyDetailsLS.postcode || partyDetailsLS.location || "",
      theme: partyDetailsLS.theme || "party",
      budget: parseInt(partyDetailsLS.budget) || 600,
      specialRequirements: formData.additionalMessage || "",
      
      // Time preference object
      timePreference: timeData.timePreference
    }

    console.log("🎉 Creating party with time data:", {
      startTime: timeData.startTime,
      endTime: timeData.endTime,
      duration: timeData.duration
    })

    console.log("🎉 Creating party with data:", partyData)
    console.log("🎁 Add-ons being migrated:", partyPlanLS.addons?.length || 0)

    const createResult = await partyDatabaseBackend.createParty(partyData, partyPlanLS)

    if (!createResult.success) {
      throw new Error(`Failed to create party: ${createResult.error}`)
    }

    console.log("✅ Party migrated successfully to database:", createResult.party.id)
    return createResult.party
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  } finally {
    setIsMigrating(false)
  }
}



  const handleAuthSuccess = async (authenticatedUser, userData = null) => {
    console.log("✅ Authentication successful, user can now access the review page")
    console.log("👤 User data received:", userData)

    // Close the modal and clear auth requirement
    setShowAuthModal(false)
    setAuthRequired(false)

    // Update the user state
    setUser(authenticatedUser)

    // Prefill form with user data if provided
    if (userData) {
      console.log("📝 Prefilling form with user data")
      setFormData((prev) => ({
        ...prev,
        parentName:
          userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : userData.firstName || prev.parentName,
        email: userData.email || prev.email,
        phoneNumber: userData.phone || prev.phoneNumber,
      }))
    } else {
      // Fallback: try to get data from the authenticated user
      const fullName = authenticatedUser.user_metadata?.full_name
      setFormData((prev) => ({
        ...prev,
        parentName: fullName || prev.parentName,
        email: authenticatedUser.email || prev.email,
        phoneNumber: authenticatedUser.user_metadata?.phone || prev.phoneNumber,
      }))
    }
  }

  const handleSubmitEnquiry = async () => {
    console.log('🚀 handleSubmitEnquiry started')
    
    try {
      setIsSubmitting(true)
      setLoadingStep(1)
      setLoadingError(null)
      
      // Calculate supplier count for display
      const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}')
      const supplierCount = Object.values(partyPlan).filter(supplier => 
        supplier && typeof supplier === 'object' && supplier.name
      ).length
      
      console.log('📊 Calculated supplier count:', supplierCount)
      setSupplierCount(supplierCount)
  
      // Step 1: Migrate party to database
      console.log("📤 Step 1: Migrating party to database...")
      const migratedParty = await migratePartyToDatabase(user)
      console.log("✅ Migration result:", migratedParty)
      
      // Move to step 2
      setLoadingStep(2)
      await new Promise(resolve => setTimeout(resolve, 1000))
  
      // Step 2: Send enquiries to suppliers
      console.log("📧 Step 2: Sending enquiries to suppliers...")
      const enquiryResult = await partyDatabaseBackend.sendEnquiriesToSuppliers(
        migratedParty.id,
        formData.additionalMessage,
        JSON.stringify({
          dietary: formData.dietaryRequirements,
          accessibility: formData.accessibilityRequirements,
          numberOfChildren: formData.numberOfChildren,
          contactInfo: {
            name: formData.parentName,
            phone: formData.phoneNumber,
            email: formData.email,
          },
        }),
      )
  
      console.log('📋 Raw enquiryResult:', enquiryResult)
  
      if (!enquiryResult.success) {
        throw new Error(`Failed to send enquiries: ${enquiryResult.error}`)
      }
  
      // Calculate final count with fallbacks
      const finalCount = enquiryResult.count || supplierCount || 4
      console.log('🔢 Final enquiry count:', finalCount)
  
      console.log(`✅ Successfully sent ${finalCount} enquiries!`)
      
      // Move to success step
      setLoadingStep(3)
      
      // Wait a moment to show success, then redirect
      setTimeout(() => {
        console.log('🚀 Starting redirect process...')
        
        // Method 1: Try router.push first (more reliable)
        try {
          const redirectUrl = `/dashboard?success=true&enquiry_count=${finalCount}&timestamp=${Date.now()}`
          console.log('🔗 Redirecting to:', redirectUrl)
          
          router.push(redirectUrl)
          
          // Fallback: If router doesn't work, use window.location
          setTimeout(() => {
            if (window.location.pathname.includes('review-book')) {
              console.log('🔄 Router redirect didn\'t work, trying window.location...')
              window.location.href = redirectUrl
            }
          }, 500)
          
        } catch (error) {
          console.error('❌ Router redirect failed:', error)
          // Fallback to window.location
          const fallbackUrl = `/dashboard?success=true&enquiry_count=${finalCount}&timestamp=${Date.now()}`
          window.location.href = fallbackUrl
        }
        
      }, 2000)
  
    } catch (error) {
      console.error("❌ Submit enquiry failed:", error)
      setLoadingError(error.message)
      setIsSubmitting(false)
    }
  }
  
  
  // ✅ ALTERNATIVE: More robust version with state management
  const handleSubmitEnquiryRobust = async () => {
    let enquiryCount = 0 // Initialize with default
    
    try {
      setIsSubmitting(true)
      setLoadingStep(1)
      setLoadingError(null)
      
      // Calculate supplier count FIRST and store it
      const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}')
      const calculatedSupplierCount = Object.values(partyPlan).filter(supplier => 
        supplier && typeof supplier === 'object' && supplier.name
      ).length
      
      // Set initial count to calculated value
      enquiryCount = calculatedSupplierCount || 4 // Fallback to 4 if 0
      
      console.log('📊 Calculated supplier count:', calculatedSupplierCount)
      console.log('📊 Initial enquiry count:', enquiryCount)
      
      setSupplierCount(enquiryCount)
  
      // Step 1: Migrate party to database
      console.log("📤 Step 1: Migrating party to database...")
      const migratedParty = await migratePartyToDatabase(user)
      
      setLoadingStep(2)
      await new Promise(resolve => setTimeout(resolve, 1000))
  
      // Step 2: Send enquiries to suppliers
      console.log("📧 Step 2: Sending enquiries to suppliers...")
      const enquiryResult = await partyDatabaseBackend.sendEnquiriesToSuppliers(
        migratedParty.id,
        formData.additionalMessage,
        JSON.stringify({
          dietary: formData.dietaryRequirements,
          accessibility: formData.accessibilityRequirements,
          numberOfChildren: formData.numberOfChildren,
          contactInfo: {
            name: formData.parentName,
            phone: formData.phoneNumber,
            email: formData.email,
          },
        }),
      )
  
      console.log('📋 Enquiry result:', enquiryResult)
  
      if (!enquiryResult.success) {
        throw new Error(`Failed to send enquiries: ${enquiryResult.error}`)
      }
  
      // ✅ UPDATE COUNT: Only if we got a valid count back
      if (enquiryResult.count && enquiryResult.count > 0) {
        enquiryCount = enquiryResult.count
        console.log('✅ Updated count from result:', enquiryCount)
      } else {
        console.log('⚠️ Using fallback count:', enquiryCount)
      }
      
      setLoadingStep(3)
      
    } catch (error) {
      console.error("❌ Submit enquiry failed:", error)
      setLoadingError(error.message)
      setIsSubmitting(false)
      return // Exit early
    }
    
    // ✅ REDIRECT: This will always have a valid enquiryCount
    setTimeout(() => {
      console.log('🚀 Redirecting with count:', enquiryCount)
      
      // Final validation
      const finalCount = enquiryCount > 0 ? enquiryCount : 4
      const redirectUrl = `/dashboard?success=true&enquiry_count=${finalCount}`
      
      console.log('🔗 Redirect URL:', redirectUrl)
      window.location.href = redirectUrl
    }, 2000)
  }
  
  
  
  // Form validation - now only check required fields since user is always signed in
  const isFormValid = formData.parentName && formData.email && selectedSuppliers.length > 0

  // Loading state - show loading until auth is resolved
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, show the page with auth modal
  if (!user) {
    // The auth modal will be handled by the useEffect and showAuthModal state
    // Don't redirect here - let the modal show
  }

  return (
    <>
            <div className="min-h-screen bg-primary-50">
        <ContextualBreadcrumb currentPage="review-book" />


        <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-400 rounded-full mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Ready to Send Your Enquiry?</h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We'll send your party requirements to all selected suppliers and they'll get back to you directly
          </p>
        </div>

        <div className="space-y-6">
          {/* Party Summary */}
          <PartySummaryCard partyDetails={partyDetails} />

          {/* Selected Suppliers */}
          <SelectedSuppliersCard selectedSuppliers={selectedSuppliers} />

          {/* Selected Add-ons */}
          <SelectedAddonsCard 
        selectedAddons={selectedAddons} 
        suppliers={fullSupplierData}
        onRemoveAddon={handleRemoveAddon}
      />


          {/* Contact Information */}
          <ContactInformationForm 
            formData={formData}
            user={user}
            customerProfile={customerProfile}
            onInputChange={handleInputChange}
          />

          {/* Special Requirements */}
          <SpecialRequirementsForm 
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />

          {/* Additional Message */}
          <AdditionalMessageForm 
            formData={formData}
            onInputChange={handleInputChange}
          />
            {/* ✅ NEW: Total Price Summary */}
  <TotalPriceSummaryCard 
    selectedSuppliers={selectedSuppliers}
    selectedAddons={selectedAddons}
    suppliers={fullSupplierData}
  />

          {/* What Happens Next */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span>
                        Your enquiry will be sent to all <strong>{selectedSuppliers.length} selected suppliers</strong>
                        {selectedAddons.length > 0 ? ` with ${selectedAddons.length} add-ons` : ""}
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Clock className="w-3 h-3 text-blue-600" />
                      </div>
                      <span>
                        Suppliers will contact you directly <strong>within 24 hours</strong>
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Star className="w-3 h-3 text-purple-600" />
                      </div>
                      <span>Compare quotes and availability before making your final decision</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Heart className="w-3 h-3 text-green-600" />
                      </div>
                      <span>
                        <strong>PartySnap remains free</strong> for parents - no booking fees
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Add-ons */}
          <div>
          {/* <RecommendedAddons 
          context="review" 
          maxItems={4}
          onAddonClick={handleAddonClick} // Use modal instead of onAddToCart
          title="Quick Add-ons"
        /> */}
          </div>
          <AddonDetailsModal
        isOpen={isAddonModalOpen}
        onClose={handleAddonModalClose}
        addon={selectedAddon}
        onAddToParty={handleAddAddonFromModal}
        isAlreadyAdded={selectedAddon ? hasAddon(selectedAddon.id) : false}
      />
        {/* Add the loading modal */}
        <SnappyEnquiryLoader
        isOpen={isSubmitting}
        currentStep={loadingStep}
        supplierCount={supplierCount}
        error={loadingError}
        
      />
      


          {/* Submit Button - Simplified since user is always signed in */}
          <div className="space-y-4">
            {/* <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-800 font-semibold">Signed in as {user?.email}</p>
                  <p className="text-xs text-green-700 mt-1">
                    Ready to send enquiries to all {selectedSuppliers.length} suppliers!
                    {customerProfile && (
                      <span className="block mt-1">Contact info auto-filled from your profile</span>
                    )}
                  </p>
                </div>
              </div>
            </div> */}

            <Button
              className="w-full bg-primary-500 hover:bg-primary-500 text-white py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              onClick={handleSubmitEnquiry}
              disabled={isSubmitting || isMigrating || !isFormValid}
            >
              {isSubmitting || isMigrating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  {isMigrating ? "Saving Party..." : "Sending Enquiry..."}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-3" />
                  Send Enquiry to All {selectedSuppliers.length} Suppliers
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 text-center italic">*Magical, one celebration at a time. 🎉</p>
          </div>
        </div>
      </div>

      {/* Blur overlay when auth modal is open */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 overflow-hidden" />
      )}

      {/* Auth Modal - Outside the blur container */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            // If auth is required, don't allow closing - redirect to dashboard instead
            if (authRequired) {
              console.log("🔙 Auth required but modal closed, redirecting to dashboard")
              router.push('/dashboard')
            } else {
              setShowAuthModal(false)
            }
          }}
          onSuccess={handleAuthSuccess}
          returnTo={window.location.href}
          selectedSuppliersCount={selectedSuppliers.length}
        />
      )}

      {/* Loading Overlay */}
      {(isSubmitting || isMigrating) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto text-center w-full shadow-2xl">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
              {isMigrating ? "Saving Your Party" : "Sending Your Enquiry"}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {isMigrating ? "Creating your party profile..." : "We're contacting all your selected suppliers..."}
            </p>
            <div className="mt-4 flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}