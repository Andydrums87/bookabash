import React from 'react';

// Base Skeleton Component
const Skeleton = ({ className = "", width, height, rounded = false }) => (
  <div 
    className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    style={{ width, height }}
  />
);

// Dashboard Header Skeleton
export const DashboardHeaderSkeleton = () => (
  <div className="p-3 sm:p-4 lg:p-6">
    <div className="space-y-2 sm:space-y-3">
      <Skeleton className="h-8 sm:h-10 lg:h-12 w-64 sm:w-80" />
      <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
    </div>
  </div>
);

// Enquiry Table Skeleton
export const EnquiryTableSkeleton = () => (
  <div className="space-y-4">
    {/* Desktop Table Header */}
    <div className="hidden lg:block">
      <div className="bg-muted/20 border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      
      {/* Table Headers */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-5 gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      {/* Table Rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border-b border-gray-100 p-4">
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Mobile Cards */}
    <div className="lg:hidden space-y-3">
      <div className="p-4 bg-muted/20 border-b border-gray-200">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 space-y-3 border-b border-gray-100">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded" />
            <Skeleton className="h-10 w-32 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Calendar Skeleton
export const CalendarSkeleton = () => (
  <div className="p-4 sm:p-6">
    {/* Calendar Header */}
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>

    {/* Day headers */}
    <div className="grid grid-cols-7 gap-1 mb-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>

    {/* Calendar days */}
    <div className="grid grid-cols-7 gap-1">
      {[...Array(35)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded" />
      ))}
    </div>
  </div>
);

// Action Buttons Skeleton
export const ActionButtonsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="h-10 sm:h-12 lg:h-14 rounded" />
    ))}
  </div>
);

// Stats Cards Skeleton
export const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-3 sm:p-4 text-center border rounded shadow-sm bg-white">
        <Skeleton className="h-6 sm:h-8 w-12 mx-auto mb-2" />
        <Skeleton className="h-3 sm:h-4 w-20 mx-auto" />
      </div>
    ))}
  </div>
);

// Business Switcher Skeleton
export const BusinessSwitcherSkeleton = () => (
  <div className="flex items-center gap-3 py-2 px-4 bg-white rounded-full shadow-sm">
    <div className="flex-1 min-w-0">
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-3 w-3 rounded-full" />
    <Skeleton className="h-8 w-8 rounded" />
  </div>
);

// Complete Dashboard Skeleton - neutral white background
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-white">
    {/* Header skeleton */}
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Skeleton className="h-7 w-28" />
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Usage Example
export default function SkeletonDemo() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Skeleton Components Demo</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Complete Dashboard</h2>
          <div className="border rounded-lg overflow-hidden">
            <DashboardSkeleton />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Individual Components</h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Business Switcher</h3>
              <BusinessSwitcherSkeleton />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Action Buttons</h3>
              <ActionButtonsSkeleton />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Stats Cards</h3>
              <StatsCardsSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}