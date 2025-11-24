"use client"

import { useState } from "react"
import { Baby, Users, GraduationCap, PartyPopper } from "lucide-react"

export default function ServiceDetailsStep({ serviceDetails, onChange }) {
  const [localData, setLocalData] = useState(serviceDetails || {
    businessName: "",
    description: "",
    ageGroups: [],
    services: []
  })

  const ageGroupOptions = [
    { id: "0-2", label: "Babies & Toddlers (0-2)", icon: Baby },
    { id: "3-5", label: "Preschool (3-5)", icon: Users },
    { id: "6-12", label: "School Age (6-12)", icon: GraduationCap },
    { id: "13+", label: "Teenagers & Adults (13+)", icon: PartyPopper }
  ]

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onChange(updated)
  }

  const toggleAgeGroup = (ageGroupId) => {
    const current = localData.ageGroups || []
    const updated = current.includes(ageGroupId)
      ? current.filter(id => id !== ageGroupId)
      : [...current, ageGroupId]
    handleChange('ageGroups', updated)
  }

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Tell us about your services
        </h1>
        <p className="text-lg text-gray-600">
          Help customers understand what you offer
        </p>
      </div>

      <div className="space-y-8">
        {/* Business/Company Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Business/Company Name
          </label>
          <input
            type="text"
            value={localData.businessName || ""}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="E.g., Magic Mike Entertainment, Sarah's Fun Parties"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-2">
            Your entertainment business or stage name
          </p>
        </div>

        {/* Service Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Service Description
          </label>
          <textarea
            value={localData.description || ""}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what you do, your experience, what makes your entertainment special..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-2">
            Tip: Mention your experience, style, and what makes you unique
          </p>
        </div>

        {/* Age Groups */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Age Groups You Work With
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Select all that apply
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ageGroupOptions.map((option) => {
              const Icon = option.icon
              const isSelected = localData.ageGroups?.includes(option.id)

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleAgeGroup(option.id)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Special Requirements or Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Special Requirements (Optional)
          </label>
          <textarea
            value={localData.specialRequirements || ""}
            onChange={(e) => handleChange('specialRequirements', e.target.value)}
            placeholder="E.g., Need power outlet, table space, indoor/outdoor preferences..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </div>
  )
}
