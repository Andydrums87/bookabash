"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  MapPin,
  Star,
  Building,
  Utensils,
  Palette,
  Gift,
  Music,
  Info,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Define service types
const serviceTypes = [
  {
    id: "entertainers",
    name: "Entertainers",
    icon: <Music className="w-12 h-12 text-primary-500" />,
    description: "Magicians, characters, shows, interactive entertainment",
  },
  {
    id: "venues",
    name: "Venues",
    icon: <Building className="w-12 h-12 text-primary-500" />,
    description: "Community halls, soft play centers, party rooms",
  },
  {
    id: "catering",
    name: "Catering",
    icon: <Utensils className="w-12 h-12 text-primary-500" />,
    description: "Party food, birthday cakes, catering services",
  },
  {
    id: "facepainting",
    name: "Face Painting",
    icon: <Palette className="w-12 h-12 text-primary-500" />,
    description: "Face painting, temporary tattoos, body art",
  },
  {
    id: "decorations",
    name: "Decorations",
    icon: <Palette className="w-12 h-12 text-primary-500" />,
    description: "Balloons, styling, themed decorations",
  },
  {
    id: "partybags",
    name: "Party Bags",
    icon: <Gift className="w-12 h-12 text-primary-500" />,
    description: "Party favors, gifts, party bag supplies",
  },
]

// Define themes
const partyThemes = [
  "Princess",
  "Superhero",
  "Jungle",
  "Space",
  "Pirate",
  "Unicorn",
  "Dinosaur",
  "Fairy",
  "Sports",
  "Science",
]

// Define age groups
const ageGroups = [
  { id: "1-3", label: "1-3 years" },
  { id: "4-6", label: "4-6 years" },
  { id: "7-10", label: "7-10 years" },
  { id: "11+", label: "11+ years" },
]

export default function SupplierOnboardingPage() {
  const router = useRouter()

  // State for multi-step form
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const [formData, setFormData] = useState({
    businessName: "",
    yourName: "",
    email: "",
    phone: "",
    postcode: "",
    serviceTypes: [],
    otherServiceType: "",
    specialties: [],
    performanceDuration: "",
    ageGroups: [],
    venueType: "",
    capacity: "",
    facilities: [],
    serviceArea: "",
    priceRange: "",
    description: "",
    unavailableDates: [],
    openingHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: false },
    },
    dbsCertificate: null,
    insurance: null,
    businessLicense: null,
    portfolioPhotos: [],
  });
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [openingHours, setOpeningHours] = useState({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: false },
    sunday: { open: "10:00", close: "16:00", closed: false },
  });
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [showOpeningHours, setShowOpeningHours] = useState(false);
  
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const toggleServiceType = (serviceId) => {
    setFormData((prev) => {
      const serviceTypes = [...prev.serviceTypes];
      if (serviceTypes.includes(serviceId)) {
        return { ...prev, serviceTypes: serviceTypes.filter((id) => id !== serviceId) };
      } else {
        return { ...prev, serviceTypes: [...serviceTypes, serviceId] };
      }
    });
  };
  
  const toggleSpecialty = (specialty) => {
    setFormData((prev) => {
      const specialties = [...prev.specialties];
      if (specialties.includes(specialty)) {
        return { ...prev, specialties: specialties.filter((s) => s !== specialty) };
      } else {
        return { ...prev, specialties: [...specialties, specialty] };
      }
    });
  };
  
  const toggleAgeGroup = (ageGroup) => {
    setFormData((prev) => {
      const ageGroups = [...prev.ageGroups];
      if (ageGroups.includes(ageGroup)) {
        return { ...prev, ageGroups: ageGroups.filter((a) => a !== ageGroup) };
      } else {
        return { ...prev, ageGroups: [...ageGroups, ageGroup] };
      }
    });
  };
  
  const toggleFacility = (facility) => {
    setFormData((prev) => {
      const facilities = [...prev.facilities];
      if (facilities.includes(facility)) {
        return { ...prev, facilities: facilities.filter((f) => f !== facility) };
      } else {
        return { ...prev, facilities: [...facilities, facility] };
      }
    });
  };
  
  const handleFileUpload = (field, files) => {
    if (!files) return;
  
    if (field === "portfolioPhotos") {
      const newPhotos = Array.from(files).slice(0, 5);
      setFormData((prev) => ({
        ...prev,
        portfolioPhotos: newPhotos,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: files[0],
      }));
    }
  };
  // Navigate to next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Submit form
  const submitForm = () => {
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData)
    // Redirect to success page
    router.push("/suppliers/onboarding/success")
  }

  // Render form based on current step
  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep()
      case 2:
        return renderServiceTypeStep()
      case 3:
        return renderServiceDetailsStep()
      case 4:
        return renderAvailabilityStep()
      case 5:
        return renderVerificationStep()
      default:
        return renderBasicInfoStep()
    }
  }

  // Step 1: Basic Information
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Tell us about your business</h2>
      <p className="text-gray-600">Let's start with some basic information about you and your business.</p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">
            Business Name <span className="text-primary-500">*</span>
          </Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
            placeholder="Your business name"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="yourName">
            Your Name <span className="text-primary-500">*</span>
          </Label>
          <Input
            id="yourName"
            value={formData.yourName}
            onChange={(e) => handleInputChange("yourName", e.target.value)}
            placeholder="Your full name"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">
            Email Address <span className="text-primary-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="you@example.com"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">
            Phone Number <span className="text-primary-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="07xxx xxx xxx"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="postcode">
            Business Postcode <span className="text-primary-500">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="postcode"
              value={formData.postcode}
              onChange={(e) => handleInputChange("postcode", e.target.value)}
              placeholder="e.g. SW1A 1AA"
              className="pl-10 mt-1"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">This helps us match you with nearby customers</p>
        </div>
      </div>
    </div>
  )

  // Step 2: Service Type Selection
  const renderServiceTypeStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">What services do you provide?</h2>
      <p className="text-gray-600">
        Select all the services that your business offers. You can choose multiple options.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceTypes.map((service) => (
          <div
            key={service.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              formData.serviceTypes.includes(service.id)
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300"
            }`}
            onClick={() => toggleServiceType(service.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-3">{service.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
              <div className="mt-3">
                <Checkbox
                  id={`service-${service.id}`}
                  checked={formData.serviceTypes.includes(service.id)}
                  onCheckedChange={() => toggleServiceType(service.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="otherServiceType">Other Service (Optional)</Label>
        <Input
          id="otherServiceType"
          value={formData.otherServiceType}
          onChange={(e) => handleInputChange("otherServiceType", e.target.value)}
          placeholder="Describe any other service you offer"
          className="mt-1"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Suppliers who offer multiple services often receive more bookings. Select all that
            apply to your business.
          </p>
        </div>
      </div>
    </div>
  )

  // Step 3: Service Details
  const renderServiceDetailsStep = () => {
    // Show different fields based on selected service types
    const showEntertainerFields = formData.serviceTypes.includes("entertainers")
    const showVenueFields = formData.serviceTypes.includes("venues")

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Tell us more about your services</h2>
        <p className="text-gray-600">
          Let's get into the details of what you offer so we can match you with the right customers.
        </p>

        {/* Dynamic fields based on service type */}
        {showEntertainerFields && (
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900">Entertainer Details</h3>

            <div>
              <Label>Specialties (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {partyThemes.map((theme) => (
                  <div key={theme} className="flex items-center space-x-2">
                    <Checkbox
                      id={`theme-${theme}`}
                      checked={formData.specialties.includes(theme)}
                      onCheckedChange={() => toggleSpecialty(theme)}
                    />
                    <Label htmlFor={`theme-${theme}`} className="text-sm font-normal">
                      {theme}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="performanceDuration">Performance Duration</Label>
              <Select
                value={formData.performanceDuration}
                onValueChange={(value) => handleInputChange("performanceDuration", value)}
              >
                <SelectTrigger id="performanceDuration" className="mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30min">30 minutes</SelectItem>
                  <SelectItem value="1hour">1 hour</SelectItem>
                  <SelectItem value="1.5hours">1.5 hours</SelectItem>
                  <SelectItem value="2hours">2 hours</SelectItem>
                  <SelectItem value="2+hours">2+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Age Groups (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ageGroups.map((age) => (
                  <div key={age.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`age-${age.id}`}
                      checked={formData.ageGroups.includes(age.id)}
                      onCheckedChange={() => toggleAgeGroup(age.id)}
                    />
                    <Label htmlFor={`age-${age.id}`} className="text-sm font-normal">
                      {age.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showVenueFields && (
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900">Venue Details</h3>

            <div>
              <Label htmlFor="venueType">Venue Type</Label>
              <Select value={formData.venueType} onValueChange={(value) => handleInputChange("venueType", value)}>
                <SelectTrigger id="venueType" className="mt-1">
                  <SelectValue placeholder="Select venue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community">Community Hall</SelectItem>
                  <SelectItem value="softplay">Soft Play Center</SelectItem>
                  <SelectItem value="private">Private Venue</SelectItem>
                  <SelectItem value="outdoor">Outdoor Space</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="capacity">Maximum Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                placeholder="e.g. 30"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Facilities (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["Kitchen", "Parking", "Disabled Access", "Outdoor Space", "WiFi", "Sound System"].map((facility) => (
                  <div key={facility} className="flex items-center space-x-2">
                    <Checkbox
                      id={`facility-${facility}`}
                      checked={formData.facilities.includes(facility)}
                      onCheckedChange={() => toggleFacility(facility)}
                    />
                    <Label htmlFor={`facility-${facility}`} className="text-sm font-normal">
                      {facility}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Common fields for all service types */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="serviceArea">Service Area</Label>
            <Select value={formData.serviceArea} onValueChange={(value) => handleInputChange("serviceArea", value)}>
              <SelectTrigger id="serviceArea" className="mt-1">
                <SelectValue placeholder="Select service radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5miles">Within 5 miles</SelectItem>
                <SelectItem value="10miles">Within 10 miles</SelectItem>
                <SelectItem value="15miles">Within 15 miles</SelectItem>
                <SelectItem value="20miles">Within 20 miles</SelectItem>
                <SelectItem value="20+miles">20+ miles</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Distance you're willing to travel from your postcode</p>
          </div>

          <div>
            <Label htmlFor="priceRange">Typical Price Range</Label>
            <Select value={formData.priceRange} onValueChange={(value) => handleInputChange("priceRange", value)}>
              <SelectTrigger id="priceRange" className="mt-1">
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under100">Under £100</SelectItem>
                <SelectItem value="100-200">£100 - £200</SelectItem>
                <SelectItem value="200-300">£200 - £300</SelectItem>
                <SelectItem value="300-500">£300 - £500</SelectItem>
                <SelectItem value="500+">£500+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-primary-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Tell parents about your services, experience, and what makes your business special..."
              className="mt-1 h-32"
              required
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Be specific about what you offer</p>
              <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 4: Availability Setup
  const renderAvailabilityStep = () => {
    const generateCalendarDays = () => {
      const today = new Date()
      const days = []

      for (let i = 0; i < 90; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        days.push(date)
      }

      return days
    }

    const calendarDays = generateCalendarDays()

    // Check if a date is unavailable
    const isDateUnavailable = (date) => {
      return unavailableDates.some((unavailableDate) => unavailableDate.toDateString() === date.toDateString())
    }

    // Check if a date is closed based on opening hours
    const isDateClosed = (date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
      return openingHours[dayName]?.closed || false
    }

    // Toggle date availability
    const toggleDateAvailability = (date) => {
      setUnavailableDates((prev) => {
        const isCurrentlyUnavailable = prev.some((d) => d.toDateString() === date.toDateString())

        if (isCurrentlyUnavailable) {
          return prev.filter((d) => d.toDateString() !== date.toDateString())
        } else {
          return [...prev, new Date(date)]
        }
      })
    }

    // Update opening hours
    const updateOpeningHours = (day, field, value) => {
      setOpeningHours((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [field]: value,
        },
      }))
    }

    // Copy opening hours to all days
    const copyHoursToAll = (sourceDay) => {
      const sourceHours = openingHours[sourceDay]
      const updatedHours = Object.keys(openingHours).reduce(
        (acc, day) => {
          acc[day] = { ...sourceHours }
          return acc
        },
        { ...openingHours },
      )

      setOpeningHours(updatedHours)
    }

    // Handle file upload for opening hours
    const handleOpeningHoursUpload = (files) => {
      if (!files || files.length === 0) return

      const file = files[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          // This would parse a CSV or JSON file with opening hours
          // For demo purposes, we'll just show a success message
          alert("Opening hours uploaded successfully! You can still manually adjust dates below.")
        } catch (error) {
          alert("Error parsing file. Please check the format and try again.")
        }
      }

      reader.readAsText(file)
    }

    const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Set your availability</h2>
        <p className="text-gray-600">
          Set your regular opening hours and mark any specific dates when you're unavailable.
        </p>

        {/* Opening Hours Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Regular Opening Hours</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowOpeningHours(!showOpeningHours)}>
              {showOpeningHours ? "Hide" : "Set"} Opening Hours
            </Button>
          </div>

          {showOpeningHours && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {dayNames.map((day) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium text-gray-700 capitalize">{day}</div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${day}-closed`}
                        checked={openingHours[day].closed}
                        onCheckedChange={(checked) =>
                          updateOpeningHours(day, "closed", checked)
                        }
                      />
                      <Label htmlFor={`${day}-closed`} className="text-sm">
                        Closed
                      </Label>
                    </div>
                    {!openingHours[day].closed && (
                      <>
                        <Input
                          type="time"
                          value={openingHours[day].open}
                          onChange={(e) => updateOpeningHours(day, "open", e.target.value)}
                          className="w-24"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={openingHours[day].close}
                          onChange={(e) =>
                            updateOpeningHours(day, "close", e.target.value)
                          }
                          className="w-24"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyHoursToAll(day)}
                          className="text-xs"
                        >
                          Copy to all
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="opening-hours-file" className="text-sm font-medium">
                  Or upload opening hours file (CSV/JSON)
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="opening-hours-file"
                    type="file"
                    onChange={(e) => handleOpeningHoursUpload(e.target.files)}
                    accept=".csv,.json"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-1" /> Upload
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a file with your regular opening hours to auto-populate the calendar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mark Unavailable Dates</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-gray-600">Unavailable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span className="text-gray-600">Closed</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Click on dates to mark them as unavailable. Dates marked as closed are based on your opening hours above.
          </p>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 max-h-96 overflow-y-auto">
            {calendarDays.map((date, index) => {
              const isUnavailable = isDateUnavailable(date)
              const isClosed = isDateClosed(date)
              const isToday = date.toDateString() === new Date().toDateString()
              const isPast = date < new Date() && !isToday

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isPast && toggleDateAvailability(date)}
                  disabled={isPast}
                  className={`
                  p-2 text-sm border rounded transition-colors
                  ${isPast ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "cursor-pointer hover:border-primary-300"}
              ${isToday ? "ring-2 ring-primary-500" : ""}
              ${
                isClosed
                  ? "bg-gray-100 border-gray-300 text-gray-500"
                  : isUnavailable
                    ? "bg-red-100 border-red-300 text-red-700"
                    : "bg-green-100 border-green-300 text-green-700"
              }
            `}
                >
                  <div className="font-medium">{date.getDate()}</div>
                  <div className="text-xs">{date.toLocaleDateString("en-US", { month: "short" })}</div>
                </button>
              )
            })}
          </div>

          {unavailableDates.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Unavailable Dates ({unavailableDates.length})</h4>
              <div className="flex flex-wrap gap-2">
                {unavailableDates.slice(0, 10).map((date, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                    })}
                  </Badge>
                ))}
                {unavailableDates.length > 10 && (
                  <Badge variant="secondary" className="text-xs">
                    +{unavailableDates.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Step 5: Business Verification
  const renderVerificationStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Help parents trust your business</h2>
      <p className="text-gray-600">
        Upload documents to verify your business. This helps build trust with parents and increases your booking
        chances.
      </p>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="dbsCertificate" className="font-medium">
                DBS Certificate <span className="text-primary-500">*</span>
              </Label>
              <p className="text-sm text-gray-600 mb-3">Required for services working with children</p>
              <div className="flex items-center space-x-2">
                <Input
                  id="dbsCertificate"
                  type="file"
                  onChange={(e) => handleFileUpload("dbsCertificate", e.target.files)}
                  className="flex-1"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button type="button" variant="outline" size="sm" className="whitespace-nowrap">
                  <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>
              </div>
              {formData.dbsCertificate && (
                <p className="text-sm text-green-600 mt-1">✓ {formData.dbsCertificate.name} uploaded</p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="insurance" className="font-medium">
                Public Liability Insurance <span className="text-primary-500">*</span>
              </Label>
              <p className="text-sm text-gray-600 mb-3">Required for all suppliers</p>
              <div className="flex items-center space-x-2">
                <Input
                  id="insurance"
                  type="file"
                  onChange={(e) => handleFileUpload("insurance", e.target.files)}
                  className="flex-1"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button type="button" variant="outline" size="sm" className="whitespace-nowrap">
                  <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>
              </div>
              {formData.insurance && (
                <p className="text-sm text-green-600 mt-1">✓ {formData.insurance.name} uploaded</p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="businessLicense" className="font-medium">
                Business License/Certification (Optional)
              </Label>
              <p className="text-sm text-gray-600 mb-3">Any additional qualifications or certifications</p>
              <div className="flex items-center space-x-2">
                <Input
                  id="businessLicense"
                  type="file"
                  onChange={(e) => handleFileUpload("businessLicense", e.target.files)}
                  className="flex-1"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button type="button" variant="outline" size="sm" className="whitespace-nowrap">
                  <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>
              </div>
              {formData.businessLicense && (
                <p className="text-sm text-green-600 mt-1">✓ {formData.businessLicense.name} uploaded</p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="mr-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="portfolioPhotos" className="font-medium">
                Portfolio Photos <span className="text-primary-500">*</span>
              </Label>
              <p className="text-sm text-gray-600 mb-3">Upload up to 5 photos showcasing your services</p>
              <div className="flex items-center space-x-2">
                <Input
                  id="portfolioPhotos"
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload("portfolioPhotos", e.target.files)}
                  className="flex-1"
                  accept=".jpg,.jpeg,.png"
                />
                <Button type="button" variant="outline" size="sm" className="whitespace-nowrap">
                  <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>
              </div>
              {formData.portfolioPhotos.length > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {formData.portfolioPhotos.length} photo{formData.portfolioPhotos.length !== 1 ? "s" : ""} uploaded
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.portfolioPhotos.map((photo, index) => (
                  <div key={index} className="w-16 h-16 bg-gray-100 rounded-md relative">
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                      Photo {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Why we ask for verification:</strong> Parents trust BookABash to connect them with reliable,
              professional suppliers. Verified suppliers receive more bookings and higher ratings.
            </p>
            <div className="mt-2 flex items-center">
              <Badge className="bg-primary-500 text-white">Verified Supplier</Badge>
              <span className="text-sm text-blue-800 ml-2">← You'll get this badge on your profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
    

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {currentStep === 1 && (
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join London's Premier Party Supplier Network
            </h1>
            <div className="max-w-3xl">
              <p className="text-xl text-gray-600 mb-6">
                Connect with parents planning amazing parties. Get quality leads, manage bookings, and grow your
                business.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">Quality leads from verified parents</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">Simple booking management</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">No upfront costs - only 10% commission on bookings</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">Registration takes 2-3 minutes</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6 md:p-8">
            {renderForm()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={submitForm} className="bg-primary-500 hover:bg-primary-600 text-white">
                  Complete Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">Join 500+ suppliers already on BookABash</span>
          </div>
          <p className="text-sm text-gray-500">
            Questions? Contact our supplier support team at{" "}
            <a href="mailto:suppliers@bookabash.com" className="text-primary-500 hover:underline">
              suppliers@bookabash.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
