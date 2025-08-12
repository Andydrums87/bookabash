"use client"
import { Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal"

const PendingEnquiryModal = ({
  isOpen,
  onClose,
  onViewDashboard = () => {},
  pendingCount = 0,
}) => {

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="sm" 
      theme="default"
      showCloseButton={true}
    >
      {/* Header */}
      <ModalHeader 
        title="Hold on! ✋"
        subtitle="You have enquiries waiting for responses"
        theme="default"
        icon={<Clock className="w-6 h-6 text-amber-500" />}
      />

      {/* Content */}
      <ModalContent>
        <div className="text-center space-y-4">
          {/* Simple explanation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-gray-800 text-sm">
              You have <span className="font-bold text-amber-700">{pendingCount} enquir{pendingCount === 1 ? 'y' : 'ies'}</span> waiting for supplier responses.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Use your dashboard to manage your party plan while you wait.
            </p>
          </div>

          {/* Why explanation */}
          <div className="text-xs text-gray-500">
            💡 This prevents double-bookings and keeps your party plan organized
          </div>
        </div>
      </ModalContent>

      {/* Footer with Dashboard Button */}
      <ModalFooter theme="default">
        <Button
          onClick={onViewDashboard}
          className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-all duration-200 group"
        >
          Go to My Dashboard
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </ModalFooter>
    </UniversalModal>
  )
}

export default PendingEnquiryModal