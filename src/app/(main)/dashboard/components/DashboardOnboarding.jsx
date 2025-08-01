"use client"
import { useState, useRef } from "react"
import {
  Calendar,
  MapPin,
  Sparkles,
  Search,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import PartyBuilderLoader from "@/components/Home/PartyBuildingLoader"

export default function DashboardOnboarding({ onFormSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
    duration: 2,
    guestCount: "",
    location: "",
    budget: 300,
    theme: "",
    specificTime: "",
    needsSpecificTime: false,
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

  const handleNoTheme = () => {
    setSelectedTheme("no-theme")
    handleFieldChange("theme", "no-theme")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setShowLoader(true)
      setLoaderProgress(0)

      const progressInterval = setInterval(() => {
        setLoaderProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const submitData = {
        date: formData.date,
        timeSlot: formData.timeSlot,
        duration: formData.duration,
        specificTime: formData.needsSpecificTime ? formData.specificTime : null,
        theme: selectedTheme === "no-theme" ? null : selectedTheme,
        guestCount: formData.guestCount,
        postcode: formData.location,
        budget: formData.budget,
        timePreference: {
          type: formData.needsSpecificTime ? "specific" : "flexible",
          slot: formData.timeSlot,
          duration: formData.duration,
          specificTime: formData.specificTime || null,
        },
      }

      await onFormSubmit(submitData)
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
      <PartyBuilderLoader
        isVisible={showLoader}
        theme={selectedTheme}
        childName="your child"
        progress={loaderProgress}
      />

      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
        <ContextualBreadcrumb currentPage="Build Party" />

        <div className="mx-auto max-w-screen">
          {/* Enhanced Hero Section - Full Width */}
          <div className="relative  h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] overflow-hidden rounded-b-3xl shadow-2xl">
            <div className="w-full h-full absolute  bg-primary-400">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753970651/iStock-2184188129_taimuh.jpg"
                alt="People celebrating at a party"
                fill
                className="object-cover opacity-60"
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
              <div className="absolute top-20 right-16 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-16 left-20 w-3 h-3 bg-white/25 rounded-full animate-pulse delay-700"></div>
              <Sparkles className="absolute top-16 right-10 w-6 h-6 text-white/30 animate-pulse delay-500" />
            </div>

            {/* Hero Content - Full Width */}
            <div className="relative h-full flex justify-center items-center px-6 sm:px-8">
              <div className="w-full max-w-6xl mx-auto text-center text-white">
                <div className="mb-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight">
                    <span className="bg-white bg-clip-text text-transparent drop-shadow-lg">
                      Let's Create Magic Together! 
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl font-medium opacity-90 max-w-4xl mx-auto leading-relaxed">
                    🎉 Just a few quick details to plan your <span className="font-bold">AMAZING</span> celebration! 🎈
                  </p>
                </div>

                {/* Floating elements */}
                <div className="flex justify-center space-x-4 opacity-80">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                    🎈 Trusted by 10,000+ families
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium hidden sm:block">
                    ⭐ 4.9/5 rating
                  </div>
                </div>
              </div>
            </div>

            {/* Smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12 px-6 lg:px-12 py-8 sm:py-12">
            {/* Enhanced Form Fields */}
            <div className="space-y-6">
              {/* Basic Details Grid - Improved Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Field */}
                <div className="group">
                  <div className="bg-primary-400 rounded-xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <label className="block text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 " />
                      Date
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleFieldChange("date", e.target.value)}
                        className="w-full border-0 placeholder:text-black bg-white/95 backdrop-blur-sm text-sm sm:text-base focus:ring-2 focus:ring-white/50 focus:outline-none px-1 py-2 sm:py-3 rounded-lg font-medium"
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                </div>

                {/* Guests Field */}
                <div className="group">
                  <div className="bg-primary-400 rounded-xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <label className="block text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      Guests
                    </label>
                    <div className="relative">
                      <Select
                        value={formData.guestCount}
                        onValueChange={(value) => handleFieldChange("guestCount", value)}
                      >
                        <SelectTrigger className="w-full border-0 bg-white/95 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none px-3 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base">
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
                    </div>
                  </div>
                </div>

                {/* Location Field - Now spans 2 columns but more compact */}
                <div className="group sm:col-span-2">
                  <div className="bg-primary-400 rounded-xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <label className="block text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      Location
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleFieldChange("location", e.target.value)}
                        className="w-full border-0 bg-white/95 backdrop-blur-sm text-sm sm:text-base focus:ring-2 focus:ring-white/50 focus:outline-none px-3 py-2 sm:py-3 rounded-lg font-medium"
                        placeholder="Enter your postcode (e.g. SW1A 1AA)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Time Selection */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-100">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                    When works best?
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600">Choose a time that works for your family</p>
                </div>

                {/* Time Slot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
                  {/* Morning Slot */}
                  <div
                    className={`relative p-8 rounded-2xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      formData.timeSlot === "morning"
                        ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-xl"
                        : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-lg hover:shadow-xl"
                    }`}
                    onClick={() => handleFieldChange("timeSlot", "morning")}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className={`p-3 rounded-full transition-all duration-300 ${
                          formData.timeSlot === "morning" ? "bg-primary-500 shadow-lg" : "bg-gray-200"
                        }`}
                      >
                        <Sun
                          className={`w-6 h-6 ${formData.timeSlot === "morning" ? "text-white" : "text-gray-600"}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-gray-900">Morning Party</h4>
                        <p className="text-gray-600">10am - 1pm window</p>
                      </div>
                    </div>
                    <p className="text-gray-600">Perfect for younger children, leaves afternoon free</p>
                    {formData.timeSlot === "morning" && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Afternoon Slot */}
                  <div
                    className={`relative p-8 rounded-2xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      formData.timeSlot === "afternoon"
                        ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-xl"
                        : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-lg hover:shadow-xl"
                    }`}
                    onClick={() => handleFieldChange("timeSlot", "afternoon")}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className={`p-3 rounded-full transition-all duration-300 ${
                          formData.timeSlot === "afternoon" ? "bg-primary-500 shadow-lg" : "bg-gray-200"
                        }`}
                      >
                        <Sunset
                          className={`w-6 h-6 ${formData.timeSlot === "afternoon" ? "text-white" : "text-gray-600"}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-gray-900">Afternoon Party</h4>
                        <p className="text-gray-600">1pm - 4pm window</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">After lunch, good for all ages</p>
                      <span className="text-xs bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-md">
                        Most Popular
                      </span>
                    </div>
                    {formData.timeSlot === "afternoon" && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration Selection */}
                <div className="max-w-lg mx-auto mb-6">
                  <label className="block text-xl font-bold text-gray-700 mb-4 text-center">
                    How long should the party be?
                  </label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => handleFieldChange("duration", Number.parseFloat(value))}
                  >
                    <SelectTrigger className="w-full bg-white border-2 border-gray-200 focus:border-primary-500 rounded-xl h-14 text-lg font-medium shadow-md">
                      <SelectValue placeholder="Choose duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{option.label}</span>
                            {option.popular && (
                              <span className="ml-3 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-bold">
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
                    className="text-gray-600 hover:text-gray-800 font-medium"
                    onClick={() => handleFieldChange("needsSpecificTime", !formData.needsSpecificTime)}
                  >
                    {formData.needsSpecificTime ? "Use flexible timing instead" : "I need a specific time"}
                  </Button>
                </div>

                {/* Specific Time Input */}
                {formData.needsSpecificTime && (
                  <div className="max-w-lg mx-auto mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl shadow-lg">
                    <div className="text-center mb-4">
                      <p className="text-sm text-yellow-800 font-bold">⚠️ Specific times may limit supplier options</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        We'll try our best, but you might need to be flexible
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <Input
                        type="time"
                        value={formData.specificTime}
                        onChange={(e) => handleFieldChange("specificTime", e.target.value)}
                        className="flex-1 border-yellow-300 focus:border-yellow-500 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Budget Section */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-100">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                    What's your budget?
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600">Drag Snappy to set your perfect budget! 🐊</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="flex justify-between text-sm font-medium text-gray-500 px-4">
                    <span>£100</span>
                    <span className="hidden sm:inline">£200</span>
                    <span>£300</span>
                    <span className="hidden sm:inline">£400</span>
                    <span>£500</span>
                  </div>

                  <div className="relative py-8">
                    {/* Enhanced slider track */}
                    <div className="w-full h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full relative shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-300 shadow-lg"
                        style={{
                          width: `${((formData.budget - 100) / 400) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Hidden native slider */}
                    <input
                      type="range"
                      min="100"
                      max="500"
                      step="50"
                      value={formData.budget}
                      onChange={(e) => handleFieldChange("budget", Number.parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {/* Enhanced Snappy thumb */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-300 z-20 pointer-events-none"
                      style={{
                        left: `${((formData.budget - 100) / 400) * 100}%`,
                      }}
                    >
                      <div className="relative">
                        <img
                          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291661/qjdvo5qnbylnzwhlawhf.png"
                          alt="Snappy the Crocodile"
                          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-200 filter brightness-110"
                          onError={(e) => {
                            e.target.style.display = "none"
                            e.target.nextSibling.style.display = "block"
                          }}
                        />
                        <div
                          className="w-12 h-12 sm:w-16 sm:h-16 text-2xl sm:text-3xl flex items-center justify-center"
                          style={{ display: "none" }}
                        >
                          🐊
                        </div>

                        {/* Enhanced speech bubble */}
                        <div className="absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-2 rounded-xl shadow-xl border-2 border-orange-300 relative">
                            <span className="text-sm sm:text-base font-black text-white">£{formData.budget}</span>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-orange-400"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Theme Section */}
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Choose Your Theme (Optional)</h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center gap-2 border-2 border-[hsl(var(--primary-300))] text-[hsl(var(--primary-600))] hover:bg-primary-50 bg-white font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Sparkles className="w-5 h-5" />
                      AI Suggested Theme
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Search className="w-5 h-5" />
                      Search Themes
                    </Button>
                  </div>
                </div>

                {/* No Theme Option */}
                <div className="flex justify-center mb-6">
                  <Button
                    type="button"
                    variant={selectedTheme === "no-theme" ? "default" : "outline"}
                    onClick={handleNoTheme}
                    className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                      selectedTheme === "no-theme"
                        ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg"
                        : "border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    <X className="w-5 h-5" />
                    No Theme - Keep it Simple
                  </Button>
                </div>

                {/* Trending Themes */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      🔥 Trending 2025
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-3 hover:bg-gray-100 rounded-full shadow-md"
                        onClick={() => scrollThemes(trendingScrollRef, "left")}
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-3 hover:bg-gray-100 rounded-full shadow-md"
                        onClick={() => scrollThemes(trendingScrollRef, "right")}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  <div
                    ref={trendingScrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {trendingThemes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`flex-shrink-0 w-32 sm:w-40 cursor-pointer transition-all duration-300 ${
                          selectedTheme === theme.id ? "transform scale-110" : "hover:transform hover:scale-105"
                        }`}
                        onClick={() => handleThemeSelect(theme.id)}
                      >
                        <div className="relative">
                          <div
                            className={`w-full aspect-[4/3] overflow-hidden rounded-2xl transition-all duration-300 ${
                              selectedTheme === theme.id
                                ? "shadow-2xl ring-4 ring-primary-500"
                                : "shadow-lg hover:shadow-xl"
                            }`}
                            style={{
                              clipPath: "ellipse(50% 40% at 50% 50%)",
                            }}
                          >
                            <img
                              src={theme.image || "/placeholder.svg"}
                              alt={theme.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              style={{
                                clipPath: "ellipse(50% 40% at 50% 50%)",
                              }}
                            />
                          </div>
                          {selectedTheme === theme.id && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        <p className="text-center mt-3 text-sm font-bold text-gray-900 leading-tight">{theme.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Themes */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      ⭐ Most Popular
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-3 hover:bg-gray-100 rounded-full shadow-md"
                        onClick={() => scrollThemes(popularScrollRef, "left")}
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-3 hover:bg-gray-100 rounded-full shadow-md"
                        onClick={() => scrollThemes(popularScrollRef, "right")}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  <div
                    ref={popularScrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {popularThemes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`flex-shrink-0 w-32 sm:w-40 cursor-pointer transition-all duration-300 ${
                          selectedTheme === theme.id ? "transform scale-110" : "hover:transform hover:scale-105"
                        }`}
                        onClick={() => handleThemeSelect(theme.id)}
                      >
                        <div className="relative">
                          <div
                            className={`w-full aspect-square overflow-hidden rounded-2xl transition-all duration-300 ${
                              selectedTheme === theme.id
                                ? "shadow-2xl ring-4 ring-primary-500"
                                : "shadow-lg hover:shadow-xl"
                            }`}
                            style={{
                              clipPath: `polygon(
                                50% 0%, 60% 5%, 70% 2%, 80% 8%, 90% 5%, 95% 15%, 98% 25%, 95% 35%, 98% 45%, 95% 55%, 98% 65%, 95% 75%, 90% 85%, 80% 88%, 70% 92%, 60% 88%, 50% 95%, 40% 88%, 30% 92%, 20% 88%, 10% 85%, 5% 75%, 2% 65%, 5% 55%, 2% 45%, 5% 35%, 2% 25%, 5% 15%, 10% 5%, 20% 8%, 30% 2%, 40% 5%
                              )`,
                            }}
                          >
                            <img
                              src={theme.image || "/placeholder.svg"}
                              alt={theme.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              style={{
                                clipPath: `polygon(
                                  50% 0%, 60% 5%, 70% 2%, 80% 8%, 90% 5%, 95% 15%, 98% 25%, 95% 35%, 98% 45%, 95% 55%, 98% 65%, 95% 75%, 90% 85%, 80% 88%, 70% 92%, 60% 88%, 50% 95%, 40% 88%, 30% 92%, 20% 88%, 10% 85%, 5% 75%, 2% 65%, 5% 55%, 2% 45%, 5% 35%, 2% 25%, 5% 15%, 10% 5%, 20% 8%, 30% 2%, 40% 5%
                                )`,
                              }}
                            />
                          </div>
                          {selectedTheme === theme.id && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        <p className="text-center mt-3 text-sm font-bold text-gray-900 leading-tight">{theme.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                {/* <Button
                  type="button"
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800 font-medium text-lg px-8 py-4 rounded-full border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all duration-300 w-full sm:w-auto"
                >
                  Skip for now
                </Button> */}
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.date ||
                    !formData.timeSlot ||
                    !formData.guestCount ||
                    !formData.location ||
                    (formData.needsSpecificTime && !formData.specificTime)
                  }
                  className="bg-primary-400  hover:from-[hsl(var(--primary-500))] hover:via-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-22 py-8 rounded-full text-lg font-bold disabled:opacity-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Building Your Party...
                    </div>
                  ) : (
                    "Continue to Magic ✨"
                  )}
                </Button>
              </div>

              {/* Enhanced Disclaimer */}
              <div className="text-center pt-6">
                <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
                  🔒 Your preferences are only used to personalise your experience and create the perfect party for you
                </p>
              </div>
            </div>
          </form>
        </div>

        <style jsx>{`
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
          input[type="range"] {
            background: transparent;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </>
  )
}
