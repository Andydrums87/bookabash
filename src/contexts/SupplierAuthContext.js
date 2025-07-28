// contexts/SupplierAuthContext.js
"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const SupplierAuthContext = createContext({})

export const useSupplierAuth = () => {
  const context = useContext(SupplierAuthContext)
  if (!context) {
    throw new Error('useSupplierAuth must be used within SupplierAuthProvider')
  }
  return context
}

export const SupplierAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchSupplierProfile(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchSupplierProfile(session.user.id)
        } else {
          setUser(null)
          setSupplier(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchSupplierProfile = async (userId) => {
    try {
      console.log('🔍 Fetching primary supplier profile for user:', userId)
      
      // Look specifically for PRIMARY business
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('is_primary', true)  // ✅ Only get primary business
        .maybeSingle()  // ✅ Use maybeSingle instead of single
  
      if (error) {
        console.error('❌ Error fetching supplier profile:', error)
        return
      }
  
      if (data) {
        console.log('✅ Found primary supplier profile:', data.business_name)
        setSupplier(data)
      } else {
        console.log('❌ No primary supplier profile found')
        setSupplier(null)
      }
    } catch (error) {
      console.error('Error in fetchSupplierProfile:', error)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signUp = async (email, password, supplierFormData) => {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'supplier'
        }
      }
    })

    if (authError) throw authError

    // Then create the supplier profile with JSONB structure
    if (authData.user) {
      // Generate a unique ID for the supplier
      const supplierId = `${supplierFormData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
      
      // Create JSONB data structure matching your existing format
      const supplierData = {
        id: supplierId,
        name: supplierFormData.businessName,
        owner: {
          name: supplierFormData.yourName,
          email: email,
          phone: supplierFormData.phone
        },
        category: supplierFormData.supplierType,
        serviceType: supplierFormData.supplierType,
        subcategory: supplierFormData.supplierType,
        location: supplierFormData.postcode,
        status: 'pending', // Add status to JSONB
        rating: 0,
        reviewCount: 0,
        bookingCount: 0,
        themes: [],
        badges: [],
        packages: [],
        busyDates: [],
        unavailableDates: [],
        portfolioImages: [],
        portfolioVideos: [],
        createdAt: new Date().toISOString(),
        priceFrom: 0,
        priceUnit: 'per event',
        availability: 'Contact for availability',
        maxBookingDays: 365,
        advanceBookingDays: 0,
        description: '',
        businessDescription: '',
        availabilityNotes: '',
        workingHours: {
          Monday: { start: '09:00', end: '17:00', active: false },
          Tuesday: { start: '09:00', end: '17:00', active: false },
          Wednesday: { start: '09:00', end: '17:00', active: false },
          Thursday: { start: '09:00', end: '17:00', active: false },
          Friday: { start: '09:00', end: '17:00', active: false },
          Saturday: { start: '10:00', end: '16:00', active: false },
          Sunday: { start: '10:00', end: '16:00', active: false }
        },
        serviceDetails: {
          aboutService: '',
          serviceHighlights: '',
          personalBio: {
            yearsExperience: 0,
            personalStory: '',
            inspiration: '',
            favoriteEvent: '',
            dreamCelebrity: '',
            funFacts: []
          },
          pricingInfo: {
            basePrice: 0,
            pricingModel: 'per-hour',
            whatIncluded: [],
            priceDescription: ''
          },
          requirements: {
            powerNeeded: false,
            indoorOutdoor: [],
            spaceRequired: '',
            specialRequirements: ''
          },
          certifications: {
            dbsCertificate: false,
            firstAid: false,
            publicLiability: false,
            otherCerts: []
          },
          durationOptions: {
            minHours: 1,
            maxHours: 4,
            availableOptions: ['1 hour', '2 hours', '3 hours', '4 hours']
          },
          serviceIncludes: {
            teamSize: 1,
            ageGroups: [],
            equipment: '',
            travelRadius: '',
            teamDescription: '',
            performerGenders: [],
            performanceOptions: [],
            actType: ''
          },
          serviceStandards: {
            setupTime: 30,
            cleanupIncluded: false,
            setupDescription: '',
            equipmentProvided: true
          },
          venueDetails: {
            venueType: '',
            capacity: '',
            facilities: [],
            accessibility: ''
          }
        }
      }

      const { data: supplierProfile, error: supplierError } = await supabase
        .from('suppliers')
        .insert([
          {
            auth_user_id: authData.user.id,
            data: supplierData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (supplierError) {
        // If supplier creation fails, clean up the auth user
        await supabase.auth.signOut()
        throw supplierError
      }

      setSupplier(supplierProfile)
      return { user: authData.user, supplier: supplierProfile }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    setUser(null)
    setSupplier(null)
    router.push('/suppliers/signin')
  }

  const updateSupplierProfile = async (updates) => {
    if (!supplier) return

    // Merge updates into existing JSONB data
    const updatedData = {
      ...supplier.data,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update({ 
        data: updatedData,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', user.id)
      .select()
      .single()

    if (error) throw error
    
    setSupplier(data)
    return data
  }

  const value = {
    user,
    supplier,
    loading,
    signIn,
    signUp,
    signOut,
    updateSupplierProfile,
    fetchSupplierProfile
  }

  return (
    <SupplierAuthContext.Provider value={value}>
      {children}
    </SupplierAuthContext.Provider>
  )
}