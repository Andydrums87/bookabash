// components/supplier/display/ServiceDetailsDisplayRouter.jsx
import React from 'react';
import PersonalBioDisplay from './PersonalBioDisplay';

// Import specific display components
const VenueDisplay = React.lazy(() => import('./VenueDisplay'));
const EntertainerDisplay = React.lazy(() => import('./EntertainerDisplay'));
const CateringDisplay = React.lazy(() => import('./CateringDisplay'));
const DecorationsDisplay = React.lazy(() => import('./DecorationsDisplay'));
const ActivitiesDisplay = React.lazy(() => import('./ActivitiesDisplay'));
const FacePaintingDisplay = React.lazy(() => import('./FacePaintingDisplay'));

// Basic fallback display for categories we haven't created yet
const BasicServiceDisplay = ({ supplier, serviceDetails }) => {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-bold mb-4">Service Details</h2>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Category:</h4>
          <p>{supplier?.category || 'Unknown'}</p>
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
      </div>
    </div>
  );
};

// Enhanced category detection
const detectCategory = (supplier) => {
  const indicators = [
    supplier?.category,
    supplier?.serviceType,
    supplier?.serviceDetails?.cateringType,
    supplier?.serviceDetails?.performerType,
    supplier?.serviceDetails?.venueType,
    supplier?.serviceDetails?.businessType,
    supplier?.serviceDetails?.artistType
  ].filter(Boolean).map(indicator => indicator?.toLowerCase());

  console.log('🔍 Category detection indicators:', indicators);

  // Venues
  if (indicators.some(i => 
    ['venue', 'venues', 'hall', 'function room', 'event space', 'party venue', 'community hall'].some(k => i.includes(k))
  )) {
    console.log('✅ Detected: venues');
    return 'venues';
  }

  // Entertainment
  if (indicators.some(i => 
    ['entertainment', 'entertainer', 'magician', 'clown', 'performer', 'character', 'princess', 'superhero'].some(k => i.includes(k))
  )) {
    console.log('✅ Detected: entertainment');
    return 'entertainment';
  }

  // Catering
  if (indicators.some(i => 
    ['catering', 'caterer', 'food', 'cake', 'baker', 'dessert', 'buffet'].some(k => i.includes(k))
  )) {
    console.log('✅ Detected: catering');
    return 'catering';
  }

  // Face Painting
  if (indicators.some(i => 
    ['face_painting', 'face painting', 'face painter', 'body painting'].some(k => i.includes(k))
  )) {
    console.log('✅ Detected: face_painting');
    return 'face_painting';
  }

  // Activities
  if (indicators.some(i => 
    ['bouncy', 'inflatable', 'soft play', 'activities', 'equipment'].some(k => i.includes(k))
  )) {
    console.log('✅ Detected: activities');
    return 'activities';
  }

  // Decorations
  if (indicators.some(i => 
    ['decoration', 'balloon', 'styling', 'party planning'].some(k => i.includes(k))
  )) {
    console.log('✅ Detected: decorations');
    return 'decorations';
  }

  console.log('⚠️ No category match found, defaulting to basic');
  return 'basic';
};

const ServiceDetailsDisplayRouter = ({ supplier }) => {
  const serviceDetails = supplier?.serviceDetails;
  
  console.log('🔍 ServiceDetailsDisplayRouter received:', {
    supplierName: supplier?.name,
    category: supplier?.category,
    hasServiceDetails: !!serviceDetails
  });
  
  if (!serviceDetails) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 text-center">No service details available</p>
      </div>
    );
  }
  
  const detectedCategory = detectCategory(supplier);
  // Create props without personalBio for the specific display components
  const serviceOnlyProps = { 
    supplier, 
    serviceDetails: {
      ...serviceDetails,
      personalBio: undefined // Remove personalBio from service details
    }
  };
  
  // Render based on detected category
  return (
    <div className="space-y-6">
   
      
      {/* Service-specific details */}
      <React.Suspense fallback={<div className="p-6">Loading service details...</div>}>
        {(() => {
          switch (detectedCategory) {
            case 'venues':
              return <VenueDisplay {...serviceOnlyProps} />;
            
            case 'entertainment':
              return <EntertainerDisplay {...serviceOnlyProps} />;
            
            case 'catering':
              return <CateringDisplay {...serviceOnlyProps} />;
            
            case 'decorations':
              return <DecorationsDisplay {...serviceOnlyProps} />;
            
            case 'activities':
              return <ActivitiesDisplay {...serviceOnlyProps} />;
            
            case 'face_painting':
              return <FacePaintingDisplay {...serviceOnlyProps} />;
            
            default:
              return <BasicServiceDisplay {...serviceOnlyProps} />;
          }
        })()}
      </React.Suspense>
    </div>
  );
};

export default ServiceDetailsDisplayRouter;