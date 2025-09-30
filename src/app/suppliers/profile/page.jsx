"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSupplierDashboard } from "@/utils/mockBackend"
import ServiceSpecificDetails from "./components/EntertainerServiceDetails"
import ServiceDetailsRouter from "../ServiceDetailsRouter"
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
  Sparkles
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

  return (
    <div className="min-h-screen bg-primary-50 ">

    
      <div className="max-w-7xl mx-auto">
        {/* Header with status - Mobile Optimized */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:gap-6">
            
           
{/* Add debug modal here */}

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">
                    {isNewSupplier ? "Complete Your Profile" : "Build Trust With Parents"}
                  </h1>
                  {supplierData && (
                    <Badge variant={supplierData.isComplete ? "default" : "secondary"} className="text-xs w-fit">
                      {supplierData.isComplete ? "Live" : "Draft"}
                    </Badge>
                  )}
                </div>

                {/* <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {isNewSupplier
                    ? "Welcome! Complete your profile to go live on the marketplace and start receiving bookings."
                    : "Keep your public information and service details up to date."}
                </p> */}

                {/* Welcome message for new suppliers */}
                {/* {isNewSupplier && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Welcome to PartySnap!</strong> Your account has been created. Add some details and service
                      packages below, then click "Save Changes" to go live on the marketplace.
                    </AlertDescription>
                  </Alert>
                )} */}

                {/* Success/Error alerts */}
                {saveSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      🎉 Profile updated successfully! Your changes are now live on the marketplace.
                      {supplierData?.isComplete && (
                        <span className="block mt-2">
                          Your profile is complete and customers can now find and book you.
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {saveError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">{saveError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Action buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto lg:items-start">
                {/* Global Save Button */}
                {/* <div className="absolute top-1 right-10">
                  <GlobalSaveButton position="responsive" onSave={handleSaveChanges} isLoading={saving} />
                </div> */}

                {/* Preview Profile Button */}
                {/* <div className="order-2 sm:order-1">
                  {supplierData?.isComplete && (
                    <Button
                      variant="outline"
                      onClick={() => alert(`Your public profile: /suppliers/${supplier?.id}`)}
                      className="w-full sm:w-auto bg-transparent"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Profile
                    </Button>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Profile Card - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <div className="bg-white w-full rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Cover Photo Section - Mobile Optimized */}
              <div className="w-full lg:w-2/5 mr-19">
              <CoverPhotoContent
  currentSupplier={supplierData}
  supplierData={supplierData}
  supplier={supplier}
  updateProfile={updateProfile}
  saving={saving}
  packages={packages}  // ✅ Add this line
/>
              </div>

              {/* Form Section - Mobile Optimized */}
              <div className="w-full lg:w-3/5 space-y-4 sm:space-y-6">
                {/* Business Name */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700" htmlFor="businessName">
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-sm"
                    value={supplierData?.name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your business name"
                  />
                </div>

                {/* Contact Person */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700" htmlFor="contactName">
                    Contact Person
                  </Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-sm"
                    value={supplierData?.owner?.name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter contact person name"
                  />
                </div>

                {/* Business Description */}
                {/* <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700" htmlFor="businessDescription">
                    Business Description
                  </Label>
                  <p className="text-xs text-gray-500">
                    Tell customers about your business and what makes you special
                  </p>
                  <Textarea
                    id="businessDescription"
                    name="businessDescription"
                    className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none h-40"
                    value={supplierData?.description || ""}
                    onChange={handleInputChange}
                    placeholder="Describe your business, services, and what makes you unique..."
                  />
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* TabsContent sections - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          {/* Service Specific Details - Mobile Optimized */}
          <div className="mt-6">
          <ServiceDetailsRouter
  serviceType={supplierData?.business_type || supplierData?.serviceType}
  serviceDetails={supplierData?.serviceDetails || {}}
  supplierData={supplierData}
  currentBusiness={currentBusiness}
  onUpdate={handleServiceDetailsUpdate}
  saving={saving}
  setSupplierData={setSupplierData}  // Pass the state setter
  updateProfile={updateProfile}      // Pass the update function
  supplier={supplier}                // Pass the supplier object
/>
          </div>
 
    {/* AI Assistant Modal */}
    {showAIAssistant && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal content - see the previous artifact for full implementation */}
        </div>
      </div>
    )}
          {/* Verification Documents - Mobile Optimized */}
          {/* <div className="mt-6">
            <VerificationDocumentsTabContent />
          </div> */}
        </div>
      </div>
    </div>
  )
}