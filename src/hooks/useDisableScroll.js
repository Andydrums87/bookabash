// hooks/useDisableScroll.js
import { useEffect } from 'react'

/**
 * Custom hook to disable background scrolling when modals are open
 * @param {boolean|boolean[]} shouldDisable - Single boolean or array of booleans indicating if scroll should be disabled
 * @param {Object} options - Configuration options
 * @param {boolean} options.mobileOptimized - Whether to include mobile-specific optimizations (default: true)
 * @param {boolean} options.preventTouch - Whether to prevent touch events on mobile (default: true)
 * @param {string} options.backdropSelector - CSS selector for backdrop elements (default: '.modal-backdrop')
 */
export const useDisableScroll = (shouldDisable, options = {}) => {
  const {
    mobileOptimized = true,
    preventTouch = true,
    backdropSelector = '.modal-backdrop'
  } = options

  useEffect(() => {
    // Handle both single boolean and array of booleans
    const isDisabled = Array.isArray(shouldDisable) 
      ? shouldDisable.some(Boolean) 
      : Boolean(shouldDisable)

    if (isDisabled) {
      // Store current scroll position
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      // Apply styles to disable scrolling
      const bodyStyle = document.body.style
      const originalStyles = {
        overflow: bodyStyle.overflow,
        position: bodyStyle.position,
        top: bodyStyle.top,
        left: bodyStyle.left,
        width: bodyStyle.width,
        height: bodyStyle.height
      }

      // Disable scrolling
      bodyStyle.overflow = 'hidden'
      bodyStyle.position = 'fixed'
      bodyStyle.top = `-${scrollY}px`
      bodyStyle.left = `-${scrollX}px`
      bodyStyle.width = '100%'
      
      if (mobileOptimized) {
        bodyStyle.height = '100%'
      }

      // Mobile touch prevention
      let preventTouchMove
      if (preventTouch && mobileOptimized) {
        preventTouchMove = (e) => {
          // Allow scrolling within modal content, prevent on backdrop
          if (
            e.target === document.body || 
            e.target.matches?.(backdropSelector) ||
            e.target.closest?.(backdropSelector)
          ) {
            e.preventDefault()
          }
        }
        
        document.addEventListener('touchmove', preventTouchMove, { passive: false })
      }



      // Cleanup function
      return () => {
        // Restore original styles
        Object.entries(originalStyles).forEach(([property, value]) => {
          if (value) {
            bodyStyle[property] = value
          } else {
            bodyStyle.removeProperty(property)
          }
        })

        // Remove touch event listener
        if (preventTouchMove) {
          document.removeEventListener('touchmove', preventTouchMove)
        }

        // Restore scroll position
        window.scrollTo(scrollX, scrollY)


      }
    }
  }, [shouldDisable, mobileOptimized, preventTouch, backdropSelector])
}

// Alternative: Hook with manual control
export const useScrollControl = () => {
  const disableScroll = (options = {}) => {
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = `-${scrollX}px`
    document.body.style.width = '100%'

    if (options.mobileOptimized !== false) {
      document.body.style.height = '100%'
    }

    return { scrollX, scrollY }
  }

  const enableScroll = ({ scrollX = 0, scrollY = 0 } = {}) => {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.width = ''
    document.body.style.height = ''

    window.scrollTo(scrollX, scrollY)
  }

  return { disableScroll, enableScroll }
}

export default useDisableScroll