// components/supplier/CakeCustomizationModal.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx";
import { Cake, Clock, Truck, MessageSquare } from 'lucide-react';

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
  const [customMessage, setCustomMessage] = useState('');
  
  const availableFlavors = React.useMemo(() => {
    if (!supplier) {
      console.log('No supplier provided, using defaults');
      return DEFAULT_FLAVORS;
    }

    console.log('Getting available flavors from supplier:', {
      supplierName: supplier?.name,
      cakeFlavors: supplier?.serviceDetails?.cakeFlavors,
      flavorsCount: supplier?.serviceDetails?.cakeFlavors?.length
    });

    if (supplier?.serviceDetails?.cakeFlavors?.length > 0) {
      return supplier.serviceDetails.cakeFlavors.map((flavor, index) => ({
        id: flavor.toLowerCase().replace(/\s+/g, '-'),
        name: flavor,
        popular: index < 3
      }));
    }
    
    console.log('No custom flavors found, using defaults');
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
      setSelectedFlavor(availableFlavors[0]?.id || 'vanilla');
      setCustomMessage('');
    }
  }, [isOpen, availableFlavors]);
  
  if (!isOpen || !selectedPackage) {
    return null;
  }
  
  const selectedFlavorObj = availableFlavors.find(f => f.id === selectedFlavor) || availableFlavors[0];
  
  const handleConfirm = () => {
    const enhancedPackage = {
      ...selectedPackage,
      
      // Payment and delivery info
      paymentType: 'full_payment',
      deliveryExpectation: 'pre_party_delivery',
      supplierContactRequired: true,
      
      // Cake customization data
      cakeCustomization: {
        flavor: selectedFlavor,
        flavorName: selectedFlavorObj.name,
        customMessage: customMessage.trim(),
        customizationType: 'cake_specialist'
      },
      
      // Update package features
      features: [
        ...(selectedPackage.features || []),
        `${selectedFlavorObj.name} flavor`,
        'Professional cake decoration',
        'Pre-party delivery included'
      ],
      
      // Update description
      description: selectedPackage.description ? 
        `${selectedPackage.description} - ${selectedFlavorObj.name} flavor` :
        `${selectedFlavorObj.name} cake`,
      
      packageType: 'cake',
      supplierType: 'cake_specialist'
    };
    
    console.log('Cake customization data created:', {
      packageName: enhancedPackage.name,
      flavor: enhancedPackage.cakeCustomization.flavorName,
      hasCustomMessage: !!customMessage.trim()
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
      <ModalHeader
        title="Customize Your Cake Order"
        subtitle={`${selectedPackage.name} from ${supplier?.name}`}
        theme="fun"
        icon={<Cake className="w-6 h-6" />}
      />
      
      <ModalContent className="space-y-6">
        {/* Package Summary Card */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedPackage.name}</h3>
              <p className="text-sm text-gray-600">{selectedPackage.duration}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">£{selectedPackage.price}</div>
              <div className="text-xs text-orange-700">Full Payment</div>
            </div>
          </div>
          
          {/* Key Info Cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs font-medium text-gray-700">Delivery</div>
                <div className="text-xs text-gray-600">1-2 days before party</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
              <Truck className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-xs font-medium text-gray-700">Contact</div>
                <div className="text-xs text-gray-600">Supplier will call you</div>
              </div>
            </div>
          </div>
        </div>

        {/* Flavor Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900">
            Choose Cake Flavor
          </Label>
          
          {availableFlavors.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This supplier hasn't specified their available flavors yet. Please discuss flavor options directly with them.
              </p>
            </div>
          ) : (
            <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
              <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 rounded-lg text-base">
                <SelectValue placeholder="Select a flavor" />
              </SelectTrigger>
              <SelectContent>
                {availableFlavors.map((flavor) => (
                  <SelectItem key={flavor.id} value={flavor.id} className="text-base py-3">
                    <div className="flex items-center justify-between w-full">
                      <span>{flavor.name}</span>
                      {flavor.popular && (
                        <Badge className="ml-2 text-xs bg-orange-100 text-orange-700 border-orange-200">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Custom Message */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Special Requests or Custom Message
          </Label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Any special decorating requests, dietary requirements, or message for the cake maker..."
            rows={4}
            className="bg-white border-2 border-gray-200 rounded-lg text-base p-4 resize-none"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 text-right">
            {customMessage.length}/500 characters
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
          <h4 className="font-semibold mb-3 text-green-900 flex items-center gap-2">
            <Cake className="w-5 h-5" />
            Order Summary
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
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Payment:</span>
              <span className="font-medium text-gray-900">Full payment upfront</span>
            </div>
            <div className="border-t border-green-200 pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-900">Total Amount:</span>
                <span className="font-bold text-xl text-green-900">£{selectedPackage.price}</span>
              </div>
            </div>
          </div>
          
          {/* Important Note */}
          <div className="mt-4 p-3 bg-white/70 rounded-lg border-l-4 border-blue-500">
            <p className="text-xs text-gray-700">
              <strong>Next steps:</strong> After booking, {supplier?.name || 'the cake maker'} will contact you within 24 hours to confirm delivery details and finalize any custom decorating requests.
            </p>
          </div>
        </div>
      </ModalContent>
      
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
            className="flex-1 bg-primary-400 hover:[hsl(var(--primary-500))] text-white shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!selectedFlavorObj || availableFlavors.length === 0}
          >
            <span className="flex items-center gap-2">
              <Cake className="w-4 h-4" />
              Book Cake - £{selectedPackage.price}
            </span>
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

export default CakeCustomizationModal;