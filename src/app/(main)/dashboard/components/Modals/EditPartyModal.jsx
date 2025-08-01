"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Clock,
  Sun,
  Sunset,
  Sparkles,
  MapPin,
  Users,
  PoundSterling,
  FileText,
  Star,
  Gift,
} from "lucide-react"

export default function EditPartyModal({ isOpen, onClose, partyDetails, onSave }) {
  // Safely initialize state with proper date handling
  const [childName, setChildName] = useState(partyDetails?.childName || "")
  const [childAge, setChildAge] = useState(partyDetails?.childAge || "")
  const initializeNames = () => {
    // Priority 1: Use firstName/lastName if available
    if (partyDetails?.firstName || partyDetails?.lastName) {
      return {
        firstName: partyDetails.firstName || "",
        lastName: partyDetails.lastName || ""
      };
    }
    
    // Priority 2: Split childName if available
    if (partyDetails?.childName) {
      const nameParts = partyDetails.childName.trim().split(' ');
      return {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(' ') || ""
      };
    }
    
    // Priority 3: Fallback
    return {
      firstName: "",
      lastName: ""
    };
  };
  
  const { firstName: initFirstName, lastName: initLastName } = initializeNames()
  const [firstName, setFirstName] = useState(initFirstName)
  const [lastName, setLastName] = useState(initLastName)

  // Safe date initialization
  const initializeDate = () => {
    if (!partyDetails?.date) return new Date()

    if (partyDetails.date instanceof Date && !isNaN(partyDetails.date.getTime())) {
      return partyDetails.date
    }

    if (typeof partyDetails.date === "string") {
      const testDate = new Date(partyDetails.date)
      if (!isNaN(testDate.getTime())) {
        return testDate
      }
    }

    return new Date() // Fallback to today
  }

  const [date, setDate] = useState(initializeDate())
  const [timeSlot, setTimeSlot] = useState(partyDetails?.timeSlot || "afternoon")
  const [duration, setDuration] = useState(partyDetails?.duration || 2)
  const [location, setLocation] = useState(partyDetails?.location || "")
  const [guestCount, setGuestCount] = useState(partyDetails?.guestCount || "")
  const [budget, setBudget] = useState(partyDetails?.budget || "")
  const [specialNotes, setSpecialNotes] = useState(partyDetails?.specialNotes || "")
  const [postcode, setPostcode] = useState(partyDetails?.postcode || "")

  // Duration options for children's parties
  const durationOptions = [
    { value: 1.5, label: "1½ hours" },
    { value: 2, label: "2 hours", popular: true },
    { value: 2.5, label: "2½ hours" },
    { value: 3, label: "3 hours", popular: true },
    { value: 3.5, label: "3½ hours" },
    { value: 4, label: "4 hours" },
  ]

  // Guest count options
  const guestOptions = [
    { value: "5", label: "5 guests" },
    { value: "10", label: "10 guests" },
    { value: "15", label: "15 guests" },
    { value: "20", label: "20 guests" },
    { value: "25", label: "25 guests" },
    { value: "30", label: "30+ guests" },
  ]

  // Calculate end time for preview
  const calculateEndTime = (timeSlot, durationHours) => {
    if (!timeSlot || !durationHours) return null

    try {
      const timeSlotWindows = {
        morning: { start: "10:00", end: "13:00" },
        afternoon: { start: "13:00", end: "17:00" },
      }

      const window = timeSlotWindows[timeSlot]
      if (!window) return null

      const startTime = formatTimeForDisplay(window.start)
      const endHour = Number.parseInt(window.start.split(":")[0]) + durationHours
      const endTime = formatTimeForDisplay(`${endHour.toString().padStart(2, "0")}:00`)

      return `${startTime} - ${endTime}`
    } catch (error) {
      return null
    }
  }

  const formatTimeForDisplay = (timeInput) => {
    if (!timeInput) return null

    try {
      const [hours, minutes] = timeInput.split(":")
      const timeObj = new Date()
      timeObj.setHours(Number.parseInt(hours), Number.parseInt(minutes))

      return timeObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return timeInput
    }
  }

  const timePreview = calculateEndTime(timeSlot, duration)
// Also update the handleSave function to save in the correct format:
const handleSave = () => {
  const fullName = `${firstName} ${lastName}`.trim();
  
  const updatedDetails = {
    childName: fullName, // This maps to child_name in database
    childAge,
    firstName: firstName.trim(), // Keep for UI components
    lastName: lastName.trim(), // Keep for UI components
    date,
    timeSlot,
    duration,
    location,
    guestCount,
    budget,
    specialNotes,
    postcode,
  }
  onSave(updatedDetails)
  onClose()
}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] w-[95vw] sm:w-full flex flex-col p-0 gap-0 bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] border-2 border-[hsl(var(--primary-200))] shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-8 w-3 h-3 bg-[hsl(var(--primary-300))] rounded-full opacity-40 animate-pulse"></div>
          <div
            className="absolute top-20 right-12 w-2 h-2 bg-[hsl(var(--primary-400))] rounded-full opacity-50 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-16 left-16 w-2.5 h-2.5 bg-[hsl(var(--primary-300))] rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-24 right-8 w-1.5 h-1.5 bg-[hsl(var(--primary-400))] rounded-full opacity-40 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <Sparkles className="absolute top-12 right-20 w-4 h-4 text-[hsl(var(--primary-300))] opacity-30" />
          <Sparkles className="absolute bottom-12 left-8 w-3 h-3 text-[hsl(var(--primary-400))] opacity-40" />
          <Gift className="absolute top-6 right-6 w-5 h-5 text-[hsl(var(--primary-300))] opacity-20" />
        </div>

        {/* Enhanced Header */}
        <DialogHeader className="relative z-10 p-4 sm:p-6 pb-4 flex-shrink-0 bg-primary-400 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl sm:text-3xl font-black mb-1">Edit Party Details</DialogTitle>
              <DialogDescription className="text-primary-100 text-sm sm:text-base">
                Make your celebration perfect! ✨
              </DialogDescription>
            </div>
          </div>

          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
                fill="currentColor"
              ></path>
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
                fill="currentColor"
              ></path>
              <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 py-4">
            {/* Birthday Star Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[hsl(var(--primary-200))] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Birthday Star</h3>
                  <p className="text-sm text-gray-600">Who's the special one?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl h-12 text-base transition-all duration-200"
                    placeholder="Child's first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl h-12 text-base transition-all duration-200"
                    placeholder="Last name (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[hsl(var(--primary-200))] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">When's the Party?</h3>
                  <p className="text-sm text-gray-600">Pick the perfect time</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                    Party Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-medium h-12 text-base bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl transition-all duration-200",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {date ? format(date, "EEEE, MMMM do, yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot" className="text-sm font-semibold text-gray-700">
                      Time Slot
                    </Label>
                    <Select  value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl h-12 text-base">
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">
                          <div className="flex items-center gap-3 py-1">
                            <Sun className="w-4 h-4 text-yellow-500" />
                            <div>
                              <div className="font-medium">Morning Party</div>
                              <div className="text-xs text-gray-500">10am - 1pm window</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="afternoon">
                          <div className="flex items-center gap-3 py-1">
                            <Sunset className="w-4 h-4 text-orange-500" />
                            <div className="flex-1">
                              <div className="font-medium">Afternoon Party</div>
                              <div className="text-xs text-gray-500">1pm - 4pm window</div>
                            </div>
                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[hsl(var(--primary-100))] text-[hsl(var(--primary-700))] font-bold">
                              Popular
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
                      Duration
                    </Label>
                    <Select
                      value={duration.toString()}
                      onValueChange={(value) => setDuration(Number.parseFloat(value))}
                    >
                      <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl h-12 text-base">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            <div className="flex items-center gap-2 py-1">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{option.label}</span>
                              {option.popular && (
                                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[hsl(var(--primary-100))] text-[hsl(var(--primary-700))] font-bold">
                                  Popular
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enhanced Time Preview */}
                {timeSlot && duration && (
                  <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] border-2 border-[hsl(var(--primary-200))] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[hsl(var(--primary-500))] rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-[hsl(var(--primary-800))]">Party Time Preview</div>
                        <div className="text-sm text-[hsl(var(--primary-700))]">{timePreview}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[hsl(var(--primary-200))] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Party Location</h3>
                  <p className="text-sm text-gray-600">Where's the magic happening?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
                    Venue or Address
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl h-12 text-base transition-all duration-200"
                    placeholder="e.g., Village Hall, Home address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-sm font-semibold text-gray-700">
                    Postcode
                  </Label>
                  <Input
                    id="postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl h-12 text-base transition-all duration-200"
                    placeholder="e.g., SW1A 1AA"
                  />
                </div>
              </div>
            </div>

            {/* Party Details Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[hsl(var(--primary-200))] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Party Details</h3>
                  <p className="text-sm text-gray-600">The important stuff</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestCount" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Guest Count
                    </Label>
                    <Select value={guestCount} onValueChange={setGuestCount}>
                      <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl h-12 text-base">
                        <SelectValue placeholder="How many guests?" />
                      </SelectTrigger>
                      <SelectContent>
                        {guestOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2 py-1">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <PoundSterling className="w-4 h-4" />
                      Budget (£)
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl h-12 text-base transition-all duration-200"
                      placeholder="Your budget"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialNotes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Special Notes
                  </Label>
                  <Textarea
                    id="specialNotes"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-2 focus:ring-[hsl(var(--primary-200))] rounded-xl min-h-[100px] text-base transition-all duration-200 resize-none"
                    placeholder="Any special requirements, dietary needs, or requests..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <DialogFooter className="relative z-10 p-4 sm:p-6 border-t border-[hsl(var(--primary-200))] bg-white/90 backdrop-blur-sm flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-semibold h-12 px-6 rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSave}
              className="w-full sm:w-auto bg-primary-400 hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              ✨ Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
