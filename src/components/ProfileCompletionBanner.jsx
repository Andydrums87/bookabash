"use client"

import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { ModalSetupTour } from "./ModalSetupTour"
import { useSupplierDashboard } from "@/utils/mockBackend"
import { useBusiness } from "@/contexts/BusinessContext"

export const ProfileCompletionBanner = ({
  supplierData,
  businessType,
  onNavigate,
  onGoLive,
  isPrimary = true,
  businessName,
}) => {
  const { updateProfile } = useSupplierDashboard()
  const { getPrimaryBusiness } = useBusiness()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTourModal, setShowTourModal] = useState(false)

  const normalizeBusinessType = (type) => {
    if (!type) return "entertainment"
    const normalized = type.toLowerCase()
    const venueTypes = ["venue", "venues", "venue_hire", "venue hire", "hall", "halls", "space", "spaces"]
    return venueTypes.includes(normalized) ? "venues" : "entertainment"
  }

  const isVenue = normalizeBusinessType(businessType) === "venues"
  const isEntertainment = normalizeBusinessType(businessType) === "entertainment"

  useEffect(() => {
    const justCompletedOnboarding = localStorage.getItem("justCompletedOnboarding") === "true"
    if (justCompletedOnboarding) {
      localStorage.removeItem("justCompletedOnboarding")
    }
  }, [])

  // Helper to get verification status - always from primary business
  const getVerificationStatus = () => {
    if (!isEntertainment) return { dbsStatus: null, dbsApproved: true }

    let verificationDocuments

    if (isPrimary) {
      // Primary business - use its own verification
      verificationDocuments = supplierData?.verification?.documents
    } else {
      // Themed business - get verification from primary business
      const primaryBusiness = getPrimaryBusiness()
      verificationDocuments = primaryBusiness?.data?.verification?.documents || primaryBusiness?.verification?.documents
    }

    if (typeof verificationDocuments === "string") {
      try {
        verificationDocuments = JSON.parse(verificationDocuments)
      } catch (e) {
        verificationDocuments = {}
      }
    }

    const dbsStatus = verificationDocuments?.dbs?.status
    const dbsApproved = dbsStatus === "approved"

    return { dbsStatus, dbsApproved, verificationDocuments }
  }

  const calculateRealCompletion = () => {
    if (!supplierData) return { percentage: 0, missing: [], canGoLive: false }

    let total = 0
    let completed = 0
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
        },
      ]
    } else {
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
          value: supplierData.serviceDetails?.extraHourRate && supplierData.serviceDetails?.extraHourRate > 0,
        },
      ]

      if (businessType?.toLowerCase() === "entertainment") {
        // Get verification status (from primary for themed businesses)
        const { dbsApproved } = getVerificationStatus()

        essentialChecks.push({
          field: "verification.dbs",
          value: dbsApproved,
        })
      }
    }

    total = essentialChecks.length
    completed = essentialChecks.filter((check) => check.value).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const canGoLive = percentage >= 100

    return { percentage, canGoLive, completed, total }
  }

  const completion = calculateRealCompletion()
  const tourProgress = localStorage.getItem("tourProgress")
  const hasSeenTour = localStorage.getItem("hasSeenProfileTour") === "true"

  const tourInProgress = tourProgress
    ? (() => {
        try {
          const progress = JSON.parse(tourProgress)
          return progress.currentStep > 0
        } catch {
          return false
        }
      })()
    : false

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
                  Your {isVenue ? "venue" : isPrimary ? "profile" : "themed package"} has everything needed to start
                  receiving bookings.
                  {isEntertainment && " All verification documents have been approved."}
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
                  {isVenue ? "Venue Profile Setup" : isPrimary ? "Profile Setup" : "Themed Package Setup"}
                </h3>
                <p className="text-sm text-gray-600">
                  {completion.percentage}% complete • {completion.total - completion.completed} items remaining
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
              {!hasSeenTour && isPrimary && (
                <div className="relative order-1 sm:order-none">
                  <Button
                    size="sm"
                    onClick={() => setShowTourModal(true)}
                    className="relative z-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg animate-pulse w-full sm:w-auto"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {tourInProgress ? "Continue Quick Wizard" : "Start Quick Wizard"}
                    </span>
                    <span className="sm:hidden">{tourInProgress ? "Continue" : "Start Wizard"}</span>
                  </Button>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-30 animate-pulse"></div>
                </div>
              )}

              {hasSeenTour && isPrimary && completion.percentage < 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem("hasSeenProfileTour")
                    localStorage.removeItem("tourProgress")
                    setShowTourModal(true)
                  }}
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start order-3 sm:order-none"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Restart Wizard</span>
                  <span className="sm:hidden">Restart</span>
                </Button>
              )}

              <div className="flex items-center gap-2 order-2 sm:order-none">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 flex-1 sm:flex-none"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Hide Details</span>
                      <span className="sm:hidden">Hide</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Show Details</span>
                      <span className="sm:hidden">Show</span>
                    </>
                  )}
                </Button>

                {hasSeenTour && completion.percentage < 100 && (
                  <Button
                    onClick={() => {
                      if (isVenue) {
                        onNavigate("/suppliers/profile")
                      } else {
                        const { dbsStatus } = getVerificationStatus()
                        const needsVerification = isEntertainment && dbsStatus !== "approved"

                        if (needsVerification && isPrimary) {
                          onNavigate("/suppliers/verification")
                        } else {
                          onNavigate("/suppliers/profile")
                        }
                      }
                    }}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-lg flex-1 sm:flex-none"
                  >
                    <span className="hidden sm:inline">
                      {isVenue ? "Complete Venue" : isPrimary ? "Complete Profile" : "Complete Package"}
                    </span>
                    <span className="sm:hidden">Complete</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
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
                {(!supplierData?.serviceDetails?.aboutUs || supplierData?.serviceDetails?.aboutUs.length < 20) && (
                  <div className="flex items-center justify-between rounded-lg p-3 border bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary-400 rounded"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {isVenue ? "Venue Description" : isPrimary ? "Business Description" : "Package Description"}
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

                {isVenue &&
                  (!supplierData?.serviceDetails?.pricing?.hourlyRate ||
                    supplierData.serviceDetails.pricing.hourlyRate <= 0) && (
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

                {isEntertainment &&
                  (!supplierData?.serviceDetails?.extraHourRate || supplierData.serviceDetails?.extraHourRate <= 0) && (
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

                {isEntertainment &&
                  (() => {
                    const { dbsStatus } = getVerificationStatus()
                    return dbsStatus !== "approved"
                  })() && (
                    <div className="flex items-center justify-between rounded-lg p-3 border bg-red-50 border-red-200">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const { dbsStatus } = getVerificationStatus()

                          if (dbsStatus === "submitted") {
                            return <Clock className="w-4 h-4 text-yellow-600" />
                          } else if (dbsStatus === "rejected") {
                            return <XCircle className="w-4 h-4 text-red-600" />
                          } else {
                            return <Shield className="w-4 h-4 text-red-600" />
                          }
                        })()}
                        <div>
                          <span className="text-sm font-medium text-red-900">
                            DBS Certificate * {!isPrimary && <span className="text-xs">(from primary profile)</span>}
                          </span>
                          {(() => {
                            const { dbsStatus } = getVerificationStatus()

                            if (dbsStatus === "submitted") {
                              return (
                                <p className="text-xs text-yellow-600 mt-1">Under review - typically 24-48 hours</p>
                              )
                            } else if (dbsStatus === "rejected") {
                              return (
                                <p className="text-xs text-red-600 mt-1">
                                  Rejected - please resubmit with feedback addressed
                                </p>
                              )
                            } else {
                              return <p className="text-xs text-red-600 mt-1">Required by UK law for child safety</p>
                            }
                          })()}
                        </div>
                      </div>
                      {(() => {
                        const { dbsStatus } = getVerificationStatus()

                        if (dbsStatus === "submitted") {
                          return (
                            <Button size="sm" variant="outline" disabled className="bg-yellow-50 border-yellow-200">
                              <Clock className="w-4 h-4 mr-1" />
                              Pending Review
                            </Button>
                          )
                        } else if (isPrimary) {
                          return (
                            <Button
                              size="sm"
                              onClick={() => onNavigate("/suppliers/verification")}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {dbsStatus === "rejected" ? "Resubmit" : "Upload Now"}
                            </Button>
                          )
                        } else {
                          return (
                            <Button size="sm" variant="outline" disabled className="text-gray-500 bg-transparent">
                              See Primary Profile
                            </Button>
                          )
                        }
                      })()}
                    </div>
                  )}
              </div>

              {isEntertainment && (
                <p className="text-xs text-red-600 mt-3">
                  * Verification documents must be approved before {isPrimary ? "going" : "any profile can go"} live
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {isPrimary && (
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
      )}
    </>
  )
}
