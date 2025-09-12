"use client"

import { Shield, Eye, Lock, Users, Database, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="md:py-20 py-8 bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-white">
              We're committed to protecting your personal data and being transparent about how we use it. This policy explains everything you need to know.
            </p>
            <div className="mt-8 text-sm text-gray-500">
              <p>Last updated: January 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Summary */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-3xl p-8 text-white mb-12">
              <h2 className="text-2xl font-bold mb-6">Privacy at a Glance</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">What We Collect</h3>
                  <ul className="space-y-1 opacity-90 text-sm">
                    <li>• Business info to create your profile</li>
                    <li>• Contact details for bookings</li>
                    <li>• Usage data to improve our service</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Your Rights</h3>
                  <ul className="space-y-1 opacity-90 text-sm">
                    <li>• Access, correct, or delete your data</li>
                    <li>• Control marketing preferences</li>
                    <li>• Data portability and transparency</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Quick Navigation */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Navigation</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="#collection" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Database className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Data Collection</span>
                </a>
                <a href="#usage" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Eye className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">How We Use Data</span>
                </a>
                <a href="#sharing" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Data Sharing</span>
                </a>
                <a href="#rights" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Your Rights</span>
                </a>
                <a href="#security" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Lock className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Data Security</span>
                </a>
                <a href="#cookies" className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Cookies</span>
                </a>
              </div>
            </div>

            {/* Data Collection */}
            <div id="collection" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                Information We Collect
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
                  <p className="text-gray-700 mb-4">When you create an account, we collect:</p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                    <ul className="list-disc list-inside space-y-2 text-blue-800">
                      <li><strong>Personal Details:</strong> Name, email address, phone number</li>
                      <li><strong>Business Information:</strong> Company name, address, service type</li>
                      <li><strong>Profile Content:</strong> Photos, service descriptions, pricing</li>
                      <li><strong>Verification Data:</strong> Insurance certificates, background checks</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking & Transaction Data</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">For Customers</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Party details and preferences</li>
                        <li>Contact information for coordination</li>
                        <li>Payment and booking history</li>
                        <li>Reviews and feedback</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">For Suppliers</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Service availability and calendar</li>
                        <li>Customer interactions and bookings</li>
                        <li>Payment processing information</li>
                        <li>Performance metrics and ratings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Information</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 mb-4">We automatically collect certain technical data:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                      <li><strong>Usage Analytics:</strong> Pages visited, time spent, feature usage</li>
                      <li><strong>Location Data:</strong> Approximate location for local supplier matching</li>
                      <li><strong>Cookies & Trackers:</strong> For functionality and analytics (see Cookies section)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* How We Use Data */}
            <div id="usage" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                How We Use Your Information
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Services</h3>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                    <ul className="list-disc list-inside space-y-2 text-green-800">
                      <li>Create and maintain your supplier profile</li>
                      <li>Match customers with appropriate suppliers</li>
                      <li>Process bookings and coordinate communications</li>
                      <li>Handle payments securely through our payment partners</li>
                      <li>Provide customer support and resolve disputes</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Communication</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Essential Communications</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Booking confirmations and updates</li>
                        <li>Payment receipts and reminders</li>
                        <li>Account security notifications</li>
                        <li>Platform announcements and policy changes</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Marketing Communications</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Tips and best practices (with consent)</li>
                        <li>New feature announcements</li>
                        <li>Promotional offers and campaigns</li>
                        <li>Industry insights and trends</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">You can opt out anytime</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Improvement</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 mb-4">We analyze usage patterns to:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Identify and fix technical issues</li>
                      <li>Develop new features based on user needs</li>
                      <li>Optimize search and matching algorithms</li>
                      <li>Enhance security and prevent fraud</li>
                      <li>Improve overall user experience</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div id="sharing" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                Information Sharing
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">With Customers & Suppliers</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-4">
                    <p className="text-yellow-800 font-medium">
                      We facilitate connections by sharing relevant information between customers and suppliers.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Shared with Customers</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Supplier business name and contact details</li>
                        <li>Service descriptions and portfolio photos</li>
                        <li>Pricing, availability, and location</li>
                        <li>Reviews and ratings from other customers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Shared with Suppliers</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Customer name and contact information</li>
                        <li>Party details and requirements</li>
                        <li>Event location and timing</li>
                        <li>Special requests or preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">With Service Providers</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Payment Processing</h4>
                      <p className="text-gray-700 text-sm">
                        <strong>Stripe:</strong> Securely processes all payments. They receive transaction details but not your full payment information, which is tokenized for security.
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Email & SMS Services</h4>
                      <p className="text-gray-700 text-sm">
                        We use third-party services to send booking confirmations, reminders, and notifications. They only receive the specific information needed for delivery.
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Analytics & Performance</h4>
                      <p className="text-gray-700 text-sm">
                        Anonymized usage data helps us understand platform performance. No personally identifiable information is shared with analytics providers.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal & Safety</h3>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <p className="text-red-800 mb-2 font-medium">We may share information when required by law or to protect safety:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                      <li>Legal compliance (court orders, government requests)</li>
                      <li>Protection of our rights and property</li>
                      <li>Safety of users and the public</li>
                      <li>Prevention of fraud or illegal activity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div id="rights" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                Your Rights Under UK GDPR
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Access & Control</h3>
                  <div className="space-y-4">
                    <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                      <h4 className="font-semibold text-primary-800 mb-2">Right to Access</h4>
                      <p className="text-primary-700 text-sm">Request a copy of all personal data we hold about you, including how we use it.</p>
                    </div>
                    <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                      <h4 className="font-semibold text-primary-800 mb-2">Right to Rectification</h4>
                      <p className="text-primary-700 text-sm">Correct any inaccurate or incomplete personal information.</p>
                    </div>
                    <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                      <h4 className="font-semibold text-primary-800 mb-2">Right to Erasure</h4>
                      <p className="text-primary-700 text-sm">Request deletion of your personal data when no longer needed.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Portability & Control</h3>
                  <div className="space-y-4">
                    <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                      <h4 className="font-semibold text-primary-800 mb-2">Right to Portability</h4>
                      <p className="text-primary-700 text-sm">Export your data in a standard, machine-readable format.</p>
                    </div>
                    <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                      <h4 className="font-semibold text-primary-800 mb-2">Right to Restrict Processing</h4>
                      <p className="text-primary-700 text-sm">Limit how we process your data in certain circumstances.</p>
                    </div>
                    <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                      <h4 className="font-semibold text-primary-800 mb-2">Right to Object</h4>
                      <p className="text-primary-700 text-sm">Object to processing for marketing or other specific purposes.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">How to Exercise Your Rights</h4>
                <p className="text-gray-700 text-sm mb-4">
                  Contact our privacy team at <a href="mailto:privacy@partysnap.com" className="text-primary-600 hover:text-primary-700 font-medium">privacy@partysnap.com</a> to exercise any of these rights. We'll respond within 30 days.
                </p>
                <p className="text-xs text-gray-500">
                  You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) if you're not satisfied with our response.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div id="security" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                Data Security & Retention
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Measures</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-xl">
                      <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-blue-800 mb-2">Encryption</h4>
                      <p className="text-blue-700 text-sm">All data encrypted in transit and at rest using industry standards</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-xl">
                      <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-green-800 mb-2">Access Control</h4>
                      <p className="text-green-700 text-sm">Limited access to authorized personnel with regular audits</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-xl">
                      <Database className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-purple-800 mb-2">Secure Hosting</h4>
                      <p className="text-purple-700 text-sm">Data hosted on secure servers with regular backups</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Retention Periods</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Account Data</h4>
                      <p className="text-gray-700 text-sm">Retained while your account is active, plus 30 days after closure for account recovery.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Booking & Transaction History</h4>
                      <p className="text-gray-700 text-sm">Kept for 7 years to comply with UK tax and accounting requirements.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Marketing Communications</h4>
                      <p className="text-gray-700 text-sm">Deleted immediately when you unsubscribe from marketing emails.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Analytics Data</h4>
                      <p className="text-gray-700 text-sm">Anonymized data retained for 2 years for platform improvement purposes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div id="cookies" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                Cookies & Tracking
              </h2>
              
              <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold text-green-800 mb-2">Essential Cookies</h4>
                    <p className="text-green-700 text-sm mb-3">Required for basic platform functionality</p>
                    <ul className="list-disc list-inside space-y-1 text-green-700 text-xs">
                      <li>Login authentication</li>
                      <li>Shopping cart functionality</li>
                      <li>Security features</li>
                    </ul>
                    <p className="text-xs text-green-600 mt-2 font-medium">Cannot be disabled</p>
                  </div>
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2">Analytics Cookies</h4>
                    <p className="text-blue-700 text-sm mb-3">Help us understand usage patterns</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                      <li>Page views and navigation</li>
                      <li>Feature usage statistics</li>
                      <li>Performance monitoring</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2 font-medium">Can be disabled in settings</p>
                  </div>
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <h4 className="font-semibold text-purple-800 mb-2">Marketing Cookies</h4>
                    <p className="text-purple-700 text-sm mb-3">Used for targeted advertising</p>
                    <ul className="list-disc list-inside space-y-1 text-purple-700 text-xs">
                      <li>Ad personalization</li>
                      <li>Campaign effectiveness</li>
                      <li>Social media integration</li>
                    </ul>
                    <p className="text-xs text-purple-600 mt-2 font-medium">Requires explicit consent</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Managing Cookie Preferences</h4>
                  <p className="text-yellow-700 text-sm mb-3">
                    You can control cookie settings through your browser preferences or our cookie banner when you first visit the site.
                  </p>
                  <p className="text-xs text-yellow-600">
                    Note: Disabling certain cookies may limit platform functionality.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Updates */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                Contact & Policy Updates
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Questions?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Privacy Team</p>
                        <p className="text-sm text-gray-600">privacy@partysnap.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Data Controller</p>
                        <p className="text-sm text-gray-600">PartySnap Ltd</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Business Address</p>
                        <p className="text-sm text-gray-600">[YOUR BUSINESS ADDRESS]</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Policy Updates</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm mb-3">
                      We may update this privacy policy periodically to reflect changes in our practices or legal requirements.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>Major changes communicated via email</li>
                      <li>Platform notifications for significant updates</li>
                      <li>Always posted with revision date</li>
                      <li>Previous versions available on request</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-3xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h3>
              <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                We're committed to transparency and protecting your personal information. Contact us anytime with privacy questions or concerns.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Button 
                  className="bg-white text-primary-600 hover:bg-gray-50 font-bold"
                  onClick={() => window.location.href = 'mailto:privacy@partysnap.com'}
                >
                  Contact Privacy Team
                </Button>
                <Button 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600 font-bold"
                  onClick={() => window.location.href = '/contact'}
                >
                  General Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}