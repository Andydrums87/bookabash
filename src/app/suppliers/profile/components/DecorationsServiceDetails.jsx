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
  Sparkles,
  Target,
  Heart,
  Camera,
  Brush,
  Award,
  DollarSign,
  Home,
  Scissors
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DecorationsServiceDetails = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness }) => {
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState({
    businessType: '',
    decorationTypes: [],
    designStyles: [],
    colorSchemes: [],
    themes: [],
    ageGroups: [],
    eventTypes: [],
    serviceAreas: [],
    designProcess: {
      consultation: true,
      designConcepts: true,
      revisions: 3,
      finalApproval: true
    },
    setupOptions: {
      selfSetup: false,
      deliverySetup: true,
      fullServiceSetup: true,
      breakdown: true,
      timeRequired: 2
    },
    materials: {
      balloons: [],
      fabrics: [],
      florals: [],
      props: [],
      lighting: []
    },
    pricing: {
      model: 'package_based', // package_based, hourly, per_item, custom
      packagePrices: {
        basic: 150,
        standard: 300,
        premium: 500,
        luxury: 800
      },
      hourlyRate: 75,
      travelFee: 20,
      setupFee: 50,
      consultationFee: 0,
      minSpend: 200
    },
    portfolio: {
      specialtyProjects: '',
      favoriteCreations: '',
      uniqueOfferings: '',
      clientTestimonials: ''
    },
    businessDetails: {
      yearsExperience: '',
      designBackground: '',
      inspiration: '',
      signature: '',
      awards: [],
      collaborations: '',
      story: ''
    },
    serviceCapabilities: {
      venueVisits: true,
      colorMatching: true,
      customDesigns: true,
      lastMinuteBookings: false,
      weekendAvailable: true,
      corporateEvents: true
    },
    leadTimes: {
      simple: 7,
      complex: 14,
      seasonal: 21,
      custom: 28
    },
    addOnServices: [],
    policies: {
      cancellation: 48,
      changeRequests: 'within_7_days',
      paymentTerms: '50% deposit',
      weatherPolicy: 'indoor_alternative',
      damagePolicy: 'replacement_cost'
    },
    ...serviceDetails
  });

  // ✅ Update form when business data changes from parent
  useEffect(() => {
    if (supplierData) {
      console.log('🔄 DecorationsServiceDetails updating with business data:', supplierData.name);
      
      const businessServiceDetails = supplierData.serviceDetails || {};
      
      setDetails({
        businessType: '',
        decorationTypes: [],
        designStyles: [],
        colorSchemes: [],
        themes: [],
        ageGroups: [],
        eventTypes: [],
        serviceAreas: [],
        designProcess: {
          consultation: true,
          designConcepts: true,
          revisions: 3,
          finalApproval: true
        },
        setupOptions: {
          selfSetup: false,
          deliverySetup: true,
          fullServiceSetup: true,
          breakdown: true,
          timeRequired: 2
        },
        materials: {
          balloons: [],
          fabrics: [],
          florals: [],
          props: [],
          lighting: []
        },
        pricing: {
          model: 'package_based',
          packagePrices: {
            basic: 150,
            standard: 300,
            premium: 500,
            luxury: 800
          },
          hourlyRate: 75,
          travelFee: 20,
          setupFee: 50,
          consultationFee: 0,
          minSpend: 200
        },
        portfolio: {
          specialtyProjects: '',
          favoriteCreations: '',
          uniqueOfferings: '',
          clientTestimonials: ''
        },
        businessDetails: {
          yearsExperience: '',
          designBackground: '',
          inspiration: '',
          signature: '',
          awards: [],
          collaborations: '',
          story: ''
        },
        serviceCapabilities: {
          venueVisits: true,
          colorMatching: true,
          customDesigns: true,
          lastMinuteBookings: false,
          weekendAvailable: true,
          corporateEvents: true
        },
        leadTimes: {
          simple: 7,
          complex: 14,
          seasonal: 21,
          custom: 28
        },
        addOnServices: [],
        policies: {
          cancellation: 48,
          changeRequests: 'within_7_days',
          paymentTerms: '50% deposit',
          weatherPolicy: 'indoor_alternative',
          damagePolicy: 'replacement_cost'
        },
        // Override with actual business data
        ...businessServiceDetails,
        // Ensure nested objects are properly merged
        designProcess: {
          consultation: true,
          designConcepts: true,
          revisions: 3,
          finalApproval: true,
          ...businessServiceDetails.designProcess
        },
        setupOptions: {
          selfSetup: false,
          deliverySetup: true,
          fullServiceSetup: true,
          breakdown: true,
          timeRequired: 2,
          ...businessServiceDetails.setupOptions
        },
        materials: {
          balloons: [],
          fabrics: [],
          florals: [],
          props: [],
          lighting: [],
          ...businessServiceDetails.materials
        },
        pricing: {
          model: 'package_based',
          packagePrices: {
            basic: 150,
            standard: 300,
            premium: 500,
            luxury: 800
          },
          hourlyRate: 75,
          travelFee: 20,
          setupFee: 50,
          consultationFee: 0,
          minSpend: 200,
          ...businessServiceDetails.pricing
        },
        portfolio: {
          specialtyProjects: '',
          favoriteCreations: '',
          uniqueOfferings: '',
          clientTestimonials: '',
          ...businessServiceDetails.portfolio
        },
        businessDetails: {
          yearsExperience: '',
          designBackground: '',
          inspiration: '',
          signature: '',
          awards: [],
          collaborations: '',
          story: '',
          ...businessServiceDetails.businessDetails
        },
        serviceCapabilities: {
          venueVisits: true,
          colorMatching: true,
          customDesigns: true,
          lastMinuteBookings: false,
          weekendAvailable: true,
          corporateEvents: true,
          ...businessServiceDetails.serviceCapabilities
        },
        leadTimes: {
          simple: 7,
          complex: 14,
          seasonal: 21,
          custom: 28,
          ...businessServiceDetails.leadTimes
        },
        policies: {
          cancellation: 48,
          changeRequests: 'within_7_days',
          paymentTerms: '50% deposit',
          weatherPolicy: 'indoor_alternative',
          damagePolicy: 'replacement_cost',
          ...businessServiceDetails.policies
        }
      });
    }
  }, [supplierData?.name, supplierData?.serviceDetails]);

  // Data options
  const businessTypes = [
    'Balloon Arch Designer',
    'Party Decoration Specialist',
    'Event Styling Company',
    'Balloon Artist & Decorator',
    'Wedding Decoration Service',
    'Corporate Event Styling',
    'Children\'s Party Decorator',
    'Luxury Event Designer',
    'DIY Decoration Hire',
    'Themed Event Specialist'
  ];

  const decorationTypeOptions = [
    'Balloon Arches',
    'Balloon Walls',
    'Balloon Columns',
    'Organic Balloon Designs',
    'Balloon Bouquets',
    'Number & Letter Balloons',
    'Fabric Draping',
    'Backdrop Designs',
    'Centerpieces',
    'Table Styling',
    'Ceiling Installations',
    'Entrance Displays',
    'Photo Booth Setups',
    'Floral Arrangements',
    'Lighting Design',
    'Prop Styling'
  ];

  const designStyleOptions = [
    'Modern & Minimalist',
    'Luxury & Glamorous',
    'Rustic & Natural',
    'Whimsical & Playful',
    'Elegant & Classic',
    'Bold & Vibrant',
    'Pastel & Soft',
    'Monochromatic',
    'Vintage & Retro',
    'Tropical & Bright',
    'Bohemian & Eclectic',
    'Industrial & Urban'
  ];

  const colorSchemeOptions = [
    'Pink & Gold',
    'Blue & Silver',
    'Rainbow Bright',
    'Pastel Dreams',
    'Black & Gold',
    'White & Green',
    'Red & White',
    'Purple & Silver',
    'Rose Gold & Blush',
    'Navy & Copper',
    'Sage & Cream',
    'Custom Color Matching'
  ];

  const themeOptions = [
    'Princess & Fairy Tale',
    'Superhero',
    'Unicorn Magic',
    'Safari & Animals',
    'Under the Sea',
    'Space & Galaxy',
    'Dinosaur Adventure',
    'Frozen & Winter',
    'Tropical Paradise',
    'Circus & Carnival',
    'Sports Themes',
    'Movie & TV Characters',
    'Seasonal & Holidays',
    'Gender Reveal',
    'Baby Shower',
    'Wedding & Anniversary'
  ];

  const ageGroupOptions = [
    '1st Birthday',
    '2-5 years (Toddlers)',
    '6-10 years (Children)',
    '11-16 years (Teens)',
    '18+ years (Adults)',
    'All ages',
    'Corporate events'
  ];

  const eventTypeOptions = [
    'Birthday Parties',
    'Baby Showers',
    'Gender Reveals',
    'Christenings/Baptisms',
    'Wedding Celebrations',
    'Anniversary Parties',
    'Graduation Parties',
    'Corporate Events',
    'Product Launches',
    'Holiday Celebrations',
    'School Events',
    'Charity Fundraisers'
  ];

  const balloonTypeOptions = [
    'Latex Balloons',
    'Foil/Mylar Balloons',
    'Chrome Balloons',
    'Confetti Balloons',
    'Bubble Balloons',
    'Giant Balloons',
    'Helium Quality',
    'Biodegradable Options'
  ];

  const fabricOptions = [
    'Chiffon Draping',
    'Tulle & Netting',
    'Satin Fabrics',
    'Velvet Textures',
    'Lace Details',
    'Sequin Materials',
    'Sheer Fabrics',
    'Cotton Bunting'
  ];

  const floralOptions = [
    'Fresh Flower Arrangements',
    'Silk Flower Displays',
    'Dried Flower Features',
    'Greenery & Foliage',
    'Floral Walls',
    'Petals & Confetti',
    'Seasonal Flowers',
    'Tropical Plants'
  ];

  const propOptions = [
    'Photo Props',
    'Signage & Banners',
    'Vintage Props',
    'Character Cutouts',
    'Themed Accessories',
    'Furniture Styling',
    'Decorative Stands',
    'Interactive Elements'
  ];

  const lightingOptions = [
    'Fairy Lights',
    'LED Strip Lighting',
    'Uplighting',
    'Spotlights',
    'Neon Signs',
    'Candles & Lanterns',
    'Projection Mapping',
    'Color-changing LEDs'
  ];

  const awardOptions = [
    'Wedding Industry Awards',
    'Event Styling Recognition',
    'Local Business Awards',
    'Social Media Features',
    'Magazine Publications',
    'Industry Certifications',
    'Client Choice Awards',
    'Design Competitions'
  ];

  // Add-ons management state
  const [isAddingAddon, setIsAddingAddon] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonForm, setAddonForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'styling'
  });

  const addonCategories = [
    { value: 'styling', label: 'Additional Styling', emoji: '✨', description: 'Extra decorative elements or designs' },
    { value: 'setup', label: 'Setup Services', emoji: '🛠️', description: 'Installation, breakdown, or logistics' },
    { value: 'design', label: 'Design Services', emoji: '🎨', description: 'Custom design work or consultations' },
    { value: 'materials', label: 'Premium Materials', emoji: '💎', description: 'Luxury or specialty materials' },
    { value: 'photography', label: 'Photography', emoji: '📸', description: 'Documentation or styling photos' }
  ];

  const addonTemplates = [
    { name: 'Extra Balloon Arch', price: 120, description: 'Additional balloon arch for second entrance or area', category: 'styling' },
    { name: 'Premium Setup Service', price: 80, description: 'White-glove installation and styling service', category: 'setup' },
    { name: 'Custom Design Consultation', price: 100, description: 'One-hour design consultation with mood boards', category: 'design' },
    { name: 'Luxury Material Upgrade', price: 150, description: 'Premium balloons, fabrics, and finishing touches', category: 'materials' },
    { name: 'Installation Photography', price: 60, description: 'Professional photos of completed styling', category: 'photography' },
    { name: 'Late Night Breakdown', price: 45, description: 'Collection and breakdown after 10pm', category: 'setup' },
    { name: 'Color Matching Service', price: 25, description: 'Custom color matching to specific requirements', category: 'design' },
    { name: 'Emergency Styling', price: 200, description: 'Last-minute styling service (under 48 hours)', category: 'setup' }
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
      category: 'styling'
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
            <strong>Editing:</strong> {currentBusiness.name} • Party Decorations & Styling
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
      {/* Business Type & Decoration Specialties */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-pink-50 to-pink-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Business Type & Decoration Specialties
          </CardTitle>
          <CardDescription className="text-base">
            Tell customers what type of decoration services you specialize in
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="businessType" className="text-base font-semibold text-gray-700">
              What type of decoration business are you? *
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
            <h4 className="font-semibold text-gray-900 mb-4">Types of Decorations You Create</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decorationTypeOptions.map(type => (
                <div key={type} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors">
                  <Checkbox
                    id={`decoration-${type}`}
                    checked={details.decorationTypes.includes(type)}
                    onCheckedChange={() => handleArrayToggle(details.decorationTypes, type, 'decorationTypes')}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`decoration-${type}`} className="text-base font-medium cursor-pointer flex-1">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Styles & Color Schemes */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            Design Styles & Color Schemes
          </CardTitle>
          <CardDescription className="text-base">
            Showcase your design aesthetic and color expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Design Styles You Specialize In</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {designStyleOptions.map(style => (
                <div key={style} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
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
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Popular Color Schemes</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorSchemeOptions.map(color => (
                <div key={color} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                  <Checkbox
                    id={`color-${color}`}
                    checked={details.colorSchemes.includes(color)}
                    onCheckedChange={() => handleArrayToggle(details.colorSchemes, color, 'colorSchemes')}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`color-${color}`} className="text-base font-medium cursor-pointer flex-1">
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Themes & Event Types */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Themes & Event Types
          </CardTitle>
          <CardDescription className="text-base">
            What themes and events do you love to design for?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Themes You Design For</h4>
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
            <h4 className="font-semibold text-gray-900 mb-4">Age Groups & Event Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-medium text-gray-800 mb-3">Age Groups</h5>
                <div className="space-y-3">
                  {ageGroupOptions.map(age => (
                    <div key={age} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <Checkbox
                        id={`age-${age}`}
                        checked={details.ageGroups.includes(age)}
                        onCheckedChange={() => handleArrayToggle(details.ageGroups, age, 'ageGroups')}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={`age-${age}`} className="text-sm font-medium cursor-pointer flex-1">
                        {age}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-3">Event Types</h5>
                <div className="space-y-3">
                  {eventTypeOptions.map(event => (
                    <div key={event} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <Checkbox
                        id={`event-${event}`}
                        checked={details.eventTypes.includes(event)}
                        onCheckedChange={() => handleArrayToggle(details.eventTypes, event, 'eventTypes')}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={`event-${event}`} className="text-sm font-medium cursor-pointer flex-1">
                        {event}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials & Techniques */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            Materials & Techniques
          </CardTitle>
          <CardDescription className="text-base">
            What materials and techniques do you work with?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Balloon Types</h4>
              <div className="space-y-3">
                {balloonTypeOptions.map(balloon => (
                  <div key={balloon} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                    <Checkbox
                      id={`balloon-${balloon}`}
                      checked={details.materials?.balloons?.includes(balloon) || false}
                      onCheckedChange={(checked) => {
                        const currentBalloons = details.materials?.balloons || [];
                        const newBalloons = checked 
                          ? [...currentBalloons, balloon]
                          : currentBalloons.filter(b => b !== balloon);
                        handleNestedFieldChange('materials', 'balloons', newBalloons);
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`balloon-${balloon}`} className="text-sm font-medium cursor-pointer flex-1">
                      {balloon}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Fabric & Textiles</h4>
              <div className="space-y-3">
                {fabricOptions.map(fabric => (
                  <div key={fabric} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                    <Checkbox
                      id={`fabric-${fabric}`}
                      checked={details.materials?.fabrics?.includes(fabric) || false}
                      onCheckedChange={(checked) => {
                        const currentFabrics = details.materials?.fabrics || [];
                        const newFabrics = checked 
                          ? [...currentFabrics, fabric]
                          : currentFabrics.filter(f => f !== fabric);
                        handleNestedFieldChange('materials', 'fabrics', newFabrics);
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`fabric-${fabric}`} className="text-sm font-medium cursor-pointer flex-1">
                      {fabric}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Floral Elements</h4>
              <div className="space-y-3">
                {floralOptions.map(floral => (
                  <div key={floral} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                    <Checkbox
                      id={`floral-${floral}`}
                      checked={details.materials?.florals?.includes(floral) || false}
                      onCheckedChange={(checked) => {
                        const currentFlorals = details.materials?.florals || [];
                        const newFlorals = checked 
                          ? [...currentFlorals, floral]
                          : currentFlorals.filter(f => f !== floral);
                        handleNestedFieldChange('materials', 'florals', newFlorals);
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`floral-${floral}`} className="text-sm font-medium cursor-pointer flex-1">
                      {floral}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Lighting & Effects</h4>
              <div className="space-y-3">
                {lightingOptions.map(lighting => (
                  <div key={lighting} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                    <Checkbox
                      id={`lighting-${lighting}`}
                      checked={details.materials?.lighting?.includes(lighting) || false}
                      onCheckedChange={(checked) => {
                        const currentLighting = details.materials?.lighting || [];
                        const newLighting = checked 
                          ? [...currentLighting, lighting]
                          : currentLighting.filter(l => l !== lighting);
                        handleNestedFieldChange('materials', 'lighting', newLighting);
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`lighting-${lighting}`} className="text-sm font-medium cursor-pointer flex-1">
                      {lighting}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Process & Setup Options */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Service Process & Setup Options
          </CardTitle>
          <CardDescription className="text-base">
            How do you work with clients and deliver your services?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Design Process</h4>
              <div className="space-y-4">
                {[
                  { key: 'consultation', label: 'Initial consultation included' },
                  { key: 'designConcepts', label: 'Design concepts & mood boards' },
                  { key: 'finalApproval', label: 'Final design approval process' }
                ].map(item => (
                  <div key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      id={`process-${item.key}`}
                      checked={details.designProcess?.[item.key] || false}
                      onCheckedChange={(checked) => handleNestedFieldChange('designProcess', item.key, checked)}
                      className="w-5 h-5"
                    />
                    <Label htmlFor={`process-${item.key}`} className="text-base font-medium cursor-pointer flex-1">
                      {item.label}
                    </Label>
                  </div>
                ))}

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">
                    Number of Design Revisions Included
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={details.designProcess?.revisions || ''}
                    onChange={(e) => handleNestedFieldChange('designProcess', 'revisions', parseInt(e.target.value))}
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                    placeholder="3"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Setup & Service Options</h4>
              <div className="space-y-4">
                {[
                  { key: 'selfSetup', label: 'Self-setup (collection only)' },
                  { key: 'deliverySetup', label: 'Delivery & basic setup' },
                  { key: 'fullServiceSetup', label: 'Full-service setup & styling' },
                  { key: 'breakdown', label: 'Post-event breakdown service' }
                ].map(item => (
                  <div key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      id={`setup-${item.key}`}
                      checked={details.setupOptions?.[item.key] || false}
                      onCheckedChange={(checked) => handleNestedFieldChange('setupOptions', item.key, checked)}
                      className="w-5 h-5"
                    />
                    <Label htmlFor={`setup-${item.key}`} className="text-base font-medium cursor-pointer flex-1">
                      {item.label}
                    </Label>
                  </div>
                ))}

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700">
                    Typical Setup Time (hours)
                  </Label>
                  <Input
                    type="number"
                    min="0.5"
                    max="8"
                    step="0.5"
                    value={details.setupOptions?.timeRequired || ''}
                    onChange={(e) => handleNestedFieldChange('setupOptions', 'timeRequired', parseFloat(e.target.value))}
                    className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                    placeholder="2"
                  />
                </div>
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
            Set your pricing model and package rates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Pricing Model
            </Label>
            <Select 
              value={details.pricing?.model || 'package_based'} 
              onValueChange={(value) => handleNestedFieldChange('pricing', 'model', value)}
            >
              <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base">
                <SelectValue placeholder="Choose your pricing model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="package_based">Package-Based Pricing</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="per_item">Per Item/Element</SelectItem>
                <SelectItem value="custom">Custom Quotes Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Package Pricing</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Basic (£)
                </Label>
                <Input
                  type="number"
                  min="50"
                  value={details.pricing?.packagePrices?.basic || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'packagePrices', {
                    ...details.pricing?.packagePrices,
                    basic: parseInt(e.target.value)
                  })}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="150"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Standard (£)
                </Label>
                <Input
                  type="number"
                  min="100"
                  value={details.pricing?.packagePrices?.standard || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'packagePrices', {
                    ...details.pricing?.packagePrices,
                    standard: parseInt(e.target.value)
                  })}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="300"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Premium (£)
                </Label>
                <Input
                  type="number"
                  min="200"
                  value={details.pricing?.packagePrices?.premium || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'packagePrices', {
                    ...details.pricing?.packagePrices,
                    premium: parseInt(e.target.value)
                  })}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="500"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Luxury (£)
                </Label>
                <Input
                  type="number"
                  min="400"
                  value={details.pricing?.packagePrices?.luxury || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'packagePrices', {
                    ...details.pricing?.packagePrices,
                    luxury: parseInt(e.target.value)
                  })}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="800"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Additional Fees</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  placeholder="20"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Setup Fee (£)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={details.pricing?.setupFee || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'setupFee', parseInt(e.target.value))}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="50"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Minimum Spend (£)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={details.pricing?.minSpend || ''}
                  onChange={(e) => handleNestedFieldChange('pricing', 'minSpend', parseInt(e.target.value))}
                  className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                  placeholder="200"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Portfolio & Experience */}
      <Card>
        <CardHeader className="p-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            Design Portfolio & Experience
          </CardTitle>
          <CardDescription className="text-base">
            Showcase your creative work and design expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Years of design experience
              </Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={details.businessDetails?.yearsExperience || ''}
                onChange={(e) => handleNestedFieldChange('businessDetails', 'yearsExperience', e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="5"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Design background & training
              </Label>
              <Input
                value={details.businessDetails?.designBackground || ''}
                onChange={(e) => handleNestedFieldChange('businessDetails', 'designBackground', e.target.value)}
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
                placeholder="e.g., Art school, self-taught, interior design"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Describe your specialty projects & signature style
            </Label>
            <Textarea
              value={details.portfolio?.specialtyProjects || ''}
              onChange={(e) => handleNestedFieldChange('portfolio', 'specialtyProjects', e.target.value)}
              placeholder="e.g., Large-scale balloon installations, luxury wedding styling, corporate event branding..."
              rows={4}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Your favorite creations & proudest moments
            </Label>
            <Textarea
              value={details.portfolio?.favoriteCreations || ''}
              onChange={(e) => handleNestedFieldChange('portfolio', 'favoriteCreations', e.target.value)}
              placeholder="e.g., 30-foot balloon rainbow arch, enchanted forest baby shower, celebrity birthday party..."
              rows={4}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              What makes your designs unique?
            </Label>
            <Textarea
              value={details.portfolio?.uniqueOfferings || ''}
              onChange={(e) => handleNestedFieldChange('portfolio', 'uniqueOfferings', e.target.value)}
              placeholder="e.g., Custom color matching, 3D design mockups, sustainable materials, same-day setup..."
              rows={3}
              className="bg-white border-2 border-gray-200 rounded-xl text-base p-4 resize-none"
            />
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Awards & Recognition</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {awardOptions.map(award => (
                <div key={award} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                  <Checkbox
                    id={`award-${award}`}
                    checked={details.businessDetails?.awards?.includes(award) || false}
                    onCheckedChange={(checked) => {
                      const currentAwards = details.businessDetails?.awards || [];
                      const newAwards = checked 
                        ? [...currentAwards, award]
                        : currentAwards.filter(a => a !== award);
                      handleNestedFieldChange('businessDetails', 'awards', newAwards);
                    }}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`award-${award}`} className="text-base font-medium cursor-pointer flex-1">
                    {award}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">
              Your design story & what inspires you
            </Label>
            <Textarea
              value={details.businessDetails?.story || ''}
              onChange={(e) => handleNestedFieldChange('businessDetails', 'story', e.target.value)}
              placeholder="Share your journey into party decoration, what drives your creativity, and why you love creating magical moments..."
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
            Create optional extras that customers can add to their decoration packages
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Quick Templates */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              🌟 Quick Add Templates
            </h4>
            <p className="text-sm text-gray-600 mb-4">Popular decoration add-ons you can add with one click</p>
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
                ✨ Your Add-on Services ({details.addOnServices.length})
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
                    placeholder="e.g., Extra Balloon Arch"
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
                    placeholder="120"
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

export default DecorationsServiceDetails;