"use client"

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Users,
  Clock,
  MapPin,
  User,
  PlusCircle,
  Edit3,
  Trash2,
  Gift,
  Star,
  X,
  Settings,

  Info,
  Loader2,
  Zap,
  Target,
  Sparkles,
  Camera,
  Heart,
  Brush
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FacePaintingServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness }) => {
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState({
    artistType: '',
    experienceLevel: '',
    specialties: [],
    ageGroups: [],
    designStyles: [],
    paintBrands: [],
    travelRadius: 15,
    setupTime: 15,
    timePerFace: 5,
    groupSizeMin: 1,
    groupSizeMax: 20,
    pricing: {
      perFaceRate: 8,
      hourlyRate: 60,
      minimumBooking: 60,
      travelFee: 10,
      partyPackages: []
    },
    equipment: {
      ownSupplies: true,
      hygienic: true,
      allergySafe: true,
      waterBased: true,
      fdaApproved: true
    },
    artistBio: {
      yearsExperience: '',
      artisticBackground: '',
      favoriteDesigns: '',
      inspiration: '',
      personalStory: ''
    },
    availability: {
      daysOfWeek: [],
      timeSlots: [],
      advanceBooking: 14
    },
    addOnServices: [],
    portfolioTags: [],
    specialRequests: '',
    ...serviceDetails
  });

  // ✅ Update form when business data changes from parent
  useEffect(() => {
    if (supplierData) {
      console.log('🔄 FacePaintingServiceDetails updating with business data:', supplierData.name);
      
      const businessServiceDetails = supplierData.serviceDetails || {};
      
      setDetails({
        artistType: '',
        experienceLevel: '',
        specialties: [],
        ageGroups: [],
        designStyles: [],
        paintBrands: [],
        travelRadius: 15,
        setupTime: 15,
        timePerFace: 5,
        groupSizeMin: 1,
        groupSizeMax: 20,
        pricing: {
          perFaceRate: 8,
          hourlyRate: 60,
          minimumBooking: 60,
          travelFee: 10,
          partyPackages: []
        },
        equipment: {
          ownSupplies: true,
          hygienic: true,
          allergySafe: true,
          waterBased: true,
          fdaApproved: true
        },
        artistBio: {
          yearsExperience: '',
          artisticBackground: '',
          favoriteDesigns: '',
          inspiration: '',
          personalStory: ''
        },
        availability: {
          daysOfWeek: [],
          timeSlots: [],
          advanceBooking: 14
        },
        addOnServices: [],
        portfolioTags: [],
        specialRequests: '',
        // Override with actual business data
        ...businessServiceDetails,
        // Ensure nested objects are properly merged
        pricing: {
          perFaceRate: 8,
          hourlyRate: 60,
          minimumBooking: 60,
          travelFee: 10,
          partyPackages: [],
          ...businessServiceDetails.pricing
        },
        equipment: {
          ownSupplies: true,
          hygienic: true,
          allergySafe: true,
          waterBased: true,
          fdaApproved: true,
          ...businessServiceDetails.equipment
        },
        artistBio: {
          yearsExperience: '',
          artisticBackground: '',
          favoriteDesigns: '',
          inspiration: '',
          personalStory: '',
          ...businessServiceDetails.artistBio
        },
        availability: {
          daysOfWeek: [],
          timeSlots: [],
          advanceBooking: 14,
          ...businessServiceDetails.availability
        }
      });
    }
  }, [supplierData?.name, supplierData?.serviceDetails]);

  // Data options
  const artistTypes = [
    'Professional Face Painter',
    'Children\'s Party Artist', 
    'Body Painter',
    'Special Effects Artist',
    'Henna Artist',
    'Glitter Tattoo Artist',
    'Balloon Artist + Face Painter',
    'Multi-Skilled Entertainer'
  ];

  const experienceLevels = [
    'Beginner (Under 1 year)',
    'Developing (1-2 years)',
    'Experienced (3-5 years)', 
    'Professional (5-10 years)',
    'Expert (10+ years)'
  ];

  const specialtyOptions = [
    'Children\'s Parties',
    'Corporate Events',
    'Festivals & Fairs',
    'Sports Events',
    'School Events',
    'Charity Fundraisers',
    'Halloween/Special Effects',
    'Wedding Face Painting',
    'Adult Party Painting',
    'Team Building Events'
  ];

  const ageGroupOptions = [
    '2-4 years',
    '5-8 years', 
    '9-12 years',
    '13+ years',
    'Adults',
    'All ages'
  ];

  const designStyleOptions = [
    'Simple & Quick (1-3 mins)',
    'Detailed Designs (5-8 mins)',
    'Complex Art (10+ mins)',
    'Character Faces',
    'Animal Designs',
    'Princess/Fantasy',
    'Superhero Themes',
    'Sports Teams',
    'Scary/Halloween',
    'Floral & Nature',
    'Abstract Art',
    'Glitter Designs'
  ];

  const paintBrandOptions = [
    'Snazaroo',
    'Mehron Paradise',
    'TAG Body Art',
    'Wolfe FX',
    'Diamond FX',
    'Kryolan',
    'Ben Nye',
    'Global Colours',
    'Silly Farm',
    'Other Professional Brands'
  ];

  const timeSlotOptions = [
    'Morning (9am-12pm)',
    'Afternoon (12pm-5pm)',
    'Evening (5pm-8pm)',
    'Weekend Mornings',
    'Weekend Afternoons',
    'School Holidays',
    'Flexible Times'
  ];

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Add-ons management state
  const [isAddingAddon, setIsAddingAddon] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonForm, setAddonForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'enhancement'
  });

  const addonCategories = [
    { value: 'enhancement', label: 'Enhancement', emoji: '✨', description: 'Additional artistic services' },
    { value: 'supplies', label: 'Supplies', emoji: '🎨', description: 'Extra materials or products' },
    { value: 'time', label: 'Time Extension', emoji: '⏰', description: 'Extra time for your event' },
    { value: 'travel', label: 'Travel', emoji: '🚗', description: 'Travel and setup charges' },
    { value: 'premium', label: 'Premium Service', emoji: '🌟', description: 'Luxury or premium options' }
  ];

  const addonTemplates = [
    { name: 'Glitter Tattoos', price: 25, description: 'Sparkly temporary tattoos for all ages', category: 'enhancement' },
    { name: 'Extra Hour', price: 50, description: 'Additional hour of face painting', category: 'time' },
    { name: 'Travel Supplement', price: 15, description: 'Additional travel charges beyond standard radius', category: 'travel' },
    { name: 'Premium Designs', price: 40, description: 'Complex, detailed artwork (10+ minutes per face)', category: 'premium' },
    { name: 'Take-Home Stickers', price: 20, description: 'Fun sticker sheets for party guests', category: 'supplies' },
    { name: 'Weekend Premium', price: 30, description: 'Premium rate for weekend bookings', category: 'premium' },
    { name: 'Party Photos', price: 35, description: 'Professional photos of all painted faces', category: 'enhancement' },
    { name: 'Themed Costume', price: 45, description: 'Artist in themed costume (princess, superhero, etc)', category: 'enhancement' }
  ];

  // ✅ Fixed handlers that call onUpdate immediately
  const handleFieldChange = (field, value) => {
    const newDetails = { ...details, [field]: value };
    setDetails(newDetails);
    onUpdate(newDetails);
  };

  const handleNestedFieldChange = (parentField, childField, value) => {
    const newDetails = {
      ...details,
      [parentField]: {
        ...details[parentField],
        [childField]: value
      }
    };
    setDetails(newDetails);
    onUpdate(newDetails);
  };

  const handleArrayToggle = (array, item, field) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    
    const newDetails = { ...details, [field]: newArray };
    setDetails(newDetails);
    onUpdate(newDetails);
  };

  // Add-ons management functions
  const handleAddonFormChange = (field, value) => {
    setAddonForm(prev => ({ ...prev, [field]: value }));
  };

  const resetAddonForm = () => {
    setAddonForm({
      name: '',
      price: '',
      description: '',
      category: 'enhancement'
    });
    setIsAddingAddon(false);
    setEditingAddon(null);
  };

  const handleAddAddon = () => {
    if (!addonForm.name || !addonForm.price) {
      alert('Please enter both name and price for the add-on');
      return;
    }

    const newAddon = {
      id: editingAddon ? editingAddon.id : `addon-${Date.now()}`,
      name: addonForm.name,
      price: parseInt(addonForm.price),
      description: addonForm.description,
      category: addonForm.category
    };

    let newDetails;
    if (editingAddon) {
      newDetails = {
        ...details,
        addOnServices: details.addOnServices.map(addon => 
          addon.id === editingAddon.id ? newAddon : addon
        )
      };
    } else {
      newDetails = {
        ...details,
        addOnServices: [...details.addOnServices, newAddon]
      };
    }

    setDetails(newDetails);
    onUpdate(newDetails);
    resetAddonForm();
  };

  const handleEditAddon = (addon) => {
    setAddonForm({
      name: addon.name,
      price: addon.price.toString(),
      description: addon.description,
      category: addon.category
    });
    setEditingAddon(addon);
    setIsAddingAddon(true);
  };

  const handleDeleteAddon = (addonId) => {
    if (confirm('Are you sure you want to delete this add-on?')) {
      const newDetails = {
        ...details,
        addOnServices: details.addOnServices.filter(addon => addon.id !== addonId)
      };
      setDetails(newDetails);
      onUpdate(newDetails);
    }
  };

  const handleAddTemplate = (template) => {
    if (details.addOnServices.some(addon => addon.name === template.name)) {
      alert('This add-on already exists!');
      return;
    }

    const newAddon = {
      id: `addon-${Date.now()}`,
      ...template
    };
    
    const newDetails = {
      ...details,
      addOnServices: [...details.addOnServices, newAddon]
    };
    setDetails(newDetails);
    onUpdate(newDetails);
  };

  // ✅ Show loading state if no data yet
  if (!supplierData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading business data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ✅ Business Context Header */}
      {currentBusiness && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Editing:</strong> {currentBusiness.name} • Face Painting Artist
          </AlertDescription>
        </Alert>
      )}

      {/* Artist Type & Experience */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-pink-50 to-pink-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            Artist Type & Experience
          </CardTitle>
          <CardDescription className="text-base">
            Tell customers about your artistic background and expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="artistType" className="text-base font-semibold text-gray-700">
                What type of face painting artist are you? *
              </Label>
              <Select value={details.artistType} onValueChange={(value) => handleFieldChange('artistType', value)}>
                <SelectTrigger className="py-5 w-full bg-white border-2 border-gray-200 rounded-xl text-base">
                  <SelectValue placeholder="Choose your artist type" />
                </SelectTrigger>
                <SelectContent>
                  {artistTypes.map(type => (
                    <SelectItem key={type} value={type} className="text-base py-3">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="experienceLevel" className="text-base font-semibold text-gray-700">
                Experience Level *
              </Label>
              <Select value={details.experienceLevel} onValueChange={(value) => handleFieldChange('experienceLevel', value)}>
                <SelectTrigger className="py-5 w-full bg-white border-2 border-gray-200 rounded-xl text-base">
                  <SelectValue placeholder="Choose your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level} className="text-base py-3">{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Travel Radius (miles)
              </Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={details.travelRadius}
                  onChange={(e) => handleFieldChange('travelRadius', parseInt(e.target.value))}
                  className="h-12 pl-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="15"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Setup Time (minutes)
              </Label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  min="5"
                  max="60"
                  value={details.setupTime}
                  onChange={(e) => handleFieldChange('setupTime', parseInt(e.target.value))}
                  className="h-12 pl-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="15"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Time Per Face (minutes)
              </Label>
              <Input
                type="number"
                min="2"
                max="20"
                value={details.timePerFace}
                onChange={(e) => handleFieldChange('timePerFace', parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialties & Event Types */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Specialties & Event Types
          </CardTitle>
          <CardDescription className="text-base">
            What types of events and clients do you specialize in?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialtyOptions.map(specialty => (
              <div key={specialty} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                <Checkbox
                  id={`specialty-${specialty}`}
                  checked={details.specialties.includes(specialty)}
                  onCheckedChange={() => handleArrayToggle(details.specialties, specialty, 'specialties')}
                  className="w-5 h-5"
                />
                <Label htmlFor={`specialty-${specialty}`} className="text-base font-medium cursor-pointer flex-1">
                  {specialty}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age Groups */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Age Groups You Paint
          </CardTitle>
          <CardDescription className="text-base">
            Which age groups do you enjoy painting most?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ageGroupOptions.map(age => (
              <div key={age} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                <Checkbox
                  id={`age-${age}`}
                  checked={details.ageGroups.includes(age)}
                  onCheckedChange={() => handleArrayToggle(details.ageGroups, age, 'ageGroups')}
                  className="w-5 h-5"
                />
                <Label htmlFor={`age-${age}`} className="text-base font-medium cursor-pointer flex-1">
                  {age}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Design Styles */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Brush className="w-5 h-5 text-white" />
            </div>
            Design Styles & Complexity
          </CardTitle>
          <CardDescription className="text-base">
            What design styles and complexity levels do you offer?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {designStyleOptions.map(style => (
              <div key={style} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                <Checkbox
                  id={`style-${style}`}
                  checked={details.designStyles.includes(style)}
                  onCheckedChange={() => handleArrayToggle(details.designStyles, style, 'designStyles')}
                  className="w-5 h-5"
                />
                <Label htmlFor={`style-${style}`} className="text-base font-medium cursor-pointer flex-1">
                  {style}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Structure */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            Pricing Structure
          </CardTitle>
          <CardDescription className="text-base">
            Set your rates and minimum booking requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Per Face Rate (£)
              </Label>
              <Input
                type="number"
                min="1"
                step="0.50"
                value={details.pricing?.perFaceRate || ''}
                onChange={(e) => handleNestedFieldChange('pricing', 'perFaceRate', parseFloat(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="8.00"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Hourly Rate (£)
              </Label>
              <Input
                type="number"
                min="20"
                value={details.pricing?.hourlyRate || ''}
                onChange={(e) => handleNestedFieldChange('pricing', 'hourlyRate', parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="60"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Minimum Booking (mins)
              </Label>
              <Input
                type="number"
                min="30"
                step="15"
                value={details.pricing?.minimumBooking || ''}
                onChange={(e) => handleNestedFieldChange('pricing', 'minimumBooking', parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="60"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Travel Fee (£)
              </Label>
              <Input
                type="number"
                min="0"
                value={details.pricing?.travelFee || ''}
                onChange={(e) => handleNestedFieldChange('pricing', 'travelFee', parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Group Size Range
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  min="1"
                  value={details.groupSizeMin}
                  onChange={(e) => handleFieldChange('groupSizeMin', parseInt(e.target.value))}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="Min: 1"
                />
                <Input
                  type="number"
                  min="1"
                  value={details.groupSizeMax}
                  onChange={(e) => handleFieldChange('groupSizeMax', parseInt(e.target.value))}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="Max: 20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paint Brands & Equipment */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Paint Brands & Equipment
          </CardTitle>
          <CardDescription className="text-base">
            What paint brands and equipment do you use?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Paint Brands You Use</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {paintBrandOptions.map(brand => (
                <div key={brand} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={details.paintBrands.includes(brand)}
                    onCheckedChange={() => handleArrayToggle(details.paintBrands, brand, 'paintBrands')}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`brand-${brand}`} className="text-base font-medium cursor-pointer flex-1">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Safety & Quality Standards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'ownSupplies', label: 'I provide all my own supplies' },
                { key: 'hygienic', label: 'Hygienic practices (new sponges per child)' },
                { key: 'allergySafe', label: 'Allergy-safe paints only' },
                { key: 'waterBased', label: 'Water-based, non-toxic paints' },
                { key: 'fdaApproved', label: 'FDA approved cosmetic grade paints' }
              ].map(item => (
                <div key={item.key} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                  <Checkbox
                    id={`equipment-${item.key}`}
                    checked={details.equipment?.[item.key] || false}
                    onCheckedChange={(checked) => handleNestedFieldChange('equipment', item.key, checked)}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`equipment-${item.key}`} className="text-base font-medium cursor-pointer flex-1">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meet the Artist - Personal Bio */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-pink-50 to-pink-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Meet the Artist
          </CardTitle>
          <CardDescription className="text-base">
            Let customers get to know the creative person behind the paintbrush
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Years of face painting experience
              </Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={details.artistBio?.yearsExperience || ''}
                onChange={(e) => handleNestedFieldChange('artistBio', 'yearsExperience', e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="3"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Artistic background
              </Label>
              <Input
                value={details.artistBio?.artisticBackground || ''}
                onChange={(e) => handleNestedFieldChange('artistBio', 'artisticBackground', e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="e.g., Art school graduate, self-taught artist"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Your favorite designs to paint
            </Label>
            <Textarea
              value={details.artistBio?.favoriteDesigns || ''}
              onChange={(e) => handleNestedFieldChange('artistBio', 'favoriteDesigns', e.target.value)}
              placeholder="e.g., I love painting intricate butterflies, fierce tigers, and magical unicorns..."
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              What inspires your artwork?
            </Label>
            <Textarea
              value={details.artistBio?.inspiration || ''}
              onChange={(e) => handleNestedFieldChange('artistBio', 'inspiration', e.target.value)}
              placeholder="e.g., The joy and wonder in children's eyes when they see themselves transformed..."
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Your personal story & what makes you special
            </Label>
            <Textarea
              value={details.artistBio?.personalStory || ''}
              onChange={(e) => handleNestedFieldChange('artistBio', 'personalStory', e.target.value)}
              placeholder="Share your journey into face painting, what makes you unique as an artist, and why you love bringing joy to children..."
              rows={5}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add-on Services Management */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            Add-on Services Management
          </CardTitle>
          <CardDescription className="text-base">
            Create optional extras that customers can add to their face painting bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Quick Templates */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              🌟 Quick Add Templates
            </h4>
            <p className="text-sm text-gray-600 mb-4">Popular face painting add-ons you can add with one click</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addonTemplates.map((template, index) => {
                const categoryInfo = addonCategories.find(cat => cat.value === template.category);
                const alreadyExists = details.addOnServices.some(addon => addon.name === template.name);
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      alreadyExists 
                        ? 'border-gray-200 bg-gray-50 opacity-50' 
                        : 'border-gray-200 bg-white hover:border-pink-400 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={alreadyExists ? undefined : () => handleAddTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900 text-sm">{template.name}</h5>
                      <div className="text-pink-500 font-bold text-sm">£{template.price}</div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-pink-500 text-white rounded-full">
                        {categoryInfo?.emoji} {categoryInfo?.label}
                      </span>
                      {alreadyExists ? (
                        <span className="text-xs text-gray-500">✓ Added</span>
                      ) : (
                        <PlusCircle className="w-4 h-4 text-pink-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Add-ons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                🎁 Your Add-on Services ({details.addOnServices.length})
              </h4>
              <Button 
                onClick={() => setIsAddingAddon(true)}
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Custom
              </Button>
            </div>

            {details.addOnServices.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Gift className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <h5 className="text-base font-medium text-gray-900 mb-2">No add-ons yet</h5>
                <p className="text-gray-500 text-sm mb-4">Add some popular templates or create custom add-ons</p>
              </div>
            ) : (
              <div className="space-y-3">
                {details.addOnServices.map((addon, index) => {
                  const categoryInfo = addonCategories.find(cat => cat.value === addon.category);
                  
                  return (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-gray-900">{addon.name}</h5>
                            <span className="font-bold text-pink-500">£{addon.price}</span>
                            {categoryInfo && (
                              <span className="text-xs px-2 py-1 bg-pink-500 text-white rounded-full">
                                {categoryInfo.emoji} {categoryInfo.label}
                              </span>
                            )}
                          </div>
                          {addon.description && (
                            <p className="text-gray-600 text-sm">{addon.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAddon(addon)}
                            className="bg-transparent h-8 w-8 p-0"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddon(addon.id)}
                            className="text-red-600 hover:text-red-700 bg-transparent h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
   {/* Meet the Entertainer - Personal Bio */}
      <Card className="">
        <CardHeader className="py-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Meet the SnapSupplier
          </CardTitle>
          <CardDescription className="text-base">
            Let customers get to know the amazing person behind the performance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="yearsExperience" className="text-base font-semibold text-gray-700">
                Years of experience *
              </Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                max="50"
                value={details.personalBio?.yearsExperience || ''}
                onChange={(e) => handleNestedFieldChange('personalBio', 'yearsExperience', e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="e.g., 5"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="inspiration" className="text-base font-semibold text-gray-700">
                What inspires you? *
              </Label>
              <Input
                id="inspiration"
                value={details.personalBio?.inspiration || ''}
                onChange={(e) => handleNestedFieldChange('personalBio', 'inspiration', e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="e.g., Seeing children's faces light up with wonder"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="favoriteEvent" className="text-base font-semibold text-gray-700">
              Describe your favorite event you've performed at
            </Label>
            <Textarea
              id="favoriteEvent"
              value={details.personalBio?.favoriteEvent || ''}
              onChange={(e) => handleNestedFieldChange('personalBio', 'favoriteEvent', e.target.value)}
              placeholder="e.g., Corporate Event for Accenture at Chelsea FC - magic, business and football!"
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="dreamClient" className="text-base font-semibold text-gray-700">
              Dream celebrity client
            </Label>
            <Textarea
              id="dreamClient"
              value={details.personalBio?.dreamClient || ''}
              onChange={(e) => handleNestedFieldChange('personalBio', 'dreamClient', e.target.value)}
              placeholder="e.g., It would be fun to amaze the very cool Keanu Reeves and hear him say, 'Whoa!'"
              rows={2}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="personalStory" className="text-base font-semibold text-gray-700">
              Your personal story & what makes you special
            </Label>
            <Textarea
              id="personalStory"
              value={details.personalBio?.personalStory || ''}
              onChange={(e) => handleNestedFieldChange('personalBio', 'personalStory', e.target.value)}
              placeholder="Share your journey into entertainment, what makes you unique, and why you love what you do..."
              rows={5}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>
        </CardContent>
      </Card>
      {/* Add/Edit Add-on Modal */}
      {isAddingAddon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAddon ? 'Edit Add-on Service' : 'Create New Add-on Service'}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetAddonForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addonName" className="text-sm font-medium">
                    Service Name *
                  </Label>
                  <Input
                    id="addonName"
                    value={addonForm.name}
                    onChange={(e) => handleAddonFormChange('name', e.target.value)}
                    placeholder="e.g., Glitter Tattoos"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addonPrice" className="text-sm font-medium">
                    Price (£) *
                  </Label>
                  <Input
                    id="addonPrice"
                    type="number"
                    min="0"
                    value={addonForm.price}
                    onChange={(e) => handleAddonFormChange('price', e.target.value)}
                    placeholder="25"
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Category</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addonCategories.map((category) => (
                    <div
                      key={category.value}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        addonForm.category === category.value
                          ? 'border-pink-200 bg-pink-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => handleAddonFormChange('category', category.value)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{category.emoji}</span>
                        <span className="font-medium text-gray-900 text-sm">{category.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addonDescription" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="addonDescription"
                  value={addonForm.description}
                  onChange={(e) => handleAddonFormChange('description', e.target.value)}
                  placeholder="Describe what this add-on includes and why customers would want it..."
                  rows={3}
                  className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button variant="outline" onClick={resetAddonForm} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleAddAddon} className="flex-1 bg-pink-500 hover:bg-pink-600">
                {editingAddon ? 'Update Add-on' : 'Create Add-on'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacePaintingServiceDetails;