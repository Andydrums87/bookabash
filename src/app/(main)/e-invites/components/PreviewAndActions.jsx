// components/PreviewAndActions.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Link, AlertCircle } from "lucide-react"
import InvitePreview from "./InvitePreview" // Add this import

const PreviewAndActions = ({ 
  useAIGeneration,
  selectedAiOption,
  inviteData,
  selectedTheme,
  generatedImage,
  saveButtonState,
  saveInviteToPartyPlan,
  copyShareableLink,
  generateShareableLink,
  hasUnsavedChanges,
  themes,
  onLayoutSave
}) => {
  const renderPreview = () => {
    // Priority: AI selected option > Template preview > Loading/placeholder states
    
    if (selectedAiOption) {
      // Show selected AI option
      return (
        <div className="flex justify-center">
          <div className="relative w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
            <img
              src={selectedAiOption.imageUrl || "/placeholder.svg"}
              alt="Selected AI Generated Invite"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
              AI Option {selectedAiOption.index}
            </div>
          </div>
        </div>
      )
    } else if (selectedTheme && inviteData?.childName) {
      // Show template preview using new InvitePreview component
      return (
        <div className="flex justify-center">
          <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4]">
            <InvitePreview
              themeKey={selectedTheme}
              inviteData={inviteData}
            />
          </div>
        </div>
      )
    } else if (selectedTheme) {
      // Have theme but missing party data
      return (
        <div className="flex justify-center">
          <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl border-2 border-dashed border-yellow-300 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="text-center text-yellow-700">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="font-bold text-lg">Missing Party Details</div>
              <div className="text-sm">Go back to Step 1 to fill in party information</div>
            </div>
          </div>
        </div>
      )
    } else {
      // No theme selected yet
      return (
        <div className="flex justify-center">
          <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🎨</div>
              <div className="font-bold text-lg">Select a Theme</div>
              <div className="text-sm">Choose a theme above to see your invite preview</div>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Live Preview
          </h2>
          <div className="mb-6" data-invite-preview>
            {renderPreview()}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                saveInviteToPartyPlan()
                if (!generateShareableLink) generateShareableLink()
              }}
              className={`w-full font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${saveButtonState.className}`}
              disabled={saveButtonState.disabled}
            >
              {saveButtonState.icon}
              {saveButtonState.text}
            </Button>
            <Button
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 bg-transparent"
              onClick={copyShareableLink}
              disabled={!generatedImage}
            >
              <Link className="w-4 h-4 mr-2" />
              Copy Invite Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-3">
            {useAIGeneration
              ? "AI Generated Invite"
              : `Current Theme: ${themes[selectedTheme]?.name || selectedTheme}`}
          </h3>
          {useAIGeneration ? (
            <div className="relative w-full h-24 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))]">
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                🤖 AI Generated
              </div>
            </div>
          ) : (
            <div className="relative w-full h-24 mb-4 rounded-lg overflow-hidden">
              <img
                src={themes[selectedTheme]?.backgroundUrl || "/placeholder.jpg"}
                alt={themes[selectedTheme]?.name || selectedTheme}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}
          <div className="text-xs text-gray-500">
            Your invite will be automatically saved and can be used on your dashboard.
          </div>

          {hasUnsavedChanges && (
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-orange-700">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-xs font-bold">You have unsaved changes. Don't forget to save!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PreviewAndActions