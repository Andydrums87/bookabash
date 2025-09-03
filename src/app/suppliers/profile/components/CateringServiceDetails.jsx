"use client"

import { useState, useEffect } from "react"
import {
  ChefHat,
  PlusCircle,
  Edit3,
  Trash2,
  Gift,
  Star,
  X,
  Settings,
  Info,
  Loader2,
  Utensils,
  Target,
  Heart,
  Award,
  DollarSign,
  User,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CateringServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness }) => {
  const [loading, setLoading] = useState(false)
  const [showCuisines, setShowCuisines] = useState(false)
  const [showFlavors, setShowFlavors] = useState(false)

  const [details, setDetails] = useState({
    cateringType: "",
    serviceStyle: "",
    cuisineTypes: [],
    specialties: [],
    dietaryOptions: [],
    ageGroups: [],
    eventTypes: [],
    serviceAreas: [],
    capacity: {
      minimum: 10,
      maximum: 200,
      optimal: 50,
    },
    leadTime: {
      minimum: 24,
      standard: 72,
      custom: 168,
    },
    pricing: {
      model: "per_person", // per_person, fixed_price, hourly
      priceFrom: 15,
      priceTo: 50,
      minimumOrder: 100,
      deliveryFee: 25,
      setupFee: 50,
      staffingFee: 0,
    },
    equipment: {
      providesServing: true,
      providesStaff: false,
      providesEquipment: false,
      needsPower: false,
      needsKitchen: false,
      needsRefrigeration: false,
    },
    businessDetails: {
      yearsExperience: "",
      licenses: [],
      certifications: [],
      kitchenType: "",
      inspiration: "",
      signature: "",
      story: "",
    },
    availability: {
      daysOfWeek: [],
      timeSlots: [],
      advanceBooking: 7,
      seasonalAvailable: true,
    },
    menuItems: [],
    packages: [],
    addOnServices: [],
    policies: {
      cancellation: 48,
      dietaryRequests: true,
      lastMinuteOrders: false,
      paymentTerms: "50% deposit",
      allergensHandled: true,
    },
    ...serviceDetails,
  })

  // ✅ Update form when business data changes from parent
  useEffect(() => {
    if (supplierData) {
      console.log("🔄 CateringServiceDetails updating with business data:", supplierData.name)

      const businessServiceDetails = supplierData.serviceDetails || {}

      setDetails({
        cateringType: "",
        serviceStyle: "",
        cuisineTypes: [],
        specialties: [],
        dietaryOptions: [],
        ageGroups: [],
        eventTypes: [],
        serviceAreas: [],
        capacity: {
          minimum: 10,
          maximum: 200,
          optimal: 50,
        },
        leadTime: {
          minimum: 24,
          standard: 72,
          custom: 168,
        },
        pricing: {
          model: "per_person",
          priceFrom: 15,
          priceTo: 50,
          minimumOrder: 100,
          deliveryFee: 25,
          setupFee: 50,
          staffingFee: 0,
        },
        equipment: {
          providesServing: true,
          providesStaff: false,
          providesEquipment: false,
          needsPower: false,
          needsKitchen: false,
          needsRefrigeration: false,
        },
        businessDetails: {
          yearsExperience: "",
          licenses: [],
          certifications: [],
          kitchenType: "",
          inspiration: "",
          signature: "",
          story: "",
        },
        availability: {
          daysOfWeek: [],
          timeSlots: [],
          advanceBooking: 7,
          seasonalAvailable: true,
        },
        menuItems: [],
        packages: [],
        cakeFlavors: [],
        addOnServices: [],
        policies: {
          cancellation: 48,
          dietaryRequests: true,
          lastMinuteOrders: false,
          paymentTerms: "50% deposit",
          allergensHandled: true,
        },
        // Override with actual business data
        ...businessServiceDetails,
        // Ensure nested objects are properly merged
        capacity: {
          minimum: 10,
          maximum: 200,
          optimal: 50,
          ...businessServiceDetails.capacity,
        },
        leadTime: {
          minimum: 24,
          standard: 72,
          custom: 168,
          ...businessServiceDetails.leadTime,
        },
        pricing: {
          model: "per_person",
          priceFrom: 15,
          priceTo: 50,
          minimumOrder: 100,
          deliveryFee: 25,
          setupFee: 50,
          staffingFee: 0,
          ...businessServiceDetails.pricing,
        },
        equipment: {
          providesServing: true,
          providesStaff: false,
          providesEquipment: false,
          needsPower: false,
          needsKitchen: false,
          needsRefrigeration: false,
          ...businessServiceDetails.equipment,
        },
        businessDetails: {
          yearsExperience: "",
          licenses: [],
          certifications: [],
          kitchenType: "",
          inspiration: "",
          signature: "",
          story: "",
          ...businessServiceDetails.businessDetails,
        },
        availability: {
          daysOfWeek: [],
          timeSlots: [],
          advanceBooking: 7,
          seasonalAvailable: true,
          ...businessServiceDetails.availability,
        },
        policies: {
          cancellation: 48,
          dietaryRequests: true,
          lastMinuteOrders: false,
          paymentTerms: "50% deposit",
          allergensHandled: true,
          ...businessServiceDetails.policies,
        },
      })
    }
  }, [supplierData]) // Fixed dependency array to include entire supplierData object

  // Data options
  const cateringTypes = [
    "Birthday Cake Specialist",
    "Custom Cake Designer",
    "Party Food Caterer",
    "Buffet Caterer",
    "Mobile Food Service",
    "Pizza Van/Food Truck",
    "Ice Cream Van",
    "Specialty Dietary Caterer",
    "Full Service Caterer",
    "Dessert Specialist",
    "Cultural Cuisine Specialist",
  ]

  const serviceStyles = [
    "Collection Only",
    "Delivery Only",
    "Delivery & Setup",
    "Full Service with Staff",
    "Mobile/On-site Cooking",
    "Drop-off Buffet",
    "Formal Plated Service",
    "Self-Service Setup",
  ]

  const cuisineTypes = [
    "British Traditional",
    "Italian",
    "Indian",
    "Chinese",
    "Mexican",
    "Mediterranean",
    "American BBQ",
    "Middle Eastern",
    "Asian Fusion",
    "European",
    "Caribbean",
    "African",
    "Kids Party Food",
    "Healthy Options",
    "International Mix",
  ]

  const specialtyOptions = [
    "Custom Birthday Cakes",
    "Character Cakes",
    "Cupcake Towers",
    "Kids Party Food",
    "Healthy Party Options",
    "Finger Foods & Canapés",
    "Hot Food Buffets",
    "Sandwich Platters",
    "Fresh Fruit Platters",
    "Cheese & Charcuterie",
    "BBQ & Grilled Food",
    "Pizza Making",
    "Ice Cream & Desserts",
    "Themed Food Displays",
  ]

  const dietaryOptions = [
    "Vegetarian Options",
    "Vegan Options",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Egg-Free",
    "Sugar-Free",
    "Halal",
    "Kosher",
    "Diabetic Friendly",
    "Low Sodium",
    "Organic Options",
    "Raw Food",
    "Keto Friendly",
  ]

  const ageGroupOptions = [
    "1-3 years (Toddlers)",
    "4-6 years (Pre-school)",
    "7-12 years (Children)",
    "13-17 years (Teens)",
    "18+ years (Adults)",
    "All ages",
    "Adult parties only",
  ]

  const eventTypeOptions = [
    "Birthday Parties",
    "School Events",
    "Corporate Events",
    "Wedding Parties",
    "Baby Showers",
    "Christenings",
    "Anniversary Parties",
    "Graduation Parties",
    "Holiday Celebrations",
    "Charity Events",
    "Community Events",
    "Sports Events",
  ]

  const licenseOptions = [
    "Food Hygiene Certificate",
    "Food Safety Level 2",
    "Allergen Awareness",
    "Business License",
    "Public Liability Insurance",
    "Product Liability Insurance",
    "Mobile Vendor License",
    "Alcohol License",
    "Commercial Kitchen License",
  ]

  const kitchenTypes = [
    "Home-based Licensed Kitchen",
    "Commercial Kitchen Rental",
    "Own Commercial Kitchen",
    "Mobile Kitchen Unit",
    "Shared Kitchen Space",
    "Restaurant Kitchen",
  ]

  // Menu management state
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState(null)
  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "main",
    servings: "",
    dietaryFlags: [],
  })

  // Package management state
  const [isAddingPackage, setIsAddingPackage] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    price: "",
    serves: "",
    includes: [],
  })

  // Add-ons management state
  const [isAddingAddon, setIsAddingAddon] = useState(false)
  const [editingAddon, setEditingAddon] = useState(null)
  const [addonForm, setAddonForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "food",
  })

  const addonCategories = [
    { value: "food", label: "Additional Food", emoji: "🍽️", description: "Extra food items or portions" },
    { value: "service", label: "Service Upgrade", emoji: "👨‍🍳", description: "Staff, setup, or service enhancements" },
    { value: "equipment", label: "Equipment Rental", emoji: "🍽️", description: "Tables, chairs, serving equipment" },
    { value: "specialty", label: "Specialty Item", emoji: "⭐", description: "Custom cakes, special decorations" },
    { value: "dietary", label: "Dietary Options", emoji: "🥗", description: "Special dietary accommodations" },
  ]

  const addonTemplates = [
    {
      name: "Extra Staff Member",
      price: 80,
      description: "Additional serving staff for your event",
      category: "service",
    },
    {
      name: "Premium Setup Service",
      price: 60,
      description: "Full table setup with linens and decorations",
      category: "service",
    },
    {
      name: "Custom Birthday Cake",
      price: 45,
      description: "Personalized birthday cake with name and age",
      category: "specialty",
    },
    {
      name: "Gluten-Free Options",
      price: 25,
      description: "Alternative menu items for gluten-free guests",
      category: "dietary",
    },
    {
      name: "Extra Portions (10 people)",
      price: 120,
      description: "Additional food for 10 more guests",
      category: "food",
    },
    { name: "Table & Chair Rental", price: 40, description: "Tables and chairs for 20 people", category: "equipment" },
    { name: "Dessert Upgrade", price: 35, description: "Premium dessert selection and presentation", category: "food" },
    {
      name: "Vegan Menu Options",
      price: 30,
      description: "Complete vegan alternatives for dietary requirements",
      category: "dietary",
    },
  ]

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

  // Add-ons management functions
  const handleAddonFormChange = (field, value) => {
    setAddonForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetAddonForm = () => {
    setAddonForm({
      name: "",
      price: "",
      description: "",
      category: "food",
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
    <div className="space-y-8">
      {/* ✅ Business Context Header */}
      {currentBusiness && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Editing:</strong> {currentBusiness.name} • Catering Service
          </AlertDescription>
        </Alert>
      )}
      {/* About Us Section */}
      <Card className="">
        <CardHeader className="py-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            About Us
          </CardTitle>
          <CardDescription className="text-base">
            Tell customers about your business and what makes you special (max 60 words)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="aboutUs" className="text-base font-semibold text-gray-700">
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
                rows={6}
                className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
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
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Share your story, highlight what makes you different, and mention any awards or
              recognition. Keep it friendly and engaging - no more than 2 paragraphs.
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Catering Type & Service Style */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            Catering Type & Service Style
          </CardTitle>
          <CardDescription className="text-base">
            Tell customers what type of catering you specialize in
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="cateringType" className="text-base font-semibold text-gray-700">
                What type of catering business are you? *
              </Label>
              <Select value={details.cateringType} onValueChange={(value) => handleFieldChange("cateringType", value)}>
                <SelectTrigger className="py-5 w-full bg-white border-2 border-gray-200 rounded-xl text-base">
                  <SelectValue placeholder="Choose your catering type" />
                </SelectTrigger>
                <SelectContent>
                  {cateringTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-base py-3">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="serviceStyle" className="text-base font-semibold text-gray-700">
                Service Style *
              </Label>
              <Select value={details.serviceStyle} onValueChange={(value) => handleFieldChange("serviceStyle", value)}>
                <SelectTrigger className="py-5 w-full bg-white border-2 border-gray-200 rounded-xl text-base">
                  <SelectValue placeholder="How do you serve your food?" />
                </SelectTrigger>
                <SelectContent>
                  {serviceStyles.map((style) => (
                    <SelectItem key={style} value={style} className="text-base py-3">
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Minimum Guests</Label>
              <Input
                type="number"
                min="1"
                value={details.capacity?.minimum || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "minimum", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="10"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Maximum Guests</Label>
              <Input
                type="number"
                min="1"
                value={details.capacity?.maximum || ""}
                onChange={(e) => handleNestedFieldChange("capacity", "maximum", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="200"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Lead Time (hours)</Label>
              <Input
                type="number"
                min="1"
                value={details.leadTime?.minimum || ""}
                onChange={(e) => handleNestedFieldChange("leadTime", "minimum", Number.parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cuisine Types & Specialties - Only show for food caterers */}
      {details.cateringType &&
        !["Birthday Cake Specialist", "Custom Cake Designer", "Dessert Specialist"].includes(details.cateringType) && (
          <Card>
            <CardHeader className="p-8 bg-gradient-to-r from-red-50 to-red-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                Cuisine Types & Food Specialties
              </CardTitle>
              <CardDescription className="text-base">What types of food and specialties do you offer?</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Cuisine Types</h4>
                <div className="block sm:hidden mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCuisines(!showCuisines)}
                    className="w-full justify-between"
                  >
                    Select Cuisines ({details.cuisineTypes.length} selected)
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCuisines ? "rotate-180" : ""}`} />
                  </Button>
                </div>
                <div
                  className={`${showCuisines ? "block" : "hidden"} sm:block grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`}
                >
                  {cuisineTypes.map((cuisine) => (
                    <div
                      key={cuisine}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Checkbox
                        id={`cuisine-${cuisine}`}
                        checked={details.cuisineTypes.includes(cuisine)}
                        onCheckedChange={() => handleArrayToggle(details.cuisineTypes, cuisine, "cuisineTypes")}
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor={`cuisine-${cuisine}`}
                        className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                      >
                        {cuisine}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Food Specialties</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {specialtyOptions.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Checkbox
                        id={`specialty-${specialty}`}
                        checked={details.specialties.includes(specialty)}
                        onCheckedChange={() => handleArrayToggle(details.specialties, specialty, "specialties")}
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor={`specialty-${specialty}`}
                        className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                      >
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Cake Specialties - Only show for cake makers */}
      {details.cateringType &&
        ["Birthday Cake Specialist", "Custom Cake Designer", "Dessert Specialist"].includes(details.cateringType) && (
          <Card>
            <CardHeader className="p-8 bg-gradient-to-r from-pink-50 to-pink-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                Cake Specialties & Design Types
              </CardTitle>
              <CardDescription className="text-base">
                What types of cakes and designs do you specialize in?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Cake Specialties</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Custom Birthday Cakes",
                    "Character Cakes",
                    "Cupcake Towers",
                    "Wedding Cakes",
                    "Themed Celebration Cakes",
                    "Number & Letter Cakes",
                    "Photo Cakes",
                    "Naked/Semi-Naked Cakes",
                    "Fondant Sculptures",
                    "Tiered Cakes",
                    "Drip Cakes",
                    "Buttercream Flowers",
                    "Sugar Flowers",
                    "Hand-painted Cakes",
                  ].map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors"
                    >
                      <Checkbox
                        id={`cake-specialty-${specialty}`}
                        checked={details.specialties.includes(specialty)}
                        onCheckedChange={() => handleArrayToggle(details.specialties, specialty, "specialties")}
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor={`cake-specialty-${specialty}`}
                        className="text-base font-medium cursor-pointer flex-1"
                      >
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Popular Cake Flavors</h4>
                <div className="block sm:hidden mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFlavors(!showFlavors)}
                    className="w-full justify-between"
                  >
                    Select Flavors ({(details.cakeFlavors || []).length} selected)
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFlavors ? "rotate-180" : ""}`} />
                  </Button>
                </div>
                <div
                  className={`${showFlavors ? "block" : "hidden"} sm:block grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`}
                >
                  {[
                    "Vanilla Sponge",
                    "Chocolate Fudge",
                    "Red Velvet",
                    "Lemon Drizzle",
                    "Carrot Cake",
                    "Coffee & Walnut",
                    "Strawberry",
                    "Funfetti/Rainbow",
                    "Salted Caramel",
                    "Cookies & Cream",
                    "Banana",
                    "Coconut",
                  ].map((flavor) => (
                    <div
                      key={flavor}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors"
                    >
                      <Checkbox
                        id={`flavor-${flavor}`}
                        checked={details.cakeFlavors?.includes(flavor) || false}
                        onCheckedChange={() => {
                          const currentFlavors = details.cakeFlavors || []
                          const newFlavors = currentFlavors.includes(flavor)
                            ? currentFlavors.filter((f) => f !== flavor)
                            : [...currentFlavors, flavor]
                          handleFieldChange("cakeFlavors", newFlavors)
                        }}
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor={`flavor-${flavor}`}
                        className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                      >
                        {flavor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Dietary Options & Allergens */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            Dietary Options & Allergen Management
          </CardTitle>
          <CardDescription className="text-base">
            What dietary requirements and allergen considerations can you accommodate?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietaryOptions.map((diet) => (
              <div
                key={diet}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors"
              >
                <Checkbox
                  id={`diet-${diet}`}
                  checked={details.dietaryOptions.includes(diet)}
                  onCheckedChange={() => handleArrayToggle(details.dietaryOptions, diet, "dietaryOptions")}
                  className="w-5 h-5"
                />
                <Label htmlFor={`diet-${diet}`} className="text-base font-medium cursor-pointer flex-1">
                  {diet}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age Groups & Event Types */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Age Groups & Event Types
          </CardTitle>
          <CardDescription className="text-base">What age groups and event types do you specialize in?</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Age Groups You Cater For</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ageGroupOptions.map((age) => (
                <div
                  key={age}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <Checkbox
                    id={`age-${age}`}
                    checked={details.ageGroups.includes(age)}
                    onCheckedChange={() => handleArrayToggle(details.ageGroups, age, "ageGroups")}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`age-${age}`} className="text-base font-medium cursor-pointer flex-1">
                    {age}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Event Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventTypeOptions.map((event) => (
                <div
                  key={event}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <Checkbox
                    id={`event-${event}`}
                    checked={details.eventTypes.includes(event)}
                    onCheckedChange={() => handleArrayToggle(details.eventTypes, event, "eventTypes")}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`event-${event}`} className="text-base font-medium cursor-pointer flex-1">
                    {event}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Structure */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Pricing Structure
          </CardTitle>
          <CardDescription className="text-base">Set your pricing model and rates</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">Pricing Model</Label>
            <Select
              value={details.pricing?.model || "per_person"}
              onValueChange={(value) => handleNestedFieldChange("pricing", "model", value)}
            >
              <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base">
                <SelectValue placeholder="Choose your pricing model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_person">Per Person</SelectItem>
                <SelectItem value="fixed_price">Fixed Price Packages</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="custom">Custom Quotes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Price From (£)</Label>
              <Input
                type="number"
                min="1"
                step="0.50"
                value={details.pricing?.priceFrom || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "priceFrom", Number.parseFloat(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="15.00"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Price To (£)</Label>
              <Input
                type="number"
                min="1"
                step="0.50"
                value={details.pricing?.priceTo || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "priceTo", Number.parseFloat(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="50.00"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Minimum Order (£)</Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.minimumOrder || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "minimumOrder", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="100"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Delivery Fee (£)</Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.deliveryFee || ""}
                onChange={(e) => handleNestedFieldChange("pricing", "deliveryFee", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="25"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment & Service Capabilities */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            {["Birthday Cake Specialist", "Custom Cake Designer", "Dessert Specialist"].includes(details.cateringType)
              ? "Cake Services & Delivery Options"
              : "Equipment & Service Capabilities"}
          </CardTitle>
          <CardDescription className="text-base">
            {["Birthday Cake Specialist", "Custom Cake Designer", "Dessert Specialist"].includes(details.cateringType)
              ? "What services and delivery options do you provide for cakes?"
              : "What equipment and services do you provide?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(["Birthday Cake Specialist", "Custom Cake Designer", "Dessert Specialist"].includes(details.cateringType)
              ? [
                  { key: "cakeDelivery", label: "Provide delivery service" },
                  { key: "cakeSetup", label: "Setup cake at venue" },
                  { key: "cakeStand", label: "Provide cake stands/pedestals" },
                  { key: "cakeBoxes", label: "Provide cake boxes for transport" },
                  { key: "cakeCandles", label: "Include candles and cake server" },
                  { key: "photoService", label: "Take photos of finished cake" },
                ]
              : [
                  { key: "providesServing", label: "Provide serving dishes and utensils" },
                  { key: "providesStaff", label: "Provide serving staff" },
                  { key: "providesEquipment", label: "Provide tables and chairs" },
                  { key: "needsPower", label: "Require power supply at venue" },
                  { key: "needsKitchen", label: "Require kitchen access at venue" },
                  { key: "needsRefrigeration", label: "Require refrigeration at venue" },
                ]
            ).map((item) => (
              <div
                key={item.key}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <Checkbox
                  id={`equipment-${item.key}`}
                  checked={details.equipment?.[item.key] || false}
                  onCheckedChange={(checked) => handleNestedFieldChange("equipment", item.key, checked)}
                  className="w-5 h-5"
                />
                <Label htmlFor={`equipment-${item.key}`} className="text-base font-medium cursor-pointer flex-1">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Details & Credentials */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            Business Details & Credentials
          </CardTitle>
          <CardDescription className="text-base">
            Tell customers about your experience and qualifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Years in catering business</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={details.businessDetails?.yearsExperience || ""}
                onChange={(e) => handleNestedFieldChange("businessDetails", "yearsExperience", e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="5"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Kitchen Type</Label>
              <Select
                value={details.businessDetails?.kitchenType || ""}
                onValueChange={(value) => handleNestedFieldChange("businessDetails", "kitchenType", value)}
              >
                <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base">
                  <SelectValue placeholder="Choose your kitchen setup" />
                </SelectTrigger>
                <SelectContent>
                  {kitchenTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 mb-4">Licenses & Certifications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {licenseOptions.map((license) => (
              <div
                key={license}
                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors"
              >
                <Checkbox
                  id={`license-${license}`}
                  checked={details.businessDetails?.licenses?.includes(license) || false}
                  onCheckedChange={(checked) => {
                    const currentLicenses = details.businessDetails?.licenses || []
                    const newLicenses = checked
                      ? [...currentLicenses, license]
                      : currentLicenses.filter((l) => l !== license)
                    handleNestedFieldChange("businessDetails", "licenses", newLicenses)
                  }}
                  className="w-5 h-5"
                />
                <Label
                  htmlFor={`license-${license}`}
                  className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                >
                  {license}
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">Your signature dish or specialty</Label>
            <Textarea
              value={details.businessDetails?.signature || ""}
              onChange={(e) => handleNestedFieldChange("businessDetails", "signature", e.target.value)}
              placeholder="e.g., Our famous rainbow layered birthday cakes, traditional homemade lasagna..."
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">What inspired you to start catering?</Label>
            <Textarea
              value={details.businessDetails?.inspiration || ""}
              onChange={(e) => handleNestedFieldChange("businessDetails", "inspiration", e.target.value)}
              placeholder="e.g., My love for bringing families together through food, seeing children's faces light up..."
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">Your story & what makes you special</Label>
            <Textarea
              value={details.businessDetails?.story || ""}
              onChange={(e) => handleNestedFieldChange("businessDetails", "story", e.target.value)}
              placeholder="Share your journey into catering, what makes your food unique, and why customers choose you..."
              rows={5}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>
        </CardContent>
      </Card>
      {/* Meet the Entertainer - Personal Bio */}
      <Card className="">
        <CardHeader className="py-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Meet the SnapSupplier
          </CardTitle>
          <CardDescription className="text-base">
            Let customers get to know the amazing person behind the performance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="yearsExperience" className="text-base font-semibold text-gray-700">
                Years of experience *
              </Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                max="50"
                value={details.personalBio?.yearsExperience || ""}
                onChange={(e) => handleNestedFieldChange("personalBio", "yearsExperience", e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="e.g., 5"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="inspiration" className="text-base font-semibold text-gray-700">
                What inspires you? *
              </Label>
              <Input
                id="inspiration"
                value={details.personalBio?.inspiration || ""}
                onChange={(e) => handleNestedFieldChange("personalBio", "inspiration", e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="e.g., Seeing children's faces light up with wonder"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="favoriteEvent" className="text-base font-semibold text-gray-700">
              Describe your favorite event you've performed at
            </Label>
            <Textarea
              id="favoriteEvent"
              value={details.personalBio?.favoriteEvent || ""}
              onChange={(e) => handleNestedFieldChange("personalBio", "favoriteEvent", e.target.value)}
              placeholder="e.g., Corporate Event for Accenture at Chelsea FC - magic, business and football!"
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="dreamClient" className="text-base font-semibold text-gray-700">
              Dream celebrity client
            </Label>
            <Textarea
              id="dreamClient"
              value={details.personalBio?.dreamClient || ""}
              onChange={(e) => handleNestedFieldChange("personalBio", "dreamClient", e.target.value)}
              placeholder="e.g., It would be fun to amaze the very cool Keanu Reeves and hear him say, 'Whoa!'"
              rows={2}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="personalStory" className="text-base font-semibold text-gray-700">
              Your personal story & what makes you special
            </Label>
            <Textarea
              id="personalStory"
              value={details.personalBio?.personalStory || ""}
              onChange={(e) => handleNestedFieldChange("personalBio", "personalStory", e.target.value)}
              placeholder="Share your journey into entertainment, what makes you unique, and why you love what you do..."
              rows={5}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add-on Services Management */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            Add-on Services Management
          </CardTitle>
          <CardDescription className="text-base">
            Create optional extras that customers can add to their catering orders
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Quick Templates */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />🌟 Quick Add Templates
            </h4>
            <p className="text-sm text-gray-600 mb-4">Popular catering add-ons you can add with one click</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {addonTemplates.map((template, index) => {
                const categoryInfo = addonCategories.find((cat) => cat.value === template.category)
                const alreadyExists = details.addOnServices.some((addon) => addon.name === template.name)

                return (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                      alreadyExists
                        ? "border-gray-200 bg-gray-50 opacity-50"
                        : "border-gray-200 bg-white hover:border-orange-400 hover:shadow-md cursor-pointer"
                    }`}
                    onClick={alreadyExists ? undefined : () => handleAddTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900 text-sm">{template.name}</h5>
                      <div className="text-orange-500 font-bold text-sm">£{template.price}</div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full">
                        {categoryInfo?.emoji} {categoryInfo?.label}
                      </span>
                      {alreadyExists ? (
                        <span className="text-xs text-gray-500">✓ Added</span>
                      ) : (
                        <PlusCircle className="w-4 h-4 text-orange-600" />
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
                🍽️ Your Add-on Services ({details.addOnServices.length})
              </h4>
              <Button
                onClick={() => setIsAddingAddon(true)}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
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
                            <span className="font-bold text-orange-500">£{addon.price}</span>
                            {categoryInfo && (
                              <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full">
                                {categoryInfo.emoji} {categoryInfo.label}
                              </span>
                            )}
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
                    placeholder="e.g., Extra Staff Member"
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
                    placeholder="80"
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
                          ? "border-orange-200 bg-orange-50"
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
              <Button onClick={handleAddAddon} className="flex-1 bg-orange-500 hover:bg-orange-600">
                {editingAddon ? "Update Add-on" : "Create Add-on"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CateringServiceDetails
