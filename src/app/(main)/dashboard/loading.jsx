import SnappyLoader from "@/components/ui/SnappyLoader"

export default function DashboardLoading() {
  return (
      <div className="min-h-screen bg-white flex items-center justify-center">
           <SnappyLoader text="Loading your party..." />
         </div>
  )
}