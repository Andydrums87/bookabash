"use client"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-2">Legal</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-gray max-w-none">

              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  1. Information We Collect
                </h2>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Account Information</h3>
                <p className="text-gray-600 mb-3">
                  When you create an account, we collect your name, email address, and phone number. For service provider accounts, we also collect business name, address, service type, profile content, and verification documents.
                </p>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Booking Information</h3>
                <p className="text-gray-600 mb-3">When you place an order, we collect:</p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Party details (child's name, date, theme, guest count)</li>
                  <li>Your home address for deliveries</li>
                  <li>Venue preferences</li>
                  <li>Any special requirements or allergy information</li>
                  <li>Payment details (processed securely via Stripe — we do not store your card details)</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Technical Information</h3>
                <p className="text-gray-600 mb-3">We automatically collect:</p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage analytics (pages visited, features used)</li>
                  <li>Approximate location for showing relevant venues</li>
                  <li>Cookie data for functionality and analytics</li>
                </ul>
              </section>

              {/* Calendar Integration */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  2. Calendar Integration (Service Providers)
                </h2>

                <p className="text-gray-600 mb-3">
                  If you connect your Google Calendar or Outlook Calendar to Party Snap, we access:
                </p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Event times (start and end times)</li>
                  <li>Busy/free status</li>
                  <li>Calendar metadata for synchronisation</li>
                  <li>Webhook notifications when events change</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">What we write to your calendar</h3>
                <p className="text-gray-600 mb-3">When you receive a confirmed booking, we create a calendar event with:</p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Event date, time, and duration</li>
                  <li>Party type and service details</li>
                  <li>Customer name and contact information</li>
                  <li>Event location</li>
                  <li>Booking reference</li>
                </ul>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>What we don't access:</strong> We never read event titles, descriptions, attendees, locations, or any other private details from your existing calendar events. We only know when you're busy, not what you're doing.
                  </p>
                </div>

                <p className="text-gray-600">
                  You can disconnect your calendar at any time in your account settings. When disconnected, we immediately stop receiving data and delete synced availability within 30 days.
                </p>
              </section>

              {/* How We Use Data */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  3. How We Use Your Information
                </h2>

                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li>To create and manage your account</li>
                  <li>To process and coordinate your party booking</li>
                  <li>To communicate with you about your order, confirmation, and any changes</li>
                  <li>To share necessary details with our service providers to deliver your party</li>
                  <li>To process payments securely</li>
                  <li>To improve our platform and develop new features</li>
                  <li>To send marketing communications (only with your consent)</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  4. Information Sharing
                </h2>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">With our service providers</h3>
                <p className="text-gray-600 mb-6">
                  We share relevant booking details (date, time, venue, theme, special requirements) with the service providers fulfilling your party. We only share what they need to deliver their part of your booking.
                </p>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">With payment processors</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Stripe processes all payments securely</li>
                  <li>Klarna processes instalment payments where selected</li>
                  <li>We do not store your card details</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Legal requirements</h3>
                <p className="text-gray-600 mb-4">
                  We may share information when required by law, to protect our rights, or to ensure safety.
                </p>

                <p className="text-gray-600 font-medium">
                  We never sell your personal data to third parties.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  5. Your Rights (UK GDPR)
                </h2>

                <p className="text-gray-600 mb-3">You have the right to:</p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Access a copy of your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Export your data in a standard format</li>
                  <li>Restrict or object to how we process your data</li>
                  <li>Opt out of marketing communications at any time</li>
                </ul>

                <p className="text-gray-600">
                  Contact <a href="mailto:privacy@partysnap.co.uk" className="text-primary-600 hover:underline">privacy@partysnap.co.uk</a> to exercise any of these rights. We will respond within 30 days.
                </p>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  6. Data Security
                </h2>

                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li>All data is encrypted in transit and at rest</li>
                  <li>Access is limited to authorised personnel</li>
                  <li>Payments are handled securely by Stripe</li>
                  <li>We conduct regular security reviews</li>
                </ul>
              </section>

              {/* Data Retention */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  7. Data Retention
                </h2>

                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li><strong>Account data:</strong> Kept while your account is active, plus 30 days after closure</li>
                  <li><strong>Calendar data:</strong> Kept while connected, plus 30 days after disconnection</li>
                  <li><strong>Booking and transaction history:</strong> Kept for 7 years in line with UK tax requirements</li>
                  <li><strong>Marketing preferences:</strong> Deleted immediately on unsubscribe</li>
                </ul>
              </section>

              {/* Cookies */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  8. Cookies
                </h2>

                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-4">
                  <li><strong>Essential cookies:</strong> Required for basic functionality and cannot be disabled</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how people use the platform and can be disabled</li>
                  <li><strong>Marketing cookies:</strong> Used for advertising and require your consent</li>
                </ul>

                <p className="text-gray-600">
                  You can control cookie settings through your browser or our cookie banner.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  9. Contact
                </h2>

                <p className="text-gray-600 mb-4">
                  For privacy questions: <a href="mailto:privacy@partysnap.co.uk" className="text-primary-600 hover:underline">privacy@partysnap.co.uk</a>
                </p>

                <p className="text-gray-600">
                  We may update this policy from time to time. Significant changes will be communicated by email. You can also lodge a complaint with the Information Commissioner's Office (ICO) if needed.
                </p>
              </section>

            </div>

            {/* Footer links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Related policies:{" "}
                <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>
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
