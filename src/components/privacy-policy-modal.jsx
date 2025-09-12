"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield } from "lucide-react"

export function PrivacyPolicyModal({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Policy
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <div className="max-w-none pb-6 text-sm leading-relaxed">
            <div className="border-l-2 border-gray-300 pl-4 mb-6 bg-gray-50 p-3">
              <p className="text-sm text-gray-700 mb-0 font-medium">
                Your Privacy Matters: We're committed to protecting your personal data and being transparent about how
                we use it.
              </p>
            </div>

            <div className="space-y-4">
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  1. Information We Collect
                </h2>

                <div className="ml-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">1.1 Account Information</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>• Business name and contact details</li>
                      <li>• Your name and email address</li>
                      <li>• Phone number and business location</li>
                      <li>• Service type and business description</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">1.2 Service Information</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>• Photos and descriptions of your services</li>
                      <li>• Pricing and availability information</li>
                      <li>• Customer reviews and ratings</li>
                      <li>• Booking and payment history</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">1.3 Technical Information</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>• IP address and browser information</li>
                      <li>• Website usage and analytics data</li>
                      <li>• Cookies and similar technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  2. How We Use Your Information
                </h2>

                <div className="ml-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">2.1 Platform Services</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>• Create and maintain your supplier profile</li>
                      <li>• Connect you with potential customers</li>
                      <li>• Process bookings and payments</li>
                      <li>• Provide customer support</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">2.2 Communication</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>• Send booking notifications and updates</li>
                      <li>• Share important platform announcements</li>
                      <li>• Provide customer service support</li>
                      <li>• Send marketing emails (with your consent)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">2.3 Platform Improvement</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>• Analyze usage patterns to improve our service</li>
                      <li>• Develop new features and functionality</li>
                      <li>• Ensure platform security and prevent fraud</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  3. Information Sharing
                </h2>

                <div className="ml-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">3.1 With Customers</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      We share your business information with customers to facilitate bookings:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>• Business name, services, and contact details</li>
                      <li>• Photos and service descriptions</li>
                      <li>• Pricing and availability</li>
                      <li>• Reviews and ratings from other customers</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">3.2 With Service Providers</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>
                        • <span className="font-medium">Payment Processing:</span> Stripe processes payments securely
                      </li>
                      <li>
                        • <span className="font-medium">Email Services:</span> For sending notifications and updates
                      </li>
                      <li>
                        • <span className="font-medium">Analytics:</span> To understand platform usage (anonymized data)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">3.3 Legal Requirements</h3>
                    <p className="text-sm text-gray-600 ml-4">
                      We may share information when required by law or to protect our rights and users.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  4. Data Security
                </h2>
                <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                  <li>• Industry-standard encryption for data transmission</li>
                  <li>• Secure servers and regular security audits</li>
                  <li>• Limited access to personal data by authorized staff only</li>
                  <li>• Regular backups and disaster recovery procedures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  5. Your Rights (UK GDPR)
                </h2>

                <div className="ml-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">5.1 Access and Control</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>
                        • <span className="font-medium">Access:</span> Request a copy of your personal data
                      </li>
                      <li>
                        • <span className="font-medium">Rectification:</span> Correct inaccurate information
                      </li>
                      <li>
                        • <span className="font-medium">Erasure:</span> Request deletion of your data
                      </li>
                      <li>
                        • <span className="font-medium">Portability:</span> Export your data in a standard format
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">5.2 Marketing Preferences</h3>
                    <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                      <li>• Opt out of marketing emails at any time</li>
                      <li>• Manage notification preferences in your dashboard</li>
                      <li>• Control SMS alert settings</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  6. Cookies and Tracking
                </h2>
                <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                  <li>
                    • <span className="font-medium">Essential Cookies:</span> Required for platform functionality
                  </li>
                  <li>
                    • <span className="font-medium">Analytics Cookies:</span> Help us improve the service
                  </li>
                  <li>
                    • <span className="font-medium">Marketing Cookies:</span> Only with your explicit consent
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-2 ml-4">
                  You can manage cookie preferences in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  7. Data Retention
                </h2>
                <ul className="text-sm text-gray-600 space-y-0.5 ml-4">
                  <li>• Account data: Retained while your account is active</li>
                  <li>• Booking history: Kept for 7 years for legal/tax purposes</li>
                  <li>• Marketing data: Deleted when you unsubscribe</li>
                  <li>• Legal compliance data: Retained as required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  8. International Transfers
                </h2>
                <p className="text-sm text-gray-600 ml-4">
                  Your data is primarily processed in the UK. If we transfer data outside the UK, we ensure appropriate
                  safeguards are in place.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  9. Children's Privacy
                </h2>
                <p className="text-sm text-gray-600 ml-4">
                  Our platform is not intended for children under 16. We do not knowingly collect personal data from
                  children.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  10. Changes to This Policy
                </h2>
                <p className="text-sm text-gray-600 ml-4">
                  We may update this privacy policy periodically. Significant changes will be communicated via email or
                  platform notifications.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  11. Contact Us
                </h2>
                <p className="text-sm text-gray-600 mb-1 ml-4">
                  For privacy-related questions or to exercise your rights:
                </p>
                <ul className="text-sm text-gray-600 space-y-0.5 ml-8">
                  <li>• Email: privacy@partysnap.co.uk</li>
                  <li>• Address: [YOUR BUSINESS ADDRESS]</li>
                  <li>• Phone: [YOUR PHONE NUMBER]</li>
                </ul>
              </section>

              <div className="border-l-2 border-gray-300 pl-4 mt-6 bg-gray-50 p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Summary:</h4>
                <ul className="text-xs text-gray-700 space-y-1 mb-2">
                  <li>• We collect business info to run the platform and connect you with customers</li>
                  <li>• Your data is secure and only shared as necessary for bookings</li>
                  <li>• You control your marketing preferences and can access/delete your data</li>
                  <li>• We comply with UK GDPR and data protection laws</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2 mb-0">Last updated: January 2025</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-6 pt-5 border-t border-gray-200">
          <Button onClick={() => setOpen(false)} className="w-full bg-primary-600 hover:bg-primary-700 text-white">
            Close Privacy Policy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
