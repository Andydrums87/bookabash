"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "lucide-react"
import Image from "next/image"
import confetti from "canvas-confetti"

export default function WelcomeDashboardPopup({ isOpen, onClose, onNameSubmit }) {
  const [childName, setChildName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [step, setStep] = useState(1) // 1 = name collection, 2 = welcome message

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
    if (childName.trim() && childAge) {
      // Call the callback to save the child's name and age
      onNameSubmit?.({
        childName: childName.trim(),
        childAge: parseInt(childAge)
      })
      setStep(2) // Move to welcome step
    }
  }

  const handleClose = () => {
    setStep(1) // Reset for next time
    setChildName("")
    setChildAge("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        
        {step === 1 ? (
          // Step 1: Collect Child's Name
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl font-black text-primary-600">
                🎉 Almost Ready! One Quick Thing...
              </DialogTitle>
            </DialogHeader>

            {/* Name and Age collection */}
            <div className="space-y-4">
              <div className="text-center text-gray-700 space-y-2">
                <p className="text-lg font-medium">
                  Who is the birthday child?
                </p>
                <p className="text-sm text-gray-600">
                  This helps us personalize everything for their special day!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Child's Name */}
                <div className="space-y-2">
                  <Label htmlFor="childName" className="text-sm font-medium text-gray-700">
                    Child's name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="childName"
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && childName.trim() && childAge) {
                          handleNameSubmit()
                        }
                      }}
                      className="pl-9 h-12 text-center font-medium border-2 border-gray-200 focus:border-primary-500 rounded-xl"
                      placeholder="Name"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Child's Age */}
                <div className="space-y-2">
                  <Label htmlFor="childAge" className="text-sm font-medium text-gray-700">
                    Turning
                  </Label>
                  <Select value={childAge} onValueChange={(value) => setChildAge(value)} className="">
                    <SelectTrigger className=" px-2 h-12 border-2 border-gray-200 focus:border-primary-500 rounded-xl w-full py-[21px]">
                      <SelectValue placeholder="Age" />
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

            <DialogFooter>
              <Button 
                onClick={handleNameSubmit}
                disabled={!childName.trim() || !childAge}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to {childName.trim() ? `${childName.trim()}'s` : "My"} Party! 🎉
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Step 2: Welcome Message (Original)
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl font-black text-primary-600">
                🎉 Snappy Says: {childName}'s Party Plan is Ready!
              </DialogTitle>
            </DialogHeader>

            {/* Snappy image */}
            <div className="flex justify-center">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752853551/1_1_lxuiqa.png"
                alt="Snappy smiling"
                width={200}
                height={200}
              />
            </div>

            {/* Friendly copy */}
            <div className="text-sm text-gray-700 space-y-3 dark:text-gray-300">
              <p>
                Welcome to <strong>{childName}'s PartySnap</strong> dashboard! Snappy's got the perfect party started 🎉
              </p>
              <p>Here's what you can do:</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>Adjust your budget</strong></li>
                <li><strong>Swap suppliers</strong></li>
                <li><strong>Customize {childName}'s invites</strong></li>
                <li><strong>Add extras</strong></li>
              </ul>
              <p>
                This is {childName}'s party HQ. Let's make it magical! ✨
              </p>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button 
                  type="button" 
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full"
                  onClick={handleClose}
                >
                  Got it — Let's Get Snapping!
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}