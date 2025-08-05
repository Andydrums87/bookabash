"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock3,
  Download,
  Filter,
  Search,
  ArrowLeft,
  MessageSquare,
  Baby,
  Utensils,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Share2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"



export default function RSVPManagementPage({ partyId, onBack }) {
  const [rsvps, setRsvps] = useState([])
  const [partyData, setPartyData] = useState(null)
  const [inviteData, setInviteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredRsvps, setFilteredRsvps] = useState([])
  const [activeTab, setActiveTab] = useState("rsvps") // "invite" or "rsvps"

  // Load RSVP data and invite data
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading RSVPs and invite data for party:", partyId)
        
        // Load RSVPs
        const rsvpResult = await partyDatabaseBackend.getPartyRSVPs(partyId)
        if (rsvpResult.success) {
          setRsvps(rsvpResult.rsvps || [])
          setPartyData(rsvpResult.party || null)
        }

        // Load invite data
        const inviteResult = await partyDatabaseBackend.getEInvites(partyId)
        if (inviteResult.success && inviteResult.einvites) {
          setInviteData(inviteResult.einvites)
        }

      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (partyId) {
      loadData()
    }
  }, [partyId])

  // Filter RSVPs
  useEffect(() => {
    let filtered = [...rsvps]

    if (searchQuery) {
      filtered = filtered.filter((rsvp) => 
        rsvp.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rsvp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rsvp.phone?.includes(searchQuery)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((rsvp) => rsvp.status === statusFilter)
    }

    setFilteredRsvps(filtered)
  }, [rsvps, searchQuery, statusFilter])

  // Calculate statistics
  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.status === 'yes').length,
    notAttending: rsvps.filter(r => r.status === 'no').length,
    maybe: rsvps.filter(r => r.status === 'maybe').length,
    totalGuests: rsvps.reduce((sum, r) => sum + (r.guest_count || 1), 0),
    totalChildren: rsvps.reduce((sum, r) => sum + (r.children_count || 0), 0),
    dietaryRequests: rsvps.filter(r => r.dietary_requirements?.trim()).length
  }

  const exportRSVPs = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Guest Count', 'Children Count', 'Dietary Requirements', 'Message', 'RSVP Date'].join(','),
      ...filteredRsvps.map(rsvp => [
        rsvp.guest_name || '',
        rsvp.email || '',
        rsvp.phone || '',
        rsvp.status || '',
        rsvp.guest_count || 1,
        rsvp.children_count || 0,
        `"${(rsvp.dietary_requirements || '').replace(/"/g, '""')}"`,
        `"${(rsvp.message || '').replace(/"/g, '""')}"`,
        new Date(rsvp.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsvps-${partyData?.child_name || 'party'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading party details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Title & Back Button */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="hover:bg-white/50 rounded-full p-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{partyData?.child_name}'s Party</h1>
            <p className="text-gray-600">{partyData?.theme} themed celebration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column - Featured Invitation */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <Card className="bg-white/70 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Your Invitation</h2>
                    <p className="text-gray-600">This is what your guests see</p>
                  </div>

                  {/* Featured Invitation Display */}
                  <div className="flex justify-center mb-6">
                    {/* {inviteData ? (
                      <InviteDisplay
                        generatedImage={inviteData.image}
                        inviteData={inviteData.inviteData}
                        selectedTheme={inviteData.theme}
                        className="transform hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full max-w-[300px] aspect-[3/4] rounded-xl border-2 border-dashed border-purple-300 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                        <div className="text-center text-purple-600">
                          <div className="text-4xl mb-4">📨</div>
                          <div className="font-bold text-lg">No Invitation</div>
                          <div className="text-sm">Create an invite to see it here</div>
                        </div>
                      </div>
                    )} */}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {/* Party Details Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <h3 className="font-bold text-gray-900 mb-3">📋 Party Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>{partyData?.party_date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>{partyData?.party_time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span>{partyData?.location}</span>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - RSVP Management */}
          <div className="lg:col-span-3">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard 
                icon={CheckCircle}
                value={stats.attending}
                label="Attending"
                color="green"
              />
              <StatCard 
                icon={Users}
                value={stats.totalGuests}
                label="Total Guests"
                color="purple"
              />
              <StatCard 
                icon={Baby}
                value={stats.totalChildren}
                label="Children"
                color="pink"
              />
              <StatCard 
                icon={Utensils}
                value={stats.dietaryRequests}
                label="Dietary Needs"
                color="orange"
              />
            </div>

            {/* Controls */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search guests..."
                        className="pl-12 h-11 border-0 bg-white/80 shadow-sm rounded-xl"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 h-11 border-0 bg-white/80 shadow-sm rounded-xl">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All RSVPs</SelectItem>
                      <SelectItem value="yes">Attending</SelectItem>
                      <SelectItem value="no">Not Attending</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={exportRSVPs}
                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RSVP List */}
            <div className="space-y-4">
              {filteredRsvps.length > 0 ? (
                filteredRsvps.map((rsvp) => (
                  <RSVPCard key={rsvp.id} rsvp={rsvp} />
                ))
              ) : (
                <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {rsvps.length === 0 ? "No RSVPs yet" : "No matching RSVPs"}
                    </h3>
                    <p className="text-gray-600">
                      {rsvps.length === 0
                        ? "RSVPs will appear here as guests respond to your invitation."
                        : "Try adjusting your search or filter."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// Statistics Card Component
function StatCard({ icon: Icon, value, label, color }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600 border-green-200',
    red: 'bg-red-100 text-red-600 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    pink: 'bg-pink-100 text-pink-600 border-pink-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200'
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardContent className="p-4 text-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
      </CardContent>
    </Card>
  )
}

// Individual RSVP Card Component
function RSVPCard({ rsvp }) {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'yes':
        return {
          badge: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Attending'
        }
      case 'no':
        return {
          badge: 'bg-red-100 text-red-800',
          icon: XCircle,
          label: 'Not Attending'
        }
      case 'maybe':
        return {
          badge: 'bg-yellow-100 text-yellow-800',
          icon: Clock3,
          label: 'Maybe'
        }
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          icon: Users,
          label: 'Unknown'
        }
    }
  }

  const statusInfo = getStatusInfo(rsvp.status)
  const StatusIcon = statusInfo.icon

  return (
    <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{rsvp.guest_name}</h3>
              <Badge className={`${statusInfo.badge} font-medium px-3 py-1 rounded-full border-0`}>
                <StatusIcon className="w-3 h-3 mr-1.5" />
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{rsvp.guest_count || 1} guest{(rsvp.guest_count || 1) !== 1 ? 's' : ''}</span>
              </div>
              
              {(rsvp.children_count || 0) > 0 && (
                <div className="flex items-center space-x-2">
                  <Baby className="w-4 h-4" />
                  <span>{rsvp.children_count} child{rsvp.children_count !== 1 ? 'ren' : ''}</span>
                </div>
              )}
              
              {rsvp.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{rsvp.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3">
          {rsvp.dietary_requirements?.trim() && (
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="flex items-start space-x-2">
                <Utensils className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-orange-900 text-sm mb-1">Dietary Requirements</div>
                  <div className="text-orange-800 text-sm">{rsvp.dietary_requirements}</div>
                </div>
              </div>
            </div>
          )}

          {rsvp.message?.trim() && (
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-blue-900 text-sm mb-1">Message</div>
                  <div className="text-blue-800 text-sm">{rsvp.message}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}