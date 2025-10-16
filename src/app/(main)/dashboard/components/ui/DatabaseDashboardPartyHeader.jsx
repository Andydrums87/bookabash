// DatabasePartyHeader.jsx - COMPACT VERSION WITH KEY INFO
"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
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
    if (!partyDetails?.date) return null;
    
    const date = new Date(partyDetails.date);
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Calculate days until party
  const getDaysUntil = () => {
    if (!partyDetails?.date) return null;
    
    const partyDate = new Date(partyDetails.date);
    const today = new Date();
    const diffTime = partyDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Past";
    if (diffDays === 0) return "Today!";
    if (diffDays === 1) return "Tomorrow!";
    return `${diffDays} days away`;
  };

  // Get theme emoji
  const getThemeEmoji = () => {
    if (!currentTheme) return "🎉";
    
    const themeEmojis = {
      'superhero': '🦸',
      'princess': '👸',
      'pirate': '🏴‍☠️',
      'dinosaur': '🦕',
      'unicorn': '🦄',
      'space': '🚀',
      'mermaid': '🧜‍♀️',
      'football': '⚽',
      'animal': '🦁',
      'construction': '🚧',
      'tea party': '🫖',
      'science': '🔬',
    };
    
    return themeEmojis[currentTheme.toLowerCase()] || '🎉';
  };

  if (!partyDetails) {
    return (
      <div className="h-24 bg-primary-50 rounded-xl animate-pulse flex items-center justify-center mb-6">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const formattedDate = getFormattedDate();
  const daysUntil = getDaysUntil();
  const firstName = getFirstName();

  // ✅ Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      onPhotoUpload(file);
    }
  };

  return (
    <div 
      style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} 
      className="relative rounded-xl shadow-lg overflow-hidden mb-6 bg-primary-400"
    >
      {/* Notification Icon */}
      {hasNewMessages && (
        <div className="absolute top-3 right-3 z-10">
          <ChatNotificationIcon
            unreadCount={unreadCount}
            hasNewMessages={hasNewMessages}
            onClick={onNotificationClick}
            iconColor="text-white"
            badgeColor="bg-red-500 text-white"
            className="hover:bg-white/20 rounded-full p-2 transition-colors"
          />
        </div>
      )}

      {/* Compact Content */}
      <div className="relative px-4 py-4 md:px-6 md:py-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Party Name & Theme with Photo */}
          <div className="flex items-center gap-3">
            {/* ✅ Child Photo Avatar */}
            <div className="relative flex-shrink-0">
              {childPhoto ? (
                <div className="relative group">
                  <img
                    src={childPhoto}
                    alt={firstName}
                    className="w-25 h-25 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {onPhotoUpload && (
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
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/50 shadow-lg flex items-center justify-center text-3xl md:text-4xl">
                    {getThemeEmoji()}
                  </div>
                  {onPhotoUpload && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-semibold">Add Photo</span>
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
              <h1 className="text-3xl md:text-6xl font-bold text-white drop-shadow-lg leading-tight capitalize">
                <span className="md:hidden">{firstName}'s</span>
                <span className="hidden md:inline">{getFullName()}'s</span>
                {' '}
                {currentTheme} Party
              </h1>
              {formattedDate && (
                <p className="text-sm md:text-base text-white/90 font-medium flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </p>
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

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary-300 to-secondary"></div>
    </div>
  );
}