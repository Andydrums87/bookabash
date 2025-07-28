"use client"

import { useState, useEffect, useRef } from "react"
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  AlertCircle,
  Camera,
  Upload,
  Loader2,
  Check,
  Save,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  MapPin,
  X
} from "lucide-react"
import { GlobalSaveButton } from "@/components/GlobalSaveButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"

const Settings = () => {
  const [localSaving, setLocalSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const profilePhotoRef = useRef(null)

  const { supplier, supplierData, setSupplierData, loading, error, refresh } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePhoto: '',
    bio: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      postcode: '',
      country: 'United Kingdom'
    }
  })

  // Business Information State
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    vatNumber: '',
    businessAddress: {
      street: '',
      city: '',
      postcode: '',
      country: 'United Kingdom'
    },
    operatingPostcode: ''
  })

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailMarketing: false,
    smsBookings: true,
    smsReminders: true,
    pushNotifications: true
  })

  // Security Settings State
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  })

  // Load data from supplier
  useEffect(() => {
    if (supplierData) {
      console.log('⚙️ Loading settings data from supplier:', supplierData);
      
      // Load personal info
      setPersonalInfo({
        firstName: supplierData.owner?.firstName || supplierData.owner?.name?.split(' ')[0] || '',
        lastName: supplierData.owner?.lastName || supplierData.owner?.name?.split(' ').slice(1).join(' ') || '',
        email: supplierData.owner?.email || '',
        phone: supplierData.owner?.phone || '',
        profilePhoto: supplierData.owner?.profilePhoto || '',
        bio: supplierData.owner?.bio || '',
        dateOfBirth: supplierData.owner?.dateOfBirth || '',
        address: {
          street: supplierData.owner?.address?.street || '',
          city: supplierData.owner?.address?.city || '',
          postcode: supplierData.owner?.address?.postcode || '',
          country: supplierData.owner?.address?.country || 'United Kingdom'
        }
      });

      // Load business info
      setBusinessInfo({
        businessName: supplierData.name || '',
        businessType: supplierData.serviceType || '',
        registrationNumber: supplierData.registrationNumber || '',
        vatNumber: supplierData.vatNumber || '',
        businessAddress: {
          street: supplierData.businessAddress?.street || '',
          city: supplierData.businessAddress?.city || '',
          postcode: supplierData.businessAddress?.postcode || '',
          country: supplierData.businessAddress?.country || 'United Kingdom'
        },
        operatingPostcode: supplierData.location || ''
      });

      // Load notification preferences
      setNotifications({
        emailBookings: supplierData.notifications?.emailBookings ?? true,
        emailMessages: supplierData.notifications?.emailMessages ?? true,
        emailMarketing: supplierData.notifications?.emailMarketing ?? false,
        smsBookings: supplierData.notifications?.smsBookings ?? true,
        smsReminders: supplierData.notifications?.smsReminders ?? true,
        pushNotifications: supplierData.notifications?.pushNotifications ?? true
      });

      setProfilePhoto(supplierData.owner?.profilePhoto || null);
    }
  }, [supplierData]);

  // Handle profile photo upload
  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📷 Uploading profile photo...');
    setUploadingProfilePhoto(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'portfolio_images');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const cloudinaryData = await response.json();
      console.log('✅ Profile photo uploaded:', cloudinaryData.secure_url);
      
      setProfilePhoto(cloudinaryData.secure_url);
      setPersonalInfo(prev => ({
        ...prev,
        profilePhoto: cloudinaryData.secure_url
      }));
      
    } catch (error) {
      console.error('❌ Profile photo upload failed:', error);
      alert(`Failed to upload photo: ${error.message}`);
    } finally {
      setUploadingProfilePhoto(false);
      if (profilePhotoRef.current) {
        profilePhotoRef.current.value = '';
      }
    }
  };

  // Save settings to backend
  const handleSaveSettings = async () => {
    setLocalSaving(true);
    
    try {
      console.log('💾 Saving settings...');
      
      if (!updateProfile || !supplierData) {
        throw new Error('Required functions not available');
      }
      
      // Merge settings data with existing supplier data
      const updatedSupplierData = {
        ...supplierData,
        name: businessInfo.businessName,
        serviceType: businessInfo.businessType,
        location: businessInfo.operatingPostcode,
        registrationNumber: businessInfo.registrationNumber,
        vatNumber: businessInfo.vatNumber,
        businessAddress: businessInfo.businessAddress,
        owner: {
          ...supplierData.owner,
          name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          profilePhoto: personalInfo.profilePhoto,
          bio: personalInfo.bio,
          dateOfBirth: personalInfo.dateOfBirth,
          address: personalInfo.address
        },
        notifications: notifications
      };

      console.log('💾 Updated supplier data:', updatedSupplierData);

      const result = await updateProfile(updatedSupplierData, supplierData.packages || []);
      
      if (result.success) {
        console.log('✅ Settings saved successfully');
        
        // Update local supplier data
        if (setSupplierData) {
          setSupplierData(updatedSupplierData);
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setLocalSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto">
        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-4 sm:p-6">
            <Alert className="border-green-200 bg-green-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
              <Check className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">Settings saved successfully!</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Global Save Button - Mobile Optimized */}
        <div className="absolute right-10">
          <GlobalSaveButton position="responsive" onSave={handleSaveSettings} isLoading={saving} />
        </div>

        {/* Header - Mobile Optimized */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:gap-3">
            <h2 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">
              Account Settings
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your personal information, business details, and preferences
            </p>
          </div>
        </div>

        {/* Personal Information - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="sm:p-6 py-8 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Your personal details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              {/* Profile Photo - Mobile Optimized */}
              <div>
                <Label className="text-sm font-medium">Profile Photo</Label>
                <div className="flex flex-col sm:flex-row items-start gap-4 mt-2">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 mx-auto sm:mx-0">
                    {profilePhoto ? (
                      <>
                        <img
                          src={profilePhoto || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePhoto(null)
                            setPersonalInfo((prev) => ({ ...prev, profilePhoto: "" }))
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full text-xs touch-manipulation"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-auto text-center sm:text-left">
                    <label
                      htmlFor="profile-photo-upload"
                      className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-primary-400 hover:bg-[hsl(var(--primary-600))] cursor-pointer touch-manipulation ${
                        uploadingProfilePhoto ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {uploadingProfilePhoto ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photo
                        </>
                      )}
                    </label>
                    <input
                      id="profile-photo-upload"
                      ref={profilePhotoRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      disabled={uploadingProfilePhoto}
                    />
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Name Fields - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
              </div>

              {/* Contact Fields - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personalEmail" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalPhone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="personalPhone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="07123 456789"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={personalInfo.bio}
                  onChange={(e) => setPersonalInfo((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                />
              </div>

              {/* Personal Address - Mobile Optimized */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Personal Address</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="personalStreet" className="text-sm font-medium">
                      Street Address
                    </Label>
                    <Input
                      id="personalStreet"
                      value={personalInfo.address.street}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value },
                        }))
                      }
                      placeholder="123 Main Street"
                      className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalCity" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="personalCity"
                      value={personalInfo.address.city}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value },
                        }))
                      }
                      placeholder="London"
                      className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="personalPostcode" className="text-sm font-medium">
                      Postcode
                    </Label>
                    <Input
                      id="personalPostcode"
                      value={personalInfo.address.postcode}
                      onChange={(e) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          address: { ...prev.address, postcode: e.target.value },
                        }))
                      }
                      placeholder="SW1A 1AA"
                      className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalCountry" className="text-sm font-medium">
                      Country
                    </Label>
                    <Select
                      value={personalInfo.address.country}
                      onValueChange={(value) =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          address: { ...prev.address, country: value },
                        }))
                      }
                    >
                      <SelectTrigger className="py-5 w-full bg-white border-2 pl-2 border-gray-200 rounded-xl text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Ireland">Ireland</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Spain">Spain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Information - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 py-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Building className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Details about your business and operations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-sm font-medium">
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    value={businessInfo.businessName}
                    onChange={(e) => setBusinessInfo((prev) => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your Business Name"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-sm font-medium">
                    Business Type
                  </Label>
                  <Select
                    value={businessInfo.businessType}
                    onValueChange={(value) => setBusinessInfo((prev) => ({ ...prev, businessType: value }))}
                  >
                    <SelectTrigger className="py-5 w-full bg-white border-2 border-gray-200 rounded-xl text-base">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="venue">Venue</SelectItem>
                      <SelectItem value="catering">Catering</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className="text-sm font-medium">
                    Company Registration Number
                  </Label>
                  <Input
                    id="registrationNumber"
                    value={businessInfo.registrationNumber}
                    onChange={(e) => setBusinessInfo((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="12345678"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber" className="text-sm font-medium">
                    VAT Number (Optional)
                  </Label>
                  <Input
                    id="vatNumber"
                    value={businessInfo.vatNumber}
                    onChange={(e) => setBusinessInfo((prev) => ({ ...prev, vatNumber: e.target.value }))}
                    placeholder="GB123456789"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operatingPostcode" className="text-sm font-medium">
                  Operating Postcode
                </Label>
                <Input
                  id="operatingPostcode"
                  value={businessInfo.operatingPostcode}
                  onChange={(e) => setBusinessInfo((prev) => ({ ...prev, operatingPostcode: e.target.value }))}
                  placeholder="W1A 0AX"
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                />
                <p className="text-xs text-gray-500">This helps customers find you in local searches</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 py-8 bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emailBookings"
                    checked={notifications.emailBookings}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailBookings: !!checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="emailBookings" className="text-sm font-medium leading-relaxed">
                    Email notifications for new bookings
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emailMessages"
                    checked={notifications.emailMessages}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailMessages: !!checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="emailMessages" className="text-sm font-medium leading-relaxed">
                    Email notifications for messages
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emailMarketing"
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailMarketing: !!checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="emailMarketing" className="text-sm font-medium leading-relaxed">
                    Marketing and promotional emails
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="smsBookings"
                    checked={notifications.smsBookings}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, smsBookings: !!checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="smsBookings" className="text-sm font-medium leading-relaxed">
                    SMS notifications for bookings
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="pushNotifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, pushNotifications: !!checked }))
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="pushNotifications" className="text-sm font-medium leading-relaxed">
                    Push notifications
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6 py-8 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={security.currentPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="twoFactor"
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, twoFactorEnabled: !!checked }))}
                  className="mt-1"
                />
                <Label htmlFor="twoFactor" className="text-sm font-medium leading-relaxed">
                  Enable two-factor authentication
                </Label>
              </div>

              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone - Mobile Optimized */}
        <div className="p-4 sm:p-6 pt-0">
          <Card className="shadow-sm border-red-200">
            <CardHeader className="p-4 sm:p-6 py-8 bg-gradient-to-r from-red-50 to-red-100">
              <CardTitle className="text-red-600 text-lg sm:text-xl">Danger Zone</CardTitle>
              <CardDescription className="text-sm sm:text-base">Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="space-y-1">
                  <h4 className="font-medium text-red-800">Delete Account</h4>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" className="w-full sm:w-auto">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings