"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap } from "lucide-react"

export default function PartyExcitementMeter({ 
  excitementLevel = 95,
  suppliers = {},
  totalCost = 0,
  budget = 600 
}) {
  // Calculate excitement based on party completeness
  const calculateExcitement = () => {
    const supplierCount = Object.values(suppliers).filter(Boolean).length
    const maxSuppliers = 8 // Total possible suppliers
    const completeness = (supplierCount / maxSuppliers) * 100
    
    // Factor in budget utilization (sweet spot around 80-90%)
    const budgetUtilization = totalCost / budget * 100
    const budgetFactor = budgetUtilization > 90 ? 95 : Math.min(budgetUtilization + 20, 100)
    
    // Combine factors
    const calculated = Math.round((completeness * 0.7) + (budgetFactor * 0.3))
    return Math.min(calculated, 100)
  }

  const finalExcitement = excitementLevel || calculateExcitement()

  const getExcitementMessage = (level) => {
    if (level >= 90) return "Your party is going to be AMAZING! 🌟"
    if (level >= 75) return "This party is shaping up great! 🎊"
    if (level >= 50) return "Good progress on your party! 🎈"
    return "Let's add more excitement! 🎯"
  }

  const getExcitementEmoji = (level) => {
    if (level >= 90) return "🎉"
    if (level >= 75) return "🎊"
    if (level >= 50) return "🎈"
    return "⭐"
  }

  return (
    <Card className="bg-primary-50 border-2 border-primary-200 shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-primary-500" />
            <h3 className="text-lg font-bold text-gray-900">Excitement Level!</h3>
          </div>

          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{finalExcitement}%</span>
            </div>
            <div className="absolute -top-2 -right-2 text-2xl">{getExcitementEmoji(finalExcitement)}</div>
            <div className="absolute -bottom-2 -left-2 text-2xl">✨</div>
          </div>

          <p className="text-sm font-medium text-gray-700">
            {getExcitementMessage(finalExcitement)}
          </p>

          {/* Progress indicators */}
          <div className="space-y-2 pt-2 border-t border-primary-200">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Party Completeness</span>
              <span>{Object.values(suppliers).filter(Boolean).length}/8 suppliers</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(Object.values(suppliers).filter(Boolean).length / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}