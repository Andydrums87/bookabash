"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Shield, Users, CreditCard, AlertTriangle, Scale, Phone } from "lucide-react"

export function TermsModal({ children, companyName, serviceType }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-white dark:bg-gray-900">
        <DialogHeader className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-850">
          <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            Supplier Terms & Conditions
          </DialogTitle>
          {companyName && companyName !== "" && (
            <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Business:</span>
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                    {companyName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Service Type:</span>
                  <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md font-medium">
                    {serviceType}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)] px-8 py-6">
          <div className="max-w-none space-y-8">
            {/* Important Notice */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Important Notice</h3>
                  <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                    Please read these terms carefully before accepting. They govern your relationship with PartySnap as
                    a service supplier and create legally binding obligations.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. About These Terms</h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  These terms govern your use of PartySnap as a service supplier. By registering as a supplier, you
                  agree to these terms and conditions.
                  {companyName && companyName !== "" && serviceType && (
                    <>
                      {" "}
                      As <strong className="text-gray-900 dark:text-white">{companyName}</strong>, providing{" "}
                      <strong className="text-gray-900 dark:text-white">{serviceType.toLowerCase()}</strong> services,
                      you will be bound by these terms upon acceptance.
                    </>
                  )}
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">PartySnap</strong> is operated by [YOUR COMPANY
                  NAME], a company registered in England and Wales.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Supplier Requirements</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">2.1 Eligibility</h3>
                  <div className="grid gap-3">
                    {[
                      "You must be at least 18 years old",
                      "You must have the right to work in the UK",
                      "You must provide accurate business information",
                      "You must have appropriate insurance for your services",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">2.2 Business Standards</h3>
                  <div className="grid gap-3">
                    {[
                      "Maintain professional service standards",
                      "Respond to customer inquiries within 24 hours",
                      "Honor confirmed bookings unless extraordinary circumstances arise",
                      "Provide services as described in your profile",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Platform Use</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">3.1 Your Responsibilities</h3>
                  <div className="grid gap-3">
                    {[
                      "Keep your profile information accurate and up-to-date",
                      "Upload only images you own or have permission to use",
                      "Set fair and competitive pricing",
                      "Maintain appropriate availability calendars",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">3.2 Prohibited Activities</h3>
                  <div className="grid gap-3">
                    {[
                      "Fraudulent or misleading information",
                      "Attempting to bypass platform payments",
                      "Harassment or inappropriate communication",
                      "Violation of applicable laws or regulations",
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-red-700 dark:text-red-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Bookings & Payments</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">4.1 Booking Process</h3>
                  <div className="grid gap-3">
                    {[
                      "Customers can request quotes or book directly through the platform",
                      "You may accept or decline booking requests",
                      "Confirmed bookings create binding obligations",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">4.2 Payment Terms</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-emerald-900/30 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">Platform Commission</span>
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">8%</span>
                      </div>
                      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <p>• Payments processed within 3 business days after service completion</p>
                        <p>• Customers pay deposits; remainder due as agreed</p>
                        <p>• Cancellation policies apply as set in your profile</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Remaining sections with similar styling... */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Insurance & Liability</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">5.1 Your Insurance</h3>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                      <p>
                        • You must maintain appropriate public liability insurance{" "}
                        <strong className="text-gray-900 dark:text-white">(minimum £1,000,000)</strong>
                      </p>
                      <p>• Professional indemnity insurance recommended</p>
                      <p>• Provide proof of insurance when requested</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">5.2 Platform Liability</h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• PartySnap acts as a marketplace connecting suppliers and customers</p>
                    <p>• We are not liable for service quality, safety, or disputes</p>
                    <p>• You indemnify us against claims related to your services</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Continue with remaining sections... */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Commission & Fees</h2>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p>
                    • Commission rate:{" "}
                    <strong className="text-indigo-600 dark:text-indigo-400">8% of total booking value</strong>
                  </p>
                  <p>• Commission calculated on full service price including add-ons</p>
                  <p>• No commission on customer-paid expenses (with prior approval)</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Account Management</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">7.1 Profile Standards</h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• Profiles must be complete and professional</p>
                    <p>• We may review and approve profiles before going live</p>
                    <p>• Maintain accuracy of business information</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">7.2 Account Suspension</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">We may suspend accounts for:</p>
                  <div className="grid gap-3">
                    {[
                      "Violation of these terms",
                      "Customer complaints about service quality",
                      "Fraudulent activity",
                      "Non-response to customer inquiries",
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-red-700 dark:text-red-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Termination</h2>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You may close your account at any time. Outstanding bookings must be honored or properly cancelled. We
                  may terminate accounts for repeated violations, fraudulent activity, or consistently poor customer
                  feedback.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Scale className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">9. Dispute Resolution</h2>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  UK courts have exclusive jurisdiction. English law governs these terms. Disputes are subject to
                  mandatory mediation before court proceedings.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">10. Contact Information</h2>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">For questions about these terms:</p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>
                    • <strong>Email:</strong> suppliers@partysnap.co.uk
                  </p>
                  <p>
                    • <strong>Address:</strong> [YOUR BUSINESS ADDRESS]
                  </p>
                  <p>
                    • <strong>Phone:</strong> [YOUR PHONE NUMBER]
                  </p>
                </div>
              </div>
            </section>

            {/* Final confirmation box */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-l-4 border-primary rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                By accepting these terms, you confirm:
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                <p>• You have read and understood all provisions</p>
                <p>• You agree to be legally bound by these terms</p>
                <p>• You will comply with all applicable laws and regulations</p>
              </div>
              <p className="text-xs text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 px-8 py-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-850">
          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg shadow-sm transition-all duration-200"
          >
            Close Terms & Conditions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
