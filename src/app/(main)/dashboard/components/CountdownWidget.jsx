"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PartyPopper, Clock, Sparkles } from "lucide-react"

export default function CountdownWidget({ partyDate = "2025-06-14T14:00:00" }) {
  const [timeUntilParty, setTimeUntilParty] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const calculateTimeUntilParty = () => {
      const partyDateTime = new Date(partyDate)
      const now = new Date()
      const difference = partyDateTime.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

        setTimeUntilParty({ days, hours, minutes })
      } else {
        setTimeUntilParty({ days: 0, hours: 0, minutes: 0 })
      }
    }

    calculateTimeUntilParty()
    const interval = setInterval(calculateTimeUntilParty, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [partyDate])

  return (
    <Card className="bg-[#fef7f7] border-2 border-primary-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <PartyPopper className="w-8 h-8 text-orange-500 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-900">Party Countdown!</h3>
            <PartyPopper className="w-8 h-8 text-orange-500 animate-bounce" style={{ animationDelay: "0.5s" }} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-3 shadow-sm border-2 border-primary-200">
              <div className="text-3xl font-bold text-primary-600">{timeUntilParty.days}</div>
              <div className="text-sm text-gray-600 font-medium">Days</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border-2 border-primary-300">
              <div className="text-3xl font-bold text-primary-700">{timeUntilParty.hours}</div>
              <div className="text-sm text-gray-600 font-medium">Hours</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border-2 border-primary-400">
              <div className="text-3xl font-bold text-primary-800">{timeUntilParty.minutes}</div>
              <div className="text-sm text-gray-600 font-medium">Minutes</div>
            </div>
          </div>

          <p className="text-sm text-gray-700 font-medium flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Until the magical day arrives!
            <Sparkles className="w-4 h-4 animate-pulse" />
          </p>
        </div>
      </CardContent>
    </Card>
  )
}