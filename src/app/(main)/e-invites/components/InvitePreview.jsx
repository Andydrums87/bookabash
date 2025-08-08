// components/InvitePreview.js

import React from 'react';
import { themes } from '@/lib/themes';
import { ChevronLeft } from 'lucide-react';

const InvitePreview = ({ themeKey, inviteData, className = "" }) => {
  // Helper function to resolve theme key
  const resolveThemeKey = (key) => {
    if (!key) return null;
    
    // Direct match
    if (themes[key]) {
      return key;
    }
    
    // Try to find partial matches for common mismatches
    const themeKeys = Object.keys(themes);
    
    // Handle common cases like "dinosaur" -> "dinosaur_v1"
    const partialMatch = themeKeys.find(themeKey => 
      themeKey.startsWith(key) || key.startsWith(themeKey.split('_')[0])
    );
    
    if (partialMatch) {
      console.warn(`Theme key mismatch: "${key}" resolved to "${partialMatch}"`);
      return partialMatch;
    }
    
    return null;
  };

  const resolvedThemeKey = resolveThemeKey(themeKey);
  const theme = resolvedThemeKey ? themes[resolvedThemeKey] : null;

  // Add safety check with better debugging
  if (!theme) {
    console.error('Theme resolution failed:');
    console.error('- Original themeKey:', themeKey);
    console.error('- Resolved themeKey:', resolvedThemeKey);
    console.error('- Available themes:', Object.keys(themes));
    
    return (
      <div className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg ${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="font-bold">Theme not found</div>
          <div className="text-sm">Looking for: {themeKey}</div>
          <div className="text-xs mt-2">Available: {Object.keys(themes).join(', ')}</div>
        </div>
      </div>
    );
  }
  
  const layout = theme.layoutConfig;

  return (
    <div
      id="invite-preview"
      data-invite-preview
      className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg ${className}`}
    >
      {/* Background */}
      <img
        src={theme.backgroundUrl}
        alt={`${theme.name} Background`}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Text overlays with responsive scaling */}
      {Object.entries(layout).map(([key, style]) => {
        // Use custom headline styles if available and this is a headline
        const finalStyle = key === 'headline' && inviteData.headlineStyles 
          ? { ...style, ...inviteData.headlineStyles }
          : style;

        return (
          <div
            key={key}
            className="absolute text-center"
            style={{
              left: finalStyle.left || '50%',
              top: finalStyle.top || '50%',
              transform: finalStyle.transform || 'translateX(-50%)',
              fontSize: getResponsiveFontSize(finalStyle.fontSize, key),
              fontWeight: finalStyle.fontWeight || 'bold',
              fontFamily: finalStyle.fontFamily || 'inherit',
              color: finalStyle.color || '#000',
              textShadow: finalStyle.textShadow || 'none',
              fontStyle: finalStyle.fontStyle || 'normal',
              lineHeight: finalStyle.lineHeight || '1.2',
              whiteSpace: key === 'headline' ? 'normal' : 'nowrap',
              wordWrap: 'break-word',
              maxWidth: key === 'headline' ? '90%' : 'auto',
              padding: '0',
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            {getTextContent(key, inviteData)}
          </div>
        );
      })}
    </div>
  );
};

// Get responsive font sizes based on container size
const getResponsiveFontSize = (originalSize, key) => {
  if (typeof originalSize !== 'string') return originalSize;

  const size = parseInt(originalSize);
  
  // Scale down fonts for smaller preview (from 600px width to ~300-400px)
  const scaleFactor = 0.5; // Adjust this to make text bigger or smaller
  
  if (key === 'headline') {
    return `${Math.max(16, size * scaleFactor)}px`;
  }
  
  return `${Math.max(10, size * scaleFactor)}px`;
};

const getTextContent = (key, data) => {
  switch (key) {
    case 'headline':
      const headlineText = data.headlineText || data.headline || `${data.childName}'s ${data.age}th Birthday`;
      
      // If we have birthday coloring, apply it
      if (data.birthdayColor && headlineText.includes('Birthday')) {
        const parts = headlineText.split('Birthday');
        return (
          <>
            {parts[0]}
            <span style={{ color: data.birthdayColor }}>Birthday</span>
            {parts[1]}
          </>
        );
      }
      
      return headlineText;
    case 'childName':
      return data.childName;
    case 'age':
      return data.age ? `${data.age}` : '';
    case 'date':
      return data.formattedDate || data.date;
    case 'time':
      return data.time;
    case 'location':
      return data.venue;
    case 'message':
      return data.message;
    case 'inviteText':
      return `You're invited to ${data.childName}'s Birthday Party!`;
    case 'ageDisplay':
      return data.age ? `Turning ${data.age}!` : '';
    default:
      return '';
  }
};

export default InvitePreview;