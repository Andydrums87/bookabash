"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Save,
  X,
  Phone,
  Home,
  Package,
  LogOut,
  Camera,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export default function UserSettings() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [currentParty, setCurrentParty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    delivery_notes: ''
  })

  const [originalData, setOriginalData] = useState({})
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(changed)
  }, [formData, originalData])

  const loadUserData = async () => {
    try {
      setLoading(true)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/signin')
        return
      }

      setUser(user)
      setProfileImage(user.user_metadata?.avatar_url || null)

      const userResult = await partyDatabaseBackend.getCurrentUser()
      if (userResult.success && userResult.user) {
        const userData = userResult.user
        setUserProfile(userData)

        const data = {
          full_name: userData.full_name || user.user_metadata?.full_name || '',
          phone: userData.phone || '',
          address_line_1: userData.address_line_1 || '',
          address_line_2: userData.address_line_2 || '',
          city: userData.city || '',
          postal_code: userData.postcode || '',
          delivery_notes: userData.delivery_notes || ''
        }

        setFormData(data)
        setOriginalData(data)
      }

      const partyResult = await partyDatabaseBackend.getCurrentParty()
      if (partyResult.success && partyResult.party) {
        setCurrentParty(partyResult.party)
      }

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const userResult = await partyDatabaseBackend.getCurrentUser()
      if (!userResult.success) {
        console.error('Could not get current user for update')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city,
          postcode: formData.postal_code,
          delivery_notes: formData.delivery_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userResult.user.id)

      if (!error) {
        setOriginalData(formData)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setHasChanges(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getUserInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="h-32 bg-gray-200 animate-pulse" />
          <div className="px-6 py-8 space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary-100 via-primary-50 to-pink-100">
          <button className="absolute bottom-3 right-3 p-2 bg-white/80 hover:bg-white rounded-lg shadow-sm transition-colors">
            <Camera className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative px-4 sm:px-6 pb-6">
          {/* Profile Photo - Overlapping */}
          <div className="absolute -top-12 left-4 sm:left-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Title and Actions */}
          <div className="pt-16 sm:pt-4 sm:pl-32 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500">Update your photo and personal details.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={!hasChanges || saving}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-4 bg-primary-500 hover:bg-primary-600"
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-6 pb-12">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">

            {/* Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
              <Label className="text-sm font-medium text-gray-700 sm:pt-2">
                Full name
              </Label>
              <div className="sm:col-span-2">
                <Input
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  className="max-w-md"
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
              <Label className="text-sm font-medium text-gray-700 sm:pt-2">
                Email address
              </Label>
              <div className="sm:col-span-2">
                <Input
                  value={user?.email || ''}
                  disabled
                  className="max-w-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed</p>
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
              <Label className="text-sm font-medium text-gray-700 sm:pt-2">
                Phone number
              </Label>
              <div className="sm:col-span-2">
                <Input
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="07XXX XXXXXX"
                  className="max-w-md"
                />
              </div>
            </div>

            {/* Your Photo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Your photo
                </Label>
                <p className="text-xs text-gray-400 mt-0.5">This will be displayed on your profile.</p>
              </div>
              <div className="sm:col-span-2 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <button className="text-gray-500 hover:text-gray-700 font-medium">
                    Delete
                  </button>
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Address Section Header */}
            <div className="p-4 sm:p-6 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Delivery Address
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">For items that need delivering to you before the party</p>
            </div>

            {/* Address Line 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
              <Label className="text-sm font-medium text-gray-700 sm:pt-2">
                Address line 1
              </Label>
              <div className="sm:col-span-2">
                <Input
                  value={formData.address_line_1}
                  onChange={(e) => updateField('address_line_1', e.target.value)}
                  placeholder="House number and street"
                  className="max-w-md"
                />
              </div>
            </div>

            {/* Address Line 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
              <Label className="text-sm font-medium text-gray-700 sm:pt-2">
                Address line 2
              </Label>
              <div className="sm:col-span-2">
                <Input
                  value={formData.address_line_2}
                  onChange={(e) => updateField('address_line_2', e.target.value)}
                  placeholder="Apartment, suite, floor (optional)"
                  className="max-w-md"
                />
              </div>
            </div>

            {/* City & Postcode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
              <Label className="text-sm font-medium text-gray-700 sm:pt-2">
                City & Postcode
              </Label>
              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 max-w-md">
                <Input
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="City"
                  className="flex-1"
                />
                <Input
                  value={formData.postal_code}
                  onChange={(e) => updateField('postal_code', e.target.value)}
                  placeholder="Postcode"
                  className="w-full sm:w-32"
                />
              </div>
            </div>

            {/* Delivery Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 items-start">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Delivery notes
                </Label>
                <p className="text-xs text-gray-400 mt-0.5">Special instructions for deliveries</p>
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  value={formData.delivery_notes}
                  onChange={(e) => updateField('delivery_notes', e.target.value)}
                  placeholder="e.g. Leave with neighbour if not home"
                  rows={3}
                  className="max-w-md resize-none"
                />
              </div>
            </div>
          </div>

          {/* Current Party Card */}
          {currentParty && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4" />
                Current Party
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Party for</p>
                  <p className="font-medium text-gray-900">{currentParty.child_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(currentParty.party_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guests</p>
                  <p className="font-medium text-gray-900">{currentParty.guest_count}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge variant={currentParty.status === 'confirmed' ? 'default' : 'secondary'} className="mt-0.5">
                    {currentParty.status}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <a href="/dashboard">View Dashboard</a>
              </Button>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/terms" className="text-gray-500 hover:text-gray-700">Terms of Service</a>
              <a href="/privacy-policy" className="text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <a href="/cookies" className="text-gray-500 hover:text-gray-700">Cookie Policy</a>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Support */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Need help? Contact us at{' '}
            <a href="mailto:hello@partysnap.co.uk" className="text-primary-600 hover:underline">
              hello@partysnap.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
