"use client"

import { PackageIcon, PlusCircle, Loader2, Camera, Upload, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SupplierPackageCard, AddPackageCard } from "@/components/supplier-package-card"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"

const Packages = () => {
  const [editingPackage, setEditingPackage] = useState(null)
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [packages, setPackages] = useState([])
  const [savingPackageId, setSavingPackageId] = useState(null)

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

  // Load existing packages
  useEffect(() => {
    if (!loading && supplierData) {
      const packagesToLoad = supplierData.packages || []
      setPackages(packagesToLoad)
    }
  }, [loading, supplierData])

  const handleOpenPackageForm = (pkg) => {
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

  if (loading || !supplierData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header - matching other tabs (hidden on mobile as modal has title) */}
      <div className="hidden md:block mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Packages</h1>
        <p className="text-sm text-gray-500">
          Create and manage service packages to offer customers different options
        </p>
      </div>

      {/* Content */}
      {packages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <PackageIcon className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">
            No packages yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by adding your first service package.
          </p>
          <button
            onClick={() => handleOpenPackageForm(null)}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.isArray(packages) && packages.map((pkg) => (
            <div key={pkg.id} className="relative">
              <SupplierPackageCard
                packageData={pkg}
                onEdit={() => handleOpenPackageForm(pkg)}
                onDelete={() => handleDeletePackage(pkg.id)}
              />
              {savingPackageId === pkg.id && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                </div>
              )}
            </div>
          ))}
          <AddPackageCard onAdd={() => handleOpenPackageForm(null)} />
        </div>
      )}

        {/* Package Form Modal */}
        {isPackageFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">
                  {editingPackage ? "Edit Package" : "Add New Package"}
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
  )
}

export default Packages