export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fef7f7] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading suppliers...</p>
      </div>
    </div>
  )
}