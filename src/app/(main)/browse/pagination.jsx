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
  Loader2 
} from "lucide-react"

// Updated component to work with your backend
const LoadMoreSuppliersSection = ({ 
  allSuppliers, // This comes from your filteredSuppliers 
  isInitialLoading, // This comes from your existing loading state
  onSupplierClick, // Your existing click handler
  favorites,
  toggleFavorite
}) => {
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

  // Skeleton card component
  const SkeletonSupplierCard = () => (
    <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-lg">
      <CardContent className="p-0 relative">
        <div className="relative w-full h-48 md:h-40 lg:h-48">
          <Skeleton className="w-full h-full" />
          <div className="absolute top-3 left-3">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="absolute top-3 right-3">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="absolute bottom-3 left-3">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="pt-4 px-3 pb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center space-x-1 mb-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <div className="flex flex-wrap gap-1 mb-4">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-24 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Supplier card component
  const SupplierCard = ({ supplier }) => (
    <Card className="border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow p-0">
      <CardContent className="p-0 relative">
        <div className=" w-full h-48 md:h-40 lg:h-48">
          <img 
            src={supplier?.image || "/placeholder.svg"} 
            alt={supplier.name} 
            className="w-full h-full object-cover"
          />

          <button
            onClick={() => toggleFavorite(supplier.id)}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                favorites.includes(supplier.id) ? "fill-orange-400 text-primary-500" : "text-gray-400"
              }`}
            />
          </button>

          <div className="absolute top-3 left-3">
            <Badge className="bg-primary-200 text-primary-950 text-xs">{supplier.availability}</Badge>
          </div>

          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300">
              {supplier.category}
            </Badge>
          </div>
        </div>

        <div className="pt-4 px-3 pb-4">
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{supplier.rating}</span>
              <span className="text-xs text-gray-600">({supplier.reviewCount})</span>
            </div>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-600">{supplier.bookingCount} bookings</span>
          </div>

          <div className="flex items-center space-x-1 mb-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 truncate">{supplier.location}</span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{supplier.name}</h3>

          <div className="flex flex-wrap gap-1 mb-4">
            {supplier.badges.slice(0, 2).map((badge, index) => (
              <Badge key={index} variant="outline" className="text-xs text-primary-500 border-primary-500">
                {badge}
              </Badge>
            ))}
            {supplier.badges.length > 2 && (
              <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                +{supplier.badges.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">from £{supplier.priceFrom}</div>
              <div className="text-sm text-gray-600">{supplier.priceUnit}</div>
            </div>
            <button 
              className="bg-primary-500 hover:bg-primary-600 text-white text-xs px-4 py-2 rounded transition-colors"
              onClick={() => onSupplierClick(supplier.id)}
            >
              View Details
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Results Count */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        {isInitialLoading ? (
          <Skeleton className="h-6 w-64" />
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              {totalSuppliers} services available to book now
            </h2>
            <div className="text-sm text-gray-600">
              Showing {displayedSuppliers.length} of {totalSuppliers}
            </div>
          </div>
        )}
      </div>

      {/* Supplier Cards Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {isInitialLoading ? (
            Array.from({ length: SUPPLIERS_PER_PAGE }).map((_, index) => (
              <SkeletonSupplierCard key={`skeleton-initial-${index}`} />
            ))
          ) : (
            <>
              {displayedSuppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
              
              {isLoadingMore && (
                Array.from({ length: Math.min(SUPPLIERS_PER_PAGE, totalSuppliers - displayedSuppliers.length) }).map((_, index) => (
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
              className="border-gray-200 text-gray-700 hover:bg-gray-50 min-w-[200px]"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading More...
                </>
              ) : (
                <>
                  Load More Suppliers
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    +{Math.min(SUPPLIERS_PER_PAGE, totalSuppliers - displayedSuppliers.length)}
                  </span>
                </>
              )}
            </Button>
            
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