"use client"

export default function VenueAddressStep({ venueData, onChange }) {
  return (
    <div className="py-12 max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        Where is your venue located?
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        This helps families find and book your space
      </p>

      <div className="space-y-6">
        {/* Venue Name */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Venue Name
          </label>
          <input
            type="text"
            value={venueData.businessName || ""}
            onChange={(e) => onChange({ ...venueData, businessName: e.target.value })}
            placeholder="e.g., St Peter's Community Hall"
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
          />
        </div>

        {/* Address Line 1 */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Street Address
          </label>
          <input
            type="text"
            value={venueData.addressLine1 || ""}
            onChange={(e) => onChange({ ...venueData, addressLine1: e.target.value })}
            placeholder="123 Church Street"
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={venueData.addressLine2 || ""}
            onChange={(e) => onChange({ ...venueData, addressLine2: e.target.value })}
            placeholder="Optional"
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
          />
        </div>

        {/* City and Postcode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              City
            </label>
            <input
              type="text"
              value={venueData.city || ""}
              onChange={(e) => onChange({ ...venueData, city: e.target.value })}
              placeholder="London"
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-900 mb-2">
              Postcode
            </label>
            <input
              type="text"
              value={venueData.postcode || ""}
              onChange={(e) => onChange({ ...venueData, postcode: e.target.value.toUpperCase() })}
              placeholder="SW1A 1AA"
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none uppercase"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Country
          </label>
          <select
            value={venueData.country || "United Kingdom"}
            onChange={(e) => onChange({ ...venueData, country: e.target.value })}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
          >
            <option value="United Kingdom">United Kingdom</option>
            <option value="Ireland">Ireland</option>
          </select>
        </div>
      </div>
    </div>
  )
}
