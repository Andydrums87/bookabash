// components/supplier/display/PersonalBioDisplay.jsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, Heart } from "lucide-react";

const PersonalBioDisplay = ({ personalBio, supplierName }) => {
  // Don't render if no personal bio data exists
  if (!personalBio || !Object.keys(personalBio).some(key => personalBio[key])) {
    return null;
  }

  return (
    <Card className="border-gray-300">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-pink-600" />
          About Me
        </h2>
        
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {personalBio.yearsExperience && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Years Experience</h4>
                <p className="text-gray-700">{personalBio.yearsExperience} years</p>
              </div>
            )}
            
            {personalBio.inspiration && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Inspiration
                </h4>
                <p className="text-gray-700">{personalBio.inspiration}</p>
              </div>
            )}

            {personalBio.favoriteEvent && (
              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-2">Favorite Event</h4>
                <p className="text-gray-700">{personalBio.favoriteEvent}</p>
              </div>
            )}

            {personalBio.dreamClient && (
              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-2">Dream Celebrity Client</h4>
                <p className="text-gray-700 italic">{personalBio.dreamClient}</p>
              </div>
            )}
          </div>
          
          {personalBio.personalStory && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">My Story</h4>
              <p className="text-gray-700 leading-relaxed">{personalBio.personalStory}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalBioDisplay;