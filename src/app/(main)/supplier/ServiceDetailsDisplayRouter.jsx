// ServiceDetailsDisplayRouter.jsx
import React from 'react';

// Import individual display components
import EntertainerDisplay from '../../../components/supplier/display/EntertainerDisplay';
import VenueDisplay from '../../../components/supplier/display/VenueDisplay';
import FacePaintingDisplay from '../../../components/supplier/display/display/FacePaintingDisplay';
import CateringDisplay from '../../../components/supplier/display/display/CateringDisplay';
import BouncyCastleDisplay from '../../../components/supplier/display/display/BouncyCastleDisplay';
import DecorationsDisplay from '../../../components/supplier/display/display/DecorationsDisplay';

// Enhanced category mapping with more comprehensive detection
const CATEGORY_MAPPINGS = {
  // Entertainment categories
  entertainment: [
    'entertainment', 'entertainer', 'magician', 'clown', 'performer', 
    'character performer', 'princess', 'superhero', 'storyteller',
    'puppeteer', 'musician', 'singer', 'dancer', 'comedian',
    'children\'s entertainer', 'party entertainer', 'kids entertainer'
  ],
  
  // Venue categories  
  venues: [
    'venues', 'venue', 'hall hire', 'party venue', 'event venue',
    'community hall', 'church hall', 'function room', 'event space',
    'private venue', 'party room', 'celebration venue'
  ],
  
  // Face painting categories
  face_painting: [
    'face_painting', 'face painting', 'facepainting', 'face_painter',
    'face painter', 'body painting', 'temporary tattoos', 'glitter tattoos',
    'henna artist', 'makeup artist'
  ],
  
  // Catering categories
  catering: [
    'catering', 'caterer', 'food', 'catering services', 'party food',
    'buffet catering', 'mobile catering', 'event catering', 'kids catering',
    'birthday cake', 'cake maker', 'baker', 'desserts', 'sweets',
    'candy buffet', 'chocolate fountain', 'ice cream van', 'pizza van',
    'food truck', 'mobile bar', 'drinks service'
  ],
  
  // Activities/Bouncy Castle categories
  activities: [
    'activities', 'bouncy_castle', 'bouncy castle', 'bouncy castle hire',
    'inflatable hire', 'soft play', 'party equipment', 'inflatables',
    'assault course', 'obstacle course', 'climbing wall', 'ball pit',
    'party games', 'activity hire', 'outdoor games', 'sports equipment',
    'trampolines', 'slides', 'bouncy castles'
  ],
  
  // Decorations categories
  decorations: [
    'decorations', 'decoration', 'party decorations', 'balloon arch',
    'balloon arches', 'event styling', 'party styling', 'balloon artist',
    'balloon designer', 'balloon decorations', 'event decorator',
    'party planner', 'theme decorations', 'backdrops', 'centerpieces',
    'table decorations', 'floral arrangements', 'lighting hire',
    'props hire', 'party props'
  ]
};

const ServiceDetailsDisplayRouter = ({ supplier }) => {
  const serviceDetails = supplier?.serviceDetails;
  
  if (!serviceDetails) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium mb-2">No Service Details Available</h3>
          <p className="text-sm">This supplier hasn't added detailed service information yet.</p>
        </div>
      </div>
    );
  }

  // Enhanced category detection function
  const detectCategory = () => {
    // Get all possible category indicators
    const indicators = [
      supplier?.category,
      supplier?.serviceType,
      serviceDetails?.cateringType,
      serviceDetails?.performerType,
      serviceDetails?.venueType,
      serviceDetails?.businessType,
      serviceDetails?.artistType
    ].filter(Boolean).map(indicator => indicator.toLowerCase());
    
   
    
    // Check each category mapping
    for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
      for (const indicator of indicators) {
        if (keywords.some(keyword => 
          indicator.includes(keyword) || keyword.includes(indicator)
        )) {
        
          return category;
        }
      }
    }
    
    // Fallback - check business name for hints
    const businessName = (supplier?.name || '').toLowerCase();
    if (businessName) {
      for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
        if (keywords.some(keyword => businessName.includes(keyword))) {
         
          return category;
        }
      }
    }
    

    return 'entertainment'; // Default fallback
  };

  const getDisplayComponent = () => {
    const detectedCategory = detectCategory();
    
    const commonProps = {
      supplier,
      serviceDetails
    };
    
    switch (detectedCategory) {
      case 'entertainment':
        return <EntertainerDisplay {...commonProps} />;
      
      case 'venues':
        return <VenueDisplay {...commonProps} />;
        
      case 'face_painting':
        return <FacePaintingDisplay {...commonProps} />;
            
      case 'catering':
        return <CateringDisplay {...commonProps} />;
                
      case 'decorations':
        return <DecorationsDisplay {...commonProps} />;
                    
      case 'activities':
        return <BouncyCastleDisplay {...commonProps} />;
      
      default:
        
        return <EntertainerDisplay {...commonProps} />;
    }
  };

  return (
    <div className="service-details-display">
      {getDisplayComponent()}
    </div>
  );
};

export default ServiceDetailsDisplayRouter;