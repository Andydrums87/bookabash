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
  Edit,
  Save,
  X,
  Phone,
  Home,
  Clock,
  Package,
  LogOut
} from 'lucide-react'
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export default function UserSettings() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [currentParty, setCurrentParty] = useState(null)
  const [deliveryAddress, setDeliveryAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
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

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/signin')
        return
      }

      setUser(user)

      const userResult = await partyDatabaseBackend.getCurrentUser()
      if (userResult.success && userResult.user) {
        const userData = userResult.user
        setUserProfile(userData)

        setProfileForm({
          full_name: userData.full_name || user.user_metadata?.full_name || '',
          phone: userData.phone || '',
        })

        if (userData.address_line_1 || userData.city || userData.postcode) {
          setDeliveryAddress(userData)

          setDeliveryForm({
            full_name: userData.first_name && userData.last_name
              ? `${userData.first_name} ${userData.last_name}`.trim()
              : userData.full_name || '',
            address_line_1: userData.address_line_1 || '',
            address_line_2: userData.address_line_2 || '',
            city: userData.city || '',
            postal_code: userData.postcode || '',
            country: 'United Kingdom',
            phone: userData.phone || '',
            delivery_notes: userData.delivery_notes || ''
          })
        } else {
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

  const handleSaveProfile = async () => {
    try {
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
          updated_at: new Date().toISOString()
        })
        .eq('id', userResult.user.id)

      if (!error) {
        setEditingProfile(false)
        await loadUserData()
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleSaveDelivery = async () => {
    try {
      const userResult = await partyDatabaseBackend.getCurrentUser()
      if (!userResult.success) {
        console.error('Could not get current user for update')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          address_line_1: deliveryForm.address_line_1,
          address_line_2: deliveryForm.address_line_2,
          city: deliveryForm.city,
          postcode: deliveryForm.postal_code,
          delivery_notes: deliveryForm.delivery_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userResult.user.id)

      if (!error) {
        setEditingDelivery(false)
        await loadUserData()
      }
    } catch (error) {
      console.error('Error saving delivery address:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-primary-500 text-white rounded-full flex items-center justify-center text-lg font-semibold">
              {getUserInitials()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (editingProfile) {
                    setEditingProfile(false)
                    setProfileForm({
                      full_name: userProfile?.full_name || user?.user_metadata?.full_name || '',
                      phone: userProfile?.phone || '',
                    })
                  } else {
                    setEditingProfile(true)
                  }
                }}
              >
                {editingProfile ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <div className="space-y-4">
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
                      placeholder="07XXX XXXXXX"
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
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full bg-primary-500 hover:bg-primary-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium">{profileForm.full_name || 'Not provided'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{profileForm.phone || 'Not provided'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Package className="w-5 h-5" />
                  <span>Delivery Address</span>
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (editingDelivery) {
                    setEditingDelivery(false)
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
              </Button>
            </CardHeader>
            <CardContent>
              {editingDelivery ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address_line_1">Address Line 1</Label>
                    <Input
                      id="address_line_1"
                      value={deliveryForm.address_line_1}
                      onChange={(e) => setDeliveryForm({...deliveryForm, address_line_1: e.target.value})}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address_line_2"
                      value={deliveryForm.address_line_2}
                      onChange={(e) => setDeliveryForm({...deliveryForm, address_line_2: e.target.value})}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="postal_code">Postcode</Label>
                      <Input
                        id="postal_code"
                        value={deliveryForm.postal_code}
                        onChange={(e) => setDeliveryForm({...deliveryForm, postal_code: e.target.value})}
                        placeholder="SW1A 1AA"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="delivery_notes">Delivery Notes (Optional)</Label>
                    <Input
                      id="delivery_notes"
                      value={deliveryForm.delivery_notes}
                      onChange={(e) => setDeliveryForm({...deliveryForm, delivery_notes: e.target.value})}
                      placeholder="Special instructions"
                    />
                  </div>
                  <Button onClick={handleSaveDelivery} className="w-full bg-primary-500 hover:bg-primary-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Address
                  </Button>
                </div>
              ) : deliveryAddress ? (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{deliveryForm.address_line_1}</p>
                    {deliveryForm.address_line_2 && <p className="text-gray-600">{deliveryForm.address_line_2}</p>}
                    <p className="text-gray-600">{deliveryForm.city}, {deliveryForm.postal_code}</p>
                    {deliveryForm.delivery_notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">"{deliveryForm.delivery_notes}"</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No address saved</p>
                  <Button onClick={() => setEditingDelivery(true)} variant="outline" size="sm">
                    Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Party */}
          {currentParty && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  <span>Current Party</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Party for</span>
                    <span className="font-medium">{currentParty.child_name}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{formatDate(currentParty.party_date)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-medium">{currentParty.guest_count}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Status</span>
                    <Badge variant={currentParty.status === 'confirmed' ? 'default' : 'secondary'}>
                      {currentParty.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <a href="/dashboard">View Dashboard</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Legal Links */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="/terms" className="text-gray-500 hover:text-gray-700">Terms of Service</a>
                <a href="/privacy-policy" className="text-gray-500 hover:text-gray-700">Privacy Policy</a>
                <a href="/cookies" className="text-gray-500 hover:text-gray-700">Cookie Policy</a>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button
            variant="outline"
            className="w-full text-gray-600 hover:text-gray-800"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>

          {/* Support */}
          <p className="text-center text-sm text-gray-500">
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
