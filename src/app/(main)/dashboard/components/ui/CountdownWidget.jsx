"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PartyPopper, Clock, Sparkles, Calendar, Watch } from "lucide-react"

export default function CountdownWidget({ partyDate = "2025-06-14T14:00:00" }) {
  const [timeUntilParty, setTimeUntilParty] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isPartyTime, setIsPartyTime] = useState(false)

  useEffect(() => {
    const calculateTimeUntilParty = () => {
      const partyDateTime = new Date(partyDate)
      const now = new Date()
      const difference = partyDateTime.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeUntilParty({ days, hours, minutes, seconds })
        setIsPartyTime(false)
      } else {
        setTimeUntilParty({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsPartyTime(true)
      }
    }

    calculateTimeUntilParty()
    const interval = setInterval(calculateTimeUntilParty, 1000)

    return () => clearInterval(interval)
  }, [partyDate])

  if (isPartyTime) {
    return (
      <Card className="relative bg-primary-400 border-2 border-[hsl(var(--primary-300))] shadow-lg">
        <CardContent className="p-8">
    
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
         
              <PartyPopper className="w-10 h-10 text-primary-600 animate-bounce" />
              <h3 className="text-2xl font-bold text-primary-800">🎉 PARTY TIME! 🎉</h3>
              <PartyPopper className="w-10 h-10 text-primary-600 animate-bounce" style={{ animationDelay: "0.5s" }} />
            </div>
            <p className="text-lg text-primary-700 font-medium">The magical day has arrived!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative bg-primary-400 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-3 flex items-center gap-2">
              <div className="bg-primary-500 p-3 rounded-xl shadow-lg">
              <Watch className="w- h-6 text-white" />
              </div>
      
              <h3 className="text-xl font-bold text-gray-800">Party Countdown</h3>
  

          <img src="/Vector3.svg" alt="" className="absolute bottom-[-12px] left-0 z-10 w-[50%]" />
          <img src="/Group.svg" alt="" className="absolute top-[-25px] right-0 z-10" />
            <div className="flex items-center justify-center gap-3">
       
         

            </div>

            {/* <div className="flex items-center justify-center gap-2 text-primary-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {new Date(partyDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div> */}
          </div>

          {/* Countdown Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            {/* Days */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-[hsl(var(--primary-200))] hover:border-[hsl(var(--primary-300))] transition-colors z-50">
              <div className="text-3xl font-bold text-primary-600">{timeUntilParty.days}</div>
              <div className="text-sm text-gray-600 font-medium">Days</div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-[hsl(var(--primary-300))] hover:border-[hsl(var(--primary-400))] transition-colors z-50">
              <div className="text-3xl font-bold text-primary-700">{timeUntilParty.hours}</div>
              <div className="text-sm text-gray-600 font-medium">Hours</div>
            </div>

            {/* Minutes */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-[hsl(var(--primary-400))] hover:border-[hsl(var(--primary-500))] transition-colors">
              <div className="text-3xl font-bold text-primary-800">{timeUntilParty.minutes}</div>
              <div className="text-sm text-gray-600 font-medium">Minutes</div>
            </div>

            {/* Seconds */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-[hsl(var(--primary-500))] hover:border-[hsl(var(--primary-600))] transition-colors z-50">
              <div className="text-3xl font-bold text-primary-900">{timeUntilParty.seconds}</div>
              <div className="text-sm text-gray-600 font-medium">Seconds</div>
            </div>
          </div>

          {/* Footer Message */}
          {/* <div className="flex items-center justify-center gap-2 text-primary-700">
            <Clock className="w-4 h-4" />
            <span className="text-base font-medium">Until the magical day arrives!</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div> */}

          {/* Simple Progress Bar */}
          {/* <div className="space-y-2">
            <div className="w-full h-2 bg-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.max(10, Math.min(90, 100 - timeUntilParty.days * 2))}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-primary-600 font-medium">
              <span>Planning</span>
              <span>Party Time!</span>
            </div>
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}
