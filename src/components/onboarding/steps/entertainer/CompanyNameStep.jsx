"use client"

import { useState, useRef, useEffect } from "react"
import { Zap } from "lucide-react"

const MAX_NAME_LENGTH = 50

export default function CompanyNameStep({ serviceDetails, onChange }) {
  const [businessName, setBusinessName] = useState(serviceDetails?.businessName || "")
  const nameRef = useRef(null)
  const isInternalUpdate = useRef(false)

  // Sync ref content when businessName changes externally
  useEffect(() => {
    if (nameRef.current && !isInternalUpdate.current) {
      if (nameRef.current.textContent !== businessName) {
        nameRef.current.textContent = businessName
      }
    }
    isInternalUpdate.current = false
  }, [businessName])

  const handleNameChange = (text) => {
    isInternalUpdate.current = true
    if (text.length <= MAX_NAME_LENGTH) {
      setBusinessName(text)
      onChange({ ...serviceDetails, businessName: text })
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      {/* Character count */}
      <p className="text-gray-500 text-base mb-4">
        <span className="font-medium text-gray-900">{businessName.length}</span>/{MAX_NAME_LENGTH} available
      </p>

      {/* Big editable title - using contentEditable for large text like Airbnb */}
      <div
        ref={nameRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const text = e.currentTarget.textContent || ''
          if (text.length <= MAX_NAME_LENGTH) {
            handleNameChange(text)
          } else {
            // Truncate if over limit - need to fix DOM and cursor
            const truncated = text.slice(0, MAX_NAME_LENGTH)

            // Save cursor position
            const sel = window.getSelection()
            const cursorPos = Math.min(sel?.anchorOffset || 0, MAX_NAME_LENGTH)

            e.currentTarget.textContent = truncated
            handleNameChange(truncated)

            // Restore cursor
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
        data-placeholder="Your business name"
        style={{
          fontSize: 'clamp(2rem, 10vw, 4.5rem)',
          lineHeight: 1.1,
          minHeight: '80px'
        }}
        className="font-semibold text-center text-gray-900 border-none outline-none bg-transparent w-full max-w-3xl focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
      />

      {/* Tip section */}
      <div className="mt-16 flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center">
          <Zap className="w-7 h-7 text-orange-400" />
        </div>
        <p className="text-gray-500 text-sm text-center max-w-md">
          This is the name customers will see when browsing for entertainment
        </p>
      </div>
    </div>
  )
}
