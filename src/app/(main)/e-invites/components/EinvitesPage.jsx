"use client"

import { useEffect, useState, useRef } from "react"
import { themes } from "@/lib/themes"

// Import all components
import HeroSection from "./HeroSection"
import WizardProgress from "./WizardProgress"
import WizardNavigation from "./WizardNavigation"
import AIOnlyThemeSelection from "./AIOnlyThemeSelection"
import AIOptionsSelection from "./AIOptionsSelection"
import PartyDetailsForm from "./PartyDetailsForm"
import PreviewAndActions from "./PreviewAndActions"
import SaveCompleteStep from "./SaveCompleteStep"
import TemplatesComingSoon from "./TemplatesComingSoon"
import SuccessModal from "./SuccessModal"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

// Import custom hooks
import { useInviteData } from "../hooks/useInviteData"
import { useGuestManagement } from "../hooks/useGuestManagement"
import { useAIGen } from "../hooks/useAIGen"
import { useSaveState } from "../hooks/useSaveState"
import { useWizardSteps, WIZARD_STEPS } from "../hooks/useWizardSteps"

// Import utils
import { formatDateForDisplay, getBirthdayColor } from "../utils/helperFunctions"
import { getHeadlineText, getHeadlineStyles } from "../utils/headlineUtils"
import { uploadFinalInvite } from "../utils/cloudinaryInviteUpload"

const EInvitesPage = ({ onSaveSuccess }) => {
  const canvasRef = useRef(null)

  // Custom hooks for state management
  const {
    selectedTheme,
    setSelectedTheme,
    inviteData,
    setInviteData,
    generatedImage,
    setGeneratedImage,
    handleInputChange,
  } = useInviteData()

  const {
    isGeneratingAI,
    useAIGeneration,
    setUseAIGeneration,
    aiOptions,
    selectedAiOption,
    showAiOptions,
    generateAIInvite,
    generateAIOptions,
    selectAiOption,
  } = useAIGen(inviteData, selectedTheme, setGeneratedImage)

  const {
    guestList,
    setGuestList,
    newGuest,
    setNewGuest,
    addGuest,
    removeGuest,
    sendViaWhatsApp,
    sendViaEmail,
    sendToAllPending,
    updateNewGuest,
  } = useGuestManagement(inviteData)

  const {
    isSaved,
    setIsSaved,
    hasUnsavedChanges,
    lastSavedState,
    setLastSavedState,
    shareableLink,
    setShareableLink,
    isSaving,
    saveSuccess,
    setSaveSuccess,
    generateShareableLink,
    copyShareableLink,
    saveInviteToPartyPlan,
    getSaveButtonState,
  } = useSaveState(selectedTheme, inviteData, guestList, generatedImage, true, themes) // Force AI mode

  // Wizard state management
  const wizard = useWizardSteps(inviteData, generatedImage)

  // Enhanced invite data for preview
  const enhancedInviteData = {
    ...inviteData,
    headlineText: getHeadlineText(inviteData, selectedTheme),
    formattedDate: formatDateForDisplay(inviteData.date),
    headlineStyles: getHeadlineStyles(inviteData.headline, selectedTheme),
    birthdayColor: getBirthdayColor(selectedTheme),
  }

  const saveButtonState = getSaveButtonState()

  const [saveResult, setSaveResult] = useState(null)

  const handleSaveInvite = async (finalCloudinaryUrl = null) => {
    const imageToSave = finalCloudinaryUrl || generatedImage
    // Pass selectedAiOption to the save function and handle result
    const result = await saveInviteToPartyPlan(imageToSave, selectedAiOption)
    
    if (result && result.success) {
      setSaveResult(result)
      // Don't generate shareable link here as it's handled in save function
    }
  }

  const handleRedirectToDashboard = () => {
    window.location.href = '/dashboard'
  }

  const handleCloseSuccessModal = () => {
    setSaveSuccess(false)
    setSaveResult(null)
  }

  const handleComplete = async () => {
    try {
      console.log("🚀 Starting final invite completion...")
      console.log("📊 Selected AI Option:", selectedAiOption)
      console.log("📝 Invite Data:", inviteData)
      
      if (!selectedAiOption) {
        alert("Please select an AI option first!")
        return
      }
      
      const cloudinaryResult = await uploadFinalInvite(selectedAiOption, selectedTheme, inviteData)
      console.log("✅ Cloudinary result:", cloudinaryResult)
      
      // Pass selectedAiOption to the save function and handle result
      const result = await saveInviteToPartyPlan(cloudinaryResult.url, selectedAiOption)
      
      if (result && result.success) {
        setSaveResult(result)
        // Success modal will be shown automatically via saveSuccess state
      }
    } catch (error) {
      console.error("❌ Complete failed:", error)
    }
  }

  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case WIZARD_STEPS.PARTY_DETAILS:
        return (
          <div className="max-w-4xl mx-auto">
            <PartyDetailsForm
              inviteData={inviteData}
              handleInputChange={handleInputChange}
              selectedTheme={selectedTheme}
              useAIGeneration={true} // Force AI mode
            />
          </div>
        )
  
      case WIZARD_STEPS.CREATE_INVITE:
        return (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              {/* AI Generation Only */}
              <div className="lg:col-span-2 space-y-6">
                <AIOnlyThemeSelection
                  generateAIOptions={generateAIOptions}
                  isGeneratingAI={isGeneratingAI}
                  selectedAiOption={selectedAiOption}
                  inviteData={inviteData}
                />
                
                <AIOptionsSelection
                  showAiOptions={showAiOptions}
                  aiOptions={aiOptions}
                  selectedAiOption={selectedAiOption}
                  selectAiOption={selectAiOption}
                  generateAIOptions={generateAIOptions}
                  isGeneratingAI={isGeneratingAI}
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                />

                {/* Templates Coming Soon Card */}
                <TemplatesComingSoon />
              </div>
  
              {/* Preview - Mobile: Full width, Desktop: Sidebar */}
              <div className="order-first lg:order-last">
                <PreviewAndActions
                  useAIGeneration={true} // Force AI mode
                  selectedAiOption={selectedAiOption}
                  inviteData={enhancedInviteData}
                  selectedTheme={selectedTheme}
                  generatedImage={generatedImage}
                  saveButtonState={saveButtonState}
                  saveInviteToPartyPlan={handleSaveInvite}
                  copyShareableLink={copyShareableLink}
                  generateShareableLink={generateShareableLink}
                  hasUnsavedChanges={hasUnsavedChanges}
                  themes={themes}
                  onLayoutSave={() => {}}
                />
              </div>
            </div>
          </div>
        )
  
      case WIZARD_STEPS.SAVE_COMPLETE:
        return (
          <div className="max-w-2xl mx-auto">
            <SaveCompleteStep 
              inviteData={enhancedInviteData}
              generatedImage={generatedImage}
              selectedTheme={selectedTheme}
              selectedAiOption={selectedAiOption}
              onComplete={handleComplete}
            />
          </div>
        )
  
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] pb-20">
      <ContextualBreadcrumb currentPage="e-invites" />

      {/* Only show hero on first step */}
      {wizard.currentStep === WIZARD_STEPS.PARTY_DETAILS && <HeroSection />}

      {/* Wizard Progress */}
      <WizardProgress
        currentStep={wizard.currentStep}
        allSteps={wizard.allSteps}
        getStepStatus={wizard.getStepStatus}
        goToStep={wizard.goToStep}
        getProgress={wizard.getProgress}
      />

      {/* Step Content */}
      <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderStepContent()}
      </div>

      {/* Wizard Navigation - Sticky bottom */}
      <WizardNavigation
        currentStep={wizard.currentStep}
        canGoBack={wizard.canGoBack}
        canProceedToNext={wizard.canProceedToNext}
        prevStep={wizard.prevStep}
        nextStep={wizard.nextStep}
        getValidationErrors={wizard.getValidationErrors}
        stepConfig={wizard.stepConfig}
        onComplete={handleComplete}
        isSaving={isSaving}
        selectedAiOption={selectedAiOption}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} width={600} height={800} />
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={saveSuccess}
        onClose={handleCloseSuccessModal}
        saveResult={saveResult}
        inviteData={enhancedInviteData}
        selectedAiOption={selectedAiOption}
        onRedirectToDashboard={handleRedirectToDashboard}
      />
    </div>
  )
}

export default EInvitesPage