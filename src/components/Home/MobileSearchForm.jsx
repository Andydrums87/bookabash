"use client"
import { useEffect } from "react"
import { Calendar as CalendarIcon, UsersIcon, MapPin, Check, AlertCircle, Navigation } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SearchableEventTypeSelect from "@/components/searchable-event-type-select"
import Image from "next/image"
import { format } from "date-fns"
import { useGeolocation } from "@/hooks/useGeolocation"

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
  const { getPostcodeFromLocation, isLoading: isGettingLocation, error: locationError } = useGeolocation()

  const isFormValid = () => {
    return (
      formData.date &&
      formData.theme &&
      formData.guestCount &&
      formData.postcode &&
      postcodeValid
    );
  };

  const handleUseMyLocation = async () => {
    const result = await getPostcodeFromLocation()

    if (result.success && result.postcode) {
      handleFieldChange('postcode', result.postcode)
      const { isValid } = validateAndFormatPostcode(result.postcode)
      setPostcodeValid(isValid)
    } else if (result.error) {
      alert(result.error)
    }
  };

  const handleMobileSearch = async (e) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      alert('Please fill in all required fields before submitting.');
      return;
    }
    
    handleSearch(e);
  };

  return (
    <div className="md:hidden px-4 pt-2 pb-4 relative z-30 bg-primary-50 " id="search-form">
      <form onSubmit={handleMobileSearch} className="bg-white rounded-3xl p-4 shadow-2xl border-[hsl(var(--primary-500))] border-2">
        <div className="space-y-4">
    
          {/* Event Date */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Event date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`
                      w-full font-normal h-10
                      bg-white border-gray-200 focus:border-[hsl(var(--primary-400))] justify-start rounded-xl
                      hover:bg-gray-50 hover:border-[hsl(var(--primary-400))] transition-colors
                      ${!formData.date && "text-gray-500"}
                      ${hasAttemptedSubmit && !formData.date ? 'border-red-300' : ''}
                    `}
                  >
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
                    {formData.date && !isNaN(new Date(formData.date)) ? (
                      <span className="ml-5 text-sm">{format(new Date(formData.date), "EEE, MMM d, yyyy")}</span>
                    ) : (
                      <span className="ml-5 text-gray-800 text-sm">Select event date</span>
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
                <div className="mt-1">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Event date is required
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
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
    
          {/* Guests */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
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
                  bg-white text-gray-600 w-full py-5 border-gray-200 focus:border-[hsl(var(--primary-400))] rounded-xl h-10 pl-10 text-sm
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
    
          {/* Postcode */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
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
                placeholder="e.g. W3 7QD or SW1A 1AA"
                className={`
                  bg-white placeholder:text-gray-500 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-[hsl(var(--primary-400))] rounded-xl h-10 pl-10 pr-10 text-sm
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

            {/* Action buttons row */}
            <div className="flex items-center justify-between gap-3 mt-1">
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
            </div>

            {formData.postcode && !postcodeValid && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                Please enter a valid UK postcode
              </p>
            )}
            {formData.postcode && postcodeValid && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" />
                Valid postcode
              </p>
            )}
          </div>

          {/* NEW: Own Venue Checkbox */}
          <div className="space-y-2 pt-1">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="hasOwnVenue-mobile"
                checked={formData.hasOwnVenue || false}
                onCheckedChange={(checked) => handleFieldChange('hasOwnVenue', checked)}
                className="mt-0.5 "
              />
              <label
                htmlFor="hasOwnVenue-mobile"
                className="text-sm font-medium text-gray-700 cursor-pointer select-none leading-tight"
              >
                I already have my own venue
              </label>
            </div>
            {formData.hasOwnVenue && (
              <p className="text-xs text-primary-600 ml-7 flex items-center gap-1">
                <Check className="w-3 h-3" />
                We'll build your party plan without including a venue
              </p>
            )}
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white text-base font-bold py-3 px-6 rounded-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
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