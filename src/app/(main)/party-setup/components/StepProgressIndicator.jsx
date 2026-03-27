"use client"

import { Check } from "lucide-react"

const steps = [
  { id: 1, label: "Venue" },
  { id: 2, label: "Entertainer" }
]

export default function StepProgressIndicator({ currentStep, hasOwnVenue = false }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-xs mx-auto">
      {steps.map((step, index) => {
        const isCompleted = hasOwnVenue && step.id === 1
          ? true
          : step.id < currentStep
        const isActive = step.id === currentStep
        const isSkipped = hasOwnVenue && step.id === 1

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-[hsl(var(--primary-500))] text-white"
                    : isActive
                    ? "bg-[hsl(var(--primary-500))] text-white ring-4 ring-[hsl(var(--primary-100))]"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium ${
                  isActive
                    ? "text-[hsl(var(--primary-600))]"
                    : isCompleted
                    ? "text-[hsl(var(--primary-500))]"
                    : "text-gray-400"
                }`}
              >
                {isSkipped ? "Skipped" : step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all duration-300 ${
                  isCompleted
                    ? "bg-[hsl(var(--primary-500))]"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
