import { Check, Lock } from 'lucide-react'
import { WIZARD_STEPS } from "../hooks/useWizardSteps"

const WizardProgress = ({ currentStep, allSteps, getStepStatus, goToStep, getProgress }) => {
  const stepNumbers = Object.values(WIZARD_STEPS).sort((a, b) => a - b)

  const getSnappyImage = (step, status) => {
    return "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361571/v4l1f7puqvhswqb6j9tz.png"
  }

  const getStepClasses = (step) => {
    const status = getStepStatus(step)
    const baseClasses = "relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 font-bold text-xs transition-all duration-300 overflow-hidden"
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-[hsl(var(--primary-600))] border-[hsl(var(--primary-600))] text-white hover:bg-[hsl(var(--primary-700))] cursor-pointer shadow-md`
      case 'current':
        return `${baseClasses} bg-[hsl(var(--primary-500))] border-[hsl(var(--primary-500))] text-white ring-2 ring-[hsl(var(--primary-200))] shadow-lg`
      case 'available':
        return `${baseClasses} bg-white border-[hsl(var(--primary-300))] text-[hsl(var(--primary-600))] hover:bg-[hsl(var(--primary-50))] cursor-pointer shadow-sm hover:shadow-md`
      case 'locked':
        return `${baseClasses} bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60`
      default:
        return baseClasses
    }
  }

  const handleStepClick = (step) => {
    const status = getStepStatus(step)
    if (status !== 'locked') {
      goToStep(step)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Compact Progress Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-[hsl(var(--primary-600))] bg-[hsl(var(--primary-50))] px-2 py-1 rounded-full">
              {getProgress()}%
            </span>
          </div>
          
          {/* Compact Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
            <div 
              className="h-2 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Compact Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-5 sm:top-6 left-0 right-0 h-0.5 bg-gray-300"></div>
          
          <div className="flex justify-between items-start relative">
            {stepNumbers.map((step, index) => {
              const stepConfig = allSteps[step]
              const status = getStepStatus(step)
              const isActive = status === 'current'
              const isCompleted = status === 'completed'
              
              return (
                <div key={step} className="flex flex-col items-center relative">
                  {/* Compact Step Circle */}
                  <button
                    onClick={() => handleStepClick(step)}
                    className={getStepClasses(step)}
                    disabled={status === 'locked'}
                    title={status === 'locked' ? 'Complete previous steps first' : `Go to ${stepConfig.title}`}
                  >
                    {isCompleted ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={getSnappyImage(step, status) || "/placeholder.svg"}
                          alt="Completed"
                          className="w-full h-full object-cover rounded-full opacity-80"
                        />
                        <div className="absolute inset-0 bg-[hsl(var(--primary-600))]/80 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                    ) : status === 'locked' ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={getSnappyImage(step, status) || "/placeholder.svg"}
                          alt="Locked"
                          className="w-full h-full object-cover rounded-full grayscale opacity-40"
                        />
                        <div className="absolute inset-0 bg-gray-400/60 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={getSnappyImage(step, status) || "/placeholder.svg"}
                        alt={stepConfig.title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </button>

                  {/* Connection Progress */}
                  {index < stepNumbers.length - 1 && (
                    <div 
                      className={`absolute top-5 sm:top-6 left-5 sm:left-6 h-0.5 transition-all duration-500 z-10 ${
                        isCompleted ? 'bg-[hsl(var(--primary-600))]' : isActive ? 'bg-[hsl(var(--primary-500))]' : 'bg-transparent'
                      }`}
                      style={{ 
                        width: `calc(${100 / (stepNumbers.length - 1)}vw - 2.5rem)`,
                        maxWidth: `calc(${100 / (stepNumbers.length - 1)}% + 1rem)`
                      }}
                    />
                  )}

                  {/* Compact Step Info */}
                  <div className="mt-2 text-center max-w-20 sm:max-w-24">
                    <div className={`font-medium text-xs sm:text-sm mb-0.5 ${
                      isActive
                        ? 'text-[hsl(var(--primary-600))]'
                        : isCompleted
                        ? 'text-[hsl(var(--primary-700))]'
                        : status === 'locked'
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}>
                      {stepConfig.title}
                    </div>
                    <div className={`text-xs leading-tight hidden sm:block ${
                      isActive
                        ? 'text-[hsl(var(--primary-500))]'
                        : isCompleted
                        ? 'text-[hsl(var(--primary-600))]'
                        : 'text-gray-500'
                    }`}>
                      {stepConfig.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WizardProgress
