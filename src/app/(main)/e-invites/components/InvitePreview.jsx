import React from 'react';
import { themes } from '@/lib/themes';

const InvitePreview = ({ themeKey, inviteData }) => {
  const theme = themes[themeKey];
  const layout = theme.layoutConfig;

  return (
    <div
      id="invite-preview"
      className="relative w-[600px] h-[800px] rounded-xl overflow-hidden border shadow"
    >
      {/* Background */}
      <img
        src={theme.backgroundUrl}
        alt={`${theme.name} Background`}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Text overlays */}
      {Object.entries(layout).map(([key, style]) => {
        // Use custom headline styles if available and this is a headline
        const finalStyle = key === 'headline' && inviteData.headlineStyles 
          ? { ...style, ...inviteData.headlineStyles }
          : style;

        return (
          <div
            key={key}
            style={{ position: 'absolute', ...finalStyle }}
          >
            {getTextContent(key, inviteData)}
          </div>
        );
      })}
    </div>
  );
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