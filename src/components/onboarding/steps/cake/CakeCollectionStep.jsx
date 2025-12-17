"use client"

import { useState, useEffect } from "react"
import { Package, Clock, MapPin, Truck } from "lucide-react"

const DEFAULT_COLLECTION_HOURS = {
  monday: { open: true, from: '09:00', to: '17:00' },
  tuesday: { open: true, from: '09:00', to: '17:00' },
  wednesday: { open: true, from: '09:00', to: '17:00' },
  thursday: { open: true, from: '09:00', to: '17:00' },
  friday: { open: true, from: '09:00', to: '17:00' },
  saturday: { open: true, from: '10:00', to: '16:00' },
  sunday: { open: false, from: '10:00', to: '16:00' }
}

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

const formatTime = (time) => {
  const [hours] = time.split(':')
  const hour = parseInt(hours)
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  if (hour > 12) return `${hour - 12}pm`
  return `${hour}am`
}

export default function CakeCollectionStep({ cakeFulfilment, cakeBusinessDetails, onChange }) {
  const [offersPickup, setOffersPickup] = useState(cakeFulfilment?.offersPickup ?? true)
  const [collectionHours, setCollectionHours] = useState(
    cakeFulfilment?.collectionHours || DEFAULT_COLLECTION_HOURS
  )

  // Sync with props
  useEffect(() => {
    if (cakeFulfilment) {
      setOffersPickup(cakeFulfilment.offersPickup ?? true)
      if (cakeFulfilment.collectionHours) {
        setCollectionHours(cakeFulfilment.collectionHours)
      }
    }
  }, [cakeFulfilment])

  const handleCollectionHoursChange = (day, field, value) => {
    const updatedHours = {
      ...collectionHours,
      [day]: {
        ...collectionHours[day],
        [field]: value
      }
    }
    setCollectionHours(updatedHours)
    onChange({
      ...cakeFulfilment,
      offersPickup: true,
      collectionHours: updatedHours
    })
  }

  const toggleDayOpen = (day) => {
    handleCollectionHoursChange(day, 'open', !collectionHours[day].open)
  }

  // Get location display
  const locationDisplay = cakeBusinessDetails?.fullAddress ||
    (cakeBusinessDetails?.city && cakeBusinessDetails?.postcode
      ? `${cakeBusinessDetails.city}, ${cakeBusinessDetails.postcode}`
      : cakeBusinessDetails?.city || 'Your business location')

  return (
    <div className="py-12 max-w-xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Collection
        </h1>
        <p className="text-lg text-gray-600">
          Can customers collect orders from you?
        </p>
      </div>

      <div className="space-y-6">
        {/* Toggle */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setOffersPickup(true); onChange({ ...cakeFulfilment, offersPickup: true, collectionHours }) }}
            className={`flex-1 p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
              offersPickup
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <Package className={`w-5 h-5 ${offersPickup ? 'text-white' : 'text-gray-400'}`} />
            <span className="font-semibold">Yes, collection available</span>
          </button>
          <button
            type="button"
            onClick={() => { setOffersPickup(false); onChange({ ...cakeFulfilment, offersPickup: false }) }}
            className={`flex-1 p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
              !offersPickup
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <Truck className={`w-5 h-5 ${!offersPickup ? 'text-white' : 'text-gray-400'}`} />
            <span className="font-semibold">No, delivery only</span>
          </button>
        </div>

        {/* Collection details - only show if pickup is enabled */}
        {offersPickup && (
          <div className="space-y-5 pt-4">
            {/* Collection location */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Collection from</p>
                  <p className="font-medium text-gray-900">{locationDisplay}</p>
                </div>
              </div>
            </div>

            {/* Collection hours */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">Collection hours</span>
              </div>
              <div className="space-y-2">
                {DAYS.map(({ key, label }) => {
                  const dayData = collectionHours[key] || DEFAULT_COLLECTION_HOURS[key]
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDayOpen(key)}
                        className={`w-14 h-10 rounded-lg font-medium text-sm transition-all flex-shrink-0 ${
                          dayData.open
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-300 text-gray-400'
                        }`}
                      >
                        {label}
                      </button>

                      {dayData.open ? (
                        <div className="flex items-center gap-2 flex-1">
                          <select
                            value={dayData.from}
                            onChange={(e) => handleCollectionHoursChange(key, 'from', e.target.value)}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-gray-900 focus:outline-none bg-white"
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>{formatTime(time)}</option>
                            ))}
                          </select>
                          <span className="text-gray-400 text-sm">to</span>
                          <select
                            value={dayData.to}
                            onChange={(e) => handleCollectionHoursChange(key, 'to', e.target.value)}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-gray-900 focus:outline-none bg-white"
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>{formatTime(time)}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Closed</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
