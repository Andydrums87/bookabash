'use client'

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"

export default function SupplierTermsPage() {
  const searchParams = useSearchParams()
  const step = searchParams.get('step') || ''
  const companyName = searchParams.get('company') || '[Your Business Name]'
  const serviceType = searchParams.get('type') || 'services'
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href={`/suppliers/onboarding${step ? `?step=${step}` : ''}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Registration
            </Link>
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Supplier Terms & Conditions</h1>
                <p className="text-gray-600">Version 1.0 • Effective Date: January 2025</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Please read these terms carefully before accepting. 
                They govern your relationship with PartySnap as a service supplier.
                {companyName && companyName !== '[Your Business Name]' && (
                  <>
                    <br />
                    <strong>Business:</strong> {companyName} • <strong>Service Type:</strong> {serviceType}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8 prose prose-gray max-w-none">
          
          <h2>1. About These Terms</h2>
          <p>
            These terms govern your use of PartySnap as a service supplier. By registering as a supplier, 
            you agree to these terms and conditions.
            {companyName && companyName !== '[Your Business Name]' && serviceType && (
              <>
                {" "}As <strong>{companyName}</strong>, providing <strong>{serviceType.toLowerCase()}</strong> services, 
                you will be bound by these terms upon acceptance.
              </>
            )}
          </p>
          <p>
            <strong>PartySnap</strong> is operated by [YOUR COMPANY NAME], a company registered in England and Wales.
          </p>

          <h2>2. Supplier Requirements</h2>
          
          <h3>2.1 Eligibility</h3>
          <ul>
            <li>You must be at least 18 years old</li>
            <li>You must have the right to work in the UK</li>
            <li>You must provide accurate business information</li>
            <li>You must have appropriate insurance for your services</li>
          </ul>

          <h3>2.2 Business Standards</h3>
          <ul>
            <li>Maintain professional service standards</li>
            <li>Respond to customer inquiries within 24 hours</li>
            <li>Honor confirmed bookings unless extraordinary circumstances arise</li>
            <li>Provide services as described in your profile</li>
          </ul>

          <h2>3. Platform Use</h2>

          <h3>3.1 Your Responsibilities</h3>
          <ul>
            <li>Keep your profile information accurate and up-to-date</li>
            <li>Upload only images you own or have permission to use</li>
            <li>Set fair and competitive pricing</li>
            <li>Maintain appropriate availability calendars</li>
          </ul>

          <h3>3.2 Prohibited Activities</h3>
          <ul>
            <li>Fraudulent or misleading information</li>
            <li>Attempting to bypass platform payments</li>
            <li>Harassment or inappropriate communication</li>
            <li>Violation of applicable laws or regulations</li>
          </ul>

          <h2>4. Bookings & Payments</h2>

          <h3>4.1 Booking Process</h3>
          <ul>
            <li>Customers can request quotes or book directly through the platform</li>
            <li>You may accept or decline booking requests</li>
            <li>Confirmed bookings create binding obligations</li>
          </ul>

          <h3>4.2 Payment Terms</h3>
          <ul>
            <li>Platform commission: 8% of booking value</li>
            <li>Payments processed within 3 business days after service completion</li>
            <li>Customers pay deposits; remainder due as agreed</li>
            <li>Cancellation policies apply as set in your profile</li>
          </ul>

          <h2>5. Insurance & Liability</h2>

          <h3>5.1 Your Insurance</h3>
          <ul>
            <li>You must maintain appropriate public liability insurance (minimum £1,000,000)</li>
            <li>Professional indemnity insurance recommended</li>
            <li>Provide proof of insurance when requested</li>
          </ul>

          <h3>5.2 Platform Liability</h3>
          <ul>
            <li>PartySnap acts as a marketplace connecting suppliers and customers</li>
            <li>We are not liable for service quality, safety, or disputes</li>
            <li>You indemnify us against claims related to your services</li>
          </ul>

          <h2>6. Commission & Fees</h2>

          <h3>6.1 Platform Commission</h3>
          <ul>
            <li>Commission rate: 8% of total booking value</li>
            <li>Commission calculated on full service price including add-ons</li>
            <li>No commission on customer-paid expenses (with prior approval)</li>
          </ul>

          <h2>7. Account Management</h2>

          <h3>7.1 Profile Standards</h3>
          <ul>
            <li>Profiles must be complete and professional</li>
            <li>We may review and approve profiles before going live</li>
            <li>Maintain accuracy of business information</li>
          </ul>

          <h3>7.2 Account Suspension</h3>
          <p>We may suspend accounts for:</p>
          <ul>
            <li>Violation of these terms</li>
            <li>Customer complaints about service quality</li>
            <li>Fraudulent activity</li>
            <li>Non-response to customer inquiries</li>
          </ul>

          <h2>8. Termination</h2>
          <p>
            You may close your account at any time. Outstanding bookings must be honored 
            or properly cancelled. We may terminate accounts for repeated violations, 
            fraudulent activity, or consistently poor customer feedback.
          </p>

          <h2>9. Dispute Resolution</h2>
          <p>
            UK courts have exclusive jurisdiction. English law governs these terms. 
            Disputes are subject to mandatory mediation before court proceedings.
          </p>

          <h2>10. Contact Information</h2>
          <p>For questions about these terms:</p>
          <ul>
            <li>Email: suppliers@partysnap.co.uk</li>
            <li>Address: [YOUR BUSINESS ADDRESS]</li>
            <li>Phone: [YOUR PHONE NUMBER]</li>
          </ul>

          <div className="bg-gray-100 border-l-4 border-primary-500 p-4 my-8">
            <p className="font-semibold text-gray-800 mb-2">By accepting these terms, you confirm:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• You have read and understood all provisions</li>
              <li>• You agree to be legally bound by these terms</li>
              <li>• You will comply with all applicable laws and regulations</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">Last updated: January 2025</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <Button asChild className="bg-primary-600 hover:bg-primary-700 text-white">
            <Link href={`/suppliers/onboarding${step ? `?step=${step}` : ''}`}>Return to Registration</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}