"use client"

import { OverlayView } from "@react-google-maps/api"

// Helper function to calculate venue price (same as VenueBrowserModal)
const calculateVenuePrice = (venue) => {
  if (venue.price && venue.price > 0) {
    return venue.price
  }

  const hourlyRate =
    venue.serviceDetails?.pricing?.hourlyRate ||
    venue.data?.serviceDetails?.pricing?.hourlyRate ||
    0

  const totalVenueHours =
    venue.serviceDetails?.pricing?.minimumBookingHours ||
    venue.serviceDetails?.availability?.minimumBookingHours ||
    venue.data?.serviceDetails?.pricing?.minimumBookingHours ||
    venue.data?.serviceDetails?.availability?.minimumBookingHours ||
    4

  const totalPrice = hourlyRate * totalVenueHours

  if (totalPrice > 0) {
    return totalPrice
  }

  return venue.packages?.[0]?.price || venue.priceFrom || venue.data?.priceFrom || 0
}

export default function VenueMapMarker({
  venue,
  position,
  isSelected = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const price = calculateVenuePrice(venue)

  // Determine marker style based on state
  const getMarkerStyles = () => {
    if (isSelected) {
      return "bg-gray-900 text-white scale-110 z-20"
    }
    if (isHovered) {
      return "bg-gray-900 text-white z-10"
    }
    return "bg-white text-gray-900 hover:bg-gray-900 hover:text-white z-0"
  }

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height / 2),
      })}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`
          px-3 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap
          cursor-pointer transition-all duration-200 ease-out
          shadow-md hover:shadow-lg
          border border-gray-200
          ${getMarkerStyles()}
        `}
        style={{
          transform: isSelected ? "scale(1.1)" : "scale(1)",
          transformOrigin: "center center",
        }}
      >
        £{price}
      </button>
    </OverlayView>
  )
}
