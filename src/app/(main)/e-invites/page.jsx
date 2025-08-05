"use client"

import { useEffect, useRef } from "react"
import { themes } from "@/lib/themes"

// Import all components
import Breadcrumb from "./components/Breadcrumb"
import HeroSection from "./components/HeroSection"
import WizardProgress from "./components/WizardProgress"
import WizardNavigation from "./components/WizardNavigation"
import UnifiedThemeSelection from "./components/UnifiedThemeSelection"
import AIOptionsSelection from "./components/AIOptionsSelection"
import PartyDetailsForm from "./components/PartyDetailsForm"
import GuestManagement from "./components/GuestManagement"
import PreviewAndActions from "./components/PreviewAndActions"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

// Import custom hooks
import { useInviteData } from "./hooks/useInviteData"
import { useGuestManagement } from "./hooks/useGuestManagement"
import { useAIGen } from "./hooks/useAIGen"
import { useSaveState } from "./hooks/useSaveState"
import { useWizardSteps, WIZARD_STEPS } from "./hooks/useWizardSteps"

// Import utils
import { formatDateForDisplay, getBirthdayColor } from "./utils/helperFunctions"
import { getHeadlineText, getHeadlineStyles } from "./utils/headlineUtils"
import { uploadFinalInvite } from "./utils/cloudinaryInviteUpload"

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
    generateShareableLink,
    copyShareableLink,
    saveInviteToPartyPlan,
    getSaveButtonState,
  } = useSaveState(selectedTheme, inviteData, guestList, generatedImage, useAIGeneration, themes)

  // Wizard state management
  const wizard = useWizardSteps(inviteData, generatedImage)

  // Generate template invite
  const generateInvite = async () => {
    if (useAIGeneration) {
      return // AI generation handled separately
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const theme = themes[selectedTheme]
      const inviteDetails = {
        type: "template",
        theme: selectedTheme,
        backgroundUrl: theme.backgroundUrl,
        inviteData,
        timestamp: Date.now(),
      }

      setGeneratedImage(JSON.stringify(inviteDetails))
      console.log("✅ Template invite generated successfully")
    } catch (error) {
      console.error("Error generating invite:", error)
    }
  }

  // Generate invite when theme or data changes (template mode only)
  useEffect(() => {

    if (wizard.currentStep === WIZARD_STEPS.CREATE_INVITE && selectedTheme && !selectedAiOption) {
      generateInvite()
    }
  }, [selectedTheme, inviteData, wizard.currentStep, selectedAiOption])

  // Enhanced invite data for preview
  const enhancedInviteData = {
    ...inviteData,
    headlineText: getHeadlineText(inviteData, selectedTheme),
    formattedDate: formatDateForDisplay(inviteData.date),
    headlineStyles: getHeadlineStyles(inviteData.headline, selectedTheme),
    birthdayColor: getBirthdayColor(selectedTheme),
  }

  const saveButtonState = getSaveButtonState()

  const handleSaveInvite = (finalCloudinaryUrl = null) => {
    // Use Cloudinary URL if provided (from Complete), otherwise use current generatedImage
    const imageToSave = finalCloudinaryUrl || generatedImage
    saveInviteToPartyPlan(onSaveSuccess, imageToSave)
    if (!shareableLink) generateShareableLink()
  }

  const handleLayoutSave = (customLayout) => {
    console.log("Custom layout saved:", customLayout)
  }

  const handleComplete = async () => {
    try {
      console.log("🚀 Starting final invite completion...")
      
      const cloudinaryResult = await uploadFinalInvite(selectedAiOption, selectedTheme, inviteData)
      console.log("✅ Cloudinary result:", cloudinaryResult)
      
      console.log("💾 About to call saveInviteToPartyPlan...")
      const success = await saveInviteToPartyPlan(cloudinaryResult.url)
      console.log("💾 saveInviteToPartyPlan result:", success)
      
      if (success) {
        console.log("✅ Save reported success")
        alert("🎉 Your invitation has been completed and saved!")
      } else {
        console.error("❌ Save reported failure")
      }
  
    } catch (error) {
      console.error("❌ Complete failed:", error)
    }
  }

  // Render step content based on current step
  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case WIZARD_STEPS.PARTY_DETAILS:
        return (
          <div className="max-w-4xl mx-auto">
            <PartyDetailsForm
              inviteData={inviteData}
              handleInputChange={handleInputChange}
              selectedTheme={selectedTheme}
              useAIGeneration={false} // Don't show headline options in step 1
            />
          </div>
        )

      case WIZARD_STEPS.CREATE_INVITE:
        return (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Unified Theme/AI Selection */}
              <div className="lg:col-span-2 space-y-6">
                <UnifiedThemeSelection
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  themes={themes}
                  generateAIOptions={generateAIOptions}
                  isGeneratingAI={isGeneratingAI}
                  generateInvite={generateInvite}
                  selectedAiOption={selectedAiOption}
                  clearAiSelection={selectAiOption}
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
              </div>

              {/* Right Column - Live Preview */}
              <div>
                <PreviewAndActions
                  useAIGeneration={useAIGeneration}
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
                  onLayoutSave={handleLayoutSave}
                />
              </div>
            </div>
          </div>
        )

      case WIZARD_STEPS.GUEST_MANAGEMENT:
        return (
          <div className="max-w-4xl mx-auto">
            <GuestManagement
              guestList={guestList}
              newGuest={newGuest}
              updateNewGuest={updateNewGuest}
              addGuest={addGuest}
              removeGuest={removeGuest}
              sendViaWhatsApp={sendViaWhatsApp}
              sendViaEmail={sendViaEmail}
              sendToAllPending={sendToAllPending}
              copyShareableLink={copyShareableLink}
              generatedImage={generatedImage}
              shareableLink={shareableLink}
            />
          </div>
        )

      case WIZARD_STEPS.REVIEW_SHARE:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Final Preview */}
              <div>
                <PreviewAndActions
                  useAIGeneration={useAIGeneration}
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
                  onLayoutSave={handleLayoutSave}
                />
              </div>

              {/* Summary & Actions */}
              <div className="space-y-6">
                {/* Party Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Party Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="font-medium">Child:</span> {inviteData.childName}, {inviteData.age} years old</div>
                    <div><span className="font-medium">Date:</span> {formatDateForDisplay(inviteData.date)}</div>
                    <div><span className="font-medium">Time:</span> {inviteData.time}</div>
                    <div><span className="font-medium">Venue:</span> {inviteData.venue}</div>
                    <div><span className="font-medium">Theme:</span> {useAIGeneration ? "AI Generated" : themes[selectedTheme]?.name}</div>
                  </div>
                </div>

                {/* Guest Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Guest List</h3>
                  <div className="text-sm">
                    <div className="mb-2"><span className="font-medium">Total Guests:</span> {guestList.length}</div>
                    <div className="mb-2"><span className="font-medium">Invites Sent:</span> {guestList.filter(g => g.status === 'sent').length}</div>
                    <div><span className="font-medium">Pending:</span> {guestList.filter(g => g.status === 'pending').length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
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
      <div className="px-3 sm:px-6 lg:px-8 py-8">
        {renderStepContent()}
      </div>

      {/* Wizard Navigation */}
      <WizardNavigation
        currentStep={wizard.currentStep}
        canGoBack={wizard.canGoBack}
        canProceedToNext={wizard.canProceedToNext}
        prevStep={wizard.prevStep}
        nextStep={wizard.nextStep}
        getValidationErrors={wizard.getValidationErrors}
        stepConfig={wizard.stepConfig}
        onComplete={handleComplete}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} width={600} height={800} />
    </div>
  )
}

export default EInvitesPage