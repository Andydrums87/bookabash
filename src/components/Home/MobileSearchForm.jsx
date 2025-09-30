"use client"
import { useEffect } from "react"
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
  hasAttemptedSubmit,
  setShowFloatingCTA,
  showFloatingCTA
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
    <div className="md:hidden px-4 -mt-37 py-10 relative z-30 bg-primary-50 " id="search-form">
 <div className="text-center mb-16">
 <h2 className="text-5xl font-black text-gray-900 mb-3">
          Plan Your{" "}
          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]">
            Dream Party
            <div className="absolute -bottom-1 left-0 w-full h-2 bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] -skew-x-12 opacity-30"></div>
          </span>
        </h2>
        <p className="text-xl text-gray-700 mt-10 font-medium">
          In just 30 seconds! 
        </p>
        </div>
         <form onSubmit={handleMobileSearch} className="bg-white rounded-3xl p-6 shadow-2xl border-[hsl(var(--primary-500))] border-2">
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
            w-full font-normal h-12 
            bg-white border-gray-200 focus:border-[hsl(var(--primary-400))] justify-start rounded-xl
            hover:bg-gray-50 hover:border-[hsl(var(--primary-400))] transition-colors 
            ${!formData.date && "text-gray-500"}
            ${hasAttemptedSubmit && !formData.date ? 'border-red-300' : ''}
          `}
        >
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
          {formData.date && !isNaN(new Date(formData.date)) ? (
            <span className="ml-5">{format(new Date(formData.date), "EEEE, MMMM d, yyyy")}</span>
            
 
          ) : (
            <span className="ml-5 text-gray-800">Select event date</span>
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
    
    {/* FIXED: Only show validation message after submit attempt */}
    {hasAttemptedSubmit && !formData.date && (
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
      <div className="relative ">
        <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
        <Select 
          value={formData.guestCount} 
          onValueChange={(value) => handleFieldChange("guestCount", value)}
          required
          
        >
          <SelectTrigger className={`
            bg-white text-gray-600 w-full py-6 border-gray-200 focus:border-[hsl(var(--primary-400))] rounded-xl h-12 pl-10 text-sm
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
           {/* FIXED: Only show validation message after submit attempt */}
    {hasAttemptedSubmit && !formData.guestCount && (
      <div className="mt-1">
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
         Guest Count is required
        </p>
      </div>
    )}
           

      </div>
    </div>
    
    {/* Postcode - FIXED VALIDATION */}
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
            bg-white placeholder:text-gray-700 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-[hsl(var(--primary-400))] rounded-xl h-12 pl-10 pr-10 text-base
            ${formData.postcode && !postcodeValid ? 'border-red-300 focus:border-red-500' : ''}
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
      
      {/* Only show validation messages when there's actually text in the field */}
      {formData.postcode && !postcodeValid && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Please enter a valid UK postcode
        </p>
      )}
      {formData.postcode && postcodeValid && (
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
      className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white text-lg font-bold py-4 px-6 rounded-full h-14 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
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