"use client"

import { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [guestCount, setGuestCount] = useState("")
  const [selectedAddons, setSelectedAddons] = useState([])
  const [totalPrice, setTotalPrice] = useState(selectedPackage?.price || 0)

  const availableAddons = supplier?.serviceDetails?.addOnServices || []
  const hasAddons = availableAddons.length > 0
  const isEntertainer = supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"

  // ... (keeping all the existing logic functions)
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

  const handleChoiceSelection = useCallback((choice) => {
    if (choice === 'full') {
      onBuildFullParty()
    } else {
      setStep(2)
    }
  }, [onBuildFullParty])

  const handleDetailsSubmit = useCallback(() => {
    if (!firstName.trim() || !childAge || !partyDate || !postcode || !guestCount) {
      return
    }
    if (hasAddons && isEntertainer) {
      setStep(3)
    } else {
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

  if (!supplier || !selectedPackage) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg w-[90vw] max-w-[95vw] sm:w-full md:max-h-[90vh] h-[80vh] overflow-y-auto">
        
        {step === 1 ? (
          // Step 1: Cleaner Choice Interface
          <>
            <DialogHeader className="text-center pb-4">
              <DialogTitle className="text-3xl font-bold text-gray-800 mb-2">
                Ready to Add This Supplier? 
              </DialogTitle>
              <p className="text-gray-600">Choose how you'd like to plan your party</p>
            </DialogHeader>

            {/* Selected Package Display */}
            {/* <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={supplier?.image || "/placeholder.jpg"}
                    alt={supplier?.name || "Supplier"}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                  />
                  <div className="absolute -top-2 -right-2 bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{supplier?.name}</h3>
                  <p className="text-primary-600 font-semibold">{selectedPackage?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-primary-600">£{selectedPackage?.price}</span>
                    <span className="text-sm text-gray-500">selected</span>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Choice Cards */}
            <div className="space-y-4 mb-6">
              
              {/* Full Party Option */}
              <div 
                onClick={() => handleChoiceSelection('full')}
                className="group cursor-pointer p-6 rounded-xl border-2 border-[hsl(var(--primary-200))] bg-gradient-to-r from-primary-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] hover:from-primary-100 hover:to-primary-200 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-500 rounded-full p-3 group-hover:scale-110 transition-transform duration-200">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Build Complete Party Plan</h3>
                      <p className="text-gray-600  text-sm mb-3">
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
                className="group cursor-pointer p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-100 group-hover:bg-gray-200 rounded-full p-3 transition-colors duration-200">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Just Book This Supplier</h3>
                      <p className="text-gray-600 text-sm mb-3">
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
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                💡 Don't worry - you can always add more suppliers to your party later!
              </p>
            </div>
          </>
        ) : step === 2 ? (
          // Step 2: Streamlined Details Form
          <>
            <DialogHeader className="text-center ">
              <DialogTitle className="text-3xl font-bold text-gray-800">
                Party Details for {supplier?.name} 🎈
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Help us create the perfect party experience
              </p>
            </DialogHeader>

            <div className="space-y-4">
              {/* Child Details Row */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Child's name
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
                  <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
                    Age
                  </Label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Select  value={childAge} onValueChange={setChildAge}>
                      <SelectTrigger className="w-full pl-10 h-20 text-base border-2 border-gray-200 focus:border-primary-400 rounded-lg">
                        <SelectValue placeholder="Age" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(11)].map((_, i) => (
                          <SelectItem key={i + 2} value={String(i + 2)}>
                            {i + 2}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

            

              {/* Location & Guests Row */}
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
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="guestCount"
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-11 text-base border-2 border-gray-200 focus:border-primary-400 rounded-lg"
                      placeholder="12"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </div>
            </div>
  {/* Party Date */}
  <div className="space-y-2">
                <Label htmlFor="partyDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Party date
                  {preSelectedDate && (
                    <span className="text-xs text-white bg-primary-500 px-2 py-0.5 rounded-full">
                      ✓ Confirmed available
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white" />
                  {preSelectedDate ? (
                    <div className="pl-10 pr-4 h-11 text-base  bg-primary-500 rounded-lg flex items-center text-white font-medium">
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
            {/* Navigation */}
            <div className="flex gap-3 pt-6">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-11"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleDetailsSubmit}
                disabled={!firstName.trim() || !childAge || !partyDate || !postcode || !guestCount}
                className="flex-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold h-11 disabled:opacity-50"
              >
                {hasAddons && isEntertainer ? "Continue" : `Add ${supplier?.name}! 🎉`}
              </Button>
            </div>
          </>
        ) : step === 3 ? (
          // Step 3: Cleaner Addons (keeping existing logic but better styling)
          <>
            <DialogHeader className=" pb-4">
              <DialogTitle className="text-4xl font-bold text-gray-800 mb-2">
                Optional Extras ✨
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Make {firstName.trim()}'s party even more special
              </p>
            </DialogHeader>

            <div className="space-y-4">
              {/* Base Package Summary */}
              <div className="bg-primary-50 rounded-lg p-4 border border-[hsl(var(--primary-200))]">
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
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-primary-400 bg-primary-50' 
                          : 'border-gray-200 bg-white hover:border-primary-200'
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
              <div className="bg-gray-50 rounded-lg ">
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

            {/* Navigation */}
            <div className="flex gap-3 pt-6">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 h-11"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleAddonsConfirm}
                className="flex-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold h-11"
              >
                Add to Party - £{totalPrice}
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}