"use client"

import { Check, Star, Zap, Award } from "lucide-react"

const badgeShapes = [
  "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
  "polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)",
  "polygon(0 0, 100% 20%, 80% 100%, 20% 80%)",
  "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
]

const BadgeCard = ({ icon, text, color, shape }) => {
  return (
    <div
      className={`p-6 flex flex-col items-center justify-center text-center text-white`}
      style={{ backgroundColor: color, clipPath: shape }}
    >
      <div className="mb-2">{icon}</div>
      <span className="font-semibold">{text}</span>
    </div>
  )
}

export default function SupplierBadges({ supplier }) {
  const badges = [
    {
      icon: <Check size={28} />,
      text: "Verified",
      color: "#FADADD",
      textColor: "#D95C5C",
      show: supplier?.verified,
    },
    {
      icon: <Star size={28} />,
      text: "Highly rated",
      color: "#D1E8FF",
      textColor: "#3B82F6",
      show: supplier?.highlyRated,
    },
    {
      icon: <Zap size={28} />,
      text: "Fast responder",
      color: "#FEF3C7",
      textColor: "#F59E0B",
      show: supplier?.fastResponder,
    },
    {
      icon: <Award size={28} />,
      text: "92% Repeat",
      color: "#D1FAE5",
      textColor: "#10B981",
      show: true, // Assuming this is always shown for now
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
              className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: badge.color }}
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
