"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten Free" },
  { id: "dairy-free", label: "Dairy Free" },
  { id: "nut-free", label: "Nut Free" },
  { id: "egg-free", label: "Egg Free" },
  { id: "halal", label: "Halal" }
]

const PREDEFINED_IDS = DIETARY_OPTIONS.map(o => o.id)

export default function CakeDietaryStep({ dietaryInfo = [], onChange }) {
  const [selected, setSelected] = useState(
    Array.isArray(dietaryInfo) ? dietaryInfo : []
  )
  const [customInput, setCustomInput] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Separate predefined and custom options
  const customOptions = selected.filter(d => !PREDEFINED_IDS.includes(d))

  const handleToggle = (dietaryId) => {
    const newSelected = selected.includes(dietaryId)
      ? selected.filter(d => d !== dietaryId)
      : [...selected, dietaryId]

    setSelected(newSelected)
    onChange(newSelected)
  }

  const handleAddCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !selected.includes(trimmed)) {
      const newSelected = [...selected, trimmed]
      setSelected(newSelected)
      onChange(newSelected)
      setCustomInput("")
      setShowCustomInput(false)
    }
  }

  const handleRemoveCustom = (option) => {
    const newSelected = selected.filter(d => d !== option)
    setSelected(newSelected)
    onChange(newSelected)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustom()
    } else if (e.key === 'Escape') {
      setShowCustomInput(false)
      setCustomInput("")
    }
  }

  return (
    <div className="py-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Dietary information
        </h1>
        <p className="text-lg text-gray-600">
          Select any dietary options this cake meets
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {DIETARY_OPTIONS.map(option => {
          const isSelected = selected.includes(option.id)
          return (
            <div
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                isSelected
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-white border-white' : 'border-gray-300 bg-white'
              }`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-medium">{option.label}</span>
            </div>
          )
        })}

        {/* Custom options that have been added */}
        {customOptions.map(option => (
          <div
            key={option}
            className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border-2 border-gray-900 text-white"
          >
            <div className="w-5 h-5 rounded border-2 bg-white border-white flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium flex-1">{option}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveCustom(option)
              }}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add custom button or input */}
        {showCustomInput ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-gray-900 bg-white">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter dietary info..."
              className="flex-1 text-gray-900 font-medium bg-transparent outline-none placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
              className="p-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false)
                setCustomInput("")
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add other</span>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          {selected.length} option{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}

      <p className="text-center text-sm text-gray-400 mt-4">
        This step is optional - skip if none apply
      </p>
    </div>
  )
}

export { DIETARY_OPTIONS }
