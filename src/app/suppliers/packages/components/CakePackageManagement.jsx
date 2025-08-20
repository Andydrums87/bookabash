// components/packages/CakePackageManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  PlusCircle, 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  Check,
  Lightbulb,
  Palette,
  Heart
} from "lucide-react";

const CakePackageManagement = ({
  supplierData,
  setSupplierData,
  currentBusiness,
  updateProfile,
  saving
}) => {
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [packageFormData, setPackageFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "2-3 days notice",
    features: [""],
    image: "",
    popular: false,
  });

  const imageUploadRef = useRef(null);

  // Load packages on component mount
  useEffect(() => {
    if (supplierData?.packages) {
      setPackages(supplierData.packages);
    }
  }, [supplierData]);

  // Cake-specific form helpers
  const cakeThemeKeywords = [
    'unicorn', 'princess', 'superhero', 'dinosaur', 'mermaid', 'pirate', 
    'space', 'cars', 'football', 'garden', 'rainbow', 'castle', 'fairy'
  ];

  const cakeColorKeywords = [
    'pink', 'blue', 'purple', 'green', 'yellow', 'red', 'orange', 
    'rainbow', 'gold', 'silver', 'white'
  ];

  // Save packages to backend
  const savePackagesToBackend = async (updatedPackages) => {
    setLocalSaving(true);
    try {
      const updatedSupplierData = {
        ...supplierData,
        packages: updatedPackages,
      };

      const result = await updateProfile(updatedSupplierData, updatedPackages, supplierData.id);

      if (result.success) {
        setSupplierData(prev => ({
          ...prev,
          packages: updatedPackages,
        }));

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Failed to save cake products:", error);
      alert(`Failed to save cake products: ${error.message}`);
      throw error;
    } finally {
      setLocalSaving(false);
    }
  };

  const handleOpenPackageForm = (pkg) => {
    setEditingPackage(pkg);
    if (pkg) {
      setPackageFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        price: pkg.price || "",
        duration: pkg.duration || "2-3 days notice",
        features: pkg.features || pkg.whatsIncluded || [""],
        image: pkg.image || "",
        popular: pkg.popular || false,
      });
    } else {
      setPackageFormData({
        name: "",
        description: "",
        price: "",
        duration: "2-3 days notice",
        features: [""],
        image: "",
        popular: false,
      });
    }
    setIsPackageFormOpen(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "portfolio_images");

      const response = await fetch("https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload", {
        method: "POST",
        body: formData,
      });

      const cloudinaryData = await response.json();
      setPackageFormData(prev => ({
        ...prev,
        image: cloudinaryData.secure_url,
      }));
    } catch (error) {
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
      if (imageUploadRef.current) {
        imageUploadRef.current.value = "";
      }
    }
  };

  const handleSavePackage = async () => {
    if (!packageFormData.name || !packageFormData.price) {
      alert("Please fill in cake name and price");
      return;
    }

    const filteredFeatures = packageFormData.features.filter(item => item.trim() !== "");

    const newPackageData = {
      ...packageFormData,
      features: filteredFeatures,
      whatsIncluded: filteredFeatures,
      price: parseFloat(packageFormData.price) || 0,
      priceType: "flat",
      image: packageFormData.image,
    };

    let updatedPackages;
    if (editingPackage?.id) {
      updatedPackages = packages.map(p => 
        p.id === editingPackage.id ? { ...p, ...newPackageData } : p
      );
    } else {
      updatedPackages = [...packages, { ...newPackageData, id: `cake_${Date.now()}` }];
    }

    setPackages(updatedPackages);
    await savePackagesToBackend(updatedPackages);
    setIsPackageFormOpen(false);
    setEditingPackage(null);
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm("Are you sure you want to delete this cake design?")) {
      const updatedPackages = packages.filter(p => p.id !== packageId);
      setPackages(updatedPackages);
      await savePackagesToBackend(updatedPackages);
    }
  };

  return (
    <>
      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50 shadow-lg mb-6">
          <Check className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Cake products saved successfully! Your designs are now visible to customers.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                🎂 Your Cake Designs
              </CardTitle>
              <CardDescription>
                Each cake design becomes a customizable product that customers can order in different sizes
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenPackageForm(null)} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Cake Design
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Helpful Tips */}
          <Alert className="border-blue-200 bg-blue-50 mb-6">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>💡 Tips for success:</strong> Use descriptive names like "Unicorn Rainbow Castle" instead of "Basic Cake". 
              Include theme keywords (princess, superhero, dinosaur) and colors (pink, blue, rainbow) for better filtering.
              Set your price for medium size - we'll auto-calculate small and large prices.
            </AlertDescription>
          </Alert>

          {packages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <div className="text-6xl mb-4">🎂</div>
              <h3 className="text-lg font-medium mb-2">No cake designs yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start building your cake portfolio! Each design you add becomes a product customers can customize with different sizes, flavors, and messages.
              </p>
              <Button onClick={() => handleOpenPackageForm(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Cake Design
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <CakeProductCard
                  key={pkg.id}
                  packageData={pkg}
                  onEdit={() => handleOpenPackageForm(pkg)}
                  onDelete={() => handleDeletePackage(pkg.id)}
                />
              ))}
              <AddCakeCard onAdd={() => handleOpenPackageForm(null)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cake Form Modal */}
      {isPackageFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              🎂 {editingPackage ? "Edit Cake Design" : "Add New Cake Design"}
            </h3>

            <div className="space-y-6">
              {/* Cake Image */}
              <div>
                <Label className="text-sm font-medium">Cake Photo *</Label>
                <div className="mt-2 flex flex-col gap-4">
                  <div className="flex justify-center">
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      {packageFormData.image ? (
                        <>
                          <img
                            src={packageFormData.image}
                            alt="Cake preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPackageFormData(prev => ({ ...prev, image: "" }))}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <Camera className="h-8 w-8 mb-2" />
                          <span className="text-sm">Upload cake photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <label
                    htmlFor="cake-image-upload"
                    className={`inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                      uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {packageFormData.image ? "Change Photo" : "Upload Photo"}
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
                <Label className="text-sm font-medium">Cake Name *</Label>
                <Input
                  value={packageFormData.name}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Magical Unicorn Castle Cake"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Include themes (unicorn, princess, superhero) and colors for better filtering
                </p>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={packageFormData.description}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your cake design, decorations, and what makes it special..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Price */}
              <div>
                <Label className="text-sm font-medium">Price (Medium Size) *</Label>
                <Input
                  type="number"
                  value={packageFormData.price}
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="70"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Set price for medium size (15-20 people). Small and large prices calculated automatically
                </p>
              </div>

              {/* What's Included */}
              <div>
                <Label className="text-sm font-medium">What's Included</Label>
                <div className="space-y-3 mt-2">
                  {packageFormData.features.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newFeatures = [...packageFormData.features];
                          newFeatures[index] = e.target.value;
                          setPackageFormData(prev => ({ ...prev, features: newFeatures }));
                        }}
                        placeholder="e.g., Hand-crafted sugar decorations"
                        className="flex-1"
                      />
                      {packageFormData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFeatures = packageFormData.features.filter((_, i) => i !== index);
                            setPackageFormData(prev => ({ ...prev, features: newFeatures }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPackageFormData(prev => ({ 
                      ...prev, 
                      features: [...prev.features, ""] 
                    }))}
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsPackageFormOpen(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSavePackage} 
                disabled={localSaving || uploadingImage} 
                className="flex-1"
              >
                {localSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingPackage ? (
                  "Update Cake Design"
                ) : (
                  "Add Cake Design"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Specialized cake product card component
const CakeProductCard = ({ packageData, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={packageData.image || "/placeholder.png"}
          alt={packageData.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-white/90 text-gray-700">
            from £{Math.round(packageData.price * 0.7)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2">{packageData.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {packageData.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {packageData.features?.slice(0, 2).map((feature, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Medium: £{packageData.price}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit()}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete()} className="text-red-600">
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add new cake card
const AddCakeCard = ({ onAdd }) => {
  return (
    <Card 
      className="border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
      onClick={onAdd}
    >
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
        <div className="text-4xl mb-4">🎂</div>
        <h3 className="font-semibold mb-2">Add New Cake Design</h3>
        <p className="text-sm text-gray-600 mb-4">
          Create another cake product for customers to customize
        </p>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Cake
        </Button>
      </CardContent>
    </Card>
  );
};

export default CakePackageManagement;