"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, Sparkles } from "lucide-react"

export default function PartySummaryCard({ partyDetails = {} }) {
  return (
    <Card className="border-2 border-[hsl(var(--primary-200))] shadow-lg bg-gradient-to-br from-primary-50 to-white overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-primary-400 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {partyDetails.childName}'s {partyDetails.theme} Party
                </h2>
                <p className="text-primary-100 text-sm">
                  Age {partyDetails.age} • {partyDetails.theme} Theme
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">🎉</div>
            </div>
          </div>
        </div>

        {/* Party Details */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-gray-900 font-semibold">{partyDetails.date}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Time</p>
                <p className="text-gray-900 font-semibold">{partyDetails.time}</p>
                {/* Show additional time info if available */}
                {partyDetails.timeSlot && partyDetails.duration && (
                  <p className="text-xs text-gray-500 mt-1">
                    {partyDetails.timeSlot === 'morning' ? '10am-1pm window' : '1pm-4pm window'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-gray-900 font-semibold">{partyDetails.location}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Child's Age</p>
                <p className="text-gray-900 font-semibold">{partyDetails.age} years old</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}