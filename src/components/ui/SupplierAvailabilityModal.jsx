"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, XCircle, RefreshCw, Loader2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal"
import { suppliersAPI } from "@/utils/mockBackend"
import { getDateStringForComparison } from "@/utils/dateHelpers"

const SupplierAvailabilityModal = ({ isOpen, onClose, onConfirm, currentDetails, newDetails, suppliers }) => {
  const [unavailableSuppliers, setUnavailableSuppliers] = useState([])
  const [isChecking, setIsChecking] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)

  useEffect(() => {
    if (isOpen && suppliers) {
      checkSuppliers()
    }
  }, [isOpen, suppliers, newDetails])

  const checkSuppliers = () => {
    setIsChecking(true)

    // Use your existing availability check logic here
    const unavailable = []

    // Skip non-supplier fields
    const nonSupplierFields = ['payment_status', 'estimated_cost', 'deposit_amount', 'addons', 'einvites', 'venueCarouselOptions']

    for (const [type, supplier] of Object.entries(suppliers)) {
      if (!supplier || nonSupplierFields.includes(type)) continue

      // Your existing availability check logic
      const checkDate = newDetails.date instanceof Date ? newDetails.date : new Date(newDetails.date)
      const timeSlot = newDetails.startTime
        ? Number.parseInt(newDetails.startTime.split(":")[0]) < 13
          ? "morning"
          : "afternoon"
        : "afternoon"

      const availabilityResult = checkSupplierAvailability(supplier, checkDate, timeSlot)

      if (!availabilityResult.available) {
        unavailable.push({ type, supplier, reason: availabilityResult.reason })
      }
    }

    setTimeout(() => {
      setUnavailableSuppliers(unavailable)
      setIsChecking(false)
    }, 1000)
  }

  const checkSupplierAvailability = (supplier, date, timeSlot) => {
    if (!supplier || !date) return { available: true }

    // Use your date helper instead of toISOString()
    const dateString = getDateStringForComparison(date)

    // Try to get unavailable dates from originalSupplier first
    const unavailableDates = supplier.unavailableDates || supplier.originalSupplier?.unavailableDates
    const originalSupplier = supplier.originalSupplier || {}

    console.log("Checking supplier:", supplier.name)
    console.log("Date string:", dateString)
    console.log("Unavailable dates:", unavailableDates)

    // Check lead time requirements first - prioritize serviceDetails.leadTime.minimum over advanceBookingDays
    const minLeadTime =
      // In serviceDetails (preferred location for cake suppliers)
      supplier.serviceDetails?.leadTime?.minimum ||
      supplier.serviceDetails?.fulfilment?.leadTime?.minimum ||
      // In data (JSONB column)
      supplier.data?.serviceDetails?.leadTime?.minimum ||
      supplier.data?.leadTime?.minimum ||
      supplier.data?.fulfilment?.leadTime?.minimum ||
      // Direct on supplier
      supplier.leadTime?.minimum ||
      supplier.leadTimeSettings?.minLeadTimeDays ||
      // In originalSupplier - same priority order
      originalSupplier.serviceDetails?.leadTime?.minimum ||
      originalSupplier.serviceDetails?.fulfilment?.leadTime?.minimum ||
      originalSupplier.data?.serviceDetails?.leadTime?.minimum ||
      originalSupplier.data?.leadTime?.minimum ||
      originalSupplier.data?.fulfilment?.leadTime?.minimum ||
      originalSupplier.leadTime?.minimum ||
      originalSupplier.leadTimeSettings?.minLeadTimeDays ||
      // Legacy fallback (advanceBookingDays) - only use if nothing else found
      supplier.advanceBookingDays ||
      originalSupplier.advanceBookingDays ||
      0;

    console.log("🔍 Lead time check for", supplier.name, ":", {
      minLeadTime,
      locations: {
        advanceBookingDays: supplier.advanceBookingDays,
        leadTimeSettings: supplier.leadTimeSettings?.minLeadTimeDays,
        leadTime: supplier.leadTime?.minimum,
        dataServiceDetails: supplier.data?.serviceDetails?.leadTime?.minimum,
        dataLeadTime: supplier.data?.leadTime?.minimum,
        dataFulfilment: supplier.data?.fulfilment?.leadTime?.minimum,
        serviceDetails: supplier.serviceDetails?.leadTime?.minimum,
        serviceDetailsFulfilment: supplier.serviceDetails?.fulfilment?.leadTime?.minimum,
        originalSupplier: originalSupplier?.serviceDetails?.leadTime?.minimum
      }
    })

    if (minLeadTime > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      const daysUntilParty = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24))

      if (daysUntilParty < minLeadTime) {
        const leadTimeLabel = minLeadTime === 7 ? '1 week' :
                              minLeadTime === 14 ? '2 weeks' :
                              minLeadTime === 21 ? '3 weeks' :
                              minLeadTime === 28 ? '4 weeks' :
                              `${minLeadTime} days`;
        console.log("UNAVAILABLE: Lead time issue -", daysUntilParty, "days until party, needs", minLeadTime)
        return {
          available: false,
          reason: `Requires ${leadTimeLabel} notice (party is ${daysUntilParty} days away)`
        }
      }
    }

    // Check unavailable dates
    if (unavailableDates && Array.isArray(unavailableDates)) {
      for (const ud of unavailableDates) {
        console.log("Comparing:", ud.date, "with", dateString)

        if (ud.date === dateString) {
          console.log("Date match found! Checking time slots...")

          if (ud.timeSlots && ud.timeSlots.includes(timeSlot)) {
            console.log("UNAVAILABLE: Time slot blocked")
            return { available: false, reason: "Not available at this time" }
          }
        }
      }
    }

    console.log("AVAILABLE")
    return { available: true }
  }

  const handleFindReplacements = async () => {
    setIsRebuilding(true)

    try {
      const currentPlan = JSON.parse(localStorage.getItem("user_party_plan") || "{}")

      // For each unavailable supplier, find a replacement
      for (const unavailableItem of unavailableSuppliers) {
        const { type, supplier: unavailableSupplier } = unavailableItem

        // Get all suppliers of this category
        const allSuppliers = await suppliersAPI.getAllSuppliers()
        const categorySuppliers = allSuppliers.filter(
          (s) => s.category === getSupplierCategory(type) && s.id !== unavailableSupplier.id, // Exclude the unavailable one
        )

        // Pick the first available one
        const replacement = categorySuppliers[0]

        if (replacement) {
          // Replace in party plan
          currentPlan[type] = {
            id: replacement.id,
            name: replacement.name,
            description: replacement.description,
            price: replacement.priceFrom || 0,
            status: "pending",
            image: replacement.image,
            category: replacement.category,
            priceUnit: replacement.priceUnit || "per event",
            addedAt: new Date().toISOString(),
            originalSupplier: replacement,
          }
          console.log(`Replaced ${unavailableSupplier.name} with ${replacement.name}`)
        } else {
          // No replacement found - set to null (empty card)
          currentPlan[type] = null
          console.log(`No replacement found for ${unavailableSupplier.name}`)
        }
      }

      // Save updated party plan
      localStorage.setItem("user_party_plan", JSON.stringify(currentPlan))

      // Update UI
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "user_party_plan",
          newValue: JSON.stringify(currentPlan),
        }),
      )

      onConfirm(newDetails)
      onClose()
    } catch (error) {
      console.error("Error finding replacements:", error)
    } finally {
      setIsRebuilding(false)
    }
  }

  const handleKeepThisDate = () => {
    onClose()
  }

  const getSupplierCategory = (type) => {
    const map = {
      venue: "Venues",
      entertainment: "Entertainment",
      catering: "Catering",
      cakes: "Cakes",
      decorations: "Decorations",
      activities: "Soft Play",
      facePainting: "Face Painting",
      partyBags: "Party Bags",
    }
    return map[type]
  }

  const getSupplierDisplayName = (type) => {
    const names = {
      venue: "Venue",
      entertainment: "Entertainment",
      catering: "Catering",
      cakes: "Cakes",
      decorations: "Decorations",
      activities: "Soft Play",
      facePainting: "Face Painting",
      partyBags: "Party Bags",
    }
    return names[type] || type
  }

  if (!isOpen) return null

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="md" theme="fun">
      <ModalHeader
        title="Supplier Availability Check"
        subtitle="Checking if your suppliers are free for the new time"
        theme="fun"
        icon={<AlertTriangle className="w-6 h-6" />}
      />

      <ModalContent className="space-y-4">
        {isChecking && (
          <div className="text-center py-6">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Checking availability...</p>
          </div>
        )}

        {isRebuilding && (
          <div className="text-center py-6">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Finding replacement suppliers...</p>
          </div>
        )}

        {!isChecking && !isRebuilding && unavailableSuppliers.length > 0 && (
          <div className="space-y-4">
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-primary-600" />
                <h4 className="font-medium text-gray-900">These suppliers aren't available for this date:</h4>
              </div>
              <div className="space-y-2">
                {unavailableSuppliers.map((item, i) => (
                  <div key={i} className="text-sm text-gray-700 pl-6">
                    <div className="font-medium">• {getSupplierDisplayName(item.type)}: {item.supplier.name}</div>
                    {item.reason && (
                      <div className="text-xs text-gray-500 pl-3 mt-0.5">{item.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">What would you like to do?</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  • <strong>Keep Original:</strong> Keep your current date and don't make changes
                </p>
                <p>
                  • <strong>Find Others:</strong> Save the new date and find replacement suppliers who are available
                </p>
              </div>
            </div>
          </div>
        )}

        {!isChecking && !isRebuilding && unavailableSuppliers.length === 0 && (
          <div className="text-center py-4">
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h4 className="font-medium text-gray-900">Perfect! All suppliers are available</h4>
              </div>
              <p className="text-sm text-gray-600">Your entire team can make the new date and time.</p>
            </div>
          </div>
        )}
      </ModalContent>

      <ModalFooter>
        <div className="flex gap-3 w-full">
          {unavailableSuppliers.length === 0 ? (
            <Button
              onClick={() => {
                onConfirm(newDetails)
                onClose()
              }}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
            >
              Save Changes
            </Button>
          ) : (
            <>
              <Button
                onClick={handleKeepThisDate}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                Keep Original
              </Button>
              <Button
                onClick={handleFindReplacements}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
                disabled={isRebuilding}
              >
                {isRebuilding ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Finding...
                  </>
                ) : (
                  "Find Others"
                )}
              </Button>
            </>
          )}
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}

export default SupplierAvailabilityModal
