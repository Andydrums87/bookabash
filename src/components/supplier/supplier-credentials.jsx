"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function SupplierCredentials({ credentials }) {
  const [showAllCredentials, setShowAllCredentials] = useState(false)

  if (!credentials || credentials.length === 0) {
    return null
  }

  return (
    <Card className="border-gray-300">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Verification & Credentials</h2>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {credentials.slice(0, showAllCredentials ? credentials.length : 2).map((credential, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                {credential.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{credential.title}</h3>
                <p className="text-xs md:text-sm text-gray-600">{credential.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        {credentials.length > 2 && (
          <Button
            variant="ghost"
            onClick={() => setShowAllCredentials(!showAllCredentials)}
            className="w-full text-sm mt-4 md:hidden"
          >
            {showAllCredentials ? "Show Less" : "Show All Credentials"}
            {showAllCredentials ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
