import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export const useUserTypeDetection = () => {
    const [userType, setUserType] = useState(null)
    const [userContext, setUserContext] = useState({})
    const [loading, setLoading] = useState(true)
  
    // Quick synchronous check first
    const getInitialUserType = useCallback(() => {
      if (typeof window === 'undefined') {
        return { type: null, context: {}, loading: true }
      }
    
      try {
        const localPlan = localStorage.getItem('user_party_plan')
        const localDetails = localStorage.getItem('party_details')

        
        // ✅ STRICTER CHECK: Ensure localStorage has actual meaningful data
        let hasRealSuppliers = false
        if (localPlan && localPlan !== 'null' && localPlan !== '{}' && localPlan.length > 20) {
          try {
            const parsedPlan = JSON.parse(localPlan)
            const supplierCategories = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons', 'photography']
            
            hasRealSuppliers = supplierCategories.some(category => {
              const supplier = parsedPlan[category]
              return supplier && typeof supplier === 'object' && supplier.name && supplier.id
            })
            
            // Also check addons
            if (!hasRealSuppliers && parsedPlan.addons && parsedPlan.addons.length > 0) {
              hasRealSuppliers = parsedPlan.addons.some(addon => addon && addon.name && addon.id)
            }
            
        
          } catch (e) {
            console.log('  - Plan parse error:', e)
          }
        }
        
        // Check if party details has meaningful data
        let hasRealDetails = false
        if (localDetails && localDetails !== 'null' && localDetails !== '{}' && localDetails.length > 20) {
          try {
            const parsedDetails = JSON.parse(localDetails)
            // Check for non-default values
            hasRealDetails = !!(
              (parsedDetails.childName && parsedDetails.childName !== 'Emma' && parsedDetails.childName !== 'Your Child') ||
              parsedDetails.date ||
              parsedDetails.postcode ||
              (parsedDetails.guestCount && parsedDetails.guestCount > 0) ||
              (parsedDetails.theme && parsedDetails.theme !== 'general' && parsedDetails.theme !== 'superhero')
            )
            

          } catch (e) {
            console.log('  - Details parse error:', e)
          }
        }
        
        const hasValidData = hasRealSuppliers || hasRealDetails

    
        if (!hasValidData) {

          return {
            type: 'ANONYMOUS',
            context: {
              needsDateSelection: true,
              canModifyPlan: false,
              dataSource: null,
              showCalendarFlow: true
            },
            loading: false
          }
        } else {

          return {
            type: 'LOCALSTORAGE_USER',
            context: {
              needsDateSelection: false,
              canModifyPlan: true,
              dataSource: 'localStorage',
              showCalendarFlow: false,
              allowSupplierUpdates: true
            },
            loading: false
          }
        }
      } catch (error) {
        console.log('  - ERROR - setting ERROR_FALLBACK', error)
        return {
          type: 'ERROR_FALLBACK',
          context: {
            needsDateSelection: true,
            canModifyPlan: false,
            dataSource: null,
            showCalendarFlow: true
          },
          loading: false
        }
      }
    }, [])
  
    // Set initial state immediately
    useEffect(() => {
      const initial = getInitialUserType()
      setUserType(initial.type)
      setUserContext(initial.context)
      setLoading(initial.loading)
  
      // Then do the full async detection if needed
      if (initial.type === 'LOCALSTORAGE_USER') {
        // Check if they're actually signed in (this might upgrade them to a different type)
        detectFullUserType()
      }
    }, [])
  
    const detectFullUserType = useCallback(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // User is signed in, check for database party
          const partyResult = await partyDatabaseBackend.getCurrentParty()
          const hasDatabaseParty = partyResult.success && !!partyResult.party
  
          if (hasDatabaseParty) {
            setUserType('DATABASE_USER')
            setUserContext({
              needsDateSelection: false,
              canModifyPlan: true,
              dataSource: 'database',
              showCalendarFlow: false,
              currentPartyId: partyResult.party.id,
              partyData: partyResult.party,
              userId: user.id,
              allowSupplierUpdates: 'conditional'
            })
          } else {
            setUserType('MIGRATION_NEEDED')
            setUserContext(prev => ({
              ...prev,
              userId: user.id,
              needsMigration: true
            }))
          }
        }
        // If no user, keep the existing ANONYMOUS or LOCALSTORAGE_USER type
      } catch (error) {
        console.error('Error in full user type detection:', error)
        // Keep existing state on error
      }
    }, [])
  
    return {
      userType,
      userContext,
      loading,
      refreshUserType: detectFullUserType
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
  