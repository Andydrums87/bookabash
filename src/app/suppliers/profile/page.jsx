"use client"

// ... (Keep all other imports and existing state/functions)
import { ScrollArea } from "@/components/ui/scroll-area" // Ensure this is imported if not already
import { useState } from "react" // Ensure useEffect is imported
import { useEffect } from "react"
import { useRef } from "react"
import { useSupplierDashboard } from "@/utils/mockBackend"
import {
  AlertCircle,
  Building,
  Palette,
  Eye,
  Briefcase,
  Info,
  Users,
  Settings,
  Shield,
  User,
  Star,
  Camera,
  CalendarDays,
  ShieldCheck,
  PackageIcon,
  UploadCloud,
  Trash2,
  Check,
  ImagePlus,
  Video,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  PlusCircle,
  Loader2,
  Badge
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SupplierPackageCard, AddPackageCard } from "@/components/supplier-package-card" // Ensure AddPackageCard is imported
import { SupplierPackageForm } from "@/components/supplier-package-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { format, isEqual, startOfDay } from "date-fns"
import NextImage from "next/image" //
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" 




 // Helper functions to replace date-fns
 const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const isDateEqual = (date1, date2) => {
  return date1.toDateString() === date2.toDateString();
};

// const startOfDay = (date) => {
//   const newDate = new Date(date);
//   newDate.setHours(0, 0, 0, 0);
//   return newDate;
// };

const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const isBefore = (date1, date2) => {
  return date1.getTime() < date2.getTime();
};

const isAfter = (date1, date2) => {
  return date1.getTime() > date2.getTime();
};

// Mock data - in a real app, this would come from your backend
const initialSupplierData = {
  id: "supplier123",
  businessName: "Party Heroes Entertainment",
  contactName: "Jane Doe",
  email: "jane.doe@partyheroes.com",
  phone: "07123456789",
  postcode: "SW1A 1AA",
  businessDescription: "Top-tier entertainment services for all ages. We bring the fun to your party!",
  serviceType: "entertainer", // or "venue"
}

const initialPackages = [
  {
    id: "pkg1",
    name: "Basic Fun Package",
    description:
      "Our entry-level package perfect for small gatherings. Includes one entertainer, basic balloon modelling, and fun party games to keep the little ones engaged.",
    price: 150,
    priceType: "flat",
    duration: "1 hour",
    whatsIncluded: ["1 Entertainer", "Basic balloon modelling", "Party games"],
    imageUrl: "/placeholder.svg?height=300&width=400&text=Basic+Fun", // Added imageUrl
  },
  {
    id: "pkg2",
    name: "Ultimate Party Package",
    description:
      "The all-inclusive package for an unforgettable event. Features two entertainers, advanced balloon modelling, a captivating magic show, face painting, and a music system.",
    price: 300,
    priceType: "flat",
    duration: "2 hours",
    whatsIncluded: ["2 Entertainers", "Advanced balloon modelling", "Magic show", "Face painting", "Music system"],
    imageUrl: "/placeholder.svg?height=300&width=400&text=Ultimate+Party", // Added imageUrl
  },
  {
    id: "pkg3",
    name: "Princess Dream Package",
    description:
      "A magical experience with a real-life princess! Includes themed games, storytelling, and a special crowning ceremony for the birthday child.",
    price: 220,
    priceType: "flat",
    duration: "1.5 hours",
    whatsIncluded: ["Princess Entertainer", "Themed Games", "Storytelling", "Crowning Ceremony"],
    imageUrl: "/placeholder.svg?height=300&width=400&text=Princess+Dream", // Added imageUrl
  },
]


const VenueDetailsForm = () => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Venue Specifics</CardTitle>
      <CardDescription>Provide detailed information about your venue.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="venueType">Venue Type</Label>
          <Input id="venueType" placeholder="e.g., Hall, Outdoor Space" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="capacity">Max Capacity</Label>
          <Input id="capacity" type="number" placeholder="e.g., 100" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Facilities</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
          {["Kitchen", "Parking", "Toilets", "Sound System", "Projector", "Garden", "Wi-Fi", "Stage"].map(
            (facility) => (
              <div key={facility} className="flex items-center space-x-2">
                <Checkbox id={`facility-${facility}`} />
                <Label htmlFor={`facility-${facility}`} className="font-normal text-sm">
                  {facility}
                </Label>
              </div>
            ),
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="accessibility">Accessibility Features</Label>
        <Textarea
          id="accessibility"
          placeholder="e.g., Wheelchair accessible, step-free access, accessible toilets..."
        />
      </div>
    </CardContent>
  </Card>
)

const EntertainerDetailsForm = () => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle>Entertainer Specifics</CardTitle>
      <CardDescription>Provide detailed information about your entertainment services.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="actType">Act Type / Specialties</Label>
          <Input id="actType" placeholder="e.g., Magician, Clown, Face Painter, DJ" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ageGroups">Target Age Groups</Label>
          <Input id="ageGroups" placeholder="e.g., 3-5 years, 6-10 years, All ages" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="travelRadius">Travel Radius (miles)</Label>
          <Input id="travelRadius" type="number" placeholder="e.g., 20" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="equipment">Equipment Provided</Label>
          <Input id="equipment" placeholder="e.g., Sound system, lighting, props, costumes" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Performance Options</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
          {["Indoor", "Outdoor", "Virtual Events", "Workshops", "Walkaround"].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox id={`option-${option}`} />
              <Label htmlFor={`option-${option}`} className="font-normal text-sm">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

    </CardContent>
  </Card>
)




const EnhancedServiceDetailsTabContent = ({ 
  currentSupplier, 
  supplierData,
  updateProfile,
  packages,
  saving = false 
}) => {
  // Enhanced service details state
  const [serviceDetails, setServiceDetails] = useState({
    // About Service
    aboutService: "",
    serviceHighlights: "",
    
    // Duration & Pricing
    durationOptions: {
      minHours: 1,
      maxHours: 4,
      availableOptions: ["1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours", "4 hours"]
    },
    pricingInfo: {
      pricingModel: "per-hour", // per-hour, flat-rate, per-person
      basePrice: 0,
      priceDescription: "",
      whatIncluded: []
    },
    
    // Service Standards
    serviceStandards: {
      setupTime: 30,
      equipmentProvided: true,
      cleanupIncluded: false,
      setupDescription: ""
    },
    
    // Service Includes (for entertainers)
    serviceIncludes: {
      performerGenders: [],
      ageGroups: [],
      teamSize: 1,
      teamDescription: "",
      // Entertainer specific fields from your existing form
      actType: "",
      travelRadius: "",
      equipment: "",
      performanceOptions: []
    },
    
    // Venue specific fields
    venueDetails: {
      venueType: "",
      capacity: "",
      facilities: [],
      accessibility: ""
    },
    
    // Requirements
    requirements: {
      spaceRequired: "",
      powerNeeded: false,
      indoorOutdoor: [],
      specialRequirements: ""
    },
    
    // Certifications
    certifications: {
      dbsCertificate: false,
      publicLiability: false,
      firstAid: false,
      otherCerts: []
    },
    
    // Personal Bio
    personalBio: {
      yearsExperience: 0,
      inspiration: "",
      favoriteEvent: "",
      dreamCelebrity: "",
      personalStory: "",
      funFacts: []
    }
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    console.log('🔄 Loading existing service details...');
    console.log('📥 currentSupplier:', currentSupplier);
    console.log('📥 currentSupplier.serviceDetails:', currentSupplier?.serviceDetails);
    
    if (currentSupplier?.serviceDetails) {
      console.log('✅ Found existing service details, loading...');
      setServiceDetails(prev => {
        const merged = {
          ...prev,
          ...currentSupplier.serviceDetails
        };
        console.log('🔀 Merged service details:', merged);
        return merged;
      });
    } else {
      console.log('❌ No existing service details found');
      
      // Try to load from supplierData as fallback
      if (supplierData?.serviceDetails) {
        console.log('🔄 Found service details in supplierData, loading...');
        setServiceDetails(prev => ({
          ...prev,
          ...supplierData.serviceDetails
        }));
      }
    }
  }, [currentSupplier, supplierData]);

  // Also check if data needs to be loaded when currentSupplier changes
  useEffect(() => {
    console.log('🔄 currentSupplier changed:', {
      hasCurrentSupplier: !!currentSupplier,
      hasServiceDetails: !!currentSupplier?.serviceDetails,
      serviceDetailsKeys: currentSupplier?.serviceDetails ? Object.keys(currentSupplier.serviceDetails) : 'none'
    });
  }, [currentSupplier]);

  // Helper function to update nested state
  const updateServiceDetail = (section, field, value) => {
    setServiceDetails(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Add item to array
  const addToArray = (section, field, item) => {
    if (!item.trim()) return;
    setServiceDetails(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section][field] || []), item.trim()]
      }
    }));
  };

  // Remove item from array
  const removeFromArray = (section, field, index) => {
    setServiceDetails(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    setLocalSaving(true);
    
    try {
      console.log('💾 Starting save process...');
      console.log('📦 serviceDetails to save:', serviceDetails);
      console.log('👤 Original supplierData:', supplierData);
      
      // Check if updateProfile function exists
      if (!updateProfile) {
        throw new Error('updateProfile function is not available');
      }

      // Create the updated supplier data with serviceDetails
      const updatedSupplierData = {
        businessName: supplierData.businessName || currentSupplier?.name,
        contactName: supplierData.contactName || currentSupplier?.owner?.name,
        email: supplierData.email || currentSupplier?.owner?.email,
        phone: supplierData.phone || currentSupplier?.owner?.phone,
        postcode: supplierData.postcode || currentSupplier?.location,
        businessDescription: supplierData.businessDescription || currentSupplier?.description,
        serviceType: supplierData.serviceType || currentSupplier?.serviceType,
        serviceDetails: serviceDetails // Make sure this is included
      };

      console.log('🚀 Calling updateProfile with updatedSupplierData:', updatedSupplierData);
      console.log('📦 Calling updateProfile with packages:', packages);
      
      const result = await updateProfile(updatedSupplierData, packages);
      
      console.log('📋 Full save result:', result);
      
      if (result && result.success) {
        console.log('✅ Service details saved successfully');
        console.log('💾 Updated supplier from result:', result.supplier);
        console.log('🔍 serviceDetails in result:', result.supplier?.serviceDetails);
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
        // Trigger supplier updated event
        window.dispatchEvent(new CustomEvent('supplierUpdated', { 
          detail: { supplierId: result.supplier?.id } 
        }));
      } else {
        console.error('❌ Save failed - result:', result);
        throw new Error(result?.error || 'Save returned success: false');
      }
    } catch (error) {
      console.error('❌ Save error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      alert(`Failed to save service details: ${error.message}`);
    } finally {
      setLocalSaving(false);
    }
  };

  // Add null checks for supplierData and fix serviceType detection
  const getServiceType = () => {
    // Check multiple possible sources for service type
    const type = supplierData?.serviceType || 
                 currentSupplier?.serviceType || 
                 supplierData?.category || 
                 currentSupplier?.category;
    
    // Normalize the service type
    if (!type) return "entertainer";
    
    const normalizedType = type.toLowerCase();
    
    // Map various category names to our internal types
    if (normalizedType.includes('venue') || normalizedType === 'venues') {
      return "venue";
    }
    
    if (normalizedType.includes('entertainment') || 
        normalizedType.includes('entertainer') ||
        normalizedType === 'entertainment') {
      return "entertainer";
    }
    
    // Default to entertainer for most categories
    return "entertainer";
  };

  const serviceType = getServiceType();

  // Debug logging - expanded to show more info
  console.log('🔍 Service Details Debug:', {
    supplierData: supplierData ? 'Available' : 'Missing',
    currentSupplier: currentSupplier ? 'Available' : 'Missing',
    rawServiceType: supplierData?.serviceType || currentSupplier?.serviceType,
    rawCategory: supplierData?.category || currentSupplier?.category,
    finalServiceType: serviceType,
    supplierDataKeys: supplierData ? Object.keys(supplierData) : 'N/A',
    currentSupplierKeys: currentSupplier ? Object.keys(currentSupplier) : 'N/A'
  });

  // More lenient loading check - only require that we have some data
  if (!supplierData && !currentSupplier) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Service details saved successfully! Your changes are now visible to customers.
          </AlertDescription>
        </Alert>
      )}

      {/* About Your Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About Your Service
          </CardTitle>
          <CardDescription>
            Tell customers what makes your service special and unique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="aboutService">Service Description</Label>
            <Textarea
              id="aboutService"
              value={serviceDetails.aboutService}
              onChange={(e) => setServiceDetails(prev => ({ ...prev, aboutService: e.target.value }))}
              placeholder={serviceType === "venue" ? 
                "Describe your venue in detail. What facilities do you offer? What makes your space special? What types of events work best here?" :
                "Describe your service in detail. What do you offer? What makes you different? What can customers expect?"
              }
              rows={5}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              This will be prominently displayed on your profile page
            </p>
          </div>

          <div>
            <Label htmlFor="serviceHighlights">Key Highlights</Label>
            <Textarea
              id="serviceHighlights"
              value={serviceDetails.serviceHighlights}
              onChange={(e) => setServiceDetails(prev => ({ ...prev, serviceHighlights: e.target.value }))}
              placeholder={serviceType === "venue" ? 
                "• Spacious main hall&#10;• Full kitchen facilities&#10;• Free parking&#10;• Wheelchair accessible" :
                "• Interactive science experiments&#10;• Every child gets a take-home item&#10;• Educational and fun&#10;• All equipment provided"
              }
              rows={4}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Use bullet points to highlight your key features
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Service Type Specific Section */}
      {serviceType === "venue" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Venue Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="venueType">Venue Type</Label>
                <Input 
                  id="venueType" 
                  value={serviceDetails.venueDetails.venueType}
                  onChange={(e) => updateServiceDetail('venueDetails', 'venueType', e.target.value)}
                  placeholder="e.g., Hall, Outdoor Space, Community Center" 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="capacity">Max Capacity</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  value={serviceDetails.venueDetails.capacity}
                  onChange={(e) => updateServiceDetail('venueDetails', 'capacity', e.target.value)}
                  placeholder="e.g., 100" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Facilities</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                {["Kitchen", "Parking", "Toilets", "Sound System", "Projector", "Garden", "Wi-Fi", "Stage"].map(
                  (facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`facility-${facility}`}
                        checked={serviceDetails.venueDetails.facilities.includes(facility)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addToArray('venueDetails', 'facilities', facility);
                          } else {
                            const index = serviceDetails.venueDetails.facilities.indexOf(facility);
                            if (index > -1) removeFromArray('venueDetails', 'facilities', index);
                          }
                        }}
                      />
                      <Label htmlFor={`facility-${facility}`} className="font-normal text-sm">
                        {facility}
                      </Label>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="accessibility">Accessibility Features</Label>
              <Textarea
                id="accessibility"
                value={serviceDetails.venueDetails.accessibility}
                onChange={(e) => updateServiceDetail('venueDetails', 'accessibility', e.target.value)}
                placeholder="e.g., Wheelchair accessible, step-free access, accessible toilets..."
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Entertainer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="actType">Act Type / Specialties</Label>
                <Input 
                  id="actType" 
                  value={serviceDetails.serviceIncludes.actType}
                  onChange={(e) => updateServiceDetail('serviceIncludes', 'actType', e.target.value)}
                  placeholder="e.g., Magician, Clown, Face Painter, DJ" 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="travelRadius">Travel Radius (miles)</Label>
                <Input 
                  id="travelRadius" 
                  type="number" 
                  value={serviceDetails.serviceIncludes.travelRadius}
                  onChange={(e) => updateServiceDetail('serviceIncludes', 'travelRadius', e.target.value)}
                  placeholder="e.g., 20" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="equipment">Equipment Provided</Label>
              <Input 
                id="equipment" 
                value={serviceDetails.serviceIncludes.equipment}
                onChange={(e) => updateServiceDetail('serviceIncludes', 'equipment', e.target.value)}
                placeholder="e.g., Sound system, lighting, props, costumes" 
              />
            </div>
            <div className="space-y-1">
              <Label>Performance Options</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                {["Indoor", "Outdoor", "Virtual Events", "Workshops", "Walkaround"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`option-${option}`}
                      checked={serviceDetails.serviceIncludes.performanceOptions.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addToArray('serviceIncludes', 'performanceOptions', option);
                        } else {
                          const index = serviceDetails.serviceIncludes.performanceOptions.indexOf(option);
                          if (index > -1) removeFromArray('serviceIncludes', 'performanceOptions', index);
                        }
                      }}
                    />
                    <Label htmlFor={`option-${option}`} className="font-normal text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duration & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Duration & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minHours">Minimum Duration (hours)</Label>
              <Input
                id="minHours"
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={serviceDetails.durationOptions.minHours}
                onChange={(e) => updateServiceDetail('durationOptions', 'minHours', parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxHours">Maximum Duration (hours)</Label>
              <Input
                id="maxHours"
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={serviceDetails.durationOptions.maxHours}
                onChange={(e) => updateServiceDetail('durationOptions', 'maxHours', parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Pricing Model</Label>
            <Select
              value={serviceDetails.pricingInfo.pricingModel}
              onValueChange={(value) => updateServiceDetail('pricingInfo', 'pricingModel', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per-hour">Per Hour</SelectItem>
                <SelectItem value="flat-rate">Flat Rate</SelectItem>
                <SelectItem value="per-person">Per Person</SelectItem>
                <SelectItem value="custom">Custom Pricing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priceDescription">How Pricing Works</Label>
            <Textarea
              id="priceDescription"
              value={serviceDetails.pricingInfo.priceDescription}
              onChange={(e) => updateServiceDetail('pricingInfo', 'priceDescription', e.target.value)}
              placeholder="Explain how your pricing works. What factors affect the price? Any additional costs?"
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="setupTime">Setup Time Needed (minutes)</Label>
            <Input
              id="setupTime"
              type="number"
              min="0"
              max="120"
              value={serviceDetails.serviceStandards.setupTime}
              onChange={(e) => updateServiceDetail('serviceStandards', 'setupTime', parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
          

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="equipmentProvided"
                checked={serviceDetails.serviceStandards.equipmentProvided}
                onCheckedChange={(checked) => updateServiceDetail('serviceStandards', 'equipmentProvided', checked)}
              />
              <Label htmlFor="equipmentProvided">I provide all equipment needed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cleanupIncluded"
                checked={serviceDetails.serviceStandards.cleanupIncluded}
                onCheckedChange={(checked) => updateServiceDetail('serviceStandards', 'cleanupIncluded', checked)}
              />
              <Label htmlFor="cleanupIncluded">Cleanup is included in my service</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="setupDescription">Setup & Service Description</Label>
            <Textarea
              id="setupDescription"
              value={serviceDetails.serviceStandards.setupDescription}
              onChange={(e) => updateServiceDetail('serviceStandards', 'setupDescription', e.target.value)}
              placeholder="Describe your setup process, what you bring, and how you work with the venue..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Details (Common for both) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {serviceType !== "venue" && (
            <div>
              <Label>Performer Gender</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Male', 'Female', 'Either'].map((gender) => (
                  <div key={gender} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gender-${gender}`}
                      checked={serviceDetails.serviceIncludes.performerGenders.includes(gender)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addToArray('serviceIncludes', 'performerGenders', gender);
                        } else {
                          const index = serviceDetails.serviceIncludes.performerGenders.indexOf(gender);
                          if (index > -1) removeFromArray('serviceIncludes', 'performerGenders', index);
                        }
                      }}
                    />
                    <Label htmlFor={`gender-${gender}`}>{gender}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Age Groups You Cater For</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {['0-2 years', '3-6 years', '7-12 years', '13+ years', 'Adults', 'All ages'].map((age) => (
                <div key={age} className="flex items-center space-x-2">
                  <Checkbox
                    id={`age-${age}`}
                    checked={serviceDetails.serviceIncludes.ageGroups.includes(age)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        addToArray('serviceIncludes', 'ageGroups', age);
                      } else {
                        const index = serviceDetails.serviceIncludes.ageGroups.indexOf(age);
                        if (index > -1) removeFromArray('serviceIncludes', 'ageGroups', index);
                      }
                    }}
                  />
                  <Label htmlFor={`age-${age}`} className="text-sm">{age}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                min="1"
                max="10"
                value={serviceDetails.serviceIncludes.teamSize}
                onChange={(e) => updateServiceDetail('serviceIncludes', 'teamSize', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="teamDescription">Team Description</Label>
              <Input
                id="teamDescription"
                value={serviceDetails.serviceIncludes.teamDescription}
                onChange={(e) => updateServiceDetail('serviceIncludes', 'teamDescription', e.target.value)}
                placeholder="e.g., Lead entertainer + assistant"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Service Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="spaceRequired">Space Required</Label>
            <Input
              id="spaceRequired"
              value={serviceDetails.requirements.spaceRequired}
              onChange={(e) => updateServiceDetail('requirements', 'spaceRequired', e.target.value)}
              placeholder="e.g., 3m x 3m clear space, indoor room"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="powerNeeded"
              checked={serviceDetails.requirements.powerNeeded}
              onCheckedChange={(checked) => updateServiceDetail('requirements', 'powerNeeded', checked)}
            />
            <Label htmlFor="powerNeeded">Power outlet required</Label>
          </div>

          <div>
            <Label>Venue Type</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Indoor', 'Outdoor', 'Either'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`venue-${type}`}
                    checked={serviceDetails.requirements.indoorOutdoor.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        addToArray('requirements', 'indoorOutdoor', type);
                      } else {
                        const index = serviceDetails.requirements.indoorOutdoor.indexOf(type);
                        if (index > -1) removeFromArray('requirements', 'indoorOutdoor', index);
                      }
                    }}
                  />
                  <Label htmlFor={`venue-${type}`}>{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              value={serviceDetails.requirements.specialRequirements}
              onChange={(e) => updateServiceDetail('requirements', 'specialRequirements', e.target.value)}
              placeholder="Any other requirements or important information for the venue..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Certifications & Insurance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dbsCertificate"
                checked={serviceDetails.certifications.dbsCertificate}
                onCheckedChange={(checked) => updateServiceDetail('certifications', 'dbsCertificate', checked)}
              />
              <Label htmlFor="dbsCertificate">DBS Certificate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="publicLiability"
                checked={serviceDetails.certifications.publicLiability}
                onCheckedChange={(checked) => updateServiceDetail('certifications', 'publicLiability', checked)}
              />
              <Label htmlFor="publicLiability">Public Liability Insurance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="firstAid"
                checked={serviceDetails.certifications.firstAid}
                onCheckedChange={(checked) => updateServiceDetail('certifications', 'firstAid', checked)}
              />
              <Label htmlFor="firstAid">First Aid Certified</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meet You - Personal Bio
          </CardTitle>
          <CardDescription>
            Help customers get to know the person behind the service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input
              id="yearsExperience"
              type="number"
              min="0"
              max="50"
              value={serviceDetails.personalBio.yearsExperience}
              onChange={(e) => updateServiceDetail('personalBio', 'yearsExperience', parseInt(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="inspiration">What Inspired You?</Label>
            <Input
              id="inspiration"
              value={serviceDetails.personalBio.inspiration}
              onChange={(e) => updateServiceDetail('personalBio', 'inspiration', e.target.value)}
              placeholder="e.g., My grandmother who was a trapeze artist"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="favoriteEvent">Favorite Event You've Done</Label>
            <Input
              id="favoriteEvent"
              value={serviceDetails.personalBio.favoriteEvent}
              onChange={(e) => updateServiceDetail('personalBio', 'favoriteEvent', e.target.value)}
              placeholder="e.g., I performed at the London Olympics in 2012"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dreamCelebrity">Dream Celebrity to Work With</Label>
            <Input
              id="dreamCelebrity"
              value={serviceDetails.personalBio.dreamCelebrity}
              onChange={(e) => updateServiceDetail('personalBio', 'dreamCelebrity', e.target.value)}
              placeholder="e.g., Brian Blessed - I'm a big fan"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="personalStory">Your Story</Label>
            <Textarea
              id="personalStory"
              value={serviceDetails.personalBio.personalStory}
              onChange={(e) => updateServiceDetail('personalBio', 'personalStory', e.target.value)}
              placeholder="Tell customers about your journey, what you love about your work, and what makes you passionate about entertaining..."
              rows={4}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={localSaving || saving}
          size="lg"
        >
          {(localSaving || saving) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Service Details
            </>
          )}
        </Button>
      </div>
    </div>
  );
};



const PortfolioGalleryTabContent = ({ 
  currentSupplier, 
  supplierData, 
  updateProfile, 
  packages, 
  saving 
}) => {
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioVideos, setPortfolioVideos] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverPhotoInputRef = useRef(null);
  const[localSaving, setLocalSaving] = useState(false);
  const [localSaveSuccess, setLocalSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Debug what variables are actually available in this scope
  useEffect(() => {
    console.log('🔍 Props received:', {
      currentSupplier: currentSupplier ? 'Available' : 'Missing',
      supplierData: supplierData ? 'Available' : 'Missing', 
      updateProfile: updateProfile ? 'Available' : 'Missing',
      saving: typeof saving !== 'undefined' ? 'Available' : 'Missing',
      packages: packages ? 'Available' : 'Missing'
    });
    
    // Load portfolio data if currentSupplier is available
    if (currentSupplier) {
      console.log('✅ currentSupplier found:', currentSupplier);
      setPortfolioImages(currentSupplier.portfolioImages || []);
      setPortfolioVideos(currentSupplier.portfolioVideos || []);
      setCoverPhoto(currentSupplier.coverPhoto || currentSupplier.image || null);
    }
  }, [currentSupplier, supplierData, updateProfile, packages, saving]);

  // Watch for changes to currentSupplier
  useEffect(() => {
    if (currentSupplier) {
      console.log('📸 Loading portfolio data from currentSupplier');
      setPortfolioImages(currentSupplier.portfolioImages || []);
      setPortfolioVideos(currentSupplier.portfolioVideos || []);
      setCoverPhoto(currentSupplier.coverPhoto || currentSupplier.image || null);
    }
  }, [currentSupplier]);

 // Cover photo upload handler
const handleCoverPhotoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log('📷 Uploading cover photo to Cloudinary...');
  setUploadingCover(true);

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'portfolio_images');
    
    const response = await fetch('https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }
    
    const cloudinaryData = await response.json();
    console.log('✅ Cover photo upload successful:', cloudinaryData.secure_url);
    
    setCoverPhoto(cloudinaryData.secure_url);
    
  } catch (error) {
    console.error('❌ Cover photo upload failed:', error);
    alert(`Failed to upload cover photo: ${error.message}`);
  } finally {
    setUploadingCover(false);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  }
};

  // Save portfolio to backend
  const handleSaveGallery = async (galleryData) => {
    setLocalSaving(true);
    
    try {
      console.log('💾 Saving portfolio:', galleryData);
      
      // Check if required functions are available
      if (!updateProfile) {
        throw new Error('updateProfile function not available');
      }
      
      if (!supplierData) {
        throw new Error('supplierData not available');
      }
      
      // Update the supplier with portfolio data
      const updatedSupplierData = {
        ...supplierData,
        portfolioImages: galleryData.images,
        portfolioVideos: galleryData.videoLinks,
        coverPhoto: galleryData.coverPhoto // Get cover photo from galleryData
      };

      console.log('💾 Updated supplier data:', updatedSupplierData);

      const result = await updateProfile(updatedSupplierData, packages);
      
      if (result.success) {
        console.log('✅ Portfolio saved successfully');
        setPortfolioImages(galleryData.images);
        setPortfolioVideos(galleryData.videoLinks);
        
        // Trigger supplier updated event
        window.dispatchEvent(new CustomEvent('supplierUpdated', { 
          detail: { supplierId: result.supplier.id } 
        }));
        
        setLocalSaveSuccess(true);
        setTimeout(() => setLocalSaveSuccess(false), 3000);
        
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to save portfolio:', error);
      alert(`Failed to save portfolio: ${error.message}`);
      throw error;
    } finally {
      setLocalSaving(false);
    }
  };

  // Image upload handler - Upload to Cloudinary
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    console.log('📤 Uploading files to Cloudinary:', files.length);
    setUploadingImage(true);

    try {
      for (const file of files) {
        // Create FormData for Cloudinary upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'portfolio_images'); // You'll need to create this preset
        
        console.log('📤 Uploading to Cloudinary...');
        
        // Upload to Cloudinary
        const response = await fetch('https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Cloudinary upload failed: ${response.statusText}`);
        }
        
        const cloudinaryData = await response.json();
        console.log('✅ Cloudinary upload successful:', cloudinaryData.secure_url);
        
        const newImage = {
          id: Date.now() + Math.random(),
          src: cloudinaryData.secure_url, // Use Cloudinary URL
          alt: `Portfolio image ${portfolioImages.length + 1}`,
          title: file.name.split('.')[0].replace(/[_-]/g, ' '),
          description: "",
          originalFileName: file.name,
          fileSize: file.size,
          cloudinaryId: cloudinaryData.public_id // Store for potential deletion
        };

        console.log('📤 Adding new image with Cloudinary URL');
        setPortfolioImages(prev => {
          const updated = [...prev, newImage];
          console.log('📤 Updated portfolio images:', updated.length, 'total');
          return updated;
        });
      }
      
      console.log('✅ Upload completed');
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Delete image handler
  const handleDeleteImage = (imageId) => {
    console.log('🗑️ Deleting image:', imageId);
    if (confirm('Are you sure you want to delete this image?')) {
      setPortfolioImages(prev => {
        const updated = prev.filter(img => img.id !== imageId);
        console.log('🗑️ Updated portfolio after deletion:', updated);
        return updated;
      });
    }
  };

  // Update image details handler
  const handleUpdateImage = (imageId, updates) => {
    console.log('✏️ Updating image:', imageId, updates);
    setPortfolioImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ));
    setEditingImage(null);
  };

  // Add video link handler
  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;

    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/;
    if (!videoUrlPattern.test(newVideoUrl)) {
      alert('Please enter a valid YouTube or Vimeo URL');
      return;
    }

    const newVideo = {
      id: Date.now(),
      url: newVideoUrl,
      title: `Video ${portfolioVideos.length + 1}`
    };

    setPortfolioVideos(prev => [...prev, newVideo]);
    setNewVideoUrl("");
  };

  // Delete video handler
  const handleDeleteVideo = (videoId) => {
    setPortfolioVideos(prev => prev.filter(video => video.id !== videoId));
  };

  // Update video handler
  const handleUpdateVideo = (videoId, updates) => {
    setPortfolioVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, ...updates } : video
    ));
  };

  return (
    <div className="space-y-8">
      {/* Success Alert */}
      {localSaveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Portfolio updated successfully! Your changes are now visible to customers.
          </AlertDescription>
        </Alert>
      )}

      {/* Cover Photo Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Cover Photo</CardTitle>
          <CardDescription>
            Upload a main cover photo for your profile. This will be the primary image customers see.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Current Cover Photo */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {coverPhoto ? (
                  <>
                    <img
                      src={coverPhoto}
                      alt="Cover photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => setCoverPhoto(null)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                        title="Remove cover photo"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Camera className="h-8 w-8 mb-2" />
                    <span className="text-sm">No cover photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="cover-photo-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                      uploadingCover ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingCover ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        {coverPhoto ? 'Change Cover Photo' : 'Upload Cover Photo'}
                      </>
                    )}
                  </label>
                  <input
                    id="cover-photo-upload"
                    ref={coverPhotoInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverPhotoUpload}
                    disabled={uploadingCover}
                  />
                </div>
                
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-1">Cover Photo Guidelines:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Recommended size: 1200x800px or larger</li>
                    <li>• Shows your business in the best light</li>
                    <li>• High quality, well-lit photos work best</li>
                    <li>• This will be the main image on your profile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {localSaveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Portfolio updated successfully! Your changes are now visible to customers.
          </AlertDescription>
        </Alert>
      )}

      {/* Photo Gallery Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <CardTitle>Photo Gallery</CardTitle>
              <CardDescription>
                Upload high-quality photos of your services. The first image will be your main cover photo.
                These images will be displayed on your public profile.
              </CardDescription>
            </div>
            <Button 
              onClick={() => handleSaveGallery({ 
                images: portfolioImages, 
                videoLinks: portfolioVideos,
                coverPhoto: coverPhoto 
              })}
              disabled={localSaving}
              className="w-full sm:w-auto"
            >
              {localSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Portfolio ({portfolioImages.length} images)
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {portfolioImages.map((img, index) => (
              <div key={img.id} className="relative group">
                {/* Image Container */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Control Buttons */}
                <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('✏️ Edit clicked for:', img.id);
                      setEditingImage(img);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs"
                    title="Edit image details"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🗑️ Delete clicked for:', img.id);
                      handleDeleteImage(img.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                    title="Delete image"
                  >
                    🗑️
                  </button>
                </div>

                {/* Image Info */}
                <div className="absolute bottom-2 left-2 right-2 z-10">
                  <div className="bg-black bg-opacity-70 text-white text-xs rounded px-2 py-1">
                    {index === 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-medium">Cover Photo</span>
                      </div>
                    )}
                    <div className="truncate">{img.title || `Image ${index + 1}`}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Photo Button */}
            <div className="aspect-square">
              <label
                htmlFor="photo-upload"
                className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg w-full h-full cursor-pointer hover:border-blue-500 transition-colors ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photo</span>
                  </>
                )}
                <input 
                  id="photo-upload" 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* Empty State */}
          {portfolioImages.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <ImagePlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-500 mb-4">Upload photos to showcase your services to potential customers</p>
              <label htmlFor="photo-upload-empty" className="cursor-pointer">
                <Button asChild>
                  <span>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Upload Your First Photo
                  </span>
                </Button>
                <input 
                  id="photo-upload-empty"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          )}

          {/* Tips */}
          <div className="text-sm text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Camera className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 mb-1">Photo Tips:</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Upload high-quality images (1200x800px or larger)</li>
                  <li>• First image becomes your cover photo</li>
                  <li>• Show your services in action with happy customers</li>
                  <li>• Include setup photos, action shots, and results</li>
                  <li>• Avoid blurry or poorly lit images</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Links Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Video Links</CardTitle>
          <CardDescription>
            Add links to YouTube or Vimeo videos showcasing your services in action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioVideos.map((video) => (
              <div key={video.id} className="flex items-center gap-2 p-3 border rounded-lg">
                <Video className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Input 
                    defaultValue={video.url} 
                    placeholder="https://youtube.com/..." 
                    className="mb-2"
                    onBlur={(e) => handleUpdateVideo(video.id, { url: e.target.value })}
                  />
                  <Input 
                    defaultValue={video.title} 
                    placeholder="Video title..." 
                    className="text-sm"
                    onBlur={(e) => handleUpdateVideo(video.id, { title: e.target.value })}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteVideo(video.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <div className="flex-1">
                <Input 
                  placeholder="Add video link (YouTube or Vimeo)" 
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
                />
              </div>
              <Button 
                variant="outline"
                onClick={handleAddVideo}
                disabled={!newVideoUrl.trim()}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Add Video
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Image Details</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-title">Title</Label>
                <Input
                  id="image-title"
                  defaultValue={editingImage.title}
                  placeholder="Image title..."
                  onChange={(e) => setEditingImage(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="image-description">Description</Label>
                <Textarea
                  id="image-description"
                  defaultValue={editingImage.description}
                  placeholder="Describe what's shown in this image..."
                  rows={3}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setEditingImage(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleUpdateImage(editingImage.id, {
                  title: editingImage.title,
                  description: editingImage.description
                })}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const AvailabilityTabContent = ({ 
  currentSupplier, 
  onSave, 
  saving = false 
}) => {
  // Working hours state
  const [workingHours, setWorkingHours] = useState({
    Monday: { active: true, start: "09:00", end: "17:00" },
    Tuesday: { active: true, start: "09:00", end: "17:00" },
    Wednesday: { active: true, start: "09:00", end: "17:00" },
    Thursday: { active: true, start: "09:00", end: "17:00" },
    Friday: { active: true, start: "09:00", end: "17:00" },
    Saturday: { active: true, start: "10:00", end: "16:00" },
    Sunday: { active: false, start: "10:00", end: "16:00" },
  });

  // Availability state
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [busyDates, setBusyDates] = useState([]); // Dates with existing bookings
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [advanceBookingDays, setAdvanceBookingDays] = useState(7);
  const [maxBookingDays, setMaxBookingDays] = useState(365);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick action templates
  const [quickActions] = useState([
    { name: "Next 7 Days", action: () => markUnavailableRange(7) },
    { name: "Next 2 Weeks", action: () => markUnavailableRange(14) },
    { name: "This Weekend", action: () => markWeekendUnavailable() },
    { name: "Clear All", action: () => setUnavailableDates([]) }
  ]);

  // Load data from currentSupplier
  useEffect(() => {
    if (currentSupplier) {
      setWorkingHours(currentSupplier.workingHours || workingHours);
      setUnavailableDates(currentSupplier.unavailableDates?.map(date => new Date(date)) || []);
      setBusyDates(currentSupplier.busyDates?.map(date => new Date(date)) || []);
      setAvailabilityNotes(currentSupplier.availabilityNotes || "");
      setAdvanceBookingDays(currentSupplier.advanceBookingDays || 7);
      setMaxBookingDays(currentSupplier.maxBookingDays || 365);
    }
  }, [currentSupplier]);

  // Handle working hours changes
  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // Handle date selection for unavailable dates
  const handleDateSelect = (date) => {
    if (!date) return;
    const normalizedDate = startOfDay(date);
    
    // Don't allow selecting past dates
    if (isBefore(normalizedDate, startOfDay(new Date()))) {
      return;
    }
    
    setUnavailableDates(prev => {
      const isAlreadyUnavailable = prev.some(d => isDateEqual(d, normalizedDate));
      if (isAlreadyUnavailable) {
        return prev.filter(d => !isDateEqual(d, normalizedDate));
      } else {
        return [...prev, normalizedDate];
      }
    });
  };

  // Quick actions
  const markUnavailableRange = (days) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      dates.push(addDays(startOfDay(new Date()), i));
    }
    setUnavailableDates(prev => {
      const combined = [...prev, ...dates];
      // Remove duplicates
      return combined.filter((date, index, self) => 
        index === self.findIndex(d => isDateEqual(d, date))
      );
    });
  };

  const markWeekendUnavailable = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        dates.push(startOfDay(date));
      }
    }
    setUnavailableDates(prev => {
      const combined = [...prev, ...dates];
      return combined.filter((date, index, self) => 
        index === self.findIndex(d => isDateEqual(d, date))
      );
    });
  };

  // Apply template schedules
  const applyTemplate = (template) => {
    switch (template) {
      case "business":
        setWorkingHours({
          Monday: { active: true, start: "09:00", end: "17:00" },
          Tuesday: { active: true, start: "09:00", end: "17:00" },
          Wednesday: { active: true, start: "09:00", end: "17:00" },
          Thursday: { active: true, start: "09:00", end: "17:00" },
          Friday: { active: true, start: "09:00", end: "17:00" },
          Saturday: { active: false, start: "09:00", end: "17:00" },
          Sunday: { active: false, start: "09:00", end: "17:00" },
        });
        break;
      case "weekend":
        setWorkingHours({
          Monday: { active: false, start: "09:00", end: "17:00" },
          Tuesday: { active: false, start: "09:00", end: "17:00" },
          Wednesday: { active: false, start: "09:00", end: "17:00" },
          Thursday: { active: false, start: "09:00", end: "17:00" },
          Friday: { active: false, start: "09:00", end: "17:00" },
          Saturday: { active: true, start: "10:00", end: "18:00" },
          Sunday: { active: true, start: "10:00", end: "18:00" },
        });
        break;
      case "flexible":
        setWorkingHours({
          Monday: { active: true, start: "08:00", end: "20:00" },
          Tuesday: { active: true, start: "08:00", end: "20:00" },
          Wednesday: { active: true, start: "08:00", end: "20:00" },
          Thursday: { active: true, start: "08:00", end: "20:00" },
          Friday: { active: true, start: "08:00", end: "20:00" },
          Saturday: { active: true, start: "08:00", end: "20:00" },
          Sunday: { active: true, start: "10:00", end: "18:00" },
        });
        break;
    }
  };

  // Save availability settings
  const handleSave = async () => {
    try {
      const availabilityData = {
        workingHours,
        unavailableDates: unavailableDates.map(date => date.toISOString()),
        busyDates: busyDates.map(date => date.toISOString()),
        availabilityNotes,
        advanceBookingDays,
        maxBookingDays
      };
      
      await onSave(availabilityData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save availability:", error);
    }
  };

  // Calendar modifiers
  const modifiers = {
    unavailable: unavailableDates,
    busy: busyDates,
    past: (date) => isBefore(date, startOfDay(new Date()))
  };

  const modifiersStyles = {
    unavailable: {
      backgroundColor: "#ef4444",
      color: "white",
    },
    busy: {
      backgroundColor: "#f59e0b", 
      color: "white",
    },
    past: {
      color: "#9ca3af",
      textDecoration: "line-through"
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Availability settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Header with Save Button */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Availability Settings</h2>
          <p className="text-gray-600">Manage when customers can book your services</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Working Hours */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Weekly Working Hours
            </CardTitle>
            <CardDescription>
              Set your standard availability for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick Templates */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => applyTemplate("business")}
                >
                  Business Hours
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => applyTemplate("weekend")}
                >
                  Weekends Only
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => applyTemplate("flexible")}
                >
                  Flexible Hours
                </Button>
              </div>
            </div>

            {/* Days Schedule */}
            <div className="space-y-3">
              {Object.entries(workingHours).map(([day, hours]) => (
                <div
                  key={day}
                  className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`day-${day}`}
                      checked={hours.active}
                      onCheckedChange={(checked) => 
                        handleWorkingHoursChange(day, 'active', !!checked)
                      }
                    />
                    <Label htmlFor={`day-${day}`} className="font-semibold w-20 text-sm">
                      {day}
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">Start</Label>
                      <Input
                        type="time"
                        value={hours.start}
                        onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                        disabled={!hours.active}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">End</Label>
                      <Input
                        type="time"
                        value={hours.end}
                        onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                        disabled={!hours.active}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Rules</CardTitle>
            <CardDescription>Control how far in advance customers can book</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="advance-booking">Minimum advance booking (days)</Label>
              <Input
                id="advance-booking"
                type="number"
                min="0"
                max="30"
                value={advanceBookingDays}
                onChange={(e) => setAdvanceBookingDays(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Customers must book at least this many days in advance
              </p>
            </div>

            <div>
              <Label htmlFor="max-booking">Maximum advance booking (days)</Label>
              <Input
                id="max-booking"
                type="number"
                min="1"
                max="730"
                value={maxBookingDays}
                onChange={(e) => setMaxBookingDays(parseInt(e.target.value) || 365)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                How far ahead customers can book
              </p>
            </div>

            <div>
              <Label htmlFor="availability-notes">Availability Notes</Label>
              <textarea
                id="availability-notes"
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                placeholder="Add any special notes about your availability..."
                className="w-full mt-1 p-2 border rounded-md text-sm h-20 resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Manage Specific Dates
            </CardTitle>
            <CardDescription>
              Click dates to mark as unavailable. Past dates cannot be modified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick Actions */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Quick Actions</Label>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={action.action}
                  >
                    {action.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="flex justify-center">
              <Calendar
                mode="multiple"
                selected={unavailableDates}
                onSelect={setUnavailableDates}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
                disabled={(date) => isBefore(date, startOfDay(new Date()))}
              />
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Busy/Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Past dates</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unavailable Dates List */}
        <Card>
          <CardHeader>
            <CardTitle>Unavailable Dates</CardTitle>
            <CardDescription>
              {unavailableDates.length} dates marked as unavailable
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unavailableDates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No unavailable dates set
              </p>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {unavailableDates
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((date, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <span>{formatDate(date)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => 
                            setUnavailableDates(prev => 
                              prev.filter(d => !isDateEqual(d, date))
                            )
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const VerificationDocumentsTabContent = () => {
  const [documents, setDocuments] = useState({
    dbs: { name: "dbs_certificate.pdf", status: "approved", required: true },
    insurance: { name: null, status: "missing", required: true },
    license: { name: "business_license.pdf", status: "pending", required: false },
    id: { name: "photo_id.jpg", status: "approved", required: true },
  })

  const statusConfig = {
    approved: { icon: CheckCircle, color: "text-green-600", text: "Approved" },
    pending: { icon: Clock, color: "text-yellow-600", text: "Pending Review" },
    missing: { icon: XCircle, color: "text-red-600", text: "Missing" },
    rejected: { icon: AlertCircle, color: "text-red-700", text: "Rejected" },
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Verification Documents</CardTitle>
        <CardDescription>
          Upload required documents to get verified and build trust with customers. Verified suppliers often get more
          bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { id: "dbs", title: "DBS Certificate" },
          { id: "insurance", title: "Public Liability Insurance" },
          { id: "license", title: "Business License / Certification" },
          { id: "id", title: "Photo ID (Passport/Driving License)" },
        ].map((docType) => {
          const doc = documents[docType.id]
          const currentStatus = statusConfig[doc.status]
          return (
            <div
              key={docType.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  {docType.title} {doc.required && <span className="text-red-500 text-xs ml-1">(Required)</span>}
                </h4>
                <div className={`flex items-center gap-2 text-sm mt-1 ${currentStatus.color}`}>
                  <currentStatus.icon className="h-5 w-5" />
                  <span>{currentStatus.text}</span>
                </div>
                {doc.name && <p className="text-xs text-muted-foreground mt-1 truncate">File: {doc.name}</p>}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" /> {doc.name ? "Replace File" : "Upload File"}
                </Button>
                {doc.name && (
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function SupplierProfilePage() {
  // const [supplierData, setSupplierData] = useState(initialSupplierData)
  const [packages, setPackages] = useState(initialPackages) // Uses updated initialPackages
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [activeTab, setActiveTab] = useState("general")
  // const {saving, error, saveProfile } = useSupplierProfile()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")

   // Local state for form data
   const [supplierData, setSupplierData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    postcode: "",
    businessDescription: "",
    serviceType: "entertainer",
  })

  const { currentSupplier, loading, saving, error, updateProfile } = useSupplierDashboard()

  // Load supplier data when currentSupplier is available
  useEffect(() => {
    if (currentSupplier) {
      setSupplierData({
        businessName: currentSupplier.name || "",
        contactName: currentSupplier.owner?.name || "",
        email: currentSupplier.owner?.email || "",
        phone: currentSupplier.owner?.phone || "",
        postcode: currentSupplier.location || "",
        businessDescription: currentSupplier.description || "",
        serviceType: currentSupplier.serviceType || "entertainer",
      })
      setPackages(currentSupplier.packages || [])
    }
  }, [currentSupplier])
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSupplierData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveAvailability = async (availabilityData) => {
    try {
      const updatedSupplierData = {
        ...supplierData,
        ...availabilityData // This includes workingHours, unavailableDates, etc.
      };
  
      const result = await updateProfile(updatedSupplierData, packages);
      
      if (result.success) {
        console.log('✅ Availability saved successfully');
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to save availability:', error);
      throw error;
    }
  };

  const handleSaveChanges = async () => {
    setSaveSuccess(false)
    setSaveError("")

    // Validate required fields
    if (!supplierData.businessName || !supplierData.contactName || !supplierData.email) {
      setSaveError('Please fill in all required fields (Business Name, Contact Person, Email)')
      return
    }

    try {
      const result = await updateProfile(supplierData, packages)
      
      if (result.success) {

        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 5000)
        window.dispatchEvent(new CustomEvent('supplierUpdated', { 
          detail: { supplierId: result.supplier.id } 
        }));
        
        console.log('✅ SAVED RESULT:', result.supplier);
        console.log('✅ SAVED PACKAGES:', result.supplier.packages);
        console.log('🎉 Profile updated! Check your marketplace to see the changes.')
      } else {
        setSaveError(result.error || "Failed to save profile")
      }
    } catch (error) {
      setSaveError("An unexpected error occurred")
      console.error("Save error:", error)
    }
  }


  const handleOpenPackageForm = (pkg) => {
    setEditingPackage(pkg) // pkg can be null for new, or an object for editing
    setIsPackageFormOpen(true)
  }

  const handleClosePackageForm = () => {
    setIsPackageFormOpen(false)
    setEditingPackage(null) // Clear editing package on close
  }

  const handleSavePackage = (newPackageData) => {
    setPackages((prevPackages) => {
      if (editingPackage && editingPackage.id) {
        // Check if editingPackage and its id exist
        // Editing existing package
        return prevPackages.map((p) => (p.id === editingPackage.id ? { ...p, ...newPackageData } : p))
      } else {
        // Adding new package
        return [...prevPackages, { ...newPackageData, id: `pkg${Date.now()}` }]
      }
    })
    // No need to call handleClosePackageForm here, it's called in the form itself
  }

  const handleDeletePackage = (packageId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      setPackages((prevPackages) => prevPackages.filter((p) => p.id !== packageId))
    }
  }


  const tabItems = [
    { value: "general", label: "General", icon: Briefcase },
    { value: "service-details", label: "Service Details", icon: Palette },
    { value: "packages", label: "Packages", icon: PackageIcon },
    { value: "portfolio", label: "Portfolio", icon: Building },
    { value: "availability", label: "Availability", icon: CalendarDays },
    { value: "verification", label: "Verification", icon: ShieldCheck },
  ]

   // Show loading state while fetching supplier data
   if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Show error if no supplier found
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2">Unable to Load Profile</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const isNewSupplier = currentSupplier && !currentSupplier.isComplete

  return (
    <div className="space-y-6">
       {/* Header with status */}
       <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {isNewSupplier ? "Complete Your Profile" : "Manage Your Profile"}
            </h1>
            {currentSupplier && (
              <Badge variant={currentSupplier.isComplete ? "default" : "secondary"} className="text-xs">
                {currentSupplier.isComplete ? "Live" : "Draft"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isNewSupplier 
              ? "Welcome! Complete your profile to go live on the marketplace and start receiving bookings."
              : "Keep your public information and service details up to date."
            }
          </p>
          
          {/* Welcome message for new suppliers */}
          {isNewSupplier && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Welcome to BookABash!</strong> Your account has been created. 
                Add some details and service packages below, then click "Save Changes" to go live on the marketplace.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Success/Error alerts */}
          {saveSuccess && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                🎉 Profile updated successfully! Your changes are now live on the marketplace.
                {currentSupplier?.isComplete && (
                  <span className="block mt-2">
                    Your profile is complete and customers can now find and book you.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {saveError && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {saveError}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex gap-2">
          {currentSupplier?.isComplete && (
            <Button 
              variant="outline" 
              onClick={() => alert(`Your public profile: /suppliers/${currentSupplier.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" /> Preview Profile
            </Button>
          )}
          <Button 
            onClick={handleSaveChanges} 
            size="lg" 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                {isNewSupplier ? "Save & Go Live" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile Select for Tabs */}
        <div className="md:hidden mb-4">
          <Label htmlFor="mobile-tabs-select" className="sr-only">
            Select Profile Section
          </Label>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger id="mobile-tabs-select" className="w-full">
              <div className="flex items-center">
                {/* Optionally show current tab icon in trigger */}
                {/* {tabItems.find(tab => tab.value === activeTab)?.icon({ className: "w-4 h-4 mr-2 text-muted-foreground"})} */}
                <SelectValue placeholder="Select a section..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {tabItems.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  <div className="flex items-center">
                    <tab.icon className="w-4 h-4 mr-2 text-muted-foreground ml-5" />
                    {tab.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop TabsList */}
        <TabsList className="hidden md:grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 gap-1 p-1 h-auto bg-muted rounded-lg">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-col sm:flex-row h-auto py-2 data-[state=active]:bg-white text-gray-500 data-[state=active]:shadow-sm"
            >
              <tab.icon className="w-4 h-4 mr-0 mb-1 sm:mr-2 sm:mb-0" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TabsContent sections remain the same */}
        <TabsContent value="general">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about your business. This information will be public.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={supplierData.businessName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactName">Contact Person</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={supplierData.contactName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" value={supplierData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={supplierData.phone} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="postcode">Operating Postcode (for location search)</Label>
                <Input id="postcode" name="postcode" value={supplierData.postcode} onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="businessDescription">Business Description (tell customers about you)</Label>
                <Textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={supplierData.businessDescription}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Describe your services, experience, and what makes you unique..."
                />
              </div>
              <div className="text-sm text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  To change your primary service type (e.g., from Entertainer to Venue), please contact support. This
                  helps us categorize your services correctly.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-details">
          {supplierData.serviceType === "venue" ? <VenueDetailsForm /> : <EntertainerDetailsForm />}
        </TabsContent>

        <TabsContent value="service-details">
        <EnhancedServiceDetailsTabContent 
  currentSupplier={currentSupplier}
  supplierData={supplierData}
  updateProfile={updateProfile}  // ← Missing - needed to save!
  packages={packages}            // ← Missing - needed for save function
  saving={saving}               // ← Missing - shows loading state
/>
        </TabsContent>

        <TabsContent value="packages">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <CardTitle>Service Packages</CardTitle>
                <CardDescription>Define and manage the packages you offer to customers.</CardDescription>
              </div>
              <Button onClick={() => handleOpenPackageForm(null)} className="mt-2 sm:mt-0">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
              </Button>
            </CardHeader>
            <CardContent>
              {packages.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">No packages yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by adding your first service package.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => handleOpenPackageForm(null)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <SupplierPackageCard
                      key={pkg.id}
                      packageData={pkg}
                      onEdit={() => handleOpenPackageForm(pkg)}
                      onDelete={() => handleDeletePackage(pkg.id)}
                    />
                  ))}
                  <AddPackageCard onAdd={() => handleOpenPackageForm(null)} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
  <PortfolioGalleryTabContent 
    currentSupplier={currentSupplier}
    supplierData={supplierData}
    updateProfile={updateProfile}
    packages={packages}
    saving={saving}
  />
</TabsContent>
<TabsContent value="availability">
  <AvailabilityTabContent
    currentSupplier={currentSupplier}
    onSave={handleSaveAvailability}
    saving={saving}
  />
</TabsContent>
        <TabsContent value="verification">
          <VerificationDocumentsTabContent />
        </TabsContent>
      </Tabs>

      <SupplierPackageForm
        isOpen={isPackageFormOpen}
        onClose={handleClosePackageForm}
        onSave={handleSavePackage}
        initialData={editingPackage}
      />
    </div>
  )
}
