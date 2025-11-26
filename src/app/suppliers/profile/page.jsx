"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { useSupplierDashboard } from "@/utils/mockBackend"
import ServiceSpecificDetails from "./components/EntertainerServiceDetails"
import ServiceDetailsRouter from "../ServiceDetailsRouter"

// Dynamic imports for photos, packages, and verification
const MediaPageContent = dynamic(
  () => import("@/app/suppliers/media/page"),
  { ssr: false, loading: () => <div className="p-6 text-gray-500">Loading photos...</div> }
)

const PackagesPageContent = dynamic(
  () => import("@/app/suppliers/packages/page"),
  { ssr: false, loading: () => <div className="p-6 text-gray-500">Loading packages...</div> }
)

const VerificationPageContent = dynamic(
  () => import("@/app/suppliers/verification/page"),
  { ssr: false, loading: () => <div className="p-6 text-gray-500">Loading verification...</div> }
)
import {
  AlertCircle,
  Eye,
  UploadCloud,
  Trash2,
  Check,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  Loader2,
  Badge,
  Info,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MapPin,
  DollarSign,
  Users,
  Ban,
  Settings,
  Building2,
  FileText,
  Camera,
  Package,
  Shield,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GlobalSaveButton } from "@/components/GlobalSaveButton"
import { useSupplier } from "@/hooks/useSupplier"
import { ProfilePageSkeleton } from './components/ProfileSkeletons'



// Default packages for new suppliers
const initialPackages = []

const CoverPhotoContent = ({ currentSupplier, supplierData, supplier, packages, updateProfile, saving }) => {
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverPhotoInputRef = useRef(null);
  const [localSaving, setLocalSaving] = useState(false);
  const [localSaveSuccess, setLocalSaveSuccess] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false)
  

  useEffect(() => {
    // Handle direct links with fragments AND cross-page navigation
    const handleScroll = () => {
      // Check URL hash first
      let elementId = null;
      
      if (window.location.hash) {
        elementId = window.location.hash.substring(1);
        // Clear the hash to prevent browser's default scroll behavior
        window.history.replaceState(null, null, window.location.pathname);
      }
      
      // Check sessionStorage for cross-page navigation
      if (!elementId) {
        elementId = sessionStorage.getItem('scrollToElement');
        if (elementId) {
          sessionStorage.removeItem('scrollToElement');
        }
      }
      
      if (elementId) {
        // Wait for page to render, then scroll
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the field briefly to draw attention
            element.style.transition = 'box-shadow 0.3s ease';
            element.style.boxShadow = '0 0 10px 3px rgba(59, 130, 246, 0.5)';
            
            // Focus if it's an input/textarea
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
              element.focus();
            }
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
              element.style.boxShadow = '';
            }, 2000);
          }
        }, 300); // Increased delay to ensure form is fully rendered
      }
    };
    
    handleScroll();
  }, []); // Run once when component mounts


  // ✅ Update cover photo when supplier data changes (business switching)
  useEffect(() => {
    if (supplierData) {
      const newCoverPhoto = supplierData.coverPhoto || supplierData.image || null;
      console.log('📸 Loading cover photo from supplierData for business:', supplierData.name);
      setCoverPhoto(newCoverPhoto);
    }
  }, [supplierData?.coverPhoto, supplierData?.image, supplierData?.name]);

 // 4. Add error handling to the upload function
const handleCoverPhotoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (e.g., max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size too large. Please choose an image under 5MB.');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }

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
    
    // Update state
    setCoverPhoto(cloudinaryData.secure_url);

    // Save just the cover photo directly
    await handleSaveGallery({ coverPhoto: cloudinaryData.secure_url });
    
  } catch (error) {
    console.error('❌ Cover photo upload failed:', error);
    alert(`Failed to upload cover photo: ${error.message}`);
    
    // Reset file input
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  } finally {
    setUploadingCover(false);
  }
};

// 3. Fix the handleSaveGallery function to ensure packages are passed
const handleSaveGallery = async (galleryData) => {
  setLocalSaving(true);
  
  try {
    console.log('💾 Saving cover photo:', galleryData);
    
    if (!updateProfile || !supplierData || !supplier) {
      throw new Error('Required functions not available');
    }
    
    // ✅ Create the updated data WITH the cover photo
    const updatedSupplierData = {
      ...supplierData,
      coverPhoto: galleryData.coverPhoto,
      image: galleryData.coverPhoto // Also update the image field
    };



    // ✅ FIXED: Pass packages explicitly - use empty array if not available
    // const currentPackages = packages || supplierData?.packages || [];
    const result = await updateProfile(updatedSupplierData, null, supplier.id)
    
    if (result.success) {
      console.log('✅ Cover photo saved successfully');
      
      // Trigger supplier updated event
      window.dispatchEvent(new CustomEvent('supplierUpdated', { 
        detail: { supplierId: result.supplier.id } 
      }));
      
      setLocalSaveSuccess(true);
      setTimeout(() => setLocalSaveSuccess(false), 3000);
      
      return { success: true };
    } else {
      throw new Error(result.error || 'Failed to save cover photo');
    }
  } catch (error) {
    console.error('❌ Failed to save cover photo:', error);
    alert(`Failed to save cover photo: ${error.message}`);
    throw error;
  } finally {
    setLocalSaving(false);
  }
};

const handleRemoveCoverPhoto = async () => {
  if (confirm('Are you sure you want to remove the cover photo?')) {
    console.log('🗑️ Removing cover photo...');
    
    // Update local state immediately for UI feedback
    const previousCoverPhoto = coverPhoto;
    setCoverPhoto(null);
    
    try {
      // Save the removal to database
      await handleSaveGallery({ coverPhoto: null });
      console.log('✅ Cover photo removed successfully');
    } catch (error) {
      console.error('❌ Failed to remove cover photo:', error);
      // Revert local state if save failed
      setCoverPhoto(previousCoverPhoto);
      alert(`Failed to remove cover photo: ${error.message}`);
    }
  }
};

  return (
    <div className="">
      {/* Success Alert */}
      {localSaveSuccess && (
        <Alert className="border-green-200 bg-green-50 mb-4">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Cover photo updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Cover Photo Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Current Cover Photo */}
        <div className="flex-shrink-0">
          <div className="relative h-full md:w-[50%] rounded-lg overflow-hidden">
            <label
              htmlFor="cover-photo-upload"
              className={`inline-flex absolute bg-primary-500 bottom-5 left-[35%] items-center px-4 py-2 text-xs rounded-full font-medium text-white hover:bg-primary-600 cursor-pointer ${
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
                  {coverPhoto ? 'Change Photo' : 'Upload Photo'}
                </>
              )}
            </label>
            {coverPhoto ? (
              <>
                <img
                  src={coverPhoto || "/placeholder.png"}
                  alt="Cover photo"
                  className="md:w-[800px] h-[400px] object-cover"
                />
                <div className="absolute top-2 right-2">
                <div className="absolute top-2 right-2">
  <button
    type="button"
    onClick={handleRemoveCoverPhoto}  // ✅ Now actually removes and saves
    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs disabled:opacity-50"
    title="Remove cover photo"
    disabled={localSaving || uploadingCover}
  >
    {localSaving ? '...' : '🗑️'}
  </button>
</div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px]  text-gray-400">
                <img
                  src="/placeholder.png"
                  alt="Default cover"
                  className="h-full w-[800px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="space-y-4">
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
        </div>
      </div>
    </div>
  )
}

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
    <Card className="shadow-sm py-8">
      <CardHeader>
        <CardTitle>Verification Documents</CardTitle>
        <CardDescription>
          Upload required documents to get verified and build trust with customers. Verified suppliers often get more bookings.
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
  // ✅ Use business-aware hooks
  const { supplier, supplierData, setSupplierData, loading, error, refresh, currentBusiness } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()

  const [activeTab, setActiveTab] = useState("general")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [packages, setPackages] = useState(initialPackages)
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedSection, setSelectedSection] = useState('photos');
const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
const [websiteUrl, setWebsiteUrl] = useState('');
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisComplete, setAnalysisComplete] = useState(false);
const [aiSuggestions, setAiSuggestions] = useState(null);
const [analysisError, setAnalysisError] = useState('');

const handleAIAnalysis = async () => {
  if (!websiteUrl) {
    alert('Please enter your website URL first');
    return;
  }

  setIsAnalyzing(true);
  setAnalysisError('');
  
  try {
    const response = await fetch('/api/ai-analyze-website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        serviceType: 'entertainer'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      setAiSuggestions(result.data);
      setAnalysisComplete(true);
      console.log('✅ AI Analysis successful:', result.data);
    } else {
      setAnalysisError(result.error || 'Analysis failed');
    }
  } catch (error) {
    console.error('❌ Analysis request failed:', error);
    setAnalysisError('Network error. Please check your connection and try again.');
  } finally {
    setIsAnalyzing(false);
  }
};

// Function to apply AI suggestions to your existing form
const applyAISuggestions = () => {
  if (!aiSuggestions) return;
  
  // Update your existing details state with AI suggestions
  const newDetails = {
    ...details,
    performerType: aiSuggestions.performerType || details.performerType,
    ageGroups: aiSuggestions.ageGroups || details.ageGroups,
    performanceStyle: aiSuggestions.performanceStyle || details.performanceStyle,
    equipment: aiSuggestions.equipment || details.equipment,
    travelRadius: aiSuggestions.travelRadius || details.travelRadius,
    setupTime: aiSuggestions.setupTime || details.setupTime,
    specialSkills: aiSuggestions.specialSkills || details.specialSkills,
    groupSizeMin: aiSuggestions.groupSizeMin || details.groupSizeMin,
    groupSizeMax: aiSuggestions.groupSizeMax || details.groupSizeMax,
    personalBio: {
      ...details.personalBio,
      ...aiSuggestions.personalBio
    },
    addOnServices: [
      ...details.addOnServices,
      ...aiSuggestions.addOnServices
    ]
  };
  
  setDetails(newDetails);
  onUpdate(newDetails); // Call your existing onUpdate function
  
  // Close the AI assistant
  setShowAIAssistant(false);
  setAnalysisComplete(false);
  setAiSuggestions(null);
  
  // Show success message
  alert('✅ AI suggestions applied! Review and edit the fields below, then save your profile.');
};



  // ✅ Reset form state when business switches
  useEffect(() => {
    if (currentBusiness?.id && !loading) {
      console.log('🔄 Profile page updating for business:', currentBusiness?.name);
      
      // Reset any form-specific state here
      setSaveSuccess(false);
      setSaveError("");
      
      // Update packages if they exist in the business data
      if (supplierData?.packages && supplierData.packages.length > 0) {
        setPackages(supplierData.packages);
      } else {
        setPackages(initialPackages);
      }
    }
  }, [currentBusiness?.id, loading]);



  // ✅ Create stable callback for service details updates
  const handleServiceDetailsUpdate = useCallback((details) => {
    console.log("Service details updated for business:", currentBusiness?.name, details)
    setSupplierData(prev => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        ...details
      }
    }))
  }, [currentBusiness?.name])

  const handleServiceDetailsSave = useCallback(async (details) => {
    const updatedSupplierData = {
      ...supplierData,
      serviceDetails: details,
    }
    await updateProfile(updatedSupplierData, packages)
  }, [supplierData, updateProfile, packages])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    console.log('🔄 Input change:', { name, value, currentBusiness: currentBusiness?.name });
    
    // Handle nested owner fields
    if (["contactName", "email", "phone"].includes(name)) {
      setSupplierData((prev) => {
        const updated = {
          ...prev,
          owner: {
            ...prev.owner,
            [name === "contactName" ? "name" : name]: value,
          },
        };
        console.log('📝 Updated owner data for business:', currentBusiness?.name);
        return updated;
      });
    } else if (name === "businessName") {
      setSupplierData((prev) => {
        const updated = { ...prev, name: value };
        console.log('📝 Updated business name:', updated.name);
        return updated;
      });
    } else if (name === "businessDescription") {
      setSupplierData((prev) => {
        const updated = { ...prev, description: value };
        console.log('📝 Updated description for business:', currentBusiness?.name);
        return updated;
      });
    } else if (name === "postcode") {
      setSupplierData((prev) => {
        const updated = { ...prev, location: value };
        console.log('📝 Updated location:', updated.location);
        return updated;
      });
    } else {
      setSupplierData((prev) => {
        const updated = { ...prev, [name]: value };
        console.log('📝 Updated field:', { [name]: value });
        return updated;
      });
    }
  }

  const handleSaveChanges = async () => {
    setSaveSuccess(false)
    setSaveError("")

    const businessName = supplierData?.name
    const contactName = supplierData?.owner?.name
    const email = supplierData?.owner?.email
    const description = supplierData?.description

    if (!businessName || !contactName || !email) {
      setSaveError('Please fill in all required fields (Business Name, Contact Person, Email)')
      return
    }

    try {
      const result = await updateProfile(supplierData, null, supplier.id)

      if (result.success && result.supplier) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 5000)

        // Update local state
        if (setSupplierData) {
          setSupplierData(result.supplier.data)
        }

        // Refresh the hook data
        if (refresh) {
          refresh()
        }
      
        window.dispatchEvent(new CustomEvent('supplierUpdated', {
          detail: { supplierId: result.supplier.id }
        }))
      
        console.log('✅ Profile saved successfully for business:', currentBusiness?.name)
      } else {
        setSaveError(result.error || "Failed to save profile")
      }
    } catch (error) {
      setSaveError("An unexpected error occurred: " + error.message)
      console.error("❌ Save error:", error)
    }
  }

  // ✅ Replace with this - no event listener needed
useEffect(() => {
  if (currentBusiness) {
    console.log('🏢 Profile page: currentBusiness changed to:', currentBusiness.name);
    setSaveSuccess(false);
    setSaveError("");
  }
}, [currentBusiness?.id]);

if (loading) {
  return <ProfilePageSkeleton />
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

  const isNewSupplier = supplierData && !supplierData.isComplete
  const categoryLower = (supplierData?.category || supplierData?.serviceType || '')?.toLowerCase()
  const isVenue = categoryLower === 'venues' || categoryLower === 'venue'

  // Sidebar sections based on service type
  const venueSections = [
    { id: 'listingName', label: 'Listing name', icon: FileText },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'about', label: 'About your venue', icon: FileText },
    { id: 'address', label: 'Venue address', icon: MapPin },
    { id: 'type', label: 'Venue type', icon: Building2 },
    { id: 'capacity', label: 'Capacity', icon: Users },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'addons', label: 'Add-on services', icon: Settings },
    { id: 'restricted', label: 'Items not permitted', icon: Ban },
    { id: 'rules', label: 'House rules', icon: FileText },
    { id: 'verification', label: 'Verification', icon: Shield },
  ]

  const entertainerSections = [
    { id: 'listingName', label: 'Listing name', icon: FileText },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'about', label: 'About your service', icon: FileText },
    { id: 'basicInfo', label: 'Travel & location', icon: MapPin },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'ageGroups', label: 'Age groups', icon: Users },
    { id: 'performanceStyles', label: 'Performance styles', icon: Settings },
    { id: 'themes', label: 'Themes', icon: Sparkles },
    { id: 'equipment', label: 'Equipment & skills', icon: Settings },
    { id: 'personalBio', label: 'Meet the entertainer', icon: Users },
    { id: 'addOns', label: 'Add-on services', icon: Package },
    { id: 'packages', label: 'Packages', icon: Package },
  ]

  const sections = isVenue ? venueSections : entertainerSections

  return (
    <div className="min-h-screen bg-white">
      {/* Success/Error alerts - Fixed at top */}
      {(saveSuccess || saveError) && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          {saveSuccess && (
            <Alert className="border-green-200 bg-green-50 shadow-lg">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}
          {saveError && (
            <Alert className="border-red-200 bg-red-50 shadow-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">{saveError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Mobile Section List - visible on mobile only */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-100">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => {
                  setSelectedSection(section.id)
                  setMobileSheetOpen(true)
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{section.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {mobileSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0 top-8 bg-white rounded-t-2xl overflow-hidden flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="font-semibold text-gray-900">
                {sections.find(s => s.id === selectedSection)?.label || 'Details'}
              </h2>
              <div className="w-9" /> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedSection === 'photos' ? (
                <MediaPageContent />
              ) : selectedSection === 'packages' ? (
                <div className="p-4">
                  <PackagesPageContent />
                </div>
              ) : selectedSection === 'verification' ? (
                <div className="p-4">
                  <VerificationPageContent />
                </div>
              ) : (
                <div className="p-4">
                  <ServiceDetailsRouter
                    serviceType={supplierData?.category || supplierData?.serviceType}
                    serviceDetails={supplierData?.serviceDetails || {}}
                    supplierData={supplierData}
                    currentBusiness={currentBusiness}
                    onUpdate={handleServiceDetailsUpdate}
                    saving={saving}
                    setSupplierData={setSupplierData}
                    updateProfile={updateProfile}
                    supplier={supplier}
                    selectedSection={selectedSection}
                    onSectionChange={setSelectedSection}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Two-column Airbnb-style layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Sidebar - Section Navigation with Rich Previews */}
        <div className="w-[380px] border-r border-gray-200 bg-gray-50 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 space-y-3">
            {sections.map((section) => {
              const isSelected = selectedSection === section.id
              const serviceDetails = supplierData?.serviceDetails || {}
              const photos = supplierData?.portfolioImages || []

              // Render different card content based on section type
              const renderCardContent = () => {
                switch (section.id) {
                  case 'photos':
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Media</h3>
                        {photos.length > 0 ? (
                          <div className="relative flex justify-center items-center h-36">
                            {/* Left photo - behind, rotated left */}
                            {photos[2] && (
                              <div
                                className="absolute rounded-2xl overflow-hidden shadow-md border-4 border-white"
                                style={{
                                  width: '120px',
                                  height: '100px',
                                  transform: 'rotate(-8deg) translateX(-50px)',
                                  zIndex: 1
                                }}
                              >
                                <img
                                  src={photos[2].src || photos[2].url || photos[2]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {/* Right photo - behind, rotated right */}
                            {photos[1] && (
                              <div
                                className="absolute rounded-2xl overflow-hidden shadow-md border-4 border-white"
                                style={{
                                  width: '120px',
                                  height: '100px',
                                  transform: 'rotate(8deg) translateX(50px)',
                                  zIndex: 1
                                }}
                              >
                                <img
                                  src={photos[1].src || photos[1].url || photos[1]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {/* Center photo - front, no rotation */}
                            <div
                              className="absolute rounded-2xl overflow-hidden shadow-lg border-4 border-white"
                              style={{
                                width: '140px',
                                height: '110px',
                                zIndex: 3
                              }}
                            >
                              <img
                                src={photos[0].src || photos[0].url || photos[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="h-28 bg-gray-100 rounded-xl flex items-center justify-start px-4">
                            <Camera className="w-6 h-6 text-gray-300 mr-3" />
                            <p className="text-sm text-gray-400">Add photos</p>
                          </div>
                        )}
                      </div>
                    )

                  case 'address':
                    const venueAddress = serviceDetails.venueAddress || {}
                    const addressText = [venueAddress.addressLine1, venueAddress.city, venueAddress.postcode].filter(Boolean).join(', ')
                    const encodedAddr = encodeURIComponent(addressText + ', UK')
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                        {addressText ? (
                          <>
                            <p className="text-sm text-gray-500 mb-3">{addressText}</p>
                            <div className="rounded-xl overflow-hidden h-32">
                              <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddr}&zoom=14`}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Add your venue address</p>
                        )}
                      </div>
                    )

                  case 'type':
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Venue type</h3>
                        <p className="text-sm text-gray-500">
                          {serviceDetails.venueType || 'Select venue type'}
                        </p>
                      </div>
                    )

                  case 'capacity':
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Capacity</h3>
                        <p className="text-sm text-gray-500">
                          {serviceDetails.capacity?.max ? `Up to ${serviceDetails.capacity.max} guests` : 'Set capacity'}
                        </p>
                      </div>
                    )

                  case 'pricing':
                    // Handle both venue pricing (nested in pricing object) and entertainer pricing (flat)
                    const venuePricing = serviceDetails.pricing || {}
                    const venueHourlyRate = venuePricing.hourlyRate || 0
                    const entertainerHourlyRate = serviceDetails.hourlyRate || 0
                    const entertainerExtraRate = serviceDetails.extraHourRate || 0
                    const entertainerAdditional = serviceDetails.additionalEntertainerPrice || 0

                    // Check if it's venue or entertainer based on data structure
                    const isVenuePricing = venueHourlyRate > 0
                    const isEntertainerPricing = entertainerHourlyRate > 0 || entertainerExtraRate > 0

                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Pricing</h3>
                        {isVenuePricing ? (
                          <div className="text-sm text-gray-500 space-y-0.5">
                            <p>£{venueHourlyRate} per hour</p>
                            {venuePricing.minimumBookingHours && <p>{venuePricing.minimumBookingHours}hr minimum</p>}
                            {venuePricing.securityDeposit > 0 && <p>£{venuePricing.securityDeposit} deposit</p>}
                          </div>
                        ) : isEntertainerPricing ? (
                          <div className="text-sm text-gray-500 space-y-0.5">
                            {entertainerHourlyRate > 0 && <p>£{entertainerHourlyRate} per hour</p>}
                            {entertainerExtraRate > 0 && <p>£{entertainerExtraRate} extra hour</p>}
                            {entertainerAdditional > 0 && <p>£{entertainerAdditional} additional entertainer</p>}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Set your rates</p>
                        )}
                      </div>
                    )

                  case 'restricted':
                    const restrictedCount = serviceDetails.restrictedItems?.length || 0
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Items not permitted</h3>
                        <p className="text-sm text-gray-500">
                          {restrictedCount > 0 ? `${restrictedCount} item${restrictedCount !== 1 ? 's' : ''} restricted` : 'No restrictions set'}
                        </p>
                      </div>
                    )

                  case 'rules':
                    const rulesCount = serviceDetails.houseRules?.length || 0
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">House rules</h3>
                        <p className="text-sm text-gray-500">
                          {rulesCount > 0 ? `${rulesCount} rule${rulesCount !== 1 ? 's' : ''} set` : 'Add rules'}
                        </p>
                      </div>
                    )

                  case 'addons':
                  case 'addOns':
                    const addonsCount = serviceDetails.addOnServices?.length || 0
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Add-on services</h3>
                        <p className="text-sm text-gray-500">
                          {addonsCount > 0 ? `${addonsCount} service${addonsCount !== 1 ? 's' : ''} available` : 'Add extras'}
                        </p>
                      </div>
                    )

                  case 'about':
                    const aboutText = serviceDetails.aboutUs || supplierData?.description || ''
                    const truncatedAbout = aboutText.trim().slice(0, 60)
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">About</h3>
                        <p className="text-sm text-gray-500">
                          {truncatedAbout ? `${truncatedAbout}${aboutText.length > 60 ? '...' : ''}` : 'Tell your story'}
                        </p>
                      </div>
                    )

                  case 'packages':
                    const packagesCount = supplierData?.packages?.length || 0
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Packages</h3>
                        <p className="text-sm text-gray-500">
                          {packagesCount > 0 ? `${packagesCount} package${packagesCount !== 1 ? 's' : ''} created` : 'Create packages'}
                        </p>
                      </div>
                    )

                  case 'verification':
                    // Check multiple possible locations for verification documents
                    const verificationDocs = supplierData?.data?.verification?.documents ||
                                            supplierData?.verification?.documents ||
                                            supplierData?.serviceDetails?.verification?.documents ||
                                            {}
                    const docTypes = ['dbs', 'id', 'address']
                    // Note: 'submitted' status means under review/pending
                    const approvedDocs = docTypes.filter(d => verificationDocs[d]?.status === 'approved')
                    const pendingDocs = docTypes.filter(d => verificationDocs[d]?.status === 'submitted')
                    const rejectedDocs = docTypes.filter(d => verificationDocs[d]?.status === 'rejected')
                    const notSubmittedDocs = docTypes.filter(d => !verificationDocs[d]?.status || verificationDocs[d]?.status === 'not_submitted')

                    const allApproved = approvedDocs.length === 3
                    const hasPending = pendingDocs.length > 0
                    const hasRejected = rejectedDocs.length > 0

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Verification</h3>
                          {allApproved ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          ) : hasPending ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                              <Clock className="w-3 h-3" />
                              Under review
                            </span>
                          ) : hasRejected ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                              <XCircle className="w-3 h-3" />
                              Action needed
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-1.5">
                          {docTypes.map(docType => {
                            const doc = verificationDocs[docType]
                            const status = doc?.status || 'not_submitted'
                            const labels = { dbs: 'DBS Check', id: 'Photo ID', address: 'Proof of Address' }

                            return (
                              <div key={docType} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{labels[docType]}</span>
                                {status === 'approved' ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : status === 'submitted' ? (
                                  <Clock className="w-4 h-4 text-yellow-500" />
                                ) : status === 'rejected' ? (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )

                  // Listing name section (shared between entertainers and venues)
                  case 'listingName':
                    const displayName = supplierData?.data?.name || supplierData?.name || ''
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Listing name</h3>
                        <p className="text-sm text-gray-500">
                          {displayName || 'Add your business name'}
                        </p>
                      </div>
                    )

                  case 'basicInfo':
                    const baseLocation = serviceDetails.serviceArea?.baseLocation || ''
                    const basicPostcode = serviceDetails.serviceArea?.postcode || supplierData?.location || ''
                    const hasCoords = serviceDetails.serviceArea?.latitude && serviceDetails.serviceArea?.longitude
                    const locationText = [baseLocation, basicPostcode].filter(Boolean).join(', ')
                    const encodedLocation = encodeURIComponent(locationText ? locationText + ', UK' : 'London, UK')
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Travel & location</h3>
                        {basicPostcode ? (
                          <>
                            <p className="text-sm text-gray-500 mb-3">
                              {basicPostcode}{serviceDetails.travelRadius ? ` · ${serviceDetails.travelRadius} miles` : ''}
                            </p>
                            <div className="rounded-xl overflow-hidden h-28">
                              <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedLocation}&zoom=12`}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Set your location</p>
                        )}
                      </div>
                    )

                  case 'ageGroups':
                    const ageGroups = (Array.isArray(serviceDetails.ageGroups) ? serviceDetails.ageGroups : []).filter(a => typeof a === 'string')
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Age groups</h3>
                        {ageGroups.length > 0 ? (
                          <div className="space-y-1">
                            {ageGroups.slice(0, 4).map((age, i) => (
                              <p key={i} className="text-sm text-gray-500">{String(age)}</p>
                            ))}
                            {ageGroups.length > 4 && (
                              <p className="text-sm text-gray-400">+{ageGroups.length - 4} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Select age groups</p>
                        )}
                      </div>
                    )

                  case 'performanceStyles':
                    const styles = (Array.isArray(serviceDetails.performanceStyle) ? serviceDetails.performanceStyle : []).filter(s => typeof s === 'string')
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Performance styles</h3>
                        {styles.length > 0 ? (
                          <div className="space-y-1">
                            {styles.slice(0, 4).map((style, i) => (
                              <p key={i} className="text-sm text-gray-500">{String(style)}</p>
                            ))}
                            {styles.length > 4 && (
                              <p className="text-sm text-gray-400">+{styles.length - 4} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Select styles</p>
                        )}
                      </div>
                    )

                  case 'themes':
                    const themes = (Array.isArray(serviceDetails.themes) ? serviceDetails.themes : []).filter(t => typeof t === 'string')
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Themes</h3>
                        {themes.length > 0 ? (
                          <div className="space-y-1">
                            {themes.slice(0, 4).map((theme, i) => (
                              <p key={i} className="text-sm text-gray-500">{String(theme).charAt(0).toUpperCase() + String(theme).slice(1)}</p>
                            ))}
                            {themes.length > 4 && (
                              <p className="text-sm text-gray-400">+{themes.length - 4} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Add themes</p>
                        )}
                      </div>
                    )

                  case 'equipment':
                    const equipmentText = typeof serviceDetails.equipment === 'string' ? serviceDetails.equipment.trim() : ''
                    const skillsText = typeof serviceDetails.specialSkills === 'string' ? serviceDetails.specialSkills.trim() : ''
                    const equipmentPreview = equipmentText ? equipmentText.substring(0, 50) + (equipmentText.length > 50 ? '...' : '') : ''
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Equipment & skills</h3>
                        <p className="text-sm text-gray-500">
                          {equipmentPreview || (skillsText ? skillsText.substring(0, 50) : '') || 'Add details'}
                        </p>
                      </div>
                    )

                  case 'personalBio':
                    const yearsExp = serviceDetails.personalBio?.yearsExperience
                    const bioStory = typeof serviceDetails.personalBio?.personalStory === 'string' ? serviceDetails.personalBio.personalStory.trim() : ''
                    const bioPreview = yearsExp ? `${yearsExp} years experience` : bioStory ? bioStory.substring(0, 50) + '...' : ''
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Meet the entertainer</h3>
                        <p className="text-sm text-gray-500">
                          {bioPreview || 'Tell your story'}
                        </p>
                      </div>
                    )

                  default:
                    return (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{section.label}</h3>
                      </div>
                    )
                }
              }

              return (
                <div
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full p-5 rounded-2xl transition-all bg-white cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-gray-900 shadow-sm'
                      : 'hover:shadow-md border border-gray-100'
                  }`}
                >
                  {renderCardContent()}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-gray-50">
          {/* Content - conditionally render based on selectedSection */}
          {selectedSection === 'photos' ? (
            <MediaPageContent />
          ) : selectedSection === 'packages' ? (
            <div className="p-6 lg:p-12">
              <PackagesPageContent />
            </div>
          ) : selectedSection === 'verification' ? (
            <div className="p-6 lg:p-12">
              <VerificationPageContent />
            </div>
          ) : (
            <div className="p-6 lg:p-12">
              <ServiceDetailsRouter
                serviceType={supplierData?.category || supplierData?.serviceType}
                serviceDetails={supplierData?.serviceDetails || {}}
                supplierData={supplierData}
                currentBusiness={currentBusiness}
                onUpdate={handleServiceDetailsUpdate}
                saving={saving}
                setSupplierData={setSupplierData}
                updateProfile={updateProfile}
                supplier={supplier}
                selectedSection={selectedSection}
                onSectionChange={setSelectedSection}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal content */}
          </div>
        </div>
      )}
    </div>
  )
}