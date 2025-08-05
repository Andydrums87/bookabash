// components/InviteDisplay.js

import React from 'react'
import ReactDraggableInvite from '../../e-invites/components/ReactDraggableInvite'
import { formatDateForDisplay, getBirthdayColor } from '../utils/helperFunctions'
import { getHeadlineText, getHeadlineStyles } from '../utils/headlineUtils'

const InviteDisplay = ({ 
  generatedImage, 
  inviteData, 
  selectedTheme,
  className = "",
  showControls = false 
}) => {
  // Try to parse the generatedImage to determine type
  let inviteType = 'template'
  let parsedData = null
  
  try {
    if (typeof generatedImage === 'string' && generatedImage.startsWith('{')) {
      parsedData = JSON.parse(generatedImage)
      inviteType = parsedData.type || 'template'
    }
  } catch (error) {
    console.warn('Could not parse generatedImage:', error)
  }

  // If it's an AI generated invite, show the image
  if (inviteType === 'ai-generated' && parsedData?.imageUrl) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="relative w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
          <img
            src={parsedData.imageUrl}
            alt="AI Generated Invitation"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
            AI Generated
          </div>
        </div>
      </div>
    )
  }

  // For template invites or if we have theme data, use ReactDraggableInvite
  if (selectedTheme && inviteData) {
    // Enhanced invite data for template rendering
    const enhancedInviteData = {
      ...inviteData,
      headlineText: getHeadlineText(inviteData, selectedTheme),
      formattedDate: formatDateForDisplay(inviteData.date),
      headlineStyles: getHeadlineStyles(inviteData.headline, selectedTheme),
      birthdayColor: getBirthdayColor(selectedTheme),
    }

    return (
      <div className={className}>
        <ReactDraggableInvite
          themeKey={selectedTheme}
          inviteData={enhancedInviteData}
          onLayoutSave={() => {}} // No-op for display only
          showControls={showControls}
        />
      </div>
    )
  }

  // Fallback - show placeholder
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📨</div>
          <div className="font-bold text-lg">Invitation</div>
          <div className="text-sm">Loading invitation...</div>
        </div>
      </div>
    </div>
  )
}

export default InviteDisplay