// hooks/useWizardSteps.js - Updated for AI focus

import { useState } from 'react'

export const WIZARD_STEPS = {
  PARTY_DETAILS: 1,
  CREATE_INVITE: 2,
  SAVE_COMPLETE: 3
}

export const useWizardSteps = (inviteData, generatedImage) => {
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.PARTY_DETAILS)

  const stepConfig = {
    [WIZARD_STEPS.PARTY_DETAILS]: {
      title: "Party Details",
      description: "Basic info",
      isComplete: () => {
        return !!(
          inviteData?.childName?.trim() &&
          inviteData?.age?.trim() &&
          inviteData?.date?.trim() &&
          inviteData?.time?.trim() &&
          inviteData?.venue?.trim()
        )
      },
      canProceed: () => {
        return !!(
          inviteData?.childName?.trim() &&
          inviteData?.age?.trim() &&
          inviteData?.date?.trim() &&
          inviteData?.time?.trim() &&
          inviteData?.venue?.trim()
        )
      },
      validationErrors: () => {
        const errors = []
        if (!inviteData?.childName?.trim()) errors.push("Child's name is required")
        if (!inviteData?.age?.trim()) errors.push("Age is required")
        if (!inviteData?.date?.trim()) errors.push("Date is required")
        if (!inviteData?.time?.trim()) errors.push("Time is required")
        if (!inviteData?.venue?.trim()) errors.push("Venue is required")
        return errors
      }
    },
    [WIZARD_STEPS.CREATE_INVITE]: {
      title: "AI Generation",
      description: "Create with AI",
      isComplete: () => {
        return !!generatedImage // For AI mode, we need a selected AI option
      },
      canProceed: () => {
        return !!generatedImage
      },
      validationErrors: () => {
        const errors = []
        if (!generatedImage) errors.push("Please generate and select an AI invitation option")
        return errors
      }
    },
    [WIZARD_STEPS.SAVE_COMPLETE]: {
      title: "Complete",
      description: "Save & finish",
      isComplete: () => false, // Never complete until user clicks finish
      canProceed: () => true,
      validationErrors: () => []
    }
  }

  const allSteps = stepConfig

  const getStepStatus = (step) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'current'
    if (step === currentStep + 1 && stepConfig[currentStep]?.canProceed?.()) return 'available'
    return 'locked'
  }

  const canGoBack = () => currentStep > WIZARD_STEPS.PARTY_DETAILS

  const canProceedToNext = () => {
    const config = stepConfig[currentStep]
    return config?.canProceed?.() || false
  }

  const nextStep = () => {
    if (canProceedToNext() && currentStep < WIZARD_STEPS.SAVE_COMPLETE) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (canGoBack()) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step) => {
    if (step <= currentStep || (step === currentStep + 1 && canProceedToNext())) {
      setCurrentStep(step)
    }
  }

  const getValidationErrors = () => {
    const config = stepConfig[currentStep]
    return config?.validationErrors?.() || []
  }

  const getProgress = () => {
    const totalSteps = Object.keys(WIZARD_STEPS).length
    const completedSteps = Object.values(WIZARD_STEPS)
      .filter(step => step < currentStep || stepConfig[step]?.isComplete?.())
      .length
    
    return Math.round((completedSteps / totalSteps) * 100)
  }

  return {
    currentStep,
    setCurrentStep,
    allSteps,
    stepConfig,
    getStepStatus,
    canGoBack,
    canProceedToNext,
    nextStep,
    prevStep,
    goToStep,
    getValidationErrors,
    getProgress
  }
}