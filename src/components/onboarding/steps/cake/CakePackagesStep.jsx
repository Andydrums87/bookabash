"use client"

import { useState } from "react"
import { Package, Plus, Trash2, PoundSterling, Users, Truck, Layers, Ruler } from "lucide-react"

// Tier options
const TIER_OPTIONS = [
  { value: '1', label: '1 Tier' },
  { value: '2', label: '2 Tier' },
  { value: '3', label: '3 Tier' },
  { value: '4', label: '4 Tier' },
  { value: '5', label: '5+ Tiers' },
]

// Size options in inches
const SIZE_OPTIONS = [
  { value: '4', label: '4"' },
  { value: '6', label: '6"' },
  { value: '8', label: '8"' },
  { value: '10', label: '10"' },
  { value: '12', label: '12"' },
  { value: '14', label: '14"' },
  { value: '16', label: '16"' },
]

export default function CakePackagesStep({ cakePackages, onChange }) {
  const [packages, setPackages] = useState(cakePackages || [
    { id: '1', name: '', price: '', serves: '', deliveryFee: '', tiers: '', sizeInches: '' }
  ])

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...packages]
    newPackages[index] = { ...newPackages[index], [field]: value }
    setPackages(newPackages)
    onChange(newPackages)
  }

  const handleAddPackage = () => {
    const newPackages = [
      ...packages,
      { id: `${Date.now()}`, name: '', price: '', serves: '', deliveryFee: '', tiers: '', sizeInches: '' }
    ]
    setPackages(newPackages)
    onChange(newPackages)
  }

  const handleRemovePackage = (index) => {
    if (packages.length <= 1) return // Keep at least one package
    const newPackages = packages.filter((_, i) => i !== index)
    setPackages(newPackages)
    onChange(newPackages)
  }

  // Calculate if we have at least one complete package
  const hasCompletePackage = packages.some(p =>
    p.name?.trim() && parseFloat(p.price) > 0
  )

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Set your sizes and pricing
        </h1>
        <p className="text-lg text-gray-600">
          Add different sizes or options for this cake
        </p>
      </div>

      <div className="space-y-4">
        {packages.map((pkg, index) => (
          <div
            key={pkg.id}
            className="p-6 border-2 border-gray-200 rounded-2xl bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
                <span className="font-medium text-gray-500">Size {index + 1}</span>
              </div>
              {packages.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePackage(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Package Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Name this size
                </label>
                <input
                  type="text"
                  value={pkg.name || ''}
                  onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                  placeholder="e.g., Small, Medium, Large..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
                />
              </div>

              {/* Tiers and Size Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Tiers Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tiers
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={pkg.tiers || ''}
                      onChange={(e) => handlePackageChange(index, 'tiers', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Select tiers</option>
                      {TIER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Size in Inches Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Size (inches)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={pkg.sizeInches || ''}
                      onChange={(e) => handlePackageChange(index, 'sizeInches', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Select size</option>
                      {SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pkg.price || ''}
                      onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                      placeholder="45.00"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Feeds */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Feeds
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={pkg.serves || ''}
                      onChange={(e) => handlePackageChange(index, 'serves', e.target.value)}
                      placeholder="10-15"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Delivery Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Delivery
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.50"
                      value={pkg.deliveryFee || ''}
                      onChange={(e) => handlePackageChange(index, 'deliveryFee', e.target.value)}
                      placeholder="5.00"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Package Button */}
        <button
          type="button"
          onClick={handleAddPackage}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add another size
        </button>
      </div>

      {/* Summary */}
      {hasCompletePackage && (
        <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-semibold text-gray-900 mb-3">Your sizes:</h4>
          <div className="space-y-3">
            {packages.filter(p => p.name?.trim() && parseFloat(p.price) > 0).map((pkg, i) => (
              <div key={i} className="flex items-center justify-between text-gray-600">
                <div>
                  <span className="font-medium text-gray-900">{pkg.name}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    {pkg.tiers && <span>{pkg.tiers} tier{pkg.tiers !== '1' ? 's' : ''}</span>}
                    {pkg.tiers && pkg.sizeInches && <span>•</span>}
                    {pkg.sizeInches && <span>{pkg.sizeInches}" diameter</span>}
                    {(pkg.tiers || pkg.sizeInches) && pkg.serves && <span>•</span>}
                    {pkg.serves && <span>Feeds {pkg.serves}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    £{parseFloat(pkg.price).toFixed(2)}
                  </span>
                  {parseFloat(pkg.deliveryFee) > 0 && (
                    <div className="text-gray-500 text-sm">+£{parseFloat(pkg.deliveryFee).toFixed(2)} delivery</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-sm text-amber-800">
          💡 Set different delivery fees for each size based on weight/tiers. Larger cakes typically cost more to deliver. Leave empty for free delivery.
        </p>
      </div>
    </div>
  )
}
