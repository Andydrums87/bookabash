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
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Age Groups</h4>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((age, index) => (
            <Badge key={index} variant="outline" className="text-slate-700 border-slate-300 bg-slate-50">
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
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-1">
          {icon && <span className="w-4 h-4">{icon}</span>}
          {title}
          {items.length > 0 && (
            <span className="text-sm text-gray-500 font-normal">({items.length})</span>
          )}
        </h4>
        
        <div className="space-y-3">
          {/* Grid layout for better organization */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayItems.map((item, index) => (
              <Badge key={index} variant="outline" className={`${colorClass} justify-center text-center`}>
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
              className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
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
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary-500" />
              Additional Services Available
            </h2>
            <p className="text-gray-600 mb-4">Optional extras you can add to enhance your booking</p>
            
            {/* Horizontal scrolling container */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-max">
                {addOnServices.map((addon, index) => {
                  const categoryInfo = getCategoryInfo(addon.category);
                  
                  return (
                    <div key={index} className="flex-shrink-0 w-72 p-4 bg-white border border-[hsl(var(--primary-500))] rounded-lg hover:bg-primary-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="text-primary-500">
                            {categoryInfo.icon}
                          </div>
                          <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                        </div>
                        <span className="font-bold text-primary-600 text-lg">£{addon.price}</span>
                      </div>
                      {addon.description && (
                        <p className="text-gray-700 text-sm mt-2">{addon.description}</p>
                      )}
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs text-primary-700 border-primary-300 bg-primary-100">
                          {addon.category === 'service' && 'Additional Service'}
                          {addon.category === 'access' && 'Facility Access'}
                          {addon.category === 'equipment' && 'Equipment Rental'}
                          {addon.category === 'premium' && 'Premium Upgrade'}
                          {addon.category === 'logistics' && 'Logistics'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Scroll indicator */}
            {addOnServices.length > 2 && (
              <p className="text-xs text-primary-600 mt-2 text-center">
                Scroll horizontally to see all {addOnServices.length} services
              </p>
            )}
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
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-600" />
              About Us
            </h2>
            
            <div className="rounded-lg p-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {serviceDetails.aboutUs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Entertainment Details */}
      <Card className="border-gray-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Entertainment Details
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {serviceDetails.performerType && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Performer Type</h4>
                <p className="text-gray-700">{serviceDetails.performerType}</p>
              </div>
            )}
            
            {serviceDetails.experienceLevel && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Experience Level</h4>
                <p className="text-gray-700">{serviceDetails.experienceLevel}</p>
              </div>
            )}

            {serviceDetails.travelRadius && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Travel Radius
                </h4>
                <p className="text-gray-700">{serviceDetails.travelRadius} miles</p>
              </div>
            )}

            {serviceDetails.setupTime && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Setup Time
                </h4>
                <p className="text-gray-700">{serviceDetails.setupTime} minutes</p>
              </div>
            )}

            {(serviceDetails.groupSizeMin || serviceDetails.groupSizeMax) && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Group Size
                </h4>
                <p className="text-gray-700">
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
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Equipment Provided
              </h4>
              <p className="text-gray-700 leading-relaxed">{serviceDetails.equipment}</p>
            </div>
          )}

          {serviceDetails.specialSkills && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Special Skills & Qualifications</h4>
              <p className="text-gray-700 leading-relaxed">{serviceDetails.specialSkills}</p>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Personal Bio */}
      {serviceDetails.personalBio && Object.keys(serviceDetails.personalBio).some(key => serviceDetails.personalBio[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-600" />
              Meet the Entertainer
            </h2>
            
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {serviceDetails.personalBio.yearsExperience && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Years Experience</h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.yearsExperience} years</p>
                  </div>
                )}
                
                {serviceDetails.personalBio.inspiration && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      Inspiration
                    </h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.inspiration}</p>
                  </div>
                )}

                {serviceDetails.personalBio.favoriteEvent && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Favorite Event</h4>
                    <p className="text-gray-700">{serviceDetails.personalBio.favoriteEvent}</p>
                  </div>
                )}

                {serviceDetails.personalBio.dreamClient && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Dream Celebrity Client</h4>
                    <p className="text-gray-700 italic">{serviceDetails.personalBio.dreamClient}</p>
                  </div>
                )}
              </div>
              
              {serviceDetails.personalBio.personalStory && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">My Story</h4>
                  <p className="text-gray-700 leading-relaxed">{serviceDetails.personalBio.personalStory}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Requirements */}
      {serviceDetails.performanceSpecs && Object.keys(serviceDetails.performanceSpecs).some(key => serviceDetails.performanceSpecs[key]) && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              Performance Requirements
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.performanceSpecs.spaceRequired && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Space Required</h4>
                  <p className="text-gray-700">{serviceDetails.performanceSpecs.spaceRequired}</p>
                </div>
              )}

              {serviceDetails.performanceSpecs.maxGroupSize && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Maximum Group Size</h4>
                  <p className="text-gray-700">{serviceDetails.performanceSpecs.maxGroupSize} people</p>
                </div>
              )}

              {serviceDetails.performanceSpecs.powerRequired !== undefined && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Power Supply</h4>
                  <p className={`text-sm px-3 py-1 rounded-full inline-block ${
                    serviceDetails.performanceSpecs.powerRequired 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {serviceDetails.performanceSpecs.powerRequired ? 'Required' : 'Not required'}
                  </p>
                </div>
              )}

              {serviceDetails.performanceSpecs.supervisionRequired !== undefined && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Adult Supervision</h4>
                  <p className={`text-sm px-3 py-1 rounded-full inline-block ${
                    serviceDetails.performanceSpecs.supervisionRequired 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {serviceDetails.performanceSpecs.supervisionRequired 
                      ? 'Required during performance' 
                      : 'Not required'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

          {/* Add-on Services - Now with horizontal scrolling */}
          {renderAddOnServices(serviceDetails.addOnServices)}

      {/* Legacy Support - show old structure if no new structure exists */}
      {serviceDetails.aboutService && (
        <Card className="border-gray-300">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Service</h2>
            <p className="text-gray-700 leading-relaxed text-base">{serviceDetails.aboutService}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EntertainerDisplay;