import { supabase } from "@/lib/supabase"

/**
 * Store referral code in localStorage when user arrives via referral link
 * @param {string} referralCode - The referral code from URL
 */
export function storeReferralCode(referralCode) {
  if (typeof window !== 'undefined' && referralCode) {
    localStorage.setItem('referral_code', referralCode)
    localStorage.setItem('referral_timestamp', Date.now().toString())
    console.log('📎 Stored referral code:', referralCode)
  }
}

/**
 * Get stored referral code from localStorage
 * @returns {string|null} The referral code if exists and not expired
 */
export function getStoredReferralCode() {
  if (typeof window === 'undefined') return null

  const code = localStorage.getItem('referral_code')
  const timestamp = localStorage.getItem('referral_timestamp')

  if (!code || !timestamp) return null

  // Check if referral is older than 30 days (2592000000 ms)
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
  if (Date.now() - parseInt(timestamp) > thirtyDaysMs) {
    clearStoredReferralCode()
    return null
  }

  return code
}

/**
 * Clear stored referral code from localStorage
 */
export function clearStoredReferralCode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('referral_code')
    localStorage.removeItem('referral_timestamp')
  }
}

/**
 * Process referral after a new user signs up
 * Links the referred user to the referrer in the database
 * @param {string} newUserId - The newly created user's ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function processReferralSignup(newUserId) {
  const referralCode = getStoredReferralCode()

  if (!referralCode) {
    console.log('📎 No referral code found for new user')
    return { success: true, noReferral: true }
  }

  try {
    // Find the referrer by their referral code
    const { data: referrerData, error: lookupError } = await supabase
      .from('user_referral_codes')
      .select('user_id')
      .eq('referral_code', referralCode)
      .single()

    if (lookupError || !referrerData) {
      console.warn('📎 Invalid referral code:', referralCode)
      clearStoredReferralCode()
      return { success: true, invalidCode: true }
    }

    const referrerId = referrerData.user_id

    // Don't allow self-referral
    if (referrerId === newUserId) {
      console.warn('📎 Self-referral attempt blocked')
      clearStoredReferralCode()
      return { success: true, selfReferral: true }
    }

    // Create the referral record
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_user_id: referrerId,
        referred_user_id: newUserId,
        referral_code: referralCode,
        status: 'pending'
      })

    if (insertError) {
      // If duplicate, the user was already referred (shouldn't happen but handle gracefully)
      if (insertError.code === '23505') { // unique_violation
        console.log('📎 User was already referred')
        clearStoredReferralCode()
        return { success: true, alreadyReferred: true }
      }
      throw insertError
    }

    console.log('✅ Referral recorded - referrer:', referrerId, 'referred:', newUserId)
    clearStoredReferralCode()

    return { success: true, referralRecorded: true, referrerId }

  } catch (err) {
    console.error('❌ Error processing referral:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Complete a referral when user makes their first booking
 * Issues credits to both referrer and referred user
 * @param {string} userId - The user who just completed a booking
 * @param {string} bookingId - The booking ID
 * @returns {Promise<{success: boolean, creditsIssued?: boolean, error?: string}>}
 */
export async function completeReferralOnBooking(userId, bookingId) {
  try {
    // Call the database function to complete the referral
    const { data: completed, error } = await supabase
      .rpc('complete_referral', {
        p_referred_user_id: userId,
        p_booking_id: bookingId
      })

    if (error) throw error

    if (completed) {
      console.log('🎉 Referral completed! Credits issued for booking:', bookingId)
      return { success: true, creditsIssued: true }
    } else {
      console.log('📎 No pending referral found for user')
      return { success: true, creditsIssued: false }
    }

  } catch (err) {
    console.error('❌ Error completing referral:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Get user's available referral credit
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Available credit amount
 */
export async function getAvailableCredit(userId) {
  try {
    const { data: credit, error } = await supabase
      .rpc('get_available_credit', { p_user_id: userId })

    if (error) throw error
    return parseFloat(credit) || 0

  } catch (err) {
    console.error('❌ Error fetching credit:', err)
    return 0
  }
}

/**
 * Check if user has a pending referral (for first-order discount)
 * Returns £20 if user was referred and hasn't completed their first booking yet
 * @param {string} authUserId - The auth user ID
 * @returns {Promise<number>} Discount amount (20 if eligible, 0 if not)
 */
export async function getPendingReferralDiscount(authUserId) {
  const REFERRAL_DISCOUNT = 20.00

  try {
    // Check if user has a pending referral (was referred but hasn't paid yet)
    const { data: referral, error } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('referred_user_id', authUserId)
      .eq('status', 'pending')
      .maybeSingle()

    if (error) {
      console.warn('Error checking pending referral:', error)
      return 0
    }

    if (referral) {
      console.log('🎁 User has pending referral - eligible for £20 first-order discount')
      return REFERRAL_DISCOUNT
    }

    return 0
  } catch (err) {
    console.error('❌ Error checking pending referral:', err)
    return 0
  }
}

/**
 * Apply referral credit to a booking
 * @param {string} userId - The user ID
 * @param {string} bookingId - The booking ID
 * @param {number} amountToApply - Amount to apply (up to available credit)
 * @returns {Promise<{success: boolean, appliedAmount?: number, error?: string}>}
 */
export async function applyReferralCredit(userId, bookingId, amountToApply) {
  try {
    const { data: appliedAmount, error } = await supabase
      .rpc('apply_referral_credit', {
        p_user_id: userId,
        p_booking_id: bookingId,
        p_amount_to_apply: amountToApply
      })

    if (error) throw error

    console.log('💰 Applied referral credit:', appliedAmount)
    return { success: true, appliedAmount: parseFloat(appliedAmount) || 0 }

  } catch (err) {
    console.error('❌ Error applying credit:', err)
    return { success: false, error: err.message, appliedAmount: 0 }
  }
}
