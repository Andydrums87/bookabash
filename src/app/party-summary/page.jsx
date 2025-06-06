"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Music, Utensils, Palette, Building, Edit, Share, Check, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import RecommendedAddons from "@/components/recommended-addons"
import InviteProgressIndicator from "@/components/invite-progress-indicator"

export default function PartySummaryPage() {
  const [checkedSteps, setCheckedSteps] = useState([])

  const partyDetails = {
    theme: "Superhero Theme",
    date: "March 15, 2025",
    time: "2:00 PM",
  }

  const budgetOverview = {
    totalBudget: 605,
    amountPaid: 170,
    remainingBalance: 435,
    percentPaid: 28,
  }

  const suppliers = [
    {
      id: "venue",
      category: "Venue",
      name: "Adventure Play Centre",
      address: "123 Fun Street, London SW1",
      details: "2 hours venue hire • Up to 20 children",
      price: 180,
      paid: 50,
      status: "Confirmed",
      icon: <Building className="w-5 h-5" />,
    },
    {
      id: "entertainment",
      category: "Entertainment",
      name: "Captain Marvel - Superhero Show",
      provider: "Magic Mike Entertainment",
      details: "90 minutes show • Face painting included",
      price: 220,
      paid: 0,
      status: "Pending",
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: "catering",
      category: "Catering",
      name: "Superhero Party Food Package",
      provider: "Little Heroes Catering",
      details: "20 children • Sandwiches, fruit, cake & drinks",
      price: 120,
      paid: 120,
      status: "Confirmed",
      icon: <Utensils className="w-5 h-5" />,
    },
    {
      id: "decorations",
      category: "Decorations & Party Bags",
      name: "Superhero Decoration Package",
      provider: "Party Perfect Supplies",
      details: "Balloons, banners, table setup • 20 party bags",
      price: 85,
      paid: 0,
      status: "Pending",
      icon: <Palette className="w-5 h-5" />,
    },
  ]

  const bookingStatus = [
    { category: "Venue", status: "Confirmed" },
    { category: "Entertainment", status: "Pending" },
    { category: "Catering", status: "Confirmed" },
    { category: "Decorations", status: "Pending" },
  ]

  const nextSteps = [
    { id: 1, text: "Venue confirmed & deposit paid", completed: true },
    { id: 2, text: "Confirm entertainment booking", completed: false },
    { id: 3, text: "Finalize decoration order", completed: false },
    { id: 4, text: "Send invitations to guests", completed: false },
  ]

  const toggleStep = (stepId) => {
    setCheckedSteps((prev) => (prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]))
  }

  return (
    <div className="min-h-screen bg-gray-50">
    

      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile-First Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Party Plan Summary</h1>
            <p className="text-gray-600 text-sm md:text-base mb-4">Review your complete party package</p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 md:p-4">
              <div className="text-center md:text-left">
                <div className="text-lg md:text-xl font-semibold text-primary-700">{partyDetails.theme}</div>
                <div className="text-sm md:text-base text-gray-600">
                  {partyDetails.date} • {partyDetails.time}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-6">
          {/* Invitation Alert - Full Width on Mobile */}
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="flex items-start md:items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                      Don't forget to send invitations!
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Your party is coming up soon - time to invite your guests
                    </p>
                  </div>
                </div>
                <Button className="bg-primary-500 hover:bg-primary-600 text-white w-full md:w-auto" asChild>
                  <Link href="/e-invites">Create Invites</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Budget Overview - Mobile First */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💰</span>
                Budget Overview
              </h3>

              {/* Mobile Budget Display */}
              <div className="md:hidden space-y-4">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-2xl font-bold text-primary-600">£{budgetOverview.amountPaid}</div>
                      <div className="text-sm text-gray-600">paid so far</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-gray-900">£{budgetOverview.remainingBalance}</div>
                      <div className="text-sm text-gray-600">remaining</div>
                    </div>
                  </div>
                  <Progress value={budgetOverview.percentPaid} className="h-3 mb-2" />
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">
                      £{budgetOverview.totalBudget} total budget • {budgetOverview.percentPaid}% paid
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Budget Display */}
              <div className="hidden md:block space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Budget</span>
                  <span className="font-semibold">£{budgetOverview.totalBudget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-primary-600">£{budgetOverview.amountPaid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Balance</span>
                  <span className="font-semibold">£{budgetOverview.remainingBalance}</span>
                </div>
                <div className="pt-2">
                  <Progress value={budgetOverview.percentPaid} className="h-2" />
                  <p className="text-sm text-gray-600 mt-1">{budgetOverview.percentPaid}% paid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invitation Status */}
          <InviteProgressIndicator partyDate={partyDetails.date} invitesSent={0} totalGuests={15} />

          {/* Suppliers - Mobile Optimized Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Suppliers</h2>
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                          {supplier.icon}
                        </div>
                        <span className="font-medium text-gray-700 text-sm">{supplier.category}</span>
                      </div>
                      <Badge
                        variant={supplier.status === "Confirmed" ? "default" : "secondary"}
                        className={`text-xs ${
                          supplier.status === "Confirmed"
                            ? "bg-primary-100 text-primary-700 border-primary-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {supplier.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 text-base mb-1">{supplier.name}</h3>
                      {supplier.provider && <p className="text-sm text-gray-600 mb-1">{supplier.provider}</p>}
                      {supplier.address && <p className="text-sm text-gray-600 mb-1">{supplier.address}</p>}
                      <p className="text-sm text-gray-700">{supplier.details}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold text-gray-900">£{supplier.price}</div>
                        {supplier.paid > 0 && (
                          <div className="text-sm text-primary-600 font-medium">Paid: £{supplier.paid}</div>
                        )}
                        {supplier.paid === 0 && <div className="text-sm text-gray-500">Not paid</div>}
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-primary-500">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                          {supplier.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{supplier.category}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={supplier.status === "Confirmed" ? "default" : "secondary"}
                          className={
                            supplier.status === "Confirmed"
                              ? "bg-primary-100 text-primary-700 hover:bg-primary-100 border-primary-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200"
                          }
                        >
                          {supplier.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-primary-500">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{supplier.name}</h4>
                        {supplier.provider && <p className="text-sm text-gray-600 mb-1">{supplier.provider}</p>}
                        {supplier.address && <p className="text-sm text-gray-600 mb-2">{supplier.address}</p>}
                        <p className="text-sm text-gray-700">{supplier.details}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-gray-900">£{supplier.price}</div>
                        {supplier.paid > 0 && (
                          <div className="text-sm text-primary-600 font-medium">Paid: £{supplier.paid}</div>
                        )}
                        {supplier.paid === 0 && <div className="text-sm text-gray-500">Not paid</div>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next Steps - Mobile Optimized */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                {nextSteps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        step.completed || checkedSteps.includes(step.id)
                          ? "bg-primary-500 border-primary-500"
                          : "border-gray-300 hover:border-primary-300"
                      }`}
                    >
                      {(step.completed || checkedSteps.includes(step.id)) && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm md:text-base ${
                          step.completed || checkedSteps.includes(step.id)
                            ? "text-gray-500 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        {step.text}
                      </span>
                      {step.id === 4 && !checkedSteps.includes(step.id) && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm" className="text-primary-500 border-primary-300" asChild>
                            <Link href="/e-invites">Do Now</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Booking Status - Mobile Optimized */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
              <div className="grid grid-cols-2 md:flex md:flex-col gap-3">
                {bookingStatus.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:justify-between md:items-center space-y-1 md:space-y-0"
                  >
                    <span className="text-gray-700 text-sm md:text-base">{item.category}</span>
                    <Badge
                      variant={item.status === "Confirmed" ? "default" : "secondary"}
                      className={`text-xs self-start md:self-auto ${
                        item.status === "Confirmed"
                          ? "bg-primary-100 text-primary-700 border-primary-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Mobile Optimized */}
          <div className="space-y-3">
            <Button
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 text-base md:text-lg font-semibold"
              asChild
            >
              <Link href="/review-book">Send Booking Enquiries</Link>
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50" asChild>
                <Link href="/e-invites">Create & Send Invites</Link>
              </Button>
              <Button variant="ghost" className="w-full text-gray-600 hover:text-primary-500">
                <Share className="w-4 h-4 mr-2" />
                Share Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Recommended Add-ons Section */}
        <div className="mt-8">
          <RecommendedAddons
            context="summary"
            title="Last Chance Add-ons"
            maxItems={4}
            onAddToCart={(addon) => console.log("Adding addon:", addon)}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs md:text-sm text-gray-500">
          © 2025 BookABash. Making children's parties magical, one celebration at a time.
        </div>
      </div>
    </div>
  )
}