"use client"

import { useState } from "react"

const MAX_WORDS = 120

export default function AboutServiceStep({ serviceDetails, onChange }) {
  const [description, setDescription] = useState(serviceDetails?.description || "")

  // Word count for description
  const getWordCount = (text) => {
    if (!text || text.trim() === "") return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const wordCount = getWordCount(description)

  const handleDescriptionChange = (text) => {
    const words = getWordCount(text)
    if (words <= MAX_WORDS) {
      setDescription(text)
      onChange({ ...serviceDetails, description: text })
    }
  }

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          About your service
        </h1>
        <p className="text-lg text-gray-600">
          Help customers understand what you offer
        </p>
      </div>

      <div className="space-y-6">
        {/* Description textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Your Business Story
          </label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Tell customers about your business, your passion for entertainment, what makes you unique, and why families love choosing you for their special occasions..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-base"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-2 py-1 rounded">
              {wordCount}/{MAX_WORDS} words
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share your story, highlight what makes you different, and mention any awards or recognition.
          </p>
        </div>

      </div>
    </div>
  )
}
