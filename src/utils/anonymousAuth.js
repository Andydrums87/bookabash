// utils/anonymousAuth.js
// Helper functions for anonymous user authentication and management

import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

/**
 * Generate a secure random password for anonymous users
 */
function generateSecurePassword() {
  if (typeof window !== 'undefined') {
    // Client-side: Use crypto.getRandomValues
    const array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  } else {
    // Server-side: Use Node crypto
    return crypto.randomBytes(32).toString('hex')
  }
}

/**
 * Create or get an anonymous session for a user by email
 * This allows users to save their party plan without full registration
 *
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, user?: object, error?: string, isNewUser?: boolean}>}
 */
export async function createAnonymousSession(email) {
  try {
    // First, check if user is already signed in
    const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser()

    if (!sessionError && currentUser) {
      console.log('✅ User already authenticated:', currentUser.email)
      return {
        success: true,
        user: currentUser,
        isNewUser: false,
        isExistingSession: true
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' }
    }

    console.log('🔐 Creating anonymous session for:', email)

    // Generate a secure random password
    const tempPassword = generateSecurePassword()

    // Try to sign up the user with anonymous metadata
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      options: {
        data: {
          is_anonymous: true,
          temp_party_user: true,
          created_via: 'homepage_party_builder',
          created_at: new Date().toISOString()
        },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`
      }
    })

    if (signUpError) {
      // If user already exists, this is expected
      if (signUpError.message?.includes('already registered') ||
          signUpError.message?.includes('User already registered')) {

        console.log('📧 User already exists, attempting sign in')

        // For existing users, we need them to sign in properly
        // Store email in localStorage for them to complete sign-in later
        if (typeof window !== 'undefined') {
          localStorage.setItem('pending_party_email', email)
        }

        return {
          success: false,
          error: 'USER_EXISTS',
          message: 'An account with this email already exists. Please sign in to continue.',
          requiresSignIn: true,
          email: email
        }
      }

      console.error('❌ Sign up error:', signUpError)
      return { success: false, error: signUpError.message }
    }

    if (!signUpData?.user) {
      return { success: false, error: 'Failed to create user session' }
    }

    console.log('✅ Anonymous session created:', signUpData.user.email)

    // Store the temporary password securely in sessionStorage (in case they need to sign in again this session)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('temp_auth_token', tempPassword)
    }

    return {
      success: true,
      user: signUpData.user,
      isNewUser: true,
      session: signUpData.session
    }

  } catch (error) {
    console.error('❌ Error creating anonymous session:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if the current user is an anonymous user
 */
export async function isAnonymousUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return false

    return user.user_metadata?.is_anonymous === true ||
           user.user_metadata?.temp_party_user === true
  } catch (error) {
    console.error('Error checking anonymous user:', error)
    return false
  }
}

/**
 * Upgrade an anonymous user to a full account with password
 * This is called when they want to complete registration
 *
 * @param {string} newPassword - The user's chosen password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function upgradeAnonymousAccount(newPassword) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'No user session found' }
    }

    if (!user.user_metadata?.is_anonymous) {
      return { success: false, error: 'User is not an anonymous account' }
    }

    // Update password and remove anonymous flags
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
      data: {
        is_anonymous: false,
        temp_party_user: false,
        upgraded_at: new Date().toISOString()
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Clear temp password from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('temp_auth_token')
    }

    console.log('✅ Anonymous account upgraded to full account')

    return { success: true, user: data.user }

  } catch (error) {
    console.error('Error upgrading anonymous account:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get or create anonymous session
 * Wrapper function that handles both existing sessions and new anonymous users
 */
export async function ensureUserSession(email) {
  // Check if already authenticated
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!error && user) {
    console.log('✅ Existing session found')
    return { success: true, user, isNewUser: false }
  }

  // No session, create anonymous session if email provided
  if (email) {
    return await createAnonymousSession(email)
  }

  // No email and no session - will use localStorage fallback
  return { success: false, error: 'No email provided and no existing session' }
}
