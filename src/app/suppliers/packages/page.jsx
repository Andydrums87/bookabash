"use client"

import { PackageIcon, PlusCircle, Loader2, Check, Camera, Upload, X, Info, AlertTriangle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SupplierPackageCard, AddPackageCard } from "@/components/supplier-package-card"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard, generateVenuePackages } from "@/utils/mockBackend"
import { GlobalSaveButton } from "@/components/GlobalSaveButton"

const Packages = () => {
  const [editingPackage, setEditingPackage] = useState(null)
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [localSaving, setLocalSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [packages, setPackages] = useState([])
  const [isVenue, setIsVenue] = useState(false)
  const [venuePackagesGenerated, setVenuePackagesGenerated] = useState(false)
  const [isSettingUpVenue, setIsSettingupVenue] = useState(false)
  const [venueSetupForm, setVenueSetupForm] = useState({
    hourlyRate: '',
    minimumHours: '3',
    setupTime: '60',
    cleanupTime: '60'
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

  // ✅ Use business-aware hooks
  const { supplier, supplierData, setSupplierData, loading, error, refresh, currentBusiness } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()

  const venueNeedsSetup = isVenue && !supplierData?.serviceDetails?.pricing?.hourlyRate

    // Handle venue setup form
    const handleVenueSetup = async () => {
      if (!venueSetupForm.hourlyRate || parseFloat(venueSetupForm.hourlyRate) <= 0) {
        alert('Please enter a valid hourly rate')
        return
      }
  
      setLocalSaving(true)
      try {
        // Update service details with pricing info
        const updatedServiceDetails = {
          ...supplierData.serviceDetails,
          pricing: {
            ...supplierData.serviceDetails?.pricing,
            hourlyRate: parseFloat(venueSetupForm.hourlyRate),
            setupTime: parseInt(venueSetupForm.setupTime),
            cleanupTime: parseInt(venueSetupForm.cleanupTime)
          },
          availability: {
            ...supplierData.serviceDetails?.availability,
            minimumBookingHours: parseInt(venueSetupForm.minimumHours)
          }
        }
  
        // Generate packages based on the new pricing
        const generatedPackages = generateVenuePackages(updatedServiceDetails, supplierData)
  
        // Save both service details and packages
        const result = await updateProfile(
          { serviceDetails: updatedServiceDetails },
          generatedPackages,
          supplier.id
        )
  
        if (result.success) {
          setPackages(generatedPackages)
          setVenuePackagesGenerated(true)
          setIsSettingupVenue(false)
          alert('Venue packages created successfully!')
        }
      } catch (error) {
        console.error('Failed to setup venue packages:', error)
        alert('Failed to setup venue packages. Please try again.')
      } finally {
        setLocalSaving(false)
      }
    }

  // Check if this is a venue business
  useEffect(() => {
    if (supplierData) {
      const businessIsVenue = supplierData.serviceType === 'venue' || supplierData.category === 'Venues'
      setIsVenue(businessIsVenue)
      console.log('🏢 Business type check:', {
        serviceType: supplierData.serviceType,
        category: supplierData.category,
        isVenue: businessIsVenue
      })
    }
  }, [supplierData])

  // Auto-generate venue packages when venue data is ready
  useEffect(() => {
    if (isVenue && supplierData && !venuePackagesGenerated) {
      const serviceDetails = supplierData.serviceDetails
      const hasHourlyRate = serviceDetails?.pricing?.hourlyRate > 0
      
      console.log('🏢 Checking venue package generation conditions:', {
        isVenue,
        hasServiceDetails: !!serviceDetails,
        hasHourlyRate,
        hourlyRate: serviceDetails?.pricing?.hourlyRate,
        currentPackages: supplierData.packages?.length || 0
      })

      if (hasHourlyRate && (!supplierData.packages || supplierData.packages.length === 0)) {
        console.log('🎯 Auto-generating venue packages...')
        const generatedPackages = generateVenuePackages(serviceDetails)
        console.log('✅ Generated venue packages:', generatedPackages)
        
        if (generatedPackages.length > 0) {
          setPackages(generatedPackages)
          setVenuePackagesGenerated(true)
          // Auto-save the generated packages
          savePackagesToBackend(generatedPackages)
        }
      }
    }
  }, [isVenue, supplierData, venuePackagesGenerated])

  // Load existing packages
  useEffect(() => {
    const shouldLoad = !loading && supplierData && (
      (currentBusiness?.id) ||
      (!currentBusiness && supplierData)
    )
    
    if (shouldLoad && !venuePackagesGenerated) {
      console.log('✅ Loading existing packages for business:', currentBusiness?.name || supplierData?.name)
      
      setSaveSuccess(false)
      setIsPackageFormOpen(false)
      setEditingPackage(null)
      
      const packagesToLoad = supplierData.packages || []
      setPackages(packagesToLoad)
      
      if (packagesToLoad.length > 0) {
        console.log('📦 Loaded packages:', packagesToLoad.map(p => `${p.name} - £${p.price}`))
      }
    }
  }, [currentBusiness?.id, loading, supplierData, venuePackagesGenerated])

  // Save packages to backend
  const savePackagesToBackend = async (updatedPackages) => {
    setLocalSaving(true)
    try {
      console.log("💾 Saving packages for business:", currentBusiness?.name, updatedPackages)
      if (!updateProfile || !supplierData || !supplier) {
        throw new Error("Required functions not available")
      }

      // Update supplier data with new packages
      const updatedSupplierData = {
        ...supplierData,
        packages: updatedPackages,
      }

      console.log("💾 Updated supplier data for business:", currentBusiness?.name, updatedSupplierData)
      
      const result = await updateProfile(supplierData, updatedPackages, supplier.id)

      if (result.success) {
        console.log("✅ Packages saved successfully for business:", currentBusiness?.name)
        
        if (setSupplierData) {
          setSupplierData((prev) => ({
            ...prev,
            packages: updatedPackages,
          }))
        }

        window.dispatchEvent(
          new CustomEvent("supplierUpdated", {
            detail: { supplierId: result.supplier.id },
          }),
        )

        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        return { success: true }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("❌ Failed to save packages:", error)
      alert(`Failed to save packages: ${error.message}`)
      throw error
    } finally {
      setLocalSaving(false)
    }
  }

  // Regenerate venue packages when pricing changes
  const handleRegenerateVenuePackages = async () => {
    if (!isVenue || !supplierData?.serviceDetails) return
    
    console.log('🔄 Regenerating venue packages...')
    const generatedPackages = generateVenuePackages(supplierData.serviceDetails)
    
    if (generatedPackages.length > 0) {
      setPackages(generatedPackages)
      await savePackagesToBackend(generatedPackages)
      alert('Venue packages have been regenerated based on your current pricing!')
    }
  }

  const handleOpenPackageForm = (pkg) => {
    // For venues, don't allow adding custom packages if no hourly rate is set
    if (isVenue && !pkg && (!supplierData?.serviceDetails?.pricing?.hourlyRate || supplierData.serviceDetails.pricing.hourlyRate <= 0)) {
      alert('Please set your hourly rate in Service Details first before creating packages.')
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

    console.log("📷 Uploading package image to Cloudinary for business:", currentBusiness?.name)
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
      console.log("✅ Package image upload successful:", cloudinaryData.secure_url)

      setPackageFormData((prev) => ({
        ...prev,
        image: cloudinaryData.secure_url,
      }))
    } catch (error) {
      console.error("❌ Package image upload failed:", error)
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
    // Validate required fields
    if (!packageFormData.name || !packageFormData.price || !packageFormData.duration) {
      alert("Please fill in all required fields (Name, Price, Duration)")
      return
    }
  
    // Filter out empty feature items
    const filteredFeatures = packageFormData.features.filter((item) => item.trim() !== "")
  
    const newPackageData = {
      ...packageFormData,
      features: filteredFeatures,
      whatsIncluded: filteredFeatures,
      price: Number.parseFloat(packageFormData.price) || 0,
      priceType: "flat",
      image: packageFormData.image,
      // Mark custom packages for venues
      venueSpecific: isVenue,
      isCustom: isVenue ? true : false
    }
  
    let updatedPackages
    setPackages((prevPackages) => {
      // Add this safety check to prevent the "not iterable" error
      const safePackages = Array.isArray(prevPackages) ? prevPackages : []
      
      if (editingPackage && editingPackage.id) {
        // Editing existing package
        updatedPackages = safePackages.map((p) => (p.id === editingPackage.id ? { ...p, ...newPackageData } : p))
      } else {
        // Adding new package
        updatedPackages = [...safePackages, { ...newPackageData, id: `pkg${Date.now()}` }]
      }
      return updatedPackages
    })
  
    // Auto-save to backend
    if (updatedPackages) {
      await savePackagesToBackend(updatedPackages)
    }
  
    handleClosePackageForm()
  }

  const handleDeletePackage = async (packageId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      const updatedPackages = packages.filter((p) => p.id !== packageId)
      setPackages(updatedPackages)
      await savePackagesToBackend(updatedPackages)
    }
  }

  const handleManualSave = async () => {
    await savePackagesToBackend(packages)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    )
  }

  if (venueNeedsSetup) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="shadow-lg p-4">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Setup Your Venue Packages</CardTitle>
              <CardDescription>
                We'll create your venue hire packages automatically based on your hourly rate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your venue packages will include your party time plus 1 hour setup and 1 hour cleanup time.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  />
                  <p className="text-sm text-gray-600">
                    Your base rate per hour for venue hire
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="minimumHours" className="text-base font-semibold">
                    Minimum Party Hours *
                  </Label>
                  <select
                    id="minimumHours"
                    value={venueSetupForm.minimumHours}
                    onChange={(e) => setVenueSetupForm(prev => ({ ...prev, minimumHours: e.target.value }))}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="2">2 hours</option>
                    <option value="3">3 hours (recommended)</option>
                    <option value="4">4 hours</option>
                    <option value="5">5 hours</option>
                  </select>
                </div>
              </div>

              {/* Preview calculation */}
              {venueSetupForm.hourlyRate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Package Preview:</h4>
                  <div className="text-sm space-y-1">
                    <div>Party time: {venueSetupForm.minimumHours} hours</div>
                    <div>Setup + Cleanup: 2 hours included</div>
                    <div>Total venue time: {parseInt(venueSetupForm.minimumHours) + 2} hours</div>
                    <div className="font-semibold text-lg">
                      Package price: £{(parseFloat(venueSetupForm.hourlyRate) * (parseInt(venueSetupForm.minimumHours) + 2)).toFixed(0)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleVenueSetup}
                  disabled={localSaving || !venueSetupForm.hourlyRate}
                  className="flex-1"
                >
                  {localSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Packages...
                    </>
                  ) : (
                    'Create Venue Packages'
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
        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-4 sm:p-6">
            <Alert className="border-green-200 bg-green-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
              <Check className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                Packages saved successfully! Your changes are now visible to customers.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Venue-specific alerts */}
        {isVenue && (
          <div className="p-4 sm:p-6">
            {!supplierData?.serviceDetails?.pricing?.hourlyRate ? (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Set your hourly rate first:</strong> Go to Service Details and set your hourly rate to automatically generate venue packages.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Venue Packages:</strong> Your packages are automatically generated based on your hourly rate (£{supplierData.serviceDetails.pricing.hourlyRate}/hour). 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-2 text-blue-600 underline"
                    onClick={handleRegenerateVenuePackages}
                  >
                    Regenerate packages
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Global Save Button */}
        <div className="absolute right-10">
          <GlobalSaveButton position="responsive" onSave={handleManualSave} isLoading={saving} />
        </div>

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
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl">
                    {isVenue ? 'Venue Hire Packages' : 'Service Packages'}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {isVenue 
                      ? 'Standardized packages based on your hourly rate with setup and cleanup time included'
                      : 'Define and manage the packages you offer to customers'
                    }
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={handleManualSave}
                    disabled={localSaving}
                    className="w-full sm:w-auto bg-transparent"
                  >
                    {localSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>Save Changes ({packages.length})</>
                    )}
                  </Button>
                  <Button 
                    onClick={() => handleOpenPackageForm(null)} 
                    className="w-full sm:w-auto"
                    disabled={isVenue && (!supplierData?.serviceDetails?.pricing?.hourlyRate || supplierData.serviceDetails.pricing.hourlyRate <= 0)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isVenue ? 'Add Custom Package' : 'Add New Package'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {packages.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                  <PackageIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-base sm:text-lg font-medium text-foreground">
                    {isVenue ? 'No venue packages yet' : 'No packages yet'}
                  </h3>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground px-4">
                    {isVenue 
                      ? 'Set your hourly rate in Service Details to automatically generate venue packages.'
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
                    <SupplierPackageCard
                      key={pkg.id}
                      packageData={pkg}
                      onEdit={() => handleOpenPackageForm(pkg)}
                      onDelete={() => handleDeletePackage(pkg.id)}
                      isVenuePackage={isVenue}
                    />
                  ))}
                  {(!isVenue || (isVenue && supplierData?.serviceDetails?.pricing?.hourlyRate > 0)) && (
                    <AddPackageCard onAdd={() => handleOpenPackageForm(null)} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Package Form Modal - Same as before */}
        {isPackageFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                {editingPackage ? "Edit Package" : (isVenue ? "Add Custom Venue Package" : "Add New Package")}
              </h3>

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
                              src={packageFormData.image || "/placeholder.svg"}
                              alt="Package preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleFormChange("image", "")}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded text-xs touch-manipulation"
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
                        className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer touch-manipulation ${
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
                  />
                </div>

                {/* Package Description */}
                <div>
                  <Label htmlFor="package-description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="package-description"
                    value={packageFormData.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    placeholder="Describe what makes this package special..."
                    rows={3}
                    className="mt-1 px-4 py-3 text-sm resize-none"
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
                      value={packageFormData.price}
                      onChange={(e) => handleFormChange("price", e.target.value)}
                      placeholder="150"
                      className="mt-1 px-4 py-3 text-sm"
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
                    />
                  </div>
                </div>

                {/* Package Features */}
                <div>
                  <Label className="text-sm font-medium">Package Features</Label>
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
                            className="px-3 py-3 touch-manipulation"
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
                      className="w-full py-3 touch-manipulation bg-transparent"
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
                <Button onClick={handleSavePackage} disabled={localSaving || uploadingImage} className="flex-1 py-3">
                  {localSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingPackage ? (
                    "Update Package"
                  ) : (
                    "Create Package"
                  )}
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