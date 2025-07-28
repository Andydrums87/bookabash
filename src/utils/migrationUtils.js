// utils/migrationUtils.js
// Utility functions for migrating localStorage data to database

import { supabase } from '@/lib/supabase'
import { partyDatabaseBackend } from './partyDatabaseBackend'

export class MigrationUtils {
  
  /**
   * Check if user has localStorage party data that needs migration
   */
  static hasLocalStorageParty() {
    if (typeof window === 'undefined') return false
    
    try {
      const partyDetails = localStorage.getItem('party_details')
      const partyPlan = localStorage.getItem('user_party_plan')
      
      return !!(partyDetails && partyPlan)
    } catch {
      return false
    }
  }

  /**
   * Get localStorage party data for migration
   */
  static getLocalStoragePartyData() {
    if (typeof window === 'undefined') return null
    
    try {
      const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}')
      const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}')
      
      return {
        partyDetails,
        partyPlan,
        hasData: Object.keys(partyDetails).length > 0 || Object.keys(partyPlan).length > 0
      }
    } catch (error) {
      console.error('Error reading localStorage party data:', error)
      return null
    }
  }

  /**
   * Migrate localStorage party data to database for authenticated user
   */
  static async migrateLocalStorageToDatabase(userInfo = null) {
    try {
      console.log('🔄 Starting localStorage to database migration...')

      // Get current user if not provided
      let user = userInfo
      if (!user) {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        if (error || !currentUser) {
          throw new Error('No authenticated user found')
        }
        user = currentUser
      }

      // Get localStorage data
      const localData = this.getLocalStoragePartyData()
      if (!localData?.hasData) {
        console.log('ℹ️ No localStorage party data to migrate')
        return { success: true, message: 'No data to migrate' }
      }

      console.log('📋 Found localStorage data to migrate:', localData)

      // Ensure user profile exists
      const userResult = await partyDatabaseBackend.createOrGetUser({
        firstName: localData.partyDetails.childName ? `${localData.partyDetails.childName}'s Parent` : 'Party Host',
        lastName: '',
        email: user.email,
        phone: user.user_metadata?.phone || '',
        postcode: localData.partyDetails.postcode || localData.partyDetails.location || ''
      })

      if (!userResult.success) {
        throw new Error(`Failed to create user profile: ${userResult.error}`)
      }

      console.log('✅ User profile ready for migration:', userResult.user.id)

      // Check if user already has a current party
      const currentPartyResult = await partyDatabaseBackend.getCurrentParty()
      if (currentPartyResult.success && currentPartyResult.party) {
        console.log('ℹ️ User already has a party in database, skipping migration')
        return { 
          success: true, 
          message: 'User already has a party in database',
          party: currentPartyResult.party 
        }
      }

      // Create party data for database
      const partyData = {
        childName: localData.partyDetails.childName || 'Your Child',
        childAge: parseInt(localData.partyDetails.childAge) || 6,
        date: localData.partyDetails.date || new Date().toISOString().split('T')[0],
        time: localData.partyDetails.time || '14:00',
        guestCount: parseInt(localData.partyDetails.guestCount) || 15,
        location: localData.partyDetails.location || 'TBD',
        postcode: localData.partyDetails.postcode || localData.partyDetails.location || '',
        theme: localData.partyDetails.theme || 'party',
        budget: parseInt(localData.partyDetails.budget) || 600,
        specialRequirements: localData.partyDetails.specialRequirements || ''
      }

      console.log('🎉 Creating party with migrated data:', partyData)

      // Create party in database
      const createResult = await partyDatabaseBackend.createParty(partyData, localData.partyPlan)

      if (!createResult.success) {
        throw new Error(`Failed to create party: ${createResult.error}`)
      }

      console.log('✅ Party migrated successfully to database:', createResult.party.id)

      // Optionally clear localStorage after successful migration
      // this.clearLocalStoragePartyData()

      return {
        success: true,
        message: 'Party data migrated successfully',
        party: createResult.party
      }

    } catch (error) {
      console.error('❌ Migration failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Clear localStorage party data after successful migration
   */
  static clearLocalStoragePartyData() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem('party_details')
      localStorage.removeItem('user_party_plan')
      console.log('🧹 Cleared localStorage party data')
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  /**
   * Show migration prompt to user
   */
  static showMigrationPrompt() {
    if (!this.hasLocalStorageParty()) return false
    
    return confirm(
      'You have party data saved locally. Would you like to save it to your account so you can access it from any device?'
    )
  }

  /**
   * Auto-migrate when user signs in (for seamless UX)
   */
  static async autoMigrateOnSignIn() {
    try {
      // Check if user just signed in and has localStorage data
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) return { success: false, error: 'No user signed in' }
      
      if (!this.hasLocalStorageParty()) {
        return { success: true, message: 'No local data to migrate' }
      }
      
      console.log('🔄 Auto-migrating localStorage data for signed-in user...')
      
      const result = await this.migrateLocalStorageToDatabase(user)
      
      if (result.success) {
        console.log('✅ Auto-migration completed successfully')
        // Optionally show success notification
        this.showMigrationSuccess()
      }
      
      return result
      
    } catch (error) {
      console.error('❌ Auto-migration failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Show migration success notification
   */
  static showMigrationSuccess() {
    if (typeof window === 'undefined') return
    
    // You can replace this with your notification system
    const notification = document.createElement('div')
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: system-ui;
        font-size: 14px;
      ">
        ✅ Party data saved to your account!
      </div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 5000)
  }
}

// React hook for migration
import { useState, useEffect } from 'react'

export function useMigration() {
  const [hasLocalData, setHasLocalData] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)

  useEffect(() => {
    // Check if there's local data to migrate
    setHasLocalData(MigrationUtils.hasLocalStorageParty())
  }, [])

  const triggerMigration = async () => {
    try {
      setMigrating(true)
      const result = await MigrationUtils.migrateLocalStorageToDatabase()
      setMigrationResult(result)
      
      if (result.success) {
        setHasLocalData(false) // Hide migration prompts
      }
      
      return result
    } catch (error) {
      const errorResult = { success: false, error: error.message }
      setMigrationResult(errorResult)
      return errorResult
    } finally {
      setMigrating(false)
    }
  }

  const clearLocalData = () => {
    MigrationUtils.clearLocalStoragePartyData()
    setHasLocalData(false)
  }

  return {
    hasLocalData,
    migrating,
    migrationResult,
    triggerMigration,
    clearLocalData
  }
}

export default MigrationUtils