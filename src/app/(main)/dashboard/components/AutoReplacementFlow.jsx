import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react'

export default function AutoReplacementFlow({ 
  replacements = [],
  onApproveReplacement,
  onViewSupplier 
}) {
  const [expandedReplacement, setExpandedReplacement] = useState(null)

  const getReplacementReason = (reason) => {
    const reasons = {
      'better_reviews': {
        icon: <Star className="w-4 h-4 text-yellow-500" />,
        text: 'Better reviews',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
      },
      'same_price': {
        icon: <Shield className="w-4 h-4 text-green-500" />,
        text: 'Same price',
        color: 'text-green-700 bg-green-50 border-green-200'
      },
      'faster_response': {
        icon: <Clock className="w-4 h-4 text-blue-500" />,
        text: 'Faster confirmation',
        color: 'text-blue-700 bg-blue-50 border-blue-200'
      },
      'premium_upgrade': {
        icon: <TrendingUp className="w-4 h-4 text-purple-500" />,
        text: 'Premium upgrade',
        color: 'text-purple-700 bg-purple-50 border-purple-200'
      },
      'availability': {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        text: 'Available for your date',
        color: 'text-green-700 bg-green-50 border-green-200'
      }
    }
    return reasons[reason] || reasons.availability
  }

  if (replacements.length === 0) return null

  return (
    <div className="space-y-4">
      {replacements.map((replacement) => {
        const reasonInfo = getReplacementReason(replacement.reason)
        const isExpanded = expandedReplacement === replacement.id
        
        return (
          <Card key={replacement.id} className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {replacement.category} Supplier Replaced
                    </h4>
                    <p className="text-sm text-gray-600">
                      {replacement.oldSupplier.name} was unavailable
                    </p>
                  </div>
                </div>
                <Badge className={`${reasonInfo.color} border`}>
                  {reasonInfo.icon}
                  <span className="ml-1">{reasonInfo.text}</span>
                </Badge>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Old Supplier */}
                <div className="p-3 bg-gray-100 rounded-lg opacity-75">
                  <div className="flex items-center space-x-3 mb-2">
                    <img 
                      src={replacement.oldSupplier.image} 
                      alt={replacement.oldSupplier.name}
                      className="w-12 h-12 rounded-lg object-cover grayscale"
                    />
                    <div>
                      <h5 className="font-medium text-gray-700 line-through">
                        {replacement.oldSupplier.name}
                      </h5>
                      <p className="text-sm text-gray-500">
                        £{replacement.oldSupplier.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Star className="w-3 h-3" />
                    <span>{replacement.oldSupplier.rating}</span>
                    <span>•</span>
                    <span>Declined</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-orange-500" />
                </div>

                {/* New Supplier */}
                <div className="p-3 bg-white rounded-lg border-2 border-green-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <img 
                      src={replacement.newSupplier.image} 
                      alt={replacement.newSupplier.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {replacement.newSupplier.name}
                      </h5>
                      <p className="text-sm text-green-600 font-semibold">
                        £{replacement.newSupplier.price}
                        {replacement.newSupplier.price < replacement.oldSupplier.price && (
                          <span className="text-xs ml-1">(-£{replacement.oldSupplier.price - replacement.newSupplier.price})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-green-600">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{replacement.newSupplier.rating}</span>
                    <span>•</span>
                    <span>{replacement.newSupplier.reviewCount} reviews</span>
                  </div>
                </div>
              </div>

              {/* Improvement highlights */}
              <div className="mb-4">
                <h6 className="text-sm font-medium text-gray-700 mb-2">Why this is better:</h6>
                <div className="grid grid-cols-2 gap-2">
                  {replacement.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable details */}
              {isExpanded && (
                <div className="border-t pt-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">About {replacement.newSupplier.name}</h6>
                      <p className="text-sm text-gray-600 mb-2">
                        {replacement.newSupplier.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {replacement.newSupplier.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">Package Details</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {replacement.newSupplier.packageDetails?.map((detail, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedReplacement(isExpanded ? null : replacement.id)}
                >
                  {isExpanded ? 'Show Less' : 'View Details'}
                </Button>
                
                <div className="flex space-x-2">
                  {replacement.status === 'pending_approval' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewSupplier(replacement.newSupplier.id)}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onApproveReplacement(replacement.id)}
                      >
                        Approve Replacement
                      </Button>
                    </>
                  )}
                  
                  {replacement.status === 'approved' && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Example replacement data structure
export const exampleReplacements = [
  {
    id: 'replacement-1',
    category: 'Entertainment',
    status: 'pending_approval', // 'pending_approval', 'approved', 'auto_approved'
    reason: 'better_reviews',
    oldSupplier: {
      id: 'old-1',
      name: 'Party Clowns Ltd',
      price: 150,
      rating: 4.2,
      image: '/placeholder-supplier.jpg'
    },
    newSupplier: {
      id: 'new-1', 
      name: 'Magic Mike Entertainment',
      price: 145,
      rating: 4.8,
      reviewCount: 127,
      image: '/placeholder-supplier-2.jpg',
      description: 'Professional children\'s entertainer specializing in superhero themed shows with magic, games, and interactive storytelling.',
      tags: ['Superhero Shows', 'Magic', 'Interactive', 'Award Winner'],
      packageDetails: [
        '90-minute superhero show',
        'Interactive magic tricks',
        'Hero training activities', 
        'Photo opportunities',
        'Party games & prizes'
      ]
    },
    improvements: [
      'Higher customer rating (4.8 vs 4.2)',
      '£5 cheaper than original',
      'More superhero experience',
      'Award-winning entertainer'
    ],
    autoApproved: false // Whether this needs manual approval
  }
]