// hooks/useWizardSteps.js

import { useState } from 'react'

// NEW SIMPLIFIED WIZARD STEPS:
export const WIZARD_STEPS = {
  PARTY_DETAILS: 1,    // Enter party info
  CREATE_INVITE: 2,    // Choose theme/design  
  SAVE_COMPLETE: 3     // Save and redirect to management
}

// Updated step configuration with required fields
export const STEP_CONFIG = {  // ← Fixed: renamed from stepConfig to STEP_CONFIG
  [WIZARD_STEPS.PARTY_DETAILS]: {
    title: "Party Details",
    description: "Basic info",
    requiredFields: ['childName', 'age', 'date', 'time', 'venue'] // ← Added required fields
  },
  [WIZARD_STEPS.CREATE_INVITE]: {
    title: "Create Invite", 
    description: "Design & theme",
    requiredFields: [] // ← No specific fields, just needs generatedImage
  },
  [WIZARD_STEPS.SAVE_COMPLETE]: {
    title: "Complete",
    description: "Save & share",
    requiredFields: [] // ← No additional requirements
  }
}

export const useWizardSteps = (inviteData, generatedImage) => {
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.PARTY_DETAILS)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  // Validate if current step can be completed
  const validateStep = (step) => {
    switch (step) {
      case WIZARD_STEPS.PARTY_DETAILS:
        // Check required fields for party details
        const requiredFields = STEP_CONFIG[step].requiredFields
        return requiredFields.every(field => 
          inviteData[field] && inviteData[field].toString().trim() !== ''
        )
      
      case WIZARD_STEPS.CREATE_INVITE:
        // Must have generated an image/design
        return !!generatedImage
      
      case WIZARD_STEPS.SAVE_COMPLETE:
        // Must have completed previous steps
        return !!generatedImage && validateStep(WIZARD_STEPS.PARTY_DETAILS)
      
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
      if (nextStepNumber <= WIZARD_STEPS.SAVE_COMPLETE) { // ← Updated max step
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
    const errors = []

    if (currentStep === WIZARD_STEPS.PARTY_DETAILS) {
      const requiredFields = STEP_CONFIG[currentStep].requiredFields
      requiredFields.forEach(field => {
        if (!inviteData[field] || inviteData[field].toString().trim() === '') {
          // Convert camelCase to readable names
          const fieldName = field
            .replace(/([A-Z])/g, ' $1') // Add space before capitals
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
          errors.push(`${fieldName} is required`)
        }
      })
    }

    if (currentStep === WIZARD_STEPS.CREATE_INVITE && !generatedImage) {
      errors.push('Please create an invitation design')
    }

    if (currentStep === WIZARD_STEPS.SAVE_COMPLETE && !generatedImage) {
      errors.push('Please complete the invitation design first')
    }

    return errors
  }

  // Calculate progress percentage
  const getProgress = () => {
    const totalSteps = Object.keys(WIZARD_STEPS).length
    const completedCount = completedSteps.size
    const currentProgress = validateStep(currentStep) ? 0.5 : 0 // Give partial credit for current step
    
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