// components/supplier/display/ServiceDetailsDisplayRouter.jsx
import React from 'react';


// Import specific display components
const VenueDisplay = React.lazy(() => import('./VenueDisplay'));
const EntertainerDisplay = React.lazy(() => import('./EntertainerDisplay'));
const CateringDisplay = React.lazy(() => import('./CateringDisplay'));
const DecorationsDisplay = React.lazy(() => import('./DecorationsDisplay'));
const ActivitiesDisplay = React.lazy(() => import('./ActivitiesDisplay'));
const FacePaintingDisplay = React.lazy(() => import('./FacePaintingDisplay'));

// Basic fallback display for categories we haven't created yet
const BasicServiceDisplay = ({ supplier, serviceDetails, isPreview }) => {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-bold mb-4">Service Details</h2>
      {isPreview && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          Preview Mode: Basic Service Display
        </div>
      )}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Category:</h4>
          <p>{supplier?.category || supplier?.serviceType || 'Unknown'}</p>
        </div>
        
        {serviceDetails?.performerType && (
          <div>
            <h4 className="font-semibold">Performer Type:</h4>
            <p>{serviceDetails.performerType}</p>
          </div>
        )}
        
        {serviceDetails?.cateringType && (
          <div>
            <h4 className="font-semibold">Catering Type:</h4>
            <p>{serviceDetails.cateringType}</p>
          </div>
        )}
        
        {serviceDetails?.aboutService && (
          <div>
            <h4 className="font-semibold">About:</h4>
            <p>{serviceDetails.aboutService}</p>
          </div>
        )}

        {serviceDetails?.aboutUs && (
          <div>
            <h4 className="font-semibold">About Us:</h4>
            <p>{serviceDetails.aboutUs}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced category detection
const detectCategory = (supplier) => {
  // For themed businesses, we need to check serviceDetails for the actual service type
  const serviceTypeFromDetails = supplier?.serviceDetails?.performerType || 
                                 supplier?.serviceDetails?.cateringType ||
                                 supplier?.serviceDetails?.venueType;
  
  const indicators = [
    supplier?.category === 'themed' ? null : supplier?.category, // Ignore 'themed' category
    supplier?.serviceType,
    serviceTypeFromDetails,
    supplier?.serviceDetails?.cateringType,
    supplier?.serviceDetails?.performerType,
    supplier?.serviceDetails?.venueType,
    supplier?.serviceDetails?.businessType,
    supplier?.serviceDetails?.artistType
  ].filter(Boolean).map(indicator => indicator?.toLowerCase());

  // Special handling for themed businesses - look at serviceDetails structure
  const hasEntertainmentStructure = supplier?.serviceDetails && (
    supplier.serviceDetails.themes || 
    supplier.serviceDetails.performanceStyle ||
    supplier.serviceDetails.personalBio ||
    supplier.serviceDetails.performanceSpecs
  );

  // Venues
  if (indicators.some(i => 
    ['venue', 'venues', 'hall', 'function room', 'event space', 'party venue', 'community hall'].some(k => i.includes(k))
  )) {

    return 'venues';
  }

  // Entertainment - Enhanced detection for themed businesses
  if (indicators.some(i => 
    ['entertainment', 'entertainer', 'magician', 'clown', 'performer', 'character', 'princess', 'superhero'].some(k => i.includes(k))
  ) || hasEntertainmentStructure) {

    return 'entertainment';
  }

  // Catering
  if (indicators.some(i => 
    ['catering', 'caterer', 'food', 'cake', 'baker', 'dessert', 'buffet'].some(k => i.includes(k))
  )) {

    return 'catering';
  }

  // Face Painting
  if (indicators.some(i => 
    ['face_painting', 'face painting', 'face painter', 'body painting'].some(k => i.includes(k))
  )) {

    return 'face_painting';
  }

  // Activities
  if (indicators.some(i => 
    ['bouncy', 'inflatable', 'soft play', 'activities', 'equipment'].some(k => i.includes(k))
  )) {

    return 'activities';
  }

  // Decorations
  if (indicators.some(i => 
    ['decoration', 'balloon', 'styling', 'party planning'].some(k => i.includes(k))
  )) {

    return 'decorations';
  }


  return 'basic';
};

const ServiceDetailsDisplayRouter = ({ supplier, isPreview, themeAccentColor }) => {
  const serviceDetails = supplier?.serviceDetails;


  if (!serviceDetails) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 text-center">No service details available</p>
        {isPreview && (
          <p className="text-sm text-blue-600 text-center mt-2">Preview Mode: No service details found</p>
        )}
      </div>
    );
  }

  const detectedCategory = detectCategory(supplier);

  // Create props WITH isPreview and themeAccentColor for the specific display components
  const displayProps = {
    supplier,
    serviceDetails: {
      ...serviceDetails,
      personalBio: undefined // Remove personalBio from service details
    },
    isPreview, // ✅ ADD THIS - Pass isPreview to all display components
    themeAccentColor // ✅ Pass theme accent color
  };
  
  // Render based on detected category
  return (
    <div className="space-y-6">
     
      {/* Service-specific details */}
      <React.Suspense fallback={<div className="p-6">Loading service details...</div>}>
        {(() => {
          switch (detectedCategory) {
            case 'venues':
              return <VenueDisplay {...displayProps} />;
            
            case 'entertainment':
              return <EntertainerDisplay {...displayProps} />;
            
            case 'catering':
              return <CateringDisplay {...displayProps} />;
            
            case 'decorations':
              return <DecorationsDisplay {...displayProps} />;
            
            case 'activities':
              return <ActivitiesDisplay {...displayProps} />;
            
            case 'face_painting':
              return <FacePaintingDisplay {...displayProps} />;
            
            default:
              return <BasicServiceDisplay {...displayProps} />;
          }
        })()}
      </React.Suspense>
    </div>
  );
};

export default ServiceDetailsDisplayRouter;