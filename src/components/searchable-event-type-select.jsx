"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search, X,  UsersIcon, } from "lucide-react"


const eventTypes = [

  // Popular themes
  { value: "no-theme", label: "No theme - Keep it simple!", category: "Popular"   },
  { value: "princess", label: "Princess", category: "Popular" },
  { value: "superhero", label: "Superhero", category: "Popular" },
  { value: "unicorn", label: "Unicorn Magic", category: "Popular" },
  { value: "dinosaur", label: "Dinosaur", category: "Popular" },
  { value: "pirate", label: "Pirate Adventure", category: "Popular" },
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
  { value: "mermaid", label: "Mermaid & Ocean", category: "Fantasy" },
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

export default function SearchableEventTypeSelect({
  defaultValue = "",
  onValueChange,
  placeholder = "Choose event type"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

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
  const selectedLabel =
    eventTypes.find(type => type.value === selectedValue)?.label || placeholder

  // Handle selection
  const handleSelect = value => {
    setSelectedValue(value)
    onValueChange?.(value)
    setIsOpen(false)
    setSearchQuery("")
    setHighlightedIndex(-1)
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
        type="button"
        variant="outline"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 0)
          }
        }}
        onKeyDown={handleKeyDown}
        className="w-full justify-between md:bg-white bg-white border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 px-3 text-left font-normal"
      >
          <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
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
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                    {category}
                  </div>

                  {/* Category Items */}
                  {types.map((eventType, index) => {
                    const globalIndex = filteredEventTypes.findIndex(
                      t => t.value === eventType.value
                    )
                    const isHighlighted = globalIndex === highlightedIndex
                    const isSelected = eventType.value === selectedValue

                    return (
                      <button
                        key={eventType.value}
                        onClick={() => handleSelect(eventType.value)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          isHighlighted ? "bg-primary-50 text-primary-700" : ""
                        } ${
                          isSelected
                            ? "bg-primary-100 text-primary-800 font-medium"
                            : "text-gray-700"
                        }`}
                      >
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
    </div>
  )
}
