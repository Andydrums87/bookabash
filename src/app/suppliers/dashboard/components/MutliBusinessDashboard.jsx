import React, { useState } from 'react';
import { Building2, Plus, ChevronDown, Crown, Loader2, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusiness } from '@/contexts/BusinessContext';

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
    serviceType: 'entertainer',
    theme: ''
  });
  const [creating, setCreating] = useState(false);
  const [switchingTo, setSwitchingTo] = useState(null); // Track which business we're switching to

  const serviceTypes = [
    { value: 'entertainer', label: 'Entertainment' },
    { value: 'venue', label: 'Venue' },
    { value: 'catering', label: 'Catering' },
    { value: 'supplies', label: 'Party Supplies' },
    { value: 'photography', label: 'Photography' },
    { value: 'dj', label: 'DJ Services' }
  ];

  const themeOptions = {
    entertainer: ['princess', 'superhero', 'science', 'magic', 'pirate', 'fairy', 'dinosaur', 'space'],
    supplies: ['party-bags', 'decorations', 'tableware', 'balloons', 'themes'],
    venue: ['indoor', 'outdoor', 'community-hall', 'private-garden', 'commercial'],
    catering: ['kids-menu', 'buffet', 'formal-dining', 'snacks', 'dietary-special'],
    photography: ['event', 'portrait', 'action', 'candid', 'professional'],
    dj: ['kids-parties', 'teen-parties', 'family-events', 'corporate', 'wedding']
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
    if (!formData.name || !formData.serviceType || !formData.theme) {
      alert('Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      console.log("🏗️ Creating new business:", formData);
      
      await createNewBusiness(formData);
      
      console.log("✅ Business created successfully");
      setShowCreateForm(false);
      setFormData({ name: '', serviceType: 'entertainer', theme: '' });
    } catch (error) {
      console.error('❌ Business creation failed:', error);
      alert('Failed to create business: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-3 py-4 px-4 bg-white rounded-full ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
        <span className="text-sm text-gray-500">Loading businesses...</span>
      </div>
    );
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
      <div className={`flex items-center gap-3 py-2 px-4 bg-white rounded-full shadow-sm ${className} ${isSwitching ? 'opacity-75' : ''}`}>
        
        {/* Loading Indicator */}
        {isSwitching && (
          <div className="flex-shrink-0">
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
          </div>
        )}
        
        {/* Business Selector */}
        <div className="flex-1 min-w-0">
          <Select 
            value={currentBusiness?.id || ''} 
            onValueChange={handleBusinessSwitch}
            disabled={isSwitching}
          >
            <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 disabled:opacity-100">
              <div className="flex items-center gap-2 min-w-0">
                {currentBusiness?.isPrimary && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {currentBusiness?.name || 'Select Business'}
                  </div>
                  {currentBusiness && (
                    <div className="text-xs text-gray-500 capitalize truncate">
                      {currentBusiness.serviceType} • {currentBusiness.theme}
                    </div>
                  )}
                </div>
                
                {/* Switch Success Indicator */}
                {!isSwitching && currentBusiness && (
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              {/* Primary Business */}
              {primaryBusiness && (
                <SelectItem 
                  value={primaryBusiness.id}
                  disabled={switchingTo === primaryBusiness.id}
                >
                  <div className="flex items-center gap-2 py-1">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <div>
                      <div className="font-medium">{primaryBusiness.name}</div>
                      <div className="text-xs text-gray-500">Primary Business</div>
                    </div>
                    {switchingTo === primaryBusiness.id && (
                      <Loader2 className="h-3 w-3 animate-spin ml-auto" />
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
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="font-medium">{business.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {business.serviceType} • {business.theme}
                      </div>
                    </div>
                    {switchingTo === business.id && (
                      <Loader2 className="h-3 w-3 animate-spin ml-auto" />
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
                    <Plus className="h-4 w-4" />
                    <div className="font-medium">Add New Business</div>
                  </div>
                </SelectItem>
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Business Count - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
          <Building2 className="h-3 w-3" />
          {businesses.length}
        </div>

        {/* Add Business Button - Hidden on mobile */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowCreateForm(true)}
          disabled={isSwitching}
          className="hidden sm:flex h-8 w-8 p-0 text-gray-500 hover:text-gray-700 disabled:opacity-50"
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

      {/* Create New Business Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full m-4">
            <CardHeader>
              <CardTitle>Create New Themed Business</CardTitle>
              <p className="text-sm text-gray-600">
                Add a specialized business to target specific themes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sarah's Princess Parties"
                  required
                  disabled={creating}
                />
              </div>
              
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Select 
                  value={formData.serviceType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value, theme: '' }))}
                  disabled={creating}
                >
                  <SelectTrigger>
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
                <Label htmlFor="theme">Theme/Specialty</Label>
                <Select 
                  value={formData.theme} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
                  disabled={creating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions[formData.serviceType]?.map(theme => (
                      <SelectItem key={theme} value={theme}>
                        {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBusiness}
                  className="flex-1"
                  disabled={creating || !formData.name || !formData.serviceType || !formData.theme}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CompactBusinessSwitcher;