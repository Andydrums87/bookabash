import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  Loader2, 
  Crown, 
  Zap, 
  Sparkles, 
  Rocket, 
  Palette, 
  Music 
} from "lucide-react"
import Image from 'next/image';
import { useFavorites } from '../favorites/hooks/useFavoritesHook';

// Theme configuration matching the filter modal
const themeConfig = {
  princess: { name: "Princess", icon: <Crown className="w-3 h-3" />, color: "bg-pink-500" },
  superhero: { name: "Superhero", icon: <Zap className="w-3 h-3" />, color: "bg-red-500" },
  unicorn: { name: "Unicorn", icon: <Sparkles className="w-3 h-3" />, color: "bg-purple-500" },
  pirate: { name: "Pirate", icon: "🏴‍☠️", color: "bg-amber-600" },
  space: { name: "Space", icon: <Rocket className="w-3 h-3" />, color: "bg-blue-600" },
  dinosaur: { name: "Dinosaur", icon: "🦕", color: "bg-green-600" },
  art: { name: "Art & Craft", icon: <Palette className="w-3 h-3" />, color: "bg-indigo-500" },
  music: { name: "Music & Dance", icon: <Music className="w-3 h-3" />, color: "bg-purple-600" },
  sports: { name: "Sports", icon: "⚽", color: "bg-orange-500" },
  science: { name: "Science", icon: "🔬", color: "bg-cyan-500" },
  fairy: { name: "Fairy Tale", icon: "🧚", color: "bg-pink-400" },
  animals: { name: "Animals", icon: "🐾", color: "bg-yellow-600" }
};

const LoadMoreSuppliersSection = ({ 
  allSuppliers = [], // This comes from your filteredSuppliers 
  isInitialLoading = false, // This comes from your existing loading state
  onSupplierClick, // Your existing click handler
  selectedThemes = [] // For highlighting matching themes
}) => {

  const { toggleFavorite, isFavorite } = useFavorites()

  const [displayedSuppliers, setDisplayedSuppliers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);



  // Configuration
  const SUPPLIERS_PER_PAGE = 8;
  const LOADING_DELAY = 1000;

  // Calculate pagination
  const totalSuppliers = allSuppliers.length;
  const totalPages = Math.ceil(totalSuppliers / SUPPLIERS_PER_PAGE);
  const hasMoreSuppliers = currentPage < totalPages;

  // Initialize displayed suppliers when allSuppliers changes
  useEffect(() => {
    if (allSuppliers.length > 0) {
      setDisplayedSuppliers(allSuppliers.slice(0, SUPPLIERS_PER_PAGE));
      setCurrentPage(1);
    } else {
      setDisplayedSuppliers([]);
      setCurrentPage(1);
    }
  }, [allSuppliers]);

  // Load more functionality
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay to show skeleton
    await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
    
    const nextPage = currentPage + 1;
    const newSuppliers = allSuppliers.slice(0, nextPage * SUPPLIERS_PER_PAGE);
    
    setDisplayedSuppliers(newSuppliers);
    setCurrentPage(nextPage);
    setIsLoadingMore(false);
  };

// Updated SupplierCard component with title ACTUALLY below image
const SupplierCard = ({ supplier }) => {
  const isSupplierFavorite = isFavorite(supplier.id)
  
  // Get supplier themes with config
  const supplierThemes = (supplier.themes || []).map(themeId => ({
    id: themeId,
    ...themeConfig[themeId]
  })).filter(theme => theme.name);

  // Determine how many themes to show
  const maxVisibleThemes = 3;
  const visibleThemes = supplierThemes.slice(0, maxVisibleThemes);
  const remainingCount = Math.max(0, supplierThemes.length - maxVisibleThemes);

  return (
    <Card className="overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative cursor-pointer group hover:shadow-2xl">
      <CardContent 
        onClick={(e) => {
          e.stopPropagation();
          onSupplierClick?.(supplier.id);
        }} 
        className="p-0 relative"
      >
        {/* Image section - NO supplier name here */}
        <div className="relative w-full h-48">
          <div className="absolute inset-0">
            <img 
              src={supplier?.image || "/placeholder.png"} 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.svg";
              }}
              alt={supplier.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Light gradient for badges only */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

          {/* Top badges only */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
            <div className="flex items-center gap-2">
              {/* Category Badge */}
              <Badge className="bg-[hsl(var(--primary-600))] text-white shadow-lg backdrop-blur-sm text-xs">
                {supplier.category}
              </Badge>
              
              {/* Availability Badge */}
              {supplier.availability && (
                <Badge className="bg-green-500 text-white shadow-lg backdrop-blur-sm text-xs">
                  {supplier.availability}
                </Badge>
              )}
            </div>
            
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(supplier);
              }}
              className="w-8 h-8 bg-white/95 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
            >
              <Heart
                className={`w-4 h-4 ${
                  isSupplierFavorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            </button>
          </div>

          {/* Price badge in bottom right corner only */}
          <div className="absolute bottom-3 right-3 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/50">
              <div className="text-right">
                <span className="text-lg font-black text-gray-900">£{supplier.priceFrom}</span>
                <div className="text-xs text-gray-600">{supplier.priceUnit}</div>
              </div>
            </div>
          </div>

          {/* REMOVED: Bottom overlay with supplier name - this was the problem! */}
        </div>

        {/* Content section below image - supplier name goes HERE */}
        <div className="p-4 bg-white">
          {/* Supplier Name - THE MAIN TITLE - BELOW THE IMAGE */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {supplier.name}
          </h3>

          {/* Rating and Location Row */}
          <div className={`flex items-center justify-between ${supplierThemes.length > 0 || supplier.bookingCount ? 'mb-3' : 'mb-4'}`}>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900 text-sm">{supplier.rating}</span>
              <span className="text-xs text-gray-600">({supplier.reviewCount})</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm truncate">{supplier.location}</span>
            </div>
          </div>

          {/* Theme Badges Section - only show if themes exist */}
          {supplierThemes.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Available Themes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visibleThemes.map((theme) => {
                  const isHighlighted = selectedThemes.includes(theme.id);
                  return (
                    <div
                      key={theme.id}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                        isHighlighted 
                          ? 'bg-primary-100 text-primary-800 border border-primary-300 shadow-sm' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className={`w-3 h-3 ${theme.color} rounded-full flex items-center justify-center text-white text-[10px]`}>
                        {typeof theme.icon === 'string' ? theme.icon : theme.icon}
                      </div>
                      <span>{theme.name}</span>
                    </div>
                  );
                })}
                
                {remainingCount > 0 && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{remainingCount} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking Count if available */}
          {supplier.bookingCount && (
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{supplier.bookingCount} bookings</span>
              </div>
            </div>
          )}

          {/* Action Button - no conditional margin needed now */}
          <Button 
            className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onSupplierClick?.(supplier.id);
            }}
            size="lg"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
// Updated skeleton with title below image
const SkeletonSupplierCard = () => (
  <Card className="overflow-hidden rounded-2xl border-2 border-white shadow-xl">
    <CardContent className="p-0 relative">
      <div className="relative w-full h-48">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="absolute bottom-3 right-3 z-10">
          <Skeleton className="h-12 w-16 rounded-lg" />
        </div>
      </div>
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mb-4">
          <Skeleton className="h-3 w-24 mb-2" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </CardContent>
  </Card>
);


  // Handle empty state
  if (!isInitialLoading && totalSuppliers === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No suppliers found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <>
     
      {/* Supplier Cards Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {isInitialLoading ? (
            // Initial loading skeletons
            Array.from({ length: SUPPLIERS_PER_PAGE }).map((_, index) => (
              <SkeletonSupplierCard key={`skeleton-initial-${index}`} />
            ))
          ) : (
            <>
              {/* Actual supplier cards */}
              {displayedSuppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
              
              {/* Loading more skeletons */}
              {isLoadingMore && (
                Array.from({ 
                  length: Math.min(SUPPLIERS_PER_PAGE, totalSuppliers - displayedSuppliers.length) 
                }).map((_, index) => (
                  <SkeletonSupplierCard key={`skeleton-loading-${index}`} />
                ))
              )}
            </>
          )}
        </div>

        {/* Load More Button */}
        {!isInitialLoading && hasMoreSuppliers && (
          <div className="text-center mt-8">
           <Button
  variant="outline"
  className="border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 min-w-[220px] flex items-center justify-center space-x-2 mx-auto py-8"
  onClick={handleLoadMore}
  disabled={isLoadingMore}
>
  {isLoadingMore ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Snappy’s on it...</span>
    </>
  ) : (
    <>
      <Image
        src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753217700/h4j3wqioc81ybvri0wgy.png"
        alt="Snappy icon"
        width={60}
        height={60}
        className="inline-block"
      />
      <span className="text-black">Load More Fun!</span>
      {/* <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
        +{Math.min(SUPPLIERS_PER_PAGE, totalSuppliers - displayedSuppliers.length)}
      </span> */}
    </>
  )}
</Button>

            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(displayedSuppliers.length / totalSuppliers) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {displayedSuppliers.length} of {totalSuppliers} suppliers loaded
              </p>
            </div>
          </div>
        )}

        {/* All loaded message */}
        {!isInitialLoading && !hasMoreSuppliers && displayedSuppliers.length > SUPPLIERS_PER_PAGE && (
          <div className="text-center mt-8 py-6">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full">
              <Star className="w-4 h-4 mr-2" />
              All suppliers loaded! Found {totalSuppliers} perfect matches.
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LoadMoreSuppliersSection;