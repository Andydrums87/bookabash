"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function GoLiveTermsModal({ isOpen, onClose, onSuccess, supplierData, businessId }) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoLive = async () => {
    if (!termsAccepted) {
      setError("Please accept the supplier terms to go live.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock success - in real app this would update the database
      console.log("[v0] Mock: Going live for business:", businessId)
      console.log("[v0] Mock: Terms accepted for supplier:", supplierData?.name)

      onSuccess()
      onClose()
    } catch (err) {
      console.error("Go live error:", err)
      setError(err.message || "Failed to go live. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-white">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold text-gray-900">Supplier Terms - Go Live</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Review and accept the terms below to make your business visible to customers.
          </p>
          <Button
            onClick={handleGoLive}
            disabled={!termsAccepted || loading}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Going Live...
              </>
            ) : (
              "Go Live Now"
            )}
          </Button>
        </DialogHeader>
        

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            <div className="border border-gray-200 rounded p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Business Going Live:</h3>
              <p className="text-sm text-gray-700">
                <strong>{supplierData?.name || "Your Business"}</strong> will become visible to customers and you'll
                start receiving booking requests.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
                Supplier Terms Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">1. Service Responsibilities</h4>
                  <ul className="text-gray-700 space-y-0.5 ml-4">
                    <li>• Respond to customer inquiries within 24 hours</li>
                    <li>• Provide services exactly as described in your profile</li>
                    <li>• Honor all confirmed bookings and agreements</li>
                    <li>• Maintain professional service standards at all times</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">2. Platform Terms</h4>
                  <ul className="text-gray-700 space-y-0.5 ml-4">
                    <li>• 8% commission applies to all successful bookings</li>
                    <li>• All payments processed securely through the platform</li>
                    <li>• Customer reviews and ratings will be publicly visible</li>
                    <li>• Profile must meet platform quality standards</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">3. Important Notice</h4>
                  <p className="text-gray-700 ml-4">
                    Once live, your business profile will be discoverable by customers. You may pause your profile or
                    update information at any time through your supplier dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded p-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="go-live-terms"
                  checked={termsAccepted}
                  onCheckedChange={setTermsAccepted}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="go-live-terms" className="text-sm font-medium cursor-pointer text-gray-900">
                    I accept PartySnap's Supplier Terms & Conditions and Privacy Policy
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    By accepting, you agree to provide professional services and follow platform guidelines.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="border border-red-200 rounded p-3 bg-red-50">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 bg-transparent">
            Cancel
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}
