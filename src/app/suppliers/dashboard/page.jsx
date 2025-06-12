"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, DollarSign, MessageSquare, Star, Mail, ArrowUp, Briefcase, TrendingUp } from "lucide-react"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar" // shadcn calendar
import { useState } from "react"

export default function SupplierDashboardPage() {
  const [date, setDate] = useState(new Date())

  const metrics = [
    {
      title: "New Leads",
      value: "12",
      change: "+3 from yesterday",
      Icon: Mail,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trendIcon: ArrowUp,
      trendColor: "text-green-600",
    },
    {
      title: "Response Rate",
      value: "94%",
      change: "Above average",
      Icon: MessageSquare,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Bookings",
      value: "8",
      change: "This month",
      Icon: Briefcase,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Earnings",
      value: "£2,450",
      change: "This month",
      Icon: DollarSign,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ]

  const leads = [
    {
      id: 1,
      title: "Sarah's Princess Party",
      contact: "Emma Thompson",
      timeAgo: "2 hours ago",
      status: "New",
      date: "April 12, 2025",
      time: "2:00 PM - 4:00 PM",
      budget: "£200 - £300",
      description:
        "Looking for princess-themed entertainment for 15 children aged 4-7. Need face painting and interactive activities.",
      avatar: "/andrew.jpg",
    },
    {
      id: 2,
      title: "Superhero Adventure",
      contact: "Mark Johnson",
      timeAgo: "5 hours ago",
      status: "New",
      date: "May 8, 2025",
      time: "1:00 PM - 4:00 PM",
      budget: "£300 - £400",
      description:
        "Need superhero entertainer for 20 kids. Must include games, face painting, and photo opportunities.",
      avatar: "/andrew.jpg",
    },
    {
      id: 3,
      title: "Pirate Treasure Hunt",
      contact: "Lisa Chen",
      timeAgo: "1 day ago",
      status: "Responded",
      date: "March 25, 2025",
      time: "3:00 PM - 5:00 PM",
      budget: "£250 - £350",
      description: "Outdoor pirate party for 12 children. Need treasure hunt activities and pirate character.",
      avatar: "/andrew.jpg",
    },
  ]

  const recentBookings = [
    { id: 1, title: "Emma's Party", date: "March 15, 2025", status: "Confirmed", statusColor: "bg-green-500" },
    { id: 2, title: "Jake's Birthday", date: "March 22, 2025", status: "Pending", statusColor: "bg-yellow-500" },
    { id: 3, title: "Mia's Celebration", date: "April 5, 2025", status: "Completed", statusColor: "bg-blue-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supplier Dashboard</h1>
          <p className="text-muted-foreground">Manage your bookings, leads, and business performance.</p>
        </div>
        <Button>
          <TrendingUp className="mr-2 h-4 w-4" /> View Analytics
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{metric.title}</h3>
                  <div className="text-3xl font-bold text-foreground">{metric.value}</div>
                  {metric.change && (
                    <div
                      className={`flex items-center mt-1 text-xs font-medium ${metric.trendColor || "text-muted-foreground"}`}
                    >
                      {metric.trendIcon && <metric.trendIcon className="h-3 w-3 mr-1" />}
                      <span>{metric.change}</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${metric.iconBg}`}>
                  <metric.Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Inbox */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lead Inbox</CardTitle>
                <Badge variant="secondary" className="text-sm">
                  5 New
                </Badge>
              </div>
              <CardDescription>Review and respond to new customer inquiries.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <Image
                          src={lead.avatar || "/placeholder.svg"}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="rounded-full border"
                        />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{lead.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {lead.contact} • {lead.timeAgo}
                              </p>
                            </div>
                            <Badge
                              variant={lead.status === "New" ? "default" : "outline"}
                              className={`mt-2 sm:mt-0 ${lead.status === "New" ? "bg-primary text-primary-foreground" : ""}`}
                            >
                              {lead.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p className="font-medium text-foreground">{lead.date}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Time</p>
                              <p className="font-medium text-foreground">{lead.time}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Budget</p>
                              <p className="font-medium text-foreground">{lead.budget}</p>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lead.description}</p>

                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm">{lead.status === "Responded" ? "View Response" : "Respond"}</Button>
                            <Button size="sm" variant="outline">
                              {lead.status === "Responded" ? "Follow Up" : "View Details"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline">View All Leads</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Calendar */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick Calendar</CardTitle>
              <CardDescription>Check your availability at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border p-0" />
              <div className="grid grid-cols-3 gap-4 my-4 w-full text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-lg font-bold text-foreground">18</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booked</p>
                  <p className="text-lg font-bold text-foreground">8</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blocked</p>
                  <p className="text-lg font-bold text-foreground">3</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Manage Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>A quick look at your latest bookings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <Card key={booking.id} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-sm text-foreground">{booking.title}</h3>
                        <p className="text-xs text-muted-foreground">{booking.date}</p>
                      </div>
                      <Badge className={`${booking.statusColor} text-white text-xs`}>{booking.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Bookings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Performance Snapshot</CardTitle>
              <CardDescription>Key performance indicators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-sm font-medium text-foreground">68%</p>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  Avg Response Time
                </div>
                <p className="text-sm font-medium text-foreground">2.4 hours</p>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="w-4 h-4 mr-2" />
                  Rating
                </div>
                <div className="flex items-center">
                  <p className="text-sm font-medium text-foreground mr-1">4.8</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? "text-yellow-400 fill-yellow-400" : i === 4 ? "text-yellow-400 fill-yellow-400 opacity-50" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
