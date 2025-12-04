// utils/partyDatabaseBackend.js
// Database backend to replace localStorage party management

// Import client supabase (always available)
import { supabase as supabaseClient } from '@/lib/supabase'
import { getEnhancedGiftSuggestions } from './rapidAPIProducts'

// Dynamic function to get the appropriate Supabase client
// Server-side: Use admin client (service role) for full access
// Client-side: Use regular client (anon key) with RLS
function getSupabase() {
  if (typeof window === 'undefined') {
    // Server-side: dynamically import admin client
    try {
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      return supabaseAdmin
    } catch (error) {
      console.warn('⚠️ Admin client not available, falling back to regular client:', error.message)
      return supabaseClient
    }
  }
  // Client-side: use regular client
  return supabaseClient
}

// Get the appropriate client
const supabase = getSupabase()

class PartyDatabaseBackend {

  isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  /**
   * Create or get user profile
   */
  async createOrGetUser(userData) {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      
      const userId = authUser?.user?.id
      if (!userId) throw new Error("No authenticated user")
  
      // Check if user profile exists for THIS auth user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)  // Filter by current user's ID
        .maybeSingle()
  
      if (fetchError) throw fetchError
  
      if (existingUser) {

        
        // Update the existing profile with any new data
        const updateData = {
          email: userData.email || authUser.user.email,

          first_name: userData.firstName || existingUser.first_name,
          last_name: userData.lastName || existingUser.last_name,
          phone: userData.phone || existingUser.phone,
          postcode: userData.postcode || existingUser.postcode,
           // NEW: Address fields
        address_line_1: userData.addressLine1 || existingUser.address_line_1,
        address_line_2: userData.addressLine2 || existingUser.address_line_2,
        city: userData.city || existingUser.city,
        child_photo: userData.child_photo || existingUser.child_photo, // Changed from childPhoto to child_photo
          updated_at: new Date().toISOString()
        }
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id)
          .select()
          .single()
        
        if (updateError) throw updateError
        

        return { success: true, user: updatedUser }
      }
  
      // Create new user profile
      const newUserData = {
        auth_user_id: userId,  // Link to current auth user
        email: userData.email || authUser.user.email,
        first_name: userData.firstName || 'User',
        last_name: userData.lastName || '',
        phone: userData.phone || '',
        postcode: userData.postcode || '',
           
      // NEW: Address fields for new users
      address_line_1: userData.addressLine1 || '',
      address_line_2: userData.addressLine2 || '',
      city: userData.city || '',
      child_photo: userData.child_photo || null, // Changed from childPhoto to child_photo
      }
      

  
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single()
  
      if (createError) throw createError
  

      return { success: true, user: newUser }
  
    } catch (error) {
      console.error('❌ Error creating/getting user:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      // Auth session missing is expected when user isn't logged in - not an error
      if (authError) {
        if (authError.name === 'AuthSessionMissingError') {
          return { success: false, error: 'No authenticated user' }
        }
        throw authError
      }
      
      const userId = authUser?.user?.id
      if (!userId) return { success: false, error: 'No authenticated user' }
  

  
      // FIXED: Properly filter by auth_user_id
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)  // This is the key fix
        .maybeSingle()  // Use maybeSingle() to handle no results gracefully
  
      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }
  
      if (!user) {

        return { success: false, error: 'No customer profile found' }
      }
  

      return { success: true, user }
      
    } catch (error) {
      console.error('❌ Error getting current user:', error)
      return { success: false, error: error.message }
    }
  }

  async getPartyById(partyId) {
    try {

      
      const { data: party, error } = await supabase
        .from('parties')
        .select('*')
        .eq('id', partyId)
        .single();
  
      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Party not found' };
        }
        throw error;
      }
  
      
      return { success: true, party };
  
    } catch (error) {
      console.error('❌ Error getting party by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // ================== PARTY MANAGEMENT ==================

  /**
   * Create a new party from party builder form
   */

  async createParty(partyDetails, partyPlan = {}) {
    try {
      const userResult = await this.getCurrentUser()
      if (!userResult.success) {
        throw new Error('User not found. Please sign in first.')
      }

      const party = {
        user_id: userResult.user.id,
        child_name: partyDetails.childName,
        child_age: partyDetails.childAge,
        party_date: partyDetails.date,
        party_time: partyDetails.time,
        start_time: partyDetails.startTime, 
        end_time: partyDetails.endTime,
        guest_count: partyDetails.guestCount,
        location: partyDetails.location,
        postcode: partyDetails.postcode,
        child_photo: partyDetails.childPhoto, 
        
        // NEW: Delivery address fields
        delivery_address_line_1: partyDetails.deliveryAddressLine1,
        delivery_address_line_2: partyDetails.deliveryAddressLine2,
        delivery_city: partyDetails.deliveryCity,
        delivery_postcode: partyDetails.deliveryPostcode,
        full_delivery_address: partyDetails.fullDeliveryAddress,
        
        // NEW: Contact information
        parent_name: partyDetails.parentName,
        parent_email: partyDetails.parentEmail,
        parent_phone: partyDetails.parentPhone,
        
        // NEW: Requirements
        dietary_requirements: JSON.stringify(partyDetails.dietaryRequirements || {}),
        accessibility_requirements: JSON.stringify(partyDetails.accessibilityRequirements || {}),
        dietary_requirements_array: partyDetails.dietaryRequirementsArray || [],
        accessibility_requirements_array: partyDetails.accessibilityRequirementsArray || [],
        has_dietary_requirements: partyDetails.hasDietaryRequirements || false,
        has_accessibility_requirements: partyDetails.hasAccessibilityRequirements || false,
        
        theme: partyDetails.theme,
        budget: partyDetails.budget,
        special_requirements: partyDetails.specialRequirements,
        party_plan: partyPlan,
        estimated_cost: this.calculatePartyPlanCost(partyPlan),

        // Terms and marketing preferences
        terms_accepted: partyDetails.termsAccepted || false,
        terms_accepted_at: partyDetails.termsAcceptedAt || null,
        marketing_consent: partyDetails.marketingConsent || false,

        // NEW: Additional metadata
        submitted_at: partyDetails.submittedAt || new Date().toISOString(),
        status: partyDetails.status || 'draft'
      }

  

      const { data: newParty, error } = await supabase
        .from('parties')
        .insert(party)
        .select()
        .single()

      if (error) throw error

      return { success: true, party: newParty }

    } catch (error) {
      console.error('❌ Error creating party:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get user's current party (most recent draft/planned party)
   */
  async getCurrentParty() {
    try {
      const userResult = await this.getCurrentUser()
      if (!userResult.success) {
        throw new Error('User not found')
      }

      const { data: party, error } = await supabase
        .from('parties')
        .select('*')
        .eq('user_id', userResult.user.id)
        .in('status', ['planned'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      return { success: true, party }

    } catch (error) {
      console.error('❌ Error getting current party:', error)
      return { success: false, error: error.message }
    }
  }/**
 * Get user's confirmed parties (planned status only)
 */
async getUserPlannedParties() {
  try {
    const userResult = await this.getCurrentUser()
    if (!userResult.success) {
      throw new Error('User not found')
    }

    const { data: parties, error } = await supabase
      .from('parties')
      .select('*')
      .eq('user_id', userResult.user.id)
      .eq('status', 'planned')  // Only confirmed parties
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, parties: parties || [] }

  } catch (error) {
    console.error('Error getting planned parties:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get ALL user's active parties (draft, planned, confirmed)
 * Excludes cancelled and completed parties
 */
async getAllUserParties() {
  try {
    const userResult = await this.getCurrentUser()
    if (!userResult.success) {
      return { success: false, error: 'User not authenticated', parties: [] }
    }

    const { data: parties, error } = await supabase
      .from('parties')
      .select('*')
      .eq('user_id', userResult.user.id)
      .not('status', 'in', '(cancelled,completed)')  // Exclude cancelled/completed
      .order('party_date', { ascending: true })  // Order by party date (soonest first)

    if (error) throw error

    return { success: true, parties: parties || [] }

  } catch (error) {
    console.error('❌ Error getting all user parties:', error)
    return { success: false, error: error.message, parties: [] }
  }
}

/**
 * Get a specific party by ID
 * Verifies that the party belongs to the current user
 */
async getPartyById(partyId) {
  try {
    const userResult = await this.getCurrentUser()
    if (!userResult.success) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: party, error } = await supabase
      .from('parties')
      .select('*')
      .eq('id', partyId)
      .eq('user_id', userResult.user.id) // Security: ensure party belongs to user
      .single()

    if (error) {
      console.error('❌ Error getting party by ID:', error)
      return { success: false, error: error.message }
    }

    return { success: true, party }

  } catch (error) {
    console.error('❌ Error getting party by ID:', error)
    return { success: false, error: error.message }
  }
}
// Add this new function to partyDatabaseBackend.js
async getActivePlannedParty() {
  try {
    // ✅ FIX: Add better error handling for auth state
    const userResult = await this.getCurrentUser()
    
    if (!userResult.success) {
      // Return gracefully for unauthenticated users
      return { success: false, data: null, reason: 'unauthenticated' }
    }

    const { data: party, error } = await supabase
      .from('parties')
      .select('*')
      .eq('user_id', userResult.data.id)
      .eq('status', 'planned')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No party found
        return { success: true, data: null }
      }
      throw error
    }

    return { success: true, data: party }
  } catch (error) {
    console.error('Error getting active party:', error)
    return { success: false, error: error.message }
  }
}




  /**
   * Update party plan (replaces localStorage party plan updates)
   */
  async updatePartyPlan(partyId, partyPlan) {
    try {
      const estimatedCost = this.calculatePartyPlanCost(partyPlan)

      const { data: updatedParty, error } = await supabase
        .from('parties')
        .update({
          party_plan: partyPlan,
          estimated_cost: estimatedCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', partyId)
        .select()
        .single()

      if (error) throw error


      return { success: true, party: updatedParty }

    } catch (error) {
      console.error('❌ Error updating party plan:', error)
      return { success: false, error: error.message }
    }
  }

  async updatePartyPaymentStatus(partyId, paymentData) {
    try {
      // Only update fields that exist in your database schema
      const updateFields = {
        payment_status: paymentData.payment_status,
        updated_at: new Date().toISOString()
      }

      // Add optional fields only if they exist in your schema
      if (paymentData.payment_intent_id) {
        updateFields.payment_intent_id = paymentData.payment_intent_id
      }
      if (paymentData.deposit_amount) {
        updateFields.deposit_amount = paymentData.deposit_amount
      }

      const { data: updatedParty, error } = await supabase
        .from('parties')
        .update(updateFields)
        .eq('id', partyId)
        .select()
        .single()

      if (error) throw error

 
      return { success: true, party: updatedParty }

    } catch (error) {
      console.error('❌ Error updating party payment status:', error)
      return { success: false, error: error.message }
    }
  }

  // Add this to your partyDatabaseBackend
async updateEnquiriesPaymentStatus(partyId, includedSuppliers) {
  try {
    // ✅ FIX: Filter out einvites from suppliers to update
    const validSuppliers = includedSuppliers.filter(cat => cat !== 'einvites')

    if (validSuppliers.length === 0) {
      return { success: true, updatedEnquiries: [] }
    }

    // Update enquiries for suppliers that were included in this payment
    const { data: updatedEnquiries, error } = await supabase
      .from('enquiries')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('party_id', partyId)
      .in('supplier_category', validSuppliers)
      .eq('status', 'accepted') // Only update accepted enquiries
      .select()

    if (error) throw error

    return { success: true, updatedEnquiries }

  } catch (error) {
    console.error('❌ Error updating enquiry payment status:', error)
    return { success: false, error: error.message }
  }
}
  /**
   * Add supplier to party plan
   */

// In partyDatabaseBackend.js - Ensure createEnquiry creates accepted status:
async createEnquiry(partyId, supplier, packageData, message = '', specialRequests = '') {
  try {
 
    
    const enquiryData = {
      party_id: partyId,
      supplier_id: supplier.id,
      supplier_category: this.mapCategoryToSupplierType(supplier.category),
      package_id: packageData.id,
      quoted_price: packageData.totalPrice || packageData.price,
      message: message,
      special_requests: specialRequests,
      
      // ✅ CRITICAL: Create as accepted for immediate booking
      status: 'accepted',
      auto_accepted: true,
      payment_status: 'unpaid',
      
      supplier_response_date: new Date().toISOString(),
      supplier_response: 'Auto-confirmed for immediate booking - ready for deposit payment',
      
      addon_details: packageData.addons ? JSON.stringify(packageData.addons) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }



    const { data: enquiry, error } = await supabase
      .from('enquiries')
      .insert(enquiryData)
      .select()
      .single()

    if (error) throw error

  
    
    return { success: true, enquiry }

  } catch (error) {
    console.error('❌ Error creating enquiry:', error)
    return { success: false, error: error.message }
  }
}
  // async addSupplierToParty(partyId, supplier, selectedPackage = null) {
  //  // ✅ DEFENSIVE: Ensure category exists and is valid
  //  if (!supplier.category) {
  //   console.error('❌ No category provided for supplier:', supplier)
  //   throw new Error(`Supplier category is required but missing for ${supplier.name}`)
  // }
  
  
  
  //   try {
  //     // Get current party
  //     const { data: party, error: fetchError } = await supabase
  //       .from('parties')
  //       .select('party_plan')
  //       .eq('id', partyId)
  //       .single()
  
  //     if (fetchError) throw fetchError
  
  //     const currentPlan = party.party_plan || {}
      
  //     // Determine supplier category
  //     const supplierType = this.mapCategoryToSupplierType(supplier.category)
      
  //     if (!supplierType) {
  //       throw new Error(`Unknown supplier category: ${supplier.category}`)
  //     }
  
  //        // ✅ PRESERVE: Category in supplier data
  //   const supplierData = {
  //     id: supplier.id,
  //     name: supplier.name,
  //     description: supplier.description,
  //     price: selectedPackage ? selectedPackage.price : supplier.priceFrom,
  //     status: "pending",
  //     image: supplier.image,
  //     category: supplier.category, // ✅ Explicitly preserve category
  //     priceUnit: selectedPackage ? selectedPackage.duration : supplier.priceUnit,
  //     addedAt: new Date().toISOString(),
  //     packageId: selectedPackage?.id || null,
  //     originalSupplier: {
  //       ...supplier,
  //       category: supplier.category // ✅ Preserve in original too
  //     }
  //   }
  
  //     // Update the plan
  //     currentPlan[supplierType] = supplierData
  
  //     // Save updated plan
  //     const result = await this.updatePartyPlan(partyId, currentPlan)
      
  //     if (result.success) {
  //       // NEW: Also create an enquiry for this supplier
  //       const enquiryResult = await this.createEnquiry(partyId, {
  //         supplier_id: supplier.id,
  //         supplier_category: supplierType,
  //         status: 'pending',
  //         payment_status: 'unpaid',
  //         quoted_price: selectedPackage ? selectedPackage.price : supplier.priceFrom,
  //         package_id: selectedPackage?.id || 'basic'
  //       })
  
  //       if (!enquiryResult.success) {
  //         console.error('⚠️ Failed to create enquiry:', enquiryResult.error)
  //       }
  
  //       return { 
  //         success: true, 
  //         supplierType,
  //         supplier: supplierData,
  //         party: result.party,
  //         enquiry: enquiryResult.enquiry
  //       }
  //     } else {
  //       throw new Error(result.error)
  //     }
  
  //   } catch (error) {
  //     console.error('❌ Error adding supplier to party:', error)
  //     return { success: false, error: error.message }
  //   }
  // }
// Enhanced addSupplierToParty function to handle cake customization
async addSupplierToParty(partyId, supplier, selectedPackage = null) {
  // ✅ DEFENSIVE: Ensure category exists and is valid
  if (!supplier.category) {
    console.error('❌ No category provided for supplier:', supplier)
    throw new Error(`Supplier category is required but missing for ${supplier.name}`)
  }
       
  try {
    // Get current party
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single()
       
    if (fetchError) throw fetchError
       
    const currentPlan = party.party_plan || {}
           
    // Determine supplier category
    const supplierType = this.mapCategoryToSupplierType(supplier.category)
           
    if (!supplierType) {
      throw new Error(`Unknown supplier category: ${supplier.category}`)
    }

    // ✅ ENHANCED: Extract cake customization data if present
    const cakeCustomization = selectedPackage?.cakeCustomization || null
    const packageType = selectedPackage?.packageType || 'standard'
    const supplierTypeEnhanced = selectedPackage?.supplierType || 'standard'

    // ✅ NEW: Extract party bags metadata if present
    const isPartyBags = supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')
    const partyBagsMetadata = selectedPackage?.partyBagsMetadata || null
    const partyBagsQuantity = selectedPackage?.partyBagsQuantity || null


    // ✅ ENHANCED: Create supplier data with cake customization and party bags metadata
    const supplierData = {
      id: supplier.id,
      name: supplier.name,
      description: supplier.description,
      price: selectedPackage ? selectedPackage.price : supplier.priceFrom,
      status: "accepted",
      image: supplier.image,
      category: supplier.category, // ✅ Explicitly preserve category
      priceUnit: selectedPackage ? selectedPackage.duration : supplier.priceUnit,
      addedAt: new Date().toISOString(),
      packageId: selectedPackage?.id || null,

      // ✅ NEW: Add cake customization data
      packageType: packageType,
      supplierType: supplierTypeEnhanced,
      cakeCustomization: cakeCustomization,

      // ✅ NEW: Add party bags metadata at top level for easy access
      ...(partyBagsMetadata && {
        partyBagsMetadata: partyBagsMetadata,
        partyBagsQuantity: partyBagsQuantity,
      }),

      // ✅ ENHANCED: Package details with customization
      packageData: selectedPackage ? {
        ...selectedPackage,
        // Preserve all cake customization in package data too
        cakeCustomization: cakeCustomization,
        packageType: packageType,
        supplierType: supplierTypeEnhanced
      } : null,

      originalSupplier: {
        ...supplier,
        category: supplier.category // ✅ Preserve in original too
      }
    }

    // ✅ ENHANCED: Add cake-specific display data for dashboard
    if (cakeCustomization) {
      supplierData.displayInfo = {
        flavor: cakeCustomization.flavorName,
        message: cakeCustomization.message,
        childName: cakeCustomization.childName,
        childAge: cakeCustomization.childAge,
        isCakeOrder: true
      }
      
      // Update description to include cake details for dashboard display
      supplierData.description = `${supplierData.description || supplier.name} - ${cakeCustomization.flavorName} flavor cake with personalized message`
      
    
    }
       
    // Update the plan
    currentPlan[supplierType] = supplierData
       
    // Save updated plan
    const result = await this.updatePartyPlan(partyId, currentPlan)

    if (result.success) {
      // ✅ CRITICAL: Also create an enquiry so dashboard shows the supplier
      const enquiryData = {
        party_id: partyId,
        supplier_id: supplier.id,
        supplier_category: supplierType,
        status: 'accepted',
        auto_accepted: true,
        payment_status: 'unpaid', // Will be updated when payment is made
        quoted_price: selectedPackage ? selectedPackage.price : supplier.priceFrom,
        package_id: selectedPackage?.id || null,
        message: 'Added to party',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: enquiry, error: enquiryError } = await supabase
        .from('enquiries')
        .insert(enquiryData)
        .select()
        .single()

      if (enquiryError) {
        console.error('❌ Failed to create enquiry:', enquiryError)
        // Don't fail the whole operation, just log it
      }

      return {
        success: true,
        supplierType,
        supplier: supplierData,
        party: result.party,
        enquiry: enquiry || null,
        cakeCustomization: cakeCustomization // Return cake data for confirmation
      }
    } else {
      throw new Error(result.error)
    }
     
  } catch (error) {
    console.error('❌ Error adding supplier to party:', error)
    return { success: false, error: error.message }
  }
}

// Enhanced sendIndividualEnquiry function to include cake customization in enquiry
async sendIndividualEnquiry(partyId, supplier, selectedPackage = null, customMessage = '') {
  try {
  

    // ✅ EMERGENCY FIX: Add category if missing
    if (!supplier.category) {

      supplier.category = 'Entertainment'

    }
     
    // Get party details for enquiry context
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('id', partyId)
      .single()
             
    if (partyError) {
      console.error('❌ Error fetching party for enquiry:', partyError)
      throw partyError
    }
       
    // Determine supplier category for enquiry
    const supplierCategory = this.mapCategoryToSupplierType(supplier.category)
    if (!supplierCategory) {
      throw new Error(`Cannot map supplier category: ${supplier.category}`)
    }
       
    // Get any existing add-ons that might be relevant
    const partyPlan = party.party_plan || {}
    const allAddons = partyPlan.addons || []
           
    // Filter add-ons that might be relevant to this supplier
    const relevantAddons = allAddons.filter(addon => 
      !addon.supplierId || // General add-ons
      addon.supplierId === supplier.id || 
      addon.supplierName === supplier.name
    )
       

       
    // Calculate quoted price (supplier + package + relevant add-ons)
    const supplierPrice = selectedPackage ? selectedPackage.price : supplier.priceFrom || 0
    const addonsPrice = relevantAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
    const totalQuotedPrice = supplierPrice + addonsPrice

    // ✅ ENHANCED: Build enquiry message with cake customization
    let enquiryMessage = customMessage || `Individual enquiry for ${party.child_name || 'child'}'s ${party.theme || 'themed'} party`
    
    // Add cake customization details to enquiry message
    if (selectedPackage?.cakeCustomization) {
      const cake = selectedPackage.cakeCustomization
      enquiryMessage += `\n\n🎂 CAKE CUSTOMIZATION DETAILS:\n`
      enquiryMessage += `- Flavor: ${cake.flavorName}\n`
      enquiryMessage += `- Message: "${cake.message}"\n`
      enquiryMessage += `- Child: ${cake.childName}, Age ${cake.childAge}\n`
      
 
    }
       
    // ✅ ENHANCED: Create enquiry data with cake customization
    const enquiryData = {
      party_id: partyId,
      supplier_id: supplier.id,
      supplier_category: supplierCategory,
      package_id: selectedPackage?.id || null,
      addon_ids: relevantAddons.length > 0 ? relevantAddons.map(a => a.id) : null,
      addon_details: relevantAddons.length > 0 ? JSON.stringify(relevantAddons) : null,
      message: enquiryMessage,
      special_requests: party.special_requirements || null,
      quoted_price: totalQuotedPrice,
      status: 'pending',
      created_at: new Date().toISOString(),
      
      // ✅ NEW: Add cake customization data to enquiry
      customization_data: selectedPackage?.cakeCustomization ? JSON.stringify({
        type: 'cake',
        details: selectedPackage.cakeCustomization,
        packageType: selectedPackage.packageType,
        supplierType: selectedPackage.supplierType
      }) : null
    }
       
    
       
    // Insert enquiry
    const { data: newEnquiry, error: insertError } = await supabase
      .from('enquiries')
      .insert(enquiryData)
      .select(`
        *,
        suppliers:supplier_id (
          id,
          business_name,
          data
        )
      `)
      .single()
       
    if (insertError) {
      console.error('❌ Error creating individual enquiry:', insertError)
      throw insertError
    }
       
 
       
    return {
      success: true,
      enquiry: newEnquiry,
      message: `Enquiry sent to ${supplier.name}${selectedPackage?.cakeCustomization ? ' with cake customization' : ''}`,
      quotedPrice: totalQuotedPrice,
      cakeCustomization: selectedPackage?.cakeCustomization || null
    }
     
  } catch (error) {
    console.error('❌ Error sending individual enquiry:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
  /**
   * ENHANCED Add addon to party plan
   */
  async addAddonToParty(partyId, addon) {
    try {
      

      // Get current party
      const { data: party, error: fetchError } = await supabase
        .from('parties')
        .select('party_plan')
        .eq('id', partyId)
        .single()

      if (fetchError) throw fetchError

      const currentPlan = party.party_plan || {}
      
      // Initialize addons array if it doesn't exist
      if (!currentPlan.addons) {
        currentPlan.addons = []
      }

      // Check if addon already exists
      const existingAddonIndex = currentPlan.addons.findIndex(existing => existing.id === addon.id)
      
      // Create enhanced addon data
      const addonData = {
        id: addon.id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        originalPrice: addon.originalPrice || null,
        status: "pending",
        image: addon.image,
        category: addon.category,
        duration: addon.duration,
        rating: addon.rating,
        reviewCount: addon.reviewCount,
        popular: addon.popular || false,
        limitedTime: addon.limitedTime || false,
        supplierId: addon.supplierId || null,        // NEW: Link to supplier
        supplierName: addon.supplierName || null,    // NEW: Supplier name
        selectedAddons: addon.selectedAddons || [],  // NEW: Sub-addons from modal
        packageData: addon.packageData || null,      // NEW: Package info
        packageId: addon.packageId || null,
        addedAt: new Date().toISOString(),
        type: 'addon'
      }

      if (existingAddonIndex !== -1) {

        // Update existing addon instead of returning error
        currentPlan.addons[existingAddonIndex] = {
          ...currentPlan.addons[existingAddonIndex],
          ...addonData,
          updatedAt: new Date().toISOString()
        }
      } else {

        // Add to addons array
        currentPlan.addons.push(addonData)
      }

      // Save updated plan
      const result = await this.updatePartyPlan(partyId, currentPlan)
      
      if (result.success) {

        return { 
          success: true, 
          addon: addonData,
          party: result.party 
        }
      } else {
        throw new Error(result.error)
      }

    } catch (error) {
      console.error('❌ Error adding addon to party:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Remove supplier from party plan
   */
  async removeSupplierFromParty(partyId, supplierType) {
    try {
      if (supplierType === 'einvites') {
        return { success: false, error: 'Cannot remove e-invites' }
      }

      // Get current party
      const { data: party, error: fetchError } = await supabase
        .from('parties')
        .select('party_plan')
        .eq('id', partyId)
        .single()

      if (fetchError) throw fetchError

      const currentPlan = party.party_plan || {}
      const removedSupplier = currentPlan[supplierType]
      
      // Remove supplier
      currentPlan[supplierType] = null

      // Save updated plan
      const result = await this.updatePartyPlan(partyId, currentPlan)
      
      if (result.success) {
        return { 
          success: true, 
          removedSupplier,
          party: result.party 
        }
      } else {
        throw new Error(result.error)
      }

    } catch (error) {
      console.error('❌ Error removing supplier from party:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * ENHANCED Remove addon from party plan
   */
  async removeAddonFromParty(partyId, addonId) {
    try {
   

      // Get current party
      const { data: party, error: fetchError } = await supabase
        .from('parties')
        .select('party_plan')
        .eq('id', partyId)
        .single()

      if (fetchError) throw fetchError

      const currentPlan = party.party_plan || {}
      
      if (!currentPlan.addons) {

        return { success: false, error: 'No addons found in party plan' }
      }

      const addonIndex = currentPlan.addons.findIndex(addon => addon.id === addonId)
      
      if (addonIndex === -1) {
  
        return { success: false, error: 'Add-on not found in party plan' }
      }
      

      const removedAddon = currentPlan.addons[addonIndex]
      currentPlan.addons.splice(addonIndex, 1)

      // Save updated plan
      const result = await this.updatePartyPlan(partyId, currentPlan)
      
      if (result.success) {

        return { 
          success: true, 
          removedAddon,
          party: result.party 
        }
      } else {
        throw new Error(result.error)
      }

    } catch (error) {
      console.error('❌ Error removing addon from party:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Helper method to get all addons for a party
   */
  async getAddonsForParty(partyId) {
    try {
      const partyResult = await this.getCurrentParty()
      if (!partyResult.success) {
        return { success: false, error: 'Party not found', addons: [] }
      }
      
      const addons = partyResult.party?.party_plan?.addons || []
      return { success: true, addons }
      
    } catch (error) {
      console.error('Error getting addons for party:', error)
      return { success: false, error: error.message, addons: [] }
    }
  }

  // ================== ENQUIRY MANAGEMENT ==================

  /**
   * Send enquiries to suppliers for a party
   */
  async sendEnquiriesToSuppliers(partyId, message = '', specialRequests = '') {
    try {
      // Get party with plan
      const { data: party, error: fetchError } = await supabase
        .from('parties')
        .select('*')
        .eq('id', partyId)
        .single()

      if (fetchError) throw fetchError

      const partyPlan = party.party_plan || {}

      // ✅ FIX: Get existing enquiries first to avoid duplicates
      const { data: existingEnquiries, error: existingError } = await supabase
        .from('enquiries')
        .select('*')
        .eq('party_id', partyId)

      if (existingError) {
        console.error('❌ Error fetching existing enquiries:', existingError)
      }

      const existingCategories = new Set(
        (existingEnquiries || []).map(e => e.supplier_category)
      )

      const enquiries = []

      // Categories to exclude from enquiries
      const excludeCategories = ['einvites', 'addons']



      // Create enquiries for each supplier in the party plan
      for (const [category, supplierInfo] of Object.entries(partyPlan)) {
        // Skip excluded categories
        if (excludeCategories.includes(category)) {
          continue
        }

        // Skip if enquiry already exists for this category
        if (existingCategories.has(category)) {
          continue
        }

        // Skip if no supplier
        if (!supplierInfo || !supplierInfo.name) {
          continue
        }



        let actualSupplierId = null

        // OPTION 1: If localStorage has a valid UUID, use it
        if (supplierInfo.id && this.isValidUUID(supplierInfo.id)) {
          actualSupplierId = supplierInfo.id
       
        }
        // OPTION 2: Search by business name
        else if (supplierInfo.name) {
          const { data: matchingSuppliers, error: searchError } = await supabase
            .from('suppliers')
            .select('id, data')
            .ilike('data->businessName', `%${supplierInfo.name}%`)
            .limit(1)

          if (searchError) {
            console.error(`❌ Error searching for supplier ${supplierInfo.name}:`, searchError)
            continue
          }

          if (matchingSuppliers && matchingSuppliers.length > 0) {
            actualSupplierId = matchingSuppliers[0].id

          } else {

            continue
          }
        }
        // OPTION 3: Use your business as fallback for testing
        else {
          actualSupplierId = 'e4520e35-b028-405e-a81f-f6d46a43f458'

        }

 

        // Get add-ons for this supplier category or general add-ons
const partyPlan = party.party_plan || {}
const allAddons = partyPlan.addons || []


// Filter add-ons for this supplier (either linked to this supplier or general add-ons)
const categoryAddons = allAddons.filter(addon => 
  addon.supplierId === supplierInfo.id || 
  addon.supplierName === supplierInfo.name ||
  !addon.supplierId || // General add-ons
  addon.supplierId === null
)



       
const enquiryData = {
  party_id: partyId,
  supplier_id: actualSupplierId,
  supplier_category: category,
  package_id: supplierInfo.packageId || null,
  addon_ids: categoryAddons.length > 0 ? categoryAddons.map(a => a.id) : null,
  addon_details: categoryAddons.length > 0 ? JSON.stringify(categoryAddons) : null, // Store full addon details
  message: message || null,
  special_requests: specialRequests || null,
  quoted_price: (supplierInfo.price || 0) + categoryAddons.reduce((sum, addon) => sum + (addon.price || 0), 0),
  status: 'pending'
}


        enquiries.push(enquiryData)
      }



      if (enquiries.length === 0) {
        return { 
          success: false, 
          error: 'No valid suppliers found in party plan to send enquiries to.' 
        }
      }


      const { data: newEnquiries, error: insertError } = await supabase
        .from('enquiries')
        .insert(enquiries)
        .select()

      if (insertError) {
        console.error('❌ Database insert error:', insertError)
        throw insertError
      }

      // Update party status
      await supabase
        .from('parties')
        .update({ status: 'planned' })
        .eq('id', partyId)

  
      
      return { 
        success: true, 
        enquiries: newEnquiries,
        count: newEnquiries.length 
      }

    } catch (error) {
      console.error('❌ Error sending enquiries:', error)
      return { success: false, error: error.message }
    }
  }
  async addSupplierToPartyWithoutEnquiry(partyId, supplier, selectedPackage = null) {
    try {
      // Get current party
      const { data: party, error: fetchError } = await supabase
        .from('parties')
        .select('party_plan')
        .eq('id', partyId)
        .single()
  
      if (fetchError) throw fetchError
  
      const currentPlan = party.party_plan || {}
      
      // Determine supplier category
      const supplierType = this.mapCategoryToSupplierType(supplier.category)
      
      if (!supplierType) {
        throw new Error(`Unknown supplier category: ${supplier.category}`)
      }
  
      // Create supplier data
      const supplierData = {
        id: supplier.id,
        name: supplier.name,
        description: supplier.description,
        price: selectedPackage ? selectedPackage.price : supplier.priceFrom,
        status: "pending",
        image: supplier.image,
        category: supplier.category,
        priceUnit: selectedPackage ? selectedPackage.duration : supplier.priceUnit,
        addedAt: new Date().toISOString(),
        packageId: selectedPackage?.id || null,
        originalSupplier: supplier
      }
  
      // Update the plan
      currentPlan[supplierType] = supplierData
  
      // Save updated plan
      const result = await this.updatePartyPlan(partyId, currentPlan)
      
      if (result.success) {
   
        
        return { 
          success: true, 
          supplierType,
          supplier: supplierData,
          party: result.party,
          enquiry: null // No enquiry created
        }
      } else {
        throw new Error(result.error)
      }
  
    } catch (error) {
      console.error('❌ Error adding supplier to party without enquiry:', error)
      return { success: false, error: error.message }
    }
  }
// Auto-accept all pending enquiries for a party (for immediate booking flow)
// In partyDatabaseBackend.js - UPDATED autoAcceptEnquiries function
// In partyDatabaseBackend.js - FIXED autoAcceptEnquiries function
async autoAcceptEnquiries(partyId, specificSupplierCategories = null) {
  try {
    // ✅ FIX: Filter out einvites if specific categories provided
    let categoriesToUpdate = specificSupplierCategories
    if (categoriesToUpdate && Array.isArray(categoriesToUpdate)) {
      categoriesToUpdate = categoriesToUpdate.filter(cat => cat !== 'einvites')
      if (categoriesToUpdate.length === 0) {
        return { success: true, updatedEnquiries: [] }
      }
    }

    let query = supabase
    .from('enquiries')
    .update({
      status: 'accepted', // Keep as accepted
      auto_accepted: true, // This is the key change needed
      updated_at: new Date().toISOString()
    })
    .eq('party_id', partyId)
    .in('status', ['draft', 'pending', 'accepted']) // Include 'accepted' status
    .eq('auto_accepted', false) // Only update non-auto-accepted enquiries
    .neq('supplier_category', 'einvites') // ✅ EXTRA SAFETY: Never auto-accept einvites

    if (categoriesToUpdate && categoriesToUpdate.length > 0) {
      query = query.in('supplier_category', categoriesToUpdate)
    }

    const { data: updatedEnquiries, error } = await query.select()

    if (error) throw error;

    return { success: true, updatedEnquiries };

  } catch (error) {
    console.error('Error auto-accepting enquiries:', error);
    return { success: false, error: error.message };
  }
}
// In partyDatabaseBackend.js - ADD this new function
async autoAcceptSpecificEnquiry(enquiryId) {
  try {
   
    
    const { data: updatedEnquiry, error } = await supabase
      .from('enquiries')
      .update({ 
        status: 'accepted',
        payment_status: 'unpaid', // Ready for payment
        auto_accepted: true,
        supplier_response_date: new Date().toISOString(),
        supplier_response: 'Auto-accepted for immediate booking - customer proceeding to payment',
        updated_at: new Date().toISOString()
      })
      .eq('id', enquiryId)
      .select()
      .single()

    if (error) throw error

 
    return { success: true, enquiry: updatedEnquiry }

  } catch (error) {
    console.error('❌ Error auto-accepting specific enquiry:', error)
    return { success: false, error: error.message }
  }
}

async getEnquiriesForParty(partyId) {
  try {

    
    // ✅ IMPORTANT: Add a timestamp to prevent caching
    const timestamp = Date.now()
    
    const { data: enquiries, error } = await supabase
      .from('enquiries')
      .select(`
        *,
        suppliers:supplier_id (
          id,
          business_name,
          data
        )
      `)
      .eq('party_id', partyId)
      .order('created_at', { ascending: false })
      // ✅ Optional: Add a meaningless filter that changes each time to bust cache
      .gte('created_at', '2020-01-01') // This doesn't change results but busts cache
      
    if (error) throw error


    
    // ✅ DEBUG: Log the auto_accepted status of each enquiry
    enquiries?.forEach((enquiry) => {
    
    })

    return { success: true, enquiries: enquiries || [] }

  } catch (error) {
    console.error('❌ Error getting enquiries for party:', error)
    return { success: false, error: error.message }
  }
}

// ✅ ALSO: Make sure your supplier response update actually works:
async respondToEnquiry(enquiryId, response, finalPrice = null, message = '', isDepositPaid = false) {
  try {
  

    const updateData = {
      status: response,
      supplier_response_date: new Date().toISOString(),
      supplier_response: message || 'Supplier has responded',
      updated_at: new Date().toISOString()
    }

    // ✅ CRITICAL: Clear auto_accepted when supplier manually accepts deposit-paid booking
    if (isDepositPaid && response === 'accepted') {
      updateData.auto_accepted = false

    }

    if (response === 'accepted' && finalPrice) {
      updateData.final_price = finalPrice
    }

    const { data: updatedEnquiry, error } = await supabase
      .from('enquiries')
      .update(updateData)
      .eq('id', enquiryId)
      .select()
      .single()

    if (error) throw error

  
    return { success: true, enquiry: updatedEnquiry }

  } catch (error) {
    console.error('❌ Error updating enquiry:', error)
    return { success: false, error: error.message }
  }
}
  async hasPartyPendingEnquiries(partyId) {
    try {

      
      const { data: enquiries, error } = await supabase
        .from('enquiries')
        .select('id, status, supplier_category, created_at')
        .eq('party_id', partyId)
        .eq('status', 'pending') // Only check for pending enquiries
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('❌ Error checking pending enquiries:', error);
        return { success: false, error: error.message, hasPending: false, count: 0 };
      }
  
      const hasPending = enquiries && enquiries.length > 0;
      

      
      return {
        success: true,
        hasPending: hasPending,
        count: enquiries?.length || 0,
        enquiries: enquiries || []
      };
      
    } catch (error) {
      console.error('❌ Exception checking pending enquiries:', error);
      return { success: false, error: error.message, hasPending: false, count: 0 };
    }
  }

  // ================== HELPER FUNCTIONS ==================

  /**
   * Calculate total cost of party plan
   */
  calculatePartyPlanCost(partyPlan) {
    let total = 0

    // Add supplier costs
    Object.entries(partyPlan).forEach(([key, supplier]) => {
      // ✅ FIX: Exclude einvites and addons from cost calculation
      if (supplier && supplier.price && key !== 'addons' && key !== 'einvites') {
        total += supplier.price
      }
    })

    // Add addon costs
    if (partyPlan.addons) {
      partyPlan.addons.forEach(addon => {
        if (addon && addon.price) {
          total += addon.price
        }
      })
    }

    return total
  }
  async updateParty(partyId, updates) {
    try {
      const { data: updatedParty, error } = await supabase
        .from('parties')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', partyId)
        .select()
        .single()
  
      if (error) throw error
  

      return { success: true, party: updatedParty }
  
    } catch (error) {
      console.error('❌ Error updating party:', error)
      return { success: false, error: error.message }
    }
  }
  

  async cancelEnquiryAndRemoveSupplier(partyId, supplierType) {
    try {
 
      
      // Step 1: Find the enquiry
      const { data: enquiry, error: findError } = await supabase
        .from('enquiries')
        .select('id, status')
        .eq('party_id', partyId)
        .eq('supplier_category', supplierType)
        .in('status', ['pending', 'declined', 'accepted']) // ← Add 'accepted'
        .single();
      
      if (findError && findError.code !== 'PGRST116') {
        console.error('❌ Error finding enquiry:', findError);
        throw findError;
      }
      
      // Mark enquiry as withdrawn by user
      if (enquiry) {
     
       
        
        // ✅ NEW: Different update based on enquiry status
        const updateData = {
          status: 'withdrawn',
          updated_at: new Date().toISOString()
        }
        
        // ✅ KEY FIX: If enquiry was declined, mark replacement as processed
        if (enquiry.status === 'declined') {
          updateData.replacement_processed = true
  
        }
        
        const { error: withdrawError } = await supabase
          .from('enquiries')
          .update(updateData)
          .eq('id', enquiry.id);
        
        if (withdrawError) {
          console.error('❌ Error withdrawing enquiry:', withdrawError);
          throw withdrawError;
        }
        
     
      }
      
      // Step 2: Remove supplier from party plan (existing logic)
      const removeResult = await this.removeSupplierFromParty(partyId, supplierType);
      
      if (!removeResult.success) {
        throw new Error(`Failed to remove supplier: ${removeResult.error}`);
      }
      

      
      return {
        success: true,
        message: `Request cancelled and ${supplierType} removed from party`,
        removedSupplier: removeResult.removedSupplier,
        withdrawnEnquiry: enquiry,
        replacementProcessed: enquiry?.status === 'declined' // ✅ NEW: Indicate if replacement was processed
      };
      
    } catch (error) {
      console.error('❌ Error cancelling enquiry and removing supplier:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Map supplier category to party plan type
   */

  async sendIndividualEnquiry(partyId, supplier, selectedPackage = null, customMessage = '') {
    try {
    
     // ✅ EMERGENCY FIX: Add category if missing (same as addSupplierToParty)
     if (!supplier.category) {

      supplier.category = 'Entertainment'

    }

      // Get party details for enquiry context
      const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('*')
        .eq('id', partyId)
        .single()
        
      if (partyError) {
        console.error('❌ Error fetching party for enquiry:', partyError)
        throw partyError
      }
  
      // Determine supplier category for enquiry
      const supplierCategory = this.mapCategoryToSupplierType(supplier.category)
      if (!supplierCategory) {
        throw new Error(`Cannot map supplier category: ${supplier.category}`)
      }
  
      // Get any existing add-ons that might be relevant
      const partyPlan = party.party_plan || {}
      const allAddons = partyPlan.addons || []
      
      // Filter add-ons that might be relevant to this supplier
      const relevantAddons = allAddons.filter(addon => 
        !addon.supplierId || // General add-ons
        addon.supplierId === supplier.id || 
        addon.supplierName === supplier.name
      )
  
     
  
      // Calculate quoted price (supplier + package + relevant add-ons)
      const supplierPrice = selectedPackage ? selectedPackage.price : supplier.priceFrom || 0
      const addonsPrice = relevantAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
      const totalQuotedPrice = supplierPrice + addonsPrice
  
      // Create enquiry data
      const enquiryData = {
        party_id: partyId,
        supplier_id: supplier.id,
        supplier_category: supplierCategory,
        package_id: selectedPackage?.id || null,
        addon_ids: relevantAddons.length > 0 ? relevantAddons.map(a => a.id) : null,
        addon_details: relevantAddons.length > 0 ? JSON.stringify(relevantAddons) : null,
        message: customMessage || `Individual enquiry for ${party.child_name || 'child'}'s ${party.theme || 'themed'} party`,
        special_requests: party.special_requirements || null,
        quoted_price: totalQuotedPrice,
        status: 'accepted',
        created_at: new Date().toISOString(),
          

      }
  

  
      // Insert enquiry
      const { data: newEnquiry, error: insertError } = await supabase
        .from('enquiries')
        .insert(enquiryData)
        .select(`
          *,
          suppliers:supplier_id (
            id,
            business_name,
            data
          )
        `)
        .single()
  
      if (insertError) {
        console.error('❌ Error creating individual enquiry:', insertError)
        throw insertError
      }
  
      
  
      return {
        success: true,
        enquiry: newEnquiry,
        message: `Enquiry sent to ${supplier.name}`,
        quotedPrice: totalQuotedPrice
      }
  
    } catch (error) {
      console.error('❌ Error sending individual enquiry:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
// 3. Add the markReplacementAsProcessed method to your partyDatabaseBackend.js
async markReplacementAsProcessed(partyId, supplierCategory, replacementSupplierId = null) {
  try {
    

    // Update the declined enquiry to mark replacement as processed
    const { data: updatedEnquiry, error: updateError } = await supabase
      .from('enquiries')
      .update({ 
        replacement_processed: true,
        updated_at: new Date().toISOString()
      })
      .eq('party_id', partyId)
      .eq('supplier_category', supplierCategory)
      .eq('status', 'declined')
      .eq('replacement_processed', false)
      .select()
      .maybeSingle() // Use maybeSingle to handle no results gracefully

    if (updateError) {
      console.error('❌ Update error:', updateError)
      throw updateError
    }

    if (updatedEnquiry) {

      return { success: true, enquiry: updatedEnquiry }
    } else {
 
      return { success: false, error: 'No matching declined enquiry found' }
    }

  } catch (error) {
    console.error('❌ === REPLACEMENT PROCESSING ERROR ===')
    console.error('❌ Error details:', error)
    return { success: false, error: error.message }
  }
}
  /**
   * Helper method to map supplier category to party plan supplier type
   * (You might already have this, but here's the implementation)
   */
  mapCategoryToSupplierType(category) {

    
    const mapping = {
      // Standard supplier categories
      'Entertainment': 'entertainment',
      'Venues': 'venue',
      'Catering': 'catering',
      'Decorations': 'decorations',
      'Party Bags': 'partyBags',
      'Photography': 'photography',
      'Activities': 'activities',
      'Face Painting': 'facePainting',
      'Balloons': 'balloons',
      'Cakes' : 'cakes',
      'Bouncy Castle': 'activities',

      // Handle lowercase versions too
      'entertainment': 'entertainment',
      'venues': 'venue',
      'venue': 'venue',
      'catering': 'catering',
      'decorations': 'decorations',
      'party bags': 'partyBags',
      'partybags': 'partyBags',
      'photography': 'photography',
      'activities': 'activities',
      'face painting': 'facePainting',
      'facepainting': 'facePainting',
      'balloons': 'balloons',
      'cakes' : 'cakes',
      'bouncy castle': 'activities',
      'bouncycastle': 'activities'
    }
    
    const result = mapping[category] || mapping[category?.toLowerCase()] || null

    
    return result
  }

  /**
   * Get user's party history
   */
  async getUserParties() {
    try {
      const userResult = await this.getCurrentUser()
      if (!userResult.success) {
        throw new Error('User not found')
      }

      const { data: parties, error } = await supabase
        .from('parties')
        .select('*')
        .eq('user_id', userResult.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, parties }

    } catch (error) {
      console.error('❌ Error getting user parties:', error)
      return { success: false, error: error.message }
    }
  }

// Add this to your partyDatabaseBackend
async createUnpaidBookingRecord(partyId, supplier, packageData, reason = null) {
  try {
  

    // Insert ONLY the database record - no enquiry sending
    const { data: enquiry, error } = await supabase
      .from('enquiries')
      .insert({
        party_id: partyId,
        supplier_id: supplier.id,
        supplier_category: this.mapCategoryToSupplierType(supplier.category),
        package_id: packageData.id,
        quoted_price: packageData.totalPrice || packageData.price || 0,
        final_price: packageData.totalPrice || packageData.price || 0,
        message: reason || 'Supplier added - awaiting payment',
        
        // Key: accepted but unpaid, NO supplier communication
        status: 'accepted',
        payment_status: 'unpaid',
        auto_accepted: true,
        
        // NO supplier_response or supplier_response_date - they haven't been contacted
        supplier_response: null,
        supplier_response_date: null,
        
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, enquiry };

  } catch (error) {
    console.error('Error creating booking record:', error);
    return { success: false, error: error.message };
  }
}
  /**
   * Get gift suggestions based on theme and age
   */
// In your PartyDatabaseBackend class, UPDATE the existing getGiftSuggestions method:

// Option 1: Simple fallback - just disable for now
// In your PartyDatabaseBackend class, replace getGiftSuggestions with:
async getGiftSuggestions(theme, age, category = null, limit = 20) {
  const useRealProducts = true; // Safe to turn on now!
  
  try {
    if (useRealProducts) {
      // Get both curated and real products via API
      const curatedLimit = Math.ceil(limit / 2);
      const realLimit = Math.ceil(limit / 2);
      
      const [curatedResult, realProductsResponse] = await Promise.allSettled([
        this.getCuratedGiftSuggestions(theme, age, category, curatedLimit),
        fetch('/api/products/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme, age, category, limit: realLimit })
        })
      ]);

      const curated = curatedResult.status === 'fulfilled' && curatedResult.value.success 
        ? curatedResult.value.suggestions 
        : [];

      let real = [];
      if (realProductsResponse.status === 'fulfilled') {
        const realData = await realProductsResponse.value.json();
        real = realData.success ? realData.products : [];
      }

      // Interleave curated and real products
      const combined = [];
      const maxLength = Math.max(curated.length, real.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (curated[i]) combined.push({ ...curated[i], source: 'curated' });
        if (real[i]) combined.push({ ...real[i], source: 'amazon' });
      }


      return { success: true, suggestions: combined.slice(0, limit) };
    } else {
      return this.getCuratedGiftSuggestions(theme, age, category, limit);
    }
  } catch (error) {
    console.error('❌ Error getting enhanced suggestions:', error);
    return this.getCuratedGiftSuggestions(theme, age, category, limit);
  }
}

// Rename your existing method to this (if you haven't already):
async getCuratedGiftSuggestions(theme, age, category = null, limit = 20) {
  try {
    let query = supabase
      .from('gift_items')
      .select('*')
      .eq('is_active', true)
      .lte('age_min', age)
      .gte('age_max', age)
      .order('popularity', { ascending: false })

    if (theme) {
      query = query.contains('themes', [theme])
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.limit(limit)
    
    if (error) throw error
    return { success: true, suggestions: data || [] }
  } catch (error) {
    console.error('❌ Error getting curated gift suggestions:', error)
    return { success: false, error: error.message }
  }
}
 
  async getGiftCategories() {
    try {
      const { data, error } = await supabase
        .from('gift_items')
        .select('category, subcategory')
        .eq('is_active', true)
      
      if (error) throw error
      
      // Group by category
      const categories = data.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = new Set()
        }
        if (item.subcategory) {
          acc[item.category].add(item.subcategory)
        }
        return acc
      }, {})

      // Convert Sets to Arrays
      const formattedCategories = Object.entries(categories).map(([category, subcategories]) => ({
        category,
        subcategories: Array.from(subcategories)
      }))

      return { success: true, categories: formattedCategories }
    } catch (error) {
      console.error('❌ Error getting gift categories:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Add item to registry (from curated list)
   */
  async addCustomItemToRegistry(registryId, itemData) {
    try {
 
      
      const registryItem = {
        registry_id: registryId,
        gift_item_id: null,
        custom_name: itemData.name,
        custom_price: itemData.price,
        custom_description: itemData.description,
        quantity: itemData.quantity || 1,
        priority: itemData.priority || 'medium',
        notes: itemData.notes || null
      };
      
      const { data: newItem, error } = await supabase
        .from('registry_items') // ✅ CORRECT TABLE NAME
        .insert(registryItem)
        .select()
        .single();
      
      if (error) {
        console.error('❌ [Backend] Error adding custom item to registry:', error);
        return {
          success: false,
          error: `Failed to add custom item to registry: ${error.message}`
        };
      }
      
      
      
      return {
        success: true,
        registryItem: newItem,
        message: 'Custom item added to registry successfully'
      };
      
    } catch (error) {
      console.error('❌ [Backend] Exception in addCustomItemToRegistry:', error);
      return {
        success: false,
        error: `Failed to add custom item to registry: ${error.message}`
      };
    }
  }

  /**
   * Add custom item to registry
   */
  // async addCustomItemToRegistry(registryId, itemData) {
  //   try {
  //     const { data, error } = await supabase
  //       .from('registry_items')
  //       .insert({
  //         registry_id: registryId,
  //         gift_item_id: null, // Custom item
  //         custom_name: itemData.name,
  //         custom_price: itemData.price,
  //         custom_description: itemData.description,
  //         notes: itemData.notes || null,
  //         priority: itemData.priority || 'medium',
  //         quantity: itemData.quantity || 1
  //       })
  //       .select()
  //       .single()
      
  //     if (error) throw error
  //     return { success: true, registryItem: data }
  //   } catch (error) {
  //     console.error('❌ Error adding custom item to registry:', error)
  //     return { success: false, error: error.message }
  //   }
  // }
  // Fix the registry items query - the table EXISTS, the JOIN is the problem

  async getRegistryById(registryId) {
    try {
   
      
      // Get the registry
      const { data: registry, error: registryError } = await supabase
        .from('party_gift_registries')
        .select(`
          *,
          parties!party_gift_registries_party_id_fkey (
            child_name,
            party_date,
            party_time,
            location,
            theme,
            special_requirements,
            child_age
          )
        `)
        .eq('id', registryId)
        .eq('is_active', true)
        .single();
      
      if (registryError) {
        console.error('❌ [Backend] Error fetching registry by ID:', registryError);
        return {
          success: false,
          error: `Registry not found: ${registryError.message}`,
          registry: null,
          items: []
        };
      }
      

      
      // Get registry items from the correct table: registry_items
      let items = [];
      try {

        
        const { data: rawItems, error: itemsError } = await supabase
          .from('registry_items') // ✅ CORRECT TABLE NAME
          .select('*')
          .eq('registry_id', registryId)
          .order('created_at', { ascending: false });
        
        if (itemsError) {
          console.error('❌ [Backend] Error fetching registry items:', itemsError);
          return {
            success: true,
            registry: registry,
            items: [],
            message: 'Registry loaded but items could not be loaded'
          };
        }
        
 
        items = rawItems || [];
        
      } catch (itemsError) {
        console.error('⚠️ [Backend] Exception fetching registry items:', itemsError);
        items = [];
      }
      
   
      
      return {
        success: true,
        registry: registry,
        items: items || [],
        message: 'Gift registry loaded successfully'
      };
      
    } catch (error) {
      console.error('❌ [Backend] Exception in getRegistryById:', error);
      return {
        success: false,
        error: `Failed to load gift registry: ${error.message}`,
        registry: null,
        items: []
      };
    }
  }


async addCuratedItemToRegistry(registryId, giftItemId, itemData = {}) {
  try {
    
    
    const registryItem = {
      registry_id: registryId,
      gift_item_id: giftItemId, // This links to the curated gift_items table
      quantity: itemData.quantity || 1,
      priority: itemData.priority || 'medium',
      notes: itemData.notes || null
    };
    
    const { data: newItem, error } = await supabase
      .from('registry_items') // ✅ CORRECT TABLE NAME
      .insert(registryItem)
      .select(`
        *,
        gift_items(*)
      `)
      .single();
    
    if (error) {
      console.error('❌ [Backend] Error adding curated item to registry:', error);
      return {
        success: false,
        error: `Failed to add item to registry: ${error.message}`
      };
    }
    

    
    return {
      success: true,
      registryItem: newItem,
      message: 'Item added to registry successfully'
    };
    
  } catch (error) {
    console.error('❌ [Backend] Exception in addCuratedItemToRegistry:', error);
    return {
      success: false,
      error: `Failed to add item to registry: ${error.message}`
    };
  }
}

// Also fix the getPartyGiftRegistry method:
async getPartyGiftRegistry(partyId) {
  try {

    
    // Get the registry from party_gift_registries table
    const { data: registry, error: registryError } = await supabase
      .from('party_gift_registries')
      .select(`
        *,
        parties!party_gift_registries_party_id_fkey (
          child_name,
          party_date,
          party_time,
          location,
          theme,
          special_requirements,
          child_age
        )
      `)
      .eq('party_id', partyId)
      .eq('is_active', true)
      .single();
    
    if (registryError) {
      if (registryError.code === 'PGRST116') {
        // No registry found - this is normal
        return {
          success: true,
          registry: null,
          items: [],
          message: 'No gift registry found for this party'
        };
      }
      
      console.error('❌ [Backend] Error fetching gift registry:', registryError);
      return {
        success: false,
        error: `Failed to load gift registry: ${registryError.message}`,
        registry: null,
        items: []
      };
    }
    

    
    // Get registry items from the correct table: registry_items
    let items = [];
    try {
      const { data: rawItems, error: itemsError } = await supabase
        .from('registry_items') // ✅ CORRECT TABLE NAME
        .select('*')
        .eq('registry_id', registry.id)
        .order('created_at', { ascending: false });
      
      if (!itemsError) {
        items = rawItems || [];
      } else {
        console.error('⚠️ [Backend] Error fetching registry items:', itemsError);
      }
    } catch (itemsError) {
      console.error('⚠️ [Backend] Exception fetching registry items:', itemsError);
    }
    
  
    
    return {
      success: true,
      registry: registry,
      items: items || [],
      message: 'Gift registry loaded successfully'
    };
    
  } catch (error) {
    console.error('❌ [Backend] Exception in getPartyGiftRegistry:', error);
    return {
      success: false,
      error: `Failed to load gift registry: ${error.message}`,
      registry: null,
      items: []
    };
  }
}


// // Debug function to check what's in your gift_items table
// async debugGiftItemsTable() {
//   try {
//     console.log('🔍 [DEBUG] Checking gift_items table...');
    
//     // Check if gift_items table exists and is readable
//     const { data: giftItems, error: giftItemsError } = await supabase
//       .from('gift_items')
//       .select('id, name')
//       .limit(5);
    
//     console.log('📊 [DEBUG] Gift items sample:', giftItems);
//     console.log('❌ [DEBUG] Gift items error:', giftItemsError);
    
//     // Check foreign key relationship
//     const { data: itemsWithGiftIds, error: fkError } = await supabase
//       .from('party_gift_registries')
//       .select('id, gift_item_id')
//       .not('gift_item_id', 'is', null)
//       .limit(5);
    
//     console.log('📊 [DEBUG] Registry items with gift_item_id:', itemsWithGiftIds);
//     console.log('❌ [DEBUG] FK check error:', fkError);
    
//     return { giftItems, itemsWithGiftIds, errors: { giftItemsError, fkError } };
    
//   } catch (error) {
//     console.error('❌ [DEBUG] Exception in debugGiftItemsTable:', error);
//     return { error: error.message };
//   }
// }




  /**
   * Remove item from registry
   */
  async removeItemFromRegistry(registryItemId) {
    try {
      
      
      const { error } = await supabase
        .from('registry_items') // ✅ CORRECT TABLE NAME
        .delete()
        .eq('id', registryItemId);
      
      if (error) {
        console.error('❌ [Backend] Error removing item from registry:', error);
        return {
          success: false,
          error: `Failed to remove item from registry: ${error.message}`
        };
      }
      

      
      return {
        success: true,
        message: 'Item removed from registry successfully'
      };
      
    } catch (error) {
      console.error('❌ [Backend] Exception in removeItemFromRegistry:', error);
      return {
        success: false,
        error: `Failed to remove item from registry: ${error.message}`
      };
    }
  }

  /**
   * Update registry item (notes, priority, etc.)
   */
  async updateRegistryItem(registryItemId, updates) {
    try {
      const { data, error } = await supabase
        .from('registry_items')
        .update(updates)
        .eq('id', registryItemId)
        .select(`
          *,
          gift_items(*)
        `)
        .single()
      
      if (error) throw error
      return { success: true, registryItem: data }
    } catch (error) {
      console.error('❌ Error updating registry item:', error)
      return { success: false, error: error.message }
    }
  }
  async createGiftRegistry(partyId, registryData = {}) {
    try {
   
      
      // First get the party details to make a nice name
      const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('child_name, theme')
        .eq('id', partyId)
        .single();
      
      if (partyError) {
        console.error('❌ [Backend] Error fetching party details:', partyError);
        // Continue anyway with default values
      }
      
      // Create the registry record
      const registryRecord = {
        party_id: partyId,
        name: registryData.name || `${party?.child_name || 'Birthday Child'}'s Gift Registry`,
        description: registryData.description || `Gift registry for ${party?.child_name || 'child'}'s ${party?.theme || 'themed'} party`,
        is_active: true
      };
      

      
      const { data: newRegistry, error: registryError } = await supabase
        .from('party_gift_registries')
        .insert(registryRecord)
        .select('*')
        .single();
      
      if (registryError) {
        console.error('❌ [Backend] Database error creating registry:', registryError);
        return {
          success: false,
          error: `Failed to create gift registry: ${registryError.message}`,
          registry: null
        };
      }
      
    
      
      // Verify it was saved by reading it back
      const { data: verifyRegistry, error: verifyError } = await supabase
        .from('party_gift_registries')
        .select('*')
        .eq('id', newRegistry.id)
        .single();
      
      if (verifyError) {
        console.error('⚠️ [Backend] Registry created but verification failed:', verifyError);
        // Still return success since the registry was created
      }

      return {
        success: true,
        registry: newRegistry,
        message: 'Gift registry created successfully'
      };
      
    } catch (error) {
      console.error('❌ [Backend] Exception in createGiftRegistry:', error);
      return {
        success: false,
        error: `Failed to create gift registry: ${error.message}`,
        registry: null
      };
    }
  }
  
  /**
   * Claim item (for guests)
   */
  async claimRegistryItem(registryItemId, guestName) {
    try {


      const { data: updatedItem, error } = await supabase
        .from('registry_items') // ✅ CORRECT TABLE NAME
        .update({
          is_claimed: true,
          claimed_by: guestName,
          claimed_at: new Date().toISOString()
        })
        .eq('id', registryItemId)
        .select()
        .single();

      if (error) {
        console.error('❌ [Backend] Error claiming item:', error);
        return {
          success: false,
          error: `Failed to claim item: ${error.message}`
        };
      }



      return {
        success: true,
        registryItem: updatedItem,
        message: 'Item claimed successfully'
      };

    } catch (error) {
      console.error('❌ [Backend] Exception in claimRegistryItem:', error);
      return {
        success: false,
        error: `Failed to claim item: ${error.message}`
      };
    }
  }

  /**
   * Update registry header image
   */
  async updateRegistryHeaderImage(registryId, imageUrl) {
    try {
      const { data: updatedRegistry, error } = await supabase
        .from('party_gift_registries')
        .update({
          header_image: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', registryId)
        .select()
        .single();

      if (error) {
        console.error('❌ [Backend] Error updating header image:', error);
        return {
          success: false,
          error: `Failed to update header image: ${error.message}`
        };
      }

      return {
        success: true,
        registry: updatedRegistry,
        message: 'Header image updated successfully'
      };

    } catch (error) {
      console.error('❌ [Backend] Exception in updateRegistryHeaderImage:', error);
      return {
        success: false,
        error: `Failed to update header image: ${error.message}`
      };
    }
  }

  /**
   * Update registry personalization data (child's preferences)
   */
  async updateRegistryPersonalization(registryId, personalizationData) {
    try {
      const { data: updatedRegistry, error } = await supabase
        .from('party_gift_registries')
        .update({
          personalization_data: personalizationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', registryId)
        .select()
        .single();

      if (error) {
        console.error('❌ [Backend] Error updating personalization data:', error);
        return {
          success: false,
          error: `Failed to update personalization data: ${error.message}`
        };
      }

      return {
        success: true,
        registry: updatedRegistry,
        message: 'Personalization data updated successfully'
      };

    } catch (error) {
      console.error('❌ [Backend] Exception in updateRegistryPersonalization:', error);
      return {
        success: false,
        error: `Failed to update personalization data: ${error.message}`
      };
    }
  }

  /**
   * Unclaim item (for guests who change their mind)
   */
  async unclaimRegistryItem(registryItemId, guestEmail) {
    try {
      const { data, error } = await supabase
        .from('registry_items')
        .update({
          is_claimed: false,
          claimed_by: null,
          claimed_email: null,
          claimed_at: null
        })
        .eq('id', registryItemId)
        .eq('claimed_email', guestEmail) // Only allow unclaiming if they claimed it
        .select(`
          *,
          gift_items(*)
        `)
        .single()
      
      if (error) throw error
      return { success: true, registryItem: data }
    } catch (error) {
      console.error('❌ Error unclaiming registry item:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Search gifts by name/tags
   */
  async searchGifts(searchTerm, age = null, category = null, limit = 20) {
    try {
      let query = supabase
        .from('gift_items')
        .select('*')
        .eq('is_active', true)

      // Text search in name, description, and tags
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      }

      // Age filter
      if (age) {
        query = query.lte('age_min', age).gte('age_max', age)
      }

      // Category filter
      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query
        .order('popularity', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, gifts: data || [] }
    } catch (error) {
      console.error('❌ Error searching gifts:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get registry analytics for parents
   */
  async getRegistryAnalytics(registryId) {
    try {
      const { data: items, error } = await supabase
        .from('registry_items')
        .select('*')
        .eq('registry_id', registryId)

      if (error) throw error

      const analytics = {
        totalItems: items.length,
        claimedItems: items.filter(item => item.is_claimed).length,
        unclaimedItems: items.filter(item => !item.is_claimed).length,
        claimPercentage: items.length > 0 ? Math.round((items.filter(item => item.is_claimed).length / items.length) * 100) : 0,
        recentClaims: items
          .filter(item => item.is_claimed)
          .sort((a, b) => new Date(b.claimed_at) - new Date(a.claimed_at))
          .slice(0, 5)
      }

      return { success: true, analytics }
    } catch (error) {
      console.error('❌ Error getting registry analytics:', error)
      return { success: false, error: error.message }
    }
  }
  // Add this new method to your PartyDatabaseBackend class:
// Add this to your PartyDatabaseBackend class:
async addRealProductToRegistry(registryId, product, itemData = {}) {
  try {

    
    const registryItem = {
      registry_id: registryId,
      gift_item_id: null, // Real products don't use gift_item_id
      custom_name: product.name,
      custom_price: product.price ? `£${product.price}` : product.price_range || 'Price varies',
      custom_description: product.description,
      external_product_id: product.id,
      external_source: product.source || 'amazon',
      external_image_url: product.image_url,
      external_buy_url: product.buy_url || product.amazon_url,
      quantity: itemData.quantity || 1,
      priority: itemData.priority || 'medium',
      notes: itemData.notes || null
    };
    
    
    
    const { data: newItem, error } = await supabase
      .from('registry_items') // ✅ CORRECT TABLE NAME
      .insert(registryItem)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [Backend] Error adding product to registry:', error);
      return {
        success: false,
        error: `Failed to add product to registry: ${error.message}`
      };
    }
    
    
    
    return {
      success: true,
      registryItem: newItem,
      message: 'Product added to registry successfully'
    };
    
  } catch (error) {
    console.error('❌ [Backend] Exception in addRealProductToRegistry:', error);
    return {
      success: false,
      error: `Failed to add product to registry: ${error.message}`
    };
  }
}
async findSuppliersByCategory(excludeId, category) {
  try {
    
    
    // Build query with proper UUID handling
    let query = supabase
      .from('suppliers')
      .select('*')
      .limit(50)
    
    // Only add UUID exclusion if excludeId is a valid UUID
    if (excludeId && this.isValidUUID(excludeId)) {
      query = query.neq('id', excludeId)
    }
    
    const { data: allSuppliers, error } = await query
    
    if (error) {
      console.error(`❌ Error querying suppliers:`, error)
      return []
    }
    
    // Log categories for debugging
    const allCategories = allSuppliers?.map(s => s.data?.category).filter(Boolean)
  
    
    // Filter suppliers by category with flexible matching
    const matchingSuppliers = allSuppliers?.filter(supplier => {
      const supplierData = supplier.data || {}
      const supplierCategory = supplierData.category
      
      if (!supplierCategory) return false
      
      // Try different matching strategies
      const exactMatch = supplierCategory.toLowerCase() === category.toLowerCase()
      const containsMatch = supplierCategory.toLowerCase().includes(category.toLowerCase())
      const reverseContainsMatch = category.toLowerCase().includes(supplierCategory.toLowerCase())
      
      const isMatch = exactMatch || containsMatch || reverseContainsMatch

      return isMatch
    }) || []
    

    
    // If this is a test and we found real suppliers, great!
    if (matchingSuppliers.length > 0) {
      return matchingSuppliers
    }
    
    return []
    
  } catch (error) {
    console.error(`❌ Error in findSuppliersByCategory for ${category}:`, error)
    return []
  }
}


getFallbackCategories(originalCategory) {
  
  
  // Map enquiry categories (lowercase) to actual database categories (title case)
  const categoryMappings = {
    // Enquiry category -> Database categories to try
    'activities': ['Entertainment', 'Face Painting', 'Activities'],
    'entertainment': ['Entertainment', 'Activities', 'Face Painting'],
    'venue': ['Venues', 'Entertainment'], // Some entertainment can be venue-like
    'venues': ['Venues', 'Entertainment'],
    'catering': ['Catering', 'Party Bags'],
    'decorations': ['Decorations', 'Party Bags'],
    'balloons': ['Decorations', 'Party Bags'],
    'face painting': ['Face Painting', 'Entertainment', 'Activities'],
    'facePainting': ['Face Painting', 'Entertainment', 'Activities'],
    'party bags': ['Party Bags', 'Catering'],
    'partyBags': ['Party Bags', 'Catering'],
    'cakes' : ['Cakes', 'cakes']
  }
  
  const fallbacks = categoryMappings[originalCategory?.toLowerCase()] || []
  
  // Add all your actual database categories as final fallbacks
  const allDatabaseCategories = [
    'Entertainment', 
    'Catering', 
    'Venues', 
    'Decorations', 
    'Activities', 
    'Face Painting', 
    'Party Bags',
    'Cakes'
  ]
  
  // Combine specific fallbacks with general ones, remove duplicates
  const combinedFallbacks = [...new Set([...fallbacks, ...allDatabaseCategories])]
  
  // Filter out the original category
  const finalFallbacks = combinedFallbacks.filter(cat => 
    cat.toLowerCase() !== originalCategory?.toLowerCase()
  )
  

  return finalFallbacks
}

// COMPLETELY FIXED version - correct Supabase syntax

/**
 * Find replacement suppliers when one gets rejected - CORRECT SUPABASE SYNTAX
 */
async findReplacementSuppliers(rejectedSupplier, userPreferences = {}) {
  try {

    
    
    const exactMatches = await this.findSuppliersByCategory(rejectedSupplier.id, rejectedSupplier.category)
    
    if (exactMatches.length > 0) {
      return this.transformSupplierData(exactMatches, rejectedSupplier, userPreferences)
    }
    

    
  
    const fallbackCategories = this.getFallbackCategories(rejectedSupplier.category)
    
    for (const fallbackCategory of fallbackCategories) {

      const fallbackMatches = await this.findSuppliersByCategory(rejectedSupplier.id, fallbackCategory)
      
      if (fallbackMatches.length > 0) {

        return this.transformSupplierData(fallbackMatches, rejectedSupplier, userPreferences)
      }
    }
    

    
    // Development fallback
    if (process.env.NODE_ENV === 'development') {
      return [{
        id: 'mock-replacement-' + Date.now(),
        name: `Better ${rejectedSupplier.category} Provider`,
        description: `An improved ${rejectedSupplier.category.toLowerCase()} service for your party`,
        price: Math.max((rejectedSupplier.price || 150) - 20, 50),
        rating: 4.8,
        reviewCount: 127,
        image: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482064/phil-hearing-sdVA2f8rTiw-unsplash_ydqz9d.jpg',
        category: rejectedSupplier.category,
        themes: [userPreferences.theme || 'general'],
        specializations: [],
        tags: ['Premium', 'Highly Rated', 'Available'],
        packageDetails: ['Standard Package', 'Premium Package'],
        isPremium: true,
        avgResponseTime: 12,
        available: true,
        score: 85
      }]
    }
    
    return []
    
  } catch (error) {
    console.error('❌ Error finding replacement suppliers:', error)
    return []
  }
}
/**
 * Transform and score supplier data - KEEP THIS HELPER METHOD
 */
transformSupplierData(suppliers, rejectedSupplier, userPreferences) {

  
  if (!suppliers || suppliers.length === 0) {

    return []
  }
  
  // Transform the data to match expected format
  const transformedAlternatives = suppliers.map((supplier, index) => {
    const supplierData = supplier.data || {}
    
    return {
      id: supplier.id,
      name: supplier.business_name || supplierData.businessName || supplierData.name || 'Unknown Supplier',
      description: supplierData.description || 'Professional party supplier',
      price: parseInt(supplierData.priceFrom) || parseInt(supplierData.price) || 150,
      rating: parseFloat(supplierData.rating) || 4.0,
      reviewCount: parseInt(supplierData.reviewCount) || Math.floor(Math.random() * 50) + 10,
      image: supplierData.image || '/placeholder.jpg',
      category: supplierData.category || rejectedSupplier.category,
      themes: Array.isArray(supplierData.themes) ? supplierData.themes : [userPreferences.theme || 'general'],
      specializations: supplierData.specializations || [],
      tags: supplierData.tags || ['Professional', 'Reliable'],
      packageDetails: supplierData.packages?.map(p => p.name) || ['Standard Package', 'Premium Package'],
      isPremium: supplierData.isPremium || false,
      avgResponseTime: parseInt(supplierData.avgResponseTime) || 24,
      available: true
    }
  })
  

  
  // Score and rank the alternatives
  const scoredAlternatives = transformedAlternatives.map(supplier => ({
    ...supplier,
    score: this.scoreReplacementSupplier(supplier, rejectedSupplier, userPreferences)
  })).sort((a, b) => b.score - a.score)


  return scoredAlternatives.slice(0, 5) // Return top 5
}

/**
 * Score replacement suppliers (higher is better)
 */
scoreReplacementSupplier(supplier, rejectedSupplier, userPreferences = {}) {
  let score = 0
  
  // Better rating bonus
  if (supplier.rating > (rejectedSupplier.rating || 4.0)) {
    score += (supplier.rating - (rejectedSupplier.rating || 4.0)) * 10
  }
  
  // Price comparison bonus
  if (supplier.price < (rejectedSupplier.price || 0)) {
    const savings = rejectedSupplier.price - supplier.price
    score += Math.min(savings / 10, 20) // Max 20 points for price savings
  } else if (supplier.price === rejectedSupplier.price) {
    score += 10 // Same price bonus
  }
  
  // Theme match bonus
  if (userPreferences.theme && supplier.themes?.includes(userPreferences.theme)) {
    score += 25
  }
  
  // Review count bonus (more reviews = more reliable)
  if (supplier.reviewCount > (rejectedSupplier.reviewCount || 0)) {
    score += Math.min((supplier.reviewCount - (rejectedSupplier.reviewCount || 0)) / 10, 15)
  }
  
  // Premium supplier bonus
  if (supplier.isPremium && !rejectedSupplier.isPremium) {
    score += 15
  }
  
  // Faster response time bonus
  if (supplier.avgResponseTime < (rejectedSupplier.avgResponseTime || 24)) {
    score += 10
  }
  
  // Base availability score
  score += 10
  
  return score
}

/**
 * Calculate improvements between old and new supplier
 */
calculateSupplierImprovements(oldSupplier, newSupplier) {
  const improvements = []
  
  // Better rating
  if (newSupplier.rating > (oldSupplier.rating || 4.0)) {
    improvements.push(`Higher rating (${newSupplier.rating} vs ${oldSupplier.rating || 4.0} stars)`)
  }
  
  // Better price
  if (newSupplier.price < (oldSupplier.price || 0)) {
    const savings = (oldSupplier.price || 0) - newSupplier.price
    improvements.push(`£${savings} cheaper than original`)
  } else if (newSupplier.price === oldSupplier.price) {
    improvements.push('Same price as original')
  }
  
  // More reviews
  if (newSupplier.reviewCount > (oldSupplier.reviewCount || 0)) {
    improvements.push(`${newSupplier.reviewCount} customer reviews`)
  }
  
  // Premium features
  if (newSupplier.isPremium && !oldSupplier.isPremium) {
    improvements.push('Premium verified supplier')
  }
  
  // Faster response
  if (newSupplier.avgResponseTime < (oldSupplier.avgResponseTime || 24)) {
    improvements.push('Faster response time')
  }
  
  // Default improvement
  if (improvements.length === 0) {
    improvements.push('Available for your party date')
  }
  
  return improvements
}

/**
 * Determine primary reason for replacement
 */
determineReplacementReason(oldSupplier, newSupplier) {
  // Better rating (significant improvement)
  if (newSupplier.rating > (oldSupplier.rating || 4.0) + 0.3) {
    return 'better_reviews'
  }
  
  // Better price
  if (newSupplier.price < (oldSupplier.price || 0)) {
    return 'better_price'
  }
  
  // Same price
  if (newSupplier.price === oldSupplier.price) {
    return 'same_price'
  }
  
  // Faster response
  if (newSupplier.avgResponseTime < (oldSupplier.avgResponseTime || 24)) {
    return 'faster_response'
  }
  
  // Premium upgrade
  if (newSupplier.isPremium && !oldSupplier.isPremium) {
    return 'premium_upgrade'
  }
  
  // Default reason
  return 'availability'
}

/**
 * Create a replacement object for the UI
 */
async createReplacementForSupplier(rejectedSupplier, userPreferences = {}) {
  try {

    
    // Find alternatives
    const alternatives = await this.findReplacementSuppliers(rejectedSupplier, userPreferences)
    
    if (alternatives.length === 0) {
   
      return null
    }
    
    // Get the best alternative
    const bestAlternative = alternatives[0]
    
    // Calculate improvements
    const improvements = this.calculateSupplierImprovements(rejectedSupplier, bestAlternative)
    const reason = this.determineReplacementReason(rejectedSupplier, bestAlternative)
    
    const replacement = {
      id: `replacement-${Date.now()}`,
      category: rejectedSupplier.category,
      status: 'pending_approval',
      reason: reason,
      oldSupplier: {
        id: rejectedSupplier.id,
        name: rejectedSupplier.name,
        price: rejectedSupplier.price || 0,
        rating: rejectedSupplier.rating || 4.0,
        image: rejectedSupplier.image,
        reviewCount: rejectedSupplier.reviewCount || 0
      },
      newSupplier: {
        id: bestAlternative.id,
        name: bestAlternative.name,
        price: bestAlternative.price,
        rating: bestAlternative.rating,
        reviewCount: bestAlternative.reviewCount,
        image: bestAlternative.image,
        description: bestAlternative.description,
        tags: bestAlternative.tags || [],
        packageDetails: bestAlternative.packageDetails || [],
        specializations: bestAlternative.specializations || []
      },
      improvements: improvements,
      autoApproved: false,
      createdAt: new Date().toISOString()
    }
    

    return replacement
    
  } catch (error) {
    console.error('❌ Error creating replacement:', error)
    return null
  }
}


/**
 * Handle supplier rejection and create replacement
 */
async handleSupplierRejection(partyId, enquiryId, rejectedSupplier, userPreferences = {}) {
  try {

    
    // DON'T mark as processed here - let user decide first
    // await supabase
    //   .from('enquiries')  
    //   .update({ replacement_processed: true })
    //   .eq('id', enquiryId)
    
    // Create replacement
    const replacement = await this.createReplacementForSupplier(rejectedSupplier, userPreferences)
    
    if (!replacement) {
      return {
        success: false,
        error: 'No suitable replacements found'
      }
    }
    
    return {
      success: true,
      replacement: replacement,
      message: `We found you an even better ${rejectedSupplier.category.toLowerCase()} option!`
    }
    
  } catch (error) {
    console.error('❌ Error handling supplier rejection:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// SOLUTION 2: Mark as processed only when approved or dismissed
// Update your handleApproveReplacement:
async handleApproveReplacement(replacementId)  {
  try {
    const replacement = replacements.find(r => r.id === replacementId)
    if (!replacement) return


    
    const result = await partyDatabaseBackend.applyReplacementToParty(
      partyId, 
      replacement, 
      replacement.originalEnquiryId
    )
    
    if (result.success) {
      // NOW mark the original enquiry as processed
      await supabase
        .from('enquiries')
        .update({ replacement_processed: true })
        .eq('id', replacement.originalEnquiryId)
      
      // Update replacement status
      setReplacements(prev => 
        prev.map(r => 
          r.id === replacementId 
            ? { ...r, status: 'approved' }
            : r
        )
      )
      
      // Refresh data
      await Promise.all([
        refreshPartyData(),
        new Promise(resolve => setTimeout(resolve, 1000)).then(() => refreshEnquiries())
      ])
      

    }
    
  } catch (error) {
    console.error('💥 Error approving replacement:', error)
  }
}


mapCategoryToSupplierType(category) {

  
  // Handle both the enquiry category (lowercase) and supplier category (title case)
  const mapping = {
    // Enquiry categories (lowercase from database)
    'entertainment': 'entertainment',
    'venue': 'venue',
    'venues': 'venue',
    'catering': 'catering',
    'decorations': 'decorations',
    'party bags': 'partyBags',
    'partybags': 'partyBags',
    'photography': 'photography',
    'activities': 'activities',
    'face painting': 'facePainting',
    'facepainting': 'facePainting',
    'balloons': 'balloons',
    'cakes': 'cakes',
    'bouncy castle': 'activities',
    'bouncycastle': 'activities',

    // Supplier categories (title case from suppliers table)
    'Entertainment': 'entertainment',
    'Venues': 'venue',
    'Catering': 'catering',
    'Cakes': 'cakes',
    'Decorations': 'decorations',
    'Party Bags': 'partyBags',
    'Photography': 'photography',
    'Activities': 'activities',
    'Face Painting': 'facePainting',
    'Balloons': 'balloons',
    'Bouncy Castle': 'activities'
  }
  
  const result = mapping[category] || mapping[category?.toLowerCase()] || null

  
  return result
}
async sendEnquiryToReplacementSupplier(partyId, replacement, originalEnquiryId) {
  try {
 
    
    // Get party details for enquiry
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('id', partyId)
      .single()
      
    if (partyError) throw partyError
    
    // Get any add-ons from the original enquiry
    const { data: originalEnquiry, error: enquiryError } = await supabase
      .from('enquiries')
      .select('*')
      .eq('id', originalEnquiryId)
      .single()
      
    if (enquiryError) throw enquiryError
    
    // Create new enquiry for replacement supplier (using existing columns only)
    const newEnquiryData = {
      party_id: partyId,
      supplier_id: replacement.newSupplier.id,
      supplier_category: replacement.category.toLowerCase(),
      package_id: originalEnquiry.package_id, // Copy from original
      addon_ids: originalEnquiry.addon_ids, // Copy add-ons from original
      addon_details: originalEnquiry.addon_details, // Copy add-on details
      message: originalEnquiry.message || `Replacement supplier for ${replacement.oldSupplier.name}`,
      special_requests: originalEnquiry.special_requests,
      quoted_price: replacement.newSupplier.price,
      status: 'pending' // New enquiry is pending
      // Removed the columns that don't exist yet
    }
    

    
    // Insert new enquiry
    const { data: newEnquiry, error: insertError } = await supabase
      .from('enquiries')
      .insert(newEnquiryData)
      .select(`
        *,
        suppliers:supplier_id (
          id,
          business_name,
          data
        )
      `)
      .single()
      
    if (insertError) throw insertError
    
    // Update original enquiry to mark it as processed (using existing columns)
    await supabase
      .from('enquiries')
      .update({ 
        replacement_processed: true, // This column should exist from earlier
        updated_at: new Date().toISOString()
      })
      .eq('id', originalEnquiryId)
    

    
    return {
      success: true,
      newEnquiry: newEnquiry,
      message: `New enquiry sent to ${replacement.newSupplier.name}`
    }
    
  } catch (error) {
    console.error('❌ Error sending enquiry to replacement supplier:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
/**
 * Apply approved replacement to party plan - FIXED VERSION
 */
async applyReplacementToParty(partyId, replacement, originalEnquiryId = null) {
  try {
   
    
    // Get current party
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single()
    
    if (fetchError) throw fetchError
    
    const currentPlan = party.party_plan || {}
    
    // Map category to supplier type
    let supplierType = this.mapCategoryToSupplierType(replacement.category)

    if (!supplierType) {

      // ✅ FIX: Exclude einvites and addons when finding supplier keys
      const planKeys = Object.keys(currentPlan).filter(key => key !== 'addons' && key !== 'einvites')
      const matchingKey = planKeys.find(key => {
        const supplier = currentPlan[key]
        return supplier && (
          supplier.id === replacement.oldSupplier.id ||
          supplier.name === replacement.oldSupplier.name
        )
      })
      
      if (matchingKey) {
        supplierType = matchingKey
      
      } else {
        const possibleTypes = ['entertainment', 'venue', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons', 'photography']
        supplierType = possibleTypes.find(type => 
          type.toLowerCase() === replacement.category.toLowerCase()
        ) || 'entertainment'
        

      }
    }
    
    // Create new supplier data
    const newSupplierData = {
      id: replacement.newSupplier.id,
      name: replacement.newSupplier.name,
      description: replacement.newSupplier.description,
      price: replacement.newSupplier.price,
      status: "pending", // Important: pending since we're sending new enquiry
      image: replacement.newSupplier.image,
      category: replacement.category,
      priceUnit: "per event",
      addedAt: new Date().toISOString(),
      replacedAt: new Date().toISOString(),
      replacementReason: replacement.reason,
      originalSupplier: replacement.oldSupplier
    }
    
    // Replace the supplier in the plan
    currentPlan[supplierType] = newSupplierData
    
    // Update the party plan
    const result = await this.updatePartyPlan(partyId, currentPlan)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    // Send enquiry to replacement supplier
    let newEnquiry = null
    if (originalEnquiryId) {
      const enquiryResult = await this.sendEnquiryToReplacementSupplier(partyId, replacement, originalEnquiryId)
      if (enquiryResult.success) {
        newEnquiry = enquiryResult.newEnquiry

      } else {
        console.error('❌ Failed to send enquiry to replacement:', enquiryResult.error)
        // Don't fail the whole process if enquiry fails
      }
    }
    

    
    return {
      success: true,
      newSupplier: newSupplierData,
      supplierType: supplierType,
      party: result.party,
      newEnquiry: newEnquiry
    }
    
  } catch (error) {
    console.error('❌ Error applying replacement to party:', error)
    return { success: false, error: error.message }
  }
}


async saveEInvites(partyId, einviteData) {
  try {
 
    
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentPlan = party.party_plan || {};


    // Generate unique invite ID if not exists
    if (!einviteData.inviteId) {
      einviteData.inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Create the e-invites data structure
    const einvitesData = {
      ...einviteData,
      id: "digital-invites",
      name: `${einviteData.inviteData?.childName || 'Child'}'s Digital Invites`,
      description: einviteData.generationType === 'ai' 
        ? `Custom AI-generated digital invitations`
        : `Custom ${einviteData.theme} themed digital invitations`,
      price: 25,
      status: "completed",
      image: einviteData.image || einviteData.generatedImage,
      category: "Digital Services",
      priceUnit: "per set",
      theme: einviteData.theme,
      inviteData: einviteData.inviteData,
      guestList: einviteData.guestList || [],
      shareableLink: einviteData.shareableLink || "",
      generationType: einviteData.generationType || "template",
      addedAt: currentPlan.einvites?.addedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

 
    // Update party plan with e-invites
    currentPlan.einvites = einvitesData;

    const { data, error } = await supabase
      .from('parties')
      .update({ party_plan: currentPlan })
      .eq('id', partyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating party plan:', error);
      return { success: false, error: error.message };
    }


    return { success: true, einvites: einvitesData, party: data };
  } catch (error) {
    console.error('❌ Error in saveEInvites:', error);
    return { success: false, error: error.message };
  }
}
/**
 * Get e-invites data for a party
 */
async getEInvites(partyId) {
  try {
    
    
    const { data: party, error } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (error) {
      console.error('❌ Error fetching party:', error);
      return { success: false, error: error.message };
    }

    const einvites = party.party_plan?.einvites || null;

    return { success: true, einvites };
  } catch (error) {
    console.error('❌ Error in getEInvites:', error);
    return { success: false, error: error.message };
  }
}
async createPublicInvite(inviteData) {
  try {


    const publicInvite = {
      id: inviteData.inviteId,
      invite_slug: inviteData.inviteSlug, // Add the friendly slug
      theme: inviteData.theme || 'party',
      invite_data: {
        partyId: inviteData.partyId, // Store party ID in the JSONB
        theme: inviteData.theme,
        inviteData: inviteData.inviteData,
        generatedImage: inviteData.generatedImage,
        generationType: inviteData.generationType,
        shareableLink: inviteData.shareableLink,
      },
      generated_image: inviteData.generatedImage,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data, error} = await supabase
      .from('public_invites')
      .upsert(publicInvite, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating public invite:', error);
      return { success: false, error: error.message };
    }

    return { success: true, publicInvite: data };
  } catch (error) {
    console.error('❌ Error in createPublicInvite:', error);
    return { success: false, error: error.message };
  }
}
async checkInviteSlugExists(slug) {
  try {
    const { data, error } = await supabase
      .from('public_invites')
      .select('id')
      .eq('invite_slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking slug:', error);
      return false; // Assume it doesn't exist on error
    }

    return !!data; // Returns true if slug exists, false otherwise
  } catch (error) {
    console.error('❌ Error in checkInviteSlugExists:', error);
    return false;
  }
}
async getPublicInvite(inviteIdOrSlug) {
  try {


    // Try to find by slug first (friendly URL), then by ID (legacy support)
    let query = supabase
      .from('public_invites')
      .select('*')
      .eq('is_active', true);

    // Check if it looks like a slug (contains dashes and date format) or an ID
    const looksLikeSlug = inviteIdOrSlug.includes('-') && /\d{4}-\d{2}-\d{2}/.test(inviteIdOrSlug);

    if (looksLikeSlug) {
      query = query.eq('invite_slug', inviteIdOrSlug);
    } else {
      query = query.eq('id', inviteIdOrSlug);
    }

    const { data: invite, error } = await query.single();

    if (error) {
      console.error('❌ [Backend] Error fetching public invite:', error);
      
      // More specific error handling
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Invitation not found. It may have expired or been removed.',
          invite: null
        };
      }
      
      return {
        success: false,
        error: `Failed to load invitation: ${error.message}`,
        invite: null
      };
    }


    
    // Parse the invite_data JSON
    let parsedInviteData = {};
    try {
      parsedInviteData = typeof invite.invite_data === 'string' 
        ? JSON.parse(invite.invite_data) 
        : invite.invite_data;
    } catch (parseError) {
      console.error('⚠️ [Backend] Error parsing invite_data:', parseError);
      parsedInviteData = {};
    }

    // Get party details if we have a party ID
    let partyDetails = null;
    const partyId = parsedInviteData?.partyId;
    
    if (partyId) {
      
      const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('child_name, party_date, party_time, location, theme, special_requirements, party_plan')
        .eq('id', partyId)
        .single();

      if (!partyError && party) {

        partyDetails = party;
      }
    }

    // Structure the response to match what the frontend expects
    const structuredInvite = {
      id: invite.id,
      theme: invite.theme,
      generated_image: invite.generated_image,
      invite_data: parsedInviteData,
      created_at: invite.created_at,
      is_active: invite.is_active,
      // Add party details if available
      parties: partyDetails
    };

    return { 
      success: true, 
      invite: structuredInvite 
    };
    
  } catch (error) {
    console.error('❌ [Backend] Exception in getPublicInvite:', error);
    return {
      success: false,
      error: `Failed to load invitation: ${error.message}`,
      invite: null
    };
  }
}
/**
 * Look up guest by RSVP code and return invite + guest details
 */
async getInviteByRSVPCode(rsvpCode) {
  try {

    // Use PostgreSQL JSONB query to search directly in the database
    // This is MUCH faster than fetching all parties and iterating through them
    const { data: parties, error: partiesError } = await supabase
      .from('parties')
      .select('id, child_name, party_date, party_time, location, theme, party_plan, status')
      .not('status', 'eq', 'cancelled')
      .contains('party_plan', {
        einvites: {
          guestList: [{ rsvpCode }]
        }
      })
      .limit(1);

    if (partiesError) {
      console.error('❌ Error fetching parties:', partiesError);
      return { success: false, error: partiesError.message };
    }

    if (!parties || parties.length === 0) {
      return {
        success: false,
        error: 'Invalid or expired RSVP link',
        guest: null,
        party: null
      };
    }

    // Found the party, now extract the specific guest
    const matchedParty = parties[0];
    const guestList = matchedParty.party_plan?.einvites?.guestList || [];
    const matchedGuest = guestList.find(g => g.rsvpCode === rsvpCode);

    if (!matchedGuest) {
      return {
        success: false,
        error: 'Invalid or expired RSVP link',
        guest: null,
        party: null
      };
    }

    // Get the public invite for this party (if it exists)
    // Note: We need to check if invite_data is a JSONB column
    const { data: allInvites, error: inviteError } = await supabase
      .from('public_invites')
      .select('*')
      .eq('is_active', true);

    if (inviteError) {
      console.error('⚠️ Error fetching public invites:', inviteError);
    }

    // Find the invite that matches this party ID
    let publicInvite = null;
    if (allInvites && allInvites.length > 0) {
      publicInvite = allInvites.find(invite => {
        const inviteData = typeof invite.invite_data === 'string'
          ? JSON.parse(invite.invite_data)
          : invite.invite_data;
        return inviteData?.partyId === matchedParty.id;
      });
    }

    return {
      success: true,
      guest: matchedGuest,
      party: matchedParty,
      invite: publicInvite,
      inviteDetails: {
        id: publicInvite?.id,
        theme: publicInvite?.theme || matchedParty.theme,
        generatedImage: publicInvite?.generated_image,
        partyId: matchedParty.id,
        inviteData: {
          childName: matchedParty.child_name,
          age: matchedParty.party_plan?.child_age || '',
          date: matchedParty.party_date,
          time: matchedParty.party_time,
          venue: matchedParty.location
        }
      }
    };

  } catch (error) {
    console.error('❌ Error in getInviteByRSVPCode:', error);
    return {
      success: false,
      error: error.message,
      guest: null,
      party: null
    };
  }
}
async findGiftRegistryForParty(partyId) {
  try {
    // Find existing registry by party ID
    const { data: registry, error: registryError } = await supabase
      .from('party_gift_registries')
      .select('*')
      .eq('party_id', partyId)
      .eq('is_active', true)
      .single()
    
    if (!registryError && registry) {
     
      return {
        success: true,
        registry: registry,
        method: 'found_by_party_id'
      }
    }
    

    return {
      success: false,
      error: 'No gift registry found for this party',
      registry: null,
      method: 'not_found'
    }
    
  } catch (error) {
    console.error('❌ [Backend] Error finding gift registry:', error)
    return {
      success: false,
      error: error.message,
      registry: null,
      method: 'error'
    }
  }
}
/**
 * Get the correct gift registry URL for a party
 */
async getGiftRegistryUrlForParty(partyId) {
  try {
    const result = await this.findGiftRegistryForParty(partyId)
    
    if (result.success && result.registry) {
      return {
        success: true,
        url: `/gift-registry/${result.registry.id}/preview`,
        registryId: result.registry.id,
        method: result.method
      }
    }
    

    return {
      success: true,
      url: `/gift-registry/d8588236-6060-4501-9627-19b8f3c5b428/preview`,
      registryId: 'd8588236-6060-4501-9627-19b8f3c5b428',
      method: 'hardcoded_fallback'
    }
    
  } catch (error) {
    console.error('❌ [Backend] Error getting registry URL:', error)
    return {
      success: false,
      error: error.message,
      url: null
    }
  }
}
/**
 * Track RSVP for an invite
 */
async submitRSVP(inviteId, rsvpData) {
  try {

    
    const rsvp = {
      invite_id: inviteId,
      guest_name: rsvpData.guestName,
      guest_email: rsvpData.guestEmail,
      guest_phone: rsvpData.guestPhone,
      attendance: rsvpData.attendance, // 'yes', 'no', 'maybe'
      adults_count: rsvpData.adultsCount || 1,
      children_count: rsvpData.childrenCount || 0,
      dietary_requirements: rsvpData.dietaryRequirements || '',
      message: rsvpData.message || '',
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('rsvps')
      .upsert(rsvp, { 
        onConflict: 'invite_id,guest_email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error submitting RSVP:', error);
      return { success: false, error: error.message };
    }


    return { success: true, rsvp: data };
  } catch (error) {
    console.error('❌ Error in submitRSVP:', error);
    return { success: false, error: error.message };
  }
}
/**
 * Get RSVPs for a party
 * Updated to work with existing public_invites schema
 */
async getPartyRSVPs(partyId) {
  try {

    
    // Get all active invites with their JSONB data in ONE query
    const { data: invites, error: invitesError } = await supabase
      .from('public_invites')
      .select('id, invite_data')
      .eq('is_active', true);

    if (invitesError) {
      console.error('❌ Error fetching invites:', invitesError);
      return { success: false, error: invitesError.message };
    }

    // Filter invites in JavaScript (much faster than individual DB queries)
    const partyInviteIds = invites
      .filter(invite => invite.invite_data?.partyId === partyId)
      .map(invite => invite.id);

    if (partyInviteIds.length === 0) {
      return { success: true, rsvps: [] };
    }

    // Get RSVPs for these invites in ONE query
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('*')
      .in('invite_id', partyInviteIds)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching RSVPs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, rsvps: rsvps || [] };
  } catch (error) {
    console.error('❌ Error in getPartyRSVPs:', error);
    return { success: false, error: error.message };
  }
}
/**
 * Update guest list with send status
 */
async updateGuestStatus(partyId, guestId, newStatus) {
  try {

    
    // Get the party data first
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Get current party plan structure
    const currentPlan = party.party_plan || {};
    const einvites = currentPlan.einvites || {};
    const guestList = einvites.guestList || [];

    // Find and update the specific guest
    let guestFound = false;
    const updatedGuestList = guestList.map(guest => {
      if (guest.id === guestId) {
        guestFound = true;
        return {
          ...guest,
          attendance: newStatus, // 'pending', 'yes', 'no', 'maybe'
          status: newStatus === 'pending' ? guest.status : 'responded', // Keep track if they've responded
          updated_at: new Date().toISOString(),
          manually_updated: true // Flag to show this was manually updated
        };
      }
      return guest;
    });

    if (!guestFound) {
      console.error('❌ Guest not found in list:', guestId);
      return { success: false, error: 'Guest not found in party guest list' };
    }

    // Update the party plan with new guest list
    const updatedPlan = {
      ...currentPlan,
      einvites: {
        ...einvites,
        guestList: updatedGuestList,
        updatedAt: new Date().toISOString(),
      }
    };

    // Save back to database
    const { data, error } = await supabase
      .from('parties')
      .update({ party_plan: updatedPlan })
      .eq('id', partyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating guest status:', error);
      return { success: false, error: error.message };
    }


    return { 
      success: true, 
      party: data,
      updatedGuest: updatedGuestList.find(g => g.id === guestId)
    };
    
  } catch (error) {
    console.error('❌ Error in updateGuestStatus:', error);
    return { success: false, error: error.message };
  }
}
/**
 * Get guest list with RSVP statuses for a party
 * This combines manually added guests with any actual RSVP submissions
 */
async getPartyGuestList(partyId) {
  try {
    // Get the party data
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentPlan = party.party_plan || {};
    const einvites = currentPlan.einvites || {};
    const guestList = einvites.guestList || [];

    // Also get any actual RSVP submissions to cross-reference
    const rsvpResult = await this.getPartyRSVPs(partyId);
    const actualRSVPs = rsvpResult.success ? rsvpResult.rsvps : [];

    // Merge guest list with actual RSVP data
    const mergedGuestList = guestList.map(guest => {
      // Look for matching RSVP submission
      const matchingRSVP = actualRSVPs.find(rsvp => 
        rsvp.guest_email === guest.contact || 
        rsvp.guest_phone === guest.contact ||
        rsvp.guest_name.toLowerCase() === guest.name.toLowerCase()
      );

      if (matchingRSVP) {
        // If there's an actual RSVP submission, prioritize that data
        return {
          ...guest,
          attendance: matchingRSVP.attendance,
          adults_count: matchingRSVP.adults_count,
          children_count: matchingRSVP.children_count,
          dietary_requirements: matchingRSVP.dietary_requirements,
          message: matchingRSVP.message,
          guest_email: matchingRSVP.guest_email,
          guest_phone: matchingRSVP.guest_phone,
          submitted_at: matchingRSVP.submitted_at,
          has_actual_rsvp: true
        };
      }

      return {
        ...guest,
        attendance: guest.attendance || 'pending',
        has_actual_rsvp: false
      };
    });

    return {
      success: true,
      guests: mergedGuestList,
      totalGuests: mergedGuestList.length,
      actualRSVPs: actualRSVPs.length
    };
    
  } catch (error) {
    console.error('❌ Error in getPartyGuestList:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add a new guest to the party guest list
 */
async addGuestToList(partyId, guestData) {
  try {
    // Get current party data
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentPlan = party.party_plan || {};
    const einvites = currentPlan.einvites || {};
    const guestList = einvites.guestList || [];

    // Create new guest object
    const newGuest = {
      id: Date.now(), // Simple ID for now
      name: guestData.name,
      email: guestData.email || '',
      contact: guestData.contact || guestData.email || '',
      type: guestData.type || 'email',
      adults_count: guestData.adults_count || 1,
      children_count: guestData.children_count || 0,
      notes: guestData.notes || '',
      attendance: 'pending',
      status: 'pending',
      manually_added: true,
      added_at: new Date().toISOString()
    };

    // Add to guest list
    const updatedGuestList = [...guestList, newGuest];

    // Update party plan
    const updatedPlan = {
      ...currentPlan,
      einvites: {
        ...einvites,
        guestList: updatedGuestList,
        updatedAt: new Date().toISOString(),
      }
    };

    // Save to database
    const { data, error } = await supabase
      .from('parties')
      .update({ party_plan: updatedPlan })
      .eq('id', partyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding guest:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      party: data,
      newGuest: newGuest
    };
    
  } catch (error) {
    console.error('❌ Error in addGuestToList:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a guest from the party guest list
 */
async removeGuestFromList(partyId, guestId) {
  try {
  
    
    // Get current party data
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentPlan = party.party_plan || {};
    const einvites = currentPlan.einvites || {};
    const guestList = einvites.guestList || [];

    // Remove the guest from the list
    const updatedGuestList = guestList.filter(guest => guest.id !== guestId);

    // Update party plan
    const updatedPlan = {
      ...currentPlan,
      einvites: {
        ...einvites,
        guestList: updatedGuestList,
        updatedAt: new Date().toISOString(),
      }
    };

    // Save to database
    const { data, error } = await supabase
      .from('parties')
      .update({ party_plan: updatedPlan })
      .eq('id', partyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error removing guest:', error);
      return { success: false, error: error.message };
    }


    return { 
      success: true, 
      party: data,
      remainingGuests: updatedGuestList.length
    };
    
  } catch (error) {
    console.error('❌ Error in removeGuestFromList:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get RSVP analytics for a party
 */
async getRSVPAnalytics(partyId) {
  try {

    
    const result = await this.getPartyRSVPs(partyId);
    if (!result.success) {
      return result;
    }

    const rsvps = result.rsvps;
    const analytics = {
      totalRSVPs: rsvps.length,
      yesRSVPs: rsvps.filter(r => r.attendance === 'yes').length,
      noRSVPs: rsvps.filter(r => r.attendance === 'no').length,
      maybeRSVPs: rsvps.filter(r => r.attendance === 'maybe').length,
      totalExpectedGuests: rsvps
        .filter(r => r.attendance === 'yes' || r.attendance === 'maybe')
        .reduce((sum, rsvp) => sum + (rsvp.adults_count || 0) + (rsvp.children_count || 0), 0),
      confirmedGuests: rsvps
        .filter(r => r.attendance === 'yes')
        .reduce((sum, rsvp) => sum + (rsvp.adults_count || 0) + (rsvp.children_count || 0), 0),
      dietaryRequirements: rsvps
        .filter(r => r.dietary_requirements && r.dietary_requirements.trim())
        .map(r => ({ name: r.guest_name, requirements: r.dietary_requirements })),
      recentRSVPs: rsvps.slice(0, 5)
    };

    return { success: true, analytics };
  } catch (error) {
    console.error('❌ Error getting RSVP analytics:', error);
    return { success: false, error: error.message };
  }
}
/**
 * Submit RSVP for an invite
 */
async submitRSVP(inviteId, rsvpData) {
  try {


    const rsvp = {
      invite_id: inviteId,
      guest_name: rsvpData.guestName,
      child_name: rsvpData.childName,
      guest_email: rsvpData.guestEmail,
      guest_phone: rsvpData.guestPhone,
      attendance: rsvpData.attendance,
      adults_count: rsvpData.adultsCount || 1,
      children_count: rsvpData.childrenCount || 0,
      dietary_requirements: rsvpData.dietaryRequirements || '',
      message: rsvpData.message || '',
      submitted_at: new Date().toISOString(),
    };



    // Use insert instead of upsert - each child's RSVP should be separate
    // If they RSVP again, it creates a new entry (we can track changes over time)
    const { data, error } = await supabase
      .from('rsvps')
      .insert(rsvp)
      .select()
      .single();



    if (error) {
      console.error('❌ Database error:', error);
      return { success: false, error: error.message };
    }

    // If rsvpCode is provided, update the guest's status in party_plan
    if (rsvpData.rsvpCode && rsvpData.partyId) {
      try {
        const { data: party, error: fetchError } = await supabase
          .from('parties')
          .select('party_plan')
          .eq('id', rsvpData.partyId)
          .single();

        if (!fetchError && party) {
          const currentPlan = party.party_plan || {};
          const einvites = currentPlan.einvites || {};
          const guestList = einvites.guestList || [];

          // Update the guest's status
          const updatedGuestList = guestList.map(guest => {
            if (guest.rsvpCode === rsvpData.rsvpCode) {
              return {
                ...guest,
                status: rsvpData.attendance,
                rsvpSubmittedAt: new Date().toISOString(),
                guestName: rsvpData.guestName,
                guestEmail: rsvpData.guestEmail,
                adultsCount: rsvpData.adultsCount || 1,
                childrenCount: rsvpData.childrenCount || 0,
                dietaryRequirements: rsvpData.dietaryRequirements || '',
                message: rsvpData.message || ''
              };
            }
            return guest;
          });

          // Save updated guest list
          const updatedPlan = {
            ...currentPlan,
            einvites: {
              ...einvites,
              guestList: updatedGuestList,
              updatedAt: new Date().toISOString()
            }
          };

          await supabase
            .from('parties')
            .update({ party_plan: updatedPlan })
            .eq('id', rsvpData.partyId);
        }
      } catch (updateError) {
        console.error('⚠️ Error updating guest status in party_plan:', updateError);
        // Don't fail the whole operation if this update fails
      }
    }

    return { success: true, rsvp: data };
  } catch (error) {
    console.error('❌ Error in submitRSVP:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if party has created e-invites
 */

async hasCreatedEInvites(partyId) {
  try {
    const result = await this.getEInvites(partyId);
    return {
      success: true,
      hasCreated: result.success && result.einvites !== null
    };
  } catch (error) {
    console.error('❌ Error checking e-invites status:', error);
    return { success: false, error: error.message };
  }
}
async hasPartyPendingEnquiries(partyId) {
  try {
    
    
    const { data: enquiries, error } = await supabase
      .from('enquiries')
      .select('id, status, supplier_category, created_at')
      .eq('party_id', partyId)
      .eq('status', 'pending') // Only check for pending enquiries
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error checking pending enquiries:', error);
      return { success: false, error: error.message, hasPending: false, count: 0 };
    }

    const hasPending = enquiries && enquiries.length > 0;
    

    
    return {
      success: true,
      hasPending: hasPending,
      count: enquiries?.length || 0,
      enquiries: enquiries || []
    };
    
  } catch (error) {
    console.error('❌ Exception checking pending enquiries:', error);
    return { success: false, error: error.message, hasPending: false, count: 0 };
  }
}

/**
 * Check if party is in awaiting response stage
 */
async isPartyAwaitingResponses(partyId) {
  try {

    
    // Get party status first
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('status')
      .eq('id', partyId)
      .single();

    if (partyError) {
      console.error('❌ Error fetching party status:', partyError);
      return { success: false, error: partyError.message, isAwaiting: false };
    }

    // If party status is 'planned', it means enquiries have been sent
    if (party.status === 'planned') {
      const enquiryResult = await this.hasPartyPendingEnquiries(partyId);
      
      if (enquiryResult.success && enquiryResult.hasPending) {
        return {
          success: true,
          isAwaiting: true,
          pendingCount: enquiryResult.count,
          enquiries: enquiryResult.enquiries
        };
      }
    }

 
    return {
      success: true,
      isAwaiting: false,
      pendingCount: 0,
      enquiries: []
    };
    
  } catch (error) {
    console.error('❌ Exception checking if party is awaiting responses:', error);
    return { success: false, error: error.message, isAwaiting: false };
  }
}

/**
 * Get current party ID from user session
 */
async getCurrentPartyId() {
  try {
    const partyResult = await this.getCurrentParty();
    
    if (partyResult.success && partyResult.party) {
      return {
        success: true,
        partyId: partyResult.party.id
      };
    }
    
    return {
      success: false,
      error: 'No current party found',
      partyId: null
    };
    
  } catch (error) {
    console.error('❌ Error getting current party ID:', error);
    return {
      success: false,
      error: error.message,
      partyId: null
    };
  }
}
// In your partyDatabaseBackend
async getPartyFromInviteId(inviteId) {
  // Get the public invite first
  const publicInvite = await this.getPublicInvite(inviteId)
  if (!publicInvite.success) return publicInvite
  
  // Get the party ID from the invite
  const partyId = publicInvite.invite.party_id || publicInvite.invite.partyId
  
  // Return the party data
  return this.getPartyById(partyId)
}
async getUserParties(userId) {
  try {
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { success: true, parties: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
/**
 * Add a guest to the party's guest list (simple child name only)
 */
async addPartyGuest(partyId, guestData) {
  try {
    // Import the code generator
    const { generateRSVPCode } = await import('./generateRSVPCode.js')

    // Get current party data
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentPlan = party.party_plan || {};
    const einvites = currentPlan.einvites || {};
    const guestList = einvites.guestList || [];

    // Generate unique RSVP code
    let rsvpCode = generateRSVPCode()

    // Ensure uniqueness within this party
    while (guestList.some(g => g.rsvpCode === rsvpCode)) {
      rsvpCode = generateRSVPCode()
    }

    // Create new guest object with RSVP code and sent status
    const newGuest = {
      id: `guest_${Date.now()}`, // Simple unique ID
      childName: guestData.childName.trim(),
      added_at: new Date().toISOString(),
      status: 'pending',
      rsvpCode: rsvpCode, // ✅ NEW: Unique RSVP code
      inviteSent: false, // ✅ NEW: Track if invite has been sent
      sentAt: null // ✅ NEW: When invite was sent
    };

    // Add to guest list
    const updatedGuestList = [...guestList, newGuest];

    // Update party plan
    const updatedPlan = {
      ...currentPlan,
      einvites: {
        ...einvites,
        guestList: updatedGuestList,
        updatedAt: new Date().toISOString(),
      }
    };

    // Save to database
    const { data, error } = await supabase
      .from('parties')
      .update({ party_plan: updatedPlan })
      .eq('id', partyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding guest:', error);
      return { success: false, error: error.message };
    }


    return { 
      success: true, 
      guest: newGuest
    };
    
  } catch (error) {
    console.error('❌ Error in addPartyGuest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all guests for a party
 */
async getPartyGuests(partyId) {
  try {


    // Get the party data
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentPlan = party.party_plan || {};
    const einvites = currentPlan.einvites || {};
    const guestList = einvites.guestList || [];


    return {
      success: true,
      guests: guestList
    };

  } catch (error) {
    console.error('❌ Error in getPartyGuests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark a guest invite as sent
 */
async markGuestInviteSent(partyId, guestId, platform) {
  try {
    // Get current party data
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentPlan = party.party_plan || {};
    const einvites = currentPlan.einvites || {};
    const guestList = einvites.guestList || [];

    // Find and update the guest
    const updatedGuestList = guestList.map(guest => {
      if (guest.id === guestId) {
        return {
          ...guest,
          inviteSent: true,
          sentAt: new Date().toISOString(),
          sentVia: platform
        };
      }
      return guest;
    });

    // Update party plan
    const updatedPlan = {
      ...currentPlan,
      einvites: {
        ...einvites,
        guestList: updatedGuestList,
        updatedAt: new Date().toISOString(),
      }
    };

    // Save to database
    const { data, error } = await supabase
      .from('parties')
      .update({ party_plan: updatedPlan })
      .eq('id', partyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error marking invite as sent:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      guest: updatedGuestList.find(g => g.id === guestId)
    };

  } catch (error) {
    console.error('❌ Error in markGuestInviteSent:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a guest from the party guest list
 */
async removePartyGuest(partyId, guestId) {
  try {

    
    // Get current party data
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('party_plan')
      .eq('id', partyId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching party:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentPlan = party.party_plan || {};
    const einvites = currentPlan.einvites || {};
    const guestList = einvites.guestList || [];

    // Remove the guest from the list
    const updatedGuestList = guestList.filter(guest => guest.id !== guestId);

    if (updatedGuestList.length === guestList.length) {
      console.error('❌ Guest not found:', guestId);
      return { success: false, error: 'Guest not found' };
    }

    // Update party plan
    const updatedPlan = {
      ...currentPlan,
      einvites: {
        ...einvites,
        guestList: updatedGuestList,
        updatedAt: new Date().toISOString(),
      }
    };

    // Save to database
    const { data, error } = await supabase
      .from('parties')
      .update({ party_plan: updatedPlan })
      .eq('id', partyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error removing guest:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
    
  } catch (error) {
    console.error('❌ Error in removePartyGuest:', error);
    return { success: false, error: error.message };
  }
}
}
// Create singleton instance
export const partyDatabaseBackend = new PartyDatabaseBackend()

// Export the class for direct use if needed
export default PartyDatabaseBackend