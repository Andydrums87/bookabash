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

  const navigateWithContext = (path, context) => {
    // Store context in session storage as backup
    if (context) {
      sessionStorage.setItem('navigationContext', context);
    }
    
    // Navigate with context in search params
    const url = context ? `${path}?from=${context}` : path;
    router.push(url);
  };

  const goBack = () => {
    switch (navigationContext) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'browse':
        router.push('/browse');
        break;
      default:
        router.back();
    }
    // Clear context after navigation
    sessionStorage.removeItem('navigationContext');
  };

  const clearContext = () => {
    sessionStorage.removeItem('navigationContext');
    setNavigationContext(null);
  };

  return {
    navigationContext,
    navigateWithContext,
    goBack,
    clearContext
  };
}