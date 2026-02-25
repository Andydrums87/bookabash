"use client"

import { useEffect, useState } from "react"
import { themes } from "@/lib/themes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, Sparkles, ArrowLeft, ArrowRight, RefreshCw, X, ZoomIn, AlertTriangle, ShieldCheck } from "lucide-react"

// Import existing components
import HeroSection from "./HeroSection"
import PartyDetailsForm from "./PartyDetailsForm"
import SuccessModal from "./SuccessModal"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

// Import hooks
import { useInviteData } from "../hooks/useInviteData"
import { useGuestManagement } from "../hooks/useGuestManagement"
import { useAIGen } from "../hooks/useAIGen"
import { useSaveState } from "../hooks/useSaveState"

// Import utils
import { formatDateForDisplay, validateRequiredFields } from "../utils/helperFunctions"
import { uploadFinalInvite } from "../utils/cloudinaryInviteUpload"

// Simplified wizard steps
const STEPS = {
  PARTY_DETAILS: 1,
  CHOOSE_DESIGN: 2,
  COMPLETE: 3
}

const SimpleAIEinvitesPage = ({ onSaveSuccess }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.PARTY_DETAILS)
  const [isCompleting, setIsCompleting] = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  const [previewImage, setPreviewImage] = useState(null) // For full-size preview modal
  const [generationProgress, setGenerationProgress] = useState(null) // Track generation progress

  // Debug/QA mode - generate one at a time with manual verification
  const [debugMode] = useState(true) // Set to false for production
  const [currentImage, setCurrentImage] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  const [isCheckingText, setIsCheckingText] = useState(false)
  const [isGeneratingDebug, setIsGeneratingDebug] = useState(false)

  // Custom hooks
  const {
    selectedTheme,
    setSelectedTheme,
    inviteData,
    setInviteData,
    generatedImage,
    setGeneratedImage,
    handleInputChange,
    savedGuestList,
  } = useInviteData()

  const {
    isGeneratingAI,
    aiOptions,
    selectedAiOption,
    generateVerifiedInvite,
    selectAiOption,
  } = useAIGen(inviteData, selectedTheme, setGeneratedImage)

  const {
    guestList,
  } = useGuestManagement(inviteData, savedGuestList)

  const {
    isSaving,
    saveSuccess,
    setSaveSuccess,
    saveInviteToPartyPlan,
  } = useSaveState(selectedTheme, inviteData, guestList, generatedImage, true, themes)

  // Check if party details are complete
  const isDetailsComplete = validateRequiredFields(inviteData) && inviteData.age?.trim()

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Auto-generate when moving to step 2
  useEffect(() => {
    if (currentStep === STEPS.CHOOSE_DESIGN && !currentImage && !isGeneratingAI && debugMode) {
      // Debug mode: generate single image for manual checking
      generateSingleImage()
    } else if (currentStep === STEPS.CHOOSE_DESIGN && aiOptions.length === 0 && !isGeneratingAI && !debugMode) {
      // Production mode: auto-verify loop
      generateVerifiedInvite(7, (progress) => {
        setGenerationProgress(progress)
      })
    }
  }, [currentStep])

  // Debug: Generate a single image without auto-verification
  const generateSingleImage = async () => {
    setCurrentImage(null)
    setVerificationResult(null)
    setIsGeneratingDebug(true)

    try {
      const response = await fetch("/api/generate-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a vibrant themed birthday party invitation.

Include this information:
- Title: "${inviteData.childName?.split(' ')[0]} is turning ${inviteData.age}!" (write as one sentence)
- ${formatDateForDisplay(inviteData.date)}
- ${inviteData.time}
- ${inviteData.venue}

Design: Bright, colorful theme. Fun and festive. Portrait orientation.

Important: Use only the exact information provided. No extra text.`,
          childName: inviteData.childName?.split(' ')[0],
          date: formatDateForDisplay(inviteData.date),
          time: inviteData.time,
          venue: inviteData.venue,
          theme: selectedTheme,
        })
      })

      const result = await response.json()
      if (result.imageUrl) {
        setCurrentImage({
          id: 'debug-image',
          imageUrl: result.imageUrl,
          prompt: result.prompt
        })
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGeneratingDebug(false)
    }
  }

  // Debug: Check text accuracy manually
  const checkTextAccuracy = async () => {
    if (!currentImage) return

    setIsCheckingText(true)
    try {
      const response = await fetch('/api/verify-invite-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: currentImage.imageUrl,
          expectedData: {
            childName: inviteData.childName,
            date: inviteData.date,
            time: inviteData.time,
            venue: inviteData.venue
          }
        })
      })

      const result = await response.json()
      setVerificationResult(result)
      console.log('📋 Verification Result:', result)
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult({ error: error.message })
    } finally {
      setIsCheckingText(false)
    }
  }

  // Debug: Accept current image
  const acceptCurrentImage = () => {
    if (!currentImage) return

    const option = {
      id: 'accepted-image',
      index: 1,
      imageUrl: currentImage.imageUrl,
      verification: verificationResult
    }
    selectAiOption(option)
  }

  const handleNext = () => {
    if (currentStep === STEPS.PARTY_DETAILS && isDetailsComplete) {
      setCurrentStep(STEPS.CHOOSE_DESIGN)
    } else if (currentStep === STEPS.CHOOSE_DESIGN && selectedAiOption) {
      setCurrentStep(STEPS.COMPLETE)
    }
  }

  const handleBack = () => {
    if (currentStep > STEPS.PARTY_DETAILS) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!selectedAiOption) return

    setIsCompleting(true)
    try {
      // Upload to Cloudinary and save
      const cloudinaryResult = await uploadFinalInvite(selectedAiOption, selectedTheme, inviteData)

      const result = await saveInviteToPartyPlan(cloudinaryResult.url, selectedAiOption)

      if (result?.success) {
        setSaveResult(result)
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
        const themeOptionsStep1 = Object.entries(themes).map(([key, value]) => ({
          key,
          name: value.name
        }))

        return (
          <div className="max-w-4xl mx-auto">
            {/* Debug Theme Selector */}
            {debugMode && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <label className="block text-sm font-bold text-purple-700 mb-2">
                  Theme Selector (Debug)
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full p-2 border border-purple-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500"
                >
                  {themeOptionsStep1.map(theme => (
                    <option key={theme.key} value={theme.key}>
                      {theme.name} ({theme.key})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-purple-600 mt-1">
                  Current: <strong>{selectedTheme}</strong> - {themes[selectedTheme]?.name || 'Unknown'}
                </p>
              </div>
            )}

            <PartyDetailsForm
              inviteData={inviteData}
              handleInputChange={handleInputChange}
              selectedTheme={selectedTheme}
              useAIGeneration={true}
            />
          </div>
        )

      case STEPS.CHOOSE_DESIGN:
        // DEBUG MODE UI
        if (debugMode) {
          return (
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center mb-4">
                    <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-2">
                      DEBUG MODE
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Test Image Generation
                    </h2>
                    <p className="text-sm text-purple-600 mt-1">
                      Theme: <strong>{themes[selectedTheme]?.name || selectedTheme}</strong>
                    </p>
                  </div>

                  {/* Loading */}
                  {isGeneratingDebug && (
                    <div className="flex flex-col items-center py-8">
                      <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                      <p className="text-gray-600">Generating image...</p>
                    </div>
                  )}

                  {/* Generated Image */}
                  {currentImage && !isGeneratingDebug && (
                    <>
                      <div className="flex justify-center mb-4">
                        <div
                          className="relative w-full max-w-[280px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg cursor-pointer"
                          onClick={() => setPreviewImage(currentImage)}
                        >
                          <img
                            src={currentImage.imageUrl}
                            alt="Generated invite"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Expected Data */}
                      <div className="p-3 bg-gray-100 rounded-lg text-xs mb-4">
                        <p className="font-bold mb-1">Expected Data:</p>
                        <p>Name: {inviteData.childName}</p>
                        <p>Date: {inviteData.date} → {formatDateForDisplay(inviteData.date)}</p>
                        <p>Time: {inviteData.time}</p>
                        <p>Venue: {inviteData.venue}</p>
                      </div>

                      {/* Check Text Button */}
                      <div className="flex justify-center gap-3 mb-4">
                        <Button
                          onClick={checkTextAccuracy}
                          disabled={isCheckingText}
                          variant="outline"
                          className="border-blue-500 text-blue-600"
                        >
                          {isCheckingText ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Check Text Accuracy
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Verification Results */}
                      {verificationResult && (
                        <div className={`p-4 rounded-lg mb-4 ${verificationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <p className={`font-bold mb-2 ${verificationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                            {verificationResult.isValid ? '✅ PASSED' : '❌ FAILED'} ({verificationResult.passedChecks}/{verificationResult.totalChecks})
                          </p>
                          <div className="text-sm space-y-1">
                            <p className={verificationResult.verification?.childName ? 'text-green-600' : 'text-red-600'}>
                              {verificationResult.verification?.childName ? '✓' : '✗'} Child Name
                            </p>
                            <p className={verificationResult.verification?.date ? 'text-green-600' : 'text-red-600'}>
                              {verificationResult.verification?.date ? '✓' : '✗'} Date
                            </p>
                            <p className={verificationResult.verification?.time ? 'text-green-600' : 'text-red-600'}>
                              {verificationResult.verification?.time ? '✓' : '✗'} Time
                            </p>
                            <p className={verificationResult.verification?.venue ? 'text-green-600' : 'text-red-600'}>
                              {verificationResult.verification?.venue ? '✓' : '✗'} Venue
                            </p>
                          </div>
                          {verificationResult.detectedText && (
                            <details className="mt-3">
                              <summary className="text-xs text-gray-500 cursor-pointer">View detected text</summary>
                              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-32">
                                {verificationResult.detectedText}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-center gap-3">
                        <Button
                          onClick={generateSingleImage}
                          variant="outline"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Generate New
                        </Button>
                        <Button
                          onClick={acceptCurrentImage}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept This
                        </Button>
                      </div>
                    </>
                  )}

                  {/* No image yet */}
                  {!currentImage && !isGeneratingDebug && (
                    <div className="text-center py-8">
                      <Button onClick={generateSingleImage}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        }

        // PRODUCTION MODE UI
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {isGeneratingAI ? 'Creating Your Invitation' : 'Your Invitation'}
                  </h2>
                  <p className="text-gray-600">
                    {isGeneratingAI
                      ? 'AI is generating and verifying your invitation...'
                      : 'Your verified AI-generated invitation is ready!'}
                  </p>
                </div>

                {/* Loading State with Progress */}
                {isGeneratingAI && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                    {generationProgress && (
                      <>
                        <p className="text-gray-600 font-medium">
                          Attempt {generationProgress.attempt} of 7
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          {generationProgress.status === 'generating'
                            ? '🎨 Generating image...'
                            : '🔍 Verifying text accuracy...'}
                        </p>
                        {generationProgress.imageUrl && generationProgress.status === 'verifying' && (
                          <div className="mt-6 w-32 aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-200 shadow-md opacity-70">
                            <img
                              src={generationProgress.imageUrl}
                              alt="Verifying..."
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </>
                    )}
                    {!generationProgress && (
                      <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
                    )}
                  </div>
                )}

                {/* Verified Invite Display */}
                {!isGeneratingAI && selectedAiOption && (
                  <>
                    {/* Verification badge */}
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <ShieldCheck className="w-5 h-5" />
                        Text Verified ({selectedAiOption.verification?.passedChecks}/{selectedAiOption.verification?.totalChecks})
                        {selectedAiOption.verification?.attempts > 1 && (
                          <span className="text-green-600 ml-1">
                            • {selectedAiOption.verification.attempts} attempts
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main Invite Preview */}
                    <div className="flex justify-center mb-6">
                      <div
                        className="relative w-full max-w-[300px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-green-400 shadow-xl cursor-pointer group"
                        onClick={() => setPreviewImage(selectedAiOption)}
                      >
                        <img
                          src={selectedAiOption.imageUrl}
                          alt="Your Party Invitation"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Verified
                        </div>
                      </div>
                    </div>

                    {/* Party Details Summary */}
                    <div className="p-4 bg-gray-50 rounded-xl text-sm mb-6">
                      <div className="grid grid-cols-2 gap-2">
                        <div><span className="text-gray-500">Name:</span> <strong>{inviteData.childName}</strong></div>
                        <div><span className="text-gray-500">Age:</span> <strong>{inviteData.age}</strong></div>
                        <div><span className="text-gray-500">Date:</span> <strong>{formatDateForDisplay(inviteData.date)}</strong></div>
                        <div><span className="text-gray-500">Time:</span> <strong>{inviteData.time}</strong></div>
                        <div className="col-span-2"><span className="text-gray-500">Venue:</span> <strong>{inviteData.venue}</strong></div>
                      </div>
                    </div>

                    {/* Regenerate Button */}
                    <div className="text-center">
                      <Button
                        onClick={() => {
                          setGenerationProgress(null)
                          generateVerifiedInvite(7, (progress) => {
                            setGenerationProgress(progress)
                          })
                        }}
                        variant="outline"
                        disabled={isGeneratingAI}
                        className="text-sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate Different Design
                      </Button>
                    </div>
                  </>
                )}

                {/* No invite / failed state */}
                {!isGeneratingAI && !selectedAiOption && (
                  <div className="text-center py-12">
                    <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-amber-700 font-medium">Could not generate a verified invite</p>
                      <p className="text-amber-600 text-sm mt-1">
                        Try simplifying the venue address or try again
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setGenerationProgress(null)
                        generateVerifiedInvite(7, (progress) => {
                          setGenerationProgress(progress)
                        })
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  Ready to Save!
                </h2>

                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your invitation looks perfect! Click "Complete" below to save it and start sending to guests.
                </p>

                {/* Preview */}
                {selectedAiOption && (
                  <div className="mb-8">
                    <div className="relative w-full max-w-[280px] mx-auto aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                      <img
                        src={selectedAiOption.imageUrl}
                        alt="Your Party Invitation"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-primary-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Generated
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
    (currentStep === STEPS.CHOOSE_DESIGN && selectedAiOption && !isGeneratingAI)

  const isLoading = isSaving || isCompleting || isGeneratingAI

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
            <span className={currentStep >= STEPS.PARTY_DETAILS ? "text-primary-600 font-medium" : ""}>Details</span>
            <span>→</span>
            <span className={currentStep >= STEPS.CHOOSE_DESIGN ? "text-primary-600 font-medium" : ""}>Choose Design</span>
            <span>→</span>
            <span className={currentStep >= STEPS.COMPLETE ? "text-primary-600 font-medium" : ""}>Complete</span>
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
                  Saving...
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
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
        selectedAiOption={selectedAiOption}
        onRedirectToDashboard={handleRedirectToDashboard}
      />

      {/* Full-size Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
              <img
                src={previewImage.imageUrl}
                alt="Full size preview"
                className="w-full h-full object-cover"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Select button */}
            <div className="mt-4 flex justify-center gap-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  selectAiOption(previewImage)
                  setPreviewImage(null)
                }}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {selectedAiOption?.id === previewImage.id ? 'Selected' : 'Select This Design'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewImage(null)}
                className="bg-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleAIEinvitesPage
