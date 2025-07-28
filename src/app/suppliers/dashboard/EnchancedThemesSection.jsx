"use client"

import React, { useState } from 'react';
import { Search, Plus, X, Tag, Sparkles, Star, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EnhancedThemesSection = ({ details, setDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('characters'); // Default to characters instead of 'all'

  // Extensive theme categories with popular themes
  const themeCategories = {
    characters: {
      label: 'Characters & Heroes',
      emoji: '🦸',
      themes: [
        'Princess', 'Superhero', 'Batman', 'Spider-Man', 'Wonder Woman', 'Superman',
        'Disney Princess', 'Frozen', 'Moana', 'Belle', 'Cinderella', 'Ariel',
        'Marvel Heroes', 'DC Heroes', 'Avengers', 'Justice League',
        'Unicorn', 'Fairy', 'Mermaid', 'Dragon', 'Knight', 'Wizard'
      ]
    },
    adventure: {
      label: 'Adventure & Exploration',
      emoji: '🗺️',
      themes: [
        'Pirate', 'Space', 'Dinosaur', 'Jungle Safari', 'Ocean Adventure',
        'Treasure Hunt', 'Explorer', 'Astronaut', 'Deep Sea', 'Wild West',
        'Archaeological Dig', 'Time Travel', 'Lost World', 'Adventure Island'
      ]
    },
    animals: {
      label: 'Animals & Nature',
      emoji: '🦁',
      themes: [
        'Animal Safari', 'Farm Animals', 'Zoo Animals', 'Pets', 'Jungle Animals',
        'Ocean Creatures', 'Forest Friends', 'Woodland Creatures', 'Birds',
        'Reptiles', 'Insects & Bugs', 'Pet Show', 'Animal Rescue'
      ]
    },
    fantasy: {
      label: 'Fantasy & Magic',
      emoji: '✨',
      themes: [
        'Magic', 'Fairy Tale', 'Enchanted Forest', 'Castle', 'Medieval',
        'Mythology', 'Greek Gods', 'Norse Mythology', 'Celtic Legends',
        'Magical Creatures', 'Spells & Potions', 'Wizarding World'
      ]
    },
    science: {
      label: 'Science & Learning',
      emoji: '🧪',
      themes: [
        'Science Lab', 'Mad Scientist', 'Chemistry', 'Physics Fun',
        'Space Science', 'Nature Science', 'Inventor', 'Robot Building',
        'Engineering', 'Mathematics Magic', 'Weather Science'
      ]
    },
    sports: {
      label: 'Sports & Activities',
      emoji: '⚽',
      themes: [
        'Football', 'Soccer', 'Basketball', 'Tennis', 'Swimming',
        'Olympics', 'Gymnastics', 'Dance', 'Martial Arts', 'Racing',
        'Baseball', 'Cricket', 'Hockey', 'Athletics'
      ]
    },
    seasonal: {
      label: 'Seasonal & Holidays',
      emoji: '🎄',
      themes: [
        'Christmas', 'Halloween', 'Easter', 'Valentine\'s Day', 'St. Patrick\'s Day',
        'Thanksgiving', 'New Year', 'Summer', 'Winter Wonderland', 'Spring',
        'Autumn/Fall', 'Beach Party', 'Pool Party', 'Garden Party'
      ]
    },
    creative: {
      label: 'Arts & Creativity',
      emoji: '🎨',
      themes: [
        'Art Party', 'Craft Workshop', 'Painting', 'Drawing', 'Sculpture',
        'Music & Dance', 'Theater', 'Storytelling', 'Poetry', 'Creative Writing',
        'Fashion Design', 'Jewelry Making', 'Pottery'
      ]
    },
    food: {
      label: 'Food & Cooking',
      emoji: '🍰',
      themes: [
        'Cooking Class', 'Baking', 'Pizza Making', 'Cupcake Decorating',
        'Ice Cream Social', 'Chocolate Factory', 'Healthy Eating',
        'International Cuisine', 'Picnic', 'Tea Party'
      ]
    },
    colors: {
      label: 'Colors & Patterns',
      emoji: '🌈',
      themes: [
        'Rainbow', 'Pink Party', 'Blue Theme', 'Red Theme', 'Purple Magic',
        'Gold & Silver', 'Black & White', 'Neon Glow', 'Pastel Colors',
        'Bright & Bold', 'Monochrome', 'Tie-Dye'
      ]
    }
  };

  // Get all themes from all categories
  const getAllThemes = () => {
    return Object.values(themeCategories).flatMap(category => category.themes);
  };

  // Filter themes based on search and category
  const getFilteredThemes = () => {
    let themes = [];
    
    // Always show specific category, default to characters if 'all' is selected
    const categoryToShow = selectedCategory === 'all' ? 'characters' : selectedCategory;
    themes = themeCategories[categoryToShow]?.themes || [];
    
    if (searchTerm) {
      // When searching, search across all categories
      const allThemes = Object.values(themeCategories).flatMap(category => category.themes);
      themes = allThemes.filter(theme => 
        theme.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return themes;
  };

  // Add custom theme
  const handleAddCustomTheme = () => {
    if (customThemeName.trim() && !details.themes.includes(customThemeName.trim())) {
      setDetails(prev => ({
        ...prev,
        themes: [...prev.themes, customThemeName.trim()]
      }));
      setCustomThemeName('');
      setIsAddingCustom(false);
    }
  };

  // Remove theme
  const handleRemoveTheme = (themeToRemove) => {
    setDetails(prev => ({
      ...prev,
      themes: prev.themes.filter(theme => theme !== themeToRemove)
    }));
  };

  // Toggle theme selection
  const handleThemeToggle = (theme) => {
    const isSelected = details.themes.includes(theme);
    if (isSelected) {
      handleRemoveTheme(theme);
    } else {
      setDetails(prev => ({
        ...prev,
        themes: [...prev.themes, theme]
      }));
    }
  };

  // Quick add popular themes
  const popularThemes = [
    'Princess', 'Superhero', 'Pirate', 'Dinosaur', 'Magic', 'Unicorn', 
    'Space', 'Animal Safari', 'Frozen', 'Christmas'
  ];

  const handleQuickAdd = (themes) => {
    const newThemes = themes.filter(theme => !details.themes.includes(theme));
    if (newThemes.length > 0) {
      setDetails(prev => ({
        ...prev,
        themes: [...prev.themes, ...newThemes]
      }));
    }
  };

  return (
    <Card className="">
      <CardHeader className="py-8 bg-gradient-to-r from-pink-50 to-pink-100">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          Party Themes You Offer
        </CardTitle>
        <CardDescription className="text-base">
          Select all the party themes you can accommodate - this is crucial for customers finding you!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {/* Quick Actions */}
        {/* <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleQuickAdd(popularThemes)}
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 hover:from-pink-600 hover:to-purple-600"
            >
              <Star className="mr-2 h-4 w-4" />
              Add Top 10 Popular
            </Button>
            <Button
              onClick={() => handleQuickAdd(themeCategories.characters.themes)}
              size="sm"
              variant="outline"
              className="bg-blue-500 text-white border-0 hover:bg-blue-600"
            >
              🦸 Add All Characters
            </Button>
            <Button
              onClick={() => handleQuickAdd(themeCategories.seasonal.themes)}
              size="sm"
              variant="outline"
              className="bg-green-500 text-white border-0 hover:bg-green-600"
            >
              🎄 Add All Seasonal
            </Button>
          </div>
          
          <p className="text-sm text-gray-600">
            💡 <strong>Pro tip:</strong> The more themes you offer, the more likely customers are to find and book you!
          </p>
        </div> */}

        {/* Selected Themes Summary */}
        <div className="bg-pink-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-pink-500" />
              Your Selected Themes ({details.themes.length})
            </h4>
            {details.themes.length > 0 && (
              <Button
                onClick={() => setDetails(prev => ({ ...prev, themes: [] }))}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          
          {details.themes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No themes selected yet. Choose from the options below or add your own!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {details.themes.map((theme, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-pink-200 shadow-sm"
                >
                  <span className="text-sm font-medium text-gray-700">{theme}</span>
                  <button
                    onClick={() => handleRemoveTheme(theme)}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search themes (e.g., princess, dinosaur, magic...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-48 h-12 bg-white border-2 border-gray-200 rounded-xl">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(themeCategories).map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  {category.emoji} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme Categories and Selection */}
        <div className="space-y-6">
          {/* Show selected category or first category by default */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-lg">
                  {selectedCategory === 'all' 
                    ? themeCategories.characters.emoji 
                    : themeCategories[selectedCategory]?.emoji
                  }
                </span>
                {selectedCategory === 'all' 
                  ? themeCategories.characters.label 
                  : themeCategories[selectedCategory]?.label
                }
              </h5>
              <Button
                onClick={() => {
                  const categoryToAdd = selectedCategory === 'all' ? 'characters' : selectedCategory;
                  handleQuickAdd(themeCategories[categoryToAdd].themes);
                }}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Add All ({selectedCategory === 'all' 
                  ? themeCategories.characters.themes.length 
                  : themeCategories[selectedCategory]?.themes.length
                })
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {getFilteredThemes().map(theme => (
                <div
                  key={theme}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    details.themes.includes(theme)
                      ? 'border-pink-300 bg-pink-100 text-pink-800'
                      : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50'
                  }`}
                  onClick={() => handleThemeToggle(theme)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{theme}</span>
                    {details.themes.includes(theme) && (
                      <span className="text-pink-600">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Theme Input */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-gray-900">Add Custom Theme</h5>
            {!isAddingCustom && (
              <Button
                onClick={() => setIsAddingCustom(true)}
                size="sm"
                className="bg-pink-500 hover:bg-pink-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Custom
              </Button>
            )}
          </div>
          
          {isAddingCustom && (
            <div className="flex gap-3">
              <Input
                placeholder="Enter custom theme name (e.g., My Little Pony, Pokemon, etc.)"
                value={customThemeName}
                onChange={(e) => setCustomThemeName(e.target.value)}
                className="flex-1 h-12 bg-white border-2 border-gray-200 rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTheme()}
              />
              <Button
                onClick={handleAddCustomTheme}
                disabled={!customThemeName.trim()}
                className="bg-green-500 hover:bg-green-600"
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  setIsAddingCustom(false);
                  setCustomThemeName('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            Don't see a theme you offer? Add it here and it will appear in your selected themes above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedThemesSection;