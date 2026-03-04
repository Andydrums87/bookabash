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
            <p className="text-gray-600 mb-4">
              We're committed to protecting your personal data and being transparent about how we use it.
            </p>
            <p className="text-sm text-gray-500">Last updated: 1 October 2025</p>
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
                <p className="text-gray-600 mb-3">When you create an account, we collect:</p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li><strong>Personal Details:</strong> Name, email address, phone number</li>
                  <li><strong>Business Information:</strong> Company name, address, service type (for suppliers)</li>
                  <li><strong>Profile Content:</strong> Photos, service descriptions, pricing</li>
                  <li><strong>Verification Data:</strong> Insurance certificates, background checks (for suppliers)</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Booking & Transaction Data</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Party details and preferences</li>
                  <li>Contact information for coordination</li>
                  <li>Payment and booking history</li>
                  <li>Reviews and feedback</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Technical Information</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                  <li><strong>Usage Analytics:</strong> Pages visited, time spent, feature usage</li>
                  <li><strong>Location Data:</strong> Approximate location for local supplier matching</li>
                  <li><strong>Cookies:</strong> For functionality and analytics</li>
                </ul>
              </section>

              {/* Calendar Integration */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  2. Calendar Integration (Suppliers)
                </h2>

                <p className="text-gray-600 mb-4">
                  If you connect your Google Calendar or Outlook Calendar to PartySnap, we access:
                </p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Event times (start and end times)</li>
                  <li>Busy/free status</li>
                  <li>Calendar metadata for synchronization</li>
                  <li>Webhook notifications when events change</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">What we write to your calendar</h3>
                <p className="text-gray-600 mb-3">When you receive a confirmed booking, we create a calendar event with:</p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Event date, time, and duration</li>
                  <li>Party type and service details</li>
                  <li>Customer name and contact information</li>
                  <li>Event location and booking reference</li>
                </ul>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>What we don't access:</strong> We never read event titles, descriptions, attendees, locations, or any other private details from your existing calendar events. We only know when you're busy, not what you're doing.
                  </p>
                </div>

                <p className="text-gray-600">
                  You can disconnect your calendar anytime in your account settings. When disconnected, we immediately stop receiving data and delete synced availability within 30 days.
                </p>
              </section>

              {/* How We Use Data */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  3. How We Use Your Information
                </h2>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Platform Services</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Create and maintain your profile</li>
                  <li>Match customers with appropriate suppliers</li>
                  <li>Process bookings and coordinate communications</li>
                  <li>Handle payments securely</li>
                  <li>Provide customer support</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Communications</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Booking confirmations and updates</li>
                  <li>Payment receipts and reminders</li>
                  <li>Account security notifications</li>
                  <li>Marketing communications (with your consent)</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Platform Improvement</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li>Identify and fix technical issues</li>
                  <li>Develop new features</li>
                  <li>Optimize search and matching</li>
                  <li>Enhance security</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  4. Information Sharing
                </h2>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">With Customers & Suppliers</h3>
                <p className="text-gray-600 mb-3">We share relevant information to facilitate bookings:</p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Supplier business details, pricing, and availability (with customers)</li>
                  <li>Customer contact information and party details (with suppliers)</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">With Service Providers</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li><strong>Stripe:</strong> Payment processing</li>
                  <li><strong>Google/Microsoft:</strong> Calendar integration</li>
                  <li><strong>Email services:</strong> Booking notifications</li>
                  <li><strong>Analytics:</strong> Anonymized usage data</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Legal Requirements</h3>
                <p className="text-gray-600">
                  We may share information when required by law, to protect our rights, or to ensure safety.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  5. Your Rights (UK GDPR)
                </h2>

                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate information</li>
                  <li><strong>Erasure:</strong> Request deletion of your data</li>
                  <li><strong>Portability:</strong> Export your data in a standard format</li>
                  <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
                  <li><strong>Object:</strong> Object to processing for marketing purposes</li>
                </ul>

                <p className="text-gray-600">
                  Contact <a href="mailto:privacy@partysnap.co.uk" className="text-primary-600 hover:underline">privacy@partysnap.co.uk</a> to exercise any of these rights. We'll respond within 30 days.
                </p>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  6. Data Security & Retention
                </h2>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Security Measures</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>All data encrypted in transit and at rest</li>
                  <li>Limited access to authorized personnel</li>
                  <li>Regular security audits</li>
                  <li>Secure hosting with regular backups</li>
                </ul>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Retention Periods</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li><strong>Account data:</strong> While active, plus 30 days after closure</li>
                  <li><strong>Calendar data:</strong> While connected, plus 30 days after disconnection</li>
                  <li><strong>Transaction history:</strong> 7 years (UK tax requirements)</li>
                  <li><strong>Marketing preferences:</strong> Deleted immediately on unsubscribe</li>
                </ul>
              </section>

              {/* Cookies */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  7. Cookies
                </h2>

                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-4">
                  <li><strong>Essential:</strong> Required for basic functionality (cannot be disabled)</li>
                  <li><strong>Analytics:</strong> Help us understand usage patterns (can be disabled)</li>
                  <li><strong>Marketing:</strong> Used for targeted advertising (requires consent)</li>
                </ul>

                <p className="text-gray-600">
                  You can control cookie settings through your browser or our cookie banner.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  8. Contact & Updates
                </h2>

                <p className="text-gray-600 mb-4">For privacy questions, contact:</p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-6">
                  <li>Email: <a href="mailto:privacy@partysnap.co.uk" className="text-primary-600 hover:underline">privacy@partysnap.co.uk</a></li>
                  <li>Data Controller: PartySnap Ltd</li>
                </ul>

                <p className="text-gray-600">
                  We may update this policy periodically. Major changes will be communicated via email. You can also lodge a complaint with the Information Commissioner's Office (ICO) if needed.
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
