"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function WizardLayout({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  onSaveExit,
  nextDisabled = false,
  showBack = true,
  showSkip = false,
  nextLabel = "Next"
}) {
  const router = useRouter()
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
              alt="PartySnap"
              width={150}
              height={32}
              className="h-auto w-auto"
            />
          </Link>

          {/* Questions and Save & Exit buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-700 hover:bg-gray-100 rounded-full px-4 py-2"
              onClick={() => router.push('/help')}
            >
              Questions?
            </Button>
            <Button
              variant="ghost"
              className="text-gray-700 hover:bg-gray-100 rounded-full px-4 py-2 font-semibold"
              onClick={onSaveExit}
            >
              Save & exit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 md:pt-28 pb-32">
        <div className="max-w-3xl mx-auto px-6">
          {children}
        </div>
      </main>

      {/* Footer with Progress Bar and Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-gray-900 h-1 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {showBack ? (
            <Button
              variant="ghost"
              className="text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-2 font-semibold flex items-center gap-2"
              onClick={onBack}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {showSkip && (
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-3 font-medium"
                onClick={onSkip}
              >
                Skip
              </Button>
            )}
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onNext}
              disabled={nextDisabled}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
