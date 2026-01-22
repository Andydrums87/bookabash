"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function ComingSoon() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      setErrorMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus("success")
        setEmail("")
      } else {
        const data = await res.json()
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-48 h-24 relative">
            <Image
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578794/Transparent_With_Text_1_nfb1pi.png"
              alt="PartySnap Logo"
              fill
              className="object-contain"
              priority
              sizes="192px"
            />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Kids' parties.{" "}
            <span className="relative inline-block">
              Sorted.
              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-300 -skew-x-6 -z-10"></div>
            </span>
          </h1>

          {/* One-line explainer */}
          <p className="text-lg text-gray-600 max-w-sm mx-auto">
            We help parents book kids' parties without the stress of searching and organising.
          </p>
        </div>

        {/* Local signal */}
        <p className="text-primary-600 font-semibold text-sm tracking-wide uppercase">
          Launching soon in St Albans
        </p>

        {/* Email capture */}
        {status === "success" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-2">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
            <p className="text-green-800 font-medium">You're on the list!</p>
            <p className="text-green-600 text-sm">We'll let you know when we launch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === "error") setStatus("idle")
                }}
                disabled={status === "loading"}
                className="h-12 text-base flex-1 bg-white"
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                className="h-12 px-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold whitespace-nowrap"
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Get early access"
                )}
              </Button>
            </div>

            <p className="text-gray-400 text-xs">
              No spam. Launch updates only.
            </p>

            {status === "error" && (
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        )}

        {/* Founder credits teaser */}
        <p className="text-gray-500 text-sm">
          Founder credits for early sign-ups
        </p>
      </div>
    </div>
  )
}
