// components/EnquiryNotificationBanner.js
// Notification banner for suppliers showing new enquiries

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Mail, Clock, Eye, MessageSquare, X } from "lucide-react"
import Link from "next/link"
import { useEnquiryStats } from "@/utils/supplierEnquiryBackend"

export default function EnquiryNotificationBanner() {
  const { stats, loading } = useEnquiryStats()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if no pending enquiries or if dismissed
  if (loading || dismissed || stats.pending === 0) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg mb-6 w-[90%]">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start space-x-4">
          {/* Notification Icon */}
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
            <Bell className="w-6 h-6 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  🎉 New Party Enquiries!
                  <Badge className="bg-blue-500 text-white">
                    {stats.pending} new
                  </Badge>
                </h3>
                
                <p className="text-blue-800 mb-4">
                  You have {stats.pending} new party enquir{stats.pending === 1 ? 'y' : 'ies'} waiting for your response.
                  Respond quickly to secure these bookings!
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                      <Mail className="w-3 h-3 text-blue-700" />
                    </div>
                    <span className="text-blue-800">
                      <strong>{stats.pending}</strong> new enquiries
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                      <Eye className="w-3 h-3 text-blue-700" />
                    </div>
                    <span className="text-blue-800">
                      <strong>{stats.viewed}</strong> viewed
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-3 h-3 text-green-700" />
                    </div>
                    <span className="text-blue-800">
                      <strong>{stats.accepted}</strong> accepted
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <Link href="/suppliers/enquiries">
                      <Bell className="w-4 h-4 mr-2" />
                      View All Enquiries
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    asChild
                  >
                    <Link href="/suppliers/enquiries?status=pending">
                      <Clock className="w-4 h-4 mr-2" />
                      Respond Now
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Dismiss Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact notification for mobile/header
export function CompactEnquiryNotification() {
  const { stats, loading } = useEnquiryStats()

  if (loading || stats.pending === 0) {
    return null
  }

  return (
    <Link href="/suppliers/enquiries?status=pending">
      <Button 
        variant="outline" 
        size="sm" 
        className="relative border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        <Bell className="w-4 h-4 mr-2" />
        {stats.pending} New
        {stats.pending > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </Button>
    </Link>
  )
}

// Header notification badge (for navigation)
export function HeaderEnquiryBadge() {
  const { stats, loading } = useEnquiryStats()

  if (loading || stats.pending === 0) {
    return (
      <Link href="/suppliers/enquiries">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
          <Bell className="w-5 h-5" />
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/suppliers/enquiries">
      <Button variant="ghost" size="sm" className="relative text-blue-600 hover:text-blue-800">
        <Bell className="w-5 h-5" />
        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-0 h-5 w-5 p-0 flex items-center justify-center">
          {stats.pending > 9 ? '9+' : stats.pending}
        </Badge>
      </Button>
    </Link>
  )
}