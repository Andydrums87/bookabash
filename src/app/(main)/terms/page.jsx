"use client"

import { FileText, Shield, Users, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="md:py-20 py-10 bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-white">
              These terms govern your use of PartySnap's platform and services. By using our service, you agree to these terms.
            </p>
            <div className="mt-8 text-sm text-white">
              <p>Last updated: January 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="md:py-20 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
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
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Account Registration</h3>
                  <div className="prose prose-gray max-w-none">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>You must be at least 18 years old to create an account</li>
                      <li>Provide accurate and complete information during registration</li>
                      <li>Maintain one account per person or business entity</li>
                      <li>Keep your login credentials secure and confidential</li>
                      <li>Notify us immediately of any unauthorized account access</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Platform Use Guidelines</h3>
                  <div className="prose prose-gray max-w-none">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Use the platform for legitimate business purposes only</li>
                      <li>Do not engage in fraudulent, misleading, or deceptive activities</li>
                      <li>Respect other users and maintain professional communication</li>
                      <li>Follow all applicable laws and regulations in your jurisdiction</li>
                      <li>Do not attempt to circumvent platform security measures</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Content Guidelines</h3>
                  <div className="prose prose-gray max-w-none">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Upload only content you own or have permission to use</li>
                      <li>No inappropriate, offensive, or illegal content permitted</li>
                      <li>Business information must be accurate and truthful</li>
                      <li>We reserve the right to remove content that violates guidelines</li>
                      <li>Respect intellectual property rights of others</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Prohibited Activities</h3>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="prose prose-gray max-w-none">
                      <ul className="list-disc list-inside space-y-2 text-red-800">
                        <li>Spam, harassment, or abusive behavior toward users</li>
                        <li>Creating fake accounts, reviews, or misleading information</li>
                        <li>Attempting to bypass platform fees or payment systems</li>
                        <li>Misrepresenting your business, services, or qualifications</li>
                        <li>Using the platform for any illegal activities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Terms Section */}
            <div id="booking" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                Booking & Payment Terms
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Booking Process</h3>
                  <div className="prose prose-gray max-w-none">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Bookings are confirmed once payment is successfully processed</li>
                      <li>You'll receive email confirmation with all booking details</li>
                      <li>Suppliers are notified immediately and will contact you directly</li>
                      <li>All bookings are subject to supplier availability and acceptance</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Payment Terms</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4">
                    <p className="text-blue-800 font-medium">PartySnap is free to use - you only pay suppliers directly for their services.</p>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li><strong>Service Deposits:</strong> Typically 30% deposit required, remainder due on party day</li>
                      <li><strong>Product Payments:</strong> Items like cakes and party bags require full payment upfront</li>
                      <li><strong>Payment Processing:</strong> Secure processing via Stripe with immediate confirmation</li>
                      <li><strong>Payment Methods:</strong> All major credit/debit cards and bank transfers accepted</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Cancellation Policy</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Customer Cancellations</h4>
                      <div className="space-y-2">
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="font-medium text-green-800">More than 48 hours:</p>
                          <p className="text-green-700 text-sm">Full refund minus 5% processing fee</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          <p className="font-medium text-yellow-800">24-48 hours:</p>
                          <p className="text-yellow-700 text-sm">50% refund for deposits, no refund for full payments</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                          <p className="font-medium text-red-800">Less than 24 hours:</p>
                          <p className="text-red-700 text-sm">No refund available</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Supplier Cancellations</h4>
                      <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                        <ul className="list-disc list-inside space-y-1 text-primary-800 text-sm">
                          <li>Full refund if supplier cancels for any reason</li>
                          <li>We'll help find replacement suppliers when possible</li>
                          <li>Additional compensation for late cancellations</li>
                          <li>Emergency support during party hours</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liability & Safety Section */}
            <div id="liability" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-gray-200 border-b">
                Liability & Safety
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Safety & Child Protection</h3>
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg mb-4">
                    <p className="text-orange-800 font-medium">Parents/guardians are responsible for child supervision at all times during events.</p>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>All suppliers undergo background checks where required by law</li>
                      <li>Inform suppliers of any medical conditions, allergies, or special requirements</li>
                      <li>Ensure safe, suitable venue access for all suppliers and equipment</li>
                      <li>Report any safety concerns to us immediately</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Liability & Insurance</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Supplier Insurance</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>All suppliers carry public liability insurance</li>
                        <li>Insurance coverage details available on request</li>
                        <li>Suppliers responsible for their equipment and actions</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Platform Liability</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>PartySnap connects customers with independent suppliers</li>
                        <li>We are not liable for supplier performance or safety incidents</li>
                        <li>Our liability is limited to refund of payments made through our platform</li>
                        <li>Use of the platform is at your own risk</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Dispute Resolution</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 mb-4">
                      We're committed to resolving issues quickly and fairly:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Report service issues within 48 hours of your event</li>
                      <li>We'll mediate between customers and suppliers</li>
                      <li>Partial refunds may be offered for legitimate service issues</li>
                      <li>Contact us before initiating bank chargebacks</li>
                      <li>UK law governs all disputes and transactions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Terms */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                Additional Terms
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Data Protection</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 mb-4">
                      Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</a> for detailed information about how we collect, use, and protect your data.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Booking details shared with selected suppliers only</li>
                      <li>Contact information used for booking coordination</li>
                      <li>You can request data deletion after your events</li>
                      <li>We comply with UK GDPR and data protection laws</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">12. Platform Rights & Updates</h3>
                  <div className="prose prose-gray max-w-none">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>We may update these terms with reasonable notice to users</li>
                      <li>Platform availability may vary due to maintenance or technical issues</li>
                      <li>We reserve the right to suspend accounts that violate these terms</li>
                      <li>Continued use after updates constitutes acceptance of new terms</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Information</h3>
                  <div className="bg-primary-50 border-l-4 border-primary-400 p-4 rounded-lg">
                    <p className="text-primary-800 mb-2 font-medium">
                      For questions about these terms or our services:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-primary-700">
                      <li>Email: legal@partysnap.com</li>
                      <li>Support: support@partysnap.com</li>
                      <li>Phone: [YOUR PHONE NUMBER]</li>
                      <li>Address: [YOUR BUSINESS ADDRESS]</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Rights Summary */}
            <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Your Rights & Guarantees</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Platform Guarantees</h4>
                  <ul className="space-y-2 opacity-90">
                    <li>• Professional service guarantee</li>
                    <li>• Full refund if suppliers cancel</li>
                    <li>• 48-hour booking protection</li>
                    <li>• Customer support throughout your journey</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Consumer Rights</h4>
                  <ul className="space-y-2 opacity-90">
                    <li>• Protected under UK consumer law</li>
                    <li>• Right to fair dispute resolution</li>
                    <li>• Clear cancellation policies</li>
                    <li>• Transparent pricing with no hidden fees</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <Button 
                  className="bg-white text-primary-600 hover:bg-gray-50"
                  onClick={() => window.location.href = '/contact'}
                >
                  Questions About These Terms?
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}