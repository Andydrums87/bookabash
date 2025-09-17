// app/preview/supplier/[id]/preview-components/MockSupplierSidebar.js
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, CheckCircle, ChevronLeft, ChevronRight, Calendar, Package } from "lucide-react"

export default function MockSupplierSidebar({ 
  supplier, 
  packages, 
  selectedPackageId,
  credentials,
  isCakeSupplier = false 
}) {
  const selectedPackage = packages?.find(pkg => pkg.id === selectedPackageId) || packages?.[0]
  
  // Mock verification docs
  const mockVerificationDocs = [
    // { name: "DBS Certificate", verified: true },
    { name: "Public Liability Insurance", verified: true },
    { name: "First Aid Certified", verified: true },
    { name: "ID Verified", verified: true }
  ]

  // Mock calendar days - just show a simple February 2025 calendar
  const mockCalendarDays = []
  
  // Empty cells for days before month starts (Feb 2025 starts on Saturday, so 6 empty cells)
  for (let i = 0; i < 6; i++) {
    mockCalendarDays.push(
      <div key={`empty-${i}`} className="h-12 w-full"></div>
    )
  }
  
  // Days of February 2025
  for (let day = 1; day <= 28; day++) {
    const isSelected = day === 15 // Mock selected date
    const isWeekend = [2, 3, 9, 10, 16, 17, 23, 24].includes(day)
    const isAvailable = ![7, 14, 21].includes(day) // Mock some unavailable dates
    
    let styling = 'text-gray-400 cursor-not-allowed border-gray-200'
    if (isAvailable) {
      if (isSelected) {
        styling = 'bg-primary text-white border-primary'
      } else {
        styling = 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer border-green-300'
      }
    } else {
      styling = 'bg-red-100 text-red-800 cursor-not-allowed line-through border-red-300'
    }
    
    mockCalendarDays.push(
      <button
        key={day}
        className={`h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 border ${styling} relative`}
        disabled={true} // Always disabled in preview
      >
        {day}
        
        {/* Weekend premium indicator */}
        {/* {isWeekend && isAvailable && !isSelected && (
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 opacity-60" />
        )} */}
        
        {/* Time slot indicators for some days */}
        {/* {isAvailable && !isSelected && day % 3 === 0 && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-bold">
            {day % 2 === 0 ? 'AM' : 'PM'}
          </div>
        )} */}
      </button>
    )
  }

  return (
    <div className="space-y-6 sticky top-8">
      {/* Preview Mode Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700 text-center">
          Preview Mode - Interactive features disabled
        </p>
      </div>

      {/* Selected Package Section */}
      {selectedPackage && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-1">Selected Package</h3>
          <p className="text-md text-gray-800 font-semibold mb-1">{selectedPackage.name}</p>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg text-primary-600 font-bold">
                £{selectedPackage.price?.toFixed(2) || '150.00'}
              </p>
              {selectedPackage.priceUnit && (
                <span className="text-sm text-gray-600">
                  {selectedPackage.priceUnit}
                </span>
              )}
            </div>
          </div>
          
          <Button
            className="w-full py-3 text-base bg-gray-300 text-gray-500 cursor-not-allowed relative overflow-hidden"
            disabled={true}
          >
            <div className="absolute inset-0 bg-gray-400 opacity-30" />
            Add to Party Plan
          </Button>
        </div>
      )}

      {/* Mock Availability Calendar */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Time Slot Availability
            </h2>
          </div>

          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                February 2025
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 cursor-not-allowed opacity-50"
                  disabled={true}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 cursor-not-allowed opacity-50"
                  disabled={true}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-3 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {mockCalendarDays}
            </div>

            {/* Legend */}
            {/* <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Legend:</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border bg-green-100 border-green-300"></div>
                  <span className="text-gray-600">Fully Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border bg-yellow-100 border-yellow-300"></div>
                  <span className="text-gray-600">Partially Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border bg-red-100 border-red-300"></div>
                  <span className="text-gray-600">Unavailable</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                • AM/PM indicators show which time slots are available<br/>
                • Orange dots indicate weekend premium pricing
              </p>
            </div> */}

            {/* Selected Date Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="font-semibold text-blue-900">Selected Date</span>
                  <p className="text-blue-700 text-sm">
                    Saturday, February 15, 2025
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600 text-sm font-medium">
                      Afternoon (1pm - 5pm)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Documents Section */}
      {mockVerificationDocs && mockVerificationDocs.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Verification documents</h3>
          <ul className="space-y-3">
            {mockVerificationDocs.map((doc) => (
              <li key={doc.name} className="flex items-center">
                <CheckCircle
                  className={`w-5 h-5 mr-3 ${doc.verified ? "text-green-500" : "text-gray-300"}`}
                  fill={doc.verified ? "currentColor" : "none"}
                />
                <span className={`${doc.verified ? "text-gray-700" : "text-gray-400"}`}>
                  {doc.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add to Favorites Button */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <Button 
          variant="outline" 
          className="w-full py-3 text-base transition-all duration-200 border-gray-300 hover:border-gray-300 cursor-not-allowed opacity-50"
          disabled={true}
        >
          <Heart className="w-5 h-5 mr-2 text-gray-500" />
          Add to favorites
        </Button>
      </div>
    </div>
  )
}