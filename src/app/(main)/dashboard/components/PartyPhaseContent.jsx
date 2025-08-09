// components/PartyPhaseContent.jsx - Phase-specific content and messaging
"use client"

import { useEffect } from "react"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import SnappysPresentParty from "../DatabaseDashboard/components/SnappysPresentParty"
import WhilstYouWaitSection from "../DatabaseDashboard/components/WhilstYouWait"
import { usePartyDetails } from "../hooks/usePartyDetails"

export default function PartyPhaseContent({
  phase,
  suppliers,
  enquiries,
  partyData,
  paymentDetails,
  onPaymentReady,
  onCreateInvites,
  registry,
  registryItems,
  partyTheme,
  childAge,
  onCreateRegistry,
  onAddItem,
  registryLoading,
  hasCreatedInvites,
  partyDetails
}) {


  
  // Payment confirmed phase
  if (phase === 'payment_confirmed') {
    return (
      <div className="mb-8">
        <PostPaymentSuccessSection
          suppliers={suppliers}
          enquiries={enquiries}
          partyData={partyData}
          paymentDetails={paymentDetails}
        />
           {/* While You Wait Section */}
           <WhilstYouWaitSection 
          registry={registry}
          registryItems={registryItems}
          partyTheme={partyTheme?.name?.toLowerCase()}
          childAge={childAge || 6}
          onCreateRegistry={onCreateRegistry}
          onAddItem={onAddItem}
          registryLoading={registryLoading}
          hasCreatedInvites={hasCreatedInvites}
        partyDetails={partyDetails}
        partyId={partyDetails?.id}
          onCreateInvites={onCreateInvites}
        />
      </div>
    )
  }


  // Awaiting responses phase
  if (phase === 'awaiting_responses') {
    const suppliersWithEnquiries = Object.keys(suppliers).filter(key => 
      suppliers[key] && enquiries.some(e => e.supplier_category === key && e.status === 'pending')
    )

    return (
      <div className="space-y-8">
        {/* Snappy's Present Party */}
        {/* <SnappysPresentParty
          suppliers={suppliers}
          enquiries={enquiries}
          timeRemaining={24} // You might want to calculate this
          onPaymentReady={onPaymentReady}
          showPaymentCTA={false} // Not ready for payment yet
        /> */}

        {/* While You Wait Section */}
        <WhilstYouWaitSection 
          registry={registry}
          registryItems={registryItems}
          partyTheme={partyTheme?.name?.toLowerCase()}
          childAge={childAge || 6}
          onCreateRegistry={onCreateRegistry}
          onAddItem={onAddItem}
          registryLoading={registryLoading}
          hasCreatedInvites={hasCreatedInvites}
        partyDetails={partyDetails}
        partyId={partyDetails?.id}
          onCreateInvites={onCreateInvites}
        />

        {/* What Happens Next */}
        <WhatHappensNextCard suppliersCount={suppliersWithEnquiries.length} />
      </div>
    )
  }

  // Ready for payment phase
  if (phase === 'ready_for_payment') {
    return (
      <div className="mb-8">
        <SnappysPresentParty
          suppliers={suppliers}
          enquiries={enquiries}
          timeRemaining={24}
          onPaymentReady={onPaymentReady}
          showPaymentCTA={true} // Ready for payment!
        />
           {/* While You Wait Section */}
           <WhilstYouWaitSection 
          registry={registry}
          registryItems={registryItems}
          partyTheme={partyTheme?.name?.toLowerCase()}
          childAge={childAge || 6}
          onCreateRegistry={onCreateRegistry}
          onAddItem={onAddItem}
          registryLoading={registryLoading}
          hasCreatedInvites={hasCreatedInvites}
        partyDetails={partyDetails}
        partyId={partyDetails?.id}
          onCreateInvites={onCreateInvites}
        />
      </div>
    )
  }

  // Planning phase (default)
  return (
    <div className="mb-8">
      <PlanningPhaseContent />
    </div>
  )
}

// Planning phase component
function PlanningPhaseContent() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          🎉 Let's Build Your Perfect Party!
        </h3>
        <p className="text-blue-800 mb-4">
          Add suppliers to your party team and we'll help you get everything organized.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Browse Suppliers
          </Button>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            View Party Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// What happens next card
function WhatHappensNextCard({ suppliersCount }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
        <ArrowRight className="w-5 h-5 mr-2" />
        What happens next?
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Suppliers Review</h4>
              <p className="text-sm text-blue-700">They'll check availability and prepare quotes</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">2</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">You Get Notified</h4>
              <p className="text-sm text-blue-700">Real-time updates as each supplier responds</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">3</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Complete Party Team</h4>
              <p className="text-sm text-blue-700">Add more suppliers once these confirm</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">4</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Secure Booking</h4>
              <p className="text-sm text-blue-700">Pay deposit to guarantee your party date</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-100"
            asChild
          >
            <Link href="/party-summary">
              View Party Summary
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            Modify Party Details
          </Button>
        </div>
      </div>
    </div>
  )
}

// Post payment success section
function PostPaymentSuccessSection({ suppliers, enquiries, partyData, paymentDetails }) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-600">
            Your party deposit has been paid and your suppliers are ready to go
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your suppliers will contact you within 24 hours</li>
            <li>• Use the contact buttons below to reach them directly</li>
            <li>• Discuss final details and arrangements</li>
            <li>• Remaining balance due on party day: £{paymentDetails?.remainingBalance || 0}</li>
            <li>• Enjoy your magical party! ✨</li>
          </ul>
        </div>

        {/* Payment Summary */}
        {paymentDetails && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deposit paid:</span>
                <span className="font-bold text-green-600">£{paymentDetails.depositAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining balance:</span>
                <span className="font-bold text-gray-900">£{paymentDetails.remainingBalance}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                * Remaining balance due on party day
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}