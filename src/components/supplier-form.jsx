"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "./ui/checkbox"
import { MapPin, Eye, EyeOff, ArrowLeft, CheckCircle, Mail, Loader2, Building } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getBaseUrl } from "@/utils/env"
import Link from "next/link"
import { BasicTermsModal } from "./basic-terms-modal"
import { PrivacyPolicyModal } from "./privacy-policy-modal"

const serviceTypes = [
  { id: "Entertainment", name: "Entertainment" },
  { id: "Venues", name: "Venues" },
  { id: "Catering", name: "Catering" },
  { id: "Photography", name: "Photography" },
  { id: "Decorations", name: "Decorations" },
  { id: "Activities", name: "Activities & Games" },
  { id: "Face Painting", name: "Face Painting"},
  { id: "Bouncy Castle", name: "Bouncy Castle"},
  { id: "Cakes", name: "Cakes & Desserts" },   
  { id: "Party Bags", name: "Party Bags" }, 
  { id: "other", name: "Other" },
]

export function SupplierForm() {
  const router = useRouter()

  // State variables
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  // Form data state
  const [businessData, setBusinessData] = useState({
    businessName: "",
    phone: "",
    postcode: "",
    supplierType: "",
    // NEW: Venue address fields
    venueAddress: {
      businessName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      country: "United Kingdom"
    }
  })

  const [accountData, setAccountData] = useState({
    yourName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [notificationPreferences, setNotificationPreferences] = useState({
    emailBookings: true,
    emailMessages: true,
    smsBookings: false,
    smsReminders: false
  })

  // Check if current selection is a venue
  const isVenue = businessData.supplierType === "Venues"

  // Local Storage Functions
  const saveFormData = () => {
    const formData = {
      businessData,
      accountData: {
        yourName: accountData.yourName,
        email: accountData.email
        // Don't save passwords for security
      },
      currentStep,
      termsAccepted,
      notificationPreferences,
      timestamp: Date.now()
    }
    localStorage.setItem('supplierFormData', JSON.stringify(formData))
    console.log('💾 Form data saved to localStorage')
  }

  const loadFormData = () => {
    try {
      const savedData = localStorage.getItem('supplierFormData')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        
        // Only restore if saved within last 24 hours (prevent stale data)
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000
        
        if (isRecent) {
          setBusinessData(parsed.businessData || {
            businessName: "",
            phone: "",
            postcode: "",
            supplierType: "",
            venueAddress: {
              businessName: "",
              addressLine1: "",
              addressLine2: "",
              city: "",
              postcode: "",
              country: "United Kingdom"
            }
          })
          
          setAccountData(prev => ({
            ...prev,
            yourName: parsed.accountData?.yourName || "",
            email: parsed.accountData?.email || ""
            // Passwords remain empty for security
          }))
          
          setCurrentStep(parsed.currentStep || 1)
          setTermsAccepted(parsed.termsAccepted || false)
          setNotificationPreferences(parsed.notificationPreferences || {
            emailBookings: true,
            emailMessages: true,
            smsBookings: false,
            smsReminders: false
          })
          
          console.log('✅ Form data restored from localStorage')
          return true
        }
      }
    } catch (error) {
      console.warn('Failed to load form data:', error)
    }
    return false
  }

  const clearFormData = () => {
    localStorage.removeItem('supplierFormData')
    console.log('🗑️ Form data cleared from localStorage')
  }

  // Load saved data on component mount
  useEffect(() => {
    loadFormData()
  }, [])

  // Helper function to get user IP
  const getUserIP = async () => {
    try {
      const response = await fetch('/api/get-ip')
      if (!response.ok) throw new Error('Failed to get IP')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.warn('Could not get user IP:', error)
      return 'unknown'
    }
  }

  // Onboarding email function
  const sendOnboardingEmail = async (emailData) => {
    try {
      const response = await fetch('/api/email/supplier-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Onboarding email sent successfully:', result)
      return result
    } catch (error) {
      console.error('❌ Failed to send onboarding email:', error)
      return null
    }
  }

  // Form field update handlers with auto-save
  const updateBusinessData = (field, value) => {
    setBusinessData(prev => {
      const newData = { ...prev, [field]: value }
      // Save after a short delay to avoid too many saves
      setTimeout(() => {
        const formData = {
          businessData: newData,
          accountData: {
            yourName: accountData.yourName,
            email: accountData.email
          },
          currentStep,
          termsAccepted,
          notificationPreferences,
          timestamp: Date.now()
        }
        localStorage.setItem('supplierFormData', JSON.stringify(formData))
      }, 500)
      return newData
    })
  }

  // NEW: Handler for venue address updates
  const updateVenueAddress = (field, value) => {
    setBusinessData(prev => {
      const newData = {
        ...prev,
        venueAddress: {
          ...prev.venueAddress,
          [field]: value
        }
      }
      // Save after a short delay
      setTimeout(() => {
        const formData = {
          businessData: newData,
          accountData: {
            yourName: accountData.yourName,
            email: accountData.email
          },
          currentStep,
          termsAccepted,
          notificationPreferences,
          timestamp: Date.now()
        }
        localStorage.setItem('supplierFormData', JSON.stringify(formData))
      }, 500)
      return newData
    })
  }

  const updateAccountData = (field, value) => {
    setAccountData(prev => {
      const newData = { ...prev, [field]: value }
      // Save non-password fields
      if (field !== 'password' && field !== 'confirmPassword') {
        setTimeout(() => {
          const formData = {
            businessData,
            accountData: {
              yourName: newData.yourName,
              email: newData.email
            },
            currentStep,
            termsAccepted,
            notificationPreferences,
            timestamp: Date.now()
          }
          localStorage.setItem('supplierFormData', JSON.stringify(formData))
        }, 500)
      }
      return newData
    })
  }

  // Validation functions
  const validateStep1 = () => {
    const { businessName, phone, postcode, supplierType, venueAddress } = businessData

    if (!businessName || !phone || !postcode || !supplierType) {
      setError("All fields are required.")
      return false
    }
    
    // NEW: Additional validation for venues
    if (supplierType === "Venues") {
      if (!venueAddress.businessName || !venueAddress.addressLine1 || !venueAddress.city || !venueAddress.postcode) {
        setError("All venue address fields are required for venue listings.")
        return false
      }
      
      // Validate venue postcode format
      if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(venueAddress.postcode.replace(/\s/g, ''))) {
        setError("Please enter a valid UK postcode for the venue location.")
        return false
      }
    }
    
    if (!/^[\d\s\+\-\(\)]+$/.test(phone)) {
      setError("Please enter a valid phone number.")
      return false
    }

    if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(postcode.replace(/\s/g, ''))) {
      setError("Please enter a valid UK postcode.")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    const { yourName, email, password, confirmPassword } = accountData

    if (!yourName || !email || !password || !confirmPassword) {
      setError("All fields are required.")
      return false
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.")
      return false
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return false
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return false
    }

    return true
  }

  // Step navigation with data persistence
  const nextStep = async () => {
    setError("")
    
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
        saveFormData()
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        saveFormData()
        await handleAccountCreation()
      }
    }
  }

  const prevStep = () => {
    setError("")
    setCurrentStep(currentStep - 1)
    saveFormData()
  }

  // Account creation handler
  const handleAccountCreation = async () => {
    setLoading(true)
    setError("")
    setTermsError(false)

    // Validate terms acceptance
    if (!termsAccepted) {
      setError("Please read and accept our Terms & Conditions to continue with account creation.")
      setTermsError(true)
      setLoading(false)
      
      // Scroll to terms section
      document.getElementById('terms-acceptance')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      return
    }

    try {
      console.log('🚀 Creating supplier account...')

      // Step 1: Prepare terms acceptance data
      const termsData = {
        email: accountData.email,
        ip_address: await getUserIP(),
        terms_version: "1.0",
        privacy_version: "1.0",
        accepted_at: new Date().toISOString(),
        user_agent: navigator.userAgent
      }

      console.log('📋 Terms acceptance data prepared:', {
        email: termsData.email,
        ip: termsData.ip_address,
        timestamp: termsData.accepted_at
      })

      // Step 2: Save to onboarding_drafts (temporary storage)
      console.log('💾 Saving to onboarding_drafts...')
      
      const draftData = {
        email: accountData.email,
        your_name: accountData.yourName,
        business_name: businessData.businessName,
        phone: businessData.phone,
        postcode: businessData.postcode,
        supplier_type: businessData.supplierType,
        terms_accepted: {
          ...termsData,
          // NEW: Store notification preferences in terms metadata
          notification_preferences: notificationPreferences,
          // WORKAROUND: Store venue address here temporarily
          ...(businessData.supplierType === "Venues" && {
            venue_address: businessData.venueAddress
          })
        }
      }
      // NEW: Add venue address if it's a venue
      if (businessData.supplierType === "Venues") {
        draftData.venue_address = businessData.venueAddress
      }
      
      const { data: draftResult, error: draftError } = await supabase
        .from("onboarding_drafts")
        .insert(draftData)
        .select()
        .single()

      if (draftError) {
        if (draftError.code === '23505') {
          console.log('📝 Email exists in drafts, updating...')
          const { error: updateError } = await supabase
            .from("onboarding_drafts")
            .update(draftData)
            .eq("email", accountData.email)

          if (updateError) throw updateError
        } else {
          throw draftError
        }
      }

      console.log('✅ Onboarding draft saved')

      // Step 3: Create Supabase auth user
      console.log('🔐 Creating auth user...')
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: accountData.email,
        password: accountData.password,
        options: {
          data: {
            user_type: 'supplier',
            full_name: accountData.yourName,
            business_name: businessData.businessName,
            phone: businessData.phone,
            postcode: businessData.postcode,
            supplier_type: businessData.supplierType,
            // NEW: Include venue address in user metadata
            venue_address: businessData.supplierType === "Venues" ? businessData.venueAddress : null
          }
        }
      })

      if (authError) {
        console.error('❌ Auth signup error:', authError)
        
        switch (authError.message) {
          case 'User already registered':
            setError("An account with this email already exists. Please try signing in instead.")
            break
          default:
            setError(`Account creation failed: ${authError.message}`)
        }
        return
      }

      console.log('✅ Auth user created:', authData.user?.id)

      // Step 4: Save terms acceptance to permanent table
      if (authData.user) {
        console.log('📝 Saving terms acceptance to permanent table...')
        
        const { data: termsRecord, error: termsError } = await supabase
          .from('terms_acceptances')
          .insert({
            user_id: authData.user.id,
            user_email: accountData.email,
            terms_version: termsData.terms_version,
            privacy_version: termsData.privacy_version,
            ip_address: termsData.ip_address,
            user_agent: termsData.user_agent,
            accepted_at: termsData.accepted_at
          })
          .select()
          .single()

        if (termsError) {
          console.error('❌ CRITICAL: Failed to save terms acceptance:', termsError)
          throw new Error('Failed to save terms acceptance. Please try again.')
        } else {
          console.log('✅ Terms acceptance saved permanently with ID:', termsRecord.id)
        }
      }

      // Step 5: Send onboarding email
      console.log('📧 Sending onboarding email...')
      // await sendOnboardingEmail({
      //   supplierEmail: accountData.email,
      //   supplierName: accountData.yourName,
      //   businessName: businessData.businessName,
      //   serviceType: businessData.supplierType,
      //   needsVerification: !authData.session,
      //   dashboardLink: `${window.location.origin}/suppliers/dashboard`
      // })

      // Step 6: Clear saved form data and move to success step
      clearFormData()
      if (authData.user && !authData.session) {
        setNeedsVerification(true)
      }
      setCurrentStep(3)
      
    } catch (error) {
      console.error("💥 Error during account creation:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // OAuth signup handler
  const handleOAuthSignup = async (provider) => {
    setError("")
    setLoading(true)

    try {
      console.log(`🔐 Starting ${provider} OAuth signup...`)
      
      const oauthBusinessData = {
        ...businessData,
        timestamp: Date.now(),
        source: 'oauth_signup'
      }
      
      localStorage.setItem('pendingBusinessData', JSON.stringify(oauthBusinessData))
      console.log('💾 Stored business data for OAuth:', oauthBusinessData)
      
      const redirectUrl = `${getBaseUrl()}/auth/callback/supplier?step=onboarding`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            user_type: 'supplier',
            onboarding: 'true'
          }
        }
      })
      
      if (error) {
        console.error(`❌ ${provider} OAuth error:`, error)
        setError(`Failed to sign up with ${provider}. Please try again.`)
        setLoading(false)
      }
      
    } catch (err) {
      console.error(`❌ ${provider} OAuth error:`, err)
      setError(`Failed to sign up with ${provider}. Please try again.`)
      setLoading(false)
    }
  }

  // Styling constants
  const labelClasses = "text-gray-700 dark:text-gray-300 font-medium"
  const inputClasses = "p-6 mt-1 bg-white dark:bg-slate-700 border-slate-400 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-[hsl(var(--primary-500))] focus:border-[hsl(var(--primary-500))] rounded-md shadow-sm"
  const requiredStar = <span className="text-primary-500">*</span>

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <span className={`ml-2 text-sm font-medium ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-500'}`}>
            Business Details
          </span>
        </div>
        
        <div className={`w-12 h-px ${currentStep > 1 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <span className={`ml-2 text-sm font-medium ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-500'}`}>
            Create Account
          </span>
        </div>
        
        <div className={`w-12 h-px ${currentStep > 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {currentStep > 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
          </div>
          <span className={`ml-2 text-sm font-medium ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-500'}`}>
            Get Started
          </span>
        </div>
      </div>

      {/* Step 1: Business Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tell us about your business</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We'll use this information to set up your supplier profile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="businessName" className={labelClasses}>
                Business Name {requiredStar}
              </Label>
              <Input
                id="businessName"
                value={businessData.businessName}
                onChange={(e) => updateBusinessData('businessName', e.target.value)}
                placeholder="Your business name"
                className={inputClasses}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="phone" className={labelClasses}>
                Business Phone {requiredStar}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={businessData.phone}
                onChange={(e) => updateBusinessData('phone', e.target.value)}
                placeholder="07xxx xxx xxx"
                className={inputClasses}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="supplierType" className={labelClasses}>
                Primary Service Type {requiredStar}
              </Label>
              <Select 
                value={businessData.supplierType} 
                onValueChange={(value) => updateBusinessData('supplierType', value)}
                disabled={loading}
              >
                <SelectTrigger className={`mt-1 w-full ${inputClasses.replace("placeholder:text-gray-400 dark:placeholder:text-gray-500", "")}`}>
                  <SelectValue placeholder="Select your main service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="postcode" className={labelClasses}>
                Business Postcode {requiredStar}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="postcode"
                  value={businessData.postcode}
                  onChange={(e) => updateBusinessData('postcode', e.target.value)}
                  placeholder="e.g. SW1A 1AA"
                  className={`pl-10 ${inputClasses}`}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* NEW: Venue Address Section - Only show for venues */}
          {isVenue && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Venue Location Details
                </h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-6">
                Please provide the full address where parties will take place
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="venueBusinessName" className={labelClasses}>
                    Venue/Hall Name {requiredStar}
                  </Label>
                  <Input
                    id="venueBusinessName"
                    value={businessData.venueAddress.businessName}
                    onChange={(e) => updateVenueAddress('businessName', e.target.value)}
                    placeholder="e.g. St Peter's Community Hall"
                    className={inputClasses}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venueAddressLine1" className={labelClasses}>
                      Address Line 1 {requiredStar}
                    </Label>
                    <Input
                      id="venueAddressLine1"
                      value={businessData.venueAddress.addressLine1}
                      onChange={(e) => updateVenueAddress('addressLine1', e.target.value)}
                      placeholder="123 Church Street"
                      className={inputClasses}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="venueAddressLine2" className={labelClasses}>
                      Address Line 2
                    </Label>
                    <Input
                      id="venueAddressLine2"
                      value={businessData.venueAddress.addressLine2}
                      onChange={(e) => updateVenueAddress('addressLine2', e.target.value)}
                      placeholder="Optional"
                      className={inputClasses}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="venueCity" className={labelClasses}>
                      City {requiredStar}
                    </Label>
                    <Input
                      id="venueCity"
                      value={businessData.venueAddress.city}
                      onChange={(e) => updateVenueAddress('city', e.target.value)}
                      placeholder="London"
                      className={inputClasses}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="venuePostcode" className={labelClasses}>
                      Venue Postcode {requiredStar}
                    </Label>
                    <Input
                      id="venuePostcode"
                      value={businessData.venueAddress.postcode}
                      onChange={(e) => updateVenueAddress('postcode', e.target.value.toUpperCase())}
                      placeholder="SW1A 1AA"
                      className={inputClasses}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="venueCountry" className={labelClasses}>
                      Country {requiredStar}
                    </Label>
                    <Select
                      value={businessData.venueAddress.country}
                      onValueChange={(value) => updateVenueAddress('country', value)}
                      disabled={loading}
                    >
                      <SelectTrigger className={`mt-1 w-full ${inputClasses.replace("placeholder:text-gray-400 dark:placeholder:text-gray-500", "")}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Ireland">Ireland</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Account Creation - Keep existing code */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Set up your login credentials to access your dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="yourName" className={labelClasses}>
                Your Full Name {requiredStar}
              </Label>
              <Input
                id="yourName"
                value={accountData.yourName}
                onChange={(e) => updateAccountData('yourName', e.target.value)}
                placeholder="Your full name"
                className={inputClasses}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="email" className={labelClasses}>
                Email Address {requiredStar}
              </Label>
              <Input
                id="email"
                type="email"
                value={accountData.email}
                onChange={(e) => updateAccountData('email', e.target.value)}
                placeholder="you@example.com"
                className={inputClasses}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" className={labelClasses}>
                Password {requiredStar}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={accountData.password}
                  onChange={(e) => updateAccountData('password', e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                  disabled={loading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className={labelClasses}>
                Confirm Password {requiredStar}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={accountData.confirmPassword}
                  onChange={(e) => updateAccountData('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                  disabled={loading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* OAuth Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => handleOAuthSignup("google")}
                disabled={loading}
                className="border-gray-300 hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => handleOAuthSignup("facebook")}
                disabled={loading}
                className="border-gray-300 hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="rounded-lg p-4 sm:p-6 bg-blue-50 border border-blue-200">
              
              {/* Basic Terms Acceptance - SIMPLIFIED */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="basic-terms-acceptance"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => {
                      setTermsAccepted(checked)
                      if (checked) setTermsError(false)
                      saveFormData()
                    }}
                    className="mt-1 flex-shrink-0 data-[state=checked]:bg-[hsl(var(--primary-600))] data-[state=checked]:border-[hsl(var(--primary-600))]"
                    required
                  />
                  <div className="flex-1 min-w-0">
                    <Label 
                      htmlFor="basic-terms-acceptance" 
                      className="text-sm leading-relaxed cursor-pointer font-medium block text-gray-800"
                    >
                      I agree to PartySnap's{" "}
                      <BasicTermsModal>
                        <button 
                          type="button"
                          className="hover:underline font-medium inline-block text-primary-600"
                        >
                          Terms of Service
                        </button>
                      </BasicTermsModal>
                      {" "}and{" "}
                      <PrivacyPolicyModal>
                        <button 
                          type="button"
                          className="hover:underline font-medium inline-block text-primary-600"
                        >
                          Privacy Policy
                        </button>
                      </PrivacyPolicyModal>
                    </Label>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Full supplier terms will be presented when you're ready to go live.
                    </p>
                    
                    {termsError && (
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        Please accept our basic terms to create your account.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-blue-200 my-4"></div>

              {/* Notification Preferences - UNCHANGED */}
              <div>
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-base">
                  <span>📱</span> Notification Preferences
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="smsBookingsOnboard"
                      checked={notificationPreferences.smsBookings}
                      onCheckedChange={(checked) => {
                        setNotificationPreferences(prev => ({ ...prev, smsBookings: !!checked }))
                        saveFormData()
                      }}
                      className="mt-1 flex-shrink-0 data-[state=checked]:bg-[hsl(var(--primary-600))] data-[state=checked]:border-[hsl(var(--primary-600))]"
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="smsBookingsOnboard" className="text-sm text-blue-800 font-medium cursor-pointer block">
                        Enable urgent SMS alerts
                      </Label>
                      <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                        Get instant notifications when customers pay deposits (highly recommended for faster response times)
                      </p>
                      <div className="text-xs text-blue-600 mt-2 space-y-1">
                        <div>✓ Instant alerts when payments are made</div>
                        <div>✓ 2-hour response window reminders</div>
                        <div>✓ Reply STOP anytime to opt out</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {currentStep === 3 && (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to PartySnap!</h2>
            {needsVerification ? (
              <div className="mt-4 space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Check Your Email</p>
                      <p className="text-sm text-blue-700">
                        We've sent a verification link to <strong>{accountData.email}</strong>. 
                        Please click it to activate your account.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  Once verified, you can sign in to access your supplier dashboard.
                </p>
              </div>
            ) : (
              <p className="text-gray-600 mt-2">
                Your account has been created! You can now sign in to access your supplier dashboard.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push("/suppliers/onboarding/auth/signin")}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3"
            >
              Sign In to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/")}
              className="px-8 py-3"
            >
              Return to Homepage
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            type="button"
            onClick={nextStep}
            disabled={loading || (currentStep === 2 && !termsAccepted)}
            className={`px-8 transition-all ${
              currentStep === 2 && !termsAccepted 
                ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' 
                : 'bg-primary-600 hover:bg-primary-700'
            } text-white`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentStep === 2 ? (
              termsAccepted ? "Create Account" : "Accept Terms to Continue"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}