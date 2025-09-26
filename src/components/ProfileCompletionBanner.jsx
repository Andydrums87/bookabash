"use client"

import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Shield,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  RefreshCw,
} from "lucide-react"
import { useState, useEffect } from "react"
import { ModalSetupTour } from './ModalSetupTour' // Import the new modal tour
import { useSupplierDashboard } from '@/utils/mockBackend'
import { NavigationTour } from './NavigationTour' // instead of ModalSetupTour

export const ProfileCompletionBanner = ({
  supplierData,
  businessType,
  onNavigate,
  onGoLive,
  isPrimary = true,
  businessName,
}) => {
  const { updateProfile } = useSupplierDashboard()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTourModal, setShowTourModal] = useState(false)

  // Normalize business type to detect venues vs entertainment
  const normalizeBusinessType = (type) => {
    if (!type) return "entertainment"

    const normalized = type.toLowerCase()
    const venueTypes = ["venue", "venues", "venue_hire", "venue hire", "hall", "halls", "space", "spaces"]

    return venueTypes.includes(normalized) ? "venues" : "entertainment"
  }
  const isVenue = normalizeBusinessType(businessType) === "venues"
  const isEntertainment = normalizeBusinessType(businessType) === "entertainment"

  // Auto-open tour for new users
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenProfileTour') === 'true'
    const justCompletedOnboarding = localStorage.getItem('justCompletedOnboarding') === 'true'
    const tourSkipped = localStorage.getItem('tourSkipped') === 'true'
    const isProfileLive = supplierData?.profile_status === 'live' || 
                         supplierData?.profileStatus === 'live'
    
    // Auto-open tour for users who just completed onboarding
    if (justCompletedOnboarding && !hasSeenTour && !isProfileLive && !tourSkipped && supplierData) {
      setShowTourModal(true)
      localStorage.removeItem('justCompletedOnboarding') // Clear the flag after opening
    }
  }, [supplierData])

  // Calculate completion
  const calculateRealCompletion = () => {
    if (!supplierData) return { percentage: 0, missing: [], canGoLive: false }
  
    const missing = []
    let total = 0
    let completed = 0
  
    // Different checks for different business types
    let essentialChecks = []
  
    if (isVenue) {
      essentialChecks = [
        {
          field: "aboutUs",
          value: supplierData.serviceDetails?.aboutUs && supplierData.serviceDetails.aboutUs.length >= 20,
        },
        {
          field: "portfolioImages", 
          value: supplierData.portfolioImages && supplierData.portfolioImages.length >= 1,
        },
        {
          field: "serviceDetails.venueType",
          value: supplierData.serviceDetails?.venueType,
        },
        {
          field: "serviceDetails.pricing.hourlyRate",
          value: supplierData.serviceDetails?.pricing?.hourlyRate && supplierData.serviceDetails.pricing.hourlyRate > 0,
        },
        {
          field: "serviceDetails.capacity.max",
          value: supplierData.serviceDetails?.capacity?.max && supplierData.serviceDetails.capacity.max > 0,
        }
      ]
    } else {
      // Entertainment checks
      essentialChecks = [
        {
          field: "aboutUs",
          value: supplierData.serviceDetails?.aboutUs && supplierData.serviceDetails.aboutUs.length >= 20,
        },
        {
          field: "portfolioImages", 
          value: supplierData.portfolioImages && supplierData.portfolioImages.length >= 1,
        },
        {
          field: "extraHourRate",
          value: supplierData.extraHourRate && supplierData.extraHourRate > 0,
        }
      ]
  
      // Add verification for entertainers
      if (businessType?.toLowerCase() === 'entertainment') {
        essentialChecks.push({
          field: "verification.dbs",
          value: supplierData.verification?.documents?.dbs?.status === 'approved',
        })
      }
    }
  
    total = essentialChecks.length
    completed = essentialChecks.filter(check => check.value).length
  
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const canGoLive = percentage >= 100
  
    return { percentage, missing, canGoLive, completed, total }
  }

  const completion = calculateRealCompletion()

  // Check if tour is available/in progress
  const tourProgress = localStorage.getItem('tourProgress')
  const hasSeenTour = localStorage.getItem('hasSeenProfileTour') === 'true'
  const tourInProgress = tourProgress && !hasSeenTour

  // Don't show if already live and complete
  if (supplierData?.profile_status === "live" && completion.percentage >= 100) {
    return (
      <>
        <ModalSetupTour
          isOpen={showTourModal}
          onClose={() => setShowTourModal(false)}
          supplierData={supplierData}
          businessType={businessType}
          onNavigate={onNavigate}
          onGoLive={onGoLive}
          businessName={businessName}
          updateProfile={updateProfile}
        />
      </>
    )
  }

  if (completion.canGoLive) {
    return (
      <>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Ready to Go Live!</h3>
                <p className="text-sm text-green-700">
                  Your {isVenue ? "venue" : "profile"} has everything needed to start receiving bookings.
                  {isEntertainment && " All verification documents have been processed."}
                </p>
              </div>
            </div>
            <Button onClick={onGoLive} className="bg-green-600 hover:bg-green-700 text-white">
              Go Live Now
            </Button>
          </div>
        </div>

        <ModalSetupTour
          isOpen={showTourModal}
          onClose={() => setShowTourModal(false)}
          supplierData={supplierData}
          businessType={businessType}
          onNavigate={onNavigate}
          onGoLive={onGoLive}
          businessName={businessName}
          updateProfile={updateProfile}
        />
      </>
    )
  }

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isVenue ? "Venue Profile Setup" : "Profile Setup"}
                </h3>
                <p className="text-sm text-gray-600">
                  {completion.percentage}% complete • {completion.total - completion.completed} items remaining
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Tour button - shows different text based on state */}
              {!hasSeenTour && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTourModal(true)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {tourInProgress ? 'Continue Setup Tour' : 'Start Setup Tour'}
                </Button>
              )}

              {/* For users who completed/skipped tour but want to restart */}
              {hasSeenTour && completion.percentage < 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('hasSeenProfileTour')
                    localStorage.removeItem('tourProgress')
                    setShowTourModal(true)
                  }}
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restart Tour
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show Details
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  if (isVenue) {
                    onNavigate("/suppliers/profile")
                  } else {
                    // Check if verification is missing first
                    const needsVerification = isEntertainment && 
                      supplierData?.verification?.documents?.dbs?.status !== 'approved'
                    
                    if (needsVerification) {
                      onNavigate("/suppliers/verification")
                    } else {
                      onNavigate("/suppliers/profile")
                    }
                  }
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-lg"
              >
                {isVenue ? "Complete Venue" : "Complete Profile"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completion.percentage}%` }}
            ></div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Complete these items:</h4>
              <div className="space-y-2">
                {!supplierData?.serviceDetails?.aboutUs && (
                  <div className="flex items-center justify-between rounded-lg p-3 border bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary-400 rounded"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {isVenue ? "Venue Description" : "Business Description"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onNavigate("/suppliers/profile#about")}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Add Now
                    </Button>
                  </div>
                )}

                {(!supplierData?.portfolioImages || supplierData.portfolioImages.length === 0) && (
                  <div className="flex items-center justify-between rounded-lg p-3 border bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary-400 rounded"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {isVenue ? "Venue Photos" : "Portfolio Photos"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onNavigate("/suppliers/media")}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Add Now
                    </Button>
                  </div>
                )}

                {isVenue && !supplierData?.serviceDetails?.venueType && (
                  <div className="flex items-center justify-between rounded-lg p-3 border bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary-400 rounded"></div>
                      <span className="text-sm font-medium text-gray-900">Venue Type</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onNavigate("/suppliers/profile")}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Add Now
                    </Button>
                  </div>
                )}

                {isVenue && (!supplierData?.serviceDetails?.pricing?.hourlyRate || supplierData.serviceDetails.pricing.hourlyRate <= 0) && (
                  <div className="flex items-center justify-between rounded-lg p-3 border bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary-400 rounded"></div>
                      <span className="text-sm font-medium text-gray-900">Hourly Rate</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onNavigate("/suppliers/packages")}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Add Now
                    </Button>
                  </div>
                )}

                {isEntertainment && (!supplierData?.extraHourRate || supplierData.extraHourRate <= 0) && (
                  <div className="flex items-center justify-between rounded-lg p-3 border bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary-400 rounded"></div>
                      <span className="text-sm font-medium text-gray-900">Extra Hour Rate</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onNavigate("/suppliers/profile#pricing")}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Add Now
                    </Button>
                  </div>
                )}

                {isEntertainment && supplierData?.verification?.documents?.dbs?.status !== 'approved' && (
                  <div className="flex items-center justify-between rounded-lg p-3 border bg-red-50 border-red-200">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-red-600" />
                      <div>
                        <span className="text-sm font-medium text-red-900">
                          DBS Certificate *
                        </span>
                        <p className="text-xs text-red-600 mt-1">
                          Required by UK law for child safety
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onNavigate("/suppliers/verification")}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Upload Now
                    </Button>
                  </div>
                )}
              </div>

              {isEntertainment && (
                <p className="text-xs text-red-600 mt-3">
                  * Verification documents are required by UK law for child safety
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Tour Component */}
      <ModalSetupTour
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        supplierData={supplierData}
        businessType={businessType}
        onNavigate={onNavigate}
        onGoLive={onGoLive}
        businessName={businessName}
        updateProfile={updateProfile}
      />
    </>
  )
}