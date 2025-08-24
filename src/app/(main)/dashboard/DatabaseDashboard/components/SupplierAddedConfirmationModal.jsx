"use client"

import { useState } from 'react'
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/UniversalModal.jsx'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, Clock, Users, Calendar, MapPin, Shield } from 'lucide-react'

export default function SupplierAddedConfirmationModal({
  isOpen,
  onClose,
  onSendEnquiry,
  supplier,
  selectedPackage,
  partyDetails,
  isSending = false,
  partyId,
}) {
  if (!supplier) return null

  const handleSecureBooking = () => {
    const partyId = partyDetails?.id
    
    if (!partyId) {
      console.error('❌ partyId is missing in partyDetails!')
      return
    }
    
    if (!onSendEnquiry) {
      console.error('❌ onSendEnquiry function is missing!')
      return
    }
    
    // Call the same function but with updated messaging context
    onSendEnquiry(supplier, selectedPackage, partyId)
  }

  const handleNotYet = () => {
    onClose()
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      theme="fun"
      preventOutsideClick={isSending}
      showCloseButton={!isSending}
    >
      <ModalHeader 
        title="Secure Your Booking?"
        subtitle="Ready to confirm this supplier for your party?"
        theme="success"
        icon={<Shield className="w-6 h-6 text-teal-500" />}
      />

      <ModalContent>
        <div className="space-y-6">
          {/* Supplier details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center space-x-4">
              <img 
                src={supplier.image || supplier.imageUrl || '/placeholder.png'}
                alt={supplier.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{supplier.category}</p>
                {selectedPackage && (
                  <p className="text-sm font-medium text-teal-600">
                    {selectedPackage.name} - £{selectedPackage.price}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ NEW: What happens next - Updated for immediate booking */}
          <div className="border border-green-200 rounded-xl p-4 bg-green-50">
            <h4 className="font-semibold text-green-900 mb-3">What happens when you secure this booking?</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-green-800">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-700" />
                </div>
                <span><strong>{supplier.name} is immediately confirmed</strong> for your party</span>
              </div>
              
              <div className="flex items-center gap-3 text-green-800">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-green-700" />
                </div>
                <span>Your booking is <strong>secured and protected</strong></span>
              </div>
              
              <div className="flex items-center gap-3 text-green-800">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                  <CreditCard className="w-3 h-3 text-green-700" />
                </div>
                <span>Pay deposit to <strong>guarantee availability</strong></span>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex flex-col gap-3">
          {/* ✅ UPDATED: Primary action */}
          <Button
            onClick={handleSecureBooking}
            disabled={isSending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3"
          >
            {isSending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Securing Booking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure Booking Now</span>
              </div>
            )}
          </Button>
          
          {/* ✅ UPDATED: Secondary action */}
          {!isSending && (
            <Button
              onClick={handleNotYet}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Not Yet - I'll Decide Later
            </Button>
          )}
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}