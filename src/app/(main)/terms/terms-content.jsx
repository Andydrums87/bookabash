"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

function CustomerTermsBody() {
  return (
    <div className="prose prose-gray max-w-none">
      {/* Account Terms */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          1. Account & Platform Terms
        </h2>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>You must be at least 18 years old to create an account.</li>
          <li>Provide accurate and complete information during registration.</li>
          <li>Keep your login details secure and confidential.</li>
          <li>Respect other users and use the platform lawfully.</li>
        </ul>
      </section>

      {/* Booking Terms */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          2. Booking & Payment Terms
        </h2>

        <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Booking Confirmation</h3>
        <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
          <li>Your booking is <strong>instantly confirmed</strong> once your deposit is processed.</li>
          <li>You'll receive an email confirmation with supplier details.</li>
          <li>In the rare event a supplier cannot fulfil, PartySnap will find a replacement or provide a refund.</li>
        </ul>

        <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Payment & Fees</h3>
        <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
          <li>Deposit is taken at booking to secure services.</li>
          <li>Remaining balance is collected <strong>14 days</strong> before the party.</li>
          <li>A £5 booking fee may apply.</li>
        </ul>

        <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Cancellation Policy</h3>
        <p className="text-gray-600 mb-2"><strong>Customer cancellations:</strong></p>
        <ul className="space-y-1 text-gray-600 list-disc list-inside ml-4 mb-4">
          <li>More than 48 hours: Full refund minus 5% processing fee.</li>
          <li>24–48 hours: 50% refund of deposit, no refund of full payments.</li>
          <li>Less than 24 hours: No refund.</li>
        </ul>
        <p className="text-gray-600">
          <strong>Supplier cancellations:</strong> Full refund provided; PartySnap will help find a replacement where possible.
        </p>
      </section>

      {/* Liability & Safety */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          3. Liability & Safety
        </h2>

        <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Safety</h3>
        <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
          <li>Parents/guardians must supervise children at all times.</li>
          <li>Suppliers are background-checked where legally required.</li>
          <li>Inform suppliers of allergies or special requirements.</li>
        </ul>

        <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Liability</h3>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Suppliers are independent businesses responsible for their services.</li>
          <li>PartySnap's liability is limited to amounts paid through the platform.</li>
          <li>We are not responsible for supplier performance or child supervision.</li>
        </ul>
      </section>

      {/* Data & Contact */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          4. Data & Contact
        </h2>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Your data is processed under our <a href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</a>.</li>
          <li>Booking details are shared only with your selected suppliers.</li>
          <li>For support: <a href="mailto:hello@partysnap.co.uk" className="text-primary-600 hover:underline">hello@partysnap.co.uk</a></li>
        </ul>
      </section>

      {/* Your Rights */}
      <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Your Rights & Guarantees</h3>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li>• Instant booking confirmation on deposit.</li>
          <li>• Replacement or refund if a supplier cancels.</li>
          <li>• Clear cancellation windows and policies.</li>
          <li>• Support from PartySnap throughout your booking.</li>
        </ul>
      </section>
    </div>
  )
}


function SupplierTermsBody() {
  return (
    <div className="prose prose-gray max-w-none">
      {/* Listing & Quality */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          1. Listing & Quality
        </h2>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Accurate descriptions, pricing, photos; comply with laws & safeguarding.</li>
          <li>Minimum public liability insurance: <strong>£5,000,000</strong> per claim (proof on request).</li>
          <li>PartySnap may moderate content and suspend for quality/safety issues.</li>
        </ul>
      </section>

      {/* Availability & Calendar */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          2. Availability & Calendar Synchronization
        </h2>

        <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Instant Confirmation</h3>
        <p className="text-gray-600 mb-4">
          If a date and time is shown as available on PartySnap, a booking becomes <strong>instantly confirmed and binding</strong> when the parent pays the deposit. You must keep unavailability blocked. Repeated failures to honour bookings may result in suspension or removal.
        </p>

        <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Calendar Integration</h3>
        <p className="text-gray-600 mb-3">When you connect your calendar:</p>
        <ul className="space-y-2 text-gray-600 list-disc list-inside mb-4">
          <li>PartySnap will automatically sync your calendar availability in real-time.</li>
          <li>Events in your connected calendar will automatically block corresponding times.</li>
          <li>PartySnap bookings will be automatically added to your connected calendar.</li>
          <li>You can disconnect your calendar at any time.</li>
        </ul>

        <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Availability Requirements</h3>
        <p className="text-gray-600 mb-3">All suppliers must keep availability accurate through either:</p>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Manual updates to your PartySnap calendar, or</li>
          <li>Calendar synchronization with Google Calendar or Outlook Calendar</li>
        </ul>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            <strong>Calendar Privacy:</strong> PartySnap reads only free/busy information and creates events for confirmed bookings. We do not read event titles, descriptions, or attendees from your existing events.
          </p>
        </div>
      </section>

      {/* Commission & Payments */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          3. Commission, Payments & Cancellations
        </h2>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Commission: <strong>10%</strong> on total booking value. A £5 booking fee may be charged to parents.</li>
          <li>Deposits are collected at booking; balances collected <strong>14 days</strong> before the event.</li>
          <li>Payouts to suppliers occur <strong>after the event</strong> (or as specified on the platform).</li>
          <li>Supplier cancellations are a <strong>material breach</strong>. PartySnap may refund customers and set-off reasonable remediation costs.</li>
        </ul>
      </section>

      {/* Liability & Safeguarding */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          4. Liability, Safeguarding & Anti-circumvention
        </h2>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Entertainers working with children: appropriate checks (e.g., DBS) & safeguarding compliance required.</li>
          <li>Anti-circumvention: no off-platform payment for PartySnap-originated bookings for <strong>12 months</strong> after first contact.</li>
          <li>PartySnap liability is limited to the maximum extent permitted by law; suppliers indemnify PartySnap for their acts/omissions.</li>
        </ul>
      </section>

      {/* Notice */}
      <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <p className="text-sm text-gray-600">
          This page is for reference. Suppliers accept the binding <strong>Supplier Terms</strong> in-app when pressing <em>"Agree & Go Live"</em>. Customers accept the <strong>Customer Terms</strong> during checkout.
        </p>
      </section>
    </div>
  )
}

export default function TermsOfService() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialRole = useMemo(() => {
    const r = (searchParams.get("role") || "").toLowerCase()
    return r === "supplier" ? "supplier" : "customer"
  }, [searchParams])
  const [role, setRole] = useState(initialRole)

  useEffect(() => {
    const current = (searchParams.get("role") || "").toLowerCase()
    if (current !== role) {
      const url = new URL(window.location.href)
      url.searchParams.set("role", role)
      router.replace(url.toString())
    }
  }, [role, router, searchParams])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-2">Legal</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
            <p className="text-gray-600 mb-4">
              View the terms that apply to you as a Customer or as a Supplier on PartySnap.
            </p>
            <p className="text-sm text-gray-500">Last updated: 1 October 2025</p>

            {/* Role switcher */}
            <div className="mt-8 inline-flex rounded-lg bg-gray-100 p-1">
              <button
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition",
                  role === "customer"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setRole("customer")}
              >
                Customer / Parent
              </button>
              <button
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition",
                  role === "supplier"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setRole("supplier")}
              >
                Supplier
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {role === "customer" ? <CustomerTermsBody /> : <SupplierTermsBody />}

            {/* Footer links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Related policies:{" "}
                <a href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</a>
                {" · "}
                <a href="/cookies" className="text-primary-600 hover:underline">Cookies</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
