// components/Sidebar.jsx - Dashboard widgets sidebar
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import BudgetControls from "@/components/budget-controls"
import ReferFriend from "@/components/ReferFriend"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, X } from "lucide-react"
import RecentActivityWidget from "./RecentActivityWidget"
import SupportWidget from "./SupportWidget"

export default function Sidebar({
  partyData,
  isPaymentConfirmed,
  budgetControlProps,
  suppliers,
  enquiries,
  AddSuppliersSection,
}) {
  const [showAddSuppliersModal, setShowAddSuppliersModal] = useState(false)

  if (!partyData) return null

  // Calculate empty suppliers
  const allSupplierTypes = ['venue', 'entertainment', 'cakes', 'decorations', 'facePainting', 'activities', 'partyBags', 'balloons', 'catering']
  const emptySlots = allSupplierTypes.filter(type => !suppliers[type]).length

  // Get einvites from suppliers if available
  const einvites = suppliers?.einvites || null

  return (
    <>
      <div className="space-y-6">
        {/* Recent Activity Widget */}
        <RecentActivityWidget
          partyId={partyData.id}
          enquiries={enquiries}
          partyData={partyData}
          einvites={einvites}
        />

        {/* Add Suppliers Card */}
        {emptySlots > 0 && (
          <Card
            className="w-full bg-primary-400 rounded-xl shadow-md border-2 border-[hsl(var(--primary-200))] overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
            onClick={() => setShowAddSuppliersModal(true)}
          >
            <div className="relative p-6">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 rounded-full -translate-y-16 translate-x-16 opacity-50" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-300 rounded-full translate-y-12 -translate-x-12 opacity-30" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-2xl">Add More Suppliers</h3>
                    <p className="text-sm text-white">{emptySlots} available to add</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-white hover:bg-gray-200 text-primary-500 font-bold rounded-xl h-12 shadow-lg transition-all text-primary-600 text-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  View Available Suppliers
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Budget Controls (if applicable) */}
        {!isPaymentConfirmed && budgetControlProps && (
          <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <BudgetControls {...budgetControlProps} />
          </Card>
        )}

        {/* Refer Friend */}
        <ReferFriend />

        {/* Support Widget */}
        <SupportWidget />
      </div>

      {/* Add Suppliers Modal */}
      {showAddSuppliersModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] animate-in fade-in duration-200"
          onClick={() => setShowAddSuppliersModal(false)}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Suppliers</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete your party team with {emptySlots} more supplier{emptySlots !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowAddSuppliersModal(false)}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(85vh-100px)] px-8 py-6">
              {AddSuppliersSection ? (
                AddSuppliersSection
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No suppliers available to add</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
