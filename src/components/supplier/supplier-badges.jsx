"use client"

import { Check, Star, Zap, Award } from "lucide-react"

export default function SupplierBadges({ supplier }) {
  const badges = [
    {
      icon: <Check size={28} />,
      text: "Verified",
      bgColor: "hsl(8 100% 97%)", // primary-50
      textColor: "hsl(10 80% 42%)", // primary-800
      show: supplier?.verified,
    },
    {
      icon: <Star size={28} />,
      text: "Highly rated",
      bgColor: "hsl(8 100% 93%)", // primary-100
      textColor: "hsl(9 84% 35%)", // primary-900
      show: supplier?.highlyRated,
    },
    {
      icon: <Zap size={28} />,
      text: "Fast responder",
      bgColor: "hsl(10 100% 85%)", // primary-200
      textColor: "hsl(10 80% 42%)", // primary-800
      show: supplier?.fastResponder,
    },
    {
      icon: <Award size={28} />,
      text: "92% Repeat",
      bgColor: "hsl(11 100% 76%)", // primary-300
      textColor: "hsl(8 85% 30%)", // primary-950
      show: true,
    },
  ]

  return (
    <div className="px-4 md:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges
          .filter((badge) => badge.show)
          .map((badge, index) => (
            <div
              key={badge.text}
              className="rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-transform hover:scale-105"
              style={{ backgroundColor: badge.bgColor }}
            >
              <div className="mb-2" style={{ color: badge.textColor }}>
                {badge.icon}
              </div>
              <span className="font-semibold" style={{ color: badge.textColor }}>
                {badge.text}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}