"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Settings, 
  Edit,
  Save,
  X,
  Phone,
  Home,
  Building,
  Globe,
  Clock,
  Package,
  Shield
} from 'lucide-react'
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export default function UserSettings() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [currentParty, setCurrentParty] = useState(null)
  const [billingInfo, setBillingInfo] = useState(null)
  const [deliveryAddress, setDeliveryAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    date_of_birth: ''
  })
  const [deliveryForm, setDeliveryForm] = useState({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    country: 'United Kingdom',
    phone: '',
    delivery_notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/signin')
        return
      }
      
      setUser(user)
  
      // Use your backend to get user profile
      const userResult = await partyDatabaseBackend.getCurrentUser()
      if (userResult.success && userResult.user) {
        const userData = userResult.user
        setUserProfile(userData)
        
        // Set profile form
        setProfileForm({
          full_name: userData.full_name || user.user_metadata?.full_name || '',
          phone: userData.phone || '',
          date_of_birth: userData.date_of_birth || ''
        })
        
        // Check if user has address data and set delivery info
        if (userData.address_line_1 || userData.city || userData.postcode) {
          setDeliveryAddress(userData) // Set the address data exists flag
          
          // Set delivery form with user's address data
          setDeliveryForm({
            full_name: userData.first_name && userData.last_name 
              ? `${userData.first_name} ${userData.last_name}`.trim()
              : userData.full_name || '',
            address_line_1: userData.address_line_1 || '',
            address_line_2: userData.address_line_2 || '',
            city: userData.city || '',
            postal_code: userData.postcode || '', // Note: postcode from DB maps to postal_code in form
            country: 'United Kingdom',
            phone: userData.phone || '',
            delivery_notes: userData.delivery_notes || ''
          })
        } else {
          // No address data exists
          setDeliveryAddress(null)
          setDeliveryForm({
            full_name: userData.first_name && userData.last_name 
              ? `${userData.first_name} ${userData.last_name}`.trim()
              : userData.full_name || '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            postal_code: '',
            country: 'United Kingdom',
            phone: userData.phone || '',
            delivery_notes: ''
          })
        }
      }
  
      // Load current party using your backend
      const partyResult = await partyDatabaseBackend.getCurrentParty()
      if (partyResult.success && partyResult.party) {
        setCurrentParty(partyResult.party)
      }
  
      // Load billing information - check if user has payment methods
      if (userResult.success && userResult.user) {
        const { data: billing, error: billingError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', userResult.user.id)
          .eq('is_default', true)
          .single()
        
        if (!billingError && billing) {
          setBillingInfo(billing)
        }
      }
  
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }
  

  const handleSaveProfile = async () => {
    try {
      // Get current user from your backend first
      const userResult = await partyDatabaseBackend.getCurrentUser()
      if (!userResult.success) {
        console.error('Could not get current user for update')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          date_of_birth: profileForm.date_of_birth,
          updated_at: new Date().toISOString()
        })
        .eq('id', userResult.user.id)
      
      if (!error) {
        setEditingProfile(false)
        await loadUserData() // Reload to get fresh data
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleSaveDelivery = async () => {
    try {
      // Get current user from your backend first
      const userResult = await partyDatabaseBackend.getCurrentUser()
      if (!userResult.success) {
        console.error('Could not get current user for update')
        return
      }
  
      // UPDATED: Save to same columns used by migration
      const { error } = await supabase
        .from('users')
        .update({
          // Use standard address columns (same as migration)
          address_line_1: deliveryForm.address_line_1,
          address_line_2: deliveryForm.address_line_2,
          city: deliveryForm.city,
          postcode: deliveryForm.postal_code,
          
          // Optional delivery-specific field if it exists
          delivery_notes: deliveryForm.delivery_notes,
          
          updated_at: new Date().toISOString()
        })
        .eq('id', userResult.user.id)
      
      if (!error) {
        setEditingDelivery(false)
        await loadUserData() // Reload to get fresh data
      }
    } catch (error) {
      console.error('Error saving delivery address:', error)
    }
  }

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name || profileForm.full_name) {
      const name = profileForm.full_name || user?.user_metadata?.full_name
      return name
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-semibold">
              {getUserInitials()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600">Manage your profile, party details, and preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>Your basic account details and contact information</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (editingProfile) {
                    setEditingProfile(false)
                    // Reset form to current values
                    setProfileForm({
                      full_name: userProfile?.full_name || user?.user_metadata?.full_name || '',
                      phone: userProfile?.phone || '',
                      date_of_birth: userProfile?.date_of_birth || ''
                    })
                  } else {
                    setEditingProfile(true)
                  }
                }}
              >
                {editingProfile ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {editingProfile ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      placeholder="+44 7XXX XXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profileForm.date_of_birth}
                      onChange={(e) => setProfileForm({...profileForm, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button onClick={handleSaveProfile} className="bg-primary-500 hover:bg-primary-600">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                      <p className="text-lg">{profileForm.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-lg flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{user?.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p className="text-lg flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{profileForm.phone || 'Not provided'}</span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                      <p className="text-lg">{formatDate(profileForm.date_of_birth)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Party Information */}
          <Card className="py-5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Current Party</span>
              </CardTitle>
              <CardDescription>Your active party planning details</CardDescription>
            </CardHeader>
            <CardContent>
              {currentParty ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Current Party For:</Label>
                        <p className="text-lg font-medium">{currentParty.child_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Party Type</Label>
                        <Badge variant="secondary" className="text-sm">
                          {currentParty.party_type}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Guest Count</Label>
                        <p className="text-lg">{currentParty.guest_count} guests</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Party Date</Label>
                        <p className="text-lg flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(currentParty.party_date)}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Budget</Label>
                        <p className="text-lg">£{currentParty.budget}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Party Status</Label>
                        <Badge variant={currentParty.status === 'active' ? 'default' : 'secondary'}>
                          {currentParty.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Created on {formatDate(currentParty.created_at)}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/dashboard">View Dashboard</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No active party found</p>
                  <Button asChild className="bg-primary-500 hover:bg-primary-600">
                    <a href="/dashboard?action=new-party">Start Planning a Party</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

         {/* Delivery Information */}
<Card className="py-5">
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle className="flex items-center space-x-2">
        <Package className="w-5 h-5" />
        <span>Delivery Information</span>
      </CardTitle>
      <CardDescription>Your default delivery address for party supplies</CardDescription>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (editingDelivery) {
          setEditingDelivery(false)
          // Reset form to current values from deliveryAddress state
          if (deliveryAddress) {
            setDeliveryForm({
              full_name: deliveryAddress.first_name && deliveryAddress.last_name 
                ? `${deliveryAddress.first_name} ${deliveryAddress.last_name}`.trim()
                : deliveryAddress.full_name || '',
              address_line_1: deliveryAddress.address_line_1 || '',
              address_line_2: deliveryAddress.address_line_2 || '',
              city: deliveryAddress.city || '',
              postal_code: deliveryAddress.postcode || '',
              country: 'United Kingdom',
              phone: deliveryAddress.phone || '',
              delivery_notes: deliveryAddress.delivery_notes || ''
            })
          }
        } else {
          setEditingDelivery(true)
        }
      }}
    >
      {editingDelivery ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
      {editingDelivery ? 'Cancel' : 'Edit'}
    </Button>
  </CardHeader>
  <CardContent>
    {editingDelivery ? (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="delivery_full_name">Full Name</Label>
            <Input
              id="delivery_full_name"
              value={deliveryForm.full_name}
              onChange={(e) => setDeliveryForm({...deliveryForm, full_name: e.target.value})}
              placeholder="Recipient name"
            />
          </div>
          <div>
            <Label htmlFor="delivery_phone">Phone Number</Label>
            <Input
              id="delivery_phone"
              value={deliveryForm.phone}
              onChange={(e) => setDeliveryForm({...deliveryForm, phone: e.target.value})}
              placeholder="+44 7XXX XXXXXX"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="address_line_1">Address Line 1</Label>
          <Input
            id="address_line_1"
            value={deliveryForm.address_line_1}
            onChange={(e) => setDeliveryForm({...deliveryForm, address_line_1: e.target.value})}
            placeholder="Street address, building name, etc."
          />
        </div>
        
        <div>
          <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
          <Input
            id="address_line_2"
            value={deliveryForm.address_line_2}
            onChange={(e) => setDeliveryForm({...deliveryForm, address_line_2: e.target.value})}
            placeholder="Apartment, suite, unit, etc."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={deliveryForm.city}
              onChange={(e) => setDeliveryForm({...deliveryForm, city: e.target.value})}
              placeholder="London"
            />
          </div>
          <div>
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              value={deliveryForm.postal_code}
              onChange={(e) => setDeliveryForm({...deliveryForm, postal_code: e.target.value})}
              placeholder="SW1A 1AA"
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={deliveryForm.country}
              onChange={(e) => setDeliveryForm({...deliveryForm, country: e.target.value})}
              placeholder="United Kingdom"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="delivery_notes">Delivery Notes (Optional)</Label>
          <Input
            id="delivery_notes"
            value={deliveryForm.delivery_notes}
            onChange={(e) => setDeliveryForm({...deliveryForm, delivery_notes: e.target.value})}
            placeholder="Special delivery instructions..."
          />
        </div>
        
        <Button onClick={handleSaveDelivery} className="bg-primary-500 hover:bg-primary-600">
          <Save className="w-4 h-4 mr-2" />
          Save Delivery Address
        </Button>
      </div>
    ) : deliveryAddress ? (
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{deliveryForm.full_name}</p>
            <p className="text-gray-600">{deliveryForm.address_line_1}</p>
            {deliveryForm.address_line_2 && (
              <p className="text-gray-600">{deliveryForm.address_line_2}</p>
            )}
            <p className="text-gray-600">
              {deliveryForm.city}, {deliveryForm.postal_code}
            </p>
            <p className="text-gray-600">{deliveryForm.country}</p>
            {deliveryForm.phone && (
              <p className="text-gray-600 flex items-center space-x-1 mt-2">
                <Phone className="w-4 h-4" />
                <span>{deliveryForm.phone}</span>
              </p>
            )}
            {deliveryForm.delivery_notes && (
              <p className="text-sm text-gray-500 mt-2 italic">
                "{deliveryForm.delivery_notes}"
              </p>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-8">
        <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No delivery address on file</p>
        <Button onClick={() => setEditingDelivery(true)} className="bg-primary-500 hover:bg-primary-600">
          Add Delivery Address
        </Button>
      </div>
    )}
  </CardContent>
</Card>

          {/* Billing Information */}
          <Card className="py-5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Billing Information</span>
              </CardTitle>
              <CardDescription>Payment methods and billing history</CardDescription>
            </CardHeader>
            <CardContent>
              {billingInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Billing Name</Label>
                        <p className="text-lg">{billingInfo.billing_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Default Payment Method</Label>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span>**** **** **** {billingInfo.last_four || '****'}</span>
                          {billingInfo.card_type && (
                            <Badge variant="outline" className="text-xs">
                              {billingInfo.card_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Billing Address</Label>
                        <div className="text-sm text-gray-600">
                          <p>{billingInfo.billing_address_line_1}</p>
                          {billingInfo.billing_address_line_2 && (
                            <p>{billingInfo.billing_address_line_2}</p>
                          )}
                          <p>{billingInfo.billing_city}, {billingInfo.billing_postal_code}</p>
                          <p>{billingInfo.billing_country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Last updated {formatDate(billingInfo.updated_at)}
                    </p>
                    <Button variant="outline" size="sm">
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No billing information on file</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Billing information will be added when you make your first party booking
                  </p>
                  <Button variant="outline">
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="py-5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Account Security</span>
              </CardTitle>
              <CardDescription>Manage your account security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account Created</Label>
                    <p className="text-lg">{formatDate(user?.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Last Sign In</Label>
                    <p className="text-lg">{formatDate(user?.last_sign_in_at)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email Verified</Label>
                    <Badge variant={user?.email_confirmed_at ? "default" : "destructive"}>
                      {user?.email_confirmed_at ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account ID</Label>
                    <p className="text-sm font-mono text-gray-500">{user?.id}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
                <Button variant="outline" size="sm">
                  Privacy Settings
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
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