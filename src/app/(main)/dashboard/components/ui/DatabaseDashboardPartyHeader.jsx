// DatabasePartyHeader.jsx - Updated with notification icon
"use client"

import { Badge } from "@/components/ui/badge"
import ChatNotificationIcon from "../../DatabaseDashboard/components/ChatNotificationIcon";

export default function DatabasePartyHeader({ 
  theme, 
  partyDetails, 
  currentParty,
  dataSource = 'database',
  isSignedIn = true,
  enquiries = [],
  // NEW: Notification props
  unreadCount = 0,
  hasNewMessages = false,
  onNotificationClick
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
      className="relative rounded-2xl shadow-2xl overflow-hidden mb-6 bg-primary-400"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-6 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full animate-pulse"></div>
        <div
          className="absolute top-8 right-8 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-6 left-12 w-8 h-8 md:w-12 md:h-12 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-12 right-6 w-4 h-4 md:w-6 md:h-6 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>

      {/* NEW: Notification Icon - positioned in top right */}
      {hasNewMessages && (
        <div className="absolute top-4 right-4 z-10">
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

      {/* Clean, simple content */}
      <div className="relative px-6 py-8 md:p-10 text-white">
        <div className="space-y-4">
          {/* Party Title - Clean and prominent */}
          <div className="space-y-3">
            <h1
              suppressHydrationWarning={true}
              className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight tracking-tight text-center md:text-left"
              style={{
                textShadow: "0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <span className="md:hidden">{getFirstName()}'s</span>
              <span className="hidden md:inline">{getFullName()}'s</span>
              <br />
              <span className="text-4xl md:text-5xl">Big Day!</span>
            </h1>
            {/* <p className="hidden text-lg md:text-2xl text-white/95 drop-shadow-lg font-medium leading-relaxed text-center md:text-left">
              {currentTheme?.description || `An amazing ${currentTheme} celebration`}
            </p> */}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary-300 to-secondary"></div>
    </div>
  );
}