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
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

export default function EditPartyModal({ isOpen, onClose, partyDetails, onSave }) {
  const [childName, setChildName] = useState(partyDetails?.childName || "")
  const [childAge, setChildAge] = useState(partyDetails?.childAge || "")
  const [date, setDate] = useState(partyDetails?.date || new Date())
  const [time, setTime] = useState(partyDetails?.time || "14:00")
  const [location, setLocation] = useState(partyDetails?.location || "")
  const [guestCount, setGuestCount] = useState(partyDetails?.guestCount || "")
  const [budget, setBudget] = useState(partyDetails?.budget || "")
  const [specialNotes, setSpecialNotes] = useState(partyDetails?.specialNotes || "")
  const [postcode, setPostcode] = useState(partyDetails?.postcode || "")

  const handleSave = () => {
    const updatedDetails = {
      childName,
      childAge,
      date,
      time,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Party Details</DialogTitle>
          <DialogDescription>Make changes to your party details here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
            />
          </div>
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget
            </Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="col-span-3"
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
