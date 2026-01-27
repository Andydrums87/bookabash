"use client"

import MissingSuppliersSuggestions from "@/components/MissingSuppliersSuggestions"

export default function AddTabContent({
  suppliers,
  partyDetails,
  onAddSupplier,
  onCustomize,
}) {
  // Build the partyPlan object from visible suppliers for MissingSuppliersSuggestions
  const partyPlan = suppliers || {}

  return (
    <div className="space-y-8 py-6 px-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          Add Suppliers
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
        </h2>
        <p className="text-sm text-gray-600 mt-3">Complete your party with more amazing suppliers</p>
      </div>

      {/* Missing Suppliers Grid - Desktop optimized with larger cards */}
      <div className="add-tab-suppliers">
        <MissingSuppliersSuggestions
          partyPlan={partyPlan}
          partyDetails={partyDetails}
          onAddSupplier={onAddSupplier}
          showTitle={false}
          horizontalScroll={false}
          disableConfetti={false}
          onCustomize={onCustomize}
          preventNavigation={true}
        />
      </div>

      {/* Custom styles for larger cards on desktop */}
      <style jsx global>{`
        .add-tab-suppliers .grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 1.5rem !important;
        }

        @media (min-width: 1024px) {
          .add-tab-suppliers .grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 2rem !important;
          }
        }

        /* Make cards larger */
        .add-tab-suppliers [class*="EmptySupplierCard"],
        .add-tab-suppliers > div > div > div {
          min-height: 280px;
        }

        /* Larger images */
        .add-tab-suppliers .aspect-video {
          aspect-ratio: 16/10 !important;
        }

        /* Bigger text */
        .add-tab-suppliers h3 {
          font-size: 1.25rem !important;
        }

        .add-tab-suppliers p {
          font-size: 0.95rem !important;
        }
      `}</style>
    </div>
  )
}
