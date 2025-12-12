"use client"

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase"
import {
  Loader2,
  Plus,
  Trash2,
  PoundSterling,
  Users,
  Zap,
  X,
  Search,
  Layers,
  Ruler,
  Truck,
  Package
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSectionManager } from '../../hooks/useSectionManager';
import { SectionSave } from '@/components/ui/SectionSave';

const CAKE_FLAVOURS = [
  "Vanilla", "Chocolate", "Red Velvet", "Lemon", "Carrot",
  "Coffee", "Strawberry", "Funfetti", "Salted Caramel",
  "Cookies & Cream", "Banana", "Coconut", "Marble"
];

const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten Free" },
  { id: "dairy-free", label: "Dairy Free" },
  { id: "nut-free", label: "Nut Free" },
  { id: "egg-free", label: "Egg Free" },
  { id: "halal", label: "Halal" }
];

// Tier options for cake sizes
const TIER_OPTIONS = [
  { value: '1', label: '1 Tier' },
  { value: '2', label: '2 Tier' },
  { value: '3', label: '3 Tier' },
  { value: '4', label: '4 Tier' },
  { value: '5', label: '5+ Tiers' },
];

// Size options in inches
const SIZE_OPTIONS = [
  { value: '4', label: '4"' },
  { value: '6', label: '6"' },
  { value: '8', label: '8"' },
  { value: '10', label: '10"' },
  { value: '12', label: '12"' },
  { value: '14', label: '14"' },
  { value: '16', label: '16"' },
];

// Theme options matching the home page dropdown
const CAKE_THEMES = [
  // Popular themes
  { value: "no-theme", label: "No theme - Keep it simple!", category: "Popular" },
  { value: "princess", label: "Princess", category: "Popular" },
  { value: "superhero", label: "Superhero", category: "Popular" },
  { value: "spiderman", label: "Spiderman", category: "Popular" },
  { value: "unicorn", label: "Unicorn Magic", category: "Popular" },
  { value: "dinosaur", label: "Dinosaur", category: "Popular" },
  { value: "pirate", label: "Pirate Adventure", category: "Popular" },
  { value: "mermaid", label: "Mermaid", category: "Popular" },
  { value: "taylor-swift", label: "Taylor Swift", category: "Popular" },

  // Adventure themes
  { value: "jungle", label: "Jungle Safari", category: "Adventure" },
  { value: "space", label: "Space Adventure", category: "Adventure" },
  { value: "underwater", label: "Underwater World", category: "Adventure" },
  { value: "treasure-hunt", label: "Treasure Hunt", category: "Adventure" },
  { value: "explorer", label: "Explorer Adventure", category: "Adventure" },

  // Fantasy themes
  { value: "fairy", label: "Fairy Tale", category: "Fantasy" },
  { value: "wizard", label: "Wizard & Magic", category: "Fantasy" },
  { value: "dragon", label: "Dragons & Knights", category: "Fantasy" },
  { value: "enchanted-forest", label: "Enchanted Forest", category: "Fantasy" },

  // Sports & Activities
  { value: "football", label: "Football Party", category: "Sports" },
  { value: "dance", label: "Dance Party", category: "Sports" },
  { value: "gymnastics", label: "Gymnastics Fun", category: "Sports" },
  { value: "martial-arts", label: "Martial Arts", category: "Sports" },
  { value: "swimming", label: "Swimming Party", category: "Sports" },

  // Creative themes
  { value: "art-craft", label: "Art & Craft", category: "Creative" },
  { value: "cooking", label: "Cooking Party", category: "Creative" },
  { value: "science", label: "Science Lab", category: "Creative" },
  { value: "music", label: "Music & Karaoke", category: "Creative" },
  { value: "photography", label: "Photography Fun", category: "Creative" },

  // Seasonal themes
  { value: "halloween", label: "Halloween Spooky", category: "Seasonal" },
  { value: "christmas", label: "Christmas Magic", category: "Seasonal" },
  { value: "easter", label: "Easter Celebration", category: "Seasonal" },
  { value: "summer", label: "Summer Beach", category: "Seasonal" },
  { value: "winter", label: "Winter Wonderland", category: "Seasonal" },

  // Character themes
  { value: "paw-patrol", label: "Paw Patrol", category: "Characters" },
  { value: "frozen", label: "Frozen", category: "Characters" },
  { value: "peppa-pig", label: "Peppa Pig", category: "Characters" },
  { value: "minecraft", label: "Minecraft", category: "Characters" },
  { value: "pokemon", label: "Pokemon", category: "Characters" },
  { value: "disney", label: "Disney Magic", category: "Characters" },

  // Classic themes
  { value: "circus", label: "Circus Fun", category: "Classic" },
  { value: "carnival", label: "Carnival", category: "Classic" },
  { value: "tea-party", label: "Tea Party", category: "Classic" },
  { value: "garden-party", label: "Garden Party", category: "Classic" },
  { value: "movie-night", label: "Movie Night", category: "Classic" }
];

const PREDEFINED_THEME_VALUES = CAKE_THEMES.map(t => t.value);

// Group themes by category
const THEMES_BY_CATEGORY = CAKE_THEMES.reduce((acc, theme) => {
  if (!acc[theme.category]) {
    acc[theme.category] = [];
  }
  acc[theme.category].push(theme);
  return acc;
}, {});

const CATEGORY_ORDER = ["Popular", "Characters", "Adventure", "Fantasy", "Sports", "Creative", "Seasonal", "Classic"];

// Section mapping for sidebar navigation
const sectionMap = {
  'listingName': 'listingName',
  'photos': 'photos',
  'about': 'description',
  'flavours': 'flavours',
  'dietary': 'dietary',
  'themes': 'themes',
  'packages': 'packages',
};

const CakeServiceDetails = ({
  serviceDetails,
  onUpdate,
  saving,
  supplierData,
  currentBusiness,
  updateProfile,
  supplier,
  setSupplierData,
  selectedSection,
  onSectionChange
}) => {
  const { getSectionState, checkChanges, saveSection } = useSectionManager(
    supplierData,
    updateProfile,
    supplier
  );

  const [details, setDetails] = useState(() => {
    // Ensure arrays are always arrays, even if serviceDetails has undefined values
    const initialFlavours = Array.isArray(serviceDetails?.flavours) ? serviceDetails.flavours : [];
    const initialDietary = Array.isArray(serviceDetails?.dietaryInfo) ? serviceDetails.dietaryInfo : [];
    const initialThemes = Array.isArray(serviceDetails?.themes) ? serviceDetails.themes : [];
    const initialPackages = Array.isArray(serviceDetails?.packages) && serviceDetails.packages.length > 0
      ? serviceDetails.packages
      : [{ id: '1', name: '', price: '', serves: '', tiers: '', sizeInches: '', deliveryFee: '' }];

    return {
      productName: serviceDetails?.productName || '',
      description: serviceDetails?.description || '',
      flavours: initialFlavours,
      dietaryInfo: initialDietary,
      themes: initialThemes,
      packages: initialPackages,
    };
  });

  // Determine which section to render based on selectedSection
  const activeSection = sectionMap[selectedSection] || selectedSection;

  // Max characters for listing name
  const MAX_NAME_LENGTH = 50;

  // Listing Name state
  const [listingName, setListingName] = useState(
    supplierData?.data?.name || currentBusiness?.name || ''
  );
  const [listingNameSaving, setListingNameSaving] = useState(false);

  // Custom theme input state
  const [customThemeInput, setCustomThemeInput] = useState("");
  const [showCustomThemeInput, setShowCustomThemeInput] = useState(false);
  const [themeSearchQuery, setThemeSearchQuery] = useState("");

  // Sync listing name when business changes
  useEffect(() => {
    if (supplierData?.data?.name) {
      setListingName(supplierData.data.name);
    } else if (currentBusiness?.name) {
      setListingName(currentBusiness.name);
    }
  }, [supplierData?.data?.name, currentBusiness?.name]);

  // Handle listing name change
  const handleListingNameChange = (value) => {
    if (value.length <= MAX_NAME_LENGTH) {
      setListingName(value);
      checkChanges('listingName', value);
    }
  };

  // Save listing name
  const handleListingNameSave = async () => {
    if (!supplier?.id || !listingName.trim()) return;

    setListingNameSaving(true);
    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('suppliers')
        .select('data')
        .eq('id', supplier.id)
        .single();

      if (fetchError) throw fetchError;

      const updatedData = {
        ...(currentData?.data || {}),
        name: listingName.trim()
      };

      const { error } = await supabase
        .from('suppliers')
        .update({
          business_name: listingName.trim(),
          data: updatedData
        })
        .eq('id', supplier.id);

      if (error) throw error;

      if (setSupplierData) {
        setSupplierData(prev => ({
          ...prev,
          name: listingName.trim(),
          data: {
            ...prev.data,
            name: listingName.trim()
          }
        }));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('business-name-updated', { detail: { name: listingName.trim() } }));
      }

      checkChanges('listingName', listingName.trim());
    } catch (err) {
      console.error('Failed to save listing name:', err);
    } finally {
      setListingNameSaving(false);
    }
  };

  // Ref for contentEditable
  const listingNameRef = useRef(null);

  // Sync ref content
  useEffect(() => {
    if (listingNameRef.current) {
      if (listingNameRef.current.textContent !== listingName && !listingNameRef.current.dataset.initialized) {
        listingNameRef.current.textContent = listingName || '';
        listingNameRef.current.dataset.initialized = 'true';
      }
    }
  }, [listingName]);

  // Track the last supplier ID we initialized from
  const lastSupplierIdRef = useRef(null);

  // Update form when business data changes - only on initial load or business switch
  useEffect(() => {
    const currentId = supplierData?.id;

    // Only initialize if supplier exists and we haven't initialized for this supplier yet
    if (supplierData && currentId && currentId !== lastSupplierIdRef.current) {
      const businessServiceDetails = supplierData.serviceDetails || {};
      const businessData = supplierData;

      // Helper to ensure arrays stay as arrays
      const getArray = (primary, secondary, fallback) => {
        if (Array.isArray(primary) && primary.length > 0) return primary;
        if (Array.isArray(secondary) && secondary.length > 0) return secondary;
        return Array.isArray(fallback) ? fallback : [];
      };

      setDetails({
        productName: businessData.name || businessData.businessName || '',
        description: businessData.description || businessServiceDetails.description || '',
        flavours: getArray(businessData.flavours, businessServiceDetails.flavours, []),
        dietaryInfo: getArray(businessData.dietaryInfo, businessServiceDetails.dietaryInfo, []),
        themes: getArray(businessData.themes, businessServiceDetails.themes, []),
        packages: getArray(businessData.packages, businessServiceDetails.packages, [{ id: '1', name: '', price: '', serves: '', tiers: '', sizeInches: '', deliveryFee: '' }])
      });

      lastSupplierIdRef.current = currentId;
    }
  }, [supplierData?.id]);

  // Handlers
  const handleFieldChange = (field, value) => {
    const newDetails = { ...details, [field]: value };
    setDetails(newDetails);
    onUpdate(newDetails);
    checkChanges(field, value);
  };

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...details.packages];
    newPackages[index] = {
      ...newPackages[index],
      [field]: value
    };

    const newDetails = { ...details, packages: newPackages };
    setDetails(newDetails);
    onUpdate(newDetails);
    checkChanges('packages', newPackages);
  };

  const handleAddPackage = () => {
    const newPackages = [
      ...details.packages,
      { id: `${Date.now()}`, name: '', price: '', serves: '', tiers: '', sizeInches: '', deliveryFee: '' }
    ];
    const newDetails = { ...details, packages: newPackages };
    setDetails(newDetails);
    onUpdate(newDetails);
    checkChanges('packages', newPackages);
  };

  const handleRemovePackage = (index) => {
    if (details.packages.length <= 1) return;
    const newPackages = details.packages.filter((_, i) => i !== index);
    const newDetails = { ...details, packages: newPackages };
    setDetails(newDetails);
    onUpdate(newDetails);
    checkChanges('packages', newPackages);
  };

  const handleFlavourToggle = (flavour) => {
    const currentFlavours = Array.isArray(details.flavours) ? details.flavours : [];
    const newFlavours = currentFlavours.includes(flavour)
      ? currentFlavours.filter(f => f !== flavour)
      : [...currentFlavours, flavour];

    // Directly update state to ensure UI updates
    const newDetails = { ...details, flavours: newFlavours };
    setDetails(newDetails);
    if (onUpdate) onUpdate(newDetails);
    checkChanges('flavours', newFlavours);
  };

  const handleDietaryToggle = (dietaryId) => {
    const currentDietary = Array.isArray(details.dietaryInfo) ? details.dietaryInfo : [];
    const newDietary = currentDietary.includes(dietaryId)
      ? currentDietary.filter(d => d !== dietaryId)
      : [...currentDietary, dietaryId];

    // Directly update state to ensure UI updates
    const newDetails = { ...details, dietaryInfo: newDietary };
    setDetails(newDetails);
    if (onUpdate) onUpdate(newDetails);
    checkChanges('dietary', newDietary);
  };

  const handleThemeToggle = (themeValue) => {
    const currentThemes = Array.isArray(details.themes) ? details.themes : [];
    const newThemes = currentThemes.includes(themeValue)
      ? currentThemes.filter(t => t !== themeValue)
      : [...currentThemes, themeValue];

    // Directly update state to ensure UI updates
    const newDetails = { ...details, themes: newThemes };
    setDetails(newDetails);
    if (onUpdate) onUpdate(newDetails);
    checkChanges('themes', newThemes);
  };

  const handleAddCustomTheme = () => {
    const trimmed = customThemeInput.trim();
    const currentThemes = Array.isArray(details.themes) ? details.themes : [];
    if (trimmed && !currentThemes.includes(trimmed)) {
      const newThemes = [...currentThemes, trimmed];
      const newDetails = { ...details, themes: newThemes };
      setDetails(newDetails);
      if (onUpdate) onUpdate(newDetails);
      checkChanges('themes', newThemes);
      setCustomThemeInput("");
      setShowCustomThemeInput(false);
    }
  };

  const handleRemoveCustomTheme = (theme) => {
    const currentThemes = Array.isArray(details.themes) ? details.themes : [];
    const newThemes = currentThemes.filter(t => t !== theme);
    const newDetails = { ...details, themes: newThemes };
    setDetails(newDetails);
    if (onUpdate) onUpdate(newDetails);
    checkChanges('themes', newThemes);
  };

  // Show loading state
  if (!supplierData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading cake data...</p>
        </div>
      </div>
    );
  }

  // Section section states
  const descriptionState = getSectionState('description');
  const flavoursState = getSectionState('flavours');
  const dietaryState = getSectionState('dietary');
  const themesState = getSectionState('themes');
  const packagesState = getSectionState('packages');

  // Render Listing Name - Airbnb style
  const renderListingName = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <p className="text-gray-400 text-sm mb-6">
        <span className="font-semibold text-gray-600">{listingName.length}</span>/{MAX_NAME_LENGTH} available
      </p>

      <h1
        ref={(el) => {
          if (el && el.textContent !== listingName && !el.dataset.initialized) {
            el.textContent = listingName || '';
            el.dataset.initialized = 'true';
          }
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const text = e.currentTarget.textContent || '';
          if (text.length <= MAX_NAME_LENGTH) {
            setListingName(text);
            checkChanges('listingName', text);
          } else {
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);
            const cursorPos = range?.startOffset || 0;

            const truncated = text.slice(0, MAX_NAME_LENGTH);
            e.currentTarget.textContent = truncated;
            setListingName(truncated);

            if (e.currentTarget.firstChild) {
              const newRange = document.createRange();
              newRange.setStart(e.currentTarget.firstChild, Math.min(cursorPos, truncated.length));
              newRange.collapse(true);
              selection?.removeAllRanges();
              selection?.addRange(newRange);
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        onBlur={(e) => {
          const text = e.currentTarget.textContent || '';
          if (text !== listingName) {
            setListingName(text.slice(0, MAX_NAME_LENGTH));
          }
        }}
        data-placeholder="Enter cake name"
        style={{
          fontSize: '72px',
          fontWeight: 500,
          textAlign: 'center',
          color: listingName ? '#111827' : '#d1d5db',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          width: '100%',
          maxWidth: '900px',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          minHeight: '90px',
          cursor: 'text'
        }}
      />

      <div className="mt-16 flex flex-col items-center gap-6">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center">
          <Zap className="w-7 h-7 text-amber-400" />
        </div>

        {listingName !== (supplierData?.data?.name || currentBusiness?.name || '') && listingName.trim() && (
          <Button
            onClick={handleListingNameSave}
            disabled={listingNameSaving}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl"
          >
            {listingNameSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save name
          </Button>
        )}
      </div>
    </div>
  );

  // Render Description - Airbnb style
  const renderDescription = () => {
    const text = details.description || '';
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const maxWords = 300;

    return (
      <div className="flex flex-col h-full">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">About this cake</h2>
          <p className="text-gray-500 mb-6">Tell customers what makes this cake special. This will appear in your listing.</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-500">
              <span className="font-semibold text-gray-900">{wordCount}</span>/{maxWords} words
            </span>
          </div>

          <textarea
            value={details.description || ''}
            onChange={(e) => {
              const newText = e.target.value;
              const words = newText.trim() === '' ? [] : newText.trim().split(/\s+/).filter(w => w.length > 0);
              if (words.length <= maxWords) {
                handleFieldChange('description', newText);
              }
            }}
            placeholder="Describe this cake - what it looks like, what makes it special, any customization options..."
            className="w-full min-h-[250px] p-4 text-xl text-gray-900 placeholder-gray-400 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none resize-none"
          />
        </div>

        <div className="hidden lg:block mt-auto pt-6">
          <SectionSave
            sectionName="About this cake"
            hasChanges={descriptionState.hasChanges}
            onSave={() => saveSection('description', details.description, { serviceDetails: { description: details.description } })}
            saving={descriptionState.saving}
            lastSaved={descriptionState.lastSaved}
            error={descriptionState.error}
            variant="airbnb"
          />
        </div>
      </div>
    );
  };

  // Render Flavours - Airbnb style
  const renderFlavours = () => {
    const flavours = Array.isArray(details.flavours) ? details.flavours : [];

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Available Flavours</h2>
          <p className="text-gray-500">Select all the flavours this cake is available in</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CAKE_FLAVOURS.map(flavour => {
            const isSelected = flavours.includes(flavour);
            return (
              <div
                key={flavour}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                }`}
                onClick={() => handleFlavourToggle(flavour)}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'bg-white border-white' : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{flavour}</span>
              </div>
            );
          })}
        </div>

        {flavours.length > 0 && (
          <p className="text-sm text-gray-500">
            {flavours.length} flavour{flavours.length !== 1 ? 's' : ''} selected
          </p>
        )}

        <div className="hidden lg:block pt-6">
          <SectionSave
            sectionName="Flavours"
            hasChanges={flavoursState.hasChanges}
            onSave={() => saveSection('flavours', flavours, { serviceDetails: { flavours } })}
            saving={flavoursState.saving}
            lastSaved={flavoursState.lastSaved}
            error={flavoursState.error}
            variant="airbnb"
          />
        </div>
      </div>
    );
  };

  // Render Dietary - Airbnb style
  const renderDietary = () => {
    const dietaryInfo = Array.isArray(details.dietaryInfo) ? details.dietaryInfo : [];

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dietary Information</h2>
          <p className="text-gray-500">Select any dietary requirements this cake meets</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {DIETARY_OPTIONS.map(option => {
            const isSelected = dietaryInfo.includes(option.id);
            return (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                }`}
                onClick={() => handleDietaryToggle(option.id)}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'bg-white border-white' : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </div>
            );
          })}
        </div>

        {dietaryInfo.length > 0 && (
          <p className="text-sm text-gray-500">
            {dietaryInfo.length} option{dietaryInfo.length !== 1 ? 's' : ''} selected
          </p>
        )}

        <div className="hidden lg:block pt-6">
          <SectionSave
            sectionName="Dietary info"
            hasChanges={dietaryState.hasChanges}
            onSave={() => saveSection('dietary', dietaryInfo, { serviceDetails: { dietaryInfo } })}
            saving={dietaryState.saving}
            lastSaved={dietaryState.lastSaved}
            error={dietaryState.error}
            variant="airbnb"
          />
        </div>
      </div>
    );
  };

  // Render Themes - Airbnb style with categories and search
  const renderThemes = () => {
    const themes = Array.isArray(details.themes) ? details.themes : [];
    const customThemes = themes.filter(t => !PREDEFINED_THEME_VALUES.includes(t));

    // Filter themes based on search query
    const filteredThemes = themeSearchQuery.trim()
      ? CAKE_THEMES.filter(theme =>
          theme.label.toLowerCase().includes(themeSearchQuery.toLowerCase()) ||
          theme.value.toLowerCase().includes(themeSearchQuery.toLowerCase()) ||
          theme.category.toLowerCase().includes(themeSearchQuery.toLowerCase())
        )
      : CAKE_THEMES;

    // Group filtered themes by category
    const filteredByCategory = filteredThemes.reduce((acc, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = [];
      }
      acc[theme.category].push(theme);
      return acc;
    }, {});

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Party Themes</h2>
          <p className="text-gray-500">Select themes this cake is great for</p>
        </div>

        {/* Search input */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={themeSearchQuery}
            onChange={(e) => setThemeSearchQuery(e.target.value)}
            placeholder="Search themes..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
          />
          {themeSearchQuery && (
            <button
              onClick={() => setThemeSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {themeSearchQuery ? (
            // Show flat list when searching
            filteredThemes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredThemes.map(theme => {
                  const isSelected = themes.includes(theme.value);
                  return (
                    <div
                      key={theme.value}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        isSelected
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                      }`}
                      onClick={() => handleThemeToggle(theme.value)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-white border-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{theme.label}</span>
                        <span className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>{theme.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No themes found matching "{themeSearchQuery}"</p>
            )
          ) : (
            // Show categorized list when not searching
            CATEGORY_ORDER.map(category => {
              const categoryThemes = filteredByCategory[category];
              if (!categoryThemes || categoryThemes.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categoryThemes.map(theme => {
                      const isSelected = themes.includes(theme.value);
                      return (
                        <div
                          key={theme.value}
                          className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                            isSelected
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                          }`}
                          onClick={() => handleThemeToggle(theme.value)}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-white border-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-sm">{theme.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Custom themes section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Custom
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Custom themes that have been added */}
              {customThemes.map(theme => (
                <div
                  key={theme}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border-2 border-gray-900 text-white"
                >
                  <div className="w-5 h-5 rounded border-2 bg-white border-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm flex-1">{theme}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCustomTheme(theme);
                    }}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add custom button or input */}
              {showCustomThemeInput ? (
                <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-gray-900 bg-white">
                  <input
                    type="text"
                    value={customThemeInput}
                    onChange={(e) => setCustomThemeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTheme();
                      } else if (e.key === 'Escape') {
                        setShowCustomThemeInput(false);
                        setCustomThemeInput("");
                      }
                    }}
                    placeholder="Enter theme..."
                    className="flex-1 text-gray-900 font-medium text-sm bg-transparent outline-none placeholder-gray-400"
                    autoFocus
                  />
                  <button
                    onClick={handleAddCustomTheme}
                    disabled={!customThemeInput.trim()}
                    className="p-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomThemeInput(false);
                      setCustomThemeInput("");
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setShowCustomThemeInput(true)}
                  className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium text-sm">Add other</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {themes.length > 0 && (
          <p className="text-sm text-gray-500">
            {themes.length} theme{themes.length !== 1 ? 's' : ''} selected
          </p>
        )}

        <div className="hidden lg:block pt-6">
          <SectionSave
            sectionName="Themes"
            hasChanges={themesState.hasChanges}
            onSave={() => saveSection('themes', themes, { serviceDetails: { themes }, themes })}
            saving={themesState.saving}
            lastSaved={themesState.lastSaved}
            error={themesState.error}
            variant="airbnb"
          />
        </div>
      </div>
    );
  };

  // Render Packages - Matching onboarding wizard style
  const renderPackages = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sizes & Pricing</h2>
        <p className="text-gray-500">Add different sizes or options for this cake</p>
      </div>

      <div className="space-y-4">
        {details.packages.map((pkg, index) => (
          <div
            key={pkg.id}
            className="p-6 border-2 border-gray-200 rounded-2xl bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
                <span className="font-medium text-gray-500">Size {index + 1}</span>
              </div>
              {details.packages.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePackage(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Size Name */}
              <div>
                <Label className="block text-sm font-medium text-gray-900 mb-2">
                  Name this size
                </Label>
                <Input
                  value={pkg.name || ''}
                  onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                  placeholder="e.g., Small, Medium, Large..."
                  className="h-12 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                />
              </div>

              {/* Tiers and Size Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Tiers Dropdown */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-2">
                    Tiers
                  </Label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={pkg.tiers || ''}
                      onChange={(e) => handlePackageChange(index, 'tiers', e.target.value)}
                      className="w-full h-12 pl-10 pr-10 border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Select tiers</option>
                      {TIER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Size in Inches Dropdown */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-2">
                    Size (inches)
                  </Label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={pkg.sizeInches || ''}
                      onChange={(e) => handlePackageChange(index, 'sizeInches', e.target.value)}
                      className="w-full h-12 pl-10 pr-10 border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Select size</option>
                      {SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price, Feeds, Delivery Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Price */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-2">
                    Price
                  </Label>
                  <div className="relative">
                    <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pkg.price || ''}
                      onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                      placeholder="45.00"
                      className="h-12 pl-10 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Feeds */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-2">
                    Feeds
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={pkg.serves || ''}
                      onChange={(e) => handlePackageChange(index, 'serves', e.target.value)}
                      placeholder="10-15"
                      className="h-12 pl-10 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                    />
                  </div>
                </div>

                {/* Delivery Fee */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-2">
                    Delivery
                  </Label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={pkg.deliveryFee || ''}
                      onChange={(e) => handlePackageChange(index, 'deliveryFee', e.target.value)}
                      placeholder="5.00"
                      className="h-12 pl-10 bg-white border-2 border-gray-300 rounded-xl text-base focus:border-gray-900 focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddPackage}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add another size
        </button>
      </div>

      {/* Summary */}
      {details.packages.some(p => p.name?.trim() && parseFloat(p.price) > 0) && (
        <div className="p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-semibold text-gray-900 mb-3">Your sizes:</h4>
          <div className="space-y-3">
            {details.packages.filter(p => p.name?.trim() && parseFloat(p.price) > 0).map((pkg, i) => (
              <div key={i} className="flex items-center justify-between text-gray-600">
                <div>
                  <span className="font-medium text-gray-900">{pkg.name}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    {pkg.tiers && <span>{pkg.tiers} tier{pkg.tiers !== '1' ? 's' : ''}</span>}
                    {pkg.tiers && pkg.sizeInches && <span>•</span>}
                    {pkg.sizeInches && <span>{pkg.sizeInches}" diameter</span>}
                    {(pkg.tiers || pkg.sizeInches) && pkg.serves && <span>•</span>}
                    {pkg.serves && <span>Feeds {pkg.serves}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    £{parseFloat(pkg.price).toFixed(2)}
                  </span>
                  {parseFloat(pkg.deliveryFee) > 0 && (
                    <div className="text-gray-500 text-sm">+£{parseFloat(pkg.deliveryFee).toFixed(2)} delivery</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-sm text-amber-800">
          Set different delivery fees for each size based on weight/tiers. Larger cakes typically cost more to deliver. Leave empty for free delivery.
        </p>
      </div>

      <div className="hidden lg:block pt-6">
        <SectionSave
          sectionName="Sizes & pricing"
          hasChanges={packagesState.hasChanges}
          onSave={() => saveSection('packages', details.packages, { serviceDetails: { packages: details.packages } })}
          saving={packagesState.saving}
          lastSaved={packagesState.lastSaved}
          error={packagesState.error}
          variant="airbnb"
        />
      </div>
    </div>
  );

  // Render the appropriate section based on selectedSection
  const renderSection = () => {
    switch (activeSection) {
      case 'listingName':
        return renderListingName();
      case 'description':
        return renderDescription();
      case 'flavours':
        return renderFlavours();
      case 'dietary':
        return renderDietary();
      case 'themes':
        return renderThemes();
      case 'packages':
        return renderPackages();
      default:
        return renderListingName();
    }
  };

  return (
    <div className="max-w-3xl">
      {renderSection()}
    </div>
  );
};

export default CakeServiceDetails;
