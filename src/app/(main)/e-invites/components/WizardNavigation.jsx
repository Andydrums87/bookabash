import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { WIZARD_STEPS } from "../hooks/useWizardSteps"

const WizardNavigation = ({ 
  currentStep,
  canGoBack,
  canProceedToNext,
  prevStep,
  nextStep,
  getValidationErrors,
  stepConfig,
  onComplete 
}) => {
  const validationErrors = getValidationErrors()
  const isLastStep = currentStep === WIZARD_STEPS.REVIEW_SHARE

  const getNextButtonText = () => {
    switch (currentStep) {
      case WIZARD_STEPS.PARTY_DETAILS:
        return "Create Invite"
      case WIZARD_STEPS.CREATE_INVITE:
        return "Add Guests"
      case WIZARD_STEPS.GUEST_MANAGEMENT:
        return "Review & Share"
      case WIZARD_STEPS.REVIEW_SHARE:
        return "Complete"
      default:
        return "Next"
    }
  }

  const getNextButtonIcon = () => {
    if (isLastStep) {
      return "🎉"
    }
    return <ChevronRight className="w-4 h-4 ml-2" />
  }

  return (
    <div className="bg-white border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4 sticky bottom-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Validation Errors - More compact on mobile */}
        {validationErrors.length > 0 && (
          <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-red-800 mb-1">
                  Please complete the following:
                </h4>
                <ul className="text-xs sm:text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons - Mobile optimized */}
        <div className="flex justify-between items-center gap-3">
          {/* Back Button */}
          <div className="flex-shrink-0">
            {canGoBack() ? (
              <Button
                variant="outline"
                onClick={prevStep}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-3 sm:px-6 py-2 text-sm sm:text-base"
              >
                <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            ) : (
              <div className="w-16 sm:w-auto"></div>
            )}
          </div>

          {/* Step Counter - Always visible but smaller on mobile */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 flex-shrink-0">
            <span>Step {currentStep} of {Object.keys(WIZARD_STEPS).length}</span>
          </div>

          {/* Next/Complete Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={isLastStep ? onComplete : nextStep}
              disabled={!canProceedToNext()}
              data-complete-button={isLastStep ? "true" : undefined}
              className={`font-bold px-4 sm:px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base ${
                canProceedToNext()
                  ? "bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center">
                <span className="hidden sm:inline">{getNextButtonText()}</span>
                <span className="sm:hidden">{isLastStep ? "Complete" : "Next"}</span>
                {typeof getNextButtonIcon() === 'string' ? (
                  <span className="ml-2">{getNextButtonIcon()}</span>
                ) : (
                  getNextButtonIcon()
                )}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WizardNavigation
