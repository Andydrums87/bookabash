"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, CheckCircle, Eye, Calendar, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function RSVPSummaryCard({ partyId }) {
  const router = useRouter()
  const [rsvpStats, setRsvpStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRSVPStats = async () => {
      try {
        const result = await partyDatabaseBackend.getPartyRSVPs(partyId)
        if (result.success) {
          const rsvps = result.rsvps || []
          const stats = {
            total: rsvps.length,
            attending: rsvps.filter(r => r.status === 'yes').length,
            notAttending: rsvps.filter(r => r.status === 'no').length,
            maybe: rsvps.filter(r => r.status === 'maybe').length,
            totalGuests: rsvps.reduce((sum, r) => sum + (r.guest_count || 1), 0),
            recent: rsvps.slice(0, 3) // Last 3 RSVPs for preview
          }
          setRsvpStats(stats)
        }
      } catch (error) {
        console.error("Error loading RSVP stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (partyId) {
      loadRSVPStats()
    }
  }, [partyId])

  const handleViewRSVPs = () => {
    router.push(`/rsvps/${partyId}`)
  }

  if (loading) {
    return (
      <Card className="bg-white shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 h-80 relative">
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-gray-800 font-semibold">
              Party RSVPs
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/20 text-white border-0 font-semibold backdrop-blur-sm">
              Loading...
            </Badge>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        </div>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const attendanceRate = rsvpStats?.total > 0 ? Math.round((rsvpStats.attending / rsvpStats.total) * 100) : 0

  return (
    <Card className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Hero Image Section */}
      <div className="relative h-85 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
        {/* Background Image */}
        <img 
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/okpcftsuni04yokhex1l.jpg"
          alt="Party RSVPs"
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
        
        {/* Top Labels */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 text-gray-800 font-semibold px-4 py-2">
            Party RSVPs
          </Badge>
        </div>
        
        <div className="absolute top-4 right-4">
          <Badge className={`${rsvpStats?.total > 0 ? 'bg-green-500' : 'bg-yellow-500'} text-white border-0 font-semibold px-4 py-2`}>
            {rsvpStats?.total > 0 ? 'Ready' : 'Pending'}
          </Badge>
        </div>

        {/* Attendance Rate Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{attendanceRate}%</div>
            <div className="text-sm text-gray-600">Attending</div>
          </div>
        </div>

        {/* Guest Count Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{rsvpStats?.totalGuests || 0}</div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Party RSVPs Ready! 🎉
          </h2>
          <p className="text-gray-600 text-md">
            {rsvpStats?.total || 0} responses • {rsvpStats?.attending || 0} attending
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8 ">
          <div className="text-center">
            <div className="text-1xl font-bold text-blue-600 mb-1">{rsvpStats?.total || 0}</div>
            <div className="text-xs text-gray-600 font-medium">Total RSVPs</div>
          </div>
          <div className="text-center">
            <div className="text-1xl font-bold text-green-600 mb-1">{rsvpStats?.attending || 0}</div>
            <div className="text-xs text-gray-600 font-medium">Attending</div>
          </div>
          <div className="text-center">
            <div className="text-1xl font-bold text-purple-600 mb-1">{attendanceRate}%</div>
            <div className="text-xs text-gray-600 font-medium">Response Rate</div>
          </div>
        </div>

        {/* Recent RSVPs Preview */}
        {/* {rsvpStats?.recent && rsvpStats.recent.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Responses</h3>
            <div className="space-y-2">
              {rsvpStats.recent.map((rsvp, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-900">{rsvp.guest_name}</span>
                  <div className="flex items-center space-x-2">
                    {rsvp.status === 'yes' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {rsvp.status === 'no' && <span className="text-red-500 text-sm">❌</span>}
                    {rsvp.status === 'maybe' && <span className="text-yellow-500 text-sm">🤔</span>}
                    <span className="text-sm text-gray-600 capitalize">{rsvp.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleViewRSVPs}
            className="w-full bg-primary-400 hover:bg-[hsl(var(--primary-700))] text-white border-0 rounded-xl font-semibold py-3 text-sm"
          >
            <Eye className="w-5 h-5 mr-2" />
            Manage RSVPs
          </Button>
          
          <Button 
            variant="outline"
            className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-2xl font-semibold py-3"
          >
            <Users className="w-5 h-5 mr-2" />
            Guest List Overview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}