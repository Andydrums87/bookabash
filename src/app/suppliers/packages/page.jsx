"use client"

import { PackageIcon, PlusCircle, Loader2, Check, Camera, Upload, X, Info } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SupplierPackageCard, AddPackageCard } from "@/components/supplier-package-card"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"
import { GlobalSaveButton } from "@/components/GlobalSaveButton"

const Packages = () => {
  const [editingPackage, setEditingPackage] = useState(null)
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [localSaving, setLocalSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [packageFormData, setPackageFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    features: [""], // Changed from whatsIncluded to features
    image: "", // Changed from imageUrl to image
    popular: false,
  })

  const imageUploadRef = useRef(null)

  // ✅ Use business-aware hooks
  const { supplier, supplierData, setSupplierData, loading, error, refresh, currentBusiness } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()



  const [packages, setPackages] = useState([])


  useEffect(() => {
    console.log('🎯 Main useEffect triggered')
    console.log('  - currentBusiness?.id:', currentBusiness?.id)
    console.log('  - loading:', loading)
    console.log('  - supplierData:', !!supplierData)
    
    // ✅ FIXED: Handle both multi-business AND single business scenarios
    const shouldLoad = !loading && supplierData && (
      // Multi-business mode: wait for currentBusiness
      (currentBusiness?.id) ||
      // Single business mode: no currentBusiness needed
      (!currentBusiness && supplierData)
    )
    
    if (shouldLoad) {
      console.log('✅ Conditions met, proceeding with package loading')
      const businessName = currentBusiness?.name || supplierData?.name || 'Primary Business'
      console.log('🔄 Packages page updating for business:', businessName);
      
      // Reset any form-specific state here
      setSaveSuccess(false);
      setIsPackageFormOpen(false);
      setEditingPackage(null);
      
      // Load packages from supplier data
      console.log("📦 SupplierData exists, checking packages...")
      console.log("📦 Raw supplierData.packages:", supplierData.packages)
      console.log("📦 Type of packages:", typeof supplierData.packages)
      console.log("📦 Is array?:", Array.isArray(supplierData.packages))
      
      const packagesToLoad = supplierData.packages || []
      console.log("📦 Packages to load:", packagesToLoad)
      console.log("📦 Number of packages:", packagesToLoad.length)
      
      setPackages(packagesToLoad)
      
      if (packagesToLoad.length > 0) {
        console.log("📦 Package details:")
        packagesToLoad.forEach((pkg, index) => {
          console.log(`  ${index + 1}. ${pkg.name} - £${pkg.price} (ID: ${pkg.id})`)
        })
      } else {
        console.log("📦 No packages found in supplier data")
      }
    } else {
      console.log('❌ Conditions not met:')
      console.log('  - Not loading?:', !loading)
      console.log('  - Has supplierData?:', !!supplierData)
      console.log('  - Has business ID?:', !!currentBusiness?.id)
      console.log('  - Single business mode?:', !currentBusiness && !!supplierData)
    }
  }, [currentBusiness?.id, loading, supplierData]) // Keep the same dependencies
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
      
      // ✅ Pass the business ID to save to the correct business
      const result = await updateProfile(supplierData, packages, supplier.id)

      if (result.success) {
        console.log("✅ Packages saved successfully for business:", currentBusiness?.name)
        // Update local supplier data
        if (setSupplierData) {
          setSupplierData((prev) => ({
            ...prev,
            packages: updatedPackages,
          }))
        }

        // Trigger supplier updated event
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

  const handleOpenPackageForm = (pkg) => {
    setEditingPackage(pkg)
    // Initialize form data
    if (pkg) {
      setPackageFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price || "",
        duration: pkg.duration || "",
        features: pkg.features || pkg.whatsIncluded || [""],
        image: pkg.image || "", // Changed from imageUrl to image
        popular: pkg.popular || false,
      })
    } else {
      setPackageFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
        features: [""],
        image: "", // Changed from imageUrl to image
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

      // Update form data with new image URL
      setPackageFormData((prev) => ({
        ...prev,
        image: cloudinaryData.secure_url, // Changed from imageUrl to image
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

  // Handle features array changes (was whatsIncluded)
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
      features: [""], // Changed from whatsIncluded to features
      image: "", // Changed from imageUrl to image
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
      whatsIncluded: filteredFeatures, // ✅ Keep both for compatibility
      price: Number.parseFloat(packageFormData.price) || 0,
      priceType: "flat",
      // Ensure image is properly set
      image: packageFormData.image,
    }

    let updatedPackages
    setPackages((prevPackages) => {
      if (editingPackage && editingPackage.id) {
        // Editing existing package
        updatedPackages = prevPackages.map((p) => (p.id === editingPackage.id ? { ...p, ...newPackageData } : p))
      } else {
        // Adding new package
        updatedPackages = [...prevPackages, { ...newPackageData, id: `pkg${Date.now()}` }]
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
      // Auto-save to backend
      await savePackagesToBackend(updatedPackages)
    }
  }

  // Manual save function for save button
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

        {/* Global Save Button - Mobile Optimized */}
        <div className="absolute right-10">
          <GlobalSaveButton position="responsive" onSave={handleManualSave} isLoading={saving} />
        </div>

        {/* Header - Mobile Optimized */}
        <div className="p-4 sm:p-6">
          {/* ✅ Business Context Header */}
          {currentBusiness && (
            <Alert className="border-blue-200 bg-blue-50 mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Managing Packages:</strong> {currentBusiness.name} • {currentBusiness.serviceType} • {currentBusiness.theme}
                {currentBusiness.isPrimary && <span className="ml-2 text-blue-600 font-medium">• Primary Business</span>}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col gap-2 sm:gap-3">
            <h2 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">Packages</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Create and manage service packages to offer customers different options
            </p>
          </div>
        </div>

        {/* Main Content - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl">Service Packages</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Define and manage the packages you offer to customers
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
                  <Button onClick={() => handleOpenPackageForm(null)} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Package
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {packages.length === 0 ? (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                  <PackageIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-base sm:text-lg font-medium text-foreground">No packages yet</h3>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground px-4">
                    Get started by adding your first service package.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => handleOpenPackageForm(null)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Package
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {packages.map((pkg) => (
                    <SupplierPackageCard
                      key={pkg.id}
                      packageData={pkg}
                      onEdit={() => handleOpenPackageForm(pkg)}
                      onDelete={() => handleDeletePackage(pkg.id)}
                    />
                  ))}
                  <AddPackageCard onAdd={() => handleOpenPackageForm(null)} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Package Form Modal - Mobile Optimized */}
        {isPackageFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                {editingPackage ? "Edit Package" : "Add New Package"}
              </h3>

              <div className="space-y-4 sm:space-y-6">
                {/* Package Image - Mobile Optimized */}
                <div>
                  <Label className="text-sm font-medium">Package Image</Label>
                  <div className="mt-2 flex flex-col gap-4">
                    {/* Image Preview */}
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

                    {/* Upload Controls */}
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

                {/* Price and Duration - Mobile Optimized */}
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

                {/* Package Features - Mobile Optimized */}
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

              {/* Form Actions - Mobile Optimized */}
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