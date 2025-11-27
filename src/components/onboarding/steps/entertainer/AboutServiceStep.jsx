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
    <div className="py-8 md:py-12 max-w-2xl mx-auto px-4">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-2">
          Describe your service
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          What makes you special?
        </p>
      </div>

      <div className="relative">
        <textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Share what you do and why customers love you..."
          rows={5}
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none text-base"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {wordCount}/{MAX_WORDS}
        </div>
      </div>
    </div>
  )
}
