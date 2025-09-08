import { WIZARD_STEPS } from "../hooks/useWizardSteps"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"

function WizardNavigation({ 
  currentStep,
  canGoBack,
  canProceedToNext,
  prevStep,
  nextStep,
  onComplete,
  isSaving = false,
  selectedAiOption = null
}) {
  const isLastStep = currentStep === WIZARD_STEPS.SAVE_COMPLETE

  const getNextButtonText = () => {
    if (isSaving) {
      return isLastStep ? "Completing..." : "Saving..."
    }
    
    switch (currentStep) {
      case WIZARD_STEPS.PARTY_DETAILS:
        return "Create Invite"
      case WIZARD_STEPS.CREATE_INVITE:
        return "Save Invitation"
      case WIZARD_STEPS.SAVE_COMPLETE:
        return "Complete"
      default:
        return "Next"
    }
  }

  const getLoadingSpinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  )

  const getNextButtonIcon = () => {
    if (isSaving) {
      return isLastStep ? 
        <div className="mr-2">{getLoadingSpinner()}</div> : 
        <div className="ml-2">{getLoadingSpinner()}</div>
    }
    
    if (isLastStep) {
      return <CheckCircle className="w-4 h-4 mr-2" />
    }
    
    return <ChevronRight className="w-4 h-4 ml-2" />
  }

  const handleNextClick = async () => {
    // Prevent multiple clicks when already processing
    if (isSaving) return

    if (isLastStep) {
      // This is the final complete step
      await onComplete()
    } else if (currentStep === WIZARD_STEPS.CREATE_INVITE) {
      // This is the save step - check if AI option is selected
      if (!selectedAiOption) {
        alert("Please select an AI option before proceeding!")
        return
      }
      nextStep()
    } else {
      // Regular next step
      nextStep()
    }
  }

  const isNextDisabled = () => {
    // Immediately disable if saving/processing
    if (isSaving) return true
    
    if (!canProceedToNext()) return true
    
    // For CREATE_INVITE step, require AI option selection
    if (currentStep === WIZARD_STEPS.CREATE_INVITE && !selectedAiOption) {
      return true
    }
    
    return false
  }

  return (
    <div className="bg-white border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4 sticky bottom-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center gap-3">
          {/* Back Button */}
          <div className="flex-shrink-0">
            {canGoBack() ? (
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={isSaving}
                className={isSaving ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div className="w-16"></div>
            )}
          </div>

          {/* Step Counter */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Step {currentStep} of {Object.keys(WIZARD_STEPS).length}</span>
          </div>

          {/* Next/Complete Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleNextClick}
              disabled={isNextDisabled()}
              className={`bg-primary-500 text-white hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] ${
                isSaving ? 'cursor-not-allowed opacity-75' : ''
              } transition-all duration-150`}
            >
              {isLastStep ? (
                <>
                  {getNextButtonIcon()}
                  {getNextButtonText()}
                </>
              ) : (
                <>
                  {getNextButtonText()}
                  {getNextButtonIcon()}
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Validation Messages */}
        {currentStep === WIZARD_STEPS.CREATE_INVITE && !selectedAiOption && !isSaving && (
          <div className="mt-2 text-center">
            <p className="text-sm text-amber-600">
              ⚠️ Please select an AI option to continue
            </p>
          </div>
        )}

        {/* Loading Message */}
        {isSaving && (
          <div className="mt-2 text-center">
            <p className="text-sm text-blue-600 font-medium">
              {isLastStep ? 
                "🚀 Finalizing your invitation..." : 
                "💾 Saving your progress..."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WizardNavigation