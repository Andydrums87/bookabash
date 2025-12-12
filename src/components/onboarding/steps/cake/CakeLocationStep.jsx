"use client"

import { useState } from "react"
import { MapPin, Search } from "lucide-react"
import { LoadScript, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api"

const libraries = ["places"]

const mapContainerStyle = {
  width: '100%',
  height: '200px',
  borderRadius: '16px'
}

export default function CakeLocationStep({ cakeBusinessDetails, onChange }) {
  const [localData, setLocalData] = useState(cakeBusinessDetails || {
    businessName: "",
    phone: "",
    postcode: "",
    city: "",
    fullAddress: "",
    latitude: null,
    longitude: null
  })

  const [autocomplete, setAutocomplete] = useState(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)

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
        return
      }

      const addressComponents = place.address_components || []
      let city = ""
      let postcode = ""

      addressComponents.forEach((component) => {
        const types = component.types
        if (types.includes("postal_town") || types.includes("locality")) {
          city = component.long_name
        }
        if (types.includes("postal_code")) {
          postcode = component.long_name
        }
      })

      const updated = {
        ...localData,
        city: city,
        postcode: postcode,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        fullAddress: place.formatted_address
      }
      setLocalData(updated)
      onChange(updated)
    }
  }

  const hasCoordinates = localData.latitude && localData.longitude
  const mapCenter = hasCoordinates
    ? { lat: localData.latitude, lng: localData.longitude }
    : { lat: 51.5074, lng: -0.1278 }

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Where are you based?
        </h1>
        <p className="text-lg text-gray-600">
          This helps customers in your area find you
        </p>
      </div>

      <div className="space-y-6">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
          onLoad={() => setMapsLoaded(true)}
        >
          {/* Address Search */}
          <div>
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
              options={{
                componentRestrictions: { country: ["gb", "ie"] },
                fields: ["address_components", "geometry", "formatted_address"],
                types: ["(regions)"]
              }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for your town or city..."
                  defaultValue={localData.fullAddress || localData.city || ''}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
                />
              </div>
            </Autocomplete>
            <p className="mt-2 text-sm text-gray-500">
              Your exact address won't be shown - only your general area
            </p>
          </div>

          {/* Map preview */}
          {hasCoordinates && mapsLoaded && (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={12}
                options={{
                  disableDefaultUI: true,
                  zoomControl: false,
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

        {/* City and Postcode - show after selection */}
        {localData.city && (
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                City / Town
              </label>
              <input
                type="text"
                value={localData.city || ""}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Postcode
              </label>
              <input
                type="text"
                value={localData.postcode || ""}
                onChange={(e) => handleChange('postcode', e.target.value.toUpperCase())}
                placeholder="SW1A 1AA"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none uppercase"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
