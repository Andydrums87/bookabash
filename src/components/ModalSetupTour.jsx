"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Camera,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  ChevronRight,
  Users,
  Star,
  Info,
  Upload,
  MapPin,
  X,
  PackageIcon,
  PlusCircle,
  Loader2,
  Check
} from "lucide-react"
import { generateVenuePackages } from '@/utils/mockBackend'

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
      description: 'Upload a cover photo and portfolio images. Profiles with photos get 5x more bookings!',
      icon: Camera,
      color: 'bg-green-500',
      field: 'portfolioImages',
      helpText: 'Upload a cover photo (main image) and portfolio photos showing your work.',
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

export const ModalSetupTour = ({
  isOpen,
  onClose,
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
  
  // Load tour progress from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedProgress = localStorage.getItem('tourProgress')
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setCurrentStep(progress.currentStep || 0)
        setTourData(progress.tourData || {})
        setCompletedSteps(new Set(progress.completedSteps || []))
      } else {
        // Fresh start for new users
        setCurrentStep(0)
        setTourData({})
        setCompletedSteps(new Set())
      }
    }
  }, [isOpen])

  // Save tour progress to localStorage
  const saveTourProgress = () => {
    const progress = {
      currentStep,
      tourData,
      completedSteps: Array.from(completedSteps)
    }
    localStorage.setItem('tourProgress', JSON.stringify(progress))
  }

  // Check if step is already completed based on existing data
  const isStepCompleted = (stepId) => {
    if (!supplierData) return false
    
    switch (stepId) {
      case 'about':
        return supplierData.aboutUs && supplierData.aboutUs.trim().length >= 20
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

  const handleSkipStep = () => {
    if (currentStepData.canSkip) {
      saveTourProgress()
      handleNext()
    }
  }

  const handleCloseTour = () => {
    saveTourProgress()
    onClose()
  }

  const handleCompleteTour = () => {
    localStorage.setItem('hasSeenProfileTour', 'true')
    localStorage.setItem('tourCompleted', 'true')
    localStorage.removeItem('tourProgress')
    onClose()
  }

  // Cover photo upload handler
  const handleCoverPhotoUpload = async (files) => {
    if (!files || files.length === 0) return

    setSaving(true)
    try {
      const file = files[0] // Only take first file for cover photo
      
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please choose files under 10MB.')
        setSaving(false)
        return
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

      // Update supplier data with cover photo
      const result = await updateProfile({ 
        image: cloudinaryData.secure_url,
        coverPhoto: cloudinaryData.secure_url 
      })
      
      if (result.success) {
        console.log('Cover photo uploaded successfully')
        setCompletedSteps(prev => new Set([...prev, 'photos-cover']))
        saveTourProgress()
      }

    } catch (error) {
      console.error('Cover photo upload failed:', error)
      alert(`Failed to upload cover photo: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }
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
          setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
          saveTourProgress()
        }
      }

    } catch (error) {
      console.error('Photo upload failed:', error)
      alert(`Failed to upload photos: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Save and continue handler
  const handleSaveAndContinue = async () => {
    if (!currentStepData.field) {
      handleNext()
      return
    }

    setSaving(true)
    try {
      let updateData = {}
      
      switch (currentStepData.field) {
        case 'aboutUs':
          updateData = { 
            serviceDetails: {
              ...supplierData.serviceDetails,
              aboutUs: tourData.aboutUs || '',
            }
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
          if (createdPackages.length === 0) {
            alert('Please create your venue package first')
            setSaving(false)
            return
          }
          handleNext()
          setSaving(false)
          return

        default:
          handleNext()
          setSaving(false)
          return
      }

      if (Object.keys(updateData).length > 0) {
        const result = await updateProfile(updateData)
        
        if (result.success) {
          setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
          saveTourProgress()
        } else {
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

  // Venue package creation
  const handleCreateVenuePackage = async () => {
    if (!tourData.hourlyRate || !tourData.venueType || !tourData.capacity) {
      alert('Please complete venue type, capacity, and hourly rate first')
      return
    }

    setIsCreatingPackage(true)

    try {
      const hourlyRate = parseFloat(tourData.hourlyRate)
      
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

      const generatedPackages = generateVenuePackages(updatedServiceDetails, {
        ...supplierData,
        name: supplierData?.name || businessName,
        serviceDetails: updatedServiceDetails
      })

      // Use portfolio images for package image
      if (supplierData.portfolioImages && supplierData.portfolioImages.length > 0) {
        generatedPackages.forEach(pkg => {
          pkg.image = supplierData.portfolioImages[0].src
        })
      }

      const result = await updateProfile(
        { serviceDetails: updatedServiceDetails },
        generatedPackages,
        supplierData.id
      )

      if (result.success) {
        setCreatedPackages(generatedPackages)
        setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
        saveTourProgress()
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
    
    switch (step?.id) {
      case 'welcome':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Welcome to PartySnap!
            </h2>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Let's get your {isVenue ? 'venue' : 'entertainment business'} ready to receive bookings. 
              This tour will guide you through the essential steps.
            </p>
            <div className="bg-blue-50 rounded-lg p-3 text-left max-w-sm mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">What we'll cover:</h3>
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
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
            
            <div>
              <Label htmlFor="aboutUs" className="text-sm font-medium text-gray-700 mb-2 block">
                Your Business Story
              </Label>
              <Textarea
                id="aboutUs"
                value={tourData.aboutUs || supplierData?.aboutUs || ''}
                onChange={(e) => setTourData(prev => ({ ...prev, aboutUs: e.target.value }))}
                placeholder={step.placeholder}
                rows={4}
                className="w-full text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{step.helpText}</p>
              
              {tourData.aboutUs && (
                <div className="mt-1 text-xs text-gray-500">
                  {tourData.aboutUs.trim().split(/\s+/).length} words
                </div>
              )}
            </div>
          </div>
        )

      case 'photos':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
            
            <div className="space-y-4">
              {/* Cover Photo Section */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cover Photo (Main Image)</h4>
                <p className="text-xs text-gray-500 mb-3">Upload your main business photo that customers see first</p>
                
                {supplierData?.image && supplierData.image !== '/placeholder.jpg' && supplierData.image !== '/placeholder.png' ? (
                  <div className="relative">
                    <img 
                      src={supplierData.image} 
                      alt="Cover photo" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">✓ Added</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverPhotoUpload(e.target.files)}
                      className="hidden"
                      id="tour-cover-upload"
                    />
                    <Button 
                      size="sm"
                      onClick={() => document.getElementById('tour-cover-upload').click()}
                      disabled={saving}
                    >
                      {saving ? (
                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Uploading...</>
                      ) : (
                        <><Upload className="w-3 h-3 mr-1" />Upload Cover Photo</>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Portfolio Photos Section */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Portfolio Photos</h4>
                <p className="text-xs text-gray-500 mb-3">Show your work in action</p>

                {supplierData?.portfolioImages?.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {supplierData.portfolioImages.slice(0, 6).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-green-700 mb-2">
                        ✓ You have {supplierData.portfolioImages.length} photos uploaded
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          onClose()
                          onNavigate('/suppliers/media')
                        }}
                      >
                        Manage All Photos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                      className="hidden"
                      id="tour-portfolio-upload"
                    />
                    <Button 
                      size="sm"
                      onClick={() => document.getElementById('tour-portfolio-upload').click()}
                      disabled={saving}
                    >
                      {saving ? (
                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Uploading...</>
                      ) : (
                        <><Upload className="w-3 h-3 mr-1" />Upload Portfolio Photos</>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    onClose()
                    onNavigate('/suppliers/media')
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Or use the full photo manager →
                </Button>
              </div>
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
            
            <div>
              <div className="bg-amber-50 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-800">
                      <strong>Standard party duration:</strong> 2 hours (included in all your packages)
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      This rate applies when customers want to extend their party beyond 2 hours.
                    </p>
                  </div>
                </div>
              </div>
              
              <Label htmlFor="extraHourRate" className="text-sm font-medium text-gray-700 mb-2 block">
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
                  className="pl-8 h-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{step.helpText}</p>
            </div>
          </div>
        )

      case 'venue-details':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Venue Type</Label>
                <select
                  value={tourData.venueType || supplierData?.serviceDetails?.venueType || ''}
                  onChange={(e) => setTourData(prev => ({ ...prev, venueType: e.target.value }))}
                  className="w-full h-10 bg-white border-2 border-gray-200 rounded-lg text-sm px-3 focus:border-orange-500 focus:outline-none"
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Max Capacity</Label>
                <Input
                  type="number"
                  min="1"
                  value={tourData.capacity || supplierData?.serviceDetails?.capacity?.max || ''}
                  onChange={(e) => setTourData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="50"
                  className="h-10"
                />
              </div>
            </div>
            <p className="text-center text-xs text-gray-500">{step.helpText}</p>
          </div>
        )

      case 'packages':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <PackageIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
            
            {createdPackages.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-900 mb-1 text-sm">How Venue Packages Work</h4>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p>• Party time: 2 hours • Setup + cleanup: 2 hours</p>
                    <p>• Total: 4 hours • Price: Your hourly rate × 4</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Hourly Rate (£) *
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={tourData.hourlyRate || ''}
                    onChange={(e) => setTourData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="50"
                    className="h-10"
                    disabled={isCreatingPackage}
                  />
                  
                  {tourData.hourlyRate && (
                    <div className="bg-gray-50 p-2 rounded mt-2 text-xs">
                      <div className="flex justify-between">
                        <span>Package price:</span>
                        <span className="font-semibold text-green-600">
                          £{(parseFloat(tourData.hourlyRate) * 4).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleCreateVenuePackage}
                    disabled={isCreatingPackage || !tourData.hourlyRate || 
                             !(tourData.venueType || supplierData?.serviceDetails?.venueType) || 
                             !(tourData.capacity || supplierData?.serviceDetails?.capacity?.max)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    {isCreatingPackage ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Creating Package...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-1 h-3 w-3" />
                        Create Venue Package
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-green-900 text-sm">Package Created!</h4>
                  </div>
                  <p className="text-xs text-green-800">
                    Your venue package is ready for bookings.
                  </p>
                </div>

                {createdPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">{pkg.name}</h5>
                        <p className="text-gray-600 text-xs">{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">£{pkg.price}</div>
                        <div className="text-xs text-gray-500">{pkg.duration}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {pkg.features?.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {pkg.features?.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{pkg.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'verification':
        const dbsStatus = supplierData?.verification?.documents?.dbs?.status
        const isVerified = dbsStatus === 'approved'
        const isPending = dbsStatus === 'submitted'
        
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
            
            <div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 text-sm mb-1">UK Legal Requirement</h4>
                    <p className="text-xs text-red-800">
                      Enhanced DBS certificates are required by law for entertainers working with children.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <div>
                      <h5 className="font-medium text-sm">Enhanced DBS Certificate</h5>
                      <p className="text-xs text-gray-600">Legally required for child safety</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {isPending && <Clock className="w-4 h-4 text-yellow-600" />}
                    {!dbsStatus && <X className="w-4 h-4 text-red-600" />}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-sm">Photo ID</h5>
                      <p className="text-xs text-gray-600">Government-issued ID</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {['submitted', 'approved'].includes(supplierData?.verification?.documents?.id?.status) && 
                      <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <div>
                      <h5 className="font-medium text-sm">Address Proof</h5>
                      <p className="text-xs text-gray-600">Recent utility bill</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {['submitted', 'approved'].includes(supplierData?.verification?.documents?.address?.status) && 
                      <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              You're Ready to Go Live!
            </h2>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Your {isVenue ? 'venue' : 'entertainment business'} profile has everything needed to start receiving bookings.
            </p>
            <div className="bg-green-50 rounded-lg p-4 max-w-sm mx-auto mb-4">
              <h3 className="font-semibold text-green-900 mb-2 text-sm">What happens next:</h3>
              <ul className="text-xs text-green-800 space-y-1 text-left">
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Setup</h2>
              <p className="text-sm text-gray-600">
                {Math.round((completedSteps.size / (steps.length - 1)) * 100)}% complete • {currentStepData?.subtitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseTour}
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
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
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
            {currentStepData?.canSkip && (
              <Button variant="ghost" onClick={handleSkipStep} className="text-gray-600" size="sm">
                Skip for Now
              </Button>
            )}
            
            {currentStepData?.id === 'welcome' && (
              <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            
            {currentStepData?.id === 'verification' && (
              <Button 
                onClick={() => {
                  onClose()
                  onNavigate('/suppliers/verification')
                }} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Complete Verification
                <Shield className="w-4 h-4 ml-1" />
              </Button>
            )}
            
            {currentStepData?.id === 'complete' && (
              <Button onClick={() => {
                handleCompleteTour()
                onGoLive()
              }} className="bg-green-600 hover:bg-green-700 text-white">
                Go Live Now!
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            
            {currentStepData?.field && currentStepData?.id !== 'verification' && currentStepData?.id !== 'complete' && (
              <Button 
                onClick={handleSaveAndContinue} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? 'Saving...' : (isStepCompleted(currentStepData?.id) ? 'Continue' : 'Save & Continue')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            
            {currentStepData?.id === 'photos' && (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}