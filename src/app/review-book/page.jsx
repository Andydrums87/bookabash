"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Calendar, Users, Music, Utensils, Palette, Building, Info, Send } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import RecommendedAddons from "@/components/recommended-addons"

export default function ReviewBookPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    parentName: "",
    phoneNumber: "",
    email: "",
    numberOfChildren: "",
    dietaryRequirements: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      nutAllergy: false,
    },
    accessibilityRequirements: {
      wheelchairAccessible: false,
      sensoryFriendly: false,
    },
    additionalMessage: "",
  })

  const partyDetails = {
    date: "Saturday, March 15, 2025",
    time: "Afternoon (1pm - 3pm)",
    theme: "Superhero",
    location: "SW11 3LD, London",
    age: "6 years old",
  }

  const selectedSuppliers = [
    {
      id: "super-heroes",
      name: "Super Heroes Entertainment",
      category: "Entertainment",
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: "party-treats",
      name: "Party Treats Catering",
      category: "Catering",
      icon: <Utensils className="w-5 h-5" />,
    },
    {
      id: "amazing-decorations",
      name: "Amazing Decorations",
      category: "Decorations",
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: "community-hall",
      name: "Community Hall Venue",
      category: "Venue",
      icon: <Building className="w-5 h-5" />,
    },
  ]

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }
  const handleCheckboxChange = (category, field, checked) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: checked
      }
    }))
  }
  
  const handleSubmitEnquiry = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Navigate to success page or dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
  

      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile-First Page Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Send Your Party Enquiry</h1>
          <p className="text-gray-600 text-sm md:text-base px-2">
            We'll send your requirements to all selected suppliers and they'll get back to you directly
          </p>
        </div>

        {/* Mobile-First Content Layout */}
        <div className="space-y-6">
          {/* Party Details - Mobile Optimized */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Your Party Details</h2>
              </div>

              {/* Mobile Layout - Stacked */}
              <div className="md:hidden space-y-3">
                <div className="bg-primary-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary-700 mb-1">{partyDetails.theme} Theme</div>
                    <div className="text-sm text-gray-600">{partyDetails.date}</div>
                    <div className="text-sm text-gray-600">{partyDetails.time}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Age:</span>
                    <p className="text-gray-900">{partyDetails.age}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Location:</span>
                    <p className="text-gray-900">{partyDetails.location}</p>
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Date:</span>
                  <p className="text-gray-900">{partyDetails.date}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Time:</span>
                  <p className="text-gray-900">{partyDetails.time}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Theme:</span>
                  <p className="text-gray-900">{partyDetails.theme}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Age:</span>
                  <p className="text-gray-900">{partyDetails.age}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Location:</span>
                  <p className="text-gray-900">{partyDetails.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Suppliers - Mobile Optimized */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Selected Suppliers ({selectedSuppliers.length})</h2>
              </div>

              {/* Mobile Layout - Single Column */}
              <div className="md:hidden space-y-3">
                {selectedSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-primary-100"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      {supplier.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{supplier.name}</h3>
                      <p className="text-xs text-gray-600">{supplier.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Layout - Grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-4">
                {selectedSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      {supplier.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">{supplier.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information - Mobile Optimized */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Info className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Your Contact Information</h2>
              </div>
              <div className="space-y-4">
                {/* Mobile-First Form Layout */}
                <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent/Guardian Name <span className="text-primary-500">*</span>
                    </label>
                    <Input
                      placeholder="Your full name"
                      value={formData.parentName}
                      onChange={(e) => handleInputChange("parentName", e.target.value)}
                      className="bg-white border-gray-200 focus:border-primary-500 h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-primary-500">*</span>
                    </label>
                    <Input
                      placeholder="07xxx xxx xxx"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="bg-white border-gray-200 focus:border-primary-500 h-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-primary-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white border-gray-200 focus:border-primary-500 h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requirements - Mobile Optimized */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Special Requirements</h2>
              </div>

              <div className="space-y-6">
                {/* Number of Children */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Children Expected</label>
                  <Select
                    value={formData.numberOfChildren}
                    onValueChange={(value) => handleInputChange("numberOfChildren", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:border-primary-500 h-12">
                      <SelectValue placeholder="Select number of children" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-10">5-10 children</SelectItem>
                      <SelectItem value="10-15">10-15 children</SelectItem>
                      <SelectItem value="15-20">15-20 children</SelectItem>
                      <SelectItem value="20-25">20-25 children</SelectItem>
                      <SelectItem value="25+">25+ children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dietary Requirements - Mobile Optimized */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Dietary Requirements</h3>
                  <div className="space-y-3">
                    {[
                      { key: "vegetarian", label: "Vegetarian options needed" },
                      { key: "vegan", label: "Vegan options needed" },
                      { key: "glutenFree", label: "Gluten-free options needed" },
                      { key: "nutAllergy", label: "Nut allergy considerations" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
  id={item.key}
  checked={formData.dietaryRequirements[item.key]}
  onCheckedChange={checked =>
    handleCheckboxChange("dietaryRequirements", item.key, checked)
  }
/>

                        <label htmlFor={item.key} className="text-sm text-gray-700 flex-1">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessibility Requirements - Mobile Optimized */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Accessibility Requirements</h3>
                  <div className="space-y-3">
                    {[
                      { key: "wheelchairAccessible", label: "Wheelchair accessible venue needed" },
                      { key: "sensoryFriendly", label: "Sensory-friendly environment" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          id={item.key}
                          checked={
                            formData.accessibilityRequirements[
                              item.key
                            ]
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("accessibilityRequirements", item.key, checked)
                          }
                        />
                        <label htmlFor={item.key} className="text-sm text-gray-700 flex-1">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Message - Mobile Optimized */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Send className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Additional Message to Suppliers</h2>
              </div>
              <Textarea
                placeholder="Any specific requests, preferences, or additional information you'd like to share with the suppliers..."
                value={formData.additionalMessage}
                onChange={(e) => handleInputChange("additionalMessage", e.target.value)}
                className="bg-white min-h-[100px] border-gray-200 focus:border-primary-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                This message will be sent to all selected suppliers along with your party details
              </p>
            </CardContent>
          </Card>

          {/* What Happens Next - Mobile Optimized */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Your enquiry will be sent to all 4 selected suppliers</li>
                    <li>• Suppliers will contact you directly within 24 hours</li>
                    <li>• Compare quotes and availability before making your final decision</li>
                    <li>• BookABash remains free for parents - no booking fees</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Add-ons - Mobile Optimized */}
          <div>
            <RecommendedAddons
              context="review"
              title="Quick Add-ons"
              subtitle="Last minute extras you can still add to your party"
              maxItems={3}
              onAddToCart={(addon) => console.log("Adding addon:", addon)}
            />
          </div>

          {/* Submit Button - Mobile Optimized */}
          <div className="space-y-4">
            <Button
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 text-lg font-semibold rounded-xl"
              onClick={handleSubmitEnquiry}
              disabled={isSubmitting || !formData.parentName || !formData.phoneNumber || !formData.email}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending Enquiry...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Enquiry to All Suppliers
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 text-center">*Magical, one celebration at a time.</p>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-sm md:max-w-md mx-auto text-center w-full">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Sending Your Enquiry</h3>
            <p className="text-gray-600 text-sm md:text-base">We're contacting all your selected suppliers...</p>
          </div>
        </div>
      )}
    </div>
  )
}