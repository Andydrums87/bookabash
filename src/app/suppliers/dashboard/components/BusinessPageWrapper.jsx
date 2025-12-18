// components/BusinessPageWrapper.js
"use client"

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/contexts/BusinessContext';
import { Loader2, Building2 } from 'lucide-react';

const BusinessPageWrapper = ({ children, requiresBusiness = true }) => {
  const router = useRouter();
  const { currentBusiness, loading, switching, businesses, initialized } = useBusiness();

  // OPTIMIZED: Simplified state logic - no complex timers or pageReady state
  const wrapperState = useMemo(() => {
    // Still initializing BusinessContext - this is the ONLY time we show a loading spinner
    if (!initialized || loading) {
      return 'loading';
    }
    
    // Business is required but none available
    if (requiresBusiness && (!currentBusiness || businesses.length === 0)) {
      return 'no-business';
    }
    
    // Everything is ready - let children handle their own loading states
    return 'ready';
  }, [initialized, loading, requiresBusiness, currentBusiness, businesses]);

  // Redirect to onboarding if no business is found
  useEffect(() => {
    if (wrapperState === 'no-business') {
      router.replace('/suppliers/onboarding');
    }
  }, [wrapperState, router]);

  // ONLY show spinner during initial BusinessContext loading
  if (wrapperState === 'loading') {
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

        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full animate-pulse w-2/3"></div>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if business is required but not available
  if (wrapperState === 'no-business') {
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
            Redirecting to onboarding...
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  }

  // OPTIMIZED: When ready, render children immediately 
  // Let individual components handle their own loading states with skeletons
  return (
    <div className={`business-page-content relative ${switching ? 'transition-opacity duration-300' : ''}`}>
      {/* OPTIONAL: Subtle business switching indicator */}
      {switching && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border px-3 py-2 z-50">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            <span className="text-gray-700">Switching business...</span>
          </div>
        </div>
      )}
      
      {/* OPTIMIZED: Always render children when business context is ready */}
      {children}
    </div>
  );
};

export default BusinessPageWrapper;