import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, SkipForward } from "lucide-react"

// Hook for managing tour state
export const useDashboardTour = () => {
  const [isTourActive, setIsTourActive] = useState(false)
  const [isTourCompleted, setIsTourCompleted] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem('dashboard_tour_completed') === 'true'
    } catch {
      return false
    }
  })

  const startTour = () => {
    setIsTourActive(true)
  }

  const completeTour = () => {
    setIsTourActive(false)
    setIsTourCompleted(true)
    try {
      localStorage.setItem('dashboard_tour_completed', 'true')
      console.log('Tour completed and saved')
    } catch (error) {
      console.warn('Could not save tour completion:', error)
    }
  }

  const resetTour = () => {
    setIsTourCompleted(false)
    setIsTourActive(false)
    try {
      localStorage.removeItem('dashboard_tour_completed')
    } catch (error) {
      console.warn('Could not reset tour:', error)
    }
  }

  // Auto-start tour for new users (only once on mount)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkAutoStart = () => {
      const welcomeCompleted = localStorage.getItem('welcome_completed') === 'true'
      const tourCompleted = localStorage.getItem('dashboard_tour_completed') === 'true'
      
      const shouldAutoStart = welcomeCompleted && !tourCompleted && !isTourActive
      
      if (shouldAutoStart) {
        setTimeout(() => {
          console.log('Auto-starting tour')
          startTour()
        }, 2000)
      }
    }
    
    const timeoutId = setTimeout(checkAutoStart, 500)
    return () => clearTimeout(timeoutId)
  }, [])

  return {
    isTourActive,
    isTourCompleted,
    startTour,
    completeTour,
    resetTour,
    closeTour: () => setIsTourActive(false)
  }
}

export const SnappyDashboardTour = ({ 
  isOpen = false,
  onClose,
  onComplete,
  onMobileNavigationStepActive 
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState(null)
  const [steps, setSteps] = useState([])


  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Only run if we have the callback function and steps are loaded
    if (!onMobileNavigationStepActive || !steps.length || currentStep < 0) return

    const currentStepData = steps[currentStep]
    if (!currentStepData) return

    // Check if we're on the mobile navigation step
    if (currentStepData.id === 'mobile-navigation-tabs') {
      onMobileNavigationStepActive(true)
    } else {
      onMobileNavigationStepActive(false)
    }
  }, [currentStep, steps, onMobileNavigationStepActive])
  
  const tourSteps = [
    {
      id: "party-header",
      title: "Your Party Details",
      content: "This is your party control center! Click anywhere on this colorful header to edit your party name, date, time, theme, or location.",
      snappyMessage: "Let's start the tour!",
      targetSelector: "[data-tour='party-header']",
      scrollOffset: -100
    },
    {
      id: "mobile-navigation-tabs",
      title: "Navigation Tabs", 
      content: "Tap these circles to explore different supplier types for your party! Each circle represents a different type of supplier like venue, entertainment, catering, etc. Swipe to see more supplier types!",
      snappyMessage: "Easy navigation!",
      targetSelector: "[data-tour='mobile-navigation-tabs']",
      scrollOffset: -20,
      mobileOnly: true
    },
    {
      id: "mobile-supplier-cards",
      title: "Supplier Cards",
      content: "Here's your selected supplier for each category! I've handpicked these based on your theme and preferences. Tap any card to see more details.",
      snappyMessage: "Your chosen suppliers!",
      targetSelector: "[data-tour='mobile-supplier-cards']", 
      scrollOffset: -50,
      mobileOnly: true
    },
    {
      id: "supplier-cards", 
      title: "Your Party Team",
      content: "I've handpicked these amazing suppliers just for you! Each card shows who's helping with your party and what they cost.",
      snappyMessage: "Meet your dream team!",
      targetSelector: "[data-tour='supplier-cards']",
      scrollOffset: -50,
      desktopOnly: true
    },
    {
      id: "change-supplier",
      title: "Change Suppliers",
      content: "See the 'Change Venue' button at the bottom of this card? Click it to browse alternative venues. You can swap any supplier anytime before booking!",
      snappyMessage: "Easy supplier swapping!",
      targetSelector: "[data-tour='venue-card']",
      mobileTargetSelector: "[data-tour='venue-card-mobile']",
      scrollOffset: -200
    },
    {
      id: "remove-supplier",
      title: "Remove Suppliers",
      content: "Need to remove a supplier? Look for the X button in the top-right corner of any supplier card. Click it to remove suppliers you don't want.",
      snappyMessage: "Easy removal!",
      targetSelector: "[data-tour='venue-card']",
      mobileTargetSelector: "[data-tour='venue-card-mobile']",
      scrollOffset: -150
    },
    {
      id: "add-supplier",
      title: "Add More Suppliers", 
      content: "Want more options? Click this button to browse all available suppliers and find exactly what you need for your party!",
      snappyMessage: "More party magic!",
      targetSelector: "[data-tour='add-supplier']",
      scrollOffset: -100,
      desktopOnly: true
    },
    {
      id: "budget-tracker",
      title: "Budget Management",
      content: "Keep track of your spending here! The progress bar shows how much of your budget you've used. I'll warn you before you go over budget.",
      snappyMessage: "Smart spending!",
      targetSelector: "[data-tour='budget-tracker']",
      scrollOffset: -80,
      desktopOnly: true
    },
    {
      id: "review-book",
      title: "Ready to Book?",
      content: "When you're happy with everything, click this button to review all your choices and book your amazing party!",
      snappyMessage: "Time to celebrate!",
      targetSelector: "[data-tour='review-book']",
      scrollOffset: -50
    }
  ]

  // Get appropriate target selector based on screen size
  const getTargetSelector = (step) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    if (isMobile && step.mobileTargetSelector) {
      return step.mobileTargetSelector
    }
    return step.targetSelector
  }

  // Check if element is visible
  const isElementVisible = (selector) => {
    const element = document.querySelector(selector)
    if (!element) return false
    
    const rect = element.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth
    
    return (
      rect.top < windowHeight &&
      rect.bottom > 0 &&
      rect.left < windowWidth &&
      rect.right > 0
    )
  }

  // Initialize steps when tour opens
  useEffect(() => {
    if (isOpen) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      
      const validSteps = tourSteps.filter(step => {
        if (step.mobileOnly && !isMobile) return false
        if (step.desktopOnly && isMobile) return false
        
        const targetSelector = getTargetSelector(step)
        const element = document.querySelector(targetSelector)
        return element !== null
      })
      
      setSteps(validSteps)
      setCurrentStep(0)
    }
  }, [isOpen])

  const currentStepData = steps[currentStep]

  // Calculate optimal bubble position to avoid blocking the target
  const calculateBubblePosition = (targetElement) => {
    if (!targetElement) return { bottom: '1.5rem', top: 'auto' }
    
    const rect = targetElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const bubbleHeight = 300 // Approximate height of tour bubble
    
    // If element is in the bottom half of screen, show bubble at top
    if (rect.bottom > viewportHeight / 2) {
      return { 
        top: '1.5rem', 
        bottom: 'auto',
        transform: 'translateX(-50%)'
      }
    }
    
    // Otherwise show at bottom
    return { 
      bottom: '1.5rem', 
      top: 'auto',
      transform: 'translateX(-50%)'
    }
  }

  // Highlight element and bring it above blur
  const highlightElement = (targetSelector) => {
    // Remove previous highlight
    if (highlightedElement) {
      highlightedElement.style.boxShadow = ''
      highlightedElement.style.position = ''
      highlightedElement.style.zIndex = ''
      highlightedElement.style.filter = ''
      
      // Remove button highlights from previous step - improved cleanup
      const oldChangeButton = highlightedElement.querySelector('[data-tour*="change-supplier"]')
      if (oldChangeButton) {
        oldChangeButton.style.boxShadow = ''
        oldChangeButton.style.animation = ''
        oldChangeButton.style.position = ''
        oldChangeButton.style.zIndex = ''
      }
      
      // Remove X button highlights - multiple selectors
      const oldRemoveButtons = highlightedElement.querySelectorAll('button')
      oldRemoveButtons.forEach(button => {
        const hasXIcon = button.querySelector('svg[data-lucide="x"]') || 
                        button.querySelector('.lucide-x') ||
                        button.innerHTML.includes('data-lucide="x"')
        if (hasXIcon) {
          button.style.boxShadow = ''
          button.style.animation = ''
          button.style.position = ''
          button.style.zIndex = ''
          button.style.borderRadius = ''
        }
      })
    }

    const element = document.querySelector(targetSelector)
    if (element) {
      // Bring element above blur overlay
      element.style.position = 'relative'
      element.style.zIndex = '9996'
      element.style.filter = 'blur(0px)'
      element.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.9), 0 0 30px rgba(20, 184, 166, 0.9)'
      element.style.transition = 'all 0.3s ease'
      element.style.borderRadius = '8px'
      setHighlightedElement(element)
      
      // Special handling for change-supplier and remove-supplier steps
      if (currentStepData.id === 'change-supplier') {
        // Find and highlight the change button within this card
        const changeButton = element.querySelector('[data-tour*="change-supplier"]')
        if (changeButton) {
          setTimeout(() => {
            changeButton.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.3)'
            changeButton.style.animation = 'pulse 2s infinite'
            changeButton.style.position = 'relative'
            changeButton.style.zIndex = '9997'
          }, 500)
        }
      } else if (currentStepData.id === 'remove-supplier') {
        // Find and highlight the X button within this card - try multiple selectors
        let removeButton = element.querySelector('button:has(> svg[data-lucide="x"])')
        if (!removeButton) {
          // Fallback: look for X button by class or structure
          removeButton = element.querySelector('button svg[data-lucide="x"]')?.closest('button')
        }
        if (!removeButton) {
          // Another fallback: look for any button with X icon
          const xIcons = element.querySelectorAll('svg')
          for (const icon of xIcons) {
            if (icon.getAttribute('data-lucide') === 'x' || icon.classList.contains('lucide-x')) {
              removeButton = icon.closest('button')
              break
            }
          }
        }
        
        if (removeButton) {
          setTimeout(() => {
            removeButton.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.3)'
            removeButton.style.animation = 'pulse 2s infinite'
            removeButton.style.position = 'relative'
            removeButton.style.zIndex = '9997'
            removeButton.style.borderRadius = '50%'
          }, 500)
        } else {
          console.warn('Remove button not found for highlighting')
        }
      }
    }
  }

  const scrollToTarget = (step) => {
    const targetSelector = getTargetSelector(step)
    if (!targetSelector) {
      console.warn('No target selector for step:', step.id)
      setIsScrolling(false)
      return
    }

    setIsScrolling(true)
    console.log(`🎯 Scrolling to step: ${step.id}, selector: ${targetSelector}`)
    
    const element = document.querySelector(targetSelector)
    if (!element) {
      console.warn(`❌ Tour target not found: ${targetSelector}`)
      setIsScrolling(false)
      return
    }

    // Force unlock any scroll restrictions
    document.body.style.overflow = 'unset'
    document.documentElement.style.overflow = 'unset'
    document.body.classList.remove('modal-open', 'overflow-hidden', 'no-scroll')

    // Calculate scroll position
    const rect = element.getBoundingClientRect()
    const absoluteTop = rect.top + window.pageYOffset
    const isMobile = window.innerWidth < 768
    
    let targetScroll
    
    if (step.id === 'review-book') {
      // For bottom elements, scroll to show them clearly
      targetScroll = absoluteTop - 250
    } else if (step.id === 'budget-tracker') {
      // For sidebar elements
      targetScroll = absoluteTop - 200
    } else if (step.id === 'mobile-supplier-cards') {
      targetScroll = absoluteTop - 80
    } else if (step.id === 'change-supplier') {
        // Mobile: scroll to absoluteTop + 60, Desktop: normal behavior
        targetScroll = isMobile ? absoluteTop + 60 : absoluteTop - 100
    } else if (step.id === 'remove-supplier') {
      // Mobile: scroll further up than change-supplier, Desktop: normal behavior
      targetScroll = isMobile ? absoluteTop - 230 : absoluteTop - 100
    } else {
      // For other elements
      targetScroll = absoluteTop - 150
    }
    
    // Ensure valid bounds
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll))
    
    console.log(`📍 Current scroll: ${window.pageYOffset}`)
    console.log(`🎯 Target scroll: ${targetScroll}`)
    console.log(`📏 Max scroll: ${maxScroll}`)
    console.log(`📦 Element rect:`, rect)

    // Try multiple scroll methods for maximum compatibility
    try {
      // Method 1: window.scrollTo
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      })
      
      // Method 2: Fallback with requestAnimationFrame
      setTimeout(() => {
        if (Math.abs(window.pageYOffset - targetScroll) > 50) {
          console.log('🔄 Fallback scroll method')
          
          // Animated scroll fallback
          const startPosition = window.pageYOffset
          const distance = targetScroll - startPosition
          const duration = 800
          let startTime = null

          const animateScroll = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = (timestamp - startTime) / duration
            
            if (progress < 1) {
              const easeInOut = 0.5 - 0.5 * Math.cos(progress * Math.PI)
              const currentPosition = startPosition + (distance * easeInOut)
              window.scrollTo(0, currentPosition)
              requestAnimationFrame(animateScroll)
            } else {
              window.scrollTo(0, targetScroll)
            }
          }
          
          requestAnimationFrame(animateScroll)
        }
      }, 500)
      
    } catch (error) {
      console.error('Scroll error:', error)
    }
    
    // Highlight after scroll
    setTimeout(() => {
      const finalPosition = window.pageYOffset
      console.log(`✅ Final scroll position: ${finalPosition}`)
      highlightElement(targetSelector)
      setIsScrolling(false)
    }, 1200)
  }

  // Function to scroll to top of page
  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } catch (error) {
      console.error('Error scrolling to top:', error)
      // Fallback for older browsers
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }

  // Auto-scroll when step changes
  useEffect(() => {
    if (currentStepData && isOpen) {
      setTimeout(() => {
        scrollToTarget(currentStepData)
      }, 300)
    }
  }, [currentStep, currentStepData, isOpen])

  // Cleanup highlights when tour closes
  useEffect(() => {
    if (!isOpen && highlightedElement) {
      highlightedElement.style.boxShadow = ''
      highlightedElement.style.position = ''
      highlightedElement.style.zIndex = ''
      setHighlightedElement(null)
    }
  }, [isOpen, highlightedElement])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    if (highlightedElement) {
      highlightedElement.style.boxShadow = ''
      highlightedElement.style.position = ''
      highlightedElement.style.zIndex = ''
    }
    
    // Scroll to top before completing
    scrollToTop()
    
    try {
      localStorage.setItem('dashboard_tour_completed', 'true')
    } catch (error) {
      console.warn('Could not save tour completion:', error)
    }
    onComplete?.()
    onClose?.()
  }

  const handleComplete = () => {
    if (highlightedElement) {
      highlightedElement.style.boxShadow = ''
      highlightedElement.style.position = ''
      highlightedElement.style.zIndex = ''
    }
    
    // Scroll to top before completing
    scrollToTop()
    
    onComplete?.()
    onClose?.()
  }

  if (!isOpen || !currentStepData || steps.length === 0) {
    return null
  }

  return (
    <>
      {/* Blur overlay for everything except highlighted element */}
      <div 
        className="fixed inset-0 z-[9995]"
        style={{
          backdropFilter: 'blur(2px)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
      />
      
      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
      
      {/* Tour bubble - responsive but not full width */}
      <div 
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] bg-white rounded-2xl shadow-2xl border-2 border-teal-200"
        style={{
          width: typeof window !== 'undefined' && window.innerWidth < 640 ? '260px' : '320px',
          maxWidth: 'calc(100vw - 2rem)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-xl border-b border-teal-200">
          <div className=" rounded-full bg-whiteflex items-center justify-center shadow-md text-white font-bold">
            <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755719830/bs2klexzuin8ygfndexc.png" alt="Snappy the crocodile Waving" className="h-15 w-15" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-teal-700 text-sm">Snappy Says:</h4>
            <p className="text-xs text-teal-600">{currentStepData.snappyMessage}</p>
          </div>
          <button 
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content - more compact for mobile */}
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
            {currentStepData.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3 sm:mb-4">
            {currentStepData.content}
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1 mb-3 sm:mb-4">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Navigation - more compact */}
        <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={skipTour}
            className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm font-medium flex items-center gap-1"
          >
            <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Skip Tour</span>
            <span className="sm:hidden">Skip</span>
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            <button
              onClick={nextStep}
              disabled={isScrolling}
              className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-teal-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-teal-600 disabled:opacity-50"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
        
        {/* Pointing arrow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-white"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 top-[-1px]">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-teal-200"></div>
          </div>
        </div>
      </div>
    </>
  )
}