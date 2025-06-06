"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import BudgetControls from "@/components/budget-controls"
import {
  Edit,
  CheckCircle,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Building,
  Music,
  Utensils,
  Palette,
  Gift,
  Mail,
  ListChecks,
  LinkIcon,
  RefreshCw,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import SupplierSelectionModal from "@/components/supplier-selection-modal"
import RecommendedAddons from "@/components/recommended-addons"
import FloatingInviteButton from "@/components/floating-invite-button"
import InviteProgressIndicator from "@/components/invite-progress-indicator"
import { useSearchParams, useRouter } from "next/navigation"
import WelcomeDashboardPopup from "@/components/welcome-dashboard-popup"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const [currentBudget, setCurrentBudget] = useState(600)
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const [tempBudget, setTempBudget] = useState(600)
  const [isUpdating, setIsUpdating] = useState(false)
  const [loadingCards, setLoadingCards] = useState([])
  const [isBudgetDrawerOpen, setIsBudgetDrawerOpen] = useState(false)
  const [selectedSupplierModal, setSelectedSupplierModal] = useState({
    isOpen: false,
    category: "",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const welcomePopupShownRef = useRef(false)

  useEffect(() => {
    if (searchParams.get("show_welcome") === "true" && !welcomePopupShownRef.current) {
      setShowWelcomePopup(true)
      welcomePopupShownRef.current = true

      const currentPath = window.location.pathname
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete("show_welcome")
      router.replace(`${currentPath}?${newSearchParams.toString()}`, { scroll: false })
    }
  }, [searchParams, router])

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false)
  }

  const getBudgetCategory = (budget) => {
    if (budget < 500) return "Essential"
    if (budget < 700) return "Complete"
    return "Premium"
  }

  const updateSuppliers = (newBudget) => {
    setLoadingCards(["venue", "entertainment", "catering", "facePainting", "partyBags", "einvites"])
    setIsUpdating(true)
    setTimeout(() => {
      setCurrentBudget(newBudget)
      setIsUpdating(false)
      setTimeout(() => setLoadingCards((prev) => prev.filter((item) => item !== "venue")), 300)
      setTimeout(() => setLoadingCards((prev) => prev.filter((item) => item !== "entertainment")), 600)
      setTimeout(() => setLoadingCards((prev) => prev.filter((item) => item !== "catering")), 900)
      setTimeout(() => setLoadingCards((prev) => prev.filter((item) => item !== "facePainting")), 1200)
      setTimeout(() => setLoadingCards((prev) => prev.filter((item) => item !== "partyBags")), 1500)
      setTimeout(() => setLoadingCards((prev) => prev.filter((item) => item !== "einvites")), 1800)
    }, 1000)
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (tempBudget !== currentBudget && !isUpdating) {
        updateSuppliers(tempBudget)
      }
    }, 800)
    return () => clearTimeout(handler)
  }, [tempBudget, currentBudget, isUpdating])

  const suppliers = {
    venue: {
      name: "Adventure Play Centre",
      description: "Indoor playground with superhero decorations",
      price: 120,
      status: "confirmed",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594968/party-host_omxpqr.jpg",
      icon: <Building className="w-5 h-5" />,
    },
    entertainment: {
      name: "Captain Marvel Visit",
      description: "1 hour superhero training session",
      price: 150,
      status: "confirmed",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595066/party_uam87x.png",
      icon: <Music className="w-5 h-5" />,
    },
    catering: {
      name: "Hero's Feast Package",
      description: "Sandwiches, snacks & cake for 15",
      price: 85,
      status: "pending",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594952/bouncy-castle_gaq0z4.png",
      icon: <Utensils className="w-5 h-5" />,
    },
    facePainting: {
      name: "Superhero Face Painting",
      description: "Professional artist, masks & logos",
      price: 75,
      status: "confirmed",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748522377/blog-hero_lhgb8b.png",
      icon: <Palette className="w-5 h-5" />,
    },
    partyBags: {
      name: "Superhero Party Bags",
      description: "15 bags with masks, stickers & treats",
      price: 55,
      status: "confirmed",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1747830613/evgeniy-alyoshin-YF80qEzcEW8-unsplash_odk5fv.jpg",
      icon: <Gift className="w-5 h-5" />,
    },
    einvites: {
      name: "Digital Superhero Invites",
      description: "Themed e-invitations with RSVP tracking",
      price: 25,
      status: "confirmed",
      image: "/placeholder.jpg",
      icon: <Mail className="w-5 h-5" />,
    },
  }

  const totalSpent = Object.values(suppliers).reduce((sum, supplier) => sum + supplier.price, 0)

  const openSupplierModal = (category) => {
    setSelectedSupplierModal({ isOpen: true, category })
  }

  const closeSupplierModal = () => {
    setSelectedSupplierModal({ isOpen: false, category: "" })
  }

  const handleSupplierSelection = (supplier) => {
    console.log("Selected supplier:", supplier)
    closeSupplierModal()
  }

  const handleAddAddon = (addon) => {
    console.log("Adding addon to party:", addon)
  }
  const budgetPercentage = tempBudget > 0 ? Math.round((totalSpent / tempBudget) * 100) : 0

  const SupplierCard = ({ type, supplier }) => {
    const isLoading = loadingCards.includes(type)
    if (type === "einvites") {
      return (
        <Card className="border-primary-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {supplier.icon}
                <span className="font-medium text-gray-700">E-Invites</span>
              </div>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            {isLoading ? (
              <Skeleton className="w-full h-[160px]" />
            ) : (
              <div className="relative w-full h-[160px] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                  <span className="text-primary font-medium text-lg">Digital Invites</span>
                </div>
              </div>
            )}
            <div className="p-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{supplier.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900">£{supplier.price}</span>
                    <Badge className="bg-primary/10 text-primary border-primary/30">Ready to Send</Badge>
                  </div>
                </>
              )}
            </div>
            <div className="px-4 pb-4">
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Button className="w-full bg-primary hover:bg-primary-light text-primary-foreground" asChild>
                  <Link href="#">Create & Send Invites</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }
    return (
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {supplier.icon}
              <span className="font-medium text-gray-700">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
            <div
              className={`w-2 h-2 ${supplier.status === "confirmed" ? "bg-green-500" : "bg-yellow-500"} rounded-full`}
            ></div>
          </div>
          {isLoading ? (
            <Skeleton className="w-full h-[160px]" />
          ) : (
            <div className="relative w-full h-[160px] bg-gray-200 flex items-center justify-center">
              <Image src={supplier.image || "/placeholder.svg"} alt={supplier.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40"></div>
              <span className="text-white font-medium text-lg z-10">{supplier.name}</span>
            </div>
          )}
          <div className="p-4">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{supplier.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900">£{supplier.price}</span>
                  <Badge
                    variant="outline"
                    className={
                      supplier.status === "confirmed"
                        ? "text-green-700 border-green-300 bg-green-50"
                        : "text-yellow-700 border-yellow-300 bg-yellow-50"
                    }
                  >
                    {supplier.status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
              </>
            )}
          </div>
          <div className="px-4 pb-4">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Button variant="outline" className="w-full" onClick={() => openSupplierModal(type)}>
                Change {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const [partyTheme, setPartyTheme] = useState("superhero")

  const themeConfig = {
    superhero: {
      name: "Superhero",
      image: "/superhero.webp",
      badgeClass: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    princess: {
      name: "Princess",
      image: "/princessbanner.webp",
      badgeClass: "bg-pink-500 hover:bg-pink-600 text-white",
    },
    dinosaur: {
      name: "Dinosaur",
      image: "/placeholder.jpg",
      badgeClass: "bg-green-600 hover:bg-green-700 text-white",
    },
  }
  const budgetControlProps = {
    totalSpent,
    tempBudget,
    setTempBudget,
    budgetPercentage,
    getBudgetCategory,
    isUpdating,
    showAdvancedControls,
    setShowAdvancedControls,
  }

  const currentTheme = themeConfig[partyTheme]
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container min-w-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-t border-gray-100 bg-gray-50 py-3">
          <div className="container">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium text-gray-900">Party Setup</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-sm font-medium text-primary-500">Build Party</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="text-sm text-gray-500">Review & Book</span>
              </div>
            </div>
          </div>
        </div>
          {/* Theme Switcher - For Demo */}
          <div className="mb-4 flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Switch Theme: <span className="font-semibold ml-2">{currentTheme.name}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setPartyTheme("superhero")}>Superhero</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPartyTheme("princess")}>Princess</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPartyTheme("dinosaur")}>Dinosaur</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Party Header */}
        <div className="relative rounded-xl shadow-lg overflow-hidden mb-8">
          <Image
            src={currentTheme.image || "/placeholder.svg"}
            alt={`${currentTheme.name} party background`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative p-6 md:p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Badge className={currentTheme.badgeClass}>{currentTheme.name}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <h1 className="text-3xl font-bold text-white drop-shadow-md">Emma's {currentTheme.name} Party</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/90">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm md:text-base">Saturday, June 14, 2025 • 2:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm md:text-base">Age 6</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm md:text-base">Manchester, M1 4BT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-8">
            {/* Party Categories Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <SupplierCard type="venue" supplier={suppliers.venue} />
              <SupplierCard type="entertainment" supplier={suppliers.entertainment} />
              <SupplierCard type="catering" supplier={suppliers.catering} />
              <SupplierCard type="facePainting" supplier={suppliers.facePainting} />
              <SupplierCard type="partyBags" supplier={suppliers.partyBags} />
              <SupplierCard type="einvites" supplier={suppliers.einvites} />
            </div>

            {/* Recommended Add-ons Section */}
            <div className="w-screen pr-20">
            <RecommendedAddons context="dashboard" maxItems={4} onAddToCart={handleAddAddon} />
            </div>


            {/* Budget Impact Indicators */}
            <div className="hidden md:block bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Smart Budget Suggestions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                  <p className="text-sm text-blue-800">
                    <strong>3 more venues</strong> available in your current budget range
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                  <p className="text-sm text-blue-800">
                    <strong>Save £50</strong> by choosing a community venue option
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                  <p className="text-sm text-blue-800">
                    <strong>5 premium options</strong> available with £100 budget increase
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0"></div>
                  <p className="text-sm text-blue-800">
                    <strong>Add £30</strong> for premium entertainment upgrade
                  </p>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 bg-primary hover:bg-primary-light text-primary-foreground py-3 text-base font-semibold"
                asChild
              >
                <Link href="/party-summary">Continue to Review & Book</Link>
              </Button>
              <Button variant="outline" className="sm:w-auto">
                Modify Party Details
              </Button>
              <Button variant="ghost" className="sm:w-auto">
                Get Help
              </Button>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <BudgetControls {...budgetControlProps} />
            </Card>
            <InviteProgressIndicator partyDate="June 14, 2025" invitesSent={0} totalGuests={15} />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Upcoming Tasks</CardTitle>
                <ListChecks className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                    Confirm guest list
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-primary-500" />
                    Plan party games
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                    Buy decorations (Optional)
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Quick Links</CardTitle>
                <LinkIcon className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="#">View Guest List</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="#">Message Suppliers</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

        {/* Mobile Budget Sticky Bar & Drawer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 shadow-lg z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="font-semibold text-lg">
              £{totalSpent} <span className="text-sm text-muted-foreground">/ £{tempBudget}</span>
            </p>
          </div>
          <Drawer open={isBudgetDrawerOpen} onOpenChange={setIsBudgetDrawerOpen}>
            <DrawerTrigger asChild>
              <Button>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Adjust Budget
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Adjust Your Budget</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <BudgetControls {...budgetControlProps} />
              </div>
              <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                  <Button variant="outline">Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      {isUpdating && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center space-x-3 animate-pulse">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Updating suppliers for £{tempBudget} budget...</span>
          </div>
        </div>
      )}

      <FloatingInviteButton daysUntilParty={30} showAfterScroll={true} />
      <SupplierSelectionModal
        isOpen={selectedSupplierModal.isOpen}
        onClose={closeSupplierModal}
        category={selectedSupplierModal.category}
        theme="Superhero"
        date="June 15, 2025"
        onSelectSupplier={handleSupplierSelection}
      />
      <WelcomeDashboardPopup isOpen={showWelcomePopup} onClose={handleCloseWelcomePopup} />
    </div>
  )
}
