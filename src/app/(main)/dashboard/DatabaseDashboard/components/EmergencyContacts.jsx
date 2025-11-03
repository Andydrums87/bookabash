"use client"

import { Phone, MapPin, AlertCircle, Mail, ExternalLink } from 'lucide-react'

export default function EmergencyContacts({ suppliers = {}, enquiries = [], partyDetails }) {
  // Collect all contacts from suppliers and enquiries
  const contacts = []

  // Add venue
  if (suppliers.venue) {
    const venueEnquiry = enquiries.find(e => e.supplier_category === 'venue')
    const venue = suppliers.venue

    // Try multiple paths to get phone number
    const venuePhone = venue.phone ||
                      venue.owner?.phone ||
                      venue.data?.phone ||
                      venue.data?.owner?.phone ||
                      venueEnquiry?.supplier_phone ||
                      venueEnquiry?.supplier_data?.phone

    const venueEmail = venue.email ||
                      venue.owner?.email ||
                      venue.data?.email ||
                      venue.data?.owner?.email ||
                      venueEnquiry?.supplier_email

    contacts.push({
      name: venue.name || venue.data?.name || 'Venue',
      type: 'Venue',
      phone: venuePhone,
      email: venueEmail,
      address: venue.location || venue.venueAddress?.postcode || venue.data?.location,
      priority: 1
    })
  }

  // Add entertainment
  if (suppliers.entertainment) {
    const entertainmentEnquiry = enquiries.find(e => e.supplier_category === 'entertainment')
    contacts.push({
      name: suppliers.entertainment.name || 'Entertainment',
      type: 'Entertainment',
      phone: suppliers.entertainment.phone || suppliers.entertainment.owner?.phone || entertainmentEnquiry?.supplier_phone,
      email: suppliers.entertainment.email || suppliers.entertainment.owner?.email || entertainmentEnquiry?.supplier_email,
      priority: 2
    })
  }

  // Add catering
  if (suppliers.catering) {
    const cateringEnquiry = enquiries.find(e => e.supplier_category === 'catering')
    contacts.push({
      name: suppliers.catering.name || 'Catering',
      type: 'Catering',
      phone: suppliers.catering.phone || suppliers.catering.owner?.phone || cateringEnquiry?.supplier_phone,
      email: suppliers.catering.email || suppliers.catering.owner?.email || cateringEnquiry?.supplier_email,
      priority: 3
    })
  }

  // Add cake supplier
  if (suppliers.cakes) {
    const cakesEnquiry = enquiries.find(e => e.supplier_category === 'cakes')
    contacts.push({
      name: suppliers.cakes.name || 'Cake Supplier',
      type: 'Cake',
      phone: suppliers.cakes.phone || suppliers.cakes.owner?.phone || cakesEnquiry?.supplier_phone,
      email: suppliers.cakes.email || suppliers.cakes.owner?.email || cakesEnquiry?.supplier_email,
      priority: 4
    })
  }

  // Add decorations
  if (suppliers.decorations) {
    const decorationsEnquiry = enquiries.find(e => e.supplier_category === 'decorations')
    contacts.push({
      name: suppliers.decorations.name || 'Decorations',
      type: 'Decorations',
      phone: suppliers.decorations.phone || suppliers.decorations.owner?.phone || decorationsEnquiry?.supplier_phone,
      email: suppliers.decorations.email || suppliers.decorations.owner?.email || decorationsEnquiry?.supplier_email,
      priority: 5
    })
  }

  // Add party bags
  if (suppliers.partyBags) {
    const partyBagsEnquiry = enquiries.find(e => e.supplier_category === 'partyBags')
    contacts.push({
      name: suppliers.partyBags.name || 'Party Bags',
      type: 'Party Bags',
      phone: suppliers.partyBags.phone || suppliers.partyBags.owner?.phone || partyBagsEnquiry?.supplier_phone,
      email: suppliers.partyBags.email || suppliers.partyBags.owner?.email || partyBagsEnquiry?.supplier_email,
      priority: 6
    })
  }

  // Filter out contacts without phone numbers and sort by priority
  const validContacts = contacts.filter(c => c.phone || c.email).sort((a, b) => a.priority - b.priority)

  if (validContacts.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <p className="text-sm text-gray-500">Contacts will appear once suppliers are booked</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">

      <div className="space-y-4">
        {validContacts.map((contact, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{contact.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{contact.type}</p>

                <div className="space-y-2">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                  )}

                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{contact.email}</span>
                    </a>
                  )}

                  {contact.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{contact.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors"
                  aria-label={`Call ${contact.name}`}
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900 mb-1">Emergency Services</p>
            <p className="text-sm text-red-800">
              For medical emergencies, call <a href="tel:999" className="font-bold underline">999</a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            // Generate a text file with all contacts
            const contactsText = validContacts.map(c =>
              `${c.name} (${c.type})\n${c.phone ? `Phone: ${c.phone}\n` : ''}${c.email ? `Email: ${c.email}\n` : ''}${c.address ? `Address: ${c.address}\n` : ''}`
            ).join('\n\n')

            const blob = new Blob([contactsText], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${partyDetails?.child_name || 'party'}-contacts.txt`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mx-auto"
        >
          <ExternalLink className="w-4 h-4" />
          Export Contacts
        </button>
      </div>
    </div>
  )
}
