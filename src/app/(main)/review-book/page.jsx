"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/AuthModal"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import {
  CheckCircle,
  Calendar,
  Users,
  Music,
  Utensils,
  Palette,
  Building,
  Info,
  Send,
  LogIn,
  Clock,
  MapPin,
  Star,
  Gift,
  Phone,
  Mail,
  User,
  MessageSquare,
  Shield,
  Heart,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
import RecommendedAddons from "@/components/recommended-addons"

// ✅ NEW: Import auth and database functions
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function ReviewBookPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [isMigrating, setIsMigrating] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(null)
  const [customerProfile, setCustomerProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

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

  // ✅ NEW: Load localStorage data and check auth status
  const [partyDetails, setPartyDetails] = useState({})
  const [selectedSuppliers, setSelectedSuppliers] = useState([])

  useEffect(() => {
    // Load party data from localStorage
    loadPartyDataFromLocalStorage()
    // Check if user is already signed in AND load their profile
    checkAuthStatusAndLoadProfile()
  }, [])

// Update the loadPartyDataFromLocalStorage function in ReviewBookPage

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

    // Format time slot for display
    const formatTimeSlotForDisplay = (details) => {
      // Check if we have time slot information
      if (details.timeSlot && details.duration) {
        const timeSlotDisplays = {
          morning: "Morning Party",
          afternoon: "Afternoon Party"
        };
        
        const formatDurationForDisplay = (duration) => {
          if (!duration) return '';
          
          if (duration === Math.floor(duration)) {
            return ` (${duration} hours)`;
          } else {
            const hours = Math.floor(duration);
            const minutes = (duration - hours) * 60;
            
            if (minutes === 30) {
              return ` (${hours}½ hours)`;
            } else {
              return ` (${hours}h ${minutes}m)`;
            }
          }
        };
        
        const slotDisplay = timeSlotDisplays[details.timeSlot] || "Afternoon Party";
        const durationDisplay = formatDurationForDisplay(details.duration);
        
        return slotDisplay + durationDisplay;
      }
      
      // Fallback to legacy time display if no time slot
      if (details.time) {
        try {
          const [hours, minutes] = details.time.split(':');
          const timeObj = new Date();
          timeObj.setHours(parseInt(hours), parseInt(minutes));
          
          const displayTime = timeObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          
          // Calculate end time (assume 2 hours)
          const endTimeObj = new Date(timeObj.getTime() + (2 * 60 * 60 * 1000));
          const displayEndTime = endTimeObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          
          return `${displayTime} - ${displayEndTime}`;
        } catch (error) {
          return details.time || "TBD";
        }
      }
      
      return "TBD";
    };

    // Set formatted party details
    setPartyDetails({
      date: formatDateForDisplay(details.date),
      time: formatTimeSlotForDisplay(details),
      theme: details.theme || "Party",
      location: details.location || "TBD",
      age: details.childAge || "TBD",
      childName: details.childName || "Your Child",
      
      // Keep raw data for migration purposes
      rawDate: details.date,
      rawTime: details.time,
      timeSlot: details.timeSlot,
      duration: details.duration,
      postcode: details.postcode
    })

    // Get selected suppliers from party plan
    const partyPlan = JSON.parse(localStorage.getItem("user_party_plan") || "{}")
    const suppliers = []

    // Convert party plan to supplier list
    Object.entries(partyPlan).forEach(([key, supplier]) => {
      if (supplier && key !== "addons" && supplier.name) {
        const iconMap = {
          venue: <Building className="w-5 h-5" />,
          entertainment: <Music className="w-5 h-5" />,
          catering: <Utensils className="w-5 h-5" />,
          decorations: <Palette className="w-5 h-5" />,
          facePainting: <Palette className="w-5 h-5" />,
          activities: <Music className="w-5 h-5" />,
          partyBags: <Palette className="w-5 h-5" />,
        }

        suppliers.push({
          id: supplier.id || key,
          name: supplier.name,
          category: supplier.category || key.charAt(0).toUpperCase() + key.slice(1),
          icon: iconMap[key] || <Info className="w-5 h-5" />,
        })
      }
    })

    // NEW: Get add-ons from party plan
    const addons = partyPlan.addons || []
    console.log("🔍 Debug: Raw party plan:", partyPlan)
    console.log("🔍 Debug: Extracted addons:", addons)

    setSelectedAddons(addons)
    setSelectedSuppliers(suppliers)

    console.log("📋 Loaded party data from localStorage:", {
      details,
      suppliers: suppliers.length,
      addons: addons.length,
      formattedDate: formatDateForDisplay(details.date),
      formattedTime: formatTimeSlotForDisplay(details)
    })
  } catch (error) {
    console.error("❌ Error loading party data:", error)
  }
}


  const checkAuthStatusAndLoadProfile = async () => {
    try {
      setLoadingProfile(true)
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

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
          return
        }

        setUser(user)

        // Get or create customer profile
        const result = await partyDatabaseBackend.getCurrentUser()
        if (result.success) {
          console.log("✅ Found customer profile:", result.user)
          setCustomerProfile(result.user)

          // ✅ AUTO-POPULATE FORM WITH CUSTOMER DATA
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCheckboxChange = (category, field, checked) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: checked,
      },
    }))
  }


// Also update the migratePartyToDatabase function to handle time slots
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

    // Create party in database with time slot information
    const partyData = {
      childName: partyDetailsLS.childName || "Your Child",
      childAge: Number.parseInt(partyDetailsLS.childAge) || 6,
      date: partyDetailsLS.date || new Date().toISOString().split("T")[0],
      
      // NEW: Handle time slot information
      time: partyDetailsLS.time || "14:00",
      timeSlot: partyDetailsLS.timeSlot || "afternoon",
      duration: partyDetailsLS.duration || 2,
      
      guestCount:
        Number.parseInt(formData.numberOfChildren?.split("-")[0]) || Number.parseInt(partyDetailsLS.guestCount) || 15,
      location: partyDetailsLS.location || "TBD",
      postcode: partyDetailsLS.postcode || partyDetailsLS.location || "",
      theme: partyDetailsLS.theme || "party",
      budget: Number.parseInt(partyDetailsLS.budget) || 600,
      specialRequirements: formData.additionalMessage || "",
      
      // Additional time metadata
      timePreference: partyDetailsLS.timePreference || {
        type: 'flexible',
        slot: partyDetailsLS.timeSlot || 'afternoon',
        duration: partyDetailsLS.duration || 2,
        specificTime: null
      }
    }

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

  const handleSubmitEnquiry = async () => {
    // Check if user is signed in
    if (!user) {
      console.log("🔐 User not signed in, showing auth modal")
      setShowAuthModal(true)
      return
    }

    try {
      setIsSubmitting(true)

      // Step 1: Migrate party to database
      console.log("📤 Step 1: Migrating party to database...")
      const migratedParty = await migratePartyToDatabase(user)

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

      if (!enquiryResult.success) {
        throw new Error(`Failed to send enquiries: ${enquiryResult.error}`)
      }

      console.log(`✅ Successfully sent ${enquiryResult.count} enquiries!`)

      // Step 3: Navigate to success page with enquiry count
      router.push(`/dashboard?enquiry_sent=true&enquiry_count=${enquiryResult.count}`)
    } catch (error) {
      console.error("❌ Submit enquiry failed:", error)
      alert(`Failed to send enquiry: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthSuccess = async (authenticatedUser, userData = null) => {
    console.log("✅ Authentication successful, proceeding with enquiry submission")
    console.log("👤 User data received:", userData)

    // Close the modal
    setShowAuthModal(false)

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

    // Wait a moment for state to update, then submit
    setTimeout(() => {
      handleSubmitEnquiry()
    }, 100)
  }

  // Form validation - ✅ FIXED: Only require suppliers if not authenticated, full validation after auth
  const isFormValid = user
    ? formData.parentName && formData.email && selectedSuppliers.length > 0
    : // If signed in, validate everything
      selectedSuppliers.length > 0 // If not signed in, only require suppliers

  // ✅ Loading state for profile data
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

  const totalAddonsPrice = selectedAddons.reduce((total, addon) => total + (addon.price || 0), 0)

  return (
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
          {/* Party Summary Card */}
          <Card className="border-2 border-primary-200 shadow-lg bg-gradient-to-br from-primary-50 to-white overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-primary-400 text-white p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">
                        {partyDetails.childName}'s {partyDetails.theme} Party
                      </h2>
                      <p className="text-primary-100 text-sm">
                        Age {partyDetails.age} • {partyDetails.theme} Theme
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">🎉</div>
                  </div>
                </div>
              </div>

             
{/* Party Details - Updated to show better time formatting */}
<div className="p-4 sm:p-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
        <Calendar className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Date</p>
        <p className="text-gray-900 font-semibold">{partyDetails.date}</p>
      </div>
    </div>

    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
        <Clock className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Time</p>
        <p className="text-gray-900 font-semibold">{partyDetails.time}</p>
        {/* Show additional time info if available */}
        {partyDetails.timeSlot && partyDetails.duration && (
          <p className="text-xs text-gray-500 mt-1">
            {partyDetails.timeSlot === 'morning' ? '10am-1pm window' : '1pm-4pm window'}
          </p>
        )}
      </div>
    </div>

    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
        <MapPin className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Location</p>
        <p className="text-gray-900 font-semibold">{partyDetails.location}</p>
      </div>
    </div>

    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
        <Users className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">Child's Age</p>
        <p className="text-gray-900 font-semibold">{partyDetails.age} years old</p>
      </div>
    </div>
  </div>
</div>
            </CardContent>
          </Card>

          {/* Selected Suppliers */}
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Selected Suppliers</h2>
                    <p className="text-gray-600 text-sm">
                      {selectedSuppliers.length} suppliers will receive your enquiry
                    </p>
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedSuppliers.length}
                </div>
              </div>

              {selectedSuppliers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No suppliers selected yet</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="border-primary-300 text-primary-600 hover:bg-primary-50"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {selectedSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {supplier.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{supplier.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{supplier.category}</p>
                      </div>
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Add-ons */}
          {selectedAddons.length > 0 && (
            <Card className="border border-amber-200 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Selected Add-ons</h2>
                      <p className="text-gray-600 text-sm">{selectedAddons.length} extras for your party</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                      £{totalAddonsPrice}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {selectedAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-amber-100 shadow-sm"
                    >
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Gift className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{addon.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{addon.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-lg font-bold text-amber-600">£{addon.price}</span>
                          {addon.supplierName && (
                            <span className="text-xs text-gray-500">via {addon.supplierName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total Add-ons Cost:</span>
                    <span className="text-2xl font-bold text-amber-600">£{totalAddonsPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Contact Information</h2>
                    <p className="text-gray-600 text-sm">How suppliers will reach you</p>
                  </div>
                </div>
                {customerProfile && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    ✅ Auto-filled
                  </div>
                )}
                {!user && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    💡 Sign in to auto-fill
                  </div>
                )}
              </div>

              {!user && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Sign in to auto-fill your details</p>
                      <p className="text-xs text-blue-700 mt-1">
                        We'll automatically populate your contact information from your profile
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Parent/Guardian Name {user && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      placeholder={user ? "Your full name" : "Will be filled after sign-in"}
                      value={formData.parentName}
                      onChange={(e) => handleInputChange("parentName", e.target.value)}
                      className="bg-white border-gray-200 focus:border-primary-500 h-12 text-base"
                      disabled={!user && !formData.parentName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number {user && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      placeholder={user ? "07xxx xxx xxx" : "Will be filled after sign-in"}
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="bg-white border-gray-200 focus:border-primary-500 h-12 text-base"
                      disabled={!user && !formData.phoneNumber}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address {user && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    type="email"
                    placeholder={user ? "your.email@example.com" : "Will be filled after sign-in"}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white border-gray-200 focus:border-primary-500 h-12 text-base"
                    disabled={!!user || (!user && !formData.email)}
                  />
                  {user && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Email cannot be changed as you're signed in
                    </p>
                  )}
                  {!user && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      Sign in first and we'll auto-fill your contact details
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requirements */}
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Special Requirements</h2>
                  <p className="text-gray-600 text-sm">Help us make your party perfect for everyone</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Number of Children */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Children Expected
                  </label>
                  <Select
                    value={formData.numberOfChildren}
                    onValueChange={(value) => handleInputChange("numberOfChildren", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:border-primary-500 h-12 text-base">
                      <SelectValue placeholder="Select number of children" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-10">5-10 children</SelectItem>
                      <SelectItem value="10-15">10-15 children</SelectItem>
                      <SelectItem value="15-20">15-20 children</SelectItem>
                      <SelectItem value="20-25">20-25 children</SelectItem>
                      <SelectItem value="25+">25+ children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dietary Requirements */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <Utensils className="w-4 h-4 mr-2" />
                    Dietary Requirements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "vegetarian", label: "Vegetarian options needed", icon: "🥗" },
                      { key: "vegan", label: "Vegan options needed", icon: "🌱" },
                      { key: "glutenFree", label: "Gluten-free options needed", icon: "🌾" },
                      { key: "nutAllergy", label: "Nut allergy considerations", icon: "🥜" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <Checkbox
                          id={item.key}
                          checked={formData.dietaryRequirements[item.key]}
                          onCheckedChange={(checked) => handleCheckboxChange("dietaryRequirements", item.key, checked)}
                          className="data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-lg">{item.icon}</span>
                          <label htmlFor={item.key} className="text-sm text-gray-700 font-medium cursor-pointer">
                            {item.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessibility Requirements */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Accessibility Requirements
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: "wheelchairAccessible", label: "Wheelchair accessible venue needed", icon: "♿" },
                      { key: "sensoryFriendly", label: "Sensory-friendly environment", icon: "🤫" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <Checkbox
                          id={item.key}
                          checked={formData.accessibilityRequirements[item.key]}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("accessibilityRequirements", item.key, checked)
                          }
                          className="data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-lg">{item.icon}</span>
                          <label htmlFor={item.key} className="text-sm text-gray-700 font-medium cursor-pointer">
                            {item.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Message */}
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Additional Message to Suppliers</h2>
                  <p className="text-gray-600 text-sm">Any special requests or important details</p>
                </div>
              </div>
              <Textarea
                placeholder="Any specific requests, preferences, or additional information you'd like to share with the suppliers..."
                value={formData.additionalMessage}
                onChange={(e) => handleInputChange("additionalMessage", e.target.value)}
                className="bg-white min-h-[120px] border-gray-200 focus:border-primary-500 text-base resize-none"
              />
              <p className="text-sm text-gray-500 mt-3 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                This message will be sent to all selected suppliers along with your party details
              </p>
            </CardContent>
          </Card>

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
                        <strong>BookABash remains free</strong> for parents - no booking fees
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Add-ons */}
          <div>
            <RecommendedAddons
              context="review"
              title="Quick Add-ons"
              subtitle="Last minute extras you can still add to your party"
              maxItems={3}
              onAddToCart={(addon) => console.log("Adding addon:", addon)}
            />
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            {!user ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-800 font-semibold">Ready to send your enquiry?</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Click the button below to sign in and send enquiries to all your selected suppliers
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-800 font-semibold">Signed in as {user.email}</p>
                    <p className="text-xs text-green-700 mt-1">
                      Ready to send enquiries!
                      {customerProfile && (
                        <span className="block mt-1">Contact info auto-filled from your profile</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-primary-400 hover:bg-primary-500 text-white py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              onClick={handleSubmitEnquiry}
              disabled={isSubmitting || isMigrating || !isFormValid}
            >
              {isSubmitting || isMigrating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  {isMigrating ? "Saving Party..." : "Sending Enquiry..."}
                </>
              ) : user ? (
                <>
                  <Send className="w-5 h-5 mr-3" />
                  Send Enquiry to All {selectedSuppliers.length} Suppliers
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-3" />
                  Sign In & Send Enquiry
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 text-center italic">*Magical, one celebration at a time. 🎉</p>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
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
  )
}
