// components/ContextualBreadcrumb.js
'use client';

import { useContextualNavigation } from '../hooks/useContextualNavigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ContextualBreadcrumb({ currentPage, customBack, className = "" }) {
  const { navigationContext, goBack } = useContextualNavigation();

  const getBreadcrumbConfig = () => {
    switch (currentPage) {
      case 'browse':
        if (navigationContext === 'dashboard') {
          return {
            show: true,
            text: 'Back to Dashboard',
            action: () => {
              sessionStorage.removeItem('navigationContext');
              goBack(); // This will go to dashboard
            }
          };
        }
        return { show: false };

      case 'supplier-detail':
        return {
          show: true,
          text: 'Back to Browse',
          action: () => {
            // Always go back to browse, but maintain context for browse page
            if (navigationContext === 'dashboard') {
              // Go to browse with dashboard context maintained
              window.history.back();
            } else {
              // Go to browse without context
              window.history.back();
            }
          }
        };

      case 'add-supplier':
        return {
          show: true,
          text: 'Back to Supplier Details',
          action: goBack
        };

      default:
        return { show: false };
    }
  };

  const breadcrumbConfig = getBreadcrumbConfig();

  if (!breadcrumbConfig.show && !customBack) {
    return null;
  }

  const handleClick = customBack?.action || breadcrumbConfig.action;
  const displayText = customBack?.text || breadcrumbConfig.text;

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`p-0 h-auto text-orange-500 hover:text-orange-600 hover:bg-transparent transition-colors duration-200 text-sm font-medium flex items-center ${className}`}
    >
      <ChevronLeft size={16} className="mr-1" />
      {displayText}
    </Button>
  );
}