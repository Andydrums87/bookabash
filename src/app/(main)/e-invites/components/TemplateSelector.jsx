"use client"

import { useState, useEffect } from 'react'
import { TEMPLATES_BY_THEME, getThemeCategory } from '@/lib/inviteTemplates'
import { Card, CardContent } from "@/components/ui/card"
import { Check, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'

export default function TemplateSelector({
  selectedTheme,
  selectedTemplate,
  onSelectTemplate,
  onPreviewGenerated,
  onBack,
  inviteData,
  className = ""
}) {
  const [previewImage, setPreviewImage] = useState(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState(null)
  const templates = TEMPLATES_BY_THEME[selectedTheme] || []
  const themeCategory = getThemeCategory(selectedTheme)

  // Auto-select if only one template
  useEffect(() => {
    if (templates.length === 1 && !selectedTemplate) {
      onSelectTemplate(templates[0].id)
    }
  }, [templates, selectedTemplate, onSelectTemplate])

  // Generate server-side preview when template is selected
  useEffect(() => {
    const generatePreview = async () => {
      if (!selectedTemplate || !inviteData?.childName) return

      setIsLoadingPreview(true)
      setPreviewError(null)

      try {
        const response = await fetch('/api/generate-canvas-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: selectedTemplate,
            childName: inviteData.childName,
            age: inviteData.age,
            date: inviteData.date,
            time: inviteData.time,
            venue: inviteData.venue,
          }),
        })

        const result = await response.json()

        if (result.success && result.imageUrl) {
          setPreviewImage(result.imageUrl)
          // Notify parent of the generated preview URL
          if (onPreviewGenerated) {
            onPreviewGenerated(result.imageUrl)
          }
        } else {
          setPreviewError(result.error || 'Failed to generate preview')
        }
      } catch (err) {
        console.error('Preview generation error:', err)
        setPreviewError('Failed to generate preview')
      } finally {
        setIsLoadingPreview(false)
      }
    }

    generatePreview()
  }, [selectedTemplate, inviteData?.childName, inviteData?.age, inviteData?.date, inviteData?.time, inviteData?.venue])

  const handleTemplateClick = (templateId) => {
    onSelectTemplate(templateId)
  }

  // If only one template, show the full preview directly
  if (templates.length === 1) {
    const template = templates[0]
    const isSelected = selectedTemplate === template.id

    return (
      <div className={className}>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {themeCategory?.icon} {themeCategory?.name} Theme
            </h2>
          </div>
          <p className="text-gray-600">
            Your personalized invitation preview
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="overflow-hidden shadow-xl">
            <CardContent className="p-0">
              {/* Server-side Preview */}
              <div className="relative aspect-[2/3]">
                {isLoadingPreview ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6">
                    {/* Skeleton loader mimicking invite layout */}
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
                      {/* Title skeleton */}
                      <div className="h-8 w-3/4 bg-gray-300 rounded-lg" />
                      {/* Name skeleton */}
                      <div className="h-12 w-1/2 bg-gray-300 rounded-lg" />
                      {/* Age skeleton */}
                      <div className="h-6 w-1/4 bg-gray-300 rounded-full" />
                      {/* Details skeleton */}
                      <div className="mt-8 space-y-3 w-full px-8">
                        <div className="h-4 w-full bg-gray-300 rounded" />
                        <div className="h-4 w-5/6 bg-gray-300 rounded" />
                        <div className="h-4 w-4/6 bg-gray-300 rounded" />
                      </div>
                    </div>
                    <p className="absolute bottom-4 text-gray-500 text-sm">Creating your preview...</p>
                  </div>
                ) : previewImage ? (
                  <img
                    src={previewImage}
                    alt="Invitation Preview"
                    className="w-full h-full object-cover"
                  />
                ) : previewError ? (
                  <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-4">
                    <p className="text-red-500 text-sm text-center">{previewError}</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Loading...</p>
                  </div>
                )}

                {/* Preview badge */}
                {previewImage && (
                  <div className="absolute top-3 left-3 bg-teal-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Preview
                  </div>
                )}

                {isSelected && previewImage && (
                  <div className="absolute top-3 right-3 bg-primary-500 rounded-full p-2 shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Party details summary */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <strong>{inviteData?.childName || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>{' '}
                    <strong>{inviteData?.age || 'Not set'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Date:</span>{' '}
                    <strong>{inviteData?.date || 'Not set'}</strong>
                    {inviteData?.time && <> at <strong>{inviteData.time}</strong></>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template name */}
          <p className="text-center mt-4 text-gray-600">
            Template: <span className="font-semibold">{template.name}</span>
          </p>
        </div>
      </div>
    )
  }

  // Multiple templates - show grid selection (with static thumbnails, server preview on selection)
  return (
    <div className={className}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {themeCategory?.icon} {themeCategory?.name} Templates
          </h2>
        </div>
        <p className="text-gray-600">
          Choose a design for your invitation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id

          return (
            <Card
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className={`
                relative cursor-pointer transition-all duration-200 overflow-hidden
                hover:shadow-lg hover:scale-[1.02]
                ${isSelected
                  ? 'ring-2 ring-primary-500 shadow-lg'
                  : 'hover:ring-1 hover:ring-gray-300'
                }
              `}
            >
              <CardContent className="p-0">
                {/* Thumbnail preview */}
                <div className="relative aspect-[2/3]">
                  {isSelected && isLoadingPreview ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
                      {/* Skeleton loader for grid item */}
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-3 animate-pulse">
                        <div className="h-6 w-3/4 bg-gray-300 rounded" />
                        <div className="h-8 w-1/2 bg-gray-300 rounded" />
                        <div className="h-4 w-1/3 bg-gray-300 rounded-full" />
                        <div className="mt-4 space-y-2 w-full px-4">
                          <div className="h-3 w-full bg-gray-300 rounded" />
                          <div className="h-3 w-4/5 bg-gray-300 rounded" />
                        </div>
                      </div>
                    </div>
                  ) : isSelected && previewImage ? (
                    <img
                      src={previewImage}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-primary-500 rounded-full p-2 shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Template name */}
                <div className="p-3 text-center border-t bg-white">
                  <span className="font-semibold text-gray-800">{template.name}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected template preview */}
      {selectedTemplate && previewImage && (
        <div className="mt-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-center mb-4">Your Preview</h3>
          <Card className="overflow-hidden shadow-xl">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Selected template preview"
                  className="w-full"
                />
                <div className="absolute top-3 left-3 bg-teal-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Preview
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
