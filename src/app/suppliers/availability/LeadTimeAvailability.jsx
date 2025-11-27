"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, Info, Truck, Check, Calendar, Settings, Building2 } from "lucide-react"
import { useSupplierDashboard } from "@/utils/mockBackend"
import { GlobalSaveButton } from "@/components/GlobalSaveButton"
import { getAvailabilityConfig } from "../utils/supplierTypes"
import { StickyBottomSaveBar, useAvailabilityChanges } from "@/components/StickyBottomSaveBar"
import { useMemo } from 'react' // Add to existing imports

const LeadTimeAvailabilityContent = ({
  supplier,
  supplierData,
  setSupplierData,
  loading,
  error,
  refresh,
  currentBusiness,
  primaryBusiness,
  businesses,
  supplierCategory,
}) => {
  const { saving, updateProfile } = useSupplierDashboard()

  const isPrimaryBusiness = currentBusiness?.isPrimary || false
  const availabilitySource = primaryBusiness || currentBusiness
  const currentSupplier = availabilitySource?.data || supplierData
  const config = getAvailabilityConfig(supplierCategory)

  const [leadTimeSettings, setLeadTimeSettings] = useState({
    minLeadTimeDays: 3,
    maxLeadTimeDays: 14,
    processingNotes: "",
    stockBased: true,
    unlimitedStock: false,
    stockQuantity: 100,
    restockDays: 7,
    customOrderLeadTime: 7,
    rushOrdersAvailable: false,
    rushOrderFee: 0,
    rushOrderMinHours: 24,
  })

  const [deliverySettings, setDeliverySettings] = useState({
    localDelivery: false,
    deliveryRadius: 10,
    deliveryFee: 5.0,
    freeDeliveryThreshold: 50,
    collectionAvailable: true,
    deliveryDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    deliveryTimeSlots: ["morning", "afternoon"],
  })

  const [advanceBookingDays, setAdvanceBookingDays] = useState(0)
  const [maxBookingDays, setMaxBookingDays] = useState(365)
  const [availabilityNotes, setAvailabilityNotes] = useState("")
  const currentAvailabilityData = useMemo(() => ({
    leadTimeSettings,
    deliverySettings,
    advanceBookingDays,
    maxBookingDays,
    availabilityNotes,
  }), [leadTimeSettings, deliverySettings, advanceBookingDays, maxBookingDays, availabilityNotes])

  const initialAvailabilityData = useMemo(() => ({
    leadTimeSettings: currentSupplier?.leadTimeSettings || {
      minLeadTimeDays: 3,
      maxLeadTimeDays: 14,
      processingNotes: "",
      stockBased: true,
      unlimitedStock: false,
      stockQuantity: 100,
      restockDays: 7,
      customOrderLeadTime: 7,
      rushOrdersAvailable: false,
      rushOrderFee: 0,
      rushOrderMinHours: 24,
    },
    deliverySettings: currentSupplier?.deliverySettings || {
      localDelivery: false,
      deliveryRadius: 10,
      deliveryFee: 5.0,
      freeDeliveryThreshold: 50,
      collectionAvailable: true,
      deliveryDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      deliveryTimeSlots: ["morning", "afternoon"],
    },
    advanceBookingDays: currentSupplier?.advanceBookingDays || 0,
    maxBookingDays: currentSupplier?.maxBookingDays || 365,
    availabilityNotes: currentSupplier?.availabilityNotes || "",
  }), [currentSupplier])

  const { hasChanges, resetChanges } = useAvailabilityChanges(
    currentAvailabilityData,
    initialAvailabilityData
  )

  // Update your handleSave function (remove setSaveSuccess)
  const handleSave = async () => {
    try {
      const targetBusiness = primaryBusiness

      if (!targetBusiness) {
        throw new Error("No primary business found. Cannot save shared availability.")
      }

      console.log("LEAD TIME: Saving to primary business:", targetBusiness.name)

      const availabilityData = {
        availabilityType: "lead_time_based",
        leadTimeSettings: leadTimeSettings,
        deliverySettings: deliverySettings,
        advanceBookingDays: Number(advanceBookingDays),
        maxBookingDays: Number(maxBookingDays),
        availabilityNotes: availabilityNotes,
        availabilityVersion: "2.0",
        lastUpdated: new Date().toISOString(),
      }

      const updatedPrimaryData = {
        ...targetBusiness.data,
        ...availabilityData,
        updatedAt: new Date().toISOString(),
      }

      const result = await updateProfile(updatedPrimaryData, null, targetBusiness.id)

      if (result.success) {
        console.log("LEAD TIME: Availability saved successfully")
        setSupplierData(updatedPrimaryData)
        resetChanges(currentAvailabilityData) // Reset the change tracking
        refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Failed to save lead time availability:", error)
      alert("Failed to save availability: " + error.message)
    }
  }

  // Add discard function
  const handleDiscard = () => {
    // Reset all state to initial values
    if (currentSupplier) {
      setLeadTimeSettings(prev => ({
        ...prev,
        ...(currentSupplier.leadTimeSettings || {
          minLeadTimeDays: 3,
          maxLeadTimeDays: 14,
          processingNotes: "",
          stockBased: true,
          unlimitedStock: false,
          stockQuantity: 100,
          restockDays: 7,
          customOrderLeadTime: 7,
          rushOrdersAvailable: false,
          rushOrderFee: 0,
          rushOrderMinHours: 24,
        })
      }))

      setDeliverySettings(prev => ({
        ...prev,
        ...(currentSupplier.deliverySettings || {
          localDelivery: false,
          deliveryRadius: 10,
          deliveryFee: 5.0,
          freeDeliveryThreshold: 50,
          collectionAvailable: true,
          deliveryDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          deliveryTimeSlots: ["morning", "afternoon"],
        })
      }))

      setAvailabilityNotes(currentSupplier.availabilityNotes || "")
      setAdvanceBookingDays(currentSupplier.advanceBookingDays || 0)
      setMaxBookingDays(currentSupplier.maxBookingDays || 365)
    }
    resetChanges(initialAvailabilityData)
  }

  // Load existing settings
  useEffect(() => {
    const loadAvailabilityData = () => {
      if (currentSupplier) {
        console.log("Loading lead time availability data")
        console.log("Current supplier:", currentSupplier.businessName)
        console.log("Is primary:", isPrimaryBusiness)

        let effectiveSupplier = currentSupplier

        // Inherit from primary business if themed business
        if (!isPrimaryBusiness && primaryBusiness) {
          console.log("INHERITANCE: Using primary business availability for themed business")
          effectiveSupplier = {
            ...currentSupplier,
            leadTimeSettings: primaryBusiness.data?.leadTimeSettings || {},
            deliverySettings: primaryBusiness.data?.deliverySettings || {},
            advanceBookingDays: primaryBusiness.data?.advanceBookingDays || 0,
            maxBookingDays: primaryBusiness.data?.maxBookingDays || 365,
            availabilityNotes: primaryBusiness.data?.availabilityNotes || "",
            _inheritedFromPrimary: true,
          }
        }

        // Load lead time settings
        if (effectiveSupplier.leadTimeSettings) {
          setLeadTimeSettings((prev) => ({
            ...prev,
            ...effectiveSupplier.leadTimeSettings,
          }))
        }

        // Load delivery settings
        if (effectiveSupplier.deliverySettings) {
          setDeliverySettings((prev) => ({
            ...prev,
            ...effectiveSupplier.deliverySettings,
          }))
        }

        // Load other settings
        if (effectiveSupplier.availabilityNotes) {
          setAvailabilityNotes(effectiveSupplier.availabilityNotes)
        }
        if (effectiveSupplier.advanceBookingDays !== undefined) {
          setAdvanceBookingDays(effectiveSupplier.advanceBookingDays)
        }
        if (effectiveSupplier.maxBookingDays !== undefined) {
          setMaxBookingDays(effectiveSupplier.maxBookingDays)
        }
      }
    }

    loadAvailabilityData()
  }, [currentSupplier, isPrimaryBusiness, primaryBusiness])

  const updateLeadTimeSetting = (key, value) => {
    setLeadTimeSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateDeliverySetting = (key, value) => {
    setDeliverySettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // const handleSave = async () => {
  //   try {
  //     // Always save to primary business for shared availability
  //     const targetBusiness = primaryBusiness

  //     if (!targetBusiness) {
  //       throw new Error("No primary business found. Cannot save shared availability.")
  //     }

  //     console.log("LEAD TIME: Saving to primary business:", targetBusiness.name)

  //     const availabilityData = {
  //       availabilityType: "lead_time_based",
  //       leadTimeSettings: leadTimeSettings,
  //       deliverySettings: deliverySettings,
  //       advanceBookingDays: Number(advanceBookingDays),
  //       maxBookingDays: Number(maxBookingDays),
  //       availabilityNotes: availabilityNotes,
  //       availabilityVersion: "2.0",
  //       lastUpdated: new Date().toISOString(),
  //     }

  //     const updatedPrimaryData = {
  //       ...targetBusiness.data,
  //       ...availabilityData,
  //       updatedAt: new Date().toISOString(),
  //     }

  //     const result = await updateProfile(updatedPrimaryData, null, targetBusiness.id)

  //     if (result.success) {
  //       console.log("LEAD TIME: Availability saved successfully")

  //       setSupplierData(updatedPrimaryData)
  //       setSaveSuccess(true)
  //       setTimeout(() => setSaveSuccess(false), 3000)
  //       refresh()
  //     } else {
  //       throw new Error(result.error)
  //     }
  //   } catch (error) {
  //     console.error("Failed to save lead time availability:", error)
  //     alert("Failed to save availability: " + error.message)
  //   }
  // }

  const getCategoryDisplayName = () => {
    const names = {
      "party bags": "Party Bag",
      partybags: "Party Bag",
      party_bags: "Party Bag",
      cakes: "Cake",
      cake: "Cake",
      baker: "Cake",
      bakery: "Cake",
      bouncy_castle: "Bouncy Castle",
      "bouncy castle hire": "Bouncy Castle",
      "inflatable hire": "Inflatable",
      decorations: "Decoration",
      decoration: "Decoration",
      "party decorations": "Decoration",
      "party supplies": "Party Supply",
      party_supplies: "Party Supply",
      activities: "Activity Equipment",
      "soft play": "Soft Play",
      "party equipment": "Party Equipment",
    }
    return names[supplierCategory?.toLowerCase()] || "Product"
  }

  const handleDeliveryDayToggle = (day) => {
    const newDays = deliverySettings.deliveryDays.includes(day)
      ? deliverySettings.deliveryDays.filter((d) => d !== day)
      : [...deliverySettings.deliveryDays, day]

    updateDeliverySetting("deliveryDays", newDays)
  }

  const handleTimeSlotToggle = (slot) => {
    const newSlots = deliverySettings.deliveryTimeSlots.includes(slot)
      ? deliverySettings.deliveryTimeSlots.filter((s) => s !== slot)
      : [...deliverySettings.deliveryTimeSlots, slot]

    updateDeliverySetting("deliveryTimeSlots", newSlots)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading availability settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
    

        <div className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                {getCategoryDisplayName()} Availability Settings
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Configure lead times and processing requirements for your {getCategoryDisplayName().toLowerCase()}{" "}
                business
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Package className="w-3 h-3 mr-1" />
                  {config?.name || "Lead Time Based"}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Building2 className="w-3 h-3 mr-1" />
                  Applies to {businesses?.length || 0} businesses
                </Badge>
              </div>
            </div>
          
          </div>
        </div>

        {/* Configuration Info */}
        <div className="p-4 sm:p-6 pb-0">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">
                    {config?.name || "Lead Time Based"} Availability
                  </h3>
                  <p className="text-sm text-purple-800 mb-3">
                    {config?.description || "Availability based on lead times and stock levels"}
                  </p>
                  <div className="text-sm text-purple-700">
                    <p className="font-medium mb-1">Perfect for:</p>
                    <p>{config?.suitableFor || "Product-based suppliers with stock or processing requirements"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lead-times" className="w-full">
          <div className="px-4 sm:px-6 pb-0">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 p-1 rounded-lg h-auto bg-white border border-gray-200">
              <TabsTrigger
                value="lead-times"
                className="flex flex-col items-center justify-center h-14 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Times</span>
              </TabsTrigger>
              <TabsTrigger
                value="stock"
                className="flex flex-col items-center justify-center h-14 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Stock</span>
              </TabsTrigger>
              <TabsTrigger
                value="delivery"
                className="flex flex-col items-center justify-center h-14 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
              >
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Delivery</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex flex-col items-center justify-center h-14 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="lead-times" className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="py-4 sm:py-6 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Processing Lead Times
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  How much time do you need to prepare orders?
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="min-lead-time" className="text-sm sm:text-base font-semibold">
                      Minimum lead time (days)
                    </Label>
                    <Input
                      id="min-lead-time"
                      type="number"
                      min="1"
                      max="30"
                      value={leadTimeSettings.minLeadTimeDays}
                      onChange={(e) => updateLeadTimeSetting("minLeadTimeDays", Number(e.target.value))}
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                    <p className="text-xs sm:text-sm text-gray-600">Minimum days needed for standard orders</p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="max-lead-time" className="text-sm sm:text-base font-semibold">
                      Maximum lead time (days)
                    </Label>
                    <Input
                      id="max-lead-time"
                      type="number"
                      min="1"
                      max="60"
                      value={leadTimeSettings.maxLeadTimeDays}
                      onChange={(e) => updateLeadTimeSetting("maxLeadTimeDays", Number(e.target.value))}
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                    <p className="text-xs sm:text-sm text-gray-600">Maximum time for complex orders</p>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="custom-lead-time" className="text-sm sm:text-base font-semibold">
                    Custom order lead time (days)
                  </Label>
                  <Input
                    id="custom-lead-time"
                    type="number"
                    min="1"
                    max="30"
                    value={leadTimeSettings.customOrderLeadTime}
                    onChange={(e) => updateLeadTimeSetting("customOrderLeadTime", Number(e.target.value))}
                    className="h-10 sm:h-12 text-sm sm:text-base max-w-md"
                  />
                  <p className="text-xs sm:text-sm text-gray-600">
                    Additional time needed for personalized or custom orders
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-orange-50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="rush-orders"
                      checked={leadTimeSettings.rushOrdersAvailable}
                      onCheckedChange={(checked) => updateLeadTimeSetting("rushOrdersAvailable", checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 mt-1"
                    />
                    <Label htmlFor="rush-orders" className="text-sm sm:text-base font-medium flex-1">
                      Offer rush orders (faster processing for extra fee)
                    </Label>
                  </div>

                  {leadTimeSettings.rushOrdersAvailable && (
                    <div className="ml-6 sm:ml-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3">
                        <Label className="text-xs sm:text-sm font-semibold">Rush order fee (£)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.50"
                          value={leadTimeSettings.rushOrderFee}
                          onChange={(e) => updateLeadTimeSetting("rushOrderFee", Number(e.target.value))}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <Label className="text-xs sm:text-sm font-semibold">Minimum notice (hours)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="72"
                          value={leadTimeSettings.rushOrderMinHours}
                          onChange={(e) => updateLeadTimeSetting("rushOrderMinHours", Number(e.target.value))}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="processing-notes" className="text-sm sm:text-base font-semibold">
                    Processing time notes
                  </Label>
                  <textarea
                    id="processing-notes"
                    value={leadTimeSettings.processingNotes}
                    onChange={(e) => updateLeadTimeSetting("processingNotes", e.target.value)}
                    placeholder="e.g., 'Custom designs require additional time. Rush orders available with 24hr notice for 20% extra charge.'"
                    className="w-full p-3 border rounded-lg h-20 sm:h-24 resize-none text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-gray-600">Explain your processing requirements to customers</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="py-4 sm:py-6 bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Stock & Inventory Management
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  How do you manage stock levels and availability?
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <Checkbox
                      id="stock-based"
                      checked={leadTimeSettings.stockBased}
                      onCheckedChange={(checked) => updateLeadTimeSetting("stockBased", checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 mt-1"
                    />
                    <Label htmlFor="stock-based" className="text-sm sm:text-base font-medium flex-1">
                      Track stock levels (recommended for physical products)
                    </Label>
                  </div>

                  {leadTimeSettings.stockBased && (
                    <div className="ml-4 sm:ml-6 space-y-4 sm:space-y-6 p-4 sm:p-6 bg-green-50 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="unlimited-stock"
                          checked={leadTimeSettings.unlimitedStock}
                          onCheckedChange={(checked) => updateLeadTimeSetting("unlimitedStock", checked)}
                          className="w-4 h-4 sm:w-5 sm:h-5 mt-1"
                        />
                        <Label htmlFor="unlimited-stock" className="text-sm sm:text-base font-medium">
                          Unlimited stock (made to order)
                        </Label>
                      </div>

                      {!leadTimeSettings.unlimitedStock && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="stock-quantity" className="text-sm sm:text-base font-semibold">
                              Current stock quantity
                            </Label>
                            <Input
                              id="stock-quantity"
                              type="number"
                              min="0"
                              value={leadTimeSettings.stockQuantity}
                              onChange={(e) => updateLeadTimeSetting("stockQuantity", Number(e.target.value))}
                              className="h-10 sm:h-12 text-sm sm:text-base"
                            />
                            <p className="text-xs sm:text-sm text-gray-600">
                              How many items you currently have in stock
                            </p>
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="restock-days" className="text-sm sm:text-base font-semibold">
                              Restock time (days)
                            </Label>
                            <Input
                              id="restock-days"
                              type="number"
                              min="1"
                              value={leadTimeSettings.restockDays}
                              onChange={(e) => updateLeadTimeSetting("restockDays", Number(e.target.value))}
                              className="h-10 sm:h-12 text-sm sm:text-base"
                            />
                            <p className="text-xs sm:text-sm text-gray-600">
                              How long it takes to restock when out of stock
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Stock Management Tips</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Set realistic stock quantities to avoid disappointment</li>
                              <li>• Update stock levels regularly after receiving orders</li>
                              <li>• Consider seasonal demand when managing inventory</li>
                              <li>• Use "Made to Order" for custom or personalized items</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="p-4 sm:p-6 space-y-6">
            <Card>
              <CardHeader className="py-6 bg-gradient-to-r from-indigo-50 to-indigo-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  Delivery & Collection Options
                </CardTitle>
                <CardDescription className="text-base">How will customers receive their orders?</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Checkbox
                      id="collection-available"
                      checked={deliverySettings.collectionAvailable}
                      onCheckedChange={(checked) => updateDeliverySetting("collectionAvailable", checked)}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="collection-available" className="text-base font-medium flex-1">
                      Collection available
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Checkbox
                      id="local-delivery"
                      checked={deliverySettings.localDelivery}
                      onCheckedChange={(checked) => updateDeliverySetting("localDelivery", checked)}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="local-delivery" className="text-base font-medium flex-1">
                      Local delivery available
                    </Label>
                  </div>
                </div>

                {deliverySettings.localDelivery && (
                  <div className="space-y-6 p-6 bg-indigo-50 rounded-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Delivery radius (miles)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={deliverySettings.deliveryRadius}
                          onChange={(e) => updateDeliverySetting("deliveryRadius", Number(e.target.value))}
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Delivery fee (£)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.50"
                          value={deliverySettings.deliveryFee}
                          onChange={(e) => updateDeliverySetting("deliveryFee", Number(e.target.value))}
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Free delivery over (£)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={deliverySettings.freeDeliveryThreshold}
                          onChange={(e) => updateDeliverySetting("freeDeliveryThreshold", Number(e.target.value))}
                          className="h-12 text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Delivery days</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                          <div key={day} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                            <Checkbox
                              id={`delivery-${day}`}
                              checked={deliverySettings.deliveryDays.includes(day)}
                              onCheckedChange={() => handleDeliveryDayToggle(day)}
                              className="w-4 h-4"
                            />
                            <Label
                              htmlFor={`delivery-${day}`}
                              className="text-sm font-medium capitalize cursor-pointer"
                            >
                              {day.slice(0, 3)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Delivery time slots</Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          { id: "morning", label: "Morning (9am-1pm)" },
                          { id: "afternoon", label: "Afternoon (1pm-5pm)" },
                        ].map((slot) => (
                          <div key={slot.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                            <Checkbox
                              id={`slot-${slot.id}`}
                              checked={deliverySettings.deliveryTimeSlots.includes(slot.id)}
                              onCheckedChange={() => handleTimeSlotToggle(slot.id)}
                              className="w-4 h-4"
                            />
                            <Label htmlFor={`slot-${slot.id}`} className="text-sm font-medium cursor-pointer">
                              {slot.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="p-4 sm:p-6 space-y-6">
            <Card>
              <CardHeader className="py-6 bg-gradient-to-r from-orange-50 to-orange-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  Booking Rules & Policies
                </CardTitle>
                <CardDescription className="text-base">
                  Set additional booking requirements and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="advance-booking" className="text-base font-semibold">
                      Additional advance notice (days)
                    </Label>
                    <Input
                      id="advance-booking"
                      type="number"
                      min="0"
                      max="30"
                      value={advanceBookingDays}
                      onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-gray-600">Extra buffer time before your lead time kicks in</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="max-booking" className="text-base font-semibold">
                      Maximum advance booking (days)
                    </Label>
                    <Input
                      id="max-booking"
                      type="number"
                      min="1"
                      max="730"
                      value={maxBookingDays}
                      onChange={(e) => setMaxBookingDays(Number(e.target.value))}
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-gray-600">How far ahead customers can place orders</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="availability-notes" className="text-base font-semibold">
                    Additional availability notes
                  </Label>
                  <textarea
                    id="availability-notes"
                    value={availabilityNotes}
                    onChange={(e) => setAvailabilityNotes(e.target.value)}
                    placeholder="Any additional information about delivery schedules, peak seasons, or special requirements..."
                    className="w-full p-3 border rounded-lg h-24 resize-none text-base"
                  />
                  <p className="text-sm text-gray-600">Share any other important information about your availability</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Lead Time Best Practices</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Set realistic lead times that you can consistently meet</li>
                        <li>• Consider peak seasons (Christmas, summer holidays) when setting times</li>
                        <li>• Factor in supplier delays and quality control time</li>
                        <li>• Communicate clearly about rush order availability and costs</li>
                        <li>• Update customers proactively if delays occur</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How It Works */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">How Lead Time Availability Works</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Customers can book any future date that meets your minimum lead time requirements</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>No specific time slots needed - perfect for delivery/pickup dates</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Stock levels automatically prevent overbooking when enabled</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Custom orders get additional processing time automatically</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Delivery options and schedules help coordinate customer expectations</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <StickyBottomSaveBar
          onSave={handleSave}
          onDiscard={handleDiscard}
          isLoading={saving}
          hasChanges={hasChanges}
          changesSummary={`You have unsaved ${getCategoryDisplayName().toLowerCase()} availability changes`}
          saveLabel="Save Lead Time Settings"
        />
    </div>
  )
}

export default LeadTimeAvailabilityContent
