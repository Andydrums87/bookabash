"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Star,
  MapPin,
  Calendar,
  Shield,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Award,
  CheckCircle,
  Phone,
  Mail,
  Share,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  Menu,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SupplierProfilePage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [isAddingToPlan, setIsAddingToPlan] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2)) // March 2025
  const [selectedDate, setSelectedDate] = useState(15)
  const [showAllCredentials, setShowAllCredentials] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const supplier = {
    id: "magic-moments",
    name: "Magic Moments Entertainment",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 4.9,
    reviewCount: 127,
    location: "London, UK",
    activeSince: "2020",
    description:
      "Professional children's entertainers specializing in superhero-themed parties. We bring magic, laughter, and unforgettable memories to your special day.",
    verified: true,
    highlyRated: true,
    fastResponder: true,
    responseTime: "Within 2 hours",
    phone: "+44 7123 456 789",
    email: "hello@magicmoments.co.uk",
  }

  const credentials = [
    {
      title: "DBS Certificate",
      subtitle: "Enhanced - Valid until Dec 2025",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      title: "Public Liability",
      subtitle: "£2M Coverage - Valid",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      title: "First Aid Certified",
      subtitle: "Pediatric First Aid - 2024",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      title: "ID Verified",
      subtitle: "Identity confirmed by BookABash",
      icon: <Award className="w-5 h-5" />,
    },
  ]

  const portfolioImages = [
    { title: "Superhero Party Setup", image: "/placeholder.svg?height=300&width=400" },
    { title: "Magic Show Performance", image: "/placeholder.svg?height=300&width=400" },
    { title: "Face Painting Station", image: "/placeholder.svg?height=300&width=400" },
    { title: "Balloon Sculptures", image: "/placeholder.svg?height=300&width=400" },
    { title: "Group Activities", image: "/placeholder.svg?height=300&width=400" },
    { title: "Happy Children", image: "/placeholder.svg?height=300&width=400" },
  ]

  const packages = [
    {
      id: "basic",
      name: "Basic Package",
      price: 150,
      duration: "2-hour entertainment",
      features: ["Magic show", "Basic face painting", "Up to 15 children"],
    },
    {
      id: "premium",
      name: "Premium Package",
      price: 250,
      duration: "3-hour entertainment",
      features: ["Magic show + games", "Professional face painting", "Balloon sculptures", "Up to 25 children"],
      popular: true,
    },
    {
      id: "deluxe",
      name: "Deluxe Package",
      price: 350,
      duration: "4-hour entertainment",
      features: [
        "Full show + activities",
        "Premium face painting",
        "Balloon sculptures",
        "Party games & prizes",
        "Up to 35 children",
      ],
    },
  ]

  const reviews = [
    {
      id: 1,
      name: "Sarah Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2 weeks ago",
      text: "Absolutely fantastic! The team made my son's 6th birthday unforgettable. The superhero theme was executed perfectly, and all the kids were completely engaged throughout the party.",
      images: ["/placeholder.svg?height=60&width=60", "/placeholder.svg?height=60&width=60"],
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "1 month ago",
      text: "Professional, punctual, and incredibly entertaining. The magic show had everyone mesmerized, and the face painting was top quality. Highly recommend!",
    },
    {
      id: 3,
      name: "Emma Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "2 months ago",
      text: "Great entertainment value and the kids loved every minute. Setup was quick and professional. Only minor issue was running slightly over time, but overall excellent service.",
    },
  ]

  const loadingSteps = [
    "Checking availability...",
    "Confirming package details...",
    "Updating your party plan...",
    "Almost ready...",
  ]

  const handleAddToPlan = async (packageId) => {
    setSelectedPackage(packageId)
    setIsAddingToPlan(true)
    setLoadingStep(0)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(1)

      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(2)

      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(3)

      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(4)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (error) {
      console.error("Error adding to plan:", error)
      setIsAddingToPlan(false)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate === day
      const isToday = day === 15

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(day)}
          className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
            isSelected ? "bg-primary-500 text-white" : isToday ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-gray-50">
    {/* Mobile Header */}
    {/* <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="md:hidden">
            <div className="h-8 w-auto relative">
              <Image src="/images/logo.png" alt="BookABash" width={100} height={32} className="object-contain" />
            </div>
          </div>
          <div className="hidden md:block">
            <div className="h-10 w-auto relative">
              <Image src="/images/logo.png" alt="BookABash" width={150} height={40} className="object-contain" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Share className="w-5 h-5" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Quick Actions</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call {supplier.phone}
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Supplier
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header> */}

    <div className="pb-20 md:pb-8">
      {/* Mobile-First Supplier Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-8">
        <div className="space-y-4">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-start space-x-4 mb-4">
              <Avatar className="w-16 h-16 flex-shrink-0">
                <AvatarImage src={supplier.avatar || "/placeholder.svg"} alt={supplier.name} />
                <AvatarFallback>MM</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{supplier.name}</h1>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{supplier.rating}</span>
                  <span className="text-sm text-gray-600">({supplier.reviewCount})</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{supplier.location}</span>
                </div>
              </div>
            </div>

            {/* Mobile Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {supplier.verified && (
                <Badge className="bg-gray-900 text-white text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              {supplier.highlyRated && (
                <Badge variant="outline" className="text-yellow-700 border-yellow-300 text-xs">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                  Highly Rated
                </Badge>
              )}
              {supplier.fastResponder && (
                <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Fast Responder
                </Badge>
              )}
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-4">{supplier.description}</p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={supplier.avatar || "/placeholder.svg"} alt={supplier.name} />
                <AvatarFallback>MM</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
                  {supplier.verified && (
                    <Badge className="bg-gray-900 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {supplier.highlyRated && (
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                      Highly Rated
                    </Badge>
                  )}
                  {supplier.fastResponder && (
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Fast Responder
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{supplier.rating}</span>
                    <span className="text-gray-600">({supplier.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier.location}</span>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    Active since {supplier.activeSince}
                  </Badge>
                </div>

                <p className="text-gray-700 mb-6 max-w-2xl">{supplier.description}</p>

                <div className="flex gap-4">
                  <Button
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                    disabled={isAddingToPlan}
                    onClick={() => handleAddToPlan("basic")}
                  >
                    {isAddingToPlan ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding to Plan...
                      </>
                    ) : (
                      "Add to Plan"
                    )}
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Check Availability
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Content */}
      <div className="space-y-6 p-4 md:p-0">
        {/* Service Packages - Mobile First */}
        <Card className="md:hidden border-gray-300">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Service Packages</h2>
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    pkg.popular ? "border-primary-500 bg-primary-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{pkg.name}</h3>
                    {pkg.popular && <Badge className="bg-primary-500 text-white text-xs">Popular</Badge>}
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">£{pkg.price}</div>
                  <div className="text-xs text-gray-600 mb-3">• {pkg.duration}</div>
                  <ul className="space-y-1 mb-4">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="text-xs text-gray-700">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full text-sm ${pkg.popular ? "bg-gray-900 hover:bg-gray-800" : ""}`}
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handleAddToPlan(pkg.id)}
                    disabled={isAddingToPlan}
                  >
                    {isAddingToPlan && selectedPackage === pkg.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      "Select Package"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Gallery - Mobile Optimized */}
        <Card className="md:hidden border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Portfolio Gallery</h2>
              <Sheet open={showGallery} onOpenChange={setShowGallery}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Portfolio Gallery</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {portfolioImages.map((item, index) => (
                        <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {portfolioImages.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setShowGallery(true)}
                >
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                  {index === 3 && portfolioImages.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">+{portfolioImages.length - 4} more</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification & Credentials - Mobile Optimized */}
        <Card className="md:hidden border-gray-300">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Verification & Credentials</h2>
            <div className="space-y-3">
              {credentials.slice(0, showAllCredentials ? credentials.length : 2).map((credential, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    {credential.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{credential.title}</h3>
                    <p className="text-xs text-gray-600">{credential.subtitle}</p>
                  </div>
                </div>
              ))}
              {credentials.length > 2 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllCredentials(!showAllCredentials)}
                  className="w-full text-sm"
                >
                  {showAllCredentials ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Show All Credentials <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Reviews - Mobile Optimized */}
        <Card className="md:hidden border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 font-semibold text-sm">4.9</span>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                      <AvatarFallback>
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{review.name}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{review.text}</p>
                      {review.images && (
                        <div className="flex gap-2">
                          {review.images.map((img, i) => (
                            <div key={i} className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                              <Image
                                src={img || "/placeholder.svg"}
                                alt="Review photo"
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length > 2 && (
                <Button variant="ghost" onClick={() => setShowAllReviews(!showAllReviews)} className="w-full text-sm">
                  {showAllReviews ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      View All Reviews ({reviews.length}) <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Desktop Layout */}
        <div className="hidden md:block container px-10 min-w-screen py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
            

              {/* Portfolio Gallery */}
              <Card className="border-gray-300">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio Gallery</h2>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {portfolioImages.map((item, index) => (
                      <div
                        key={index}
                        className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
                      >
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-medium text-sm text-center px-2">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    View All Photos (24)
                  </Button>
                </CardContent>
              </Card>
  {/* Verification & Credentials */}
  <Card className="border-gray-300">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Verification & Credentials</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {credentials.map((credential, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white">
                          {credential.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{credential.title}</h3>
                          <p className="text-sm text-gray-600">{credential.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Customer Reviews */}
              <Card className="border-gray-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 font-semibold">4.9 out of 5</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                            <AvatarFallback>
                              {review.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{review.name}</h4>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{review.text}</p>
                            {review.images && (
                              <div className="flex gap-2">
                                {review.images.map((img, i) => (
                                  <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                    <Image
                                      src={img || "/placeholder.svg"}
                                      alt="Review photo"
                                      width={64}
                                      height={64}
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-6">
                    View All Reviews (127)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Service Packages */}
              <Card className="border-gray-300">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Service Packages</h2>
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`border-2 rounded-lg p-4 transition-all ${
                          pkg.popular ? "border-primary-500 bg-primary-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                          {pkg.popular && <Badge className="bg-primary-500 text-white">Popular</Badge>}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">£{pkg.price}</div>
                        <div className="text-sm text-gray-600 mb-3">• {pkg.duration}</div>
                        <ul className="space-y-1 mb-4">
                          {pkg.features.map((feature, i) => (
                            <li key={i} className="text-sm text-gray-700">
                              • {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full ${pkg.popular ? "bg-gray-900 hover:bg-gray-800" : ""}`}
                          variant={pkg.popular ? "default" : "outline"}
                          onClick={() => handleAddToPlan(pkg.id)}
                          disabled={isAddingToPlan}
                        >
                          {isAddingToPlan && selectedPackage === pkg.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            "Select Package"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Availability Calendar */}
              <Card className="border-gray-300">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Availability Calendar</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                          }
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                          }
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <div key={day} className="h-8 flex items-center justify-center">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span>Your selected date</span>
                    </div>
                    <div className="text-sm text-gray-500">Unavailable</div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-gray-300">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-semibold">{supplier.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Parties Completed</span>
                      <span className="font-semibold">150+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Repeat Customers</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Years Experience</span>
                      <span className="font-semibold">5 years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Fixed Bottom Action Bar */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
      <div className="flex space-x-3">
        <Button
          variant="outline"
          className="flex-1 border-gray-200"
          onClick={() => window.open(`tel:${supplier.phone}`)}
        >
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          onClick={() => handleAddToPlan("basic")}
          disabled={isAddingToPlan}
        >
          {isAddingToPlan ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Adding...
            </>
          ) : (
            "Add to Plan"
          )}
        </Button>
      </div>
    </div>

    {/* Enhanced Loading Overlay */}
    {isAddingToPlan && (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <div className="bg-white rounded-xl p-6 md:p-8 max-w-sm md:max-w-md w-full mx-4 shadow-2xl">
          <div className="flex flex-col items-center">
            {/* Loading Spinner */}
            <div className="w-16 h-16 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-primary-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary-500 font-bold">{Math.min(loadingStep + 1, 4)}/4</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Adding to Your Party Plan</h3>

            {/* Current Step */}
            <div className="text-primary-500 font-medium text-center mb-6">
              {loadingStep === 0 && "Checking availability..."}
              {loadingStep === 1 && "Confirming package details..."}
              {loadingStep === 2 && "Updating your party plan..."}
              {loadingStep === 3 && "Almost ready..."}
              {loadingStep >= 4 && "Complete!"}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((loadingStep + 1) * 25, 100)}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="w-full space-y-3">
              {["Checking availability", "Confirming package details", "Updating your party plan", "Finalizing"].map(
                (step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        index < loadingStep
                          ? "bg-green-500"
                          : index === loadingStep
                            ? "bg-primary-500 animate-pulse"
                            : "bg-gray-200"
                      }`}
                    >
                      {index < loadingStep ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <div
                          className={`w-2 h-2 rounded-full ${index === loadingStep ? "bg-white" : "bg-gray-400"}`}
                        ></div>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        index < loadingStep
                          ? "text-green-600"
                          : index === loadingStep
                            ? "text-primary-500 font-medium"
                            : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ),
              )}
            </div>

            {/* Success Message */}
            {loadingStep >= 4 && (
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg w-full">
                <div className="flex items-center gap-2 text-green-800">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Successfully added to your party plan!</span>
                </div>
                <p className="text-sm text-green-600 mt-1 text-center">Redirecting to dashboard...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
  )
}
