"use client"
import { Calendar, UsersIcon, MapPin, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SearchableEventTypeSelect from "@/components/searchable-event-type-select"

export default function MobileSearchForm({
  handleSearch,
  formData,
  handleFieldChange,
  postcodeValid,
  setPostcodeValid,
  validateAndFormatPostcode,
  isSubmitting,
}) {
  return (
    <div className="md:hidden px-4 -mt-16 relative z-30" id="search-form">
      <form onSubmit={handleSearch} className="bg-white rounded-3xl p-6 shadow-2xl border border-primary-100/50">
        <div className="space-y-6">
          {/* Event Date */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Event Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className="bg-gray-50 border-gray-200 focus:border-primary-400 focus:ring-primary-400/20 rounded-xl h-14 pl-12 font-medium"
              />
            </div>
          </div>

          {/* Event Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Event Type</label>
            <SearchableEventTypeSelect
              value={formData.theme}
              onValueChange={(value) => handleFieldChange("theme", value)}
              defaultValue="princess"
              className="h-14"
            />
          </div>

          {/* Guests and Postcode - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Guests</label>
              <div className="relative">
                <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
                <Select value={formData.guestCount} onValueChange={(value) => handleFieldChange("guestCount", value)}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-primary-400 rounded-xl h-14 pl-10 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="30">30+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Postcode</label>
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
                  placeholder="Postcode"
                  className={`bg-gray-50 border-gray-200 focus:border-primary-400 focus:ring-primary-400/20 rounded-xl h-14 pl-10 pr-10 text-sm ${
                    !postcodeValid && formData.postcode ? "border-red-300 focus:border-red-500" : ""
                  }`}
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
                  Invalid postcode
                </p>
              )}
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl h-14 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Building Your Party...
              </div>
            ) : (
              "Create My Perfect Party"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
