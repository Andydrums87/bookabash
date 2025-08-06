"use client"
import { Calendar as CalendarIcon, UsersIcon, MapPin, Check, AlertCircle } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SearchableEventTypeSelect from "@/components/searchable-event-type-select"
import Image from "next/image"
import { format } from "date-fns"

export default function MobileSearchForm({
  handleSearch,
  formData,
  handleFieldChange,
  postcodeValid,
  setPostcodeValid,
  validateAndFormatPostcode,
  isSubmitting,
}) {
  
  // Form validation function
  const isFormValid = () => {
    return (
      formData.date && 
      formData.theme && 
      formData.guestCount && 
      formData.postcode && 
      postcodeValid // Make sure postcode is not just filled but also valid
    );
  };

  // Enhanced handleSearch with validation
  const handleMobileSearch = async (e) => {
    e.preventDefault()
    
    // Check if form is valid before submitting
    if (!isFormValid()) {
      alert('Please fill in all required fields before submitting.');
      return;
    }
    
    // Call the original handleSearch function
    handleSearch(e);
  };

  return (
    <div className="md:hidden px-4 -mt-37 py-10 relative z-30" id="search-form">
      <div className="">
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
             <div className="w-20 h-20 flex-shrink-0">
               <Image
                 src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753877863/ChatGPT_Image_Jul_30__2025__01_16_49_PM-removebg_kx7ped.png"
                 alt="Snappy"
                 width={50}
                 height={50}
                 className="w-full h-full object-contain"
               />
             </div>
             <div className="flex flex-col">
               <p>Quick Start</p>    
               <p className="text-gray-400 text-base mb-4">See how easy it is to build you party in just one click</p>
             </div>
           </h2>
         </div>
         <form onSubmit={handleMobileSearch} className="bg-white rounded-3xl p-6 shadow-2xl border border-primary-100/50">
  <div className="space-y-6">
    
    {/* Event Date - STANDARDIZED */}
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Event date <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`
                w-full justify-start text-left font-normal h-12 pl-10 pr-4
                bg-gray-50 border-gray-200 focus:border-[hsl(var(--primary-400))] rounded-xl
                hover:bg-gray-50 hover:border-[hsl(var(--primary-400))] transition-colors
                ${!formData.date && "text-gray-500"}
                ${!formData.date ? 'border-red-300' : ''}
              `}
            >
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
              {formData.date && !isNaN(new Date(formData.date)) ? (
                format(new Date(formData.date), "EEEE, MMMM d, yyyy")
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
        
        {!formData.date && (
          <div className="mt-1">
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Event date is required
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Event Type - STANDARDIZED */}
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Event type <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <SearchableEventTypeSelect
          value={formData.theme}
          onValueChange={(value) => handleFieldChange("theme", value)}
          defaultValue="princess"
          className="h-12"
          required
        />
        {!formData.theme && (
          <div className="mt-1">
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Event type is required
            </p>
          </div>
        )}
      </div>
    </div>
    
    {/* Guests - STANDARDIZED */}
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Guests <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
        <Select 
          value={formData.guestCount} 
          onValueChange={(value) => handleFieldChange("guestCount", value)}
          required
        >
          <SelectTrigger className={`
            bg-gray-50 w-full py-6 border-gray-200 focus:border-[hsl(var(--primary-400))] rounded-xl h-12 pl-10 text-sm
            ${!formData.guestCount ? 'border-red-300' : ''}
          `}>
            <SelectValue placeholder="Select guest count" />
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
        {!formData.guestCount && (
          <div className="mt-1">
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Guest count is required
            </p>
          </div>
        )}
      </div>
    </div>
    
    {/* Postcode - STANDARDIZED */}
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Postcode <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
        <Input
          type="text"
          value={formData.postcode}
          onChange={(e) => {
            const value = e.target.value
            handleFieldChange("postcode", value)
            const { isValid } = validateAndFormatPostcode(value)
            setPostcodeValid(isValid)
          }}
          onBlur={() => {
            const { isValid, formatted } = validateAndFormatPostcode(formData.postcode)
            if (isValid && formatted !== formData.postcode) {
              handleFieldChange("postcode", formatted)
            }
          }}
          placeholder="Enter your postcode"
          className={`
            bg-gray-50 border-gray-200 focus:border-primary-400 focus:ring-primary-400/20 rounded-xl h-12 pl-10 pr-10 text-base
            ${(!postcodeValid && formData.postcode) || (!formData.postcode) ? 'border-red-300 focus:border-red-500' : ''}
          `}
          required
        />
        {formData.postcode &&
          (postcodeValid ? (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          ))}
      </div>
      {!postcodeValid && formData.postcode && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Please enter a valid UK postcode
        </p>
      )}
      {!formData.postcode && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Postcode is required
        </p>
      )}
      {postcodeValid && formData.postcode && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <Check className="w-3 h-3" />
          Valid postcode
        </p>
      )}
    </div>

    {/* Search Button - STANDARDIZED */}
    <Button
      type="submit"
      disabled={isSubmitting || !isFormValid()}
      className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-4 px-6 rounded-xl h-14 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Building Your Party...
        </div>
      ) : (
        <div className="flex items-center justify-center relative text-white font-bold">
          Plan My Party! <span className="text-2xl ml-2">🎉</span>
        </div>
      )}
    </Button>
  </div>
</form>
    </div>
  )
}