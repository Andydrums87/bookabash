"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function BookingTermsModal({ children, partyDetails }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900">Booking Terms & Conditions</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">Terms for booking services through PartySnap.</p>
          {partyDetails && (
            <div className="border border-gray-200 rounded p-3 mt-3 bg-gray-50">
              <p className="text-sm text-gray-700">
                <strong>Booking:</strong> {partyDetails.childName}'s {partyDetails.theme} party on {partyDetails.date}
              </p>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="space-y-4 text-sm leading-relaxed">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">1. Booking Confirmation</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Your booking is confirmed once payment is processed</li>
                <li>You'll receive email confirmation with supplier details</li>
                <li>Suppliers are notified immediately and will contact you</li>
                <li>All bookings are subject to these terms</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">2. Payment Terms</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>
                  <strong>Deposits:</strong> 30% deposit secures service bookings, remainder due on party day
                </li>
                <li>
                  <strong>Full Payments:</strong> Products (cakes, party bags) require full payment upfront
                </li>
                <li>
                  <strong>Processing:</strong> Payments processed securely via Stripe
                </li>
                <li>
                  <strong>Receipts:</strong> Email confirmation sent immediately
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">3. Cancellation Policy</h2>

              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 mb-1">3.1 Customer Cancellations</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>
                    <strong>More than 48 hours:</strong> Full refund minus 5% processing fee
                  </li>
                  <li>
                    <strong>24-48 hours:</strong> 50% refund for deposits, no refund for full payments
                  </li>
                  <li>
                    <strong>Less than 24 hours:</strong> No refund
                  </li>
                  <li>Weather cancellations: Full refund if outdoor services affected</li>
                </ul>

                <h3 className="text-sm font-medium text-gray-800 mb-1 mt-3">3.2 Supplier Cancellations</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Full refund if supplier cancels for any reason</li>
                  <li>We'll help find replacement suppliers when possible</li>
                  <li>Additional compensation may apply for late cancellations</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">4. Party Day Responsibilities</h2>

              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 mb-1">4.1 Your Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Provide safe, suitable venue access for suppliers</li>
                  <li>Ensure adult supervision of children at all times</li>
                  <li>Inform suppliers of any allergies or special requirements</li>
                  <li>Have remaining payment ready (if deposits were paid)</li>
                  <li>Provide parking information and access details</li>
                </ul>

                <h3 className="text-sm font-medium text-gray-800 mb-1 mt-3">4.2 Supplier Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Arrive on time with all equipment and materials</li>
                  <li>Provide services as described in their profile</li>
                  <li>Maintain appropriate insurance and safety standards</li>
                  <li>Clean up their area after service completion</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">5. Safety & Child Protection</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>All suppliers are background checked where required by law</li>
                <li>Parents/guardians must supervise children during activities</li>
                <li>Inform suppliers of any medical conditions or allergies</li>
                <li>PartySnap is not responsible for child supervision</li>
                <li>Report any safety concerns immediately</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">6. Liability & Insurance</h2>

              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 mb-1">6.1 Supplier Insurance</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>All suppliers carry public liability insurance</li>
                  <li>Coverage details available on request</li>
                  <li>Suppliers responsible for their equipment and actions</li>
                </ul>

                <h3 className="text-sm font-medium text-gray-800 mb-1 mt-3">6.2 Platform Liability</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>PartySnap connects customers with independent suppliers</li>
                  <li>We are not liable for supplier performance or safety</li>
                  <li>Our liability is limited to refund of payments made</li>
                  <li>You use the platform at your own risk</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">7. Communication & Changes</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Direct communication with suppliers after booking</li>
                <li>Changes to bookings must be agreed by both parties</li>
                <li>Contact PartySnap support for assistance</li>
                <li>Emergency contact details provided after booking</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">8. Reviews & Feedback</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>You may review suppliers after your party</li>
                <li>Reviews must be honest and based on actual experience</li>
                <li>Suppliers may respond to reviews publicly</li>
                <li>Inappropriate reviews will be removed</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">9. Disputes & Resolution</h2>

              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 mb-1">9.1 Service Issues</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Report issues within 48 hours of your party</li>
                  <li>We'll mediate between you and suppliers</li>
                  <li>Partial refunds may be offered for service issues</li>
                  <li>Suppliers have opportunity to resolve complaints</li>
                </ul>

                <h3 className="text-sm font-medium text-gray-800 mb-1 mt-3">9.2 Payment Disputes</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Contact us before disputing with your bank</li>
                  <li>We'll investigate all payment concerns</li>
                  <li>Bank chargebacks may affect future bookings</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">10. Data Protection</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Your booking details shared with selected suppliers only</li>
                <li>Contact information used for booking coordination</li>
                <li>Party photos may be used for marketing (with permission)</li>
                <li>You can request data deletion after your party</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">11. Contact Information</h2>
              <p className="text-gray-700 mb-2">For booking support and queries:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Email: bookings@partysnap.co.uk</li>
                <li>Phone: [YOUR PHONE NUMBER]</li>
                <li>Emergency support available during party hours</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded p-4 bg-gray-50 mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Your Booking Rights:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Professional service guarantee</li>
                <li>• Full refund if suppliers cancel</li>
                <li>• 48-hour booking protection</li>
                <li>• Customer support throughout your party journey</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">Last updated: January 2025</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-6 pt-4 border-t">
          <Button onClick={() => setOpen(false)} className="w-full">
            Close Terms
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Booking Terms Acceptance Component for Payment Form
export function BookingTermsAcceptance({ termsAccepted, setTermsAccepted, partyDetails, required = true }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Checkbox
        id="booking-terms"
        checked={termsAccepted}
        onCheckedChange={setTermsAccepted}
        required={required}
        className="h-5 w-5 rounded border-gray-300"
      />
      <Label htmlFor="booking-terms" className="text-sm text-gray-600 cursor-pointer">
        I agree to the{" "}
        <BookingTermsModal partyDetails={partyDetails}>
          <button type="button" className="text-gray-900 underline underline-offset-2">
            terms & conditions
          </button>
        </BookingTermsModal>
      </Label>
    </div>
  )
}
