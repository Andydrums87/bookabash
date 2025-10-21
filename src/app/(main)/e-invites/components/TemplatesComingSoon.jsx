// components/TemplatesComingSoon.js
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Palette, ChevronDown, ChevronUp } from "lucide-react"

const TemplatesComingSoon = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm">
      <CardContent className="p-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
        >
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <div className="p-2 bg-gray-400 rounded-lg opacity-60">
              <Palette className="w-4 h-4 text-white" />
            </div>
            Pre-made Templates
          </h3>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {isOpen && (
          <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-60">🎨</div>
          <div className="text-xl font-bold text-gray-600 mb-2">Coming Soon!</div>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            We're working on beautiful pre-made templates that you can customize. 
            For now, enjoy our AI-powered invitation generation!
          </p>
          
          {/* Preview of coming features */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Princess', 'Superhero', 'Space', 'Dinosaur'].map((theme, index) => (
              <div key={theme} className="relative">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center opacity-40">
                  <div className="text-center">
                    <div className="text-lg mb-1">🎭</div>
                    <div className="text-xs font-medium text-gray-600">{theme}</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gray-500/20 rounded-lg flex items-center justify-center">
                  <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold">
                    Soon
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TemplatesComingSoon