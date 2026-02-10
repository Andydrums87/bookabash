// components/packages/StandardPackageManagement.jsx
"use client"

import { PackageIcon, PlusCircle, Loader2, Check, Camera, Upload, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SupplierPackageCard, AddPackageCard } from "@/components/supplier-package-card"

const StandardPackageManagement = ({
  supplierData,
  setSupplierData,
  currentBusiness,
  updateProfile,
  loading,
  saving,
  serviceType = "standard",
  placeholders = {}
}) => {
  const [editingPackage, setEditingPackage] = useState(null)
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [localSaving, setLocalSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [packageFormData, setPackageFormData] = useState({
    name: "",
    description: "",
    price: "",
    weekendPrice: "",
    duration: "",
    features: [""],
    image: "",
    popular: false,
  })

  const imageUploadRef = useRef(null)
  const [packages, setPackages] = useState([])

  // Default placeholders based on service type
  const defaultPlaceholders = {
    entertainment: {
      name: "e.g., Magic Show Package",
      description: "Entertaining magic show with audience participation and balloon animals",
      duration: "e.g., 1 hour",
      feature: "e.g., Professional entertainer"
    },
    venues: {
      name: "e.g., Party Hall Rental",
      description: "Spacious venue perfect for birthday celebrations with tables and chairs",
      duration: "e.g., 4 hours",
      feature: "e.g., Tables and chairs included"
    },
    catering: {
      name: "e.g., Birthday Party Catering",
      description: "Delicious food and catering service for your celebration",
      duration: "e.g., Full day service",
      feature: "e.g., Serving dishes included"
    },
    face_painting: {
      name: "e.g., Face Painting Package",
      description: "Professional face painting with glitter and high-quality paints",
      duration: "e.g., 2 hours",
      feature: "e.g., All materials included"
    },
    decorations: {
      name: "e.g., Balloon Arch Package",
      description: "Beautiful balloon decorations to transform your party space",
      duration: "e.g., Setup included",
      feature: "e.g., Custom color scheme"
    },
    activities: {
      name: "e.g., Bouncy Castle Package",
      description: "Fun inflatable entertainment for active birthday celebrations",
      duration: "e.g., Full day rental",
      feature: "e.g., Setup and safety mats"
    },
    standard: {
      name: "e.g., Ultimate Party Package",
      description: "Describe what makes this package special...",
      duration: "e.g., 2 hours",
      feature: "e.g., Professional service"
    }
  }

  const currentPlaceholders = { 
    ...defaultPlaceholders[serviceType], 
    ...placeholders 
  }

  useEffect(() => {
    const shouldLoad = !loading && supplierData && (
      (currentBusiness?.id) ||
      (!currentBusiness && supplierData)
    )
    
    if (shouldLoad) {
      const packagesToLoad = supplierData.packages || []
      setPackages(packagesToLoad)
    }
  }, [currentBusiness?.id, supplierData])

  // Save packages to backend
  const savePackagesToBackend = async (updatedPackages) => {
    setLocalSaving(true)
    try {
      if (!updateProfile || !supplierData) {
        throw new Error("Required functions not available")
      }

      const updatedSupplierData = {
        ...supplierData,
        packages: updatedPackages,
      }

      const result = await updateProfile(updatedSupplierData, updatedPackages, supplierData.id)

      if (result.success) {
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
    if (pkg) {
      setPackageFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price || "",
        weekendPrice: pkg.weekendPrice || "",
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
        weekendPrice: "",
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
      weekendPrice: "",
      duration: "",
      features: [""],
      image: "",
      popular: false,
    })
  }

  const handleSavePackage = async () => {
    // Validate required fields
    if (!packageFormData.name || !packageFormData.price) {
      alert("Please fill in all required fields (Name, Price)")
      return
    }

    // Filter out empty feature items
    const filteredFeatures = packageFormData.features.filter((item) => item.trim() !== "")

    const newPackageData = {
      ...packageFormData,
      features: filteredFeatures,
      whatsIncluded: filteredFeatures,
      price: Number.parseFloat(packageFormData.price) || 0,
      weekendPrice: packageFormData.weekendPrice ? Number.parseFloat(packageFormData.weekendPrice) : null,
      priceType: "flat",
      image: packageFormData.image,
    }

    let updatedPackages
    setPackages((prevPackages) => {
      if (editingPackage && editingPackage.id) {
        updatedPackages = prevPackages.map((p) => (p.id === editingPackage.id ? { ...p, ...newPackageData } : p))
      } else {
        updatedPackages = [...prevPackages, { ...newPackageData, id: `pkg${Date.now()}` }]
      }
      return updatedPackages
    })

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

  // Get service-specific labels
  const getServiceLabels = () => {
    switch (serviceType) {
      case 'entertainment':
        return {
          title: 'Entertainment Packages',
          description: 'Define your entertainment offerings and performance packages'
        }
      case 'venues':
        return {
          title: 'Venue Packages',
          description: 'Create rental packages for your venue spaces'
        }
      case 'catering':
        return {
          title: 'Catering Packages',
          description: 'Design your food and catering service packages'
        }
      case 'face_painting':
        return {
          title: 'Face Painting Packages',
          description: 'Create packages for your face painting services'
        }
      case 'decorations':
        return {
          title: 'Decoration Packages',
          description: 'Design your decoration and styling packages'
        }
      case 'activities':
        return {
          title: 'Activity Packages',
          description: 'Create packages for your party activities and equipment'
        }
      default:
        return {
          title: 'Service Packages',
          description: 'Define and manage the packages you offer to customers'
        }
    }
  }

  const labels = getServiceLabels()

  return (
    <>
      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50 shadow-lg animate-in slide-in-from-top-2 duration-300 mb-6">
          <Check className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Packages saved successfully! Your changes are now visible to customers.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">{labels.title}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {labels.description}
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

      {/* Package Form Modal */}
      {isPackageFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
              {editingPackage ? "Edit Package" : "Add New Package"}
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
                  placeholder={currentPlaceholders.name}
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
                  placeholder={currentPlaceholders.description}
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
                  <p className="text-xs text-gray-500 mt-1">Sun-Thu rate</p>
                </div>
                <div>
                  <Label htmlFor="package-weekend-price" className="text-sm font-medium">
                    Weekend Price (£)
                  </Label>
                  <Input
                    id="package-weekend-price"
                    type="number"
                    value={packageFormData.weekendPrice}
                    onChange={(e) => handleFormChange("weekendPrice", e.target.value)}
                    placeholder="200"
                    className="mt-1 px-4 py-3 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Fri-Sat rate (optional)</p>
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="package-duration" className="text-sm font-medium">
                  Duration <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="package-duration"
                  value={packageFormData.duration}
                  onChange={(e) => handleFormChange("duration", e.target.value)}
                  placeholder={currentPlaceholders.duration}
                  className="mt-1 px-4 py-3 text-sm"
                />
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
                        placeholder={currentPlaceholders.feature}
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
    </>
  )
}

export default StandardPackageManagement