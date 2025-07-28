"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight } from "lucide-react"

export default function SnappysPresentParty({
  suppliers = {},
  enquiries = [],
  timeRemaining = 24,
  onPaymentReady,
  showPaymentCTA = false,
}) {
  const [snappyExpression, setSnappyExpression] = useState("waiting")

  // Filter out einvites from tracking
  const trackableSuppliers = Object.entries(suppliers).filter(([key, supplier]) => supplier && key !== "einvites")
  const totalSuppliers = trackableSuppliers.length
  const supplierStates = trackableSuppliers.map(([type, supplier]) => {
    const enquiry = enquiries.find((e) => e.supplier_category === type)
    return {
      type,
      name: supplier.name,
      status: enquiry?.status || "pending",
      category: type,
    }
  })

  const confirmedCount = supplierStates.filter((s) => s.status === "accepted").length
  const allConfirmed = confirmedCount === totalSuppliers && totalSuppliers > 0

  // Update Snappy's mood based on progress
  useEffect(() => {
    if (allConfirmed) {
      setSnappyExpression("celebrating")
    } else if (confirmedCount > 0) {
      setSnappyExpression("excited")
    } else {
      setSnappyExpression("waiting")
    }
  }, [confirmedCount, allConfirmed])

  const formatTime = (hours) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getSupplierColor = (type) => {
    const colors = {
      venue: "hsl(11, 100%, 76%)",
      entertainment: "hsl(12, 100%, 68%)",
      catering: "hsl(14, 100%, 64%)",
      activities: "hsl(14, 100%, 56%)",
      facePainting: "hsl(11, 80%, 49%)",
      partyBags: "hsl(10, 80%, 42%)",
      decorations: "hsl(9, 84%, 35%)",
      balloons: "hsl(8, 85%, 30%)",
    }
    return colors[type] || "hsl(10, 100%, 85%)"
  }

  const getSupplierIcon = (type) => {
    const icons = {
      venue: "🏰",
      entertainment: "🎭",
      catering: "🍰",
      activities: "🎮",
      facePainting: "🎨",
      partyBags: "🎁",
      decorations: "🎀",
      balloons: "🎈",
    }
    return icons[type] || "🎉"
  }

  const getPresentState = (status) => {
    switch (status) {
      case "accepted":
        return "unwrapped"
      case "pending":
        return "wrapped"
      case "declined":
        return "replacing"
      default:
        return "wrapped"
    }
  }

  return (
    <Card className="border border-[hsl(var(--primary-900))] shadow-sm">
      <CardContent className="p-6">
        {/* Header with Snappy */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
              <img
                src={
                  snappyExpression === "celebrating"
                    ? "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753256660/dwb6vr6lxyj7ubokfeel.png"
                    : snappyExpression === "excited"
                      ? "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291833/ctcf51iyrrhfv6y481dl.jpg"
                      : "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291661/qjdvo5qnbylnzwhlawhf.png"
                }
                alt="Snappy the Crocodile"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "block"
                }}
                onLoad={(e) => {
                  e.target.nextSibling.style.display = "none"
                }}
              />
              <div className="text-4xl" style={{ display: "none" }}>
                {snappyExpression === "celebrating" ? "🐊🎉" : snappyExpression === "excited" ? "🐊😊" : "🐊😴"}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {allConfirmed ? "All suppliers confirmed!" : "Supplier confirmations"}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {allConfirmed
                ? "Your party team is ready"
                : `${totalSuppliers - confirmedCount} of ${totalSuppliers} suppliers still pending`}
            </p>
            {!allConfirmed && timeRemaining > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatTime(timeRemaining)} remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {confirmedCount}/{totalSuppliers} confirmed
            </span>
            <span className="text-xs text-gray-500">
              {totalSuppliers > 0 ? Math.round((confirmedCount / totalSuppliers) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalSuppliers > 0 ? (confirmedCount / totalSuppliers) * 100 : 0}%`,
                backgroundColor: allConfirmed ? "#FF8B70" : "#FF8B70",
              }}
            />
          </div>
        </div>

        {/* Supplier list */}
        <div className="space-y-3 mb-6">
          {supplierStates.map((supplier) => {
            const presentState = getPresentState(supplier.status)
            const icon = getSupplierIcon(supplier.type)

            return (
              <div key={supplier.type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-sm"
                  style={{
                    backgroundColor:
                      presentState === "unwrapped" ? "#FF8B70" : getSupplierColor(supplier.type),
                    color: "white",
                  }}
                >
                  {presentState === "unwrapped" ? "✓" : icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {supplier.type.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {presentState === "unwrapped"
                    ? "Confirmed"
                    : presentState === "replacing"
                      ? "Finding replacement"
                      : "Pending"}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action section */}
        {allConfirmed && showPaymentCTA && (
          <div className="border-t pt-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-3">All suppliers have confirmed. Ready to secure your party!</p>
            </div>
            <Button
              onClick={onPaymentReady}
              className="w-full text-white py-3 bg-primary-500"
            
            >
              Pay £180 to secure party
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {!allConfirmed && (
          <div className="border-t pt-4">
            <p className="text-center text-sm text-gray-500">Waiting for remaining suppliers to confirm...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
