"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, DollarSign, MessageSquare, Star, Mail, ArrowUp } from "lucide-react"
import Image from "next/image"
import SupplierLayout from "@/components/supplier-layout"

export default function SupplierDashboardPage() {
  return (
    <SupplierLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600">Manage your bookings, leads, and business performance</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* New Leads */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">New Leads</h3>
                  <div className="text-3xl font-bold">12</div>
                  <div className="flex items-center mt-1 text-xs text-green-600 font-medium">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+3 from yesterday</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Response Rate</h3>
                  <div className="text-3xl font-bold">94%</div>
                  <div className="text-xs text-gray-500 mt-1">Above average</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Bookings</h3>
                  <div className="text-3xl font-bold">8</div>
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>
                <div className="bg-green-50 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earnings */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Earnings</h3>
                  <div className="text-3xl font-bold">£2,450</div>
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>
                <div className="bg-amber-50 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Inbox */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Lead Inbox</h2>
                <Badge className="bg-gray-900 hover:bg-gray-800">5 New</Badge>
              </div>

              <div className="space-y-4">
                {/* Lead 1 */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">Sarah's Princess Party</h3>
                            <p className="text-sm text-gray-500">Emma Thompson • 2 hours ago</p>
                          </div>
                          <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
                            New
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 my-3">
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium">April 12, 2025</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="text-sm font-medium">2:00 PM - 4:00 PM</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Budget</p>
                            <p className="text-sm font-medium">£200 - £300</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          Looking for princess-themed entertainment for 15 children aged 4-7. Need face painting and
                          interactive activities.
                        </p>

                        <div className="flex gap-2">
                          <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                            Respond
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead 2 */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">Superhero Adventure</h3>
                            <p className="text-sm text-gray-500">Mark Johnson • 5 hours ago</p>
                          </div>
                          <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
                            New
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 my-3">
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium">May 8, 2025</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="text-sm font-medium">1:00 PM - 4:00 PM</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Budget</p>
                            <p className="text-sm font-medium">£300 - £400</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          Need superhero entertainer for 20 kids. Must include games, face painting, and photo
                          opportunities.
                        </p>

                        <div className="flex gap-2">
                          <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                            Respond
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead 3 */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">Pirate Treasure Hunt</h3>
                            <p className="text-sm text-gray-500">Lisa Chen • 1 day ago</p>
                          </div>
                          <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50">
                            Responded
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 my-3">
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium">March 25, 2025</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="text-sm font-medium">3:00 PM - 5:00 PM</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Budget</p>
                            <p className="text-sm font-medium">£250 - £350</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          Outdoor pirate party for 12 children. Need treasure hunt activities and pirate character.
                        </p>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Response
                          </Button>
                          <Button size="sm" variant="outline">
                            Follow Up
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 text-center">
                <Button variant="outline" className="text-primary-500 border-primary-200">
                  View All Leads
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Calendar */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Calendar</h2>
              <Card className="mb-4">
                <CardContent className="p-0">
                  <div className="bg-gray-600 text-white p-4 text-center">Calendar Widget</div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Available Days</p>
                  <p className="text-xl font-bold">18</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Booked Days</p>
                  <p className="text-xl font-bold">8</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Blocked Days</p>
                  <p className="text-xl font-bold">3</p>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Manage Calendar
              </Button>
            </div>

            {/* Recent Bookings */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">Emma's Party</h3>
                        <p className="text-xs text-gray-500">March 15, 2025</p>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">Jake's Birthday</h3>
                        <p className="text-xs text-gray-500">March 22, 2025</p>
                      </div>
                      <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">Mia's Celebration</h3>
                        <p className="text-xs text-gray-500">April 5, 2025</p>
                      </div>
                      <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Bookings
                </Button>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-sm font-medium">68%</p>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                    </div>
                    <p className="text-sm font-medium">2.4 hours</p>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-600">Rating</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium mr-1">4.8</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < 4 || i === 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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
      </div>
    </SupplierLayout>
  )
}