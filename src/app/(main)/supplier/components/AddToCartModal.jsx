"use client"

import { useState, useCallback, useEffect } from "react"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, MapPin, Users, User, Cake, Sparkles, Gift, ArrowLeft, CheckCircle, PlusCircle, Star, Zap } from "lucide-react"
import Image from "next/image"

export default function AlaCarteModal({ 
  isOpen, 
  onClose, 
  supplier, 
  selectedPackage, 
  onBuildFullParty, 
  onJustBookSupplier,
  preSelectedDate = null
}) {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [partyDate, setPartyDate] = useState(preSelectedDate || "")
  const [postcode, setPostcode] = useState("")
  // Initialize guest count as undefined for dropdown placeholder to show
  const [guestCount, setGuestCount] = useState()
  const [selectedAddons, setSelectedAddons] = useState([])
  const [totalPrice, setTotalPrice] = useState(selectedPackage?.price || 0)

  const availableAddons = supplier?.serviceDetails?.addOnServices || []
  const hasAddons = availableAddons.length > 0
  const isEntertainer = supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"

  // Add state change tracking
  useEffect(() => {
    console.log('🔄 Name state changed - firstName:', firstName, 'lastName:', lastName, 'childAge:', childAge)
  }, [firstName, lastName, childAge])

  useEffect(() => {
    console.log('🔄 Location state changed - postcode:', postcode, 'guestCount:', guestCount)
  }, [postcode, guestCount])

  useEffect(() => {
    if (preSelectedDate) {
      setPartyDate(preSelectedDate)
    }
  }, [preSelectedDate])

  useEffect(() => {
    const basePrice = selectedPackage?.price || 0
    const addonsTotal = selectedAddons.reduce((total, addon) => total + (addon.price || 0), 0)
    setTotalPrice(basePrice + addonsTotal)
  }, [selectedPackage, selectedAddons])

  const mapPostcodeToLocation = useCallback((postcode) => {
    const cleanPostcode = postcode.toLowerCase().replace(/\s/g, '')
    if (cleanPostcode.startsWith('w')) return "West London"
    if (cleanPostcode.startsWith('e')) return "East London"
    if (cleanPostcode.startsWith('n')) return "North London"
    if (cleanPostcode.startsWith('s')) return "South London"
    if (cleanPostcode.startsWith('ec') || cleanPostcode.startsWith('wc')) return "Central London"
    return "London"
  }, [])

  const handleChoiceSelection = useCallback((choice) => {
    if (choice === 'full') {
      onBuildFullParty()
    } else {
      setStep(2)
    }
  }, [onBuildFullParty])

  const handleFinalBooking = useCallback(() => {
    console.log('🚀 Starting handleFinalBooking in a-la-carte modal')
    
    // Capture current state immediately
    const currentFirstName = firstName
    const currentLastName = lastName
    const currentChildAge = childAge
    const currentPartyDate = partyDate
    const currentPostcode = postcode
    const currentGuestCount = guestCount
    
    console.log('📝 Current state captured:', { 
      currentFirstName, 
      currentLastName, 
      currentChildAge, 
      currentPartyDate, 
      currentPostcode, 
      currentGuestCount
    })
    
    const partyDetails = {
      childName: `${currentFirstName.trim()} ${currentLastName.trim()}`.trim(),
      firstName: currentFirstName.trim(),
      lastName: currentLastName.trim(),
      childAge: parseInt(currentChildAge),
      date: currentPartyDate,
      postcode: currentPostcode.trim(),
      guestCount: parseInt(currentGuestCount),
      location: mapPostcodeToLocation(currentPostcode),
      theme: 'general',
      budget: null,
      timeSlot: 'afternoon',
      duration: 2,
      selectedAddons: selectedAddons,
      totalPrice: totalPrice,
      basePrice: selectedPackage?.price || 0,
      // Mark this as a-la-carte flow so welcome popup can be skipped
      source: 'a_la_carte',
      skipWelcomePopup: true,
      // Add timestamp for debugging
      savedAt: new Date().toISOString()
    }

    console.log('💾 Party details to be passed:', partyDetails)

    // Let the parent handle localStorage - just pass the data
    console.log('📤 Calling onJustBookSupplier with validated data')
    onJustBookSupplier(partyDetails)
  }, [firstName, lastName, childAge, partyDate, postcode, guestCount, selectedAddons, totalPrice, selectedPackage, onJustBookSupplier, mapPostcodeToLocation])

  const handleDetailsSubmit = useCallback(() => {
    console.log('🔍 Validating form data:', { firstName, childAge, partyDate, postcode, guestCount })
    
    // Enhanced validation with specific error messages
    const missingFields = []
    if (!firstName.trim()) missingFields.push('First name')
    if (!childAge) missingFields.push('Age')
    if (!partyDate) missingFields.push('Party date')
    if (!postcode.trim()) missingFields.push('Postcode')
    if (!guestCount) missingFields.push('Guest count')
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields)
      alert(`Please fill in the following required fields:\n• ${missingFields.join('\n• ')}`)
      return
    }
    
    console.log('✅ All fields validated successfully')
    
    if (hasAddons && isEntertainer) {
      setStep(3)
    } else {
      handleFinalBooking()
    }
  }, [firstName, childAge, partyDate, postcode, guestCount, hasAddons, isEntertainer, handleFinalBooking])

  const handleAddonToggle = useCallback((addon) => {
    setSelectedAddons(prev => {
      const isSelected = prev.some(a => a.id === addon.id)
      return isSelected 
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    })
  }, [])

  const isAddonSelected = useCallback((addon) => {
    return selectedAddons.some(a => a.id === addon.id)
  }, [selectedAddons])

  const handleAddonsConfirm = useCallback(() => {
    handleFinalBooking()
  }, [handleFinalBooking])

  const handleClose = useCallback(() => {
    if (!isOpen) return
    setStep(1)
    setFirstName("")
    setLastName("")
    setChildAge("")
    setPartyDate(preSelectedDate || "")
    setPostcode("")
    setGuestCount(undefined)
    setSelectedAddons([])
    setTotalPrice(selectedPackage?.price || 0)
    onClose()
  }, [isOpen, onClose, preSelectedDate, selectedPackage])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && step === 2) {
      handleDetailsSubmit()
    }
  }, [step, handleDetailsSubmit])

  if (!supplier || !selectedPackage) {
    return null
  }

  // Remove the guestCountOptions array since we're not using dropdown anymore

  // Get modal configuration based on step
  const getModalConfig = () => {
    switch (step) {
      case 1:
        return {
          size: 'md',
          theme: 'fun',
          title: 'Ready to Add This Supplier?',
          subtitle: 'Choose how you\'d like to plan your party',
          icon: <Sparkles className="w-6 h-6" />
        }
      case 2:
        return {
          size: 'md',
          theme: 'fun',
          title: `Party Details for ${supplier?.name} 🎈`,
          subtitle: 'Help us create the perfect party experience',
          icon: <Gift className="w-6 h-6" />
        }
      case 3:
        return {
          size: 'lg',
          theme: 'fun',
          title: 'Optional Extras ✨',
          subtitle: `Make ${firstName.trim()}'s party even more special`,
          icon: <Star className="w-6 h-6" />
        }
      default:
        return {
          size: 'md',
          theme: 'fun',
          title: 'Add Supplier',
          subtitle: '',
          icon: <Gift className="w-6 h-6" />
        }
    }
  }

  const config = getModalConfig()

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={handleClose}
      size={config.size}
      theme={config.theme}
    >
      <ModalHeader 
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        theme={config.theme}
      />

      <ModalContent>
        {step === 1 && (
          /* Step 1: Choice Interface with Better Borders */
          <div className="space-y-4">
            {/* Full Party Option */}
            <div 
              onClick={() => handleChoiceSelection('full')}
              className="group cursor-pointer p-6 rounded-xl border-2 border-purple-200 bg-white/30 backdrop-blur-sm hover:bg-white/40 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform duration-200">
                    <Sparkles className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Build Complete Party Plan</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Get venue, catering, entertainment, decorations & more!
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700">Most popular choice</span>
                    </div>
                  </div>
                </div>
                <div className="text-3xl group-hover:scale-110 transition-transform duration-200">🎊</div>
              </div>
            </div>

            {/* Single Supplier Option */}
            <div 
              onClick={() => handleChoiceSelection('single')}
              className="group cursor-pointer p-6 rounded-xl border-2 border-blue-200 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform duration-200">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Just Book This Supplier</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Add {supplier?.name} to your party and manage everything yourself
                    </p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">Quick & simple</span>
                    </div>
                  </div>
                </div>
                <div className="text-3xl group-hover:scale-110 transition-transform duration-200">📝</div>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-600">
                💡 Don't worry - you can always add more suppliers to your party later!
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          /* Step 2: Details Form */
          <div className="space-y-4">
            {/* Child Details */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-11 text-base border-2 border-gray-200 focus:border-primary-400 rounded-lg"
                    placeholder="Emma"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last name <span className="text-gray-400 text-xs">(optional)</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-11 text-base border-2 border-gray-200 focus:border-primary-400 rounded-lg"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
                  Turning
                </Label>
                <div className="relative">
                  <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Select value={childAge} onValueChange={setChildAge}>
                    <SelectTrigger className="w-full pl-10 h-11 border-2 border-gray-200 focus:border-primary-400 rounded-lg">
                      <SelectValue placeholder="Select age" className="text-sm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 years old</SelectItem>
                      <SelectItem value="3">3 years old</SelectItem>
                      <SelectItem value="4">4 years old</SelectItem>
                      <SelectItem value="5">5 years old</SelectItem>
                      <SelectItem value="6">6 years old</SelectItem>
                      <SelectItem value="7">7 years old</SelectItem>
                      <SelectItem value="8">8 years old</SelectItem>
                      <SelectItem value="9">9 years old</SelectItem>
                      <SelectItem value="10">10 years old</SelectItem>
                      <SelectItem value="11">11 years old</SelectItem>
                      <SelectItem value="12">12 years old</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Party Date */}
            <div className="space-y-2">
              <Label htmlFor="partyDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Party date
                {preSelectedDate && (
                  <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                    ✓ Available
                  </span>
                )}
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {preSelectedDate ? (
                  <div className="pl-10 pr-4 h-11 text-base bg-emerald-50 border-2 border-emerald-200 rounded-lg flex items-center text-emerald-800 font-medium">
                    {new Date(preSelectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                ) : (
                  <Input
                    id="partyDate"
                    type="date"
                    value={partyDate}
                    onChange={(e) => setPartyDate(e.target.value)}
                    className="pl-10 h-11 text-base border-2 border-gray-200 focus:border-primary-400 rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                )}
              </div>
            </div>

            {/* Location & Guests */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                  Postcode
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="postcode"
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-11 text-base border-2 border-gray-200 focus:border-primary-400 rounded-lg"
                    placeholder="SW1A 1AA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestCount" className="text-sm font-medium text-gray-700">
                  Kids attending
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Select value={guestCount} onValueChange={setGuestCount}>
                    <SelectTrigger className="w-full pl-10 h-11 py-5 border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] rounded-lg placeholder:text-xs">
                      <SelectValue placeholder="How many kids?" className="text-xs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Up to 5 kids</SelectItem>
                      <SelectItem value="10">Up to 10 kids</SelectItem>
                      <SelectItem value="15">Up to 15 kids</SelectItem>
                      <SelectItem value="20">Up to 20 kids</SelectItem>
                      <SelectItem value="25">Up to 25 kids</SelectItem>
                      <SelectItem value="30">30+ kids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          /* Step 3: Addons */
          <div className="space-y-4">
            {/* Base Package Summary */}
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedPackage.name}</h4>
                  <p className="text-sm text-gray-600">Base package</p>
                </div>
                <div className="text-xl font-bold text-primary-600">£{selectedPackage.price}</div>
              </div>
            </div>

            {/* Add-ons Grid */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableAddons.map((addon) => {
                const isSelected = isAddonSelected(addon)
                return (
                  <div
                    key={addon.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                      isSelected 
                        ? 'border-white/50 bg-white/40' 
                        : 'border-white/30 bg-white/20 hover:bg-white/30'
                    }`}
                    onClick={() => handleAddonToggle(addon)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => handleAddonToggle(addon)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                          <span className="font-bold text-primary-600">+£{addon.price}</span>
                        </div>
                        {addon.description && (
                          <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total Summary */}
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-gray-900">Total Price:</span>
                <span className="font-bold text-primary-600">£{totalPrice}</span>
              </div>
              {selectedAddons.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Including {selectedAddons.length} extra{selectedAddons.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </ModalContent>

      <ModalFooter theme={config.theme}>
        {step === 1 ? (
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Choose your preferred planning approach above
            </p>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-11 bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {step === 2 ? (
              <Button 
                onClick={handleDetailsSubmit}
                disabled={!firstName.trim() || !childAge || !partyDate || !postcode || !guestCount}
                className="flex-2 bg-white text-primary-600 hover:bg-white/90 font-semibold h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasAddons && isEntertainer ? "Continue" : `Add ${supplier?.name}! 🎉`}
                {(!firstName.trim() || !childAge || !partyDate || !postcode || !guestCount) && (
                  <span className="ml-2 text-xs opacity-75">(Fill all fields)</span>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleAddonsConfirm}
                className="flex-2 bg-white text-primary-600 hover:bg-white/90 font-semibold h-11"
              >
                Add to Party - £{totalPrice}
              </Button>
            )}
          </div>
        )}
      </ModalFooter>
    </UniversalModal>
  )
}