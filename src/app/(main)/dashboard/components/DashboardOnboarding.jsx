"use client"
import React, { useState, useRef, useEffect } from 'react';
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
  PoundSterling,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
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
    startTime: "", // Changed from timeSlot to startTime
    duration: 2,
    guestCount: "",
    location: "",
    budget: 600,
    theme: "",
    customStartTime: "",
    needsCustomTime: false,
  })

  const [selectedTheme, setSelectedTheme] = useState("")
  const [showLoader, setShowLoader] = useState(false)
  const [loaderProgress, setLoaderProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  // Refs for scrolling
  const trendingScrollRef = useRef(null)
  const popularScrollRef = useRef(null)
  const formContainerRef = useRef(null) // ✅ NEW: Ref for scroll target

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

      // Calculate end time for the party
      const calculateEndTime = (startTime, duration) => {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const totalMinutes = startHour * 60 + startMinute + (duration * 60);
        const endHour = Math.floor(totalMinutes / 60);
        const endMinute = Math.floor(totalMinutes % 60);
        return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      }

      const submitData = {
        date: formData.date,
        startTime: formData.startTime, // 24-hour format like "14:00"
        endTime: calculateEndTime(formData.startTime, formData.duration),
        duration: formData.duration,
        theme: selectedTheme === "no-theme" ? null : selectedTheme,
        guestCount: formData.guestCount,
        postcode: formData.location,
        budget: formData.budget,
        timePreference: {
          type: "specific",
          startTime: formData.startTime,
          duration: formData.duration,
          endTime: calculateEndTime(formData.startTime, formData.duration),
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

  // ✅ NEW: Smooth scroll to top function
  const scrollToTop = () => {
    // Scroll the window to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

    // Also scroll the form container if it exists (for mobile)
    if (formContainerRef.current) {
      formContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // ✅ NEW: Enhanced step navigation with scroll
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      // Scroll to top after step change
      setTimeout(scrollToTop, 100) // Small delay to ensure state update
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      // Scroll to top after step change  
      setTimeout(scrollToTop, 100)
    }
  }

  // ✅ NEW: Scroll to top when step changes (backup)
  useEffect(() => {
    scrollToTop()
  }, [currentStep])

  // Budget category helper
  const getBudgetCategory = (budget) => {
    if (budget < 500) return "Essential"
    if (budget < 700) return "Complete"
    return "Premium"
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

          {/* ✅ NEW: Add ref to form container for scroll targeting */}
          <div ref={formContainerRef} className="max-w-4xl mx-auto px-4 py-8">
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

                    {/* Budget Slider */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <PoundSterling className="w-4 h-4 text-primary-500" />
                        What's your budget?
                      </label>
                      
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary-500 mb-2">
                            £{formData.budget}
                          </div>
                          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border-0 ${
                            getBudgetCategory(formData.budget) === "Essential"
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                              : getBudgetCategory(formData.budget) === "Complete"
                                ? "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white"
                                : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                          }`}>
                            {getBudgetCategory(formData.budget)} Party
                          </div>
                        </div>
                        
                        <Slider
                          value={[formData.budget]}
                          onValueChange={(value) => handleFieldChange("budget", value[0])}
                          max={1000}
                          min={300}
                          step={50}
                          className="w-full [&>span:first-child]:h-4 [&>span:first-child>span]:h-4 [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-[hsl(var(--primary-500))] [&>span:first-child>span]:to-[hsl(var(--primary-600))] [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-[hsl(var(--primary-100))] [&>span:first-child]:to-[hsl(var(--primary-200))] [&>span:first-child]:border [&>span:first-child]:border-[hsl(var(--primary-200))] [&>span:first-child]:shadow-inner"
                        />
                        
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                          <span>£300</span>
                          <span>£1000+</span>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            This helps us find the perfect suppliers for your celebration!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

             
{/* Step 2: Timing */}
{currentStep === 1 && (
                <div className="">
                  <div className="text-center mb-8 bg-gradient-to-r from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] p-6 rounded-t-2xl">
                    <h2 className="text-3xl sm:text-3xl font-bold text-white mb-2">Perfect Timing</h2>
                    <p className="text-white">What time works best for your family?</p>
                  </div>

                  <div className="space-y-8 px-4">
                    {/* Start Time */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        What time should the party start?
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {[
                          { value: "09:00", label: "9am", popular: false },
                          { value: "10:00", label: "10am", popular: true },
                          { value: "11:00", label: "11am", popular: true },
                          { value: "12:00", label: "12pm", popular: true },
                          { value: "13:00", label: "1pm", popular: true },
                          { value: "14:00", label: "2pm", popular: true },
                          { value: "15:00", label: "3pm", popular: false },
                          { value: "16:00", label: "4pm", popular: false },
                          { value: "17:00", label: "5pm", popular: false },
                        ].map((time) => (
                          <button
                            key={time.value}
                            type="button"
                            onClick={() => handleFieldChange("startTime", time.value)}
                            className={`
                              relative p-4 rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105
                              ${formData.startTime === time.value
                                ? 'bg-primary-500 border-[hsl(var(--primary-500))] text-white shadow-lg'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-300))]'
                              }
                            `}
                          >
                            {time.popular && formData.startTime !== time.value && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></div>
                            )}
                            {time.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        💡 Popular times are marked with a dot
                      </p>
                    </div>

                    {/* Duration */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">How long should the magic last?</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { value: 1.5, label: "1½ hours", popular: false },
                          { value: 2, label: "2 hours", popular: true },
                          { value: 2.5, label: "2½ hours", popular: false },
                          { value: 3, label: "3 hours", popular: true },
                          { value: 3.5, label: "3½ hours", popular: false },
                          { value: 4, label: "4 hours", popular: false },
                        ].map((duration) => (
                          <button
                            key={duration.value}
                            type="button"
                            onClick={() => handleFieldChange("duration", duration.value)}
                            className={`
                              relative p-4 rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105
                              ${formData.duration === duration.value
                                ? 'bg-primary-500 border-[hsl(var(--primary-500))] text-white shadow-lg'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-300))]'
                              }
                            `}
                          >
                            {duration.popular && formData.duration !== duration.value && (
                              <span className="absolute top-1 right-1 text-xs bg-yellow-400 text-yellow-800 px-1 rounded">★</span>
                            )}
                            {duration.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Party Time Preview */}
                    {formData.startTime && formData.duration && (
                      <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] border-2 border-[hsl(var(--primary-200))] rounded-2xl p-6 text-center">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Your Party Time</h4>
                        <div className="text-3xl font-bold text-primary-600 mb-2">
                          {(() => {
                            const startTime = formData.startTime;
                            const duration = parseFloat(formData.duration);
                            
                            // Format start time
                            const [startHour, startMinute] = startTime.split(':').map(Number);
                            const startAmPm = startHour >= 12 ? 'pm' : 'am';
                            const start12Hour = startHour === 0 ? 12 : startHour > 12 ? startHour - 12 : startHour;
                            const startFormatted = `${start12Hour}${startMinute > 0 ? `:${startMinute.toString().padStart(2, '0')}` : ''}${startAmPm}`;
                            
                            // Calculate end time
                            const totalMinutes = startHour * 60 + startMinute + (duration * 60);
                            const endHour = Math.floor(totalMinutes / 60);
                            const endMinute = Math.floor(totalMinutes % 60);
                            const endAmPm = endHour >= 12 ? 'pm' : 'am';
                            const end12Hour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
                            const endFormatted = `${end12Hour}${endMinute > 0 ? `:${endMinute.toString().padStart(2, '0')}` : ''}${endAmPm}`;
                            
                            return `${startFormatted} - ${endFormatted}`;
                          })()}
                        </div>
                        <p className="text-gray-600">
                          Perfect! That's {formData.duration} hour{formData.duration > 1 ? 's' : ''} of celebration time ✨
                        </p>
                      </div>
                    )}

                    {/* Custom Time Option */}
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-800 font-medium"
                        onClick={() => handleFieldChange("needsCustomTime", !formData.needsCustomTime)}
                      >
                        {formData.needsCustomTime ? "Choose from preset times" : "I need a different start time"}
                      </Button>
                    </div>

                    {/* Custom Time Input */}
                    {formData.needsCustomTime && (
                      <div className="max-w-lg mx-auto mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg">
                        <div className="text-center mb-4">
                          <h4 className="font-bold text-blue-800 mb-2">Custom Start Time</h4>
                          <p className="text-sm text-blue-700">
                            Enter any time between 8am and 6pm
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <Input
                            type="time"
                            min="08:00"
                            max="18:00"
                            value={formData.customStartTime || ""}
                            onChange={(e) => {
                              handleFieldChange("customStartTime", e.target.value)
                              handleFieldChange("startTime", e.target.value)
                            }}
                            className="flex-1 border-blue-300 focus:border-blue-500 rounded-xl"
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

            {/* ✅ UPDATED: Navigation with scroll functionality */}
            <div className="bg-gray-50 px-6 py-4 sm:px-8 flex justify-between items-center">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
              >
                {currentStep > 0 ? 'Back' : ''}
              </button>

              <button
                type="button"
                onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                disabled={
                  (currentStep === 0 && (!formData.date || !formData.guestCount || !formData.location)) ||
                  (currentStep === 1 && (!formData.startTime || !formData.duration)) ||
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
                  {formData.budget && (
                    <div className="flex items-center gap-2">
                      <PoundSterling className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Budget:</span>
                      <span>£{formData.budget}</span>
                    </div>
                  )}
                  {formData.startTime && formData.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Time:</span>
                      <span>
                        {(() => {
                          const startTime = formData.startTime;
                          const duration = parseFloat(formData.duration);
                          
                          // Format start time
                          const [startHour, startMinute] = startTime.split(':').map(Number);
                          const startAmPm = startHour >= 12 ? 'pm' : 'am';
                          const start12Hour = startHour === 0 ? 12 : startHour > 12 ? startHour - 12 : startHour;
                          const startFormatted = `${start12Hour}${startMinute > 0 ? `:${startMinute.toString().padStart(2, '0')}` : ''}${startAmPm}`;
                          
                          // Calculate end time
                          const totalMinutes = startHour * 60 + startMinute + (duration * 60);
                          const endHour = Math.floor(totalMinutes / 60);
                          const endMinute = Math.floor(totalMinutes % 60);
                          const endAmPm = endHour >= 12 ? 'pm' : 'am';
                          const end12Hour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
                          const endFormatted = `${end12Hour}${endMinute > 0 ? `:${endMinute.toString().padStart(2, '0')}` : ''}${endAmPm}`;
                          
                          return `${startFormatted} - ${endFormatted} (${duration}h)`;
                        })()}
                      </span>
                    </div>
                  )}
                  {selectedTheme && selectedTheme !== 'no-theme' && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Theme:</span>
                      <span className="capitalize">{selectedTheme.replace('-', ' ')}</span>
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