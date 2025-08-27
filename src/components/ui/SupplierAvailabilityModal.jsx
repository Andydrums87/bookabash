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

    for (const [type, supplier] of Object.entries(suppliers)) {
      if (!supplier || type === "einvites" || type === "addons") continue

      // Your existing availability check logic
      const checkDate = newDetails.date instanceof Date ? newDetails.date : new Date(newDetails.date)
      const timeSlot = newDetails.startTime
        ? Number.parseInt(newDetails.startTime.split(":")[0]) < 13
          ? "morning"
          : "afternoon"
        : "afternoon"

      const isAvailable = checkSupplierAvailability(supplier, checkDate, timeSlot)

      if (!isAvailable) {
        unavailable.push({ type, supplier })
      }
    }

    setTimeout(() => {
      setUnavailableSuppliers(unavailable)
      setIsChecking(false)
    }, 1000)
  }

  const checkSupplierAvailability = (supplier, date, timeSlot) => {
    if (!supplier || !date) return true

    // Use your date helper instead of toISOString()
    const dateString = getDateStringForComparison(date)

    // Try to get unavailable dates from originalSupplier first
    const unavailableDates = supplier.unavailableDates || supplier.originalSupplier?.unavailableDates

    console.log("Checking supplier:", supplier.name)
    console.log("Date string:", dateString)
    console.log("Unavailable dates:", unavailableDates)

    // Check unavailable dates
    if (unavailableDates && Array.isArray(unavailableDates)) {
      for (const ud of unavailableDates) {
        console.log("Comparing:", ud.date, "with", dateString)

        if (ud.date === dateString) {
          console.log("Date match found! Checking time slots...")

          if (ud.timeSlots && ud.timeSlots.includes(timeSlot)) {
            console.log("UNAVAILABLE: Time slot blocked")
            return false
          }
        }
      }
    }

    console.log("AVAILABLE")
    return true
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
      activities: "Activities",
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
      activities: "Activities",
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-600" />
                <h4 className="font-medium text-red-900">These suppliers aren't available:</h4>
              </div>
              <div className="space-y-1">
                {unavailableSuppliers.map((item, i) => (
                  <div key={i} className="text-sm text-red-800 pl-6">
                    • {getSupplierDisplayName(item.type)}: {item.supplier.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What would you like to do?</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  • <strong>Keep Original:</strong> Save the new date/time and deal with unavailable suppliers later
                </p>
                <p>
                  • <strong>Find Others:</strong> We'll automatically find replacement suppliers who are available
                </p>
              </div>
            </div>
          </div>
        )}

        {!isChecking && !isRebuilding && unavailableSuppliers.length === 0 && (
          <div className="text-center py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Perfect! All suppliers are available</h4>
              </div>
              <p className="text-sm text-green-700">Your entire team can make the new date and time.</p>
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
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Save Changes
            </Button>
          ) : (
            <>
              <Button
                onClick={handleKeepThisDate}
                variant="outline"
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 bg-transparent"
              >
                Keep Original
              </Button>
              <Button
                onClick={handleFindReplacements}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
