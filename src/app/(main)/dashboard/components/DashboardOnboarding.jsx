"use client"
import React, { useState, useRef } from 'react';
import {

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
  ArrowRight,
  Star,
  Check,
  Calendar as CalendarIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { Calendar } from '@/components/ui/calendar';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import PartyBuilderLoader from "@/components/Home/PartyBuildingLoader"
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardOnboardingRedesigned({ onFormSubmit, isSubmitting = false }) {
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
  const [currentStep, setCurrentStep] = useState(0)

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
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381349/iStock-1059655678_mfuiu6.jpg",
    },
    {
      id: "superhero",
      name: "Superhero",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829350/jng4z1rdtb9mik2n6mp6.jpg",
    },
    {
      id: "dinosaur",
      name: "Dinosaur",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380783/iStock-1646650260_douzyr.jpg",
    },
    {
      id: "unicorn",
      name: "Unicorn",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381224/iStock-1385363961_iltnu7.jpg",
    },
    {
      id: "science",
      name: "Science",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380880/iStock-1603218889_xq4kqi.jpg",
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
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380937/iStock-2201784646_cdvevq.jpg",
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
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380995/iStock-2176668301_cstncj.jpg",
    },
    {
      id: "space",
      name: "Space",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381070/iStock-684090490_smtflw.jpg",
    },
    {
      id: "jungle",
      name: "Jungle",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381160/iStock-1564856102_abqkpd.jpg",
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
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381299/iStock-488844390_wmv5zq.jpg",
    },
    {
      id: "beach",
      name: "Beach",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    },
  ]

  const steps = [
    { id: 'basics', title: 'Party Basics', icon: CalendarIcon },
    { id: 'timing', title: 'When & How Long', icon: Clock },
    { id: 'theme', title: 'Pick a Theme', icon: Sparkles }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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
          <div  style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="relative w-full h-[40vh] md:h-[45vh] lg:h-[50vh] overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-300))] via-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))]">
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-16 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-16 left-20 w-3 h-3 bg-white/25 rounded-full animate-pulse delay-700"></div>
        <Sparkles className="absolute top-16 right-10 w-6 h-6 text-white/30 animate-pulse delay-500" />
      </div>

      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl leading-tight">
          Let's Create
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
            Magic Together!
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-2xl font-semibold">
          Just a few quick details to plan your <span className="font-bold">AMAZING</span> celebration! 
          </p>
    

        </div>
      </div>

      {/* Smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
    </div>

          {/* Progress Steps */}
          <div className="bg-white shadow-sm border-b border-[hsl(var(--primary-100))]">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`
                        flex items-center justify-center w-6 h-6 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300
                        ${isActive ? 'bg-primary-200 border-[hsl(var(--primary-100))] text-white' : 
                          isCompleted ? 'bg-primary-500 border-[hsl(var(--primary-500))] text-white' : 
                          'bg-gprimary-300 border-gray-300 text-gray-400'}
                      `}>
                        {isCompleted ? (
                          <Check className="md:w-5 md:h-5 w-3 h-3" />
                        ) : (
                          <Icon className="md:w-5 md:h-5 w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-xs md:text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                          Step {index + 1}
                        </p>
                        <p className={`text-[0.6rem] md:text-xs ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                      </div>
                      
                      {index < steps.length - 1 && (
                        <div className={`
                          w-4 sm:w-16 h-0.5 mx-4 transition-all duration-300
                          ${isCompleted ? 'bg-primary-500' : 'bg-gray-200'}
                        `} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              
              {/* Step 1: Party Basics */}
              {currentStep === 0 && (
                <div className="sm:p-8 ">
                  <div className="text-center mb-8 bg-gradient-to-r from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] p-6 rounded-t-2xl">
                    <h2 className="text-3xl sm:text-3xl font-bold text-white mb-2">Party Basics</h2>
                    <p className="text-white">Let's start with the essentials</p>
                  </div>
                  
                  <div className="space-y-6 px-4">
{/* Date */}
<div className="group">
  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
    <CalendarIcon className="w-4 h-4 text-primary-500" />
    When's the big day?
  </label>
  <Popover>
    <PopoverTrigger asChild>
      <div
        className={cn(
          "w-full justify-start text-left font-medium px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[hsl(var(--primary-500))] hover:border-[hsl(var(--primary-300))] transition-all duration-300 text-lg cursor-pointer bg-white flex items-center",
          !formData.date && "text-gray-500"
        )}
      >
        <CalendarIcon className="w-5 h-5 mr-3 text-primary-500" />
        {formData.date && !isNaN(new Date(formData.date)) ? (
          format(new Date(formData.date), "EEEE, MMMM d, yyyy")
        ) : (
          "Select your event date"
        )}
      </div>
    </PopoverTrigger>
    <PopoverContent 
      className="w-auto p-0 border-primary-200 shadow-xl rounded-2xl" 
      align="start"
      side="top"
      sideOffset={8}
    >
      <Calendar
        mode="single"
        selected={formData.date && !isNaN(new Date(formData.date)) ? new Date(formData.date) : null}
        onSelect={(date) => {
          if (date) {
            const formattedDate = format(date, "yyyy-MM-dd")
            handleFieldChange('date', formattedDate)
          }
        }}
        initialFocus
        disabled={(date) => date < new Date()}
        className="rounded-lg"
      />
    </PopoverContent>
  </Popover>
</div>

                    {/* Guests */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-500" />
                        How many little ones?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {guestOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleFieldChange("guestCount", option.value)}
                            className={`
                              p-4 rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105
                              ${formData.guestCount === option.value
                                ? 'bg-primary-500 border-[hsl(var(--primary-500))] text-white shadow-lg'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-300))]'
                              }
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        Where's the party?
                      </label>
                      <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                        <Input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleFieldChange("location", e.target.value)}
                          placeholder="Enter your postcode"
                          className="w-full px-10 py-8 placeholder:text-gray-600 placeholder:text-base border-2 border-gray-200 rounded-xl focus:border-[hsl(var(--primary-500))] focus:ring-0 text-lg font-medium transition-all duration-300"
                        />
                    
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Timing */}
              {currentStep === 1 && (
                <div className="">
                  <div className="text-center mb-8 text-center mb-8 bg-gradient-to-r from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] p-6 rounded-t-2xl">
                    <h2 className="text-3xl sm:text-3xl font-bold text-white mb-2">Perfect Timing</h2>
                    <p className="text-white">When works best for your family?</p>
                  </div>

                  <div className="space-y-8 px-4">
                    {/* Time Slots */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose your time slot</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleFieldChange("timeSlot", "morning")}
                          className={`
                            p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 group
                            ${formData.timeSlot === "morning"
                              ? 'bg-yellow-50 border-yellow-400 shadow-lg'
                              : 'bg-white border-gray-200 hover:border-yellow-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`
                              p-3 rounded-full transition-all duration-300
                              ${formData.timeSlot === "morning" ? 'bg-yellow-400' : 'bg-gray-100 group-hover:bg-yellow-100'}
                            `}>
                              <Sun className={`w-6 h-6 ${formData.timeSlot === "morning" ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-lg">Morning Party</h4>
                              <p className="text-gray-600 text-sm">10am - 1pm</p>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">Perfect for younger children</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFieldChange("timeSlot", "afternoon")}
                          className={`
                            p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 group relative
                            ${formData.timeSlot === "afternoon"
                              ? 'bg-[hsl(var(--primary-50))] border-[hsl(var(--primary-400))] shadow-lg'
                              : 'bg-white border-gray-200 hover:border-[hsl(var(--primary-300))]'
                            }
                          `}
                        >
                          <div className="absolute top-3 right-3">
                            <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              Most Popular
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`
                              p-3 rounded-full transition-all duration-300
                              ${formData.timeSlot === "afternoon" ? 'bg-primary-500' : 'bg-gray-100 group-hover:bg-[hsl(var(--primary-100))]'}
                            `}>
                              <Sunset className={`w-6 h-6 ${formData.timeSlot === "afternoon" ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-lg">Afternoon Party</h4>
                              <p className="text-gray-600 text-sm">1pm - 4pm</p>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">Great for all ages</p>
                        </button>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">How long should the magic last?</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[1.5, 2, 2.5, 3].map((duration) => (
                          <button
                            key={duration}
                            type="button"
                            onClick={() => handleFieldChange("duration", duration)}
                            className={`
                              p-4 rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105
                              ${formData.duration === duration
                                ? 'bg-primary-500 border-[hsl(var(--primary-500))] text-white shadow-lg'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-300))]'
                              }
                            `}
                          >
                            {duration === 1.5 ? '1½' : duration} hour{duration > 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
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
                </div>
              )}

              {/* Step 3: Theme Selection */}
              {currentStep === 2 && (
                <div className="">
                  <div className="text-center mb-8 bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] p-6 rounded-t-2xl">
                    <h2 className="text-3xl sm:text-3xl font-bold text-white mb-2">Choose Your Theme</h2>
                    <p className="text-white">What will make this party magical?</p>
                  </div>

                  <div className="space-y-8 px-4">
                    {/* No Theme Option */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleNoTheme}
                        className={`
                          px-8 py-4 rounded-xl border-2 font-bold transition-all duration-300 flex items-center gap-2
                          ${selectedTheme === 'no-theme'
                            ? 'bg-primary-500 border-[hsl(var(--primary-500))] text-white shadow-lg'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))]'
                          }
                        `}
                      >
                        <Sparkles className="w-5 h-5" />
                        No theme - Keep it simple and fun!
                      </button>
                    </div>

                    {/* Trending Themes */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                          🔥 Trending 2025
                        </h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="p-3 hover:bg-gray-100 rounded-full shadow-md transition-colors"
                            onClick={() => scrollThemes(trendingScrollRef, "left")}
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            className="p-3 hover:bg-gray-100 rounded-full shadow-md transition-colors"
                            onClick={() => scrollThemes(trendingScrollRef, "right")}
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
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
                                    ? "shadow-2xl ring-4 ring-[hsl(var(--primary-500))]"
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
                          <button
                            type="button"
                            className="p-3 hover:bg-gray-100 rounded-full shadow-md transition-colors"
                            onClick={() => scrollThemes(popularScrollRef, "left")}
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            className="p-3 hover:bg-gray-100 rounded-full shadow-md transition-colors"
                            onClick={() => scrollThemes(popularScrollRef, "right")}
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
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
                                    ? "shadow-2xl ring-4 ring-[hsl(var(--primary-500))]"
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
                </div>
              )}

              {/* Navigation */}
              <div className="bg-gray-50 px-6 py-4 sm:px-8 flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
                >
                  {currentStep > 0 ? 'Back' : ''}
                </button>

                {/* <div className="flex items-center gap-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${index === currentStep ? 'bg-primary-500 w-6' : 
                          index < currentStep ? 'bg-primary-700' : 'bg-gray-300'}
                      `}
                    />
                  ))}
                </div> */}

                <button
                  type="button"
                  onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                  disabled={
                    (currentStep === 0 && (!formData.date || !formData.guestCount || !formData.location)) ||
                    (currentStep === 1 && !formData.timeSlot) ||
                    isSubmitting
                  }
                  className="bg-primary-400 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Building Your Party...
                    </div>
                  ) : currentStep === steps.length - 1 ? (
                    'Create Magic ✨'
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Summary Card */}
            {currentStep > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-[hsl(var(--primary-500))]">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  Your Party So Far
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {formData.date && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Date:</span>
                      <span>{new Date(formData.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {formData.guestCount && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Guests:</span>
                      <span>{formData.guestCount}</span>
                    </div>
                  )}
                  {formData.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Location:</span>
                      <span>{formData.location}</span>
                    </div>
                  )}
                  {formData.timeSlot && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Time:</span>
                      <span className="capitalize">{formData.timeSlot} ({formData.duration}h)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Disclaimer */}
            <div className="text-center pt-6">
              <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
                🔒 Your preferences are only used to personalise your experience and create the perfect party for you
              </p>
            </div>
          </div>
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