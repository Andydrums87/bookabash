"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Cake } from "lucide-react"
import Image from "next/image"
import confetti from "canvas-confetti"

export default function WelcomeDashboardPopup({ isOpen, onClose, onNameSubmit }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isAlaCarteUser, setIsAlaCarteUser] = useState(false)
  const [childAge, setChildAge] = useState("")
  const [step, setStep] = useState(1) // 1 = name collection, 2 = welcome message

  useEffect(() => {
    const checkAlaCarteContext = () => {
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          setIsAlaCarteUser(parsed.source === 'a_la_carte')
        }
      } catch (error) {
        console.log('Error checking a la carte context:', error)
      }
    }
    
    if (isOpen) {
      checkAlaCarteContext()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && step === 2) {
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
        })
      }, 500)
      
      return () => clearTimeout(timeout)
    }
  }, [isOpen, step])

  const handleNameSubmit = () => {
    if (firstName.trim() && childAge) {
      // Call the callback to save the child's name and age
      // Make sure we're sending the right field names that match the database
      onNameSubmit?.({
        childName: `${firstName.trim()} ${lastName.trim()}`.trim(), // This will map to child_name in database
        childAge: parseInt(childAge), // This will map to child_age in database
        
        // Also send individual names for UI components that need them
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })
      setStep(2) // Move to welcome step
    }
  }

  const handleClose = () => {
    setStep(1) // Reset for next time
    setFirstName("")
    setLastName("")
    setChildAge("")
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && firstName.trim() && childAge) {
      handleNameSubmit()
    }
  }

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-[80vw] max-w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        
        {step === 1 ? (
          // Step 1: Collect Child's Name
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl sm:text-2xl font-black text-primary-600 leading-tight">
                🎉 Almost Ready!<br className="sm:hidden" /> One Quick Thing...
              </DialogTitle>
            </DialogHeader>

            {/* Name and Age collection */}
            <div className="space-y-3">
              <div className="text-center text-gray-700 space-y-2">
 
                <p className="text-sm text-gray-600 px-2">
  Who's celebrating? We'll make it extra special for them! 🎉
</p>
              </div>

              {/* Mobile-first responsive form */}
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
                      className="pl-10 h-12 text-base font-medium border-2 border-gray-200 focus:border-primary-500 rounded-xl"
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
                      <SelectTrigger className="w-full  pl-10 h-15 text-base border-2 border-gray-200 focus:border-primary-500 rounded-xl">
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

            <DialogFooter className="pt-6">
              <Button 
                onClick={handleNameSubmit}
                disabled={!firstName.trim() || !childAge}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Continue to {firstName.trim() ? `${firstName.trim()}'s` : "My"} Party! 🎉
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Step 2: Welcome Message (Updated with first name)
          <>
    <DialogHeader className="text-center pb-2">
      <DialogTitle className="text-lg sm:text-2xl font-black text-primary-600 leading-tight">
        🎉 {firstName}'s Party {isAlaCarteUser ? 'Started' : 'Plan is Ready'}!
      </DialogTitle>
    </DialogHeader>

    <div className="flex justify-center py-2 sm:py-4">
      <div className="relative">
        <Image
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853551/1_1_lxuiqa.png"
          alt="Snappy smiling"
          width={120}
          height={120}
          className="sm:w-[180px] sm:h-[180px]"
        />
        <div className="absolute -top-1 -right-1 text-lg sm:text-2xl animate-bounce">🎈</div>
        <div className="absolute -bottom-1 -left-1 text-sm sm:text-xl animate-pulse">✨</div>
      </div>
    </div>

    <div className="text-sm text-gray-700 space-y-2 sm:space-y-4 px-2">
      <div className="bg-gradient-to-r from-primary-50 to-rose-50 rounded-lg p-2 sm:p-4 border border-primary-100">
        <p className="text-center font-medium text-primary-800 text-sm sm:text-base">
          {isAlaCarteUser ? (
            <>Great! You've added your first supplier to <strong>{firstName}'s party</strong> 🎊</>
          ) : (
            <>Welcome to <strong>{firstName}'s PartySnap</strong> dashboard! 🎊</>
          )}
        </p>
      </div>
      
      <div className="bg-white rounded-lg p-3 sm:p-4 border-2 border-gray-100">
        <p className="font-semibold text-gray-800 text-center text-sm sm:text-base mb-2">
          {isAlaCarteUser ? "What's next:" : "You can now:"}
        </p>
        <div className="space-y-1 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0 text-xs sm:text-sm">
          {isAlaCarteUser ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-primary-500">✨</span>
                <span>Browse & add more suppliers if needed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-primary-500">💰</span>
                <span>Set your budget (optional)</span>
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2 sm:justify-center">
                <span className="text-primary-500">📧</span>
                <span>Send enquiry when ready to book!</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-primary-500">💰</span>
                <span>Adjust budget & swap suppliers</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-primary-500">💌</span>
                <span>Customize {firstName}'s invites</span>
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2 sm:justify-center">
                <span className="text-primary-500">✨</span>
                <span>Add extras & make it magical!</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    <DialogFooter className="pt-6">
      <DialogClose asChild>
        <Button 
          type="button" 
          className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-primary-600 hover:to-primary-700 text-white font-bold text-base rounded-full h-12 transition-all duration-200 transform hover:scale-[1.02]"
          onClick={handleClose}
        >
          {isAlaCarteUser ? "Got it — Let's Add More! 🎉" : "Got it — Let's Get Snapping! 📸"}
        </Button>
      </DialogClose>
    </DialogFooter>

          </>
        )}
      </DialogContent>
    </Dialog>
  )
}