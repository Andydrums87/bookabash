"use client"

import { PackageIcon, PlusCircle, Loader2, Check, Camera, Upload, X, Info, AlertTriangle, Clock, Wifi, WifiOff } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SupplierPackageCard, AddPackageCard } from "@/components/supplier-package-card"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard, generateVenuePackages } from "@/utils/mockBackend"
import { cn } from "@/lib/utils"

const Packages = () => {
  const [editingPackage, setEditingPackage] = useState(null)
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [packages, setPackages] = useState([])
  const [isVenue, setIsVenue] = useState(false)
  const [isSettingUpVenue, setIsSettingupVenue] = useState(false)
  const [savingPackageId, setSavingPackageId] = useState(null)
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)
  
  // Simplified venue setup
  const [venueSetupForm, setVenueSetupForm] = useState({
    hourlyRate: ''
  })

  const [packageFormData, setPackageFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    features: [""],
    image: "",
    popular: false,
  })

  const imageUploadRef = useRef(null)

  // Use business-aware hooks
  const { supplier, supplierData, loading, currentBusiness, refresh } = useSupplier()
  const { updateProfile } = useSupplierDashboard()

  const venueNeedsSetup = isVenue && (!supplierData?.serviceDetails?.pricing?.hourlyRate || supplierData.serviceDetails.pricing.hourlyRate <= 0)

  // Check if this is a venue business
  useEffect(() => {
    if (supplierData) {
      const businessIsVenue = supplierData.serviceType === 'venue' || supplierData.category === 'Venues'
      setIsVenue(businessIsVenue)
    }
  }, [supplierData])

  // Load existing packages - SIMPLIFIED
  useEffect(() => {
    if (!loading && supplierData) {
      const packagesToLoad = supplierData.packages || []
      setPackages(packagesToLoad)
      
      // Load existing hourly rate if available
      if (supplierData.serviceDetails?.pricing?.hourlyRate) {
        setVenueSetupForm(prev => ({
          ...prev,
          hourlyRate: supplierData.serviceDetails.pricing.hourlyRate.toString()
        }))
      }
    }
  }, [loading, supplierData])

  // Auto-update venue packages when hourly rate changes in profile
  useEffect(() => {
    // Skip if already updating to prevent loops
    if (isUpdatingPrices || isSettingUpVenue || !supplierData || loading) return
    
    if (isVenue && supplierData.serviceDetails?.pricing?.hourlyRate) {
      const currentHourlyRate = supplierData.serviceDetails.pricing.hourlyRate
      const existingPackages = packages // Use current packages state, not supplierData.packages
      
      // Check if we have venue packages that need updating
      const hasVenuePackages = existingPackages.some(pkg => pkg.isGenerated || pkg.venueSpecific)
      
      if (hasVenuePackages) {
        // Find the current venue package
        const currentVenuePackage = existingPackages.find(pkg => pkg.isGenerated || pkg.venueSpecific)
        
        // Calculate what the price should be with current hourly rate
        const expectedPrice = currentHourlyRate * 4 // 2 hours party + 1 hour setup + 1 hour cleanup = 4 hours total
        
        // Only update if the price is actually different
        if (currentVenuePackage && currentVenuePackage.price !== expectedPrice) {
          console.log('Hourly rate changed - updating venue packages:', {
            oldPrice: currentVenuePackage.price,
            newPrice: expectedPrice,
            newHourlyRate: currentHourlyRate
          })
          
          setIsUpdatingPrices(true)
          
          // Regenerate packages with new hourly rate
          const updatedServiceDetails = {
            ...supplierData.serviceDetails,
            pricing: {
              ...supplierData.serviceDetails.pricing,
              hourlyRate: currentHourlyRate
            }
          }
          
          const regeneratedPackages = generateVenuePackages(updatedServiceDetails, supplierData)
          
          // Update packages immediately
          setPackages(regeneratedPackages)
          
          // Save updated packages to backend
          updateProfile({}, regeneratedPackages, supplier.id)
            .then(result => {
              if (result.success) {
                console.log('Venue packages updated successfully for new hourly rate')
              }
            })
            .catch(error => {
              console.error('Failed to update venue packages:', error)
            })
            .finally(() => {
              setTimeout(() => setIsUpdatingPrices(false), 1000)
            })
        }
      }
    }
  }, [
    supplierData?.serviceDetails?.pricing?.hourlyRate, // Only watch hourly rate changes
    isVenue, 
    packages, // Watch current packages state instead of supplierData.packages
    isUpdatingPrices, 
    isSettingUpVenue, 
    loading
    // REMOVED: supplierData, supplier?.id, updateProfile to prevent loops
  ])

  // SIMPLIFIED venue setup
  const handleVenueSetup = async () => {
    console.log('=== VENUE SETUP STARTED ===')
    console.log('Form hourly rate:', venueSetupForm.hourlyRate)
    
    if (!venueSetupForm.hourlyRate || parseFloat(venueSetupForm.hourlyRate) <= 0) {
      alert('Please enter a valid hourly rate')
      return
    }

    setIsSettingupVenue(true)

    try {
      const hourlyRate = parseFloat(venueSetupForm.hourlyRate)
      
      const updatedServiceDetails = {
        ...supplierData.serviceDetails,
        pricing: {
          ...supplierData.serviceDetails?.pricing,
          hourlyRate: hourlyRate,
        },
        availability: {
          ...supplierData.serviceDetails?.availability,
          minimumBookingHours: 2 // Changed from 4 to 2 for party time
        }
      }

      const generatedPackages = generateVenuePackages(updatedServiceDetails, supplierData)
      
      // Save to backend first
      const result = await updateProfile(
        { serviceDetails: updatedServiceDetails },
        generatedPackages,
        supplier.id
      )

      if (result.success) {
        // Update local state immediately
        setPackages(generatedPackages)
        
        // Force refresh supplier data to ensure consistency
        if (refresh) {
          await refresh()
        }
        
        alert('Venue packages created successfully!')
      } else {
        throw new Error(result.error)
      }
      
    } catch (error) {
      console.error('Venue setup error:', error)
      alert(`Failed to setup venue packages: ${error.message}`)
    } finally {
      setIsSettingupVenue(false)
    }
  }

  const handleOpenPackageForm = (pkg) => {
    if (isVenue && !pkg && (!supplierData?.serviceDetails?.pricing?.hourlyRate || supplierData.serviceDetails.pricing.hourlyRate <= 0)) {
      alert('Please set your hourly rate first before creating packages.')
      return
    }

    setEditingPackage(pkg)
    if (pkg) {
      setPackageFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price || "",
        duration: pkg.duration || "",
        features: pkg.features || pkg.whatsIncluded || [""],
        image: pkg.image || "",
        popular: pkg.popular || false,
      })
    } else {
      setPackageFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
        features: [""],
        image: "",
        popular: false,
      })
    }
    setIsPackageFormOpen(true)
  }

  // Handle image upload to Cloudinary
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "portfolio_images")

      const response = await fetch("https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`)
      }

      const cloudinaryData = await response.json()
      setPackageFormData((prev) => ({
        ...prev,
        image: cloudinaryData.secure_url,
      }))
    } catch (error) {
      console.error("Image upload failed:", error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setUploadingImage(false)
      if (imageUploadRef.current) {
        imageUploadRef.current.value = ""
      }
    }
  }

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setPackageFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle features array changes
  const handleFeatureChange = (index, value) => {
    setPackageFormData((prev) => ({
      ...prev,
      features: prev.features.map((item, i) => (i === index ? value : item)),
    }))
  }

  const addFeatureItem = () => {
    setPackageFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }))
  }

  const removeFeatureItem = (index) => {
    setPackageFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleClosePackageForm = () => {
    setIsPackageFormOpen(false)
    setEditingPackage(null)
    setPackageFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      features: [""],
      image: "",
      popular: false,
    })
  }

  const handleSavePackage = async () => {
    if (!packageFormData.name || 
        !packageFormData.description || 
        !packageFormData.price || 
        !packageFormData.duration) {
      alert("Please fill in all required fields (Name, Description, Price, Duration)")
      return
    }

    const price = Number.parseFloat(packageFormData.price)
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price (numbers only)")
      return
    }

    const filteredFeatures = packageFormData.features.filter((item) => item.trim() !== "")
    if (filteredFeatures.length === 0) {
      alert("Please add at least one package feature")
      return
    }

    const newPackageData = {
      ...packageFormData,
      features: filteredFeatures,
      whatsIncluded: filteredFeatures,
      price: price,
      priceType: "flat",
      image: packageFormData.image,
      venueSpecific: isVenue,
      isCustom: isVenue ? true : false
    }

    let updatedPackages
    let packageId
    
    if (editingPackage && editingPackage.id) {
      packageId = editingPackage.id
      updatedPackages = packages.map((p) => 
        p.id === editingPackage.id ? { ...p, ...newPackageData } : p
      )
    } else {
      packageId = `pkg${Date.now()}`
      updatedPackages = [...packages, { ...newPackageData, id: packageId }]
    }

    handleClosePackageForm()
    setPackages(updatedPackages)
    setSavingPackageId(packageId)
    
    try {
      const result = await updateProfile({}, updatedPackages, supplier.id)
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      alert(`Failed to save package: ${error.message}`)
      // Revert on error
      setPackages(packages)
    } finally {
      setTimeout(() => setSavingPackageId(null), 1000)
    }
  }

  const handleDeletePackage = async (packageId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      const originalPackages = packages
      const updatedPackages = packages.filter((p) => p.id !== packageId)
      setPackages(updatedPackages)

      try {
        const result = await updateProfile({}, updatedPackages, supplier.id)
        if (!result.success) {
          throw new Error(result.error)
        }
      } catch (error) {
        alert(`Failed to delete package: ${error.message}`)
        // Revert on error
        setPackages(originalPackages)
      }
    }
  }

  if (venueNeedsSetup) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="shadow-lg p-4">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Set Your Hourly Rate</CardTitle>
              <CardDescription>
                We'll create your venue packages automatically based on your hourly rate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your venue packages include 2 hours party time plus 1 hour setup and 1 hour cleanup time (4 hours total).
                </AlertDescription>
              </Alert>

              <div className="max-w-md mx-auto">
                <div className="space-y-3">
                  <Label htmlFor="hourlyRate" className="text-base font-semibold">
                    Hourly Rate (£) *
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="1"
                    value={venueSetupForm.hourlyRate}
                    onChange={(e) => setVenueSetupForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="50"
                    className="text-lg h-12"
                    disabled={isSettingUpVenue}
                  />
                  <p className="text-sm text-gray-600">
                    Your base rate per hour for venue hire
                  </p>
                </div>
              </div>

              {/* Preview calculation */}
              {venueSetupForm.hourlyRate && !isSettingUpVenue && (
                <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                  <h4 className="font-semibold mb-2">Package Preview:</h4>
                  <div className="text-sm space-y-1">
                    <div>Party time: 4 hours</div>
                    <div>Setup + Cleanup: 2 hours included</div>
                    <div>Total venue time: 4 hours</div>
                    <div className="font-semibold text-lg text-green-600">
                      Package price: £{(parseFloat(venueSetupForm.hourlyRate) * 4).toFixed(0)}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isSettingUpVenue && (
                <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Creating your venue package...</h4>
                      <p className="text-sm text-blue-700">Saving to your account and updating display</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1"
                  disabled={isSettingUpVenue}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleVenueSetup}
                  disabled={isSettingUpVenue || !venueSetupForm.hourlyRate}
                  className="flex-1"
                >
                  {isSettingUpVenue ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Packages...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Venue Packages
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Venue-specific alerts */}
        {/* {isVenue && (
          <div className="p-4 sm:p-6">
            {isUpdatingPrices ? (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  <strong>Updating packages:</strong> Your venue packages are being updated based on your new hourly rate...
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Venue Packages:</strong> Your packages are automatically generated based on your hourly rate (£{supplierData?.serviceDetails?.pricing?.hourlyRate}/hour).
                </AlertDescription>
              </Alert>
            )}
          </div>
        )} */}

        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:gap-3">
            <h2 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">
              {isVenue ? 'Venue Packages' : 'Packages'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {isVenue 
                ? 'Your venue packages are automatically generated based on your hourly rate and can be customized'
                : 'Create and manage service packages to offer customers different options'
              }
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
        
            
            <CardContent className="p-4 sm:p-6 pt-0">
              {packages.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                  <PackageIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-base sm:text-lg font-medium text-foreground">
                    {isVenue ? 'No venue packages yet' : 'No packages yet'}
                  </h3>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground px-4">
                    {isVenue 
                      ? 'Set your hourly rate to automatically generate venue packages.'
                      : 'Get started by adding your first service package.'
                    }
                  </p>
                  {!isVenue && (
                    <div className="mt-6">
                      <Button onClick={() => handleOpenPackageForm(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Package
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                 {Array.isArray(packages) && packages.map((pkg) => (
                    <div key={pkg.id} className="relative">
                      <SupplierPackageCard
                        packageData={pkg}
                        onEdit={() => handleOpenPackageForm(pkg)}
                        onDelete={() => handleDeletePackage(pkg.id)}
                        isVenuePackage={isVenue}
                      />
                      {savingPackageId === pkg.id && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {(!isVenue || (isVenue && supplierData?.serviceDetails?.pricing?.hourlyRate > 0)) && (
                    <AddPackageCard onAdd={() => handleOpenPackageForm(null)} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Package Form Modal */}
        {isPackageFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">
                  {editingPackage ? "Edit Package" : (isVenue ? "Add Custom Venue Package" : "Add New Package")}
                </h3>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Package Image */}
                <div>
                  <Label className="text-sm font-medium">Package Image</Label>
                  <div className="mt-2 flex flex-col gap-4">
                    <div className="flex justify-center sm:justify-start">
                      <div className="relative w-full max-w-xs sm:w-48 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                        {packageFormData.image ? (
                          <>
                            <img
                              src={packageFormData.image}
                              alt="Package preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleFormChange("image", "")}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded text-xs"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Camera className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                            <span className="text-xs sm:text-sm">No image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="package-image-upload"
                        className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                          uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {packageFormData.image ? "Change Image" : "Upload Image"}
                          </>
                        )}
                      </label>
                      <input
                        id="package-image-upload"
                        ref={imageUploadRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-gray-500">Upload a high-quality image that represents this package</p>
                    </div>
                  </div>
                </div>

                {/* Package Name */}
                <div>
                  <Label htmlFor="package-name" className="text-sm font-medium">
                    Package Name *
                  </Label>
                  <Input
                    id="package-name"
                    value={packageFormData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="e.g., Ultimate Party Package"
                    className="mt-1 px-4 py-3 text-sm"
                    required
                  />
                </div>

                {/* Package Description */}
                <div>
                  <Label htmlFor="package-description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="package-description"
                    value={packageFormData.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    placeholder="Describe what makes this package special..."
                    rows={3}
                    className="mt-1 px-4 py-3 text-sm resize-none"
                    required
                  />
                </div>

                {/* Price and Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="package-price" className="text-sm font-medium">
                      Price (£) *
                    </Label>
                    <Input
                      id="package-price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={packageFormData.price}
                      onChange={(e) => handleFormChange("price", e.target.value)}
                      placeholder="150"
                      className="mt-1 px-4 py-3 text-sm"
                      required
                    />
                    {isVenue && supplierData?.serviceDetails?.pricing?.hourlyRate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Your hourly rate: £{supplierData.serviceDetails.pricing.hourlyRate}/hour
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="package-duration" className="text-sm font-medium">
                      Duration *
                    </Label>
                    <Input
                      id="package-duration"
                      value={packageFormData.duration}
                      onChange={(e) => handleFormChange("duration", e.target.value)}
                      placeholder="e.g., 2 hours"
                      className="mt-1 px-4 py-3 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Package Features */}
                <div>
                  <Label className="text-sm font-medium">Package Features *</Label>
                  <p className="text-xs text-gray-500 mb-2">Add at least one feature that's included in this package</p>
                  <div className="space-y-3 mt-2">
                    {packageFormData.features.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="e.g., Professional entertainer"
                          className="flex-1 px-4 py-3 text-sm"
                        />
                        {packageFormData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeatureItem(index)}
                            className="px-3 py-3"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeatureItem}
                      className="w-full py-3 bg-transparent"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Feature
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={handleClosePackageForm} className="flex-1 py-3 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleSavePackage} disabled={uploadingImage} className="flex-1 py-3">
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Packages