// components/ContextualBreadcrumb.js
'use client';

import { useContextualNavigation } from '../hooks/useContextualNavigation';
import { ChevronLeft, AlertCircle } from 'lucide-react';

export function ContextualBreadcrumb({ 
  currentPage, 
  customBack, 
  className = "",
  hasUnsavedChanges = false,
  unsavedMessage = "Unsaved changes"
}) {
  const { navigationContext, goBack } = useContextualNavigation();

  const getBreadcrumbConfig = () => {
    switch (currentPage) {
      case 'browse':
        if (navigationContext === 'dashboard') {
          return {
            show: true,
            backText: 'Dashboard',
            currentText: 'Browse Suppliers',
            action: () => {
              sessionStorage.removeItem('navigationContext');
              goBack();
            }
          };
        }
        return { 
          show: true, 
          backText: 'Home', 
          currentText: 'Browse Suppliers',
          action: () => goBack()
        };

      case 'supplier-detail':
        return {
          show: true,
          backText: 'Browse Suppliers',
          currentText: 'Supplier Details',
          action: () => {
            if (navigationContext === 'dashboard') {
              window.history.back();
            } else {
              window.history.back();
            }
          }
        };

      case 'add-supplier':
        return {
          show: true,
          backText: 'Supplier Details',
          currentText: 'Add Supplier',
          action: goBack
        };

      case 'e-invites':
        return {
          show: true,
          backText: 'Dashboard',
          currentText: 'E-Invites',
          action: goBack
        };

      case 'party-summary':
        return {
          show: true,
          backText: 'Dashboard', 
          currentText: 'Party Summary',
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
  const backText = customBack?.backText || breadcrumbConfig.backText;
  const currentText = customBack?.currentText || breadcrumbConfig.currentText;

  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center space-x-2 text-sm">
          <button
            onClick={handleClick}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {backText}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{currentText}</span>
          {hasUnsavedChanges && (
            <div className="flex items-center ml-4 text-orange-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">{unsavedMessage}</span>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}