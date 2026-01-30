"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Mail, Sparkles } from "lucide-react"

export default function PostcodeRestrictionModal({ isOpen, onClose, enteredPostcode }) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Add your email submission logic here (e.g., API call to save the email)
    // For now, we'll simulate a submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)

    // Close modal after 2 seconds
    setTimeout(() => {
      onClose()
      // Reset state for next time
      setTimeout(() => {
        setEmail("")
        setIsSubmitted(false)
      }, 300)
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <DialogTitle className="text-center text-xl font-bold">
                We're Not In Your Area Yet
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                {enteredPostcode && (
                  <span className="font-medium text-gray-700">{enteredPostcode}</span>
                )}
                {enteredPostcode && <br />}
                We're not in your area just yet, but we'll be expanding soon!
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Get notified when we launch in your area
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary-dark"
                  >
                    {isSubmitting ? "Submitting..." : "Notify Me"}
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-bold mb-2">
                You're On The List!
              </DialogTitle>
              <DialogDescription className="text-base">
                We'll let you know as soon as we're available in your area.
              </DialogDescription>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
