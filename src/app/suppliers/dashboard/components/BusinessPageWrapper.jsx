// components/BusinessPageWrapper.js
"use client"

import { useEffect, useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Loader2, Building2 } from 'lucide-react';

const BusinessPageWrapper = ({ children, requiresBusiness = true }) => {
  const { currentBusiness, loading, switching, businesses } = useBusiness();
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    // 🔧 LESS AGGRESSIVE: Only show loading for meaningful state changes
    if (!loading) {
      if (requiresBusiness) {
        // Page requires a business to be selected
        if (currentBusiness && businesses.length > 0) {
          // 🆕 SMART DELAY: Small delay to prevent flashing
          const timer = setTimeout(() => {
            setPageReady(true)
          }, switching ? 300 : 50) // Longer delay only when switching
          
          return () => clearTimeout(timer)
        } else {
          setPageReady(false)
        }
      } else {
        setPageReady(true)
      }
    } else {
      setPageReady(false)
    }
  }, [loading, switching, currentBusiness, businesses, requiresBusiness])

  // 🔧 REDUCED LOADING: Only show spinner for actual loading, not every switch
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Loading your businesses...
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we load your business data.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full animate-pulse w-2/3"></div>
        </div>
      </div>
    );
  }

  // 🆕 GENTLE SWITCHING: Show minimal loading only during business switch
  if (switching) {
    return (
      <div className="relative">
        {/* Show content with overlay during switch */}
        <div className="opacity-60 pointer-events-none">
          {children}
        </div>
        
        {/* Subtle switching indicator */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border px-3 py-2 z-50">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            <span className="text-gray-700">Switching...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading only when not ready and not just switching
  if (!pageReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Preparing your dashboard...
          </h3>
          <p className="text-sm text-gray-500">
            Getting everything ready for you.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full animate-pulse w-2/3"></div>
        </div>
      </div>
    );
  }

  // Show error state if business is required but not available
  if (requiresBusiness && (!currentBusiness || businesses.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Business Found
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            You need to have at least one business to access this page.
          </p>
          
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Render children when everything is ready
  return (
    <div className="business-page-content">
      {children}
    </div>
  );
};

export default BusinessPageWrapper;