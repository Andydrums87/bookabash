"use client"

import { useState } from "react"
import { Clock } from "lucide-react"

export default function CakeLeadTimeStep({ cakeLeadTime, onChange }) {
  const [localData, setLocalData] = useState(cakeLeadTime || {
    minimum: 7
  })

  const handleChange = (value) => {
    const updated = { minimum: value }
    setLocalData(updated)
    onChange(updated)
  }

  const noticeOptions = [
    { value: 1, label: "24 hours" },
    { value: 2, label: "48 hours" },
    { value: 3, label: "3 days" },
    { value: 5, label: "5 days" },
    { value: 7, label: "1 week" },
    { value: 14, label: "2 weeks" },
    { value: 21, label: "3 weeks" }
  ]

  const getDisplayLabel = (days) => {
    if (days === 1) return "24 hours"
    if (days === 2) return "48 hours"
    if (days === 7) return "1 week"
    if (days === 14) return "2 weeks"
    if (days === 21) return "3 weeks"
    return `${days} days`
  }

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          How much notice do you need?
        </h1>
        <p className="text-lg text-gray-600">
          Set the minimum time customers need to order in advance
        </p>
      </div>

      <div className="space-y-8">
        {/* Notice Options */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {noticeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                localData.minimum === option.value
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span className="text-lg font-semibold">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-gray-900 font-medium">
              Minimum notice: <span className="font-semibold">{getDisplayLabel(localData.minimum)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
