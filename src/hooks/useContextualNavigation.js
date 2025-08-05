// hooks/useContextualNavigation.js
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useContextualNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navigationContext, setNavigationContext] = useState(null);

  useEffect(() => {
    // Get the referrer context from search params or session storage
    const context = searchParams.get('from') || sessionStorage.getItem('navigationContext');
    if (context) {
      setNavigationContext(context);
    }
  }, [searchParams]);

  const navigateWithContext = (path, context, modalState = null) => {
    // Store context in session storage as backup
    if (context) {
      sessionStorage.setItem('navigationContext', context);
    }
    
    // NEW: Store modal state if provided
    if (modalState) {
      sessionStorage.setItem('modalState', JSON.stringify({
        ...modalState,
        timestamp: Date.now() // Add timestamp to prevent stale state
      }));
    }
    
    // Navigate with context in search params
    const url = context ? `${path}?from=${context}` : path;
    router.push(url);
  };

  const goBack = (shouldRestoreModal = false) => {
    // NEW: Get stored modal state
    const storedModalState = sessionStorage.getItem('modalState');
    let modalState = null;
    
    if (storedModalState && shouldRestoreModal) {
      try {
        const parsed = JSON.parse(storedModalState);
        // Only use modal state if it's recent (within 10 minutes)
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
          modalState = parsed;
        }
      } catch (error) {
        console.warn('Failed to parse stored modal state:', error);
      }
    }

    switch (navigationContext) {
      case 'dashboard':
        // NEW: Navigate back with modal restoration flag
        const dashboardUrl = modalState ? '/dashboard?restoreModal=true' : '/dashboard';
        router.push(dashboardUrl);
        
        // NEW: Dispatch custom event to notify dashboard to restore modal
        if (modalState) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('restoreModal', { 
              detail: modalState 
            }));
          }, 100); // Small delay to ensure page is loaded
        }
        break;
      case 'browse':
        router.push('/browse');
        case 'favorites': // NEW case
        router.push('/favorites');
        break;
        
      default:
        router.back();
    }
    
    // Clear context after navigation (but keep modal state for restoration)
    sessionStorage.removeItem('navigationContext');
  };

  const clearContext = () => {
    sessionStorage.removeItem('navigationContext');
    sessionStorage.removeItem('modalState'); // NEW: Also clear modal state
    setNavigationContext(null);
  };

  // NEW: Helper to get stored modal state
  const getStoredModalState = () => {
    const storedModalState = sessionStorage.getItem('modalState');
    if (storedModalState) {
      try {
        const parsed = JSON.parse(storedModalState);
        // Only return if recent
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to parse stored modal state:', error);
      }
    }
    return null;
  };

  // NEW: Clear modal state after restoration
  const clearModalState = () => {
    sessionStorage.removeItem('modalState');
  };

  return {
    navigationContext,
    navigateWithContext,
    goBack,
    clearContext,
    getStoredModalState, // NEW
    clearModalState // NEW
  };
}