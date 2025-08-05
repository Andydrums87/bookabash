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

      case "supplier-detail":
        return {
          show: true,
          backText: navigationContext === "dashboard" ? "Dashboard" : "Browse Suppliers",
          currentText: "Supplier Details",
          action: () => {
            if (navigationContext === "dashboard") {
              // NEW: Pass true to restore modal when going back to dashboard
              goBack(true);
            } else {
              router.push("/browse")
            }
          },
        }

      case "add-supplier":
        return {
          show: true,
          backText: "Supplier Details",
          currentText: "Add Supplier",
          action: goBack,
        }

      case "e-invites":
        return {
          show: true,
          backText: "Dashboard",
          currentText: "E-Invites",
          action: goBack,
        }

      case "review-book":
        return {
          show: true,
          backText: "Dashboard",
          currentText: "Review & Book",
          action: () => router.push("/dashboard"),
        }
        case "Build Party":
          return {
            show: true,
            backText: "Home",
            currentText: "Build Party",
            action: () => router.push("/"),
          }
          case "e-invites":
          return {
            show: true,
            backText: "Dashboard",
            currentText: "E-Invites",
            action: () => router.push("/dashboard"),
          }
          case "Browse Gifts":
            return {
              show: true,
              backText: "Dashboard",
              currentText: "Gift Registry",
              action: () => router.push("/dashboard"),
            }
       
         // Add these cases to your existing getBreadcrumbConfig() function:

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

// Also update the supplier-detail case to handle favorites context:
case "supplier-detail":
  let backText = "Browse Suppliers"; // default
  let backAction = () => router.push("/browse");
  
  if (navigationContext === "dashboard") {
    backText = "Dashboard";
    backAction = () => goBack(true);
  } else if (navigationContext === "favorites") {
    backText = "My Favorites";
    backAction = () => goBack();
  }
  
  return {
    show: true,
    backText,
    currentText: "Supplier Details",
    action: backAction,
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