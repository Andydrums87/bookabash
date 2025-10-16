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
  
  // ✅ NO VENUE ADDED YET
  if (!venueSupplier) {
    return (
      <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-2">No venue selected yet</h4>
            <p className="text-sm text-amber-700 mb-3">
              Your venue is the foundation of your party. Once selected and confirmed, 
              you can proceed with invitations and other planning.
            </p>
            <button
              onClick={() => onAddSupplier('venue')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Browse Venues
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {venueConfirmed ? (
        // ✅ VENUE CONFIRMED - Celebratory & Informative
        <>
          {/* Hero Confirmation Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
          
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold">Venue Confirmed!</h3>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <p className="text-teal-50 text-sm">
                    Your party location is secured
                  </p>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  {venueSupplier.image && (
                    <img 
                      src={venueSupplier.image} 
                      alt={venueSupplier.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg">{venueSupplier.name}</h4>
                    <p className="text-teal-50 text-sm">
                      {new Date(partyDetails?.date).toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-teal-50">
                🎉 Everything is set! You can now create invitations and manage your party details.
              </p>
            </div>
          </div>

        </>
      ) : venueAwaitingConfirmation ? (
        // ⏳ AWAITING CONFIRMATION - Clear Status
        <>
          {/* Status Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 relative">
                  <Clock className="w-8 h-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">Venue Reviewing...</h3>
                  <p className="text-amber-50 text-sm">
                    Waiting for confirmation
                  </p>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  {venueSupplier.image && (
                    <img 
                      src={venueSupplier.image} 
                      alt={venueSupplier.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg">{venueSupplier.name}</h4>
                    <p className="text-amber-50 text-sm">
                      Checking availability for {new Date(partyDetails?.date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="text-amber-50 text-sm">
                  ⏱️ Most venues confirm within a few hours. You'll receive an email notification once they respond.
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-3">
              What happens next?
            </h4>
            <div className="space-y-2 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                <p>The venue checks your party date and requirements</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                <p>They'll confirm availability within 24 hours</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                <p>Once confirmed, you can create invitations and manage guests</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        // 📤 REQUEST SENT - Clean & Reassuring
        <>
          {/* Status Card */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Request Sent</h3>
                <p className="text-sm text-gray-600">
                  This is just a formality - the venue will confirm shortly
                </p>
              </div>
            </div>

            {/* Venue Details */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                {venueSupplier.image && (
                  <img 
                    src={venueSupplier.image} 
                    alt={venueSupplier.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{venueSupplier.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(partyDetails?.date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Happening */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              The venue is reviewing your booking request and will confirm availability. 
              Most venues respond within a few hours. You'll receive an email notification once confirmed.
            </p>
          </div>
        </>
      )}
    </div>
  )
}