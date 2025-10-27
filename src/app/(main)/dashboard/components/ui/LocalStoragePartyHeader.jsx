// LocalStoragePartyHeader.jsx - Full editing capabilities for localStorage users
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Edit2, Calendar, Users, MapPin, Clock, ChevronDown, ChevronUp, Sparkles, Camera } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { useToast } from "@/components/ui/toast"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal"
import SupplierAvailabilityModal from "@/components/ui/SupplierAvailabilityModal"
import SearchableEventTypeSelect from "@/components/searchable-event-type-select"

// Theme Edit Modal - Using your existing searchable select
const ThemeEditModal = ({ isOpen, onClose, currentTheme, onSave }) => {
  const [theme, setTheme] = useState(currentTheme || "superhero")

  const handleSave = () => {
    onSave({ theme })
    onClose()
  }

  // Get theme image
  const getThemeImage = (themeName) => {
    if (!themeName) return null
    const themeImages = {
      princess: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296152/iStock-1433142692_ukadz6.jpg",
      superhero: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296218/iStock-1150984736_evfnwn.jpg",
      dinosaur: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761295969/iStock-1126856615_wg9qil.jpg",
      unicorn: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296364/iStock-1202380918_flcyof.jpg",
      science: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380880/iStock-1603218889_xq4kqi.jpg",
      spiderman: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761209443/iStock-1165735224_ayrkw1.jpg",
      "taylor-swift": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380937/iStock-2201784646_cdvevq.jpg",
      cars: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380995/iStock-2176668301_cstncj.jpg",
      pirate: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296485/iStock-1283573104_bzl4zs.jpg",
      jungle: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296596/iStock-2221104953_mhafl2.jpg",
      football: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381299/iStock-488844390_wmv5zq.jpg",
      space: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296848/iStock-1474868329_hxmo8u.jpg",
      mermaid: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761297169/iStock-1434335578_h3dzbb.jpg",
      underwater: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761297237/iStock-1061608412_thapyw.jpg"
    }
    return themeImages[themeName.toLowerCase()] || null
  }

  const themeImage = getThemeImage(theme)

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="md" theme="fun">
      <ModalHeader
        title="Change Party Theme"
        subtitle="What's the vibe for this celebration?"
        theme="fun"
        icon={<Sparkles className="w-6 h-6" />}
      />

      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Party Theme</label>
            <SearchableEventTypeSelect
              defaultValue={theme}
              onValueChange={setTheme}
              placeholder="Choose a party theme"
            />
          </div>

          {/* Theme Preview Image */}
          {themeImage && (
            <img
              src={themeImage}
              alt={`${theme} theme preview`}
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />
          )}
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white">
            Save Theme
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

// Utility functions
const formatDateForDisplay = (dateInput) => {
  if (!dateInput) return null

  let date

  if (dateInput instanceof Date) {
    date = dateInput
  } else if (typeof dateInput === "string") {
    if (
      dateInput.includes("th ") ||
      dateInput.includes("st ") ||
      dateInput.includes("nd ") ||
      dateInput.includes("rd ")
    ) {
      return dateInput
    }

    if (dateInput.includes("•")) {
      const datePart = dateInput.split("•")[0].trim()
      date = new Date(datePart)
    } else {
      date = new Date(dateInput)
    }
  } else {
    return null
  }

  if (isNaN(date.getTime())) {
    return null
  }

  const day = date.getDate()
  const suffix = getDaySuffix(day)
  const month = date.toLocaleDateString("en-GB", { month: "long" })
  const year = date.getFullYear()

  return `${day}${suffix} ${month}, ${year}`
}

const getDaySuffix = (day) => {
  if (day >= 11 && day <= 13) {
    return "th"
  }
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

const formatTimeForDisplay = (timeInput) => {
  if (!timeInput) return null

  try {
    if (typeof timeInput === "string" && timeInput.includes(":")) {
      const [hours, minutes] = timeInput.split(":")
      const timeObj = new Date()
      timeObj.setHours(Number.parseInt(hours), Number.parseInt(minutes || 0))

      return timeObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: minutes && minutes !== "00" ? "2-digit" : undefined,
        hour12: true,
      })
    }

    const timeObj = new Date(`2000-01-01T${timeInput}`)
    return timeObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    return timeInput
  }
}

const calculateEndTime = (startTime, duration = 2) => {
  if (!startTime) return null

  try {
    const [hours, minutes] = startTime.split(":")
    const startDate = new Date()
    startDate.setHours(Number.parseInt(hours), Number.parseInt(minutes || 0))

    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000)

    return endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: endDate.getMinutes() > 0 ? "2-digit" : undefined,
      hour12: true,
    })
  } catch (error) {
    return null
  }
}

const formatTimeRangeFromDatabase = (startTime, endTime, fallbackDuration = 2) => {
  if (startTime && endTime) {
    const formattedStart = formatTimeForDisplay(startTime)
    const formattedEnd = formatTimeForDisplay(endTime)

    if (formattedStart && formattedEnd) {
      return `${formattedStart} - ${formattedEnd}`
    }
  }

  if (startTime) {
    const formattedStart = formatTimeForDisplay(startTime)
    const calculatedEnd = calculateEndTime(startTime, fallbackDuration)

    if (formattedStart && calculatedEnd) {
      return `${formattedStart} - ${calculatedEnd}`
    }
  }

  return "2pm - 4pm"
}

// Name Edit Modal
const NameEditModal = ({ isOpen, onClose, currentName, onSave }) => {
  const initializeNames = () => {
    if (!currentName) return { firstName: "", lastName: "" }
    const nameParts = currentName.trim().split(" ")
    return {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
    }
  }

  const { firstName: initFirstName, lastName: initLastName } = initializeNames()
  const [firstName, setFirstName] = useState(initFirstName)
  const [lastName, setLastName] = useState(initLastName)

  const handleSave = () => {
    if (firstName.trim()) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
      onSave({
        childName: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      onClose()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave()
    }
  }

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader
        title="Change Child's Name"
        subtitle="Who's the star of this party?"
        theme="fun"
        icon={<Edit2 className="w-6 h-6" />}
      />

      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Emma"
              className="w-full"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Last Name <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Smith"
              className="w-full"
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!firstName.trim()}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
          >
            Save Name
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

// Date Edit Modal
const DateEditModal = ({ isOpen, onClose, currentDate, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate || new Date())

  const handleSave = () => {
    onSave({ date: selectedDate })
    onClose()
  }

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader
        title="Change Party Date"
        subtitle="Pick the perfect date for your celebration"
        theme="fun"
        icon={<Calendar className="w-6 h-6" />}
      />

      <ModalContent>
        <div className="space-y-4">
          <CalendarPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
            disabled={(date) => date < new Date()}
          />
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white">
            Save Date
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

// Time Edit Modal
const TimeEditModal = ({ isOpen, onClose, currentStartTime, currentDuration, onSave }) => {
  // Determine initial timeSlot based on currentStartTime
  const getInitialTimeSlot = () => {
    if (!currentStartTime) return "afternoon"
    const hour = parseInt(currentStartTime.split(':')[0])
    return hour < 13 ? "morning" : "afternoon"
  }

  const [timeSlot, setTimeSlot] = useState(getInitialTimeSlot())

  const handleSave = () => {
    // Convert timeSlot to startTime and set duration
    const timeSlotMapping = {
      morning: { startTime: "11:00", duration: 2 },
      afternoon: { startTime: "14:00", duration: 2 }
    }

    const updates = timeSlotMapping[timeSlot]
    console.log("TimeEditModal saving:", updates)
    onSave(updates)
    onClose()
  }

  const getTimeRange = (slot) => {
    return slot === 'morning' ? '11am - 1pm' : '2pm - 4pm'
  }

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader
        title="Change Party Time"
        subtitle="Set the perfect timing for your party"
        theme="fun"
        icon={<Clock className="w-6 h-6" />}
      />

      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Party Time</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTimeSlot('morning')}
                className={`
                  flex-1 px-4 py-4 rounded-xl text-sm font-medium transition-all
                  ${timeSlot === 'morning'
                    ? 'bg-primary-500 text-white shadow-md ring-2 ring-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold text-base">Morning</span>
                  <span className="text-xs opacity-90">11am - 1pm</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTimeSlot('afternoon')}
                className={`
                  flex-1 px-4 py-4 rounded-xl text-sm font-medium transition-all
                  ${timeSlot === 'afternoon'
                    ? 'bg-primary-500 text-white shadow-md ring-2 ring-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold text-base">Afternoon</span>
                  <span className="text-xs opacity-90">2pm - 4pm</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
            <div className="text-sm text-gray-500 font-medium">Party will run:</div>
            <div className="font-bold text-gray-900">
              {getTimeRange(timeSlot)}
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white">
            Save Time
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

// Age Edit Modal
const AgeEditModal = ({ isOpen, onClose, currentAge, onSave }) => {
  const [age, setAge] = useState(currentAge || 6)

  const handleSave = () => {
    onSave({ childAge: age })
    onClose()
  }

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader
        title="Change Child's Age"
        subtitle="How old is the birthday star?"
        theme="fun"
        icon={<Users className="w-6 h-6" />}
      />

      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Age</label>
            <Select value={age.toString()} onValueChange={(value) => setAge(Number.parseInt(value))}>
              <SelectTrigger className="w-full pl-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((ageOption) => (
                  <SelectItem key={ageOption} value={ageOption.toString()}>
                    {ageOption} years old
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white">
            Save Age
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

// Guests Edit Modal
const GuestsEditModal = ({ isOpen, onClose, currentGuestCount, onSave }) => {
  const [guestCount, setGuestCount] = useState(currentGuestCount || "")

  const guestOptions = [
    { value: "5", label: "5 guests" },
    { value: "10", label: "10 guests" },
    { value: "15", label: "15 guests" },
    { value: "20", label: "20 guests" },
    { value: "25", label: "25 guests" },
    { value: "30", label: "30+ guests" },
  ]

  const handleSave = () => {
    onSave({ guestCount })
    onClose()
  }

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader
        title="Change Guest Count"
        subtitle="How many friends are joining the party?"
        theme="fun"
        icon={<Users className="w-6 h-6" />}
      />

      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Number of Guests</label>
            <Select value={guestCount} onValueChange={setGuestCount}>
              <SelectTrigger className="w-full pl-2">
                <SelectValue placeholder="Select guest count" />
              </SelectTrigger>
              <SelectContent>
                {guestOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!guestCount}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
          >
            Save Guest Count
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

// Location Edit Modal
const LocationEditModal = ({ isOpen, onClose, currentLocation, onSave }) => {
  const [location, setLocation] = useState(currentLocation || "")

  const handleSave = () => {
    if (location.trim()) {
      onSave({ location: location.trim() })
      onClose()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave()
    }
  }

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader
        title="Change Party Location"
        subtitle="Where's the celebration happening?"
        theme="fun"
        icon={<MapPin className="w-6 h-6" />}
      />

      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location/Postcode</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., SW1A 1AA"
              className="w-full"
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!location.trim()}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
          >
            Save Location
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

export default function LocalStoragePartyHeader({
  theme,
  partyDetails,
  onPartyDetailsChange,
  suppliers = {},
  partyId = null,
  onPartyRebuilt = null,
  childPhoto = null,
  onPhotoUpload = null,
  uploadingPhoto = false,
  forceExpanded = false, // ✅ NEW: Allow external control of expansion
  onExpandChange = null, // ✅ NEW: Callback when expansion changes
  totalCost = 0, // ✅ NEW: Total party cost
}) {
  const [editingModal, setEditingModal] = useState(null)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(null)
  const [isExpanded, setIsExpanded] = useState(forceExpanded)

  const currentTheme = theme
  const { toast } = useToast()

  // Sync with forceExpanded prop
  useEffect(() => {
    if (forceExpanded !== isExpanded) {
      setIsExpanded(forceExpanded)
    }
  }, [forceExpanded])

  // Helper to update expansion state
  const updateExpanded = (newValue) => {
    setIsExpanded(newValue)
    if (onExpandChange) {
      onExpandChange(newValue)
    }
  }

  // Get theme image helper
  const getThemeImage = () => {
    if (!theme) return null

    const themeImages = {
      princess: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296152/iStock-1433142692_ukadz6.jpg",
      superhero: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296218/iStock-1150984736_evfnwn.jpg",
      dinosaur: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761295969/iStock-1126856615_wg9qil.jpg",
      unicorn: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296364/iStock-1202380918_flcyof.jpg",
      science: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380880/iStock-1603218889_xq4kqi.jpg",
      spiderman: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761209443/iStock-1165735224_ayrkw1.jpg",
      "taylor-swift": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380937/iStock-2201784646_cdvevq.jpg",
      cars: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380995/iStock-2176668301_cstncj.jpg",
      pirate: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296485/iStock-1283573104_bzl4zs.jpg",
      jungle: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296596/iStock-2221104953_mhafl2.jpg",
      football: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381299/iStock-488844390_wmv5zq.jpg",
      space: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296848/iStock-1474868329_hxmo8u.jpg",
      mermaid: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761297169/iStock-1434335578_h3dzbb.jpg",
      underwater: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761297237/iStock-1061608412_thapyw.jpg"
    }

    return themeImages[theme.toLowerCase()] || null
  }

  // Get theme gradient fallback
  const getThemeGradient = () => {
    if (!theme) return "linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))"

    const themeGradients = {
      princess: "linear-gradient(to right, #f472b6, #c084fc, #ec4899)",
      superhero: "linear-gradient(to right, #3b82f6, #ef4444, #eab308)",
      dinosaur: "linear-gradient(to right, #10b981, #059669, #047857)",
      unicorn: "linear-gradient(to right, #c084fc, #f472b6, #60a5fa)",
      science: "linear-gradient(to right, #06b6d4, #3b82f6, #4f46e5)",
      spiderman: "linear-gradient(to right, #dc2626, #2563eb, #dc2626)",
      "taylor-swift": "linear-gradient(to right, #a855f7, #ec4899, #f43f5e)",
      cars: "linear-gradient(to right, #2563eb, #4b5563, #1d4ed8)",
      space: "linear-gradient(to right, #312e81, #581c87, #1e3a8a)",
      jungle: "linear-gradient(to right, #16a34a, #ca8a04, #15803d)",
      football: "linear-gradient(to right, #16a34a, #059669, #047857)",
      pirate: "linear-gradient(to right, #d97706, #7f1d1d, #374151)",
      mermaid: "linear-gradient(to right, #2dd4bf, #06b6d4, #3b82f6)",
      default: "linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))"
    }

    return themeGradients[theme.toLowerCase()] || themeGradients.default
  }

  // Photo upload handler
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (file && onPhotoUpload) {
      await onPhotoUpload(file)
    }
  }

  // Helper functions
  const getFullName = () => {
    if (partyDetails?.firstName || partyDetails?.lastName) {
      return `${partyDetails?.firstName || ""} ${partyDetails?.lastName || ""}`.trim()
    }

    if (partyDetails?.childName) {
      return partyDetails.childName
    }

    return "Emma"
  }

  const getFirstName = () => {
    if (partyDetails?.firstName) {
      return partyDetails.firstName
    }

    if (partyDetails?.childName) {
      const nameParts = partyDetails.childName.split(" ")
      return nameParts[0]
    }

    return "Emma"
  }

  // Enhanced save function that properly persists to memory
  const savePartyDetails = (details) => {
    try {
      const existingDetails = JSON.parse(window.inMemoryStorage?.party_details || "{}")

      const processedDetails = {
        ...existingDetails,
        ...details,
      }

      // Handle date formatting and persistence
      if (details.date) {
        processedDetails.date = details.date
        processedDetails.displayDate = formatDateForDisplay(details.date)
      }

      // Handle time formatting
      if (details.startTime) {
        processedDetails.startTime = details.startTime
        processedDetails.displayTimeRange = formatTimeRangeFromDatabase(
          details.startTime,
          null,
          details.duration || processedDetails.duration || 2,
        )
      }

      // Handle postcode extraction
      processedDetails.postcode =
        details.postcode ||
        (details.location?.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) ? details.location : existingDetails.postcode)

      // Save to memory
      if (!window.inMemoryStorage) window.inMemoryStorage = {}
      window.inMemoryStorage.party_details = JSON.stringify(processedDetails)

      // Trigger storage event for other components
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "party_details",
          newValue: JSON.stringify(processedDetails),
        }),
      )

      console.log("Party details saved successfully:", processedDetails)
      return processedDetails
    } catch (error) {
      console.error("Error saving party details:", error)
      return details
    }
  }

  // Check if changes affect supplier availability
  const requiresAvailabilityCheck = (newDetails) => {
    if (!suppliers || Object.keys(suppliers).length === 0) {
      console.log("No suppliers found, skipping availability check")
      return false
    }

    const currentDate = getCurrentDate()
    const currentTime = getCurrentTime()
    const currentLocation = getCurrentLocation()

    const dateChanged = newDetails.date && formatDateForDisplay(newDetails.date) !== formatDateForDisplay(currentDate)
    const timeChanged = newDetails.startTime && newDetails.startTime !== currentTime
    const locationChanged = newDetails.location && newDetails.location !== currentLocation

    return dateChanged || timeChanged || locationChanged
  }

  // Get current values for comparison
  const getCurrentDate = () => {
    return partyDetails?.date ? new Date(partyDetails.date) : new Date()
  }

  const getCurrentTime = () => {
    return partyDetails?.startTime || "14:00"
  }

  const getCurrentLocation = () => {
    return partyDetails?.location || ""
  }

  // Enhanced save handler with availability check
  const handleSavePartyDetails = (updatedDetails) => {
    if (requiresAvailabilityCheck(updatedDetails)) {
      console.log("Changes require availability check, showing modal...")

      setPendingChanges({
        currentDetails: {
          date: getCurrentDate(),
          startTime: getCurrentTime(),
          duration: partyDetails?.duration || 2,
          location: getCurrentLocation(),
          childName: getFullName(),
          firstName: partyDetails?.firstName,
          lastName: partyDetails?.lastName,
          childAge: partyDetails?.childAge || 6,
          theme: partyDetails?.theme || "superhero",
          guestCount: partyDetails?.guestCount || "10",
          budget: partyDetails?.budget || 600,
          specialRequirements: partyDetails?.specialRequirements || "",
        },
        newDetails: updatedDetails,
      })

      setShowAvailabilityModal(true)
      return
    }

    proceedWithSave(updatedDetails)
  }

  // Proceed with save after availability check
  const proceedWithSave = (updatedDetails) => {
    const savedDetails = savePartyDetails(updatedDetails)

    if (onPartyDetailsChange) {
      onPartyDetailsChange(savedDetails)
    }

    toast.success("Party details updated!", {
      duration: 2000,
    })
  }

  // Handle availability modal confirmation
  const handleAvailabilityConfirm = (updatedDetails) => {
    proceedWithSave(updatedDetails)
    setShowAvailabilityModal(false)
    setPendingChanges(null)
  }

  // Handle party rebuild from availability modal
  const handlePartyRebuilt = (rebuildResults) => {
    console.log("Party was rebuilt with new suppliers:", rebuildResults)

    if (onPartyRebuilt) {
      onPartyRebuilt(rebuildResults)
    }

    toast.success("Party rebuilt with available suppliers!", {
      duration: 3000,
    })
  }

  // Handle modal edit save
  const handleModalEditSave = (updates) => {
    console.log("Modal edit save called with updates:", updates)
    const mergedDetails = { ...partyDetails, ...updates }
    console.log("Merged details:", mergedDetails)
    handleSavePartyDetails(mergedDetails)
    setEditingModal(null)
  }

  // Handle card click
  const handleCardClick = (cardType) => {
    console.log("Card clicked:", cardType)
    setEditingModal(cardType)
  }

  const formatGuestCount = (count) => {
    if (!count) return "Not specified"
    return `${count} guests`
  }

  // Display value getters
  const getDisplayDate = (short = false) => {
    const fullDate = partyDetails?.displayDate || formatDateForDisplay(partyDetails?.date) || "14th June, 2025"

    if (short) {
      const parts = fullDate.split(" ")
      if (parts.length >= 2) {
        const day = parts[0]
        const month = parts[1].replace(",", "").substring(0, 3)
        return `${day} ${month}`
      }
    }

    return fullDate
  }

  const getDisplayTimeRange = () => {
    const storedTimeRange = partyDetails?.displayTimeRange
    const calculatedTimeRange = formatTimeRangeFromDatabase(partyDetails?.startTime, null, partyDetails?.duration)
    const fallback = "2pm - 4pm"

    return storedTimeRange || calculatedTimeRange || fallback
  }

  const getChildAge = () => {
    return `${partyDetails?.childAge || 6} years`
  }

  const getGuestCount = () => {
    return formatGuestCount(partyDetails?.guestCount)
  }

  const getLocation = () => {
    return partyDetails?.location || "W1A 1AA"
  }

  const getOrdinalAge = () => {
    const age = partyDetails?.childAge || 6
    const ordinal = getDaySuffix(age)
    return `${age}${ordinal}`
  }

  const displayDate = getDisplayDate()
  const displayTimeRange = getDisplayTimeRange()
  const capitalizedTheme = currentTheme?.charAt(0).toUpperCase() + currentTheme?.slice(1)

  if (!partyDetails) {
    return (
      <div className="h-48 bg-primary-50 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your party...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative shadow-2xl overflow-hidden transition-all duration-300" style={{ marginTop: 'calc(-1 * env(safe-area-inset-top, 0px))' }}>
        {/* Theme Image Background */}
        {getThemeImage() && (
          <div className="absolute inset-0" style={{ top: 'calc(-1 * env(safe-area-inset-top, 0px))' }}>
            <img
              src={getThemeImage()}
              alt={capitalizedTheme}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          </div>
        )}

        {/* Fallback gradient if no theme image */}
        {!getThemeImage() && (
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: getThemeGradient(),
                top: 'calc(-1 * env(safe-area-inset-top, 0px))'
              }}
            ></div>
            {/* Optional: Add party pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url('/party-pattern.svg')`,
                backgroundRepeat: "repeat",
                backgroundSize: "100px",
                top: 'calc(-1 * env(safe-area-inset-top, 0px))'
              }}
            ></div>
          </>
        )}

        <div
          className="relative pl-6 pr-2 md:px-10 text-white"
          style={{
            paddingTop: 'calc(3rem + env(safe-area-inset-top, 0px))',
            paddingBottom: '3rem'
          }}
        >
          <div className="md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start gap-3 md:gap-4">
                {/* Photo Avatar and Name */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Child Photo Avatar - Desktop Only */}
                  <div className="relative flex-shrink-0 hidden md:block" onClick={(e) => e.stopPropagation()}>
                    {childPhoto ? (
                      <div className="relative group">
                        <img
                          src={childPhoto}
                          alt={getFirstName()}
                          className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        {onPhotoUpload && !uploadingPhoto && (
                          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-white text-xs font-semibold">Change</span>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                          </label>
                        )}
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="w-30 h-30 rounded-full bg-white/30 backdrop-blur-sm border-4 border-white/60 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/40 transition-all">
                          {uploadingPhoto ? (
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <div className="bg-white/40 rounded-full p-2 mb-1 group-hover:bg-white/50 transition-colors">
                                <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
                              </div>
                              <div className="text-xs font-bold text-white leading-tight text-center">
                                Add<br />Photo
                              </div>
                            </>
                          )}
                        </div>
                        {onPhotoUpload && !uploadingPhoto && (
                          <label className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer">
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Name and Info */}
                  <div
                    className="flex-1 min-w-0 pr-14 md:pr-0 md:cursor-default cursor-pointer"
                    onClick={() => {
                      // Only toggle on mobile
                      if (window.innerWidth < 768) {
                        updateExpanded(!isExpanded)
                      }
                    }}
                  >
                    <h1
                      suppressHydrationWarning={true}
                      className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl leading-[1.1] tracking-tight"
                      style={{
                        textShadow: "0 4px 12px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)",
                      }}
                    >
                      {getFirstName()}'s Party
                    </h1>

                    {!isExpanded && (
                      <div className="md:hidden mt-2">
                        <div className="flex items-center flex-wrap gap-1.5 w-screen text-xs text-white/95 font-medium">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="whitespace-nowrap">{getDisplayDate(true)}</span>
                          <span className="text-white/60 flex-shrink-0">•</span>
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="whitespace-nowrap">{displayTimeRange.split(" - ")[0]}</span>
                          <span className="text-white/60 flex-shrink-0">•</span>
                          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="whitespace-nowrap">{capitalizedTheme}</span>
                          <span className="text-white/60 flex-shrink-0">•</span>
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="whitespace-nowrap">{getLocation()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit buttons - positioned absolutely on mobile */}
                <div className="flex md:relative absolute top-4 right-4 items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick("name")
                    }}
                    className="hover:scale-110 transition-transform bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-full hover:bg-white/30"
                    aria-label="Edit party name"
                  >
                    <Edit2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-white drop-shadow-lg" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateExpanded(!isExpanded)
                    }}
                    className="md:hidden hover:scale-110 transition-transform bg-white/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-white/30"
                    aria-label={isExpanded ? "Show less" : "Show more"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white drop-shadow-lg" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white drop-shadow-lg" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile: Expandable Grid */}
            <div
              className={`md:hidden transition-all duration-300 ease-in-out ${
                isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid grid-cols-2 gap-2.5 pt-3">
                <button
                  onClick={() => handleCardClick("theme")}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors text-left flex flex-col"
                >
                  <p className="text-xs text-white/70 font-medium mb-1">Theme</p>
                  <p suppressHydrationWarning={true} className="font-bold text-sm text-white leading-tight">
                    {capitalizedTheme}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick("date")}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors text-left flex flex-col"
                >
                  <p className="text-xs text-white/70 font-medium mb-1">Date</p>
                  <p suppressHydrationWarning={true} className="font-bold text-sm text-white leading-tight">
                    {getDisplayDate()}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick("time")}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors text-left flex flex-col"
                >
                  <p className="text-xs text-white/70 font-medium mb-1">Time</p>
                  <p suppressHydrationWarning={true} className="font-bold text-xs text-white leading-tight">
                    {displayTimeRange}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick("age")}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors text-left flex flex-col"
                >
                  <p className="text-xs text-white/70 font-medium mb-1">Age</p>
                  <p suppressHydrationWarning={true} className="font-bold text-sm text-white">
                    {getChildAge()}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick("guests")}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors text-left flex flex-col"
                >
                  <p className="text-xs text-white/70 font-medium mb-1">Guests</p>
                  <p suppressHydrationWarning={true} className="font-bold text-sm text-white">
                    {getGuestCount()}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick("location")}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-colors text-left flex flex-col"
                >
                  <p className="text-xs text-white/70 font-medium mb-1">Location</p>
                  <p suppressHydrationWarning={true} className="font-bold text-sm text-white leading-tight truncate">
                    {getLocation()}
                  </p>
                </button>
              </div>
            </div>

            {/* Desktop: Grid Layout - Always Visible */}
            <div className="hidden md:grid md:grid-cols-6 gap-4">
              <button
                onClick={() => handleCardClick("theme")}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Theme</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base leading-tight">
                  {capitalizedTheme}
                </p>
              </button>

              <button
                onClick={() => handleCardClick("date")}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Date</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base leading-tight">
                  {displayDate}
                </p>
              </button>

              <button
                onClick={() => handleCardClick("time")}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Time</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base leading-tight">
                  {displayTimeRange}
                </p>
              </button>

              <button
                onClick={() => handleCardClick("age")}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Age</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base">
                  {getChildAge()}
                </p>
              </button>

              <button
                onClick={() => handleCardClick("guests")}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Guests</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base">
                  {getGuestCount()}
                </p>
              </button>

              <button
                onClick={() => handleCardClick("location")}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Where</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base truncate">
                  {getLocation()}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Availability Modal */}
      {pendingChanges && (
        <SupplierAvailabilityModal
          isOpen={showAvailabilityModal}
          onClose={() => {
            setShowAvailabilityModal(false)
            setPendingChanges(null)
          }}
          onConfirm={handleAvailabilityConfirm}
          currentDetails={pendingChanges.currentDetails}
          newDetails={pendingChanges.newDetails}
          suppliers={suppliers}
          partyId={partyId}
          dataSource="localStorage"
          onPartyRebuilt={handlePartyRebuilt}
        />
      )}

      {/* Edit Modals */}
      <NameEditModal
        isOpen={editingModal === "name"}
        onClose={() => setEditingModal(null)}
        currentName={getFullName()}
        onSave={handleModalEditSave}
      />

      <DateEditModal
        isOpen={editingModal === "date"}
        onClose={() => setEditingModal(null)}
        currentDate={partyDetails?.date || new Date()}
        onSave={handleModalEditSave}
      />

      <TimeEditModal
        isOpen={editingModal === "time"}
        onClose={() => setEditingModal(null)}
        currentStartTime={partyDetails?.startTime}
        currentDuration={partyDetails?.duration}
        onSave={handleModalEditSave}
      />

      <AgeEditModal
        isOpen={editingModal === "age"}
        onClose={() => setEditingModal(null)}
        currentAge={partyDetails?.childAge}
        onSave={handleModalEditSave}
      />

      <GuestsEditModal
        isOpen={editingModal === "guests"}
        onClose={() => setEditingModal(null)}
        currentGuestCount={partyDetails?.guestCount}
        onSave={handleModalEditSave}
      />

      <LocationEditModal
        isOpen={editingModal === "location"}
        onClose={() => setEditingModal(null)}
        currentLocation={partyDetails?.location}
        onSave={handleModalEditSave}
      />

      <ThemeEditModal
        isOpen={editingModal === "theme"}
        onClose={() => setEditingModal(null)}
        currentTheme={currentTheme}
        onSave={handleModalEditSave}
      />
    </>
  )
}