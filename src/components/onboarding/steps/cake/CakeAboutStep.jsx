"use client"

import { useState } from "react"

export default function CakeAboutStep({ description = "", onChange }) {
  const [text, setText] = useState(description || "")

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length
  const maxWords = 300

  const handleChange = (e) => {
    const newText = e.target.value
    const words = newText.trim() === '' ? [] : newText.trim().split(/\s+/).filter(w => w.length > 0)
    if (words.length <= maxWords) {
      setText(newText)
      onChange(newText)
    }
  }

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          About this cake
        </h1>
        <p className="text-lg text-gray-600">
          Tell customers what makes this cake special
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{wordCount}</span>/{maxWords} words
          </span>
        </div>

        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Describe this cake - what it looks like, what makes it special, any customisation options available..."
          className="w-full min-h-[200px] p-4 text-lg text-gray-900 placeholder-gray-400 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none resize-none"
        />

        <p className="text-sm text-gray-500 text-center">
          This description will appear in your listing and be used for package descriptions
        </p>
      </div>
    </div>
  )
}
