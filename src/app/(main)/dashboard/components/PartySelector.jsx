"use client"

import { useState } from "react"
import { ChevronDown, Calendar, Users, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export default function PartySelector({ parties, selectedPartyId, onSelectParty, onCreateNew }) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedParty = parties.find(p => p.id === selectedPartyId) || parties[0]

  if (!selectedParty) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-gray-500 text-sm">No parties found</p>
        <Button onClick={onCreateNew} className="mt-2">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Party
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Selected Party Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">
                {selectedParty.child_name || "Your Child"}'s Party
              </h3>
              {parties.length > 1 && (
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  {parties.indexOf(selectedParty) + 1} of {parties.length}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {selectedParty.party_date ? format(new Date(selectedParty.party_date), "MMM d, yyyy") : "Date TBD"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {selectedParty.guest_count || 0} guests
              </span>
              {selectedParty.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedParty.location}
                </span>
              )}
            </div>
          </div>
          {parties.length > 1 && (
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && parties.length > 1 && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
            {parties.map((party) => (
              <button
                key={party.id}
                onClick={() => {
                  onSelectParty(party.id)
                  setIsOpen(false)
                  // Dispatch custom event to notify other components
                  window.dispatchEvent(new CustomEvent('partyChanged', { detail: { partyId: party.id } }))
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  party.id === selectedPartyId ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">
                    {party.child_name || "Your Child"}'s Party
                  </h4>
                  {party.id === selectedPartyId && (
                    <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {party.party_date ? format(new Date(party.party_date), "MMM d, yyyy") : "Date TBD"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {party.guest_count || 0} guests
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    party.status === 'planned' ? 'bg-green-100 text-green-700' :
                    party.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {party.status}
                  </span>
                </div>
              </button>
            ))}

            {/* Create New Party Button */}
            <button
              onClick={() => {
                onCreateNew()
                setIsOpen(false)
              }}
              className="w-full p-4 text-left hover:bg-primary-50 text-primary-600 font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Party
            </button>
          </div>
        </>
      )}
    </div>
  )
}
