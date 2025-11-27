"use client"

import { ToastProvider } from '@/components/ui/toast'

// Custom layout for onboarding pages - no nav or footer
// The wizard has its own header/footer in WizardLayout
export default function OnboardingLayout({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
