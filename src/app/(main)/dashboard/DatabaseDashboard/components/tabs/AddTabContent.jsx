"use client"

import MissingSuppliersSuggestions from "@/components/MissingSuppliersSuggestions"

export default function AddTabContent({
  suppliers,
  partyDetails,
  onAddSupplier,
  onCustomize,
  onBrowseVenues,
}) {
  // Build the partyPlan object from visible suppliers for MissingSuppliersSuggestions
  const partyPlan = suppliers || {}

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="px-4">
        <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          Add Suppliers
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
        </h2>
        <p className="text-sm text-gray-600 mt-3">Complete your party with more amazing suppliers</p>
      </div>

      {/* Missing Suppliers - Horizontal scroll on mobile */}
      <div className="add-tab-suppliers">
        <MissingSuppliersSuggestions
          partyPlan={partyPlan}
          partyDetails={partyDetails}
          onAddSupplier={onAddSupplier}
          showTitle={false}
          horizontalScroll={true}
          disableConfetti={false}
          onCustomize={onCustomize}
          preventNavigation={true}
          onBrowseVenues={onBrowseVenues}
        />
      </div>

      {/* Custom styles for horizontal scroll on mobile, grid on desktop */}
      <style jsx global>{`
        /* Mobile: Horizontal scroll with larger cards */
        @media (max-width: 1023px) {
          .add-tab-suppliers .grid {
            display: flex !important;
            flex-wrap: wrap !important;
            overflow-x: auto !important;
            gap: 1rem !important;
            padding: 0 1.25rem 1rem 1.25rem !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .add-tab-suppliers .grid::-webkit-scrollbar {
            display: none;
          }

          /* Each card takes roughly half width minus gap, creating 2 rows when wrapped */
          .add-tab-suppliers .grid > div {
            flex: 0 0 calc(50% - 0.5rem) !important;
            min-width: 160px !important;
            max-width: calc(50% - 0.5rem) !important;
          }

          /* Make cards taller with bigger images */
          .add-tab-suppliers .grid > div > div {
            min-height: 200px !important;
          }

          .add-tab-suppliers .aspect-video {
            aspect-ratio: 4/3 !important;
            min-height: 120px !important;
          }

          .add-tab-suppliers h3 {
            font-size: 1rem !important;
            font-weight: 700 !important;
          }

          .add-tab-suppliers p {
            font-size: 0.875rem !important;
          }
        }

        /* Desktop: 3 column grid */
        @media (min-width: 1024px) {
          .add-tab-suppliers {
            padding: 0 1rem;
          }

          .add-tab-suppliers .grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 2rem !important;
          }

          .add-tab-suppliers .grid > div > div {
            min-height: 280px;
          }

          .add-tab-suppliers .aspect-video {
            aspect-ratio: 16/10 !important;
          }

          .add-tab-suppliers h3 {
            font-size: 1.25rem !important;
          }

          .add-tab-suppliers p {
            font-size: 0.95rem !important;
          }
        }
      `}</style>
    </div>
  )
}
