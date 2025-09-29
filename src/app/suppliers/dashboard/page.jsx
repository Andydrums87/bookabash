"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSupplier } from "@/hooks/useSupplier"
import { TrendingUp, Calendar, Settings, Users } from "lucide-react"
import EnquiryNotificationBanner from "@/components/EnquiryNotificationBanner"
import { HeaderEnquiryBadge } from "@/components/EnquiryNotificationBanner"
import { BusinessProvider } from "../../../contexts/BusinessContext"
import EnquiryOverviewSection from "./components/EnquiryOverviewSection"
import { useSupplierEnquiries } from "@/utils/supplierEnquiryBackend"
import { 
  DashboardSkeleton, 
  CalendarSkeleton, 
  ActionButtonsSkeleton, 
  StatsCardsSkeleton 
} from "./components/DashboardSkeletons"

export default function SupplierDashboard() {
  const { supplier, supplierData, loading, currentBusiness } = useSupplier()
  const { enquiries, loading: enquiriesLoading } = useSupplierEnquiries(null, currentBusiness?.id)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  })

  // Calculate real stats from enquiries
  const stats = useMemo(() => {
    if (!enquiries || enquiries.length === 0) {
      return {
        newEnquiries: 0,
        monthlyEarnings: 0,
        bookingsCount: 0,
        rating: supplierData?.rating || 0
      }
    }

    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Filter enquiries for current month
    const thisMonthEnquiries = enquiries.filter(e => {
      const createdDate = new Date(e.created_at)
      return createdDate >= currentMonthStart
    })

    // Count new enquiries (pending + viewed)
    const newEnquiries = thisMonthEnquiries.filter(
      e => e.status === 'pending' || e.status === 'viewed'
    ).length

    // Calculate monthly earnings from accepted bookings
    const monthlyEarnings = thisMonthEnquiries
      .filter(e => e.status === 'accepted' && e.final_price)
      .reduce((sum, e) => sum + (parseFloat(e.final_price) || 0), 0)

    // Count total bookings (accepted enquiries)
    const bookingsCount = enquiries.filter(e => e.status === 'accepted').length

    return {
      newEnquiries,
      monthlyEarnings,
      bookingsCount,
      rating: supplierData?.rating || 0
    }
  }, [enquiries, supplierData])

  // Get upcoming events from accepted enquiries
  const upcomingEvents = useMemo(() => {
    if (!enquiries || enquiries.length === 0) return []

    const now = new Date()
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Get accepted bookings for the next week
    const acceptedBookings = enquiries.filter(e => {
      if (e.status !== 'accepted' || !e.parties) return false
      
      const partyDate = new Date(e.parties.party_date)
      return partyDate >= now && partyDate <= nextWeek
    })

    // Group by date
    const eventsByDate = {}
    acceptedBookings.forEach(booking => {
      const partyDate = new Date(booking.parties.party_date)
      const dateKey = partyDate.toLocaleDateString('en-GB', { 
        month: 'long', 
        day: 'numeric' 
      })

      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = []
      }

      eventsByDate[dateKey].push({
        name: booking.parties.party_name || `${booking.parties.child_name}'s Party`,
        location: booking.parties.venue_location || 'Location TBD',
        time: booking.parties.party_time || ''
      })
    })

    // Convert to array format
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)
      const dateKey = date.toLocaleDateString('en-GB', { 
        month: 'long', 
        day: 'numeric' 
      })

      dates.push({
        date: dateKey,
        events: eventsByDate[dateKey] || [],
        free: !eventsByDate[dateKey] || eventsByDate[dateKey].length === 0
      })
    }

    return dates
  }, [enquiries])

  if (loading || enquiriesLoading) {
    return (
      <BusinessProvider>
        <DashboardSkeleton />
      </BusinessProvider>
    )
  }

  const name = supplierData?.owner?.name || supplierData?.owner?.firstName || "there"

  return (
    <BusinessProvider>
      <div className="min-h-screen bg-primary-50">
        <div className="max-w-7xl mx-auto">
          <EnquiryNotificationBanner />

          {/* Welcome Header */}
          <div className="p-3 sm:p-4 lg:p-6">
            <HeaderEnquiryBadge />
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                Welcome back, {name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                See new requests, update your profile, and manage availability—all in one place
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Enquiries Table */}
              <div className="xl:col-span-2">
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    <EnquiryOverviewSection />
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Section */}
              <div className="space-y-4">
                <Card className="shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 touch-manipulation"
                        onClick={() => {
                          const date = new Date(currentMonth)
                          date.setMonth(date.getMonth() - 1)
                          setCurrentMonth(date.toLocaleDateString('en-GB', { 
                            month: 'long', 
                            year: 'numeric' 
                          }))
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="font-semibold text-sm sm:text-base">{currentMonth}</h2>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 touch-manipulation"
                        onClick={() => {
                          const date = new Date(currentMonth)
                          date.setMonth(date.getMonth() + 1)
                          setCurrentMonth(date.toLocaleDateString('en-GB', { 
                            month: 'long', 
                            year: 'numeric' 
                          }))
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-3">
                        Next 7 Days
                      </h3>
                      {upcomingEvents.map((day, idx) => (
                        <div key={idx} className="space-y-2">
                          <h4 className="font-medium text-xs sm:text-sm text-gray-700">
                            {day.date}
                          </h4>
                          {day.free ? (
                            <div className="py-2 sm:py-3 text-center text-muted-foreground text-sm bg-gray-50 rounded-lg">
                              Free
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {day.events.map((event, eventIdx) => (
                                <div
                                  key={eventIdx}
                                  className="border-l-4 border-orange-500 pl-3 py-2 bg-orange-50 rounded-r-lg"
                                >
                                  <div className="font-medium text-xs sm:text-sm">
                                    {event.name}
                                    {event.time && (
                                      <span className="text-muted-foreground ml-2">
                                        {event.time}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 break-words">
                                    {event.location}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <Button
                variant="outline"
                className="h-10 sm:h-12 lg:h-14 bg-transparent text-xs sm:text-sm lg:text-base touch-manipulation"
              >
                <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">View earnings</span>
                <span className="sm:hidden">Earnings</span>
              </Button>
              <Button
                variant="outline"
                className="h-10 sm:h-12 lg:h-14 bg-transparent text-xs sm:text-sm lg:text-base touch-manipulation"
              >
                <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Manage availability</span>
                <span className="sm:hidden">Availability</span>
              </Button>
              <Button
                variant="outline"
                className="h-10 sm:h-12 lg:h-14 bg-transparent text-xs sm:text-sm lg:text-base touch-manipulation"
              >
                <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Manage upsells</span>
                <span className="sm:hidden">Upsells</span>
              </Button>
              <Button 
                className="h-10 sm:h-12 lg:h-14 bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white text-xs sm:text-sm lg:text-base touch-manipulation col-span-2 lg:col-span-1"
              >
                <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Edit profile</span>
                <span className="sm:hidden">Profile</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                    {stats.newEnquiries}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">New Enquiries</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                    £{stats.monthlyEarnings.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">This Month</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                    {stats.bookingsCount}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Bookings</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                    {stats.rating > 0 ? stats.rating.toFixed(1) : 'New'}
                  </div>
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