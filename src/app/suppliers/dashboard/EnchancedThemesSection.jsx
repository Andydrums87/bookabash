"use client"

import { useState } from "react"
import { Sparkles, ChevronDown, ChevronUp, Plus, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionSave } from '@/components/ui/SectionSave';

const EnhancedThemesSection = ({ details, setDetails, onThemesChange, onSave, sectionState, isExpanded, onToggle, hideHeader = false }) => {
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [newCustomTheme, setNewCustomTheme] = useState("")

  // Get summary text for collapsed state
  const getSummary = () => {
    const themeCount = details.themes?.length || 0
    return themeCount > 0 ? `${themeCount} theme${themeCount !== 1 ? 's' : ''} selected` : 'None selected'
  }

  const popularThemes = [
    "Superhero",
    "Princess",
    "Unicorn",
    "Dinosaur",
    "Space",
    "Mermaid",
    "Pirate",
    "Fairy",
    "Animals",
    "Cars",
    "Football",
    "Rainbow",
    "Jungle Safari",
    "Under the Sea",
    "Frozen",
    "Harry Potter",
    "Minecraft",
    "LOL Surprise",
    "Paw Patrol",
    "Pokemon",
    "Marvel",
    "Disney",
    "Star Wars",
    "Peppa Pig",
    "Bluey",
    "Encanto",
  ]

  const handleThemeToggle = (theme) => {
    const currentThemes = details.themes || []
    const newThemes = currentThemes.includes(theme)
      ? currentThemes.filter((t) => t !== theme)
      : [...currentThemes, theme]

    setDetails((prev) => ({
      ...prev,
      themes: newThemes,
    }))

    // Call the change handler if provided
    if (onThemesChange) {
      onThemesChange(newThemes);
    }
  }

  const handleAddCustomTheme = () => {
    if (newCustomTheme.trim() && !details.themes?.includes(newCustomTheme.trim())) {
      const newThemes = [...(details.themes || []), newCustomTheme.trim()]
      setDetails((prev) => ({
        ...prev,
        themes: newThemes,
      }))
      
      // Call the change handler if provided
      if (onThemesChange) {
        onThemesChange(newThemes);
      }
      
      setNewCustomTheme("")
    }
  }

  const handleRemoveCustomTheme = (theme) => {
    const newThemes = (details.themes || []).filter((t) => t !== theme)
    setDetails((prev) => ({
      ...prev,
      themes: newThemes,
    }))

    // Call the change handler if provided
    if (onThemesChange) {
      onThemesChange(newThemes);
    }
  }

  const customThemes = (details.themes || []).filter((theme) => !popularThemes.includes(theme))

  // If hideHeader is true, render without the Card wrapper
  if (hideHeader) {
    return (
      <div className="space-y-6">
        {/* Popular Themes */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Popular Themes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {popularThemes.map((theme) => {
              const isSelected = details.themes?.includes(theme) || false
              return (
                <div
                  key={theme}
                  onClick={() => handleThemeToggle(theme)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[hsl(var(--primary-200))] bg-primary-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{theme}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-primary-600" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Custom Themes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Custom Themes</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Add Custom
            </Button>
          </div>

          {/* Add Custom Theme Form */}
          {showCustomForm && (
            <div className="flex gap-2 mb-4 p-3 sm:p-4 bg-primary-50 rounded-xl">
              <Input
                value={newCustomTheme}
                onChange={(e) => setNewCustomTheme(e.target.value)}
                placeholder="Enter custom theme name"
                className="flex-1 h-8 sm:h-10 text-sm sm:text-base"
                onKeyPress={(e) => e.key === "Enter" && handleAddCustomTheme()}
              />
              <Button
                type="button"
                onClick={handleAddCustomTheme}
                size="sm"
                className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
                disabled={!newCustomTheme.trim()}
              >
                Add
              </Button>
            </div>
          )}

          {/* Custom Themes List */}
          {customThemes.length > 0 && (
            <div className="space-y-2">
              {customThemes.map((theme) => (
                <div key={theme} className="flex items-center justify-between p-2 sm:p-3 bg-primary-50 rounded-lg">
                  <span className="text-sm sm:text-base font-medium text-gray-900">{theme}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomTheme(theme)}
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {customThemes.length === 0 && !showCustomForm && (
            <p className="text-xs sm:text-sm text-gray-500 italic">No custom themes added yet</p>
          )}
        </div>

        {/* Section Save Component - Only show if props are provided */}
        {onSave && sectionState && (
          <SectionSave
            sectionName="Party Themes"
            hasChanges={sectionState.hasChanges}
            onSave={onSave}
            saving={sectionState.saving}
            lastSaved={sectionState.lastSaved}
            error={sectionState.error}
          />
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader
        className="py-4 sm:py-6 bg-gradient-to-r from-primary-50 to-primary-100 cursor-pointer hover:from-primary-100 hover:to-primary-150 transition-colors"
        onClick={onToggle}
      >
        <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Party Themes You Offer
          </div>
          <div className="flex items-center gap-3">
            {!isExpanded && (
              <span className="text-sm font-normal text-gray-500">{getSummary()}</span>
            )}
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </CardTitle>
        {isExpanded && (
          <CardDescription className="text-sm sm:text-base">
            Select popular themes and add your own custom themes
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={`p-4 sm:p-8 space-y-6 sm:space-y-8 ${!isExpanded ? "hidden" : ""}`}>
        {/* Popular Themes */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Popular Themes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {popularThemes.map((theme) => {
              const isSelected = details.themes?.includes(theme) || false
              return (
                <div
                  key={theme}
                  onClick={() => handleThemeToggle(theme)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[hsl(var(--primary-200))] bg-primary-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{theme}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-primary-600" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Custom Themes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Custom Themes</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Add Custom
            </Button>
          </div>

          {/* Add Custom Theme Form */}
          {showCustomForm && (
            <div className="flex gap-2 mb-4 p-3 sm:p-4 bg-primary-50 rounded-xl">
              <Input
                value={newCustomTheme}
                onChange={(e) => setNewCustomTheme(e.target.value)}
                placeholder="Enter custom theme name"
                className="flex-1 h-8 sm:h-10 text-sm sm:text-base"
                onKeyPress={(e) => e.key === "Enter" && handleAddCustomTheme()}
              />
              <Button
                type="button"
                onClick={handleAddCustomTheme}
                size="sm"
                className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
                disabled={!newCustomTheme.trim()}
              >
                Add
              </Button>
            </div>
          )}

          {/* Custom Themes List */}
          {customThemes.length > 0 && (
            <div className="space-y-2">
              {customThemes.map((theme) => (
                <div key={theme} className="flex items-center justify-between p-2 sm:p-3 bg-primary-50 rounded-lg">
                  <span className="text-sm sm:text-base font-medium text-gray-900">{theme}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomTheme(theme)}
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {customThemes.length === 0 && !showCustomForm && (
            <p className="text-xs sm:text-sm text-gray-500 italic">No custom themes added yet</p>
          )}
        </div>

        {/* Selected Themes Summary */}
        {details.themes && details.themes.length > 0 && (
          <div className="p-3 sm:p-4 bg-primary-50 rounded-xl">
            <h5 className="font-medium text-primary-900 mb-2 text-sm sm:text-base">
              Selected Themes ({details.themes.length})
            </h5>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {details.themes.map((theme) => (
                <span key={theme} className="px-2 py-1 bg-primary-200 text-primary-800 rounded-full text-xs">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section Save Component - Only show if props are provided */}
        {onSave && sectionState && (
          <SectionSave
            sectionName="Party Themes"
            hasChanges={sectionState.hasChanges}
            onSave={onSave}
            saving={sectionState.saving}
            lastSaved={sectionState.lastSaved}
            error={sectionState.error}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default EnhancedThemesSection