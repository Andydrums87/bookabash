"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Camera,
  Trash2,
  Check,
  ImagePlus,
  Video,
  PlusCircle,
  Loader2,
  Info,
  Upload,
  User,
  GripVertical,
  ChevronDown,
  Play,        // Add this
  Edit3,       // Add this  
  ExternalLink, // Add this
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"
import { useBusiness } from "@/contexts/BusinessContext"
import { MediaPageSkeleton } from "./MediaSkeletons"


// Updated helper functions with better thumbnail handling
const getVideoId = (url) => {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return { platform: 'youtube', id: youtubeMatch[1] };
  }

  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return { platform: 'vimeo', id: vimeoMatch[1] };
  }

  return null;
};

// Updated thumbnail function with multiple fallbacks
const getThumbnailUrls = (platform, videoId) => {
  if (platform === 'youtube') {
    return [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/default.jpg`
    ];
  } else if (platform === 'vimeo') {
    return [`https://vumbnail.com/${videoId}.jpg`];
  }
  return [];
};

const getEmbedUrl = (platform, videoId) => {
  if (platform === 'youtube') {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  } else if (platform === 'vimeo') {
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return null;
};

// Debug VideoEmbed - remove overlay completely to see if image shows
const VideoEmbed = ({ video, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempTitle, setTempTitle] = useState(video.title);
  const [tempDescription, setTempDescription] = useState(video.description || '');

  const videoInfo = getVideoId(video.url);
  
  if (!videoInfo) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm mb-2">Invalid video URL. Please use YouTube or Vimeo links.</p>
        <Input
          defaultValue={video.url}
          placeholder="https://youtube.com/... or https://vimeo.com/..."
          className="mb-2"
          onBlur={(e) => onUpdate({ url: e.target.value })}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(videoInfo.platform, videoInfo.id);
  
  const thumbnailUrl = videoInfo.platform === 'youtube' 
    ? `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`
    : `https://vumbnail.com/${videoInfo.id}.jpg`;

  const handleSaveEdit = () => {
    onUpdate({ 
      title: tempTitle, 
      description: tempDescription 
    });
    setIsEditing(false);
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-gray-200">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer "
            onClick={() => setIsPlaying(true)}
          >
            {/* Just the image with a red border to see if it's visible */}
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onLoad={() => console.log(`✅ Thumbnail visible: ${thumbnailUrl}`)}
              onError={() => console.log(`❌ Thumbnail failed: ${thumbnailUrl}`)}
            />

            {/* Temporarily remove ALL overlays to test */}
            {/* NO OVERLAY - just the raw image */}

            {/* Small play button in corner instead of overlay */}
            <div className="absolute bottom-3 right-3 bg-red-600 rounded-full p-2 shadow-lg">
              <Play className="h-4 w-4 text-white" fill="currentColor" />
            </div>

            {/* Platform Badge moved to not overlap image */}
            <div className="absolute top-3 left-3 z-10">
              <span className={`px-2 py-1 text-xs font-medium rounded shadow-sm ${
                videoInfo.platform === 'youtube' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {videoInfo.platform === 'youtube' ? 'YouTube' : 'Vimeo'}
              </span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-100 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="bg-white text-gray-700 p-2 rounded text-xs shadow-sm border"
            title="Edit video details"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-red-500 text-white p-2 rounded text-xs shadow-sm"
            title="Delete video"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
    
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="Video title..."
              className="font-medium"
            />
            <Textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="Video description..."
              rows={2}
              className="text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setTempTitle(video.title);
                  setTempDescription(video.description || '');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              {video.title || 'Untitled Video'}
            </h3>
            {video.description && (
              <p className="text-sm text-gray-600 mb-2">
                {video.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 capitalize">
                {videoInfo.platform}
              </span>
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Watch Video
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const PortfolioGalleryTabContent = () => {
  const [portfolioImages, setPortfolioImages] = useState([])
  const [portfolioVideos, setPortfolioVideos] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [draggedImage, setDraggedImage] = useState(null)
  const [autoSaving, setAutoSaving] = useState(false)
  const [logoTipsOpen, setLogoTipsOpen] = useState(false)
  const [photoTipsOpen, setPhotoTipsOpen] = useState(false)
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [coverPhoto, setCoverPhoto] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [logoTimestamp, setLogoTimestamp] = useState(Date.now())

  const { supplier, supplierData, setSupplierData, loading, error, refresh, currentBusiness } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()
  const { currentBusiness: contextBusiness, getPrimaryBusiness, businesses } = useBusiness()

  const primaryBusiness = getPrimaryBusiness()
  const isPrimaryBusiness = currentBusiness?.isPrimary || false
  const logoSource = primaryBusiness || currentBusiness
  const currentSupplier = logoSource?.data || supplierData

  // Auto-save function that handles all gallery updates
  const autoSaveGallery = async (
    updatedImages = portfolioImages,
    updatedVideos = portfolioVideos,
    updatedCover = coverPhoto,
  ) => {
    if (!updateProfile || !supplierData || !supplier) {
      console.warn("Required functions or data not available for auto-save")
      return
    }

    setAutoSaving(true)
    try {
      console.log("Auto-saving portfolio for business:", currentBusiness?.name)

      const updatedSupplierData = {
        ...supplierData,
        portfolioImages: updatedImages,
        portfolioVideos: updatedVideos,
        coverPhoto: updatedCover,
      }

      const result = await updateProfile(updatedSupplierData, null, supplier.id)

      if (result.success) {
        console.log("Portfolio auto-saved successfully")

        if (setSupplierData) {
          setSupplierData((prev) => ({
            ...prev,
            portfolioImages: updatedImages,
            portfolioVideos: updatedVideos,
            coverPhoto: updatedCover,
          }))
        }

        window.dispatchEvent(
          new CustomEvent("supplierUpdated", {
            detail: { supplierId: result.supplier.id },
          }),
        )

        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
      // Could show a toast notification here instead of alert
      // For now, silently fail to avoid disrupting UX
    } finally {
      setAutoSaving(false)
    }
  }

  // Load data when business switches
  useEffect(() => {
    if (currentBusiness?.id && !loading) {
      console.log("Media page updating for business:", currentBusiness?.name)

      setSaveSuccess(false)
      setEditingImage(null)
      setNewVideoUrl("")

      if (supplierData) {
        setPortfolioImages(supplierData.portfolioImages || [])
        setPortfolioVideos(supplierData.portfolioVideos || [])
        setCoverPhoto(supplierData.coverPhoto || null)
      }

      // Logo loading logic
      const supplierLogo = supplierData?.avatar || supplierData?.image || null
      const primaryLogo = primaryBusiness?.data?.avatar || primaryBusiness?.data?.image || null
      const logoToUse = supplierLogo || primaryLogo

      if (logoToUse !== logoUrl) {
        setLogoUrl(logoToUse)
        setLogoTimestamp(Date.now())
      }
    }
  }, [currentBusiness?.id, loading, supplierData, primaryBusiness])

  // Drag and drop handlers for image reordering
  const handleDragStart = (e, imageId) => {
    setDraggedImage(imageId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e, targetImageId) => {
    e.preventDefault()

    if (!draggedImage || draggedImage === targetImageId) {
      setDraggedImage(null)
      return
    }

    const draggedIndex = portfolioImages.findIndex((img) => img.id === draggedImage)
    const targetIndex = portfolioImages.findIndex((img) => img.id === targetImageId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newImages = [...portfolioImages]
    const [draggedItem] = newImages.splice(draggedIndex, 1)
    newImages.splice(targetIndex, 0, draggedItem)

    setPortfolioImages(newImages)
    setDraggedImage(null)

    // Auto-save the reordered images
    await autoSaveGallery(newImages, portfolioVideos, coverPhoto)
  }

  // Logo upload - already auto-saves, keep as is
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadingLogo(true)

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select a valid image file")
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB")
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "portfolio_images")

      const response = await fetch("https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`)
      }

      const cloudinaryData = await response.json()
      const newLogoUrl = cloudinaryData.secure_url

      const targetBusiness = primaryBusiness || currentBusiness

      if (!targetBusiness) {
        throw new Error("No business found to save logo to")
      }

      const logoUpdateData = {
        avatar: newLogoUrl,
        image: newLogoUrl,
      }

      const result = await updateProfile(logoUpdateData, null, targetBusiness.id)

      if (result.success) {
        setLogoUrl(newLogoUrl)
        setLogoTimestamp(Date.now())

        if (setSupplierData) {
          setSupplierData((prev) => ({
            ...prev,
            avatar: newLogoUrl,
            image: newLogoUrl,
          }))
        }

        window.dispatchEvent(new CustomEvent("businessUpdated"))
        window.dispatchEvent(
          new CustomEvent("supplierUpdated", {
            detail: { supplierId: targetBusiness.id },
          }),
        )

        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Logo upload failed:", error)
      alert(`Failed to upload logo: ${error.message}`)
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = ""
      }
    }
  }

  const handleDeleteLogo = async () => {
    if (confirm("Are you sure you want to delete your logo? This will remove it from ALL your businesses.")) {
      try {
        const targetBusiness = primaryBusiness || currentBusiness

        const logoUpdateData = {
          avatar: null,
          image: null,
        }

        const result = await updateProfile(logoUpdateData, null, targetBusiness.id)

        if (result.success) {
          setLogoUrl(null)
          setLogoTimestamp(Date.now())

          if (setSupplierData) {
            setSupplierData((prev) => ({
              ...prev,
              avatar: null,
              image: null,
            }))
          }

          window.dispatchEvent(new CustomEvent("businessUpdated"))
          window.dispatchEvent(
            new CustomEvent("supplierUpdated", {
              detail: { supplierId: targetBusiness.id },
            }),
          )

          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2000)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error("Failed to delete logo:", error)
        alert(`Failed to delete logo: ${error.message}`)
      }
    }
  }

  // Image upload with auto-save
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploadingImage(true)

    try {
      const newImages = []
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", "portfolio_images")

        const response = await fetch("https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Cloudinary upload failed: ${response.statusText}`)
        }

        const cloudinaryData = await response.json()

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
      }

      const updatedImages = [...portfolioImages, ...newImages]
      setPortfolioImages(updatedImages)

      // Auto-save the new images
      await autoSaveGallery(updatedImages, portfolioVideos, coverPhoto)
    } catch (error) {
      console.error("Upload failed:", error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Delete image with auto-save
  const handleDeleteImage = async (imageId) => {
    if (confirm("Are you sure you want to delete this image?")) {
      const updatedImages = portfolioImages.filter((img) => img.id !== imageId)
      setPortfolioImages(updatedImages)

      // Auto-save after deletion
      await autoSaveGallery(updatedImages, portfolioVideos, coverPhoto)
    }
  }

  // Update image with auto-save
  const handleUpdateImage = async (imageId, updates) => {
    const updatedImages = portfolioImages.map((img) => (img.id === imageId ? { ...img, ...updates } : img))
    setPortfolioImages(updatedImages)
    setEditingImage(null)

    // Auto-save the updated image
    await autoSaveGallery(updatedImages, portfolioVideos, coverPhoto)
  }

  // Add video with auto-save
  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) return

    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/
    if (!videoUrlPattern.test(newVideoUrl)) {
      alert("Please enter a valid YouTube or Vimeo URL")
      return
    }

    const newVideo = {
      id: Date.now(),
      url: newVideoUrl,
      title: `Video ${portfolioVideos.length + 1}`,
    }

    const updatedVideos = [...portfolioVideos, newVideo]
    setPortfolioVideos(updatedVideos)
    setNewVideoUrl("")

    // Auto-save the new video
    await autoSaveGallery(portfolioImages, updatedVideos, coverPhoto)
  }

  // Delete video with auto-save
  const handleDeleteVideo = async (videoId) => {
    const updatedVideos = portfolioVideos.filter((video) => video.id !== videoId)
    setPortfolioVideos(updatedVideos)

    // Auto-save after deletion
    await autoSaveGallery(portfolioImages, updatedVideos, coverPhoto)
  }

  // Update video with debounced auto-save
  const handleUpdateVideo = async (videoId, updates) => {
    const updatedVideos = portfolioVideos.map((video) => (video.id === videoId ? { ...video, ...updates } : video))
    setPortfolioVideos(updatedVideos)

    // Auto-save the updated video (could add debouncing here for better UX)
    await autoSaveGallery(portfolioImages, updatedVideos, coverPhoto)
  }

  if (loading) {
    return <MediaPageSkeleton />
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
                Saved automatically! Your changes are now visible to customers.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Auto-saving indicator */}
        {autoSaving && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:gap-3">
            <h2 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">Upload Media</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Upload Images and Videos to make your profile stand out! Changes save automatically.
            </p>
          </div>
        </div>

        {/* Logo Section - Clean and Balanced */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 bg-primary-400 rounded-t-lg">
              <div className="flex flex-col gap-3">
                <CardTitle className="text-xl sm:text-3xl text-white font-black">Business Logo</CardTitle>
                <CardDescription className="text-sm sm:text-base text-white">
                  Upload your business logo. This will be displayed as your profile avatar.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6">
                {/* Logo Display and Actions - Centered layout */}
                <div className="flex flex-col items-center space-y-6">
                  {/* Logo Display */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                    <Avatar
                      key={`avatar-${logoTimestamp}`}
                      className="w-full h-full border-4 border-gray-200 shadow-lg"
                    >
                      <AvatarImage
                        src={logoUrl ? `${logoUrl}?v=${logoTimestamp}` : "/placeholder.png"}
                        alt="Business Logo"
                        className="object-cover"
                      />
                      <AvatarFallback className="w-full h-full text-gray-400 bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                          <User className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                          <p className="text-lg font-medium text-gray-500">No Logo</p>
                          <p className="text-sm text-gray-400">Upload your logo</p>
                        </div>
                      </AvatarFallback>
                    </Avatar>

                    {/* Upload indicator */}
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <div className="text-center text-white">
                          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                          <p className="text-sm font-medium">Uploading...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Centered below logo */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <Button
                      size="default"
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {logoUrl ? "Change Logo" : "Upload Logo"}
                    </Button>

                    <input
                      ref={logoInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />

                    {logoUrl && (
                      <Button
                        variant="outline"
                        size="default"
                        onClick={handleDeleteLogo}
                        className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Guidelines - Full width below logo and actions */}
                <div className="w-full">
                  <Collapsible open={logoTipsOpen} onOpenChange={setLogoTipsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900"
                      >
                        <div className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">Logo Guidelines</span>
                        </div>
                        {logoTipsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <ul className="space-y-3 text-sm text-blue-800">
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>
                              Use a <strong>square aspect ratio (1:1)</strong> for best results
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>
                              Minimum size: <strong>400×400 pixels</strong>
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>
                              PNG or JPG format with <strong>transparent background</strong> preferred
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>
                              Keep it <strong>simple and recognizable</strong> at small sizes
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Avoid text-heavy logos as they may be hard to read</span>
                          </li>
                        </ul>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photo Gallery Section */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 bg-primary-400 rounded-t-lg">
              <div className="flex flex-col gap-3">
                <CardTitle className="text-xl sm:text-3xl text-white font-black">Photo Gallery</CardTitle>
                <CardDescription className="text-sm sm:text-base text-white">
                  Upload high-quality photos of your services. Drag and drop to reorder them. Changes save
                  automatically.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {portfolioImages.length === 0 ? (
                /* Empty State - Only shown when no photos */
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
              ) : (
                /* Photo Grid - Only shown when photos exist */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
                  {portfolioImages.map((img, index) => (
                    <div
                      key={img.id}
                      className="relative group cursor-move"
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, img.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, img.id)}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-300 transition-colors">
                        <img src={img.src || "/placeholder.svg"} alt={img.alt} className="w-full h-full object-cover" />
                      </div>

                      {/* Drag handle */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white bg-opacity-90 rounded p-1">
                          <GripVertical className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
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
                            handleDeleteImage(img.id)
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-1 rounded text-xs touch-manipulation"
                          title="Delete image"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Image Info */}
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

                  {/* Add Photo Button - Only shown when photos exist */}
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
              )}

              {/* Enhanced Tips - Made collapsible to save space */}
              <div className="mt-6">
                <Collapsible open={photoTipsOpen} onOpenChange={setPhotoTipsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Photo Tips</span>
                      </div>
                      {photoTipsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <ul className="text-blue-700 space-y-2 text-xs sm:text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Upload high-quality images (1200x800px or larger)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Show your services in action with happy customers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>First image will be your main photo - make it count!</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Drag and drop images to change their order</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Include setup photos, action shots, and results</span>
                        </li>
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Video Links Section */}
<div className="p-4 sm:p-6 pt-0">
  <Card className="shadow-sm">
    <CardHeader className="p-4 sm:p-6 bg-primary-400 rounded-t-lg">
      <CardTitle className="text-xl sm:text-3xl text-white font-black">Video Gallery</CardTitle>
      <CardDescription className="text-sm sm:text-base text-white">
        Add YouTube or Vimeo videos showcasing your services. Click thumbnails to play videos inline. Changes save automatically.
      </CardDescription>
    </CardHeader>
    <CardContent className="p-4 sm:p-6">
      {portfolioVideos.length === 0 ? (
        <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <Video className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">
            Add YouTube or Vimeo videos to showcase your services in action
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {portfolioVideos.map((video) => (
            <VideoEmbed
              key={video.id}
              video={video}
              onUpdate={(updates) => handleUpdateVideo(video.id, updates)}
              onDelete={() => handleDeleteVideo(video.id)}
            />
          ))}
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
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
        
        <div className="text-xs text-gray-500">
          <p>Supported formats: YouTube (youtube.com, youtu.be) and Vimeo (vimeo.com)</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

        {/* Image Edit Modal */}
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
