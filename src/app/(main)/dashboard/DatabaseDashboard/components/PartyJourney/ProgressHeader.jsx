import { Check } from "lucide-react"

export function ProgressHeader({ partyDetails, progress, completedSteps, totalSteps, suppliers = {}, onViewTeam, supplierCount = 0 }) {
  // Calculate which step we're on based on progress
  const currentStep = Math.ceil((progress / 100) * totalSteps)

  // Generate steps array
  const steps = Array.from({ length: totalSteps }, (_, i) => ({
    number: i + 1,
    label: `Step ${i + 1}`,
    completed: i + 1 <= completedSteps,
    current: i + 1 === currentStep && completedSteps < totalSteps,
  }))

  return (
    <div className="w-full">
      {/* Desktop view - full step circles */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background line */}
        <div
          className="absolute top-5 left-0 right-0 h-1 bg-gray-200"
          style={{
            left: `${100 / totalSteps / 2}%`,
            right: `${100 / totalSteps / 2}%`,
          }}
        />

        {/* Progress line */}
        <div
          className="absolute top-5 left-0 h-1 bg-primary transition-all duration-700 ease-out"
          style={{
            left: `${100 / totalSteps / 2}%`,
            width: `${Math.max(0, ((completedSteps - 1) / (totalSteps - 1)) * (100 - 100 / totalSteps))}%`,
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="flex flex-col items-center relative z-10"
            style={{ width: `${100 / totalSteps}%` }}
          >
            {/* Step circle */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                transition-all duration-300 border-2
                ${
                  step.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : step.current
                      ? "bg-background border-primary text-primary"
                      : "bg-background border-gray-300 text-muted-foreground"
                }
              `}
            >
              {step.completed ? <Check className="w-5 h-5" /> : step.number}
            </div>

            {/* Step label */}
            <div
              className={`
                mt-2 text-xs font-medium text-center
                ${step.completed || step.current ? "text-foreground" : "text-muted-foreground"}
              `}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile view - enhanced progress bar */}
      <div className="md:hidden space-y-4">
        {/* Large progress bar */}
        <div className="px-4">
          <div className="relative">
            {/* Progress bar container */}
            <div className="h-4 bg-gray-200 border-[hsl(var(--primary-200))] border-1 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] transition-all duration-700 ease-out rounded-full shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Progress percentage overlay */}
            <div className="absolute -top-8 left-0 right-0 flex justify-center">
              {/* <div className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {Math.round(progress)}%
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Progress text - shown on both mobile and desktop */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {completedSteps} of {totalSteps} steps complete
          {progress === 100 && <span className="ml-2 text-primary font-semibold">All done! 🎉</span>}
        </p>
        {onViewTeam && (
          <button 
            onClick={onViewTeam} 
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            View your party team ({supplierCount}/9)
          </button>
        )}
      </div>
    </div>
  )
}