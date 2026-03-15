"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal"
import { Mail, Loader2, CheckCircle, Bookmark } from "lucide-react"

export default function SavePartyPlanModal({
  isOpen,
  onClose,
  onSuccess,
  partyDetails,
  partyPlan,
  totalCost,
  childName
}) {
  const [email, setEmail] = useState("")
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("")
  const [discountCode, setDiscountCode] = useState("")

  const handleSubmit = async (e) => {
    e?.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      setErrorMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")
    setErrorMessage("")

    try {
      // Get session ID from localStorage
      const sessionId = localStorage.getItem('tracking_session_id')

      if (!sessionId) {
        setStatus("error")
        setErrorMessage("Session not found. Please refresh and try again.")
        return
      }

      const res = await fetch("/api/save-party-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          sessionId,
          partyDetails,
          partyPlan,
          marketingConsent,
          totalCost
        })
      })

      if (res.ok) {
        const data = await res.json()
        setStatus("success")
        // Store email locally for checkout pre-fill
        localStorage.setItem('saved_party_email', email.toLowerCase().trim())
        // Store discount code if received
        if (data.discountCode) {
          setDiscountCode(data.discountCode)
          localStorage.setItem('save_plan_discount_code', data.discountCode)
        }
        // Notify parent component of success
        onSuccess?.()
      } else {
        const data = await res.json()
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Save party plan error:", error)
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  const handleClose = () => {
    // Reset state after a brief delay if success
    if (status === "success") {
      setTimeout(() => {
        setEmail("")
        setMarketingConsent(false)
        setStatus("idle")
        setErrorMessage("")
        setDiscountCode("")
      }, 300)
    } else {
      setEmail("")
      setMarketingConsent(false)
      setStatus("idle")
      setErrorMessage("")
      setDiscountCode("")
    }
    onClose()
  }

  const displayName = childName || partyDetails?.childName || partyDetails?.firstName || "your child"

  return (
    <UniversalModal isOpen={isOpen} onClose={handleClose} size="sm" theme="fun">
      <ModalHeader
        title={status === "success" ? "Party Plan Saved!" : "Save Your Party Plan"}
        subtitle={status === "success"
          ? "Check your inbox for a confirmation"
          : `We'll email you a link to ${displayName}'s party`}
        theme="fun"
        icon={status === "success" ? <CheckCircle className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
      />

      <ModalContent>
        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 mb-2">
              Your party plan{totalCost > 0 && <> worth <strong>£{totalCost.toLocaleString()}</strong></>} is saved!
            </p>
            {discountCode && (
              <div className="my-4 p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg">
                <p className="text-sm text-green-700 font-medium mb-1">🎁 Your £20 off code:</p>
                <p className="text-2xl font-bold text-green-600 tracking-wider font-mono">{discountCode}</p>
                <p className="text-xs text-green-600 mt-1">Use at checkout</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {discountCode ? "Check your email for your discount code and party plan." : "Return anytime to complete your booking."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === "error") setStatus("idle")
                  }}
                  placeholder="your@email.com"
                  className="pl-10 h-12"
                  disabled={status === "loading"}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="marketing"
                checked={marketingConsent}
                onCheckedChange={setMarketingConsent}
                disabled={status === "loading"}
                className="mt-0.5"
              />
              <label htmlFor="marketing" className="text-xs text-gray-500 leading-tight cursor-pointer">
                Send me party planning tips and exclusive offers
              </label>
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}
          </form>
        )}
      </ModalContent>

      <ModalFooter theme="fun">
        {status === "success" ? (
          <Button
            onClick={handleClose}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          >
            Continue Planning
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-transparent"
              disabled={status === "loading"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={status === "loading" || !email}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Party Plan"
              )}
            </Button>
          </div>
        )}
      </ModalFooter>
    </UniversalModal>
  )
}
