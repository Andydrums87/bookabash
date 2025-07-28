"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/AuthModal"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Calendar, Users, Music, Utensils, Palette, Building, Info, Send, LogIn } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import RecommendedAddons from "@/components/recommended-addons"
// ✅ NEW: Import auth and database functions
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function ReviewBookPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  // const [showAuthModal, setShowAuthModal] = useState(false)
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

  const loadPartyDataFromLocalStorage = () => {
    try {
      // Get party details
      const details = JSON.parse(localStorage.getItem('party_details') || '{}')
      setPartyDetails({
        date: details.date || "TBD",
        time: details.time || "TBD", 
        theme: details.theme || "Party",
        location: details.location || "TBD",
        age: details.childAge || "TBD",
        childName: details.childName || "Your Child"
      })

      // Get selected suppliers from party plan
      const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}')
      const suppliers = []
      
      // Convert party plan to supplier list
      Object.entries(partyPlan).forEach(([key, supplier]) => {
        if (supplier && key !== 'addons' && supplier.name) {
          const iconMap = {
            venue: <Building className="w-5 h-5" />,
            entertainment: <Music className="w-5 h-5" />,
            catering: <Utensils className="w-5 h-5" />,
            decorations: <Palette className="w-5 h-5" />,
            facePainting: <Palette className="w-5 h-5" />,
            activities: <Music className="w-5 h-5" />,
            partyBags: <Palette className="w-5 h-5" />
          }
          
          suppliers.push({
            id: supplier.id || key,
            name: supplier.name,
            category: supplier.category || key.charAt(0).toUpperCase() + key.slice(1),
            icon: iconMap[key] || <Info className="w-5 h-5" />
          })
        }
      })
      
      setSelectedSuppliers(suppliers)
      
      console.log('📋 Loaded party data from localStorage:', { details, suppliers: suppliers.length })
    } catch (error) {
      console.error('❌ Error loading party data:', error)
    }
  }

  const checkAuthStatusAndLoadProfile = async () => {
    try {
      setLoadingProfile(true)
      
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user && !error) {
        console.log('✅ Found authenticated user:', user.email)
        
        // Check if this is a CUSTOMER (not a supplier)
        const { data: supplierRecord } = await supabase
          .from('suppliers')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (supplierRecord) {
          // This is a supplier account, not a customer - treat as not signed in
          console.log('🔍 Detected supplier account, treating as not signed in for customer flow')
          setUser(null)
          setCustomerProfile(null)
          return
        }

        setUser(user)

        // Get or create customer profile
        const result = await partyDatabaseBackend.getCurrentUser()
        
        if (result.success) {
          console.log('✅ Found customer profile:', result.user)
          setCustomerProfile(result.user)
          
          // ✅ AUTO-POPULATE FORM WITH CUSTOMER DATA
          setFormData(prev => ({
            ...prev,
            parentName: `${result.user.first_name || ''} ${result.user.last_name || ''}`.trim() || prev.parentName,
            email: result.user.email || user.email || prev.email,
            phoneNumber: result.user.phone || prev.phoneNumber
          }))
          
          console.log('✅ Form auto-populated with customer data')
        } else {
          console.log('⚠️ No customer profile found, will create one during migration')
          // Still populate what we can from auth user
          setFormData(prev => ({
            ...prev,
            email: user.email || prev.email,
            parentName: user.user_metadata?.full_name || prev.parentName,
            phoneNumber: user.user_metadata?.phone || prev.phoneNumber
          }))
        }
      } else {
        console.log('❌ No authenticated user found')
        setUser(null)
        setCustomerProfile(null)
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error)
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
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: checked
      }
    }))
  }

  // ✅ NEW: Migration function
  const migratePartyToDatabase = async (authenticatedUser) => {
    try {
      setIsMigrating(true)
      console.log('🔄 Starting party migration to database...')

      // Get localStorage data
      const partyDetailsLS = JSON.parse(localStorage.getItem('party_details') || '{}')
      const partyPlanLS = JSON.parse(localStorage.getItem('user_party_plan') || '{}')

      console.log('📋 localStorage data:', { partyDetailsLS, partyPlanLS })

      // Ensure user profile exists (create if needed)
      const userResult = await partyDatabaseBackend.createOrGetUser({
        firstName: formData.parentName.split(' ')[0] || partyDetailsLS.childName || 'Party Host',
        lastName: formData.parentName.split(' ').slice(1).join(' ') || '',
        email: authenticatedUser.email,
        phone: formData.phoneNumber || authenticatedUser.user_metadata?.phone || '',
        postcode: partyDetailsLS.postcode || partyDetailsLS.location || ''
      })

      if (!userResult.success) {
        throw new Error(`Failed to create user profile: ${userResult.error}`)
      }

      console.log('✅ User profile ready:', userResult.user.id)

      // Create party in database
      const partyData = {
        childName: partyDetailsLS.childName || 'Your Child',
        childAge: parseInt(partyDetailsLS.childAge) || 6,
        date: partyDetailsLS.date || new Date().toISOString().split('T')[0],
        time: partyDetailsLS.time || '14:00',
        guestCount: parseInt(formData.numberOfChildren?.split('-')[0]) || parseInt(partyDetailsLS.guestCount) || 15,
        location: partyDetailsLS.location || 'TBD',
        postcode: partyDetailsLS.postcode || partyDetailsLS.location || '',
        theme: partyDetailsLS.theme || 'party',
        budget: parseInt(partyDetailsLS.budget) || 600,
        specialRequirements: formData.additionalMessage || ''
      }

      console.log('🎉 Creating party with data:', partyData)

      const createResult = await partyDatabaseBackend.createParty(partyData, partyPlanLS)

      if (!createResult.success) {
        throw new Error(`Failed to create party: ${createResult.error}`)
      }

      console.log('✅ Party migrated successfully to database:', createResult.party.id)
      return createResult.party

    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    } finally {
      setIsMigrating(false)
    }
  }



  const handleSubmitEnquiry = async () => {
    // Check if user is signed in
    if (!user) {
      console.log('🔐 User not signed in, showing auth modal')
      setShowAuthModal(true)
      return
    }
  
    try {
      setIsSubmitting(true)
  
      // Step 1: Migrate party to database
      console.log('📤 Step 1: Migrating party to database...')
      const migratedParty = await migratePartyToDatabase(user)
  
      // Step 2: Send enquiries to suppliers
      console.log('📧 Step 2: Sending enquiries to suppliers...')
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
            email: formData.email
          }
        })
      )
  
      if (!enquiryResult.success) {
        throw new Error(`Failed to send enquiries: ${enquiryResult.error}`)
      }
  
      console.log(`✅ Successfully sent ${enquiryResult.count} enquiries!`)
  
      // Step 3: Navigate to success page with enquiry count
      router.push(`/dashboard?enquiry_sent=true&enquiry_count=${enquiryResult.count}`)
  
    } catch (error) {
      console.error('❌ Submit enquiry failed:', error)
      alert(`Failed to send enquiry: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthSuccess = async (authenticatedUser, userData = null) => {
    console.log('✅ Authentication successful, proceeding with enquiry submission')
    console.log('👤 User data received:', userData)
    
    // Close the modal
    setShowAuthModal(false)
    
    // Update the user state
    setUser(authenticatedUser)
    
    // Prefill form with user data if provided
    if (userData) {
      console.log('📝 Prefilling form with user data')
      setFormData(prev => ({
        ...prev,
        parentName: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : userData.firstName || prev.parentName,
        email: userData.email || prev.email,
        phoneNumber: userData.phone || prev.phoneNumber
      }))
    } else {
      // Fallback: try to get data from the authenticated user
      const fullName = authenticatedUser.user_metadata?.full_name
      setFormData(prev => ({
        ...prev,
        parentName: fullName || prev.parentName,
        email: authenticatedUser.email || prev.email,
        phoneNumber: authenticatedUser.user_metadata?.phone || prev.phoneNumber
      }))
    }
    
    // Wait a moment for state to update, then submit
    setTimeout(() => {
      handleSubmitEnquiry()
    }, 100)
  }

  // Form validation - ✅ FIXED: Only require suppliers if not authenticated, full validation after auth
  const isFormValid = user ? 
    (formData.parentName && formData.email && selectedSuppliers.length > 0) : // If signed in, validate everything
    (selectedSuppliers.length > 0) // If not signed in, only require suppliers

  // ✅ Loading state for profile data
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Page Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Send Your Party Enquiry</h1>
          <p className="text-gray-600 text-sm md:text-base px-2">
            We'll send your requirements to all selected suppliers and they'll get back to you directly
          </p>
        </div>

        <div className="space-y-6">
          {/* Party Details */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Your Party Details</h2>
              </div>

              <div className="md:hidden space-y-3">
                <div className="bg-primary-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary-700 mb-1">{partyDetails.theme} Theme</div>
                    <div className="text-sm text-gray-600">{partyDetails.date}</div>
                    <div className="text-sm text-gray-600">{partyDetails.time}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Age:</span>
                    <p className="text-gray-900">{partyDetails.age}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Location:</span>
                    <p className="text-gray-900">{partyDetails.location}</p>
                  </div>
                </div>
              </div>

              <div className="hidden md:grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Date:</span>
                  <p className="text-gray-900">{partyDetails.date}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Time:</span>
                  <p className="text-gray-900">{partyDetails.time}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Theme:</span>
                  <p className="text-gray-900">{partyDetails.theme}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Age:</span>
                  <p className="text-gray-900">{partyDetails.age}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Location:</span>
                  <p className="text-gray-900">{partyDetails.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Suppliers */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Selected Suppliers ({selectedSuppliers.length})</h2>
              </div>

              {selectedSuppliers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No suppliers selected. Please go back and add suppliers to your party.</p>
                  <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">
                    Back to Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <div className="md:hidden space-y-3">
                    {selectedSuppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-primary-100"
                      >
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                          {supplier.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{supplier.name}</h3>
                          <p className="text-xs text-gray-600">{supplier.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:grid md:grid-cols-2 gap-4">
                    {selectedSuppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100"
                      >
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                          {supplier.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                          <p className="text-sm text-gray-600">{supplier.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Information - ✅ UPDATED: Optional when not signed in */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Info className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Your Contact Information</h2>
                {customerProfile && (
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    ✅ Auto-filled from your profile
                  </span>
                )}
                {!user && (
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    💡 Optional - fill after sign-in
                  </span>
                )}
              </div>
              
              {!user && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Don't worry!</strong> You can sign in first and we'll auto-fill this information from your profile.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent/Guardian Name {user && <span className="text-primary-500">*</span>}
                    </label>
                    <Input
                      placeholder={user ? "Your full name" : "Will be filled after sign-in"}
                      value={formData.parentName}
                      onChange={(e) => handleInputChange("parentName", e.target.value)}
                      className="bg-white border-gray-200 focus:border-primary-500 h-12"
                      disabled={!user && !formData.parentName} // Disabled if not signed in and empty
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number {user && <span className="text-primary-500">*</span>}
                    </label>
                    <Input
                      placeholder={user ? "07xxx xxx xxx" : "Will be filled after sign-in"}
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="bg-white border-gray-200 focus:border-primary-500 h-12"
                      disabled={!user && !formData.phoneNumber} // Disabled if not signed in and empty
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address {user && <span className="text-primary-500">*</span>}
                  </label>
                  <Input
                    type="email"
                    placeholder={user ? "your.email@example.com" : "Will be filled after sign-in"}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white border-gray-200 focus:border-primary-500 h-12"
                    disabled={!!user || (!user && !formData.email)} // Disabled if signed in OR if not signed in and empty
                  />
                  {user && (
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed as you're signed in
                    </p>
                  )}
                  {!user && (
                    <p className="text-xs text-blue-600 mt-1">
                      💡 Sign in first and we'll auto-fill your contact details
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requirements */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Special Requirements</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Children Expected</label>
                  <Select
                    value={formData.numberOfChildren}
                    onValueChange={(value) => handleInputChange("numberOfChildren", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:border-primary-500 h-12">
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

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Dietary Requirements</h3>
                  <div className="space-y-3">
                    {[
                      { key: "vegetarian", label: "Vegetarian options needed" },
                      { key: "vegan", label: "Vegan options needed" },
                      { key: "glutenFree", label: "Gluten-free options needed" },
                      { key: "nutAllergy", label: "Nut allergy considerations" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          id={item.key}
                          checked={formData.dietaryRequirements[item.key]}
                          onCheckedChange={checked =>
                            handleCheckboxChange("dietaryRequirements", item.key, checked)
                          }
                        />
                        <label htmlFor={item.key} className="text-sm text-gray-700 flex-1">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Accessibility Requirements</h3>
                  <div className="space-y-3">
                    {[
                      { key: "wheelchairAccessible", label: "Wheelchair accessible venue needed" },
                      { key: "sensoryFriendly", label: "Sensory-friendly environment" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          id={item.key}
                          checked={formData.accessibilityRequirements[item.key]}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("accessibilityRequirements", item.key, checked)
                          }
                        />
                        <label htmlFor={item.key} className="text-sm text-gray-700 flex-1">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Message */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Send className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Additional Message to Suppliers</h2>
              </div>
              <Textarea
                placeholder="Any specific requests, preferences, or additional information you'd like to share with the suppliers..."
                value={formData.additionalMessage}
                onChange={(e) => handleInputChange("additionalMessage", e.target.value)}
                className="bg-white min-h-[100px] border-gray-200 focus:border-primary-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                This message will be sent to all selected suppliers along with your party details
              </p>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Your enquiry will be sent to all {selectedSuppliers.length} selected suppliers</li>
                    <li>• Suppliers will contact you directly within 24 hours</li>
                    <li>• Compare quotes and availability before making your final decision</li>
                    <li>• BookABash remains free for parents - no booking fees</li>
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
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  💡 <strong>Ready to send?</strong> Click the button below to sign in and send enquiries to all your selected suppliers
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  ✅ Signed in as {user.email} - Ready to send enquiries!
                  {customerProfile && (
                    <span className="block mt-1">
                      Contact info auto-filled from your profile
                    </span>
                  )}
                </p>
              </div>
            )}

            <Button
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 text-lg font-semibold rounded-xl"
              onClick={handleSubmitEnquiry}
              disabled={isSubmitting || isMigrating || !isFormValid}
            >
              {isSubmitting || isMigrating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isMigrating ? "Saving Party..." : "Sending Enquiry..."}
                </>
              ) : user ? (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Enquiry to All Suppliers
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In & Send Enquiry
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 text-center">*Magical, one celebration at a time.</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-sm md:max-w-md mx-auto text-center w-full">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              {isMigrating ? "Saving Your Party" : "Sending Your Enquiry"}
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              {isMigrating ? "Creating your party profile..." : "We're contacting all your selected suppliers..."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}