"use client"

import { useState, useEffect, useRef } from "react"
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Loader2,
  Check,
  Camera,
  X,
  ChevronLeft,
  Upload,
  MessageSquare,
  Truck,
  MapPin,
  Clock,
  Package
} from "lucide-react"
import { useBusiness } from "@/contexts/BusinessContext"
import MessageTemplatesSection from "../profile/components/MessageTemplatesSection"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"
import { useRouter } from "next/navigation"

// Airbnb-style settings sections
const settingsSections = [
  { id: 'personal', label: 'Personal information', icon: User },
  { id: 'business', label: 'Business details', icon: Building },
  { id: 'templates', label: 'Message templates', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

// Editable field row component
function SettingRow({ label, value, description, onEdit, actionLabel = "Edit" }) {
  return (
    <div className="py-6 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-medium text-gray-900">{label}</h3>
          <p className="text-gray-500 mt-1">{value || 'Not provided'}</p>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-gray-900 font-medium underline hover:text-gray-600 flex-shrink-0"
          >
            {value ? actionLabel : 'Add'}
          </button>
        )}
      </div>
    </div>
  )
}

// Toggle row for notifications
function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="py-6 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{label}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${
            checked ? 'bg-gray-900' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out absolute top-1 ${
              checked ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

// Edit modal component
function EditModal({ isOpen, onClose, title, children, onSave, saving }) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
        <div
          className="bg-white w-full lg:w-full lg:max-w-lg lg:rounded-2xl rounded-t-2xl max-h-[90vh] lg:max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <div className="w-9" />
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <button
              onClick={onClose}
              className="text-base font-medium text-gray-900 underline"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl text-base font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Settings() {
  const router = useRouter()
  const [selectedSection, setSelectedSection] = useState('personal')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState({})
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef(null)

  const { supplier, supplierData, setSupplierData, loading } = useSupplier()
  const { updateProfile } = useSupplierDashboard()
  const { businesses, currentBusiness } = useBusiness()

  // Check if this is a cake supplier (check primary business)
  const primaryBusiness = businesses?.find(b => b.is_primary || b.isPrimary)
  const isCakeSupplier = primaryBusiness?.category?.toLowerCase() === 'cakes' ||
                         primaryBusiness?.serviceType?.toLowerCase() === 'cakes' ||
                         supplierData?.category?.toLowerCase() === 'cakes'

  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePhoto: '',
  })

  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    operatingPostcode: '',
  })

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailMarketing: false,
    smsBookings: true,
    smsReminders: true,
  })

  // Cake-specific settings (only used for cake suppliers)
  const [cakeSettings, setCakeSettings] = useState({
    offersPickup: true,
    offersDelivery: false,
    deliveryRadius: 10,
    deliveryFee: 0,
    minimumLeadTime: 3,
    standardLeadTime: 7,
    collectionHours: {
      monday: { open: true, from: '09:00', to: '17:00' },
      tuesday: { open: true, from: '09:00', to: '17:00' },
      wednesday: { open: true, from: '09:00', to: '17:00' },
      thursday: { open: true, from: '09:00', to: '17:00' },
      friday: { open: true, from: '09:00', to: '17:00' },
      saturday: { open: true, from: '10:00', to: '16:00' },
      sunday: { open: false, from: '10:00', to: '16:00' }
    }
  })

  // Load data from supplier
  useEffect(() => {
    if (supplierData) {
      setPersonalInfo({
        firstName: supplierData.owner?.firstName || supplierData.owner?.name?.split(' ')[0] || '',
        lastName: supplierData.owner?.lastName || supplierData.owner?.name?.split(' ').slice(1).join(' ') || '',
        email: supplierData.owner?.email || '',
        phone: supplierData.owner?.phone || '',
        profilePhoto: supplierData.owner?.profilePhoto || '',
      })

      setBusinessInfo({
        businessName: supplierData.name || '',
        businessType: supplierData.serviceType || '',
        operatingPostcode: supplierData.location || '',
      })

      setNotifications({
        emailBookings: supplierData.notifications?.emailBookings ?? true,
        emailMessages: supplierData.notifications?.emailMessages ?? true,
        emailMarketing: supplierData.notifications?.emailMarketing ?? false,
        smsBookings: supplierData.notifications?.smsBookings ?? true,
        smsReminders: supplierData.notifications?.smsReminders ?? true,
      })
    }
  }, [supplierData])

  // Load cake settings from primary business
  useEffect(() => {
    if (primaryBusiness && isCakeSupplier) {
      const serviceDetails = primaryBusiness.serviceDetails || primaryBusiness.data?.serviceDetails || {}
      const fulfilment = serviceDetails.fulfilment || {}
      const leadTime = serviceDetails.leadTime || {}

      setCakeSettings({
        offersPickup: fulfilment.offersPickup ?? true,
        offersDelivery: fulfilment.offersDelivery ?? false,
        deliveryRadius: fulfilment.deliveryRadius ?? 10,
        deliveryFee: fulfilment.deliveryFee ?? 0,
        minimumLeadTime: leadTime.minimum ?? 3,
        standardLeadTime: leadTime.standard ?? 7,
        collectionHours: fulfilment.collectionHours ?? {
          monday: { open: true, from: '09:00', to: '17:00' },
          tuesday: { open: true, from: '09:00', to: '17:00' },
          wednesday: { open: true, from: '09:00', to: '17:00' },
          thursday: { open: true, from: '09:00', to: '17:00' },
          friday: { open: true, from: '09:00', to: '17:00' },
          saturday: { open: true, from: '10:00', to: '16:00' },
          sunday: { open: false, from: '10:00', to: '16:00' }
        }
      })
    }
  }, [primaryBusiness, isCakeSupplier])

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'portfolio_images')

      const response = await fetch('https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setPersonalInfo(prev => ({ ...prev, profilePhoto: data.secure_url }))

      // Auto-save photo
      await handleSave({ profilePhoto: data.secure_url })
    } catch (error) {
      console.error('Photo upload failed:', error)
      alert('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const handleSave = async (overrides = {}) => {
    setSaving(true)
    try {
      const updatedData = {
        ...supplierData,
        name: businessInfo.businessName,
        serviceType: businessInfo.businessType,
        location: businessInfo.operatingPostcode,
        owner: {
          ...supplierData?.owner,
          name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          profilePhoto: overrides.profilePhoto || personalInfo.profilePhoto,
        },
        notifications,
      }

      const result = await updateProfile(updatedData, null, updatedData.id)

      if (result.success) {
        if (setSupplierData) setSupplierData(updatedData)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
        setEditField(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (field, initialValue) => {
    setEditField(field)
    setEditValue(initialValue)
  }

  const handleNotificationSave = async (updatedNotifications) => {
    try {
      const updatedData = {
        ...supplierData,
        notifications: updatedNotifications,
      }

      const result = await updateProfile(updatedData, null, updatedData.id)

      if (result.success) {
        if (setSupplierData) setSupplierData(updatedData)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleEditSave = async () => {
    // Update the appropriate state based on field
    if (editField === 'name') {
      setPersonalInfo(prev => ({
        ...prev,
        firstName: editValue.firstName || '',
        lastName: editValue.lastName || ''
      }))
    } else if (editField === 'email') {
      setPersonalInfo(prev => ({ ...prev, email: editValue.email || '' }))
    } else if (editField === 'phone') {
      setPersonalInfo(prev => ({ ...prev, phone: editValue.phone || '' }))
    } else if (editField === 'businessName') {
      setBusinessInfo(prev => ({ ...prev, businessName: editValue.businessName || '' }))
    } else if (editField === 'postcode') {
      setBusinessInfo(prev => ({ ...prev, operatingPostcode: editValue.postcode || '' }))
    } else if (editField === 'fulfilment' || editField === 'deliveryFee' || editField === 'leadTimes') {
      // Update cake settings and save to primary business
      const updatedCakeSettings = {
        ...cakeSettings,
        ...editValue,
      }
      setCakeSettings(updatedCakeSettings)
      await handleCakeSettingsSave(updatedCakeSettings)
      return // Don't call regular handleSave
    }

    await handleSave()
  }

  // Save cake settings to the primary business AND propagate to all child products
  const handleCakeSettingsSave = async (settings) => {
    if (!primaryBusiness) return

    setSaving(true)
    try {
      const fulfilmentData = {
        offersPickup: settings.offersPickup,
        offersDelivery: settings.offersDelivery,
        deliveryRadius: settings.deliveryRadius,
        deliveryFee: settings.deliveryFee,
        collectionHours: settings.collectionHours,
      }

      const leadTimeData = {
        minimum: settings.minimumLeadTime,
        standard: settings.standardLeadTime,
      }

      // 1. Update the primary business
      const updatedPrimaryBusiness = {
        ...primaryBusiness,
        serviceDetails: {
          ...(primaryBusiness.serviceDetails || {}),
          fulfilment: fulfilmentData,
          leadTime: leadTimeData,
        },
      }

      const primaryResult = await updateProfile(updatedPrimaryBusiness, null, primaryBusiness.id)

      if (!primaryResult.success) {
        throw new Error(primaryResult.error)
      }

      // 2. Find all child businesses (cake products) and update them too
      const childBusinesses = businesses?.filter(b =>
        b.parent_business_id === primaryBusiness.id ||
        b.parentBusinessId === primaryBusiness.id
      ) || []

      // Update each child business with the new fulfilment/lead time settings
      const updatePromises = childBusinesses.map(async (child) => {
        const updatedChild = {
          ...child,
          serviceDetails: {
            ...(child.serviceDetails || {}),
            fulfilment: fulfilmentData,
            leadTime: leadTimeData,
          },
        }
        return updateProfile(updatedChild, null, child.id)
      })

      // Wait for all child updates to complete
      await Promise.all(updatePromises)

      console.log(`✅ Updated primary business and ${childBusinesses.length} cake product(s)`)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      setEditField(null)
    } catch (error) {
      console.error('Failed to save cake settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const currentSection = settingsSections.find(s => s.id === selectedSection)

  return (
    <div className="min-h-screen bg-white">
      {/* Success toast */}
      {saveSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4" />
          Saved
        </div>
      )}

      {/* Header - mobile only */}
      <div className="border-b border-gray-200 lg:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">Account settings</h1>
            <div className="w-9" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 hidden lg:block">
              Account settings
            </h2>
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon
                const isSelected = selectedSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full flex items-center justify-start gap-4 px-4 py-4 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-6 h-6 flex-shrink-0" />
                    <div className="text-left">
                      <span className="font-medium block">{section.label}</span>
                      {section.description && (
                        <span className="text-sm text-gray-500 block">{section.description}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-8 mt-8 lg:mt-0">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {currentSection?.label}
            </h2>

            {/* Personal Information Section */}
            {selectedSection === 'personal' && (
              <div>
                {/* Profile Photo */}
                <div className="py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                        {personalInfo.profilePhoto ? (
                          <img
                            src={personalInfo.profilePhoto}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Profile photo</h3>
                        <p className="text-sm text-gray-500">JPG or PNG, max 5MB</p>
                      </div>
                    </div>
                    <label className="text-gray-900 font-medium underline hover:text-gray-600 cursor-pointer">
                      {personalInfo.profilePhoto ? 'Change' : 'Add'}
                      <input
                        ref={photoInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                </div>

                <SettingRow
                  label="Legal name"
                  value={`${personalInfo.firstName} ${personalInfo.lastName}`.trim() || null}
                  onEdit={() => openEditModal('name', {
                    firstName: personalInfo.firstName,
                    lastName: personalInfo.lastName
                  })}
                />

                <SettingRow
                  label="Email address"
                  value={personalInfo.email}
                  onEdit={() => openEditModal('email', { email: personalInfo.email })}
                />

                <SettingRow
                  label="Phone number"
                  value={personalInfo.phone}
                  description="Contact number for customers and PartySnap to get in touch"
                  onEdit={() => openEditModal('phone', { phone: personalInfo.phone })}
                />
              </div>
            )}

            {/* Business Details Section */}
            {selectedSection === 'business' && (
              <div>
                <SettingRow
                  label="Business name"
                  value={businessInfo.businessName}
                  onEdit={() => openEditModal('businessName', { businessName: businessInfo.businessName })}
                />

                <SettingRow
                  label="Business type"
                  value={businessInfo.businessType}
                />

                <SettingRow
                  label="Operating postcode"
                  value={businessInfo.operatingPostcode}
                  description="This helps customers find you in local searches"
                  onEdit={() => openEditModal('postcode', { postcode: businessInfo.operatingPostcode })}
                />

                {/* Cake-specific settings */}
                {isCakeSupplier && (
                  <>
                    <div className="pt-6 mt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Fulfilment Options
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        How customers can receive their cakes
                      </p>
                    </div>

                    <SettingRow
                      label="Collection available"
                      value={cakeSettings.offersPickup ? 'Yes - customers can collect from your location' : 'No'}
                      onEdit={() => openEditModal('fulfilment', { ...cakeSettings })}
                    />

                    {cakeSettings.offersPickup && (
                      <SettingRow
                        label="Collection hours"
                        value={(() => {
                          const hours = cakeSettings.collectionHours
                          const openDays = Object.entries(hours).filter(([_, day]) => day.open).length
                          if (openDays === 0) return 'No hours set'
                          if (openDays === 7) return 'Open every day'
                          if (openDays === 5) {
                            const weekdaysOpen = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
                              .every(d => hours[d]?.open)
                            if (weekdaysOpen) return 'Mon-Fri'
                          }
                          return `${openDays} days per week`
                        })()}
                        description="When customers can collect their orders"
                        onEdit={() => openEditModal('collectionHours', { collectionHours: cakeSettings.collectionHours })}
                      />
                    )}

                    <SettingRow
                      label="Delivery available"
                      value={cakeSettings.offersDelivery
                        ? `Yes - within ${cakeSettings.deliveryRadius} miles`
                        : 'No'
                      }
                      onEdit={() => openEditModal('fulfilment', { ...cakeSettings })}
                    />

                    {cakeSettings.offersDelivery && (
                      <SettingRow
                        label="Delivery fee"
                        value={cakeSettings.deliveryFee > 0 ? `£${cakeSettings.deliveryFee}` : 'Free delivery'}
                        description="This fee is added to customer orders when they choose delivery"
                        onEdit={() => openEditModal('deliveryFee', { deliveryFee: cakeSettings.deliveryFee })}
                      />
                    )}

                    <div className="pt-6 mt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Lead Times
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        How much notice you need for orders
                      </p>
                    </div>

                    <SettingRow
                      label="Minimum notice"
                      value={(() => {
                        const days = cakeSettings.minimumLeadTime
                        if (days === 7) return '1 week'
                        if (days === 14) return '2 weeks'
                        if (days === 21) return '3 weeks'
                        if (days === 28) return '4 weeks'
                        return `${days} ${days === 1 ? 'day' : 'days'}`
                      })()}
                      description="The shortest notice period you can accept"
                      onEdit={() => openEditModal('leadTimes', { ...cakeSettings })}
                    />
                  </>
                )}
              </div>
            )}

            {/* Message Templates Section */}
            {selectedSection === 'templates' && (
              <div>
                <p className="text-gray-500 mb-6">
                  Create message templates to quickly respond to booking enquiries
                </p>
                <MessageTemplatesSection
                  supplier={supplier}
                  currentBusiness={supplierData}
                />
              </div>
            )}

            {/* Notifications Section */}
            {selectedSection === 'notifications' && (
              <div>
                <p className="text-gray-500 mb-6">
                  Choose how you want to be notified about important updates
                </p>

                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                  Email notifications
                </h3>

                <ToggleRow
                  label="New bookings"
                  description="Get notified when you receive a new booking enquiry"
                  checked={notifications.emailBookings}
                  onChange={(checked) => {
                    const updated = { ...notifications, emailBookings: checked }
                    setNotifications(updated)
                    handleNotificationSave(updated)
                  }}
                />

                <ToggleRow
                  label="Messages"
                  description="Get notified when customers send you messages"
                  checked={notifications.emailMessages}
                  onChange={(checked) => {
                    const updated = { ...notifications, emailMessages: checked }
                    setNotifications(updated)
                    handleNotificationSave(updated)
                  }}
                />

                <ToggleRow
                  label="Marketing"
                  description="Tips, offers, and updates from PartySnap"
                  checked={notifications.emailMarketing}
                  onChange={(checked) => {
                    const updated = { ...notifications, emailMarketing: checked }
                    setNotifications(updated)
                    handleNotificationSave(updated)
                  }}
                />

                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4 mt-8">
                  SMS notifications
                </h3>

                <ToggleRow
                  label="Urgent booking alerts"
                  description="Get instant SMS when customers pay deposits"
                  checked={notifications.smsBookings}
                  onChange={(checked) => {
                    const updated = { ...notifications, smsBookings: checked }
                    setNotifications(updated)
                    handleNotificationSave(updated)
                  }}
                />

                <ToggleRow
                  label="Appointment reminders"
                  description="SMS reminders about upcoming parties"
                  checked={notifications.smsReminders}
                  onChange={(checked) => {
                    const updated = { ...notifications, smsReminders: checked }
                    setNotifications(updated)
                    handleNotificationSave(updated)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <EditModal
        isOpen={editField === 'name'}
        onClose={() => setEditField(null)}
        title="Edit name"
        onSave={handleEditSave}
        saving={saving}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
            <input
              type="text"
              value={editValue.firstName || ''}
              onChange={(e) => setEditValue(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
            <input
              type="text"
              value={editValue.lastName || ''}
              onChange={(e) => setEditValue(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Last name"
            />
          </div>
        </div>
      </EditModal>

      <EditModal
        isOpen={editField === 'email'}
        onClose={() => setEditField(null)}
        title="Edit email"
        onSave={handleEditSave}
        saving={saving}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
          <input
            type="email"
            value={editValue.email || ''}
            onChange={(e) => setEditValue(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
      </EditModal>

      <EditModal
        isOpen={editField === 'phone'}
        onClose={() => setEditField(null)}
        title="Edit phone number"
        onSave={handleEditSave}
        saving={saving}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
          <input
            type="tel"
            value={editValue.phone || ''}
            onChange={(e) => setEditValue(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="07123 456789"
          />
          <p className="text-sm text-gray-500 mt-2">
            This number will be used by customers and PartySnap to contact you about bookings.
          </p>
        </div>
      </EditModal>

      <EditModal
        isOpen={editField === 'businessName'}
        onClose={() => setEditField(null)}
        title="Edit business name"
        onSave={handleEditSave}
        saving={saving}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business name</label>
          <input
            type="text"
            value={editValue.businessName || ''}
            onChange={(e) => setEditValue(prev => ({ ...prev, businessName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Your Business Name"
          />
        </div>
      </EditModal>

      <EditModal
        isOpen={editField === 'postcode'}
        onClose={() => setEditField(null)}
        title="Edit operating postcode"
        onSave={handleEditSave}
        saving={saving}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
          <input
            type="text"
            value={editValue.postcode || ''}
            onChange={(e) => setEditValue(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="SW1A 1AA"
          />
          <p className="text-sm text-gray-500 mt-2">
            This helps customers find you when searching for services in their area.
          </p>
        </div>
      </EditModal>

      {/* Cake-specific edit modals */}
      <EditModal
        isOpen={editField === 'fulfilment'}
        onClose={() => setEditField(null)}
        title="Fulfilment options"
        onSave={handleEditSave}
        saving={saving}
      >
        <div className="space-y-6">
          {/* Pickup toggle */}
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              editValue.offersPickup ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
            }`}
            onClick={() => {
              // Don't allow both to be off
              if (editValue.offersPickup && !editValue.offersDelivery) return
              setEditValue(prev => ({ ...prev, offersPickup: !prev.offersPickup }))
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Collection / Pickup</p>
                  <p className="text-sm text-gray-500">Customers collect from your location</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                editValue.offersPickup ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
              }`}>
                {editValue.offersPickup && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Delivery toggle */}
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              editValue.offersDelivery ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
            }`}
            onClick={() => {
              // Don't allow both to be off
              if (editValue.offersDelivery && !editValue.offersPickup) return
              setEditValue(prev => ({ ...prev, offersDelivery: !prev.offersDelivery }))
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Delivery</p>
                  <p className="text-sm text-gray-500">You deliver to customer's location</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                editValue.offersDelivery ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
              }`}>
                {editValue.offersDelivery && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Delivery radius - only show if delivery enabled */}
          {editValue.offersDelivery && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Delivery radius (miles)</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20, 25, 30, 40, 50].map(radius => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setEditValue(prev => ({ ...prev, deliveryRadius: radius }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      editValue.deliveryRadius === radius
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {radius}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 bg-amber-50 p-3 rounded-lg border border-amber-200">
            You must offer at least one fulfilment option
          </p>
        </div>
      </EditModal>

      <EditModal
        isOpen={editField === 'collectionHours'}
        onClose={() => setEditField(null)}
        title="Collection hours"
        onSave={() => {
          const updatedSettings = { ...cakeSettings, collectionHours: editValue.collectionHours }
          setCakeSettings(updatedSettings)
          handleCakeSettingsSave(updatedSettings)
        }}
        saving={saving}
      >
        <div className="space-y-2">
          {[
            { key: 'monday', label: 'Mon' },
            { key: 'tuesday', label: 'Tue' },
            { key: 'wednesday', label: 'Wed' },
            { key: 'thursday', label: 'Thu' },
            { key: 'friday', label: 'Fri' },
            { key: 'saturday', label: 'Sat' },
            { key: 'sunday', label: 'Sun' }
          ].map(({ key, label }) => {
            const dayData = editValue.collectionHours?.[key] || { open: false, from: '09:00', to: '17:00' }
            return (
              <div key={key} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditValue(prev => ({
                      ...prev,
                      collectionHours: {
                        ...prev.collectionHours,
                        [key]: { ...dayData, open: !dayData.open }
                      }
                    }))
                  }}
                  className={`w-14 h-10 rounded-lg font-medium text-sm transition-all flex-shrink-0 ${
                    dayData.open
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-300 text-gray-400'
                  }`}
                >
                  {label}
                </button>

                {dayData.open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={dayData.from}
                      onChange={(e) => {
                        setEditValue(prev => ({
                          ...prev,
                          collectionHours: {
                            ...prev.collectionHours,
                            [key]: { ...dayData, from: e.target.value }
                          }
                        }))
                      }}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-gray-900 focus:outline-none bg-white"
                    >
                      {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(time => {
                        const hour = parseInt(time.split(':')[0])
                        const formatted = hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`
                        return <option key={time} value={time}>{formatted}</option>
                      })}
                    </select>
                    <span className="text-gray-400 text-sm">to</span>
                    <select
                      value={dayData.to}
                      onChange={(e) => {
                        setEditValue(prev => ({
                          ...prev,
                          collectionHours: {
                            ...prev.collectionHours,
                            [key]: { ...dayData, to: e.target.value }
                          }
                        }))
                      }}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-gray-900 focus:outline-none bg-white"
                    >
                      {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(time => {
                        const hour = parseInt(time.split(':')[0])
                        const formatted = hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`
                        return <option key={time} value={time}>{formatted}</option>
                      })}
                    </select>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Closed</span>
                )}
              </div>
            )
          })}
        </div>
      </EditModal>

      <EditModal
        isOpen={editField === 'deliveryFee'}
        onClose={() => setEditField(null)}
        title="Edit delivery fee"
        onSave={handleEditSave}
        saving={saving}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery fee</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">£</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={editValue.deliveryFeeInput ?? (editValue.deliveryFee === 0 ? '' : editValue.deliveryFee)}
              onChange={(e) => {
                // Allow digits, one decimal point, and up to 2 decimal places
                let value = e.target.value.replace(/[^0-9.]/g, '')
                // Prevent multiple decimal points
                const parts = value.split('.')
                if (parts.length > 2) {
                  value = parts[0] + '.' + parts.slice(1).join('')
                }
                // Limit to 2 decimal places
                if (parts.length === 2 && parts[1].length > 2) {
                  value = parts[0] + '.' + parts[1].slice(0, 2)
                }
                setEditValue(prev => ({
                  ...prev,
                  deliveryFeeInput: value,
                  deliveryFee: value === '' ? 0 : parseFloat(value) || 0
                }))
              }}
              className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Leave empty or set to 0 for free delivery. This fee is added to customer orders (e.g. 5.50)
          </p>
        </div>
      </EditModal>

      <EditModal
        isOpen={editField === 'leadTimes'}
        onClose={() => setEditField(null)}
        title="Minimum notice"
        onSave={handleEditSave}
        saving={saving}
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-4">How much notice do you need for orders?</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 1, label: '1 day' },
                { value: 2, label: '2 days' },
                { value: 3, label: '3 days' },
                { value: 5, label: '5 days' },
                { value: 7, label: '1 week' },
                { value: 14, label: '2 weeks' },
                { value: 21, label: '3 weeks' },
                { value: 28, label: '4 weeks' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEditValue(prev => ({ ...prev, minimumLeadTime: option.value }))}
                  className={`py-3 rounded-xl text-center transition-all ${
                    editValue.minimumLeadTime === option.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Customers won't be able to book orders less than <strong>{editValue.minimumLeadTime} {editValue.minimumLeadTime === 1 ? 'day' : 'days'}</strong> in advance
            </p>
          </div>
        </div>
      </EditModal>
    </div>
  )
}
