"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Camera,
  FileText,
  Shield,
  Clock,
  Users,
  Star,
  PackageIcon,
  X,
  Play
} from "lucide-react"

const TOUR_STEPS = {
  'entertainment': [
    {
      id: 'welcome',
      title: 'Welcome to PartySnap!',
      subtitle: "Let's get your business ready for bookings",
      description: "We'll guide you through your actual dashboard pages to complete your profile.",
      icon: Star,
      color: 'bg-purple-500',
      page: null // Modal step
    },
    {
      id: 'about',
      title: 'Tell Your Story',
      subtitle: 'Step 1 of 4',
      description: 'Add your business description on your profile page.',
      icon: FileText,
      color: 'bg-blue-500',
      page: '/suppliers/profile',
      queryParams: { tour: 'true', step: 'about', highlight: 'aboutUs' }
    },
    {
      id: 'photos',
      title: 'Showcase Your Work',
      subtitle: 'Step 2 of 4',
      description: 'Upload photos to your media gallery.',
      icon: Camera,
      color: 'bg-green-500',
      page: '/suppliers/media',
      queryParams: { tour: 'true', step: 'photos' }
    },
    {
      id: 'pricing',
      title: 'Set Your Rates',
      subtitle: 'Step 3 of 4',
      description: 'Configure your pricing on your profile page.',
      icon: Clock,
      color: 'bg-orange-500',
      page: '/suppliers/profile',
      queryParams: { tour: 'true', step: 'pricing', highlight: 'extraHourRate' }
    },
    {
      id: 'verification',
      title: 'Complete Verification',
      subtitle: 'Final Step - Critical',
      description: 'Upload required verification documents.',
      icon: Shield,
      color: 'bg-red-500',
      page: '/suppliers/verification',
      queryParams: { tour: 'true', step: 'verification' }
    }
  ],
  'venues': [
    {
      id: 'welcome',
      title: 'Welcome to PartySnap!',
      subtitle: "Let's get your venue ready for bookings",
      description: "We'll guide you through your actual dashboard pages to set up your venue.",
      icon: Star,
      color: 'bg-purple-500',
      page: null
    },
    {
      id: 'about',
      title: 'Describe Your Venue',
      subtitle: 'Step 1 of 4',
      description: 'Add your venue description on your profile page.',
      icon: FileText,
      color: 'bg-blue-500',
      page: '/suppliers/profile',
      queryParams: { tour: 'true', step: 'about', highlight: 'aboutUs' }
    },
    {
      id: 'photos',
      title: 'Show Your Space',
      subtitle: 'Step 2 of 4',
      description: 'Upload photos of your venue to your media gallery.',
      icon: Camera,
      color: 'bg-green-500',
      page: '/suppliers/media',
      queryParams: { tour: 'true', step: 'photos' }
    },
    {
      id: 'venue-details',
      title: 'Venue Details',
      subtitle: 'Step 3 of 4',
      description: 'Set your venue type and capacity on your profile page.',
      icon: Users,
      color: 'bg-orange-500',
      page: '/suppliers/profile',
      queryParams: { tour: 'true', step: 'venue-details', highlight: 'venueType,capacity' }
    },
    {
      id: 'packages',
      title: 'Create Your Package',
      subtitle: 'Step 4 of 4',
      description: 'Set up your venue packages and pricing.',
      icon: PackageIcon,
      color: 'bg-purple-500',
      page: '/suppliers/packages',
      queryParams: { tour: 'true', step: 'packages' }
    }
  ]
}

export const NavigationTour = ({
  isOpen,
  onClose,
  supplierData,
  businessType,
  onNavigate
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  // Normalize business type
  const normalizeBusinessType = (type) => {
    if (!type) return "entertainment"
    const normalized = type.toLowerCase()
    const venueTypes = ["venue", "venues", "venue_hire", "venue hire", "hall", "halls", "space", "spaces"]
    return venueTypes.includes(normalized) ? "venues" : "entertainment"
  }

  const isVenue = normalizeBusinessType(businessType) === "venues"
  const steps = TOUR_STEPS[isVenue ? 'venues' : 'entertainment']
  const currentStepData = steps[currentStep]

  // Load/save tour progress
  useEffect(() => {
    if (isOpen) {
      const savedProgress = localStorage.getItem('tourProgress')
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setCurrentStep(progress.currentStep || 0)
        setCompletedSteps(new Set(progress.completedSteps || []))
      }
    }
  }, [isOpen])

  const saveTourProgress = () => {
    const progress = {
      currentStep,
      completedSteps: Array.from(completedSteps)
    }
    localStorage.setItem('tourProgress', JSON.stringify(progress))
  }

  // Check if step is completed based on actual data
  const isStepCompleted = (stepId) => {
    if (!supplierData) return false
    
    switch (stepId) {
      case 'about':
        return supplierData.serviceDetails?.aboutUs && supplierData.serviceDetails.aboutUs.length >= 20
      case 'photos':
        return supplierData.portfolioImages && supplierData.portfolioImages.length >= 1
      case 'pricing':
        return supplierData.extraHourRate && supplierData.extraHourRate > 0
      case 'venue-details':
        return supplierData.serviceDetails?.venueType && 
               supplierData.serviceDetails?.capacity?.max > 0
      case 'packages':
        return supplierData.packages && supplierData.packages.length > 0 &&
               supplierData.serviceDetails?.pricing?.hourlyRate > 0
      case 'verification':
        return supplierData.verification?.documents?.dbs?.status === 'approved'
      default:
        return false
    }
  }

  // Update completed steps based on actual data
  useEffect(() => {
    const completed = new Set()
    steps.forEach(step => {
      if (isStepCompleted(step.id)) {
        completed.add(step.id)
      }
    })
    setCompletedSteps(completed)
  }, [supplierData])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      saveTourProgress()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      saveTourProgress()
    }
  }

  const handleGoToStep = () => {
    if (currentStepData.page) {
      // Navigate to the actual page with tour parameters
      const queryString = new URLSearchParams(currentStepData.queryParams).toString()
      const url = `${currentStepData.page}?${queryString}`
      
      // Mark step as started in tour progress
      saveTourProgress()
      
      // Close modal and navigate
      onClose()
      onNavigate(url)
    } else {
      // Handle modal-only steps (like welcome)
      handleNext()
    }
  }

  const handleSkipStep = () => {
    if (currentStepData.page) {
      // Skip this step but continue tour
      handleNext()
    }
  }

  const handleCompleteTour = () => {
    localStorage.setItem('hasSeenProfileTour', 'true')
    localStorage.setItem('tourCompleted', 'true')
    localStorage.removeItem('tourProgress')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Setup Tour</h2>
              <p className="text-sm text-gray-600">
                {Math.round((completedSteps.size / (steps.length - 1)) * 100)}% complete • {currentStepData.subtitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 ${currentStepData.color} rounded-full flex items-center justify-center mx-auto`}>
              <currentStepData.icon className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{currentStepData.title}</h3>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>

            {/* Step-specific content */}
            {currentStepData.id === 'welcome' && (
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">How this works:</h4>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• We'll guide you to each page of your dashboard</li>
                  <li>• Complete each section at your own pace</li>
                  <li>• Your progress is automatically saved</li>
                  <li>• You can continue the tour anytime</li>
                </ul>
              </div>
            )}

            {currentStepData.page && (
              <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>We'll take you to:</span>
                  <span className="font-medium text-blue-600">{currentStepData.page}</span>
                </div>
                {isStepCompleted(currentStepData.id) && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Already completed</span>
                  </div>
                )}
              </div>
            )}

            {currentStepData.id === 'verification' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 text-sm mb-1">UK Legal Requirement</h4>
                    <p className="text-xs text-red-800">
                      Enhanced DBS certificates are required by law for entertainers working with children.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <Button variant="ghost" onClick={handleBack} className="text-gray-600">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStepData.page && (
              <Button variant="ghost" onClick={handleSkipStep} className="text-gray-600" size="sm">
                Skip for Now
              </Button>
            )}
            
            {currentStepData.id === 'welcome' && (
              <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                Start Tour
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {currentStepData.page && (
              <Button 
                onClick={handleGoToStep}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isStepCompleted(currentStepData.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Review
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Go to Page
                  </>
                )}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {currentStep === steps.length - 1 && (
              <Button onClick={handleCompleteTour} className="bg-green-600 hover:bg-green-700 text-white">
                Complete Tour
                <CheckCircle className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}