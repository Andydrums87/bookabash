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
  Clock,
  AlertTriangle,
  Gift,
  Star,
  X,
  PlusCircle,
  Edit3,
  Trash2,
  Ban,
  CheckCircle
} from "lucide-react"
import { generateVenuePackages } from "@/utils/mockBackend"

const VenueServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness }) => {
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    facilities: false,
    policies: false,
    setupOptions: false,
    cateringOptions: false,
    pricing: false,
    addons: false,
    restrictions: false,
    allowedItems: false,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  useEffect(() => {
    const testVenueData = {
      pricing: { hourlyRate: 50, setupTime: 30, cleanupTime: 30 },
      capacity: { max: 80 },
      venueType: "Community Hall"
    };
    
    console.log('Testing venue package generation...');
    const packages = generateVenuePackages(testVenueData);
    console.log('Generated packages:', packages);
  }, []);

  const [details, setDetails] = useState({
    venueType: "",
    capacity: {
      min: 10,
      max: 100,
      seated: 50,
      standing: 80,
    },
    venueAddress: {
      businessName: "", // e.g. "St Peter's Community Hall"
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      country: "United Kingdom"
    },
    facilities: [],
    pricing: {
      hourlyRate: 0,
      cleaningFee: 0,
      securityDeposit: 0,
      minimumSpend: 0,
      setupTime: 30, // minutes for setup
      cleanupTime: 30, // minutes for cleanup
      weekendSurcharge: 0, // percentage
      peakSeasonSurcharge: 0, // percentage
    },
    availability: {
      daysOfWeek: [],
      timeSlots: [],
      minimumBookingHours: 3, // Updated default to 3 based on research
      maxAdvanceBooking: 365,
      bufferTimeBetweenBookings: 60, // minutes
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
      depositRequired: true,
      cancellationPolicy: "48_hours",
    },
    specialFeatures: "",
    setupOptions: [],
    cateringOptions: [],
    addOnServices: [],
    restrictedItems: [],
    allowedItems: [], // NEW: Items that are specifically allowed/encouraged
    houseRules: [],
    bookingTerms: "",
    venueRules: "",
    ...serviceDetails,
  })

  // Add-ons management state
  const [isAddingAddon, setIsAddingAddon] = useState(false)
  const [editingAddon, setEditingAddon] = useState(null)
  const [addonForm, setAddonForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "service",
  })

  // Restrictions management state
  const [isAddingRestriction, setIsAddingRestriction] = useState(false)
  const [customRestriction, setCustomRestriction] = useState("")

  // NEW: Allowed items management state
  const [isAddingAllowedItem, setIsAddingAllowedItem] = useState(false)
  const [customAllowedItem, setCustomAllowedItem] = useState("")

  // House rules management state
  const [isAddingRule, setIsAddingRule] = useState(false)
  const [customRule, setCustomRule] = useState("")

// Update the useEffect in VenueServiceDetails that loads supplier data
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
      // NEW: Pre-populate venue address from supplier data
      venueAddress: {
        businessName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
        // Try multiple sources for venue address data
        ...(supplierData.venueAddress || {}), // Top-level venue address
        ...(supplierData.serviceDetails?.venueAddress || {}), // Service details venue address
        // Fall back to business data if no specific venue address
        ...((!supplierData.venueAddress && !supplierData.serviceDetails?.venueAddress) && {
          businessName: supplierData.name || "",
          postcode: supplierData.location || ""
        })
      },
      facilities: [],
      pricing: {
        hourlyRate: 0,
        cleaningFee: 0,
        securityDeposit: 0,
        minimumSpend: 0,
        setupTime: 60, // Changed to 60 minutes (1 hour)
        cleanupTime: 60, // Changed to 60 minutes (1 hour)
        weekendSurcharge: 0,
        peakSeasonSurcharge: 0,
      },
      availability: {
        daysOfWeek: [],
        timeSlots: [],
        minimumBookingHours: 3,
        maxAdvanceBooking: 365,
        bufferTimeBetweenBookings: 60,
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
        depositRequired: true,
        cancellationPolicy: "48_hours",
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
      restrictedItems: [],
      allowedItems: [], // NEW: Initialize allowed items
      houseRules: [],
      bookingTerms: "",
      venueRules: "",
      // Override with actual business data
      ...businessServiceDetails,
      // Ensure nested objects are properly merged
      venueAddress: {
        businessName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
        // Apply the same logic for nested venue address
        ...(supplierData.venueAddress || {}),
        ...(businessServiceDetails.venueAddress || {}),
        ...((!supplierData.venueAddress && !businessServiceDetails.venueAddress) && {
          businessName: supplierData.name || "",
          postcode: supplierData.location || ""
        })
      },
      capacity: {
        min: 10,
        max: 100,
        seated: 50,
        standing: 80,
        ...businessServiceDetails.capacity,
      },
      pricing: {
        hourlyRate: 0,
        cleaningFee: 0,
        securityDeposit: 0,
        minimumSpend: 0,
        setupTime: 60,
        cleanupTime: 60,
        weekendSurcharge: 0,
        peakSeasonSurcharge: 0,
        ...businessServiceDetails.pricing,
      },
      availability: {
        daysOfWeek: [],
        timeSlots: [],
        minimumBookingHours: 3,
        maxAdvanceBooking: 365,
        bufferTimeBetweenBookings: 60,
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
        depositRequired: true,
        cancellationPolicy: "48_hours",
        ...businessServiceDetails.policies,
      },
      venueDetails: {
        parkingInfo: "",
        accessInstructions: "",
        nearestStation: "",
        landmarks: "",
        ...businessServiceDetails.venueDetails,
      },
      addOnServices: businessServiceDetails.addOnServices || [],
      restrictedItems: businessServiceDetails.restrictedItems || [],
      allowedItems: businessServiceDetails.allowedItems || [], // NEW: Load allowed items
      houseRules: businessServiceDetails.houseRules || [],
    })

    console.log("✅ VenueServiceDetails loaded with address:", {
      venueAddress: businessServiceDetails.venueAddress || supplierData.venueAddress,
      businessName: supplierData.name
    })
  }
}, [supplierData])

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
    "Village Green/Park",
    "Community Centre",
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
    "Changing Rooms",
    "First Aid Kit",
    "Fire Safety Equipment",
  ]

  const setupOptions = [
    "Theater Style",
    "Round Tables",
    "Long Tables",
    "U-Shape",
    "Open Floor",
    "Mixed Setup",
    "Custom Arrangement",
    "Dance Floor Setup",
    "Performance Setup",
  ]

  const cateringOptions = [
    "External Catering Welcome",
    "Preferred Caterers List",
    "Kitchen Access Included",
    "No Outside Food",
    "Licensed Bar Available",
    "Tea/Coffee Facilities",
    "Refrigeration Available",
    "Serving Equipment Provided",
  ]

  const timeSlots = [
    "Morning (9am-12pm)",
    "Afternoon (12pm-5pm)",
    "Evening (5pm-10pm)",
    "All Day (9am-10pm)",
    "Extended Hours Available",
  ]

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const cancellationPolicies = [
    { value: "24_hours", label: "24 hours notice" },
    { value: "48_hours", label: "48 hours notice" },
    { value: "72_hours", label: "72 hours notice" },
    { value: "1_week", label: "1 week notice" },
    { value: "2_weeks", label: "2 weeks notice" },
    { value: "flexible", label: "Flexible (case by case)" },
  ]

  // Add-ons data
  const addonCategories = [
    { value: "service", label: "Additional Service", emoji: "🛎️", description: "Extra services for guests" },
    { value: "access", label: "Facility Access", emoji: "🔑", description: "Access to specific areas" },
    { value: "equipment", label: "Equipment Rental", emoji: "🎵", description: "Additional equipment hire" },
    { value: "premium", label: "Premium Upgrade", emoji: "⭐", description: "Premium or luxury options" },
    { value: "logistics", label: "Logistics", emoji: "🚚", description: "Setup, delivery, or assistance" },
  ]

  const addonTemplates = [
    {
      name: "Professional Cleaning Service",
      price: 75,
      description: "Full post-event cleaning so you can relax",
      category: "service",
    },
    {
      name: "Kitchen Access",
      price: 25,
      description: "Full access to kitchen facilities for food prep",
      category: "access",
    },
    {
      name: "Sound System Rental",
      price: 40,
      description: "Professional PA system with microphones",
      category: "equipment",
    },
    {
      name: "Extended Hours",
      price: 50,
      description: "Stay an extra hour beyond standard time",
      category: "premium",
    },
    {
      name: "Setup Assistance",
      price: 30,
      description: "Staff help with table and chair arrangement",
      category: "logistics",
    },
    {
      name: "Weekend Premium",
      price: 100,
      description: "Premium rate for weekend bookings",
      category: "premium",
    },
    {
      name: "Bar Service",
      price: 60,
      description: "Access to licensed bar facilities",
      category: "access",
    },
    {
      name: "Projector & Screen",
      price: 35,
      description: "AV equipment for presentations or entertainment",
      category: "equipment",
    },
  ]

  // Common restricted items
  const commonRestrictedItems = [
    "Bouncy castles",
    "Wet play activities",
    "Sand or sandpits",
    "Smoke machines",
    "Bubble machines",
    "Skateboards or scooters",
    "Items that may damage wooden floors",
    "Confetti or glitter",
    "Candles or open flames",
    "Pets or animals",
    "Loud music after specified times",
    "Glass containers",
  ]

  // NEW: Common allowed items that venues might want to highlight
  const commonAllowedItems = [
    "Bouncy castles",
    "Soft play equipment",
    "Musical instruments",
    "Additional tables and chairs",
    "Sound system",
    "Toys and games",
    "Face painting supplies",
    "Balloon decorations",
    "Party games equipment",
    "Craft supplies",
    "Photography equipment",
    "Catering equipment",
    "Dance mats",
    "Karaoke machines",
    "Projector screens",
    "Outdoor games",
    "Sports equipment",
    "Arts and crafts materials",
  ]

  // Common house rules
  const commonHouseRules = [
    "Please arrive no more than 15 minutes before the start time",
    "You will be sent the caretaker's contact number prior to the booking",
    "If the venue is not open when you arrive, please call the contact number",
    "There won't be a member of staff on site during your booking",
    "Contact the venue if you have any issues during your event",
    "No smoking anywhere on the premises",
    "No vaping inside the building",
    "Alcohol must be approved by venue in advance",
    "Bring your own bags and take all rubbish with you",
    "Leave promptly after your event ends",
    "Leave the space exactly as you found it",
    "Please ensure all doors are closed and locked behind you",
    "Children must be supervised by adults at all times",
    "Report any damage or issues immediately",
    "Clean up any spills immediately for safety",
  ]

  // Fixed handlers that call onUpdate immediately
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

  // Add-ons management functions
  const handleAddonFormChange = (field, value) => {
    setAddonForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetAddonForm = () => {
    setAddonForm({
      name: "",
      price: "",
      description: "",
      category: "service",
    })
    setIsAddingAddon(false)
    setEditingAddon(null)
  }

  const handleAddAddon = () => {
    if (!addonForm.name || !addonForm.price) {
      alert("Please enter both name and price for the add-on")
      return
    }

    const newAddon = {
      id: editingAddon ? editingAddon.id : `addon-${Date.now()}`,
      name: addonForm.name,
      price: Number.parseInt(addonForm.price),
      description: addonForm.description,
      category: addonForm.category,
    }

    let newDetails
    if (editingAddon) {
      newDetails = {
        ...details,
        addOnServices: details.addOnServices.map((addon) => (addon.id === editingAddon.id ? newAddon : addon)),
      }
    } else {
      newDetails = {
        ...details,
        addOnServices: [...details.addOnServices, newAddon],
      }
    }

    setDetails(newDetails)
    onUpdate(newDetails)
    resetAddonForm()
  }

  const handleEditAddon = (addon) => {
    setAddonForm({
      name: addon.name,
      price: addon.price.toString(),
      description: addon.description,
      category: addon.category,
    })
    setEditingAddon(addon)
    setIsAddingAddon(true)
  }

  const handleDeleteAddon = (addonId) => {
    if (confirm("Are you sure you want to delete this add-on?")) {
      const newDetails = {
        ...details,
        addOnServices: details.addOnServices.filter((addon) => addon.id !== addonId),
      }
      setDetails(newDetails)
      onUpdate(newDetails)
    }
  }

  const handleAddTemplate = (template) => {
    if (details.addOnServices.some((addon) => addon.name === template.name)) {
      alert("This add-on already exists!")
      return
    }

    const newAddon = {
      id: `addon-${Date.now()}`,
      ...template,
    }

    const newDetails = {
      ...details,
      addOnServices: [...details.addOnServices, newAddon],
    }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  // Restrictions management
  const handleAddRestriction = (item) => {
    if (details.restrictedItems.includes(item)) return
    
    const newDetails = {
      ...details,
      restrictedItems: [...details.restrictedItems, item],
    }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleRemoveRestriction = (item) => {
    const newDetails = {
      ...details,
      restrictedItems: details.restrictedItems.filter(i => i !== item),
    }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleAddCustomRestriction = () => {
    if (!customRestriction.trim()) return
    
    handleAddRestriction(customRestriction.trim())
    setCustomRestriction("")
    setIsAddingRestriction(false)
  }

  // NEW: Allowed items management functions
  const handleAddAllowedItem = (item) => {
    if (details.allowedItems.includes(item)) return
    
    const newDetails = {
      ...details,
      allowedItems: [...details.allowedItems, item],
    }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleRemoveAllowedItem = (item) => {
    const newDetails = {
      ...details,
      allowedItems: details.allowedItems.filter(i => i !== item),
    }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleAddCustomAllowedItem = () => {
    if (!customAllowedItem.trim()) return
    
    handleAddAllowedItem(customAllowedItem.trim())
    setCustomAllowedItem("")
    setIsAddingAllowedItem(false)
  }

  // House rules management
  const handleAddRule = (rule) => {
    if (details.houseRules.includes(rule)) return
    
    const newDetails = {
      ...details,
      houseRules: [...details.houseRules, rule],
    }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleRemoveRule = (rule) => {
    const newDetails = {
      ...details,
      houseRules: details.houseRules.filter(r => r !== rule),
    }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleAddCustomRule = () => {
    if (!customRule.trim()) return
    
    handleAddRule(customRule.trim())
    setCustomRule("")
    setIsAddingRule(false)
  }

  // Calculate total booking time including setup/cleanup
  const calculateTotalBookingTime = () => {
    const setupMinutes = details.pricing?.setupTime || 30
    const cleanupMinutes = details.pricing?.cleanupTime || 30
    const minimumHours = details.availability?.minimumBookingHours || 3
    const totalMinutes = (minimumHours * 60) + setupMinutes + cleanupMinutes
    return Math.ceil(totalMinutes / 60)
  }

  // Show loading state if no data yet
  if (!supplierData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading business data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* About Us Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="py-4 sm:py-8 px-4 sm:px-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-900">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            About Your Venue
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Tell customers about your venue and what makes it special (max 60 words)
          </p>
        </div>
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <label htmlFor="aboutUs" className="text-sm sm:text-base font-semibold text-gray-700 block">
              Venue Description *
            </label>
            <div className="relative">
              <textarea
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
                placeholder="Describe your venue, its atmosphere, what makes it perfect for children's parties, and why families love choosing it for their special celebrations..."
                rows={8}
                className="w-full bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none focus:border-orange-500 focus:outline-none"
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
          </div>
        </div>
      </div>

        {/* Venue Address - Replace existing location section */}
<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
  <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
    <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
        <MapPin className="w-5 h-5 text-white" />
      </div>
      Venue Address & Location
    </h2>
    <p className="text-base text-gray-600 mt-2">
      The actual venue location where parties take place
    </p>
  </div>
  <div className="p-8 space-y-6">
    


    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-700 block">
          Address Line 1 *
        </label>
        <input
          value={details.venueAddress?.addressLine1 || ""}
          onChange={(e) => handleNestedFieldChange("venueAddress", "addressLine1", e.target.value)}
          placeholder="123 Church Street"
          className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-700 block">
          Address Line 2
        </label>
        <input
          value={details.venueAddress?.addressLine2 || ""}
          onChange={(e) => handleNestedFieldChange("venueAddress", "addressLine2", e.target.value)}
          placeholder="Optional"
          className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-700 block">
          City *
        </label>
        <input
          value={details.venueAddress?.city || ""}
          onChange={(e) => handleNestedFieldChange("venueAddress", "city", e.target.value)}
          placeholder="London"
          className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-700 block">
          Postcode *
        </label>
        <input
          value={details.venueAddress?.postcode || ""}
          onChange={(e) => handleNestedFieldChange("venueAddress", "postcode", e.target.value.toUpperCase())}
          placeholder="SW1A 1AA"
          className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <label className="text-base font-semibold text-gray-700 block">
          Country *
        </label>
        <select
          value={details.venueAddress?.country || "United Kingdom"}
          onChange={(e) => handleNestedFieldChange("venueAddress", "country", e.target.value)}
          className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-blue-500 focus:outline-none"
        >
          <option value="United Kingdom">United Kingdom</option>
          <option value="Ireland">Ireland</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-700 block">Parking Information *</label>
              <textarea
                value={details.venueDetails?.parkingInfo || ""}
                onChange={(e) => handleNestedFieldChange("venueDetails", "parkingInfo", e.target.value)}
                placeholder="Free parking available in car park. Street parking also available. Disabled parking spaces at entrance."
                rows={4}
                className="w-full bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-700 block">Access Instructions *</label>
              <textarea
                value={details.venueDetails?.accessInstructions || ""}
                onChange={(e) => handleNestedFieldChange("venueDetails", "accessInstructions", e.target.value)}
                placeholder="Main entrance through the front doors. Ring bell if locked. Wheelchair accessible via ramp. Loading area available at side entrance."
                rows={4}
                className="w-full bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-700 block">Nearest Train/Tube Station</label>
              <input
                value={details.venueDetails?.nearestStation || ""}
                onChange={(e) => handleNestedFieldChange("venueDetails", "nearestStation", e.target.value)}
                className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Westminster Station (5 min walk)"
              />
            </div>

            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-700 block">Local Landmarks</label>
              <input
                value={details.venueDetails?.landmarks || ""}
                onChange={(e) => handleNestedFieldChange("venueDetails", "landmarks", e.target.value)}
                className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Opposite Tesco, next to the Post Office"
              />
            </div>
          </div>
        </div>
      
    

</div>

      {/* Venue Type & Capacity */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 sm:p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-900">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Venue Type & Capacity
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Tell customers about your venue type and how many people it can accommodate
          </p>
        </div>
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label htmlFor="venueType" className="text-sm sm:text-base font-semibold text-gray-700 block">
                What type of venue is this? *
              </label>
              <select 
                value={details.venueType} 
                onChange={(e) => handleFieldChange("venueType", e.target.value)}
                className="w-full py-4 px-3 sm:py-5 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:border-blue-500 focus:outline-none"
              >
                <option value="">Choose your venue type</option>
                {venueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm sm:text-base font-semibold text-gray-700 block">
                Minimum Booking Hours *
              </label>
              <select 
                value={details.availability?.minimumBookingHours?.toString() || "3"} 
                onChange={(e) => handleNestedFieldChange("availability", "minimumBookingHours", parseInt(e.target.value))}
                className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:border-blue-500 focus:outline-none px-3"
              >
                <option value="2">2 hours</option>
                <option value="3">3 hours (recommended)</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours (full day)</option>
              </select>
              <p className="text-xs text-gray-600">
                Most venues require 3-4 hours to allow for setup and cleanup
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm sm:text-base font-semibold text-gray-700 block">Min Capacity</label>
              <input
                type="number"
                min="1"
                value={details.capacity?.min || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "min", parseInt(e.target.value))}
                className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base px-3 focus:border-blue-500 focus:outline-none"
                placeholder="10"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm sm:text-base font-semibold text-gray-700 block">Max Capacity *</label>
              <input
                type="number"
                min="1"
                value={details.capacity?.max || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "max", parseInt(e.target.value))}
                className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base px-3 focus:border-blue-500 focus:outline-none"
                placeholder="100"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm sm:text-base font-semibold text-gray-700 block">Seated Capacity</label>
              <input
                type="number"
                min="1"
                value={details.capacity?.seated || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "seated", parseInt(e.target.value))}
                className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base px-3 focus:border-blue-500 focus:outline-none"
                placeholder="50"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm sm:text-base font-semibold text-gray-700 block">Standing Capacity</label>
              <input
                type="number"
                min="1"
                value={details.capacity?.standing || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "standing", parseInt(e.target.value))}
                className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base px-3 focus:border-blue-500 focus:outline-none"
                placeholder="80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pricing Structure */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div 
          className="p-4 sm:p-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg cursor-pointer"
          onClick={() => toggleSection("pricing")}
        >
          <h2 className="flex items-center justify-between text-lg sm:text-xl font-bold text-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Pricing Structure
            </div>
            <div className="sm:hidden">
              {expandedSections.pricing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Set your hourly rates and any additional fees
          </p>
        </div>
        <div className={`p-4 sm:p-8 space-y-6 sm:space-y-8 ${!expandedSections.pricing ? "hidden sm:block" : ""}`}>
          
          {/* Main Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-700 block">Hourly Rate (£) *</label>
              <input
                type="number"
                min="0"
                value={details.pricing?.hourlyRate || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "hourlyRate", parseInt(e.target.value))}
                className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-orange-500 focus:outline-none"
                placeholder="50"
              />
              <p className="text-xs text-gray-600">
                Your base rate per hour for venue hire
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-700 block">Minimum Spend (£)</label>
              <input
                type="number"
                min="0"
                value={details.pricing?.minimumSpend || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "minimumSpend", parseInt(e.target.value))}
                className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-orange-500 focus:outline-none"
                placeholder="150"
              />
              <p className="text-xs text-gray-600">
                Minimum total booking amount (optional)
              </p>
            </div>
          </div>

          {/* Setup and Cleanup Times */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Setup & Cleanup Time</h4>
            <p className="text-blue-800">Standard 1 hour setup and 1 hour cleanup included with all bookings.</p>
            <p className="text-sm text-blue-600 mt-1">This ensures adequate time for proper party preparation and venue restoration.</p>
          </div>

        </div>
      </div>

      {/* Add-on Services Management */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div 
          className="p-4 sm:p-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg cursor-pointer"
          onClick={() => toggleSection("addons")}
        >
          <h2 className="flex items-center justify-between text-lg sm:text-xl font-bold text-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Add-on Services
            </div>
            <div className="sm:hidden">
              {expandedSections.addons ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Optional extras that customers can add to their bookings
          </p>
        </div>
        <div className={`p-4 sm:p-8 space-y-6 sm:space-y-8 ${!expandedSections.addons ? "hidden sm:block" : ""}`}>
          
          {/* Quick Templates */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Quick Add Templates
            </h4>
            <p className="text-sm text-gray-600 mb-4">Popular add-ons you can add with one click</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addonTemplates.map((template, index) => {
                const categoryInfo = addonCategories.find((cat) => cat.value === template.category)
                const alreadyExists = details.addOnServices.some((addon) => addon.name === template.name)

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      alreadyExists
                        ? "border-gray-200 bg-gray-50 opacity-50"
                        : "border-gray-200 bg-white hover:border-purple-400 hover:shadow-md cursor-pointer"
                    }`}
                    onClick={alreadyExists ? undefined : () => handleAddTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900 text-sm">{template.name}</h5>
                      <div className="text-purple-600 font-bold text-sm">£{template.price}</div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {categoryInfo?.emoji} {categoryInfo?.label}
                      </span>
                      {alreadyExists ? (
                        <span className="text-xs text-gray-500">✓ Added</span>
                      ) : (
                        <PlusCircle className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current Add-ons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Your Add-on Services ({details.addOnServices.length})
              </h4>
              <button
                onClick={() => setIsAddingAddon(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Custom
              </button>
            </div>

            {details.addOnServices.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Gift className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <h5 className="text-base font-medium text-gray-900 mb-2">No add-ons yet</h5>
                <p className="text-gray-500 text-sm mb-4">Add some popular templates or create custom add-ons</p>
              </div>
            ) : (
              <div className="space-y-3">
                {details.addOnServices.map((addon, index) => {
                  const categoryInfo = addonCategories.find((cat) => cat.value === addon.category)

                  return (
                    <div
                      key={index}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-gray-900">{addon.name}</h5>
                            <span className="font-bold text-purple-600">£{addon.price}</span>
                            {categoryInfo && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {categoryInfo.emoji} {categoryInfo.label}
                              </span>
                            )}
                          </div>
                          {addon.description && <p className="text-gray-600 text-sm">{addon.description}</p>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditAddon(addon)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddon(addon.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW: Items Allowed & Items Not Permitted Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div 
          className="p-4 sm:p-8 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg cursor-pointer"
          onClick={() => toggleSection("allowedItems")}
        >
          <h2 className="flex items-center justify-between text-lg sm:text-xl font-bold text-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Items Allowed & Not Permitted
            </div>
            <div className="sm:hidden">
              {expandedSections.allowedItems ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Set clear expectations about what is welcome and what is not allowed
          </p>
        </div>
        <div className={`p-4 sm:p-8 space-y-8 ${!expandedSections.allowedItems ? "hidden sm:block" : ""}`}>
          
          {/* Items Allowed Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Items We Welcome
            </h4>
            <p className="text-sm text-gray-600 mb-4">Highlight special items or equipment that your venue welcomes and supports</p>
            
            {/* Common allowed items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {commonAllowedItems.map((item) => (
                <div
                  key={item}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    details.allowedItems.includes(item)
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => details.allowedItems.includes(item) ? handleRemoveAllowedItem(item) : handleAddAllowedItem(item)}
                >
                  <span className="text-sm font-medium">{item}</span>
                  {details.allowedItems.includes(item) && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>

            {/* Custom allowed item */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customAllowedItem}
                onChange={(e) => setCustomAllowedItem(e.target.value)}
                placeholder="Add custom allowed item..."
                className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAllowedItem()}
              />
              <button
                onClick={handleAddCustomAllowedItem}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Current allowed items */}
            {details.allowedItems.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Items We Welcome:</h5>
                <div className="flex flex-wrap gap-2">
                  {details.allowedItems.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveAllowedItem(item)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Restricted Items Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              Items Not Permitted
            </h4>
            <p className="text-sm text-gray-600 mb-4">Select items that are not allowed at your venue</p>
            
            {/* Common restrictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {commonRestrictedItems.map((item) => (
                <div
                  key={item}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    details.restrictedItems.includes(item)
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => details.restrictedItems.includes(item) ? handleRemoveRestriction(item) : handleAddRestriction(item)}
                >
                  <span className="text-sm font-medium">{item}</span>
                  {details.restrictedItems.includes(item) && (
                    <Ban className="w-4 h-4 text-red-600" />
                  )}
                </div>
              ))}
            </div>

            {/* Custom restriction */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customRestriction}
                onChange={(e) => setCustomRestriction(e.target.value)}
                placeholder="Add custom restriction..."
                className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-red-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomRestriction()}
              />
              <button
                onClick={handleAddCustomRestriction}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Current restrictions */}
            {details.restrictedItems.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Currently Restricted:</h5>
                <div className="flex flex-wrap gap-2">
                  {details.restrictedItems.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveRestriction(item)}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* House Rules */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div 
          className="p-4 sm:p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg cursor-pointer"
          onClick={() => toggleSection("restrictions")}
        >
          <h2 className="flex items-center justify-between text-lg sm:text-xl font-bold text-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              House Rules
            </div>
            <div className="sm:hidden">
              {expandedSections.restrictions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Set important venue guidelines for all bookings
          </p>
        </div>
        <div className={`p-4 sm:p-8 space-y-6 sm:space-y-8 ${!expandedSections.restrictions ? "hidden sm:block" : ""}`}>
          
          {/* House Rules */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">House Rules</h4>
            <p className="text-sm text-gray-600 mb-4">Select rules that apply to your venue</p>
            
            {/* Common rules */}
            <div className="space-y-2 mb-4">
              {commonHouseRules.map((rule) => (
                <div
                  key={rule}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    details.houseRules.includes(rule)
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => details.houseRules.includes(rule) ? handleRemoveRule(rule) : handleAddRule(rule)}
                >
                  <span className="text-sm">{rule}</span>
                  {details.houseRules.includes(rule) && (
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>

            {/* Custom rule */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customRule}
                onChange={(e) => setCustomRule(e.target.value)}
                placeholder="Add custom house rule..."
                className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomRule()}
              />
              <button
                onClick={handleAddCustomRule}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Current rules */}
            {details.houseRules.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Active House Rules:</h5>
                <div className="space-y-2">
                  {details.houseRules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                    >
                      <span className="text-sm text-blue-900">{rule}</span>
                      <button
                        onClick={() => handleRemoveRule(rule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Facilities & Equipment */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div 
          className="p-4 sm:p-8 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg cursor-pointer"
          onClick={() => toggleSection("facilities")}
        >
          <h2 className="flex items-center justify-between text-lg sm:text-xl font-bold text-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Facilities & Equipment
            </div>
            <div className="sm:hidden">
              {expandedSections.facilities ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            What facilities and equipment are available at your venue?
          </p>
        </div>
        <div className={`p-4 sm:p-8 space-y-6 sm:space-y-8 ${!expandedSections.facilities ? "hidden sm:block" : ""}`}>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Available Facilities</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {facilityOptions.map((facility) => (
                <div
                  key={facility}
                  className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`facility-${facility}`}
                    checked={details.facilities.includes(facility)}
                    onChange={() => handleArrayToggle(details.facilities, facility, "facilities")}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor={`facility-${facility}`}
                    className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                  >
                    {facility}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Equipment Quantities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-semibold text-gray-700 block">Tables Available</label>
                <input
                  type="number"
                  min="0"
                  value={details.equipment?.tables || ""}
                  onChange={(e) => handleNestedFieldChange("equipment", "tables", parseInt(e.target.value))}
                  className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base px-3 focus:border-green-500 focus:outline-none"
                  placeholder="10"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-semibold text-gray-700 block">Chairs Available</label>
                <input
                  type="number"
                  min="0"
                  value={details.equipment?.chairs || ""}
                  onChange={(e) => handleNestedFieldChange("equipment", "chairs", parseInt(e.target.value))}
                  className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base px-3 focus:border-green-500 focus:outline-none"
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
                  <input
                    type="checkbox"
                    id={`equipment-${item.key}`}
                    checked={details.equipment?.[item.key] || false}
                    onChange={(e) => handleNestedFieldChange("equipment", item.key, e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor={`equipment-${item.key}`}
                    className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Venue Policies */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div 
          className="p-4 sm:p-8 bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg cursor-pointer"
          onClick={() => toggleSection("policies")}
        >
          <h2 className="flex items-center justify-between text-lg sm:text-xl font-bold text-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Basic Venue Policies
            </div>
            <div className="sm:hidden">
              {expandedSections.policies ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Set basic venue policies</p>
        </div>
        <div className={`p-4 sm:p-8 space-y-6 sm:space-y-8 ${!expandedSections.policies ? "hidden sm:block" : ""}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[
              { key: "ownFood", label: "External food & catering allowed" },
              { key: "ownDecorations", label: "Own decorations allowed" },
              { key: "alcohol", label: "Alcohol permitted" },
              { key: "smoking", label: "Smoking allowed" },
              { key: "music", label: "Music/Entertainment allowed" },
              { key: "childSupervision", label: "Adult supervision required for children" },
              { key: "depositRequired", label: "Security deposit required" },
            ].map((policy) => (
              <div
                key={policy.key}
                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors"
              >
                <input
                  type="checkbox"
                  id={`policy-${policy.key}`}
                  checked={details.policies?.[policy.key] || false}
                  onChange={(e) => handleNestedFieldChange("policies", policy.key, e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label
                  htmlFor={`policy-${policy.key}`}
                  className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                >
                  {policy.label}
                </label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm sm:text-base font-semibold text-gray-700 block">Latest End Time</label>
              <select
                value={details.policies?.endTime || "22:00"}
                onChange={(e) => handleNestedFieldChange("policies", "endTime", e.target.value)}
                className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base px-3 focus:border-red-500 focus:outline-none"
              >
                <option value="20:00">8:00 PM</option>
                <option value="21:00">9:00 PM</option>
                <option value="22:00">10:00 PM</option>
                <option value="23:00">11:00 PM</option>
                <option value="00:00">Midnight</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm sm:text-base font-semibold text-gray-700 block">Cancellation Policy</label>
              <select
                value={details.policies?.cancellationPolicy || "48_hours"}
                onChange={(e) => handleNestedFieldChange("policies", "cancellationPolicy", e.target.value)}
                className="w-full h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base px-3 focus:border-red-500 focus:outline-none"
              >
                {cancellationPolicies.map((policy) => (
                  <option key={policy.value} value={policy.value}>
                    {policy.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Booking Terms */}
          <div className="space-y-3">
            <label className="text-base font-semibold text-gray-700 block">Booking Terms & Conditions</label>
            <textarea
              value={details.bookingTerms || ""}
              onChange={(e) => handleFieldChange("bookingTerms", e.target.value)}
              placeholder="Detail any specific booking terms, deposit requirements, payment schedules, or important conditions customers should know about..."
              rows={4}
              className="w-full bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Add-on Modal */}
      {isAddingAddon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAddon ? "Edit Add-on Service" : "Create New Add-on Service"}
                </h3>
                <button onClick={resetAddonForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="addonName" className="text-sm font-medium">
                    Service Name *
                  </label>
                  <input
                    id="addonName"
                    value={addonForm.name}
                    onChange={(e) => handleAddonFormChange("name", e.target.value)}
                    placeholder="e.g., Professional Cleaning Service"
                    className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="addonPrice" className="text-sm font-medium">
                    Price (£) *
                  </label>
                  <input
                    id="addonPrice"
                    type="number"
                    min="0"
                    value={addonForm.price}
                    onChange={(e) => handleAddonFormChange("price", e.target.value)}
                    placeholder="75"
                    className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl text-base px-3 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Category</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addonCategories.map((category) => (
                    <div
                      key={category.value}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        addonForm.category === category.value
                          ? "border-purple-300 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => handleAddonFormChange("category", category.value)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{category.emoji}</span>
                        <span className="font-medium text-gray-900 text-sm">{category.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="addonDescription" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="addonDescription"
                  value={addonForm.description}
                  onChange={(e) => handleAddonFormChange("description", e.target.value)}
                  placeholder="Describe what this add-on includes and why customers would want it..."
                  rows={3}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                onClick={resetAddonForm}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddAddon}
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
              >
                {editingAddon ? "Update Add-on" : "Create Add-on"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenueServiceDetails