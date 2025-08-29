export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <img 
          className="w-24 h-24 mx-auto" 
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1756483498/snappy-loader-v3_g7n2tw.webp" 
          alt="Loading..." 
        />
   
        <p className="text-gray-600 mt-2">Preparing your party plan</p>
      </div>
    </div>
  )
}