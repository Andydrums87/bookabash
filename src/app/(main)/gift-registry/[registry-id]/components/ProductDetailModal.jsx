// components/ProductDetailModal.js
"use client"

import { useState } from 'react';
import { X, ExternalLink, Heart, Star, Package, Info, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductDetailModal({ item, isOpen, onClose, onClaim, isClaimingDisabled, guestName, isCreateMode = false }) {
  if (!isOpen || !item) return null;

  const getItemName = () => {
    return item.gift_items?.name || item.custom_name || 'Unknown Item';
  };

  const getItemPrice = () => {
    if (item.gift_items?.price) return `£${item.gift_items.price}`;
    if (item.gift_items?.price_range) return item.gift_items.price_range;
    return item.custom_price || 'Price varies';
  };

  const getItemImage = () => {
    return item.external_image_url || item.gift_items?.image_url || '/placeholder-gift.jpg';
  };

  const getBuyUrl = () => {
    return item.external_buy_url || '#';
  };

  const getDescription = () => {
    return item.gift_items?.description || item.custom_description || '';
  };

  const getRating = () => {
    return item.gift_items?.rating || null;
  };

  const getReviewCount = () => {
    return item.gift_items?.review_count || 0;
  };

  const getAgeRange = () => {
    if (item.gift_items?.age_min && item.gift_items?.age_max) {
      return `Ages ${item.gift_items.age_min}-${item.gift_items.age_max}`;
    }
    return null;
  };

  const isAmazonProduct = () => {
    return item.external_source === 'amazon' || item.source === 'amazon';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Gift Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={getItemImage()} 
                    alt={getItemName()}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-gift.jpg';
                    }}
                  />
                </div>
                
                {/* Source badge */}
                <div className="flex items-center space-x-2">
                  {isAmazonProduct() && (
                    <Badge className="bg-orange-100 text-orange-800">
                      📦 Amazon Product
                    </Badge>
                  )}
                  {item.gift_items?.popularity > 80 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      ⭐ Popular Choice
                    </Badge>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {getItemName()}
                  </h3>
                  
                  {/* Price and Rating */}
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      {getItemPrice()}
                    </span>
                    
                    {getRating() && (
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(getRating()) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {getRating()} ({getReviewCount().toLocaleString()} reviews)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Age range */}
                  {getAgeRange() && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{getAgeRange()}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {getDescription() && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Description
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {getDescription()}
                    </p>
                  </div>
                )}

                {/* Parent's Notes */}
                {item.notes && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      💭 Parent's Note
                    </h4>
                    <p className="text-purple-800 text-sm">
                      {item.notes}
                    </p>
                  </div>
                )}

                {/* Claimed Status - Only show in preview mode */}
                {!isCreateMode && (
                  <>
                    {item.is_claimed ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">
                            {item.claimed_by} is bringing this gift
                          </span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          This item has already been claimed
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-900">
                            Available to claim
                          </span>
                        </div>
                        <p className="text-blue-700 text-sm">
                          Click "I'll bring this!" to let everyone know you're getting this gift
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {!isCreateMode && !item.is_claimed && (
                    <Button
                      onClick={() => {
                        onClaim(item);
                        onClose();
                      }}
                      disabled={isClaimingDisabled}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      size="lg"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      {isClaimingDisabled ? 'Enter your name first' : 'I\'ll bring this gift!'}
                    </Button>
                  )}

                  {getBuyUrl() !== '#' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      asChild
                    >
                      <a
                        href={getBuyUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy on Amazon
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Priority:</span>
                      <span className="ml-1 capitalize">{item.priority || 'Medium'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span>
                      <span className="ml-1">{item.quantity || 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}