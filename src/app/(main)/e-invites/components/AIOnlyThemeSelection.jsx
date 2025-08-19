// components/AIOnlyThemeSelection.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2 } from "lucide-react"

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
    <Card className="shadow-xl border-0 bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[hsl(var(--primary-200))] to-transparent rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[hsl(var(--primary-300))] to-transparent rounded-full translate-y-10 -translate-x-10 opacity-40"></div>
      
      <CardContent className="p-8 text-center relative z-10">
        {isGeneratingAI ? (
          /* Full Video Display When Generating - Replace Everything */
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <video 
              src="https://res.cloudinary.com/dghzq6xtd/video/upload/v1755549617/GM7kil-hKfMk20WMnXZQn_output_glkjnb.mp4"
              autoPlay
              poster="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755548857/ChatGPT_Image_Aug_18_2025_09_27_29_PM_diq49r.png"
              loop
              muted
              playsInline
              className="w-full max-w-lg h-auto rounded-2xl shadow-2xl mb-6"
              onError={() => console.log('Video failed to load')}
            >
              {/* Fallback if video doesn't work */}
              <div className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-2xl">
                <div className="text-8xl animate-spin mb-6">🪄</div>
                <p className="text-2xl font-black text-[hsl(var(--primary-600))] animate-pulse">
                  Snappy's Working His Magic...
                </p>
                <p className="text-lg text-gray-600 mt-2 animate-pulse">
                  Creating amazing invitations just for you!
                </p>
              </div>
            </video>
            
            {/* Magic Working Indicator */}
            <div className="text-center">
              <p className="text-xl font-black text-[hsl(var(--primary-600))] animate-pulse mb-2">
                🪄 Snappy's Working His Magic... ✨
              </p>
              <p className="text-sm text-gray-600 animate-pulse">
                Creating 5 amazing invitation designs just for you!
              </p>
            </div>
          </div>
        ) : (
          /* Normal Component Display */
          <>
            {/* Snappy Image */}
            <div className="mb-6">
              <img 
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755548857/ChatGPT_Image_Aug_18_2025_09_27_29_PM_diq49r.png" 
                alt="Snappy the AI Wizard" 
                className="w-50 h-50 mx-auto mb-3 object-contain"
              />
            </div>
            
            <h2 className="text-2xl  font-black text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Wand2 className="w-6 h-6 text-[hsl(var(--primary-600))]" />
              Snappy's Magic Workshop
            </h2>
            
            <p className="text-gray-700 mb-8 text-lg font-medium leading-relaxed">
               He'll create <span className="font-bold text-[hsl(var(--primary-600))]">5 amazing invitation designs</span> perfectly crafted for {inviteData.childName ? `${inviteData.childName}'s` : 'your'} special party!
            </p>

            <Button
              onClick={handleGenerateAI}
              disabled={!inviteData.childName || !inviteData.age}
              className="w-full py-7 rounded-full text-xl font-black  transition-all duration-300 transform hover:scale-105 relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary-500))] via-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] hover:from-[hsl(var(--primary-600))] hover:via-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] text-white shadow-2xl hover:shadow-3xl border-0"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] animate-[shine_2s_infinite] pointer-events-none"></div>
              
              <div className="flex items-center justify-center relative z-10">
  
                <Wand2 className="w-6 h-6 mr-2" />
                <span className="font-black text-sm">Let Snappy Work His Magic!</span>

              </div>
            </Button>

            {(!inviteData.childName || !inviteData.age) && (
              <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <div className="flex items-center justify-center text-amber-700">
                  <span className="text-2xl mr-2">🐊</span>
                  <span className="text-sm font-bold">
                    Snappy needs the birthday star's name and age to work his magic!
                  </span>
                </div>
              </div>
            )}

            {/* Fun footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 font-medium">
                ✨ Powered by Snappy's AI Magic ✨
              </p>
            </div>
          </>
        )}
      </CardContent>

      {/* CSS for shine animation */}
      <style jsx>{`
        @keyframes shine {
          from { transform: translateX(-100%) skewX(-12deg); }
          to { transform: translateX(300%) skewX(-12deg); }
        }
      `}</style>
    </Card>
  )
}

export default AIOnlyThemeSelection