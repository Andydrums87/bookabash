"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, MapPin, Users, PoundSterling, FileText, User, Cake, Sparkles } from 'lucide-react'
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"

export default function EditPartyModal({ isOpen, onClose, partyDetails, onSave }) {
  // Initialize names
  const initializeNames = () => {
    // Priority 1: Use firstName/lastName if available
    if (partyDetails?.firstName || partyDetails?.lastName) {
      return {
        firstName: partyDetails.firstName || "",
        lastName: partyDetails.lastName || ""
      };
    }
    // Priority 2: Split childName if available
    if (partyDetails?.childName) {
      const nameParts = partyDetails.childName.trim().split(' ');
      return {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(' ') || ""
      };
    }
    // Priority 3: Fallback
    return {
      firstName: "",
      lastName: ""
    };
  };

  const { firstName: initFirstName, lastName: initLastName } = initializeNames()
  const [firstName, setFirstName] = useState(initFirstName)
  const [lastName, setLastName] = useState(initLastName)
  const [childAge, setChildAge] = useState(partyDetails?.childAge || "")

  // Safe date initialization
  const initializeDate = () => {
    if (!partyDetails?.date) return new Date()
    if (partyDetails.date instanceof Date && !isNaN(partyDetails.date.getTime())) {
      return partyDetails.date
    }
    if (typeof partyDetails.date === "string") {
      const testDate = new Date(partyDetails.date)
      if (!isNaN(testDate.getTime())) {
        return testDate
      }
    }
    return new Date() // Fallback to today
  }

  const [date, setDate] = useState(initializeDate())
  const [startTime, setStartTime] = useState(partyDetails?.startTime || "14:00") // Default to 2pm
  const [duration, setDuration] = useState(partyDetails?.duration || 2)
  const [location, setLocation] = useState(partyDetails?.location || "")
  const [guestCount, setGuestCount] = useState(partyDetails?.guestCount || "")
  const [budget, setBudget] = useState(partyDetails?.budget || "")
  const [specialNotes, setSpecialNotes] = useState(partyDetails?.specialNotes || "")
  const [postcode, setPostcode] = useState(partyDetails?.postcode || "")

  // Duration options for children's parties
  const durationOptions = [
    { value: 1.5, label: "1½ hours" },
    { value: 2, label: "2 hours", popular: true },
    { value: 2.5, label: "2½ hours" },
    { value: 3, label: "3 hours", popular: true },
    { value: 3.5, label: "3½ hours" },
    { value: 4, label: "4 hours" },
  ]

  // Start time options
  const timeOptions = [
    { value: "09:00", label: "9am", popular: false },
    { value: "10:00", label: "10am", popular: true },
    { value: "11:00", label: "11am", popular: true },
    { value: "12:00", label: "12pm", popular: true },
    { value: "13:00", label: "1pm", popular: true },
    { value: "14:00", label: "2pm", popular: true },
    { value: "15:00", label: "3pm", popular: false },
    { value: "16:00", label: "4pm", popular: false },
    { value: "17:00", label: "5pm", popular: false },
  ]

  // Guest count options
  const guestOptions = [
    { value: "5", label: "5 guests" },
    { value: "10", label: "10 guests" },
    { value: "15", label: "15 guests" },
    { value: "20", label: "20 guests" },
    { value: "25", label: "25 guests" },
    { value: "30", label: "30+ guests" },
  ]

  // Format time for display
  const formatTimeForDisplay = (timeInput) => {
    if (!timeInput) return null
    try {
      const [hours, minutes] = timeInput.split(":")
      const timeObj = new Date()
      timeObj.setHours(parseInt(hours), parseInt(minutes || 0))
      return timeObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: minutes && minutes !== '00' ? "2-digit" : undefined,
        hour12: true,
      })
    } catch (error) {
      return timeInput
    }
  }

  // Calculate end time for preview
  const calculateEndTime = (startTime, durationHours) => {
    if (!startTime || !durationHours) return null
    try {
      const [hours, minutes] = startTime.split(":")
      const startDate = new Date()
      startDate.setHours(parseInt(hours), parseInt(minutes || 0))
      
      const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000))
      
      return endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: endDate.getMinutes() > 0 ? "2-digit" : undefined,
        hour12: true,
      })
    } catch (error) {
      return null
    }
  }

  const timePreview = (() => {
    const start = formatTimeForDisplay(startTime)
    const end = calculateEndTime(startTime, duration)
    if (start && end) {
      return `${start} - ${end}`
    }
    return null
  })()

  const handleSave = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    const updatedDetails = {
      childName: fullName, // This maps to child_name in database
      childAge,
      firstName: firstName.trim(), // Keep for UI components
      lastName: lastName.trim(), // Keep for UI components
      date,
      startTime, // New field instead of timeSlot
      duration,
      location,
      guestCount,
      budget,
      specialNotes,
      postcode,
    }
    onSave(updatedDetails)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      theme="fun"
      showCloseButton={true}
    >
      {/* Header */}
      <ModalHeader 
        title="Edit Party Details!"
        subtitle="Let's Update Everything... 🎈"
        theme="fun"
        icon={<Sparkles className="w-6 h-6 text-white" />}
      />

      {/* Scrollable Content */}
      <ModalContent className="overflow-y-auto max-h-[60vh]">
        <div className="space-y-6">
          
          {/* Birthday Star Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Birthday Star
            </h3>
            
            <div className="space-y-4">
              {/* First Name */}
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
                    className="pl-10 h-12 text-base font-medium border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                    placeholder="e.g. Emma"
                  />
                </div>
              </div>

              {/* Last Name */}
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
                    className="pl-10 h-12 text-base font-medium border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                    placeholder="e.g. Smith"
                  />
                </div>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
                  Turning
                </Label>
                <div className="relative">
                  <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Select value={childAge} onValueChange={(value) => setChildAge(value)}>
                    <SelectTrigger className="w-full pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl">
                      <SelectValue placeholder="Select age" />
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
          </div>

          {/* Date & Time Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              When's the Party?
            </h3>
            
            <div className="space-y-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Party Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-medium h-12 text-base bg-white border-2 border-gray-200 hover:border-primary-500 rounded-xl transition-all duration-200",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {date ? format(date, "EEEE, MMMM do, yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                  Start Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="pl-10 w-full bg-white border-2 border-gray-200 focus:border-primary-500 rounded-xl h-12 text-base">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2 py-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{option.label}</span>
                            {option.popular && (
                              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 font-bold">
                                Popular
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Duration
                </Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(value) => setDuration(parseFloat(value))}
                >
                  <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-primary-500 rounded-xl h-12 text-base">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center gap-2 py-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{option.label}</span>
                          {option.popular && (
                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 font-bold">
                              Popular
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Preview */}
              {startTime && duration && timePreview && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-full">
                      <Clock className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary-800">Party Time</div>
                      <div className="text-lg font-bold text-primary-700">{timePreview}</div>
                      <div className="text-sm text-primary-600">
                        {duration} hour{duration > 1 ? 's' : ''} of celebration time ✨
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              Party Location
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                  Postcode
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                    placeholder="e.g., SW1A 1AA"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Party Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              Party Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestCount" className="text-sm font-medium text-gray-700">
                    Guest Count
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Select value={guestCount} onValueChange={setGuestCount}>
                      <SelectTrigger className="pl-10 w-full py-5 bg-white border-2 border-gray-200 focus:border-primary-500 rounded-xl text-base">
                        <SelectValue placeholder="How many guests?" />
                      </SelectTrigger>
                      <SelectContent>
                        {guestOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2 py-1">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                    Budget (£)
                  </Label>
                  <div className="relative">
                    <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="pl-10 h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      placeholder="Your budget"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNotes" className="text-sm font-medium text-gray-700">
                  Special Notes
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="specialNotes"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="pl-10 pt-3 min-h-[80px] text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl resize-none"
                    placeholder="Any special requirements, dietary needs, or requests..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>

      {/* Footer */}
      <ModalFooter theme="fun">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium h-12 px-6 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!firstName.trim() || !childAge}
            className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Save {firstName.trim() ? `${firstName.trim()}'s` : "Party"} Details! 🎉
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}