"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, MessageCircle, Share, Plus, Users, Send, Download } from "lucide-react"
import Image from "next/image"
import RecommendedAddons from "@/components/recommended-addons"

export default function EInvitesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const [guestEmail, setGuestEmail] = useState("")
  const [invitationData, setInvitationData] = useState({
    title: "Emma's Superhero Adventure",
    date: "March 15, 2025",
    time: "2:00 PM - 5:00 PM",
    venue: "Community Center Hall",
    message: "Join us for an epic superhero adventure!",
  })

  const templates = [
    {
      id: "classic",
      name: "Classic Hero",
      description: "Bold colors, comic style",
      image: "/placeholder.svg?height=200&width=300&text=Classic+Hero+Template",
    },
    {
      id: "modern",
      name: "Modern Hero",
      description: "Clean, minimalist design",
      image: "/placeholder.svg?height=200&width=300&text=Modern+Hero+Template",
    },
    {
      id: "action",
      name: "Action Hero",
      description: "Dynamic, energetic style",
      image: "/placeholder.svg?height=200&width=300&text=Action+Hero+Template",
    },
    {
      id: "retro",
      name: "Retro Hero",
      description: "Vintage comic book feel",
      image: "/placeholder.svg?height=200&width=300&text=Retro+Hero+Template",
    },
  ]

  const guests = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@email.com",
      status: "Confirmed",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@email.com",
      status: "Pending",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      name: "Lisa Brown",
      email: "lisa@email.com",
      status: "Sent",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      name: "Tom Wilson",
      email: "tom@email.com",
      status: "Declined",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 5,
      name: "Emma Davis",
      email: "emma@email.com",
      status: "Confirmed",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const stats = {
    total: 15,
    confirmed: 8,
    pending: 5,
    declined: 2,
  }

  const addGuest = () => {
    if (guestEmail.trim()) {
      // Add guest logic here
      setGuestEmail("")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-primary-100 text-primary-700 border-primary-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Sent":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Declined":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
   

      <div className="container px-10 min-w-screen py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create E-Invites</h1>
          <p className="text-gray-600">Design and send themed invitations for your Superhero Party</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Template Selection & Customization */}
          <div className="lg:col-span-2 space-y-8">
            {/* Choose Template */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Template</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? "ring-2 ring-[#FF5028] border-red-100"
                        : "border-gray-200 hover:border-[#FC6B57]"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                        <Image
                          src={template.image || "/placeholder.svg"}
                          alt={template.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-semibold">{template.name}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Customize Invitation */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customize Invitation</h2>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Party Title</label>
                    <Input
                      value={invitationData.title}
                      onChange={(e) => setInvitationData((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-white border-gray-200 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <Input
                        value={invitationData.date}
                        onChange={(e) => setInvitationData((prev) => ({ ...prev, date: e.target.value }))}
                        className="bg-white border-gray-200 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <Input
                        value={invitationData.time}
                        onChange={(e) => setInvitationData((prev) => ({ ...prev, time: e.target.value }))}
                        className="bg-white border-gray-200 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                    <Input
                      value={invitationData.venue}
                      onChange={(e) => setInvitationData((prev) => ({ ...prev, venue: e.target.value }))}
                      className="bg-white border-gray-200 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Message</label>
                    <Textarea
                      value={invitationData.message}
                      onChange={(e) => setInvitationData((prev) => ({ ...prev, message: e.target.value }))}
                      className="bg-white border-gray-200 focus:border-primary-500"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Guest List & Send Options */}
          <div className="space-y-6">
            {/* Guest List */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest List</h3>

                {/* Add Guest */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter email or phone"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="flex-1 bg-white border-gray-200 focus:border-primary-500"
                  />
                  <Button onClick={addGuest} className="bg-primary-500 hover:bg-primary-600 text-white px-3">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button variant="outline" className="w-full mb-6 border-gray-200">
                  <Users className="w-4 h-4 mr-2" />
                  Import Contacts
                </Button>

                {/* Guest List */}
                <div className="space-y-3 mb-6">
                  {guests.slice(0, 3).map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={guest.avatar || "/placeholder.svg"} alt={guest.name} />
                          <AvatarFallback>
                            {guest.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                          <p className="text-xs text-gray-600">{guest.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(guest.status)}>
                        {guest.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Total Invited:</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmed:</span>
                      <span className="font-medium text-primary-600">{stats.confirmed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-medium text-yellow-600">{stats.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Declined:</span>
                      <span className="font-medium text-gray-600">{stats.declined}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Invites */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Invites</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Send via Email
                  </Button>
                  <Button variant="outline" className="w-full border-gray-200">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full border-gray-200">
                    <Share className="w-4 h-4 mr-2" />
                    Share Link
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">⭐ Powered by BookABash</p>
              </CardContent>
            </Card>

            {/* Preview & Download */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview & Download</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full border-gray-200">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full border-gray-200">
                    <Send className="w-4 h-4 mr-2" />
                    Preview Invitation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended Add-ons for Invitations */}
        <div className="mt-12">
          <RecommendedAddons
            context="einvites"
            title="Mention These Exciting Add-ons"
            subtitle="Let your guests know about these amazing extras in your invitations"
            maxItems={3}
            showPricing={false}
            onAddToCart={(addon) => console.log("Mentioning addon:", addon)}
          />
        </div>
      </div>
    </div>
  )
}