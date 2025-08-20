"use client"

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Users,
  Clock,
  MapPin,
  Truck,
  PlusCircle,
  Edit3,
  Trash2,
  Gift,
  User,
  Star,
  X,
  Settings,
  Info,
  Loader2,
  Target,
  Shield,
  Home,
  CloudRain,
  Ruler,
  Award,
  DollarSign,
  AlertTriangle,
  Wind
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BouncyCastleServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness }) => {
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState({
    businessType: '',
    castleTypes: [],
    themes: [],
    ageGroups: [],
    capacities: [],
    deliveryAreas: [],
    setupRequirements: {
      spaceWidth: 20,
      spaceLength: 20,
      spaceHeight: 15,
      levelGround: true,
      nearPower: true,
      accessWidth: 3,
      surfaceTypes: []
    },
    safetyFeatures: [],
    weatherPolicies: {
      windLimit: 25,
      rainPolicy: 'cancel',
      temperatureMin: 5,
      temperatureMax: 35,
      indoorAvailable: false
    },
    pricing: {
      model: 'daily_hire', // daily_hire, hourly, packages
      dailyRates: {
        small: 80,
        medium: 120,
        large: 180,
        extra_large: 250
      },
      deliveryFee: 25,
      setupFee: 0,
      collectionFee: 0,
      weekendSurcharge: 30,
      holidaySurcharge: 50,
      multiDayDiscount: 10
    },
    serviceDetails: {
      deliveryIncluded: true,
      setupIncluded: true,
      collectionIncluded: true,
      cleaningIncluded: true,
      supervisionProvided: false,
      insuranceIncluded: true
    },
    equipment: {
      blowers: 'commercial_grade',
      stakes: 'heavy_duty',
      covers: true,
      extension_leads: true,
      safety_mats: true,
      first_aid: false
    },
    businessInfo: {
      yearsExperience: '',
      certifications: [],
      insurance: '',
      testingFrequency: '',
      story: '',
      whyChooseUs: ''
    },
    availability: {
      daysOfWeek: [],
      seasonalOperation: true,
      advanceBooking: 7,
      lastMinuteBookings: false
    },
    inventory: [],
    addOnServices: [],
    policies: {
      cancellationHours: 24,
      weatherCancellation: 'full_refund',
      damagePolicy: 'security_deposit',
      securityDeposit: 50,
      paymentTerms: '50% deposit'
    },
    ...serviceDetails
  });

  // ✅ Update form when business data changes from parent
  useEffect(() => {
    if (supplierData) {
      console.log('🔄 BouncyCastleServiceDetails updating with business data:', supplierData.name);
      
      const businessServiceDetails = supplierData.serviceDetails || {};
      
      setDetails({
        businessType: '',
        castleTypes: [],
        themes: [],
        ageGroups: [],
        capacities: [],
        deliveryAreas: [],
        setupRequirements: {
          spaceWidth: 20,
          spaceLength: 20,
          spaceHeight: 15,
          levelGround: true,
          nearPower: true,
          accessWidth: 3,
          surfaceTypes: []
        },
        safetyFeatures: [],
        weatherPolicies: {
          windLimit: 25,
          rainPolicy: 'cancel',
          temperatureMin: 5,
          temperatureMax: 35,
          indoorAvailable: false
        },
        pricing: {
          model: 'daily_hire',
          dailyRates: {
            small: 80,
            medium: 120,
            large: 180,
            extra_large: 250
          },
          deliveryFee: 25,
          setupFee: 0,
          collectionFee: 0,
          weekendSurcharge: 30,
          holidaySurcharge: 50,
          multiDayDiscount: 10
        },
        serviceDetails: {
          deliveryIncluded: true,
          setupIncluded: true,
          collectionIncluded: true,
          cleaningIncluded: true,
          supervisionProvided: false,
          insuranceIncluded: true
        },
        equipment: {
          blowers: 'commercial_grade',
          stakes: 'heavy_duty',
          covers: true,
          extension_leads: true,
          safety_mats: true,
          first_aid: false
        },
        businessInfo: {
          yearsExperience: '',
          certifications: [],
          insurance: '',
          testingFrequency: '',
          story: '',
          whyChooseUs: ''
        },
        availability: {
          daysOfWeek: [],
          seasonalOperation: true,
          advanceBooking: 7,
          lastMinuteBookings: false
        },
        inventory: [],
        addOnServices: [],
        policies: {
          cancellationHours: 24,
          weatherCancellation: 'full_refund',
          damagePolicy: 'security_deposit',
          securityDeposit: 50,
          paymentTerms: '50% deposit'
        },
        // Override with actual business data
        ...businessServiceDetails,
        // Ensure nested objects are properly merged
        setupRequirements: {
          spaceWidth: 20,
          spaceLength: 20,
          spaceHeight: 15,
          levelGround: true,
          nearPower: true,
          accessWidth: 3,
          surfaceTypes: [],
          ...businessServiceDetails.setupRequirements
        },
        weatherPolicies: {
          windLimit: 25,
          rainPolicy: 'cancel',
          temperatureMin: 5,
          temperatureMax: 35,
          indoorAvailable: false,
          ...businessServiceDetails.weatherPolicies
        },
        pricing: {
          model: 'daily_hire',
          dailyRates: {
            small: 80,
            medium: 120,
            large: 180,
            extra_large: 250
          },
          deliveryFee: 25,
          setupFee: 0,
          collectionFee: 0,
          weekendSurcharge: 30,
          holidaySurcharge: 50,
          multiDayDiscount: 10,
          ...businessServiceDetails.pricing
        },
        serviceDetails: {
          deliveryIncluded: true,
          setupIncluded: true,
          collectionIncluded: true,
          cleaningIncluded: true,
          supervisionProvided: false,
          insuranceIncluded: true,
          ...businessServiceDetails.serviceDetails
        },
        equipment: {
          blowers: 'commercial_grade',
          stakes: 'heavy_duty',
          covers: true,
          extension_leads: true,
          safety_mats: true,
          first_aid: false,
          ...businessServiceDetails.equipment
        },
        businessInfo: {
          yearsExperience: '',
          certifications: [],
          insurance: '',
          testingFrequency: '',
          story: '',
          whyChooseUs: '',
          ...businessServiceDetails.businessInfo
        },
        availability: {
          daysOfWeek: [],
          seasonalOperation: true,
          advanceBooking: 7,
          lastMinuteBookings: false,
          ...businessServiceDetails.availability
        },
        policies: {
          cancellationHours: 24,
          weatherCancellation: 'full_refund',
          damagePolicy: 'security_deposit',
          securityDeposit: 50,
          paymentTerms: '50% deposit',
          ...businessServiceDetails.policies
        }
      });
    }
  }, [supplierData?.name, supplierData?.serviceDetails]);

  // Data options
  const businessTypes = [
    'Bouncy Castle Hire',
    'Inflatable Hire', 
    'Party Equipment Rental',
    'Soft Play Hire',
    'Activity Equipment Rental',
    'Event Entertainment Hire'
  ];

  const castleTypeOptions = [
    'Standard Bouncy Castles',
    'Themed Bouncy Castles',
    'Combo Units (Slide + Castle)',
    'Obstacle Courses',
    'Inflatable Slides',
    'Ball Pits',
    'Soft Play Sets',
    'Adult Bouncy Castles',
    'Assault Courses',
    'Gladiator Duels',
    'Inflatable Games',
    'Water Slides (Summer)'
  ];

  const themeOptions = [
    'Princess & Fairy',
    'Superhero',
    'Pirate',
    'Jungle Safari',
    'Dinosaur',
    'Football',
    'Unicorn',
    'Space & Astronaut',
    'Under the Sea',
    'Circus',
    'Medieval Castle',
    'Racing Cars',
    'Rainbow & Clouds',
    'Farm Animals',
    'Neutral/Multi-coloured'
  ];

  const ageGroupOptions = [
    '2-4 years (Toddlers)',
    '5-8 years (Young Children)',
    '9-12 years (Children)',
    '13+ years (Teens & Adults)',
    'Mixed ages (Family friendly)',
    'Adults only'
  ];

  const capacityOptions = [
    '1-6 children (Small)',
    '6-10 children (Medium)',
    '10-15 children (Large)',
    '15-20 children (Extra Large)',
    '20+ children (Commercial size)'
  ];

  const safetyFeatureOptions = [
    'Safety Mats Around Base',
    'Reinforced Anchor Points',
    'Emergency Exit Panels',
    'Safety Netting',
    'Non-slip Surfaces',
    'Rounded Corners',
    'Height Barriers',
    'Weather Covers',
    'PIPA Tested Equipment',
    'Annual Safety Inspections'
  ];

  const surfaceTypeOptions = [
    'Grass',
    'Concrete/Tarmac',
    'Indoor Flooring',
    'Artificial Grass',
    'Decking',
    'Sand',
    'Gravel (with protection)'
  ];

  const certificationOptions = [
    'PIPA Membership',
    'RPII Certification',
    'ADIPS Membership',
    'Public Liability Insurance',
    'PAT Testing Certificates',
    'First Aid Qualified',
    'Health & Safety Training',
    'Risk Assessment Certified'
  ];

  // Add-ons management state
  const [isAddingAddon, setIsAddingAddon] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonForm, setAddonForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'equipment'
  });

  const addonCategories = [
    { value: 'equipment', label: 'Additional Equipment', emoji: '🎪', description: 'Extra inflatables or equipment' },
    { value: 'service', label: 'Service Upgrade', emoji: '⭐', description: 'Premium services or supervision' },
    { value: 'safety', label: 'Safety & Protection', emoji: '🛡️', description: 'Additional safety equipment' },
    { value: 'weather', label: 'Weather Protection', emoji: '☂️', description: 'Covers, heaters, or weather solutions' },
    { value: 'power', label: 'Power & Setup', emoji: '⚡', description: 'Generators, extension leads, setup help' }
  ];

  const addonTemplates = [
    { name: 'Generator Hire', price: 40, description: 'Portable generator for events without power supply', category: 'power' },
    { name: 'Extra Safety Mats', price: 15, description: 'Additional safety matting around equipment', category: 'safety' },
    { name: 'Professional Supervision', price: 60, description: 'Qualified staff member to supervise play', category: 'service' },
    { name: 'Weather Cover', price: 25, description: 'Protective cover for rain or strong sun', category: 'weather' },
    { name: 'Second Bouncy Castle', price: 100, description: 'Additional castle for larger groups', category: 'equipment' },
    { name: 'Ball Pool Balls (500)', price: 20, description: 'Extra colourful balls for ball pits', category: 'equipment' },
    { name: 'Extension Lead Package', price: 10, description: 'Extra heavy-duty extension leads', category: 'power' },
    { name: 'Premium Setup Service', price: 35, description: 'Express setup and collection service', category: 'service' }
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
      category: 'equipment'
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
            <strong>Editing:</strong> {currentBusiness.name} • Bouncy Castle Hire
          </AlertDescription>
        </Alert>
      )}
 {/* About Us Section */}
 <Card className="">
        <CardHeader className="py-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            About Us
          </CardTitle>
          <CardDescription className="text-base">
            Tell customers about your business and what makes you special (max 60 words)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="aboutUs" className="text-base font-semibold text-gray-700">
              Your Business Story *
            </Label>
            <div className="relative">
              <Textarea
                id="aboutUs"
                value={details.aboutUs || ''}
                onChange={(e) => {
                  const text = e.target.value;
                  const words = text.trim() === '' ? [] : text.trim().split(/\s+/).filter(word => word.length > 0);
                  if (words.length <= 60) {
                    handleFieldChange('aboutUs', e.target.value);
                  }
                }}
                placeholder="Tell customers about your business, your passion for entertainment, what makes you unique, and why families love choosing you for their special occasions..."
                rows={6}
                className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {(() => {
    const text = details.aboutUs || '';
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  })()}/60 words
              </div>
            </div>
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Share your story, highlight what makes you different, and mention any awards or recognition. Keep it friendly and engaging - no more than 2 paragraphs.
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Business Type & Equipment Types */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Business Type & Equipment
          </CardTitle>
          <CardDescription className="text-base">
            Tell customers what type of inflatable equipment you hire out
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="businessType" className="text-base font-semibold text-gray-700">
              What type of hire business are you? *
            </Label>
            <Select value={details.businessType} onValueChange={(value) => handleFieldChange('businessType', value)}>
              <SelectTrigger className="py-5 w-full bg-white border-2 border-gray-200 rounded-xl text-base">
                <SelectValue placeholder="Choose your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map(type => (
                  <SelectItem key={type} value={type} className="text-base py-3">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Types of Equipment You Hire</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {castleTypeOptions.map(type => (
                <div key={type} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                  <Checkbox
                    id={`castle-type-${type}`}
                    checked={details.castleTypes.includes(type)}
                    onCheckedChange={() => handleArrayToggle(details.castleTypes, type, 'castleTypes')}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`castle-type-${type}`} className="text-base font-medium cursor-pointer flex-1">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Themes & Age Groups */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Themes & Age Groups
          </CardTitle>
          <CardDescription className="text-base">
            What themes and age groups do your inflatables cater for?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Available Themes</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {themeOptions.map(theme => (
                <div key={theme} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <Checkbox
                    id={`theme-${theme}`}
                    checked={details.themes.includes(theme)}
                    onCheckedChange={() => handleArrayToggle(details.themes, theme, 'themes')}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`theme-${theme}`} className="text-base font-medium cursor-pointer flex-1">
                    {theme}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Age Groups</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Capacity Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capacityOptions.map(capacity => (
                <div key={capacity} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <Checkbox
                    id={`capacity-${capacity}`}
                    checked={details.capacities.includes(capacity)}
                    onCheckedChange={() => handleArrayToggle(details.capacities, capacity, 'capacities')}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`capacity-${capacity}`} className="text-base font-medium cursor-pointer flex-1">
                    {capacity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Requirements & Space */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            Setup Requirements & Space Needs
          </CardTitle>
          <CardDescription className="text-base">
            Help customers understand space and setup requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Typical Width Required (ft)
              </Label>
              <Input
                type="number"
                min="10"
                max="50"
                value={details.setupRequirements?.spaceWidth || ''}
                onChange={(e) => handleNestedFieldChange('setupRequirements', 'spaceWidth', parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="20"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Typical Length Required (ft)
              </Label>
              <Input
                type="number"
                min="10"
                max="50"
                value={details.setupRequirements?.spaceLength || ''}
                onChange={(e) => handleNestedFieldChange('setupRequirements', 'spaceLength', parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="20"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Height Clearance (ft)
              </Label>
              <Input
                type="number"
                min="8"
                max="25"
                value={details.setupRequirements?.spaceHeight || ''}
                onChange={(e) => handleNestedFieldChange('setupRequirements', 'spaceHeight', parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Access Width Required (ft)
              </Label>
              <Input
                type="number"
                min="2"
                max="10"
                value={details.setupRequirements?.accessWidth || ''}
                onChange={(e) => handleNestedFieldChange('setupRequirements', 'accessWidth', parseInt(e.target.value))}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="3"
              />
              <p className="text-sm text-gray-600">Minimum width needed to carry equipment through gates/doors</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-4">Setup Requirements</h4>
              <div className="space-y-3">
                {[
                  { key: 'levelGround', label: 'Level ground required' },
                  { key: 'nearPower', label: 'Power supply within 50m required' }
                ].map(item => (
                  <div key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Checkbox
                      id={`requirement-${item.key}`}
                      checked={details.setupRequirements?.[item.key] || false}
                      onCheckedChange={(checked) => handleNestedFieldChange('setupRequirements', item.key, checked)}
                      className="w-5 h-5"
                    />
                    <Label htmlFor={`requirement-${item.key}`} className="text-base font-medium cursor-pointer flex-1">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Suitable Surface Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {surfaceTypeOptions.map(surface => (
                <div key={surface} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                  <Checkbox
                    id={`surface-${surface}`}
                    checked={details.setupRequirements?.surfaceTypes?.includes(surface) || false}
                    onCheckedChange={(checked) => {
                      const currentSurfaces = details.setupRequirements?.surfaceTypes || [];
                      const newSurfaces = checked 
                        ? [...currentSurfaces, surface]
                        : currentSurfaces.filter(s => s !== surface);
                      handleNestedFieldChange('setupRequirements', 'surfaceTypes', newSurfaces);
                    }}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`surface-${surface}`} className="text-base font-medium cursor-pointer flex-1">
                    {surface}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Features */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-red-50 to-red-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Safety Features & Standards
          </CardTitle>
          <CardDescription className="text-base">
            Highlight your safety standards and features to build trust with parents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyFeatureOptions.map(feature => (
              <div key={feature} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <Checkbox
                  id={`safety-${feature}`}
                  checked={details.safetyFeatures.includes(feature)}
                  onCheckedChange={() => handleArrayToggle(details.safetyFeatures, feature, 'safetyFeatures')}
                  className="w-5 h-5"
                />
                <Label htmlFor={`safety-${feature}`} className="text-base font-medium cursor-pointer flex-1">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Policies */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-cyan-50 to-cyan-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            Weather Policies & Limits
          </CardTitle>
          <CardDescription className="text-base">
            Set clear expectations about weather conditions and safety limits
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Maximum Wind Speed (mph)
                </Label>
                <div className="relative">
                  <Wind className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    min="15"
                    max="40"
                    value={details.weatherPolicies?.windLimit || ''}
                    onChange={(e) => handleNestedFieldChange('weatherPolicies', 'windLimit', parseInt(e.target.value))}
                    className="h-12 pl-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                    placeholder="25"
                  />
                </div>
                <p className="text-sm text-gray-600">Above this wind speed, equipment cannot be used safely</p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Rain Policy
                </Label>
                <Select 
                  value={details.weatherPolicies?.rainPolicy || 'cancel'} 
                  onValueChange={(value) => handleNestedFieldChange('weatherPolicies', 'rainPolicy', value)}
                >
                  <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base">
                    <SelectValue placeholder="Choose rain policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancel">Cancel booking in rain</SelectItem>
                    <SelectItem value="cover">Provide weather cover</SelectItem>
                    <SelectItem value="indoor">Move to indoor alternative</SelectItem>
                    <SelectItem value="reschedule">Reschedule for free</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">
                    Min Temperature (°C)
                  </Label>
                  <Input
                    type="number"
                    min="-5"
                    max="15"
                    value={details.weatherPolicies?.temperatureMin || ''}
                    onChange={(e) => handleNestedFieldChange('weatherPolicies', 'temperatureMin', parseInt(e.target.value))}
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                    placeholder="5"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">
                    Max Temperature (°C)
                  </Label>
                  <Input
                    type="number"
                    min="25"
                    max="45"
                    value={details.weatherPolicies?.temperatureMax || ''}
                    onChange={(e) => handleNestedFieldChange('weatherPolicies', 'temperatureMax', parseInt(e.target.value))}
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                    placeholder="35"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-cyan-50 rounded-xl">
                <Checkbox
                  id="indoorAvailable"
                  checked={details.weatherPolicies?.indoorAvailable || false}
                  onCheckedChange={(checked) => handleNestedFieldChange('weatherPolicies', 'indoorAvailable', checked)}
                  className="w-5 h-5"
                />
                <Label htmlFor="indoorAvailable" className="text-base font-medium cursor-pointer flex-1">
                  Indoor equipment available for poor weather
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Structure */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Pricing Structure
          </CardTitle>
          <CardDescription className="text-base">
            Set your rates and pricing model
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Pricing Model
            </Label>
            <Select 
              value={details.pricing?.model || 'daily_hire'} 
              onValueChange={(value) => handleNestedFieldChange('pricing', 'model', value)}
            >
              <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base">
                <SelectValue placeholder="Choose your pricing model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily_hire">Daily Hire Rates</SelectItem>
                <SelectItem value="hourly">Hourly Rates</SelectItem>
                <SelectItem value="packages">Fixed Packages</SelectItem>
                <SelectItem value="custom">Custom Quotes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Daily Hire Rates by Size</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Small (£)
                </Label>
                <Input
                  type="number"
                  min="30"
                  value={details.pricing?.dailyRates?.small || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'dailyRates', {
                    ...details.pricing?.dailyRates,
                    small: parseInt(e.target.value)
                  })}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="80"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Medium (£)
                </Label>
                <Input
                  type="number"
                  min="50"
                  value={details.pricing?.dailyRates?.medium || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'dailyRates', {
                    ...details.pricing?.dailyRates,
                    medium: parseInt(e.target.value)
                  })}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="120"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Large (£)
                </Label>
                <Input
                  type="number"
                  min="100"
                  value={details.pricing?.dailyRates?.large || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'dailyRates', {
                    ...details.pricing?.dailyRates,
                    large: parseInt(e.target.value)
                  })}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="180"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Extra Large (£)
                </Label>
                <Input
                  type="number"
                  min="150"
                  value={details.pricing?.dailyRates?.extra_large || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'dailyRates', {
                    ...details.pricing?.dailyRates,
                    extra_large: parseInt(e.target.value)
                  })}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="250"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Additional Fees</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Delivery Fee (£)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={details.pricing?.deliveryFee || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'deliveryFee', parseInt(e.target.value))}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="25"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Weekend Surcharge (£)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={details.pricing?.weekendSurcharge || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'weekendSurcharge', parseInt(e.target.value))}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="30"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Security Deposit (£)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={details.policies?.securityDeposit || ''}
                  onChange={(e) => handleNestedFieldChange('policies', 'securityDeposit', parseInt(e.target.value))}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="50"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Details & What's Included */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            Service Details & What's Included
          </CardTitle>
          <CardDescription className="text-base">
            What services are included in your hire prices?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'deliveryIncluded', label: 'Delivery included in price' },
              { key: 'setupIncluded', label: 'Setup service included' },
              { key: 'collectionIncluded', label: 'Collection service included' },
              { key: 'cleaningIncluded', label: 'Cleaning after use included' },
              { key: 'supervisionProvided', label: 'Supervision/attendant provided' },
              { key: 'insuranceIncluded', label: 'Public liability insurance included' }
            ].map(item => (
              <div key={item.key} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                <Checkbox
                  id={`service-${item.key}`}
                  checked={details.serviceDetails?.[item.key] || false}
                  onCheckedChange={(checked) => handleNestedFieldChange('serviceDetails', item.key, checked)}
                  className="w-5 h-5"
                />
                <Label htmlFor={`service-${item.key}`} className="text-base font-medium cursor-pointer flex-1">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Information & Credentials */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            Business Information & Credentials
          </CardTitle>
          <CardDescription className="text-base">
            Build trust with customers by showcasing your experience and qualifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Years in bouncy castle business
              </Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={details.businessInfo?.yearsExperience || ''}
                onChange={(e) => handleNestedFieldChange('businessInfo', 'yearsExperience', e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="8"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Equipment Testing Frequency
              </Label>
              <Select 
                value={details.businessInfo?.testingFrequency || ''} 
                onValueChange={(value) => handleNestedFieldChange('businessInfo', 'testingFrequency', value)}
              >
                <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base">
                  <SelectValue placeholder="How often do you test equipment?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Inspections</SelectItem>
                  <SelectItem value="quarterly">Quarterly Inspections</SelectItem>
                  <SelectItem value="annually">Annual PIPA Testing</SelectItem>
                  <SelectItem value="before_each">Before Each Hire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Certifications & Memberships</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificationOptions.map(cert => (
                <div key={cert} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                  <Checkbox
                    id={`cert-${cert}`}
                    checked={details.businessInfo?.certifications?.includes(cert) || false}
                    onCheckedChange={(checked) => {
                      const currentCerts = details.businessInfo?.certifications || [];
                      const newCerts = checked 
                        ? [...currentCerts, cert]
                        : currentCerts.filter(c => c !== cert);
                      handleNestedFieldChange('businessInfo', 'certifications', newCerts);
                    }}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`cert-${cert}`} className="text-base font-medium cursor-pointer flex-1">
                    {cert}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Why should customers choose you?
            </Label>
            <Textarea
              value={details.businessInfo?.whyChooseUs || ''}
              onChange={(e) => handleNestedFieldChange('businessInfo', 'whyChooseUs', e.target.value)}
              placeholder="e.g., Family business with 10+ years experience, fully insured, always on time, equipment tested monthly..."
              rows={4}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Your business story
            </Label>
            <Textarea
              value={details.businessInfo?.story || ''}
              onChange={(e) => handleNestedFieldChange('businessInfo', 'story', e.target.value)}
              placeholder="Share your journey into the bouncy castle business, what drives you, and what makes your service special..."
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
            Create optional extras that customers can add to their bouncy castle hire
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Quick Templates */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              🌟 Quick Add Templates
            </h4>
            <p className="text-sm text-gray-600 mb-4">Popular bouncy castle add-ons you can add with one click</p>
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
                        : 'border-gray-200 bg-white hover:border-purple-400 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={alreadyExists ? undefined : () => handleAddTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900 text-sm">{template.name}</h5>
                      <div className="text-purple-500 font-bold text-sm">£{template.price}</div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full">
                        {categoryInfo?.emoji} {categoryInfo?.label}
                      </span>
                      {alreadyExists ? (
                        <span className="text-xs text-gray-500">✓ Added</span>
                      ) : (
                        <PlusCircle className="w-4 h-4 text-purple-600" />
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
                🎪 Your Add-on Services ({details.addOnServices.length})
              </h4>
              <Button 
                onClick={() => setIsAddingAddon(true)}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white"
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
                            <span className="font-bold text-purple-500">£{addon.price}</span>
                            {categoryInfo && (
                              <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full">
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
                    placeholder="e.g., Generator Hire"
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
                    placeholder="40"
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
                          ? 'border-purple-200 bg-purple-50'
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
              <Button onClick={handleAddAddon} className="flex-1 bg-purple-500 hover:bg-purple-600">
                {editingAddon ? 'Update Add-on' : 'Create Add-on'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BouncyCastleServiceDetails;