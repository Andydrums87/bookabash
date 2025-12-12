"use client"

import { PackageIcon, PlusCircle, Loader2, Camera, Upload, X, Users, Layers, Ruler, Truck, PoundSterling, Package, Trash2, Plus } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SupplierPackageCard, AddPackageCard } from "@/components/supplier-package-card"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"

// Tier options for cake sizes
const TIER_OPTIONS = [
  { value: '1', label: '1 Tier' },
  { value: '2', label: '2 Tier' },
  { value: '3', label: '3 Tier' },
  { value: '4', label: '4 Tier' },
  { value: '5', label: '5+ Tiers' },
]

// Size options in inches
const SIZE_OPTIONS = [
  { value: '4', label: '4"' },
  { value: '6', label: '6"' },
  { value: '8', label: '8"' },
  { value: '10', label: '10"' },
  { value: '12', label: '12"' },
  { value: '14', label: '14"' },
  { value: '16', label: '16"' },
]

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
    feeds: "", // For cake suppliers
    tiers: "", // For cake suppliers
    sizeInches: "", // For cake suppliers
    deliveryFee: "", // For cake suppliers
    features: [""],
    image: "",
    popular: false,
  })

  const imageUploadRef = useRef(null)

  // Use business-aware hooks
  const { supplier, supplierData, loading, currentBusiness, refresh } = useSupplier()
  const { updateProfile } = useSupplierDashboard()

  // Check if this is a cake supplier
  const isCakeSupplier = supplierData?.category?.toLowerCase() === 'cakes' ||
                         supplierData?.serviceType?.toLowerCase() === 'cakes' ||
                         supplierData?.data?.category?.toLowerCase() === 'cakes'

  // Get cover photo from supplier's portfolio images (for cake auto-inheritance)
  const getCoverPhoto = () => {
    const portfolioImages = supplierData?.portfolioImages ||
                           supplierData?.data?.portfolioImages ||
                           supplierData?.serviceDetails?.portfolioImages || []
    return portfolioImages[0] || ""
  }

  // Get description from supplier's about/description (for cake auto-inheritance)
  const getAboutDescription = () => {
    return supplierData?.serviceDetails?.description ||
           supplierData?.data?.serviceDetails?.description ||
           supplierData?.description ||
           ""
  }

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
        feeds: pkg.feeds || pkg.serves || "",
        tiers: pkg.tiers || "",
        sizeInches: pkg.sizeInches || "",
        deliveryFee: pkg.deliveryFee || "",
        features: pkg.features || pkg.whatsIncluded || [""],
        image: pkg.image || "",
        popular: pkg.popular || false,
      })
    } else {
      // For new packages, auto-inherit cover photo and description for cake suppliers
      const defaultImage = isCakeSupplier ? getCoverPhoto() : ""
      const defaultDescription = isCakeSupplier ? getAboutDescription() : ""
      setPackageFormData({
        name: "",
        description: defaultDescription,
        price: "",
        duration: "",
        feeds: "",
        tiers: "",
        sizeInches: "",
        deliveryFee: "",
        features: [""],
        image: defaultImage,
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
      feeds: "",
      tiers: "",
      sizeInches: "",
      deliveryFee: "",
      features: [""],
      image: "",
      popular: false,
    })
  }

  const handleSavePackage = async () => {
    // Different validation for cake vs non-cake suppliers
    if (isCakeSupplier) {
      if (!packageFormData.name || !packageFormData.price) {
        alert("Please fill in all required fields (Name, Price)")
        return
      }
    } else {
      if (!packageFormData.name ||
          !packageFormData.description ||
          !packageFormData.price ||
          !packageFormData.duration) {
        alert("Please fill in all required fields (Name, Description, Price, Duration)")
        return
      }
    }

    const price = Number.parseFloat(packageFormData.price)
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price (numbers only)")
      return
    }

    const filteredFeatures = packageFormData.features.filter((item) => item.trim() !== "")

    // Features are optional for cake suppliers
    if (!isCakeSupplier && filteredFeatures.length === 0) {
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
      // For cakes, store all cake-specific fields
      ...(isCakeSupplier && {
        serves: packageFormData.feeds,
        feeds: packageFormData.feeds,
        tiers: packageFormData.tiers,
        sizeInches: packageFormData.sizeInches,
        deliveryFee: packageFormData.deliveryFee ? parseFloat(packageFormData.deliveryFee) : 0,
      }),
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

  // Open cake size modal for editing
  const handleOpenCakeSizeModal = (pkg = null, index = null) => {
    setEditingPackage(pkg ? { ...pkg, index } : null)
    if (pkg) {
      setPackageFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price || "",
        duration: pkg.duration || "",
        feeds: pkg.feeds || pkg.serves || "",
        tiers: pkg.tiers || "",
        sizeInches: pkg.sizeInches || "",
        deliveryFee: pkg.deliveryFee || "",
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
        feeds: "",
        tiers: "",
        sizeInches: "",
        deliveryFee: "",
        features: [""],
        image: "",
        popular: false,
      })
    }
    setIsPackageFormOpen(true)
  }

  // Save cake size from modal
  const handleSaveCakeSize = async () => {
    if (!packageFormData.name || !packageFormData.price) {
      alert("Please fill in Name and Price")
      return
    }

    const price = Number.parseFloat(packageFormData.price)
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price")
      return
    }

    const newPackageData = {
      id: editingPackage?.id || `pkg${Date.now()}`,
      name: packageFormData.name,
      price: price,
      serves: packageFormData.feeds,
      feeds: packageFormData.feeds,
      tiers: packageFormData.tiers,
      sizeInches: packageFormData.sizeInches,
      deliveryFee: packageFormData.deliveryFee ? parseFloat(packageFormData.deliveryFee) : 0,
    }

    let updatedPackages
    if (editingPackage && editingPackage.index !== null && editingPackage.index !== undefined) {
      updatedPackages = packages.map((p, i) =>
        i === editingPackage.index ? newPackageData : p
      )
    } else {
      updatedPackages = [...packages, newPackageData]
    }

    handleClosePackageForm()
    setPackages(updatedPackages)
    setSavingPackageId(newPackageData.id)

    try {
      const result = await updateProfile({}, updatedPackages, supplier.id)
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      alert(`Failed to save size: ${error.message}`)
      setPackages(packages) // Revert
    } finally {
      setTimeout(() => setSavingPackageId(null), 1000)
    }
  }

  // Delete cake size
  const handleDeleteCakeSize = async (index) => {
    if (packages.length <= 1) {
      alert("You need at least one size")
      return
    }
    if (!window.confirm("Delete this size?")) return

    const originalPackages = packages
    const updatedPackages = packages.filter((_, i) => i !== index)
    setPackages(updatedPackages)

    try {
      const result = await updateProfile({}, updatedPackages, supplier.id)
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      alert(`Failed to delete: ${error.message}`)
      setPackages(originalPackages)
    }
  }

  if (loading || !supplierData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Cake supplier - compact cards with modal editing
  if (isCakeSupplier) {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Sizes & Pricing
          </h1>
          <p className="text-gray-500">
            Add different sizes or options for this cake
          </p>
        </div>

        {/* Compact Size Cards - Horizontal Row */}
        <div className="flex flex-wrap gap-3">
          {packages.map((pkg, index) => (
            <button
              key={pkg.id || index}
              onClick={() => handleOpenCakeSizeModal(pkg, index)}
              className="relative bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 hover:shadow-md transition-all w-[140px] text-left group"
            >
              {savingPackageId === pkg.id && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                </div>
              )}

              {/* Delete button - shows on hover */}
              {packages.length > 1 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCakeSize(index)
                  }}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Card content - flex column */}
              <div className="flex flex-col h-full">
                {/* Size Name */}
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {pkg.name || "Unnamed"}
                </p>

                {/* Specs - stacked vertically */}
                <div className="flex-1 mt-2 space-y-1">
                  {pkg.tiers && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Layers className="w-3 h-3 flex-shrink-0" />
                      <span>{pkg.tiers} tier{pkg.tiers !== '1' ? 's' : ''}</span>
                    </p>
                  )}
                  {pkg.sizeInches && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Ruler className="w-3 h-3 flex-shrink-0" />
                      <span>{pkg.sizeInches}"</span>
                    </p>
                  )}
                  {(pkg.serves || pkg.feeds) && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      <span>Feeds {pkg.serves || pkg.feeds}</span>
                    </p>
                  )}
                </div>

                {/* Price - at bottom */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="font-bold text-gray-900">
                    £{parseFloat(pkg.price || 0).toFixed(2)}
                  </p>
                  {parseFloat(pkg.deliveryFee) > 0 && (
                    <p className="text-xs text-gray-400">
                      +£{parseFloat(pkg.deliveryFee).toFixed(2)} delivery
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Add Size Card */}
          <button
            type="button"
            onClick={() => handleOpenCakeSizeModal(null, null)}
            className="w-[140px] min-h-[130px] border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Add Size</span>
          </button>
        </div>

        {/* Info box */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">
            Tap a size to edit. Set different delivery fees for each size based on weight/tiers.
          </p>
        </div>

        {/* Cake Size Edit Modal */}
        {isPackageFormOpen && (
          <>
            {/* Desktop Modal */}
            <div className="hidden md:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingPackage ? "Edit Size" : "Add New Size"}
                  </h3>
                  <button
                    onClick={handleClosePackageForm}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Size Name */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-900 mb-2">
                      Name this size *
                    </Label>
                    <Input
                      value={packageFormData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="e.g., Small, Medium, Large..."
                      className="h-12 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                    />
                  </div>

                  {/* Tiers and Size Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">Tiers</Label>
                      <div className="relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={packageFormData.tiers}
                          onChange={(e) => handleFormChange("tiers", e.target.value)}
                          className="w-full h-12 pl-10 pr-10 border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none appearance-none bg-white cursor-pointer"
                        >
                          <option value="">Select</option>
                          {TIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">Size (inches)</Label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={packageFormData.sizeInches}
                          onChange={(e) => handleFormChange("sizeInches", e.target.value)}
                          className="w-full h-12 pl-10 pr-10 border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none appearance-none bg-white cursor-pointer"
                        >
                          <option value="">Select</option>
                          {SIZE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Price, Feeds, Delivery */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">Price *</Label>
                      <div className="relative">
                        <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={packageFormData.price}
                          onChange={(e) => handleFormChange("price", e.target.value)}
                          placeholder="45"
                          className="h-12 pl-9 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">Feeds</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={packageFormData.feeds}
                          onChange={(e) => handleFormChange("feeds", e.target.value)}
                          placeholder="10-15"
                          className="h-12 pl-9 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">Delivery</Label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          step="0.50"
                          value={packageFormData.deliveryFee}
                          onChange={(e) => handleFormChange("deliveryFee", e.target.value)}
                          placeholder="5"
                          className="h-12 pl-9 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={handleClosePackageForm} className="flex-1 h-11 bg-transparent">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCakeSize} className="flex-1 h-11 bg-gray-900 hover:bg-gray-800 text-white">
                    {editingPackage ? "Save Changes" : "Add Size"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Sheet */}
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/50" onClick={handleClosePackageForm} />
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                <div className="px-4 pb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingPackage ? "Edit Size" : "Add New Size"}
                    </h3>
                    <button
                      onClick={handleClosePackageForm}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Size Name */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">
                        Name this size *
                      </Label>
                      <Input
                        value={packageFormData.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        placeholder="e.g., Small, Medium, Large..."
                        className="h-12 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                      />
                    </div>

                    {/* Tiers and Size */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="block text-sm font-medium text-gray-900 mb-2">Tiers</Label>
                        <select
                          value={packageFormData.tiers}
                          onChange={(e) => handleFormChange("tiers", e.target.value)}
                          className="w-full h-12 px-4 border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none appearance-none bg-white"
                        >
                          <option value="">Select</option>
                          {TIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-900 mb-2">Size</Label>
                        <select
                          value={packageFormData.sizeInches}
                          onChange={(e) => handleFormChange("sizeInches", e.target.value)}
                          className="w-full h-12 px-4 border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none appearance-none bg-white"
                        >
                          <option value="">Select</option>
                          {SIZE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">Price *</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={packageFormData.price}
                          onChange={(e) => handleFormChange("price", e.target.value)}
                          placeholder="45.00"
                          className="h-12 pl-8 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* Feeds and Delivery */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="block text-sm font-medium text-gray-900 mb-2">Feeds</Label>
                        <Input
                          value={packageFormData.feeds}
                          onChange={(e) => handleFormChange("feeds", e.target.value)}
                          placeholder="10-15"
                          className="h-12 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-900 mb-2">Delivery £</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.50"
                          value={packageFormData.deliveryFee}
                          onChange={(e) => handleFormChange("deliveryFee", e.target.value)}
                          placeholder="5.00"
                          className="h-12 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={handleClosePackageForm} className="flex-1 h-12 bg-transparent">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCakeSize} className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white">
                      {editingPackage ? "Save" : "Add Size"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Non-cake suppliers - original card grid style
  return (
    <div className="w-full">
      {/* Header - matching other tabs (hidden on mobile as modal has title) */}
      <div className="hidden md:block mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Packages
        </h1>
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
                isCake={false}
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
            <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {isCakeSupplier
                    ? (editingPackage ? "Edit Size" : "Add New Size")
                    : (editingPackage ? "Edit Package" : "Add New Package")
                  }
                </h3>
                <button
                  onClick={handleClosePackageForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isCakeSupplier ? (
                /* Cake-specific form matching onboarding wizard */
                <div className="space-y-4">
                  {/* Size Name */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-900 mb-2">
                      Name this size
                    </Label>
                    <Input
                      value={packageFormData.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="e.g., Small, Medium, Large..."
                      className="h-12 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                    />
                  </div>

                  {/* Tiers and Size Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Tiers Dropdown */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">
                        Tiers
                      </Label>
                      <div className="relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={packageFormData.tiers}
                          onChange={(e) => handleFormChange("tiers", e.target.value)}
                          className="w-full h-12 pl-10 pr-10 border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none appearance-none bg-white cursor-pointer"
                        >
                          <option value="">Select tiers</option>
                          {TIER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Size in Inches Dropdown */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">
                        Size (inches)
                      </Label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={packageFormData.sizeInches}
                          onChange={(e) => handleFormChange("sizeInches", e.target.value)}
                          className="w-full h-12 pl-10 pr-10 border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none appearance-none bg-white cursor-pointer"
                        >
                          <option value="">Select size</option>
                          {SIZE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price, Feeds, Delivery Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Price */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">
                        Price
                      </Label>
                      <div className="relative">
                        <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={packageFormData.price}
                          onChange={(e) => handleFormChange("price", e.target.value)}
                          placeholder="45.00"
                          className="h-12 pl-10 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* Feeds */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">
                        Feeds
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={packageFormData.feeds}
                          onChange={(e) => handleFormChange("feeds", e.target.value)}
                          placeholder="10-15"
                          className="h-12 pl-10 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>

                    {/* Delivery Fee */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-900 mb-2">
                        Delivery
                      </Label>
                      <div className="relative">
                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          step="0.50"
                          value={packageFormData.deliveryFee}
                          onChange={(e) => handleFormChange("deliveryFee", e.target.value)}
                          placeholder="5.00"
                          className="h-12 pl-10 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800">
                      Set different delivery fees for each size based on weight/tiers. Larger cakes typically cost more to deliver. Leave empty for free delivery.
                    </p>
                  </div>
                </div>
              ) : (
                /* Non-cake package form (original) */
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
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={handleClosePackageForm} className="flex-1 py-3 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleSavePackage} disabled={uploadingImage} className="flex-1 py-3">
                  {isCakeSupplier
                    ? (editingPackage ? "Update Size" : "Create Size")
                    : (editingPackage ? "Update Package" : "Create Package")
                  }
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default Packages