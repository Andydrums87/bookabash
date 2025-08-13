"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Clock3,
  ArrowLeft,
  MessageSquare,
  Baby,
  Utensils
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

export default function RSVPManagementPage({ partyId, onBack }) {
  const [rsvps, setRsvps] = useState([])
  const [partyData, setPartyData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load RSVP data and party details
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading RSVPs and party data for party:", partyId)
        
        // Load RSVPs
        const rsvpResult = await partyDatabaseBackend.getPartyRSVPs(partyId)
        if (rsvpResult.success) {
          setRsvps(rsvpResult.rsvps || [])
        }

        // Load party details
        const partyResult = await partyDatabaseBackend.getPartyById(partyId)
        console.log("Party details result:", partyResult)
        
        if (partyResult.success && partyResult.party) {
          setPartyData(partyResult.party)
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

  // Calculate statistics
  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attendance === 'yes').length,
    notAttending: rsvps.filter(r => r.attendance === 'no').length,
    maybe: rsvps.filter(r => r.attendance === 'maybe').length,
    totalGuests: rsvps
      .filter(r => r.attendance === 'yes')
      .reduce((sum, r) => sum + (r.adults_count || 1) + (r.children_count || 0), 0),
    dietaryRequests: rsvps.filter(r => r.dietary_requirements?.trim()).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[hsl(var(--primary-500))] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading RSVPs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
      <ContextualBreadcrumb currentPage="rsvps" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="hover:bg-white/50  rounded-full p-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {partyData?.child_name ? `${partyData.child_name}'s Party RSVPs` : 'Party RSVPs'}
            </h1>
            {partyData && (
              <div className="flex items-center space-x-4 mt-2 ">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{partyData.party_date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{partyData.party_time}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={CheckCircle}
            value={stats.attending}
            label="Confirmed"
            color="green"
          />
          <StatCard 
            icon={XCircle}
            value={stats.notAttending}
            label="Declined"
            color="red"
          />
          <StatCard 
            icon={Clock3}
            value={stats.maybe}
            label="Maybe"
            color="yellow"
          />
          <StatCard 
            icon={Users}
            value={stats.totalGuests}
            label="Total Guests"
            color="primary"
          />
        </div>

        {/* RSVP List */}
        {rsvps.length > 0 ? (
          <div className="space-y-4">
            {rsvps.map((rsvp) => (
              <RSVPCard key={rsvp.id} rsvp={rsvp} />
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-lg border-0 rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">No RSVPs yet</h3>
              <p className="text-primary-600">
                RSVPs will appear here as guests respond to your invitation.
              </p>
            </CardContent>
          </Card>
        )}

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
    primary: 'bg-primary-100 text-primary-600 border-primary-200'
  }

  return (
    <Card className="bg-white shadow-lg border-0 rounded-2xl">
      <CardContent className="p-6 text-center">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
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

  const statusInfo = getStatusInfo(rsvp.attendance)
  const StatusIcon = statusInfo.icon

  return (
    <Card className="bg-white shadow-lg border-0 rounded-2xl hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <h3 className="text-lg font-semibold text-primary-900">{rsvp.guest_name}</h3>
              <Badge className={`${statusInfo.badge} font-medium px-3 py-1 rounded-full border-0`}>
                <StatusIcon className="w-3 h-3 mr-1.5" />
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-primary-600 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>
                  {(rsvp.adults_count || 1)} adult{(rsvp.adults_count || 1) !== 1 ? 's' : ''}
                </span>
              </div>
              
              {(rsvp.children_count || 0) > 0 && (
                <div className="flex items-center space-x-2">
                  <Baby className="w-4 h-4" />
                  <span>{rsvp.children_count} child{rsvp.children_count !== 1 ? 'ren' : ''}</span>
                </div>
              )}
              
              {rsvp.guest_email && (
                <div className="flex items-center space-x-2">
                  <span className="truncate">{rsvp.guest_email}</span>
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
            <div className="bg-primary-50 rounded-xl p-3">
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-primary-900 text-sm mb-1">Message</div>
                  <div className="text-primary-800 text-sm">{rsvp.message}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}