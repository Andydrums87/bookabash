"use client"

import { Camera, Upload, X, AlertCircle } from "lucide-react"
import { useState } from "react"

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export default function VenuePhotosStep({
  photos,
  onChange,
  minPhotos: customMinPhotos,
  title,
  subtitle
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadError, setUploadError] = useState('')

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported format. Please use JPG, PNG, or WebP.`
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" is too large (${formatFileSize(file.size)}). Maximum file size is ${MAX_FILE_SIZE_MB}MB.`
    }
    return null
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadError('')

    // Validate all files first
    const validationErrors = []
    const validFiles = []
    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        validationErrors.push(error)
      } else {
        validFiles.push(file)
      }
    }

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join('\n'))
      if (validFiles.length === 0) return
    }

    setUploading(true)
    const uploadedPhotos = []

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}...`)

      try {
        // Upload to Cloudinary via API
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'venue_photos')

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (data.success) {
          uploadedPhotos.push({
            id: Date.now() + Math.random(),
            src: data.url,
            alt: `Portfolio image ${uploadedPhotos.length + 1}`,
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            fileSize: file.size,
            description: "",
            cloudinaryId: data.public_id,
            originalFileName: file.name
          })
        } else {
          console.error('Upload failed:', data.error)
          setUploadError(`Failed to upload "${file.name}": ${data.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        setUploadError(`Failed to upload "${file.name}". Please check your connection and try again.`)
      }
    }

    onChange([...photos, ...uploadedPhotos])
    setUploading(false)
    setUploadProgress('')
  }

  const removePhoto = (id) => {
    onChange(photos.filter(p => p.id !== id))
  }

  const minPhotos = customMinPhotos ?? 2
  const photosNeeded = Math.max(0, minPhotos - photos.length)

  // Use custom title/subtitle or defaults
  const displayTitle = title || "Add some photos of your venue"
  const displaySubtitle = subtitle || `You'll need at least ${minPhotos} photos to get started. You can add more or make changes later.`

  return (
    <div className="py-12">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        {displayTitle}
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        {displaySubtitle}
      </p>

      {photosNeeded > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>{photosNeeded} more {photosNeeded === 1 ? 'photo' : 'photos'} needed</strong> to continue
          </p>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Upload failed</p>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{uploadError}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-6">
        Accepted formats: JPG, PNG, WebP. Maximum file size: {MAX_FILE_SIZE_MB}MB per image.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing photos */}
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
            <img
              src={photo.src}
              alt={photo.alt || "Venue"}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removePhoto(photo.id)}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-900 transition-colors cursor-pointer flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="text-center">
            {uploading ? (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 animate-bounce" />
                <p className="text-sm text-gray-600">{uploadProgress}</p>
              </>
            ) : (
              <>
                <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900">Add photos</p>
                <p className="text-xs text-gray-500 mt-1">Click to upload</p>
              </>
            )}
          </div>
        </label>
      </div>

      <div className="mt-8">
        <p className="text-sm text-gray-600">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'} uploaded
        </p>
      </div>
    </div>
  )
}
