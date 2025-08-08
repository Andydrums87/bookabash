import { WIZARD_STEPS } from "../hooks/useWizardSteps"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

function WizardNavigation({ 
  currentStep,
  canGoBack,
  canProceedToNext,
  prevStep,
  nextStep,
  onComplete 
}) {
  const isLastStep = currentStep === WIZARD_STEPS.SAVE_COMPLETE

  const getNextButtonText = () => {
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

  return (
    <div className="bg-white border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4 sticky bottom-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center gap-3">
          {/* Back Button */}
          <div className="flex-shrink-0">
            {canGoBack() ? (
              <Button variant="outline" onClick={prevStep}>
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

          {/* Next Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={isLastStep ? onComplete : nextStep}
              disabled={!canProceedToNext()}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white"
            >
              {getNextButtonText()}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WizardNavigation