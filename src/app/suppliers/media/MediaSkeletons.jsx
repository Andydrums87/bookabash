import React from 'react';

// Base Skeleton Component
const Skeleton = ({ className = "", width, height, rounded = false }) => (
  <div 
    className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    style={{ width, height }}
  />
);

// Media Header Skeleton
export const MediaHeaderSkeleton = () => (
  <div className="p-4 sm:p-6">
    {/* Business Context Alert Skeleton */}
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-4 w-4 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>

    {/* Title and Description */}
    <div className="flex flex-col gap-2 sm:gap-3">
      <Skeleton className="h-8 sm:h-10 lg:h-12 w-48 sm:w-64" />
      <Skeleton className="h-4 sm:h-5 w-full max-w-lg" />
    </div>
  </div>
);

// Logo Section Skeleton
export const LogoSectionSkeleton = () => (
  <div className="p-4 sm:p-6 pt-0">
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {/* Card Header */}
      <div className="mb-4 sm:mb-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Logo Content */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar and Controls */}
        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl" />
          
          {/* Control Buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>

        {/* Guidelines */}
        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2 pl-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-3 w-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Photo Gallery Skeleton
export const PhotoGallerySkeleton = () => (
  <div className="p-4 sm:p-6 pt-0">
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {/* Card Header */}
      <div className="mb-4 sm:mb-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {/* Existing Photos */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="relative group">
            <Skeleton className="aspect-square rounded-lg" />
            {/* Control buttons skeleton */}
            <div className="absolute top-2 right-2 flex gap-1">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            {/* Info overlay skeleton */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black bg-opacity-70 rounded px-2 py-1">
                <Skeleton className="h-3 w-full bg-gray-400" />
              </div>
            </div>
          </div>
        ))}

        {/* Add Photo Button */}
        <div className="aspect-square">
          <div className="border-2 border-dashed border-gray-300 rounded-lg w-full h-full flex flex-col items-center justify-center">
            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-3 w-full" style={{ width: `${Math.random() * 30 + 70}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Video Links Skeleton
export const VideoLinksSkeleton = () => (
  <div className="p-4 sm:p-6 pt-0">
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {/* Card Header */}
      <div className="mb-4 sm:mb-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {/* Existing Videos */}
      <div className="space-y-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 border rounded-lg">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 w-full space-y-2">
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>

      {/* Add Video Form */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
        <div className="flex-1 pt-3">
          <Skeleton className="h-10 w-full rounded" />
        </div>
        <div className="pt-3">
          <Skeleton className="h-10 w-full sm:w-24 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// Complete Media Page Skeleton
export const MediaPageSkeleton = () => (
  <div className="min-h-screen bg-primary-50">
    <div className="max-w-7xl mx-auto">
      {/* Success Alert Skeleton */}
      <div className="p-4 sm:p-6">
        <div className="border border-green-200 bg-green-50 rounded-lg p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
      </div>

      {/* Global Save Button */}
      <div className="absolute right-10">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Header */}
      <MediaHeaderSkeleton />

      {/* Logo Section */}
      <LogoSectionSkeleton />

      {/* Photo Gallery Section */}
      <PhotoGallerySkeleton />

      {/* Video Links Section */}
      <VideoLinksSkeleton />
    </div>
  </div>
);

// Empty State Variations
export const EmptyPhotoGallerySkeleton = () => (
  <div className="p-4 sm:p-6 pt-0">
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {/* Card Header */}
      <div className="mb-4 sm:mb-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Empty State */}
      <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <Skeleton className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded mb-4" />
        <Skeleton className="h-6 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto mb-4" />
        <Skeleton className="h-10 w-40 mx-auto rounded" />
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-3 w-full" style={{ width: `${Math.random() * 30 + 70}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Usage Example
export default function MediaSkeletonDemo() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Media Page Skeleton Demo</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Complete Media Page</h2>
          <div className="border rounded-lg overflow-hidden">
            <MediaPageSkeleton />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Individual Components</h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Logo Section</h3>
              <LogoSectionSkeleton />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Photo Gallery (with photos)</h3>
              <PhotoGallerySkeleton />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Photo Gallery (empty)</h3>
              <EmptyPhotoGallerySkeleton />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Video Links</h3>
              <VideoLinksSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}