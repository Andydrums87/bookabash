"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"

export function BasicTermsModal({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col bg-white">
        <DialogHeader className="flex-shrink-0 p-4 pb-3 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FileText className="w-4 h-4 text-gray-600" />
            Terms of Service
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Basic platform terms for account creation. Full supplier terms apply when you go live.
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 overflow-y-auto">
          <div className="py-4 space-y-4">
            <div className="border-l-2 border-gray-300 pl-3 py-2">
              <p className="text-sm text-gray-700 leading-relaxed">
                These basic terms cover account setup and platform use. Supplier-specific terms will be presented when
                you're ready to start receiving bookings.
              </p>
            </div>

            <div className="space-y-4">
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">1. Account Registration</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• You must be at least 18 years old</li>
                  <li>• Provide accurate information during registration</li>
                  <li>• One account per person or business</li>
                  <li>• Keep your login credentials secure</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">2. Platform Use</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Use the platform for legitimate business purposes only</li>
                  <li>• Do not engage in fraudulent or misleading activities</li>
                  <li>• Respect other users and maintain professional communication</li>
                  <li>• Follow all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">3. Account Management</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• You're responsible for all activity on your account</li>
                  <li>• Notify us immediately of any security concerns</li>
                  <li>• Keep your profile information up to date</li>
                  <li>• You may close your account at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">4. Content Guidelines</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Upload only content you own or have permission to use</li>
                  <li>• No inappropriate, offensive, or illegal content</li>
                  <li>• Business information must be accurate and truthful</li>
                  <li>• We may remove content that violates these guidelines</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">5. Privacy & Data</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• We collect and use your data as described in our Privacy Policy</li>
                  <li>• Your business information may be visible to potential customers</li>
                  <li>• We use industry-standard security measures</li>
                  <li>• You can request data deletion when closing your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">6. Prohibited Activities</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Spam, harassment, or abusive behavior</li>
                  <li>• Attempting to bypass platform security</li>
                  <li>• Creating fake accounts or reviews</li>
                  <li>• Misrepresenting your business or services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">7. Platform Rights</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• We may suspend accounts that violate these terms</li>
                  <li>• We can update these terms with reasonable notice</li>
                  <li>• We reserve the right to moderate content</li>
                  <li>• Platform availability may vary due to maintenance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">8. Liability</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Use the platform at your own risk</li>
                  <li>• We're not responsible for interactions between users</li>
                  <li>• Our liability is limited to the maximum extent allowed by law</li>
                  <li>• You indemnify us against claims related to your account use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">9. Supplier Services</h2>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Creating a supplier profile doesn't guarantee bookings</li>
                  <li>• Detailed supplier terms apply when you choose to go live</li>
                  <li>• Commission and payment terms are covered in supplier agreements</li>
                  <li>• You must meet quality standards before going live</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-2">10. Contact & Support</h2>
                <p className="text-sm text-gray-700 mb-2">For questions about these terms:</p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Email: support@partysnap.co.uk</li>
                  <li>• Help Center: Available in your dashboard</li>
                </ul>
              </section>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Complete your profile at your own pace</li>
                <li>• Upload photos and set your pricing</li>
                <li>• Review full supplier terms when you're ready to go live</li>
                <li>• Start receiving bookings once your profile is approved</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">Last updated: January 2025</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-4 pt-3 border-t border-gray-200">
          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 text-sm"
          >
            Close Terms and Conditions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
