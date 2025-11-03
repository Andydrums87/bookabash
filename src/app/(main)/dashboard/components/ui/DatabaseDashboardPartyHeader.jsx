// DatabasePartyHeader.jsx - COMPACT VERSION WITH KEY INFO
"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Camera, MapPin, Sparkles } from "lucide-react"
import ChatNotificationIcon from "../../DatabaseDashboard/components/ChatNotificationIcon";

export default function DatabasePartyHeader({
  theme,
  partyDetails,
  currentParty,
  dataSource = 'database',
  isSignedIn = true,
  enquiries = [],
  // Notification props
  unreadCount = 0,
  hasNewMessages = false,
  onNotificationClick,
  // ✅ Photo props
  childPhoto = null, // URL to child's photo
  onPhotoUpload = null, // Callback when photo is uploaded
  uploadingPhoto = false, // ✅ NEW: Loading state
  // ✅ NEW: Venue location for address display
  venue = null, // Venue from party plan
  // ✅ Loading state
  loading = false,
}) {
  
  const currentTheme = theme;
  const hasEnquiries = enquiries && enquiries.length > 0;
  const isPartyLocked = hasEnquiries;

  // Helper functions for name display
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

  // Format party date
  const getFormattedDate = () => {
    // ✅ Try partyDetails first, then fallback to currentParty for database users
    const dateSource = partyDetails?.date || (dataSource === 'database' && currentParty?.party_date);
    if (!dateSource) return null;

    const date = new Date(dateSource);
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Calculate days until party
  const getDaysUntil = () => {
    // ✅ Try partyDetails first, then fallback to currentParty for database users
    const dateSource = partyDetails?.date || (dataSource === 'database' && currentParty?.party_date);
    if (!dateSource) return null;

    const partyDate = new Date(dateSource);
    const today = new Date();
    const diffTime = partyDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Past";
    if (diffDays === 0) return "Today!";
    if (diffDays === 1) return "Tomorrow!";
    return `${diffDays} days away`;
  };

  // Format party time
  const getFormattedTime = () => {
    // ✅ Try partyDetails first, then fallback to currentParty for database users
    const startTimeSource = partyDetails?.startTime ||
                           (dataSource === 'database' && (currentParty?.start_time || currentParty?.party_time));
    const durationSource = partyDetails?.duration ||
                          (dataSource === 'database' && currentParty?.duration) ||
                          2;

    if (!startTimeSource) return null;

    try {
      const [hours, minutes] = startTimeSource.split(':');
      const startDate = new Date();
      startDate.setHours(parseInt(hours), parseInt(minutes || 0));

      const formattedStart = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: minutes && minutes !== '00' ? '2-digit' : undefined,
        hour12: true,
      });

      // Calculate end time based on duration
      const duration = durationSource;
      const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
      const formattedEnd = endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: endDate.getMinutes() > 0 ? '2-digit' : undefined,
        hour12: true,
      });

      return `${formattedStart} - ${formattedEnd}`;
    } catch (error) {
      return null;
    }
  };

  // ✅ Get venue location/address - Returns VENUE postcode, not user's search postcode
  const getVenueLocation = () => {
    // PRIORITY 1: Venue prop location (from visibleSuppliers.venue)
    if (venue?.location) {
      return venue.location; // "W5 4UA"
    }
    if (venue?.data?.location) {
      return venue.data.location;
    }
    if (venue?.venueAddress?.postcode) {
      return venue.venueAddress.postcode;
    }
    if (venue?.serviceDetails?.venueAddress?.postcode) {
      return venue.serviceDetails.venueAddress.postcode;
    }

    // PRIORITY 2: For database users, check if venue exists in party plan
    if (dataSource === 'database' && currentParty?.party_plan?.venue) {
      const venueFromPlan = currentParty.party_plan.venue;
      if (venueFromPlan.location) {
        return venueFromPlan.location;
      }
      if (venueFromPlan.data?.location) {
        return venueFromPlan.data.location;
      }
      if (venueFromPlan.venueAddress?.postcode) {
        return venueFromPlan.venueAddress.postcode;
      }
      if (venueFromPlan.serviceDetails?.venueAddress?.postcode) {
        return venueFromPlan.serviceDetails.venueAddress.postcode;
      }
    }

    // PRIORITY 3: Check partyDetails venue
    if (partyDetails?.venue?.location) {
      return partyDetails.venue.location;
    }

    // NO FALLBACK to user's postcode - only show venue location
    // If no venue, don't show location at all
    return null;
  };

  // ✅ Get formatted theme name
  const getFormattedTheme = () => {
    // Try to use currentTheme (from partyTheme or currentParty)
    const themeSource = currentTheme || (dataSource === 'database' && currentParty?.theme);
    if (!themeSource) return null;
    // Capitalize first letter and replace hyphens with spaces
    return themeSource
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get theme image helper
  const getThemeImage = () => {
    // Try to use currentTheme, fallback to currentParty theme for database users
    const themeSource = currentTheme || (dataSource === 'database' && currentParty?.theme);
    if (!themeSource) return null

    const themeImages = {
      princess: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296152/iStock-1433142692_ukadz6.jpg",
      superhero: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296218/iStock-1150984736_evfnwn.jpg",
      dinosaur: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761295969/iStock-1126856615_wg9qil.jpg",
      unicorn: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296364/iStock-1202380918_flcyof.jpg",
      science: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380880/iStock-1603218889_xq4kqi.jpg",
      spiderman: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761209443/iStock-1165735224_ayrkw1.jpg",
      "taylor-swift": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380937/iStock-2201784646_cdvevq.jpg",
      cars: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380995/iStock-2176668301_cstncj.jpg",
      pirate: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296485/iStock-1283573104_bzl4zs.jpg",
      jungle: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296596/iStock-2221104953_mhafl2.jpg",
      football: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381299/iStock-488844390_wmv5zq.jpg",
      space: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296848/iStock-1474868329_hxmo8u.jpg",
      mermaid: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761297169/iStock-1434335578_h3dzbb.jpg",
      underwater: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761297237/iStock-1061608412_thapyw.jpg"
    }

    return themeImages[themeSource.toLowerCase()] || null
  }

  // Get theme gradient fallback
  const getThemeGradient = () => {
    // Try to use currentTheme, fallback to currentParty theme for database users
    const themeSource = currentTheme || (dataSource === 'database' && currentParty?.theme);
    if (!themeSource) return "linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))"

    const themeGradients = {
      princess: "linear-gradient(to right, #f472b6, #c084fc, #ec4899)",
      superhero: "linear-gradient(to right, #3b82f6, #ef4444, #eab308)",
      dinosaur: "linear-gradient(to right, #10b981, #059669, #047857)",
      unicorn: "linear-gradient(to right, #c084fc, #f472b6, #60a5fa)",
      science: "linear-gradient(to right, #06b6d4, #3b82f6, #4f46e5)",
      spiderman: "linear-gradient(to right, #dc2626, #2563eb, #dc2626)",
      "taylor-swift": "linear-gradient(to right, #a855f7, #ec4899, #f43f5e)",
      cars: "linear-gradient(to right, #2563eb, #4b5563, #1d4ed8)",
      space: "linear-gradient(to right, #312e81, #581c87, #1e3a8a)",
      jungle: "linear-gradient(to right, #16a34a, #ca8a04, #15803d)",
      football: "linear-gradient(to right, #16a34a, #059669, #047857)",
      pirate: "linear-gradient(to right, #d97706, #7f1d1d, #374151)",
      mermaid: "linear-gradient(to right, #2dd4bf, #06b6d4, #3b82f6)",
      default: "linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))"
    }

    return themeGradients[themeSource.toLowerCase()] || themeGradients.default
  }

  // ✅ SIMPLIFIED: For database users, check currentParty directly instead of waiting for partyDetails
  const hasRealData = dataSource === 'database'
    ? currentParty?.child_name || currentParty?.party_date
    : partyDetails && (
        partyDetails?.firstName ||
        partyDetails?.lastName ||
        (partyDetails?.childName && partyDetails.childName !== 'Emma') ||
        (partyDetails?.date && partyDetails.date !== 'Saturday, June 14, 2025 • 2:00 PM - 4:00 PM')
      );

  // ✅ For database users with currentParty, don't wait for full loading - show immediately
  const shouldShowSkeleton = dataSource === 'database'
    ? loading && !currentParty
    : loading || !hasRealData;

  // Debug logging (can be removed later)
  if (typeof window !== 'undefined') {
    console.log('🎯 Header validation:', {
      loading,
      dataSource,
      hasCurrentParty: !!currentParty,
      hasPartyDetails: !!partyDetails,
      hasRealData,
      shouldShowSkeleton,
      currentPartyChildName: currentParty?.child_name,
      partyDetailsChildName: partyDetails?.childName
    });
  }

  // Show skeleton loader only when we don't have enough data yet
  if (shouldShowSkeleton) {
    return (
      <div className="relative shadow-2xl overflow-hidden mb-8">
        {/* Gradient background skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse"></div>

        {/* Content skeleton */}
        <div className="relative px-4 py-8 md:px-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Avatar + Text skeleton */}
            <div className="flex items-center gap-3">
              {/* Avatar skeleton - Desktop only */}
              <div className="hidden md:block w-30 h-30 rounded-full bg-white/40 animate-pulse flex-shrink-0"></div>

              {/* Text content skeleton */}
              <div className="space-y-2">
                {/* Title skeleton */}
                <div className="h-12 bg-white/40 rounded-lg w-64 animate-pulse"></div>
                {/* Info row skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-white/30 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-white/30 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-white/30 rounded w-28 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Badge skeleton */}
            <div className="hidden md:block absolute top-4 right-4">
              <div className="h-8 bg-white/30 rounded-full w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = getFormattedDate();
  const formattedTime = getFormattedTime();
  const daysUntil = getDaysUntil();
  const firstName = getFirstName();
  const venueLocation = getVenueLocation();
  const formattedTheme = getFormattedTheme();

  // ✅ Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      onPhotoUpload(file);
    }
  };

  return (
    <div className="relative shadow-2xl overflow-hidden mb-8 transition-all duration-300">
      {/* Theme Image Background */}
      {getThemeImage() && (
        <div className="absolute inset-0">
          <img
            src={getThemeImage()}
            alt={currentTheme}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        </div>
      )}

      {/* Fallback gradient if no theme image */}
      {!getThemeImage() && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: getThemeGradient()
            }}
          ></div>
          {/* Optional: Add party pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url('/party-pattern.svg')`,
              backgroundRepeat: "repeat",
              backgroundSize: "100px",
            }}
          ></div>
        </>
      )}

      {/* Compact Content */}
      <div className="relative px-4 py-8 md:px-10 md:py-12 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Party Name & Theme with Photo */}
          <div className="flex items-center gap-3">
            {/* ✅ Child Photo Avatar - Desktop Only */}
            <div className="relative flex-shrink-0 hidden md:block">
              {childPhoto ? (
                <div className="relative group">
                  <img
                    src={childPhoto}
                    alt={firstName}
                    className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {onPhotoUpload && !uploadingPhoto && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-semibold">Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="relative group">
                  <div className="w-30 h-30 rounded-full bg-white/30 backdrop-blur-sm border-4 border-white/60 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/40 transition-all">
                    {uploadingPhoto ? (
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <div className="bg-white/40 rounded-full p-2 mb-1 group-hover:bg-white/50 transition-colors">
                          <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="text-xs font-bold text-white leading-tight text-center">
                          Add<br />Photo
                        </div>
                      </>
                    )}
                  </div>
                  {onPhotoUpload && !uploadingPhoto && (
                    <label className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Text Content */}
            <div>
              <h1
                className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl leading-[1.1] tracking-tight capitalize"
                style={{
                  textShadow: "0 4px 12px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)",
                }}
              >
                {firstName}'s Party
              </h1>
              {/* ✅ Party Info Row with all details */}
              {(formattedDate || formattedTime || formattedTheme || venueLocation) && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-white/95 font-medium flex-wrap">
                  {formattedDate && (
                    <>
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formattedDate}</span>
                    </>
                  )}
                  {formattedDate && formattedTime && (
                    <span className="text-white/60 flex-shrink-0">•</span>
                  )}
                  {formattedTime && (
                    <>
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formattedTime}</span>
                    </>
                  )}
                  {formattedTheme && (
                    <>
                      <span className="text-white/60 flex-shrink-0">•</span>
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formattedTheme}</span>
                    </>
                  )}
                  {venueLocation && (
                    <>
                      <span className="text-white/60 flex-shrink-0">•</span>
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{venueLocation}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Countdown Badge */}
          {daysUntil && (
            <div className="hidden md:absolute top-4 right-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm md:text-base px-3 py-1.5 font-semibold whitespace-nowrap">
                <Clock className="w-4 h-4 mr-1.5" />
                {daysUntil}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}