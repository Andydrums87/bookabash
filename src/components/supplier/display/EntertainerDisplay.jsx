// components/supplier/display/EntertainerDisplay.jsx
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  User, 
  Clock,
  MapPin,
  Target,
  Settings,
  Sparkles,
  Star,
  Heart,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Gift,
  Key,
  Music,
  Truck
} from "lucide-react";

const EntertainerDisplay = ({ supplier, serviceDetails }) => {

  // State for expandable sections
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);

    // Helper function to get category icon and color
    const getCategoryInfo = (category) => {
      const categories = {
        service: { icon: <Gift className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
        access: { icon: <Key className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
        equipment: { icon: <Music className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
        premium: { icon: <Star className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
        logistics: { icon: <Truck className="w-4 h-4" />, color: "text-gray-700 border-gray-300 bg-gray-50" },
      };
      return categories[category] || categories.service;
    };

  // Helper function to render age groups
  const renderAgeGroups = (ageGroups) => {
    if (!ageGroups?.length) return null;
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-900 mb-2">Age Groups</h4>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((age, index) => (
            <Badge key={index} variant="outline" className="text-xs text-slate-700 border-slate-300 bg-slate-50">
              {age}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render expandable badge list
  const renderExpandableBadges = (items, title, icon, colorClass, showAll, setShowAll, maxInitial = 6) => {
    if (!items?.length) return null;

    const displayItems = showAll ? items : items.slice(0, maxInitial);
    const hasMore = items.length > maxInitial;

    return (
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-1">
          {icon && <span className="w-3 h-3">{icon}</span>}
          {title}
          {items.length > 0 && (
            <span className="text-xs text-gray-500 font-normal">({items.length})</span>
          )}
        </h4>

        <div className="space-y-2">
          {/* Grid layout for better organization */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayItems.map((item, index) => (
              <Badge key={index} variant="outline" className={`${colorClass} justify-center text-center text-xs`}>
                {item}
              </Badge>
            ))}
          </div>

          {/* Show more/less button */}
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal text-xs"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show {items.length - maxInitial} more
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

 // Helper function to render add-on services with horizontal scroll
const renderAddOnServices = (addOnServices) => {
  if (!addOnServices?.length) return null;
  
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Additional Services Available
          </h2>
        </div>
        <p className="text-gray-600 mb-6">Optional extras you can add to enhance your booking</p>
        
        {/* Horizontal scrolling container */}
        <div className="relative">
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-4 min-w-max">
              {addOnServices.map((addon, index) => {
                const categoryInfo = getCategoryInfo(addon.category);
                
                return (
                  <div 
                    key={index} 
                    className="flex-shrink-0 w-72 p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-[hsl(var(--primary-500))] rounded-xl hover:border-primary-400 hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Header with icon and price */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg text-primary-600 group-hover:bg-[hsl(var(--primary-500))] transition-colors">
                          {categoryInfo.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-md">{addon.name}</h4>
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            {categoryInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price badge */}
                    <div className="mb-3">
                      <span className="inline-block px-4 py-2 bg-primary-500 text-white font-bold text-xl rounded-lg">
                        £{addon.price}
                      </span>
                    </div>
                    
                    {/* Description */}
                    {addon.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {addon.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Scroll indicator */}
          {addOnServices.length > 3 && (
            <div className="text-center mt-2">
              <p className="text-sm text-primary-600 font-medium">
                ← Scroll horizontally to see all {addOnServices.length} services →
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

  // Alternative: Categorized themes helper
  const renderCategorizedThemes = (themes) => {
    if (!themes?.length) return null;

    // Group themes by category (you could expand this logic)
    const categories = {
      'Characters': themes.filter(theme => 
        ['Princess', 'Pirate', 'Disney Princess', 'DC Heroes', 'Fairy'].includes(theme)
      ),
      'Adventure': themes.filter(theme => 
        ['Animal Safari', 'Jungle Safari', 'Deep Sea', 'Space', 'Dinosaur'].includes(theme)
      ),
      'Learning': themes.filter(theme => 
        ['Mad Scientist', 'Science Lab', 'Robot Building', 'Engineering'].includes(theme)
      ),
      'Fantasy': themes.filter(theme => 
        ['Fairy Tale', 'Frozen', 'Fairy'].includes(theme)
      ),
      'Sports & Active': themes.filter(theme => 
        ['Sports'].includes(theme)
      )
    };

    // Remove empty categories and collect uncategorized
    const filledCategories = Object.entries(categories).filter(([_, items]) => items.length > 0);
    const categorizedThemes = filledCategories.flatMap(([_, items]) => items);
    const uncategorized = themes.filter(theme => !categorizedThemes.includes(theme));

    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
          <Star className="w-4 h-4" />
          Available Themes
          <span className="text-sm text-gray-500 font-normal">({themes.length})</span>
        </h4>
        
        <div className="space-y-4">
          {filledCategories.map(([category, categoryThemes]) => (
            <div key={category}>
              <h5 className="text-sm font-medium text-gray-700 mb-2">{category}</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pl-2">
                {categoryThemes.map((theme, index) => (
                  <Badge key={index} variant="outline" className="text-primary-700 border-primary-300 bg-primary-50 justify-center text-center">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          {uncategorized.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Other Themes</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pl-2">
                {uncategorized.map((theme, index) => (
                  <Badge key={index} variant="outline" className="text-primary-700 border-primary-300 bg-primary-50 justify-center text-center">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };



  return (
    <div className="space-y-6">
         {/* About Us Section */}
         {serviceDetails.aboutUs && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">About Us</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {serviceDetails.aboutUs}
          </p>
        </div>
      )}
      {/* Entertainment Details */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Entertainment Details</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {serviceDetails.performerType && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Performer Type</h4>
                <p className="text-sm text-gray-700">{serviceDetails.performerType}</p>
              </div>
            )}

            {serviceDetails.experienceLevel && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Experience Level</h4>
                <p className="text-sm text-gray-700">{serviceDetails.experienceLevel}</p>
              </div>
            )}

            {serviceDetails.travelRadius && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Travel Radius
                </h4>
                <p className="text-sm text-gray-700">{serviceDetails.travelRadius} miles</p>
              </div>
            )}

            {serviceDetails.setupTime && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Setup Time
                </h4>
                <p className="text-sm text-gray-700">{serviceDetails.setupTime} minutes</p>
              </div>
            )}

            {(serviceDetails.groupSizeMin || serviceDetails.groupSizeMax) && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Group Size
                </h4>
                <p className="text-sm text-gray-700">
                  {serviceDetails.groupSizeMin && serviceDetails.groupSizeMax
                    ? `${serviceDetails.groupSizeMin}-${serviceDetails.groupSizeMax} people`
                    : serviceDetails.groupSizeMin
                      ? `${serviceDetails.groupSizeMin}+ people`
                      : `Up to ${serviceDetails.groupSizeMax} people`
                  }
                </p>
              </div>
            )}
          </div>

          {/* IMPROVED: Performance Styles with expandable layout */}
          {renderExpandableBadges(
            serviceDetails.performanceStyle,
            "Performance Styles",
            <Zap className="w-4 h-4" />,
            "text-teal-700 border-teal-300 bg-teal-50",
            showAllStyles,
            setShowAllStyles,
            6
          )}

          {/* IMPROVED: Themes - Choose one of these approaches */}
          
          {/* Option 1: Simple expandable grid */}
          {renderExpandableBadges(
            serviceDetails.themes,
            "Available Themes",
            <Star className="w-4 h-4" />,
            "text-primary-700 border-[hsl(var(--primary-300))] bg-primary-50",
            showAllThemes,
            setShowAllThemes,
            8
          )}

          {/* Option 2: Categorized themes (uncomment to use instead) */}
          {/* {renderCategorizedThemes(serviceDetails.themes)} */}

          {renderAgeGroups(serviceDetails.ageGroups)}

          {serviceDetails.equipment && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Equipment Provided
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{serviceDetails.equipment}</p>
            </div>
          )}

          {serviceDetails.specialSkills && (
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-1">Special Skills & Qualifications</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{serviceDetails.specialSkills}</p>
            </div>
          )}
      </div>



      {/* Personal Bio */}
      {serviceDetails.personalBio && Object.keys(serviceDetails.personalBio).some(key => serviceDetails.personalBio[key]) && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">Meet the Entertainer</h2>

          <div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {serviceDetails.personalBio.yearsExperience && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Years Experience</h4>
                    <p className="text-sm text-gray-700">{serviceDetails.personalBio.yearsExperience} years</p>
                  </div>
                )}
                
                {serviceDetails.personalBio.inspiration && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Inspiration
                    </h4>
                    <p className="text-sm text-gray-700">{serviceDetails.personalBio.inspiration}</p>
                  </div>
                )}

                {serviceDetails.personalBio.favoriteEvent && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Favorite Event</h4>
                    <p className="text-sm text-gray-700">{serviceDetails.personalBio.favoriteEvent}</p>
                  </div>
                )}

                {serviceDetails.personalBio.dreamClient && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Dream Celebrity Client</h4>
                    <p className="text-sm text-gray-700 italic">{serviceDetails.personalBio.dreamClient}</p>
                  </div>
                )}
              </div>

              {serviceDetails.personalBio.personalStory && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">My Story</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{serviceDetails.personalBio.personalStory}</p>
                </div>
              )}
            </div>
        </div>
      )}

      {/* Performance Requirements */}
      {serviceDetails.performanceSpecs && Object.keys(serviceDetails.performanceSpecs).some(key => serviceDetails.performanceSpecs[key]) && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">Performance Requirements</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {serviceDetails.performanceSpecs.spaceRequired && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Space Required</h4>
                  <p className="text-sm text-gray-700">{serviceDetails.performanceSpecs.spaceRequired}</p>
                </div>
              )}

              {serviceDetails.performanceSpecs.maxGroupSize && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Maximum Group Size</h4>
                  <p className="text-sm text-gray-700">{serviceDetails.performanceSpecs.maxGroupSize} people</p>
                </div>
              )}

              {serviceDetails.performanceSpecs.powerRequired !== undefined && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Power Supply</h4>
                  <p className="text-xs text-gray-700">
                    {serviceDetails.performanceSpecs.powerRequired ? 'Required' : 'Not required'}
                  </p>
                </div>
              )}

              {serviceDetails.performanceSpecs.supervisionRequired !== undefined && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">Adult Supervision</h4>
                  <p className="text-xs text-gray-700">
                    {serviceDetails.performanceSpecs.supervisionRequired
                      ? 'Required during performance'
                      : 'Not required'}
                  </p>
                </div>
              )}
            </div>
        </div>
      )}

      {/* Legacy Support - show old structure if no new structure exists */}
      {serviceDetails.aboutService && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">About This Service</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{serviceDetails.aboutService}</p>
        </div>
      )}
    </div>
  );
};

export default EntertainerDisplay;