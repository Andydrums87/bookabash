import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Link, AlertCircle, ImageIcon } from 'lucide-react'

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
    if (selectedAiOption) {
      return (
        <div className="flex justify-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[350px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
            <img
              src={selectedAiOption.imageUrl || "/placeholder.png"}
              alt="Selected AI Generated Invite"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
              AI Option {selectedAiOption.index}
            </div>
          </div>
        </div>
      )
    } else {
      // Empty slot - don't try to render templates
      return (
        <div className="flex justify-center">
          <div className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[350px] aspect-[3/4] rounded-xl border-2 border-dashed border-[hsl(var(--primary-300))] flex items-center justify-center ">
            <div className="text-center text-primary-600 p-4">
              <div className="text-4xl sm:text-5xl mb-4">
              <img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291833/ctcf51iyrrhfv6y481dl.jpg"
              alt="Selected AI Generated Invite"
              className="w-full h-full object-cover"
            />
              </div>
     
              <div className="text-xs sm:text-sm opacity-80 mt-2 text-gray-900">
                Generate AI options to see your invitation here
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Preview Card - Always visible on mobile, no toggle needed */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Live Preview
          </h2>
          
          <div className="mb-4 sm:mb-6" data-invite-preview>
            {renderPreview()}
          </div>

   
        </CardContent>
      </Card>
    </div>
  )
}

export default PreviewAndActions