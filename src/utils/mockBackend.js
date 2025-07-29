// utils/mockBackend.js
// Clean version with proper async handling

import { supabase } from '@/lib/supabase'
import { create } from 'canvas-confetti';
import { useState, useEffect } from 'react';

const generateBusinessSlug = (businessName) => {
  const baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const timestamp = Date.now().toString().slice(-6)
  return `${baseSlug}-${timestamp}`
}

// Helper function for themes (keep your existing logic)
const getThemesFromServiceType = (serviceType) => {
  const themeMapping = {
    'magician': ['magic', 'superhero', 'general'],
    'clown': ['circus', 'comedy', 'general'],
    'entertainer': ['general', 'superhero', 'princess'],
    'dj': ['music', 'dance', 'general'],
    'musician': ['music', 'taylor-swift', 'general'],
    'face-painting': ['general', 'superhero', 'princess'],
    'decorations': ['general'],
    'venue': ['general'],
    'catering': ['general']
  }
  return themeMapping[serviceType] || ['general']
}

const createThemedBusiness = async (primaryBusinessId, themedBusinessData) => {
  try {
    console.log('🎭 Creating themed business for parent:', primaryBusinessId)

    const generateBusinessSlug = (businessName) => {
      const baseSlug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      const timestamp = Date.now().toString().slice(-6)
      return `${baseSlug}-${timestamp}`
    }

    // Get the primary business to inherit data
    const { data: primaryBusiness, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', primaryBusinessId)
      .single()

    if (fetchError) throw fetchError

    const inheritedData = primaryBusiness.data
    const businessSlug = generateBusinessSlug(themedBusinessData.name)

    // Create themed business data (inherits from primary)
const themedData = {
  // ✅ INHERITED SETTINGS (Shared across businesses)
  workingHours: inheritedData.workingHours,
  unavailableDates: inheritedData.unavailableDates,
  busyDates: inheritedData.busyDates,
  availabilityNotes: inheritedData.availabilityNotes,
  advanceBookingDays: inheritedData.advanceBookingDays,
  maxBookingDays: inheritedData.maxBookingDays,
  packages: inheritedData.packages,
  addOnServices: inheritedData.addOnServices || [],
  serviceDetails: {
    ...inheritedData.serviceDetails,
    // Keep most service details but allow theme-specific overrides
    performerType: inheritedData.serviceDetails?.performerType,
    ageGroups: inheritedData.serviceDetails?.ageGroups,
    equipment: inheritedData.serviceDetails?.equipment,
    travelRadius: inheritedData.serviceDetails?.travelRadius,
  },
  owner: inheritedData.owner, // Contact info stays the same
  location: inheritedData.location, // Service area
  
  // ✅ BUSINESS-SPECIFIC (Unique per business)
  name: themedBusinessData.name,
  description: themedBusinessData.description || `Professional ${themedBusinessData.serviceType} services specializing in ${themedBusinessData.theme} themes.`,
  serviceType: themedBusinessData.serviceType,
  themes: [themedBusinessData.theme],
  
  // Reset business-specific content
  coverPhoto: null, // Each business gets its own cover photo
  image: null,
  portfolioImages: [], // Each business gets its own portfolio
  portfolioVideos: [],
  
  // Reset metrics
  rating: 0,
  reviewCount: 0,
  bookingCount: 0,
  isComplete: false,
  
  // Timestamps
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

    // Insert themed business
    const { data: newThemedBusiness, error: insertError } = await supabase
      .from('suppliers')
      .insert({
        auth_user_id: primaryBusiness.auth_user_id,
        business_name: themedBusinessData.name,
        business_type: 'themed',
        is_primary: false,
        parent_business_id: primaryBusinessId,
        created_from_theme: themedBusinessData.theme,
        business_slug: businessSlug,
        data: themedData
      })
      .select()
      .single()

    if (insertError) throw insertError

    console.log('✅ Themed business created:', newThemedBusiness.id)

    return {
      success: true,
      business: newThemedBusiness,
      message: 'Themed business created successfully'
    }

  } catch (error) {
    console.error('❌ Error creating themed business:', error)
    return {
      success: false,
      error: error.message || 'Failed to create themed business'
    }
  }
}


// Get all suppliers from Supabase
// const getAllSuppliers = async () => {
//   try {
//     console.log('🔍 Fetching suppliers from Supabase...')
    
//     const { data, error } = await supabase
//       .from('suppliers')
//       .select('*')
//       .order('created_at', { ascending: false })
    
//     if (error) {
//       console.error('Supabase error:', error)
//       throw error
//     }
    
//     if (!data || data.length === 0) {
//       console.warn('No suppliers found in Supabase, returning empty array')
//       return []
//     }
    
//     // Transform the data from Supabase format to your existing format
//     const transformedSuppliers = data.map(supplier => {
//       try {
//         return {
//           ...supplier.data, // Spread the JSON data which contains all your original supplier fields
//           id: supplier.legacy_id || supplier.id // Use legacy_id for consistency
//         }
//       } catch (transformError) {
//         console.error('Error transforming supplier:', supplier.id, transformError)
//         return null
//       }
//     }).filter(Boolean) // Remove any null entries
    
//     console.log(`✅ Successfully loaded ${transformedSuppliers.length} suppliers from Supabase`)
//     return transformedSuppliers
    
//   } catch (error) {
//     console.error('💥 Error loading suppliers from Supabase:', error)
    
//     // Return empty array instead of mock data to avoid confusion
//     console.warn('Returning empty array due to Supabase error')
//     return []
//   }
// }
const getAllSuppliers = async () => {
  try {

    
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        id,
        business_name,
        business_type,
        is_primary,
        business_slug,
        data,
        created_at
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    if (!data || data.length === 0) {
      console.warn('No suppliers found in Supabase, returning empty array')
      return []
    }
    
    // Transform the data from Supabase format to your existing format
    const transformedSuppliers = data.map(supplier => {
      try {
        return {
          ...supplier.data, // Spread the JSON data which contains all your original supplier fields
          id: supplier.id, // Use the real UUID (not legacy_id anymore)
          businessSlug: supplier.business_slug, // Add business slug for URLs
          isPrimary: supplier.is_primary, // Add primary business flag
          businessType: supplier.business_type // Add business type
        }
      } catch (transformError) {
        console.error('Error transforming supplier:', supplier.id, transformError)
        return null
      }
    }).filter(Boolean) // Remove any null entries
    
   
    return transformedSuppliers
    
  } catch (error) {
    console.error('💥 Error loading suppliers from Supabase:', error)
    console.warn('Returning empty array due to Supabase error')
    return []
  }
}


function isValidUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)
}
// API functions
export const suppliersAPI = {
  createThemedBusiness,
  // Get all suppliers
  getAllSuppliers: async () => {
    await new Promise(resolve => setTimeout(resolve, 600)) // Keep UX delay
    return await getAllSuppliers()
  },

  getSupplierById: async (id) => {
    try {
      let query
      if (isValidUUID(id)) {
        query = supabase.from('suppliers').select('*').eq('id', id).limit(1)
      } else {
        query = supabase.from('suppliers').select('*').eq('legacy_id', id).limit(1)
      }

      const { data, error } = await query

      if (error) {
        console.error("❌ Supabase error:", error)
        return null
      }

      if (!data || data.length === 0) {
        console.warn(`⚠️ No supplier found with id or legacy_id: ${id}`)
        return null
      }

      return {
        id: data[0].id,
        legacyId: data[0].legacy_id,
        ...data[0].data ?? data[0], // Adjust for your schema
      }
    } catch (err) {
      console.error("💥 Exception in getSupplierById:", err)
      return null
    }
  },
  
  
  // Theme filtering functions
  getEntertainmentByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const allSuppliers = await getAllSuppliers()
      
      const entertainmentSuppliers = allSuppliers.filter(supplier => {
        const isEntertainment = supplier.category === 'Entertainment' || 
                               supplier.serviceType === 'entertainer' ||
                               supplier.serviceType === 'magician' ||
                               supplier.serviceType === 'clown' ||
                               supplier.serviceType === 'dj' ||
                               supplier.serviceType === 'musician';
        
        if (!isEntertainment) return false;
        
        const matchesTheme = 
          supplier.themes?.includes(theme) ||
          supplier.serviceType === theme ||
          supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
          supplier.description?.toLowerCase().includes(theme.toLowerCase()) ||
          (theme === 'spiderman' && (
            supplier.themes?.includes('superhero') ||
            supplier.name.toLowerCase().includes('spider') ||
            supplier.name.toLowerCase().includes('superhero')
          )) ||
          (theme === 'princess' && (
            supplier.themes?.includes('princess') ||
            supplier.themes?.includes('fairy') ||
            supplier.name.toLowerCase().includes('princess')
          )) ||
          (theme === 'taylor-swift' && (
            supplier.serviceType === 'musician' ||
            supplier.serviceType === 'dj' ||
            supplier.themes?.includes('music')
          )) ||
          (theme === 'pokemon' && (
            supplier.serviceType === 'pokemon' ||
            supplier.themes?.includes('pokemon')
          ));
        
        return matchesTheme;
      });
      
      return entertainmentSuppliers;
      
    } catch (error) {
      console.error('Error getting entertainment by theme:', error);
      return [];
    }
  },

  getVenuesByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const allSuppliers = await getAllSuppliers()
      
      const venueSuppliers = allSuppliers.filter(supplier => {
        const isVenue = supplier.category === 'Venues' || 
                       supplier.serviceType === 'venue';
        
        if (!isVenue) return false;
        
        const matchesTheme = supplier.themes?.includes(theme) ||
                           supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
                           supplier.description?.toLowerCase().includes(theme.toLowerCase());
        
        return matchesTheme;
      });
      
      console.log(`🏢 Found ${venueSuppliers.length} venues for theme: ${theme}`);
      return venueSuppliers;
      
    } catch (error) {
      console.error('Error getting venues by theme:', error);
      return [];
    }
  },

  getCateringByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const allSuppliers = await getAllSuppliers()
      
      const cateringSuppliers = allSuppliers.filter(supplier => {
        const isCatering = supplier.category === 'Catering' || 
                          supplier.serviceType === 'catering';
        
        if (!isCatering) return false;
        
        const matchesTheme = supplier.themes?.includes(theme) ||
                           supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
                           supplier.description?.toLowerCase().includes(theme.toLowerCase());
        
        return matchesTheme;
      });
      
      console.log(`🍰 Found ${cateringSuppliers.length} catering suppliers for theme: ${theme}`);
      return cateringSuppliers;
      
    } catch (error) {
      console.error('Error getting catering by theme:', error);
      return [];
    }
  },

  getSupplierByOwnerEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const allSuppliers = await getAllSuppliers()
      return allSuppliers.find(supplier => supplier.owner?.email === email) || null
    } catch (error) {
      console.error('Error getting supplier by email:', error)
      return null
    }
  },

  addSupplierFromOnboarding: async (formData, authUserId = null) => {
    try {
      console.log('🚀 Creating PRIMARY business for new supplier:', formData)
  
      // Helper function for themes (keep your existing logic)
      const getThemesFromServiceType = (serviceType) => {
        const themeMapping = {
          'magician': ['magic', 'superhero', 'general'],
          'clown': ['circus', 'comedy', 'general'],
          'entertainer': ['general', 'superhero', 'princess'],
          'dj': ['music', 'dance', 'general'],
          'musician': ['music', 'taylor-swift', 'general'],
          'face-painting': ['general', 'superhero', 'princess'],
          'decorations': ['general'],
          'venue': ['general'],
          'catering': ['general']
        }
        return themeMapping[serviceType] || ['general']
      }
  
      // Helper function for business slug
      const generateBusinessSlug = (businessName) => {
        const baseSlug = businessName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        const timestamp = Date.now().toString().slice(-6)
        return `${baseSlug}-${timestamp}`
      }
  
      // Get current authenticated user
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
  
      const userId = authUser?.user?.id
      if (!userId) throw new Error("No authenticated user")
  
      // Create business slug
      const businessSlug = generateBusinessSlug(formData.businessName || formData.name)
  
      // Create the supplier data (EXACTLY the same format as before)
      const supplierData = {
        name: formData.businessName || formData.name,
        owner: {
          name: formData.yourName || formData.ownerName,
          email: formData.email,
          phone: formData.phone
        },
        category: formData.supplierType || formData.serviceType,
        subcategory: formData.supplierType || formData.serviceType,
        serviceType: formData.supplierType || formData.serviceType,
        image: "/placeholder.svg?height=300&width=400&text=" + encodeURIComponent(formData.businessName || formData.name),
        rating: 0,
        reviewCount: 0,
        bookingCount: 0,
        location: formData.postcode || "Location TBD",
        priceFrom: 0,
        priceUnit: "per event",
        description: "New supplier - profile setup in progress",
        badges: ["New Provider"],
        availability: "Contact for availability",
        themes: getThemesFromServiceType(formData.supplierType || formData.serviceType),
        businessDescription: "",
        packages: [],
        portfolioImages: formData.portfolioImages || [],
        portfolioVideos: formData.portfolioVideos || [],
        isComplete: false,
        createdAt: new Date().toISOString(),
        workingHours: {
          Monday: { active: true, start: "09:00", end: "17:00" },
          Tuesday: { active: true, start: "09:00", end: "17:00" },
          Wednesday: { active: true, start: "09:00", end: "17:00" },
          Thursday: { active: true, start: "09:00", end: "17:00" },
          Friday: { active: true, start: "09:00", end: "17:00" },
          Saturday: { active: true, start: "10:00", end: "16:00" },
          Sunday: { active: false, start: "10:00", end: "16:00" },
        },
        unavailableDates: [],
        busyDates: [],
        availabilityNotes: "",
        advanceBookingDays: 7,
        maxBookingDays: 365
      }
  
      // Insert using NEW multi-business structure
      const { data: newBusiness, error: insertError } = await supabase
        .from("suppliers")
        .insert({
          auth_user_id: userId,
          business_name: supplierData.name,
          business_type: 'primary',
          is_primary: true,
          parent_business_id: null,
          business_slug: businessSlug,
          data: supplierData
        })
        .select()
        .single()
  
      if (insertError) {
        console.error('❌ Supabase insert error:', insertError)
        throw insertError
      }
  
      // Save the real UUID for future queries
      localStorage.setItem('currentSupplierId', newBusiness.id)
  
      console.log('✅ New supplier added to Supabase with id:', newBusiness.id)
  
      return {
        success: true,
        supplier: {
          id: newBusiness.id,         // Supabase UUID
          ...newBusiness.data         // Flattened profile (same format as before)
        }
      }
  
    } catch (error) {
      console.error('💥 Error adding supplier to Supabase:', error)
      return {
        success: false,
        error: error.message || 'Failed to create supplier account'
      }
    }
  }, 
  

 
  // ✅ Update supplier using UUID `id`
  updateSupplierProfile: async (supplierId, updatedData, packages = []) => {
    try {

      const { data: row, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single()

      if (fetchError) throw fetchError

      const current = row.data

      const merged = {
        ...current,
        name: updatedData.name || current.name,
        description: updatedData.businessDescription || current.description,
        description: updatedData.description || current.description,
        location: updatedData.postcode || current.location,
        serviceType: updatedData.serviceType || current.serviceType,
        packages,
        portfolioImages: updatedData.portfolioImages || current.portfolioImages || [],
        portfolioVideos: updatedData.portfolioVideos || current.portfolioVideos || [],
        serviceDetails: updatedData.serviceDetails ? {
  ...current.serviceDetails,
  ...updatedData.serviceDetails,
  // Ensure arrays are properly replaced, not merged
  addOnServices: updatedData.serviceDetails.addOnServices || current.serviceDetails?.addOnServices || [],
  ageGroups: updatedData.serviceDetails.ageGroups || current.serviceDetails?.ageGroups || [],
  themes: updatedData.serviceDetails.themes || current.serviceDetails?.themes || []
} : current.serviceDetails || {},
        coverPhoto: updatedData.coverPhoto ?? current.coverPhoto,
        image: updatedData.coverPhoto ?? current.image,
        workingHours: updatedData.workingHours || current.workingHours,
        unavailableDates: updatedData.unavailableDates || current.unavailableDates || [],
        busyDates: updatedData.busyDates || current.busyDates || [],
        availabilityNotes: updatedData.availabilityNotes || current.availabilityNotes || '',
        advanceBookingDays: updatedData.advanceBookingDays || current.advanceBookingDays || 7,
        maxBookingDays: updatedData.maxBookingDays || current.maxBookingDays || 365,
        priceFrom: packages.length > 0 ? Math.min(...packages.map(p => p.price)) : current.priceFrom || 0,
        priceUnit: packages[0]?.priceType === 'hourly' ? 'per hour' : 'per event',
        isComplete: packages.length > 0 && !!updatedData.businessDescription,
        badges: [
          ...(packages.length > 0 ? ['Packages Available'] : ['New Provider']),
          ...(current.badges || []).filter(b => !['New Provider', 'Packages Available'].includes(b))
        ],
        owner: {
          ...current.owner,
          name: updatedData.contactName || current.owner?.name,
          email: updatedData.email || current.owner?.email,
          phone: updatedData.phone || current.owner?.phone,
          profilePhoto: updatedData.owner?.profilePhoto || current.owner?.profilePhoto,
          firstName: updatedData.owner?.firstName || current.owner?.firstName,
          lastName: updatedData.owner?.lastName || current.owner?.lastName,
          bio: updatedData.owner?.bio || current.owner?.bio,
          dateOfBirth: updatedData.owner?.dateOfBirth || current.owner?.dateOfBirth,
          address: updatedData.owner?.address || current.owner?.address
        },
        updatedAt: new Date().toISOString()
      }
      // In your updateSupplierProfile function, add logging before and after save
      console.log("💾 About to save serviceDetails:", merged.serviceDetails)
      console.log("🎁 AddOns being saved:", merged.serviceDetails?.addOnServices)
      const { data: updated, error: updateError } = await supabase
        .from('suppliers')
        .update({ data: merged })
        .eq('id', supplierId)
        .select()
        .single()

      if (updateError) throw updateError

      console.log("✅ Saved data:", updated.data.serviceDetails)
      console.log("🎁 AddOns after save:", updated.data.serviceDetails?.addOnServices)

      return {
        success: true,
        supplier: updated
      }



    } catch (error) {
      console.error('💥 Error updating supplier in Supabase:', error)
      return {
        success: false,
        error: error.message || 'Failed to update supplier profile'
      }
    }
  },

}

// Hooks that your components use
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await suppliersAPI.getAllSuppliers()
      setSuppliers(data)

    } catch (err) {
      setError(err.message)
      console.error('useSuppliers error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  return {
    suppliers,
    loading,
    error,
    refetch: loadSuppliers
  }
}

export function useSupplier(supplierId) {
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSupplier = async () => {
    if (!supplierId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
  
      const data = await suppliersAPI.getSupplierById(supplierId)
      setSupplier(data)
 
    } catch (err) {
      setError(err.message)
      console.error('useSupplier error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSupplier()
  }, [supplierId])

  return {
    supplier,
    loading,
    error,
    refetch: loadSupplier
  }
}


export function useSupplierDashboard() {
  const [currentSupplier, setCurrentSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCurrentSupplier = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('📥 useSupplierDashboard loading current supplier...')
        
        // Get current authenticated user
        const { data: userResult, error: userErr } = await supabase.auth.getUser()
        if (userErr) {
          console.error('❌ Auth error:', userErr)
          throw userErr
        }

        const userId = userResult?.user?.id
        if (!userId) {
          console.error('❌ No user ID found')
          throw new Error("No logged-in user")
        }

        console.log('👤 User ID:', userId)

        // Load user's PRIMARY business (for dashboard compatibility)
        const { data: primaryBusiness, error: primaryErr } = await supabase
          .from("suppliers")
          .select(`
            id,
            business_name,
            business_type,
            is_primary,
            data,
            auth_user_id
          `)
          .eq("auth_user_id", userId)
          .eq("is_primary", true)
          .maybeSingle()

        if (primaryErr) {
          console.error('❌ Database error:', primaryErr)
          throw primaryErr
        }

        console.log('🔍 Primary business query result:', primaryBusiness)

        if (!primaryBusiness) {
          console.log('❌ No primary business found for user')
          setError('No supplier account found - please complete onboarding first')
          setCurrentSupplier(null)
        } else {
          // ✅ Enhanced validation and logging
          console.log('📊 Primary business raw data:', {
            id: primaryBusiness.id,
            business_name: primaryBusiness.business_name,
            has_data: !!primaryBusiness.data,
            data_keys: primaryBusiness.data ? Object.keys(primaryBusiness.data) : 'No data object'
          })

          // Check if the data object exists and has essential fields
          if (!primaryBusiness.data) {
            console.warn('⚠️ Primary business has no data object')
            setError('Incomplete supplier account - please complete setup')
            setCurrentSupplier(null)
            return
          }

          // Convert NEW database format to OLD dashboard format
          const supplierForDashboard = {
            id: primaryBusiness.id, // Use the real UUID
            ...primaryBusiness.data // Spread all the business data
          }
          
          console.log('✅ Supplier for dashboard:', {
            id: supplierForDashboard.id,
            name: supplierForDashboard.name,
            owner: supplierForDashboard.owner,
            serviceType: supplierForDashboard.serviceType
          })
          
          setCurrentSupplier(supplierForDashboard)
          console.log('✅ Loaded primary business for dashboard:', supplierForDashboard.name)
        }
      } catch (err) {
        console.error('❌ Error loading current supplier:', err)
        setError(err.message || 'Failed to load supplier data')
        setCurrentSupplier(null)
      } finally {
        setLoading(false)
      }
    }

    loadCurrentSupplier()
  }, [])

  // Function to update the supplier profile - UPDATED for new structure
  const updateProfile = async (profileData, packages = [], specificBusinessId = null) => {
    if (!currentSupplier) {
      console.warn("⚠️ No currentSupplier in updateProfile")
      return { success: false, error: 'No current supplier loaded' }
    }

    setSaving(true)
    setError(null)

    try {
      // ✅ Use the specific business ID if provided, otherwise use current supplier ID
      const businessIdToUpdate = specificBusinessId || currentSupplier.id;

   
console.log('🎯 updateProfile targeting business ID:', businessIdToUpdate)
console.log('🎯 specificBusinessId param:', specificBusinessId)
console.log('🎯 currentSupplier.id fallback:', currentSupplier.id)


      // Use the UPDATED updateSupplierProfile function
      const result = await suppliersAPI.updateSupplierProfile(
        businessIdToUpdate,
        profileData,
        packages
      )

      console.log('📦 updateSupplierProfile result:', result)

      if (result.success && result.supplier) {
        // Convert updated supplier back to dashboard format
        const updatedSupplierForDashboard = {
          id: result.supplier.id,
          ...result.supplier.data
        }
        setCurrentSupplier(updatedSupplierForDashboard)
        console.log('🎉 Supplier profile updated successfully for business ID:', businessIdToUpdate)
      }

      return result
    } catch (error) {
      console.error("❌ updateProfile error:", error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }

  return {
    currentSupplier,
    loading,
    saving,
    error,
    updateProfile
  }
}