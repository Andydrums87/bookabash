import SnappyLoader from "@/components/ui/SnappyLoader"

export default function DashboardLoading() {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
           <SnappyLoader text="Loading your party..." />
         </div>
  )
}