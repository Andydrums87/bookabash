import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export const useUserTypeDetection = () => {
  const [userType, setUserType] = useState(null)
  const [userContext, setUserContext] = useState({})
  const [loading, setLoading] = useState(true)

  const detectUserType = useCallback(async () => {
    try {
      setLoading(true)
      
      // Step 1: Check authentication status first
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {

        
        // Step 2: For signed-in users, check database party first
        try {
          const partyResult = await partyDatabaseBackend.getCurrentParty()
          
          if (partyResult.success && partyResult.party) {
   
            setUserType('DATABASE_USER')
            setUserContext({
              needsDateSelection: false,
              canModifyPlan: true,
              dataSource: 'database',
              showCalendarFlow: false,
              currentPartyId: partyResult.party.id,
              partyData: partyResult.party,
              userId: session.user.id,
              allowSupplierUpdates: 'conditional'
            })
            setLoading(false)
            return
          } else {
         
            // Check if they have localStorage data worth migrating
            const hasLocalStorageData = checkLocalStorageData()
            
            setUserType('MIGRATION_NEEDED')
            setUserContext({
              needsDateSelection: !hasLocalStorageData,
              canModifyPlan: hasLocalStorageData,
              dataSource: hasLocalStorageData ? 'localStorage' : null,
              showCalendarFlow: !hasLocalStorageData,
              userId: session.user.id,
              needsMigration: true,
              allowSupplierUpdates: hasLocalStorageData ? true : false
            })
            setLoading(false)
            return
          }
        } catch (dbError) {
          console.error('Database check failed:', dbError)
          // Fallback to localStorage check for signed-in users
        }
      }
      
      // Step 3: For non-signed-in users or database errors, check localStorage
      const hasLocalStorageData = checkLocalStorageData()
      
      if (hasLocalStorageData) {

        setUserType('LOCALSTORAGE_USER')
        setUserContext({
          needsDateSelection: false,
          canModifyPlan: true,
          dataSource: 'localStorage',
          showCalendarFlow: false,
          allowSupplierUpdates: true
        })
      } else {

        setUserType('ANONYMOUS')
        setUserContext({
          needsDateSelection: true,
          canModifyPlan: false,
          dataSource: null,
          showCalendarFlow: true
        })
      }
      
    } catch (error) {
      console.error('Error detecting user type:', error)
      setUserType('ERROR_FALLBACK')
      setUserContext({
        needsDateSelection: true,
        canModifyPlan: false,
        dataSource: null,
        showCalendarFlow: true
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Helper function to check localStorage data quality
  const checkLocalStorageData = () => {
    if (typeof window === 'undefined') return false
    
    try {
      const localPlan = localStorage.getItem('user_party_plan')
      const localDetails = localStorage.getItem('party_details')
      
      // Check party plan
      let hasRealSuppliers = false
      if (localPlan && localPlan !== 'null' && localPlan !== '{}' && localPlan.length > 20) {
        try {
          const parsedPlan = JSON.parse(localPlan)
          const supplierCategories = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons', 'photography']
          
          hasRealSuppliers = supplierCategories.some(category => {
            const supplier = parsedPlan[category]
            return supplier && typeof supplier === 'object' && supplier.name && supplier.id
          })
          
          if (!hasRealSuppliers && parsedPlan.addons && parsedPlan.addons.length > 0) {
            hasRealSuppliers = parsedPlan.addons.some(addon => addon && addon.name && addon.id)
          }
        } catch (e) {
          console.log('Plan parse error:', e)
        }
      }
      
      // Check party details
      let hasRealDetails = false
      if (localDetails && localDetails !== 'null' && localDetails !== '{}' && localDetails.length > 20) {
        try {
          const parsedDetails = JSON.parse(localDetails)
          hasRealDetails = !!(
            (parsedDetails.childName && parsedDetails.childName !== 'Emma' && parsedDetails.childName !== 'Your Child') ||
            parsedDetails.date ||
            parsedDetails.postcode ||
            (parsedDetails.guestCount && parsedDetails.guestCount > 0) ||
            (parsedDetails.theme && parsedDetails.theme !== 'general' && parsedDetails.theme !== 'superhero')
          )
        } catch (e) {
          console.log('Details parse error:', e)
        }
      }
      
      return hasRealSuppliers || hasRealDetails
    } catch (error) {
      console.error('Error checking localStorage:', error)
      return false
    }
  }

  useEffect(() => {
    detectUserType()
  }, [detectUserType])

  return {
    userType,
    userContext,
    loading,
    refreshUserType: detectUserType
  }
}

export const getHandleAddToPlanBehavior = (userType, userContext, supplier, selectedDate) => {
  switch (userType) {
    case 'ANONYMOUS':
    case 'ERROR_FALLBACK':
      // Only anonymous users need to pick dates
      if (!selectedDate) {
        return {
          shouldShowDatePicker: true,
          shouldShowAlaCarteModal: false,
          buttonText: "Pick a Date First",
          buttonDisabled: false,
          clickAction: 'scroll_to_calendar'
        }
      } else {
        return {
          shouldShowDatePicker: false,
          shouldShowAlaCarteModal: true,
          buttonText: "Book This Supplier",
          buttonDisabled: false,
          clickAction: 'open_modal'
        }
      }
      
    case 'LOCALSTORAGE_USER':
    case 'MIGRATION_NEEDED':
      // Users with localStorage data don't need to pick dates
      return {
        shouldShowDatePicker: false,
        shouldShowAlaCarteModal: false,
        buttonText: "Add to Plan",
        buttonDisabled: false,
        clickAction: 'add_to_plan'
      }
      
    case 'DATABASE_USER':
    case 'DATA_CONFLICT':
      // Database users with existing parties don't need to pick dates
      return {
        shouldShowDatePicker: false,
        shouldShowAlaCarteModal: false,
        shouldCheckCategoryOccupation: true,
        shouldSendEnquiry: true,
        buttonText: "Add to Plan",
        buttonDisabled: false,
        clickAction: 'add_to_plan'
      }
      
    default:
      // Fallback for unknown user types - assume they need to pick a date
      return {
        shouldShowDatePicker: true,
        shouldShowAlaCarteModal: false,
        buttonText: "Pick a Date First",
        buttonDisabled: false,
        clickAction: 'scroll_to_calendar'
      }
  }
}