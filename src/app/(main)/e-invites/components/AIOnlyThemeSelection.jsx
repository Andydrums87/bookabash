// components/AIOnlyThemeSelection.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

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
    <Card className="shadow-lg border-0 bg-white">
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-4">🎨</div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Generate AI Invitations
        </h2>
        
        <p className="text-gray-600 mb-6">
          Let AI create 5 personalized invitation designs for your party
        </p>

        <Button
          onClick={handleGenerateAI}
          disabled={isGeneratingAI || !inviteData.childName || !inviteData.age}
          className={`w-full py-3 text-lg font-bold rounded-xl transition-all duration-300 ${
            isGeneratingAI
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {isGeneratingAI ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2 inline-block" />
              Generate AI Invites
            </>
          )}
        </Button>

        {(!inviteData.childName || !inviteData.age) && (
          <p className="text-sm text-amber-600 mt-3">
            Please complete the form above first
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default AIOnlyThemeSelection