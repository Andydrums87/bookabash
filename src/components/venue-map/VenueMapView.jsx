"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"
import VenueMapMarker from "./VenueMapMarker"
import VenueMapCard from "./VenueMapCard"

const libraries = ["places"]

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

// Minimal map style - hide POIs and transit to focus on venues
const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
]

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  fullscreenControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  styles: mapStyles,
  gestureHandling: "greedy",
}

export default function VenueMapView({
  venues = [],
  coordinates = {},
  selectedVenueId,
  hoveredVenueId,
  onSelectVenue,
  onHoverVenue,
  onViewDetails,
  onConfirmSelect,
  showPopupCard = true,
  selectedVenue: externalSelectedVenue,
  partyDetails,
  userCoordinates = null,
}) {
  const [map, setMap] = useState(null)
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const hasInitialized = useRef(false)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  // Get selected venue from venues list
  const selectedVenue = externalSelectedVenue || venues.find(v => v.id === selectedVenueId)

  // Default center (London) - used as fallback
  const defaultCenter = { lat: 51.5074, lng: -0.1278 }

  // Calculate initial center ONCE - memoized to prevent recalculation
  const initialCenter = useMemo(() => {
    if (userCoordinates?.lat && userCoordinates?.lng) {
      return { lat: userCoordinates.lat, lng: userCoordinates.lng }
    }
    const firstCoord = Object.values(coordinates)[0]
    if (firstCoord?.lat && firstCoord?.lng) {
      return { lat: firstCoord.lat, lng: firstCoord.lng }
    }
    return defaultCenter
  }, []) // Empty deps - only calculate once on mount

  // Initial zoom level
  const initialZoom = useMemo(() => {
    return userCoordinates ? 13 : 11
  }, []) // Empty deps - only calculate once

  // Fit bounds ONLY once when map loads and coordinates are available
  useEffect(() => {
    if (!map || hasInitialized.current) return
    if (Object.keys(coordinates).length === 0) return

    const bounds = new window.google.maps.LatLngBounds()
    let hasValidCoords = false

    // Include user's location in bounds if available
    if (userCoordinates?.lat && userCoordinates?.lng) {
      bounds.extend(new window.google.maps.LatLng(userCoordinates.lat, userCoordinates.lng))
      hasValidCoords = true
    }

    // Include all venue coordinates
    Object.entries(coordinates).forEach(([venueId, coord]) => {
      if (coord?.lat && coord?.lng) {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng))
        hasValidCoords = true
      }
    })

    if (hasValidCoords) {
      map.fitBounds(bounds, { padding: 60 })

      // After fitting, ensure zoom isn't too far out or too close
      const listener = map.addListener("idle", () => {
        const currentZoom = map.getZoom()
        if (currentZoom > 15) {
          map.setZoom(15)
        } else if (currentZoom < 10) {
          map.setZoom(10)
        }
        window.google.maps.event.removeListener(listener)
      })

      hasInitialized.current = true
    }
  }, [map, coordinates, userCoordinates])

  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
    hasInitialized.current = false
  }, [])

  // Handle marker click
  const handleMarkerClick = useCallback((venue) => {
    onSelectVenue?.(venue.id)
  }, [onSelectVenue])

  // Handle close popup card
  const handleCloseCard = useCallback(() => {
    onSelectVenue?.(null)
  }, [onSelectVenue])

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Error loading map</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        defaultCenter={initialCenter}
        defaultZoom={initialZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onClick={() => handleCloseCard()}
      >
        {/* Custom price markers */}
        {venues.map((venue) => {
          const coord = coordinates[venue.id]
          if (!coord?.lat || !coord?.lng) return null

          return (
            <VenueMapMarker
              key={venue.id}
              venue={venue}
              position={coord}
              isSelected={selectedVenueId === venue.id}
              isHovered={hoveredVenueId === venue.id}
              onClick={() => handleMarkerClick(venue)}
              onMouseEnter={() => onHoverVenue?.(venue.id)}
              onMouseLeave={() => onHoverVenue?.(null)}
            />
          )
        })}
      </GoogleMap>

      {/* Popup card rendered as overlay on top of map - won't get clipped */}
      {showPopupCard && selectedVenue && (
        <div className="absolute bottom-4 right-4 z-10 max-w-[320px]">
          <VenueMapCard
            venue={selectedVenue}
            onClose={handleCloseCard}
            onViewDetails={() => onViewDetails?.(selectedVenue)}
            onSelect={() => onConfirmSelect?.(selectedVenue)}
            partyDetails={partyDetails}
          />
        </div>
      )}
    </div>
  )
}
