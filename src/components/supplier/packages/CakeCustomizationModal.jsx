// components/supplier/CakeCustomizationModal.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
  
  // ✅ FIX: Move useMemo outside of conditional rendering
  // Always call hooks, regardless of isOpen state
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
  }, [supplier?.serviceDetails?.cakeFlavors]); // Only depend on the flavors array
  
  // Set initial flavor to first available - also moved outside conditional
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
  
  // ✅ FIX: Return early AFTER all hooks have been called
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            🎂 Choose Your Cake Flavor
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Package Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Package</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{selectedPackage.name}</span>
              <span className="font-bold text-primary text-lg">£{selectedPackage.price}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{selectedPackage.duration}</p>
          </div>
          
          {/* Flavor Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">
              Choose Cake Flavor ({availableFlavors.length} available)
            </h3>
            {availableFlavors.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  This supplier hasn't specified their available flavors yet. Please discuss flavor options directly with them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availableFlavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => setSelectedFlavor(flavor.id)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      selectedFlavor === flavor.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{flavor.name}</span>
                    {flavor.popular && (
                      <Badge className="ml-2 text-xs bg-orange-100 text-orange-700">
                        Popular
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Final Summary */}
          <div className="bg-primary-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold mb-2 text-primary-900">Your Cake Order</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Package:</span>
                <span>{selectedPackage.name}</span>
              </div>
              {selectedFlavorObj && (
                <div className="flex justify-between">
                  <span>Flavor:</span>
                  <span>{selectedFlavorObj.name}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-primary-900">
                  <span>Total:</span>
                  <span>£{selectedPackage.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-primary-500 hover:bg-primary-600"
            disabled={!selectedFlavorObj || availableFlavors.length === 0}
          >
            Add to Plan - £{selectedPackage.price}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CakeCustomizationModal;