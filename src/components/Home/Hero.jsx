"use client"

import Image from "next/image"
import { Star, ArrowRight, Check, AlertCircle, ArrowDown, Search, User, Calendar as CalendarIcon, UsersIcon, MapPin, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import SearchableEventTypeSelect from "@/components/searchable-event-type-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useGeolocation } from "@/hooks/useGeolocation"


export default function Hero({ handleSearch, hasAttemptedSubmit, formData, postcodeValid, isSubmitting, handleFieldChange, setPostcodeValid, validateAndFormatPostcode }){
  const router = useRouter()
  const { getPostcodeFromLocation, isLoading: isGettingLocation, error: locationError } = useGeolocation()

  const handleUseMyLocation = async () => {
    const result = await getPostcodeFromLocation()

    if (result.success && result.postcode) {
      handleFieldChange('postcode', result.postcode)
      const { isValid } = validateAndFormatPostcode(result.postcode)
      setPostcodeValid(isValid)
    } else if (result.error) {
      alert(result.error)
    }
  }

  return (
    <section className="md:pt-15 pb-8 md:pb-12 bg-[#fef7f7] lg:h-screen">
      <div className="container mx-auto">
        
        {/* Desktop Layout - Original */}
        <div className="hidden lg:block">
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
            {/* Hero Text - Left Side */}
            <div className="space-y-8">
              <h1 className="text-7xl font-black text-gray-900 leading-tight animate-fade-in">
                Book Your Party in a <span className="text-primary-500 relative">
                  Snap!
                </span>
              </h1>
              
              <h2 className="text-2xl  text-gray-700 max-w-xl leading-relaxed">
                Let Snappy handle the theme, the crew, and snacks too — just one click and a snap, and it's done for you!
              </h2>
            </div>

            {/* Hero Visual - Right Side */}
            <div className="relative">
              <div className="relative w-full h-64 lg:h-100 ">
                {/* Main party image */}
                <div className="relative w-full h-full bg-gradient-to-br from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] rounded-xl">
                  <Image
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752828017/iStock-1149320278_srn8ti-removebg-preview_njfbhn.png"
                    alt="People celebrating at a party"
                    fill
                    className="object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Search Form - Updated with venue checkbox */}
          <form onSubmit={handleSearch} className="relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 transition-all duration-300"
            style={{
              boxShadow: '0 10px 40px rgba(255, 107, 107, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
            <div className="h-40 w-40 absolute bottom-[-70px] left-[-100px] z-10">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752828180/ChatGPT_Image_Jul_18_2025_09_42_44_AM_k0a9wh.png"
                alt="Snappy the crocodile"
                fill
                sizes="100vw 100vh"
                priority
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
              
              {/* Event Date */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Event date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`
                          w-full justify-start text-left font-normal h-12 pl-10 pr-4
                          bg-white border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl
                          hover:bg-gray-50 hover:border-[hsl(var(--primary-300))] transition-colors
                          ${!formData.date && "text-gray-500"}
                          ${hasAttemptedSubmit && !formData.date ? 'border-red-300' : ''}
                        `}
                      >
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5  text-primary-400" />
                        {formData.date && !isNaN(new Date(formData.date)) ? (
                          <p className="ml-5">{format(new Date(formData.date), "EEEE, MMMM d, yyyy")}</p>
                        ) : (
                          <span className="ml-5">Select event date</span>
                        )}
                      </Button>
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
                  
                  {hasAttemptedSubmit && !formData.date && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10">
                      <p className="text-xs text-red-600 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-red-200">
                        <AlertCircle className="w-3 h-3" />
                        Event date is required
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Type */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Event type  <span className="text-red-500">*</span></label>
                <SearchableEventTypeSelect 
                  value={formData.theme}
                  onValueChange={(value) => handleFieldChange('theme', value)}
                  defaultValue="princess" 
                  required
                />
              </div>

              {/* Guests */}
              <div className="col-span-1 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Guests (up to)  <span className="text-red-500">*</span></label>
                <div className="relative">
                  <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <Select value={formData.guestCount} onValueChange={(value) => handleFieldChange('guestCount', value)} required>
                    <SelectTrigger className="bg-white py-6 px-28 text-gray-700 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 pl-10">
                      <SelectValue placeholder="Guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 guests</SelectItem>
                      <SelectItem value="10">10 guests</SelectItem>
                      <SelectItem value="15">15 guests</SelectItem>
                      <SelectItem value="20">20 guests</SelectItem>
                      <SelectItem value="25">25 guests</SelectItem>
                      <SelectItem value="30">30+ guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Postcode */}
              <div className="col-span-1 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Event postcode  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <Input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFieldChange('postcode', value);
                      const { isValid } = validateAndFormatPostcode(value);
                      setPostcodeValid(isValid);
                    }}
                    onBlur={() => {
                      const { isValid, formatted } = validateAndFormatPostcode(formData.postcode);
                      if (isValid && formatted !== formData.postcode) {
                        handleFieldChange('postcode', formatted);
                      }
                    }}
                    placeholder="e.g. W3 7QD or SW1A 1AA"
                    className={`
                      bg-white py-6 px-12 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 pl-10 pr-10
                      ${!postcodeValid && formData.postcode ? 'border-red-300 focus:border-red-500' : ''}
                    `}
                    required
                  />

                  {formData.postcode && (
                    postcodeValid ? (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                    )
                  )}

                  {!postcodeValid && formData.postcode && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10">
                      <p className="text-xs text-red-600 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-red-200">
                        <AlertCircle className="w-3 h-3" />
                        Please enter a valid UK postcode
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons row */}
                <div className="flex items-center justify-between gap-3 mt-1.5">
                  {/* Use My Location Button */}
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isGettingLocation}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-pulse' : ''}`} />
                    {isGettingLocation ? 'Finding...' : 'Use my location'}
                  </button>

                  {/* Divider */}
                  <span className="text-gray-300">|</span>

                  {/* Own Venue Toggle */}
                  <button
                    type="button"
                    onClick={() => handleFieldChange('hasOwnVenue', !formData.hasOwnVenue)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {formData.hasOwnVenue ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Own venue
                      </>
                    ) : (
                      <>Have own venue?</>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Button */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 opacity-0">
                  Action
                </label>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-6 px-8 rounded-full h-12 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Building Your Party...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center relative text-white font-bold text-lg">
                      Plan My Party! <span className="text-2xl ml-2">🎉</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:hidden">
          {/* Mobile Hero section - Compact but Impactful */}
          <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100 pb-2 overflow-hidden relative">

            <div className="px-4 pt-6 pb-1 relative z-10">
              <div className="max-w-screen mx-auto text-center">
                <h1 className="text-5xl font-black text-gray-900 mb-3 leading-tight animate-fade-in">
                  Book Your Party in a <span className="text-primary-500 relative">
                    Snap!
                    <div className="absolute -bottom-1 left-0 w-full h-1.5 bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] -skew-x-12 opacity-30"></div>
                  </span>
                </h1>
                <p className="text-base text-gray-700 max-w-4xl leading-relaxed font-medium">
                  Let Snappy handle everything — one click and it's done!
                </p>
              </div>
            </div>

            {/* Removed image section to save space */}
          </div>
 
          <style jsx>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-4px); }
            }
            
            .animate-fade-in {
              animation: fade-in 0.8s ease-out;
            }
            
            .animate-spin-slow {
              animation: spin-slow 3s linear infinite;
            }
          `}</style>
        </div>
      </div>
    </section>
  )
}