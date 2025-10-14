// components/PartyJourney/VenueConfirmationStep.jsx - FIXED
"use client"

import { CheckCircle, Clock, MapPin, AlertCircle, Sparkles } from 'lucide-react'
import SupplierCard from '../../../components/SupplierCard/SupplierCard'

export function VenueConfirmationStep({ 
  venueSupplier,
  venueEnquiry,
  venueAwaitingConfirmation,
  onAddSupplier,
  onRemoveSupplier,
  getSupplierDisplayName,
  loadingCards,
  partyDetails,
  addons,
  handleRemoveAddon,
  isPaymentConfirmed,
  enquiries,
  currentPhase,
  onPaymentReady,
  handleCancelEnquiry,
  getSupplierDisplayPricing,
}) {
  
  const venueConfirmed = venueEnquiry?.status === 'accepted' && 
                        venueEnquiry?.auto_accepted === false
  
  
  // Get venue addons
  const venueAddons = venueSupplier 
    ? addons.filter(addon => 
        addon.supplierId === venueSupplier.id || 
        addon.supplierType === 'venue' ||
        addon.attachedToSupplier === 'venue'
      )
    : []

  // Get enhanced pricing
  const getEnhancedPricing = () => {
    if (!venueSupplier || !getSupplierDisplayPricing) return null
    return getSupplierDisplayPricing(venueSupplier, partyDetails, venueAddons)
  }

  const enhancedPricing = getEnhancedPricing()

  // ✅ NO VENUE ADDED YET
  if (!venueSupplier) {
    return (
      <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">No venue selected yet</h4>
            <p className="text-sm text-amber-700 mb-3">
              Your venue is the foundation of your party. Once you select and the venue confirms, 
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
    <div className="mt-4 space-y-4">
      {/* ✅ STATUS BANNER - SHOWS CURRENT STATE */}
      {venueConfirmed ? (
        // CONFIRMED STATE (auto_accepted = true)
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-teal-900 mb-1 flex items-center gap-2">
                Venue Confirmed! 
                <Sparkles className="w-4 h-4 text-teal-600" />
              </h4>
              <p className="text-sm text-teal-700 mb-2">
                <strong>{venueSupplier.name}</strong> has confirmed your booking for{' '}
                {new Date(partyDetails?.date).toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
              <div className="bg-teal-100 rounded-lg p-3 mt-3">
                <p className="text-sm font-medium text-teal-900 mb-1">
                  🎉 Great news! You can now:
                </p>
                <ul className="text-sm text-teal-700 space-y-1">
                  <li>• Create your guest list</li>
                  <li>• Design and send e-invites</li>
                  <li>• Set up your gift registry</li>
                  <li>• Track RSVPs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : venueAwaitingConfirmation ? (
        // AWAITING CONFIRMATION STATE (auto_accepted = false)
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 relative">
              <Clock className="w-6 h-6 text-amber-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 mb-1">
                Awaiting Venue Confirmation
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                We've notified <strong>{venueSupplier.name}</strong> about your booking request. 
                They're reviewing your party details and will confirm within 24 hours.
              </p>
              
              {/* What's happening box */}
              <div className="bg-white rounded-lg p-3 border border-amber-200 mb-3">
                <p className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  What's happening now?
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• {venueSupplier.name} is checking availability for your date</li>
                  <li>• They're reviewing your party requirements</li>
                  <li>• You'll get an email as soon as they confirm</li>
                  <li>• Most venues confirm within a few hours</li>
                </ul>
              </div>

              {/* Why wait? box */}
              <div className="bg-amber-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-900 mb-1">
                  Why do we need venue confirmation?
                </p>
                <p className="text-xs text-amber-700">
                  Your venue determines the party date, location, and capacity. Once confirmed, 
                  you can confidently create invitations and add other suppliers knowing your venue is secured.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // PENDING STATE (enquiry sent but not accepted yet)
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Request Pending</h4>
              <p className="text-sm text-blue-700">
                Your booking request has been sent to {venueSupplier.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ VENUE CARD */}
      <div className="w-full max-w-md">
        <SupplierCard
          type="venue"
          supplier={venueSupplier}
          loadingCards={loadingCards}
          suppliersToDelete={[]}
          openSupplierModal={onAddSupplier}
          handleDeleteSupplier={onRemoveSupplier}
          getSupplierDisplayName={getSupplierDisplayName}
          addons={venueAddons}
          handleRemoveAddon={handleRemoveAddon}
          enquiryStatus={venueEnquiry?.status}
          enquirySentAt={venueEnquiry?.created_at}
          isPaymentConfirmed={isPaymentConfirmed}
          enquiries={enquiries}
          partyId={partyDetails?.id}
          isSignedIn={true}
          currentPhase={currentPhase}
          onPaymentReady={onPaymentReady}
          handleCancelEnquiry={handleCancelEnquiry}
          partyDetails={partyDetails}
          enhancedPricing={enhancedPricing}
        />
      </div>

      {/* ✅ HELPFUL TIP - Only show while waiting */}
      {venueAwaitingConfirmation && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">💡 Pro tip:</strong> While waiting for venue confirmation, 
            you can start thinking about your party theme and what other suppliers you'd like to add!
          </p>
        </div>
      )}
    </div>
  )
}