// components/PartyJourney/VenueConfirmationStep.jsx - STATUS-FOCUSED REDESIGN
"use client"

import { CheckCircle, Clock, MapPin, Sparkles, Calendar, Users, Mail, Gift, ExternalLink } from 'lucide-react'

export function VenueConfirmationStep({ 
  venueSupplier,
  venueEnquiry,
  venueAwaitingConfirmation,
  onAddSupplier,
  partyDetails,
}) {
  
  const venueConfirmed = venueEnquiry?.status === 'accepted' && 
                        venueEnquiry?.auto_accepted === false
  
  // ✅ NO VENUE ADDED YET - Compact
  if (!venueSupplier) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-amber-900 text-sm">No venue selected</h4>
            <p className="text-xs text-amber-700">Add a venue to proceed</p>
          </div>
          <button
            onClick={() => onAddSupplier('venue')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs transition-colors flex-shrink-0"
          >
            Browse
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {venueConfirmed ? (
        // ✅ VENUE CONFIRMED - Compact Mobile-Friendly
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
            <h3 className="font-bold text-base">Venue Confirmed</h3>
          </div>

          {/* Venue Details - horizontal layout */}
          <div className="flex items-center gap-3 bg-white/15 rounded-lg p-3">
            {venueSupplier.image && (
              <img
                src={venueSupplier.image}
                alt={venueSupplier.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white text-sm truncate">{venueSupplier.name}</h4>
              <p className="text-teal-100 text-xs">
                {new Date(partyDetails?.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      ) : venueAwaitingConfirmation ? (
        // ⏳ AWAITING CONFIRMATION - Compact Mobile-Friendly
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <Clock className="w-5 h-5 text-white flex-shrink-0" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <h3 className="font-bold text-base">Awaiting Confirmation</h3>
          </div>

          {/* Venue Details - horizontal layout */}
          <div className="flex items-center gap-3 bg-white/15 rounded-lg p-3 mb-3">
            {venueSupplier.image && (
              <img
                src={venueSupplier.image}
                alt={venueSupplier.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white text-sm truncate">{venueSupplier.name}</h4>
              <p className="text-amber-100 text-xs">
                {new Date(partyDetails?.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>
          </div>

          <p className="text-xs text-amber-100">
            Most venues confirm within a few hours. We'll email you when they respond.
          </p>
        </div>
      ) : (
        // 📤 REQUEST SENT - Compact Mobile-Friendly
        <div className="bg-gray-100 rounded-xl p-4">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <h3 className="font-bold text-base text-gray-900">Request Sent</h3>
          </div>

          {/* Venue Details - horizontal layout */}
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 mb-3">
            {venueSupplier.image && (
              <img
                src={venueSupplier.image}
                alt={venueSupplier.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate">{venueSupplier.name}</h4>
              <p className="text-gray-500 text-xs">
                {new Date(partyDetails?.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600">
            The venue will confirm shortly. We'll email you when they respond.
          </p>
        </div>
      )}
    </div>
  )
}