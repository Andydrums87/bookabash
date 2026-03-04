"use client"

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-2">Legal</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Cookie Policy</h1>
            <p className="text-sm text-gray-500">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-gray max-w-none">

              {/* What are cookies */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  What are cookies?
                </h2>
                <p className="text-gray-600">
                  Cookies are small text files stored on your device when you visit our website. They help the site work properly, remember your preferences, and help us understand how people use Party Snap.
                </p>
              </section>

              {/* Cookies we use */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Cookies we use
                </h2>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Essential cookies</h3>
                <p className="text-gray-600 mb-6">
                  These are required for the website to function. They keep you logged in, process your booking, and remember your party plan selections. These cannot be disabled.
                </p>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Analytics cookies</h3>
                <p className="text-gray-600 mb-6">
                  These help us understand how visitors use Party Snap — which pages are visited, how long people spend on the site, and where they drop off. We use this data to improve the experience. These can be disabled.
                </p>

                <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Marketing cookies</h3>
                <p className="text-gray-600">
                  These are used to show you relevant Party Snap ads on other platforms like Facebook and Instagram. They help us measure whether our advertising is working. These require your consent and can be disabled at any time.
                </p>
              </section>

              {/* Managing your cookies */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Managing your cookies
                </h2>
                <p className="text-gray-600 mb-4">
                  You can manage your preferences at any time by clicking the cookie settings link in the footer of our website.
                </p>
                <p className="text-gray-600">
                  You can also control cookies through your browser settings. Disabling essential cookies may affect how the site works.
                </p>
              </section>

              {/* Third-party cookies */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Third-party cookies
                </h2>
                <p className="text-gray-600 mb-4">
                  We use the following third-party services that may set cookies:
                </p>
                <ul className="space-y-2 text-gray-600 list-disc list-inside mb-4">
                  <li><strong>Stripe</strong> — for secure payment processing</li>
                  <li><strong>Google Analytics</strong> — for website analytics</li>
                  <li><strong>Meta Pixel</strong> — for advertising measurement</li>
                  <li><strong>Klarna</strong> — for instalment payment processing</li>
                </ul>
                <p className="text-gray-600">
                  These services have their own privacy and cookie policies.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Contact
                </h2>
                <p className="text-gray-600">
                  If you have questions about our use of cookies: <a href="mailto:privacy@partysnap.co.uk" className="text-primary-600 hover:underline">privacy@partysnap.co.uk</a>
                </p>
              </section>

            </div>

            {/* Footer links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Related policies:{" "}
                <a href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</a>
                {" · "}
                <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
