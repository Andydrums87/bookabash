"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, Users, MapPin, Sparkles, Clock, Sun, Sunset } from "lucide-react"
import EditPartyModal from "./EditPartyModal"

// Utility functions for consistent date formatting
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
  // If we have confirmed exact times, show those
  if (confirmedStartTime) {
    const startTime = formatTimeForDisplay(confirmedStartTime);
    const endTime = calculateEndTime(confirmedStartTime, duration);
    return `${startTime} - ${endTime}`;
  }
  
  // Otherwise show the time slot window
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

// Updated party details functions
const savePartyDetails = (details) => {
  try {
    const existingDetails = JSON.parse(localStorage.getItem("party_details") || "{}")
    
    const processedDetails = {
      ...existingDetails,
      ...details,
    };
    
    // Format display values
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

export default function PartyHeader({ theme, partyDetails, onPartyDetailsChange }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const currentTheme = theme

  const handleSavePartyDetails = (updatedDetails) => {
    console.log("💾 Saving party details:", updatedDetails);
    
    const savedDetails = savePartyDetails(updatedDetails);
    
    if (onPartyDetailsChange) {
      onPartyDetailsChange(savedDetails);
    }
    
    console.log("✅ Party details updated:", savedDetails);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const getModalPartyDetails = () => {
    const details = { ...partyDetails };
    
    // Safely handle date parsing
    let parsedDate = new Date(); // Default to today
    
    if (details.date) {
      try {
        if (details.date instanceof Date && !isNaN(details.date.getTime())) {
          // Already a valid Date object
          parsedDate = details.date;
        } else if (typeof details.date === 'string') {
          if (details.date.includes('th ') || details.date.includes('st ') || details.date.includes('nd ') || details.date.includes('rd ')) {
            // Handle display format like "12th July, 2025"
            const dateStr = details.date.replace(/(\d+)(st|nd|rd|th)\s/, '$1 ');
            const testDate = new Date(dateStr);
            if (!isNaN(testDate.getTime())) {
              parsedDate = testDate;
            }
          } else {
            // Handle other string formats
            const testDate = new Date(details.date);
            if (!isNaN(testDate.getTime())) {
              parsedDate = testDate;
            }
          }
        }
      } catch (error) {
        console.log("Could not parse date:", error, "Using today as fallback");
        parsedDate = new Date();
      }
    }
    
    return {
      childName: details.childName || "Emma",
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

  // Get display values with new time slot system
  const displayDate = partyDetails?.displayDate || formatDateForDisplay(partyDetails?.date) || "14th June, 2025";
  const displayTimeSlot = partyDetails?.displayTimeSlot || formatTimeSlotForDisplay(
    partyDetails?.timeSlot, 
    partyDetails?.confirmedStartTime, 
    partyDetails?.duration
  ) || "Afternoon (1pm-4pm)";
  const displayDuration = partyDetails?.displayDuration || formatDurationForDisplay(partyDetails?.duration);
  
  // Get the appropriate icon for the time slot
  const TimeSlotIcon = getTimeSlotIcon(partyDetails?.timeSlot);

  return (
    <>
      <div style={{
  backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
  backgroundRepeat: 'repeat',
  backgroundSize: '100px, cover',
  backgroundPosition: 'center',
}}className="relative md:h-auto md:pt-0 pt-6 h-[400px] rounded-2xl shadow-2xl overflow-hidden mb-8 bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]">
        
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div>

        {/* Content */}
        <div className="relative px-4 md:p-10  text-white min-h-[180px] md:min-h-[320px] flex flex-col justify-center">
          <div className="space-y-3 md:space-y-6">
            {/* Theme Badge and Edit Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-semibold backdrop-blur-sm">
                  {currentTheme?.name || currentTheme} Party
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="p-2 md:p-3 h-auto text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 group backdrop-blur-sm border border-white/20"
                title="Edit party details"
              >
                <Edit className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
            </div>

            {/* Party Title */}
            <div className="space-y-1 md:space-y-2">
              <h1
                suppressHydrationWarning={true}
                className="text-[2.8rem]  md:text-6xl font-black text-white drop-shadow-2xl leading-tight tracking-tight"
                style={{
                  textShadow: "0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
            {partyDetails?.childName || "Emma"}’s <br className="md:hidden" /> Big Day!
              </h1>
              <p className="text-lg mt-3 md:text-2xl text-white/95 drop-shadow-lg font-medium">
                {currentTheme?.description || `An amazing ${currentTheme} celebration`}
              </p>
            </div>

            {/* Party Details - Updated with time slots */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-4 pt-2 md:pt-4 ">
              {/* Date */}
              <div className="flex flex-col space-y-0.5 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-md md:rounded-xl h-25 md:p-4 border border-white/20">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="p-0.5 md:p-2 bg-white/20 rounded-full">
                    <Calendar className="w-2.5 h-2.5 md:w-5 md:h-5" />
                  </div>
                  <p className="text-[10px] md:text-sm opacity-90 font-medium">Date</p>
                </div>
                <div className="space-y-0.5">
                  <p suppressHydrationWarning={true} className="font-bold text-[10px] md:text-base leading-tight">
                    {displayDate}
                  </p>
                  {/* Show time slot on mobile */}
                  <p suppressHydrationWarning={true} className="font-medium text-[9px] md:hidden opacity-80">
                    {partyDetails?.timeSlot === 'morning' ? 'Morning' : 'Afternoon'}
                  </p>
                </div>
              </div>

              {/* Time Slot - Desktop Only */}
              <div className="hidden md:flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
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

              {/* Age & Guests Combined on Mobile */}
              <div className="flex flex-col space-y-0.5 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-md md:rounded-xl p-1.5 md:p-4 border border-white/20">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="p-0.5 md:p-2 bg-white/20 rounded-full">
                    <Users className="w-2.5 h-2.5 md:w-5 md:h-5" />
                  </div>
                  <p className="text-[10px] md:text-sm opacity-90 font-medium">Age</p>
                </div>
                <div className="space-y-0.5">
                  <p suppressHydrationWarning={true} className="font-bold text-[10px] md:text-base">
                    {partyDetails?.childAge || 6} years
                  </p>
                  <p suppressHydrationWarning={true} className="font-medium text-[9px] md:hidden opacity-80">
                    {partyDetails?.guestCount || "10"} guests
                  </p>
                </div>
              </div>

              {/* Guests - Desktop Only */}
              <div className="hidden md:flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
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
              <div className="flex flex-col space-y-0.5 md:space-y-2 bg-white/10 backdrop-blur-sm rounded-md md:rounded-xl p-1.5 md:p-4 border border-white/20">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="p-0.5 md:p-2 bg-white/20 rounded-full">
                    <MapPin className="w-2.5 h-2.5 md:w-5 md:h-5" />
                  </div>
                  <p className="text-[10px] md:text-sm opacity-90 font-medium">Where</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-[10px] md:text-base truncate">
                  {partyDetails?.location || "W1A 1AA"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary-300 to-secondary"></div>
      </div>

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