"use client"

import { useState, useEffect } from "react"
import { Users, CheckCircle, XCircle, Clock3, Edit, Trash2, Mail, MessageSquare, UtensilsCrossed, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

// Mobile RSVP Card Component
const RSVPCard = ({ rsvp, onEdit, onRemove }) => {
  const [expanded, setExpanded] = useState(false)
  
  const getStatusInfo = (status) => {
    switch (status) {
      case "yes":
        return {
          badge: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "✓ Confirmed",
          color: "text-green-600"
        }
      case "no":
        return {
          badge: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          label: "✗ Declined",
          color: "text-red-600"
        }
      case "maybe":
        return {
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock3,
          label: "Maybe",
          color: "text-yellow-600"
        }
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Users,
          label: "Pending",
          color: "text-gray-600"
        }
    }
  }

  const statusInfo = getStatusInfo(rsvp.attendance)
  const StatusIcon = statusInfo.icon
  const totalGuests = (rsvp.adults_count || 1) + (rsvp.children_count || 0)

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{rsvp.guest_name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</span>
              {rsvp.guest_email && (
                <>
                  <span>•</span>
                  <Mail className="w-4 h-4" />
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${statusInfo.badge} font-medium px-3 py-1 rounded-full border`}>
              {statusInfo.label}
            </Badge>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Guest Count Row */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Adults:</span>
            <span className="font-medium">{rsvp.adults_count || 1}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Children:</span>
            <span className="font-medium">{rsvp.children_count || 0}</span>
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="flex items-center gap-4">
          {rsvp.dietary_requirements?.trim() && (
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Dietary needs</span>
            </div>
          )}
          {rsvp.message?.trim() && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <MessageSquare className="w-4 h-4" />
              <span>Has message</span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-3">
            {rsvp.guest_email && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-sm text-gray-900 mt-1">{rsvp.guest_email}</p>
              </div>
            )}
            
            {rsvp.dietary_requirements?.trim() && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dietary Requirements</label>
                <p className="text-sm text-gray-900 mt-1">{rsvp.dietary_requirements}</p>
              </div>
            )}
            
            {rsvp.message?.trim() && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Message</label>
                <p className="text-sm text-gray-900 mt-1">{rsvp.message}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(rsvp)}
                className="flex-1 border-gray-300 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(rsvp)}
                className="flex-1 border-gray-300 hover:border-red-500 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Desktop Table Row Component
const RSVPTableRow = ({ rsvp, onEdit, onRemove }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case "yes":
        return {
          badge: "bg-green-100 text-green-800",
          icon: CheckCircle,
          label: "✓ Confirmed",
        }
      case "no":
        return {
          badge: "bg-red-100 text-red-800",
          icon: XCircle,
          label: "✗ Declined",
        }
      case "maybe":
        return {
          badge: "bg-yellow-100 text-yellow-800",
          icon: Clock3,
          label: "Maybe",
        }
      default:
        return {
          badge: "bg-gray-100 text-gray-800",
          icon: Users,
          label: "Pending",
        }
    }
  }

  const statusInfo = getStatusInfo(rsvp.attendance)

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{rsvp.guest_name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{rsvp.guest_email || "N/A"}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{rsvp.adults_count || 1}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{rsvp.children_count || 0}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge className={`${statusInfo.badge} font-medium px-3 py-1 rounded-full border-0`}>
          {statusInfo.label}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500 max-w-xs truncate">
          {rsvp.dietary_requirements?.trim() || "None"}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500 max-w-xs truncate">
          {rsvp.message?.trim() || "No message"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(rsvp)}
            className="border-gray-300 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))] bg-transparent"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(rsvp)}
            className="border-gray-300 hover:border-red-500 hover:text-red-500 bg-transparent"
          >
            Remove
          </Button>
        </div>
      </td>
    </tr>
  )
}

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

  const handleEdit = (rsvp) => {
    console.log("Edit RSVP:", rsvp)
    // TODO: Implement edit functionality
  }

  const handleRemove = (rsvp) => {
    console.log("Remove RSVP:", rsvp)
    // TODO: Implement remove functionality
  }

  // Calculate statistics
  const stats = {
    total: rsvps.length,
    attending: rsvps.filter((r) => r.attendance === "yes").length,
    notAttending: rsvps.filter((r) => r.attendance === "no").length,
    maybe: rsvps.filter((r) => r.attendance === "maybe").length,
    totalGuests: rsvps
      .filter((r) => r.attendance === "yes")
      .reduce((sum, r) => sum + (r.adults_count || 1) + (r.children_count || 0), 0),
    dietaryRequests: rsvps.filter((r) => r.dietary_requirements?.trim()).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[hsl(var(--primary-500))] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[hsl(var(--primary-600))] font-medium">Loading RSVPs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
      <ContextualBreadcrumb currentPage="rsvps" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">RSVP Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatWidget title="Total RSVPs" value={stats.total} bgColor="bg-[hsl(var(--primary-500))]" />
          <StatWidget title="Confirmed" value={stats.attending} bgColor="bg-[hsl(var(--primary-600))]" />
          <StatWidget title="Total Guests" value={stats.totalGuests} bgColor="bg-[hsl(var(--primary-400))]" />
          <StatWidget title="Dietary Requests" value={stats.dietaryRequests} bgColor="bg-[hsl(var(--primary-300))]" />
        </div>

        {rsvps.length > 0 ? (
          <>
            {/* Mobile: Card Layout */}
            <div className="lg:hidden space-y-4">
              {rsvps.map((rsvp) => (
                <RSVPCard 
                  key={rsvp.id} 
                  rsvp={rsvp} 
                  onEdit={handleEdit}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Guest Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Adults
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Children
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Dietary Requirements
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rsvps.map((rsvp) => (
                      <RSVPTableRow 
                        key={rsvp.id} 
                        rsvp={rsvp}
                        onEdit={handleEdit}
                        onRemove={handleRemove}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <Card className="bg-white shadow-lg border-0 rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[hsl(var(--primary-100))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[hsl(var(--primary-500))]" />
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--primary-900))] mb-2">No RSVPs yet</h3>
              <p className="text-[hsl(var(--primary-600))]">
                RSVPs will appear here as guests respond to your invitation.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatWidget({ title, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 sm:p-6 text-white shadow-lg`}>
      <h3 className="text-white/90 text-xs sm:text-sm font-medium mb-2">{title}</h3>
      <div className="text-2xl sm:text-3xl font-bold">{value}</div>
    </div>
  )
}