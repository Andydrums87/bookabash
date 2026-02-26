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
      <div className="md:hidden space-y-3">
        {/* Large progress bar */}
        <div className="px-4">
          <div className="relative">
            {/* Progress bar container */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] transition-all duration-700 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress text - responsive layout */}
      <div className="mt-4 px-4 md:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            {progress === 100 ? (
              <span className="text-primary font-semibold">All done! 🎉</span>
            ) : completedSteps === 1 ? (
              "You're 1 step in — great start! 🎉"
            ) : (
              `You're ${completedSteps} steps in — great progress! 🎉`
            )}
          </p>
        </div>
      </div>
    </div>
  )
}