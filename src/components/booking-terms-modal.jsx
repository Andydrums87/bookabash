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
          <DialogTitle className="text-lg font-semibold text-gray-900">Party Snap — Booking Terms & Conditions</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Last updated: March 2026</p>
          {partyDetails && (
            <div className="border border-gray-200 rounded p-3 mt-3 bg-gray-50">
              <p className="text-sm text-gray-700">
                <strong>Booking:</strong> {partyDetails.childName}'s {partyDetails.theme} party on {partyDetails.date}
              </p>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="space-y-5 text-sm leading-relaxed">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">1. How Your Booking Works</h2>
              <p className="text-gray-700">
                When you place your order, our team gets to work confirming every element of your party. You'll receive a personalised confirmation pack within 2 working days. If any part of your party can't be arranged as planned, we'll offer you a suitable alternative or a full refund for that item.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">2. Payment</h2>
              <p className="text-gray-700">
                Full payment is taken at the time of booking. Payments are processed securely via Stripe. Klarna interest-free instalments are available on eligible orders. You'll receive an email receipt immediately after payment.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">3. Your Confirmation Pack</h2>
              <p className="text-gray-700 mb-2">
                Within 2 working days of your order, we'll send you a confirmation pack including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Confirmed venue details and access times</li>
                <li>A summary of everything booked for your party</li>
                <li>Delivery and setup information</li>
                <li>What to expect on the day</li>
              </ul>
              <p className="text-gray-700 mt-2">
                If we need to make any changes to your selections, we'll contact you before confirming.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">4. Cancellation Policy</h2>

              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 mb-1">If you cancel:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>More than 14 days before your party:</strong> full refund</li>
                  <li><strong>Between 7 and 14 days before your party:</strong> 50% refund</li>
                  <li><strong>Less than 7 days before your party:</strong> no refund</li>
                  <li>If we are unable to confirm any part of your booking within our 2 working day window: full refund for that item</li>
                </ul>

                <h3 className="text-sm font-medium text-gray-800 mb-1 mt-3">If we cancel:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>If we're unable to fulfil any part of your party, you'll receive a full refund for that item</li>
                  <li>We'll always try to find a suitable alternative first</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">5. Changes to Your Booking</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>You can add extras to your party at any time through your dashboard, subject to availability</li>
                <li>To remove or change items, contact us at bookings@partysnap.co.uk</li>
                <li>Changes are subject to availability and may affect pricing</li>
                <li>Changes made less than 7 days before your party may not be possible</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">6. On the Day</h2>

              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-800 mb-1">What we handle:</h3>
                <p className="text-gray-700 mb-2">
                  All deliveries, setup, and coordination with our service providers. Everything arrives at the right place at the right time.
                </p>

                <h3 className="text-sm font-medium text-gray-800 mb-1 mt-3">What we need from you:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Ensure venue access at the agreed time</li>
                  <li>An adult present to receive deliveries and supervise children at all times</li>
                  <li>Let us know in advance about any allergies, medical conditions, or special requirements</li>
                  <li>Provide parking information and access details where needed</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">7. Allergies and Dietary Requirements</h2>
              <p className="text-gray-700">
                Please inform us of any allergies or dietary requirements at the time of booking. This applies to cakes, party bags containing sweets, face painting products, and any other items that may come into contact with children. While we take every care, parents are responsible for checking suitability for their children.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">8. Liability</h2>
              <p className="text-gray-700">
                Party Snap coordinates and manages your party booking. We work with carefully selected local service providers to deliver your party. While we take every care to ensure quality and reliability, our total liability is limited to the amount you paid for your booking. Parents and guardians are responsible for the supervision of children at all times.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">9. Data and Privacy</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Your personal and booking details are used solely for the purpose of arranging your party</li>
                <li>Your contact information may be shared with our service providers where necessary to deliver your booking</li>
                <li>We will never share your details for marketing purposes without your consent</li>
                <li>You can request deletion of your data at any time</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">10. Feedback</h2>
              <p className="text-gray-700">
                After your party, we'd love to hear how it went. Your feedback helps us improve and helps other parents make decisions. We may follow up by email to ask about your experience.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">11. Contact Us</h2>
              <p className="text-gray-700 mb-3">
                For any questions, changes, or support: <a href="mailto:bookings@partysnap.co.uk" className="text-primary-600 underline">bookings@partysnap.co.uk</a>
              </p>
              <p className="text-gray-700 font-medium">
                Party Snap is here to make your child's party effortless. If anything isn't right, get in touch and we'll sort it.
              </p>
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
