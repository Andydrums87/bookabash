"use client"

import { useState, useEffect, useRef } from "react"
import { Camera, Trash2, Check, ImagePlus, Video, PlusCircle, Loader2, Info } from "lucide-react"
import { GlobalSaveButton } from "@/components/GlobalSaveButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"

const PortfolioGalleryTabContent = () => {
  const [portfolioImages, setPortfolioImages] = useState([])
  const [portfolioVideos, setPortfolioVideos] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [localSaving, setLocalSaving] = useState(false)
  const [localSaveSuccess, setLocalSaveSuccess] = useState(false)
  const fileInputRef = useRef(null)
  const [coverPhoto, setCoverPhoto] = useState(null) // Declare coverPhoto variable

  // ✅ Use business-aware hooks
  const { supplier, supplierData, setSupplierData, loading, error, refresh, currentBusiness } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()

  // ✅ Reset form state when business switches
  useEffect(() => {
    if (currentBusiness?.id && !loading) {
      console.log('🔄 Portfolio page updating for business:', currentBusiness?.name);
      
      // Reset any form-specific state here
      setLocalSaveSuccess(false);
      setEditingImage(null);
      setNewVideoUrl("");
      
      // Load portfolio data specific to this business
      if (supplierData) {
        console.log("📸 Loading portfolio data from supplierData for business:", currentBusiness?.name)
        setPortfolioImages(supplierData.portfolioImages || [])
        setPortfolioVideos(supplierData.portfolioVideos || [])
        setCoverPhoto(supplierData.coverPhoto || null)
      }
    }
  }, [currentBusiness?.id, loading, supplierData])

  // Save portfolio to backend
  const handleSaveGallery = async (galleryData) => {
    setLocalSaving(true)
    try {
      console.log("💾 Saving portfolio for business:", currentBusiness?.name, galleryData)

      // Check if required functions are available
      if (!updateProfile) {
        throw new Error("updateProfile function not available")
      }
      if (!supplierData) {
        throw new Error("supplierData not available")
      }
      if (!supplier) {
        throw new Error("supplier not available")
      }

      // Update the supplier with portfolio data
      const updatedSupplierData = {
        ...supplierData,
        portfolioImages: galleryData.images,
        portfolioVideos: galleryData.videoLinks,
        coverPhoto: galleryData.coverPhoto,
      }

      console.log("💾 Updated supplier data for business:", currentBusiness?.name, updatedSupplierData)

      // ✅ Pass the business ID to save to the correct business
      const result = await updateProfile(updatedSupplierData, null, supplier.id)

      if (result.success) {
        console.log("✅ Portfolio saved successfully for business:", currentBusiness?.name)
        setPortfolioImages(galleryData.images)
        setPortfolioVideos(galleryData.videoLinks)

        // Update local supplier data
        if (setSupplierData) {
          setSupplierData((prev) => ({
            ...prev,
            portfolioImages: galleryData.images,
            portfolioVideos: galleryData.videoLinks,
            coverPhoto: galleryData.coverPhoto,
          }))
        }

        // Trigger supplier updated event
        window.dispatchEvent(
          new CustomEvent("supplierUpdated", {
            detail: { supplierId: result.supplier.id },
          }),
        )

        setLocalSaveSuccess(true)
        setTimeout(() => setLocalSaveSuccess(false), 3000)
        return { success: true }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("❌ Failed to save portfolio:", error)
      alert(`Failed to save portfolio: ${error.message}`)
      throw error
    } finally {
      setLocalSaving(false)
    }
  }

  // Image upload handler - Upload to Cloudinary
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    console.log("📤 Uploading files to Cloudinary for business:", currentBusiness?.name, files.length)
    setUploadingImage(true)

    try {
      const newImages = []
      for (const file of files) {
        console.log("📤 Processing file:", file.name)

        // Create FormData for Cloudinary upload
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", "portfolio_images")

        console.log("📤 Uploading to Cloudinary...")

        // Upload to Cloudinary
        const response = await fetch("https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ Cloudinary response:", response.status, errorText)
          throw new Error(`Cloudinary upload failed: ${response.statusText}`)
        }

        const cloudinaryData = await response.json()
        console.log("✅ Cloudinary upload successful:", cloudinaryData.secure_url)

        const newImage = {
          id: Date.now() + Math.random(),
          src: cloudinaryData.secure_url,
          alt: `Portfolio image ${portfolioImages.length + newImages.length + 1}`,
          title: file.name.split(".")[0].replace(/[_-]/g, " "),
          description: "",
          originalFileName: file.name,
          fileSize: file.size,
          cloudinaryId: cloudinaryData.public_id,
        }

        newImages.push(newImage)
        console.log("📤 Added new image:", newImage)
      }

      // Update portfolio images state
      setPortfolioImages((prev) => {
        const updated = [...prev, ...newImages]
        console.log("📤 Updated portfolio images:", updated.length, "total")
        return updated
      })

      // Auto-save after upload
      const updatedImages = [...portfolioImages, ...newImages]
      await handleSaveGallery({
        images: updatedImages,
        videoLinks: portfolioVideos,
        coverPhoto: coverPhoto,
      })

      console.log("✅ Upload and save completed")
    } catch (error) {
      console.error("❌ Upload failed:", error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Delete image handler
  const handleDeleteImage = async (imageId) => {
    console.log("🗑️ Deleting image:", imageId, "for business:", currentBusiness?.name)
    if (confirm("Are you sure you want to delete this image?")) {
      const updatedImages = portfolioImages.filter((img) => img.id !== imageId)
      setPortfolioImages(updatedImages)

      // Auto-save after deletion
      await handleSaveGallery({
        images: updatedImages,
        videoLinks: portfolioVideos,
        coverPhoto: coverPhoto,
      })
    }
  }

  // Update image details handler
  const handleUpdateImage = (imageId, updates) => {
    console.log("✏️ Updating image:", imageId, updates, "for business:", currentBusiness?.name)
    setPortfolioImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, ...updates } : img)))
    setEditingImage(null)
  }

  // Add video link handler
  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) return

    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/
    if (!videoUrlPattern.test(newVideoUrl)) {
      alert("Please enter a valid YouTube or Vimeo URL")
      return
    }

    console.log("📹 Adding video for business:", currentBusiness?.name, newVideoUrl)

    const newVideo = {
      id: Date.now(),
      url: newVideoUrl,
      title: `Video ${portfolioVideos.length + 1}`,
    }

    const updatedVideos = [...portfolioVideos, newVideo]
    setPortfolioVideos(updatedVideos)
    setNewVideoUrl("")

    // Auto-save after adding video
    await handleSaveGallery({
      images: portfolioImages,
      videoLinks: updatedVideos,
      coverPhoto: coverPhoto,
    })
  }

  // Delete video handler
  const handleDeleteVideo = async (videoId) => {
    console.log("🗑️ Deleting video:", videoId, "for business:", currentBusiness?.name)
    const updatedVideos = portfolioVideos.filter((video) => video.id !== videoId)
    setPortfolioVideos(updatedVideos)

    // Auto-save after deletion
    await handleSaveGallery({
      images: portfolioImages,
      videoLinks: updatedVideos,
      coverPhoto: coverPhoto,
    })
  }

  // Update video handler
  const handleUpdateVideo = (videoId, updates) => {
    console.log("✏️ Updating video:", videoId, updates, "for business:", currentBusiness?.name)
    setPortfolioVideos((prev) => prev.map((video) => (video.id === videoId ? { ...video, ...updates } : video)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto">
        {/* Success Alert */}
        {localSaveSuccess && (
          <div className="p-4 sm:p-6">
            <Alert className="border-green-200 bg-green-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
              <Check className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                Portfolio updated successfully! Your changes are now visible to customers.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Global Save Button - Mobile Optimized */}
        <div className="absolute right-10">
          <GlobalSaveButton
            position="responsive"
            onSave={() =>
              handleSaveGallery({
                images: portfolioImages,
                videoLinks: portfolioVideos,
                coverPhoto: coverPhoto,
              })
            }
            isLoading={saving}
          />
        </div>

        {/* Header - Mobile Optimized */}
        <div className="p-4 sm:p-6">
          {/* ✅ Business Context Header */}
          {currentBusiness && (
            <Alert className="border-blue-200 bg-blue-50 mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Managing Portfolio:</strong> {currentBusiness.name} • {currentBusiness.serviceType} • {currentBusiness.theme}
                {currentBusiness.isPrimary && <span className="ml-2 text-blue-600 font-medium">• Primary Business</span>}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col gap-2 sm:gap-3">
            <h2 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">Upload Media</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Upload Images and Videos to make your profile stand out!
            </p>
          </div>
        </div>

        {/* Photo Gallery Section - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col gap-3">
                <CardTitle className="text-lg sm:text-xl">Photo Gallery</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Upload high-quality photos of your services. These images will be displayed on your public profile.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {/* Photo Grid - Mobile Optimized */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
                {portfolioImages.map((img, index) => (
                  <div key={img.id} className="relative group">
                    {/* Image Container */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={img.src || "/placeholder.svg"} alt={img.alt} className="w-full h-full object-cover" />
                    </div>

                    {/* Control Buttons - Mobile Optimized */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log("✏️ Edit clicked for:", img.id)
                          setEditingImage(img)
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 sm:p-1 rounded text-xs touch-manipulation"
                        title="Edit image details"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log("🗑️ Delete clicked for:", img.id)
                          handleDeleteImage(img.id)
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-1 rounded text-xs touch-manipulation"
                        title="Delete image"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Image Info - Mobile Optimized */}
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <div className="bg-black bg-opacity-70 text-white text-xs rounded px-2 py-1">
                        {index === 0 && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="font-medium">Main Photo</span>
                          </div>
                        )}
                        <div className="truncate">{img.title || `Image ${index + 1}`}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Photo Button - Mobile Optimized */}
                <div className="aspect-square">
                  <label
                    htmlFor="photo-upload"
                    className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-full cursor-pointer hover:border-blue-500 transition-colors touch-manipulation ${
                      uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400 mb-2" />
                        <span className="text-xs sm:text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
                        <span className="text-xs sm:text-sm text-gray-500 text-center px-2">Add Photo</span>
                      </>
                    )}
                    <input
                      id="photo-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Empty State - Mobile Optimized */}
              {portfolioImages.length === 0 && (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <ImagePlus className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
                    Upload photos to showcase your services to potential customers
                  </p>
                  <label htmlFor="photo-upload-empty" className="cursor-pointer">
                    <Button asChild>
                      <span>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Upload Your First Photo
                      </span>
                    </Button>
                    <input
                      id="photo-upload-empty"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}

              {/* Tips - Mobile Optimized */}
              <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Camera className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium text-blue-800">Photo Tips:</p>
                    <ul className="text-blue-700 space-y-1 text-xs sm:text-sm">
                      <li>• Upload high-quality images (1200x800px or larger)</li>
                      <li>• Show your services in action with happy customers</li>
                      <li>• Include setup photos, action shots, and results</li>
                      <li>• Avoid blurry or poorly lit images</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Links Section - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Video Links</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Add links to YouTube or Vimeo videos showcasing your services in action.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                {portfolioVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 border rounded-lg"
                  >
                    <Video className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1 sm:mt-0" />
                    <div className="flex-1 w-full space-y-2">
                      <Input
                        defaultValue={video.url}
                        placeholder="https://youtube.com/..."
                        className="w-full"
                        onBlur={(e) => handleUpdateVideo(video.id, { url: e.target.value })}
                      />
                      <Input
                        defaultValue={video.title}
                        placeholder="Video title..."
                        className="w-full text-sm"
                        onBlur={(e) => handleUpdateVideo(video.id, { title: e.target.value })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-red-500 hover:text-red-700 p-2 touch-manipulation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Video Form - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Add video link (YouTube or Vimeo)"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddVideo()}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleAddVideo}
                    disabled={!newVideoUrl.trim()}
                    className="w-full sm:w-auto bg-transparent"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Video
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Edit Modal - Mobile Optimized */}
        {editingImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Edit Image Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="image-title"
                    defaultValue={editingImage.title}
                    placeholder="Image title..."
                    className="mt-1"
                    onChange={(e) => setEditingImage((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="image-description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="image-description"
                    defaultValue={editingImage.description}
                    placeholder="Describe what's shown in this image..."
                    rows={3}
                    className="mt-1 resize-none"
                    onChange={(e) => setEditingImage((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" onClick={() => setEditingImage(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateImage(editingImage.id, {
                      title: editingImage.title,
                      description: editingImage.description,
                    })
                  }
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PortfolioGalleryTabContent