"use client"

import { useRouter } from "next/navigation"
import { Users, Eye, Calendar, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function RSVPSummaryCard({ partyId, partyDetails }) {
  const router = useRouter()

  const handleViewRSVPs = () => {
    router.push(`/rsvps/${partyId}/`)  // This should match your file structure
  }

  return (
    <Card className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={handleViewRSVPs}>
      {/* Hero Image Section */}
      <div className="relative h-55 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
        {/* Background Image */}
        <img 
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/okpcftsuni04yokhex1l.jpg"
          alt="Party RSVPs"
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
        
        {/* Top Label */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 text-gray-800 font-semibold px-4 py-2">
            Party RSVPs
          </Badge>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-500 text-white border-0 font-semibold px-4 py-2">
            Ready
          </Badge>
        </div>

        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 group-hover:bg-white/30 transition-colors duration-300">
            <Users className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
            Manage RSVPs 🎉
          </h2>
          <p className="text-gray-600 text-sm">
            View and manage all your party responses
          </p>
        </div>

        {/* Features List */}
        {/* <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Track guest responses</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>View dietary requirements</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span>Export guest list</span>
          </div>
        </div> */}

        {/* Action Button */}
        <Button 
          onClick={handleViewRSVPs}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl font-semibold py-3 text-sm group-hover:shadow-lg transition-all duration-300"
        >
          <Eye className="w-5 h-5 mr-2" />
          Manage RSVPs
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </CardContent>
    </Card>
  )
}