// DatabasePartyHeader.jsx - Read-only display for database users
"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Clock, Loader2, Lock, Shield } from "lucide-react"

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

const formatTimeRangeFromDatabase = (startTime, endTime, fallbackDuration = 2) => {
  if (startTime && endTime) {
    const formattedStart = formatTimeForDisplay(startTime);
    const formattedEnd = formatTimeForDisplay(endTime);
    
    if (formattedStart && formattedEnd) {
      return `${formattedStart} - ${formattedEnd}`;
    }
  }
  
  if (startTime) {
    const formattedStart = formatTimeForDisplay(startTime);
    const calculatedEnd = calculateEndTime(startTime, fallbackDuration);
    
    if (formattedStart && calculatedEnd) {
      return `${formattedStart} - ${calculatedEnd}`;
    }
  }
  
  return "2pm - 4pm";
};

export default function DatabasePartyHeader({ 
  theme, 
  partyDetails, 
  currentParty,
  dataSource = 'database',
  isSignedIn = true,
  enquiries = []
}) {
  
  const currentTheme = theme;
  const hasEnquiries = enquiries && enquiries.length > 0;
  
  // Check if party is locked (has enquiries or is in confirmed state)
  const isPartyLocked = hasEnquiries;

  // Helper functions for database data
  const getFullName = () => {
    if (dataSource === 'database' && currentParty?.child_name) {
      return currentParty.child_name;
    }
    
    if (partyDetails?.firstName || partyDetails?.lastName) {
      return `${partyDetails?.firstName || ''} ${partyDetails?.lastName || ''}`.trim();
    }
    
    if (partyDetails?.childName) {
      return partyDetails.childName;
    }
    
    return "Emma";
  };

  const getFirstName = () => {
    if (dataSource === 'database' && currentParty?.child_name) {
      const nameParts = currentParty.child_name.split(' ');
      return nameParts[0];
    }
    
    if (partyDetails?.firstName) {
      return partyDetails.firstName;
    }
    
    if (partyDetails?.childName) {
      const nameParts = partyDetails.childName.split(' ');
      return nameParts[0];
    }
    
    return "Emma";
  };

  const formatGuestCount = (count) => {
    if (!count) return "Not specified";
    return `${count} guests`;
  };

  // Display value getters for database
  const getDisplayDate = () => {
    if (dataSource === 'database' && currentParty?.party_date) {
      return formatDateForDisplay(currentParty.party_date);
    }
    
    return partyDetails?.displayDate || 
           formatDateForDisplay(partyDetails?.date) || 
           "14th June, 2025";
  };

  const getDisplayTimeRange = () => {
    if (dataSource === 'database' && currentParty) {
      return formatTimeRangeFromDatabase(
        currentParty.start_time, 
        currentParty.end_time, 
        currentParty.duration || 2
      );
    }
    
    return partyDetails?.displayTimeRange || 
           formatTimeRangeFromDatabase(partyDetails?.startTime, null, partyDetails?.duration) || 
           "2pm - 4pm";
  };

  const getChildAge = () => {
    if (dataSource === 'database' && currentParty?.child_age) {
      return `${currentParty.child_age} years`;
    }
    
    return `${partyDetails?.childAge || 6} years`;
  };

  const getGuestCount = () => {
    if (dataSource === 'database' && currentParty?.guest_count) {
      return formatGuestCount(currentParty.guest_count);
    }
    
    return formatGuestCount(partyDetails?.guestCount);
  };

  const getLocation = () => {
    if (dataSource === 'database' && currentParty?.location) {
      return currentParty.location;
    }
    
    return partyDetails?.location || "W1A 1AA";
  };

  const displayDate = getDisplayDate();
  const displayTimeRange = getDisplayTimeRange();

  if (!partyDetails) {
    return (
      <div className="h-48 bg-primary-50 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your party...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} 
      className="relative md:h-auto md:pt-0 pt-6 h-auto rounded-2xl shadow-2xl overflow-hidden mb-8 bg-primary-400"
    >

      {/* Lock Status Banner */}
      {isPartyLocked && (
        <div className="absolute top-4 right-4 z-20">
         
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

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>

      <div className="relative px-4 md:p-10 text-white">
        <div className="space-y-3 md:space-y-6">
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

          {/* Mobile: Information Cards */}
          <div className="md:hidden">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory items-start">
              {/* Date Card - Wider */}
              <div className="flex-shrink-0 w-40 bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/30 snap-center">
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
              <div className="flex-shrink-0 w-32 bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/30 snap-center">
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

              {/* Age Card - Narrower */}
              <div className="flex-shrink-0 w-24 bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/30 snap-center">
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
              <div className="flex-shrink-0 w-28 bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/30 snap-center">
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
              <div className="flex-shrink-0 w-28 bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/30 snap-center">
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
            
            {/* Scroll indicators */}
            <div className="flex justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
              ))}
            </div>
          </div>

          {/* Desktop: Information Grid */}
          <div className="hidden md:grid md:grid-cols-5 gap-4">
            {/* Date Card */}
            <div className="flex flex-col items-start space-y-2 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white/20 rounded-full">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-sm opacity-90 font-medium">Date</p>
              </div>
              <p suppressHydrationWarning={true} className="font-bold text-base leading-tight">
                {displayDate}
              </p>
            </div>

            {/* Time Card */}
            <div className="flex flex-col items-start space-y-2 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white/20 rounded-full">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-sm opacity-90 font-medium">Time</p>
              </div>
              <p suppressHydrationWarning={true} className="font-bold text-base leading-tight">
                {displayTimeRange}
              </p>
            </div>

            {/* Age Card */}
            <div className="flex flex-col items-start space-y-2 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/30">
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

            {/* Guests Card */}
            <div className="flex flex-col items-start space-y-2 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/30">
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

            {/* Location Card */}
            <div className="flex flex-col items-start space-y-2 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/30">
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
  );
}