"use client"

import { useState, useMemo, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { useContextualNavigation } from "@/hooks/useContextualNavigation"
import { useSupplier } from "@/utils/mockBackend"
import { usePartyPlan } from "@/utils/partyPlanBackend"
import { Shield, Award, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"


import SupplierHeader from "@/components/supplier/supplier-header"
import SupplierPackages from "@/components/supplier/supplier-packages"
import SupplierReviews from "@/components/supplier/supplier-reviews"
import SupplierActionBar from "@/components/supplier/supplier-action-bar"
import AddingToPlanModal from "@/components/supplier/adding-to-plan-modal"
import NotificationPopup from "@/components/supplier/notification-popup"
import SupplierBadges from "@/components/supplier/supplier-badges"
import SupplierSidebar from "@/components/supplier/supplier-sidebar"
import MobileBookingBar from "@/components/supplier/mobile-booking-bar" // adjust path as needed

import SupplierServiceDetails from "@/components/supplier/supplier-service-details"
import SupplierPortfolioGallery from "@/components/supplier/supplier-portfolio-gallery"
import SupplierCredentials from "@/components/supplier/supplier-credentials"
import SupplierQuickStats from "@/components/supplier/supplier-quick-stats"
import SupplierAvailabilityCalendar from "@/components/supplier/supplier-availability-calendar"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

export default function SupplierProfilePage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [selectedPackageId, setSelectedPackageId] = useState("premium")
  const [isAddingToPlan, setIsAddingToPlan] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [notification, setNotification] = useState(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const id = useMemo(() => resolvedParams.id, [resolvedParams.id])

  const { supplier: backendSupplier, loading: supplierLoading, error: supplierError, refetch } = useSupplier(id)
  const { partyPlan, addSupplier, addAddon, removeAddon, hasAddon } = usePartyPlan()
  const { navigateWithContext, navigationContext } = useContextualNavigation()





  const supplier = useMemo(() => {
    if (!backendSupplier) return null
    return {
      id: backendSupplier.id,
      name: backendSupplier.name,
      avatar: backendSupplier.avatar || "/placeholder.jpg",
      rating: backendSupplier.rating,
      reviewCount: backendSupplier.reviewCount,
      location: backendSupplier.location,
      activeSince: backendSupplier.activeSince || "2020",
      description: backendSupplier.description,
      verified: backendSupplier.verified || true,
      highlyRated: backendSupplier.badges?.includes("Highly Rated") || false,
      fastResponder: backendSupplier.fastResponder || true,
      responseTime: backendSupplier.responseTime || "Within 2 hours",
      phone: backendSupplier.phone || "+44 7123 456 789",
      email:
        backendSupplier.email || "hello@" + backendSupplier.name?.toLowerCase().replace(/[^a-z0-9]/g, "") + ".co.uk",
      image: backendSupplier.image || "/placeholder.jpg",
      category: backendSupplier.category,
      priceFrom: backendSupplier.priceFrom,
      priceUnit: backendSupplier.priceUnit,
      badges: backendSupplier.badges || [],
      availability: backendSupplier.availability,
      packages: backendSupplier.packages || [],
      portfolioImages: backendSupplier.portfolioImages || [],
      portfolioVideos: backendSupplier.portfolioVideos || [],
      coverPhoto: backendSupplier.coverPhoto || backendSupplier.image || "/placeholder.jpg",
      workingHours: backendSupplier.workingHours,
      unavailableDates: backendSupplier.unavailableDates,
      busyDates: backendSupplier.busyDates,
      availabilityNotes: backendSupplier.availabilityNotes,
      advanceBookingDays: backendSupplier.advanceBookingDays,
      maxBookingDays: backendSupplier.maxBookingDays,
      serviceDetails: backendSupplier?.serviceDetails,
      stats: backendSupplier?.stats,
      ownerName: backendSupplier?.ownerName,
    }
  }, [backendSupplier])


  const packages = useMemo(() => {
    if (!supplier) return []
    if (supplier.packages && supplier.packages.length > 0) {
      return supplier.packages.map((pkg, index) => ({
        id: pkg.id || `real-${index}`,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        image: pkg.image,
        features: pkg.whatsIncluded || pkg.features || [],
        popular: pkg.id === selectedPackageId || (!selectedPackageId && index === 0),
        description: pkg.description,
      }))
    }
    const basePrice = supplier.priceFrom || 100
    const priceUnit = supplier.priceUnit || "per event"
    const category = supplier.category || "service"
    const serviceName = category.toLowerCase()
    const defaultPackages = [
      {
        id: "basic",
        name: "Basic Package",
        price: Math.round(basePrice * 1.0),
        duration: priceUnit,
        features: ["Standard service", "Up to 15 children", "Basic setup"],
        description: `Basic ${serviceName} package`,
      },
      {
        id: "premium",
        name: "Premium Package",
        price: Math.round(basePrice * 1.5),
        duration: priceUnit,
        features: ["Enhanced service", "Professional setup", "Up to 25 children"],
        description: `Enhanced ${serviceName} package`,
      },
      {
        id: "deluxe",
        name: "Deluxe Package",
        price: Math.round(basePrice * 2.0),
        duration: priceUnit,
        features: ["Premium service", "Full setup & cleanup", "Up to 35 children"],
        description: `Complete ${serviceName} package`,
      },
    ]
    return defaultPackages.map((pkg, index) => ({
      ...pkg,
      popular: pkg.id === selectedPackageId || (!selectedPackageId && index === 0),
    }))
  }, [supplier, selectedPackageId])

  const portfolioImages = useMemo(() => {
    const defaultImages = [
      {
        id: "default-main",
        title: "Fun Party Main",
        image: `/placeholder.jpg`,
        alt: "Main party event image",
      },
      {
        id: "default-small-1",
        title: "Kids Playing",
        image: `/placeholder.jpg`,
        alt: "Kids playing at party",
      },
      {
        id: "default-small-2",
        title: "Party Games",
        image: `/placeholder.jpg`,
        alt: "Fun party games",
      },
      {
        id: "default-extra-1",
        title: "Decorations",
        image: `/placeholder.jpg`,
        alt: "Colorful party decorations",
      },
      {
        id: "default-extra-2",
        title: "Happy Children",
        image: `/placeholder.jpg`,
        alt: "Happy children celebrating",
      },
      {
        id: "default-extra-3",
        title: "Birthday Cake",
        image: `/placeholder.jpg`,
        alt: "Birthday cake with candles",
      },
    ]

    if (supplier?.portfolioImages && supplier.portfolioImages.length > 0) {
      const supplierProvidedImages = supplier.portfolioImages.map((img, index) => ({
        id: img.id || `portfolio-${index}`,
        title: img.title || `Portfolio Image ${index + 1}`,
        image: img.image || img.src || `/placeholder.svg?height=400&width=300&query=portfolio+${index + 1}`,
        description: img.description,
        alt: img.alt || img.title || `Portfolio image ${index + 1}`,
      }))
      return [...supplierProvidedImages, ...defaultImages.slice(supplierProvidedImages.length)].slice(0, 6)
    }
    return defaultImages.slice(0, 6)
  }, [supplier?.portfolioImages, supplier?.image, supplier?.name])

  const credentials = useMemo(
    () =>
      [
        {
          title: "DBS Certificate",
          subtitle: "Enhanced - Valid until Dec 2025",
          icon: <Shield className="w-5 h-5" />,
          verified: supplier?.serviceDetails?.certifications?.dbsCertificate,
        },
        {
          title: "Public Liability",
          subtitle: "£2M Coverage - Valid",
          icon: <Shield className="w-5 h-5" />,
          verified: supplier?.serviceDetails?.certifications?.publicLiability,
        },
        {
          title: "First Aid Certified",
          subtitle: "Pediatric First Aid - 2024",
          icon: <CheckCircle className="w-5 h-5" />,
          verified: supplier?.serviceDetails?.certifications?.firstAid,
        },
        {
          title: "ID Verified",
          subtitle: "Identity confirmed",
          icon: <Award className="w-5 h-5" />,
          verified: supplier?.verified,
        },
      ].filter((cred) => cred.verified),
    [supplier?.serviceDetails?.certifications, supplier?.verified],
  )

  const reviews = useMemo(
    () => [
      {
        id: 1,
        name: "Sarah T.",
        avatar: "/andrew.jpg",
        rating: 5,
        date: "2 weeks ago",
        text: "Absolutely fantastic! Made my son's 6th birthday unforgettable.",
        images: ["/placeholder.jpg", "/placeholder.jpg"],
      },
      {
        id: 2,
        name: "Mike J.",
        avatar: "/andrew.jpg",
        rating: 5,
        date: "1 month ago",
        text: "Professional, punctual, and incredibly entertaining.",
      },
      {
        id: 3,
        name: "Emma D.",
        avatar: "/andrew.jpg",
        rating: 4,
        date: "2 months ago",
        text: "Great entertainment value. Kids loved it.",
      },
    ],
    [],
  )

  useEffect(() => {
    if (!supplierLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true)
      if (!selectedPackageId && packages.length > 0) {
        setSelectedPackageId(packages[0].id)
      }
    }
  }, [supplierLoading, hasLoadedOnce, packages, selectedPackageId])

  const getSupplierInPartyDetails = () => {
    if (!supplier) return { inParty: false, currentPackage: null, supplierType: null }
    const isInAddons = hasAddon(supplier.id)
    const mainSlots = ["venue", "entertainment", "catering", "facePainting", "activities", "partyBags"]
    const supplierInMainSlot = mainSlots.find((slot) => partyPlan[slot]?.id === supplier.id)

    if (isInAddons) {
      const addon = partyPlan.addons?.find((addon) => addon.id === supplier.id)
      return {
        inParty: true,
        currentPackage: addon?.packageId || null,
        supplierType: "addon",
        currentSupplierData: addon,
      }
    }
    if (supplierInMainSlot) {
      const supplierData = partyPlan[supplierInMainSlot]
      return {
        inParty: true,
        currentPackage: supplierData?.packageId || null,
        supplierType: supplierInMainSlot,
        currentSupplierData: supplierData,
      }
    }
    return { inParty: false, currentPackage: null, supplierType: null }
  }

  const handleAddToPlan = async () => {
    if (!supplier || !selectedPackageId) {
      setNotification({ type: "error", message: "Please select a package first." })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    const partyDetails = getSupplierInPartyDetails()
    setIsAddingToPlan(true)
    setLoadingStep(0)

    try {
      const selectedPkg = packages.find((pkg) => pkg.id === selectedPackageId)
      if (!selectedPkg) {
        throw new Error("Selected package not found.")
      }
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(1)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(2)

      let result
      if (partyDetails.inParty) {
        if (partyDetails.currentPackage === selectedPackageId) {
          setNotification({
            type: "info",
            message: `${supplier.name} with ${selectedPkg?.name || "this package"} is already in your dashboard!`,
          })
          setIsAddingToPlan(false)
          setTimeout(() => setNotification(null), 3000)
          return
        }
        if (partyDetails.supplierType === "addon") {
          await removeAddon(supplier.id)
          const addonData = {
            ...supplier,
            price: selectedPkg?.price || supplier.priceFrom,
            packageId: selectedPkg?.id || null,
          }
          result = await addAddon(addonData)
        } else {
          result = await addSupplier(backendSupplier, selectedPkg)
        }
        if (result.success)
          setNotification({ type: "success", message: `Package updated to ${selectedPkg?.name || "new package"}!` })
      } else {
        const mainCategories = ["Venues", "Catering", "Party Bags", "Face Painting", "Activities", "Entertainment"]
        if (mainCategories.includes(supplier.category || "")) {
          result = await addSupplier(backendSupplier, selectedPkg)
        } else {
          const addonData = {
            ...supplier,
            price: selectedPkg?.price || supplier.priceFrom,
            packageId: selectedPkg?.id || null,
          }
          result = await addAddon(addonData)
        }
        if (result.success)
          setNotification({ type: "success", message: `${supplier.name} has been added to your party plan!` })
      }

      setLoadingStep(3)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStep(4)

      if (result.success) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        if (navigationContext === "dashboard") {
          navigateWithContext("/dashboard", "supplier-detail")
        } else {
          router.push("/dashboard")
        }
      } else {
        throw new Error(result.error || "Failed to update party plan")
      }
    } catch (error) {
      console.error("Error updating party plan:", error)
      setNotification({ type: "error", message: error.message || "Failed to update party plan. Please try again." })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsAddingToPlan(false)
    }
  }

  const getAddToPartyButtonState = (packageIdToCompare) => {
    const currentPackageId = packageIdToCompare || selectedPackageId
    const partyDetails = getSupplierInPartyDetails()
    const isLoadingThisPackage = isAddingToPlan && selectedPackageId === currentPackageId

    if (isLoadingThisPackage) {
      return {
        disabled: true,
        className: "bg-gray-400",
        text: (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {partyDetails.inParty && partyDetails.currentPackage === currentPackageId ? "Updating..." : "Adding..."}
          </>
        ),
      }
    }
    if (partyDetails.inParty && partyDetails.currentPackage === currentPackageId) {
      return {
        disabled: true,
        className: "bg-green-500 hover:bg-green-500 text-white cursor-not-allowed",
        text: (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            In Plan
          </>
        ),
      }
    }
    if (!currentPackageId) {
      return {
        disabled: true,
        className: "bg-gray-300 text-gray-500 cursor-not-allowed",
        text: "Select a Package",
      }
    }
    return { disabled: false, className: "bg-primary-500 hover:bg-primary-600 text-white", text: "Add to Plan" }
  }

  if (supplierLoading && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (hasLoadedOnce && (supplierError || !supplier)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {supplierError ? "Error Loading Supplier" : "Oops! Supplier Not Found"}
        </h1>
        <p className="text-gray-600 mb-6">
          {supplierError
            ? "We encountered an error trying to load the supplier details. Please try again later."
            : "We couldn't find the supplier you're looking for. It might have been removed or the link is incorrect."}
        </p>
        <Button onClick={() => router.push("/")}>Go to Homepage</Button>
      </div>
    )
  }

  if (supplierLoading || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-[#F4F5F7] min-h-screen font-sans">
      <NotificationPopup notification={notification} />
   {/* Add the breadcrumb here */}
   <ContextualBreadcrumb currentPage="supplier-detail" />
      <SupplierHeader
        supplier={supplier}
        portfolioImages={portfolioImages}
        getSupplierInPartyDetails={getSupplierInPartyDetails}
        getAddToPartyButtonState={getAddToPartyButtonState}
        handleAddToPlan={handleAddToPlan}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2 space-y-8">
                 {/* SupplierPackages moved here */}
                 <SupplierPackages
              packages={packages}
              selectedPackageId={selectedPackageId}
              setSelectedPackageId={setSelectedPackageId}
            />
            <SupplierServiceDetails supplier={supplier} />
            <SupplierPortfolioGallery portfolioImages={portfolioImages} />
            <SupplierCredentials credentials={credentials} />
            <SupplierReviews reviews={reviews} />
            <SupplierBadges supplier={supplier} />
            <SupplierQuickStats supplier={supplier} />
          </main>
          <aside className="hidden md:block lg:col-span-1">
 
            <SupplierSidebar
              supplier={supplier}
              packages={packages}
              selectedPackageId={selectedPackageId}
              handleAddToPlan={handleAddToPlan}
              getAddToPartyButtonState={getAddToPartyButtonState}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              credentials={credentials}
            />
          </aside>
        </div>
      </div>

      <SupplierActionBar
        supplierPhoneNumber={supplier.phone}
        getAddToPartyButtonState={() => getAddToPartyButtonState(selectedPackageId)}
        handleAddToPlan={handleAddToPlan}
      />

      <AddingToPlanModal
        isAddingToPlan={isAddingToPlan}
        loadingStep={loadingStep}
        theme={partyPlan?.theme || "default"}
      />
      
      <MobileBookingBar 
  selectedPackage={packages.find(pkg => pkg.id === selectedPackageId)}
  supplier={supplier}  // Make sure this line is added
  onAddToPlan={handleAddToPlan}
  onSaveForLater={(data) => {
    // You can implement save for later logic here
    console.log('Saving for later:', data);
    setNotification({ 
      type: "success", 
      message: `${supplier.name} saved for later!` 
    });
    setTimeout(() => setNotification(null), 3000);
  }}
/>
    </div>
  )
}
