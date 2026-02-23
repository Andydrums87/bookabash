"use client"

import { useEffect, useState } from "react"
import { themes } from "@/lib/themes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, Sparkles, ArrowLeft, ArrowRight } from "lucide-react"

// Import existing components
import HeroSection from "./HeroSection"
import PartyDetailsForm from "./PartyDetailsForm"
import SuccessModal from "./SuccessModal"
import TemplateSelector from "./TemplateSelector"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

// Import hooks
import { useInviteData } from "../hooks/useInviteData"
import { useGuestManagement } from "../hooks/useGuestManagement"
import { useTemplateGen } from "../hooks/useTemplateGen"
import { useSaveState } from "../hooks/useSaveState"

// Import utils
import { formatDateForDisplay, validateRequiredFields } from "../utils/helperFunctions"

// 3-step wizard (theme is pre-selected from party)
const STEPS = {
  PARTY_DETAILS: 1,
  SELECT_TEMPLATE: 2,
  COMPLETE: 3
}

const STEP_LABELS = {
  [STEPS.PARTY_DETAILS]: 'Details',
  [STEPS.SELECT_TEMPLATE]: 'Design',
  [STEPS.COMPLETE]: 'Complete'
}

const TemplateEInvitesPage = ({ onSaveSuccess }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.PARTY_DETAILS)
  const [isCompleting, setIsCompleting] = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [previewImageUrl, setPreviewImageUrl] = useState(null)

  // Custom hooks
  const {
    selectedTheme,
    inviteData,
    generatedImage,
    setGeneratedImage,
    handleInputChange,
    savedGuestList,
  } = useInviteData()

  const {
    isGenerating,
    generatedInvite,
    generateTemplateInvite,
    clearInvite,
  } = useTemplateGen(inviteData, selectedTemplateId || selectedTheme, setGeneratedImage)

  const {
    guestList,
    setGuestList,
  } = useGuestManagement(inviteData, savedGuestList)

  const {
    isSaving,
    saveSuccess,
    setSaveSuccess,
    saveInviteToPartyPlan,
  } = useSaveState(selectedTheme, inviteData, guestList, generatedImage, false, themes)

  // Check if party details are complete
  const isDetailsComplete = validateRequiredFields(inviteData) && inviteData.age?.trim()

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // When theme changes, update template ID to match
  // Always sync templateId with theme since theme comes from party data
  useEffect(() => {
    if (selectedTheme) {
      setSelectedTemplateId(selectedTheme)
    }
  }, [selectedTheme])

  const handleNext = () => {
    if (currentStep === STEPS.PARTY_DETAILS && isDetailsComplete) {
      setCurrentStep(STEPS.SELECT_TEMPLATE)
    } else if (currentStep === STEPS.SELECT_TEMPLATE && selectedTemplateId) {
      setCurrentStep(STEPS.COMPLETE)
    }
  }

  const handleBack = () => {
    if (currentStep > STEPS.PARTY_DETAILS) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId)
  }

  const handleComplete = async () => {
    if (!selectedTemplateId) return

    setIsCompleting(true)
    try {
      // Use existing preview image if available (already generated server-side)
      // Otherwise generate a new one
      let imageUrl = previewImageUrl

      if (!imageUrl) {
        const result = await generateTemplateInvite()
        if (result && result.imageUrl) {
          imageUrl = result.imageUrl
        }
      }

      if (imageUrl) {
        // Save to party plan
        const saveResultData = await saveInviteToPartyPlan(imageUrl, {
          imageUrl: imageUrl,
          type: 'template',
          templateId: selectedTemplateId
        })

        if (saveResultData?.success) {
          setSaveResult(saveResultData)
        }
      }
    } catch (error) {
      console.error("Complete failed:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleRedirectToDashboard = () => {
    if (saveResult && (saveResult.inviteSlug || saveResult.inviteId)) {
      const inviteIdentifier = saveResult.inviteSlug || saveResult.inviteId
      window.location.href = `/e-invites/${inviteIdentifier}/manage`
    } else {
      window.location.href = '/dashboard'
    }
  }

  const handleCloseSuccessModal = () => {
    setSaveSuccess(false)
    setSaveResult(null)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.PARTY_DETAILS:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Check Your Party Details
              </h2>
              <p className="text-gray-600">
                These details will appear on your invitation. Edit if needed.
              </p>
            </div>
            <PartyDetailsForm
              inviteData={inviteData}
              handleInputChange={handleInputChange}
              selectedTheme={selectedTheme}
            />
          </div>
        )

      case STEPS.SELECT_TEMPLATE:
        return (
          <div className="max-w-5xl mx-auto">
            <TemplateSelector
              selectedTheme={selectedTheme}
              selectedTemplate={selectedTemplateId}
              onSelectTemplate={handleTemplateSelect}
              onPreviewGenerated={setPreviewImageUrl}
              onBack={() => setCurrentStep(STEPS.SELECT_THEME)}
              inviteData={inviteData}
            />
          </div>
        )

      case STEPS.COMPLETE:
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-teal-500 rounded-full">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Ready to Create!
                </h2>

                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your invitation looks perfect! Click "Complete" below to generate the final invite and start sending to guests.
                </p>

                {/* Preview */}
                {previewImageUrl && (
                  <div className="mb-8 flex justify-center">
                    <div className="relative max-w-[280px]">
                      <img
                        src={previewImageUrl}
                        alt="Your Party Invitation"
                        className="w-full rounded-xl border-2 border-gray-200 shadow-lg"
                      />
                      <div className="absolute top-2 left-2 bg-teal-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Preview
                      </div>
                    </div>
                  </div>
                )}

                {/* Party Details Summary */}
                <div className="p-4 bg-gray-50 rounded-xl text-left text-sm mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-gray-500">Name:</span> <strong>{inviteData.childName}</strong></div>
                    <div><span className="text-gray-500">Age:</span> <strong>{inviteData.age}</strong></div>
                    <div><span className="text-gray-500">Date:</span> <strong>{formatDateForDisplay(inviteData.date)}</strong></div>
                    <div><span className="text-gray-500">Time:</span> <strong>{inviteData.time}</strong></div>
                    <div className="col-span-2"><span className="text-gray-500">Venue:</span> <strong>{inviteData.venue}</strong></div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-xl border border-[hsl(var(--primary-200))]">
                  <p className="text-sm font-medium text-gray-700">
                    Click the <strong>"Complete"</strong> button below to finalize your invitation!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  // Determine button states
  const canProceed =
    (currentStep === STEPS.PARTY_DETAILS && isDetailsComplete) ||
    (currentStep === STEPS.SELECT_TEMPLATE && selectedTemplateId)

  const isLoading = isSaving || isCompleting || isGenerating

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] pb-24">
      <ContextualBreadcrumb currentPage="e-invites" />

      {/* Only show hero on first step */}
      {currentStep === STEPS.PARTY_DETAILS && <HeroSection />}

      {/* Step Content */}
      <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderStepContent()}
      </div>

      {/* Navigation - Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Back Button */}
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStep === STEPS.PARTY_DETAILS || isLoading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Step Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            {Object.entries(STEP_LABELS).map(([step, label], index) => (
              <span key={step} className="flex items-center gap-1">
                {index > 0 && <span className="mx-1">→</span>}
                <span className={currentStep >= parseInt(step) ? "text-primary-600 font-medium" : ""}>
                  {label}
                </span>
              </span>
            ))}
          </div>

          {/* Mobile step indicator */}
          <div className="sm:hidden text-sm text-gray-500">
            Step {currentStep} of 3
          </div>

          {/* Next/Complete Button */}
          {currentStep === STEPS.COMPLETE ? (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed || isLoading}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={saveSuccess}
        onClose={handleCloseSuccessModal}
        saveResult={saveResult}
        inviteData={inviteData}
        selectedAiOption={generatedInvite}
        onRedirectToDashboard={handleRedirectToDashboard}
      />
    </div>
  )
}

export default TemplateEInvitesPage
