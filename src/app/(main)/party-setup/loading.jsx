export default function PartySetupLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl pb-24">

        {/* Skeleton progress indicator */}
        <div className="mb-8 flex justify-center gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-16 h-0.5 bg-gray-200" />
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        </div>

        {/* Skeleton header */}
        <div className="text-center mb-6">
          <div className="h-8 w-72 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
          <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
              <div className="h-48 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
