
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import LocalStorageDashboard from './components/LocalStorageDashboard'
import DatabaseDashboard from './components/DatabaseDashboard'
import DashboardOnboarding from './components/DashboardOnboarding'
import { usePartyBuilder } from "@/utils/partyBuilderBackend"

export default function DashboardPage() {
  const router = useRouter()
  const { buildParty } = usePartyBuilder()
  
  const [userType, setUserType] = useState(null) // null | 'localStorage' | 'database' | 'onboarding'
  const [isLoading, setIsLoading] = useState(true)
  const [isBuilding, setIsBuilding] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Add this to force refresh

  useEffect(() => {
    const determineUserType = async () => {
      try {
        // Check if user is signed in
        const userResult = await partyDatabaseBackend.getCurrentUser()
        
        if (userResult.success) {
          // User is signed in - check for database party
          const partyResult = await partyDatabaseBackend.getCurrentParty()
          
          if (partyResult.success && partyResult.party) {
            // Has database party - use database dashboard
 
            setUserType('database')
          } else {
            // Signed in but no database party - check localStorage
            const localPlan = localStorage.getItem('party_plan')
            const localDetails = localStorage.getItem('party_details')
            
            console.log('🔍 Router: Checking localStorage data:', { 
              localPlan: !!localPlan, 
              localDetails: !!localDetails 
            })
            
            // Parse and check localStorage data more thoroughly
            let hasValidPartyPlan = false
            let hasValidPartyDetails = false
            
            if (localPlan) {
              try {
                const parsedPlan = JSON.parse(localPlan)
                // Check if party plan has actual suppliers or meaningful data
                hasValidPartyPlan = parsedPlan && (
                  Object.keys(parsedPlan).some(key => 
                    parsedPlan[key] && 
                    typeof parsedPlan[key] === 'object' && 
                    parsedPlan[key].name // Has supplier with name
                  )
                )
                console.log('📦 Router: Party plan validity:', hasValidPartyPlan, parsedPlan)
              } catch (e) {
                console.log('⚠️ Router: Failed to parse party_plan')
              }
            }
            
            if (localDetails) {
              try {
                const parsedDetails = JSON.parse(localDetails)
                // Check if party details has meaningful data (not just defaults)
                hasValidPartyDetails = parsedDetails && (
                  parsedDetails.theme || 
                  parsedDetails.date || 
                  (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
                  parsedDetails.guestCount ||
                  parsedDetails.postcode
                )
                console.log('📋 Router: Party details validity:', hasValidPartyDetails, parsedDetails)
              } catch (e) {
                console.log('⚠️ Router: Failed to parse party_details')
              }
            }
            
            if (hasValidPartyPlan || hasValidPartyDetails) {
              // Has meaningful party data - use localStorage dashboard
              console.log('🎯 Router: Found valid localStorage data, showing LocalStorageDashboard')
              setUserType('localStorage')
            } else {
              // No meaningful data - show onboarding
              console.log('🎯 Router: No valid data found, showing onboarding')
              setUserType('onboarding')
            }
          }
        } else {
          // Not signed in - check for localStorage data
          const localPlan = localStorage.getItem('party_plan')
          const localDetails = localStorage.getItem('party_details')
          
      
          
          // Parse and check localStorage data more thoroughly
          let hasValidPartyPlan = false
          let hasValidPartyDetails = false
          
          if (localPlan) {
            try {
              const parsedPlan = JSON.parse(localPlan)
              // Check if party plan has actual suppliers
              hasValidPartyPlan = parsedPlan && (
                Object.keys(parsedPlan).some(key => 
                  parsedPlan[key] && 
                  typeof parsedPlan[key] === 'object' && 
                  parsedPlan[key].name // Has supplier with name
                )
              )
              console.log('📦 Router: Party plan validity (unsigned):', hasValidPartyPlan, parsedPlan)
            } catch (e) {
              console.log('⚠️ Router: Failed to parse party_plan (unsigned)')
            }
          }
          
          if (localDetails) {
            try {
              const parsedDetails = JSON.parse(localDetails)
              // Check if party details has meaningful data
              hasValidPartyDetails = parsedDetails && (
                parsedDetails.theme || 
                parsedDetails.date || 
                (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
                parsedDetails.guestCount ||
                parsedDetails.postcode
              )
       
            } catch (e) {
              console.log('⚠️ Router: Failed to parse party_details (unsigned)')
            }
          }
          
          if (hasValidPartyPlan || hasValidPartyDetails) {
  
 
            setUserType('localStorage')
          } else {
            
            setUserType('onboarding')
          }
        }
      } catch (error) {
        console.error('❌ Router: Error determining user type:', error)
        // On error, default to localStorage to avoid blocking users
        setUserType('localStorage')
      } finally {
        setIsLoading(false)
      }
    }

    determineUserType()
  }, [refreshKey]) // Add refreshKey as dependency

  // useEffect(() => {
  //   const determineUserType = async () => {
  //     try {
  //       // Check if user is signed in
  //       const userResult = await partyDatabaseBackend.getCurrentUser()
        
  //       if (userResult.success) {
  //         // User is signed in - check for database party
  //         const partyResult = await partyDatabaseBackend.getCurrentParty()
          
  //         if (partyResult.success && partyResult.party) {
  //           // Has database party - use database dashboard

  //           setUserType('database')
  //         } else {
  //           // Signed in but no database party - check localStorage
  //           const localPlan = localStorage.getItem('party_plan')
  //           const localDetails = localStorage.getItem('party_details')
            
  //           console.log('🔍 Router: Checking localStorage data:', { 
  //             localPlan: !!localPlan, 
  //             localDetails: !!localDetails 
  //           })
            
  //           // Parse and check localStorage data more thoroughly
  //           let hasValidPartyPlan = false
  //           let hasValidPartyDetails = false
            
  //           if (localPlan) {
  //             try {
  //               const parsedPlan = JSON.parse(localPlan)
  //               // Check if party plan has actual suppliers or meaningful data
  //               hasValidPartyPlan = parsedPlan && (
  //                 Object.keys(parsedPlan).some(key => 
  //                   parsedPlan[key] && 
  //                   typeof parsedPlan[key] === 'object' && 
  //                   parsedPlan[key].name // Has supplier with name
  //                 )
  //               )
  //               console.log('📦 Router: Party plan validity:', hasValidPartyPlan, parsedPlan)
  //             } catch (e) {
  //               console.log('⚠️ Router: Failed to parse party_plan')
  //             }
  //           }
            
  //           if (localDetails) {
  //             try {
  //               const parsedDetails = JSON.parse(localDetails)
  //               // Check if party details has meaningful data (not just defaults)
  //               hasValidPartyDetails = parsedDetails && (
  //                 parsedDetails.theme || 
  //                 parsedDetails.date || 
  //                 (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
  //                 parsedDetails.guestCount ||
  //                 parsedDetails.postcode
  //               )
  //               console.log('📋 Router: Party details validity:', hasValidPartyDetails, parsedDetails)
  //             } catch (e) {
  //               console.log('⚠️ Router: Failed to parse party_details')
  //             }
  //           }
            
  //           if (hasValidPartyPlan || hasValidPartyDetails) {
  //             // Has meaningful party data - use localStorage dashboard
  //             console.log('🎯 Router: Found valid localStorage data, showing LocalStorageDashboard')
  //             setUserType('localStorage')
  //           } else {
  //             // No meaningful data - show onboarding
  //             console.log('🎯 Router: No valid data found, showing onboarding')
  //             setUserType('onboarding')
  //           }
  //         }
  //       } else {
  //         // Not signed in - check for localStorage data
  //         const localPlan = localStorage.getItem('party_plan')
  //         const localDetails = localStorage.getItem('party_details')
          
          
  //         // Parse and check localStorage data more thoroughly
  //         let hasValidPartyPlan = false
  //         let hasValidPartyDetails = false
          
  //         if (localPlan) {
  //           try {
  //             const parsedPlan = JSON.parse(localPlan)
  //             // Check if party plan has actual suppliers
  //             hasValidPartyPlan = parsedPlan && (
  //               Object.keys(parsedPlan).some(key => 
  //                 parsedPlan[key] && 
  //                 typeof parsedPlan[key] === 'object' && 
  //                 parsedPlan[key].name // Has supplier with name
  //               )
  //             )
  //             console.log('📦 Router: Party plan validity (unsigned):', hasValidPartyPlan, parsedPlan)
  //           } catch (e) {
  //             console.log('⚠️ Router: Failed to parse party_plan (unsigned)')
  //           }
  //         }
          
  //         if (localDetails) {
  //           try {
  //             const parsedDetails = JSON.parse(localDetails)
  //             // Check if party details has meaningful data
  //             hasValidPartyDetails = parsedDetails && (
  //               parsedDetails.theme || 
  //               parsedDetails.date || 
  //               (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
  //               parsedDetails.guestCount ||
  //               parsedDetails.postcode
  //             )

  //           } catch (e) {
  //             console.log('⚠️ Router: Failed to parse party_details (unsigned)')
  //           }
  //         }
          
  //         if (hasValidPartyPlan || hasValidPartyDetails) {
  //           // Has meaningful party data - use localStorage dashboard
   
  //           setUserType('localStorage')
  //         } else {
        
  //           setUserType('onboarding')
  //         }
  //       }
  //     } catch (error) {
  //       console.error('❌ Router: Error determining user type:', error)
  //       // On error, default to localStorage to avoid blocking users
  //       setUserType('localStorage')
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   determineUserType()
  // }, [])

  // Helper functions for onboarding (same as your existing logic)
  const mapThemeValue = (formTheme) => {
    const themeMapping = {
      spiderman: "spiderman",
      "spider-man": "spiderman", 
      "taylor-swift": "taylor-swift",
      "taylor swift": "taylor-swift",
      swiftie: "taylor-swift",
      princess: "princess",
      dinosaur: "dinosaur",
      dino: "dinosaur",
      unicorn: "unicorn",
      science: "science",
      scientist: "science",
      laboratory: "science",
      superhero: "superhero",
      superheroes: "superhero",
      hero: "superhero",
      action: "superhero",
      "fairy-tale": "princess",
      "fairy tale": "princess",
      royal: "princess",
      prehistoric: "dinosaur",
      jurassic: "dinosaur",
      magic: "unicorn",
      magical: "unicorn",
      rainbow: "unicorn",
      stem: "science",
      experiment: "science",
      chemistry: "science",
    }

    const lowerTheme = formTheme?.toLowerCase() || ""
    return themeMapping[lowerTheme] || lowerTheme || "superhero"
  }

  const mapPostcodeToLocation = (postcode) => {
    const postcodeMap = {
      "w3-7qd": "West London",
      "sw1-1aa": "Central London", 
      "e1-6an": "East London",
      "n1-9gu": "North London",
      "se1-9sg": "South London",
    }
    return postcodeMap[postcode] || "London"
  }


  const handleOnboardingSubmit = async (formData) => {
    if (isBuilding) return
    
    try {
      setIsBuilding(true)
      
      const partyDetails = {
        date: formData.date,
        theme: mapThemeValue(formData.theme),
        guestCount: Number.parseInt(formData.guestCount),
        location: mapPostcodeToLocation(formData.postcode),
        postcode: formData.postcode,
        childName: "Emma", 
        childAge: 6, 
        budget: formData.budget || 500,
        
        // NEW: Time slot fields from onboarding form
        timeSlot: formData.timeSlot || "afternoon",
        duration: formData.duration || 2,
        
        // Handle specific time if user chose it
        specificTime: formData.needsSpecificTime ? formData.specificTime : null,
        
        // Legacy support
        time: formData.needsSpecificTime ? 
          formData.specificTime : 
          convertTimeSlotToLegacyTime(formData.timeSlot || "afternoon"),
        
        // Time preference metadata
        timePreference: formData.timePreference || {
          type: formData.needsSpecificTime ? 'specific' : 'flexible',
          slot: formData.timeSlot || "afternoon",
          duration: formData.duration || 2,
          specificTime: formData.needsSpecificTime ? formData.specificTime : null
        }
      }

  
      // Call the buildParty function
      const result = await buildParty(partyDetails)
  
      if (result.success) {
        console.log("✅ Party built successfully from dashboard onboarding!")
        console.log("⏰ Time slot information:", {
          timeSlot: result.timeSlot,
          duration: result.duration,
          timeWindow: result.timeWindow
        })
        
        // Give a small delay to ensure localStorage is updated
        setTimeout(() => {
          // Force refresh the router logic to detect new data
          console.log("🔄 Refreshing router to detect new party data...")
          setRefreshKey(prev => prev + 1)
          
          // Small delay before redirect to ensure state is updated
          setTimeout(() => {
            router.push("/dashboard?show_welcome=true")
          }, 100)
        }, 200)
        
      } else {
        console.error("Failed to build party:", result.error)
        // TODO: Show error message to user
      }
      
    } catch (error) {
      console.error('❌ Error creating party plan:', error)
      // TODO: Show error message to user
    } finally {
      setIsBuilding(false)
    }
  }
  
  // 3. Helper function to use in both handlers
  const convertTimeSlotToLegacyTime = (timeSlot) => {
    const timeSlotDefaults = {
      morning: '11:00',
      afternoon: '14:00'
    };
    return timeSlotDefaults[timeSlot] || '14:00';
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your party...</p>
        </div>
      </div>
    )
  }

  // Clean routing based on user type
  switch (userType) {
    case 'database':
      return <DatabaseDashboard />
    case 'localStorage':
      return <LocalStorageDashboard />
    case 'onboarding':
      return <DashboardOnboarding onFormSubmit={handleOnboardingSubmit} isSubmitting={isBuilding} />
    default:
      return <LocalStorageDashboard /> // Fallback
  }
}
