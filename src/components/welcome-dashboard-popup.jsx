"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Cake } from "lucide-react"

export default function WelcomeDashboardPopup({ isOpen, onClose, onNameSubmit }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [existingChildData, setExistingChildData] = useState(null)

  // Check for existing party details and auto-submit if available
  useEffect(() => {
    const checkExistingData = () => {
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          
  
          
          // If we have child data from à la carte, use it and auto-submit
          if (parsed.source === 'a_la_carte' && parsed.firstName && parsed.childAge) {
 
            
            const childData = {
              childName: parsed.childName || `${parsed.firstName} ${parsed.lastName || ''}`.trim(),
              childAge: parsed.childAge,
              firstName: parsed.firstName,
              lastName: parsed.lastName || ''
            }
            
            // Auto-submit and close immediately
            if (onNameSubmit) {
              onNameSubmit(childData)
            }
            onClose() // Close popup immediately
            
            return // Early return
          }
        }
        

      } catch (error) {
        console.log('Error checking existing data:', error)
      }
    }
    
    if (isOpen) {
      checkExistingData()
    }
  }, [isOpen, onNameSubmit, onClose])

  const handleNameSubmit = () => {
    if (firstName.trim() && childAge) {
      onNameSubmit?.({
        childName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        childAge: parseInt(childAge),
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })
      // Close immediately instead of going to step 2
      handleClose()
    }
  }

  const handleClose = () => {
    setFirstName("")
    setLastName("")
    setChildAge("")
    setExistingChildData(null)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && firstName.trim() && childAge) {
      handleNameSubmit()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-[90vw] md:w-[60vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="md:text-4xl text-start text-3xl font-black text-gray-900 leading-tight">
            Almost Ready!<br className="sm:hidden" /> One Quick Thing...
          </DialogTitle>
        </DialogHeader>

        {/* Name and Age collection */}
        <div className="space-y-3">
          <div className="text-gray-700 space-y-2">
            <p className="text-sm text-gray-600 px-2">
              Who's celebrating? We'll make it extra special for them!
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Child's First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-base font-medium border-2 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl"
                  placeholder="e.g. Emma"
                  autoFocus
                />
              </div>
            </div>

            {/* Child's Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last name <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-base font-medium border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                  placeholder="e.g. Smith"
                />
              </div>
            </div>

            {/* Child's Age */}
            <div className="space-y-2">
              <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
                Turning
              </Label>
              <div className="relative">
                <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select value={childAge} onValueChange={(value) => setChildAge(value)}>
                  <SelectTrigger className="w-full pl-10 h-15 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 years old</SelectItem>
                    <SelectItem value="3">3 years old</SelectItem>
                    <SelectItem value="4">4 years old</SelectItem>
                    <SelectItem value="5">5 years old</SelectItem>
                    <SelectItem value="6">6 years old</SelectItem>
                    <SelectItem value="7">7 years old</SelectItem>
                    <SelectItem value="8">8 years old</SelectItem>
                    <SelectItem value="9">9 years old</SelectItem>
                    <SelectItem value="10">10 years old</SelectItem>
                    <SelectItem value="11">11 years old</SelectItem>
                    <SelectItem value="12">12 years old</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-8">
          <Button 
            onClick={handleNameSubmit}
            disabled={!firstName.trim() || !childAge}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Continue to {firstName.trim() ? `${firstName.trim()}'s` : "My"} Party!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}