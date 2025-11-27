"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
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
  CheckCircle,
  Users,
  Zap
} from "lucide-react"
import { generateVenuePackages } from "@/utils/mockBackend"
import { SectionSave } from '@/components/ui/SectionSave';
import { useSectionManager } from '../../hooks/useSectionManager';

const VenueServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, setSupplierData, currentBusiness, updateProfile, supplier, selectedSection, onSectionChange }) => {

  const { getSectionState, checkChanges, saveSection } = useSectionManager(
    supplierData,
    updateProfile,
    supplier
  );

  // Listing Name state and constants
  const MAX_NAME_LENGTH = 50
  const [listingName, setListingName] = useState(
    supplierData?.data?.name || currentBusiness?.name || ''
  )
  const [listingNameSaving, setListingNameSaving] = useState(false)

  // Sync listing name when business changes
  useEffect(() => {
    if (supplierData?.data?.name) {
      setListingName(supplierData.data.name)
    } else if (currentBusiness?.name) {
      setListingName(currentBusiness.name)
    }
  }, [supplierData?.data?.name, currentBusiness?.name])

  // Listing name handlers
  const handleListingNameChange = (value) => {
    if (value.length <= MAX_NAME_LENGTH) {
      setListingName(value)
      checkChanges('listingName', value)
    }
  }

  // Save listing name
  const handleListingNameSave = async () => {
    if (!supplier?.id || !listingName.trim()) return

    setListingNameSaving(true)
    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('suppliers')
        .select('data')
        .eq('id', supplier.id)
        .single()

      if (fetchError) throw fetchError

      const updatedData = {
        ...(currentData?.data || {}),
        name: listingName.trim()
      }

      const { error } = await supabase
        .from('suppliers')
        .update({
          business_name: listingName.trim(),
          data: updatedData
        })
        .eq('id', supplier.id)

      if (error) throw error

      // Update local state immediately for instant feedback
      if (setSupplierData) {
        setSupplierData(prev => ({
          ...prev,
          name: listingName.trim(),
          data: {
            ...prev.data,
            name: listingName.trim()
          }
        }))
      }

      // Trigger refresh of business context
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('business-name-updated', { detail: { name: listingName.trim() } }))
      }

      // Reset the change tracking so save button hides
      checkChanges('listingName', listingName.trim())
    } catch (err) {
      console.error('Failed to save listing name:', err)
    } finally {
      setListingNameSaving(false)
    }
  }

  // Ref for the editable div and tracking internal state
  const listingNameRef = useRef(null)
  const isInternalUpdate = useRef(false)

  // Sync ref content when listingName changes externally (e.g., on load)
  useEffect(() => {
    if (listingNameRef.current && !isInternalUpdate.current) {
      if (listingNameRef.current.textContent !== listingName) {
        listingNameRef.current.textContent = listingName
      }
    }
    isInternalUpdate.current = false
  }, [listingName])
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    aboutUs: true, // Start expanded
    venueAddress: false,
    venueType: false,
    pricing: false,
    addons: false,
    allowedItems: false,
    restrictions: false,
    facilities: false,
    policies: false,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
    // Update parent when section is toggled
    if (onSectionChange) {
      onSectionChange(section)
    }
  }

  // Map selectedSection prop to internal section names
  const sectionMap = {
    'listingName': 'listingName',
    'photos': 'photos',
    'about': 'aboutUs',
    'address': 'venueAddress',
    'type': 'venueType',
    'capacity': 'capacity',
    'pricing': 'pricing',
    'packages': 'packages',
    'addons': 'addons',
    'restricted': 'allowedItems',
    'rules': 'restrictions',
    'facilities': 'facilities',
    'verification': 'verification',
  }

  // Auto-expand selected section from sidebar
  useEffect(() => {
    if (selectedSection && sectionMap[selectedSection]) {
      const internalSection = sectionMap[selectedSection]
      setExpandedSections((prev) => {
        // Collapse all, expand only selected
        const newState = Object.keys(prev).reduce((acc, key) => {
          acc[key] = key === internalSection
          return acc
        }, {})
        return newState
      })
      // Scroll to section after a brief delay
      setTimeout(() => {
        const element = document.getElementById(`section-${internalSection}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [selectedSection])

  // Helper to get summary text for collapsed sections
  const getSectionSummary = (section) => {
    switch (section) {
      case 'aboutUs':
        const wordCount = details.aboutUs?.trim().split(/\s+/).filter(w => w).length || 0
        return wordCount > 0 ? `${wordCount} words written` : 'Not started'
      case 'venueAddress':
        const hasAddress = details.venueAddress?.addressLine1 && details.venueAddress?.postcode
        return hasAddress ? '✓ Address complete' : 'Address needed'
      case 'venueType':
        const hasType = details.venueType
        const hasCapacity = details.capacity?.max > 0
        return hasType && hasCapacity ? `${details.venueType}, max ${details.capacity.max}` : 'Needs setup'
      case 'pricing':
        const hasRate = details.pricing?.hourlyRate > 0
        return hasRate ? `£${details.pricing.hourlyRate}/hour` : 'Set your rates'
      case 'addons':
        const addonCount = details.addOnServices?.length || 0
        return addonCount > 0 ? `${addonCount} add-on${addonCount !== 1 ? 's' : ''} configured` : 'None added'
      case 'allowedItems':
        const allowedCount = details.allowedItems?.length || 0
        const restrictedCount = details.restrictedItems?.length || 0
        return `${allowedCount} allowed, ${restrictedCount} restricted`
      case 'restrictions':
        const rulesCount = details.houseRules?.length || 0
        return rulesCount > 0 ? `${rulesCount} rule${rulesCount !== 1 ? 's' : ''} set` : 'No rules set'
      case 'facilities':
        const facilityCount = details.facilities?.length || 0
        return facilityCount > 0 ? `${facilityCount} facilit${facilityCount !== 1 ? 'ies' : 'y'} listed` : 'None selected'
      case 'policies':
        return details.policies?.endTime ? `End time: ${details.policies.endTime}` : 'Set policies'
      default:
        return ''
    }
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
      minimumBookingHours: 4, // Updated default to 4 based on research
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

  // Add-on modal state
  const [showAddOnModal, setShowAddOnModal] = useState(false)
  const [editingAddOn, setEditingAddOn] = useState(null)
  const [newAddOn, setNewAddOn] = useState({ name: '', price: 0, description: '' })

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
        minimumBookingHours: 4,
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
        minimumBookingHours: 4,
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

  const handleFieldChange = (field, value) => {
    const newDetails = { ...details, [field]: value }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // Add change detection based on field
    if (field === 'aboutUs') {
      checkChanges('aboutUs', value);
    } else if (field === 'venueType') {
      const basicInfoData = {
        venueType: value,
        capacity: details.capacity,
        minimumBookingHours: details.availability?.minimumBookingHours,
      };
      checkChanges('venueBasicInfo', basicInfoData);
    } else if (field === 'bookingTerms') {
      const policiesData = {
        policies: details.policies,
        bookingTerms: value,
      };
      checkChanges('venuePolicies', policiesData);
    }
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
    
    // Enhanced change detection for nested fields
    if (parentField === 'venueAddress') {
      checkChanges('venueAddress', newDetails.venueAddress);
    } else if (parentField === 'venueDetails') {
      // ADD THIS - handle venueDetails changes (parking, access instructions, etc.)
      checkChanges('venueDetails', newDetails.venueDetails);
    } else if (parentField === 'pricing') {
      checkChanges('venuePricing', newDetails.pricing);
    } else if (parentField === 'capacity') {
      const basicInfoData = {
        venueType: details.venueType,
        capacity: newDetails.capacity,
        minimumBookingHours: details.availability?.minimumBookingHours,
      };
      checkChanges('venueBasicInfo', basicInfoData);
    } else if (parentField === 'equipment') {
      const facilitiesData = {
        facilities: details.facilities,
        equipment: newDetails.equipment,
      };
      checkChanges('venueFacilities', facilitiesData);
    } else if (parentField === 'policies') {
      const policiesData = {
        policies: newDetails.policies,
        bookingTerms: details.bookingTerms,
      };
      checkChanges('venuePolicies', policiesData);
    }
  }
    // 6. Create save handlers for each section:
    const handleAboutUsSave = () => {
      saveSection('aboutUs', details.aboutUs, {
        serviceDetails: {
          ...supplierData.serviceDetails,
          aboutUs: details.aboutUs
        }
      });
    };

    
  const handleVenueAddressSave = () => {
    saveSection('venueAddress', details.venueAddress, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        venueAddress: details.venueAddress
      }
    });
  };

  const handleVenueBasicInfoSave = () => {
    const basicInfoData = {
      venueType: details.venueType,
      capacity: details.capacity,
      availability: {
        ...details.availability,
        minimumBookingHours: details.availability?.minimumBookingHours
      }
    };
    
    saveSection('venueBasicInfo', basicInfoData, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ...basicInfoData
      }
    });
  };

  const handleVenuePricingSave = () => {
    saveSection('venuePricing', details.pricing, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        pricing: details.pricing
      }
    });
  };

  const handleVenueAddOnsSave = () => {
    saveSection('venueAddOns', details.addOnServices, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        addOnServices: details.addOnServices
      }
    });
  };
  const handleVenueItemsPolicySave = () => {
    const itemsPolicyData = {
      allowedItems: details.allowedItems,
      restrictedItems: details.restrictedItems,
    };
    
    saveSection('venueItemsPolicy', itemsPolicyData, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ...itemsPolicyData
      }
    });
  };

  const handleVenueHouseRulesSave = () => {
    saveSection('venueHouseRules', details.houseRules, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        houseRules: details.houseRules
      }
    });
  };

  const handleVenueFacilitiesSave = () => {
    const facilitiesData = {
      facilities: details.facilities,
      equipment: details.equipment,
    };
    
    saveSection('venueFacilities', facilitiesData, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ...facilitiesData
      }
    });
  };

  const handleVenuePoliciesSave = () => {
    const policiesData = {
      policies: details.policies,
      bookingTerms: details.bookingTerms,
    };
    
    saveSection('venuePolicies', policiesData, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ...policiesData
      }
    });
  };

  // Add this new save handler for venue details
const handleVenueDetailsSave = () => {
  saveSection('venueDetails', details.venueDetails, {
    serviceDetails: {
      ...supplierData.serviceDetails,
      venueDetails: details.venueDetails
    }
  });
};

  const aboutUsState = getSectionState('aboutUs');
  const venueAddressState = getSectionState('venueAddress');
  const venueBasicInfoState = getSectionState('venueBasicInfo');
  const venuePricingState = getSectionState('venuePricing');
  const venueAddOnsState = getSectionState('venueAddOns');
  const venueItemsPolicyState = getSectionState('venueItemsPolicy');
  const venueHouseRulesState = getSectionState('venueHouseRules');
  const venueFacilitiesState = getSectionState('venueFacilities');
  const venuePoliciesState = getSectionState('venuePolicies');
  const venueDetailsState = getSectionState('venueDetails');

  // 8. Update array toggle handlers:
  const handleArrayToggle = (array, item, field) => {
    const newArray = array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
    const newDetails = { ...details, [field]: newArray }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // Add change detection for array fields
    if (field === 'facilities') {
      const facilitiesData = {
        facilities: newArray,
        equipment: details.equipment,
      };
      checkChanges('venueFacilities', facilitiesData);
    } else if (field === 'houseRules') {
      checkChanges('venueHouseRules', newArray);
    } else if (field === 'allowedItems') {
      const itemsPolicyData = {
        allowedItems: newArray,
        restrictedItems: details.restrictedItems,
      };
      checkChanges('venueItemsPolicy', itemsPolicyData);
    } else if (field === 'restrictedItems') {
      const itemsPolicyData = {
        allowedItems: details.allowedItems,
        restrictedItems: newArray,
      };
      checkChanges('venueItemsPolicy', itemsPolicyData);
    }
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
    
    // ADD THIS LINE - notify section manager of changes
    checkChanges('venueAddOns', newDetails.addOnServices);
    
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

  const handleAddOnServicesSave = () => {
    console.log('Saving add-ons:', details.addOnServices);
    saveSection('addOnServices', details.addOnServices, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        addOnServices: details.addOnServices
      }
    });
  };

  const handleDeleteAddon = (addonId) => {
    if (confirm("Are you sure you want to delete this add-on?")) {
      const newDetails = {
        ...details,
        addOnServices: details.addOnServices.filter((addon) => addon.id !== addonId),
      }
      setDetails(newDetails)
      onUpdate(newDetails)
      
      // ADD THIS LINE - notify section manager of changes
      checkChanges('venueAddOns', newDetails.addOnServices);
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
    
    // ADD THIS LINE - notify section manager of changes
    checkChanges('venueAddOns', newDetails.addOnServices);
  }

  // Modal-based add-on handlers
  const handleAddAddOn = () => {
    if (!newAddOn.name) return
    const addOn = {
      id: `addon-${Date.now()}`,
      ...newAddOn
    }
    const newDetails = {
      ...details,
      addOnServices: [...(details.addOnServices || []), addOn],
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    checkChanges('venueAddOns', newDetails.addOnServices)
  }

  const handleUpdateAddOn = (index, updatedAddOn) => {
    const newAddOns = [...details.addOnServices]
    newAddOns[index] = { ...newAddOns[index], ...updatedAddOn }
    const newDetails = {
      ...details,
      addOnServices: newAddOns,
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    checkChanges('venueAddOns', newDetails.addOnServices)
  }

  const handleDeleteAddOn = (index) => {
    const newDetails = {
      ...details,
      addOnServices: details.addOnServices.filter((_, i) => i !== index),
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    checkChanges('venueAddOns', newDetails.addOnServices)
  }

  const handleAddRestriction = (item) => {
    if (details.restrictedItems.includes(item)) return

    const newDetails = {
      ...details,
      restrictedItems: [...details.restrictedItems, item],
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // ADD THIS LINE
    const itemsPolicyData = {
      allowedItems: details.allowedItems,
      restrictedItems: newDetails.restrictedItems,
    };
    checkChanges('venueItemsPolicy', itemsPolicyData);
  }
  

  const handleRemoveRestriction = (item) => {
    const newDetails = {
      ...details,
      restrictedItems: details.restrictedItems.filter(i => i !== item),
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // ADD THIS LINE
    const itemsPolicyData = {
      allowedItems: details.allowedItems,
      restrictedItems: newDetails.restrictedItems,
    };
    checkChanges('venueItemsPolicy', itemsPolicyData);
  }

  const handleAddCustomRestriction = () => {
    if (!customRestriction.trim()) return
    
    handleAddRestriction(customRestriction.trim())
    setCustomRestriction("")
    setIsAddingRestriction(false)
  }

  const handleAddAllowedItem = (item) => {
    if (details.allowedItems.includes(item)) return
    
    const newDetails = {
      ...details,
      allowedItems: [...details.allowedItems, item],
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // ADD THIS LINE
    const itemsPolicyData = {
      allowedItems: newDetails.allowedItems,
      restrictedItems: details.restrictedItems,
    };
    checkChanges('venueItemsPolicy', itemsPolicyData);
  }

  const handleRemoveAllowedItem = (item) => {
    const newDetails = {
      ...details,
      allowedItems: details.allowedItems.filter(i => i !== item),
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // ADD THIS LINE
    const itemsPolicyData = {
      allowedItems: newDetails.allowedItems,
      restrictedItems: details.restrictedItems,
    };
    checkChanges('venueItemsPolicy', itemsPolicyData);
  }
  

  const handleAddCustomAllowedItem = () => {
    if (!customAllowedItem.trim()) return
    
    handleAddAllowedItem(customAllowedItem.trim())
    setCustomAllowedItem("")
    setIsAddingAllowedItem(false)
  }

  const handleAddRule = (rule) => {
    if (details.houseRules.includes(rule)) return
    
    const newDetails = {
      ...details,
      houseRules: [...details.houseRules, rule],
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // ADD THIS LINE
    checkChanges('venueHouseRules', newDetails.houseRules);
  }

  const handleRemoveRule = (rule) => {
    const newDetails = {
      ...details,
      houseRules: details.houseRules.filter(r => r !== rule),
    }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // ADD THIS LINE
    checkChanges('venueHouseRules', newDetails.houseRules);
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

  // Section titles mapping
  const sectionTitles = {
    listingName: 'Listing name',
    photos: 'Photos',
    aboutUs: 'About your venue',
    venueAddress: 'Location',
    venueType: 'Venue type',
    capacity: 'Capacity',
    pricing: 'Pricing',
    packages: 'Packages',
    addons: 'Add-on services',
    allowedItems: 'Items not permitted',
    restrictions: 'House rules',
    facilities: 'Facilities & equipment',
    verification: 'Verification',
  }

  // Get the current internal section name
  const currentInternalSection = sectionMap[selectedSection] || 'aboutUs'

  // Render content for each section
  const renderSectionContent = () => {
    switch (currentInternalSection) {
      case 'listingName':
        return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            {/* Character count */}
            <p className="text-gray-500 text-base mb-4">
              <span className="font-medium text-gray-900">{listingName.length}</span>/{MAX_NAME_LENGTH} available
            </p>

            {/* Big editable title - using contentEditable for large text like Airbnb */}
            <div
              ref={listingNameRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const text = e.currentTarget.textContent || ''
                isInternalUpdate.current = true
                if (text.length <= MAX_NAME_LENGTH) {
                  setListingName(text)
                  checkChanges('listingName', text)
                } else {
                  const truncated = text.slice(0, MAX_NAME_LENGTH)
                  const sel = window.getSelection()
                  const cursorPos = Math.min(sel?.anchorOffset || 0, MAX_NAME_LENGTH)
                  e.currentTarget.textContent = truncated
                  setListingName(truncated)
                  checkChanges('listingName', truncated)
                  if (e.currentTarget.firstChild) {
                    const range = document.createRange()
                    range.setStart(e.currentTarget.firstChild, cursorPos)
                    range.collapse(true)
                    sel?.removeAllRanges()
                    sel?.addRange(range)
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              style={{
                fontSize: 'clamp(2rem, 10vw, 4.5rem)',
                lineHeight: 1.1,
                minHeight: '80px'
              }}
              className="font-semibold text-center text-gray-900 border-none outline-none bg-transparent w-full max-w-3xl focus:ring-0"
            />

            {/* Tip icon and save */}
            <div className="mt-16 flex flex-col items-center gap-6">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center">
                <Zap className="w-7 h-7 text-orange-400" />
              </div>

              {listingName !== (supplierData?.data?.name || currentBusiness?.name || '') && listingName.trim() && (
                <button
                  onClick={handleListingNameSave}
                  disabled={listingNameSaving}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl flex items-center gap-2"
                >
                  {listingNameSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save name
                </button>
              )}
            </div>
          </div>
        )

      case 'aboutUs':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="aboutUs" className="text-sm font-medium text-gray-700 block">
                Venue Description *
              </label>
              <p className="text-sm text-gray-500">
                Describe your venue, its atmosphere, what makes it perfect for children's parties, and why families love choosing it for their special celebrations.
              </p>
              <div className="relative">
                <textarea
                  id="aboutUs"
                  name="aboutUs"
                  value={details.aboutUs || ""}
                  onChange={(e) => {
                    handleFieldChange("aboutUs", e.target.value)
                    checkChanges('aboutVenue', { aboutUs: e.target.value }, { aboutUs: supplierData?.description || '' })
                  }}
                  placeholder="Describe your venue, its atmosphere, what makes it perfect for children's parties..."
                  rows={8}
                  maxLength={3000}
                  className="w-full bg-white border border-gray-300 rounded-xl text-base p-4 resize-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {(details.aboutUs || "").split(/\s+/).filter((w) => w).length}/60 words
                </div>
              </div>
            </div>
            <SectionSave
              sectionName="About Your Venue"
              hasChanges={aboutUsState.hasChanges}
              onSave={handleAboutUsSave}
              saving={aboutUsState.saving}
              lastSaved={aboutUsState.lastSaved}
              error={aboutUsState.error}
            />
          </div>
        )

      case 'venueAddress':
        const fullAddress = [
          details.venueAddress?.addressLine1,
          details.venueAddress?.city,
          details.venueAddress?.postcode,
          'UK'
        ].filter(Boolean).join(', ')
        const encodedAddress = encodeURIComponent(fullAddress)
        const hasAddress = details.venueAddress?.postcode || details.venueAddress?.addressLine1

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block">Business Name</label>
                <input
                  type="text"
                  value={details.venueAddress?.businessName || ""}
                  onChange={(e) => handleNestedFieldChange("venueAddress", "businessName", e.target.value)}
                  className="w-full h-12 bg-white border border-gray-300 rounded-xl text-base px-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none"
                  placeholder="Your venue's name"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block">Street Address *</label>
                <input
                  type="text"
                  value={details.venueAddress?.addressLine1 || ""}
                  onChange={(e) => handleNestedFieldChange("venueAddress", "addressLine1", e.target.value)}
                  className="w-full h-12 bg-white border border-gray-300 rounded-xl text-base px-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">City *</label>
                <input
                  type="text"
                  value={details.venueAddress?.city || ""}
                  onChange={(e) => handleNestedFieldChange("venueAddress", "city", e.target.value)}
                  className="w-full h-12 bg-white border border-gray-300 rounded-xl text-base px-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none"
                  placeholder="London"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Postcode *</label>
                <input
                  type="text"
                  value={details.venueAddress?.postcode || ""}
                  onChange={(e) => handleNestedFieldChange("venueAddress", "postcode", e.target.value)}
                  className="w-full h-12 bg-white border border-gray-300 rounded-xl text-base px-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none"
                  placeholder="SW1A 1AA"
                />
              </div>
            </div>

            {/* Map Preview */}
            <div className="pt-4">
              <label className="text-sm font-medium text-gray-700 block mb-3">Location Preview</label>
              {hasAddress ? (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`}
                  />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 h-[200px] flex flex-col items-center justify-center">
                  <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Enter an address to see location preview</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                This map helps customers find your venue. Make sure your address is accurate.
              </p>
            </div>

            <SectionSave
              sectionName="Venue Address"
              hasChanges={venueAddressState.hasChanges}
              onSave={handleVenueAddressSave}
              saving={venueAddressState.saving}
              lastSaved={venueAddressState.lastSaved}
              error={venueAddressState.error}
            />
          </div>
        )

      case 'venueType':
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className="text-2xl font-medium text-gray-700 mb-8">What type of venue is this?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
              {venueTypes.map((type) => (
                <div
                  key={type}
                  onClick={() => handleFieldChange("venueType", type)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    details.venueType === type
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium">{type}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <SectionSave
                sectionName="Venue Type"
                hasChanges={venueBasicInfoState.hasChanges}
                onSave={handleVenueBasicInfoSave}
                saving={venueBasicInfoState.saving}
                lastSaved={venueBasicInfoState.lastSaved}
                error={venueBasicInfoState.error}
              />
            </div>
          </div>
        )

      case 'capacity':
        return (
          <div className="py-8 max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-medium text-gray-700">How many guests can you accommodate?</h2>
              <p className="text-gray-500 mt-2">Help families find the right size space for their party</p>
            </div>

            <div className="space-y-8">
              {/* Seated Capacity */}
              <div className="flex items-center justify-between py-6 border-b border-gray-200">
                <div>
                  <div className="text-lg font-medium text-gray-900">Seated Capacity</div>
                  <div className="text-sm text-gray-600">Maximum guests when seated</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleNestedFieldChange("capacity", "seated", Math.max(1, (details.capacity?.seated || 30) - 5))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={(details.capacity?.seated || 30) <= 5}
                  >
                    <span className="text-xl text-gray-600">−</span>
                  </button>
                  <div className="w-16 text-center text-xl font-medium">{details.capacity?.seated || 30}</div>
                  <button
                    onClick={() => handleNestedFieldChange("capacity", "seated", (details.capacity?.seated || 30) + 5)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                  >
                    <span className="text-xl text-gray-600">+</span>
                  </button>
                </div>
              </div>

              {/* Standing Capacity */}
              <div className="flex items-center justify-between py-6 border-b border-gray-200">
                <div>
                  <div className="text-lg font-medium text-gray-900">Standing Capacity</div>
                  <div className="text-sm text-gray-600">Maximum guests when standing</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleNestedFieldChange("capacity", "standing", Math.max(1, (details.capacity?.standing || 60) - 10))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={(details.capacity?.standing || 60) <= 10}
                  >
                    <span className="text-xl text-gray-600">−</span>
                  </button>
                  <div className="w-16 text-center text-xl font-medium">{details.capacity?.standing || 60}</div>
                  <button
                    onClick={() => handleNestedFieldChange("capacity", "standing", (details.capacity?.standing || 60) + 10)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                  >
                    <span className="text-xl text-gray-600">+</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <SectionSave
                sectionName="Capacity"
                hasChanges={venueBasicInfoState.hasChanges}
                onSave={handleVenueBasicInfoSave}
                saving={venueBasicInfoState.saving}
                lastSaved={venueBasicInfoState.lastSaved}
                error={venueBasicInfoState.error}
              />
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-12">
            {/* Hourly Rate - Big incrementor style */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-8">What's your hourly rate?</h2>

              <div className="flex items-center justify-center gap-6 mb-4">
                <button
                  onClick={() => handleNestedFieldChange("pricing", "hourlyRate", Math.max(0, (details.pricing?.hourlyRate || 0) - 5))}
                  className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-2xl text-gray-600">−</span>
                </button>
                <div className="flex items-baseline">
                  <span className="text-4xl font-medium text-gray-400 mr-1">£</span>
                  <span className="text-7xl font-semibold text-gray-900 w-32 text-center">
                    {details.pricing?.hourlyRate || 0}
                  </span>
                </div>
                <button
                  onClick={() => handleNestedFieldChange("pricing", "hourlyRate", (details.pricing?.hourlyRate || 0) + 5)}
                  className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-2xl text-gray-600">+</span>
                </button>
              </div>
              <p className="text-sm text-gray-500">per hour</p>
            </div>

            {/* Minimum Booking Hours */}
            <div className="flex flex-col items-center justify-center text-center pt-8 border-t border-gray-200">
              <div className="mb-4">
                <Clock className="w-10 h-10 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-6">Minimum booking duration</h3>

              <div className="flex items-center justify-center gap-6 mb-2">
                <button
                  onClick={() => handleNestedFieldChange("pricing", "minimumBookingHours", Math.max(1, (details.pricing?.minimumBookingHours || 2) - 1))}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-xl text-gray-600">−</span>
                </button>
                <span className="text-5xl font-semibold text-gray-900 w-20 text-center">
                  {details.pricing?.minimumBookingHours || 2}
                </span>
                <button
                  onClick={() => handleNestedFieldChange("pricing", "minimumBookingHours", (details.pricing?.minimumBookingHours || 2) + 1)}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-xl text-gray-600">+</span>
                </button>
              </div>
              <p className="text-sm text-gray-500">hours minimum</p>
            </div>

            {/* Security Deposit */}
            <div className="flex flex-col items-center justify-center text-center pt-8 border-t border-gray-200">
              <div className="mb-4">
                <Shield className="w-10 h-10 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-6">Security deposit</h3>

              <div className="flex items-center justify-center gap-6 mb-2">
                <button
                  onClick={() => handleNestedFieldChange("pricing", "securityDeposit", Math.max(0, (details.pricing?.securityDeposit || 0) - 25))}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-xl text-gray-600">−</span>
                </button>
                <div className="flex items-baseline">
                  <span className="text-3xl font-medium text-gray-400 mr-1">£</span>
                  <span className="text-5xl font-semibold text-gray-900 w-28 text-center">
                    {details.pricing?.securityDeposit || 0}
                  </span>
                </div>
                <button
                  onClick={() => handleNestedFieldChange("pricing", "securityDeposit", (details.pricing?.securityDeposit || 0) + 25)}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <span className="text-xl text-gray-600">+</span>
                </button>
              </div>
              <p className="text-sm text-gray-500">refundable deposit</p>
            </div>

            <div className="pt-8">
              <SectionSave
                sectionName="Pricing"
                hasChanges={venuePricingState.hasChanges}
                onSave={handleVenuePricingSave}
                saving={venuePricingState.saving}
                lastSaved={venuePricingState.lastSaved}
                error={venuePricingState.error}
              />
            </div>
          </div>
        )

      case 'allowedItems':
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Select items that are not allowed at your venue</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonRestrictedItems.map((item) => (
                <div
                  key={item}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    details.restrictedItems?.includes(item)
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => details.restrictedItems?.includes(item) ? handleRemoveRestriction(item) : handleAddRestriction(item)}
                >
                  <span className="text-sm font-medium">{item}</span>
                  {details.restrictedItems?.includes(item) && (
                    <Ban className="w-4 h-4 text-red-600" />
                  )}
                </div>
              ))}
            </div>

            {/* Custom restricted item input */}
            <div className="flex gap-2 pt-4">
              <input
                type="text"
                value={customRestriction}
                onChange={(e) => setCustomRestriction(e.target.value)}
                placeholder="Add custom restriction..."
                className="flex-1 h-12 px-4 border border-gray-300 rounded-xl text-sm focus:border-gray-900 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomRestriction()}
              />
              <button
                onClick={handleAddCustomRestriction}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Current restrictions */}
            {details.restrictedItems?.length > 0 && (
              <div className="pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Currently Restricted:</h5>
                <div className="flex flex-wrap gap-2">
                  {details.restrictedItems.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveRestriction(item)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <SectionSave
              sectionName="Restricted Items"
              hasChanges={venueItemsPolicyState.hasChanges}
              onSave={handleVenueItemsPolicySave}
              saving={venueItemsPolicyState.saving}
              lastSaved={venueItemsPolicyState.lastSaved}
              error={venueItemsPolicyState.error}
            />
          </div>
        )

      case 'restrictions':
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Set important venue guidelines for all bookings</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customRule}
                onChange={(e) => setCustomRule(e.target.value)}
                placeholder="Add a house rule (e.g., No shoes on the dance floor)"
                className="flex-1 h-12 px-4 border border-gray-300 rounded-xl text-sm focus:border-gray-900 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomRule()}
              />
              <button
                onClick={handleAddCustomRule}
                className="h-12 px-6 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Add Rule
              </button>
            </div>

            {/* Current rules */}
            {details.houseRules?.length > 0 && (
              <div className="space-y-2">
                {details.houseRules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm">{rule}</span>
                    <button
                      onClick={() => handleRemoveRule(rule)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <SectionSave
              sectionName="House Rules"
              hasChanges={venueHouseRulesState.hasChanges}
              onSave={handleVenueHouseRulesSave}
              saving={venueHouseRulesState.saving}
              lastSaved={venueHouseRulesState.lastSaved}
              error={venueHouseRulesState.error}
            />
          </div>
        )

      case 'facilities':
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Select facilities available at your venue</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {facilityOptions.map((facility) => (
                <div
                  key={facility}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    details.facilities?.includes(facility)
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => handleArrayToggle(details.facilities, facility, "facilities")}
                >
                  <span className="text-sm font-medium">{facility}</span>
                  {details.facilities?.includes(facility) && (
                    <CheckCircle className="w-4 h-4 text-gray-900" />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Equipment</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Tables</label>
                  <input
                    type="number"
                    min="0"
                    value={details.equipment?.tables || ""}
                    onChange={(e) => handleNestedFieldChange("equipment", "tables", parseInt(e.target.value))}
                    className="w-full h-12 bg-white border border-gray-300 rounded-xl text-base px-4 focus:border-gray-900 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Chairs</label>
                  <input
                    type="number"
                    min="0"
                    value={details.equipment?.chairs || ""}
                    onChange={(e) => handleNestedFieldChange("equipment", "chairs", parseInt(e.target.value))}
                    className="w-full h-12 bg-white border border-gray-300 rounded-xl text-base px-4 focus:border-gray-900 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "soundSystem", label: "Sound System" },
                  { key: "projector", label: "Projector/Screen" },
                  { key: "kitchen", label: "Kitchen Access" },
                  { key: "bar", label: "Bar Facilities" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      details.equipment?.[item.key]
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => handleNestedFieldChange("equipment", item.key, !details.equipment?.[item.key])}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    {details.equipment?.[item.key] && (
                      <CheckCircle className="w-4 h-4 text-gray-900" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <SectionSave
              sectionName="Facilities"
              hasChanges={venueFacilitiesState.hasChanges}
              onSave={handleVenueFacilitiesSave}
              saving={venueFacilitiesState.saving}
              lastSaved={venueFacilitiesState.lastSaved}
              error={venueFacilitiesState.error}
            />
          </div>
        )

      case 'addons':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Add optional services that customers can book</p>
              <button
                onClick={() => setShowAddOnModal(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Service
              </button>
            </div>

            {details.addOnServices?.length > 0 ? (
              <div className="space-y-3">
                {details.addOnServices.map((addon, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">{addon.name}</h4>
                      <p className="text-sm text-gray-500">£{addon.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingAddOn({ ...addon, index })
                          setShowAddOnModal(true)
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddOn(index)}
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <Gift className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No add-on services yet</p>
              </div>
            )}
            <SectionSave
              sectionName="Add-on Services"
              hasChanges={venueAddOnsState.hasChanges}
              onSave={handleVenueAddOnsSave}
              saving={venueAddOnsState.saving}
              lastSaved={venueAddOnsState.lastSaved}
              error={venueAddOnsState.error}
            />
          </div>
        )

      default:
        return <div>Select a section from the sidebar</div>
    }
  }

  return (
    <div className="w-full">
      {/* Section Title - Airbnb style */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {sectionTitles[currentInternalSection] || 'Details'}
      </h1>

      {/* Section Content */}
      {renderSectionContent()}

      {/* Add-on Modal */}
      {showAddOnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddOn ? 'Edit Add-on Service' : 'Add New Service'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Service Name</label>
                <input
                  type="text"
                  value={editingAddOn?.name || newAddOn.name}
                  onChange={(e) => editingAddOn
                    ? setEditingAddOn({...editingAddOn, name: e.target.value})
                    : setNewAddOn({...newAddOn, name: e.target.value})
                  }
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none"
                  placeholder="e.g., Projector Hire"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Price (£)</label>
                <input
                  type="number"
                  min="0"
                  value={editingAddOn?.price || newAddOn.price}
                  onChange={(e) => editingAddOn
                    ? setEditingAddOn({...editingAddOn, price: parseFloat(e.target.value)})
                    : setNewAddOn({...newAddOn, price: parseFloat(e.target.value)})
                  }
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea
                  value={editingAddOn?.description || newAddOn.description}
                  onChange={(e) => editingAddOn
                    ? setEditingAddOn({...editingAddOn, description: e.target.value})
                    : setNewAddOn({...newAddOn, description: e.target.value})
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Brief description of the service"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddOnModal(false)
                  setEditingAddOn(null)
                  setNewAddOn({ name: '', price: 0, description: '' })
                }}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingAddOn) {
                    handleUpdateAddOn(editingAddOn.index, editingAddOn)
                  } else {
                    handleAddAddOn()
                  }
                  setShowAddOnModal(false)
                  setEditingAddOn(null)
                  setNewAddOn({ name: '', price: 0, description: '' })
                }}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
              >
                {editingAddOn ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenueServiceDetails
