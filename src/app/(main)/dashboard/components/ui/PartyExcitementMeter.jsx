"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, Sparkles } from "lucide-react"

export default function PartyExcitementMeter({ excitementLevel = 95, suppliers = {}, totalCost = 0, budget = 600 }) {
  // Calculate excitement based on party completeness
  const calculateExcitement = () => {
    const supplierCount = Object.values(suppliers).filter(Boolean).length
    const maxSuppliers = 8 // Total possible suppliers
    const completeness = (supplierCount / maxSuppliers) * 100

    // Factor in budget utilization (sweet spot around 80-90%)
    const budgetUtilization = (totalCost / budget) * 100
    const budgetFactor = budgetUtilization > 90 ? 95 : Math.min(budgetUtilization + 20, 100)

    // Combine factors
    const calculated = Math.round(completeness * 0.7 + budgetFactor * 0.3)
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
    <Card className="relative overflow-hidden bg-primary-200 border-2 border-[hsl(var(--primary-200))] shadow-xl">
      {/* Decorative background elements matching header */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-3 left-4 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <div className="absolute top-8 right-6 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
        <div className="absolute top-16 left-1/3 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-60"></div>
        <div className="absolute bottom-12 right-4 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-50"></div>

        {/* Sparkle elements */}
        <Sparkles className="absolute top-4 right-8 w-4 h-4 text-[hsl(var(--primary-300))] opacity-40" />
        <Sparkles className="absolute bottom-8 left-6 w-3 h-3 text-[hsl(var(--primary-400))] opacity-60" />
      </div>

      <CardContent className="p-8 text-center relative z-10">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Excitement Level!</h3>
          </div>

          <div className="relative">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              <span className="text-3xl font-bold text-white">{finalExcitement}%</span>
            </div>
            <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
              {getExcitementEmoji(finalExcitement)}
            </div>
            <div className="absolute -bottom-2 -left-2 text-2xl">
              <Sparkles className="w-6 h-6 text-[hsl(var(--primary-400))] animate-pulse" />
            </div>
          </div>

          <p className="text-base font-semibold text-gray-700 bg-white/50 px-4 py-2 rounded-full border border-[hsl(var(--primary-200))]">
            {getExcitementMessage(finalExcitement)}
          </p>

          {/* Enhanced Progress indicators */}
          <div className="space-y-3 pt-4 border-t border-[hsl(var(--primary-200))]">
            <div className="flex justify-between text-sm text-gray-700 font-medium">
              <span>Party Completeness</span>
              <span>{Object.values(suppliers).filter(Boolean).length}/8 suppliers</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full h-3 shadow-inner border border-[hsl(var(--primary-200))]">
                <div
                  className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${(Object.values(suppliers).filter(Boolean).length / 8) * 100}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
