"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FileText, Shield, Users, CreditCard, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function CustomerTermsBody() {
  return (
    <>
      {/* Quick Navigation */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Navigation</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="#account" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="font-medium">Account Terms</span>
          </a>
          <a href="#booking" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <span className="font-medium">Booking Terms</span>
          </a>
          <a href="#liability" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <Shield className="w-5 h-5 text-primary-600" />
            <span className="font-medium">Liability & Safety</span>
          </a>
        </div>
      </div>

      {/* Account Terms Section */}
      <div id="account" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
          Account & Platform Terms
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>You must be at least 18 years old to create an account.</li>
          <li>Provide accurate and complete information during registration.</li>
          <li>Keep your login details secure and confidential.</li>
          <li>Respect other users and use the platform lawfully.</li>
        </ul>
      </div>

      {/* Booking Terms Section */}
      <div id="booking" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
          Booking & Payment Terms
        </h2>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Booking Confirmation</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>Your booking is <strong>instantly confirmed</strong> once your deposit is processed.</li>
          <li>You'll receive an email confirmation with supplier details.</li>
          <li>In the rare event a supplier cannot fulfil, PartySnap will find a replacement or provide a refund.</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment & Fees</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>Deposit is taken at booking to secure services.</li>
          <li>Remaining balance is collected <strong>14 days</strong> before the party.</li>
          <li>A £5 booking fee may apply.</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
        <div className="ml-4 space-y-2">
          <p><strong>Customer cancellations:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>More than 48h: Full refund minus 5% processing fee.</li>
            <li>24–48h: 50% refund of deposit, no refund of full payments.</li>
            <li>Less than 24h: No refund.</li>
          </ul>
          <p><strong>Supplier cancellations:</strong> Full refund provided; PartySnap will help find a replacement where possible.</p>
        </div>
      </div>

      {/* Liability & Safety Section */}
      <div id="liability" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-gray-200 border-b">
          Liability & Safety
        </h2>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Safety</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>Parents/guardians must supervise children at all times.</li>
          <li>Suppliers are background-checked where legally required.</li>
          <li>Inform suppliers of allergies or special requirements.</li>
        </ul>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Liability</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Suppliers are independent businesses responsible for their services.</li>
          <li>PartySnap's liability is limited to amounts paid through the platform.</li>
          <li>We are not responsible for supplier performance or child supervision.</li>
        </ul>
      </div>

      {/* Data & Contact Section */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Data & Contact</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Your data is processed under our <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>.</li>
          <li>Booking details are shared only with your selected suppliers.</li>
          <li>For support: bookings@partysnap.co.uk · [YOUR PHONE]</li>
        </ul>
      </div>

      {/* Customer Rights Summary */}
      <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-3xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Your Rights & Guarantees</h3>
        <ul className="space-y-2 opacity-90">
          <li>• Instant booking confirmation on deposit.</li>
          <li>• Replacement or refund if a supplier cancels.</li>
          <li>• Clear cancellation windows and policies.</li>
          <li>• Support from PartySnap throughout your booking.</li>
        </ul>
        <div className="mt-6 pt-6 border-t border-white/20">
          <Button 
            className="bg-white text-primary-600 hover:bg-gray-50"
            onClick={() => window.location.href = '/contact'}
          >
            Questions About These Terms?
          </Button>
        </div>
      </div>
    </>
  )
}


function SupplierTermsBody() {
  return (
    <>
      {/* Quick Navigation specific to suppliers */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Navigation</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="#listing" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="font-medium">Listing & Quality</span>
          </a>
          <a href="#availability" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span className="font-medium">Availability & Calendar Sync</span>
          </a>
          <a href="#payments" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <span className="font-medium">Commission & Payments</span>
          </a>
        </div>
      </div>

      {/* Supplier sections */}
      <div id="listing" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">Listing & Quality</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Accurate descriptions, pricing, photos; comply with laws & safeguarding.</li>
          <li>Minimum public liability insurance: <strong>£5,000,000</strong> per claim (proof on request).</li>
          <li>PartySnap may moderate content and suspend for quality/safety issues.</li>
        </ul>
      </div>

      <div id="availability" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">Availability & Calendar Synchronization</h2>
        <div className="space-y-6 text-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Confirmation for Venues</h3>
            <p className="mb-3">If a date and time is shown as available on PartySnap, a booking becomes <strong>instantly confirmed and binding</strong> when the parent pays the deposit. You must keep unavailability blocked. Repeated failures to honour bookings may result in suspension or removal.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Calendar Integration</h3>
            <p className="mb-3">To maintain accurate availability, you can connect your Google Calendar or Outlook Calendar to PartySnap. When connected:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>PartySnap will automatically sync your calendar availability in real-time using secure webhook notifications</li>
              <li>Events in your connected calendar will automatically block corresponding times on PartySnap</li>
              <li><strong>PartySnap bookings will be automatically added to your connected calendar</strong> to prevent external double bookings</li>
              <li>You grant PartySnap permission to read your calendar events, receive notifications when events are created, updated, or deleted, <strong>and create calendar events for confirmed PartySnap bookings</strong></li>
              <li>Calendar data is used solely to maintain accurate availability, prevent double bookings, and keep your schedule synchronized</li>
              <li>You can disconnect your calendar at any time, but must then manually manage your availability</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Two-Way Calendar Synchronization</h3>
            <p className="mb-3">When calendar integration is enabled:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>From your calendar to PartySnap:</strong> Busy times in your Google or Outlook calendar automatically block availability on PartySnap</li>
              <li><strong>From PartySnap to your calendar:</strong> Confirmed bookings are automatically added as events in your connected calendar with party details, customer information, and relevant notes</li>
              <li>This two-way sync ensures your calendar always reflects your complete schedule across all platforms</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Availability Requirements</h3>
            <p className="mb-3">All suppliers must keep availability accurate through either:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Manual updates to your PartySnap calendar, or</li>
              <li>Calendar synchronization with Google Calendar or Outlook Calendar</li>
            </ul>
            <p className="mt-3">PartySnap may display an "Availability Unverified" badge or pause instant booking if your calendar is not confirmed as accurate or synced within 14 days of account creation or last verification.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
    <Calendar className="w-5 h-5" />
    Calendar Integration Privacy
  </h4>
  <p className="text-sm text-blue-800 mb-2">
    When you connect your calendar, PartySnap reads only your calendar’s free/busy information and creates
    new events for your confirmed PartySnap bookings. We do not read event titles, descriptions, attendees,
    or other private details from your existing calendar events.
  </p>
  <p className="text-sm text-blue-800 mb-2">
    You can disconnect your calendar anytime in your PartySnap settings, or revoke access directly from your
    Google Account at <a href="https://myaccount.google.com/permissions" target="_blank" className="underline">myaccount.google.com/permissions</a>.
  </p>
  <p className="text-xs text-blue-700 italic">
    Google permission used: <code>https://www.googleapis.com/auth/calendar.events</code> (read/write events only).
  </p>
</div>

        </div>
      </div>

      <div id="payments" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">Commission, Payments & Cancellations</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Commission: <strong>10%</strong> on total booking value. A £5 booking fee may be charged to parents.</li>
          <li>Deposits are collected at booking; balances collected <strong>14 days</strong> before the event (unless otherwise stated).</li>
          <li>Payouts to suppliers occur <strong>after the event</strong> (or as specified on the platform).</li>
          <li>Supplier cancellations are a <strong>material breach</strong>. PartySnap may refund customers and set-off reasonable remediation costs from sums due.</li>
        </ul>
      </div>

      <div id="liability" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-gray-200 border-b">Liability, Safeguarding & Anti-circumvention</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Entertainers working with children: appropriate checks (e.g., DBS) & safeguarding compliance required.</li>
          <li>Anti-circumvention: no off-platform payment for PartySnap-originated bookings for <strong>12 months</strong> after first contact.</li>
          <li>PartySnap liability is limited to the maximum extent permitted by law; suppliers indemnify PartySnap for their acts/omissions.</li>
        </ul>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-3xl p-8 mb-8">
        <p className="text-primary-800">
          This page is for reference. Suppliers accept the binding <strong>Supplier Terms</strong> in-app when pressing
          <em> "Agree & Go Live"</em>. Customers accept the <strong>Customer Terms</strong> during checkout.
        </p>
      </div>
    </>
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
    // keep URL in sync so it's sharable
    const current = (searchParams.get("role") || "").toLowerCase()
    if (current !== role) {
      const url = new URL(window.location.href)
      url.searchParams.set("role", role)
      router.replace(url.toString())
    }
  }, [role, router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        style={{
          backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
          backgroundRepeat: "repeat",
          backgroundSize: "100px, cover",
          backgroundPosition: "center",
        }}
        className="md:py-20 py-10"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16 max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">Terms of Service</h1>
            <p className="text-lg md:text-xl text-white/95">
              View the terms that apply to you as a Customer/Parent or as a Supplier on PartySnap.
            </p>
            <div className="mt-5 text-sm text-white/90">
              <p>Last updated: 1 October 2025</p>
            </div>

            {/* Role switcher */}
            <div className="mt-8 inline-flex rounded-2xl bg-white/20 p-1 backdrop-blur">
              <button
                className={cn(
                  "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition",
                  role === "customer" ? "bg-white text-primary-700 shadow" : "text-white/90 hover:text-white"
                )}
                onClick={() => setRole("customer")}
              >
                Customer / Parent
              </button>
              <button
                className={cn(
                  "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition",
                  role === "supplier" ? "bg-white text-primary-700 shadow" : "text-white/90 hover:text-white"
                )}
                onClick={() => setRole("supplier")}
              >
                Supplier
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="md:py-20 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {role === "customer" ? <CustomerTermsBody /> : <SupplierTermsBody />}

            {/* Global links (helpful for SEO + navigation) */}
            <div className="text-center mt-10">
              <p className="text-sm text-gray-600">
                Looking for privacy or cookies?{" "}
                <a href="/privacy-policy" className="underline">Privacy Policy</a> ·{" "}
                <a href="/cookies" className="underline">Cookies</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}