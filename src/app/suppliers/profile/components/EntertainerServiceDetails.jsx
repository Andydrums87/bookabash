"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import {
  Users,
  MapPin,
  Clock,
  User,
  PlusCircle,
  Edit3,
  Trash2,
  Gift,
  Star,
  X,
  Settings,
  Info,
  Loader2,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  UserPlus,
  CheckCircle,
  Search,
  Minus,
  Plus
} from "lucide-react"
import { LoadScript, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api"
import EnhancedThemesSection from "../../dashboard/EnchancedThemesSection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SectionSave, useSectionSave } from '@/components/ui/SectionSave';
import { useSectionManager } from '../../hooks/useSectionManager';

// Section mapping for sidebar navigation
const sectionMap = {
  'listingName': 'listingName',
  'about': 'aboutUs',
  'basicInfo': 'basicInfo',
  'pricing': 'pricing',
  'ageGroups': 'ageGroups',
  'performanceStyles': 'performanceStyles',
  'themes': 'themes',
  'equipment': 'equipment',
  'personalBio': 'personalBio',
  'addOns': 'addOns',
}

const sectionTitles = {
  'listingName': 'Listing Name',
  'about': 'About Your Service',
  'basicInfo': 'Travel & Location',
  'pricing': 'Pricing',
  'ageGroups': 'Age Groups',
  'performanceStyles': 'Performance Styles',
  'themes': 'Themes',
  'equipment': 'Equipment & Skills',
  'personalBio': 'Meet the Entertainer',
  'addOns': 'Add-on Services',
}

// Business-Aware Entertainer Service Details Form
const EntertainerServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness, updateProfile, supplier, setSupplierData, selectedSection, onSectionChange }) => {
  // Use data passed from parent instead of calling useSupplier again
  const [loading, setLoading] = useState(false)
  const [businessName, setBusinessName] = useState(currentBusiness?.name || '')
  const [expandedSections, setExpandedSections] = useState({
    aboutUs: true, // Start expanded
    basicInfo: false,
    ageGroups: false,
    performanceStyles: false,
    themes: false,
    equipment: false,
    personalBio: false,
    addOns: false,
  })
  const [details, setDetails] = useState({
    performerType: "",
    ageGroups: [],
    performanceStyle: [],
    equipment: "",
    travelRadius: 20,
    setupTime: 30,
    themes: [],
    specialSkills: "",
    groupSizeMin: 1,
    groupSizeMax: 30,
    additionalEntertainerPrice: 150,
    personalBio: {
      yearsExperience: "",
      inspiration: "",
      favoriteEvent: "",
      dreamClient: "",
      personalStory: "",
    },
    addOnServices: [],
    performanceSpecs: {
      spaceRequired: "",
      powerRequired: false,
      maxGroupSize: 30,
      supervisionRequired: true,
    },
    serviceArea: {
      baseLocation: "",
      postcode: "",
      travelRadius: 10,
      travelFee: 0,
    },
    hourlyRate: 0,
    ...serviceDetails,
  })

  // Replace all your individual section state with this one hook
  const { getSectionState, checkChanges, saveSection } = useSectionManager(
    supplierData,
    updateProfile,
    supplier
  );

  // Sync business name when currentBusiness changes
  useEffect(() => {
    if (currentBusiness?.name) {
      setBusinessName(currentBusiness.name)
    }
  }, [currentBusiness?.name])

  // Handler for business name changes - triggers aboutUs section dirty state
  const handleBusinessNameChange = (value) => {
    setBusinessName(value)
    // Mark aboutUs as having changes when business name changes
    checkChanges('aboutUs', { aboutUs: details.aboutUs, businessName: value })
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Helper to get summary text for collapsed sections
  const getSectionSummary = (section) => {
    switch (section) {
      case 'aboutUs':
        const wordCount = details.aboutUs?.trim().split(/\s+/).filter(w => w).length || 0
        return wordCount > 0 ? `${wordCount} words written` : 'Not started'
      case 'basicInfo':
        const hasRadius = details.travelRadius > 0
        const hasHourRate = details.extraHourRate > 0
        return hasRadius && hasHourRate ? '✓ Complete' : 'Needs attention'
      case 'ageGroups':
        const ageCount = details.ageGroups?.length || 0
        return ageCount > 0 ? `${ageCount} age group${ageCount !== 1 ? 's' : ''} selected` : 'None selected'
      case 'performanceStyles':
        const styleCount = details.performanceStyle?.length || 0
        return styleCount > 0 ? `${styleCount} style${styleCount !== 1 ? 's' : ''} selected` : 'None selected'
      case 'themes':
        const themeCount = details.themes?.length || 0
        return themeCount > 0 ? `${themeCount} theme${themeCount !== 1 ? 's' : ''} selected` : 'None selected'
      case 'equipment':
        const hasEquip = details.equipment?.trim().length > 0
        const hasSkills = details.specialSkills?.trim().length > 0
        if (hasEquip && hasSkills) return '✓ Complete'
        if (hasEquip || hasSkills) return 'Partially complete'
        return 'Not started'
      case 'personalBio':
        const bioFields = ['yearsExperience', 'inspiration', 'favoriteEvent', 'dreamClient', 'personalStory']
        const filledBio = bioFields.filter(f => details.personalBio?.[f]?.toString().trim()).length
        return `${filledBio} of ${bioFields.length} fields complete`
      case 'addOns':
        const addonCount = details.addOnServices?.length || 0
        return addonCount > 0 ? `${addonCount} add-on${addonCount !== 1 ? 's' : ''} configured` : 'None added'
      default:
        return ''
    }
  }

  // Update form when business data changes from parent
  useEffect(() => {
    if (supplierData) {
      console.log("🔄 EntertainerServiceDetails updating with business data:", supplierData.name)

      const businessServiceDetails = supplierData.serviceDetails || {}

      setDetails({
        performerType: "",
        ageGroups: [],
        performanceStyle: [],
        equipment: "",
        travelRadius: 20,
        setupTime: 30,
        themes: [],
        specialSkills: "",
        groupSizeMin: 1,
        groupSizeMax: 30,
        additionalEntertainerPrice: 150,
        personalBio: {
          yearsExperience: "",
          inspiration: "",
          favoriteEvent: "",
          dreamClient: "",
          personalStory: "",
        },
        addOnServices: [],
        performanceSpecs: {
          spaceRequired: "",
          powerRequired: false,
          maxGroupSize: 30,
          supervisionRequired: true,
        },
        // Override with actual business data
        ...businessServiceDetails,
        // Ensure nested objects are properly merged
        personalBio: {
          yearsExperience: "",
          inspiration: "",
          favoriteEvent: "",
          dreamClient: "",
          personalStory: "",
          ...businessServiceDetails.personalBio,
        },
        performanceSpecs: {
          spaceRequired: "",
          powerRequired: false,
          maxGroupSize: 30,
          supervisionRequired: true,
          ...businessServiceDetails.performanceSpecs,
        },
        serviceArea: {
          baseLocation: "",
          postcode: "",
          travelRadius: 10,
          travelFee: 0,
          ...businessServiceDetails.serviceArea,
        },
      })
    }
  }, [supplierData])

  // Listen for business switch events
  useEffect(() => {
    const handleBusinessSwitch = () => {
      console.log("🏢 EntertainerServiceDetails detected business switch")
    }

    const handleSupplierDataChange = () => {
      console.log("📋 EntertainerServiceDetails detected data change")
    }

    window.addEventListener("businessSwitched", handleBusinessSwitch)
    window.addEventListener("supplierDataChanged", handleSupplierDataChange)

    return () => {
      window.removeEventListener("businessSwitched", handleBusinessSwitch)
      window.removeEventListener("supplierDataChanged", handleSupplierDataChange)
    }
  }, [])

  // Add-ons management state
  const [isAddingAddon, setIsAddingAddon] = useState(false)
  const [editingAddon, setEditingAddon] = useState(null)
  const [addonForm, setAddonForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "enhancement",
  })

  const performerTypes = [
    "Magician",
    "Clown",
    "Princess Character",
    "Superhero",
    "Scientist",
    "Balloon Artist",
    "Face Painter",
    "Musician",
    "Storyteller",
    "Puppeteer",
  ]
  const ageGroupOptions = ["0-2 years", "3-5 years", "6-8 years", "9-12 years", "13+ years", "All ages"]
  const performanceStyles = [
    "Interactive Show",
    "Walkabout Entertainment",
    "Workshops",
    "Games & Activities",
    "Educational",
    "Musical Performance",
  ]

  // Add-ons management data
  const addonCategories = [
    { value: "enhancement", label: "Enhancement", emoji: "✨", description: "Additional activities or services" },
    { value: "time", label: "Time Extension", emoji: "⏰", description: "Extra time for your event" },
    { value: "premium", label: "Premium Upgrade", emoji: "🌟", description: "Premium or luxury options" },
    { value: "logistics", label: "Logistics", emoji: "🚗", description: "Travel, setup, or delivery charges" },
    { value: "seasonal", label: "Seasonal", emoji: "🎄", description: "Holiday or seasonal premiums" },
  ]

  const addonTemplates = [
    {
      name: "Face Painting",
      price: 30,
      description: "Professional face painting with fun designs",
      category: "enhancement",
    },
    {
      name: "Balloon Workshop",
      price: 25,
      description: "Interactive balloon modelling session",
      category: "enhancement",
    },
    { name: "Extra 30 Minutes", price: 40, description: "Extend your party for even more fun", category: "time" },
    { name: "Weekend Premium", price: 50, description: "Premium rate for weekend bookings", category: "premium" },
    {
      name: "Travel Supplement",
      price: 15,
      description: "Additional travel charges beyond standard radius",
      category: "logistics",
    },
    { name: "Holiday Premium", price: 75, description: "Special rate for holiday bookings", category: "seasonal" },
    {
      name: "Additional Entertainer",
      price: 150,
      description: "Second entertainer for larger groups",
      category: "enhancement",
    },
    {
      name: "Professional Photos",
      price: 100,
      description: "Capture all the magical moments",
      category: "enhancement",
    },
  ]

  // Update your handleFieldChange to check for changes
  const handleFieldChange = (field, value) => {
    const newDetails = { ...details, [field]: value }
    setDetails(newDetails)
    onUpdate(newDetails)

    // Check for changes based on field
    if (field === 'aboutUs') {
      checkChanges('aboutUs', { aboutUs: value, businessName });
    } else if (['travelRadius', 'serviceArea'].includes(field)) {
      const basicInfoData = {
        travelRadius: field === 'travelRadius' ? value : details.travelRadius,
        serviceArea: field === 'serviceArea' ? value : details.serviceArea,
      };
      checkChanges('basicInfo', basicInfoData);
    } else if (['groupSizeMin', 'groupSizeMax', 'additionalEntertainerPrice', 'extraHourRate', 'hourlyRate'].includes(field)) {
      const pricingData = {
        groupSizeMin: field === 'groupSizeMin' ? value : details.groupSizeMin,
        groupSizeMax: field === 'groupSizeMax' ? value : details.groupSizeMax,
        additionalEntertainerPrice: field === 'additionalEntertainerPrice' ? value : details.additionalEntertainerPrice,
        extraHourRate: field === 'extraHourRate' ? value : details.extraHourRate,
        hourlyRate: field === 'hourlyRate' ? value : details.hourlyRate,
      };
      checkChanges('pricing', pricingData);
    } else if (field === 'equipment' || field === 'specialSkills') {
      const equipmentData = {
        equipment: field === 'equipment' ? value : details.equipment,
        specialSkills: field === 'specialSkills' ? value : details.specialSkills,
      };
      checkChanges('equipment', equipmentData);
    } else if (field === 'ageGroups') {
      checkChanges('ageGroups', value);
    } else if (field === 'performanceStyle') {
      checkChanges('performanceStyles', value);
    } else if (field === 'themes') {
      checkChanges('themes', value);
    } else if (field === 'addOnServices') {
      checkChanges('addOnServices', value);
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
    
    // Check for personal bio changes
    if (parentField === 'personalBio') {
      checkChanges('personalBio', newDetails.personalBio);
    }
  }

  const handleArrayToggle = (array, item, field) => {
    const newArray = array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
    const newDetails = { ...details, [field]: newArray }
    setDetails(newDetails)
    onUpdate(newDetails)
    
    // Check for changes
    if (field === 'ageGroups') {
      checkChanges('ageGroups', newArray);
    } else if (field === 'performanceStyle') {
      checkChanges('performanceStyles', newArray);
    } else if (field === 'themes') {
      checkChanges('themes', newArray);
    }
  }

  // Create save handlers for each section
  const handleAboutUsSave = async () => {
    // Save business name directly to suppliers table if changed
    if (businessName.trim() && businessName !== currentBusiness?.name) {
      try {
        const { error } = await supabase
          .from('suppliers')
          .update({ business_name: businessName.trim() })
          .eq('id', supplier.id)

        if (error) throw error

        // Trigger refresh of business context
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('business-name-updated', { detail: { name: businessName.trim() } }))
        }
      } catch (err) {
        console.error('Failed to save business name:', err)
      }
    }

    // Save aboutUs to serviceDetails
    saveSection('aboutUs', { aboutUs: details.aboutUs, businessName }, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        aboutUs: details.aboutUs
      }
    });
  };

  const handleBasicInfoSave = () => {
    const basicInfoData = {
      travelRadius: details.travelRadius,
      serviceArea: details.serviceArea,
    };

    saveSection('basicInfo', basicInfoData, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ...basicInfoData
      }
    });
  };

  const handlePricingSave = async () => {
    const pricingData = {
      groupSizeMin: details.groupSizeMin,
      groupSizeMax: details.groupSizeMax,
      additionalEntertainerPrice: details.additionalEntertainerPrice,
      extraHourRate: details.extraHourRate,
      hourlyRate: details.hourlyRate,
    };

    await saveSection('pricing', pricingData, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ...pricingData
      }
    });

    // Update local state for instant sidebar feedback
    if (setSupplierData) {
      setSupplierData(prev => ({
        ...prev,
        serviceDetails: {
          ...prev.serviceDetails,
          ...pricingData
        }
      }));
    }
  };

  const handleAgeGroupsSave = () => {
    saveSection('ageGroups', details.ageGroups, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ageGroups: details.ageGroups
      }
    });
  };

  const handlePerformanceStylesSave = () => {
    saveSection('performanceStyles', details.performanceStyle, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        performanceStyle: details.performanceStyle
      }
    });
  };

  const handleThemesSave = () => {
    saveSection('themes', details.themes, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        themes: details.themes
      }
    });
  };

  const handleEquipmentSave = () => {
    const equipmentData = {
      equipment: details.equipment,
      specialSkills: details.specialSkills,
    };
    
    saveSection('equipment', equipmentData, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ...equipmentData
      }
    });
  };

  const handlePersonalBioSave = () => {
    saveSection('personalBio', details.personalBio, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        personalBio: details.personalBio
      }
    });
  };

  const handleAddOnServicesSave = () => {
    saveSection('addOnServices', details.addOnServices, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        addOnServices: details.addOnServices
      }
    });
  };

  // Get section states
  const aboutUsState = getSectionState('aboutUs');
  const basicInfoState = getSectionState('basicInfo');
  const pricingState = getSectionState('pricing');
  const ageGroupsState = getSectionState('ageGroups');
  const performanceStylesState = getSectionState('performanceStyles');
  const themesState = getSectionState('themes');
  const equipmentState = getSectionState('equipment');
  const personalBioState = getSectionState('personalBio');
  const addOnServicesState = getSectionState('addOnServices');

  // Add-ons management functions
  const handleAddonFormChange = (field, value) => {
    setAddonForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetAddonForm = () => {
    setAddonForm({
      name: "",
      price: "",
      description: "",
      category: "enhancement",
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
    checkChanges('addOnServices', newDetails.addOnServices);
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
      checkChanges('addOnServices', newDetails.addOnServices);
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
    checkChanges('addOnServices', newDetails.addOnServices);
  }

  // Show loading state if no data yet
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

  // Determine which section to render based on selectedSection
  const activeSection = sectionMap[selectedSection] || selectedSection

  // Max characters for listing name
  const MAX_NAME_LENGTH = 50

  // Listing Name state and handler - reads from data.name JSONB field
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

  // Handle listing name change with character limit
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
      // Get current data first to preserve other fields
      const { data: currentData, error: fetchError } = await supabase
        .from('suppliers')
        .select('data')
        .eq('id', supplier.id)
        .single()

      if (fetchError) throw fetchError

      // Update data.name in the JSONB field
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

  // Get listing name section state
  const listingNameState = getSectionState('listingName')

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

  // Listing Name Section Content - Airbnb style
  const renderListingName = () => (
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
            // Truncate if over limit - need to fix DOM and cursor
            const truncated = text.slice(0, MAX_NAME_LENGTH)

            // Save cursor position
            const sel = window.getSelection()
            const cursorPos = Math.min(sel?.anchorOffset || 0, MAX_NAME_LENGTH)

            e.currentTarget.textContent = truncated
            setListingName(truncated)
            checkChanges('listingName', truncated)

            // Restore cursor
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
          <Button
            onClick={handleListingNameSave}
            disabled={listingNameSaving}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl"
          >
            {listingNameSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save name
          </Button>
        )}
      </div>
    </div>
  )

  // About Us Section Content
  const renderAboutUs = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">About Your Service</h2>
        <p className="text-gray-600">Tell customers about your business and what makes you special</p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="aboutUs" className="text-base font-medium text-gray-700">
          Your Business Story * <span className="text-gray-400 font-normal">(max 120 words)</span>
        </Label>
        <div className="relative">
          <Textarea
            id="aboutUs"
            value={details.aboutUs || ""}
            onChange={(e) => {
              const text = e.target.value
              const words = text.trim() === "" ? [] : text.trim().split(/\s+/).filter((word) => word.length > 0)
              if (words.length <= 120) {
                handleFieldChange("aboutUs", e.target.value)
              }
            }}
            placeholder="Tell customers about your business, your passion for entertainment, what makes you unique, and why families love choosing you for their special occasions..."
            className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none min-h-[200px]"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-2 py-1 rounded">
            {(() => {
              const text = details.aboutUs || ""
              const words = text.trim() === "" ? [] : text.trim().split(/\s+/).filter((word) => word.length > 0)
              return words.length
            })()}/120 words
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Share your story, highlight what makes you different, and mention any awards or recognition.
        </p>
      </div>

      <SectionSave
        sectionName="About Us"
        hasChanges={aboutUsState.hasChanges}
        onSave={handleAboutUsSave}
        saving={aboutUsState.saving}
        lastSaved={aboutUsState.lastSaved}
        error={aboutUsState.error}
      />
    </div>
  )

  // Radius options for visual selection
  const radiusOptions = [
    { value: 5, label: "5 miles" },
    { value: 10, label: "10 miles" },
    { value: 20, label: "20 miles" },
    { value: 30, label: "30 miles" },
    { value: 50, label: "50 miles" },
    { value: 100, label: "100+ miles" }
  ]

  // Google Maps libraries
  const libraries = ["places"]

  // State for address autocomplete
  const [autocomplete, setAutocomplete] = useState(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance)
  }

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace()

      if (!place.geometry) {
        console.log("No details available for input: '" + place.name + "'")
        return
      }

      // Extract address components
      const addressComponents = place.address_components || []
      let streetNumber = ""
      let route = ""
      let city = ""
      let postcode = ""
      let country = ""

      addressComponents.forEach((component) => {
        const types = component.types
        if (types.includes("street_number")) {
          streetNumber = component.long_name
        }
        if (types.includes("route")) {
          route = component.long_name
        }
        if (types.includes("postal_town") || types.includes("locality")) {
          city = component.long_name
        }
        if (types.includes("postal_code")) {
          postcode = component.long_name
        }
        if (types.includes("country")) {
          country = component.long_name
        }
      })

      // Combine street number and route
      const addressLine1 = `${streetNumber} ${route}`.trim()

      // Update serviceArea with parsed address
      const newServiceArea = {
        ...details.serviceArea,
        addressLine1: addressLine1,
        baseLocation: city,
        postcode: postcode,
        country: country,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        fullAddress: place.formatted_address
      }
      handleFieldChange("serviceArea", newServiceArea)
    }
  }

  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '200px',
    borderRadius: '12px'
  }

  // Basic Info Section Content - Airbnb style
  const renderBasicInfo = () => {
    const serviceArea = details.serviceArea || supplierData?.serviceDetails?.serviceArea || {}
    const baseLocation = serviceArea.baseLocation || ''
    const postcode = serviceArea.postcode || supplierData?.location || ''
    const hasCoordinates = serviceArea.latitude && serviceArea.longitude
    const mapCenter = hasCoordinates
      ? { lat: serviceArea.latitude, lng: serviceArea.longitude }
      : { lat: 51.5074, lng: -0.1278 } // Default to London

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Travel & Location</h2>
          <p className="text-gray-600">Where you're based and how far you'll travel</p>
        </div>

        {/* Your Location Card with Address Search */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-1">Your base location</h3>
          <p className="text-gray-500 text-sm mb-4">This won't be shown publicly - only your general area will be visible</p>

          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={libraries}
            onLoad={() => setMapsLoaded(true)}
          >
            {/* Address Search */}
            <div className="mb-4">
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  componentRestrictions: { country: ["gb", "ie"] },
                  fields: ["address_components", "geometry", "formatted_address", "name"],
                  types: ["address"]
                }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for your address..."
                    defaultValue={serviceArea.fullAddress || ''}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </Autocomplete>
            </div>

            {/* Map */}
            {hasCoordinates && (
              <div className="mb-4 overflow-hidden rounded-xl border border-gray-200">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={14}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                      {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                      }
                    ]
                  }}
                >
                  <Marker position={mapCenter} />
                </GoogleMap>
              </div>
            )}
          </LoadScript>

          {/* Address Fields */}
          {(serviceArea.addressLine1 || serviceArea.fullAddress) && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="addressLine1" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Street Address
                </Label>
                <Input
                  id="addressLine1"
                  value={details.serviceArea?.addressLine1 || ''}
                  onChange={(e) => {
                    const newServiceArea = { ...details.serviceArea, addressLine1: e.target.value }
                    handleFieldChange("serviceArea", newServiceArea)
                  }}
                  placeholder="123 High Street"
                  className="h-11 bg-white border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseLocation" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    City / Town
                  </Label>
                  <Input
                    id="baseLocation"
                    value={details.serviceArea?.baseLocation || baseLocation}
                    onChange={(e) => {
                      const newServiceArea = { ...details.serviceArea, baseLocation: e.target.value }
                      handleFieldChange("serviceArea", newServiceArea)
                    }}
                    placeholder="e.g., Manchester"
                    className="h-11 bg-white border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="postcode" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Postcode
                  </Label>
                  <Input
                    id="postcode"
                    value={details.serviceArea?.postcode || postcode}
                    onChange={(e) => {
                      const newServiceArea = { ...details.serviceArea, postcode: e.target.value.toUpperCase() }
                      handleFieldChange("serviceArea", newServiceArea)
                    }}
                    placeholder="M1 1AA"
                    className="h-11 bg-white border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Show hint if no address yet */}
          {!serviceArea.addressLine1 && !serviceArea.fullAddress && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Start typing your address above to search and auto-fill your location
              </p>
            </div>
          )}
        </div>

        {/* Travel Distance */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">How far will you travel?</h3>
          <p className="text-gray-500 text-sm mb-4">A larger radius means more booking opportunities</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {radiusOptions.map((option) => {
              const isSelected = details.travelRadius === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFieldChange("travelRadius", option.value)}
                  className={`
                    py-3 px-4 rounded-lg border-2 transition-all text-center font-medium
                    ${isSelected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <SectionSave
          sectionName="Travel & Location"
          hasChanges={basicInfoState.hasChanges}
          onSave={handleBasicInfoSave}
          saving={basicInfoState.saving}
          lastSaved={basicInfoState.lastSaved}
          error={basicInfoState.error}
        />
      </div>
    )
  }

  // Airbnb-style number stepper component
  const NumberStepper = ({ value, onChange, min = 0, max = 999, step = 1, prefix = '', suffix = '' }) => {
    const currentValue = value || 0
    const canDecrement = currentValue > min
    const canIncrement = currentValue < max

    const handleIncrement = () => {
      onChange(Math.min(max, currentValue + step))
    }

    const handleDecrement = () => {
      onChange(Math.max(min, currentValue - step))
    }

    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
            canDecrement
              ? 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="min-w-[80px] text-center text-lg font-medium text-gray-900">
          {prefix}{currentValue}{suffix}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
            canIncrement
              ? 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Pricing Section Content - Airbnb style
  const renderPricing = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pricing</h2>
        <p className="text-gray-600">Set your rates and capacity</p>
      </div>

      {/* Group Size */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Minimum group size</h3>
            <p className="text-gray-500 text-sm">Smallest group you'll entertain</p>
          </div>
          <NumberStepper
            value={details.groupSizeMin}
            onChange={(val) => handleFieldChange("groupSizeMin", val)}
            min={1}
            max={details.groupSizeMax || 100}
            step={1}
          />
        </div>
      </div>

      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Maximum group size</h3>
            <p className="text-gray-500 text-sm">Largest group you can handle</p>
          </div>
          <NumberStepper
            value={details.groupSizeMax}
            onChange={(val) => handleFieldChange("groupSizeMax", val)}
            min={details.groupSizeMin || 1}
            max={200}
            step={5}
          />
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Hourly rate</h3>
            <p className="text-gray-500 text-sm">Your standard rate per hour</p>
          </div>
          <NumberStepper
            value={details.hourlyRate}
            onChange={(val) => handleFieldChange("hourlyRate", val)}
            min={10}
            max={500}
            step={5}
            prefix="£"
          />
        </div>
      </div>

      {/* Extra Hour Rate */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Extra hour rate</h3>
            <p className="text-gray-500 text-sm">Rate for additional time beyond standard booking</p>
          </div>
          <NumberStepper
            value={details.extraHourRate}
            onChange={(val) => handleFieldChange("extraHourRate", val)}
            min={10}
            max={300}
            step={5}
            prefix="£"
          />
        </div>
      </div>

      {/* Additional Entertainer */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Additional entertainer</h3>
            <p className="text-gray-500 text-sm">Cost for a second entertainer for larger groups</p>
          </div>
          <NumberStepper
            value={details.additionalEntertainerPrice}
            onChange={(val) => handleFieldChange("additionalEntertainerPrice", val)}
            min={50}
            max={500}
            step={10}
            prefix="£"
          />
        </div>
      </div>

      <SectionSave
        sectionName="Pricing"
        hasChanges={pricingState.hasChanges}
        onSave={handlePricingSave}
        saving={pricingState.saving}
        lastSaved={pricingState.lastSaved}
        error={pricingState.error}
      />
    </div>
  )

  // Age Groups Section Content
  const renderAgeGroups = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Age Groups</h2>
        <p className="text-gray-600">Select all age groups that would enjoy your performances</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ageGroupOptions.map((age) => {
          const isSelected = details.ageGroups.includes(age)
          return (
            <div
              key={age}
              onClick={() => handleArrayToggle(details.ageGroups, age, "ageGroups")}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-sm font-medium text-gray-900">{age}</span>
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              )}
            </div>
          )
        })}
      </div>

      <SectionSave
        sectionName="Age Groups"
        hasChanges={ageGroupsState.hasChanges}
        onSave={handleAgeGroupsSave}
        saving={ageGroupsState.saving}
        lastSaved={ageGroupsState.lastSaved}
        error={ageGroupsState.error}
      />
    </div>
  )

  // Performance Styles Section Content
  const renderPerformanceStyles = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Performance Styles</h2>
        <p className="text-gray-600">What types of entertainment do you offer?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {performanceStyles.map((style) => {
          const isSelected = details.performanceStyle.includes(style)
          return (
            <div
              key={style}
              onClick={() => handleArrayToggle(details.performanceStyle, style, "performanceStyle")}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-purple-300 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-sm font-medium text-gray-900">{style}</span>
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-purple-600" />
              )}
            </div>
          )
        })}
      </div>

      <SectionSave
        sectionName="Performance Styles"
        hasChanges={performanceStylesState.hasChanges}
        onSave={handlePerformanceStylesSave}
        saving={performanceStylesState.saving}
        lastSaved={performanceStylesState.lastSaved}
        error={performanceStylesState.error}
      />
    </div>
  )

  // Themes Section Content
  const renderThemes = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Themes</h2>
        <p className="text-gray-600">Select party themes you can perform for</p>
      </div>

      <EnhancedThemesSection
        details={details}
        setDetails={setDetails}
        onThemesChange={(themes) => {
          const newDetails = { ...details, themes };
          setDetails(newDetails);
          onUpdate(newDetails);
          checkChanges('themes', themes);
        }}
        onSave={handleThemesSave}
        sectionState={themesState}
        isExpanded={true}
        onToggle={() => {}}
        hideHeader={true}
      />
    </div>
  )

  // Equipment Section Content
  const renderEquipment = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Equipment & Skills</h2>
        <p className="text-gray-600">Tell customers about your equipment and special abilities</p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="equipment" className="text-base font-medium text-gray-700">
          Equipment & Props You Provide
        </Label>
        <Textarea
          id="equipment"
          value={details.equipment}
          onChange={(e) => handleFieldChange("equipment", e.target.value)}
          placeholder="e.g., Professional sound system, wireless microphone, balloon pump, face paints, magic props, costumes..."
          rows={4}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 resize-none"
        />
      </div>

      <div className="space-y-4">
        <Label htmlFor="specialSkills" className="text-base font-medium text-gray-700">
          Special Skills & Qualifications
        </Label>
        <Textarea
          id="specialSkills"
          value={details.specialSkills}
          onChange={(e) => handleFieldChange("specialSkills", e.target.value)}
          placeholder="e.g., Advanced balloon modelling, stage magic certification, children's psychology degree, first aid trained..."
          rows={4}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 resize-none"
        />
      </div>

      <SectionSave
        sectionName="Equipment & Skills"
        hasChanges={equipmentState.hasChanges}
        onSave={handleEquipmentSave}
        saving={equipmentState.saving}
        lastSaved={equipmentState.lastSaved}
        error={equipmentState.error}
      />
    </div>
  )

  // Personal Bio Section Content
  const renderPersonalBio = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Meet the Entertainer</h2>
        <p className="text-gray-600">Let customers get to know the amazing person behind the performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="yearsExperience" className="text-base font-medium text-gray-700">Years of experience *</Label>
          <Input
            id="yearsExperience"
            type="number"
            min="0"
            max="50"
            value={details.personalBio?.yearsExperience || ""}
            onChange={(e) => handleNestedFieldChange("personalBio", "yearsExperience", e.target.value)}
            className="h-12 bg-white border-2 border-gray-200 rounded-xl"
            placeholder="e.g., 5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspiration" className="text-base font-medium text-gray-700">What inspires you? *</Label>
          <Input
            id="inspiration"
            value={details.personalBio?.inspiration || ""}
            onChange={(e) => handleNestedFieldChange("personalBio", "inspiration", e.target.value)}
            className="h-12 bg-white border-2 border-gray-200 rounded-xl"
            placeholder="e.g., Seeing children's faces light up with wonder"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="favoriteEvent" className="text-base font-medium text-gray-700">Describe your favorite event</Label>
        <Textarea
          id="favoriteEvent"
          value={details.personalBio?.favoriteEvent || ""}
          onChange={(e) => handleNestedFieldChange("personalBio", "favoriteEvent", e.target.value)}
          placeholder="e.g., Corporate Event for Accenture at Chelsea FC - magic, business and football!"
          rows={3}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dreamClient" className="text-base font-medium text-gray-700">Dream celebrity client</Label>
        <Textarea
          id="dreamClient"
          value={details.personalBio?.dreamClient || ""}
          onChange={(e) => handleNestedFieldChange("personalBio", "dreamClient", e.target.value)}
          placeholder="e.g., It would be fun to amaze the very cool Keanu Reeves and hear him say, 'Whoa!'"
          rows={2}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalStory" className="text-base font-medium text-gray-700">Your personal story</Label>
        <Textarea
          id="personalStory"
          value={details.personalBio?.personalStory || ""}
          onChange={(e) => handleNestedFieldChange("personalBio", "personalStory", e.target.value)}
          placeholder="Share your journey into entertainment, what makes you unique, and why you love what you do..."
          rows={5}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 resize-none"
        />
      </div>

      <SectionSave
        sectionName="Personal Bio"
        hasChanges={personalBioState.hasChanges}
        onSave={handlePersonalBioSave}
        saving={personalBioState.saving}
        lastSaved={personalBioState.lastSaved}
        error={personalBioState.error}
      />
    </div>
  )

  // Add-ons Section Content
  const renderAddOns = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Add-on Services</h2>
        <p className="text-gray-600">Create optional extras that customers can add to their bookings</p>
      </div>

      {/* Quick Templates */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Quick Add Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addonTemplates.map((template, index) => {
            const categoryInfo = addonCategories.find((cat) => cat.value === template.category)
            const alreadyExists = details.addOnServices.some((addon) => addon.name === template.name)

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  alreadyExists
                    ? "border-gray-200 bg-gray-50 opacity-50"
                    : "border-gray-200 bg-white hover:border-primary-400 hover:shadow-md cursor-pointer"
                }`}
                onClick={alreadyExists ? undefined : () => handleAddTemplate(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-900 text-sm">{template.name}</h5>
                  <div className="text-primary-600 font-bold text-sm">£{template.price}</div>
                </div>
                <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {categoryInfo?.emoji} {categoryInfo?.label}
                  </span>
                  {alreadyExists ? (
                    <span className="text-xs text-gray-500">Added</span>
                  ) : (
                    <PlusCircle className="w-4 h-4 text-primary-600" />
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
          <h4 className="font-semibold text-gray-900">Your Add-ons ({details.addOnServices.length})</h4>
          <Button onClick={() => setIsAddingAddon(true)} size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Custom
          </Button>
        </div>

        {details.addOnServices.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
            <Gift className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <p className="text-gray-500">No add-ons yet. Add some templates or create custom ones.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {details.addOnServices.map((addon, index) => (
              <div key={index} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-semibold text-gray-900">{addon.name}</h5>
                      <span className="font-bold text-primary-600">£{addon.price}</span>
                    </div>
                    {addon.description && <p className="text-gray-600 text-sm">{addon.description}</p>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditAddon(addon)} className="h-8 w-8 p-0">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAddon(addon.id)} className="text-red-600 hover:text-red-700 h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SectionSave
        sectionName="Add-on Services"
        hasChanges={addOnServicesState.hasChanges}
        onSave={handleAddOnServicesSave}
        saving={addOnServicesState.saving}
        lastSaved={addOnServicesState.lastSaved}
        error={addOnServicesState.error}
      />
    </div>
  )

  // Render the appropriate section based on selectedSection
  const renderSection = () => {
    switch (activeSection) {
      case 'listingName':
        return renderListingName()
      case 'aboutUs':
        return renderAboutUs()
      case 'basicInfo':
        return renderBasicInfo()
      case 'pricing':
        return renderPricing()
      case 'ageGroups':
        return renderAgeGroups()
      case 'performanceStyles':
        return renderPerformanceStyles()
      case 'themes':
        return renderThemes()
      case 'equipment':
        return renderEquipment()
      case 'personalBio':
        return renderPersonalBio()
      case 'addOns':
        return renderAddOns()
      default:
        return renderListingName()
    }
  }

  return (
    <div className="max-w-3xl">
      {renderSection()}

      {/* Add/Edit Add-on Modal */}
      {isAddingAddon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAddon ? "Edit Add-on Service" : "Create New Add-on Service"}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetAddonForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addonName" className="text-sm font-medium">Service Name *</Label>
                  <Input
                    id="addonName"
                    value={addonForm.name}
                    onChange={(e) => handleAddonFormChange("name", e.target.value)}
                    placeholder="e.g., Face Painting"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addonPrice" className="text-sm font-medium">Price (£) *</Label>
                  <Input
                    id="addonPrice"
                    type="number"
                    min="0"
                    value={addonForm.price}
                    onChange={(e) => handleAddonFormChange("price", e.target.value)}
                    placeholder="30"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Category</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addonCategories.map((category) => (
                    <div
                      key={category.value}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        addonForm.category === category.value
                          ? "border-primary-300 bg-primary-50"
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
                <Label htmlFor="addonDescription" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="addonDescription"
                  value={addonForm.description}
                  onChange={(e) => handleAddonFormChange("description", e.target.value)}
                  placeholder="Describe what this add-on includes..."
                  rows={3}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button variant="outline" onClick={resetAddonForm} className="flex-1">Cancel</Button>
              <Button onClick={handleAddAddon} className="flex-1 bg-primary-600 hover:bg-primary-700">
                {editingAddon ? "Update Add-on" : "Create Add-on"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EntertainerServiceDetails
