// utils/partyDatabaseBackend.js
// Database backend to replace localStorage party management

import { supabase } from '@/lib/supabase'
import { getEnhancedGiftSuggestions } from './rapidAPIProducts'

class PartyDatabaseBackend {

  isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }
  
  // ================== USER MANAGEMENT ==================
  
  /**
   * Create or get user profile
   */
  async createOrGetUser(userData) {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      
      const userId = authUser?.user?.id
      if (!userId) throw new Error("No authenticated user")
  
      console.log('🔍 Creating/getting user for auth_user_id:', userId)
  
      // Check if user profile exists for THIS auth user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)  // Filter by current user's ID
        .maybeSingle()
  
      if (fetchError) throw fetchError
  
      if (existingUser) {
        console.log('✅ User profile already exists:', existingUser.id)
        
        // Update the existing profile with any new data
        const updateData = {
          email: userData.email || authUser.user.email,
          first_name: userData.firstName || existingUser.first_name,
          last_name: userData.lastName || existingUser.last_name,
          phone: userData.phone || existingUser.phone,
          postcode: userData.postcode || existingUser.postcode,
          updated_at: new Date().toISOString()
        }
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        console.log('✅ Updated existing user profile')
        return { success: true, user: updatedUser }
      }
  
      // Create new user profile
      const newUserData = {
        auth_user_id: userId,  // Link to current auth user
        email: userData.email || authUser.user.email,
        first_name: userData.firstName || 'User',
        last_name: userData.lastName || '',
        phone: userData.phone || '',
        postcode: userData.postcode || ''
      }
      
      console.log('📝 Creating new user profile:', newUserData)
  
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single()
  
      if (createError) throw createError
  
      console.log('✅ User profile created:', newUser.id)
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
      if (authError) throw authError
      
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
        console.log('⚠️ No customer profile found for auth_user_id:', userId)
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
      console.log('🔍 Getting party by ID:', partyId);
      
      const { data: party, error } = await supabase
        .from('parties')
        .select('*')
        .eq('id', partyId)
        .single();
  
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Party not found:', partyId);
          return { success: false, error: 'Party not found' };
        }
        throw error;
      }
  
      console.log('✅ Party found:', party.child_name);
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
        theme: partyDetails.theme,
        budget: partyDetails.budget,
        special_requirements: partyDetails.specialRequirements,
        party_plan: partyPlan,
        estimated_cost: this.calculatePartyPlanCost(partyPlan),
        status: 'draft'
      }

  

      const { data: newParty, error } = await supabase
        .from('parties')
        .insert(party)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Party created:', newParty.id)
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
        .in('status', ['draft', 'planned'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      return { success: true, party }

    } catch (error) {
      console.error('❌ Error getting current party:', error)
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

      console.log('✅ Party plan updated:', partyId)
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

      console.log('✅ Party payment status updated:', partyId)
      return { success: true, party: updatedParty }

    } catch (error) {
      console.error('❌ Error updating party payment status:', error)
      return { success: false, error: error.message }
    }
  }

  // Add this to your partyDatabaseBackend
async updateEnquiriesPaymentStatus(partyId, includedSuppliers) {
  try {
    console.log('🔄 Updating enquiry payment status for:', { partyId, includedSuppliers })
    
    // Update enquiries for suppliers that were included in this payment
    const { data: updatedEnquiries, error } = await supabase
      .from('enquiries')
      .update({ 
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('party_id', partyId)
      .in('supplier_category', includedSuppliers)
      .eq('status', 'accepted') // Only update accepted enquiries
      .select()

    if (error) throw error

    console.log(`✅ Updated payment status for ${updatedEnquiries.length} enquiries`)
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
    console.log('🔧 createEnquiry - creating AUTO-ACCEPTED enquiry')
    
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

    console.log('📝 Creating enquiry with status:', enquiryData.status)

    const { data: enquiry, error } = await supabase
      .from('enquiries')
      .insert(enquiryData)
      .select()
      .single()

    if (error) throw error

    console.log('✅ Created auto-accepted enquiry:', {
      id: enquiry.id,
      status: enquiry.status,
      auto_accepted: enquiry.auto_accepted
    })
    
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

    console.log('🎂 Processing supplier with potential cake customization:', {
      supplierName: supplier.name,
      packageType,
      supplierTypeEnhanced,
      hasCakeCustomization: !!cakeCustomization,
      cakeData: cakeCustomization
    })
       
    // ✅ ENHANCED: Create supplier data with cake customization
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
      
      console.log('🎂 Added cake customization to supplier data:', {
        flavor: cakeCustomization.flavorName,
        message: cakeCustomization.message,
        updatedDescription: supplierData.description
      })
    }
       
    // Update the plan
    currentPlan[supplierType] = supplierData
       
    // Save updated plan
    const result = await this.updatePartyPlan(partyId, currentPlan)
           
    if (result.success) {
      console.log('✅ Supplier added to party plan with customization data')
         
      return {
        success: true,
        supplierType,
        supplier: supplierData,
        party: result.party,
        enquiry: null,
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
    console.log('📧 Sending individual enquiry:', {
      partyId,
      supplierName: supplier.name,
      supplierId: supplier.id,
      packageId: selectedPackage?.id,
      hasCakeCustomization: !!selectedPackage?.cakeCustomization
    })

    // ✅ EMERGENCY FIX: Add category if missing
    if (!supplier.category) {
      console.log('🚨 EMERGENCY: supplier.category is undefined in sendIndividualEnquiry, adding it')
      supplier.category = 'Entertainment'
      console.log('🔧 Fixed supplier.category for enquiry:', supplier.category)
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
       
    console.log(`📦 Found ${relevantAddons.length} relevant add-ons for enquiry`)
       
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
      
      console.log('🎂 Added cake customization to enquiry message')
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
       
    console.log('📤 Creating individual enquiry with customization:', enquiryData)
       
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
       
    console.log('✅ Individual enquiry created successfully with cake customization:', newEnquiry.id)
       
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
      console.log('🎁 Adding addon to database party:', { partyId, addonId: addon.id, addonName: addon.name })

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
        console.log('⚠️ Addon already exists, updating instead')
        // Update existing addon instead of returning error
        currentPlan.addons[existingAddonIndex] = {
          ...currentPlan.addons[existingAddonIndex],
          ...addonData,
          updatedAt: new Date().toISOString()
        }
      } else {
        console.log('➕ Adding new addon to database')
        // Add to addons array
        currentPlan.addons.push(addonData)
      }

      // Save updated plan
      const result = await this.updatePartyPlan(partyId, currentPlan)
      
      if (result.success) {
        console.log('✅ Addon operation completed successfully')
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
      console.log('🗑️ Removing addon from database party:', { partyId, addonId })

      // Get current party
      const { data: party, error: fetchError } = await supabase
        .from('parties')
        .select('party_plan')
        .eq('id', partyId)
        .single()

      if (fetchError) throw fetchError

      const currentPlan = party.party_plan || {}
      
      if (!currentPlan.addons) {
        console.log('⚠️ No addons found in party plan')
        return { success: false, error: 'No addons found in party plan' }
      }

      const addonIndex = currentPlan.addons.findIndex(addon => addon.id === addonId)
      
      if (addonIndex === -1) {
        console.log('⚠️ Addon not found in party plan')
        return { success: false, error: 'Add-on not found in party plan' }
      }
      
      console.log('✅ Addon found, removing from database')
      const removedAddon = currentPlan.addons[addonIndex]
      currentPlan.addons.splice(addonIndex, 1)

      // Save updated plan
      const result = await this.updatePartyPlan(partyId, currentPlan)
      
      if (result.success) {
        console.log('✅ Addon removal completed successfully')
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
      const enquiries = []

      // Categories to exclude from enquiries
      const excludeCategories = ['einvites', 'addons']

      console.log('🔍 Processing party plan for enquiries:', Object.keys(partyPlan))

      // Create enquiries for each supplier in the party plan
      for (const [category, supplierInfo] of Object.entries(partyPlan)) {
        // Skip excluded categories
        if (excludeCategories.includes(category)) {
          console.log(`⏭️ Skipping ${category} (excluded category)`)
          continue
        }

        // Skip if no supplier
        if (!supplierInfo || !supplierInfo.name) {
          console.log(`⏭️ Skipping ${category} (no supplier info)`)
          continue
        }

        console.log(`🔍 Resolving supplier for ${category}: ${supplierInfo.name}`)

        let actualSupplierId = null

        // OPTION 1: If localStorage has a valid UUID, use it
        if (supplierInfo.id && this.isValidUUID(supplierInfo.id)) {
          actualSupplierId = supplierInfo.id
          console.log(`✅ Using supplier ID from localStorage: ${actualSupplierId}`)
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
            console.log(`✅ Found supplier ${supplierInfo.name} with ID: ${actualSupplierId}`)
          } else {
            console.log(`⚠️ Could not find supplier ${supplierInfo.name} in database`)
            continue
          }
        }
        // OPTION 3: Use your business as fallback for testing
        else {
          actualSupplierId = 'e4520e35-b028-405e-a81f-f6d46a43f458'
          console.log(`🔄 Using fallback supplier ID for ${category}: ${actualSupplierId}`)
        }

        console.log(`✅ Creating enquiry for ${category}: ${supplierInfo.name} → ${actualSupplierId}`)

        // Get add-ons for this supplier category or general add-ons
const partyPlan = party.party_plan || {}
const allAddons = partyPlan.addons || []

console.log(`🔍 All addons in party plan:`, allAddons)

// Filter add-ons for this supplier (either linked to this supplier or general add-ons)
const categoryAddons = allAddons.filter(addon => 
  addon.supplierId === supplierInfo.id || 
  addon.supplierName === supplierInfo.name ||
  !addon.supplierId || // General add-ons
  addon.supplierId === null
)

console.log(`📦 Addons for ${category} (${supplierInfo.name}):`, categoryAddons)

       
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
console.log(`📧 Creating enquiry with addon_details:`, enquiryData.addon_details)

        enquiries.push(enquiryData)
      }

      console.log(`📊 Prepared ${enquiries.length} enquiries for sending`)

      if (enquiries.length === 0) {
        return { 
          success: false, 
          error: 'No valid suppliers found in party plan to send enquiries to.' 
        }
      }

      // Insert all enquiries
      console.log('📤 Inserting enquiries into database...')
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

      console.log(`✅ Successfully sent ${newEnquiries.length} enquiries for party ${partyId}`)
      
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
        console.log('📝 Supplier added to party plan without enquiry (Quick Add flow)')
        
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
async autoAcceptEnquiries(partyId) {
  try {
    console.log('✅ Auto-accepting enquiries for immediate booking:', partyId);
    
    const { data: updatedEnquiries, error } = await supabase
      .from('enquiries')
      .update({ 
        // ✅ FIXED: Use standard 'accepted' status
        status: 'accepted',
        payment_status: 'unpaid', // Keep as unpaid so payment page finds them
        supplier_response_date: new Date().toISOString(),
        supplier_response: 'Auto-accepted for immediate booking - customer proceeding to payment',
        auto_accepted: true, // ✅ NEW: Flag to identify auto-accepted enquiries
        updated_at: new Date().toISOString()
      })
      .eq('party_id', partyId)
      .eq('status', 'pending')
      .select();

    if (error) throw error;

    console.log(`✅ Auto-accepted ${updatedEnquiries.length} enquiries`);
    return { success: true, updatedEnquiries };

  } catch (error) {
    console.error('❌ Error auto-accepting enquiries:', error);
    return { success: false, error: error.message };
  }
}

// In partyDatabaseBackend.js - ADD this new function
async autoAcceptSpecificEnquiry(enquiryId) {
  try {
    console.log('✅ Auto-accepting specific enquiry:', enquiryId)
    
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

    console.log(`✅ Auto-accepted enquiry ${enquiryId}`)
    return { success: true, enquiry: updatedEnquiry }

  } catch (error) {
    console.error('❌ Error auto-accepting specific enquiry:', error)
    return { success: false, error: error.message }
  }
}

async getEnquiriesForParty(partyId) {
  try {
    console.log('📋 Fetching fresh enquiries for party:', partyId)
    
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

    console.log(`✅ Fetched ${enquiries?.length || 0} enquiries from database`)
    
    // ✅ DEBUG: Log the auto_accepted status of each enquiry
    enquiries?.forEach((enquiry) => {
      console.log(`Enquiry ${enquiry.id} (${enquiry.supplier_category}):`, {
        auto_accepted: enquiry.auto_accepted,
        status: enquiry.status,
        payment_status: enquiry.payment_status,
        supplier_response_date: enquiry.supplier_response_date
      })
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
    console.log('🎯 Updating enquiry in database:', {
      enquiryId,
      response,
      isDepositPaid,
      willClearAutoAccepted: isDepositPaid && response === 'accepted'
    })

    const updateData = {
      status: response,
      supplier_response_date: new Date().toISOString(),
      supplier_response: message || 'Supplier has responded',
      updated_at: new Date().toISOString()
    }

    // ✅ CRITICAL: Clear auto_accepted when supplier manually accepts deposit-paid booking
    if (isDepositPaid && response === 'accepted') {
      updateData.auto_accepted = false
      console.log('✅ Setting auto_accepted = false for manual confirmation')
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

    console.log('✅ Database update successful:', {
      id: updatedEnquiry.id,
      auto_accepted: updatedEnquiry.auto_accepted,
      status: updatedEnquiry.status,
      payment_status: updatedEnquiry.payment_status
    })

    return { success: true, enquiry: updatedEnquiry }

  } catch (error) {
    console.error('❌ Error updating enquiry:', error)
    return { success: false, error: error.message }
  }
}
  async hasPartyPendingEnquiries(partyId) {
    try {
      console.log('🔍 Checking for pending enquiries for party:', partyId);
      
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
      
      console.log(`📊 Found ${enquiries?.length || 0} pending enquiries`);
      
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
      if (supplier && supplier.price && key !== 'addons') {
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
  
      console.log('✅ Party updated:', partyId)
      return { success: true, party: updatedParty }
  
    } catch (error) {
      console.error('❌ Error updating party:', error)
      return { success: false, error: error.message }
    }
  }
  

  async cancelEnquiryAndRemoveSupplier(partyId, supplierType) {
    try {
      console.log('🚫 Cancelling enquiry and removing supplier:', { partyId, supplierType });
      
      // Step 1: Find the enquiry
      const { data: enquiry, error: findError } = await supabase
        .from('enquiries')
        .select('id, status')
        .eq('party_id', partyId)
        .eq('supplier_category', supplierType)
        .in('status', ['pending', 'declined']) // ✅ UPDATED: Handle both pending and declined
        .single();
      
      if (findError && findError.code !== 'PGRST116') {
        console.error('❌ Error finding enquiry:', findError);
        throw findError;
      }
      
      // Mark enquiry as withdrawn by user
      if (enquiry) {
        console.log('📧 Marking enquiry as withdrawn by user:', enquiry.id);
        console.log('🔍 Enquiry status:', enquiry.status);
        
        // ✅ NEW: Different update based on enquiry status
        const updateData = {
          status: 'withdrawn',
          updated_at: new Date().toISOString()
        }
        
        // ✅ KEY FIX: If enquiry was declined, mark replacement as processed
        if (enquiry.status === 'declined') {
          updateData.replacement_processed = true
          console.log('🔄 Enquiry was declined - marking replacement as processed')
        }
        
        const { error: withdrawError } = await supabase
          .from('enquiries')
          .update(updateData)
          .eq('id', enquiry.id);
        
        if (withdrawError) {
          console.error('❌ Error withdrawing enquiry:', withdrawError);
          throw withdrawError;
        }
        
        console.log('✅ Enquiry marked as withdrawn and replacement processed if needed');
      } else {
        console.log('⚠️ No enquiry found to cancel');
      }
      
      // Step 2: Remove supplier from party plan (existing logic)
      const removeResult = await this.removeSupplierFromParty(partyId, supplierType);
      
      if (!removeResult.success) {
        throw new Error(`Failed to remove supplier: ${removeResult.error}`);
      }
      
      console.log('✅ Supplier removed from party plan');
      
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
      console.log('📧 Sending individual enquiry:', {
        partyId,
        supplierName: supplier.name,
        supplierId: supplier.id,
        packageId: selectedPackage?.id
      })
     // ✅ EMERGENCY FIX: Add category if missing (same as addSupplierToParty)
     if (!supplier.category) {
      console.log('🚨 EMERGENCY: supplier.category is undefined in sendIndividualEnquiry, adding it')
      supplier.category = 'Entertainment'
      console.log('🔧 Fixed supplier.category for enquiry:', supplier.category)
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
  
      console.log(`📦 Found ${relevantAddons.length} relevant add-ons for enquiry`)
  
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
        created_at: new Date().toISOString()
      }
  
      console.log('📤 Creating individual enquiry:', enquiryData)
  
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
  
      console.log('✅ Individual enquiry created successfully:', newEnquiry.id)
  
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
    console.log('🔄 === REPLACEMENT PROCESSING DEBUG ===')
    console.log('🔄 Input parameters:', { 
      partyId, 
      supplierCategory, 
      replacementSupplierId 
    })

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
      console.log('✅ Successfully updated enquiry:', updatedEnquiry)
      return { success: true, enquiry: updatedEnquiry }
    } else {
      console.log('⚠️ No matching declined enquiry found to update')
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
    console.log('🔍 Mapping category:', category, typeof category)
    
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
      'cakes' : 'cakes'
    }
    
    const result = mapping[category] || mapping[category?.toLowerCase()] || null
    console.log('✅ Mapped', category, 'to', result)
    
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

      console.log('📊 Enhanced suggestions:', { curated: curated.length, real: real.length });
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
      console.log('📝 [Backend] Adding custom item to registry:', itemData.name);
      
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
      
      console.log('✅ [Backend] Custom item added to registry:', newItem.id);
      
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
      console.log('🔍 [Backend] Loading gift registry by ID:', registryId);
      
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
      
      console.log('✅ [Backend] Registry loaded:', registry);
      
      // Get registry items from the correct table: registry_items
      let items = [];
      try {
        console.log('🔍 [Backend] Loading registry items from registry_items table...');
        
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
        
        console.log('✅ [Backend] Raw items loaded:', rawItems?.length || 0);
        items = rawItems || [];
        
      } catch (itemsError) {
        console.error('⚠️ [Backend] Exception fetching registry items:', itemsError);
        items = [];
      }
      
      console.log('✅ [Backend] Registry loaded by ID with', items?.length || 0, 'items');
      
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
    console.log('🎁 [Backend] Adding curated item to registry:', giftItemId);
    
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
    
    console.log('✅ [Backend] Curated item added to registry:', newItem.id);
    
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
    console.log('🔍 [Backend] Loading gift registry for party:', partyId);
    
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
        console.log('ℹ️ [Backend] No gift registry found for party:', partyId);
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
    
    console.log('✅ [Backend] Found gift registry:', registry.id);
    
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
        console.log('✅ [Backend] Loaded', items.length, 'registry items');
      } else {
        console.error('⚠️ [Backend] Error fetching registry items:', itemsError);
      }
    } catch (itemsError) {
      console.error('⚠️ [Backend] Exception fetching registry items:', itemsError);
    }
    
    console.log('✅ [Backend] Registry loaded with', items?.length || 0, 'items');
    
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
      console.log('🗑️ [Backend] Removing item from registry:', registryItemId);
      
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
      
      console.log('✅ [Backend] Item removed from registry');
      
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
      console.log('🎁 [Backend] Creating gift registry for party:', partyId);
      console.log('📝 [Backend] Registry data:', registryData);
      
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
      
      console.log('💾 [Backend] Inserting registry record:', registryRecord);
      
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
      
      console.log('✅ [Backend] Registry created successfully:', newRegistry);
      
      // Verify it was saved by reading it back
      const { data: verifyRegistry, error: verifyError } = await supabase
        .from('party_gift_registries')
        .select('*')
        .eq('id', newRegistry.id)
        .single();
      
      if (verifyError) {
        console.error('⚠️ [Backend] Registry created but verification failed:', verifyError);
        // Still return success since the registry was created
      } else {
        console.log('✅ [Backend] Registry verified in database:', verifyRegistry.id);
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
      console.log('🎁 [Backend] Claiming registry item:', registryItemId, 'by', guestName);
      
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
      
      console.log('✅ [Backend] Item claimed successfully');
      
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
    console.log('🛒 [Backend] Adding real product to registry:', product.name);
    
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
    
    console.log('💾 [Backend] Inserting registry item:', registryItem);
    
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
    
    console.log('✅ [Backend] Product added to registry:', newItem.id);
    
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
    console.log(`🔍 Searching for category: "${category}" (excluding ID: ${excludeId})`)
    
    // Build query with proper UUID handling
    let query = supabase
      .from('suppliers')
      .select('*')
      .limit(50)
    
    // Only add UUID exclusion if excludeId is a valid UUID
    if (excludeId && this.isValidUUID(excludeId)) {
      console.log('✅ Valid UUID - adding exclusion filter')
      query = query.neq('id', excludeId)
    } else {
      console.log('⚠️ Invalid/test UUID - skipping exclusion filter')
    }
    
    const { data: allSuppliers, error } = await query
    
    if (error) {
      console.error(`❌ Error querying suppliers:`, error)
      return []
    }
    
    console.log(`📊 Found ${allSuppliers?.length || 0} total suppliers to filter`)
    
    // Log categories for debugging
    const allCategories = allSuppliers?.map(s => s.data?.category).filter(Boolean)
    console.log('📋 All categories in database:', [...new Set(allCategories)])
    
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
      
      if (isMatch) {
        console.log(`✅ Match found: "${supplierCategory}" matches "${category}"`)
      }
      
      return isMatch
    }) || []
    
    console.log(`🎯 Found ${matchingSuppliers.length} matching suppliers for category "${category}"`)
    
    // If this is a test and we found real suppliers, great!
    if (matchingSuppliers.length > 0) {
      return matchingSuppliers
    }
    
    // If no matches and this is a test, don't return empty - let the mock system handle it
    console.log('⚠️ No category matches found')
    return []
    
  } catch (error) {
    console.error(`❌ Error in findSuppliersByCategory for ${category}:`, error)
    return []
  }
}


getFallbackCategories(originalCategory) {
  console.log('🔄 Getting fallbacks for:', originalCategory)
  
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
  
  console.log('📋 Fallback categories:', finalFallbacks)
  return finalFallbacks
}

// COMPLETELY FIXED version - correct Supabase syntax

/**
 * Find replacement suppliers when one gets rejected - CORRECT SUPABASE SYNTAX
 */
async findReplacementSuppliers(rejectedSupplier, userPreferences = {}) {
  try {
    console.log('🔍 Finding replacements for:', rejectedSupplier.name)
    console.log('🔍 Rejected supplier category:', rejectedSupplier.category)
    
    // First try exact category match
    console.log('🎯 Step 1: Trying exact category match...')
    const exactMatches = await this.findSuppliersByCategory(rejectedSupplier.id, rejectedSupplier.category)
    
    if (exactMatches.length > 0) {
      console.log(`✅ Found ${exactMatches.length} exact category matches`)
      return this.transformSupplierData(exactMatches, rejectedSupplier, userPreferences)
    }
    
    console.log('⚠️ No exact matches found, trying related categories...')
    
    // Try related/fallback categories
    console.log('🎯 Step 2: Trying fallback categories...')
    const fallbackCategories = this.getFallbackCategories(rejectedSupplier.category)
    
    for (const fallbackCategory of fallbackCategories) {
      console.log(`🔍 Trying fallback category: "${fallbackCategory}"`)
      const fallbackMatches = await this.findSuppliersByCategory(rejectedSupplier.id, fallbackCategory)
      
      if (fallbackMatches.length > 0) {
        console.log(`✅ Found ${fallbackMatches.length} suppliers in fallback category: ${fallbackCategory}`)
        return this.transformSupplierData(fallbackMatches, rejectedSupplier, userPreferences)
      }
    }
    
    console.log('❌ No suppliers found in any category!')
    
    // Development fallback
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Creating mock replacement for development')
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
  console.log('🔄 Transforming supplier data for', suppliers.length, 'suppliers')
  
  if (!suppliers || suppliers.length === 0) {
    console.log('⚠️ No suppliers to transform')
    return []
  }
  
  // Transform the data to match expected format
  const transformedAlternatives = suppliers.map((supplier, index) => {
    const supplierData = supplier.data || {}
    
    console.log(`🔍 Transforming supplier ${index + 1}:`, {
      business_name: supplier.business_name,
      category: supplierData.category,
      priceFrom: supplierData.priceFrom,
      rating: supplierData.rating
    })
    
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
  
  console.log('✅ Transformed suppliers successfully')
  
  // Score and rank the alternatives
  const scoredAlternatives = transformedAlternatives.map(supplier => ({
    ...supplier,
    score: this.scoreReplacementSupplier(supplier, rejectedSupplier, userPreferences)
  })).sort((a, b) => b.score - a.score)
  
  console.log('🏆 Top 3 replacement options:', 
    scoredAlternatives.slice(0, 3).map(s => ({
      name: s.name,
      price: s.price,
      rating: s.rating,
      score: s.score.toFixed(1),
      category: s.category
    }))
  )
  
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
    console.log('🔄 Creating replacement for:', rejectedSupplier.name)
    
    // Find alternatives
    const alternatives = await this.findReplacementSuppliers(rejectedSupplier, userPreferences)
    
    if (alternatives.length === 0) {
      console.log('❌ No alternatives found')
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
    
    console.log('✅ Created replacement:', replacement)
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
    console.log('🚫 Handling supplier rejection:', rejectedSupplier.name)
    
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

    console.log('✅ Approving replacement:', replacementId)
    
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
      
      console.log('✅ Replacement approved and marked as processed')
    }
    
  } catch (error) {
    console.error('💥 Error approving replacement:', error)
  }
}


mapCategoryToSupplierType(category) {
  console.log('🔍 Mapping category:', category, typeof category)
  
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
    'Balloons': 'balloons'
  }
  
  const result = mapping[category] || mapping[category?.toLowerCase()] || null
  console.log('✅ Mapped', category, 'to', result)
  
  return result
}
async sendEnquiryToReplacementSupplier(partyId, replacement, originalEnquiryId) {
  try {
    console.log('📧 Sending enquiry to replacement supplier:', replacement.newSupplier.name)
    
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
    
    console.log('📤 Creating new enquiry:', newEnquiryData)
    
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
    
    console.log('✅ New enquiry created and original enquiry marked as processed')
    
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
    console.log('✅ Applying replacement to party:', partyId)
    
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
      console.log('⚠️ Standard mapping failed, trying alternative approaches...')
      
      const planKeys = Object.keys(currentPlan).filter(key => key !== 'addons')
      const matchingKey = planKeys.find(key => {
        const supplier = currentPlan[key]
        return supplier && (
          supplier.id === replacement.oldSupplier.id ||
          supplier.name === replacement.oldSupplier.name
        )
      })
      
      if (matchingKey) {
        supplierType = matchingKey
        console.log('✅ Found supplier type from party plan:', supplierType)
      } else {
        const possibleTypes = ['entertainment', 'venue', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons', 'photography']
        supplierType = possibleTypes.find(type => 
          type.toLowerCase() === replacement.category.toLowerCase()
        ) || 'entertainment'
        
        console.log('🔄 Using fallback supplier type:', supplierType)
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
        console.log('✅ New enquiry sent to replacement supplier')
      } else {
        console.error('❌ Failed to send enquiry to replacement:', enquiryResult.error)
        // Don't fail the whole process if enquiry fails
      }
    }
    
    console.log('✅ Replacement applied successfully')
    
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
    console.log('💾 Saving e-invites for party:', partyId);
    
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
    console.log('📋 Current party plan keys:', Object.keys(currentPlan));

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

    console.log('✅ E-invites saved successfully');
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
    console.log('🔍 Getting e-invites for party:', partyId);
    
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
    console.log('📋 Found e-invites:', !!einvites);
    
    return { success: true, einvites };
  } catch (error) {
    console.error('❌ Error in getEInvites:', error);
    return { success: false, error: error.message };
  }
}


async createPublicInvite(inviteData) {
  try {
    console.log('🌐 Creating public invite');
    
    const publicInvite = {
      id: inviteData.inviteId,
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

    const { data, error } = await supabase
      .from('public_invites')
      .upsert(publicInvite, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating public invite:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Public invite created:', data.id);
    return { success: true, publicInvite: data };
  } catch (error) {
    console.error('❌ Error in createPublicInvite:', error);
    return { success: false, error: error.message };
  }
}


async getPublicInvite(inviteId) {
  try {
    console.log('🔍 [Backend] Getting public invite:', inviteId);
    
    const { data: invite, error } = await supabase
      .from('public_invites')
      .select('*')
      .eq('id', inviteId)
      .eq('is_active', true)
      .single();

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

    console.log('✅ [Backend] Found public invite:', invite.id);
    
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

    console.log('📋 [Backend] Parsed invite data:', parsedInviteData);

    // Get party details if we have a party ID
    let partyDetails = null;
    const partyId = parsedInviteData?.partyId;
    
    if (partyId) {
      console.log('🔍 [Backend] Loading party details for ID:', partyId);
      
      const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('child_name, party_date, party_time, location, theme, special_requirements, party_plan')
        .eq('id', partyId)
        .single();

      if (!partyError && party) {
        console.log('✅ [Backend] Loaded party details');
        partyDetails = party;
      } else {
        console.log('⚠️ [Backend] Could not load party details:', partyError?.message || 'Unknown error');
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

    console.log('✅ [Backend] Public invite loaded successfully with party data');
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
async findGiftRegistryForParty(partyId) {
  try {
    console.log('🔍 [Backend] Finding gift registry for party:', partyId)
    
    // First, try to find existing registry by party ID
    const { data: registry, error: registryError } = await supabase
      .from('party_gift_registries')
      .select('*')
      .eq('party_id', partyId)
      .eq('is_active', true)
      .single()
    
    if (!registryError && registry) {
      console.log('✅ [Backend] Found registry by party ID:', registry.id)
      return {
        success: true,
        registry: registry,
        method: 'found_by_party_id'
      }
    }
    
    // If not found by party ID, check if there's a registry that should be linked
    // This is a fallback for existing registries that weren't properly linked
    const { data: allRegistries, error: allError } = await supabase
      .from('party_gift_registries')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10) // Check recent registries
    
    if (!allError && allRegistries && allRegistries.length > 0) {
      // For now, return the most recent registry as fallback
      // In a real app, you'd have better logic to match registries to parties
      const fallbackRegistry = allRegistries[0]
      
      console.log('⚠️ [Backend] Using fallback registry:', fallbackRegistry.id)
      return {
        success: true,
        registry: fallbackRegistry,
        method: 'fallback_recent'
      }
    }
    
    console.log('❌ [Backend] No gift registry found for party:', partyId)
    return {
      success: false,
      error: 'No gift registry found for this party',
      registry: null
    }
    
  } catch (error) {
    console.error('❌ [Backend] Error finding gift registry:', error)
    return {
      success: false,
      error: error.message,
      registry: null
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
    
    // Fallback to known working registry
    console.log('⚠️ [Backend] Using hardcoded fallback registry')
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
    console.log('📝 Submitting RSVP for invite:', inviteId);
    
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

    console.log('✅ RSVP submitted successfully');
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
    console.log('📊 Getting RSVPs for party:', partyId);
    
    // First, get all public invites for this party
    const { data: invites, error: invitesError } = await supabase
      .from('public_invites')
      .select('id')
      .eq('is_active', true);

    if (invitesError) {
      console.error('❌ Error fetching invites:', invitesError);
      return { success: false, error: invitesError.message };
    }

    // Filter invites that belong to this party (stored in invite_data JSONB)
    const partyInviteIds = [];
    for (const invite of invites) {
      // We'll need to get the full invite to check the JSONB data
      const { data: fullInvite, error } = await supabase
        .from('public_invites')
        .select('invite_data')
        .eq('id', invite.id)
        .single();
      
      if (!error && fullInvite?.invite_data?.partyId === partyId) {
        partyInviteIds.push(invite.id);
      }
    }

    if (partyInviteIds.length === 0) {
      console.log('📊 No invites found for party:', partyId);
      return { success: true, rsvps: [] };
    }

    // Get RSVPs for these invites
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('*')
      .in('invite_id', partyInviteIds)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching RSVPs:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Found ${rsvps?.length || 0} RSVPs`);
    return { success: true, rsvps: rsvps || [] };
  } catch (error) {
    console.error('❌ Error in getPartyRSVPs:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update guest list with send status
 */
async updateGuestSendStatus(partyId, guestId, status, sentMethod = 'manual') {
  try {
    console.log('📤 Updating guest send status:', { partyId, guestId, status });
    
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

    // Update the specific guest
    const updatedGuestList = guestList.map(guest => {
      if (guest.id === guestId) {
        return {
          ...guest,
          status: status,
          sentAt: status === 'sent' ? new Date().toISOString() : guest.sentAt,
          sentMethod: status === 'sent' ? sentMethod : guest.sentMethod,
        };
      }
      return guest;
    });

    // Update the party plan
    currentPlan.einvites = {
      ...einvites,
      guestList: updatedGuestList,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('parties')
      .update({ party_plan: currentPlan })
      .eq('id', partyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating guest status:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Guest send status updated');
    return { success: true, party: data };
  } catch (error) {
    console.error('❌ Error in updateGuestSendStatus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get RSVP analytics for a party
 */
async getRSVPAnalytics(partyId) {
  try {
    console.log('📊 Getting RSVP analytics for party:', partyId);
    
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
    console.log('🔍 Checking for pending enquiries for party:', partyId);
    
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
    
    console.log(`📊 Found ${enquiries?.length || 0} pending enquiries`);
    
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
    console.log('🔍 Checking if party is awaiting responses:', partyId);
    
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
        console.log('✅ Party is awaiting supplier responses');
        return {
          success: true,
          isAwaiting: true,
          pendingCount: enquiryResult.count,
          enquiries: enquiryResult.enquiries
        };
      }
    }

    console.log('✅ Party is not awaiting responses (can modify plan)');
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
}
// Create singleton instance
export const partyDatabaseBackend = new PartyDatabaseBackend()

// Export the class for direct use if needed
export default PartyDatabaseBackend