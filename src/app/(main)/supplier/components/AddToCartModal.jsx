"use client"

import { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, MapPin, Users, User, Cake, Sparkles, Gift, ArrowLeft, CheckCircle, PlusCircle } from "lucide-react"
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
  const [step, setStep] = useState(1) // 1 = choice, 2 = details, 3 = addons, 4 = confirmation
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [partyDate, setPartyDate] = useState(preSelectedDate || "")
  const [postcode, setPostcode] = useState("")
  const [guestCount, setGuestCount] = useState("")
  
  // NEW: Addon state
  const [selectedAddons, setSelectedAddons] = useState([])
  const [totalPrice, setTotalPrice] = useState(selectedPackage?.price || 0)

  // Get available add-ons from supplier
  const availableAddons = supplier?.serviceDetails?.addOnServices || []
  const hasAddons = availableAddons.length > 0
  const isEntertainer = supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"

  // Update party date when preSelectedDate changes
  useEffect(() => {
    if (preSelectedDate) {
      setPartyDate(preSelectedDate)
    }
  }, [preSelectedDate])

  // Calculate total price when addons change
  useEffect(() => {
    const basePrice = selectedPackage?.price || 0
    const addonsTotal = selectedAddons.reduce((total, addon) => total + (addon.price || 0), 0)
    setTotalPrice(basePrice + addonsTotal)
  }, [selectedPackage, selectedAddons])

  const handleChoiceSelection = useCallback((choice) => {
    if (choice === 'full') {
      onBuildFullParty()
    } else {
      setStep(2) // Go to details collection
    }
  }, [onBuildFullParty])

  const handleDetailsSubmit = useCallback(() => {
    if (!firstName.trim() || !childAge || !partyDate || !postcode || !guestCount) {
      return
    }

    // If supplier has addons and is an entertainer, show addon selection
    if (hasAddons && isEntertainer) {
      setStep(3) // Go to addon selection
    } else {
      // Skip addons, go straight to booking
      handleFinalBooking()
    }
  }, [firstName, childAge, partyDate, postcode, guestCount, hasAddons, isEntertainer])

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
  }, [])

  const handleFinalBooking = useCallback(() => {
    const partyDetails = {
      childName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      childAge: parseInt(childAge),
      date: partyDate,
      postcode: postcode.trim(),
      guestCount: parseInt(guestCount),
      location: mapPostcodeToLocation(postcode),
      theme: 'general',
      budget: null,
      timeSlot: 'afternoon',
      duration: 2,
      // NEW: Include addon information
      selectedAddons: selectedAddons,
      totalPrice: totalPrice,
      basePrice: selectedPackage?.price || 0
    }

    onJustBookSupplier(partyDetails)
  }, [firstName, lastName, childAge, partyDate, postcode, guestCount, selectedAddons, totalPrice, selectedPackage, onJustBookSupplier])

  const mapPostcodeToLocation = useCallback((postcode) => {
    const cleanPostcode = postcode.toLowerCase().replace(/\s/g, '')
    if (cleanPostcode.startsWith('w')) return "West London"
    if (cleanPostcode.startsWith('e')) return "East London"
    if (cleanPostcode.startsWith('n')) return "North London"
    if (cleanPostcode.startsWith('s')) return "South London"
    if (cleanPostcode.startsWith('ec') || cleanPostcode.startsWith('wc')) return "Central London"
    return "London"
  }, [])

  const handleClose = useCallback(() => {
    if (!isOpen) return
    
    setStep(1)
    setFirstName("")
    setLastName("")
    setChildAge("")
    setPartyDate(preSelectedDate || "")
    setPostcode("")
    setGuestCount("")
    setSelectedAddons([])
    setTotalPrice(selectedPackage?.price || 0)
    
    onClose()
  }, [isOpen, onClose, preSelectedDate, selectedPackage])

  const handleOpenChange = useCallback((open) => {
    if (!open) {
      handleClose()
    }
  }, [handleClose])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && step === 2) {
      handleDetailsSubmit()
    }
  }, [step, handleDetailsSubmit])

  // Category definitions for addons
  const categories = {
    'enhancement': { emoji: '✨', label: 'Enhancement' },
    'time': { emoji: '⏰', label: 'Time Extension' },
    'premium': { emoji: '🌟', label: 'Premium Upgrade' },
    'logistics': { emoji: '🚗', label: 'Logistics' },
    'seasonal': { emoji: '🎄', label: 'Seasonal' }
  }

  if (!supplier || !selectedPackage) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg w-[90vw] max-w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        
        {step === 1 ? (
          // Step 1: Choice between full party plan or just booking supplier
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl sm:text-2xl font-black text-primary-600 leading-tight">
                Great Choice! Let's Get Started 🎉
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Supplier Info */}
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                <div className="flex items-center space-x-3">
                  <Image
                    src={supplier?.image || "/placeholder.jpg"}
                    alt={supplier?.name || "Supplier"}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">{supplier?.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPackage?.name} - £{selectedPackage?.price}</p>
                  </div>
                </div>
              </div>

              {/* Snappy Image */}
              <div className="flex justify-center">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853551/1_1_lxuiqa.png"
                  alt="Snappy thinking"
                  width={120}
                  height={120}
                  className="sm:w-[150px] sm:h-[150px]"
                />
              </div>

              {/* Choice Explanation */}
              <div className="text-center space-y-3">
                <p className="text-gray-700 font-medium">
                  How would you like to plan your party?
                </p>
              </div>

              {/* Choice Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleChoiceSelection('full')}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-base rounded-xl h-14 flex items-center justify-between px-6"
                >
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div>Build Full Party Plan</div>
                      <div className="text-sm opacity-90">Get venue, catering, entertainment & more!</div>
                    </div>
                  </div>
                  <div className="text-2xl">🎊</div>
                </Button>

                <Button
                  onClick={() => handleChoiceSelection('single')}
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 font-bold text-base rounded-xl h-14 flex items-center justify-between px-6"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div>Just Book This Supplier</div>
                      <div className="text-sm text-gray-600">Add {supplier?.name} to my party</div>
                    </div>
                  </div>
                  <div className="text-2xl">📝</div>
                </Button>
              </div>

              <p className="text-center text-xs text-gray-500">
                Don't worry - you can always add more suppliers later! 
              </p>
            </div>
          </>
        ) : step === 2 ? (
          // Step 2: Collect party details
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl sm:text-2xl font-black text-primary-600 leading-tight">
                Almost There! Just a Few Details 🎈
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-center text-sm text-gray-600">
                We need these details so {supplier?.name} can plan the perfect party!
              </p>

              {/* Child Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Child's first name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      placeholder="e.g. Emma"
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
                      className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      placeholder="e.g. Smith"
                    />
                  </div>
                </div>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
                  Turning
                </Label>
                <div className="relative">
                  <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Select value={childAge} onValueChange={setChildAge}>
                    <SelectTrigger className="w-full pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(11)].map((_, i) => (
                        <SelectItem key={i + 2} value={String(i + 2)}>
                          {i + 2} years old
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Party Date - Read-only if preselected */}
              <div className="space-y-2">
                <Label htmlFor="partyDate" className="text-sm font-medium text-gray-700">
                  Party date
                  {preSelectedDate && (
                    <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                      ✅ From calendar
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  {preSelectedDate ? (
                    <div className="pl-10 pr-12 h-12 text-base border-2 border-green-200 bg-green-50 rounded-xl flex items-center text-gray-800 font-medium">
                      {new Date(preSelectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  ) : (
                    <Input
                      id="partyDate"
                      type="date"
                      value={partyDate}
                      onChange={(e) => setPartyDate(e.target.value)}
                      className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  )}
                  {preSelectedDate && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                {preSelectedDate && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    This date was verified as available with {supplier?.name}
                  </p>
                )}
              </div>

              {/* Location & Guest Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      placeholder="e.g. SW1A 1AA"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestCount" className="text-sm font-medium text-gray-700">
                    Number of children
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="guestCount"
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      placeholder="e.g. 12"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleDetailsSubmit}
                disabled={!firstName.trim() || !childAge || !partyDate || !postcode || !guestCount}
                className="flex-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                {hasAddons && isEntertainer ? "Continue" : `Create ${firstName.trim() ? `${firstName.trim()}'s` : "My"} Party! 🎉`}
              </Button>
            </div>
          </>
        ) : step === 3 ? (
          // Step 3: Addon Selection
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl sm:text-2xl font-black text-primary-600 leading-tight">
                Make It Extra Special! ✨
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-center text-sm text-gray-600">
                {supplier?.name} offers these optional extras to make {firstName.trim()}'s party even more amazing!
              </p>

              {/* Package Summary */}
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{selectedPackage.name}</h4>
                    <p className="text-sm text-gray-600">Base package</p>
                  </div>
                  <div className="text-xl font-bold text-primary-600">£{selectedPackage.price}</div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {availableAddons.map((addon) => {
                  const isSelected = isAddonSelected(addon)
                  const categoryInfo = categories[addon.category] || null
                  
                  return (
                    <div
                      key={addon.id}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-amber-400 bg-amber-50' 
                          : 'border-gray-200 bg-white hover:border-amber-200'
                      }`}
                      onClick={() => handleAddonToggle(addon)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onChange={() => handleAddonToggle(addon)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{addon.name}</h4>
                              {categoryInfo && (
                                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                                  {categoryInfo.emoji}
                                </span>
                              )}
                            </div>
                            <div className="text-lg font-bold text-amber-600">+£{addon.price}</div>
                          </div>
                          {addon.description && (
                            <p className="text-xs text-gray-600">{addon.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Base Package:</span>
                    <span className="font-semibold">£{selectedPackage.price}</span>
                  </div>
                  
                  {selectedAddons.map((addon) => (
                    <div key={addon.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">+ {addon.name}:</span>
                      <span className="font-medium">£{addon.price}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-primary-600">£{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button 
                onClick={handleAddonsConfirm}
                className="flex-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Party - £{totalPrice}
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}