// hooks/useGeolocation.js
import { useState } from 'react'

/**
 * Custom hook for getting user's location and converting to UK postcode
 * Uses browser's Geolocation API + free postcodes.io reverse geocoding
 */
export function useGeolocation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Get user's current location and convert to postcode
   * @returns {Promise<{success: boolean, postcode?: string, error?: string}>}
   */
  const getPostcodeFromLocation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser'
        setError(errorMsg)
        setIsLoading(false)
        return { success: false, error: errorMsg }
      }

      // Get user's coordinates
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords
      console.log('📍 Got coordinates:', { latitude, longitude })

      // Reverse geocode using free postcodes.io API
      // Add radius parameter to search within 1km
      const response = await fetch(
        `https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}&radius=1000&limit=1`
      )

      if (!response.ok) {
        throw new Error('Failed to connect to postcode service. Please try again or enter manually.')
      }

      const data = await response.json()

      if (data.status === 200 && data.result && data.result.length > 0) {
        // Get the closest postcode
        const closestResult = data.result[0]
        const postcode = closestResult.postcode

        console.log('✅ Found postcode:', postcode)
        console.log('📍 Location:', closestResult.admin_district, closestResult.region)

        setIsLoading(false)
        return {
          success: true,
          postcode,
          location: {
            district: closestResult.admin_district,
            region: closestResult.region,
            country: closestResult.country
          }
        }
      } else {
        // No results - likely outside UK or in area without precise postcode
        throw new Error('We couldn\'t find a UK postcode for your location. Are you in the UK? Please enter your postcode manually.')
      }

    } catch (err) {
      console.error('❌ Geolocation error:', err)

      let errorMessage = 'Could not get your location'

      // Handle specific error types
      if (err.code === 1) {
        errorMessage = 'Location permission denied. Please enable location access in your browser.'
      } else if (err.code === 2) {
        errorMessage = 'Location unavailable. Please check your device settings.'
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. Please try again.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  return {
    getPostcodeFromLocation,
    isLoading,
    error
  }
}
