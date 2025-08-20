// components/packages/SimpleCakeProductModal.jsx
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  X, 
  Camera, 
  Upload, 
  Loader2, 
  Lightbulb,
  Info
} from "lucide-react";

const SimpleCakeProductModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingPackage = null,
  uploadingImage = false,
  onImageUpload 
}) => {
  const [formData, setFormData] = useState({
    name: editingPackage?.name || "",
    description: editingPackage?.description || "",
    price: editingPackage?.price || "",
    image: editingPackage?.image || ""
  });

  const imageUploadRef = useRef(null);

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in cake name and price");
      return;
    }

    // Create package data that works with existing system
    const packageData = {
      id: editingPackage?.id || `cake_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      duration: "2-3 days notice", // Standard for cakes
      image: formData.image,
      features: [
        "Custom message included",
        "Professional decoration",
        "Fresh, high-quality ingredients"
      ],
      whatsIncluded: [
        "Custom message included", 
        "Professional decoration",
        "Fresh, high-quality ingredients"
      ],
      priceType: "flat",
      popular: false
    };

    onSave(packageData);
  };

  const handleImageUpload = async (event) => {
    if (onImageUpload) {
      const result = await onImageUpload(event);
      if (result?.secure_url) {
        setFormData(prev => ({ ...prev, image: result.secure_url }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🎂 {editingPackage ? "Edit Cake Design" : "Add New Cake Design"}
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
          
          {/* Helpful Tips */}
          <Alert className="border-blue-200 bg-blue-50 mb-6">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>💡 Create a stunning cake product:</strong> Upload a beautiful photo, use descriptive names like "Unicorn Rainbow Castle" or "Paw Patrol Adventure", and set your base price. Customers will see size options automatically!
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Cake Photo - Prominent */}
            <div>
              <Label className="text-lg font-semibold text-gray-900">Cake Photo *</Label>
              <p className="text-sm text-gray-600 mb-3">This is the main image customers will see - make it beautiful!</p>
              
              <div className="flex flex-col items-center gap-4">
                {/* Large Image Preview */}
                <div className="relative w-full max-w-md h-64 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                  {formData.image ? (
                    <>
                      <img
                        src={formData.image}
                        alt="Cake preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Camera className="h-12 w-12 mb-3" />
                      <span className="text-lg font-medium">Upload your cake photo</span>
                      <span className="text-sm">Show off your amazing work!</span>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label
                  htmlFor="cake-image-upload"
                  className={`inline-flex items-center justify-center px-6 py-3 border-2 border-primary-500 rounded-xl shadow-sm text-base font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 cursor-pointer transition-colors ${
                    uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      {formData.image ? "Change Photo" : "Upload Photo"}
                    </>
                  )}
                </label>
                <input
                  id="cake-image-upload"
                  ref={imageUploadRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
            </div>

            {/* Cake Name */}
            <div>
              <Label className="text-lg font-semibold text-gray-900">Cake Name *</Label>
              <p className="text-sm text-gray-600 mb-2">Be descriptive and include themes/characters</p>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Magical Unicorn Castle Cake, Paw Patrol Adventure Cake"
                className="text-base p-4"
              />
            </div>

            {/* Price */}
            <div>
              <Label className="text-lg font-semibold text-gray-900">Base Price (£) *</Label>
              <p className="text-sm text-gray-600 mb-2">Price for medium size (15-20 people) - we'll calculate other sizes</p>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="67"
                className="text-base p-4"
              />
              {formData.price && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Pricing preview:</strong> Small (8-12): £{Math.round(formData.price * 0.7)} • 
                    Medium (15-20): £{formData.price} • 
                    Large (25-30): £{Math.round(formData.price * 1.5)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <Label className="text-lg font-semibold text-gray-900">Description</Label>
              <p className="text-sm text-gray-600 mb-2">Brief description of the cake design and decorations</p>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A delightful unicorn-themed cake with rainbow layers, edible glitter, and hand-crafted decorations. Perfect for magical birthday celebrations!"
                rows={3}
                className="text-base p-4"
              />
            </div>

            {/* Auto-included features info */}
            <Alert className="border-green-200 bg-green-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ Automatically included:</strong> Custom message, professional decoration, fresh ingredients, and size options (Small, Medium, Large). Customers can also choose flavors and add personalized messages!
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 py-3"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.price || uploadingImage}
            className="flex-1 py-3 bg-primary-500 hover:bg-primary-600"
          >
            {editingPackage ? "Update Cake Design" : "Add Cake Design"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleCakeProductModal;