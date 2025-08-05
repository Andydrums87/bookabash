// components/WizardProgress.js

import { Check, Lock } from "lucide-react"
import { WIZARD_STEPS } from "../hooks/useWizardSteps"

const WizardProgress = ({ 
  currentStep, 
  allSteps, 
  getStepStatus, 
  goToStep,
  getProgress 
}) => {
  const stepNumbers = Object.values(WIZARD_STEPS).sort((a, b) => a - b)

  // Snappy mascot image - we'll use the same image for now, but you can customize per step
  const getSnappyImage = (step, status) => {
    // You can customize different Snappy expressions based on step/status later
    return "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361571/v4l1f7puqvhswqb6j9tz.png"
  }

  const getStepClasses = (step) => {
    const status = getStepStatus(step)
    
    const baseClasses = "relative flex items-center justify-center w-16 h-16 rounded-full border-3 font-bold text-sm transition-all duration-300 overflow-hidden"
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 border-green-500 text-white hover:bg-green-600 cursor-pointer shadow-lg`
      case 'current':
        return `${baseClasses} bg-[hsl(var(--primary-500))] border-[hsl(var(--primary-500))] text-white ring-4 ring-[hsl(var(--primary-200))] shadow-xl`
      case 'available':
        return `${baseClasses} bg-white border-[hsl(var(--primary-300))] text-[hsl(var(--primary-600))] hover:bg-[hsl(var(--primary-50))] cursor-pointer shadow-md hover:shadow-lg`
      case 'locked':
        return `${baseClasses} bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60`
      default:
        return baseClasses
    }
  }

  const getConnectorClasses = (step) => {
    const nextStep = step + 1
    const nextStatus = getStepStatus(nextStep)
    
    if (getStepStatus(step) === 'completed' && (nextStatus === 'completed' || nextStatus === 'current')) {
      return "bg-green-500"
    } else if (getStepStatus(step) === 'current' || getStepStatus(step) === 'completed') {
      return "bg-[hsl(var(--primary-400))]"
    } else {
      return "bg-gray-300"
    }
  }

  const handleStepClick = (step) => {
    const status = getStepStatus(step)
    if (status !== 'locked') {
      goToStep(step)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Your Progress</span>
            <span className="text-sm font-bold text-[hsl(var(--primary-600))] bg-[hsl(var(--primary-50))] px-3 py-1 rounded-full">
              {getProgress()}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators with Snappy */}
        <div className="relative">
          {/* Connector Line Background */}
          <div className="absolute top-8 left-8 right-8 h-1 bg-gray-300 rounded-full"></div>
          
          <div className="flex items-start justify-between relative z-10">
            {stepNumbers.map((step, index) => {
              const stepConfig = allSteps[step]
              const status = getStepStatus(step)
              
              return (
                <div key={step} className="flex flex-col items-center relative">
                  {/* Snappy Step Circle */}
                  <button
                    onClick={() => handleStepClick(step)}
                    className={getStepClasses(step)}
                    disabled={status === 'locked'}
                    title={status === 'locked' ? 'Complete previous steps first' : `Go to ${stepConfig.title}`}
                  >
                    {status === 'completed' ? (
                      /* Completed - Show checkmark over Snappy */
                      <div className="relative w-full h-full">
                        <img 
                          src={getSnappyImage(step, status)}
                          alt="Snappy completed"
                          className="w-full h-full object-cover rounded-full opacity-80"
                        />
                        <div className="absolute inset-0 bg-green-500/80 rounded-full flex items-center justify-center">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : status === 'locked' ? (
                      /* Locked - Greyed out Snappy with lock */
                      <div className="relative w-full h-full">
                        <img 
                          src={getSnappyImage(step, status)}
                          alt="Snappy locked"
                          className="w-full h-full object-cover rounded-full grayscale opacity-50"
                        />
                        <div className="absolute inset-0 bg-gray-400/60 rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      /* Available/Current - Show Snappy */
                      <img 
                        src={getSnappyImage(step, status)}
                        alt={`Snappy - ${stepConfig.title}`}
                        className={`w-full h-full object-cover rounded-full ${
                          status === 'current' ? 'ring-2 ring-white' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Step Label */}
                  <div className="mt-4 text-center max-w-32">
                    <div className={`text-sm font-bold mb-1 ${
                      status === 'current' 
                        ? 'text-[hsl(var(--primary-600))]' 
                        : status === 'completed'
                        ? 'text-green-600'
                        : status === 'locked'
                        ? 'text-gray-400'
                        : 'text-gray-700'
                    }`}>
                      {stepConfig.title}
                    </div>
                    <div className="text-xs text-gray-500 leading-tight">
                      {stepConfig.description}
                    </div>
                  </div>

                  {/* Connector Progress */}
                  {index < stepNumbers.length - 1 && (
                    <div 
                      className={`absolute top-8 left-8 h-1 rounded-full transition-all duration-500 z-20 ${getConnectorClasses(step)}`}
                      style={{ 
                        width: 'calc(100% - 4rem)',
                        opacity: getStepStatus(step) === 'completed' || getStepStatus(step) === 'current' ? 1 : 0
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Step Info - More prominent */}
        <div className="mt-8 text-center bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {allSteps[currentStep].title}
          </h2>
          <p className="text-gray-600 text-lg">
            {allSteps[currentStep].description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default WizardProgress