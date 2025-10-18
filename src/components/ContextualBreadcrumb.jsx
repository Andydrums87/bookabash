"use client"

import { useContextualNavigation } from "../hooks/useContextualNavigation"
import { ChevronLeft, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function ContextualBreadcrumb({
  currentPage,
  customBack,
  className = "",
  hasUnsavedChanges = false,
  unsavedMessage = "Unsaved changes",
  inviteDetails,
  supplierName,
  id,
}) {
  const { navigationContext, goBack } = useContextualNavigation()
  const router = useRouter()

  const getBreadcrumbConfig = () => {
    switch (currentPage) {
      case "browse":
        if (navigationContext === "dashboard") {
          return {
            show: true,
            backText: "Dashboard",
            currentText: "Browse Suppliers",
            action: () => {
              sessionStorage.removeItem("navigationContext")
              goBack()
            },
          }
        }
        return {
          show: true,
          backText: "Home",
          currentText: "Browse Suppliers",
          action: () => goBack(),
        }

      case "supplier-detail": {
        // work out back target
        let backText = "Browse Suppliers"
        let action = () => router.push("/browse")
      
        if (navigationContext === "dashboard") {
          backText = "Dashboard"
          action = () => goBack(true)
        } else if (navigationContext === "favorites") {
          backText = "My Favorites"
          action = () => goBack()
        } else if (navigationContext === "review-book-missing") {
          // NEW: Handle navigation back to review book at step 4 (forgotten step)
          backText = "Review & Book"
          action = () => {
            console.log('🔄 Navigating back to review-book step 4')
            // Navigate back to review page and restore to step 4 (forgotten step)
            const reviewState = {
              step: 4,
              stepId: 'forgotten',
              timestamp: Date.now()
            }
            sessionStorage.setItem('reviewBookRestoreState', JSON.stringify(reviewState))
            router.push("/review-book?restore=step4")
          }
        }
      
        return {
          show: true,
          backText,
          // show supplier name if we have it, else fall back
          currentText: supplierName || "Supplier Details",
          action,
        }
      }
      
      case "add-supplier":
        return {
          show: true,
          backText: "Supplier Details",
          currentText: "Add Supplier",
          action: goBack,
        }
        
      case "manage-invite":
        return {
          show: true,
          backText: "Dashboard",
          currentText: "Manage Invite",
          action: () => router.push("/dashboard"),
        }
        
      case "party-summary":
        return {
          show: true,
          backText: "Dashboard",
          currentText: "Party Summary",
          action: goBack
        }

      case "e-invites":
        return {
          show: true,
          backText: "Dashboard",
          currentText: "E-Invites",
          action: goBack,
        }
        
      case "rsvps":
        return {
          show: true,
          backText: "Dashboard",
          currentText: "Rsvps",
          action: goBack,
        }

      case "Review & Book":
        return {
          show: true,
          backText: "Dashboard",
          currentText: "Review & Book",
          action: () => {
            // Don't clear party data - just navigate back
            sessionStorage.removeItem("navigationContext")
            router.push("/dashboard")
          },
        }
        
      case "payment":
        if (navigationContext === "review-book") {
          return {
            show: true,
            backText: "Review & Book",
            currentText: "Secure Payment",
            action: () => router.push("/review-book"),
          }
        }
        // Default to dashboard when no context or came from dashboard
        return {
          show: true,
          backText: "Dashboard", 
          currentText: "Secure Payment",
          action: () => router.push("/dashboard"),
        }
        
      case "Build Party":
        return {
          show: true,
          backText: "Home",
          currentText: "Build Party",
          action: () => router.push("/"),
        }
        
      case "Browse Gifts":
        return {
          show: true,
          backText: "Dashboard",
          currentText: "Gift Registry",
          action: () => router.push("/dashboard"),
        }

      case "rsvp":
        return {
          show: true,
          backText: "Home", 
          currentText: `${inviteDetails}'s Party`,
          action: () => router.push("/"),
        }

      case "Gift Registry Preview":
        // Check RSVP context FIRST
        if (navigationContext === "rsvp") {
          return {
            show: true,
            backText: "Back to Invitation",
            currentText: "Gift Registry",
            action: () => goBack(),
          }
        }
        // Default case for other contexts
        return {
          show: true,
          backText: "Browse Gifts", 
          currentText: "Gift Registry",
          action: () => router.push(`/gift-registry/${id}/create`),
        }
        
      case "favorites":
        if (navigationContext === "dashboard") {
          return {
            show: true,
            backText: "Dashboard",
            currentText: "My Favorites",
            action: () => {
              sessionStorage.removeItem("navigationContext")
              goBack()
            },
          }
        }
        if (navigationContext === "browse") {
          return {
            show: true,
            backText: "Browse Suppliers",
            currentText: "My Favorites",
            action: () => {
              sessionStorage.removeItem("navigationContext")
              goBack()
            },
          }
        }
        return {
          show: true,
          backText: "Home",
          currentText: "My Favorites",
          action: () => router.push("/"),
        }

      default:
        return { show: false }
    }
  }

  const breadcrumbConfig = getBreadcrumbConfig()

  if (!breadcrumbConfig.show && !customBack) {
    return null
  }

  const handleClick = customBack?.action || breadcrumbConfig.action
  const backText = customBack?.backText || breadcrumbConfig.backText
  const currentText = customBack?.currentText || breadcrumbConfig.currentText

  return (
    <div className={`bg-white border-b border-[hsl(var(--primary-100))] px-4 py-2 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClick}
              className="cursor-pointer flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">{backText}</span>
            </button>

            <span className="text-primary-300">/</span>

            <span className="text-sm font-medium cursor-pointer hover:text-[hsl(var(--primary-600))] text-gray-900">{currentText}</span>
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{unsavedMessage}</span>
              <span className="sm:hidden text-sm font-medium">Unsaved</span>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}