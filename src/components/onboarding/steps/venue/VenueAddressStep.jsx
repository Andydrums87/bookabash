"use client"

import { useState, useRef, useEffect } from "react"
import { LoadScript, Autocomplete } from "@react-google-maps/api"
import { MapPin } from "lucide-react"

const libraries = ["places"]

export default function VenueAddressStep({ venueData, onChange }) {
  const [autocomplete, setAutocomplete] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const autocompleteRef = useRef(null)

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance)
  }

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace()

      if (!place.geometry) {
        console.log("No details available for input: '" + place.name + "'")
        return
      }

      // Extract address components
      const addressComponents = place.address_components || []
      let streetNumber = ""
      let route = ""
      let city = ""
      let postcode = ""
      let country = ""

      addressComponents.forEach((component) => {
        const types = component.types
        if (types.includes("street_number")) {
          streetNumber = component.long_name
        }
        if (types.includes("route")) {
          route = component.long_name
        }
        if (types.includes("postal_town") || types.includes("locality")) {
          city = component.long_name
        }
        if (types.includes("postal_code")) {
          postcode = component.long_name
        }
        if (types.includes("country")) {
          country = component.long_name
        }
      })

      // Combine street number and route
      const addressLine1 = `${streetNumber} ${route}`.trim()

      // Update venue data with parsed address (NOT the name - user fills that manually)
      onChange({
        ...venueData,
        addressLine1: addressLine1,
        city: city,
        postcode: postcode,
        country: country,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        fullAddress: place.formatted_address
      })
    }
  }

  return (
    <div className="py-12 max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        Tell us about your venue
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        Your full address is only shared with guests after they've made a reservation
      </p>

      <div className="space-y-6">
        {/* Venue Name - First */}
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

        {/* Google Places Autocomplete */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Enter your address
          </label>
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={libraries}
            onLoad={() => setIsLoaded(true)}
          >
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              options={{
                componentRestrictions: { country: ["gb", "ie"] },
                fields: ["address_components", "geometry", "formatted_address", "name"],
                types: ["address"]
              }}
            >
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  ref={autocompleteRef}
                  type="text"
                  placeholder="Start typing your address..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:border-gray-900 focus:outline-none"
                />
              </div>
            </Autocomplete>
          </LoadScript>
        </div>

        {/* Show individual fields after address is selected */}
        {venueData.addressLine1 && (
          <>

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
          </>
        )}

        {/* Help text */}
        {!venueData.addressLine1 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Start typing your address and select from the suggestions for automatic completion
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
