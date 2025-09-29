"use client"

import { useState, useEffect } from "react"
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
  UserPlus
} from "lucide-react"
import EnhancedThemesSection from "../../dashboard/EnchancedThemesSection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SectionSave, useSectionSave } from '@/components/ui/SectionSave';
import { useSectionManager } from '../../hooks/useSectionManager';

// Business-Aware Entertainer Service Details Form
const EntertainerServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness, updateProfile, supplier, setSupplierData }) => {
  // Use data passed from parent instead of calling useSupplier again
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    ageGroups: false,
    performanceStyles: false,
    themes: false,
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
    ...serviceDetails,
  })

  // Replace all your individual section state with this one hook
  const { getSectionState, checkChanges, saveSection } = useSectionManager(
    supplierData, 
    updateProfile, 
    supplier
  );

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
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
      checkChanges('aboutUs', value);
    } else if (['travelRadius', 'setupTime', 'groupSizeMin', 'groupSizeMax', 'additionalEntertainerPrice', 'extraHourRate'].includes(field)) {
      const basicInfoData = {
        travelRadius: field === 'travelRadius' ? value : details.travelRadius,
        setupTime: field === 'setupTime' ? value : details.setupTime,
        groupSizeMin: field === 'groupSizeMin' ? value : details.groupSizeMin,
        groupSizeMax: field === 'groupSizeMax' ? value : details.groupSizeMax,
        additionalEntertainerPrice: field === 'additionalEntertainerPrice' ? value : details.additionalEntertainerPrice,
        extraHourRate: field === 'extraHourRate' ? value : details.extraHourRate,
      };
      checkChanges('basicInfo', basicInfoData);
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
  const handleAboutUsSave = () => {
    saveSection('aboutUs', details.aboutUs, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        aboutUs: details.aboutUs
      }
    });
  };

  const handleBasicInfoSave = () => {
    const basicInfoData = {
      travelRadius: details.travelRadius,
      setupTime: details.setupTime,
      groupSizeMin: details.groupSizeMin,
      groupSizeMax: details.groupSizeMax,
      additionalEntertainerPrice: details.additionalEntertainerPrice,
      extraHourRate: details.extraHourRate,
    };
    
    saveSection('basicInfo', basicInfoData, {
      serviceDetails: {
        ...supplierData.serviceDetails,
        ...basicInfoData
      }
    });
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

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* About Us Section */}
      <Card className="" id="about">
        <CardHeader className="py-4 sm:py-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            About Us
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tell customers about your business and what makes you special (max 120 words)
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
                  if (words.length <= 120) {
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
                })()}/120 words
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              💡 <strong>Tip:</strong> Share your story, highlight what makes you different, and mention any awards or
              recognition. Keep it friendly and engaging - no more than 2-3 paragraphs.
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
        </CardContent>
      </Card>

      {/* Basic Performance Info */}
      <Card className="">
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-[hsl(var(-primary-50))] to-[hsl(var(--primary-100))]">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Basic Performance Info
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tell customers about your core entertainment offering and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="travelRadius" className="text-sm sm:text-base font-semibold text-gray-700">
                How far will you travel? (miles) *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="travelRadius"
                  type="number"
                  min="1"
                  max="100"
                  value={details.travelRadius}
                  onChange={(e) => handleFieldChange("travelRadius", Number.parseInt(e.target.value))}
                  className="h-10 sm:h-12 pl-10 sm:pl-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="e.g., 25"
                />
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="setupTime" className="text-sm sm:text-base font-semibold text-gray-700">
                Setup Time (minutes)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="setupTime"
                  type="number"
                  min="0"
                  max="120"
                  value={details.setupTime}
                  onChange={(e) => handleFieldChange("setupTime", Number.parseInt(e.target.value))}
                  className="h-10 sm:h-12 pl-10 sm:pl-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="e.g., 30"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="groupSizeMin" className="text-sm sm:text-base font-semibold text-gray-700">
                Minimum Group Size
              </Label>
              <Input
                id="groupSizeMin"
                type="number"
                min="1"
                value={details.groupSizeMin}
                onChange={(e) => handleFieldChange("groupSizeMin", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="e.g., 5"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="groupSizeMax" className="text-sm sm:text-base font-semibold text-gray-700">
                Maximum Group Size (Single Entertainer)
              </Label>
              <Input
                id="groupSizeMax"
                type="number"
                min="1"
                value={details.groupSizeMax}
                onChange={(e) => handleFieldChange("groupSizeMax", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="e.g., 30"
              />
              <p className="text-xs text-gray-600">
                If a party has more guests than this, additional entertainers will be required
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="additionalEntertainerPrice" className="text-sm sm:text-base font-semibold text-gray-700">
                Additional Entertainer Price (£)
              </Label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <Input
                  id="additionalEntertainerPrice"
                  type="number"
                  min="50"
                  max="500"
                  value={details.additionalEntertainerPrice || ''}
                  onChange={(e) => handleFieldChange("additionalEntertainerPrice", Number.parseInt(e.target.value))}
                  className="h-10 sm:h-12 pl-8 sm:pl-10 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="150"
                />
              </div>
              <p className="text-xs text-gray-600">
                Price charged for each additional entertainer needed for larger groups
              </p>
            </div>
          </div>

          {/* Duration Pricing Section */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Party Duration Pricing *
            </h4>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Standard Duration</Label>
                <div className="h-10 sm:h-12 px-3 sm:px-4 bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center text-sm sm:text-base text-gray-600">
                  2 hours (included in all packages)
                </div>
              </div>
              
              <div className="space-y-2" id="pricing">
                <Label htmlFor="extraHourRate" className="text-sm font-medium text-gray-700">
                  Extra Hour Rate (£) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <Input
                    id="extraHourRate"
                    type="number"
                    min="10"
                    max="200"
                    value={details.extraHourRate || ''}
                    onChange={(e) => handleFieldChange("extraHourRate", Number.parseInt(e.target.value))}
                    className="h-10 sm:h-12 pl-8 sm:pl-10 bg-white border-2 border-orange-200 rounded-xl text-sm sm:text-base"
                    placeholder="45"
                    required
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Typical range: £30-80 per hour
                </p>
              </div>
            </div>
            
            {!details.extraHourRate && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <strong>Required:</strong> Please set your extra hour rate to complete your profile
                </p>
              </div>
            )}
          </div>
          
          <SectionSave
            sectionName="Basic Performance Info"
            hasChanges={basicInfoState.hasChanges}
            onSave={handleBasicInfoSave}
            saving={basicInfoState.saving}
            lastSaved={basicInfoState.lastSaved}
            error={basicInfoState.error}
          />
        </CardContent>
      </Card>

      {/* Age Groups - Mobile Optimized */}
      <Card className="">
        <CardHeader className="py-4 sm:py-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle
            className="flex items-center justify-between text-lg sm:text-xl cursor-pointer"
            onClick={() => toggleSection("ageGroups")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Age Groups You Cater For
            </div>
            <div className="sm:hidden">
              {expandedSections.ageGroups ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Select all age groups that would enjoy your performances
          </CardDescription>
        </CardHeader>
        <CardContent className={`p-4 sm:p-8 space-y-6 ${!expandedSections.ageGroups ? "hidden sm:block" : ""}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {ageGroupOptions.map((age) => (
              <div
                key={age}
                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
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
          
          <SectionSave
            sectionName="Age Groups"
            hasChanges={ageGroupsState.hasChanges}
            onSave={handleAgeGroupsSave}
            saving={ageGroupsState.saving}
            lastSaved={ageGroupsState.lastSaved}
            error={ageGroupsState.error}
          />
        </CardContent>
      </Card>

      {/* Performance Styles - Mobile Optimized */}
      <Card className="">
        <CardHeader className="py-4 sm:py-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle
            className="flex items-center justify-between text-lg sm:text-xl cursor-pointer"
            onClick={() => toggleSection("performanceStyles")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Performance Styles
            </div>
            <div className="sm:hidden">
              {expandedSections.performanceStyles ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">What types of entertainment do you offer?</CardDescription>
        </CardHeader>
        <CardContent className={`p-4 sm:p-8 space-y-6 ${!expandedSections.performanceStyles ? "hidden sm:block" : ""}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {performanceStyles.map((style) => (
              <div
                key={style}
                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <Checkbox
                  id={`style-${style}`}
                  checked={details.performanceStyle.includes(style)}
                  onCheckedChange={() => handleArrayToggle(details.performanceStyle, style, "performanceStyle")}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label htmlFor={`style-${style}`} className="text-sm sm:text-base font-medium cursor-pointer flex-1">
                  {style}
                </Label>
              </div>
            ))}
          </div>
          
          <SectionSave
            sectionName="Performance Styles"
            hasChanges={performanceStylesState.hasChanges}
            onSave={handlePerformanceStylesSave}
            saving={performanceStylesState.saving}
            lastSaved={performanceStylesState.lastSaved}
            error={performanceStylesState.error}
          />
        </CardContent>
      </Card>

      {/* Themes */}
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
      />

      {/* Equipment & Skills */}
      <Card className="">
        <CardHeader className="py-4 sm:py-8 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Equipment & Skills
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tell customers about your equipment and special abilities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="equipment" className="text-sm sm:text-base font-semibold text-gray-700">
              Equipment & Props You Provide
            </Label>
            <Textarea
              id="equipment"
              value={details.equipment}
              onChange={(e) => handleFieldChange("equipment", e.target.value)}
              placeholder="e.g., Professional sound system, wireless microphone, balloon pump, face paints, magic props, costumes..."
              rows={4}
              className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="specialSkills" className="text-sm sm:text-base font-semibold text-gray-700">
              Special Skills & Qualifications
            </Label>
            <Textarea
              id="specialSkills"
              value={details.specialSkills}
              onChange={(e) => handleFieldChange("specialSkills", e.target.value)}
              placeholder="e.g., Advanced balloon modelling, stage magic certification, children's psychology degree, first aid trained..."
              rows={4}
              className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
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
        </CardContent>
      </Card>

      {/* Meet the Entertainer - Personal Bio */}
      <Card className="">
        <CardHeader className="py-4 sm:py-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Meet the Entertainer
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Let customers get to know the amazing person behind the performance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="yearsExperience" className="text-sm sm:text-base font-semibold text-gray-700">
                Years of experience *
              </Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                max="50"
                value={details.personalBio?.yearsExperience || ""}
                onChange={(e) => handleNestedFieldChange("personalBio", "yearsExperience", e.target.value)}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="e.g., 5"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="inspiration" className="text-sm sm:text-base font-semibold text-gray-700">
                What inspires you? *
              </Label>
              <Input
                id="inspiration"
                value={details.personalBio?.inspiration || ""}
                onChange={(e) => handleNestedFieldChange("personalBio", "inspiration", e.target.value)}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="e.g., Seeing children's faces light up with wonder"
              />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="favoriteEvent" className="text-sm sm:text-base font-semibold text-gray-700">
              Describe your favorite event you've performed at
            </Label>
            <Textarea
              id="favoriteEvent"
              value={details.personalBio?.favoriteEvent || ""}
              onChange={(e) => handleNestedFieldChange("personalBio", "favoriteEvent", e.target.value)}
              placeholder="e.g., Corporate Event for Accenture at Chelsea FC - magic, business and football!"
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="dreamClient" className="text-sm sm:text-base font-semibold text-gray-700">
              Dream celebrity client
            </Label>
            <Textarea
              id="dreamClient"
              value={details.personalBio?.dreamClient || ""}
              onChange={(e) => handleNestedFieldChange("personalBio", "dreamClient", e.target.value)}
              placeholder="e.g., It would be fun to amaze the very cool Keanu Reeves and hear him say, 'Whoa!'"
              rows={2}
              className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="personalStory" className="text-sm sm:text-base font-semibold text-gray-700">
              Your personal story & what makes you special
            </Label>
            <Textarea
              id="personalStory"
              value={details.personalBio?.personalStory || ""}
              onChange={(e) => handleNestedFieldChange("personalBio", "personalStory", e.target.value)}
              placeholder="Share your journey into entertainment, what makes you unique, and why you love what you do..."
              rows={5}
              className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
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
        </CardContent>
      </Card>

      {/* Add-on Services Management */}
      <Card className="">
        <CardHeader className="py-8 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            Add-on Services Management
          </CardTitle>
          <CardDescription className="text-base">
            Create optional extras that customers can add to their bookings for additional revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Quick Templates */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />🌟 Quick Add Templates
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
                        : "border-gray-200 bg-white hover:border-[hsl(var(--primary-400))] hover:shadow-md cursor-pointer"
                    }`}
                    onClick={alreadyExists ? undefined : () => handleAddTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900 text-sm">{template.name}</h5>
                      <div className="text-primary-400 font-bold text-sm">£{template.price}</div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-primary-400 text-white rounded-full">
                        {categoryInfo?.emoji} {categoryInfo?.label}
                      </span>
                      {alreadyExists ? (
                        <span className="text-xs text-gray-500">✓ Added</span>
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
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5" />Your Add-on Services ({details.addOnServices.length})
              </h4>
              <Button
                onClick={() => setIsAddingAddon(true)}
                size="sm"
                className="bg-primary-500 hover:bg-[hsl(var(--primary-600))] text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Custom
              </Button>
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
                            <span className="font-bold text-primary-400">£{addon.price}</span>
                          </div>
                          {addon.description && <p className="text-gray-600 text-sm">{addon.description}</p>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAddon(addon)}
                            className="bg-transparent h-8 w-8 p-0"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddon(addon.id)}
                            className="text-red-600 hover:text-red-700 bg-transparent h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
        </CardContent>
      </Card>

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
                  <Label htmlFor="addonName" className="text-sm font-medium">
                    Service Name *
                  </Label>
                  <Input
                    id="addonName"
                    value={addonForm.name}
                    onChange={(e) => handleAddonFormChange("name", e.target.value)}
                    placeholder="e.g., Face Painting"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addonPrice" className="text-sm font-medium">
                    Price (£) *
                  </Label>
                  <Input
                    id="addonPrice"
                    type="number"
                    min="0"
                    value={addonForm.price}
                    onChange={(e) => handleAddonFormChange("price", e.target.value)}
                    placeholder="30"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
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
                          ? "border-[hsl(var(--primary-200))] bg-primary-50"
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
                <Label htmlFor="addonDescription" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="addonDescription"
                  value={addonForm.description}
                  onChange={(e) => handleAddonFormChange("description", e.target.value)}
                  placeholder="Describe what this add-on includes and why customers would want it..."
                  rows={3}
                  className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button variant="outline" onClick={resetAddonForm} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleAddAddon} className="flex-1 bg-primary-500 hover:bg-[hsl(var(--primary-600))]">
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