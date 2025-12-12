"use client"

import React, { useState, useEffect } from 'react';
import {
  Cake,
  Info,
  Loader2,
  MapPin,
  Phone,
  Truck,
  Clock,
  Home,
  Building2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CakeBusinessSettings = ({ serviceDetails, onUpdate, saving, supplierData, currentBusiness }) => {
  const [details, setDetails] = useState({
    businessName: '',
    phone: '',
    location: {
      postcode: '',
      city: '',
      fullAddress: ''
    },
    fulfilment: {
      offersPickup: true,
      offersDelivery: false,
      deliveryRadius: 10,
      deliveryFee: 0
    },
    leadTime: {
      minimum: 3,
      standard: 7
    },
    ...serviceDetails
  });

  // Update form when business data changes from parent
  useEffect(() => {
    if (supplierData) {
      console.log('🔄 CakeBusinessSettings updating with business data:', supplierData.name);

      const businessServiceDetails = supplierData.serviceDetails || {};
      const businessData = supplierData;

      setDetails(prevDetails => ({
        ...prevDetails,
        businessName: businessData.businessName || businessData.name || prevDetails.businessName,
        phone: businessData.contactInfo?.phone || businessData.owner?.phone || prevDetails.phone,
        location: {
          postcode: businessServiceDetails.location?.postcode || businessData.contactInfo?.postcode || prevDetails.location?.postcode,
          city: businessServiceDetails.location?.city || businessData.location || prevDetails.location?.city,
          fullAddress: businessServiceDetails.location?.fullAddress || prevDetails.location?.fullAddress
        },
        fulfilment: {
          offersPickup: businessServiceDetails.fulfilment?.offersPickup ?? prevDetails.fulfilment?.offersPickup ?? true,
          offersDelivery: businessServiceDetails.fulfilment?.offersDelivery ?? prevDetails.fulfilment?.offersDelivery ?? false,
          deliveryRadius: businessServiceDetails.fulfilment?.deliveryRadius ?? prevDetails.fulfilment?.deliveryRadius ?? 10,
          deliveryFee: businessServiceDetails.fulfilment?.deliveryFee ?? prevDetails.fulfilment?.deliveryFee ?? 0
        },
        leadTime: {
          minimum: businessServiceDetails.leadTime?.minimum ?? prevDetails.leadTime?.minimum ?? 3,
          standard: businessServiceDetails.leadTime?.standard ?? prevDetails.leadTime?.standard ?? 7
        }
      }));
    }
  }, [supplierData?.name, supplierData?.serviceDetails]);

  // Handlers
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

  // Show loading state if no data yet
  if (!supplierData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading business settings...</p>
        </div>
      </div>
    );
  }

  // Lead time options
  const minimumLeadTimes = [1, 2, 3, 4, 5, 6, 7];
  const standardLeadTimes = [3, 5, 7, 10, 14, 21];
  const deliveryRadiusOptions = [5, 10, 15, 20, 25, 30, 40, 50];

  return (
    <div className="space-y-8">
      {/* Business Context Header */}
      {currentBusiness && (
        <Alert className="border-amber-200 bg-amber-50">
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Business Settings:</strong> {currentBusiness.name || 'Your cake business'}
          </AlertDescription>
        </Alert>
      )}

      {/* Business Name Section */}
      <Card>
        <CardHeader className="py-8 bg-gradient-to-r from-amber-50 to-amber-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Cake className="w-5 h-5 text-white" />
            </div>
            Business Name
          </CardTitle>
          <CardDescription className="text-base">
            Your business name as it appears to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="businessName" className="text-base font-semibold text-gray-700">
              Business Name *
            </Label>
            <Input
              id="businessName"
              value={details.businessName || ''}
              onChange={(e) => handleFieldChange('businessName', e.target.value)}
              placeholder="e.g., Emma's Cakes, Sweet Delights Bakery"
              className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Section */}
      <Card>
        <CardHeader className="py-8 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            Contact Information
          </CardTitle>
          <CardDescription className="text-base">
            How customers can reach you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={details.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder="07XXX XXXXXX"
              className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Section */}
      <Card>
        <CardHeader className="py-8 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            Location
          </CardTitle>
          <CardDescription className="text-base">
            Your business location (used for delivery radius calculations)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="city" className="text-base font-semibold text-gray-700">
                City/Town
              </Label>
              <Input
                id="city"
                value={details.location?.city || ''}
                onChange={(e) => handleNestedFieldChange('location', 'city', e.target.value)}
                placeholder="e.g., Manchester"
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="postcode" className="text-base font-semibold text-gray-700">
                Postcode *
              </Label>
              <Input
                id="postcode"
                value={details.location?.postcode || ''}
                onChange={(e) => handleNestedFieldChange('location', 'postcode', e.target.value)}
                placeholder="e.g., M1 1AA"
                className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fulfilment Options Section */}
      <Card>
        <CardHeader className="py-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            Fulfilment Options
          </CardTitle>
          <CardDescription className="text-base">
            How customers can receive their cakes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Pickup Option */}
          <div
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              details.fulfilment?.offersPickup
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleNestedFieldChange('fulfilment', 'offersPickup', !details.fulfilment?.offersPickup)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                details.fulfilment?.offersPickup ? 'bg-purple-500' : 'bg-gray-200'
              }`}>
                <Home className={`w-6 h-6 ${details.fulfilment?.offersPickup ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Collection Available</h3>
                <p className="text-gray-600 text-sm">Customers can pick up from your location</p>
              </div>
              <Checkbox
                checked={details.fulfilment?.offersPickup || false}
                onCheckedChange={(checked) => handleNestedFieldChange('fulfilment', 'offersPickup', checked)}
                className="w-6 h-6"
              />
            </div>
          </div>

          {/* Delivery Option */}
          <div
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              details.fulfilment?.offersDelivery
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleNestedFieldChange('fulfilment', 'offersDelivery', !details.fulfilment?.offersDelivery)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                details.fulfilment?.offersDelivery ? 'bg-purple-500' : 'bg-gray-200'
              }`}>
                <Truck className={`w-6 h-6 ${details.fulfilment?.offersDelivery ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Delivery Available</h3>
                <p className="text-gray-600 text-sm">You can deliver cakes to customers</p>
              </div>
              <Checkbox
                checked={details.fulfilment?.offersDelivery || false}
                onCheckedChange={(checked) => handleNestedFieldChange('fulfilment', 'offersDelivery', checked)}
                className="w-6 h-6"
              />
            </div>
          </div>

          {/* Delivery Settings (shown when delivery is enabled) */}
          {details.fulfilment?.offersDelivery && (
            <div className="p-6 bg-purple-50 rounded-2xl space-y-6">
              <h4 className="font-semibold text-gray-900">Delivery Settings</h4>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Delivery Radius (miles)
                </Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {deliveryRadiusOptions.map(radius => (
                    <button
                      key={radius}
                      type="button"
                      onClick={() => handleNestedFieldChange('fulfilment', 'deliveryRadius', radius)}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        details.fulfilment?.deliveryRadius === radius
                          ? 'bg-purple-500 text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      {radius}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="deliveryFee" className="text-base font-semibold text-gray-700">
                  Delivery Fee
                </Label>
                <div className="relative max-w-[200px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">£</span>
                  <Input
                    id="deliveryFee"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={details.fulfilment?.deliveryFee === 0 ? '' : details.fulfilment?.deliveryFee}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      handleNestedFieldChange('fulfilment', 'deliveryFee', value === '' ? 0 : parseFloat(value) || 0)
                    }}
                    className="h-12 pl-10 bg-white border-2 border-gray-200 rounded-xl text-base"
                  />
                </div>
                <p className="text-sm text-gray-600">Leave empty or set to 0 for free delivery</p>
              </div>
            </div>
          )}

          {/* Warning if neither option selected */}
          {!details.fulfilment?.offersPickup && !details.fulfilment?.offersDelivery && (
            <Alert className="border-amber-200 bg-amber-50">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-amber-800">
                Please select at least one fulfilment option so customers know how they can receive their cakes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lead Time Section */}
      <Card>
        <CardHeader className="py-8 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            Lead Times
          </CardTitle>
          <CardDescription className="text-base">
            How much notice do you need for orders?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Minimum Lead Time */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold text-gray-700">
                Minimum Notice Required
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                The shortest notice period you can accept for orders
              </p>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {minimumLeadTimes.map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    handleNestedFieldChange('leadTime', 'minimum', days);
                    // Auto-adjust standard if it's less than minimum
                    if (details.leadTime?.standard < days) {
                      handleNestedFieldChange('leadTime', 'standard', days);
                    }
                  }}
                  className={`py-4 rounded-xl text-center transition-all ${
                    details.leadTime?.minimum === days
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  <span className="text-lg font-semibold">{days}</span>
                  <span className="block text-xs mt-1">{days === 1 ? 'day' : 'days'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Lead Time */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold text-gray-700">
                Recommended Notice
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                The ideal notice period for best results
              </p>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {standardLeadTimes.map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleNestedFieldChange('leadTime', 'standard', days)}
                  disabled={days < (details.leadTime?.minimum || 1)}
                  className={`py-4 rounded-xl text-center transition-all ${
                    details.leadTime?.standard === days
                      ? 'bg-orange-500 text-white'
                      : days < (details.leadTime?.minimum || 1)
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  <span className="text-lg font-semibold">{days}</span>
                  <span className="block text-xs mt-1">days</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-800">
              Customers will see: <strong>"{details.leadTime?.minimum || 3}+ days notice required, {details.leadTime?.standard || 7} days recommended"</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CakeBusinessSettings;
