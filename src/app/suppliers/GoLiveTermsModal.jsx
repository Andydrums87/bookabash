import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'

export function GoLiveTermsModal({ isOpen, onClose, onSuccess, supplierData, businessId }) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const TERMS_VERSION = "2025-01"

  const handleGoLive = async () => {
    if (!termsAccepted) {
      setError("Please accept the supplier terms to go live.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Get current authenticated user
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      const userId = authUser?.user?.id
      if (!userId) throw new Error("No authenticated user")

        const { data: updatedSupplier, error: updateError } = await supabase
        .from('suppliers')
        .update({
          profile_status: 'live',
          can_go_live: true,  // Force this to true regardless of calculation
          went_live_at: new Date().toISOString(),
          data: {
            ...supplierData,
            termsAcceptance: {
              version: TERMS_VERSION,
              acceptedAt: new Date().toISOString(),
              acceptedBy: userId,
              ipAddress: null
            },
            profileStatus: 'live',
            isLive: true
          }
        })
        .eq('id', businessId)
        .eq('auth_user_id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Database update error:', updateError)
        throw updateError
      }

      console.log('✅ Successfully went live:', updatedSupplier.business_name)

      // Dispatch event to refresh UI components
      window.dispatchEvent(new CustomEvent('supplierDataUpdated', {
        detail: { 
          supplierId: businessId,
          wentLive: true,
          updatedData: updatedSupplier
        }
      }))

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
      <DialogContent className="max-w-2xl max-h-[90vh] bg-white">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold text-gray-900">Supplier Terms – Go Live</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Review and accept these terms to make your business visible to customers.
          </p>
        </DialogHeader>

        <div className="flex flex-col" style={{ maxHeight: '60vh' }}>
          <div className="flex-1 overflow-y-auto px-1" style={{ maxHeight: '50vh' }}>
            <div className="space-y-5 py-4 text-sm text-gray-700 pr-3">
              <div className="border border-gray-200 rounded p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-1">Business Going Live</h3>
                <p>
                  <strong>{supplierData?.name || "Your Business"}</strong> will become visible to customers and able to
                  receive instant bookings.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
                  Supplier Terms Summary
                </h3>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">1. Service Responsibilities</h4>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Provide services exactly as described in your profile</li>
                    <li>Honor all confirmed bookings — if shown available, it must be fulfilled</li>
                    <li>Maintain professional service standards at all times</li>
                    <li>Keep availability accurate (or sync via Google Calendar)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">2. Platform Terms</h4>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>10% commission applies to all confirmed bookings (+£5 parent booking fee)</li>
                    <li>Deposits collected at booking; balance collected 14 days before event</li>
                    <li>Supplier payouts occur after the event (unless otherwise agreed)</li>
                    <li>Customer reviews and ratings will be visible publicly</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">3. Important Notice</h4>
                  <p className="ml-4">
                    Once live, your profile is discoverable by customers and open to instant bookings. Repeated failure to
                    honour bookings may result in suspension or removal.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded p-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="go-live-terms"
                    checked={termsAccepted}
                    onCheckedChange={setTermsAccepted}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="go-live-terms" className="text-sm font-medium cursor-pointer text-gray-900">
                      I have read and accept PartySnap's{" "}
                      <a href="/terms/supplier" target="_blank" className="underline">
                        Supplier Terms (v{TERMS_VERSION})
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" target="_blank" className="underline">
                        Privacy Policy
                      </a>
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      By accepting, you agree that any available booking is instantly confirmed and binding, and that
                      PartySnap may suspend or remove your profile for repeated failures.
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
          </div>

          <div className="flex-shrink-0 pt-4 border-t border-gray-200 flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleGoLive}
              disabled={!termsAccepted || loading}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Activating...
                </>
              ) : (
                "Agree & Go Live"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}