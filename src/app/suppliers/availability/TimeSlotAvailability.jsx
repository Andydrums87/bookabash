"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CalendarDays,
  Trash2,
  Clock,
  Settings,
  CalendarIcon,
  Sun,
  Moon,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startOfDay } from "date-fns"
import { supabase } from "@/lib/supabase"

// Auto-save indicator
const AutoSaveIndicator = ({ status, lastSaved }) => {
  if (status === "idle") return null

  const config = {
    saving: { icon: Loader2, text: "Saving...", className: "text-blue-600 animate-spin" },
    saved: {
      icon: Check,
      text: lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : "Saved",
      className: "text-green-600",
    },
    error: { icon: AlertCircle, text: "Failed to save", className: "text-red-600" },
  }

  const { icon: Icon, text, className } = config[status] || config.saved

  return (
    <div className="fixed bottom-6 right-6 bg-white shadow-lg rounded-lg px-4 py-3 border border-gray-200 flex items-center gap-2 z-50">
      <Icon className={`w-4 h-4 ${className}`} />
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </div>
  )
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 10) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

const AVAILABILITY_OPTIONS = [
  { value: "closed", label: "Closed", description: "Not available" },
  { value: "morning", label: "Morning Only", description: "9am - 1pm" },
  { value: "afternoon", label: "Afternoon Only", description: "1pm - 5pm" },
  { value: "full", label: "Full Day", description: "9am - 5pm" },
]

const TIME_SLOTS = {
  morning: {
    id: "morning",
    label: "Morning",
    defaultStart: "09:00",
    defaultEnd: "13:00",
    displayTime: "9am - 1pm",
    icon: Sun,
  },
  afternoon: {
    id: "afternoon",
    label: "Afternoon",
    defaultStart: "13:00",
    defaultEnd: "17:00",
    displayTime: "1pm - 5pm",
    icon: Moon,
  },
  allday: { id: "allday", label: "All Day", defaultStart: "09:00", defaultEnd: "17:00", icon: CalendarIcon },
}

const convertToWorkingHours = (availability) => {
  const templates = {
    closed: {
      active: false,
      timeSlots: {
        morning: { available: false, startTime: "09:00", endTime: "13:00" },
        afternoon: { available: false, startTime: "13:00", endTime: "17:00" },
      },
    },
    morning: {
      active: true,
      timeSlots: {
        morning: { available: true, startTime: "09:00", endTime: "13:00" },
        afternoon: { available: false, startTime: "13:00", endTime: "17:00" },
      },
    },
    afternoon: {
      active: true,
      timeSlots: {
        morning: { available: false, startTime: "09:00", endTime: "13:00" },
        afternoon: { available: true, startTime: "13:00", endTime: "17:00" },
      },
    },
    full: {
      active: true,
      timeSlots: {
        morning: { available: true, startTime: "09:00", endTime: "13:00" },
        afternoon: { available: true, startTime: "13:00", endTime: "17:00" },
      },
    },
  }
  return templates[availability] || templates.closed
}

const convertFromWorkingHours = (dayData) => {
  if (!dayData.active) return "closed"
  const morning = dayData.timeSlots?.morning?.available || false
  const afternoon = dayData.timeSlots?.afternoon?.available || false
  if (morning && afternoon) return "full"
  if (morning) return "morning"
  if (afternoon) return "afternoon"
  return "closed"
}

const dateToLocalString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

const getDefaultDaySchedule = (active = true) => ({
  active,
  timeSlots: {
    morning: { available: active, startTime: "09:00", endTime: "13:00" },
    afternoon: { available: active, startTime: "13:00", endTime: "17:00" },
  },
})

const getDefaultWorkingHours = () => ({
  Monday: getDefaultDaySchedule(true),
  Tuesday: getDefaultDaySchedule(true),
  Wednesday: getDefaultDaySchedule(true),
  Thursday: getDefaultDaySchedule(true),
  Friday: getDefaultDaySchedule(true),
  Saturday: getDefaultDaySchedule(false),
  Sunday: getDefaultDaySchedule(false),
})

const migrateWorkingHours = (legacyHours) => {
  if (!legacyHours) return getDefaultWorkingHours()
  if (legacyHours.Monday?.timeSlots) return legacyHours

  const migrated = {}
  Object.entries(legacyHours).forEach(([day, hours]) => {
    if (hours && typeof hours === "object" && "active" in hours) {
      migrated[day] = {
        active: hours.active,
        timeSlots: {
          morning: { available: hours.active, startTime: hours.start || "09:00", endTime: "13:00" },
          afternoon: { available: hours.active, startTime: "13:00", endTime: hours.end || "17:00" },
        },
      }
    } else {
      migrated[day] = getDefaultDaySchedule()
    }
  })
  return migrated
}

const migrateDateArray = (dateArray) => {
  if (!Array.isArray(dateArray)) return []
  return dateArray.map((dateItem) => {
    if (typeof dateItem === "string") {
      return { date: dateItem.split("T")[0], timeSlots: ["morning", "afternoon"] }
    } else if (dateItem && typeof dateItem === "object" && dateItem.date) {
      return dateItem
    } else {
      const date = new Date(dateItem)
      return { date: date.toISOString().split("T")[0], timeSlots: ["morning", "afternoon"] }
    }
  })
}

const TimeSlotCalendar = ({ currentMonth, setCurrentMonth, unavailableDates, setUnavailableDates }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [showTimeSlotPicker, setShowTimeSlotPicker] = useState(false)

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const getBlockedSlots = (date) => {
    const dateStr = dateToLocalString(date)
    return unavailableDates.find((item) => item.date === dateStr)?.timeSlots || []
  }

  const handleDateClick = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return
    setSelectedDate(date)
    setShowTimeSlotPicker(true)
  }

  const handleTimeSlotToggle = (timeSlot) => {
    if (!selectedDate) return
    const dateStr = dateToLocalString(selectedDate)

    setUnavailableDates((prev) => {
      const existing = prev.find((item) => item.date === dateStr)

      if (existing) {
        if (timeSlot === "allday") {
          if (existing.timeSlots.includes("morning") && existing.timeSlots.includes("afternoon")) {
            return prev.filter((item) => item.date !== dateStr)
          } else {
            return prev.map((item) => (item.date === dateStr ? { ...item, timeSlots: ["morning", "afternoon"] } : item))
          }
        } else {
          if (existing.timeSlots.includes(timeSlot)) {
            const updatedSlots = existing.timeSlots.filter((slot) => slot !== timeSlot)
            return updatedSlots.length === 0
              ? prev.filter((item) => item.date !== dateStr)
              : prev.map((item) => (item.date === dateStr ? { ...item, timeSlots: updatedSlots } : item))
          } else {
            const newSlots = [...new Set([...existing.timeSlots, timeSlot])]
            return prev.map((item) => (item.date === dateStr ? { ...item, timeSlots: newSlots } : item))
          }
        }
      } else {
        if (timeSlot === "allday") {
          return [...prev, { date: dateStr, timeSlots: ["morning", "afternoon"] }]
        } else {
          return [...prev, { date: dateStr, timeSlots: [timeSlot] }]
        }
      }
    })
  }

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayIndex = getFirstDayOfMonth(currentMonth)
    const daysInMonthCount = getDaysInMonth(currentMonth)
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>)
    }

    for (let day = 1; day <= daysInMonthCount; day++) {
      const date = new Date(year, month, day)
      const blockedSlots = getBlockedSlots(date)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()

      let dayStyle =
        "h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 border relative flex items-center justify-center "

      if (isPast) {
        dayStyle += "text-gray-300 cursor-not-allowed bg-gray-50 border-gray-200"
      } else if (blockedSlots.length === 2) {
        dayStyle += "bg-red-100 text-red-800 border-red-300 line-through cursor-pointer hover:bg-red-200"
      } else if (blockedSlots.length === 1) {
        dayStyle += "bg-yellow-100 text-yellow-800 border-yellow-300 cursor-pointer hover:bg-yellow-200"
      } else {
        dayStyle += "bg-white text-gray-700 border-gray-200 cursor-pointer hover:bg-gray-50"
      }

      if (isToday) dayStyle += " ring-2 ring-primary-500"

      days.push(
        <button key={day} onClick={() => !isPast && handleDateClick(date)} className={dayStyle} disabled={isPast}>
          {day}
          {!isPast && blockedSlots.length > 0 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
              {blockedSlots.map((slot) => {
                const SlotIcon = TIME_SLOTS[slot]?.icon || Clock
                return <SlotIcon key={slot} className="w-2 h-2 text-current opacity-70" />
              })}
            </div>
          )}
          {!isPast && blockedSlots.length === 1 && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-bold">
              {blockedSlots[0] === "morning" ? "AM" : "PM"}
            </div>
          )}
        </button>,
      )
    }
    return days
  }, [currentMonth, unavailableDates])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth} className="h-9 w-9 p-0 bg-transparent">
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth} className="h-9 w-9 p-0 bg-transparent">
            →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 py-3 text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">{calendarDays}</div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {[
          { label: "Available", color: "bg-white border-gray-200" },
          { label: "Partially Blocked", color: "bg-yellow-100 border-yellow-300" },
          { label: "All Day Blocked", color: "bg-red-100 border-red-300" },
          { label: "Past Date", color: "bg-gray-50 border-gray-200 text-gray-300" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${item.color}`}></div>
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>

      {showTimeSlotPicker && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Time Slots to Block</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <div className="space-y-3 mb-6">
              <div
                onClick={() => handleTimeSlotToggle("allday")}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  getBlockedSlots(selectedDate).includes("morning") &&
                  getBlockedSlots(selectedDate).includes("afternoon")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      getBlockedSlots(selectedDate).includes("morning") &&
                      getBlockedSlots(selectedDate).includes("afternoon")
                    }
                    readOnly
                    className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <CalendarIcon
                    className={`w-5 h-5 ${getBlockedSlots(selectedDate).includes("morning") && getBlockedSlots(selectedDate).includes("afternoon") ? "text-red-600" : "text-purple-500"}`}
                  />
                  <div>
                    <div className="font-medium">All Day</div>
                    <div className="text-sm text-gray-500">Block entire day (9am - 5pm)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-500 uppercase font-medium">Or choose specific times</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {["morning", "afternoon"].map((slotId) => {
                const slotConfig = TIME_SLOTS[slotId]
                const SlotIcon = slotConfig.icon
                const isBlocked = getBlockedSlots(selectedDate).includes(slotId)

                return (
                  <div
                    key={slotId}
                    onClick={() => handleTimeSlotToggle(slotId)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isBlocked
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isBlocked}
                        readOnly
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <SlotIcon className={`w-5 h-5 ${isBlocked ? "text-red-600" : "text-amber-500"}`} />
                      <div>
                        <div className="font-medium">{slotConfig.label}</div>
                        <div className="text-sm text-gray-500">{slotConfig.displayTime}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button
              onClick={() => {
                setShowTimeSlotPicker(false)
                setSelectedDate(null)
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const TimeSlotAvailabilityContent = ({
  supplier,
  supplierData,
  setSupplierData,
  loading,
  error,
  refresh,
  currentBusiness,
  primaryBusiness,
  businesses,
  supplierCategory,
}) => {
  const isPrimaryBusiness = currentBusiness?.isPrimary || false
  const availabilitySource = primaryBusiness
  const currentSupplier = availabilitySource?.data || supplierData

  const [workingHours, setWorkingHours] = useState(() => getDefaultWorkingHours())
  const [unavailableDates, setUnavailableDates] = useState([])
  const [busyDates, setBusyDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availabilityNotes, setAvailabilityNotes] = useState("")
  const [advanceBookingDays, setAdvanceBookingDays] = useState(7)
  const [maxBookingDays, setMaxBookingDays] = useState(365)
  const [weekendPremium, setWeekendPremium] = useState({ enabled: false, type: "percentage", amount: 25 })

  const [saveStatus, setSaveStatus] = useState("idle")
  const [lastSaved, setLastSaved] = useState(null)
  const saveTimeoutRef = useRef(null)
  const isSavingRef = useRef(false)
  const lastSavedDataRef = useRef(null)

  // Direct save to Supabase
  const saveToDatabase = useCallback(
    async (data) => {
      if (isSavingRef.current) return

      const dataString = JSON.stringify(data)
      if (lastSavedDataRef.current === dataString) return

      try {
        isSavingRef.current = true
        setSaveStatus("saving")

        const targetBusiness = primaryBusiness
        if (!targetBusiness) throw new Error("No primary business found")

        const availabilityData = {
          availabilityType: "time_slot_based",
          workingHours: data.workingHours,
          unavailableDates: data.unavailableDates,
          busyDates: data.busyDates,
          availabilityNotes: data.availabilityNotes,
          advanceBookingDays: Number(data.advanceBookingDays),
          maxBookingDays: Number(data.maxBookingDays),
          availabilityVersion: "2.0",
          lastUpdated: new Date().toISOString(),
          weekendPremium: data.weekendPremium,
        }

        const updatedData = {
          ...targetBusiness.data,
          ...availabilityData,
          updatedAt: new Date().toISOString(),
        }

        const { error } = await supabase.from("suppliers").update({ data: updatedData }).eq("id", targetBusiness.id)

        if (error) throw error

        lastSavedDataRef.current = dataString
        setSaveStatus("saved")
        setLastSaved(new Date())

        setTimeout(() => setSaveStatus("idle"), 3000)
      } catch (error) {
        console.error("Save error:", error)
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 5000)
      } finally {
        isSavingRef.current = false
      }
    },
    [primaryBusiness],
  )

  // Auto-save with debounce
  useEffect(() => {
    if (!primaryBusiness) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      const data = {
        workingHours,
        unavailableDates,
        busyDates,
        availabilityNotes,
        advanceBookingDays,
        maxBookingDays,
        weekendPremium,
      }
      saveToDatabase(data)
    }, 1500)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [
    workingHours,
    unavailableDates,
    busyDates,
    availabilityNotes,
    advanceBookingDays,
    maxBookingDays,
    weekendPremium,
    saveToDatabase,
  ])

  // Load initial data
  useEffect(() => {
    if (currentSupplier) {
      setWorkingHours(migrateWorkingHours(currentSupplier.workingHours) || getDefaultWorkingHours())
      setUnavailableDates(migrateDateArray(currentSupplier.unavailableDates) || [])
      setBusyDates(currentSupplier.busyDates || [])
      setAvailabilityNotes(currentSupplier.availabilityNotes || "")
      setAdvanceBookingDays(currentSupplier.advanceBookingDays ?? 7)
      setMaxBookingDays(currentSupplier.maxBookingDays ?? 365)
      setWeekendPremium(currentSupplier.weekendPremium || { enabled: false, type: "percentage", amount: 25 })

      // Set initial saved data
      lastSavedDataRef.current = JSON.stringify({
        workingHours: migrateWorkingHours(currentSupplier.workingHours) || getDefaultWorkingHours(),
        unavailableDates: migrateDateArray(currentSupplier.unavailableDates) || [],
        busyDates: currentSupplier.busyDates || [],
        availabilityNotes: currentSupplier.availabilityNotes || "",
        advanceBookingDays: currentSupplier.advanceBookingDays ?? 7,
        maxBookingDays: currentSupplier.maxBookingDays ?? 365,
        weekendPremium: currentSupplier.weekendPremium || { enabled: false, type: "percentage", amount: 25 },
      })
    }
  }, [currentSupplier])

  const handleDayAvailabilityChange = (day, value) => {
    setWorkingHours((prev) => ({ ...prev, [day]: convertToWorkingHours(value) }))
  }

  const applyTemplate = (template) => {
    const templates = {
      business: {
        Monday: convertToWorkingHours("full"),
        Tuesday: convertToWorkingHours("full"),
        Wednesday: convertToWorkingHours("full"),
        Thursday: convertToWorkingHours("full"),
        Friday: convertToWorkingHours("full"),
        Saturday: convertToWorkingHours("closed"),
        Sunday: convertToWorkingHours("closed"),
      },
      weekend: {
        Monday: convertToWorkingHours("closed"),
        Tuesday: convertToWorkingHours("closed"),
        Wednesday: convertToWorkingHours("closed"),
        Thursday: convertToWorkingHours("closed"),
        Friday: convertToWorkingHours("closed"),
        Saturday: convertToWorkingHours("full"),
        Sunday: convertToWorkingHours("full"),
      },
      flexible: {
        Monday: convertToWorkingHours("full"),
        Tuesday: convertToWorkingHours("full"),
        Wednesday: convertToWorkingHours("full"),
        Thursday: convertToWorkingHours("full"),
        Friday: convertToWorkingHours("full"),
        Saturday: convertToWorkingHours("full"),
        Sunday: convertToWorkingHours("full"),
      },
    }
    if (templates[template]) setWorkingHours(templates[template])
  }

  const markUnavailableRange = (days, timeSlots = ["morning", "afternoon"]) => {
    const dates = []
    for (let i = 0; i < days; i++) {
      const date = addDays(startOfDay(new Date()), i)
      dates.push({ date: date.toISOString().split("T")[0], timeSlots })
    }

    setUnavailableDates((prev) => {
      const combined = [...prev, ...dates]
      return combined.reduce((acc, current) => {
        const existing = acc.find((item) => item.date === current.date)
        if (existing) {
          existing.timeSlots = [...new Set([...existing.timeSlots, ...current.timeSlots])]
        } else {
          acc.push(current)
        }
        return acc
      }, [])
    })
  }

  const removeTimeSlotFromDate = (dateIndex, timeSlot) => {
    setUnavailableDates((prev) => {
      const updated = [...prev]
      const item = updated[dateIndex]
      if (item.timeSlots.length === 1) {
        updated.splice(dateIndex, 1)
      } else {
        item.timeSlots = item.timeSlots.filter((slot) => slot !== timeSlot)
      }
      return updated
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading availability settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="space-y-1">
              <h2 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight">
                Time Slot Availability Settings
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Changes save automatically • Applies to all {businesses?.length || 0} businesses
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-6">
          <Tabs defaultValue="hours" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="w-full min-w-max grid grid-cols-3 p-1 rounded-lg h-auto bg-white border border-gray-200">
                <TabsTrigger
                  value="hours"
                  className="flex flex-col items-center justify-center h-14 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium whitespace-nowrap min-w-[120px]"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Slots</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="flex flex-col items-center justify-center h-14 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium whitespace-nowrap min-w-[120px]"
                >
                  <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Dates</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex flex-col items-center justify-center h-14 sm:h-20 p-2 gap-1 sm:gap-2 data-[state=active]:bg-[hsl(var(--primary-400))] data-[state=active]:text-white rounded-md text-xs sm:text-sm font-medium whitespace-nowrap min-w-[120px]"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Rules</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="hours" className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-xl font-semibold mb-2 text-gray-900">Weekly Schedule</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Choose availability for each day of the week
                  </p>

                  <div className="mb-4 sm:mb-6">
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                      <div className="flex gap-2 sm:gap-3 min-w-max sm:grid sm:grid-cols-3 sm:w-full">
                        <Button
                          variant="outline"
                          onClick={() => applyTemplate("business")}
                          className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto min-w-[140px] sm:min-w-0 flex-shrink-0"
                        >
                          <div className="text-center">
                            <div className="font-medium">Business Hours</div>
                            <div className="text-xs text-gray-500">(Mon-Fri)</div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => applyTemplate("weekend")}
                          className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto min-w-[140px] sm:min-w-0 flex-shrink-0"
                        >
                          <div className="text-center">
                            <div className="font-medium">Weekends Only</div>
                            <div className="text-xs text-gray-500">(Sat-Sun)</div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => applyTemplate("flexible")}
                          className="border-gray-300 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-200))] text-xs sm:text-sm p-3 h-auto min-w-[140px] sm:min-w-0 flex-shrink-0"
                        >
                          <div className="text-center">
                            <div className="font-medium">Flexible Hours</div>
                            <div className="text-xs text-gray-500">(All Days)</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 space-y-3">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const dayData = workingHours[day]
                      const currentValue = convertFromWorkingHours(dayData)
                      const isWeekend = day === "Saturday" || day === "Sunday"

                      return (
                        <div
                          key={day}
                          className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-[hsl(var(--primary-200))]"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-3 min-h-[60px]">
                            <div className="flex items-center gap-3 min-w-[120px] flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary-100))] border border-[hsl(var(--primary-200))] flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-[hsl(var(--primary-700))]">
                                  {day.charAt(0)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-sm sm:text-base text-gray-900 block">{day}</span>
                                {isWeekend && <div className="text-xs text-gray-500">Weekend</div>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                              <div className="flex-1 sm:w-36 lg:w-48">
                                <Select
                                  value={currentValue}
                                  onValueChange={(value) => handleDayAvailabilityChange(day, value)}
                                >
                                  <SelectTrigger className="w-full pl-2 h-10 sm:h-12 bg-white border-gray-300">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {AVAILABILITY_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center gap-2 py-1">
                                          <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                            {option.label}
                                          </span>
                                          <span className="text-xs text-gray-500">{option.description}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-[100px] justify-end">
                                <div
                                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${currentValue === "closed" ? "bg-red-400" : currentValue === "full" ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--primary-400))]"}`}
                                />
                                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                                  {currentValue === "closed"
                                    ? "Closed"
                                    : currentValue === "full"
                                      ? "Available"
                                      : "Partial"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="p-3 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-xl font-semibold mb-2 text-gray-900">Block Specific Time Slots</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Click on dates to select time slots to block
                    </p>

                    <div className="mb-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        <div className="flex gap-2 min-w-max sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markUnavailableRange(7, ["morning", "afternoon"])}
                            className="border-gray-300 text-xs p-3 h-auto min-w-[120px] sm:min-w-0 flex-shrink-0"
                          >
                            <div className="text-center">
                              <div className="font-medium">Block Next 7 Days</div>
                              <div className="text-xs text-gray-500">(All day)</div>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markUnavailableRange(7, ["morning"])}
                            className="border-gray-300 text-xs p-3 h-auto min-w-[120px] sm:min-w-0 flex-shrink-0"
                          >
                            <div className="text-center">
                              <div className="font-medium">Block Mornings</div>
                              <div className="text-xs text-gray-500">(Next 7 days)</div>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markUnavailableRange(7, ["afternoon"])}
                            className="border-gray-300 text-xs p-3 h-auto min-w-[120px] sm:min-w-0 flex-shrink-0"
                          >
                            <div className="text-center">
                              <div className="font-medium">Block Afternoons</div>
                              <div className="text-xs text-gray-500">(Next 7 days)</div>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUnavailableDates([])}
                            className="border-gray-300 text-xs p-3 h-auto min-w-[120px] sm:min-w-0 flex-shrink-0"
                          >
                            <div className="text-center">
                              <div className="font-medium">Clear All</div>
                              <div className="text-xs text-gray-500">(Remove blocks)</div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <TimeSlotCalendar
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    unavailableDates={unavailableDates}
                    setUnavailableDates={setUnavailableDates}
                  />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Blocked Time Slots</h4>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {unavailableDates.reduce((acc, item) => acc + item.timeSlots.length, 0)} slots
                    </Badge>
                  </div>

                  {unavailableDates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No blocked time slots</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-64 sm:h-96">
                      <div className="space-y-3">
                        {unavailableDates
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((item, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-red-900 mb-2">
                                    {new Date(item.date).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {item.timeSlots.map((slot) => {
                                      const slotConfig = TIME_SLOTS[slot]
                                      const SlotIcon = slotConfig?.icon || Clock
                                      return (
                                        <Badge
                                          key={slot}
                                          variant="secondary"
                                          className="bg-red-100 text-red-800 text-xs flex items-center gap-1"
                                        >
                                          <SlotIcon className="w-3 h-3" />
                                          {slotConfig?.label || slot}
                                          <button
                                            onClick={() => removeTimeSlotFromDate(index, slot)}
                                            className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setUnavailableDates((prev) => prev.filter((_, i) => i !== index))}
                                  className="hover:bg-red-100 p-2 h-8 w-8 ml-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-3 sm:p-6">
              <div className="max-w-2xl bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="advance-booking">Minimum advance booking (days)</Label>
                      <Input
                        id="advance-booking"
                        type="number"
                        min="0"
                        max="30"
                        value={advanceBookingDays}
                        onChange={(e) => setAdvanceBookingDays(Number.parseInt(e.target.value) || 0)}
                        className="mt-1 h-10 sm:h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="max-booking">Maximum advance booking (days)</Label>
                      <Input
                        id="max-booking"
                        type="number"
                        min="1"
                        max="730"
                        value={maxBookingDays}
                        onChange={(e) => setMaxBookingDays(Number.parseInt(e.target.value) || 365)}
                        className="mt-1 h-10 sm:h-12"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-gray-900 mb-2">Weekend Premium Pricing</h4>
                      <p className="text-sm text-gray-600">Charge extra for Saturday and Sunday bookings</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <Checkbox
                          id="weekend-premium"
                          checked={weekendPremium.enabled}
                          onCheckedChange={(checked) => setWeekendPremium((prev) => ({ ...prev, enabled: checked }))}
                          className="w-5 h-5"
                        />
                        <Label htmlFor="weekend-premium" className="text-sm font-medium cursor-pointer text-amber-900">
                          Enable weekend premium pricing
                        </Label>
                      </div>

                      {weekendPremium.enabled && (
                        <div className="ml-8 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Premium Type</Label>
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="premium-percentage"
                                  checked={weekendPremium.type === "percentage"}
                                  onChange={() => setWeekendPremium((prev) => ({ ...prev, type: "percentage" }))}
                                  className="w-4 h-4"
                                />
                                <Label htmlFor="premium-percentage" className="text-sm cursor-pointer">
                                  Percentage increase
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="premium-fixed"
                                  checked={weekendPremium.type === "fixed"}
                                  onChange={() => setWeekendPremium((prev) => ({ ...prev, type: "fixed" }))}
                                  className="w-4 h-4"
                                />
                                <Label htmlFor="premium-fixed" className="text-sm cursor-pointer">
                                  Fixed amount
                                </Label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="premium-amount">
                              {weekendPremium.type === "percentage"
                                ? "Percentage increase (%)"
                                : "Additional amount (£)"}
                            </Label>
                            <Input
                              id="premium-amount"
                              type="number"
                              min="0"
                              max={weekendPremium.type === "percentage" ? 100 : 1000}
                              value={weekendPremium.amount}
                              onChange={(e) =>
                                setWeekendPremium((prev) => ({ ...prev, amount: Number.parseInt(e.target.value) || 0 }))
                              }
                              className="h-10 mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
      </div>
    </div>
  )
}

export default TimeSlotAvailabilityContent
