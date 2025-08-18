"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Star,
  X,
  Minimize2,
  Sparkles,
  Users,
  Heart,
  ChevronRight
} from "lucide-react"

// Replacement Banner Component
function ReplacementBanner({ 
  replacement, 
  onViewReplacement, 
  onDismiss,
  className = ""
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  return (
    <div className={`transition-all duration-500 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    } ${className}`}>
      <div className="relative w-full p-1 overflow-hidden rounded-xl bg-teal-500 shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <Sparkles className="absolute top-2 right-4 w-3 h-3 text-white/30 animate-pulse" />
          <div className="absolute top-1 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
        </div>

        <div className="relative flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <img 
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361706/xpqvbguxzwdbtxnez0ew.png" 
                className="h-12 w-12" 
                alt="Snappy choosing a replacement" 
              />
            </div>
            <div className="w-full">
              <h3 className="text-white font-bold text-lg">Snappy found an upgrade!</h3>
              <p className="text-white/80 text-xs">{replacement.category} replacement ready</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewReplacement}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium text-md cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>Review</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-1 absolute top-0 right-0 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Replacement Modal Component
function ReplacementModal({ 
  replacement, 
  isOpen, 
  onClose, 
  onApprove, 
  onViewSupplier, 
  onMinimize,
  showUpgrade = false,
  onUpgradeRevealed,
  processingReplacements = new Set()
}) {
  const [upgradeVisible, setUpgradeVisible] = useState(showUpgrade)

  // Auto-show upgrade if restoration
  useEffect(() => {
    if (isOpen && replacement?.isRestoration) {
      console.log('🔄 Restoration replacement - auto-showing upgrade')
      setUpgradeVisible(true)
    } else {
      setUpgradeVisible(showUpgrade)
    }
  }, [isOpen, replacement?.isRestoration, showUpgrade])

  if (!isOpen || !replacement) return null

  const handleRevealUpgrade = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🎯 Revealing upgrade with animation!')
    setUpgradeVisible(true)
    onUpgradeRevealed?.()
  }

  const handleApprove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('✅ Approving replacement:', replacement.id)
    
    // Get package data - for restoration replacements, use stored data
    let packageData = null
    if (replacement.isRestoration && replacement.selectedPackageData) {
      packageData = replacement.selectedPackageData
      console.log('📦 Using restoration package data:', packageData)
    } else {
      // Create default package for regular replacements
      packageData = {
        id: 'basic',
        name: 'Basic Package',
        price: replacement.newSupplier.price,
        duration: '2 hours',
        features: ['Standard service'],
        description: `Basic ${replacement.category} package`
      }
      console.log('📦 Using default package data:', packageData)
    }
    
    onApprove?.(replacement.id, packageData)
  }

  const handleViewSupplier = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('👀 View supplier clicked:', replacement.newSupplier.id)
    
    onViewSupplier?.(replacement.newSupplier.id)
  }

  const handleMinimize = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onMinimize?.()
  }

  const handleClose = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClose?.()
  }

  // Get display values
  const getDisplayPrice = () => {
    if (replacement.isRestoration && replacement.selectedPackageData) {
      return replacement.selectedPackageData.price
    }
    return replacement.newSupplier.price
  }

  const getDisplayPackageName = () => {
    if (replacement.isRestoration && replacement.selectedPackageData) {
      return replacement.selectedPackageData.name
    }
    return 'Basic Package'
  }

  const isProcessing = processingReplacements.has(replacement.id)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleMinimize}
      />
      
      <div className="relative max-w-sm w-full max-h-[90vh] bg-white overflow-hidden rounded-2xl shadow-2xl z-[10000]">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-4 left-4 w-2 h-2 bg-orange-300 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50 animate-pulse"></div>
          <Sparkles className="absolute top-6 right-12 w-3 h-3 text-yellow-400 opacity-40 animate-pulse" />
        </div>

        {/* Header */}
        <div className="relative p-6 text-white z-20 bg-primary-400">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                {replacement.isRestoration ? 'Ready to Book!' : 'Ah Snap!'}
              </h2>
              <p className="text-sm text-white/80">
                {replacement.isRestoration ? 'Your package is selected!' : 'Found you something better!'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-30"
            type="button"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Card Stack Animation */}
        <div className="relative h-80 p-4 z-20">
          {/* Old Supplier Card (Background) */}
          <div className={`absolute inset-4 transform rotate-2 transition-all duration-500 ${
            upgradeVisible ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
          } bg-white border-2 border-gray-300 rounded-xl shadow-md overflow-hidden z-10`}>
            
            {/* Dark overlay for disabled state */}
            <div className="absolute inset-0 bg-black/60 z-30 rounded-xl" />
            
            <div 
              className="h-32 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${replacement.oldSupplier.image || "/placeholder.jpg"})` }}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute top-3 left-3 z-40">
                <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                  {replacement.isRestoration ? 'Previous' : 'Declined'}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 z-40">
                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between relative z-40">
              <div>
                <h3 className="font-bold text-lg mb-1 text-white line-through">
                  {replacement.oldSupplier.name}
                </h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {replacement.oldSupplier.description || "Previous service provider"}
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-300">
                    {replacement.oldSupplier.rating || 4.0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-gray-300 line-through">
                  £{replacement.oldSupplier.price}
                </div>
                <button 
                  type="button"
                  disabled
                  className="bg-gray-600 text-gray-400 text-sm px-3 py-1 rounded cursor-not-allowed"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  {replacement.isRestoration ? 'Replaced' : 'Unavailable'}
                </button>
              </div>
            </div>
          </div>

          {/* New Supplier Card (Foreground) */}
          <div className={`absolute inset-4 transform -rotate-1 transition-all duration-700 ease-out ${
            upgradeVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'
          } bg-white border-2 border-teal-300 rounded-xl shadow-xl overflow-hidden z-20`}>
            <div 
              className="h-32 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${replacement.newSupplier.image || "/placeholder.jpg"})` }}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-teal-500 text-white text-xs px-2 py-1">
                  {replacement.isRestoration ? 'Selected' : 'Better Choice'}
                </Badge>
              </div>
              {replacement.newSupplier.price < replacement.oldSupplier.price && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                    Save £{replacement.oldSupplier.price - replacement.newSupplier.price}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">{replacement.newSupplier.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {replacement.newSupplier.description || "Premium service provider"}
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{replacement.newSupplier.rating || 4.5}</span>
                  <span className="text-xs text-gray-500">
                    ({replacement.newSupplier.reviewCount || 20} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-teal-600">
                  £{getDisplayPrice()}
                </div>
                <button 
                  type="button"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-3 py-1 rounded transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('❤️ Love it clicked!')
                  }}
                >
                  <Heart className="w-3 h-3 inline mr-1" />
                  Love It!
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="relative p-4 bg-gray-50 z-20">
          {!upgradeVisible ? (
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-sm">
                Unfortunately, <strong>{replacement.oldSupplier.name}</strong> can't make it
              </p>
              
              <button
                type="button"
                onClick={handleRevealUpgrade}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg transform transition-transform hover:scale-105 cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center font-medium"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                See Your Upgrade!
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleViewSupplier}
                  className="flex-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Profile
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className={`flex-1 text-sm cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-colors ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="truncate">
                        {replacement.isRestoration ? 'Confirm Booking' : `Book ${getDisplayPackageName()}!`}
                      </span>
                    </>
                  )}
                </button>
              </div>
              
              {replacement.isRestoration && (
                <div className="text-center">
                  <p className="text-xs text-green-600 font-medium">
                    ✅ Package selected: {getDisplayPackageName()} - £{getDisplayPrice()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-20">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleMinimize}
              className="flex-1 bg-primary-100 text-gray-500 py-2 px-4 rounded hover:bg-primary-200 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4 inline mr-2" />
              Decide Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function MobileAutoReplacementFlow({ 
  replacements = [], 
  onApproveReplacement, 
  onViewSupplier, 
  onDismiss 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [hiddenReplacementIds, setHiddenReplacementIds] = useState(new Set())
  const [processingReplacements, setProcessingReplacements] = useState(new Set())

  // Filter visible replacements
  const visibleReplacements = replacements.filter(r => 
    !hiddenReplacementIds.has(r.id)
  )

  // ✅ PRIORITY: Check for restoration and auto-open modal
  useEffect(() => {
    console.log('🎭 === RESTORATION CHECK ===')
    
    const shouldRestore = sessionStorage.getItem('shouldRestoreReplacementModal')
    const modalShowUpgrade = sessionStorage.getItem('modalShowUpgrade')
    
    console.log('🎭 Restoration flags:', { 
      shouldRestore, 
      modalShowUpgrade,
      hasReplacements: visibleReplacements.length > 0,
      isDismissed,
      isModalOpen
    })
    
    // ✅ Auto-open modal for restoration
    if (shouldRestore === 'true' && visibleReplacements.length > 0 && !isDismissed) {
      console.log('🎭 RESTORATION CONDITIONS MET - Opening modal automatically')
      
      if (!isModalOpen) {
        console.log('🎭 OPENING MODAL for restoration')
        setIsModalOpen(true)
        setShowBanner(false)
        
        // Clear restoration flag after opening
        setTimeout(() => {
          sessionStorage.removeItem('shouldRestoreReplacementModal')
          console.log('🧹 Cleared shouldRestoreReplacementModal flag')
        }, 500)
      }
    } else {
      console.log('🎭 NOT opening modal for restoration')
    }
  }, [visibleReplacements.length, isModalOpen, isDismissed])

  // Show banner when we have visible replacements (but not during restoration)
  useEffect(() => {
    const shouldRestore = sessionStorage.getItem('shouldRestoreReplacementModal')
    
    if (visibleReplacements.length > 0 && !isDismissed && !isModalOpen && shouldRestore !== 'true') {
      console.log('✅ SHOWING BANNER (not restoration)')
      setShowBanner(true)
    } else {
      console.log('❌ HIDING BANNER')
      setShowBanner(false)
    }
  }, [visibleReplacements.length, isDismissed, isModalOpen])

  // Reset when no visible replacements
  useEffect(() => {
    if (visibleReplacements.length === 0) {
      console.log('🧹 No visible replacements - resetting state')
      setIsModalOpen(false)
      setShowBanner(false)
    }
  }, [visibleReplacements.length])

  // Handle approval
  const handleApprove = (replacementId, packageData = null) => {
    console.log('✅ === APPROVAL CLICKED ===')
    console.log('✅ Replacement ID:', replacementId)
    
    const replacement = replacements.find(r => r.id === replacementId)
    
    // ✅ Handle restoration replacements
    if (replacement?.isRestoration) {
      console.log('🔄 Approving restoration replacement')
      
      // Clear all restoration flags
      sessionStorage.removeItem('shouldRestoreReplacementModal')
      sessionStorage.removeItem('modalShowUpgrade')
      sessionStorage.removeItem('replacementContext')
      
      // Hide UI immediately
      setHiddenReplacementIds(prev => new Set([...prev, replacementId]))
      setIsModalOpen(false)
      setShowBanner(false)
      
      // Use restoration package data
      const packageDataToUse = replacement.selectedPackageData || packageData
      console.log('📦 Using restoration package data:', packageDataToUse)
      
      if (onApproveReplacement) {
        onApproveReplacement(replacementId, packageDataToUse)
      }
      
      return
    }
    
    // ✅ Handle regular replacements
    if (processingReplacements.has(replacementId) || hiddenReplacementIds.has(replacementId)) {
      console.log('⚠️ Already processing or hidden - ignoring')
      return
    }
    
    console.log('✅ Processing regular replacement approval')
    
    // Hide immediately
    setHiddenReplacementIds(prev => new Set([...prev, replacementId]))
    setProcessingReplacements(prev => new Set([...prev, replacementId]))
    setIsModalOpen(false)
    setShowBanner(false)
    
    // Call parent
    if (onApproveReplacement) {
      onApproveReplacement(replacementId, packageData)
    }
  }

  // Handle view supplier
  const handleViewSupplier = (supplierId) => {
    console.log('👀 Viewing supplier:', supplierId)
    
    // For restoration replacements, we want to preserve context
    const currentReplacement = visibleReplacements[0]
    if (currentReplacement?.isRestoration) {
      console.log('🔄 Viewing supplier from restoration - keeping context')
    }
    
    if (onViewSupplier) {
      onViewSupplier(supplierId)
    }
  }

  // Handle modal actions
  const handleOpenModal = () => {
    console.log('🔓 Opening modal from banner')
    setIsModalOpen(true)
    setShowBanner(false)
  }

  const handleCloseModal = () => {
    console.log('🔒 Closing modal')
    setIsModalOpen(false)
    setShowBanner(true)
  }

  const handleMinimizeModal = () => {
    console.log('📦 Minimizing modal')
    setIsModalOpen(false)
    setShowBanner(true)
  }

  const handleDismissBanner = () => {
    console.log('❌ Dismissing banner')
    
    // Hide all current visible replacements
    const currentReplacementIds = visibleReplacements.map(r => r.id)
    setHiddenReplacementIds(prev => new Set([...prev, ...currentReplacementIds]))
    
    setShowBanner(false)
    setIsDismissed(true)
    
    if (onDismiss) {
      onDismiss()
    }
  }

  // Don't render if no visible replacements
  if (visibleReplacements.length === 0 || isDismissed) {
    console.log('🚫 Not rendering - no visible replacements or dismissed')
    return null
  }

  const currentReplacement = visibleReplacements[0]
  console.log('🎯 Rendering with current replacement:', currentReplacement?.newSupplier?.name)

  return (
    <>
      {/* Replacement Banner */}
      {showBanner && !isModalOpen && (
        <ReplacementBanner
          replacement={currentReplacement}
          onViewReplacement={handleOpenModal}
          onDismiss={handleDismissBanner}
          className="mb-6"
        />
      )}

      {/* Replacement Modal */}
      <ReplacementModal
        replacement={currentReplacement}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onViewSupplier={handleViewSupplier}
        onMinimize={handleMinimizeModal}
        showUpgrade={sessionStorage.getItem('modalShowUpgrade') === 'true'}
        onUpgradeRevealed={() => {
          sessionStorage.removeItem('modalShowUpgrade')
        }}
        processingReplacements={processingReplacements}
      />
    </>
  )
}