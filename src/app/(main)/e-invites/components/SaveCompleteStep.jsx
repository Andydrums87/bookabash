// components/SaveCompleteStep.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Sparkles, Download, Share, Calendar } from "lucide-react"

const SaveCompleteStep = ({ 
  inviteData, 
  generatedImage, 
  selectedTheme, 
  selectedAiOption,
  onComplete 
}) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8 text-center">
        {/* Success Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Your AI Invitation is Ready! 🎉
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your beautiful AI-generated birthday invitation has been created and is ready to be saved to your dashboard.
        </p>

        {/* Preview of selected option */}
        {selectedAiOption && (
          <div className="mb-8">
            <div className="relative w-full max-w-[280px] mx-auto aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
              <img
                src={selectedAiOption.imageUrl || "/placeholder.svg"}
                alt="Selected AI Generated Invite"
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
        <div className="mb-8 p-6 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-xl border border-[hsl(var(--primary-200))]">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Party Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Child's Name:</span>
              <div className="text-gray-900 font-bold">{inviteData.childName}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Age:</span>
              <div className="text-gray-900 font-bold">{inviteData.age}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <div className="text-gray-900 font-bold">{inviteData.formattedDate || inviteData.date}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Time:</span>
              <div className="text-gray-900 font-bold">{inviteData.time}</div>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-700">Venue:</span>
              <div className="text-gray-900 font-bold">{inviteData.venue}</div>
            </div>
            {inviteData.message && (
              <div className="sm:col-span-2">
                <span className="font-medium text-gray-700">Special Message:</span>
                <div className="text-gray-900 font-bold italic">"{inviteData.message}"</div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-[hsl(var(--primary-100))] rounded-xl border border-[hsl(var(--primary-200))]">
          <h3 className="font-bold text-lg text-gray-900 mb-4">What happens next?</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span>Your invitation will be saved to your dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span>You can download or share it with guests</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span>Manage RSVPs and party planning from your dashboard</span>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <Button
          onClick={onComplete}
          className="w-full py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] text-white"
        >
          <CheckCircle className="w-5 h-5 mr-3" />
          Complete & Save to Dashboard
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          This will finalize your invitation and add it to your party planning dashboard
        </p>
      </CardContent>
    </Card>
  )
}

export default SaveCompleteStep