"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Info,
  Loader2,
  Package,
  Star,
  AlertCircle,
  Target,
  Sparkles,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

const PartyBagsServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness }) => {
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    themes: false,
    ageGroups: false,
    customization: false,
  })

  const [details, setDetails] = useState({
    aboutUs: "",
    packageTypes: [
      {
        id: "basic",
        name: "Basic Party Bags",
        price: 5,
        priceType: "per_bag",
        description: "Classic party bags with essential treats and small toys",
        features: ["Themed party bag", "Small toys and treats", "Stickers and pencils", "Sweet treats"],
        themes: [],
        ageGroups: [],
        minimumQuantity: 10,
      },
      {
        id: "premium",
        name: "Premium Party Bags",
        price: 8,
        priceType: "per_bag",
        description: "Enhanced party bags with better quality items and more variety",
        features: [
          "Premium themed bags",
          "Quality toys and games",
          "Sticker sheets and activities",
          "Healthy snack options",
          "Activity sheets",
        ],
        themes: [],
        ageGroups: [],
        minimumQuantity: 10,
      },
      {
        id: "luxury",
        name: "Luxury Party Bags",
        price: 12,
        priceType: "per_bag",
        description: "Top-tier party bags with high-quality items and personalized touches",
        features: [
          "Luxury themed bags",
          "Premium toys and games",
          "Personalized items",
          "Healthy snack options",
          "Activity books",
          "Special keepsake item",
        ],
        themes: [],
        ageGroups: [],
        minimumQuantity: 8,
      },
    ],
    availableThemes: [],
    ageGroups: [],
    customization: {
      personalization: false,
      customThemes: false,
      dietaryOptions: false,
      corporateBranding: false,
    },
    policies: {
      minimumOrder: 10,
      advanceNotice: 7,
      cancellationPolicy: "",
      deliveryOptions: [],
      paymentTerms: "",
    },
    delivery: {
      localDelivery: false,
      deliveryRadius: 0,
      deliveryFee: 0,
      freeDeliveryThreshold: 0,
      collectionAvailable: true,
    },
    specialOffers: "",
    ...serviceDetails,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Update form when business data changes from parent
  useEffect(() => {
    if (supplierData) {
      console.log("🔄 PartyBagsServiceDetails updating with business data:", supplierData.name)

      const businessServiceDetails = supplierData.serviceDetails || {}

      setDetails((prevDetails) => ({
        ...prevDetails,
        ...businessServiceDetails,
        // Ensure nested objects are properly merged
        packageTypes: businessServiceDetails.packageTypes || prevDetails.packageTypes,
        customization: {
          ...prevDetails.customization,
          ...businessServiceDetails.customization,
        },
        policies: {
          ...prevDetails.policies,
          ...businessServiceDetails.policies,
        },
        delivery: {
          ...prevDetails.delivery,
          ...businessServiceDetails.delivery,
        },
      }))
    }
  }, [supplierData])

  // Data options
  const themeOptions = [
    "Superhero",
    "Princess",
    "Unicorn",
    "Dinosaur",
    "Space",
    "Mermaid",
    "Pirate",
    "Fairy",
    "Animals",
    "Cars",
    "Football",
    "Rainbow",
    "Jungle Safari",
    "Under the Sea",
    "Frozen",
    "Harry Potter",
    "Minecraft",
    "LOL Surprise",
    "Paw Patrol",
    "General/Mixed",
  ]

  const ageGroupOptions = ["0-2 years", "3-5 years", "6-8 years", "9-12 years", "13+ years", "All ages"]

  const deliveryOptions = ["Local Delivery", "Collection Only", "UK Wide Shipping", "Express Delivery"]

  // Handlers
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

  const handlePackageChange = (packageIndex, field, value) => {
    const newPackages = [...details.packageTypes]
    newPackages[packageIndex] = {
      ...newPackages[packageIndex],
      [field]: value,
    }

    const newDetails = { ...details, packageTypes: newPackages }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handlePackageFeatureAdd = (packageIndex) => {
    const newPackages = [...details.packageTypes]
    newPackages[packageIndex].features.push("")

    const newDetails = { ...details, packageTypes: newPackages }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handlePackageFeatureRemove = (packageIndex, featureIndex) => {
    const newPackages = [...details.packageTypes]
    newPackages[packageIndex].features.splice(featureIndex, 1)

    const newDetails = { ...details, packageTypes: newPackages }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handlePackageFeatureChange = (packageIndex, featureIndex, value) => {
    const newPackages = [...details.packageTypes]
    newPackages[packageIndex].features[featureIndex] = value

    const newDetails = { ...details, packageTypes: newPackages }
    setDetails(newDetails)
    onUpdate(newDetails)
  }

  const handleArrayToggle = (array, item, field) => {
    const newArray = array.includes(item) ? array.filter((i) => i !== item) : [...array, item]

    const newDetails = { ...details, [field]: newArray }
    setDetails(newDetails)
    onUpdate(newDetails)
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
      {/* Business Context Header */}
      {currentBusiness && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Editing:</strong> {currentBusiness.name} • {currentBusiness.serviceType} • Party Bags
          </AlertDescription>
        </Alert>
      )}

      {/* About Us Section */}
      <Card>
        <CardHeader className="py-4 sm:py-8 bg-gradient-to-r from-pink-50 to-pink-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-500 rounded-xl flex items-center justify-center">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            About Us
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tell customers about your business and what makes your party bags special (max 60 words)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="space-y-3">
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
                placeholder="Tell customers about your passion for creating amazing party bags, your attention to quality, what makes your bags special, and why families love choosing you..."
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
              💡 <strong>Tip:</strong> Share what makes your party bags special - quality, themes, personalization, or
              your passion for making parties memorable!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Package Types */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Package Types & Pricing
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Configure your Basic, Premium, and Luxury party bag packages
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {details.packageTypes.map((pkg, index) => (
            <div key={pkg.id} className="border-2 border-gray-200 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                    pkg.id === "basic" ? "bg-green-500" : pkg.id === "premium" ? "bg-blue-500" : "bg-purple-500"
                  } text-white text-sm sm:text-base`}
                >
                  {pkg.id === "basic" ? "1" : pkg.id === "premium" ? "2" : "3"}
                </div>
                <h3 className="text-base sm:text-lg font-semibold capitalize">{pkg.id} Package</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base font-semibold text-gray-700">Package Name *</Label>
                  <Input
                    value={pkg.name}
                    onChange={(e) => handlePackageChange(index, "name", e.target.value)}
                    className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                    placeholder="e.g. Basic Party Bags"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base font-semibold text-gray-700">Price per Bag (£) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.50"
                    value={pkg.price}
                    onChange={(e) => handlePackageChange(index, "price", Number.parseFloat(e.target.value))}
                    className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                    placeholder="5.00"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">Package Description *</Label>
                <Textarea
                  value={pkg.description}
                  onChange={(e) => handlePackageChange(index, "description", e.target.value)}
                  placeholder="Describe what makes this package special and what's included"
                  rows={3}
                  className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
                />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">
                  What's Included in This Package *
                </Label>
                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2 sm:gap-3">
                    <Input
                      value={feature}
                      onChange={(e) => handlePackageFeatureChange(index, featureIndex, e.target.value)}
                      className="flex-1 h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                      placeholder="e.g. Themed party bag, Small toys, Stickers"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePackageFeatureRemove(index, featureIndex)}
                      className="h-10 sm:h-12 px-2 sm:px-3"
                    >
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePackageFeatureAdd(index)}
                  className="flex items-center gap-2 text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add Feature
                </Button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">Minimum Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={pkg.minimumQuantity}
                  onChange={(e) => handlePackageChange(index, "minimumQuantity", Number.parseInt(e.target.value))}
                  className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="10"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Available Themes - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle
            className="flex items-center justify-between text-lg sm:text-xl cursor-pointer"
            onClick={() => toggleSection("themes")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Available Themes
            </div>
            <div className="sm:hidden">
              {expandedSections.themes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Select all the themes you can provide for your party bags
          </CardDescription>
        </CardHeader>
        <CardContent className={`p-4 sm:p-8 ${!expandedSections.themes ? "hidden sm:block" : ""}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {themeOptions.map((theme) => (
              <div
                key={theme}
                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors"
              >
                <Checkbox
                  id={`theme-${theme}`}
                  checked={details.availableThemes.includes(theme)}
                  onCheckedChange={() => handleArrayToggle(details.availableThemes, theme, "availableThemes")}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label htmlFor={`theme-${theme}`} className="text-sm sm:text-base font-medium cursor-pointer flex-1">
                  {theme}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age Groups - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle
            className="flex items-center justify-between text-lg sm:text-xl cursor-pointer"
            onClick={() => toggleSection("ageGroups")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Suitable Age Groups
            </div>
            <div className="sm:hidden">
              {expandedSections.ageGroups ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            What age groups are your party bags suitable for?
          </CardDescription>
        </CardHeader>
        <CardContent className={`p-4 sm:p-8 ${!expandedSections.ageGroups ? "hidden sm:block" : ""}`}>
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
        </CardContent>
      </Card>

      {/* Customization Options - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle
            className="flex items-center justify-between text-lg sm:text-xl cursor-pointer"
            onClick={() => toggleSection("customization")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Customization Options
            </div>
            <div className="sm:hidden">
              {expandedSections.customization ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">What customization services do you offer?</CardDescription>
        </CardHeader>
        <CardContent className={`p-4 sm:p-8 ${!expandedSections.customization ? "hidden sm:block" : ""}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[
              { key: "personalization", label: "Name personalization available" },
              { key: "customThemes", label: "Custom theme requests accepted" },
              { key: "dietaryOptions", label: "Dietary requirement options" },
              { key: "corporateBranding", label: "Corporate branding available" },
            ].map((option) => (
              <div
                key={option.key}
                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors"
              >
                <Checkbox
                  id={`custom-${option.key}`}
                  checked={details.customization?.[option.key] || false}
                  onCheckedChange={(checked) => handleNestedFieldChange("customization", option.key, checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label
                  htmlFor={`custom-${option.key}`}
                  className="text-sm sm:text-base font-medium cursor-pointer flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery & Collection */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Delivery & Collection Options
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            How will customers receive their party bags?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
              <Checkbox
                id="collection-available"
                checked={details.delivery?.collectionAvailable || false}
                onCheckedChange={(checked) => handleNestedFieldChange("delivery", "collectionAvailable", checked)}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              <Label htmlFor="collection-available" className="text-sm sm:text-base font-medium cursor-pointer flex-1">
                Collection available
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
              <Checkbox
                id="local-delivery"
                checked={details.delivery?.localDelivery || false}
                onCheckedChange={(checked) => handleNestedFieldChange("delivery", "localDelivery", checked)}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              <Label htmlFor="local-delivery" className="text-sm sm:text-base font-medium cursor-pointer flex-1">
                Local delivery available
              </Label>
            </div>
          </div>

          {details.delivery?.localDelivery && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 bg-indigo-50 rounded-xl">
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">Delivery Radius (miles)</Label>
                <Input
                  type="number"
                  min="0"
                  value={details.delivery?.deliveryRadius || ""}
                  onChange={(e) =>
                    handleNestedFieldChange("delivery", "deliveryRadius", Number.parseInt(e.target.value))
                  }
                  className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="10"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">Delivery Fee (£)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.50"
                  value={details.delivery?.deliveryFee || ""}
                  onChange={(e) =>
                    handleNestedFieldChange("delivery", "deliveryFee", Number.parseFloat(e.target.value))
                  }
                  className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="5.00"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">Free Delivery Over (£)</Label>
                <Input
                  type="number"
                  min="0"
                  value={details.delivery?.freeDeliveryThreshold || ""}
                  onChange={(e) =>
                    handleNestedFieldChange("delivery", "freeDeliveryThreshold", Number.parseInt(e.target.value))
                  }
                  className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                  placeholder="50"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-red-50 to-red-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Business Policies
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Set clear expectations for your customers</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Minimum Order Quantity</Label>
              <Input
                type="number"
                min="1"
                value={details.policies?.minimumOrder || ""}
                onChange={(e) => handleNestedFieldChange("policies", "minimumOrder", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="10"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-semibold text-gray-700">Advance Notice Required (days)</Label>
              <Input
                type="number"
                min="0"
                value={details.policies?.advanceNotice || ""}
                onChange={(e) => handleNestedFieldChange("policies", "advanceNotice", Number.parseInt(e.target.value))}
                className="h-10 sm:h-12 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                placeholder="7"
              />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold text-gray-700">Cancellation Policy</Label>
            <Textarea
              value={details.policies?.cancellationPolicy || ""}
              onChange={(e) => handleNestedFieldChange("policies", "cancellationPolicy", e.target.value)}
              placeholder="e.g. Full refund with 48 hours notice, 50% refund with 24 hours notice..."
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold text-gray-700">Payment Terms</Label>
            <Textarea
              value={details.policies?.paymentTerms || ""}
              onChange={(e) => handleNestedFieldChange("policies", "paymentTerms", e.target.value)}
              placeholder="e.g. 50% deposit required, balance due on delivery. We accept bank transfer, cash, or card payments..."
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Offers */}
      <Card>
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Special Offers & Promotions
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Any current promotions or special deals you want to highlight?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-semibold text-gray-700">Current Offers & Promotions</Label>
            <Textarea
              value={details.specialOffers || ""}
              onChange={(e) => handleFieldChange("specialOffers", e.target.value)}
              placeholder="e.g. 10% discount on orders over 30 bags, Free delivery within 5 miles, Buy 2 premium packages get 1 basic free..."
              rows={4}
              className="bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base p-3 sm:p-4 resize-none"
            />
            <p className="text-xs sm:text-sm text-gray-600">
              💡 <strong>Tip:</strong> Mention any bulk discounts, seasonal offers, or loyalty programs you offer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PartyBagsServiceDetails
