"use client"

import Image from "next/image"
import { Star, ArrowRight, Check, AlertCircle, ArrowDown, Search, User, Calendar, UsersIcon, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import SearchableEventTypeSelect from "@/components/searchable-event-type-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function Hero({ handleSearch, formData, postcodeValid, isSubmitting, handleFieldChange, setPostcodeValid, validateAndFormatPostcode }){
  const router = useRouter()
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA when user scrolls down more than 50px
      if (window.scrollY > 50) {
        setShowFloatingCTA(true)
      } else {
        setShowFloatingCTA(false)
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <section className="md:pt-15 pb-8 md:pb-12 bg-[#fef7f7] h-screen">
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

          {/* Desktop Search Form - Updated with party builder */}
          <form onSubmit={handleSearch} className="relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 transition-all duration-300"
            style={{
              boxShadow: '0 10px 40px rgba(255, 107, 107, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
            <div className="h-40 w-40 absolute bottom-[-70px] left-[-100px] z-50">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752828180/ChatGPT_Image_Jul_18_2025_09_42_44_AM_k0a9wh.png"
                alt="Snappy the crocodile"
                fill
                sizes="100vw"
                priority
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
              
              {/* Event Date */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Event date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    className="bg-white border-gray-200 focus:border-[hsl(var(--primary-500))] !rounded-xl h-12 pl-10 w-full"
                    placeholder="Date"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Event type</label>
                <SearchableEventTypeSelect 
                  value={formData.theme}
                  onValueChange={(value) => handleFieldChange('theme', value)}
                  defaultValue="princess" 
                />
              </div>

              {/* Guests */}
              <div className="col-span-1 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Guests (up to)</label>
                <div className="relative">
                  <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Select value={formData.guestCount} onValueChange={(value) => handleFieldChange('guestCount', value)}>
                    <SelectTrigger className="bg-white py-6 px-22 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 pl-10">
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

              {/* Postcode - Desktop with validation (fixed layout) */}
              <div className="col-span-1 md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Event postcode
                </label>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    placeholder="Enter your postcode"
                    className={`
                      bg-white py-6 px-12 border-gray-200 focus:border-[hsl(var(--primary-500))] rounded-xl h-12 pl-10 pr-10
                      ${!postcodeValid && formData.postcode ? 'border-red-300 focus:border-red-500' : ''}
                    `}
                  />
                  
                  {/* Validation icon */}
                  {formData.postcode && (
                    postcodeValid ? (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                    )
                  )}
                  
                  {/* Validation message - positioned absolutely to not affect layout */}
                  {!postcodeValid && formData.postcode && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10">
                      <p className="text-xs text-red-600 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-red-200">
                        <AlertCircle className="w-3 h-3" />
                        Please enter a valid UK postcode
                      </p>
                    </div>
                  )}
                  
                  {postcodeValid && formData.postcode && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10">
                      <p className="text-xs text-green-600 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-green-200">
                        <Check className="w-3 h-3" />
                        Valid postcode
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button - Updated */}
              <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 md:flex md:items-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-6 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          {/* Mobile Hero section with vibrant energy */}
          <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100 pb-8 overflow-hidden relative">
            
            {/* Text content section */}
            <div className="px-6 pt-8 pb-4 relative z-10">
              <div className="max-w-screen mx-auto text-center">
                <h1 className="text-6xl font-black text-gray-900 mb-4 leading-tight animate-fade-in">
                  Book Your Party in a <span className="text-primary-500 relative">
                    Snap!
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-4xl leading-relaxed">
                  Let Snappy handle the theme, the crew, and snacks too — just one click and a snap, and it's done for you!
                </p>
              </div>
            </div>

            {/* Image section with dynamic elements */}
            <div className="px-6 mb-8 relative">
              <div className="relative w-full h-50 bg-gradient-to-br from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] rounded-3xl overflow-hidden mx-auto max-w-sm shadow-xl transform hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752828017/iStock-1149320278_srn8ti-removebg-preview_njfbhn.png"
                  alt="People celebrating at a party"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Floating CTA with Scroll-Triggered Visibility */}
            <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
              showFloatingCTA 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-16 opacity-0 pointer-events-none'
            }`}>
              <button 
                onClick={() => {
                  router.push('/dashboard')
                }}
                className="bg-white active:scale-200 active:bg-[hsl(var(--primary-100))] hover:bg-gray-50 text-[hsl(var(--primary-500))] font-bold h-16 w-64 sm:w-72 rounded-full transition-all duration-300 transform hover:scale-105 relative overflow-hidden group border-2 border-[hsl(var(--primary-500))] animate-bounce-gentle shadow-lg hover:shadow-2xl"
                style={{
                  boxShadow: '0 0 30px rgba(255, 107, 107, 0.4), 0 8px 32px rgba(0, 0, 0, 0.15)',
                  animation: showFloatingCTA ? 'float 3s ease-in-out infinite' : 'none'
                }}
              >
                {/* Button background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--primary-100))] to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500 transform -skew-x-12"></div>
                
                <div className="flex items-center justify-center relative z-10 h-full">
                  Plan My Party! <span className="text-2xl ml-2">🎉</span>
                </div>
              </button>
              
              {/* Snappy the crocodile */}
              <div className="w-20 h-20 absolute top-2 left-[-15px] z-200">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752828180/ChatGPT_Image_Jul_18_2025_09_42_44_AM_k0a9wh.png"
                  alt="Snappy the crocodile"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Custom animations */}
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