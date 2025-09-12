import React, { useState } from 'react';
import { Building2, Plus, ChevronDown, Crown, Loader2, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusiness } from '@/contexts/BusinessContext';
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/UniversalModal';
import { BusinessSwitcherSkeleton } from './DashboardSkeletons';

const CompactBusinessSwitcher = ({ className = "" }) => {
  const { 
    currentBusiness, 
    businesses, 
    switchBusiness, 
    createNewBusiness, 
    loading,
    switching, // Add this to your context
    getPrimaryBusiness,
    getThemedBusinesses
  } = useBusiness();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'Entertainment',
    theme: 'no-theme'
  });
  const [creating, setCreating] = useState(false);
  const [switchingTo, setSwitchingTo] = useState(null); // Track which business we're switching to

  // Helper function to truncate business names for mobile
  const getTruncatedBusinessName = (name, maxLength = 20) => {
    if (!name) return 'Select Business';
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  // Helper function to get abbreviated service type
  const getAbbreviatedServiceType = (serviceType) => {
    const abbreviations = {
      'Entertainment': 'Entertainment',
      'Photography': 'Photo',
      'Face Painting': 'Face Paint',
      'Bouncy Castle': 'Bouncy',
      'Activities': 'Activities',
      'Party Bags': 'Party Bags',
      'Decorations': 'Decor',
      'Catering': 'Catering',
      'Venues': 'Venues',
      'Cakes': 'Cakes'
    };
    return abbreviations[serviceType] || serviceType;
  };

  // Keep service types consistent with your onboarding flow
  const serviceTypes = [
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Venues', label: 'Venues' },
    { value: 'Catering', label: 'Catering' },
    { value: 'Photography', label: 'Photography' },
    { value: 'Decorations', label: 'Decorations' },
    { value: 'Activities', label: 'Activities & Games' },
    { value: 'Face Painting', label: 'Face Painting' },
    { value: 'Bouncy Castle', label: 'Bouncy Castle' },
    { value: 'Cakes', label: 'Cakes & Desserts' },
    { value: 'Party Bags', label: 'Party Bags' },
    { value: 'other', label: 'Other' }
  ];

  // Expanded theme options - more comprehensive and organized
  const themeOptions = {
    'Entertainment': [
      'Princess & Fairy Tales',
      'Superhero Adventures', 
      'Unicorns & Magic',
      'Dinosaur Discovery',
      'Space & Astronauts',
      'Pirate Adventures',
      'Jungle Safari',
      'Under the Sea/Mermaid',
      'Science & Experiments',
      'Magic Shows',
      'Circus & Clowns',
      'Frozen/Ice Princess',
      'Cars & Racing',
      'Football & Sports',
      'Dance & Music',
      'Arts & Crafts',
      'General/All Themes'
    ],
    'Party Bags': [
      'Princess & Fairy Tales',
      'Superhero Adventures',
      'Unicorns & Magic', 
      'Dinosaur Discovery',
      'Space & Astronauts',
      'Pirate Adventures',
      'Jungle Safari',
      'Under the Sea/Mermaid',
      'Frozen/Ice Princess',
      'Cars & Racing',
      'Football & Sports',
      'Rainbow & Colors',
      'Animals & Pets',
      'LOL Surprise',
      'Minecraft',
      'Paw Patrol',
      'Harry Potter',
      'General/Mixed Themes'
    ],
    'Venues': [
      'Indoor Play Centers',
      'Outdoor Gardens',
      'Community Halls',
      'Sports Centers', 
      'Church Halls',
      'Private Function Rooms',
      'School Venues',
      'Hotel Conference Rooms',
      'Restaurant Private Rooms',
      'Village Halls',
      'General/All Types'
    ],
    'Catering': [
      'Kids Party Food',
      'Healthy Options',
      'Themed Cakes',
      'Buffet Style',
      'Picnic Style',
      'Formal Dining',
      'Dietary Requirements',
      'Vegan/Vegetarian',
      'Allergy-Friendly',
      'Birthday Cakes',
      'General/All Types'
    ],
    'Decorations': [
      'Balloon Decorations',
      'Themed Decorations',
      'Table Styling',
      'Backdrop & Photo Booths',
      'Balloon Arches',
      'Centerpieces',
      'Outdoor Decorations',
      'Lighting & Effects',
      'Floral Arrangements',
      'Event Styling',
      'General/All Types'
    ],
    'Photography': [
      'Party Photography',
      'Portrait Sessions',
      'Action & Candid',
      'Photo Booth Services',
      'Event Coverage',
      'Family Photography',
      'Professional Prints',
      'Digital Galleries',
      'Same-Day Edits',
      'Video Services',
      'General/All Types'
    ],
    'Face Painting': [
      'Character Designs',
      'Animal Faces',
      'Fantasy & Magic',
      'Sports Themes',
      'Glitter & Gems',
      'Temporary Tattoos',
      'Body Art',
      'Quick Designs',
      'Detailed Artwork',
      'All Ages',
      'General/All Types'
    ],
    'Activities': [
      'Craft Activities',
      'Games & Competitions',
      'Sports Activities',
      'Team Building',
      'Educational Fun',
      'Creative Workshops',
      'Outdoor Activities',
      'Indoor Games',
      'Themed Activities',
      'Age-Specific',
      'General/All Types'
    ],
    'Bouncy Castle': [
      'Indoor Inflatables',
      'Outdoor Inflatables',
      'Themed Bouncy Castles',
      'Obstacle Courses',
      'Slides & Combos',
      'Soft Play Equipment',
      'Ball Pits',
      'Interactive Games',
      'Water Features',
      'All Weather',
      'General/All Types'
    ],
    'Cakes': [
      'Birthday Cakes',
      'Themed Cakes',
      'Cupcakes & Treats',
      'Wedding Cakes',
      'Custom Designs',
      'Vegan Options',
      'Gluten-Free',
      'Allergy-Friendly',
      'Celebration Cakes',
      'Dessert Tables',
      'General/All Types'
    ],
    'other': [
      'Custom Service',
      'Specialty Service',
      'Unique Offering',
      'Niche Market',
      'General Service'
    ]
  };

  const handleBusinessSwitch = async (businessId) => {
    if (businessId === "__add_business__") {
      setShowCreateForm(true);
      return;
    }

    if (businessId === currentBusiness?.id) {
      return; // Already selected
    }

    try {
      setSwitchingTo(businessId);
      console.log("🔄 Switching to business:", businessId);
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await switchBusiness(businessId);
      
      console.log("✅ Business switch completed");
    } catch (error) {
      console.error("❌ Business switch failed:", error);
      // You might want to show a toast notification here
      alert("Failed to switch business. Please try again.");
    } finally {
      setSwitchingTo(null);
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.serviceType) {
      alert('Please fill in business name and service type');
      return;
    }

    setCreating(true);
    try {
      console.log("🏗️ Creating new business:", formData);
      
      // Convert "no-theme" back to empty string for storage
      const businessData = {
        ...formData,
        theme: formData.theme === 'no-theme' ? '' : formData.theme
      };
      
      await createNewBusiness(businessData);
      
      console.log("✅ Business created successfully");
      setShowCreateForm(false);
      setFormData({ name: '', serviceType: 'Entertainment', theme: '' });
    } catch (error) {
      console.error('❌ Business creation failed:', error);
      alert('Failed to create business: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    if (!creating) {
      setShowCreateForm(false);
      setFormData({ name: '', serviceType: 'Entertainment', theme: 'no-theme' });
    }
  };

  if (loading) {
    return <BusinessSwitcherSkeleton className={className} />
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className={`py-2 px-4 bg-yellow-50 rounded-lg border border-yellow-200 ${className}`}>
        <span className="text-sm text-yellow-700">No businesses found</span>
      </div>
    );
  }

  const primaryBusiness = getPrimaryBusiness();
  const themedBusinesses = getThemedBusinesses();
  const isSwitching = switching || switchingTo;

  return (
    <>
      {/* Enhanced Business Switcher with Loading States */}
      <div className={`flex items-center gap-2 sm:gap-3 py-2 px-3 sm:px-4 bg-white rounded-full shadow-sm ${className} ${isSwitching ? 'opacity-75' : ''}`}>
        
        {/* Loading Indicator */}
        {isSwitching && (
          <div className="flex-shrink-0">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
          </div>
        )}
        
        {/* Business Selector */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <Select 
            value={currentBusiness?.id || ''} 
            onValueChange={handleBusinessSwitch}
            disabled={isSwitching}
          >
            <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 disabled:opacity-100 w-full">
              <div className="flex items-center gap-2 min-w-0 w-full overflow-hidden">
                {/* Crown Icon - always visible but smaller on mobile */}
                {currentBusiness?.isPrimary && (
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                )}
                
                {/* Business Info - responsive layout */}
                <div className="min-w-0 flex-1 overflow-hidden">
                  {/* Mobile Layout: Single line with truncated name */}
                  <div className="sm:hidden">
                    <div className="font-medium text-sm truncate leading-tight">
                      {getTruncatedBusinessName(currentBusiness?.name, 15)}
                    </div>
                  </div>
                  
                  {/* Desktop Layout: Two lines */}
                  <div className="hidden sm:block">
                    <div className="font-medium text-sm truncate leading-tight">
                      {currentBusiness?.name || 'Select Business'}
                    </div>
                    {currentBusiness && (
                      <div className="text-xs text-gray-500 capitalize truncate leading-tight">
                        {currentBusiness.serviceType}
                        {currentBusiness.theme && ` • ${currentBusiness.theme}`}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Switch Success Indicator - smaller on mobile */}
                {!isSwitching && currentBusiness && (
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                )}
              </div>
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[280px]">
              {/* Primary Business */}
              {primaryBusiness && (
                <SelectItem 
                  value={primaryBusiness.id}
                  disabled={switchingTo === primaryBusiness.id}
                >
                  <div className="flex items-center gap-2 py-1 w-full">
                    <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{primaryBusiness.name}</div>
                      <div className="text-xs text-gray-500">Primary Business</div>
                    </div>
                    {switchingTo === primaryBusiness.id && (
                      <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
                    )}
                  </div>
                </SelectItem>
              )}
              
              {/* Themed Businesses */}
              {themedBusinesses.map(business => (
                <SelectItem 
                  key={business.id} 
                  value={business.id}
                  disabled={switchingTo === business.id}
                >
                  <div className="flex items-center gap-2 py-1 w-full">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{business.name}</div>
                      <div className="text-xs text-gray-500 capitalize truncate">
                        {getAbbreviatedServiceType(business.serviceType)}
                        {business.theme && ` • ${business.theme}`}
                      </div>
                    </div>
                    {switchingTo === business.id && (
                      <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
                    )}
                  </div>
                </SelectItem>
              ))}
              
              {/* Mobile-only: Business count and Add Business */}
              <div className="sm:hidden">
                <div className="border-t border-gray-200 my-1"></div>
                <div className="px-2 py-1 text-xs text-gray-500">
                  {businesses.length} business{businesses.length !== 1 ? 'es' : ''} total
                </div>
                <SelectItem value="__add_business__" disabled={isSwitching}>
                  <div className="flex items-center gap-2 py-1 text-primary-600">
                    <Plus className="h-4 w-4 flex-shrink-0" />
                    <div className="font-medium">Add New Business</div>
                  </div>
                </SelectItem>
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Business Count - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
          <Building2 className="h-3 w-3" />
          {businesses.length}
        </div>

        {/* Add Business Button - Hidden on mobile */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowCreateForm(true)}
          disabled={isSwitching}
          className="hidden sm:flex h-8 w-8 p-0 text-gray-500 hover:text-gray-700 disabled:opacity-50 flex-shrink-0"
          title="Add Business"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Messages */}
      {isSwitching && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border px-4 py-2 z-50">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            <span>Switching business...</span>
          </div>
        </div>
      )}

      {/* Create New Business Modal - Now using UniversalModal */}
      <UniversalModal 
        isOpen={showCreateForm} 
        onClose={handleCloseModal}
        size="md"
        theme="fun"
        preventOutsideClick={creating}
        showCloseButton={!creating}
      >
        <ModalHeader
          title="Create New Themed Business"
          subtitle="Add a specialized business to target specific themes or markets"
          icon={<Building2 className="w-6 h-6" />}
          theme="fun"
        />
        
        <ModalContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sarah's Princess Parties"
                required
                disabled={creating}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select 
                value={formData.serviceType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value, theme: 'no-theme' }))}
                disabled={creating}
              >
                <SelectTrigger className="mt-2 w-full px-2 text-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme">Theme/Specialty (Optional)</Label>
           
              <Select 
                value={formData.theme} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
                disabled={creating}
              >
                <SelectTrigger className="w-full px-2 mt-2 text-gray-600">
                  <SelectValue placeholder="Select a theme (optional)" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="no-theme">No specific theme</SelectItem>
                  {themeOptions[formData.serviceType]?.map(theme => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ModalContent>

        <ModalFooter theme="fun">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal}
              className="flex-1"
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBusiness}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
              disabled={creating || !formData.name || !formData.serviceType}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Business'
              )}
            </Button>
          </div>
        </ModalFooter>
      </UniversalModal>
    </>
  );
};

export default CompactBusinessSwitcher;