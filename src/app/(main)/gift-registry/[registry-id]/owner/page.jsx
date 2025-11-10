"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Gift, CheckCircle, Circle, Eye, Share2, ArrowLeft, Users, Package } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import Link from "next/link"

// Helper function to shorten long product names
function getShortName(fullName) {
  let shortName = fullName
    .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content
    .replace(/\s*,.*$/, '') // Remove everything after first comma
    .replace(/\s+for (ages?|kids|children|boys?|girls?).*$/i, '') // Remove age recommendations
    .replace(/\s+(toy|gift|set|pack|bundle|kit)(\s|$)/gi, ' ') // Remove generic descriptors
    .replace(/\s+with\s+.*$/i, '') // Remove "with..." details
    .trim()

  // If still too long (over 60 chars for owner view), truncate
  if (shortName.length > 60) {
    const words = shortName.split(' ')
    shortName = words.slice(0, 6).join(' ')
    if (words.length > 6) shortName += '...'
  }

  return shortName
}

export default function OwnerDashboard() {
  const params = useParams()
  const router = useRouter()
  const registryId = params["registry-id"]

  const [registryData, setRegistryData] = useState(null)
  const [registryItems, setRegistryItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Load registry data
  useEffect(() => {
    const loadRegistryData = async () => {
      try {
        const result = await partyDatabaseBackend.getRegistryById(registryId)

        if (result.success && result.registry) {
          setRegistryData(result.registry)
          setRegistryItems(result.items || [])
        } else {
          console.error("Failed to load registry:", result.error)
        }
      } catch (error) {
        console.error("Error loading registry:", error)
      } finally {
        setLoading(false)
      }
    }

    if (registryId) {
      loadRegistryData()
    }
  }, [registryId])

  // Calculate stats
  const totalItems = registryItems.length
  const claimedItems = registryItems.filter(item => item.is_claimed).length
  const availableItems = totalItems - claimedItems

  const partyDetails = registryData?.parties

  const handleShareRegistry = () => {
    const shareUrl = `${window.location.origin}/gift-registry/${registryId}/preview`
    if (navigator.share) {
      navigator.share({
        title: `${partyDetails?.child_name || 'Birthday'} Party Gift Registry`,
        text: 'Check out my party gift registry!',
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Registry link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your registry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ContextualBreadcrumb currentPage="Manage Registry" id={registryId} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {partyDetails?.child_name || 'Your'} Gift Registry
              </h1>
              <p className="text-gray-600">
                Track which gifts your guests have claimed
              </p>
            </div>
            <Button
              onClick={() => router.push(`/gift-registry/${registryId}/create`)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Add Items
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                    <p className="text-sm text-gray-600">Total Gifts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{claimedItems}</p>
                    <p className="text-sm text-gray-600">Claimed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Circle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{availableItems}</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleShareRegistry}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Registry with Guests
            </Button>
            <Button
              onClick={() => router.push(`/gift-registry/${registryId}/preview`)}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Guest View
            </Button>
          </div>
        </div>
      </div>

      {/* Registry Items List */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Registry Items</h2>
          <p className="text-gray-600">
            {claimedItems > 0
              ? `${claimedItems} of ${totalItems} gifts have been claimed by your guests`
              : "No gifts have been claimed yet"}
          </p>
        </div>

        {totalItems === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items in your registry yet</h3>
              <p className="text-gray-500 mb-6">
                Start adding gifts to help your guests know what to bring!
              </p>
              <Button
                onClick={() => router.push(`/gift-registry/${registryId}/create`)}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Gift className="w-4 h-4 mr-2" />
                Add Your First Gift
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {registryItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.external_image_url ? (
                        <img
                          src={item.external_image_url}
                          alt={item.custom_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gift className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {getShortName(item.custom_name || "Unnamed Item")}
                          </h3>
                          <p className="text-lg font-bold text-primary-600">
                            {item.custom_price || "Price not set"}
                          </p>
                        </div>
                        <Badge
                          className={
                            item.is_claimed
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {item.is_claimed ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Claimed
                            </>
                          ) : (
                            <>
                              <Circle className="w-3 h-3 mr-1" />
                              Available
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Claimed by info */}
                      {item.is_claimed && item.claimed_by && (
                        <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 border border-green-100">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">
                            {item.claimed_by} will bring this gift
                          </span>
                        </div>
                      )}

                      {/* Description if available */}
                      {item.custom_description && !item.is_claimed && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {item.custom_description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
