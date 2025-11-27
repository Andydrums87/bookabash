import React from 'react';

// Base Skeleton Component
const Skeleton = ({ className = "", width, height, rounded = false }) => (
  <div 
    className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    style={{ width, height }}
  />
);

// Profile Header Skeleton
export const ProfileHeaderSkeleton = () => (
  <div className="p-4 sm:p-6">
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 sm:h-10 lg:h-12 w-64 sm:w-80" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 sm:h-5 w-full max-w-lg" />
          
          {/* Welcome alert skeleton */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Save button skeleton */}
        <div className="absolute top-1 right-10">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// Cover Photo Skeleton
export const CoverPhotoSkeleton = () => (
  <div className="w-full lg:w-2/5 mr-19">
    <div className="relative">
      <Skeleton className="h-[400px] w-full md:w-[800px] rounded-lg" />
      {/* Upload button skeleton */}
      <div className="absolute bottom-5 left-[35%]">
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

// Form Fields Skeleton
export const ProfileFormSkeleton = () => (
  <div className="w-full lg:w-3/5 space-y-4 sm:space-y-6">
    {/* Business Name Field */}
    <div className="space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>

    {/* Contact Person Field */}
    <div className="space-y-2">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>

    {/* Business Description Field */}
    <div className="space-y-2">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-3 w-64" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  </div>
);

// Service Details Section Skeleton
export const ServiceDetailsSkeleton = () => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
    {/* Section Header */}
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-96" />
    </div>

    {/* Service Details Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>

    {/* Additional sections */}
    <div className="space-y-4">
      <Skeleton className="h-5 w-40" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Verification Documents Skeleton
export const VerificationDocumentsSkeleton = () => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-96" />
    </div>

    {/* Document List */}
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Complete Profile Page Skeleton
export const ProfilePageSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Main Form */}
        <div className="flex-1 space-y-6">
          {/* Cover Photo */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>

          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:w-80 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Usage Example
export default function ProfileSkeletonDemo() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Profile Page Skeleton Demo</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Complete Profile Page</h2>
          <div className="border rounded-lg overflow-hidden">
            <ProfilePageSkeleton />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Individual Components</h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Cover Photo Section</h3>
              <CoverPhotoSkeleton />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Form Fields</h3>
              <ProfileFormSkeleton />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Verification Documents</h3>
              <VerificationDocumentsSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}