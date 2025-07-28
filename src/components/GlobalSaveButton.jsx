"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Save, Check } from "lucide-react"
import { useState, useEffect } from "react"

export function GlobalSaveButton({ 
  onSave, 
  isLoading = false, 
  hasChanges = false,
  variant = "default",
  size = "default",
  position = "top-right", // top-right, bottom-right, bottom-center, inline
  label = "Save Changes",
  loadingLabel = "Saving...",
  successLabel = "Saved!",
  className = "",
  showSuccess = true,
  ...props 
}) {
  const [showSuccessState, setShowSuccessState] = useState(false)
  const [wasLoading, setWasLoading] = useState(false)

  // Track loading state changes to show success
  useEffect(() => {
    if (wasLoading && !isLoading && showSuccess) {
      setShowSuccessState(true)
      setTimeout(() => setShowSuccessState(false), 2000)
    }
    setWasLoading(isLoading)
  }, [isLoading, wasLoading, showSuccess])

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "fixed top-4 right-4 z-50"
      case "bottom-right":
        return "fixed bottom-4 right-4 z-50"
      case "bottom-center":
        return "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      case "sticky-top":
        return "sticky top-4 ml-auto w-fit"
      case "sticky-bottom":
        return "sticky bottom-4 ml-auto w-fit"
      case "responsive":
        return "md:sticky md:top-4 md:ml-auto md:w-fit md:relative fixed bottom-4 right-4 z-50"
      case "inline":
      default:
        return ""
    }
  }

  const buttonClass = `
    ${getPositionClasses()} 
    cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl
    !bg-primary-500 hover:!bg-[hsl(var(--primary-600))] !text-white !border-0
    disabled:!bg-primary-400 disabled:!opacity-100 disabled:cursor-not-allowed
    ${className}
  `.trim()

  return (
    <Button 
      onClick={onSave}
      disabled={isLoading}
      size={size}
      className={buttonClass}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : showSuccessState ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          {successLabel}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}