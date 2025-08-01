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

      console.log('💾 Creating party with plan:', {
        party_plan: partyPlan,
        addons_count: partyPlan.addons?.length || 0,
        estimated_cost: this.calculatePartyPlanCost(partyPlan)
      })

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

  /**
   * Add supplier to party plan
   */
  async addSupplierToParty(partyId, supplier, selectedPackage = null) {
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
          party: result.party 
        }
      } else {
        throw new Error(result.error)
      }

    } catch (error) {
      console.error('❌ Error adding supplier to party:', error)
      return { success: false, error: error.message }
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

  /**
   * Get enquiries for a party
   */
  async getEnquiriesForParty(partyId) {
    try {
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

      if (error) throw error

      return { success: true, enquiries }

    } catch (error) {
      console.error('❌ Error getting enquiries for party:', error)
      return { success: false, error: error.message }
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

  /**
   * Map supplier category to party plan type
   */
  mapCategoryToSupplierType(category) {
    const mapping = {
      'Entertainment': 'entertainment',
      'Venues': 'venue', 
      'Catering': 'catering',
      'Decorations': 'decorations',
      'Party Bags': 'partyBags',
      'Photography': 'photography',
      'Activities': 'activities',
      'Face Painting': 'facePainting'
    }
    return mapping[category]
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
  async addCuratedItemToRegistry(registryId, giftItemId, itemData = {}) {
    try {
      const { data, error } = await supabase
        .from('registry_items')
        .insert({
          registry_id: registryId,
          gift_item_id: giftItemId,
          notes: itemData.notes || null,
          priority: itemData.priority || 'medium',
          quantity: itemData.quantity || 1
        })
        .select(`
          *,
          gift_items(*)
        `)
        .single()
      
      if (error) throw error
      return { success: true, registryItem: data }
    } catch (error) {
      console.error('❌ Error adding curated item to registry:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Add custom item to registry
   */
  async addCustomItemToRegistry(registryId, itemData) {
    try {
      const { data, error } = await supabase
        .from('registry_items')
        .insert({
          registry_id: registryId,
          gift_item_id: null, // Custom item
          custom_name: itemData.name,
          custom_price: itemData.price,
          custom_description: itemData.description,
          notes: itemData.notes || null,
          priority: itemData.priority || 'medium',
          quantity: itemData.quantity || 1
        })
        .select()
        .single()
      
      if (error) throw error
      return { success: true, registryItem: data }
    } catch (error) {
      console.error('❌ Error adding custom item to registry:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get party's gift registry with items
   */
  async getPartyGiftRegistry(partyId) {
    try {
      // First get the registry
      const { data: registry, error: registryError } = await supabase
        .from('party_gift_registries')
        .select('*')
        .eq('party_id', partyId)
        .eq('is_active', true)
        .single()

      if (registryError && registryError.code !== 'PGRST116') {
        throw registryError
      }

      if (!registry) {
        return { success: true, registry: null, items: [] }
      }

      // Then get the items
      const { data: items, error: itemsError } = await supabase
        .from('registry_items')
        .select(`
          *,
          gift_items(*)
        `)
        .eq('registry_id', registry.id)
        .order('created_at', { ascending: true })

      if (itemsError) throw itemsError

      return { success: true, registry, items: items || [] }
    } catch (error) {
      console.error('❌ Error getting party gift registry:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get registry by ID (for guest access)
   */
  async getRegistryById(registryId) {
    try {
      const { data: registry, error: registryError } = await supabase
        .from('party_gift_registries')
        .select(`
          *,
          parties(*)
        `)
        .eq('id', registryId)
        .eq('is_active', true)
        .single()

      if (registryError) throw registryError

      const { data: items, error: itemsError } = await supabase
        .from('registry_items')
        .select(`
          *,
          gift_items(*)
        `)
        .eq('registry_id', registryId)
        .order('created_at', { ascending: true })

      if (itemsError) throw itemsError

      return { success: true, registry, items: items || [] }
    } catch (error) {
      console.error('❌ Error getting registry by ID:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Remove item from registry
   */
  async removeItemFromRegistry(registryItemId) {
    try {
      const { error } = await supabase
        .from('registry_items')
        .delete()
        .eq('id', registryItemId)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('❌ Error removing item from registry:', error)
      return { success: false, error: error.message }
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
      const { data, error } = await supabase
        .from('party_gift_registries')
        .insert({
          party_id: partyId,
          name: registryData.name || 'Gift Registry',
          description: registryData.description || ''
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, registry: data }
    } catch (error) {
      console.error('❌ Error creating gift registry:', error)
      return { success: false, error: error.message }
    }
  }
  /**
   * Claim item (for guests)
   */
  async claimRegistryItem(registryItemId, guestName, guestEmail = null) {
    try {
      const { data, error } = await supabase
        .from('registry_items')
        .update({
          is_claimed: true,
          claimed_by: guestName,
          claimed_email: guestEmail,
          claimed_at: new Date().toISOString()
        })
        .eq('id', registryItemId)
        .eq('is_claimed', false) // Only allow claiming if not already claimed
        .select(`
          *,
          gift_items(*)
        `)
        .single()
      
      if (error) throw error
      return { success: true, registryItem: data }
    } catch (error) {
      console.error('❌ Error claiming registry item:', error)
      return { success: false, error: error.message }
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
async addRealProductToRegistry(registryId, productData, itemData = {}) {
  try {
    console.log('🛒 Adding real product to registry:', productData.name);
    
    const { data, error } = await supabase
      .from('registry_items')
      .insert({
        registry_id: registryId,
        gift_item_id: null,
        external_product_id: productData.external_id || productData.id,
        external_source: productData.source || 'amazon',
        custom_name: productData.name,
        custom_price: productData.price ? `£${productData.price}` : productData.price_range,
        custom_description: productData.description,
        external_image_url: productData.image_url,
        external_buy_url: productData.buy_url,
        notes: itemData.notes || null,
        priority: itemData.priority || 'medium',
        quantity: itemData.quantity || 1
      })
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, registryItem: data };
  } catch (error) {
    console.error('❌ Error adding real product to registry:', error);
    return { success: false, error: error.message };
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
    'partyBags': ['Party Bags', 'Catering']
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
    'Party Bags'
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
    
    // Supplier categories (title case from suppliers table) 
    'Entertainment': 'entertainment',
    'Venues': 'venue',
    'Catering': 'catering',
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
}
// Create singleton instance
export const partyDatabaseBackend = new PartyDatabaseBackend()

// Export the class for direct use if needed
export default PartyDatabaseBackend