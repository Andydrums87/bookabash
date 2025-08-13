"use client"
import { Calendar, Clock, AlertTriangle } from "lucide-react"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"
import { Button } from "@/components/ui/button"

export default function SupplierUnavailableModal({ 
  isOpen, 
  onClose, 
  supplier, 
  selectedDate,
  onSelectNewDate,
  onViewAlternatives 
}) {
  if (!supplier) return null

  // Format the selected date for display
  const formatSelectedDate = () => {
    if (!selectedDate) return "your selected date"
    
    try {
      const date = new Date(selectedDate + 'T12:00:00')
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (error) {
      return "your selected date"
    }
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      theme="fun"
      showCloseButton={true}
    >
      <ModalHeader 
        title="Sorry, Not Available"
        subtitle={`${supplier.name} isn't available on ${formatSelectedDate()}`}
        theme="fun"
        icon={<AlertTriangle className="w-5 h-5 text-white" />}
      />

      <ModalContent>
        <div className="space-y-4">
      
          {/* Suggestions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">What would you like to do?</h4>
            
            <div className="grid gap-3">
              {/* Option 1: Pick a different date */}
              {/* <button
                onClick={onSelectNewDate}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Pick a Different Date</h5>
                  <p className="text-sm text-gray-600">
                    Choose another date when {supplier.name} is available
                  </p>
                </div>
              </button> */}

              {/* Option 2: View alternatives */}
              <button
                onClick={onViewAlternatives}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">View Similar Suppliers</h5>
                  <p className="text-sm text-gray-600">
                    Find other {supplier.category?.toLowerCase() || 'suppliers'} available on your date
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Working hours info if available */}
          {supplier.workingHours && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold text-gray-900 text-sm mb-2">Typical Working Hours:</h5>
              <div className="text-sm text-gray-600 space-y-1">
                {Object.entries(supplier.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize">{day}:</span>
                    <span>{hours === 'closed' ? 'Closed' : hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ModalContent>

      <ModalFooter theme="warning">
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          {/* <Button
            onClick={onSelectNewDate}
            className="flex-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Pick New Date
          </Button> */}
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}