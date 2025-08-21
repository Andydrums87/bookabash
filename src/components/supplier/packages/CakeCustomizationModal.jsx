// components/supplier/CakeCustomizationModal.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx";

// Default flavors if supplier hasn't specified any
const DEFAULT_FLAVORS = [
  { id: 'vanilla', name: 'Vanilla Sponge', popular: true },
  { id: 'chocolate', name: 'Chocolate Fudge', popular: true },
  { id: 'strawberry', name: 'Strawberry', popular: true },
  { id: 'red-velvet', name: 'Red Velvet' },
  { id: 'lemon', name: 'Lemon Drizzle' },
  { id: 'funfetti', name: 'Funfetti/Rainbow' }
];

const CakeCustomizationModal = ({ 
  isOpen, 
  onClose, 
  supplier,
  selectedPackage,
  onConfirm
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState('vanilla');
  
  // ✅ Always call hooks, regardless of isOpen state
  const availableFlavors = React.useMemo(() => {
    // Early return with defaults if no supplier
    if (!supplier) {
      console.log('🍰 No supplier provided, using defaults');
      return DEFAULT_FLAVORS;
    }

    console.log('🍰 Getting available flavors from supplier:', {
      supplierName: supplier?.name,
      cakeFlavors: supplier?.serviceDetails?.cakeFlavors,
      flavorsCount: supplier?.serviceDetails?.cakeFlavors?.length
    });

    if (supplier?.serviceDetails?.cakeFlavors?.length > 0) {
      // Use flavors from your backend CateringServiceDetails form
      return supplier.serviceDetails.cakeFlavors.map((flavor, index) => ({
        id: flavor.toLowerCase().replace(/\s+/g, '-'),
        name: flavor,
        popular: index < 3 // First 3 are marked as popular
      }));
    }
    
    console.log('🍰 No custom flavors found, using defaults');
    return DEFAULT_FLAVORS;
  }, [supplier?.serviceDetails?.cakeFlavors]);
  
  // Set initial flavor to first available
  React.useEffect(() => {
    if (availableFlavors.length > 0 && !selectedFlavor) {
      setSelectedFlavor(availableFlavors[0].id);
    }
  }, [availableFlavors, selectedFlavor]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Reset to defaults when modal opens
      setSelectedFlavor(availableFlavors[0]?.id || 'vanilla');
    }
  }, [isOpen, availableFlavors]);
  
  // ✅ Return early AFTER all hooks have been called
  if (!isOpen || !selectedPackage) {
    return null;
  }
  
  const selectedFlavorObj = availableFlavors.find(f => f.id === selectedFlavor) || availableFlavors[0];
  
  const handleConfirm = () => {
    // Create enhanced package data with cake customization
    const enhancedPackage = {
      ...selectedPackage,
      
      // Add cake customization data that your backend can use
      cakeCustomization: {
        flavor: selectedFlavor,
        flavorName: selectedFlavorObj.name,
        customizationType: 'cake_specialist' // Flag to identify this as cake customization
      },
      
      // Update package features to include cake details
      features: [
        ...(selectedPackage.features || []),
        `${selectedFlavorObj.name} flavor`,
        'Professional cake decoration'
      ],
      
      // Update description to include customization
      description: selectedPackage.description ? 
        `${selectedPackage.description} - ${selectedFlavorObj.name} flavor` :
        `${selectedFlavorObj.name} cake`,
      
      // Mark as cake package for your backend processing
      packageType: 'cake',
      supplierType: 'cake_specialist'
    };
    
    console.log('🎂 Cake customization data created:', {
      packageName: enhancedPackage.name,
      flavor: enhancedPackage.cakeCustomization.flavorName
    });
    
    onConfirm(enhancedPackage);
  };
  
  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      theme="fun"
      showCloseButton={true}
    >
      {/* ✅ Header with cake theme */}
      <ModalHeader
        title="Choose Your Cake Flavor"
        subtitle={`Customize your ${selectedPackage.name} cake`}
        theme="fun"
        icon={<span className="text-2xl">🎂</span>}
      />
      
      {/* ✅ Content section */}
      <ModalContent>
        {/* Package Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-2">Selected Package</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">{selectedPackage.name}</span>
            <span className="font-bold text-primary text-lg">£{selectedPackage.price}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{selectedPackage.duration}</p>
        </div>
        
        {/* Flavor Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3 text-gray-900">
            Choose Cake Flavor ({availableFlavors.length} available)
          </h3>
          {availableFlavors.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This supplier hasn't specified their available flavors yet. Please discuss flavor options directly with them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {availableFlavors.map((flavor) => (
                <button
                  key={flavor.id}
                  onClick={() => setSelectedFlavor(flavor.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                    selectedFlavor === flavor.id
                      ? 'border-[hsl(var(--primary-500))] bg-primary-50 shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{flavor.name}</span>
                    <div className="flex items-center gap-2">
                      {flavor.popular && (
                        <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                          Popular
                        </Badge>
                      )}
                      {selectedFlavor === flavor.id && (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Final Summary */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
          <h4 className="font-semibold mb-3 text-primary-900 flex items-center gap-2">
            <span>🎂</span>
            Your Cake Order Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Package:</span>
              <span className="font-medium text-gray-900">{selectedPackage.name}</span>
            </div>
            {selectedFlavorObj && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Flavor:</span>
                <span className="font-medium text-gray-900">{selectedFlavorObj.name}</span>
              </div>
            )}
            <div className="border-t border-primary-200 pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-primary-900">Total Price:</span>
                <span className="font-bold text-xl text-primary-900">£{selectedPackage.price}</span>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
      
      {/* ✅ Footer with action buttons */}
      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!selectedFlavorObj || availableFlavors.length === 0}
          >
            <span className="flex items-center gap-2">
              <span>🎂</span>
              Add to Plan - £{selectedPackage.price}
            </span>
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

export default CakeCustomizationModal;