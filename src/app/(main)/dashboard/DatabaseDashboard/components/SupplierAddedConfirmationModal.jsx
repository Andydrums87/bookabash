"use client"

import { useState } from 'react'
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/UniversalModal.jsx'
import { Button } from '@/components/ui/button'
import { CheckCircle, Send, Clock, Users, Calendar, MapPin, X } from 'lucide-react'

export default function SupplierAddedConfirmationModal({
  isOpen,
  onClose,
  onSendEnquiry,
  supplier,
  selectedPackage,
  partyDetails,
  isSending = false,
  partyId, // ✅ ADD THIS PROP
}) {
  if (!supplier) return null

  const handleSendEnquiry = () => {

    
    const partyId = partyDetails?.id
    
    if (!partyId) {
      console.error('❌ partyId is missing in partyDetails!')
      console.error('❌ partyDetails structure:', partyDetails)
      return
    }
    
    if (!onSendEnquiry) {
      console.error('❌ onSendEnquiry function is missing!')
      return
    }
    

    
    // ✅ FIXED: Pass all 3 parameters including partyId
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
        title="Ready to Send Enquiry?"
        subtitle={``}
        theme="success"
        icon={<CheckCircle className="w-6 h-6 text-teal-500" />}
      />

      <ModalContent>
        <div className="space-y-6 ">
         

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

          {/* What happens next */}
          {/* <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-3">What happens when you send an enquiry?</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-blue-800">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                  <Send className="w-3 h-3 text-blue-700" />
                </div>
                <span>We'll send your party details to {supplier.name}</span>
              </div>
              
              <div className="flex items-center gap-3 text-blue-800">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-blue-700" />
                </div>
                <span>They'll confirm availability within 24 hours</span>
              </div>
              
              <div className="flex items-center gap-3 text-blue-800">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-blue-700" />
                </div>
                <span>You can review their response before booking</span>
              </div>
            </div>
          </div> */}

          {/* Party details that will be sent */}
          {/* <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Party details to be sent:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{partyDetails?.date || 'Party date'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>Age {partyDetails?.childAge || '5'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{partyDetails?.location || 'Party location'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{partyDetails?.guestCount || '15'} guests</span>
              </div>
            </div>
          </div> */}
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex flex-col gap-3">
          {/* Primary action */}
          <Button
            onClick={handleSendEnquiry}
            disabled={isSending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3"
          >
            {isSending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending Enquiry...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                <span>Send Enquiry Now</span>
              </div>
            )}
          </Button>
          
          {/* Secondary action - Updated text */}
          {!isSending && (
            <Button
              onClick={handleNotYet}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Not Yet - I'll Send Later
            </Button>
          )}
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}