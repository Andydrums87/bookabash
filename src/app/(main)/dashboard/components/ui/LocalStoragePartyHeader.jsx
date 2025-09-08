// LocalStoragePartyHeader.jsx - Full editing capabilities for localStorage users
"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Calendar, Users, MapPin, Clock, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { useToast } from '@/components/ui/toast'
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal"
import SupplierAvailabilityModal from "@/components/ui/SupplierAvailabilityModal"

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

// Name Edit Modal
const NameEditModal = ({ isOpen, onClose, currentName, onSave }) => {
  // Initialize names from current name
  const initializeNames = () => {
    if (!currentName) return { firstName: "", lastName: "" };
    const nameParts = currentName.trim().split(' ');
    return {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(' ') || ""
    };
  };

  const { firstName: initFirstName, lastName: initLastName } = initializeNames();
  const [firstName, setFirstName] = useState(initFirstName);
  const [lastName, setLastName] = useState(initLastName);

  const handleSave = () => {
    if (firstName.trim()) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      onSave({ 
        childName: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader 
        title="Change Child's Name" 
        subtitle="Who's the star of this party?"
        theme="fun"
        icon={<Edit2 className="w-6 h-6" />}
      />
      
      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Emma"
              className="w-full"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Last Name <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Smith"
              className="w-full"
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!firstName.trim()}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
          >
            Save Name
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

// Date Edit Modal
const DateEditModal = ({ isOpen, onClose, currentDate, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate || new Date());

  const handleSave = () => {
    onSave({ date: selectedDate });
    onClose();
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader 
        title="Change Party Date" 
        subtitle="Pick the perfect date for your celebration"
        theme="fun"
        icon={<Calendar className="w-6 h-6" />}
      />
      
      <ModalContent>
        <div className="space-y-4">
          <CalendarPicker 
            mode="single" 
            selected={selectedDate} 
            onSelect={setSelectedDate} 
            className="rounded-md border w-full"
            disabled={(date) => date < new Date()}
          />
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          >
            Save Date
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

// Time Edit Modal
const TimeEditModal = ({ isOpen, onClose, currentStartTime, currentDuration, onSave }) => {
  const [startTime, setStartTime] = useState(currentStartTime || "14:00");
  const [duration, setDuration] = useState(currentDuration || 2);

  const timeOptions = [
    { value: "09:00", label: "9am" },
    { value: "10:00", label: "10am" },
    { value: "11:00", label: "11am" },
    { value: "12:00", label: "12pm" },
    { value: "13:00", label: "1pm" },
    { value: "14:00", label: "2pm" },
    { value: "15:00", label: "3pm" },
    { value: "16:00", label: "4pm" },
    { value: "17:00", label: "5pm" },
  ];

  const durationOptions = [
    { value: 1.5, label: "1½ hours" },
    { value: 2, label: "2 hours" },
    { value: 2.5, label: "2½ hours" },
    { value: 3, label: "3 hours" },
    { value: 3.5, label: "3½ hours" },
    { value: 4, label: "4 hours" },
  ];

  const handleSave = () => {
    const updates = { startTime, duration };
    console.log('TimeEditModal saving:', updates);
    onSave(updates);
    onClose();
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader 
        title="Change Party Time" 
        subtitle="Set the perfect timing for your party"
        theme="fun"
        icon={<Clock className="w-6 h-6" />}
      />
      
      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Start Time</label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger className="w-full pl-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Duration</label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseFloat(value))}>
              <SelectTrigger className="w-full pl-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
            <div className="text-sm text-gray-500 font-medium">Party will run:</div>
            <div className="font-bold text-gray-900">
              {formatTimeForDisplay(startTime)} - {calculateEndTime(startTime, duration)}
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          >
            Save Time
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

// Age Edit Modal
const AgeEditModal = ({ isOpen, onClose, currentAge, onSave }) => {
  const [age, setAge] = useState(currentAge || 6);

  const handleSave = () => {
    onSave({ childAge: age });
    onClose();
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader 
        title="Change Child's Age" 
        subtitle="How old is the birthday star?"
        theme="fun"
        icon={<Users className="w-6 h-6" />}
      />
      
      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Age</label>
            <Select value={age.toString()} onValueChange={(value) => setAge(parseInt(value))}>
              <SelectTrigger className="w-full pl-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2,3,4,5,6,7,8,9,10,11,12].map((ageOption) => (
                  <SelectItem key={ageOption} value={ageOption.toString()}>
                    {ageOption} years old
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          >
            Save Age
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

// Guests Edit Modal
const GuestsEditModal = ({ isOpen, onClose, currentGuestCount, onSave }) => {
  const [guestCount, setGuestCount] = useState(currentGuestCount || "");

  const guestOptions = [
    { value: "5", label: "5 guests" },
    { value: "10", label: "10 guests" },
    { value: "15", label: "15 guests" },
    { value: "20", label: "20 guests" },
    { value: "25", label: "25 guests" },
    { value: "30", label: "30+ guests" },
  ];

  const handleSave = () => {
    onSave({ guestCount });
    onClose();
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader 
        title="Change Guest Count" 
        subtitle="How many friends are joining the party?"
        theme="fun"
        icon={<Users className="w-6 h-6" />}
      />
      
      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Number of Guests</label>
            <Select value={guestCount} onValueChange={setGuestCount}>
              <SelectTrigger className="w-full pl-2">
                <SelectValue placeholder="Select guest count" />
              </SelectTrigger>
              <SelectContent>
                {guestOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!guestCount}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
          >
            Save Guest Count
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

// Location Edit Modal
const LocationEditModal = ({ isOpen, onClose, currentLocation, onSave }) => {
  const [location, setLocation] = useState(currentLocation || "");

  const handleSave = () => {
    if (location.trim()) {
      onSave({ location: location.trim() });
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose} size="sm" theme="fun">
      <ModalHeader 
        title="Change Party Location" 
        subtitle="Where's the celebration happening?"
        theme="fun"
        icon={<MapPin className="w-6 h-6" />}
      />
      
      <ModalContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location/Postcode</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., SW1A 1AA"
              className="w-full"
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!location.trim()}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
          >
            Save Location
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  );
};

export default function LocalStoragePartyHeader({ 
  theme, 
  partyDetails, 
  onPartyDetailsChange, 
  suppliers = {}, 
  partyId = null,
  onPartyRebuilt = null
}) {
  
  const [editingModal, setEditingModal] = useState(null)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(null)
  
  const currentTheme = theme
  const { toast } = useToast()

  // Helper functions
  const getFullName = () => {    
    if (partyDetails?.firstName || partyDetails?.lastName) {
      return `${partyDetails?.firstName || ''} ${partyDetails?.lastName || ''}`.trim();
    }
    
    if (partyDetails?.childName) {
      return partyDetails.childName;
    }
    
    return "Emma";
  };

  const getFirstName = () => {
    if (partyDetails?.firstName) {
      return partyDetails.firstName;
    }
    
    if (partyDetails?.childName) {
      const nameParts = partyDetails.childName.split(' ');
      return nameParts[0];
    }
    
    return "Emma";
  };

  // Enhanced save function that properly persists to localStorage
  const savePartyDetails = (details) => {
    try {
      const existingDetails = JSON.parse(localStorage.getItem("party_details") || "{}")
      
      const processedDetails = {
        ...existingDetails,
        ...details,
      };
      
      // Handle date formatting and persistence
      if (details.date) {
        // Store both the Date object and formatted display
        processedDetails.date = details.date;
        processedDetails.displayDate = formatDateForDisplay(details.date);
      }
      
      // Handle time formatting
      if (details.startTime) {
        processedDetails.startTime = details.startTime;
        processedDetails.displayTimeRange = formatTimeRangeFromDatabase(
          details.startTime, 
          null, 
          details.duration || processedDetails.duration || 2
        );
      }
      
      // Handle postcode extraction
      processedDetails.postcode = details.postcode ||
        (details.location?.match(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i) ? details.location : existingDetails.postcode);
      
      // Save to localStorage
      localStorage.setItem("party_details", JSON.stringify(processedDetails));
      
      // Trigger storage event for other components
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "party_details",
          newValue: JSON.stringify(processedDetails),
        }),
      );
      
      console.log("Party details saved successfully:", processedDetails);
      return processedDetails;
    } catch (error) {
      console.error("Error saving party details:", error);
      return details;
    }
  };

  // Check if changes affect supplier availability
  const requiresAvailabilityCheck = (newDetails) => {
    if (!suppliers || Object.keys(suppliers).length === 0) {
      console.log('No suppliers found, skipping availability check');
      return false;
    }
    
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
    const currentLocation = getCurrentLocation();
    
    const dateChanged = newDetails.date && formatDateForDisplay(newDetails.date) !== formatDateForDisplay(currentDate);
    const timeChanged = newDetails.startTime && newDetails.startTime !== currentTime;
    const locationChanged = newDetails.location && newDetails.location !== currentLocation;
    
    console.log('Availability check:', {
      hasSuppliers: Object.keys(suppliers).length > 0,
      dateChanged,
      timeChanged,
      locationChanged,
      currentTime,
      newTime: newDetails.startTime
    });
    
    return dateChanged || timeChanged || locationChanged;
  };

  // Get current values for comparison
  const getCurrentDate = () => {
    return partyDetails?.date ? new Date(partyDetails.date) : new Date();
  };

  const getCurrentTime = () => {
    return partyDetails?.startTime || '14:00';
  };

  const getCurrentLocation = () => {
    return partyDetails?.location || '';
  };

  // Enhanced save handler with availability check
  const handleSavePartyDetails = (updatedDetails) => {
    // Check if availability check is needed
    if (requiresAvailabilityCheck(updatedDetails)) {
      console.log('Changes require availability check, showing modal...');
      
      setPendingChanges({
        currentDetails: {
          date: getCurrentDate(),
          startTime: getCurrentTime(),
          duration: partyDetails?.duration || 2,
          location: getCurrentLocation(),
          childName: getFullName(),
          firstName: partyDetails?.firstName,
          lastName: partyDetails?.lastName,
          childAge: partyDetails?.childAge || 6,
          theme: partyDetails?.theme || 'superhero',
          guestCount: partyDetails?.guestCount || '10',
          budget: partyDetails?.budget || 600,
          specialRequirements: partyDetails?.specialRequirements || ''
        },
        newDetails: updatedDetails
      });
      
      setShowAvailabilityModal(true);
      return;
    }
    
    proceedWithSave(updatedDetails);
  };

  // Proceed with save after availability check
  const proceedWithSave = (updatedDetails) => {
    const savedDetails = savePartyDetails(updatedDetails);
    
    if (onPartyDetailsChange) {
      onPartyDetailsChange(savedDetails);
    }
    
    toast.success("Party details updated!", {
      duration: 2000
    });
  };

  // Handle availability modal confirmation
  const handleAvailabilityConfirm = (updatedDetails) => {
    proceedWithSave(updatedDetails);
    setShowAvailabilityModal(false);
    setPendingChanges(null);
  };

  // Handle party rebuild from availability modal
  const handlePartyRebuilt = (rebuildResults) => {
    console.log('Party was rebuilt with new suppliers:', rebuildResults);
    
    if (onPartyRebuilt) {
      onPartyRebuilt(rebuildResults);
    }
    
    toast.success("Party rebuilt with available suppliers!", {
      duration: 3000
    });
  };

  // Handle modal edit save
  const handleModalEditSave = (updates) => {
    console.log('Modal edit save called with updates:', updates);
    const mergedDetails = { ...partyDetails, ...updates };
    console.log('Merged details:', mergedDetails);
    handleSavePartyDetails(mergedDetails);
    setEditingModal(null);
  };

  // Handle card click
  const handleCardClick = (cardType) => {
    console.log('Card clicked:', cardType); // Debug log
    setEditingModal(cardType);
  };

  const formatGuestCount = (count) => {
    if (!count) return "Not specified";
    return `${count} guests`;
  };

  // Display value getters
  const getDisplayDate = () => {
    return partyDetails?.displayDate || 
           formatDateForDisplay(partyDetails?.date) || 
           "14th June, 2025";
  };

  const getDisplayTimeRange = () => {
    const storedTimeRange = partyDetails?.displayTimeRange;
    const calculatedTimeRange = formatTimeRangeFromDatabase(partyDetails?.startTime, null, partyDetails?.duration);
    const fallback = "2pm - 4pm";
    
    console.log('getDisplayTimeRange debug:', {
      partyDetailsStartTime: partyDetails?.startTime,
      partyDetailsDuration: partyDetails?.duration,
      storedDisplayTimeRange: storedTimeRange,
      calculatedTimeRange,
      willReturn: storedTimeRange || calculatedTimeRange || fallback
    });
    
    return storedTimeRange || calculatedTimeRange || fallback;
  };

  const getChildAge = () => {
    return `${partyDetails?.childAge || 6} years`;
  };

  const getGuestCount = () => {
    return formatGuestCount(partyDetails?.guestCount);
  };

  const getLocation = () => {
    return partyDetails?.location || "W1A 1AA";
  };

  const displayDate = getDisplayDate();
  const displayTimeRange = getDisplayTimeRange();


  const capitalizedTheme = currentTheme?.charAt(0).toUpperCase() + currentTheme?.slice(1);
  
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

        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>

        <div className="relative px-4 md:p-10 text-white">
          <div className="space-y-3 md:space-y-6">
            {/* Party Title with Edit Name */}
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 md:gap-3">
                <h1
                  suppressHydrationWarning={true}
                  className="text-3xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight tracking-tight"
                  style={{
                    textShadow: "0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <span className="md:hidden">{getFirstName()}'s</span>
                  <span className="hidden md:inline">{getFullName()}'s</span>
                  <span className="md:hidden"> {`${capitalizedTheme} Party`}!</span>
                  <span className="hidden md:inline"><br />{`${capitalizedTheme} Party`}</span>
                </h1>
                <button
                  onClick={() => handleCardClick('name')}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
             
            </div>

            {/* Mobile: Horizontal Scrolling Cards */}
            <div className="md:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                <button
                  onClick={() => handleCardClick('date')}
                  className="flex-shrink-0 w-40 h-20 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center hover:bg-white/20 transition-colors text-left flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <p className="text-xs  opacity-90 font-medium">Date</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm leading-tight whitespace-nowrap overflow-hidden">
                    {getDisplayDate(true)}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick('time')}
                  className="flex-shrink-0 w-32 h-20 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center hover:bg-white/20 transition-colors text-left flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <Clock className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Time</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-xs leading-tight whitespace-nowrap overflow-hidden">
                    {displayTimeRange}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick('age')}
                  className="flex-shrink-0 w-24 h-20 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center hover:bg-white/20 transition-colors text-left flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <Users className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Age</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm whitespace-nowrap">
                    {getChildAge()}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick('guests')}
                  className="flex-shrink-0 w-28 h-20 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center hover:bg-white/20 transition-colors text-left flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <Users className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Guests</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm whitespace-nowrap">
                    {getGuestCount()}
                  </p>
                </button>

                <button
                  onClick={() => handleCardClick('location')}
                  className="flex-shrink-0 w-28 h-20 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 snap-center hover:bg-white/20 transition-colors text-left flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white/20 rounded-full">
                      <MapPin className="w-3 h-3" />
                    </div>
                    <p className="text-xs opacity-90 font-medium">Where</p>
                  </div>
                  <p suppressHydrationWarning={true} className="font-bold text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    {getLocation()}
                  </p>
                </button>
              </div>
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-5 gap-4">
              <button
                onClick={() => handleCardClick('date')}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Date</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base leading-tight">
                  {displayDate}
                </p>
              </button>

              <button
                onClick={() => handleCardClick('time')}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Time</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base leading-tight">
                  {displayTimeRange}
                </p>
              </button>

              <button
                onClick={() => handleCardClick('age')}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Age</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base">
                  {getChildAge()}
                </p>
              </button>

              <button
                onClick={() => handleCardClick('guests')}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Guests</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base">
                  {getGuestCount()}
                </p>
              </button>

              <button
                onClick={() => handleCardClick('location')}
                className="flex flex-col items-start space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">Where</p>
                </div>
                <p suppressHydrationWarning={true} className="font-bold text-base truncate">
                  {getLocation()}
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary-300 to-secondary"></div>
      </div>

      {/* Supplier Availability Modal */}
      {pendingChanges && (
        <SupplierAvailabilityModal
          isOpen={showAvailabilityModal}
          onClose={() => {
            setShowAvailabilityModal(false);
            setPendingChanges(null);
          }}
          onConfirm={handleAvailabilityConfirm}
          currentDetails={pendingChanges.currentDetails}
          newDetails={pendingChanges.newDetails}
          suppliers={suppliers}
          partyId={partyId}
          dataSource="localStorage"
          onPartyRebuilt={handlePartyRebuilt}
        />
      )}

      {/* Edit Modals */}
      <NameEditModal
        isOpen={editingModal === 'name'}
        onClose={() => setEditingModal(null)}
        currentName={getFullName()}
        onSave={handleModalEditSave}
      />

      <DateEditModal
        isOpen={editingModal === 'date'}
        onClose={() => setEditingModal(null)}
        currentDate={partyDetails?.date || new Date()}
        onSave={handleModalEditSave}
      />

      <TimeEditModal
        isOpen={editingModal === 'time'}
        onClose={() => setEditingModal(null)}
        currentStartTime={partyDetails?.startTime}
        currentDuration={partyDetails?.duration}
        onSave={handleModalEditSave}
      />

      <AgeEditModal
        isOpen={editingModal === 'age'}
        onClose={() => setEditingModal(null)}
        currentAge={partyDetails?.childAge}
        onSave={handleModalEditSave}
      />

      <GuestsEditModal
        isOpen={editingModal === 'guests'}
        onClose={() => setEditingModal(null)}
        currentGuestCount={partyDetails?.guestCount}
        onSave={handleModalEditSave}
      />

      <LocationEditModal
        isOpen={editingModal === 'location'}
        onClose={() => setEditingModal(null)}
        currentLocation={partyDetails?.location}
        onSave={handleModalEditSave}
      />
    </>
  );
}