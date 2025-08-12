"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
  Sparkles,
  X,
} from "lucide-react"

export default function AutoReplacementFlow({ replacements = [], onApproveReplacement, onViewSupplier, onDismiss }) {
  const [expandedReplacement, setExpandedReplacement] = useState(null)
  const [showAllReplacements, setShowAllReplacements] = useState(false)

  if (replacements.length === 0) return null

  // Single replacement - show as enhanced single card
  if (replacements.length === 1) {
    return renderSingleReplacement(replacements[0])
  }

  // Multiple replacements - show collapsed summary with expandable list
  return (
    <div className="space-y-6">
      {/* Enhanced Summary Header Card with Snappy */}
      <Card className="border-2 border-primary-200 shadow-xl overflow-hidden bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23${encodeURIComponent("hsl(var(--primary-500))").replace("#", "")}' fillOpacity='0.4'%3E%3Cpath d='M30 15l15 15-15 15-15-15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-1">
          <div className="bg-white rounded-lg">
            <CardContent className="p-6 sm:p-8 relative">
              {/* Snappy the Crocodile */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative">
                  <img
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753256660/dwb6vr6lxyj7ubokfeel.png"
                    alt="Snappy the Crocodile"
                    className="w-full h-full object-contain drop-shadow-lg hover:scale-110 transition-transform duration-200"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "block"
                    }}
                  />
                  <div
                    className="w-full h-full text-4xl sm:text-5xl flex items-center justify-center"
                    style={{ display: "none" }}
                  >
                    🐊
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="pr-24 sm:pr-32">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center shadow-lg relative flex-shrink-0">
                    <RefreshCw className="w-8 h-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[hsl(var(--primary-400))] rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                      Oops! Quick Change of Plans 🐊
                    </h4>
                    <div className="space-y-3">
                      <p className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                        We apologise, but {replacements.length} of your suppliers can't make it now. But don't worry -
                        we've found even <span className="font-bold text-primary-600">better ones</span> in a snap!
                      </p>
                      <p className="text-base text-primary-700 font-medium">
                        ✨ Tell us what you think of these upgrades:
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge className="bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] text-white shadow-md px-4 py-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {replacements.filter((r) => r.status === "pending_approval").length} Waiting for Your Approval
                  </Badge>
                  {replacements.filter((r) => r.status === "approved").length > 0 && (
                    <Badge className="bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] text-white shadow-md px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {replacements.filter((r) => r.status === "approved").length} Approved
                    </Badge>
                  )}
                </div>

                {/* Categories Preview */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 mb-6 border border-primary-200">
                  <h5 className="font-bold text-primary-800 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Suppliers Being Replaced:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {replacements.map((r) => (
                      <Badge
                        key={r.id}
                        variant="outline"
                        className="text-sm bg-white border-primary-300 text-primary-700 px-3 py-1"
                      >
                        {r.category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Enhanced Toggle and Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReplacements(!showAllReplacements)}
                    className="bg-white border-primary-300 text-primary-700 hover:bg-primary-50 shadow-md"
                    size="lg"
                  >
                    {showAllReplacements ? (
                      <>
                        <ChevronUp className="w-5 h-5 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5 mr-2" />
                        Review All {replacements.length} Replacements
                      </>
                    )}
                  </Button>

                  {/* Quick Actions */}
                  <div className="flex space-x-3">
                    {replacements.filter((r) => r.status === "pending_approval").length > 0 && (
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] text-white shadow-lg"
                        onClick={() => {
                          replacements
                            .filter((r) => r.status === "pending_approval")
                            .forEach((r) => onApproveReplacement(r.id))
                        }}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve All - Let's Go! 🎉
                      </Button>
                    )}
                    {onDismiss && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={onDismiss}
                        className="border-muted text-muted-foreground hover:bg-muted bg-transparent"
                      >
                        Maybe Later
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Detailed Replacements (Collapsible) */}
      {showAllReplacements && (
        <div className="space-y-4">{replacements.map((replacement) => renderSingleReplacement(replacement, true))}</div>
      )}
    </div>
  )

  // Helper function to render individual replacement cards
  function renderSingleReplacement(replacement, isInList = false) {
    const reasonInfo = getReplacementReason(replacement.reason)
    const isExpanded = expandedReplacement === replacement.id

    return (
      <Card
        key={replacement.id}
        className={` shadow-lg transition-all duration-300 hover:shadow-xl ${
          isInList
            ? " bg-white hover:border-primary-300"
            : "border-[hsl(var(--primary-200))] bg-gradient-to-br from-primary-50 to-white"
        }`}
      >
        <CardContent className="p-4 relative">
          {/* Background decoration for single replacement */}
          {!isInList && (
            <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-500 rounded-full"></div>
            </div>
          )}

          {/* Enhanced Header */}
          <div className="flex sm:items-center justify-between mb-6 pt-5">
            <div className="flex items-center space-x-4">
              <div className='flex items-center justify-center'>
                <div>
                  <h4 className="text-2xl font-bold text-gray-800 flex items-center">Ah Snap! Looks like {replacement.oldSupplier.name} isn't available</h4>
                  <p className="text-gray-500 text-base mb-4">Dont fret. Snappy was on the case and found you someone even better!</p>
                </div>
              </div>
            </div>
          </div>

          {/* FIXED: Enhanced Comparison with mobile-responsive layout */}
          <div className="mb-6">
            {/* Desktop Layout - 3 columns */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {/* Old Supplier Card */}
              <div className="relative h-64 rounded-2xl overflow-hidden group">
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale"
                  style={{
                    backgroundImage: `url(${replacement.oldSupplier.image || "/placeholder.svg?height=256&width=400"})`,
                  }}
                />
                <div className="absolute inset-0 bg-black/60" />
                
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Badge className="bg-red-500/90 text-white border-0 font-medium">{replacement.category}</Badge>
                      <Badge className="bg-gray-500/90 text-white border-0 font-medium">Declined</Badge>
                    </div>
                    <div className="w-8 h-8 bg-gray-500/80 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-2 line-through opacity-75">{replacement.oldSupplier.name}</h3>
                    <p className="text-white/80 mb-4 text-sm line-clamp-2">
                      {replacement.oldSupplier.description || "Premium service provider"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">£{replacement.oldSupplier.price}</div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{replacement.oldSupplier.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow/Snappy */}
              <div className="relative overflow-hidden flex items-center justify-center rounded-2xl">
                <img className="h-60" src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753965530/ChatGPT_Image_Jul_31_2025_01_38_43_PM_ozbvja.png" alt="" />
              </div>

              {/* New Supplier Card */}
              <div className="relative h-64 rounded-2xl overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${replacement.newSupplier.image || "/placeholder.svg?height=256&width=400"})`,
                  }}
                />
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Badge className="bg-orange-500 text-white border-0 font-medium">{replacement.category}</Badge>
                      <Badge className="bg-blue-500 text-white border-0 font-medium">Available</Badge>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-2">{replacement.newSupplier.name}</h3>
                    <p className="text-white/90 mb-4 text-sm line-clamp-2">
                      {replacement.newSupplier.description || "Premium service provider with enhanced features"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-3xl font-bold">£{replacement.newSupplier.price}</div>
                        {replacement.newSupplier.price < replacement.oldSupplier.price && (
                          <Badge className="bg-green-500 text-white text-xs font-bold">
                            Save £{replacement.oldSupplier.price - replacement.newSupplier.price}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{replacement.newSupplier.rating}</span>
                        <span className="text-sm text-white/80">({replacement.newSupplier.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Vertical Stack */}
            <div className="md:hidden space-y-4">
              {/* Mobile Header with Snappy */}
              <div className="flex items-center justify-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
                <div className="flex items-center space-x-3">
                  <img 
                    className="h-12 w-12" 
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753256660/dwb6vr6lxyj7ubokfeel.png" 
                    alt="Snappy" 
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium text-primary-800">Snappy found you an upgrade!</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <RefreshCw className="w-4 h-4 text-primary-600" />
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Old Supplier - Compact Card */}
              <div className="bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={replacement.oldSupplier.image || "/placeholder.svg"}
                      alt={replacement.oldSupplier.name}
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <X className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className="bg-red-500 text-white text-xs">{replacement.category}</Badge>
                      <Badge className="bg-gray-500 text-white text-xs">Declined</Badge>
                    </div>
                    <h4 className="font-bold text-gray-700 line-through text-lg">{replacement.oldSupplier.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xl font-bold text-gray-600">£{replacement.oldSupplier.price}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-600">{replacement.oldSupplier.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow Separator */}
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <ChevronDown className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* New Supplier - Enhanced Card */}
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${replacement.newSupplier.image || "/placeholder.svg"})`,
                  }}
                />
                <div className="absolute inset-0 bg-black/50" />
                
                <div className="relative p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <Badge className="bg-orange-500 text-white border-0 font-medium">{replacement.category}</Badge>
                      <Badge className="bg-green-500 text-white border-0 font-medium">Available</Badge>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{replacement.newSupplier.name}</h3>
                  <p className="text-white/90 mb-4 text-sm line-clamp-2">
                    {replacement.newSupplier.description || "Premium service provider with enhanced features"}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-3xl font-bold">£{replacement.newSupplier.price}</div>
                      {replacement.newSupplier.price < replacement.oldSupplier.price && (
                        <Badge className="bg-green-500 text-white text-xs font-bold">
                          Save £{replacement.oldSupplier.price - replacement.newSupplier.price}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{replacement.newSupplier.rating}</span>
                      <span className="text-sm text-white/80">({replacement.newSupplier.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setExpandedReplacement(isExpanded ? null : replacement.id)}
              className="border-primary-300 text-primary-700 hover:bg-primary-50"
            >
              {isExpanded ? "Show Less" : "View Details"}
            </Button>

            <div className="flex space-x-3">
              {replacement.status === "pending_approval" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onViewSupplier?.(replacement.newSupplier.id)}
                    className="border-primary-300 text-primary-700 hover:bg-primary-50"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] text-white shadow-lg"
                    onClick={() => onApproveReplacement(replacement.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Replacement
                  </Button>
                </>
              )}
              {replacement.status === "approved" && (
                <Badge className="bg-primary-100 text-primary-800 border-primary-200 px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approved
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  function getReplacementReason(reason) {
    const reasons = {
      better_reviews: {
        icon: <Star className="w-4 h-4 text-primary-500" />,
        text: "Better Reviews",
        color: "text-primary-800 bg-primary-50 border-primary-200",
      },
      same_price: {
        icon: <Shield className="w-4 h-4 text-primary-500" />,
        text: "Same Price",
        color: "text-primary-800 bg-primary-50 border-primary-200",
      },
      faster_response: {
        icon: <Clock className="w-4 h-4 text-primary-500" />,
        text: "Faster Confirmation",
        color: "text-primary-800 bg-primary-50 border-primary-200",
      },
      premium_upgrade: {
        icon: <TrendingUp className="w-4 h-4 text-primary-500" />,
        text: "Premium Upgrade",
        color: "text-primary-800 bg-primary-50 border-primary-200",
      },
      availability: {
        icon: <CheckCircle className="w-4 h-4 text-primary-500" />,
        text: "Available for Your Date",
        color: "text-primary-800 bg-primary-50 border-primary-200",
      },
    }
    return reasons[reason] || reasons.availability
  }
}