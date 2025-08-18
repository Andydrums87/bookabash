// components/SaveCompleteStep.js

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Sparkles, Calendar } from "lucide-react"

const SaveCompleteStep = ({ 
  inviteData, 
  generatedImage, 
  selectedTheme, 
  selectedAiOption
}) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8 text-center">
        {/* Ready Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-teal-500 rounded-full">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Ready to Save! 🎉
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your AI-generated birthday invitation looks perfect! Click "Complete" below to save it to your dashboard.
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
        {/* <div className="mb-8 p-6 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-xl border border-[hsl(var(--primary-200))]">
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
        </div> */}

        {/* What happens next */}
        {/* <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-[hsl(var(--primary-50))] rounded-xl border border-blue-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4">What happens when you complete?</h3>
          <div className="text-sm text-gray-700 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <span>Your AI invitation will be uploaded to Cloudinary for high-quality storage</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <span>The invitation will be saved to your party dashboard</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <span>A shareable link will be created for sending to guests</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
              <span>You'll be redirected to your dashboard to manage the invitation</span>
            </div>
          </div>
        </div> */}

        {/* Call to action - points to wizard navigation */}
        <div className="p-4 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-xl border border-[hsl(var(--primary-200))]">
          <p className="text-sm font-medium text-gray-700">
            🎯 Click the <strong>"Complete"</strong> button below to finalize your invitation!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SaveCompleteStep