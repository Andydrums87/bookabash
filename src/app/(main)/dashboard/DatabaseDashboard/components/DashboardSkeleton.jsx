import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-primary-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="hidden md:flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Main Content Area - 2 columns */}
          <main className="lg:col-span-2 space-y-6">
            {/* Supplier Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 w-36 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>

          {/* Sidebar - 1 column */}
          <aside className="hidden lg:block space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-6">
                <div className="h-12 w-full bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Countdown Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-12 w-12 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 w-28 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-6 h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}