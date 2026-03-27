export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      {/* Skeleton header area */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 mx-4 sm:mx-6 lg:mx-8 mt-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Skeleton supplier grid */}
      <div className="container min-w-screen px-4 sm:px-6 lg:px-8 pb-8">
        <div className="hidden md:grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border-2 border-white shadow-xl h-80">
              <div className="relative h-64 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              <div className="p-6 bg-white">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm h-64">
              <div className="relative h-44 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              <div className="p-4 bg-white">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
