"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search, X, UsersIcon, RefreshCw, Sparkles, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ACTIVITY_TYPES, getThemeDisplayName, buildCompoundTheme, isPerformanceParty } from "@/utils/compoundTheme"

// Theme recommendations based on age and gender
// Structure: { gender: { ageGroup: [themes] } }
const THEME_RECOMMENDATIONS = {
  boy: {
    toddler: ['dinosaur', 'safari', 'pirate'], // Ages 1-2
    young: ['dinosaur', 'superhero', 'pirate', 'spiderman'], // Ages 3-5
    older: ['superhero', 'spiderman', 'space', 'science'] // Ages 6+
  },
  girl: {
    toddler: ['princess', 'unicorn', 'safari'], // Ages 1-2
    young: ['princess', 'unicorn', 'mermaid', 'frozen'], // Ages 3-5
    older: ['mermaid', 'frozen', 'unicorn', 'kpop-demon-hunters'] // Ages 6+
  },
  neutral: {
    toddler: ['safari', 'dinosaur', 'unicorn'], // Ages 1-2
    young: ['safari', 'pirate', 'space', 'science'], // Ages 3-5
    older: ['space', 'science', 'pirate', 'safari'] // Ages 6+
  }
}

// Theme display names and images for showing in the modal
const THEME_DISPLAY_NAMES = {
  dinosaur: { label: 'Dinosaur', emoji: '🦕', image: '/choose-for-me/dinosaur.webp' },
  safari: { label: 'Safari', emoji: '🦁', image: '/choose-for-me/safari.webp' },
  pirate: { label: 'Pirate Adventure', emoji: '🏴‍☠️', image: '/choose-for-me/pirate.webp' },
  princess: { label: 'Princess', emoji: '👸', image: '/choose-for-me/princess.webp' },
  unicorn: { label: 'Unicorn Magic', emoji: '🦄', image: '/choose-for-me/unicorn.webp' },
  mermaid: { label: 'Mermaid', emoji: '🧜‍♀️', image: '/choose-for-me/mermaid.webp' },
  frozen: { label: 'Frozen', emoji: '❄️', image: '/choose-for-me/frozen.webp' },
  superhero: { label: 'Superhero', emoji: '🦸', image: '/choose-for-me/superhero.webp' },
  spiderman: { label: 'Spiderman', emoji: '🕷️', image: '/choose-for-me/spiderman.webp' },
  space: { label: 'Space Adventure', emoji: '🚀', image: '/choose-for-me/space.webp' },
  science: { label: 'Science Lab', emoji: '🔬', image: '/choose-for-me/science.webp' },
  'kpop-demon-hunters': { label: 'K-Pop Demon Hunters', emoji: '🎤', image: '/choose-for-me/kpop.webp' }
}

// Get age group from age
const getAgeGroup = (age) => {
  if (age <= 2) return 'toddler'
  if (age <= 5) return 'young'
  return 'older'
}

// Get a random theme recommendation based on age and gender
const getRandomTheme = (age, gender) => {
  const ageGroup = getAgeGroup(age)
  const themes = THEME_RECOMMENDATIONS[gender]?.[ageGroup] || THEME_RECOMMENDATIONS.neutral[ageGroup]
  return themes[Math.floor(Math.random() * themes.length)]
}

const eventTypes = [

  // Undecided option - shows gender picker modal
  { value: "undecided", label: "Choose for me", category: "Not Sure?" },

  // Popular themes
  { value: "princess", label: "Princess", category: "Popular" },
  { value: "superhero", label: "Superhero", category: "Popular" },

  { value: "unicorn", label: "Unicorn Magic", category: "Popular" },
  { value: "dinosaur", label: "Dinosaur", category: "Popular" },
 
  { value: "pirate", label: "Pirate Adventure", category: "Popular" },
  { value: "mermaid", label: "Mermaid", category: "Popular" },

  { value: "kpop-demon-hunters", label: "K-Pop Demon Hunters", category: "Popular" },
  { value: "spiderman", label: "Spiderman", category: "Popular" },
  { value: "frozen", label: "Frozen", category: "Popular" },


  // Adventure themes
  { value: "jungle", label: "Jungle Safari", category: "Adventure" },
  { value: "space", label: "Space Adventure", category: "Adventure" },
  // { value: "underwater", label: "Underwater World", category: "Adventure" },
  // { value: "treasure-hunt", label: "Treasure Hunt", category: "Adventure" },
  // { value: "explorer", label: "Explorer Adventure", category: "Adventure" },

  // Fantasy themes
  // { value: "fairy", label: "Fairy Tale", category: "Fantasy" },
  // { value: "wizard", label: "Wizard & Magic", category: "Fantasy" },
  // { value: "dragon", label: "Dragons & Knights", category: "Fantasy" },
  { value: "mermaid", label: "Mermaid & Ocean", category: "Fantasy" },
  // { value: "enchanted-forest", label: "Enchanted Forest", category: "Fantasy" },

  // Sports & Activities
  // { value: "football", label: "Football Party", category: "Sports" },
  // { value: "dance", label: "Dance Party", category: "Sports" },
  // { value: "gymnastics", label: "Gymnastics Fun", category: "Sports" },
  // { value: "martial-arts", label: "Martial Arts", category: "Sports" },
  // { value: "swimming", label: "Swimming Party", category: "Sports" },

  // Performance Parties
  { value: "drama-party", label: "Drama Party", category: "Performance Parties" },
  { value: "dance-party", label: "Dance Party", category: "Performance Parties" },
  { value: "music-party", label: "Music Party", category: "Performance Parties" },

  // Creative themes
  // { value: "art-craft", label: "Art & Craft", category: "Creative" },
  // { value: "cooking", label: "Cooking Party", category: "Creative" },
  { value: "science", label: "Science Lab", category: "Creative" },
  // { value: "music", label: "Music & Karaoke", category: "Creative" },
  // { value: "photography", label: "Photography Fun", category: "Creative" },

  // Seasonal themes
  // { value: "halloween", label: "Halloween Spooky", category: "Seasonal" },
  // { value: "christmas", label: "Christmas Magic", category: "Seasonal" },
  // { value: "easter", label: "Easter Celebration", category: "Seasonal" },
  // { value: "summer", label: "Summer Beach", category: "Seasonal" },
  // { value: "winter", label: "Winter Wonderland", category: "Seasonal" },

  // Character themes
  // { value: "paw-patrol", label: "Paw Patrol", category: "Characters" },
  // { value: "frozen", label: "Frozen", category: "Characters" },
  // { value: "peppa-pig", label: "Peppa Pig", category: "Characters" },
  // { value: "minecraft", label: "Minecraft", category: "Characters" },
  // { value: "pokemon", label: "Pokemon", category: "Characters" },
  // { value: "disney", label: "Disney Magic", category: "Characters" },

  // Classic themes
  // { value: "circus", label: "Circus Fun", category: "Classic" },
  // { value: "carnival", label: "Carnival", category: "Classic" },
  // { value: "tea-party", label: "Tea Party", category: "Classic" },
  // { value: "garden-party", label: "Garden Party", category: "Classic" },
  // { value: "movie-night", label: "Movie Night", category: "Classic" }
]

export default function SearchableEventTypeSelect({
  defaultValue = "",
  onValueChange,
  placeholder = "Choose event type",
  isDemo = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState([])
  const [itemRipples, setItemRipples] = useState([])
  const [showThemePickerModal, setShowThemePickerModal] = useState(false)
  const [showSubThemeModal, setShowSubThemeModal] = useState(false)
  const [pendingActivityType, setPendingActivityType] = useState(null)
  const [pickerStep, setPickerStep] = useState('age') // 'age' | 'gender' | 'result'
  const [pickerAge, setPickerAge] = useState(null)
  const [pickerGender, setPickerGender] = useState(null)
  const [recommendedTheme, setRecommendedTheme] = useState(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const buttonRef = useRef(null)

  // Demo mode ripple effect for trigger button
  const createRipple = (e) => {
    if (!isDemo || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ripple = { id: Date.now(), x, y }
    setRipples((prev) => [...prev, ripple])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 500)
  }

  // Demo mode ripple effect for dropdown items
  const createItemRipple = (e, itemValue) => {
    if (!isDemo) return
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ripple = { id: Date.now(), x, y, itemValue }
    setItemRipples((prev) => [...prev, ripple])
    setTimeout(() => {
      setItemRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 500)
  }

  const handleTriggerClick = (e) => {
    if (isDemo) {
      createRipple(e)
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 100)
    }
    setIsOpen(!isOpen)
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  // Filter event types based on search query
  const filteredEventTypes = eventTypes.filter(
    eventType =>
      eventType.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eventType.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group filtered results by category
  const groupedEventTypes = filteredEventTypes.reduce((acc, eventType) => {
    const category = eventType.category || "Other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(eventType)
    return acc
  }, {})

  // Get selected label
  const selectedLabel = (() => {
    if (!selectedValue) return placeholder
    if (isPerformanceParty(selectedValue)) return getThemeDisplayName(selectedValue)
    return eventTypes.find(type => type.value === selectedValue)?.label || placeholder
  })()

  // Handle selection
  const handleSelect = value => {
    // If "Choose for me" is selected, show theme picker modal
    if (value === 'undecided') {
      setIsOpen(false)
      setSearchQuery("")
      setHighlightedIndex(-1)
      // Reset picker state
      setPickerStep('age')
      setPickerAge(null)
      setPickerGender(null)
      setRecommendedTheme(null)
      setShowThemePickerModal(true)
      return
    }

    // If a performance party type is selected, show sub-theme picker
    if (ACTIVITY_TYPES.includes(value)) {
      setIsOpen(false)
      setSearchQuery("")
      setHighlightedIndex(-1)
      setPendingActivityType(value)
      setShowSubThemeModal(true)
      return
    }

    setSelectedValue(value)
    onValueChange?.(value)
    setIsOpen(false)
    setSearchQuery("")
    setHighlightedIndex(-1)
  }

  // Handle age selection in picker
  const handleAgeSelect = (age) => {
    setPickerAge(age)
    setPickerStep('gender')
  }

  // Handle gender selection in picker - generates theme recommendation
  const handleGenderSelect = (gender) => {
    setPickerGender(gender)
    const theme = getRandomTheme(pickerAge, gender)
    setRecommendedTheme(theme)
    setPickerStep('result')
  }

  // Shuffle to get a new theme recommendation
  const handleShuffleTheme = () => {
    const theme = getRandomTheme(pickerAge, pickerGender)
    setRecommendedTheme(theme)
  }

  // Confirm the selected theme
  const handleConfirmTheme = () => {
    setSelectedValue(recommendedTheme)
    onValueChange?.(recommendedTheme)
    setShowThemePickerModal(false)

    // Save the age to localStorage so welcome dashboard can pre-fill it
    try {
      const existingDetails = JSON.parse(localStorage.getItem('party_details') || '{}')
      localStorage.setItem('party_details', JSON.stringify({
        ...existingDetails,
        childAge: pickerAge
      }))
    } catch (e) {
      console.error('Error saving age to localStorage:', e)
    }
  }

  // Go back in the picker flow
  const handlePickerBack = () => {
    if (pickerStep === 'gender') {
      setPickerStep('age')
      setPickerAge(null)
    } else if (pickerStep === 'result') {
      setPickerStep('gender')
      setPickerGender(null)
      setRecommendedTheme(null)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = e => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      return
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false)
        setSearchQuery("")
        setHighlightedIndex(-1)
        break
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredEventTypes.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredEventTypes.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredEventTypes[highlightedIndex]) {
          handleSelect(filteredEventTypes[highlightedIndex].value)
        }
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchQuery("")
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className="w-full justify-between md:bg-white bg-white border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 px-3 text-left font-normal text-sm overflow-hidden"
        style={isDemo ? {
          transform: isPressed ? "scale(0.96)" : "scale(1)",
          transition: "transform 100ms ease-out",
        } : undefined}
      >
        {/* Demo mode ripples */}
        {isDemo && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none z-20"
            style={{ left: ripple.x, top: ripple.y, transform: "translate(-50%, -50%)" }}
          >
            <span
              className="block rounded-full animate-demo-ripple"
              style={{ width: "10px", height: "10px", backgroundColor: "rgba(255, 110, 76, 0.3)" }}
            />
          </span>
        ))}
        <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400 z-10" />
        <span className={selectedValue ? "text-gray-900 ml-6" : "text-gray-500 ml-6"}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setHighlightedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-8 h-9 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setHighlightedIndex(-1)
                    inputRef.current?.focus()
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {Object.keys(groupedEventTypes).length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No themes found for "{searchQuery}"
              </div>
            ) : (
              Object.entries(groupedEventTypes).map(([category, types]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500">{category}</span>
                    {category === 'Performance Parties' && (
                      <span className="text-[10px] text-gray-400 ml-1.5">— great for ages 2–4</span>
                    )}
                  </div>

                  {/* Category Items */}
                  {types.map((eventType, index) => {
                    const globalIndex = filteredEventTypes.findIndex(
                      t => t.value === eventType.value
                    )
                    const isHighlighted = globalIndex === highlightedIndex
                    const isSelected = eventType.value === selectedValue
                    const itemRipple = itemRipples.find(r => r.itemValue === eventType.value)

                    return (
                      <button
                        type="button"
                        key={eventType.value}
                        onClick={(e) => {
                          if (isDemo) {
                            createItemRipple(e, eventType.value)
                            // Delay selection slightly so ripple is visible
                            setTimeout(() => handleSelect(eventType.value), 150)
                          } else {
                            handleSelect(eventType.value)
                          }
                        }}
                        className={`relative overflow-hidden w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          isHighlighted ? "bg-primary-50 text-primary-700" : ""
                        } ${
                          isSelected
                            ? "bg-primary-100 text-primary-800 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {/* Demo mode ripple */}
                        {isDemo && itemRipple && (
                          <span
                            className="absolute pointer-events-none z-20"
                            style={{ left: itemRipple.x, top: itemRipple.y, transform: "translate(-50%, -50%)" }}
                          >
                            <span
                              className="block rounded-full animate-demo-ripple"
                              style={{ width: "10px", height: "10px", backgroundColor: "rgba(255, 110, 76, 0.4)" }}
                            />
                          </span>
                        )}
                        {eventType.label}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Theme Picker Modal */}
      <Dialog open={showThemePickerModal} onOpenChange={setShowThemePickerModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {pickerStep === 'age' && "How old is the birthday child?"}
              {pickerStep === 'gender' && "Boy or girl?"}
              {pickerStep === 'result' && "We recommend..."}
            </DialogTitle>
          </DialogHeader>

          {/* Age Selection Step */}
          {pickerStep === 'age' && (
            <div className="grid grid-cols-4 gap-2 py-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                <button
                  key={age}
                  onClick={() => handleAgeSelect(age)}
                  className="p-3 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all font-semibold text-gray-700"
                >
                  {age}
                </button>
              ))}
            </div>
          )}

          {/* Gender Selection Step */}
          {pickerStep === 'gender' && (
            <div className="flex flex-col gap-2 py-4">
              <button
                onClick={() => handleGenderSelect('boy')}
                className="w-full py-3 px-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-700 font-medium text-sm"
              >
                Boy
              </button>
              <button
                onClick={() => handleGenderSelect('girl')}
                className="w-full py-3 px-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-700 font-medium text-sm"
              >
                Girl
              </button>
              <button
                onClick={() => handleGenderSelect('neutral')}
                className="w-full py-3 px-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-700 font-medium text-sm"
              >
                Surprise me
              </button>
              <button
                onClick={handlePickerBack}
                className="text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Result Step - Show recommended theme with shuffle option */}
          {pickerStep === 'result' && recommendedTheme && (
            <div className="flex flex-col items-center">
              {/* Theme Image as Header - positioned below dialog title */}
              <div className="w-[calc(100%+3rem)] h-40 sm:h-48 -mx-6 mb-4 overflow-hidden">
                <img
                  src={THEME_DISPLAY_NAMES[recommendedTheme]?.image || '/choose-for-me/superhero.webp'}
                  alt={THEME_DISPLAY_NAMES[recommendedTheme]?.label || 'Party theme'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {THEME_DISPLAY_NAMES[recommendedTheme]?.label || recommendedTheme}
              </div>
              <p className="text-sm text-gray-500 text-center mt-1">
                Perfect for a {pickerAge} year old!
              </p>

              <div className="flex gap-2 w-full mt-4">
                <button
                  onClick={handleShuffleTheme}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-600 text-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
                <button
                  onClick={handleConfirmTheme}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-primary-500 hover:bg-primary-600 transition-all text-white font-medium text-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Choose this</span>
                </button>
              </div>

              <button
                onClick={handlePickerBack}
                className="text-sm text-gray-500 hover:text-gray-700 mt-3"
              >
                ← Back
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sub-Theme Picker Modal for Performance Parties */}
      <Dialog open={showSubThemeModal} onOpenChange={setShowSubThemeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Add a theme to your {getThemeDisplayName(pendingActivityType)}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 text-center -mt-2 mb-2">
            Optional — pick a theme or go theme-free
          </p>
          <div className="grid grid-cols-3 gap-2 py-2 max-h-72 overflow-y-auto">
            {/* No theme option */}
            <button
              onClick={() => {
                const value = pendingActivityType
                setSelectedValue(value)
                onValueChange?.(value)
                setShowSubThemeModal(false)
              }}
              className="p-3 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-center text-xs font-semibold text-gray-600"
            >
              <span className="text-2xl block mb-1">✨</span>
              No theme
            </button>
            {Object.entries(THEME_DISPLAY_NAMES).map(([key, { label, emoji }]) => (
              <button
                key={key}
                onClick={() => {
                  const value = buildCompoundTheme(pendingActivityType, key)
                  setSelectedValue(value)
                  onValueChange?.(value)
                  setShowSubThemeModal(false)
                }}
                className="p-3 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-center text-xs font-semibold text-gray-700"
              >
                <span className="text-2xl block mb-1">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSubThemeModal(false)}
            className="text-sm text-gray-500 hover:text-gray-700 mt-2 w-full text-center"
          >
            Cancel
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
