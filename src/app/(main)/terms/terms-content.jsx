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
          <li>Use the platform lawfully and respectfully.</li>
        </ul>
      </section>

      {/* How Party Snap Works */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          2. How Party Snap Works
        </h2>
        <p className="text-gray-600 mb-4">
          Party Snap is a party planning service. When you place an order, we coordinate everything on your behalf using our network of carefully selected local service providers. You choose your theme, venue, and extras. We handle the rest.
        </p>
        <p className="text-gray-600">
          Your order is not instantly confirmed at the point of payment. Our team personally confirms every element of your party — venue availability, service provider bookings, and all logistics — and sends you a personalised confirmation pack within 2 working days.
        </p>
      </section>

      {/* Payment Terms */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          3. Payment Terms
        </h2>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Full payment is taken at the time of booking to secure your order.</li>
          <li>Payments are processed securely via Stripe.</li>
          <li>Klarna interest-free instalments are available on eligible orders.</li>
          <li>You will receive an email receipt immediately after payment.</li>
          <li>A booking fee may apply.</li>
        </ul>
      </section>

      {/* Confirmation & Changes */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          4. Confirmation & Changes
        </h2>
        <p className="text-gray-600 mb-4">
          Within 2 working days of your order, you will receive a confirmation pack with all party details confirmed. If any element of your booking is unavailable, we will contact you to offer a suitable alternative or a full refund for that item.
        </p>
        <p className="text-gray-600">
          You can add extras to your party at any time through your dashboard, subject to availability. To make changes or remove items, contact us at <a href="mailto:hello@partysnap.co.uk" className="text-primary-600 hover:underline">hello@partysnap.co.uk</a>. Changes made less than 7 days before your party may not be possible.
        </p>
      </section>

      {/* Cancellation Policy */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          5. Cancellation Policy
        </h2>

        <h3 className="text-base font-medium text-gray-900 mt-4 mb-3">Customer cancellations:</h3>
        <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
          <li><strong>More than 14 days before your party:</strong> full refund.</li>
          <li><strong>Between 7 and 14 days before your party:</strong> 50% refund.</li>
          <li><strong>Less than 7 days before your party:</strong> no refund.</li>
        </ul>

        <h3 className="text-base font-medium text-gray-900 mt-4 mb-3">If we cannot fulfil your booking:</h3>
        <p className="text-gray-600">
          If we are unable to confirm or deliver any part of your party, you will receive a full refund for that item. We will always try to find a suitable alternative first.
        </p>
      </section>

      {/* Safety & Responsibilities */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          6. Safety & Responsibilities
        </h2>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Parents and guardians are responsible for the supervision of children at all times during the party.</li>
          <li>Please inform us of any allergies, medical conditions, or special requirements at the time of booking.</li>
          <li>Ensure venue access is available at the agreed time.</li>
          <li>An adult must be present to receive deliveries and during all activities.</li>
        </ul>
      </section>

      {/* Liability */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          7. Liability
        </h2>
        <p className="text-gray-600">
          Party Snap coordinates and manages your party booking on your behalf. We work with carefully selected local service providers but are not the direct provider of all services. Our total liability is limited to the amount you paid through the platform. We are not responsible for the supervision of children at any time.
        </p>
      </section>

      {/* Data & Privacy */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          8. Data & Privacy
        </h2>
        <ul className="space-y-2 text-gray-600 list-disc list-inside">
          <li>Your data is processed in accordance with our <a href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</a>.</li>
          <li>Personal and booking details are shared only with service providers where necessary to deliver your party.</li>
          <li>We will never share your data for third-party marketing without your consent.</li>
          <li>You can request deletion of your data at any time.</li>
        </ul>
      </section>

      {/* Contact & Support */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          9. Contact & Support
        </h2>
        <p className="text-gray-600">
          For any questions, changes, or support: <a href="mailto:hello@partysnap.co.uk" className="text-primary-600 hover:underline">hello@partysnap.co.uk</a>
        </p>
      </section>

      {/* Your Guarantees */}
      <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Your Guarantees</h3>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li>• Personalised confirmation within 2 working days.</li>
          <li>• Full refund if we can't arrange any part of your booking.</li>
          <li>• Add extras anytime through your dashboard.</li>
          <li>• Dedicated support throughout your party journey.</li>
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
            <p className="text-sm text-gray-500">Last updated: March 2026</p>

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
