"use client"

import { useState } from "react"
import { MapPin, Search } from "lucide-react"
import { LoadScript, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api"

const libraries = ["places"]

export default function ServiceAreaStep({ serviceArea, onChange }) {
  const [localData, setLocalData] = useState(serviceArea || {
    baseLocation: "",
    postcode: "",
    addressLine1: "",
    fullAddress: "",
    latitude: null,
    longitude: null,
    travelRadius: 10,
    travelFee: 0
  })

  const [autocomplete, setAutocomplete] = useState(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)

  const radiusOptions = [
    { value: 5, label: "5 miles" },
    { value: 10, label: "10 miles" },
    { value: 20, label: "20 miles" },
    { value: 30, label: "30 miles" },
    { value: 50, label: "50 miles" },
    { value: 100, label: "100+ miles" }
  ]

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onChange(updated)
  }

  const onAutocompleteLoad = (autocompleteInstance) => {
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

      // Update with parsed address
      const updated = {
        ...localData,
        addressLine1: addressLine1,
        baseLocation: city,
        postcode: postcode,
        country: country,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        fullAddress: place.formatted_address
      }
      setLocalData(updated)
      onChange(updated)
    }
  }

  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '200px',
    borderRadius: '12px'
  }

  const hasCoordinates = localData.latitude && localData.longitude
  const mapCenter = hasCoordinates
    ? { lat: localData.latitude, lng: localData.longitude }
    : { lat: 51.5074, lng: -0.1278 } // Default to London

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        {/* <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary-600" />
        </div> */}
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Where are you based?
        </h1>
        <p className="text-lg text-gray-600">
          Your full address won't be shown publicly - only your general area
        </p>
      </div>

      <div className="space-y-6">
        {/* Address Search with Google Places */}
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
          onLoad={() => setMapsLoaded(true)}
        >
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search for your address
            </label>
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
              options={{
                componentRestrictions: { country: ["gb", "ie"] },
                fields: ["address_components", "geometry", "formatted_address", "name"],
                types: ["address"]
              }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Start typing your address..."
                  defaultValue={localData.fullAddress || ''}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
                />
              </div>
            </Autocomplete>
          </div>

          {/* Map - shows when we have coordinates */}
          {hasCoordinates && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={14}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    }
                  ]
                }}
              >
                <Marker position={mapCenter} />
              </GoogleMap>
            </div>
          )}
        </LoadScript>

        {/* Address Fields - shown after address selection */}
        {(localData.addressLine1 || localData.fullAddress) && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={localData.addressLine1 || ""}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                placeholder="123 High Street"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  City / Town
                </label>
                <input
                  type="text"
                  value={localData.baseLocation || ""}
                  onChange={(e) => handleChange('baseLocation', e.target.value)}
                  placeholder="E.g., Manchester"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Postcode
                </label>
                <input
                  type="text"
                  value={localData.postcode || ""}
                  onChange={(e) => handleChange('postcode', e.target.value.toUpperCase())}
                  placeholder="M1 1AA"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Help text when no address selected */}
        {!localData.addressLine1 && !localData.fullAddress && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Start typing your address above to search and auto-fill your location
            </p>
          </div>
        )}

        {/* Travel Radius */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            How far will you travel?
          </label>
          <p className="text-sm text-gray-500 mb-4">A larger radius means more booking opportunities</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {radiusOptions.map((option) => {
              const isSelected = localData.travelRadius === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('travelRadius', option.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-center font-medium
                    ${isSelected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
