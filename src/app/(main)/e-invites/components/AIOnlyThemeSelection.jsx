// components/AIOnlyThemeSelection.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2, Clock, Palette } from "lucide-react"

const AIOnlyThemeSelection = ({ 
  generateAIOptions, 
  isGeneratingAI, 
  selectedAiOption,
  inviteData 
}) => {
  const handleGenerateAI = () => {
    if (!inviteData.childName || !inviteData.age) {
      alert("Please fill in the child's name and age first!")
      return
    }
    generateAIOptions()
  }

  return (
    <div className="space-y-6">
      {/* AI Generation Card */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI-Powered Invite Generation
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Let our AI create stunning, personalized birthday invitations for you! 
            Simply click generate and choose from 5 unique designs tailored to your party details.
          </p>

          {/* AI Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Wand2 className="w-5 h-5 text-primary-600" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">Smart Design</div>
                <div className="text-gray-600">AI-crafted layouts</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Clock className="w-5 h-5 text-primary-600" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">Instant Results</div>
                <div className="text-gray-600">Generated in seconds</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Palette className="w-5 h-5 text-primary-600" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">5 Options</div>
                <div className="text-gray-600">Choose your favorite</div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateAI}
            disabled={isGeneratingAI || !inviteData.childName || !inviteData.age}
            className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
              isGeneratingAI
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] text-white'
            }`}
          >
            {isGeneratingAI ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating AI Invites...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                Generate 5 AI Invite Options
              </>
            )}
          </Button>

          {(!inviteData.childName || !inviteData.age) && (
            <p className="text-center text-sm text-[hsl(var(--primary-700))] mt-3 font-medium">
              ⚠️ Please fill in child's name and age in the form above first
            </p>
          )}

       
        </CardContent>
      </Card>
    </div>
  )
}

export default AIOnlyThemeSelection