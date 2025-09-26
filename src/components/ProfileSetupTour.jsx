"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateVenuePackages } from '@/utils/mockBackend'
import { useState, useEffect } from "react"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Camera,
  PackageIcon,
  FileText,
  PlusCircle,
  Check,
  Shield,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,

  Users,
  Star,
  Info,
  Upload,
  MapPin,
  X
} from "lucide-react"
import Image from "next/image"

const TOUR_STEPS = {
  'entertainment': [
    {
      id: 'welcome',
      title: 'Welcome to PartySnap!',
      subtitle: "Let's get your business ready for bookings",
      description: "We'll guide you through 4 quick steps. You can skip any section you're not ready for and complete it later.",
      icon: Star,
      color: 'bg-purple-500',
      canSkip: false
    },
    {
      id: 'about',
      title: 'Tell Your Story',
      subtitle: 'Step 1 of 4',
      description: 'Help families understand what makes your entertainment special. This appears on your public profile.',
      icon: FileText,
      color: 'bg-blue-500',
      field: 'aboutUs',
      placeholder: 'Tell customers about your business, your passion for entertainment, what makes you unique, and why families love choosing you...',
      helpText: 'Share your story, highlight what makes you different. Keep it friendly and engaging - about 50-120 words.',
      canSkip: true
    },
    {
      id: 'photos',
      title: 'Showcase Your Work',
      subtitle: 'Step 2 of 4',
      description: 'Upload photos that show your services in action. Profiles with photos get 5x more bookings!',
      icon: Camera,
      color: 'bg-green-500',
      field: 'portfolioImages',
      helpText: 'Upload 3-5 high-quality photos showing your entertainment in action, happy customers, and your setup.',
      canSkip: true
    },
    {
      id: 'pricing',
      title: 'Set Your Rates',
      subtitle: 'Step 3 of 4', 
      description: 'Set your hourly rate for party extensions beyond your standard 2-hour shows.',
      icon: Clock,
      color: 'bg-orange-500',
      field: 'extraHourRate',
      helpText: 'Most entertainers charge £30-80 per extra hour. This helps customers budget for longer parties.',
      canSkip: true
    },
    {
      id: 'verification',
      title: 'Complete Verification',
      subtitle: 'Final Step - Critical',
      description: 'Upload verification documents. This is required by UK law for anyone working with children.',
      icon: Shield,
      color: 'bg-red-500',
      field: 'verification',
      helpText: 'Enhanced DBS certificate is legally required. ID and address verification build trust with families.',
      canSkip: false,
      isCritical: true
    }
  ],
  'venues': [
    {
      id: 'welcome',
      title: 'Welcome to PartySnap!',
      subtitle: "Let's get your venue ready for bookings",
      description: "We'll guide you through 5 quick steps. You can skip any section you're not ready for and complete it later.",
      icon: Star,
      color: 'bg-purple-500',
      canSkip: false
    },
    {
      id: 'about',
      title: 'Describe Your Venue',
      subtitle: 'Step 1 of 5',
      description: 'Tell families about your space and what makes it perfect for parties.',
      icon: FileText,
      color: 'bg-blue-500',
      field: 'aboutUs',
      placeholder: 'Describe your venue space, what makes it special for parties, included amenities, and why families love it...',
      helpText: 'Highlight your space, capacity, what\'s included, and what makes it special for celebrations.',
      canSkip: true
    },
    {
      id: 'photos',
      title: 'Show Your Space',
      subtitle: 'Step 2 of 5',
      description: 'Upload photos of your venue so families can see what they\'re booking.',
      icon: Camera,
      color: 'bg-green-500',
      field: 'portfolioImages',
      helpText: 'Include photos of the main space, facilities, parking, and any special features.',
      canSkip: true
    },
    {
      id: 'venue-details',
      title: 'Venue Details',
      subtitle: 'Step 3 of 5',
      description: 'Set your venue type and capacity.',
      icon: Users,
      color: 'bg-orange-500',
      field: 'venueBasicDetails',
      helpText: 'This helps families find venues that fit their party size.',
      canSkip: true
    },
    {
      id: 'packages',
      title: 'Create Your Package',
      subtitle: 'Step 4 of 5',
      description: 'Set your hourly rate and generate your venue package.',
      icon: PackageIcon,
      color: 'bg-purple-500',
      field: 'venuePackage',
      helpText: 'We\'ll create a complete venue package that customers can book instantly.',
      canSkip: true
    },
    {
      id: 'complete',
      title: 'Ready to Go Live!',
      subtitle: 'Setup Complete',
      description: 'Your venue profile and package are ready. You can go live immediately or continue adding details.',
      icon: CheckCircle,
      color: 'bg-green-600',
      canSkip: false
    }
  ]

}

export const ProfileSetupTour = ({
  supplierData,
  businessType,
  onNavigate,
  onGoLive,
  isPrimary = true,
  businessName,
  updateProfile
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [tourData, setTourData] = useState({})
  const [saving, setSaving] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [isCreatingPackage, setIsCreatingPackage] = useState(false)
const [createdPackages, setCreatedPackages] = useState([])
const [venueSetupComplete, setVenueSetupComplete] = useState(false)
  
  // Normalize business type
  const normalizeBusinessType = (type) => {
    if (!type) return "entertainment"
    const normalized = type.toLowerCase()
    const venueTypes = ["venue", "venues", "venue_hire", "venue hire", "hall", "halls", "space", "spaces"]
    return venueTypes.includes(normalized) ? "venues" : "entertainment"
  }

  const isVenue = normalizeBusinessType(businessType) === "venues"
  const isEntertainment = normalizeBusinessType(businessType) === "entertainment"
  const steps = TOUR_STEPS[isVenue ? 'venues' : 'entertainment']
  const currentStepData = steps[currentStep]
  
  const isStepCompleted = (stepId) => {
    if (!supplierData) return false
    
    switch (stepId) {
      case 'about':
        return supplierData.aboutUs && supplierData.aboutUs.trim().length >= 20
      case 'photos':
        return supplierData.portfolioImages && supplierData.portfolioImages.length >= 1
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
  

  // Initialize completed steps based on existing data
  useEffect(() => {
    const completed = new Set()
    steps.forEach(step => {
      if (isStepCompleted(step.id)) {
        completed.add(step.id)
      }
    })
    setCompletedSteps(completed)
  }, [supplierData])

  // Calculate overall completion percentage
  const completionPercentage = Math.round((completedSteps.size / (steps.length - 1)) * 100) // -1 to exclude welcome step

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkipStep = () => {
    if (currentStepData.canSkip) {
      handleNext()
    }
  }

  // Photo upload handler for tour
  const handlePhotoUpload = async (files) => {
    if (!files || files.length === 0) return

    setSaving(true)
    try {
      const newImages = []
      
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          alert('File size too large. Please choose files under 10MB.')
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'portfolio_images')

        const response = await fetch('https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const cloudinaryData = await response.json()

        const newImage = {
          id: Date.now() + Math.random(),
          src: cloudinaryData.secure_url,
          alt: `Portfolio image ${newImages.length + 1}`,
          title: file.name.split('.')[0].replace(/[_-]/g, ' '),
          description: '',
          originalFileName: file.name,
          fileSize: file.size,
          cloudinaryId: cloudinaryData.public_id
        }

        newImages.push(newImage)
      }

      if (newImages.length > 0) {
        const existingImages = supplierData?.portfolioImages || []
        const updatedImages = [...existingImages, ...newImages]

        const result = await updateProfile({ portfolioImages: updatedImages })
        
        if (result.success) {
          console.log('Photos uploaded successfully')
          setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
          
          // Force a refresh to show the new images
          window.dispatchEvent(new CustomEvent('supplierDataUpdated', {
            detail: { supplierId: result.supplier.id }
          }))
        }
      }

    } catch (error) {
      console.error('Photo upload failed:', error)
      alert(`Failed to upload photos: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSkipTour = () => {
    // Set flag that user has seen the tour
    localStorage.setItem('hasSeenProfileTour', 'true')
    localStorage.setItem('tourSkipped', 'true')
    
    // Navigate to regular dashboard
    onNavigate('/suppliers/dashboard')
  }

  const handleSaveAndContinue = async () => {
    if (!currentStepData.field) {
      handleNext()
      return
    }
  
    // Mark tour as in progress
    localStorage.setItem('tourInProgress', 'true')
  
    setSaving(true)
    try {
      let updateData = {}
      
      // Handle different field types
      switch (currentStepData.field) {
        case 'aboutUs':
          updateData = { 
            aboutUs: tourData.aboutUs || '',
            description: tourData.aboutUs || '',
          }
          break
  
        case 'extraHourRate':
          updateData = { 
            extraHourRate: parseInt(tourData.extraHourRate) || 0,
            serviceDetails: {
              ...supplierData.serviceDetails,
              extraHourRate: parseInt(tourData.extraHourRate) || 0
            }
          }
          break
  
        case 'venueBasicDetails':
          // Save venue type and capacity only
          updateData = {
            serviceDetails: {
              ...supplierData.serviceDetails,
              venueType: tourData.venueType || '',
              capacity: {
                ...supplierData.serviceDetails?.capacity,
                max: parseInt(tourData.capacity) || 0
              }
            }
          }
          break
  
        case 'venuePackage':
          // For packages step, check if packages were created
          if (createdPackages.length === 0) {
            alert('Please create your venue package first')
            setSaving(false)
            return
          }
          // Package already saved in handleCreateVenuePackage, just continue
          handleNext()
          setSaving(false)
          return
  
        default:
          // No specific save action needed for this step
          handleNext()
          setSaving(false)
          return
      }
  
      console.log('Saving tour data:', updateData)
  
      if (Object.keys(updateData).length > 0) {
        const result = await updateProfile(updateData)
        
        if (result.success) {
          console.log('Tour step saved successfully')
          setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
        } else {
          console.error('Failed to save:', result.error)
          throw new Error(result.error || 'Save failed')
        }
      }
      
      handleNext()
    } catch (error) {
      console.error('Failed to save step:', error)
      alert(`Failed to save: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }
  const handleCompleteTour = () => {
    // Mark tour as completed
    localStorage.setItem('hasSeenProfileTour', 'true')
    localStorage.setItem('tourCompleted', 'true')
    
    // Navigate to regular dashboard or profile
    onNavigate('/suppliers/dashboard')
  }



  const handleGoToVerification = () => {
    // Mark tour as seen and redirect to verification
    localStorage.setItem('hasSeenProfileTour', 'true')
    onNavigate('/suppliers/verification')
  }
  const handleCreateVenuePackage = async () => {
    if (!tourData.hourlyRate || !tourData.venueType || !tourData.capacity) {
      alert('Please complete venue type, capacity, and hourly rate first')
      return
    }
  
    setIsCreatingPackage(true)
  
    try {
      const hourlyRate = parseFloat(tourData.hourlyRate)
      
      // Create complete service details
      const updatedServiceDetails = {
        ...supplierData.serviceDetails,
        venueType: tourData.venueType,
        pricing: {
          ...supplierData.serviceDetails?.pricing,
          hourlyRate: hourlyRate,
        },
        capacity: {
          ...supplierData.serviceDetails?.capacity,
          max: parseInt(tourData.capacity)
        },
        availability: {
          ...supplierData.serviceDetails?.availability,
          minimumBookingHours: 2
        }
      }
  
      // Generate packages using the same function as Packages component
      const generatedPackages = generateVenuePackages(updatedServiceDetails, {
        ...supplierData,
        name: supplierData?.name || businessName,
        serviceDetails: updatedServiceDetails
      })
  
      // Use the first portfolio image as package image
      if (supplierData.portfolioImages && supplierData.portfolioImages.length > 0) {
        generatedPackages.forEach(pkg => {
          pkg.image = supplierData.portfolioImages[0].src // Just use the URL string
        })
      }
  
      console.log('Generated packages in tour:', generatedPackages)
  
      // Use supplierData.id instead of supplier.id
      const result = await updateProfile(
        { serviceDetails: updatedServiceDetails },
        generatedPackages,
        supplierData.id
      )
  
      if (result.success) {
        // Update local state
        setCreatedPackages(generatedPackages)
        setVenueSetupComplete(true)
        
        // Mark step as completed
        setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
        
        console.log('Venue packages created successfully in tour')
      } else {
        throw new Error(result.error)
      }
      
    } catch (error) {
      console.error('Venue package creation error:', error)
      alert(`Failed to create venue package: ${error.message}`)
    } finally {
      setIsCreatingPackage(false)
    }
  }


  const renderStepContent = () => {
    const step = currentStepData
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to PartySnap!
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Let's get your {isVenue ? 'venue' : 'entertainment business'} ready to receive bookings. 
              This tour will guide you through the essential steps.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">What we'll cover:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Tell your business story</li>
                <li>• Upload showcase photos</li>
                <li>• {isVenue ? 'Set venue details & pricing' : 'Set your rates'}</li>
                {isEntertainment && <li>• Complete verification (required by law)</li>}
              </ul>
            </div>
          </div>
        )

      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Label htmlFor="aboutUs" className="text-base font-medium text-gray-700 mb-2 block">
                Your Business Story
              </Label>
              <Textarea
                id="aboutUs"
                value={tourData.aboutUs || supplierData?.aboutUs || ''}
                onChange={(e) => setTourData(prev => ({ ...prev, aboutUs: e.target.value }))}
                placeholder={step.placeholder}
                rows={5}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">{step.helpText}</p>
              
              {tourData.aboutUs && (
                <div className="mt-2 text-sm text-gray-500">
                  {tourData.aboutUs.trim().split(/\s+/).length} words
                </div>
              )}
            </div>
          </div>
        )

      case 'photos':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              {supplierData?.portfolioImages?.length > 0 ? (
                // Show existing photos
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {supplierData.portfolioImages.slice(0, 6).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-green-700 mb-3">
                      ✓ You have {supplierData.portfolioImages.length} photos uploaded
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => onNavigate('/suppliers/media')}
                        className="bg-transparent"
                      >
                        Manage All Photos
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Show upload interface
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Your Photos</h4>
                    <p className="text-gray-500 mb-4">{step.helpText}</p>
                    
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                      className="hidden"
                      id="tour-photo-upload"
                    />
                    
                    <Button onClick={() => document.getElementById('tour-photo-upload').click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Photos
                    </Button>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      JPG or PNG, up to 10MB each. You can add more later.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => onNavigate('/suppliers/media')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Or use the full photo manager →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      <strong>Standard party duration:</strong> 2 hours (included in all your packages)
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      This rate applies when customers want to extend their party beyond 2 hours.
                    </p>
                  </div>
                </div>
              </div>
              
              <Label htmlFor="extraHourRate" className="text-base font-medium text-gray-700 mb-2 block">
                Extra Hour Rate
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <Input
                  id="extraHourRate"
                  type="number"
                  min="10"
                  max="200"
                  value={tourData.extraHourRate || supplierData?.extraHourRate || ''}
                  onChange={(e) => setTourData(prev => ({ ...prev, extraHourRate: e.target.value }))}
                  placeholder="45"
                  className="pl-8 text-lg h-12"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{step.helpText}</p>
            </div>
          </div>
        )

// Add the venue-details step content
case 'venue-details':
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-gray-600">{step.description}</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium text-gray-700 mb-2 block">Venue Type</Label>
            <select
              value={tourData.venueType || supplierData?.serviceDetails?.venueType || ''}
              onChange={(e) => setTourData(prev => ({ ...prev, venueType: e.target.value }))}
              className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-orange-500 focus:outline-none"
            >
              <option value="">Choose your venue type</option>
              <option value="Community Hall">Community Hall</option>
              <option value="Church Hall">Church Hall</option>
              <option value="School Hall">School Hall</option>
              <option value="Sports Centre">Sports Centre</option>
              <option value="Private Function Room">Private Function Room</option>
              <option value="Village Hall">Village Hall</option>
              <option value="Community Centre">Community Centre</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <Label className="text-base font-medium text-gray-700 mb-2 block">Max Capacity</Label>
            <Input
              type="number"
              min="1"
              value={tourData.capacity || supplierData?.serviceDetails?.capacity?.max || ''}
              onChange={(e) => setTourData(prev => ({ ...prev, capacity: e.target.value }))}
              placeholder="50"
              className="h-12"
            />
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 max-w-md mx-auto">{step.helpText}</p>
      </div>
    </div>
  )

// Add the packages step content (this is the key one)
case 'packages':
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <PackageIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-gray-600">{step.description}</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Explanation Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How Venue Packages Work</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Party time:</strong> 2 hours (minimum booking)</p>
            <p>• <strong>Setup time:</strong> 1 hour included (before party)</p>
            <p>• <strong>Cleanup time:</strong> 1 hour included (after party)</p>
            <p>• <strong>Total venue time:</strong> 4 hours</p>
            <p>• <strong>Package price:</strong> Your hourly rate × 4 hours</p>
          </div>
        </div>

        {createdPackages.length === 0 ? (
          // Package Creation Form (exactly like Packages component)
          <div className="space-y-6">
            {/* Debug info - remove this after testing */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
              <div>Debug info:</div>
              <div>tourData.hourlyRate: {tourData.hourlyRate || 'not set'}</div>
              <div>tourData.venueType: {tourData.venueType || 'not set'}</div>
              <div>tourData.capacity: {tourData.capacity || 'not set'}</div>
              <div>supplierData.venueType: {supplierData?.serviceDetails?.venueType || 'not set'}</div>
              <div>supplierData.capacity: {supplierData?.serviceDetails?.capacity?.max || 'not set'}</div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="space-y-3">
                <Label htmlFor="hourlyRate" className="text-base font-semibold">
                  Hourly Rate (£) *
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="1"
                  value={tourData.hourlyRate || ''}
                  onChange={(e) => setTourData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="50"
                  className="text-lg h-12"
                  disabled={isCreatingPackage}
                />
                <p className="text-sm text-gray-600">
                  Your base rate per hour for venue hire
                </p>
              </div>
            </div>

            {/* Preview calculation */}
            {tourData.hourlyRate && !isCreatingPackage && (
              <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                <h4 className="font-semibold mb-2">Package Preview:</h4>
                <div className="text-sm space-y-1">
                  <div>Party time: 2 hours</div>
                  <div>Setup + Cleanup: 2 hours included</div>
                  <div>Total venue time: 4 hours</div>
                  <div className="font-semibold text-lg text-green-600">
                    Package price: £{(parseFloat(tourData.hourlyRate) * 4).toFixed(0)}
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isCreatingPackage && (
              <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Creating your venue package...</h4>
                    <p className="text-sm text-blue-700">Saving to your account</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <Button
                onClick={handleCreateVenuePackage}
                disabled={isCreatingPackage || !tourData.hourlyRate || 
                         !(tourData.venueType || supplierData?.serviceDetails?.venueType) || 
                         !(tourData.capacity || supplierData?.serviceDetails?.capacity?.max)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                {isCreatingPackage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Package...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Venue Package
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Show Created Packages (exactly like Packages component)
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Package Created Successfully!</h4>
              </div>
              <p className="text-sm text-green-800">
                Your venue package is now ready for bookings. You can edit it anytime from your packages page.
              </p>
            </div>

            {/* Display the created packages */}
            <div className="grid grid-cols-1 gap-4">
              {createdPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="text-xl font-bold text-gray-900">{pkg.name}</h5>
                      <p className="text-gray-600 mt-1">{pkg.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">
                        £{pkg.price}
                      </div>
                      <div className="text-sm text-gray-500">{pkg.duration}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h6 className="font-semibold text-gray-900 mb-2">What's Included:</h6>
                    {pkg.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 mb-3">
                You can add more packages or edit existing ones later from your Packages page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )



      case 'verification':
        const dbsStatus = supplierData?.verification?.documents?.dbs?.status
        const isVerified = dbsStatus === 'approved'
        const isPending = dbsStatus === 'submitted'
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">UK Legal Requirement</h4>
                    <p className="text-sm text-red-800">
                      Enhanced DBS certificates are required by law for entertainers working with children. 
                      You cannot go live without completing verification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <div>
                      <h5 className="font-medium">Enhanced DBS Certificate</h5>
                      <p className="text-sm text-gray-600">Legally required for child safety</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isVerified && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {isPending && <Clock className="w-5 h-5 text-yellow-600" />}
                    {!dbsStatus && <X className="w-5 h-5 text-red-600" />}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="font-medium">Photo ID</h5>
                      <p className="text-sm text-gray-600">Government-issued ID</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {['submitted', 'approved'].includes(supplierData?.verification?.documents?.id?.status) && 
                      <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <h5 className="font-medium">Address Proof</h5>
                      <p className="text-sm text-gray-600">Recent utility bill or statement</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {['submitted', 'approved'].includes(supplierData?.verification?.documents?.address?.status) && 
                      <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-6">{step.helpText}</p>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              You're Ready to Go Live!
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Your {isVenue ? 'venue' : 'entertainment business'} profile has everything needed to start receiving bookings.
            </p>
            <div className="bg-green-50 rounded-lg p-6 max-w-md mx-auto mb-6">
              <h3 className="font-semibold text-green-900 mb-3">What happens next:</h3>
              <ul className="text-sm text-green-800 space-y-2 text-left">
                <li>• Your profile becomes visible to customers</li>
                <li>• You can receive instant bookings</li>
                <li>• Families can view your photos and details</li>
                <li>• You'll get email notifications for new enquiries</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      {/* Progress Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Setup</h2>
            <p className="text-sm text-gray-600">
              {completionPercentage}% complete • {currentStepData.subtitle}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipTour}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip Tour
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {steps.slice(1).map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 text-xs ${
                completedSteps.has(step.id) ? 'text-green-600' :
                index + 1 === currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {completedSteps.has(step.id) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className={`w-4 h-4 rounded-full border-2 ${
                  index + 1 === currentStep ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                }`} />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-8">
        {renderStepContent()}
      </div>

      {/* Navigation Footer */}
      <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-between">
        <div>
          {currentStep > 0 && (
            <Button variant="ghost" onClick={handleBack} className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStepData.canSkip && (
            <Button variant="ghost" onClick={handleSkipStep} className="text-gray-600">
              Skip for Now
            </Button>
          )}
          
          {currentStepData.id === 'welcome' && (
            <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {currentStepData.id === 'verification' && (
            <Button 
              onClick={handleGoToVerification} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Complete Verification
              <Shield className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {currentStepData.id === 'complete' && (
            <Button onClick={onGoLive} className="bg-green-600 hover:bg-green-700 text-white">
              Go Live Now!
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {currentStepData.field && currentStepData.id !== 'verification' && currentStepData.id !== 'complete' && (
            <Button 
              onClick={handleSaveAndContinue} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Saving...' : (isStepCompleted(currentStepData.id) ? 'Continue' : 'Save & Continue')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {currentStepData.id === 'photos' && (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}