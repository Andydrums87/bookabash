import React from 'react';
import { Button } from '@/components/ui/button';

const PartyReadinessModal = ({ isOpen, onClose, onProceed, suppliers, partyDetails, totalCost }) => {
  if (!isOpen) return null;

  // Get the child's name or fallback
  const childName = partyDetails?.childName || "Your little one";
  const theme = partyDetails?.theme || "party";
  
  // Convert suppliers object to array for easier handling
  const supplierList = Object.entries(suppliers || {})
    .filter(([key, supplier]) => supplier && supplier.name)
    .map(([key, supplier]) => ({
      name: supplier.name,
      category: supplier.category || key,
      price: supplier.price || supplier.originalPrice || 0
    }));

  const formattedTotal = totalCost?.toLocaleString() || '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        
        {/* Header with colored background */}
        <div className="bg-primary-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-primary-200 transition-colors text-xl"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-2 pr-8">
            {childName}'s party is looking awesome!
          </h2>
          <p className="text-primary-100">
            Here's your party team so far
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Supplier List */}
          <div className="space-y-3 mb-6">
            {supplierList.map((supplier, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {supplier.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {supplier.category}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  £{supplier.price}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 mb-6 border-t border-gray-200">
            <p className="font-bold text-gray-900">Total</p>
            <p className="text-xl font-bold text-gray-900">
              £{formattedTotal}
            </p>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 text-center">
              Want to add more magic? You can always add extras after booking!
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onProceed}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 font-medium rounded-lg"
            >
              Perfect! Let's book this party!
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg"
            >
              Wait, I want to add more suppliers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyReadinessModal;