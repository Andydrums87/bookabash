"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSupplier } from "@/hooks/useSupplier"
import { Badge, TrendingUp, Calendar, Settings, Users } from "lucide-react"
import EnquiryNotificationBanner from '@/components/EnquiryNotificationBanner'
import { HeaderEnquiryBadge } from '@/components/EnquiryNotificationBanner'
import DebugBusinessSwitchEvents from "./components/DebugBusinessSwitchEvents"

// 👈 ADD THESE IMPORTS
import { BusinessProvider } from "../../../contexts/BusinessContext"
import EnquiryOverviewSection from "./components/EnquiryOverviewSection"


export default function SupplierDashboard() {
  const { supplier, supplierData, loading } = useSupplier()
  const [currentMonth, setCurrentMonth] = useState("June 2025")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Sample data - replace with actual data from your supplier
  const name = supplierData?.owner?.name || "Paul"
  const leads = [
    { service: "Jungle Safari", lead: "Sarah M.", date: "Jun 15", status: "Replied", id: 1 },
    { service: "Dinosaur Discovery Day", lead: "Emily C.", date: "Mar 22", status: "Waiting", id: 2 },
    { service: "Pirate Treasure Hunt", lead: "Michael T.", date: "Oct 5", status: "Replied", id: 3 },
    { service: "Fairy Tale Carnival", lead: "Jessica L.", date: "Feb 14", status: "Waiting", id: 4 },
    { service: "Space Explorer Adventure", lead: "Sophia M.", date: "Nov 11", status: "Replied", id: 5 },
    { service: "Superhero Training Camp", lead: "James W.", date: "Apr 1", status: "Replied", id: 6 },
    { service: "Rainbow Magic Festival", lead: "David J.", date: "Aug 30", status: "Waiting", id: 7 },
  ]

  const upcomingEvents = [
    {
      date: "June 15",
      events: [
        { name: "Jungle Safari", location: "12 Oxford Street, Soho" },
        { name: "Space Explorer Adventure", location: "221B Baker Street" },
      ],
    },
    {
      date: "June 16",
      events: [
        { name: "Fairy Tale Carnival", location: "Flat 5, 10 Downing Street" },
        { name: "Dinosaur Discovery Day", location: "45 Kings Road, Chelsea" },
      ],
    },
    { date: "June 17", events: [], free: true },
    {
      date: "June 18",
      events: [{ name: "Rainbow Magic Festival", location: "12 Oxford Street, Soho" }],
    },
  ]

  return (
    <BusinessProvider>

      <div className="min-h-screen bg-primary-50">
        <div className="max-w-7xl mx-auto">

        <EnquiryNotificationBanner />
          {/* Welcome Header - Mobile Optimized */}
          <div className="p-4 sm:p-6">
          <HeaderEnquiryBadge />
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-5xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 leading-tight">
                Welcome back, {name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                See new requests, update your profile, and manage availability—all in one place
              </p>
            </div>
          </div>

          {/* Main Content Grid - Mobile Optimized */}
          <div className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Leads Table - Mobile Optimized */}
              <div className="xl:col-span-2">
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    {/* Mobile Table Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-200 bg-muted/20">
                      <h2 className="text-lg sm:text-xl font-semibold">Recent Enquiries</h2>
                      <p className="text-sm text-muted-foreground mt-1">Manage your latest booking requests</p>
                    </div>

               <EnquiryOverviewSection />

                   

                   
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Section - Mobile Optimized */}
              <div className="space-y-4">
                <Card className="shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    {/* Calendar Header */}
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="font-semibold text-sm sm:text-base">{currentMonth}</h2>
                      <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Upcoming Events */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-3">Upcoming Events</h3>
                      {upcomingEvents.map((day) => (
                        <div key={day.date} className="space-y-2">
                          <h4 className="font-medium text-xs sm:text-sm text-gray-700">{day.date}</h4>
                          {day.free ? (
                            <div className="py-3 text-center text-muted-foreground text-sm bg-gray-50 rounded-lg">
                              Free
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {day.events?.map((event, idx) => (
                                <div
                                  key={idx}
                                  className="border-l-4 border-orange-500 pl-3 py-2 bg-orange-50 rounded-r-lg"
                                >
                                  <div className="font-medium text-sm">{event.name}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{event.location}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Empty Calendar State */}
                      {upcomingEvents.length === 0 && (
                        <div className="text-center py-6">
                          <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">No upcoming events</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Button variant="outline" className="h-12 sm:h-14 bg-transparent text-sm sm:text-base touch-manipulation">
                <TrendingUp className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View earnings</span>
                <span className="sm:hidden">Earnings</span>
              </Button>
              <Button variant="outline" className="h-12 sm:h-14 bg-transparent text-sm sm:text-base touch-manipulation">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Manage availability</span>
                <span className="sm:hidden">Availability</span>
              </Button>
              <Button variant="outline" className="h-12 sm:h-14 bg-transparent text-sm sm:text-base touch-manipulation">
                <Settings className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Manage upsells</span>
                <span className="sm:hidden">Upsells</span>
              </Button>
              <Button className="h-12 sm:h-14 bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white text-sm sm:text-base touch-manipulation">
                <Users className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Edit profile</span>
                <span className="sm:hidden">Profile</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats Cards - Mobile Optimized */}
          <div className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary-600">12</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">New Enquiries</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">£2,450</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">This Month</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">8</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Bookings</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">4.9</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Rating</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </BusinessProvider>
  )
}