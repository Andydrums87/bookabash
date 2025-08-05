// hooks/useWizardSteps.js

import { useState } from 'react'

export const WIZARD_STEPS = {
  PARTY_DETAILS: 1,
  CREATE_INVITE: 2,
  GUEST_MANAGEMENT: 3,
  REVIEW_SHARE: 4,
}

export const STEP_CONFIG = {
  [WIZARD_STEPS.PARTY_DETAILS]: {
    title: "Party Details",
    description: "Tell us about your party",
    icon: "📝",
    requiredFields: ['childName', 'age', 'date', 'time', 'venue']
  },
  [WIZARD_STEPS.CREATE_INVITE]: {
    title: "Create Invite", 
    description: "Design your invitation",
    icon: "🎨",
    requiredFields: []
  },
  [WIZARD_STEPS.GUEST_MANAGEMENT]: {
    title: "Add Guests",
    description: "Manage your guest list", 
    icon: "👥",
    requiredFields: []
  },
  [WIZARD_STEPS.REVIEW_SHARE]: {
    title: "Review & Share",
    description: "Finalize and send invites",
    icon: "🚀", 
    requiredFields: []
  }
}

export const useWizardSteps = (inviteData, generatedImage) => {
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.PARTY_DETAILS)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  // Validate if current step can be completed
  const validateStep = (step) => {
    const stepConfig = STEP_CONFIG[step]
    
    switch (step) {
      case WIZARD_STEPS.PARTY_DETAILS:
        return stepConfig.requiredFields.every(field => 
          inviteData[field] && inviteData[field].toString().trim() !== ''
        )
      
      case WIZARD_STEPS.CREATE_INVITE:
        return !!generatedImage
      
      case WIZARD_STEPS.GUEST_MANAGEMENT:
        return true // Optional step
      
      case WIZARD_STEPS.REVIEW_SHARE:
        return !!generatedImage
      
      default:
        return false
    }
  }

  // Check if we can proceed to next step
  const canProceedToNext = () => {
    return validateStep(currentStep)
  }

  // Check if we can go back
  const canGoBack = () => {
    return currentStep > WIZARD_STEPS.PARTY_DETAILS
  }

  // Go to next step
  const nextStep = () => {
    if (canProceedToNext()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      
      const nextStepNumber = currentStep + 1
      if (nextStepNumber <= WIZARD_STEPS.REVIEW_SHARE) {
        setCurrentStep(nextStepNumber)
      }
    }
  }

  // Go to previous step  
  const prevStep = () => {
    if (canGoBack()) {
      const prevStepNumber = currentStep - 1
      if (prevStepNumber >= WIZARD_STEPS.PARTY_DETAILS) {
        setCurrentStep(prevStepNumber)
      }
    }
  }

  // Jump to specific step (if accessible)
  const goToStep = (step) => {
    // Can only go forward if all previous steps are completed
    if (step > currentStep) {
      let canJump = true
      for (let i = WIZARD_STEPS.PARTY_DETAILS; i < step; i++) {
        if (!validateStep(i)) {
          canJump = false
          break
        }
      }
      if (canJump) {
        // Mark intermediate steps as completed
        const newCompleted = new Set(completedSteps)
        for (let i = WIZARD_STEPS.PARTY_DETAILS; i < step; i++) {
          newCompleted.add(i)
        }
        setCompletedSteps(newCompleted)
        setCurrentStep(step)
      }
    } else {
      // Can always go back to completed steps
      setCurrentStep(step)
    }
  }

  // Get step status
  const getStepStatus = (step) => {
    if (completedSteps.has(step)) return 'completed'
    if (step === currentStep) return 'current'
    if (step < currentStep) return 'available'
    
    // Check if step is accessible (all previous steps completed)
    let accessible = true
    for (let i = WIZARD_STEPS.PARTY_DETAILS; i < step; i++) {
      if (!completedSteps.has(i) && i !== currentStep) {
        accessible = false
        break
      }
    }
    
    return accessible ? 'available' : 'locked'
  }

  // Get validation errors for current step
  const getValidationErrors = () => {
    const stepConfig = STEP_CONFIG[currentStep]
    const errors = []

    if (currentStep === WIZARD_STEPS.PARTY_DETAILS) {
      stepConfig.requiredFields.forEach(field => {
        if (!inviteData[field] || inviteData[field].toString().trim() === '') {
          errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
        }
      })
    }

    if (currentStep === WIZARD_STEPS.CREATE_INVITE && !generatedImage) {
      errors.push('Please create an invitation design')
    }

    return errors
  }

  // Calculate progress percentage
  const getProgress = () => {
    const totalSteps = Object.keys(WIZARD_STEPS).length
    const completedCount = completedSteps.size
    const currentProgress = currentStep > WIZARD_STEPS.PARTY_DETAILS ? 0.5 : 0 // Give partial credit for current step
    
    return Math.round(((completedCount + currentProgress) / totalSteps) * 100)
  }

  return {
    // Current state
    currentStep,
    completedSteps,
    
    // Navigation
    nextStep,
    prevStep, 
    goToStep,
    
    // Validation
    canProceedToNext,
    canGoBack,
    validateStep,
    getValidationErrors,
    
    // Status
    getStepStatus,
    getProgress,
    
    // Config
    stepConfig: STEP_CONFIG[currentStep],
    allSteps: STEP_CONFIG,
  }
}