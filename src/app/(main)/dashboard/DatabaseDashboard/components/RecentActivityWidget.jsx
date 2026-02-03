"use client"

import { Bell, CheckCircle, PartyPopper, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function RecentActivityWidget({
  partyId,
  enquiries = [],
  partyData = {},
  einvites = {},
}) {
  const activities = []

  // Booking confirmed (single event if any suppliers are paid)
  const paidEnquiries = enquiries.filter(e =>
    e.payment_status === 'paid' || e.payment_status === 'fully_paid'
  )
  if (paidEnquiries.length > 0) {
    const latestPayment = paidEnquiries.reduce((latest, e) => {
      const timestamp = e.updated_at || e.created_at
      return !latest || new Date(timestamp) > new Date(latest) ? timestamp : latest
    }, null)

    activities.push({
      id: 'booking-complete',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      title: 'Booking confirmed',
      description: paidEnquiries.length === 1
        ? `${paidEnquiries[0].suppliers?.business_name || 'Supplier'} secured`
        : `${paidEnquiries.length} suppliers secured`,
      timestamp: latestPayment,
    })
  }

  // E-invite created
  if (einvites?.created_at) {
    activities.push({
      id: 'einvite-created',
      icon: Mail,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-50',
      title: 'Invite created',
      description: 'Digital invitation ready to share',
      timestamp: einvites.created_at,
    })
  }

  // Party created
  if (partyData.created_at) {
    activities.push({
      id: 'party-created',
      icon: PartyPopper,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      title: 'Party created',
      description: `${partyData.child_name}'s party planning started`,
      timestamp: partyData.created_at,
    })
  }

  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return ''
    }
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <Bell className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-6">
          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No recent activity yet</p>
          <p className="text-xs text-gray-400 mt-1">Updates will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <Bell className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const IconComponent = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
