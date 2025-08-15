// components/MobileReplacementModal.js - Fixed with proper package data handling
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
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

// Simplified Replacement Banner Component
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
            <div className=" bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361706/xpqvbguxzwdbtxnez0ew.png" className="h-12 w-12" alt="Snappy choosing a replacement" />
            </div>
            <div className="w-full">
              <h3 className="text-white  font-bold text-lg">Snappy found an upgrade!</h3>
              <p className="text-white/80 text-xs">{replacement.category} replacement ready</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewReplacement}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium md:text-lg text-md cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
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

// ✅ ENHANCED: Get package data helper function
const getSelectedPackageData = () => {
  try {
    const storedContext = sessionStorage.getItem('replacementContext')
    if (storedContext) {
      const context = JSON.parse(storedContext)
      return context.selectedPackageData
    }
  } catch (error) {
    console.error('❌ Error getting selected package data:', error)
  }
  return null
}

// ✅ ENHANCED: Set package data helper function
const setSelectedPackageData = (packageData) => {
  try {
    const storedContext = sessionStorage.getItem('replacementContext')
    let context = {}
    
    if (storedContext) {
      context = JSON.parse(storedContext)
    }
    
    context.selectedPackageData = packageData
    context.lastUpdated = new Date().toISOString()
    
    sessionStorage.setItem('replacementContext', JSON.stringify(context))
    console.log('💾 Updated replacement context with package data:', packageData)
  } catch (error) {
    console.error('❌ Error setting package data:', error)
  }
}

// Fixed Modal Component with proper restoration support
function SimpleReplacementModal({ 
  replacement, 
  isOpen, 
  onClose, 
  onApprove, 
  onViewSupplier, 
  onMinimize,
  initialShowUpgrade = false,
  onUpgradeRevealed,
  processingReplacements
}) {
  const [showUpgrade, setShowUpgrade] = useState(initialShowUpgrade)
  const [selectedPackageData, setSelectedPackageDataState] = useState(null)

  // ✅ ENHANCED: Load package data when modal opens
  useEffect(() => {
    if (isOpen) {
      const shouldRestore = sessionStorage.getItem('shouldRestoreReplacementModal')
      const shouldShowUpgrade = sessionStorage.getItem('modalShowUpgrade')
      
      if (shouldRestore === 'true') {
        console.log('🔄 Restoring replacement modal state')
        
        if (shouldShowUpgrade === 'true') {
          setShowUpgrade(true)
          sessionStorage.removeItem('modalShowUpgrade')
        } else {
          setShowUpgrade(initialShowUpgrade)
        }
        
        // ✅ LOAD: Package data from session storage
        const packageData = getSelectedPackageData()
        if (packageData) {
          console.log('📦 Loaded package data from session storage:', packageData)
          setSelectedPackageDataState(packageData)
        }
        
        // Clear the restoration flag
        sessionStorage.removeItem('shouldRestoreReplacementModal')
      } else {
        setShowUpgrade(initialShowUpgrade)
        
        // Still try to load package data even on fresh open
        const packageData = getSelectedPackageData()
        if (packageData) {
          setSelectedPackageDataState(packageData)
        }
      }
    }
  }, [isOpen, initialShowUpgrade])

  if (!isOpen || !replacement) return null

  const handleRevealUpgrade = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🎯 Revealing upgrade with animation!')
    setShowUpgrade(true)
    onUpgradeRevealed?.()
  }
  
  // ✅ ENHANCED: Approve with package data
  const handleApprove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('✅ Approving replacement with package data')
    console.log('📦 Current selected package data:', selectedPackageData)
    
    // ✅ GET: Most up-to-date package data
    const currentPackageData = selectedPackageData || getSelectedPackageData()
    
    if (currentPackageData) {
      console.log('📦 Booking with selected package:', {
        name: currentPackageData.name,
        price: currentPackageData.price,
        id: currentPackageData.id
      })
      
      // ✅ PASS: Both replacement ID and selected package data
      onApprove?.(replacement.id, currentPackageData)
    } else {
      console.log('⚠️ No package data found, using default')
      
      // ✅ CREATE: Default package based on replacement supplier
      const defaultPackage = {
        id: 'basic',
        name: 'Basic Package',
        price: replacement.newSupplier.price,
        duration: '2 hours',
        features: ['Standard service'],
        description: `Basic ${replacement.category} package`
      }
      
      console.log('📦 Using default package:', defaultPackage)
      onApprove?.(replacement.id, defaultPackage)
    }
  }

  const handleViewSupplier = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('👀 View supplier clicked:', replacement.newSupplier.id)
    
    // ✅ ENHANCED: Set comprehensive replacement context
    const replacementContext = {
      replacementId: replacement.id,
      oldSupplierName: replacement.oldSupplier.name,
      newSupplierName: replacement.newSupplier.name,
      supplierName: replacement.newSupplier.name,
      isReplacement: true,
      category: replacement.category,
      returnUrl: '/dashboard',
      showUpgrade: showUpgrade,
      // ✅ PRESERVE: Current package selection
      selectedPackageData: selectedPackageData,
      // ✅ ADD: Additional context for better tracking
      viewedAt: new Date().toISOString(),
      replacementSource: 'mobile_modal'
    }
    
    console.log('📦 Setting comprehensive replacement context:', replacementContext)
    sessionStorage.setItem('replacementContext', JSON.stringify(replacementContext))
    
    // Call the parent's view supplier function
    onViewSupplier?.(replacement.newSupplier.id)
  }

  const handleMinimize = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('📦 Minimize clicked')
    onMinimize?.()
  }

  const handleClose = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🚫 Close clicked')
    onClose?.()
  }

  // ✅ DYNAMIC: Get display price based on selected package or default
  const getDisplayPrice = () => {
    const packageData = selectedPackageData || getSelectedPackageData()
    return packageData?.price || replacement.newSupplier.price
  }

  // ✅ DYNAMIC: Get display package name
  const getDisplayPackageName = () => {
    const packageData = selectedPackageData || getSelectedPackageData()
    return packageData?.name || 'Basic Package'
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleMinimize}
      />
      
      <div className="relative max-w-sm w-full max-h-[90vh] bg-white overflow-hidden rounded-2xl shadow-2xl z-[10000]">
        {/* Fun decorative elements */}
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
              <h2 className="text-2xl font-bold mb-1">Ah Snap! </h2>
              <p className="text-sm text-white/80">Found you something better!</p>
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
      {/* Card Stack Animation */}
<div className="relative h-92 p-4 z-20">
  {/* Background Card (Old Supplier) - Now matching new supplier style with dark overlay */}
  <div className={`absolute inset-4 transform rotate-2 transition-all duration-500 ${
    showUpgrade ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
  } bg-white border-2 border-gray-300 rounded-xl shadow-md overflow-hidden z-10`}>
    
    {/* Dark overlay for disabled state */}
    <div className="absolute inset-0 bg-black/60 z-30 rounded-xl" />
    
    <div 
      className="h-32 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${replacement.oldSupplier.image || "/api/placeholder/400/300"})` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute top-3 left-3 z-40">
        <Badge className="bg-red-500 text-white text-xs px-2 py-1">Declined</Badge>
      </div>
      <div className="absolute top-3 right-3 z-40">
        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
          <X className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
    
    {/* Card content matching new supplier layout */}
    <div className="p-4 flex-1 flex flex-col justify-between relative z-40">
      <div>
        <h3 className="font-bold text-lg mb-1 text-white line-through">
          {replacement.oldSupplier.name}
        </h3>
        
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {replacement.oldSupplier.description || "Premium service provider"}
        </p>
        <div className="flex items-center space-x-2 mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-300">{replacement.oldSupplier.rating}</span>
          <span className="text-xs text-gray-400">({replacement.oldSupplier.reviewCount || 'N/A'} reviews)</span>
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
          Unavailable
        </button>
      </div>
    </div>
  </div>

  {/* Foreground Card (New Supplier) - Unchanged */}
  <div className={`absolute inset-4 transform -rotate-1 transition-all duration-700 ease-out ${
    showUpgrade ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'
  } bg-white border-2 border-teal-300 rounded-xl shadow-xl overflow-hidden z-20`}>
    <div 
      className="h-32 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${replacement.newSupplier.image || "/api/placeholder/400/300"})` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute top-3 left-3">
        <Badge className="bg-teal-500 text-white text-xs px-2 py-1">Better Choice</Badge>
      </div>
      <div className="absolute top-3 right-3">
        {replacement.newSupplier.price < replacement.oldSupplier.price && (
          <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
            Save £{replacement.oldSupplier.price - replacement.newSupplier.price}
          </Badge>
        )}
      </div>
    </div>
    
    <div className="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg mb-1">{replacement.newSupplier.name}</h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {replacement.newSupplier.description || "Premium service provider with enhanced features"}
        </p>
        <div className="flex items-center space-x-2 mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{replacement.newSupplier.rating}</span>
          <span className="text-xs text-gray-500">({replacement.newSupplier.reviewCount} reviews)</span>
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
          {!showUpgrade ? (
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-sm">
                Unfortunately, <strong>{replacement.oldSupplier.name}</strong> can't make it
              </p>
              
              <button
                type="button"
                onClick={handleRevealUpgrade}
                className="w-full bg-primary-500 hover:bg-[hsl(var(--primary-600))] text-white shadow-lg transform transition-transform hover:scale-105 cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center font-medium"
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
                  className="text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Profile
                </button>
           

                <button
  type="button"
  onClick={handleApprove}
  disabled={processingReplacements?.has(replacement.id)} // ✅ ADD: Disable when processing
  className={`text-xs cursor-pointer px-4 rounded-lg flex items-center justify-center font-medium transition-colors ${
    processingReplacements?.has(replacement.id) 
      ? 'bg-gray-400 cursor-not-allowed' 
      : 'bg-teal-600 hover:bg-teal-700 text-white'
  }`}
>
  <CheckCircle className="w-4 h-4 mr-2" />
  <span className="truncate">
    {processingReplacements?.has(replacement.id) 
      ? 'Booking...' 
      : `Book ${getDisplayPackageName()}!`
    }
  </span>
</button>
              </div>
              
              {/* ✅ NEW: Show price summary */}
              {/* <div className="text-center">
                <p className="text-xs text-gray-500">
                  {getDisplayPackageName()} - £{getDisplayPrice()}
                </p>
                <p className="text-xs text-gray-400">
                  This supplier is available and highly rated!
                </p>
              </div> */}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative p-4 bg-white/90 backdrop-blur-sm border-t border-orange-200 z-20">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleMinimize}
              className="flex-1 bg-primary-100 text-gray-500 py-2 px-4 rounded hover:bg-[hsl(var(--primary-300))] transition-colors cursor-pointer"
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

// Fixed MinimizedReplacementIndicator
function MinimizedReplacementIndicator({ 
  replacementCount, 
  onMaximize, 
  onDismiss 
}) {
  const handleMaximize = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🔄 Maximize clicked')
    onMaximize?.()
  }

  const handleDismiss = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('❌ Dismiss from indicator')
    onDismiss?.()
  }

  return (
    <div className="fixed top-20 md:bottom-6 right-4 z-40 ">
      <Card className="bg-primary-400 rounded-full text-white shadow-xl border-0 overflow-hidden animate-bounce">
        <CardContent className="p-2">
          <div className="flex items-center space-x-3">
            <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753217700/h4j3wqioc81ybvri0wgy.png" className="h-8 w-8" alt="Snappy Waving!" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">
                {replacementCount} replacement{replacementCount > 1 ? 's' : ''} 
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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
    const [lastReplacementIds, setLastReplacementIds] = useState(new Set()) // ✅ NEW: Track last seen IDs
    const [processingReplacements, setProcessingReplacements] = useState(new Set()) 
  
    // ✅ NEW: Reset hidden state when replacements change (new party/new replacements)
    useEffect(() => {
      const currentReplacementIds = new Set(replacements.map(r => r.id))
      
      // Check if we have completely new replacements (new party scenario)
      const hasNewReplacements = replacements.some(r => !lastReplacementIds.has(r.id))
      const hasRemovedReplacements = Array.from(lastReplacementIds).some(id => !currentReplacementIds.has(id))
      
      if (hasNewReplacements || hasRemovedReplacements) {
        console.log('🔄 New replacements detected - resetting hidden state')
        console.log('🔄 Previous IDs:', Array.from(lastReplacementIds))
        console.log('🔄 Current IDs:', Array.from(currentReplacementIds))
        console.log('🔄 Processing IDs:', Array.from(processingReplacements)) 
        
        setHiddenReplacementIds(new Set())
        setIsDismissed(false)
        setLastReplacementIds(currentReplacementIds)
      }
    }, [replacements, lastReplacementIds])
  
    // ✅ FILTER: Hide replacements that we've locally marked as approved/dismissed
    const visibleReplacements = replacements.filter(r => 
      !hiddenReplacementIds.has(r.id)
    )

  
    // Show banner when we have visible replacements
    useEffect(() => {
      console.log('🎗️ useEffect triggered - checking if should show banner')
      console.log('🎗️ visibleReplacements.length:', visibleReplacements.length)
      console.log('🎗️ isDismissed:', isDismissed)
      console.log('🎗️ isModalOpen:', isModalOpen)
      
      if (visibleReplacements.length > 0 && !isDismissed && !isModalOpen) {
        console.log('✅ SHOWING BANNER')
        setShowBanner(true)
      } else {
        console.log('❌ HIDING BANNER')
        setShowBanner(false)
      }
    }, [visibleReplacements.length, isDismissed, isModalOpen])
  
    // Reset when no visible replacements
    useEffect(() => {
      if (visibleReplacements.length === 0) {
        console.log('🧹 No visible replacements - resetting banner/modal state')
        setIsModalOpen(false)
        setShowBanner(false)
        // Don't reset isDismissed here - that should only reset with new replacements
      }
    }, [visibleReplacements.length])

    useEffect(() => {
        console.log('🎭 Modal restoration check triggered')
        console.log('🎭 visibleReplacements.length:', visibleReplacements.length)
        console.log('🎭 isModalOpen:', isModalOpen)
        console.log('🎭 isDismissed:', isDismissed)
        
        // Check for restoration flags
        const shouldRestore = sessionStorage.getItem('shouldRestoreReplacementModal')
        const modalShowUpgrade = sessionStorage.getItem('modalShowUpgrade')
        
        console.log('🎭 Session flags:', { shouldRestore, modalShowUpgrade })
        
        // Auto-open modal if restoration is requested
        if (visibleReplacements.length > 0 && shouldRestore === 'true' && !isDismissed) {
          console.log('🎭 SHOULD OPEN MODAL - restoration conditions met')
          
          if (!isModalOpen) {
            console.log('🎭 OPENING MODAL because restoration flag is true')
            setIsModalOpen(true)
            setShowBanner(false)
            
            // Clear the restoration flag after successful opening
            setTimeout(() => {
              sessionStorage.removeItem('shouldRestoreReplacementModal')
              console.log('🧹 Cleared shouldRestoreReplacementModal flag')
            }, 100)
          } else {
            console.log('🎭 Modal already open')
          }
        } else {
          console.log('🎭 NOT opening modal:', {
            hasReplacements: visibleReplacements.length > 0,
            shouldRestore: shouldRestore === 'true',
            notDismissed: !isDismissed
          })
        }
      }, [visibleReplacements.length, isModalOpen, isDismissed])
  
    const handleApprove = (replacementId, packageData = null) => {
        console.log('✅ === APPROVAL CLICKED ===')
        console.log('✅ Replacement ID:', replacementId)
        console.log('✅ Currently processing:', Array.from(processingReplacements))

         // ✅ Check if this is a restoration replacement
  const replacement = replacements.find(r => r.id === replacementId)
  if (replacement?.isRestoration) {
    console.log('🔄 Approving restoration replacement - cleaning up flags')
    
    // Clear restoration flags
    sessionStorage.removeItem('shouldRestoreReplacementModal')
    sessionStorage.removeItem('modalShowUpgrade')
    sessionStorage.removeItem('replacementContext')
    
    // Hide UI immediately
    setHiddenReplacementIds(prev => new Set([...prev, replacementId]))
    setIsModalOpen(false)
    setShowBanner(false)
    
    // Show success message
    setNotification?.({
      type: 'success',
      message: '🎉 Package selection confirmed! Your replacement has been approved.',
      duration: 4000
    })
    
    return // Don't call parent handler for restoration replacements
  }
        
        // ✅ STRONGER GUARD: Prevent double submission
        if (processingReplacements.has(replacementId)) {
          console.log('⚠️ ALREADY PROCESSING - ignoring duplicate approval')
          return
        }
        
        if (hiddenReplacementIds.has(replacementId)) {
          console.log('⚠️ ALREADY HIDDEN - ignoring duplicate approval')
          return
        }
        
        console.log('✅ Package data:', packageData)
        
        // ✅ FORCE: Hide immediately with direct state update
        console.log('🔒 BEFORE hiding - hidden IDs:', Array.from(hiddenReplacementIds))
        setHiddenReplacementIds(prev => {
          const newSet = new Set([...prev, replacementId])
          console.log('✅ INSIDE setState - Updated hidden IDs:', Array.from(newSet))
          return newSet
        })
        
        // ✅ FORCE: Add to processing
        setProcessingReplacements(prev => {
          const newSet = new Set([...prev, replacementId])
          console.log('🔒 Added to processing FIRST:', Array.from(newSet))
          return newSet
        })
        
        // ✅ FORCE: Close UI immediately
        console.log('🚫 Closing modal and banner')
        setIsModalOpen(false)
        setShowBanner(false)
        
        console.log('✅ UI updated immediately, calling parent handler')
        
        // Call parent
        setTimeout(() => {
          try {
            if (onApproveReplacement) {
              onApproveReplacement(replacementId, packageData)
              console.log('✅ Parent handler called successfully')
            }
          } catch (error) {
            console.error('❌ Error in parent handler:', error)
          }
        }, 0) // ✅ Use setTimeout to ensure state updates happen first
      }
    const handleViewSupplier = (supplierId) => {
      console.log('👀 Mobile flow viewing supplier:', supplierId)
      
      // Extract the actual supplier ID
      let actualSupplierId = supplierId
      if (typeof supplierId === 'object') {
        actualSupplierId = supplierId.id || supplierId.supplier_id || supplierId._id || supplierId.uuid
        console.log('🔧 Extracted ID from object:', actualSupplierId)
      }
      
      if (!actualSupplierId && visibleReplacements.length > 0) {
        actualSupplierId = visibleReplacements[0].newSupplier.id || visibleReplacements[0].newSupplier.supplier_id
        console.log('🔧 Using replacement supplier ID:', actualSupplierId)
      }
      
      console.log('✅ Final supplier ID to use:', actualSupplierId)
      onViewSupplier?.(actualSupplierId)
    }
  
    const handleOpenModal = () => {
      console.log('🔓 Opening replacement modal from banner')
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
      
      // ✅ Hide all current visible replacements
      const currentReplacementIds = visibleReplacements.map(r => r.id)
      setHiddenReplacementIds(prev => {
        const newSet = new Set([...prev, ...currentReplacementIds])
        console.log('❌ Hidden after dismiss:', Array.from(newSet))
        return newSet
      })
      
      setShowBanner(false)
      setIsDismissed(true)
      onDismiss?.()
    }
  
    // ✅ IMPORTANT: Use visibleReplacements instead of replacements
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
  
  <SimpleReplacementModal
  replacement={currentReplacement}
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onApprove={handleApprove}
  onViewSupplier={handleViewSupplier}
  onMinimize={handleMinimizeModal}
  processingReplacements={processingReplacements}
  initialShowUpgrade={sessionStorage.getItem('modalShowUpgrade') === 'true'} // ✅ Add this
  onUpgradeRevealed={() => {
    // Clear the upgrade flag when animation completes
    sessionStorage.removeItem('modalShowUpgrade')
  }} // ✅ Add this
/>
      </>
    )
  }