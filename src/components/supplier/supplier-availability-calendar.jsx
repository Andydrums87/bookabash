"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect } from "react"

export default function SupplierAvailabilityCalendar({
  supplier,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
}) {


  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const isDateUnavailable = (date, supplierData) => {
    if (!supplierData?.unavailableDates) return false
    return supplierData.unavailableDates.some(
      (unavailableDate) => new Date(unavailableDate).toDateString() === date.toDateString(),
    )
  }
  
  const isDateBusy = (date, supplierData) => {
    if (!supplierData?.busyDates) return false
    return supplierData.busyDates.some((busyDate) => new Date(busyDate).toDateString() === date.toDateString())
  }
  
  const isDayAvailable = (date, supplierData) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    return supplierData?.workingHours?.[dayName]?.active || false
  }

  const getDateStatus = (date, supplierData) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) return "past"

    const advanceDays = supplierData?.advanceBookingDays || 0
    const maxDays = supplierData?.maxBookingDays || 365
    const minBookingDate = new Date(today)
    minBookingDate.setDate(today.getDate() + advanceDays)

    const maxBookingDate = new Date(today)
    maxBookingDate.setDate(today.getDate() + maxDays)

    if (date < minBookingDate || date > maxBookingDate) return "outside-window"
    if (isDateUnavailable(date, supplierData)) return "unavailable"
    if (isDateBusy(date, supplierData)) return "busy"
    
    // If no working hours data, default to available
    if (!supplierData?.workingHours) return "available"
    
    if (!isDayAvailable(date, supplierData)) return "closed"
    return "available"
  }

  const getDayStyle = (date, status, isSelected, isCurrentMonth) => {
    if (!isCurrentMonth) return 'text-gray-400 cursor-not-allowed';
    if (isSelected) return 'bg-primary text-white border-primary';
    
    switch (status) {
      case "available":
        return 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer border-green-300';
      case "unavailable":
        return 'bg-red-100 text-red-800 cursor-not-allowed line-through border-red-300';
      case "busy":
        return 'bg-yellow-100 text-yellow-800 cursor-not-allowed border-yellow-300';
      case "closed":
        return 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300';
      case "past":
        return 'text-gray-300 cursor-not-allowed line-through border-gray-200';
      case "outside-window":
        return 'text-gray-400 cursor-not-allowed opacity-70 border-gray-200';
      default:
        return 'text-gray-400 cursor-not-allowed border-gray-200';
    }
  };

  const renderModernCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayIndex = getFirstDayOfMonth(currentMonth)
    const daysInMonthCount = getDaysInMonth(currentMonth)
    const days = []

    // Empty cells for days before the month starts
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonthCount; day++) {
      const date = new Date(year, month, day)
      const isSelected = selectedDate === day
      const status = getDateStatus(date, supplier)
      const isCurrentMonth = true
      const styling = getDayStyle(date, status, isSelected, isCurrentMonth)

      days.push(
        <button
          key={day}
          onClick={() => (status === "available" ? setSelectedDate(day) : null)}
          className={`h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 border ${styling}`}
          title={status.replace("-", " ")}
          disabled={status !== "available"}
        >
          {day}
        </button>,
      )
    }
    return days
  }

  if (!supplier?.workingHours && !supplier?.unavailableDates) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Availability Calendar</h2>
          <p className="text-sm text-gray-600">
            Detailed availability calendar is loading or not available. Please contact the supplier directly for booking
            inquiries.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Availability Calendar</h2>
          {supplier?.advanceBookingDays > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              Book {supplier.advanceBookingDays}+ days ahead
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="h-9 w-9 p-0"
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
            {renderModernCalendar()}
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Legend:</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {[
                { label: "Available", color: "bg-green-100 border-green-300" },
                { label: "Unavailable", color: "bg-red-100 border-red-300" },
                { label: "Busy/Booked", color: "bg-yellow-100 border-yellow-300" },
                { label: "Day Off", color: "bg-gray-200 border-gray-300" },
                { label: "Past/Outside Window", color: "bg-gray-100 border-gray-200 opacity-70" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border ${item.color}`}></div>
                  <span className="text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Display */}
          {selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <span className="font-semibold text-blue-900">Selected Date</span>
                  <p className="text-blue-700 text-sm">
                    {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString(
                      "en-US",
                      { weekday: "long", year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}