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
      return "Saving..."
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

  const getNextButtonIcon = () => {
    if (isSaving) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    }
    
    if (isLastStep) {
      return <CheckCircle className="w-4 h-4 mr-2" />
    }
    
    return <ChevronRight className="w-4 h-4 ml-2" />
  }

  const handleNextClick = () => {
    if (isLastStep) {
      // This is the final complete step
      onComplete()
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
              className={`bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl)var(--primary-700)] text-white hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))]${
                isSaving ? 'cursor-not-allowed' : ''
              }`}
            >
              {isLastStep ? (
                <>
                  {getNextButtonIcon()}
                  {getNextButtonText()}
                </>
              ) : (
                <>
                  {getNextButtonText()}
                  {!isSaving && <ChevronRight className="w-4 h-4 ml-2" />}
                  {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>}
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Validation Messages */}
        {currentStep === WIZARD_STEPS.CREATE_INVITE && !selectedAiOption && (
          <div className="mt-2 text-center">
            <p className="text-sm text-amber-600">
              ⚠️ Please select an AI option to continue
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WizardNavigation