"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, ChevronDown, ChevronUp, Check } from "lucide-react"

const DEFAULT_COLLECTION_HOURS = {
  monday: { open: true, from: '09:00', to: '17:00' },
  tuesday: { open: true, from: '09:00', to: '17:00' },
  wednesday: { open: true, from: '09:00', to: '17:00' },
  thursday: { open: true, from: '09:00', to: '17:00' },
  friday: { open: true, from: '09:00', to: '17:00' },
  saturday: { open: true, from: '10:00', to: '16:00' },
  sunday: { open: false, from: '10:00', to: '16:00' }
}

const PRESETS = [
  {
    id: 'standard',
    label: 'Standard hours',
    description: 'Mon-Fri 9am-5pm, Sat 10am-4pm',
    hours: {
      monday: { open: true, from: '09:00', to: '17:00' },
      tuesday: { open: true, from: '09:00', to: '17:00' },
      wednesday: { open: true, from: '09:00', to: '17:00' },
      thursday: { open: true, from: '09:00', to: '17:00' },
      friday: { open: true, from: '09:00', to: '17:00' },
      saturday: { open: true, from: '10:00', to: '16:00' },
      sunday: { open: false, from: '10:00', to: '16:00' }
    }
  },
  {
    id: 'weekdays',
    label: 'Weekdays only',
    description: 'Mon-Fri 9am-5pm',
    hours: {
      monday: { open: true, from: '09:00', to: '17:00' },
      tuesday: { open: true, from: '09:00', to: '17:00' },
      wednesday: { open: true, from: '09:00', to: '17:00' },
      thursday: { open: true, from: '09:00', to: '17:00' },
      friday: { open: true, from: '09:00', to: '17:00' },
      saturday: { open: false, from: '10:00', to: '16:00' },
      sunday: { open: false, from: '10:00', to: '16:00' }
    }
  },
  {
    id: 'custom',
    label: 'Custom hours',
    description: 'Set your own schedule',
    hours: null
  }
]

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' }
]

const TIME_OPTIONS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
]

export default function CakeFulfilmentDetailsStep({ cakeFulfilment, onChange }) {
  const [localData, setLocalData] = useState({
    ...cakeFulfilment,
    collectionHours: cakeFulfilment?.collectionHours || DEFAULT_COLLECTION_HOURS
  })
  const [selectedPreset, setSelectedPreset] = useState('standard')
  const [showCustomHours, setShowCustomHours] = useState(false)

  // Sync with props
  useEffect(() => {
    if (cakeFulfilment) {
      setLocalData(prev => ({
        ...prev,
        ...cakeFulfilment,
        collectionHours: cakeFulfilment.collectionHours || DEFAULT_COLLECTION_HOURS
      }))
    }
  }, [cakeFulfilment])

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onChange(updated)
  }

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId)
    if (presetId === 'custom') {
      setShowCustomHours(true)
    } else {
      setShowCustomHours(false)
      const preset = PRESETS.find(p => p.id === presetId)
      if (preset?.hours) {
        const updated = { ...localData, collectionHours: preset.hours }
        setLocalData(updated)
        onChange(updated)
      }
    }
  }

  const handleCollectionHoursChange = (day, field, value) => {
    const updatedHours = {
      ...localData.collectionHours,
      [day]: {
        ...localData.collectionHours[day],
        [field]: value
      }
    }
    const updated = { ...localData, collectionHours: updatedHours }
    setLocalData(updated)
    onChange(updated)
  }

  const toggleDayOpen = (day) => {
    handleCollectionHoursChange(day, 'open', !localData.collectionHours[day].open)
  }

  const formatTime = (time) => {
    const [hours] = time.split(':')
    const hour = parseInt(hours)
    if (hour === 0) return '12am'
    if (hour === 12) return '12pm'
    if (hour > 12) return `${hour - 12}pm`
    return `${hour}am`
  }

  const radiusOptions = [
    { value: 5, label: "5 miles" },
    { value: 10, label: "10 miles" },
    { value: 15, label: "15 miles" },
    { value: 20, label: "20 miles" },
    { value: 30, label: "30 miles" },
    { value: 50, label: "50+ miles" }
  ]

  const showPickupDetails = localData.offersPickup
  const showDeliveryDetails = localData.offersDelivery
  const showBoth = showPickupDetails && showDeliveryDetails

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Fulfilment details
        </h1>
        <p className="text-lg text-gray-600">
          {showBoth
            ? "Set up your collection hours and delivery options"
            : showPickupDetails
              ? "When can customers collect their orders?"
              : "Set up your delivery options"
          }
        </p>
      </div>

      <div className={`${showBoth ? 'grid md:grid-cols-2 gap-6' : 'max-w-xl mx-auto'}`}>

        {/* Collection Hours */}
        {showPickupDetails && (
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Collection hours</h3>
                <p className="text-sm text-gray-500">When can customers pick up?</p>
              </div>
            </div>

            {/* Preset options */}
            <div className="space-y-2 mb-4">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                    selectedPreset === preset.id
                      ? 'border-gray-900 bg-white'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{preset.label}</p>
                    <p className="text-sm text-gray-500">{preset.description}</p>
                  </div>
                  {selectedPreset === preset.id && (
                    <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom hours editor */}
            {showCustomHours && (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {DAYS.map(({ key, label }) => {
                  const dayData = localData.collectionHours?.[key] || DEFAULT_COLLECTION_HOURS[key]
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDayOpen(key)}
                        className={`w-12 h-9 rounded-lg font-medium text-xs transition-all flex-shrink-0 ${
                          dayData.open
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-300 text-gray-400'
                        }`}
                      >
                        {label}
                      </button>

                      {dayData.open ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <select
                            value={dayData.from}
                            onChange={(e) => handleCollectionHoursChange(key, 'from', e.target.value)}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:border-gray-900 focus:outline-none bg-white"
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>{formatTime(time)}</option>
                            ))}
                          </select>
                          <span className="text-gray-400 text-xs">to</span>
                          <select
                            value={dayData.to}
                            onChange={(e) => handleCollectionHoursChange(key, 'to', e.target.value)}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:border-gray-900 focus:outline-none bg-white"
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>{formatTime(time)}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Closed</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Delivery Details */}
        {showDeliveryDetails && (
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery settings</h3>
                <p className="text-sm text-gray-500">How far will you deliver?</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Delivery Radius */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Delivery radius
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {radiusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange('deliveryRadius', option.value)}
                      className={`p-3 rounded-xl border-2 text-center font-medium transition-all text-sm ${
                        localData.deliveryRadius === option.value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Fee */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Delivery fee
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Leave empty or set to 0 for free delivery
                </p>
                <div className="relative w-full max-w-[180px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">£</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={localData.deliveryFeeInput ?? (localData.deliveryFee === 0 ? '' : localData.deliveryFee)}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9.]/g, '')
                      const parts = value.split('.')
                      if (parts.length > 2) {
                        value = parts[0] + '.' + parts.slice(1).join('')
                      }
                      if (parts.length === 2 && parts[1].length > 2) {
                        value = parts[0] + '.' + parts[1].slice(0, 2)
                      }
                      const updated = {
                        ...localData,
                        deliveryFeeInput: value,
                        deliveryFee: value === '' ? 0 : parseFloat(value) || 0
                      }
                      setLocalData(updated)
                      onChange(updated)
                    }}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
