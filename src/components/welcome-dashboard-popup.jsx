"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Cake } from "lucide-react"

export default function WelcomeDashboardPopup({ isOpen, onClose, onNameSubmit, partyTheme }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [gender, setGender] = useState("")
  const [existingChildData, setExistingChildData] = useState(null)
  const [showErrors, setShowErrors] = useState(false)

  // Show gender field only when theme is "no-theme" or null/undefined (no theme selected)
  const isNoTheme = !partyTheme || partyTheme === "no-theme"

  // Check if all required fields are filled (gender only required if no theme)
  const isFormValid = firstName.trim() && lastName.trim() && childAge && (!isNoTheme || gender)

  // Individual field validation
  const errors = {
    firstName: !firstName.trim(),
    lastName: !lastName.trim(),
    childAge: !childAge,
    gender: isNoTheme && !gender
  }

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
    // Show errors if form is not valid
    if (!isFormValid) {
      setShowErrors(true)
      return
    }

    const submitData = {
      childName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      childAge: parseInt(childAge),
      firstName: firstName.trim(),
      lastName: lastName.trim()
    }

    // Include gender only if it was collected (no-theme parties)
    if (isNoTheme && gender) {
      submitData.gender = gender
    }

    onNameSubmit?.(submitData)
    // Close immediately instead of going to step 2
    handleClose()
  }

  const handleClose = () => {
    // Only allow closing if form is valid (all fields filled)
    if (!isFormValid) {
      return // Prevent closing without completing the form
    }
    setFirstName("")
    setLastName("")
    setChildAge("")
    setGender("")
    setExistingChildData(null)
    onClose()
  }

  // Handle dialog open change - prevent closing without valid form
  const handleOpenChange = (open) => {
    if (!open && !isFormValid) {
      return // Prevent closing without completing the form
    }
    if (!open) {
      handleClose()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isFormValid) {
      handleNameSubmit()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg w-[90vw] md:w-[60vw] max-h-[80vh] overflow-y-auto" showCloseButton={false}>
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
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${showErrors && errors.firstName ? 'text-red-400' : 'text-gray-400'}`} />
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value)
                    if (showErrors) setShowErrors(false)
                  }}
                  onKeyPress={handleKeyPress}
                  className={`pl-10 h-12 text-base font-medium border-2 rounded-xl transition-colors ${
                    showErrors && errors.firstName
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-[hsl(var(--primary-500))]'
                  }`}
                  placeholder="e.g. Emma"
                  autoFocus
                />
              </div>
              {showErrors && errors.firstName && (
                <p className="text-xs text-red-500 mt-1">Please enter first name</p>
              )}
            </div>

            {/* Child's Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last name
              </Label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${showErrors && errors.lastName ? 'text-red-400' : 'text-gray-400'}`} />
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value)
                    if (showErrors) setShowErrors(false)
                  }}
                  onKeyPress={handleKeyPress}
                  className={`pl-10 h-12 text-base font-medium border-2 rounded-xl transition-colors ${
                    showErrors && errors.lastName
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-primary-500'
                  }`}
                  placeholder="e.g. Smith"
                />
              </div>
              {showErrors && errors.lastName && (
                <p className="text-xs text-red-500 mt-1">Please enter last name</p>
              )}
            </div>

            {/* Child's Age */}
            <div className="space-y-2">
              <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
                Turning
              </Label>
              <div className="relative">
                <Cake className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 ${showErrors && errors.childAge ? 'text-red-400' : 'text-gray-400'}`} />
                <Select value={childAge} onValueChange={(value) => {
                    setChildAge(value)
                    if (showErrors) setShowErrors(false)
                  }}>
                  <SelectTrigger className={`w-full pl-10 h-15 text-base border-2 rounded-xl transition-colors ${
                    showErrors && errors.childAge
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-primary-500'
                  }`}>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 year old</SelectItem>
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
              {showErrors && errors.childAge && (
                <p className="text-xs text-red-500 mt-1">Please select age</p>
              )}
            </div>

            {/* Gender - Only shown for no-theme parties */}
            {isNoTheme && (
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                  Gender <span className="text-gray-400 text-xs">(helps us pick colours)</span>
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "boy"}
                      onChange={() => {
                        setGender("boy")
                        if (showErrors) setShowErrors(false)
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Boy</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "girl"}
                      onChange={() => {
                        setGender("girl")
                        if (showErrors) setShowErrors(false)
                      }}
                      className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Girl</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "neutral"}
                      onChange={() => {
                        setGender("neutral")
                        if (showErrors) setShowErrors(false)
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Surprise</span>
                  </label>
                </div>
                {showErrors && errors.gender && (
                  <p className="text-xs text-red-500 mt-1">Please select an option</p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-8">
          <Button
            onClick={handleNameSubmit}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full h-12 transition-all duration-200"
          >
            Continue to {firstName.trim() ? `${firstName.trim()}'s` : "My"} Party!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}