"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarDays, Trash2, Check, Clock, Save, Settings, Calendar as CalendarIcon, Info, Building2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { startOfDay } from "date-fns"
import { useSupplier } from "@/hooks/useSupplier"
import { useBusiness } from "@/contexts/BusinessContext" // 👈 ADD THIS
import { useSupplierDashboard } from "@/utils/mockBackend"
import { GlobalSaveButton } from "@/components/GlobalSaveButton"

// Helper functions
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const isDateEqual = (date1, date2) => {
  return date1.toDateString() === date2.toDateString()
}

const addDays = (date, days) => {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

const isBefore = (date1, date2) => {
  return date1.getTime() < date2.getTime()
}

const AvailabilityContent = () => {
  const { supplier, supplierData, setSupplierData, loading, error, refresh } = useSupplier()
  const { currentBusiness, getPrimaryBusiness, businesses } = useBusiness() // 👈 ADD THIS
  const { saving, updateProfile } = useSupplierDashboard()
  
  // 🔧 NEW: Get primary business for shared availability
  const primaryBusiness = getPrimaryBusiness()
  const isPrimaryBusiness = currentBusiness?.isPrimary || false
  const availabilitySource = primaryBusiness || currentBusiness // Fallback to current if no primary
  
  // 🔧 NEW: Use primary business data for availability
  const currentSupplier = availabilitySource?.data || supplierData

  // State declarations - these will sync with primary business
  const [workingHours, setWorkingHours] = useState({
    Monday: { active: true, start: "09:00", end: "17:00" },
    Tuesday: { active: true, start: "09:00", end: "17:00" },
    Wednesday: { active: true, start: "09:00", end: "17:00" },
    Thursday: { active: true, start: "09:00", end: "17:00" },
    Friday: { active: true, start: "09:00", end: "17:00" },
    Saturday: { active: true, start: "10:00", end: "16:00" },
    Sunday: { active: false, start: "10:00", end: "16:00" },
  })

  const [unavailableDates, setUnavailableDates] = useState([])
  const [busyDates, setBusyDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availabilityNotes, setAvailabilityNotes] = useState("")
  const [advanceBookingDays, setAdvanceBookingDays] = useState(7)
  const [maxBookingDays, setMaxBookingDays] = useState(365)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 🔧 UPDATED: Load data from primary business (shared availability)
  useEffect(() => {
    if (currentSupplier) {
      console.log("📅 Loading availability data from:", isPrimaryBusiness ? "current business" : "primary business")
      
      if (currentSupplier.workingHours) {
        setWorkingHours(currentSupplier.workingHours)
      }
      if (currentSupplier.unavailableDates) {
        setUnavailableDates(currentSupplier.unavailableDates.map((date) => new Date(date)))
      }
      if (currentSupplier.busyDates) {
        setBusyDates(currentSupplier.busyDates.map((date) => new Date(date)))
      }
      if (currentSupplier.availabilityNotes) {
        setAvailabilityNotes(currentSupplier.availabilityNotes)
      }
      if (currentSupplier.advanceBookingDays) {
        setAdvanceBookingDays(currentSupplier.advanceBookingDays)
      }
      if (currentSupplier.maxBookingDays) {
        setMaxBookingDays(currentSupplier.maxBookingDays)
      }
    }
  }, [currentSupplier, isPrimaryBusiness])

  // 🔧 UPDATED: Save to primary business (shared across all businesses)
  const handleSave = async () => {
    try {
      if (!primaryBusiness) {
        throw new Error("No primary business found. Cannot save shared availability.")
      }

      console.log("💾 Saving shared availability to primary business:", primaryBusiness.name)

      const availabilityData = {
        workingHours: workingHours,
        unavailableDates: unavailableDates.map((date) => date.toISOString()),
        busyDates: busyDates.map((date) => date.toISOString()),
        availabilityNotes: availabilityNotes,
        advanceBookingDays: Number(advanceBookingDays),
        maxBookingDays: Number(maxBookingDays),
      }

      // Create updated primary business data
      const updatedPrimaryData = {
        ...primaryBusiness.data, // Keep existing primary business data
        ...availabilityData, // Update availability fields
        updatedAt: new Date().toISOString()
      }
      
      console.log("🔍 Saving availability data to primary business:", updatedPrimaryData.name)
      
      // Save to primary business (this will affect all themed businesses)
      const result = await updateProfile(updatedPrimaryData, null, primaryBusiness.id)
      
      if (result.success) {
        console.log("✅ Shared availability saved successfully")
        
        // Update local state
        setSupplierData(updatedPrimaryData)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        
        // Refresh business data to ensure all businesses have latest availability
        refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("❌ Failed to save shared availability:", error)
      alert("Failed to save availability: " + error.message)
    }
  }

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const markUnavailableRange = (days) => {
    const dates = []
    for (let i = 0; i < days; i++) {
      dates.push(addDays(startOfDay(new Date()), i))
    }
    setUnavailableDates((prev) => {
      const combined = [...prev, ...dates]
      return combined.filter((date, index, self) => index === self.findIndex((d) => isDateEqual(d, date)))
    })
  }

  const markWeekendUnavailable = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dates.push(startOfDay(date))
      }
    }
    setUnavailableDates((prev) => {
      const combined = [...prev, ...dates]
      return combined.filter((date, index, self) => index === self.findIndex((d) => isDateEqual(d, date)))
    })
  }

  const clearAllDates = () => {
    setUnavailableDates([])
  }

  const applyTemplate = (template) => {
    switch (template) {
      case "business":
        setWorkingHours({
          Monday: { active: true, start: "09:00", end: "17:00" },
          Tuesday: { active: true, start: "09:00", end: "17:00" },
          Wednesday: { active: true, start: "09:00", end: "17:00" },
          Thursday: { active: true, start: "09:00", end: "17:00" },
          Friday: { active: true, start: "09:00", end: "17:00" },
          Saturday: { active: false, start: "09:00", end: "17:00" },
          Sunday: { active: false, start: "09:00", end: "17:00" },
        })
        break
      case "weekend":
        setWorkingHours({
          Monday: { active: false, start: "09:00", end: "17:00" },
          Tuesday: { active: false, start: "09:00", end: "17:00" },
          Wednesday: { active: false, start: "09:00", end: "17:00" },
          Thursday: { active: false, start: "09:00", end: "17:00" },
          Friday: { active: false, start: "09:00", end: "17:00" },
          Saturday: { active: true, start: "10:00", end: "18:00" },
          Sunday: { active: true, start: "10:00", end: "18:00" },
        })
        break
      case "flexible":
        setWorkingHours({
          Monday: { active: true, start: "08:00", end: "20:00" },
          Tuesday: { active: true, start: "08:00", end: "20:00" },
          Wednesday: { active: true, start: "08:00", end: "20:00" },
          Thursday: { active: true, start: "08:00", end: "20:00" },
          Friday: { active: true, start: "08:00", end: "20:00" },
          Saturday: { active: true, start: "08:00", end: "20:00" },
          Sunday: { active: true, start: "10:00", end: "18:00" },
        })
        break
      default:
        break
    }
  }

  const modifiers = {
    unavailable: unavailableDates,
    busy: busyDates,
    past: (date) => isBefore(date, startOfDay(new Date())),
  }

  const modifiersStyles = {
    unavailable: {
      backgroundColor: "#ef4444",
      color: "white",
    },
    busy: {
      backgroundColor: "#f59e0b",
      color: "white",
    },
    past: {
      color: "#9ca3af",
      textDecoration: "line-through",
    },
  }

  const handleDateSelect = (date) => {
    if (!date) return
    const normalizedDate = startOfDay(date)
    if (isBefore(normalizedDate, startOfDay(new Date()))) {
      return
    }
    setUnavailableDates((prev) => {
      const isAlreadyUnavailable = prev.some((d) => isDateEqual(d, normalizedDate))
      if (isAlreadyUnavailable) {
        return prev.filter((d) => !isDateEqual(d, normalizedDate))
      } else {
        return [...prev, normalizedDate]
      }
    })
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto">
        {/* 🆕 NEW: Shared Availability Info Banner */}
        <div className="p-4 sm:p-6 pb-0">
          <Alert className="border-blue-200 bg-blue-50 mb-6">
            <Users className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Shared Availability:</strong> These settings apply to all your businesses ({businesses?.length || 0} total). 
              Changes made here will affect availability across all your themed services.
              {!isPrimaryBusiness && (
                <span className="block mt-1 text-sm">
                  Currently viewing from: <strong>{currentBusiness?.name}</strong> • 
                  Editing: <strong>{primaryBusiness?.name}</strong> (Primary)
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-4">
            <Alert className="border-emerald-200 bg-emerald-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
              <Check className="h-5 w-5 text-emerald-600" />
              <AlertDescription className="text-emerald-800 font-medium">
                Shared availability settings saved successfully across all businesses!
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Header - Updated to show shared context */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="space-y-1">
              <h2 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">
                Shared Availability Settings
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Manage when customers can book any of your services • Applies to all {businesses?.length || 0} businesses
              </p>
            </div>
            <div className="absolute right-10 top-22">
              <GlobalSaveButton 
                position="responsive"
                onSave={handleSave}
                isLoading={saving}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation - Mobile Optimized */}
        <Tabs defaultValue="hours" className="w-full">
          <div className="px-4 sm:px-6 pb-0">
            <TabsList className="w-full grid grid-cols-3 p-1 rounded-lg h-auto bg-white border border-gray-200">
              <TabsTrigger
                value="hours"
                className="flex flex-col items-center justify-center h-16 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Working Hours</span>
                <span className="sm:hidden">Hours</span>
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex flex-col items-center justify-center h-16 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
              >
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Calendar</span>
                <span className="sm:hidden">Calendar</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex flex-col items-center justify-center h-16 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Rules</span>
                <span className="sm:hidden">Rules</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Working Hours Tab */}
          <TabsContent value="hours" className="p-4 sm:p-6 space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Weekly Schedule</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Set your availability for each day of the week (applies to all businesses)
                </p>

                {/* Quick Templates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => applyTemplate("business")}
                    className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto"
                  >
                    Business Hours
                    <span className="block text-xs text-gray-500">(9-5, Mon-Fri)</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyTemplate("weekend")}
                    className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto"
                  >
                    Weekends Only
                    <span className="block text-xs text-gray-500">(Sat-Sun)</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyTemplate("flexible")}
                    className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto"
                  >
                    Flexible
                    <span className="block text-xs text-gray-500">(8-8, All Days)</span>
                  </Button>
                </div>
              </div>

              {/* Days List */}
              <div className="space-y-3">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className={`p-4 rounded-lg border transition-all ${
                      hours.active ? "bg-white border-[hsl(var(--primary-200))]" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`day-${day}`}
                          checked={hours.active}
                          onCheckedChange={(checked) => handleWorkingHoursChange(day, "active", !!checked)}
                          className="data-[state=checked]:bg-[hsl(var(--primary-600))] data-[state=checked]:border-[hsl(var(--primary-600))] w-5 h-5"
                        />
                        <div>
                          <Label htmlFor={`day-${day}`} className="text-base font-medium cursor-pointer text-gray-900">
                            {day}
                          </Label>
                          {!hours.active && <p className="text-sm text-gray-500">Closed</p>}
                        </div>
                      </div>

                      {hours.active && (
                        <div className="flex items-center gap-3 ml-8 sm:ml-0">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600 min-w-[2rem]">From</Label>
                            <Input
                              type="time"
                              value={hours.start}
                              onChange={(e) => handleWorkingHoursChange(day, "start", e.target.value)}
                              className="w-20 sm:w-24 border-gray-300 focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))] text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600 min-w-[1.5rem]">To</Label>
                            <Input
                              type="time"
                              value={hours.end}
                              onChange={(e) => handleWorkingHoursChange(day, "end", e.target.value)}
                              className="w-20 sm:w-24 border-gray-300 focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))] text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="p-4 sm:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Block Specific Dates</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Click on dates to mark them as unavailable across all businesses
                  </p>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markUnavailableRange(7)}
                      className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-2 h-auto"
                    >
                      Block Next 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markUnavailableRange(14)}
                      className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-2 h-auto"
                    >
                      Block 2 Weeks
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markWeekendUnavailable}
                      className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-2 h-auto bg-transparent"
                    >
                      Block Weekends
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllDates}
                      className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-2 h-auto bg-transparent"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Calendar
                    mode="multiple"
                    selected={unavailableDates}
                    onSelect={setUnavailableDates}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="rounded-md border border-gray-200 w-full max-w-md"
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  />
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Unavailable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Busy/Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span>Past dates</span>
                  </div>
                </div>
              </div>

              {/* Blocked Dates List */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Blocked Dates</h3>
                <Badge variant="secondary" className="bg-red-100 text-red-700 mb-4">
                  {unavailableDates.length} dates blocked
                </Badge>

                {unavailableDates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No blocked dates</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64 sm:h-96">
                    <div className="space-y-2">
                      {unavailableDates
                        .sort((a, b) => a.getTime() - b.getTime())
                        .map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                          >
                            <span className="text-sm font-medium flex-1 pr-2">{formatDate(date)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUnavailableDates((prev) => prev.filter((d) => !isDateEqual(d, date)))}
                              className="hover:bg-red-100 hover:text-red-600 p-2 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="p-4 sm:p-6">
            <div className="max-w-2xl bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Shared Booking Rules</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Configure how customers can book any of your services (applies to all businesses)
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="advance-booking" className="text-sm font-medium text-gray-900">
                      Minimum advance booking (days)
                    </Label>
                    <Input
                      id="advance-booking"
                      type="number"
                      min="0"
                      max="30"
                      value={advanceBookingDays}
                      onChange={(e) => setAdvanceBookingDays(Number.parseInt(e.target.value) || 0)}
                      className="mt-1 border-gray-300 focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Customers must book at least this many days in advance</p>
                  </div>

                  <div>
                    <Label htmlFor="max-booking" className="text-sm font-medium text-gray-900">
                      Maximum advance booking (days)
                    </Label>
                    <Input
                      id="max-booking"
                      type="number"
                      min="1"
                      max="730"
                      value={maxBookingDays}
                      onChange={(e) => setMaxBookingDays(Number.parseInt(e.target.value) || 365)}
                      className="mt-1 border-gray-300 focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))]"
                    />
                    <p className="text-xs text-gray-500 mt-1">How far ahead customers can book</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="availability-notes" className="text-sm font-medium text-gray-900">
                    Special availability notes
                  </Label>
                  <textarea
                    id="availability-notes"
                    value={availabilityNotes}
                    onChange={(e) => setAvailabilityNotes(e.target.value)}
                    placeholder="Add any special notes about your availability that customers should know..."
                    className="w-full mt-1 p-3 border border-gray-300 rounded-md text-sm h-24 resize-none focus:ring-[hsl(var(--primary-200))] focus:border-[hsl(var(--primary-500))]"
                  />
                  <p className="text-xs text-gray-500 mt-1">These notes will appear on all your business listings</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AvailabilityContent