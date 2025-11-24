"use client"

import { Camera, Upload, X } from "lucide-react"
import { useState } from "react"

export default function VenuePhotosStep({ photos, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedPhotos = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`)

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
          alert(`Failed to upload ${file.name}: ${data.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert(`Failed to upload ${file.name}`)
      }
    }

    onChange([...photos, ...uploadedPhotos])
    setUploading(false)
    setUploadProgress('')
  }

  const removePhoto = (id) => {
    onChange(photos.filter(p => p.id !== id))
  }

  const minPhotos = 5
  const photosNeeded = Math.max(0, minPhotos - photos.length)

  return (
    <div className="py-12">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        Add some photos of your venue
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        You'll need at least {minPhotos} photos to get started. You can add more or make changes later.
      </p>

      {photosNeeded > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-12">
          <p className="text-sm text-blue-900">
            <strong>{photosNeeded} more {photosNeeded === 1 ? 'photo' : 'photos'} needed</strong> to continue
          </p>
        </div>
      )}

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
