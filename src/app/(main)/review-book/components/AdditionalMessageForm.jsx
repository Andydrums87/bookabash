"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Info } from "lucide-react"

export default function AdditionalMessageForm({ formData, onInputChange }) {
  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Additional Message to Suppliers</h2>
            <p className="text-gray-600 text-sm">Any special requests or important details</p>
          </div>
        </div>
        <Textarea
          placeholder="Any specific requests, preferences, or additional information you'd like to share with the suppliers..."
          value={formData.additionalMessage}
          onChange={(e) => onInputChange("additionalMessage", e.target.value)}
          className="bg-white min-h-[200px] border-gray-200 focus:border-primary-500 p-4 text-gray-400 text-base resize-none"
        />
        <p className="text-xs text-gray-500 mt-3 flex items-center">
          <Info className="w-4 h-4 mr-1" />
          This message will be sent to all selected suppliers along with your party details
        </p>
      </CardContent>
    </Card>
  )
}