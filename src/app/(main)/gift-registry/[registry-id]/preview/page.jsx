"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Gift,
  Heart,
  Star,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Calendar,
  MapPin,
  User,
  ShoppingCart,
  Info,
  Filter,
  Grid3X3,
  List,
  Search,
  SlidersHorizontal,
  Sparkles,
  PartyPopper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import ProductDetailModal from "../components/ProductDetailModal"

export default function GiftRegistryPreview() {
  const params = useParams()
  const registryId = params["registry-id"]

  // State
  const [registryData, setRegistryData] = useState(null)
  const [registryItems, setRegistryItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestName] = useState("")
  const [claimingItem, setClaimingItem] = useState(null)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)

  // Filter and view state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("priority")
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState([0, 500])

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Load registry data
  useEffect(() => {
    const loadRegistryData = async () => {
      try {
        console.log("Loading registry:", registryId)
        const result = await partyDatabaseBackend.getRegistryById(registryId)
        if (result.success && result.registry) {
          setRegistryData(result.registry)
          setRegistryItems(result.items || [])
          setFilteredItems(result.items || [])
          setShareUrl(window.location.href)
          console.log("Registry loaded:", result.registry)
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

  // Filter and sort items
  useEffect(() => {
    let filtered = [...registryItems]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) => getItemName(item).toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Status filter
    if (statusFilter === "available") {
      filtered = filtered.filter((item) => !item.is_claimed)
    } else if (statusFilter === "claimed") {
      filtered = filtered.filter((item) => item.is_claimed)
    }

    // Price filter
    filtered = filtered.filter((item) => {
      const price = Number.parseFloat(item.gift_items?.price || item.custom_price?.replace(/[£$]/, "") || 0)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority?.toLowerCase()] || 0) - (priorityOrder[a.priority?.toLowerCase()] || 0)
        case "name":
          return getItemName(a).localeCompare(getItemName(b))
        case "price":
          const priceA = Number.parseFloat(a.gift_items?.price || a.custom_price?.replace(/[£$]/, "") || 0)
          const priceB = Number.parseFloat(b.gift_items?.price || b.custom_price?.replace(/[£$]/, "") || 0)
          return priceB - priceA
        case "availability":
          return a.is_claimed - b.is_claimed
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }, [registryItems, searchQuery, statusFilter, sortBy, priceRange])

  // Modal handlers
  const handleViewDetails = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
  }

  // Claim item
  const handleClaimItem = async (item) => {
    if (!guestName.trim()) {
      alert("Please enter your name first")
      return
    }

    setClaimingItem(item.id)
    try {
      const result = await partyDatabaseBackend.claimRegistryItem(item.id, guestName.trim())
      if (result.success) {
        setRegistryItems((prev) =>
          prev.map((regItem) =>
            regItem.id === item.id ? { ...regItem, is_claimed: true, claimed_by: guestName.trim() } : regItem,
          ),
        )
        handleCloseModal()
      } else {
        console.error("Failed to claim item:", result.error)
        alert("Failed to claim item. Please try again.")
      }
    } catch (error) {
      console.error("Error claiming item:", error)
      alert("Failed to claim item. Please try again.")
    } finally {
      setClaimingItem(null)
    }
  }

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${registryData?.parties?.child_name}'s Gift List`,
          text: `Check out the gift list for ${registryData?.parties?.child_name}'s ${registryData?.parties?.theme} party!`,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Share failed:", error)
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Helper functions
  const getItemName = (item) => {
    return item.gift_items?.name || item.custom_name || "Unknown Item"
  }

  const getItemPrice = (item) => {
    if (item.gift_items?.price) return `£${item.gift_items.price}`
    if (item.gift_items?.price_range) return item.gift_items.price_range
    return item.custom_price || "Price varies"
  }

  const getItemImage = (item) => {
    return item.external_image_url || item.gift_items?.image_url || "/placeholder.png"
  }

  const getBuyUrl = (item) => {
    return item.external_buy_url || "#"
  }

  // Calculate stats
  const totalItems = registryItems.length
  const claimedItems = registryItems.filter((item) => item.is_claimed).length
  const availableItems = totalItems - claimedItems

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading the magical gift list... ✨</p>
        </div>
      </div>
    )
  }

  if (!registryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-20 h-20 mx-auto mb-6 text-gray-400" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Gift List Not Found 🎁</h1>
          <p className="text-gray-600 mb-6 text-lg">
            The magical gift list you're looking for seems to have disappeared!
          </p>
        </div>
      </div>
    )
  }

  const partyDetails = registryData.parties

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 text-pink-300 animate-bounce" style={{ animationDelay: "0s" }}>
          🎈
        </div>
        <div
          className="absolute top-40 right-20 w-6 h-6 text-purple-300 animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          ⭐
        </div>
        <div className="absolute top-60 left-1/4 w-7 h-7 text-blue-300 animate-bounce" style={{ animationDelay: "2s" }}>
          🎉
        </div>
        <div
          className="absolute bottom-40 right-1/3 w-6 h-6 text-yellow-300 animate-bounce"
          style={{ animationDelay: "0.5s" }}
        >
          ✨
        </div>
        <div
          className="absolute bottom-60 left-16 w-8 h-8 text-green-300 animate-bounce"
          style={{ animationDelay: "1.5s" }}
        >
          🎁
        </div>
      </div>

      {/* Magical Hero Header */}
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.3'%3E%3Cpath d='M50 15l10 20h20l-16 12 6 20-20-15-20 15 6-20-16-12h20z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Floating gift boxes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-12 h-12 text-white/30 animate-float">🎁</div>
          <div
            className="absolute top-20 right-20 w-10 h-10 text-white/30 animate-float"
            style={{ animationDelay: "1s" }}
          >
            🎈
          </div>
          <div
            className="absolute bottom-20 left-20 w-14 h-14 text-white/30 animate-float"
            style={{ animationDelay: "2s" }}
          >
            🎉
          </div>
          <div
            className="absolute bottom-10 right-10 w-8 h-8 text-white/30 animate-float"
            style={{ animationDelay: "0.5s" }}
          >
            ⭐
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-white">
            {/* Magical gift icon */}
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 rounded-full mb-8 backdrop-blur-sm relative">
              <Gift className="w-16 h-16 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
                <Sparkles className="w-6 h-6 text-yellow-800" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center animate-bounce">
                <PartyPopper className="w-5 h-5 text-pink-800" />
              </div>
            </div>

            {/* Big exciting title */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                {partyDetails?.child_name}'s
              </span>
              <br />
              <span className="text-white drop-shadow-2xl">🎁 GIFT LIST 🎁</span>
            </h1>

            {/* Exciting subtitle */}
            <div className="text-2xl md:text-3xl font-bold mb-8 text-white/90">
              <p className="mb-2">✨ The Most AMAZING {partyDetails?.theme} Party! ✨</p>
              <p className="text-xl">Help make {partyDetails?.child_name}'s dreams come true! 🌟</p>
            </div>

            {/* Party details with fun styling */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/90 mb-10">
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Calendar className="w-6 h-6" />
                <span className="font-bold text-lg">{new Date(partyDetails?.party_date).toLocaleDateString()}</span>
              </div>
              {partyDetails?.venue && (
                <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                  <MapPin className="w-6 h-6" />
                  <span className="font-bold text-lg">{partyDetails.venue}</span>
                </div>
              )}
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Gift className="w-6 h-6" />
                <span className="font-bold text-lg">{partyDetails?.theme} Theme</span>
              </div>
            </div>

            {/* Fun call to action */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30">
              <p className="text-xl font-bold mb-4">🎉 JOIN THE PARTY MAGIC! 🎉</p>
              <p className="text-lg mb-4">
                Pick a gift from {partyDetails?.child_name}'s wishlist and make their special day unforgettable!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  onClick={handleShare}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  <Share2 className="w-6 h-6 mr-3" />
                  Share This Magic! ✨
                </Button>
                <Button
                  onClick={handleCopyLink}
                  size="lg"
                  className={`${
                    copied
                      ? "bg-gradient-to-r from-green-400 to-emerald-400"
                      : "bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
                  } text-white font-bold text-lg px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200`}
                >
                  {copied ? <Check className="w-6 h-6 mr-3" /> : <Copy className="w-6 h-6 mr-3" />}
                  {copied ? "Copied! 🎉" : "Copy Link 📋"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Magical wave transition */}
        <div className="absolute bottom-0 left-0 right-0 h-16">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              fill="currentColor"
              className="text-white"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              fill="currentColor"
              className="text-white"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="currentColor"
              className="text-white"
            ></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-8">
              {/* Guest Info Card */}
              <Card className="border-4 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                  <div className="w-full h-full text-6xl">🎈</div>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-pink-800 flex items-center">
                    <User className="w-6 h-6 mr-3 text-pink-600" />🌟 Join the Celebration! 🌟
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-pink-700 mb-3">✨ Your Name ✨</label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your magical name..."
                      className="border-pink-300 focus:border-pink-500 bg-white text-lg font-medium rounded-xl h-12"
                    />
                    <p className="text-sm text-pink-600 mt-2 font-medium">🎁 Enter your name to claim amazing gifts!</p>
                  </div>
                </CardContent>
              </Card>

              {/* Registry Stats */}
              <Card className="border-4 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-purple-800 flex items-center">
                    <ShoppingCart className="w-6 h-6 mr-3 text-purple-600" />🎯 Gift List Magic 🎯
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl border-2 border-pink-300">
                      <div className="text-4xl font-black text-pink-600 mb-2">{totalItems}</div>
                      <div className="text-sm font-bold text-pink-800">🎁 Amazing Gifts</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl border-2 border-green-300">
                      <div className="text-4xl font-black text-green-600 mb-2">{claimedItems}</div>
                      <div className="text-sm font-bold text-green-800">💝 Already Claimed</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl border-2 border-blue-300">
                      <div className="text-4xl font-black text-blue-600 mb-2">{availableItems}</div>
                      <div className="text-sm font-bold text-blue-800">✨ Still Available</div>
                    </div>
                  </div>

                  {/* Magical Progress Bar */}
                  <div className="pt-4">
                    <div className="flex justify-between text-sm font-bold text-purple-700 mb-3">
                      <span>🌟 Party Progress</span>
                      <span>{totalItems > 0 ? Math.round((claimedItems / totalItems) * 100) : 0}% Complete!</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-4 border-2 border-purple-300">
                      <div
                        className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 h-full rounded-full transition-all duration-500 relative overflow-hidden"
                        style={{ width: `${totalItems > 0 ? (claimedItems / totalItems) * 100 : 0}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card className="border-4 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-blue-800 flex items-center">
                    <Filter className="w-6 h-6 mr-3 text-blue-600" />🔍 Find Perfect Gifts 🔍
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">🔎 Search Magic</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for amazing gifts..."
                        className="pl-12 border-blue-300 focus:border-blue-500 rounded-xl h-12"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">🎯 Gift Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-blue-300 focus:border-blue-500 rounded-xl h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🎁 All Gifts</SelectItem>
                        <SelectItem value="available">✨ Available</SelectItem>
                        <SelectItem value="claimed">💝 Already Claimed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-bold text-blue-700 mb-2">
                      💰 Price Range: £{priceRange[0]} - £{priceRange[1]}
                    </label>
                    <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="border-4 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Info className="w-8 h-8 text-yellow-600 mt-1 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-bold mb-3 text-lg">🎉 How the Magic Works:</p>
                      <ol className="list-decimal list-inside space-y-2 font-medium">
                        <li>✨ Enter your name above</li>
                        <li>🎁 Browse the amazing gift ideas</li>
                        <li>💝 Click "I'll bring this!" on gifts you'd like to give</li>
                        <li>🛒 Purchase the gift from the provided link</li>
                        <li>🎉 Make {partyDetails?.child_name} super happy!</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Party Description */}
            {partyDetails?.description && (
              <Card className="mb-8 border-4 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
                    <PartyPopper className="w-8 h-8 mr-3 text-indigo-600" />🎊 About This AMAZING Party! 🎊
                  </h2>
                  <p className="text-indigo-700 leading-relaxed text-lg font-medium">{partyDetails.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl border-4 border-pink-200 shadow-xl">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-black text-pink-800">🎁 GIFT IDEAS 🎁</h2>
                <Badge className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-lg px-4 py-2 font-bold">
                  {filteredItems.length} of {totalItems} gifts
                </Badge>
              </div>

              <div className="flex items-center space-x-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 border-pink-300 focus:border-pink-500 rounded-xl h-12">
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">⭐ Priority</SelectItem>
                    <SelectItem value="name">📝 Name</SelectItem>
                    <SelectItem value="price">💰 Price</SelectItem>
                    <SelectItem value="availability">✨ Availability</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border-4 border-pink-300 rounded-xl bg-white">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Gift Items */}
            <div className="space-y-6">
              {filteredItems.length > 0 ? (
                <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                  {filteredItems.map((item) => (
                    <GiftCard
                      key={item.id}
                      item={item}
                      onViewDetails={() => handleViewDetails(item)}
                      onClaim={() => handleClaimItem(item)}
                      guestName={guestName}
                      isClaimingDisabled={!guestName.trim() || item.is_claimed}
                      isClaiming={claimingItem === item.id}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-4 border-dashed border-gray-300 shadow-xl">
                  <CardContent className="p-16 text-center">
                    <Gift className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">
                      {registryItems.length === 0 ? "🎁 No gifts added yet!" : "🔍 No gifts match your search!"}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {registryItems.length === 0
                        ? "The magical gift list is still being prepared. Check back soon for amazing surprises!"
                        : "Try adjusting your search or filter to find the perfect gift!"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedItem}
        isOpen={showModal}
        onClose={handleCloseModal}
        onClaim={handleClaimItem}
        isClaimingDisabled={!guestName.trim()}
        guestName={guestName}
      />

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

// Gift Card Component (keeping existing functionality but with more exciting styling)
function GiftCard({ item, onViewDetails, onClaim, guestName, isClaimingDisabled, isClaiming, viewMode = "grid" }) {
  const getItemName = () => {
    return item.gift_items?.name || item.custom_name || "Unknown Item"
  }

  const getItemPrice = () => {
    if (item.gift_items?.price) return `£${item.gift_items.price}`
    if (item.gift_items?.price_range) return item.gift_items.price_range
    return item.custom_price || "Price varies"
  }

  const getItemImage = () => {
    return item.external_image_url || item.gift_items?.image_url || "/placeholder.svg?height=300&width=300"
  }

  const getBuyUrl = () => {
    return item.external_buy_url || "#"
  }

  const getRating = () => {
    return item.gift_items?.rating || null
  }

  const getPriorityColor = () => {
    switch (item.priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300 font-bold"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 font-bold"
      case "low":
        return "bg-green-100 text-green-800 border-green-300 font-bold"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 font-bold"
    }
  }

  if (viewMode === "list") {
    return (
      <Card
        className={`border-4 transition-all duration-300 hover:shadow-2xl transform hover:scale-105 ${
          item.is_claimed
            ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50"
            : "border-pink-300 hover:border-purple-400 bg-gradient-to-r from-pink-50 to-purple-50"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            {/* Image */}
            <div
              className="w-28 h-28 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl relative overflow-hidden cursor-pointer group flex-shrink-0 border-4 border-pink-200"
              onClick={onViewDetails}
            >
              <img
                src={getItemImage() || "/placeholder.svg"}
                alt={getItemName()}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=112&width=112"
                }}
              />
              {item.is_claimed && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">💝 CLAIMED!</div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-black text-xl text-purple-800 mb-2 cursor-pointer hover:text-pink-600 transition-colors truncate"
                    onClick={onViewDetails}
                  >
                    {getItemName()}
                  </h3>

                  {/* Rating */}
                  {getRating() && (
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(getRating()) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2 font-medium">({getRating()})</span>
                    </div>
                  )}

                  <div className="text-2xl font-black text-pink-600 mb-3">{getItemPrice()}</div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-sm text-purple-700 mb-3 line-clamp-2 font-medium">💭 {item.notes}</p>
                  )}
                </div>

                {/* Badges and Actions */}
                <div className="flex flex-col items-end space-y-3 ml-4">
                  {/* Priority Badge */}
                  {item.priority && item.priority !== "medium" && (
                    <Badge className={`text-sm ${getPriorityColor()} border-2`}>
                      ⭐ {item.priority?.toUpperCase()} PRIORITY
                    </Badge>
                  )}

                  {/* Status */}
                  {item.is_claimed ? (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-green-300">
                      <Heart className="w-5 h-5 text-white" />
                      <span className="text-sm font-bold text-white">{item.claimed_by}</span>
                    </div>
                  ) : (
                    <Button
                      onClick={onClaim}
                      disabled={isClaimingDisabled || isClaiming}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg px-6 py-3 rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
                      size="lg"
                    >
                      {isClaiming ? (
                        <>
                          <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5 mr-2" />
                          I'll bring this! 🎁
                        </>
                      )}
                    </Button>
                  )}

                  {/* Buy Link */}
                  {getBuyUrl() !== "#" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 bg-white font-bold"
                      asChild
                    >
                      <a href={getBuyUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now 🛒
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`border-4 transition-all duration-300 hover:shadow-2xl transform hover:scale-105 ${
        item.is_claimed
          ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
          : "border-pink-300 hover:border-purple-400 bg-gradient-to-br from-pink-50 to-purple-50"
      }`}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div
          className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-t-2xl relative overflow-hidden cursor-pointer group"
          onClick={onViewDetails}
        >
          <img
            src={getItemImage() || "/placeholder.svg"}
            alt={getItemName()}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = "/placeholder.svg?height=300&width=300"
            }}
          />

          {/* Status Overlay */}
          {item.is_claimed && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-full flex items-center space-x-2 font-bold text-lg shadow-xl">
                <Heart className="w-5 h-5" />
                <span>Claimed by {item.claimed_by}! 💝</span>
              </div>
            </div>
          )}

          {/* Priority Badge */}
          {item.priority && item.priority !== "medium" && (
            <div className="absolute top-4 left-4">
              <Badge className={`text-sm ${getPriorityColor()} border-2 shadow-lg`}>
                ⭐ {item.priority?.toUpperCase()} PRIORITY
              </Badge>
            </div>
          )}

          {/* Amazon Badge */}
          {item.external_source === "amazon" && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-orange-400 text-white text-sm font-bold border-2 border-orange-300">📦 Amazon</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3
            className="font-black text-xl text-purple-800 mb-3 line-clamp-2 cursor-pointer hover:text-pink-600 transition-colors"
            onClick={onViewDetails}
          >
            {getItemName()}
          </h3>

          {/* Rating */}
          {getRating() && (
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(getRating()) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2 font-medium">({getRating()})</span>
            </div>
          )}

          {/* Price */}
          <div className="text-2xl font-black text-pink-600 mb-4">{getItemPrice()}</div>

          {/* Notes */}
          {item.notes && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-4 border-2 border-purple-200">
              <p className="text-sm text-purple-800 font-medium">
                <span className="font-bold">💭 Special Note: </span>
                {item.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {item.is_claimed ? (
              <div className="flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl border-2 border-green-300">
                <Heart className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">{item.claimed_by} is bringing this! 💝</span>
              </div>
            ) : (
              <Button
                onClick={onClaim}
                disabled={isClaimingDisabled || isClaiming}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                {isClaiming ? (
                  <>
                    <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Claiming this amazing gift...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-3" />
                    I'll bring this! 🎁
                  </>
                )}
              </Button>
            )}

            {/* Buy Link */}
            {getBuyUrl() !== "#" && (
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 bg-white font-bold py-3 rounded-xl"
                asChild
              >
                <a
                  href={getBuyUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Buy on Amazon 🛒
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
