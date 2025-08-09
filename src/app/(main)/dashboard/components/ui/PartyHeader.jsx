"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, Users, MapPin, Sparkles, Clock, Sun, Sunset, ChevronDown, ChevronUp } from "lucide-react"
import EditPartyModal from "../Modals/EditPartyModal"
import BudgetControls from "@/components/budget-controls"
import { useToast } from '@/components/ui/toast'

// ... (keep all the utility functions the same)
const formatDateForDisplay = (dateInput) => {
  if (!dateInput) return null;
  
  let date;
  
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    if (dateInput.includes('th ') || dateInput.includes('st ') || dateInput.includes('nd ') || dateInput.includes('rd ')) {
      return dateInput;
    }
    
    if (dateInput.includes('•')) {
      const datePart = dateInput.split('•')[0].trim();
      date = new Date(datePart);
    } else {
      date = new Date(dateInput);
    }
  } else {
    return null;
  }
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  const day = date.getDate();
  const suffix = getDaySuffix(day);
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.getFullYear();
  
  return `${day}${suffix} ${month}, ${year}`;
};

const getDaySuffix = (day) => {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const formatTimeSlotForDisplay = (timeSlot, confirmedStartTime = null, duration = 2) => {
  if (confirmedStartTime) {
    const startTime = formatTimeForDisplay(confirmedStartTime);
    const endTime = calculateEndTime(confirmedStartTime, duration);
    return `${startTime} - ${endTime}`;
  }
  
  const timeSlotDisplays = {
    morning: "Morning Party",
    afternoon: "Afternoon Party"
  };
  
  return timeSlotDisplays[timeSlot] || "Afternoon Party";
};

const formatTimeForDisplay = (timeInput) => {
  if (!timeInput) return null;
  
  try {
    if (typeof timeInput === 'string' && timeInput.includes(':')) {
      const [hours, minutes] = timeInput.split(':');
      const timeObj = new Date();
      timeObj.setHours(parseInt(hours), parseInt(minutes));
      
      return timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    
    const timeObj = new Date(`2000-01-01T${timeInput}`);
    return timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',  
      hour12: true,
    });
  } catch (error) {
    return timeInput;
  }
};

const calculateEndTime = (startTime, duration = 2) => {
  if (!startTime) return null;
  
  try {
    const [hours, minutes] = startTime.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000));
    
    return endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    return null;
  }
};

const formatDurationForDisplay = (duration) => {
  if (!duration) return '2 hours';
  
  if (duration === Math.floor(duration)) {
    return `${duration} hours`;
  } else {
    const hours = Math.floor(duration);
    const minutes = (duration - hours) * 60;
    
    if (minutes === 30) {
      return `${hours}½ hours`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }
};

const getTimeSlotIcon = (timeSlot) => {
  switch (timeSlot) {
    case 'morning':
      return Sun;
    case 'afternoon':
      return Sunset;
    default:
      return Clock;
  }
};

export default function PartyHeader({ 
  theme, 
  partyDetails, 
  onPartyDetailsChange, 
  // Budget props for mobile integration
  totalSpent = 0,
  tempBudget = 600,
  budgetControlProps = {},
  isPaymentConfirmed,
  enquiries = [],
  isSignedIn = false,

}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBudgetExpanded, setIsBudgetExpanded] = useState(false)
  const [showEditBlockedAlert, setShowEditBlockedAlert] = useState(false)
  const currentTheme = theme
  const hasEnquiriesPending = enquiries.length > 0 && isSignedIn && !isPaymentConfirmed;

 

  const { toast } = useToast()
  
const handleEditClick = () => {
  if (hasEnquiriesPending) {
    toast.warning("Cannot edit party details while awaiting supplier responses", {
      title: "Party Details Locked",
      duration: 4000
    })
  } else {
    setIsEditModalOpen(true)
  }
}
const isAlaCarteUser = () => {
  try {
    const partyDetails = localStorage.getItem('party_details')
    if (partyDetails) {
      const parsed = JSON.parse(partyDetails)
      return parsed.source === 'a_la_carte'
    }
    return false
  } catch {
    return false
  }
}


  // Helper functions for mobile vs desktop names - FIXED VERSION
const getFirstName = () => {
  // First try to get firstName directly
  if (partyDetails?.firstName) {
    return partyDetails.firstName;
  }
  
  // Then try to extract from childName (which comes from database as child_name)
  if (partyDetails?.childName) {
    const nameParts = partyDetails.childName.split(' ');
    return nameParts[0];
  }
  
  return "Emma"; // fallback
};

const getFullName = () => {
  // First try to construct from firstName + lastName
  if (partyDetails?.firstName || partyDetails?.lastName) {
    return `${partyDetails?.firstName || ''} ${partyDetails?.lastName || ''}`.trim();
  }
  
  // Then use childName directly (this comes from database)
  if (partyDetails?.childName) {
    return partyDetails.childName;
  }
  
  return "Emma"; // fallback
};
  const savePartyDetails = (details) => {
    try {
      const existingDetails = JSON.parse(localStorage.getItem("party_details") || "{}")
      
      const processedDetails = {
        ...existingDetails,
        ...details,
      };
      
      if (details.date) {
        processedDetails.displayDate = formatDateForDisplay(details.date);
      }
      
      if (details.timeSlot || details.confirmedStartTime) {
        processedDetails.displayTimeSlot = formatTimeSlotForDisplay(
          details.timeSlot, 
          details.confirmedStartTime, 
          details.duration
        );
      }
      
      if (details.duration) {
        processedDetails.displayDuration = formatDurationForDisplay(details.duration);
      }
      
      processedDetails.postcode = details.postcode ||
        (details.location?.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) ? details.location : existingDetails.postcode);
      
      localStorage.setItem("party_details", JSON.stringify(processedDetails));
      
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "party_details",
          newValue: JSON.stringify(processedDetails),
        }),
      );
      
      return processedDetails;
    } catch (error) {
      console.error("Error saving party details:", error);
      return details;
    }
  };

  const handleSavePartyDetails = (updatedDetails) => {
    const savedDetails = savePartyDetails(updatedDetails);
    
    if (onPartyDetailsChange) {
      onPartyDetailsChange(savedDetails);
    }
  };


  const getModalPartyDetails = () => {
    const details = { ...partyDetails };

    let firstName = details.firstName || "Snappy";
    let lastName = details.lastName || "";
    
    if (!details.firstName && !details.lastName && details.childName) {
      const nameParts = details.childName.split(' ');
      firstName = nameParts[0] || "Snappy";
      lastName = nameParts.slice(1).join(' ') || "";
    }

    let parsedDate = new Date();
    
    if (details.date) {
      try {
        if (details.date instanceof Date && !isNaN(details.date.getTime())) {
          parsedDate = details.date;
        } else if (typeof details.date === 'string') {
          if (details.date.includes('th ') || details.date.includes('st ') || details.date.includes('nd ') || details.date.includes('rd ')) {
            const dateStr = details.date.replace(/(\d+)(st|nd|rd|th)\s/, '$1 ');
            const testDate = new Date(dateStr);
            if (!isNaN(testDate.getTime())) {
              parsedDate = testDate;
            }
          } else {
            const testDate = new Date(details.date);
            if (!isNaN(testDate.getTime())) {
              parsedDate = testDate;
            }
          }
        }
      } catch (error) {
        parsedDate = new Date();
      }
    }
    
    return {
      firstName,
      lastName, 
      childName: `${firstName} ${lastName}`.trim(),
      childAge: details.childAge || 6,
      theme: details.theme || "princess",
      date: parsedDate,
      timeSlot: details.timeSlot || "afternoon",
      duration: details.duration || 2,
      confirmedStartTime: details.confirmedStartTime || null,
      location: details.location || "W1A 1AA",
      guestCount: details.guestCount || "",
      budget: details.budget || "",
      specialNotes: details.specialNotes || "",
      postcode: details.postcode || details.location || "W1A 1AA",
      ...details,
    };
  };

  const formatGuestCount = (count) => {
    if (!count) return "Not specified";
    return `${count} guests`;
  };

  // Get display values
  const displayDate = partyDetails?.displayDate || formatDateForDisplay(partyDetails?.date) || "14th June, 2025";
  const displayTimeSlot = partyDetails?.displayTimeSlot || formatTimeSlotForDisplay(
    partyDetails?.timeSlot, 
    partyDetails?.confirmedStartTime, 
    partyDetails?.duration
  ) || "Afternoon (1pm-4pm)";
  const displayDuration = partyDetails?.displayDuration || formatDurationForDisplay(partyDetails?.duration);
  
  const TimeSlotIcon = getTimeSlotIcon(partyDetails?.timeSlot);

  return (
    <>
      <div style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="relative md:h-auto md:pt-0 pt-6 h-auto rounded-2xl shadow-2xl overflow-hidden mb-8 bg-primary-400">
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-16 h-16 bg-white rounded-full animate-pulse"></div>
          <div
            className="absolute top-12 right-12 w-8 h-8 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-8 left-16 w-12 h-12 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-16 right-8 w-6 h-6 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/5"></div>

        {/* Content */}
        <div className="relative px-4 md:p-10 text-white">
          <div className="space-y-3 md:space-y-6 ">
            {/* Theme Badge and Edit Button + Mobile Budget */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-semibold backdrop-blur-sm">
                  {currentTheme?.name || currentTheme} Party
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Mobile Budget Ring - only visible on mobile */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsBudgetExpanded(!isBudgetExpanded)}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-1 py-1 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="relative w-3 h-6">
                      {/* Budget progress ring */}
                      {/* <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeDasharray={`${(totalSpent / tempBudget) * 62.83} 62.83`}
                          className="transition-all duration-500"
                        />
                      </svg> */}
                    </div>
                    <div className="text-xs ">
                      {/* <div className="text-white/70 font-medium">Budget</div> */}
                      <div className="font-semibold">£{totalSpent}/£{tempBudget}</div>
                    </div>
                    {isBudgetExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>

                <Button
  variant="ghost"
  size="sm"
  onClick={handleEditClick}  // Keep this the same
  className="p-2 md:p-3 h-auto text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 group backdrop-blur-sm border border-white/20"
  title="Edit party details"
>
  <Edit className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform duration-300" />
</Button>
              </div>
            </div>

            {/* Mobile Budget Dropdown - only visible when expanded */}
            {isBudgetExpanded && (
              <div className="md:hidden relative z-50 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="text-center">
                  <h3 className="font-semibold mb-1 text-white">Adjust Your Budget</h3>
                  <p className="text-xs opacity-80 text-white">Tap outside to close</p>
                </div>
                
                {/* Simplified Budget Controls for Header */}
                <div className="space-y-4">
                  {/* Current Budget Display */}
                  <div className="flex justify-between items-center text-white">
                    <span className="text-sm">Current Budget</span>
                    <span className="text-lg font-bold">£{tempBudget}</span>
                  </div>
                  
                  {/* Budget Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="300"
                      max="1000"
                      step="50"
                      value={tempBudget}
                      onChange={(e) => budgetControlProps.setTempBudget(Number(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, white 0%, white ${((tempBudget - 300) / (1000 - 300)) * 100}%, rgba(255,255,255,0.2) ${((tempBudget - 300) / (1000 - 300)) * 100}%, rgba(255,255,255,0.2) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-white/80">
                      <span>£300</span>
                      <span>£1000+</span>
                    </div>
                  </div>
                  
                  {/* Budget Status */}
                  <div className="flex justify-between items-center text-white">
                    <span className="text-sm">Spent</span>
                    <span className="text-sm">£{totalSpent} / £{tempBudget}</span>
                  </div>
                  
                  {budgetControlProps.isUpdating && (
                    <div className="text-center text-xs text-white/80">
                      Updating suppliers...
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => setIsBudgetExpanded(false)}
                >
                  Done
                </Button>
              </div>
            )}

            {/* Party Title */}
            <div className="space-y-1 md:space-y-2">
              <h1
                suppressHydrationWarning={true}
                className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight tracking-tight"
                style={{
                  textShadow: "0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                <span className="md:hidden">{getFirstName()}'s</span>
                <span className="hidden md:inline">{getFullName()}'s</span>
                <span className="md:hidden"> Big Day!</span>
                <span className="hidden md:inline"><br />Big Day!</span>
              </h1>
              <p className="text-base md:text-2xl text-white/95 drop-shadow-lg font-medium">
                {currentTheme?.description || `An amazing ${currentTheme} celebration`}
              </p>
            </div>

            {/* Mobile: Horizontal Scrolling Cards */}
            <div className="md:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {/* Date Card */}
                <div className="flex-shrink-0 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Date</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm leading-tight">
                    {displayDate}
                  </p>
                </div>

                {/* Time Card */}
                <div className="flex-shrink-0 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <TimeSlotIcon className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Time</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm leading-tight">
                    {partyDetails?.timeSlot === 'morning' ? 'Morning' : 'Afternoon'}
                  </p>
                  <p suppressHydrationWarning={true} className="font-medium text-xs opacity-80">
                    {displayDuration}
                  </p>
                </div>

                {/* Age Card */}
                <div className="flex-shrink-0 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <Users className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Age</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm">
                    {partyDetails?.childAge || 6} years
                  </p>
                </div>

                {/* Guests Card */}
                <div className="flex-shrink-0 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <Users className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Guests</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm">
                    {partyDetails?.guestCount || "10"}
                  </p>
                </div>

                {/* Location Card */}
                <div className="flex-shrink-0 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <MapPin className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Where</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm leading-tight">
                    {partyDetails?.location || "W1A 1AA"}
                  </p>
                </div>
              </div>
              
              {/* Scroll indicator dots */}
              <div className="flex justify-center gap-1 mt-3">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
              </div>
            </div>

            {/* Desktop: Original Grid Layout */}
            <div className="hidden md:grid md:grid-cols-5 gap-4">
              {/* Date */}
              <div className="flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Date</p>
                </div>
                <div className="space-y-0.5">
                  <p suppressHydrationWarning={true} className="font-bold text-base leading-tight">
                    {displayDate}
                  </p>
                </div>
              </div>

              {/* Time Slot */}
              <div className="flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <TimeSlotIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Time</p>
                </div>
                <div className="space-y-1">
                  <p suppressHydrationWarning={true} className="font-bold text-base">
                    {displayTimeSlot}
                  </p>
                  <p suppressHydrationWarning={true} className="font-medium text-xs opacity-80">
                    {displayDuration}
                  </p>
                </div>
              </div>

              {/* Age */}
              <div className="flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Age</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base">
                  {partyDetails?.childAge || 6} years
                </p>
              </div>

              {/* Guests */}
              <div className="flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Guests</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base">
                  {formatGuestCount(partyDetails?.guestCount)}
                </p>
              </div>

              {/* Location */}
              <div className="flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Where</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base truncate">
                  {partyDetails?.location || "W1A 1AA"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary-300 to-secondary"></div>
      </div>

      {/* Backdrop when budget is expanded - only on mobile */}
      {isBudgetExpanded && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsBudgetExpanded(false)}
        />
      )}

      {/* Edit Modal */}
      <EditPartyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        partyDetails={getModalPartyDetails()}
        onSave={handleSavePartyDetails}
      />
    </>
  )
}