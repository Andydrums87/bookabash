"use client"

import { useState, useEffect } from "react"
import {
  MapPin,
  Settings,
  Info,
  Loader2,
  Camera,
  Shield,
  DollarSign,
  Target,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

const VenueServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness }) => {
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    facilities: false,
    ageGroups: false,
    policies: false,
    setupOptions: false,
    cateringOptions: false,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const [details, setDetails] = useState({
    venueType: "",
    capacity: {
      min: 10,
      max: 100,
      seated: 50,
      standing: 80,
    },
    facilities: [],
    ageGroups: [],
    pricing: {
      hourlyRate: 0,
      halfDayRate: 0,
      fullDayRate: 0,
      cleaningFee: 0,
      securityDeposit: 0,
      minimumSpend: 0,
    },
    availability: {
      daysOfWeek: [],
      timeSlots: [],
      minimumBookingHours: 2,
      maxAdvanceBooking: 365,
    },
    equipment: {
      tables: 0,
      chairs: 0,
      soundSystem: false,
      projector: false,
      kitchen: false,
      bar: false,
    },
    policies: {
      ownFood: true,
      ownDecorations: true,
      alcohol: false,
      smoking: false,
      music: true,
      endTime: "22:00",
      childSupervision: true,
    },
    location: {
      fullAddress: "",
      postcode: "",
      accessInstructions: "",
      parkingInfo: "",
      nearestStation: "",
      landmarks: "",
    },
    specialFeatures: "",
    setupOptions: [],
    cateringOptions: [],
    addOnServices: [],
    ...serviceDetails,
  })

  // ✅ Update form when business data changes from parent
  useEffect(() => {
    if (supplierData) {
      console.log("🔄 VenueServiceDetails updating with business data:", supplierData.name)

      const businessServiceDetails = supplierData.serviceDetails || {}

      setDetails({
        venueType: "",
        capacity: {
          min: 10,
          max: 100,
          seated: 50,
          standing: 80,
        },
        facilities: [],
        ageGroups: [],
        pricing: {
          hourlyRate: 0,
          halfDayRate: 0,
          fullDayRate: 0,
          cleaningFee: 0,
          securityDeposit: 0,
          minimumSpend: 0,
        },
        availability: {
          daysOfWeek: [],
          timeSlots: [],
          minimumBookingHours: 2,
          maxAdvanceBooking: 365,
        },
        equipment: {
          tables: 0,
          chairs: 0,
          soundSystem: false,
          projector: false,
          kitchen: false,
          bar: false,
        },
        policies: {
          ownFood: true,
          ownDecorations: true,
          alcohol: false,
          smoking: false,
          music: true,
          endTime: "22:00",
          childSupervision: true,
        },
        venueDetails: {
          parkingInfo: "",
          accessInstructions: "",
          nearestStation: "",
          landmarks: "",
        },
        specialFeatures: "",
        setupOptions: [],
        cateringOptions: [],
        addOnServices: [],
        // Override with actual business data
        ...businessServiceDetails,
        // Ensure nested objects are properly merged
        capacity: {
          min: 10,
          max: 100,
          seated: 50,
          standing: 80,
          ...businessServiceDetails.capacity,
        },
        pricing: {
          hourlyRate: 0,
          halfDayRate: 0,
          fullDayRate: 0,
          cleaningFee: 0,
          securityDeposit: 0,
          minimumSpend: 0,
          ...businessServiceDetails.pricing,
        },
        availability: {
          daysOfWeek: [],
          timeSlots: [],
          minimumBookingHours: 2,
          maxAdvanceBooking: 365,
          ...businessServiceDetails.availability,
        },
        equipment: {
          tables: 0,
          chairs: 0,
          soundSystem: false,
          projector: false,
          kitchen: false,
          bar: false,
          ...businessServiceDetails.equipment,
        },
        policies: {
          ownFood: true,
          ownDecorations: true,
          alcohol: false,
          smoking: false,
          music: true,
          endTime: "22:00",
          childSupervision: true,
          ...businessServiceDetails.policies,
        },
        venueDetails: {
          parkingInfo: "",
          accessInstructions: "",
          nearestStation: "",
          landmarks: "",
          ...businessServiceDetails.venueDetails,
        },
      })
    }
  }, [supplierData]) // Updated to use supplierData directly

  // Data options
  const venueTypes = [
    "Community Hall",
    "Church Hall",
    "School Hall",
    "Sports Centre",
    "Private Function Room",
    "Outdoor Space",
    "Village Hall",
    "Hotel Conference Room",
    "Restaurant Private Room",
    "Other",
  ]

  const facilityOptions = [
    "Kitchen Facilities",
    "Accessible Access",
    "Parking Available",
    "Public Transport Links",
    "Toilets/Changing Facilities",
    "Sound System",
    "Projector/Screen",
    "Stage/Performance Area",
    "Outdoor Space",
    "Bar Facilities",
    "Air Conditioning",
    "WiFi Internet",
    "Storage Space",
    "Coat/Bag Storage",
  ]

  const ageGroupOptions = [
    "0-2 years",
    "3-5 years",
    "6-8 years",
    "9-12 years",
    "13+ years",
    "All ages",
    "Adult parties",
  ]

  const setupOptions = [
    "Theater Style",
    "Round Tables",
    "Long Tables",
    "U-Shape",
    "Open Floor",
    "Mixed Setup",
    "Custom Arrangement",
  ]

  const cateringOptions = [
    "External Catering Welcome",
    "Preferred Caterers List",
    "Kitchen Access Included",
    "No Outside Food",
    "Licensed Bar Available",
    "Tea/Coffee Facilities",
  ]

  const timeSlots = [
    "Morning (9am-12pm)",
    "Afternoon (12pm-5pm)",
    "Evening (5pm-10pm)",
    "All Day (9am-10pm)",
    "Extended Hours Available",
  ]

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // ✅ Fixed handlers that call onUpdate immediately
  const handleFieldChange = (field, value) => {
    const newDetails = { ...details, [field]: value }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleNestedFieldChange = (parentField, childField, value) => {
    const newDetails = {
      ...details,
      [parentField]: {
        ...details[parentField],
        [childField]: value,
      },
    }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleArrayToggle = (array, item, field) => {
    const newArray = array.includes(item) ? array.filter((i) => i !== item) : [...array, item]

    const newDetails = { ...details, [field]: newArray }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  // ✅ Show loading state if no data yet
  if (!supplierData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading business data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* ✅ Business Context Header */}
      {currentBusiness && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Editing:</strong> {currentBusiness.name} • {currentBusiness.serviceType} • Venue
          </AlertDescription>
        </Alert>
      )}
      {/* About Us Section */}
      <Card className="">
        <CardHeader className="py-4 sm:py-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            About Us
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tell customers about your business and what makes you special (max 60 words)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="aboutUs" className="text-sm sm:text-base font-semibold text-gray-700">
              Your Business Story *
            </Label>
            <div className="relative">
              <Textarea
                id="aboutUs"
                value={details.aboutUs || ""}
                onChange={(e) => {
                  const text = e.target.value
                  const words =
                    text.trim() === ""
                      ? []
                      : text
                          .trim()
                          .split(/\s+/)
                          .filter((word) => word.length > 0)
                  if (words.length <= 60) {
                    handleFieldChange("aboutUs", e.target.value)
                  }
                }}
                placeholder="Tell customers about your business, your passion for entertainment, what makes you unique, and why families love choosing you for their special occasions..."
                rows={4}
                className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {(() => {
                  const text = details.aboutUs || ""
                  const words =
                    text.trim() === ""
                      ? []
                      : text
                          .trim()
                          .split(/\s+/)
                          .filter((word) => word.length > 0)
                  return words.length
                })()}/60 words
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              💡 <strong>Tip:</strong> Share your story, highlight what makes you different, and mention any awards or
              recognition. Keep it friendly and engaging - no more than 2 paragraphs.
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Venue Type & Capacity */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Venue Type & Capacity
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tell customers about your venue and how many people it can accommodate
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="venueType" className="text-sm sm:text-base font-semibold text-gray-700">
                What type of venue is this? *
              </Label>
              <Select value={details.venueType} onValueChange={(value) => handleFieldChange("venueType", value)}>
                <SelectTrigger className="py-4 sm:py-5 w-full bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base">
                  <SelectValue placeholder="Choose your venue type" />
                </SelectTrigger>
                <SelectContent>
                  {venueTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-sm sm:text-base py-2 sm:py-3">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Minimum Booking Hours</Label>
              <Input
                type="number"
                min="1"
                max="24"
                value={details.availability?.minimumBookingHours || 2}
                onChange={(e) =>
                  handleNestedFieldChange("availability", "minimumBookingHours", Number.parseInt(e.target.value))
                }
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Min Capacity</Label>
              <Input
                type="number"
                min="1"
                value={details.capacity?.min || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "min", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="10"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Max Capacity</Label>
              <Input
                type="number"
                min="1"
                value={details.capacity?.max || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "max", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="100"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Seated Capacity</Label>
              <Input
                type="number"
                min="1"
                value={details.capacity?.seated || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "seated", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="50"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Standing Capacity</Label>
              <Input
                type="number"
                min="1"
                value={details.capacity?.standing || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "standing", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="80"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue Address & Location */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            Venue Address & Location
          </CardTitle>
          <CardDescription className="text-base">
            Enhance your existing business address with venue-specific details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Show existing address */}
          {supplierData?.owner?.address && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Current Business Address:</h4>
              <p className="text-blue-800">
                {supplierData.owner.address.street}, {supplierData.owner.address.city},{" "}
                {supplierData.owner.address.postcode}
              </p>
              <p className="text-sm text-blue-600 mt-1">✓ This address will be used for your venue location</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Parking Information</Label>
              <Textarea
                value={details.venueDetails?.parkingInfo || ""}
                onChange={(e) => handleNestedFieldChange("venueDetails", "parkingInfo", e.target.value)}
                placeholder="Free parking available in car park. Street parking also available."
                rows={3}
                className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Access Instructions</Label>
              <Textarea
                value={details.venueDetails?.accessInstructions || ""}
                onChange={(e) => handleNestedFieldChange("venueDetails", "accessInstructions", e.target.value)}
                placeholder="Main entrance through the front doors. Ring bell if locked. Wheelchair accessible."
                rows={3}
                className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Nearest Train/Tube Station</Label>
              <Input
                value={details.venueDetails?.nearestStation || ""}
                onChange={(e) => handleNestedFieldChange("venueDetails", "nearestStation", e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="e.g. Westminster Station (5 min walk)"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Local Landmarks</Label>
              <Input
                value={details.venueDetails?.landmarks || ""}
                onChange={(e) => handleNestedFieldChange("venueDetails", "landmarks", e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="e.g. Opposite Tesco, next to the Post Office"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities & Equipment - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle
            className="flex items-center justify-between text-lg sm:text-xl cursor-pointer"
            onClick={() => toggleSection("facilities")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Facilities & Equipment
            </div>
            <div className="sm:hidden">
              {expandedSections.facilities ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            What facilities and equipment are available at your venue?
          </CardDescription>
        </CardHeader>
        <CardContent
          className={`p-4 sm:p-8 space-y-6 sm:space-y-8 ${!expandedSections.facilities ? "hidden sm:block" : ""}`}
        >
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Available Facilities</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {facilityOptions.map((facility) => (
                <div
                  key={facility}
                  className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <Checkbox
                    id={`facility-${facility}`}
                    checked={details.facilities.includes(facility)}
                    onCheckedChange={() => handleArrayToggle(details.facilities, facility, "facilities")}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <Label
                    htmlFor={`facility-${facility}`}
                    className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                  >
                    {facility}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Equipment Quantities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">Tables Available</Label>
                <Input
                  type="number"
                  min="0"
                  value={details.equipment?.tables || ""}
                  onChange={(e) => handleNestedFieldChange("equipment", "tables", Number.parseInt(e.target.value))}
                  className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="10"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">Chairs Available</Label>
                <Input
                  type="number"
                  min="0"
                  value={details.equipment?.chairs || ""}
                  onChange={(e) => handleNestedFieldChange("equipment", "chairs", Number.parseInt(e.target.value))}
                  className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="80"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-6">
              {[
                { key: "soundSystem", label: "Sound System Available" },
                { key: "projector", label: "Projector/Screen Available" },
                { key: "kitchen", label: "Kitchen Access" },
                { key: "bar", label: "Bar Facilities" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <Checkbox
                    id={`equipment-${item.key}`}
                    checked={details.equipment?.[item.key] || false}
                    onCheckedChange={(checked) => handleNestedFieldChange("equipment", item.key, checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <Label
                    htmlFor={`equipment-${item.key}`}
                    className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Age Groups - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle
            className="flex items-center justify-between text-lg sm:text-xl cursor-pointer"
            onClick={() => toggleSection("ageGroups")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Suitable Age Groups
            </div>
            <div className="sm:hidden">
              {expandedSections.ageGroups ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            What age groups is your venue suitable for?
          </CardDescription>
        </CardHeader>
        <CardContent className={`p-4 sm:p-8 ${!expandedSections.ageGroups ? "hidden sm:block" : ""}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {ageGroupOptions.map((age) => (
              <div
                key={age}
                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <Checkbox
                  id={`age-${age}`}
                  checked={details.ageGroups.includes(age)}
                  onCheckedChange={() => handleArrayToggle(details.ageGroups, age, "ageGroups")}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label htmlFor={`age-${age}`} className="text-sm sm:text-base font-medium cursor-pointer flex-1">
                  {age}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Pricing Structure
          </CardTitle>
          <CardDescription className="text-base">Set your rates and any additional fees</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Hourly Rate (£)</Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.hourlyRate || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "hourlyRate", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="50"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Half Day Rate (£)</Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.halfDayRate || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "halfDayRate", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="200"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Full Day Rate (£)</Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.fullDayRate || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "fullDayRate", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="350"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Cleaning Fee (£)</Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.cleaningFee || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "cleaningFee", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="25"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Security Deposit (£)</Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.securityDeposit || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "securityDeposit", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="100"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Minimum Spend (£)</Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.minimumSpend || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "minimumSpend", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue Policies - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-red-50 to-red-100">
          <CardTitle
            className="flex items-center justify-between text-lg sm:text-xl cursor-pointer"
            onClick={() => toggleSection("policies")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Venue Policies & Rules
            </div>
            <div className="sm:hidden">
              {expandedSections.policies ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Set clear expectations for venue usage</CardDescription>
        </CardHeader>
        <CardContent
          className={`p-4 sm:p-8 space-y-6 sm:space-y-8 ${!expandedSections.policies ? "hidden sm:block" : ""}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[
              { key: "ownFood", label: "External food & catering allowed" },
              { key: "ownDecorations", label: "Own decorations allowed" },
              { key: "alcohol", label: "Alcohol permitted" },
              { key: "smoking", label: "Smoking allowed" },
              { key: "music", label: "Music/Entertainment allowed" },
              { key: "childSupervision", label: "Adult supervision required for children" },
            ].map((policy) => (
              <div
                key={policy.key}
                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Checkbox
                  id={`policy-${policy.key}`}
                  checked={details.policies?.[policy.key] || false}
                  onCheckedChange={(checked) => handleNestedFieldChange("policies", policy.key, checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label
                  htmlFor={`policy-${policy.key}`}
                  className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                >
                  {policy.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold text-gray-700">Latest End Time</Label>
            <Select
              value={details.policies?.endTime || "22:00"}
              onValueChange={(value) => handleNestedFieldChange("policies", "endTime", value)}
            >
              <SelectTrigger className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base">
                <SelectValue placeholder="Select latest end time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20:00">8:00 PM</SelectItem>
                <SelectItem value="21:00">9:00 PM</SelectItem>
                <SelectItem value="22:00">10:00 PM</SelectItem>
                <SelectItem value="23:00">11:00 PM</SelectItem>
                <SelectItem value="00:00">Midnight</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Special Features */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            Special Features & Additional Info
          </CardTitle>
          <CardDescription className="text-base">Highlight what makes your venue unique</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">Special Features & Unique Selling Points</Label>
            <Textarea
              value={details.specialFeatures || ""}
              onChange={(e) => handleFieldChange("specialFeatures", e.target.value)}
              placeholder="e.g., Beautiful Victorian architecture, garden access, recently renovated, historic building, great acoustics, natural lighting..."
              rows={4}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Available Setup Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {setupOptions.map((setup) => (
                <div
                  key={setup}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  <Checkbox
                    id={`setup-${setup}`}
                    checked={details.setupOptions.includes(setup)}
                    onCheckedChange={() => handleArrayToggle(details.setupOptions, setup, "setupOptions")}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`setup-${setup}`} className="text-base font-medium cursor-pointer flex-1">
                    {setup}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Catering Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cateringOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  <Checkbox
                    id={`catering-${option}`}
                    checked={details.cateringOptions.includes(option)}
                    onCheckedChange={() => handleArrayToggle(details.cateringOptions, option, "cateringOptions")}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`catering-${option}`} className="text-base font-medium cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VenueServiceDetails
