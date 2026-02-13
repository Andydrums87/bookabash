// components/supplier/display/EntertainerDisplay.jsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Gift,
  Key,
  Music,
  Truck,
  Star
} from "lucide-react";

const EntertainerDisplay = ({ supplier, serviceDetails, themeAccentColor }) => {

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




  // Helper to format age groups into a readable range
  const formatAgeRange = (ageGroups) => {
    if (!ageGroups?.length) return 'All ages';

    // Extract numbers from age group strings
    const ages = ageGroups.flatMap(group => {
      const matches = group.match(/\d+/g);
      return matches ? matches.map(Number) : [];
    });

    if (ages.length === 0) return ageGroups.join(', ');

    const min = Math.min(...ages);
    const max = Math.max(...ages);

    if (min === max) return `${min} years`;
    return `${min}-${max} years`;
  };

  // Get package pricing info
  const packageData = supplier?.packageData || supplier?.selectedPackage || supplier?.packages?.[0];
  const price = packageData?.price || packageData?.originalPrice || null;

  return (
    <div className="space-y-6 relative z-10">
      {/* What You Need to Know - Simple and Natural */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          What You Need to Know
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
        </h2>

        <div className="space-y-4 text-base text-gray-700">
          {/* Age Range */}
          {serviceDetails.ageGroups && serviceDetails.ageGroups.length > 0 && (
            <div>
              <span className="font-semibold text-gray-900">Perfect for: </span>
              <span>{formatAgeRange(serviceDetails.ageGroups)}</span>
            </div>
          )}

          {/* Space Requirements */}
          {serviceDetails.performanceSpecs?.spaceRequired && (
            <div>
              <span className="font-semibold text-gray-900">Space needed: </span>
              <span>{serviceDetails.performanceSpecs.spaceRequired}</span>
            </div>
          )}

          {/* Travel Radius */}
          {serviceDetails.travelRadius && (
            <div>
              <span className="font-semibold text-gray-900">Coverage area: </span>
              <span>Up to {serviceDetails.travelRadius} miles</span>
            </div>
          )}

          {/* Timings - Standardised for 2-hour parties */}
          <div>
            <span className="font-semibold text-gray-900 block mb-2">Timings:</span>
            <div className="pl-4 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-[hsl(var(--primary-500))] mt-1">•</span>
                <span>Entertainer arrives shortly before the party to prepare</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[hsl(var(--primary-500))] mt-1">•</span>
                <span>First session of games and interactive activities</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[hsl(var(--primary-500))] mt-1">•</span>
                <span>Break for food and refreshments</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[hsl(var(--primary-500))] mt-1">•</span>
                <span>Final session of games, challenges, and character fun</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Entertainer - if exists */}
      {serviceDetails.personalBio?.personalStory && (
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            Meet the Entertainer
            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
          </h2>
          {serviceDetails.personalBio.yearsExperience && (
            <p className="text-base text-gray-700 mb-3">
              <span className="font-semibold">{serviceDetails.personalBio.yearsExperience} years of experience</span> bringing joy to parties
            </p>
          )}
          <p className="text-base text-gray-700 leading-relaxed">
            {serviceDetails.personalBio.personalStory}
          </p>
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