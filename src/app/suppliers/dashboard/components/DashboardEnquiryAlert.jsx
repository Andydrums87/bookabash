// components/DashboardEnquiryAlert.js
// Simple alert banner for new enquiries on dashboard

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Eye } from "lucide-react"
import Link from "next/link"
import { useEnquiryStats } from "@/utils/supplierEnquiryBackend"

export default function DashboardEnquiryAlert() {
  const { stats, loading } = useEnquiryStats()

  // Only show if there are pending enquiries
  if (loading || !stats.pending || stats.pending === 0) {
    return null
  }

  return (
    <Card className="border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">
                {stats.pending} New Enquir{stats.pending === 1 ? 'y' : 'ies'}!
              </h3>
              <p className="text-sm text-primary-700">
                Respond quickly to secure these bookings
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-primary-500 text-white">
              {stats.pending} pending
            </Badge>
            <Link href="/suppliers/enquiries?status=pending">
              <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
                <Eye className="w-4 h-4 mr-1" />
                View Now
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}