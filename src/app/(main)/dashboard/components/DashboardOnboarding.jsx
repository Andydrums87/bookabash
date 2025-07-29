"use client"

import { useState, useRef } from "react"
import { Calendar, MapPin, Sparkles, Search, Users, Clock, ChevronLeft, ChevronRight, Sun, Sunset } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import PartyBuilderLoader from "@/components/Home/PartyBuildingLoader"

export default function DashboardOnboarding({ onFormSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "", // Changed from 'time' to 'timeSlot'
    duration: 2,
    guestCount: "",
    location: "",
    budget: 300,
    theme: "",
    specificTime: "", // For when user chooses specific time
    needsSpecificTime: false, // Toggle for specific time option
  })

  const [selectedTheme, setSelectedTheme] = useState("")
  const [showLoader, setShowLoader] = useState(false)
  const [loaderProgress, setLoaderProgress] = useState(0)

  // Refs for scrolling
  const trendingScrollRef = useRef(null)
  const popularScrollRef = useRef(null)

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme)
    handleFieldChange("theme", theme)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Show loader
      setShowLoader(true)
      setLoaderProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setLoaderProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Convert the form data to new backend format
      const submitData = {
        date: formData.date,
        timeSlot: formData.timeSlot, // "morning" or "afternoon"
        duration: formData.duration, // hours as number
        specificTime: formData.needsSpecificTime ? formData.specificTime : null,
        theme: selectedTheme,
        guestCount: formData.guestCount,
        postcode: formData.location,
        budget: formData.budget,
        // Additional metadata for backend
        timePreference: {
          type: formData.needsSpecificTime ? 'specific' : 'flexible',
          slot: formData.timeSlot,
          duration: formData.duration,
          specificTime: formData.specificTime || null
        }
      }

      await onFormSubmit(submitData)

      // Complete progress
      setLoaderProgress(100)
      setTimeout(() => {
        setShowLoader(false)
        clearInterval(progressInterval)
      }, 1000)
    } catch (error) {
      console.error("Form submission error:", error)
      setShowLoader(false)
      setLoaderProgress(0)
    }
  }

  // Scroll functions
  const scrollThemes = (ref, direction) => {
    const scrollAmount = window.innerWidth < 768 ? 200 : 300
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const guestOptions = [
    { value: "5", label: "5 guests" },
    { value: "10", label: "10 guests" },
    { value: "15", label: "15 guests" },
    { value: "20", label: "20 guests" },
    { value: "25", label: "25 guests" },
    { value: "30", label: "30+ guests" },
  ]

  const durationOptions = [
    { value: 1.5, label: "1½ hours" },
    { value: 2, label: "2 hours", popular: true },
    { value: 2.5, label: "2½ hours" },
    { value: 3, label: "3 hours", popular: true },
    { value: 3.5, label: "3½ hours" },
    { value: 4, label: "4 hours" },
  ]

  const trendingThemes = [
    {
      id: "princess",
      name: "Princess",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753255939/yng0yzjqdd8y2osdgeyt.webp",
    },
    {
      id: "superhero",
      name: "Superhero",
      image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "dinosaur",
      name: "Dinosaur",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "unicorn",
      name: "Unicorn",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "science",
      name: "Science",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "spiderman",
      name: "Spider-man",
      image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "pokemon",
      name: "Pokemon",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "mermaid",
      name: "Mermaid",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "cars",
      name: "Cars",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "fairy",
      name: "Fairy",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
  ]

  const popularThemes = [
    {
      id: "taylor-swift",
      name: "Taylor Swift",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "minecraft",
      name: "Minecraft",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "frozen",
      name: "Frozen",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "pirate",
      name: "Pirate",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "space",
      name: "Space",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "jungle",
      name: "Jungle",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "football",
      name: "Football",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "rainbow",
      name: "Rainbow",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "circus",
      name: "Circus",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "beach",
      name: "Beach",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
  ]

  return (
    <>
      {/* Party Builder Loader */}
      <PartyBuilderLoader
        isVisible={showLoader}
        theme={selectedTheme}
        childName="your child"
        progress={loaderProgress}
      />

      <div className="min-h-screen bg-primary-50">
        <ContextualBreadcrumb currentPage="browse" />

        <div className="mx-auto">
          {/* Hero Section - Mobile Optimized */}
          <div className="relative w-full h-[30vh] sm:h-[36vh] md:h-[42vh] lg:h-[43vh] overflow-hidden">
            <div className="w-full h-full absolute bg-gradient-to-br from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))]">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752832989/iStock-1149320278_srn8ti-removebg_efzwtu.png"
                alt="People celebrating at a party"
                fill
                className="object-cover"
              />
            </div>

            {/* Strong dark overlay */}
            <div className="absolute inset-0 bg-black/10"></div>

            {/* Hero Content Overlay - Mobile Optimized */}
            <div className="relative h-full flex justify-center px-4 sm:px-6">
              <div className="max-w-4xl mx-auto text-center text-white flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-2 sm:mb-3 md:mb-6 drop-shadow-2xl text-shadow-lg leading-tight">
                  Let's Plan Your Dream
                  <span className="text-white block drop-shadow-2xl">
                    <span className="text-primary drop-shadow-xl">Party!</span>
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-2xl mb-4 md:mb-8 md:w-[70%] mx-auto leading-relaxed drop-shadow-2xl font-semibold text-shadow-md px-4">
                  Create magical moments. Everything you need for the perfect party, all in one place.
                </p>
              </div>
            </div>

            {/* Bottom fade for smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-6 md:h-12 bg-gradient-to-t from-white to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12 px-4 sm:px-6 lg:px-10 mt-6 sm:mt-10">
            {/* Form Heading - Mobile Optimized */}
            <div className="mb-6 sm:mb-8 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Tell us about your party
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                Just a few details to get started with your perfect celebration
              </p>
            </div>

            {/* Form Fields - Updated Layout */}
            <div className="space-y-6 sm:space-y-8">
              {/* Date Field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-primary-400 rounded-2xl p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm sm:text-md font-bold text-white mb-2">Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFieldChange("date", e.target.value)}
                      className="w-full border-0 bg-white text-base focus:ring-0 focus:outline-none px-2 h-10 sm:h-auto"
                      placeholder="21 Jan 2024"
                    />
                    <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Guests */}
                <div className="bg-primary-400 rounded-2xl p-4 shadow-sm border border-gray-100">
                  <label className="block text-sm sm:text-md font-bold text-white mb-2">Guests</label>
                  <div className="relative">
                    <Select
                      value={formData.guestCount}
                      onValueChange={(value) => handleFieldChange("guestCount", value)}
                    >
                      <SelectTrigger className="w-full border-0 bg-white focus:ring-0 focus:outline-none px-2 h-10 sm:h-auto">
                        <SelectValue placeholder="How many?" />
                      </SelectTrigger>
                      <SelectContent>
                        {guestOptions.map((guest) => (
                          <SelectItem key={guest.value} value={guest.value}>
                            {guest.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Users className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Location */}
                <div className="bg-primary-400 rounded-2xl p-4 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-2">
                  <label className="block text-sm sm:text-md font-bold text-white mb-2">Location</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      className="w-full border-0 bg-white text-base focus:ring-0 focus:outline-none px-2 h-10 sm:h-auto"
                      placeholder="Enter postcode"
                    />
                    <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* NEW: Time Slot Selection */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[hsl(var(--primary-400))]">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">When works best?</h3>
                    <p className="text-gray-600">Choose a time that works for your family</p>
                  </div>

                  {/* Time Slot Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {/* Morning Slot */}
                    <div
                      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.timeSlot === "morning"
                          ? "border-primary-500 bg-primary-50 shadow-lg"
                          : "border-gray-200 hover:border-primary-300 hover:bg-primary-25"
                      }`}
                      onClick={() => handleFieldChange("timeSlot", "morning")}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-full ${formData.timeSlot === "morning" ? "bg-primary-500" : "bg-gray-200"}`}>
                          <Sun className={`w-5 h-5 ${formData.timeSlot === "morning" ? "text-white" : "text-gray-600"}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">Morning Party</h4>
                          <p className="text-gray-600 text-sm">10am - 1pm window</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">Perfect for younger children, leaves afternoon free</p>
                      {formData.timeSlot === "morning" && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Afternoon Slot */} 
                    <div
                      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.timeSlot === "afternoon"
                          ? "border-primary-500 bg-primary-50 shadow-lg"
                          : "border-gray-200 hover:border-primary-300 hover:bg-primary-25"
                      }`}
                      onClick={() => handleFieldChange("timeSlot", "afternoon")}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-full ${formData.timeSlot === "afternoon" ? "bg-primary-500" : "bg-gray-200"}`}>
                          <Sunset className={`w-5 h-5 ${formData.timeSlot === "afternoon" ? "text-white" : "text-gray-600"}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">Afternoon Party</h4>
                          <p className="text-gray-600 text-sm">1pm - 4pm window</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-sm">After lunch, good for all ages</p>
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                          Most Popular
                        </span>
                      </div>
                      {formData.timeSlot === "afternoon" && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div className="max-w-lg mx-auto">
                    <label className="block text-lg font-medium text-gray-700 mb-4 text-center">
                      How long should the party be?
                    </label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) => handleFieldChange("duration", parseFloat(value))}
                    >
                      <SelectTrigger className="w-full bg-white border-2 border-gray-200 focus:border-primary-500 rounded-xl h-12 text-base">
                        <SelectValue placeholder="Choose duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{option.label}</span>
                              {option.popular && (
                                <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specific Time Option */}
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-800 text-sm"
                      onClick={() => handleFieldChange("needsSpecificTime", !formData.needsSpecificTime)}
                    >
                      {formData.needsSpecificTime ? "Use flexible timing instead" : "I need a specific time"}
                    </Button>
                  </div>

                  {/* Specific Time Input (when needed) */}
                  {formData.needsSpecificTime && (
                    <div className="max-w-lg mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="text-center mb-4">
                        <p className="text-sm text-yellow-800 font-medium">⚠️ Specific times may limit supplier options</p>
                        <p className="text-xs text-yellow-700 mt-1">We'll try our best, but you might need to be flexible</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <Input
                          type="time"
                          value={formData.specificTime}
                          onChange={(e) => handleFieldChange("specificTime", e.target.value)}
                          className="flex-1 border-yellow-300 focus:border-yellow-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Budget Section - Keep existing */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[hsl(var(--primary-400))]">
              <label className="block text-lg font-medium text-gray-700 mb-4 sm:mb-6 text-center">
                What's your budget?
              </label>
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex justify-between text-xs sm:text-sm text-gray-500 px-2">
                  <span>£100</span>
                  <span className="hidden sm:inline">£200</span>
                  <span>£300</span>
                  <span className="hidden sm:inline">£400</span>
                  <span>£500</span>
                </div>

                <div className="relative py-4 sm:py-6">
                  {/* Custom slider track */}
                  <div className="w-full h-2 sm:h-3 bg-gray-200 rounded-lg relative">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg transition-all duration-300"
                      style={{
                        width: `${((formData.budget - 100) / 400) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Hidden native slider for functionality */}
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="50"
                    value={formData.budget}
                    onChange={(e) => handleFieldChange("budget", Number.parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {/* Snappy as the slider thumb - Mobile Optimized */}
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-300 z-20 pointer-events-none"
                    style={{
                      left: `${((formData.budget - 100) / 400) * 100}%`,
                    }}
                  >
                    <div className="relative">
                      {/* Snappy image - Smaller on mobile */}
                      <img
                        src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291661/qjdvo5qnbylnzwhlawhf.png"
                        alt="Snappy the Crocodile"
                        className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.target.style.display = "none"
                          e.target.nextSibling.style.display = "block"
                        }}
                      />
                      {/* Fallback emoji */}
                      <div
                        className="w-8 h-8 sm:w-12 sm:h-12 text-xl sm:text-2xl flex items-center justify-center"
                        style={{ display: "none" }}
                      >
                        🐊
                      </div>

                      {/* Speech bubble with budget - Mobile Optimized */}
                      <div className="absolute -top-8 sm:-top-12 left-1/2 transform -translate-x-1/2">
                        <div className="bg-white px-2 sm:px-3 py-1 rounded-lg shadow-lg border-2 border-orange-300 relative">
                          <span className="text-xs sm:text-sm font-bold text-orange-600">£{formData.budget}</span>
                          {/* Speech bubble tail */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-l-transparent border-r-transparent border-t-orange-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Drag Snappy to set your budget! 🐊</p>
                </div>
              </div>
            </div>

            {/* Theme Section - Keep existing but shortened for space */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Theme</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center gap-2 border-[hsl(var(--primary-300))] text-[hsl(var(--primary-600))] hover:bg-primary-50 bg-transparent text-sm sm:text-base h-10 sm:h-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI suggested theme
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent text-sm sm:text-base h-10 sm:h-auto"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Trending 2025 - Mobile Optimized */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Trending 2025</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-1.5 sm:p-2 hover:bg-gray-100 h-8 w-8 sm:h-auto sm:w-auto"
                      onClick={() => scrollThemes(trendingScrollRef, "left")}
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-1.5 sm:p-2 hover:bg-gray-100 h-8 w-8 sm:h-auto sm:w-auto"
                      onClick={() => scrollThemes(trendingScrollRef, "right")}
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </Button>
                  </div>
                </div>

                <div
                  ref={trendingScrollRef}
                  className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {trendingThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`flex-shrink-0 w-24 sm:w-32 cursor-pointer transition-all duration-200 ${
                        selectedTheme === theme.id ? "transform scale-105" : "hover:transform hover:scale-102"
                      }`}
                      onClick={() => handleThemeSelect(theme.id)}
                    >
                      <div className="relative">
                        <div
                          className={`w-full aspect-[4/3] overflow-hidden transition-all duration-200 ${
                            selectedTheme === theme.id ? "shadow-lg" : "shadow-md hover:shadow-lg"
                          }`}
                          style={{
                            clipPath: "ellipse(50% 40% at 50% 50%)",
                            border: selectedTheme === theme.id ? "3px solid hsl(var(--primary-500))" : "none",
                          }}
                        >
                          <img
                            src={theme.image || "/placeholder.svg"}
                            alt={theme.name}
                            className="w-full h-full object-cover"
                            style={{
                              clipPath: "ellipse(50% 40% at 50% 50%)",
                            }}
                          />
                        </div>
                        {selectedTheme === theme.id && (
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[hsl(var(--primary-500))] rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <p className="text-center mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                        {theme.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Popular - Mobile Optimized */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Most popular</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-1.5 sm:p-2 hover:bg-gray-100 h-8 w-8 sm:h-auto sm:w-auto"
                      onClick={() => scrollThemes(popularScrollRef, "left")}
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-1.5 sm:p-2 hover:bg-gray-100 h-8 w-8 sm:h-auto sm:w-auto"
                      onClick={() => scrollThemes(popularScrollRef, "right")}
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </Button>
                  </div>
                </div>

                <div
                  ref={popularScrollRef}
                  className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {popularThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`flex-shrink-0 w-24 sm:w-32 cursor-pointer transition-all duration-200 ${
                        selectedTheme === theme.id ? "transform scale-105" : "hover:transform hover:scale-102"
                      }`}
                      onClick={() => handleThemeSelect(theme.id)}
                    >
                      <div className="relative">
                        <div
                          className={`w-full aspect-square overflow-hidden transition-all duration-200 ${
                            selectedTheme === theme.id ? "shadow-lg" : "shadow-md hover:shadow-lg"
                          }`}
                          style={{
                            clipPath: `polygon(
                              50% 0%,
                              60% 5%,
                              70% 2%,
                              80% 8%,
                              90% 5%,
                              95% 15%,
                              98% 25%,
                              95% 35%,
                              98% 45%,
                              95% 55%,
                              98% 65%,
                              95% 75%,
                              90% 85%,
                              80% 88%,
                              70% 92%,
                              60% 88%,
                              50% 95%,
                              40% 88%,
                              30% 92%,
                              20% 88%,
                              10% 85%,
                              5% 75%,
                              2% 65%,
                              5% 55%,
                              2% 45%,
                              5% 35%,
                              2% 25%,
                              5% 15%,
                              10% 5%,
                              20% 8%,
                              30% 2%,
                              40% 5%
                            )`,
                            border: selectedTheme === theme.id ? "3px solid hsl(var(--primary-500))" : "none",
                          }}
                        >
                          <img
                            src={theme.image || "/placeholder.svg"}
                            alt={theme.name}
                            className="w-full h-full object-cover"
                            style={{
                              clipPath: `polygon(
                                50% 0%,
                                60% 5%,
                                70% 2%,
                                80% 8%,
                                90% 5%,
                                95% 15%,
                                98% 25%,
                                95% 35%,
                                98% 45%,
                                95% 55%,
                                98% 65%,
                                95% 75%,
                                90% 85%,
                                80% 88%,
                                70% 92%,
                                60% 88%,
                                50% 95%,
                                40% 88%,
                                30% 92%,
                                20% 88%,
                                10% 85%,
                                5% 75%,
                                2% 65%,
                                5% 55%,
                                2% 45%,
                                5% 35%,
                                2% 25%,
                                5% 15%,
                                10% 5%,
                                20% 8%,
                                30% 2%,
                                40% 5%
                              )`,
                            }}
                          />
                        </div>
                        {selectedTheme === theme.id && (
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[hsl(var(--primary-500))] rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <p className="text-center mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                        {theme.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions - Updated validation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-6 sm:pt-8">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-600 w-full sm:w-[48%] bg-white rounded-full hover:text-gray-800 h-12 sm:h-auto text-base sm:text-lg"
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.date ||
                  !formData.timeSlot ||
                  !formData.guestCount ||
                  !formData.location ||
                  !selectedTheme ||
                  (formData.needsSpecificTime && !formData.specificTime)
                }
                className="bg-primary-400 w-full sm:w-[48%] text-white px-6 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold disabled:opacity-50 shadow-lg h-12 sm:h-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Building Your Party...
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs sm:text-sm text-gray-500 pt-4 px-4">
              *Your preferences are only used to personalise your experience
            </p>
          </form>
        </div>

        <style jsx>{`
          /* Hide default slider thumb since we're using custom Snappy thumb */
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 0;
            height: 0;
          }
          input[type="range"]::-moz-range-thumb {
            width: 0;
            height: 0;
            border: none;
            background: transparent;
          }
          /* Ensure the slider track is properly styled */
          input[type="range"] {
            background: transparent;
          }
          /* Hide scrollbars for theme sections */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          /* Improve touch targets on mobile */
          @media (max-width: 640px) {
            .scrollbar-hide {
              padding-bottom: 8px;
            }
          }
        `}</style>
      </div>
    </>
  )
}