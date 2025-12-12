"use client"

import { useState, useRef, useEffect } from "react"
import { Cake } from "lucide-react"

const MAX_NAME_LENGTH = 50

export default function CakeBusinessStep({ cakeBusinessDetails, onChange }) {
  const [localData, setLocalData] = useState(cakeBusinessDetails || {
    businessName: "",
    postcode: "",
    city: "",
    fullAddress: "",
    latitude: null,
    longitude: null
  })

  const nameRef = useRef(null)
  const isInternalUpdate = useRef(false)

  // Sync ref content when businessName changes externally
  useEffect(() => {
    if (nameRef.current && !isInternalUpdate.current) {
      if (nameRef.current.textContent !== localData.businessName) {
        nameRef.current.textContent = localData.businessName
      }
    }
    isInternalUpdate.current = false
  }, [localData.businessName])

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onChange(updated)
  }

  const handleNameChange = (text) => {
    isInternalUpdate.current = true
    if (text.length <= MAX_NAME_LENGTH) {
      handleChange('businessName', text)
    }
  }

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Tell us about your cake business
        </h1>
        <p className="text-lg text-gray-600">
          This information helps customers find you
        </p>
      </div>

      <div className="space-y-8">
        {/* Business Name - Large editable like CompanyNameStep */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-base font-medium text-gray-900">
              Business Name
            </label>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">{localData.businessName?.length || 0}</span>/{MAX_NAME_LENGTH}
            </p>
          </div>
          <div
            ref={nameRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              const text = e.currentTarget.textContent || ''
              if (text.length <= MAX_NAME_LENGTH) {
                handleNameChange(text)
              } else {
                const truncated = text.slice(0, MAX_NAME_LENGTH)
                const sel = window.getSelection()
                const cursorPos = Math.min(sel?.anchorOffset || 0, MAX_NAME_LENGTH)
                e.currentTarget.textContent = truncated
                handleNameChange(truncated)
                if (e.currentTarget.firstChild) {
                  const range = document.createRange()
                  range.setStart(e.currentTarget.firstChild, cursorPos)
                  range.collapse(true)
                  sel?.removeAllRanges()
                  sel?.addRange(range)
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
              }
            }}
            data-placeholder="e.g., Emma's Celebration Cakes"
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-2xl font-medium focus:border-gray-900 focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
          />
          <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <Cake className="w-4 h-4" />
            This is how customers will find you
          </p>
        </div>
      </div>
    </div>
  )
}
