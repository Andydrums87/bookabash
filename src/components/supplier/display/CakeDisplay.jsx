// components/supplier/display/CakeDisplay.jsx
"use client"

import React from 'react';
import { Badge } from "@/components/ui/badge";
import {
  Cake,
  Leaf,
  Palette,
  Package,
  Users
} from "lucide-react";

// Helper to format dietary option labels
const DIETARY_LABELS = {
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten Free',
  'dairy-free': 'Dairy Free',
  'nut-free': 'Nut Free',
  'egg-free': 'Egg Free',
  'halal': 'Halal',
};

const CakeDisplay = ({ supplier, serviceDetails, themeAccentColor }) => {
  // Get cake data from multiple sources
  const cakeDescription = supplier?.description || serviceDetails?.description || '';
  const cakeFlavours = supplier?.flavours || serviceDetails?.flavours || [];
  const cakeDietary = supplier?.dietaryInfo || serviceDetails?.dietaryInfo || [];
  const cakeThemes = supplier?.themes || serviceDetails?.themes || [];
  const packages = supplier?.packages || [];

  // Helper to render badge sections
  const renderBadgeSection = (items, title, icon, colorClass) => {
    if (!items?.length) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            const label = typeof item === 'string'
              ? (DIETARY_LABELS[item] || item)
              : item;
            return (
              <Badge
                key={index}
                variant="outline"
                className={`${colorClass} text-sm py-1.5 px-3`}
              >
                {label}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* About This Cake */}
      {cakeDescription && (
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Cake className="w-5 h-5 text-pink-500" />
            About This Cake
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {cakeDescription}
          </p>
        </div>
      )}

      {/* Available Flavours */}
      {renderBadgeSection(
        cakeFlavours,
        "Available Flavours",
        <Palette className="w-5 h-5 text-pink-500" />,
        "text-pink-700 border-pink-300 bg-pink-50"
      )}

      {/* Dietary Options */}
      {renderBadgeSection(
        cakeDietary,
        "Dietary Options Available",
        <Leaf className="w-5 h-5 text-green-600" />,
        "text-green-700 border-green-300 bg-green-50"
      )}

      {/* Cake Themes */}
      {cakeThemes.length > 0 && renderBadgeSection(
        cakeThemes,
        "Cake Themes",
        <Palette className="w-5 h-5 text-purple-500" />,
        "text-purple-700 border-purple-300 bg-purple-50"
      )}

      {/* Sizes & Pricing */}
      {packages.length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Sizes & Pricing
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                  <span className="font-bold text-[hsl(var(--primary-500))]">
                    £{pkg.price}
                  </span>
                </div>
                {(pkg.serves || pkg.feeds) && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Feeds {pkg.serves || pkg.feeds} people</span>
                  </div>
                )}
                {pkg.description && (
                  <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CakeDisplay;
