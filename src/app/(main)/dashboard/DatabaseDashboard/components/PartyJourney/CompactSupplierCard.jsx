// components/PartyJourney/CompactSupplierCard.jsx
import { Card } from '@/components/ui/card'
import { CheckCircle, Clock, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useState } from 'react'

export function CompactSupplierCard({ 
  type, 
  supplier, 
  enquiryStatus,
  onAddSupplier,
  onRemoveSupplier,
  onViewDetails,
  getSupplierDisplayName,
  isLoading
}) {
  const [showActions, setShowActions] = useState(false)

  // Empty supplier slot
  if (!supplier) {
    return (
      <Card 
        className="min-w-[200px] h-[240px] border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer group"
        onClick={() => onAddSupplier(type)}
      >
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-700 group-hover:text-primary-900 mb-1">
            {getSupplierDisplayName(type)}
          </h3>
          <p className="text-xs text-gray-500 group-hover:text-primary-700">
            Click to add
          </p>
        </div>
      </Card>
    )
  }

  // Existing supplier
  const statusConfig = {
    'accepted': {
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      badge: 'Confirmed',
      badgeClass: 'bg-green-100 text-green-700'
    },
    'pending': {
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      badge: 'Pending',
      badgeClass: 'bg-orange-100 text-orange-700'
    },
    'declined': {
      icon: <X className="w-5 h-5 text-red-500" />,
      badge: 'Declined',
      badgeClass: 'bg-red-100 text-red-700'
    }
  }

  const status = statusConfig[enquiryStatus] || statusConfig['pending']

  return (
    <Card 
      className="min-w-[200px] h-[240px] overflow-hidden hover:shadow-lg transition-all cursor-pointer relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onViewDetails(supplier.id)}
    >
      {/* Status Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.badgeClass} flex items-center gap-1`}>
          {status.icon}
          <span className="hidden sm:inline">{status.badge}</span>
        </div>
      </div>

      {/* Supplier Image */}
      <div className="relative h-32 w-full">
        {supplier.images?.[0] ? (
          <Image 
            src={supplier.images[0]} 
            alt={supplier.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        
        {/* Hover Actions Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-all">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails(supplier.id)
              }}
            >
              View
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveSupplier(type)
              }}
            >
              Remove
            </Button>
          </div>
        )}
      </div>

      {/* Supplier Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">
          {supplier.name}
        </h3>
        <p className="text-xs text-gray-500 capitalize truncate">
          {getSupplierDisplayName(type)}
        </p>
        {supplier.packageData?.price && (
          <p className="text-sm font-bold text-primary-600 mt-2">
            £{supplier.packageData.price}
          </p>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      )}
    </Card>
  )
}