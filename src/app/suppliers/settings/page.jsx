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
  MessageSquare
} from "lucide-react"
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
    }

    await handleSave()
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
    </div>
  )
}
