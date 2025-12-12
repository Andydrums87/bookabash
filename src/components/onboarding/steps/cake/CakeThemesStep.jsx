"use client"

import { useState, useMemo } from "react"
import { Plus, X, Search } from "lucide-react"

// Theme options matching the home page dropdown
const CAKE_THEMES = [
  // Popular themes
  { value: "no-theme", label: "No theme - Keep it simple!", category: "Popular" },
  { value: "princess", label: "Princess", category: "Popular" },
  { value: "superhero", label: "Superhero", category: "Popular" },
  { value: "spiderman", label: "Spiderman", category: "Popular" },
  { value: "unicorn", label: "Unicorn Magic", category: "Popular" },
  { value: "dinosaur", label: "Dinosaur", category: "Popular" },
  { value: "pirate", label: "Pirate Adventure", category: "Popular" },
  { value: "mermaid", label: "Mermaid", category: "Popular" },
  { value: "taylor-swift", label: "Taylor Swift", category: "Popular" },

  // Adventure themes
  { value: "jungle", label: "Jungle Safari", category: "Adventure" },
  { value: "space", label: "Space Adventure", category: "Adventure" },
  { value: "underwater", label: "Underwater World", category: "Adventure" },
  { value: "treasure-hunt", label: "Treasure Hunt", category: "Adventure" },
  { value: "explorer", label: "Explorer Adventure", category: "Adventure" },

  // Fantasy themes
  { value: "fairy", label: "Fairy Tale", category: "Fantasy" },
  { value: "wizard", label: "Wizard & Magic", category: "Fantasy" },
  { value: "dragon", label: "Dragons & Knights", category: "Fantasy" },
  { value: "enchanted-forest", label: "Enchanted Forest", category: "Fantasy" },

  // Sports & Activities
  { value: "football", label: "Football Party", category: "Sports" },
  { value: "dance", label: "Dance Party", category: "Sports" },
  { value: "gymnastics", label: "Gymnastics Fun", category: "Sports" },
  { value: "martial-arts", label: "Martial Arts", category: "Sports" },
  { value: "swimming", label: "Swimming Party", category: "Sports" },

  // Creative themes
  { value: "art-craft", label: "Art & Craft", category: "Creative" },
  { value: "cooking", label: "Cooking Party", category: "Creative" },
  { value: "science", label: "Science Lab", category: "Creative" },
  { value: "music", label: "Music & Karaoke", category: "Creative" },
  { value: "photography", label: "Photography Fun", category: "Creative" },

  // Seasonal themes
  { value: "halloween", label: "Halloween Spooky", category: "Seasonal" },
  { value: "christmas", label: "Christmas Magic", category: "Seasonal" },
  { value: "easter", label: "Easter Celebration", category: "Seasonal" },
  { value: "summer", label: "Summer Beach", category: "Seasonal" },
  { value: "winter", label: "Winter Wonderland", category: "Seasonal" },

  // Character themes
  { value: "paw-patrol", label: "Paw Patrol", category: "Characters" },
  { value: "frozen", label: "Frozen", category: "Characters" },
  { value: "peppa-pig", label: "Peppa Pig", category: "Characters" },
  { value: "minecraft", label: "Minecraft", category: "Characters" },
  { value: "pokemon", label: "Pokemon", category: "Characters" },
  { value: "disney", label: "Disney Magic", category: "Characters" },

  // Classic themes
  { value: "circus", label: "Circus Fun", category: "Classic" },
  { value: "carnival", label: "Carnival", category: "Classic" },
  { value: "tea-party", label: "Tea Party", category: "Classic" },
  { value: "garden-party", label: "Garden Party", category: "Classic" },
  { value: "movie-night", label: "Movie Night", category: "Classic" }
]

const PREDEFINED_VALUES = CAKE_THEMES.map(t => t.value)

const CATEGORY_ORDER = ["Popular", "Characters", "Adventure", "Fantasy", "Sports", "Creative", "Seasonal", "Classic"]

export default function CakeThemesStep({ themes = [], onChange }) {
  const [selected, setSelected] = useState(
    Array.isArray(themes) ? themes : []
  )
  const [customInput, setCustomInput] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Separate predefined and custom themes
  const customThemes = selected.filter(t => !PREDEFINED_VALUES.includes(t))

  // Filter themes based on search query
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return CAKE_THEMES
    const query = searchQuery.toLowerCase()
    return CAKE_THEMES.filter(theme =>
      theme.label.toLowerCase().includes(query) ||
      theme.value.toLowerCase().includes(query) ||
      theme.category.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Group filtered themes by category
  const filteredByCategory = useMemo(() => {
    return filteredThemes.reduce((acc, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = []
      }
      acc[theme.category].push(theme)
      return acc
    }, {})
  }, [filteredThemes])

  const handleToggle = (themeValue) => {
    const newSelected = selected.includes(themeValue)
      ? selected.filter(t => t !== themeValue)
      : [...selected, themeValue]

    setSelected(newSelected)
    onChange(newSelected)
  }

  const handleAddCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !selected.includes(trimmed)) {
      const newSelected = [...selected, trimmed]
      setSelected(newSelected)
      onChange(newSelected)
      setCustomInput("")
      setShowCustomInput(false)
    }
  }

  const handleRemoveCustom = (theme) => {
    const newSelected = selected.filter(t => t !== theme)
    setSelected(newSelected)
    onChange(newSelected)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustom()
    } else if (e.key === 'Escape') {
      setShowCustomInput(false)
      setCustomInput("")
    }
  }

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Party themes
        </h1>
        <p className="text-lg text-gray-600">
          Which party themes does this cake suit?
        </p>
      </div>

      {/* Search input */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search themes..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {searchQuery ? (
          // Show flat list when searching
          filteredThemes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredThemes.map(theme => {
                const isSelected = selected.includes(theme.value)
                return (
                  <div
                    key={theme.value}
                    onClick={() => handleToggle(theme.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white border-white' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{theme.label}</span>
                      <span className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>{theme.category}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No themes found matching "{searchQuery}"</p>
          )
        ) : (
          // Show categorized list when not searching
          CATEGORY_ORDER.map(category => {
            const categoryThemes = filteredByCategory[category]
            if (!categoryThemes || categoryThemes.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoryThemes.map(theme => {
                    const isSelected = selected.includes(theme.value)
                    return (
                      <div
                        key={theme.value}
                        onClick={() => handleToggle(theme.value)}
                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          isSelected
                            ? 'bg-gray-900 border-gray-900 text-white'
                            : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-white border-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-sm">{theme.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        {/* Custom themes section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Custom
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Custom themes that have been added */}
            {customThemes.map(theme => (
              <div
                key={theme}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border-2 border-gray-900 text-white"
              >
                <div className="w-5 h-5 rounded border-2 bg-white border-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-sm flex-1">{theme}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveCustom(theme)
                  }}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add custom button or input */}
            {showCustomInput ? (
              <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-gray-900 bg-white">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter theme..."
                  className="flex-1 text-gray-900 font-medium text-sm bg-transparent outline-none placeholder-gray-400"
                  autoFocus
                />
                <button
                  onClick={handleAddCustom}
                  disabled={!customInput.trim()}
                  className="p-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomInput("")
                  }}
                  className="p-1.5 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setShowCustomInput(true)}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium text-sm">Add other</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-8">
          {selected.length} theme{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}

      <p className="text-center text-sm text-gray-400 mt-4">
        This helps match your cake to themed parties
      </p>
    </div>
  )
}

export { CAKE_THEMES, CATEGORY_ORDER }
