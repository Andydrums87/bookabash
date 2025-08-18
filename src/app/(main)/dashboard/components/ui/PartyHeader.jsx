"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, Users, MapPin, Sparkles, Clock, Loader2 } from "lucide-react"
import EditPartyModal from "../Modals/EditPartyModal"
import BudgetControls from "@/components/budget-controls"
import { useToast } from '@/components/ui/toast'

// Utility functions
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

const formatTimeForDisplay = (timeInput) => {
  if (!timeInput) return null;
  
  try {
    if (typeof timeInput === 'string' && timeInput.includes(':')) {
      const [hours, minutes] = timeInput.split(':');
      const timeObj = new Date();
      timeObj.setHours(parseInt(hours), parseInt(minutes || 0));
      
      return timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: minutes && minutes !== '00' ? '2-digit' : undefined,
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

// NEW: Enhanced time range formatter that handles database times
const formatTimeRangeFromDatabase = (startTime, endTime, fallbackDuration = 2) => {
  // If we have both database start_time and end_time, use those
  if (startTime && endTime) {
    console.log('🕐 Using database times:', { startTime, endTime });
    
    const formattedStart = formatTimeForDisplay(startTime);
    const formattedEnd = formatTimeForDisplay(endTime);
    
    if (formattedStart && formattedEnd) {
      return `${formattedStart} - ${formattedEnd}`;
    }
  }
  
  // If we only have start_time, calculate end time using duration
  if (startTime) {
    console.log('🕐 Using database start_time with calculated end:', { startTime, fallbackDuration });
    
    const formattedStart = formatTimeForDisplay(startTime);
    const calculatedEnd = calculateEndTime(startTime, fallbackDuration);
    
    if (formattedStart && calculatedEnd) {
      return `${formattedStart} - ${calculatedEnd}`;
    }
  }
  
  // Fallback to legacy format
  console.log('🕐 Falling back to legacy time format');
  return "2pm - 4pm";
};

const calculateEndTime = (startTime, duration = 2) => {
  if (!startTime) return null;
  
  try {
    const [hours, minutes] = startTime.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes || 0));
    
    const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000));
    
    return endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: endDate.getMinutes() > 0 ? '2-digit' : undefined,
      hour12: true,
    });
  } catch (error) {
    return null;
  }
};

// LEGACY: Keep for backwards compatibility with localStorage
const formatTimeRange = (startTime, duration = 2) => {
  if (!startTime) return "2pm - 4pm"; // Default fallback
  
  const formattedStartTime = formatTimeForDisplay(startTime);
  const endTime = calculateEndTime(startTime, duration);
  
  if (formattedStartTime && endTime) {
    return `${formattedStartTime} - ${endTime}`;
  }
  
  return "2pm - 4pm"; // Fallback
};

export default function PartyHeader({ 
  theme, 
  partyDetails, 
  onPartyDetailsChange, 
  // NEW: Add dataSource and currentParty props to determine source
  dataSource = 'localStorage',
  currentParty = null,
  // Budget props for mobile integration
  totalSpent = 0,
  tempBudget = 600,
  budgetControlProps = {},
  isPaymentConfirmed,
  enquiries = [],
  isSignedIn = false,
  loading = false,
}) {

  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBudgetExpanded, setIsBudgetExpanded] = useState(false)
  const currentTheme = theme

  const isLocked = isSignedIn

  const { toast } = useToast()

  const handleEditClick = () => {
    if (isLocked) {
      toast.warning("Party details are locked once enquiries are sent to suppliers", {
        title: "Party Details Locked",
        description: "Contact support if you need to make changes.",
        duration: 4000
      })
    } else {
      setIsEditModalOpen(true)
    }
  }

  // Helper functions for mobile vs desktop names
  const getFirstName = () => {
    if (loading) return "Loading...";
    
    // Database source: use child_name from currentParty
    if (dataSource === 'database' && currentParty?.child_name) {
      const nameParts = currentParty.child_name.split(' ');
      return nameParts[0];
    }
    
    // localStorage source: use partyDetails
    if (partyDetails?.firstName) {
      return partyDetails.firstName;
    }
    
    if (partyDetails?.childName) {
      const nameParts = partyDetails.childName.split(' ');
      return nameParts[0];
    }
    
    return "Emma"; // fallback
  };

  const getFullName = () => {
    if (loading) return "Loading...";
    
    // Database source: use child_name from currentParty
    if (dataSource === 'database' && currentParty?.child_name) {
      return currentParty.child_name;
    }
    
    // localStorage source: construct from partyDetails
    if (partyDetails?.firstName || partyDetails?.lastName) {
      return `${partyDetails?.firstName || ''} ${partyDetails?.lastName || ''}`.trim();
    }
    
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
      
      if (details.startTime) {
        processedDetails.displayTimeRange = formatTimeRange(details.startTime, details.duration);
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
    
    // Handle database source
    if (dataSource === 'database' && currentParty?.child_name) {
      const nameParts = currentParty.child_name.split(' ');
      firstName = nameParts[0] || "Snappy";
      lastName = nameParts.slice(1).join(' ') || "";
    } else if (!details.firstName && !details.lastName && details.childName) {
      const nameParts = details.childName.split(' ');
      firstName = nameParts[0] || "Snappy";
      lastName = nameParts.slice(1).join(' ') || "";
    }

    let parsedDate = new Date();
    
    // Handle database date
    if (dataSource === 'database' && currentParty?.party_date) {
      parsedDate = new Date(currentParty.party_date);
    } else if (details.date) {
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
    
    // Handle database times
    let startTime = "14:00";
    if (dataSource === 'database' && currentParty?.start_time) {
      startTime = currentParty.start_time;
    } else if (details.startTime) {
      startTime = details.startTime;
    }
    
    return {
      firstName,
      lastName, 
      childName: `${firstName} ${lastName}`.trim(),
      childAge: (dataSource === 'database' ? currentParty?.child_age : details.childAge) || 6,
      theme: details.theme || "princess",
      date: parsedDate,
      startTime: startTime,
      duration: details.duration || 2,
      location: (dataSource === 'database' ? currentParty?.location : details.location) || "W1A 1AA",
      guestCount: (dataSource === 'database' ? currentParty?.guest_count : details.guestCount) || "",
      budget: details.budget || "",
      specialNotes: details.specialNotes || "",
      postcode: details.postcode || details.location || "W1A 1AA",
      ...details,
    };
  };

  const formatGuestCount = (count) => {
    if (loading) return "Loading...";
    if (!count) return "Not specified";
    return `${count} guests`;
  };

  // NEW: Enhanced display value getters that handle database vs localStorage
  const getDisplayDate = () => {
    if (loading) return "Loading...";
    
    // Database source: use party_date from currentParty
    if (dataSource === 'database' && currentParty?.party_date) {
      return formatDateForDisplay(currentParty.party_date);
    }
    
    // localStorage source: use existing logic
    return partyDetails?.displayDate || 
           formatDateForDisplay(partyDetails?.date) || 
           "14th June, 2025";
  };

  const getDisplayTimeRange = () => {
    if (loading) return "Loading...";
    
    // Database source: use start_time and end_time from currentParty
    if (dataSource === 'database' && currentParty) {
      console.log('🕐 Getting time range from database:', {
        start_time: currentParty.start_time,
        end_time: currentParty.end_time,
        duration: currentParty.duration
      });
      
      return formatTimeRangeFromDatabase(
        currentParty.start_time, 
        currentParty.end_time, 
        currentParty.duration || 2
      );
    }
    
    // localStorage source: use existing logic
    return partyDetails?.displayTimeRange || 
           formatTimeRange(partyDetails?.startTime, partyDetails?.duration) || 
           "2pm - 4pm";
  };

  const getChildAge = () => {
    if (loading) return "Loading...";
    
    // Database source
    if (dataSource === 'database' && currentParty?.child_age) {
      return `${currentParty.child_age} years`;
    }
    
    // localStorage source
    return `${partyDetails?.childAge || 6} years`;
  };

  const getGuestCount = () => {
    if (loading) return "Loading...";
    
    // Database source
    if (dataSource === 'database' && currentParty?.guest_count) {
      return formatGuestCount(currentParty.guest_count);
    }
    
    // localStorage source
    return formatGuestCount(partyDetails?.guestCount);
  };

  const getLocation = () => {
    if (loading) return "Loading...";
    
    // Database source
    if (dataSource === 'database' && currentParty?.location) {
      return currentParty.location;
    }
    
    // localStorage source
    return partyDetails?.location || "W1A 1AA";
  };

  // Get display values using the new functions
  const displayDate = getDisplayDate();
  const displayTimeRange = getDisplayTimeRange();

  return (
    <>
      <div style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="relative md:h-auto md:pt-0 pt-6 h-auto rounded-2xl shadow-2xl overflow-hidden mb-8 bg-primary-400">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Loading party details...</span>
            </div>
          </div>
        )}

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
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>

        {/* Content */}
        <div className="relative px-4 md:p-10 text-white">
          <div className="space-y-3 md:space-y-6 ">
            {/* Theme Badge and Edit Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-semibold backdrop-blur-sm">
                  {loading ? "Loading..." : (currentTheme?.name || currentTheme)} Party
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  disabled={loading}
                  className="p-2 md:p-3 h-auto text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 group backdrop-blur-sm border border-white/20 disabled:opacity-50"
                  title="Edit party details"
                >
                  <Edit className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform duration-300" />
                </Button>
              </div>
            </div>

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
                {loading ? "Loading celebration details..." : (currentTheme?.description || `An amazing ${currentTheme} celebration`)}
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
                      <Clock className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Time</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-xs leading-tight">
                    {displayTimeRange}
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
                    {getChildAge()}
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
                    {getGuestCount()}
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
                    {getLocation()}
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

            {/* Desktop: Grid Layout */}
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

              {/* Time */}
              <div className="flex flex-col space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Time</p>
                </div>
                <div className="space-y-1">
                  <p suppressHydrationWarning={true} className="font-bold text-sm leading-tight">
                    {displayTimeRange}
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
                  {getChildAge()}
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
                  {getGuestCount()}
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
                  {getLocation()}
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