// components/supplier/CakeCustomizationModal.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx";
import { Cake, Clock, Truck, MessageSquare, Leaf } from 'lucide-react';

// Default flavors if supplier hasn't specified any
const DEFAULT_FLAVORS = [
  { id: 'vanilla', name: 'Vanilla Sponge', popular: true },
  { id: 'chocolate', name: 'Chocolate Fudge', popular: true },
  { id: 'strawberry', name: 'Strawberry', popular: true },
  { id: 'red-velvet', name: 'Red Velvet' },
  { id: 'lemon', name: 'Lemon Drizzle' },
  { id: 'funfetti', name: 'Funfetti/Rainbow' }
];

// Dietary option labels for display
const DIETARY_LABELS = {
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten Free',
  'dairy-free': 'Dairy Free',
  'nut-free': 'Nut Free',
  'egg-free': 'Egg Free',
  'halal': 'Halal'
};

const CakeCustomizationModal = ({
  isOpen,
  onClose,
  supplier,
  selectedPackage,
  onConfirm
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState('vanilla');
  const [selectedDietary, setSelectedDietary] = useState('standard');
  const [customMessage, setCustomMessage] = useState('');

  // Get available flavours - check both British and American spellings
  const availableFlavors = React.useMemo(() => {
    if (!supplier) {
      console.log('No supplier provided, using defaults');
      return DEFAULT_FLAVORS;
    }

    // Check both spellings: flavours (British) and cakeFlavors (American)
    const flavourData = supplier?.serviceDetails?.flavours ||
                        supplier?.serviceDetails?.cakeFlavors ||
                        supplier?.flavours ||
                        [];

    console.log('Getting available flavors from supplier:', {
      supplierName: supplier?.name,
      flavours: flavourData,
      flavoursCount: flavourData?.length
    });

    if (flavourData?.length > 0) {
      return flavourData.map((flavor, index) => ({
        id: flavor.toLowerCase().replace(/\s+/g, '-'),
        name: flavor,
        popular: index < 3
      }));
    }

    console.log('No custom flavors found, using defaults');
    return DEFAULT_FLAVORS;
  }, [supplier]);

  // Get available dietary options from supplier
  const availableDietaryOptions = React.useMemo(() => {
    if (!supplier) return [];

    // Check both locations for dietary info
    const dietaryData = supplier?.serviceDetails?.dietaryInfo ||
                        supplier?.dietaryInfo ||
                        [];

    console.log('Getting available dietary options from supplier:', {
      supplierName: supplier?.name,
      dietaryInfo: dietaryData
    });

    if (dietaryData?.length > 0) {
      return dietaryData.map(option => ({
        id: option,
        name: DIETARY_LABELS[option] || option
      }));
    }

    return [];
  }, [supplier]);
  
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
      setSelectedDietary('standard');
      setCustomMessage('');
    }
  }, [isOpen, availableFlavors]);
  
  if (!isOpen || !selectedPackage) {
    return null;
  }

  const selectedFlavorObj = availableFlavors.find(f => f.id === selectedFlavor) || availableFlavors[0];
  const selectedDietaryObj = availableDietaryOptions.find(d => d.id === selectedDietary);
  const dietaryDisplayName = selectedDietary === 'standard'
    ? 'Standard'
    : (selectedDietaryObj?.name || selectedDietary);

  // Get delivery fee from package (priority) or fall back to supplier-level
  const packageDeliveryFee = parseFloat(selectedPackage.deliveryFee) || 0;
  const supplierDeliveryFee = parseFloat(supplier?.serviceDetails?.fulfilment?.deliveryFee) || 0;
  const deliveryFee = packageDeliveryFee > 0 ? packageDeliveryFee : supplierDeliveryFee;
  const hasDeliveryFee = deliveryFee > 0;

  // Calculate total
  const packagePrice = parseFloat(selectedPackage.price) || 0;
  const totalPrice = packagePrice + deliveryFee;

  // Debug logging
  console.log('🎂 CakeCustomizationModal delivery fee calculation:', {
    packageName: selectedPackage.name,
    packageDeliveryFee,
    supplierDeliveryFee,
    finalDeliveryFee: deliveryFee,
    packagePrice,
    totalPrice,
    selectedPackage
  });

  const handleConfirm = () => {
    const enhancedPackage = {
      ...selectedPackage,

      // Payment and delivery info
      paymentType: 'full_payment',
      deliveryExpectation: 'pre_party_delivery',
      supplierContactRequired: true,
      deliveryFee: deliveryFee,
      totalPrice: totalPrice,

      // Cake customization data
      cakeCustomization: {
        // Size/package info
        size: selectedPackage.name,
        servings: selectedPackage.servings || selectedPackage.serves || null,
        tiers: selectedPackage.tiers || null,
        packageDescription: selectedPackage.description || null,
        // Flavor and dietary
        flavor: selectedFlavor,
        flavorName: selectedFlavorObj.name,
        dietary: selectedDietary,
        dietaryName: dietaryDisplayName,
        customMessage: customMessage.trim(),
        customizationType: 'cake_specialist',
        // Pricing
        basePrice: packagePrice,
        deliveryFee: deliveryFee,
        totalPrice: totalPrice
      },

      // Update package features
      features: [
        ...(selectedPackage.features || []),
        `${selectedFlavorObj.name} flavour`,
        ...(selectedDietary !== 'standard' ? [`${dietaryDisplayName}`] : []),
        'Professional cake decoration',
        'Pre-party delivery included'
      ],

      // Update description
      description: selectedPackage.description
        ? `${selectedPackage.description} - ${selectedFlavorObj.name} flavour${selectedDietary !== 'standard' ? ` (${dietaryDisplayName})` : ''}`
        : `${selectedFlavorObj.name} cake${selectedDietary !== 'standard' ? ` (${dietaryDisplayName})` : ''}`,

      packageType: 'cake',
      supplierType: 'cake_specialist'
    };

    console.log('Cake customization data created:', {
      packageName: enhancedPackage.name,
      flavor: enhancedPackage.cakeCustomization.flavorName,
      dietary: enhancedPackage.cakeCustomization.dietaryName,
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
        title="Customise Your Cake Order"
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
                <div className="text-xs font-medium text-gray-700">Delivery Fee</div>
                <div className="text-xs text-gray-600">
                  {hasDeliveryFee ? `+£${deliveryFee.toFixed(2)}` : 'Free delivery'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flavor Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900">
            Choose Cake Flavour
          </Label>

          {availableFlavors.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This supplier hasn't specified their available flavours yet. Please discuss flavour options directly with them.
              </p>
            </div>
          ) : (
            <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
              <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 rounded-lg text-base">
                <SelectValue placeholder="Select a flavour" />
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

        {/* Dietary Requirements - only show if supplier offers options */}
        {availableDietaryOptions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Dietary Requirements
            </Label>
            <Select value={selectedDietary} onValueChange={setSelectedDietary}>
              <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 rounded-lg text-base">
                <SelectValue placeholder="Select dietary option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard" className="text-base py-3">
                  Standard (no special requirements)
                </SelectItem>
                {availableDietaryOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="text-base py-3">
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              This cake maker offers these dietary options. Select if you have specific requirements.
            </p>
          </div>
        )}

        {/* Custom Message */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Special Requests or Custom Message
          </Label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Any special decorating requests, name/message for the cake, or notes for the cake maker..."
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
              <span className="text-gray-700">Size:</span>
              <span className="font-medium text-gray-900">{selectedPackage.name}</span>
            </div>
            {selectedFlavorObj && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Flavour:</span>
                <span className="font-medium text-gray-900">{selectedFlavorObj.name}</span>
              </div>
            )}
            {selectedDietary !== 'standard' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Dietary:</span>
                <span className="font-medium text-gray-900">{dietaryDisplayName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Cake price:</span>
              <span className="font-medium text-gray-900">£{packagePrice.toFixed(2)}</span>
            </div>
            {hasDeliveryFee && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Delivery fee:</span>
                <span className="font-medium text-gray-900">£{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-green-200 pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-900">Total Amount:</span>
                <span className="font-bold text-xl text-green-900">£{totalPrice.toFixed(2)}</span>
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
              Book Cake - £{totalPrice.toFixed(2)}
            </span>
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

export default CakeCustomizationModal;