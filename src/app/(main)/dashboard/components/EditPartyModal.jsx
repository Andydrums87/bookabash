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
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Sun, Sunset } from "lucide-react"

export default function EditPartyModal({ isOpen, onClose, partyDetails, onSave }) {
  // Safely initialize state with proper date handling
  const [childName, setChildName] = useState(partyDetails?.childName || "")
  const [childAge, setChildAge] = useState(partyDetails?.childAge || "")
  
  // Safe date initialization
  const initializeDate = () => {
    if (!partyDetails?.date) return new Date();
    
    if (partyDetails.date instanceof Date && !isNaN(partyDetails.date.getTime())) {
      return partyDetails.date;
    }
    
    if (typeof partyDetails.date === 'string') {
      const testDate = new Date(partyDetails.date);
      if (!isNaN(testDate.getTime())) {
        return testDate;
      }
    }
    
    return new Date(); // Fallback to today
  };
  
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
    { value: 1.5, label: '1½ hours' },
    { value: 2, label: '2 hours', popular: true },
    { value: 2.5, label: '2½ hours' },
    { value: 3, label: '3 hours', popular: true },
    { value: 3.5, label: '3½ hours' },
    { value: 4, label: '4 hours' },
  ];

  // Calculate end time for preview
  const calculateEndTime = (timeSlot, durationHours) => {
    if (!timeSlot || !durationHours) return null;
    
    try {
      // Use the time slot windows to show preview
      const timeSlotWindows = {
        morning: { start: "10:00", end: "13:00" },
        afternoon: { start: "13:00", end: "17:00" }
      };
      
      const window = timeSlotWindows[timeSlot];
      if (!window) return null;
      
      // Show the time window for the slot
      const startTime = formatTimeForDisplay(window.start);
      const endHour = parseInt(window.start.split(':')[0]) + durationHours;
      const endTime = formatTimeForDisplay(`${endHour.toString().padStart(2, '0')}:00`);
      
      return `${startTime} - ${endTime} (within ${timeSlot} window)`;
    } catch (error) {
      return null;
    }
  };

  const formatTimeForDisplay = (timeInput) => {
    if (!timeInput) return null;
    
    try {
      const [hours, minutes] = timeInput.split(':');
      const timeObj = new Date();
      timeObj.setHours(parseInt(hours), parseInt(minutes));
      
      return timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return timeInput;
    }
  };

  const timePreview = calculateEndTime(timeSlot, duration);

  const handleSave = () => {
    const updatedDetails = {
      childName,
      childAge,
      date,
      timeSlot, // Changed from 'time' to 'timeSlot'
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
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Party Details</DialogTitle>
          <DialogDescription>Make changes to your party details here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Child Info Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 border-b pb-2">Child Information</h4>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="childName" className="text-right">
                Child's Name
              </Label>
              <Input
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="childAge" className="text-right">
                Child's Age
              </Label>
              <Input
                id="childAge"
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          {/* Date & Time Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 border-b pb-2">Date & Time</h4>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeSlot" className="text-right">
                Time Slot
              </Label>
              <div className="col-span-3">
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        <span>Morning (10am-1pm)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="afternoon">
                      <div className="flex items-center gap-2">
                        <Sunset className="w-4 h-4" />
                        <span>Afternoon (1pm-4pm)</span>
                        <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <div className="col-span-3">
                <Select value={duration.toString()} onValueChange={(value) => setDuration(parseFloat(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center gap-2">
                          {option.label}
                          {option.popular && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
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

            {/* Time Preview */}
            {timeSlot && duration && (
              <div className="col-span-4 mt-2">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-primary-900">
                      {timePreview}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 border-b pb-2">Location</h4>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Venue/Address
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Village Hall, Home address"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postcode" className="text-right">
                Postcode
              </Label>
              <Input
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="col-span-3"
                placeholder="e.g., SW1A 1AA"
              />
            </div>
          </div>

          {/* Party Details Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 border-b pb-2">Party Details</h4>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guestCount" className="text-right">
                Guest Count
              </Label>
              <Input
                id="guestCount"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="col-span-3"
                placeholder="Number of guests"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget (£)
              </Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="col-span-3"
                placeholder="Your budget"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialNotes" className="text-right">
                Special Notes
              </Label>
              <Input
                id="specialNotes"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="col-span-3"
                placeholder="Any special requirements"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}