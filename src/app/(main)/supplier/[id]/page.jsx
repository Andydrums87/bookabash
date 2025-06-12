"use client"

import { useState } from "react"
import { use } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContextualBreadcrumb } from '@/components/ContextualBreadcrumb';
import { useContextualNavigation } from '@/hooks/useContextualNavigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSupplier } from '@/utils/mockBackend';
import { usePartyPlan } from '@/utils/partyPlanBackend'; 
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
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SupplierProfilePage({ params }) {

  const { partyPlan, addSupplier, addAddon, hasAddon } = usePartyPlan();
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedPackageId, setSelectedPackageId] = useState('premium')
  const [isAddingToPlan, setIsAddingToPlan] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2)) // March 2025
  const [selectedDate, setSelectedDate] = useState(15)
  const [showAllCredentials, setShowAllCredentials] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [notification, setNotification] = useState(null)
  const { id } = use(params);



  // const supplier = {
  //   id: "magic-moments",
  //   name: "Magic Moments Entertainment",
  //   avatar: "/placeholder.svg?height=80&width=80",
  //   rating: 4.9,
  //   reviewCount: 127,
  //   location: "London, UK",
  //   activeSince: "2020",
  //   description:
  //     "Professional children's entertainers specializing in superhero-themed parties. We bring magic, laughter, and unforgettable memories to your special day.",
  //   verified: true,
  //   highlyRated: true,
  //   fastResponder: true,
  //   responseTime: "Within 2 hours",
  //   phone: "+44 7123 456 789",
  //   email: "hello@magicmoments.co.uk",
  // }
  const { supplier: backendSupplier, loading: supplierLoading, error } = useSupplier(id);
 // Map backend supplier data to the format your UI expects
 const supplier = backendSupplier ? {
  id: backendSupplier.id,
  name: backendSupplier.name,
  avatar: "/placeholder.svg?height=80&width=80", // You can add avatars to your backend data later
  rating: backendSupplier.rating,
  reviewCount: backendSupplier.reviewCount,
  location: backendSupplier.location,
  activeSince: "2020", // You can add this to your backend data later
  description: backendSupplier.description,
  verified: true, // You can add this to your backend data later
  highlyRated: backendSupplier.badges?.includes("Highly Rated") || false,
  fastResponder: true, // You can add this to your backend data later
  responseTime: "Within 2 hours", // You can add this to your backend data later
  phone: "+44 7123 456 789", // You can add this to your backend data later
  email: "hello@" + backendSupplier.name.toLowerCase().replace(/[^a-z0-9]/g, '') + ".co.uk",
  image: backendSupplier.image,
  category: backendSupplier.category,
  priceFrom: backendSupplier.priceFrom,
  priceUnit: backendSupplier.priceUnit,
  badges: backendSupplier.badges,
  availability: backendSupplier.availability
} : null;

 // Update packages to be more dynamic based on supplier data
 const packages = supplier ? [
  {
    id: "basic",
    name: "Basic Package",
    price: Math.round(supplier.priceFrom * 1.0),
    duration: supplier.priceUnit,
    features: ["Standard service", "Up to 15 children", "Basic setup"],
  },
  {
    id: "premium",
    name: "Premium Package", 
    price: Math.round(supplier.priceFrom * 1.5),
    duration: supplier.priceUnit,
    features: ["Enhanced service", "Professional setup", "Up to 25 children", "Extended time"],
    popular: true,
  },
  {
    id: "deluxe",
    name: "Deluxe Package",
    price: Math.round(supplier.priceFrom * 2.0),
    duration: supplier.priceUnit,
    features: ["Premium service", "Full setup & cleanup", "Up to 35 children", "Additional extras", "Priority support"],
  },
] : [];

const portfolioImages = Array.from({ length: 6 }, (_, index) => ({
  title: [
    "Main Service",
    "Setup Process", 
    "In Action",
    "Happy Customers",
    "Professional Setup",
    "Event Results"
  ][index],
  image: supplier?.image || "/placeholder.svg?height=300&width=400"
}))

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



const getSupplierInPartyDetails = () => {
  if (!supplier) return { inParty: false, currentPackage: null, supplierType: null }
  
  const isInAddons = hasAddon(supplier.id)
  const mainSlots = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags']
  const supplierInMainSlot = mainSlots.find(slot => partyPlan[slot]?.id === supplier.id)
  
  if (isInAddons) {
    const addon = partyPlan.addons?.find(addon => addon.id === supplier.id)
    return { 
      inParty: true, 
      currentPackage: addon?.packageId || null, 
      supplierType: 'addon',
      currentSupplierData: addon
    }
  }
  
  if (supplierInMainSlot) {
    const supplierData = partyPlan[supplierInMainSlot]
    return { 
      inParty: true, 
      currentPackage: supplierData?.packageId || null, 
      supplierType: supplierInMainSlot,
      currentSupplierData: supplierData
    }
  }
  
  return { inParty: false, currentPackage: null, supplierType: null }
}


// const handleAddToPlan = async (packageId) => {
//   if (!supplier) return;
  
  
//   setSelectedPackage(packageId);
//   setIsAddingToPlan(true);
//   setLoadingStep(0);

//   try {
//     // Find the selected package
//     const selectedPkg = packages.find(pkg => pkg.id === packageId);
    
//     await new Promise((resolve) => setTimeout(resolve, 800));
//     setLoadingStep(1);

//     await new Promise((resolve) => setTimeout(resolve, 800));
//     setLoadingStep(2);

//     // CLEANER LOGIC: Determine if this should be added as main supplier or addon
//     // Based on what slots are available and supplier category
    
//     let result;
    
//     // Check supplier category and decide where it goes
//     if (supplier.category === 'Venues') {
//       // Always add venues as main supplier
//       result = await addSupplier(backendSupplier, selectedPkg);
//     } 
//     else if (supplier.category === 'Catering') {
//       // Always add catering as main supplier  
//       result = await addSupplier(backendSupplier, selectedPkg);
//     }
//     else if (supplier.category === 'Party Bags') {
//       // Always add party bags as main supplier
//       result = await addSupplier(backendSupplier, selectedPkg);
//     }
//     else if (supplier.category === 'Face Painting') {
//       // Face painting goes to facePainting slot
//       result = await addSupplier(backendSupplier, selectedPkg);
//     }
  
//     else if (supplier.category === 'Entertainment') {
      
//       // Entertainment can go to main entertainment slot OR addon
//       // Try main supplier first, if it fails, add as addon
//       result = await addSupplier(backendSupplier, selectedPkg);
      
//       if (!result.success && result.error?.includes('already')) {
//         // Main entertainment slot is full, add as addon instead
//         const addonData = {
//           id: supplier.id,
//           name: supplier.name,
//           description: supplier.description,
//           price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
//           image: supplier.image,
//           category: supplier.category,
//           duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
//           rating: supplier.rating,
//           reviewCount: supplier.reviewCount,
//           popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
//           limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
//           packageId: selectedPkg?.id || null
//         };
//         result = await addAddon(addonData);
//       }
//     }
//     else if (supplier.category === 'Activities') {
//       // Activities can go to face painting slot OR addon
//       result = await addSupplier(backendSupplier, selectedPkg);
      
//       if (!result.success && result.error?.includes('already')) {
//         // Face painting slot is full, add as addon instead
//         const addonData = {
//           id: supplier.id,
//           name: supplier.name,
//           description: supplier.description,
//           price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
//           image: supplier.image,
//           category: supplier.category,
//           duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
//           rating: supplier.rating,
//           reviewCount: supplier.reviewCount,
//           popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
//           limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
//           packageId: selectedPkg?.id || null
//         };
//         result = await addAddon(addonData);
//       }
//     }
//     else {
//       // Everything else (Photography, Decorations, etc.) goes to addons
//       const addonData = {
//         id: supplier.id,
//         name: supplier.name,
//         description: supplier.description,
//         price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
//         image: supplier.image,
//         category: supplier.category,
//         duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
//         rating: supplier.rating,
//         reviewCount: supplier.reviewCount,
//         popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
//         limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
//         packageId: selectedPkg?.id || null
//       };
//       result = await addAddon(addonData);
//     }

//     setLoadingStep(3);
//     await new Promise((resolve) => setTimeout(resolve, 800));
//     setLoadingStep(4);

//     if (result.success) {
//       // Show success notification
//       setNotification({
//         type: 'success',
//         message: `${supplier.name} has been added to your party plan!`
//       });
      
//       await new Promise((resolve) => setTimeout(resolve, 1000));
      
//       // Navigate back based on context
//       if (navigationContext === 'dashboard') {
//         navigateWithContext('/dashboard', 'supplier-detail');
//       } else {
//         router.push('/dashboard');
//       }
//     } else {
//       throw new Error(result.error || 'Failed to add to party plan');
//     }
    
//   } catch (error) {
//     console.error("Error adding to plan:", error);
//     setNotification({
//       type: 'error',
//       message: 'Failed to add to party plan. Please try again.'
//     });
//     setIsAddingToPlan(false);
//     setSelectedPackage(null);
//   }
// }

// 👈 ADD THIS FUNCTION TO GET BUTTON STATE


const handleAddToPlan = async () => {
  if (!supplier || !selectedPackageId) return;
  
  const partyDetails = getSupplierInPartyDetails()
  
  setIsAddingToPlan(true);
  setLoadingStep(0);

  try {
    const selectedPkg = packages.find(pkg => pkg.id === selectedPackageId);
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingStep(1);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingStep(2);

    let result;
    
    // REMOVE THIS OLD CHECK - we want to allow updates now
    // if (isSupplierInParty()) {
    //   setNotification({
    //     type: 'warning',
    //     message: `${supplier.name} is already in your party plan!`
    //   });
    //   setTimeout(() => setNotification(null), 3000);
    //   return;
    // }
    
    // NEW LOGIC: Check if supplier is already in party and handle accordingly
    if (partyDetails.inParty) {
      // If trying to select the same package that's already selected
      if (partyDetails.currentPackage === selectedPackageId) {
        setNotification({
          type: 'info',
          message: `${supplier.name} with ${packages.find(p => p.id === selectedPackageId)?.name || 'this package'} is already in your dashboard!`
        });
        setIsAddingToPlan(false);
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      console.log('🔄 Updating existing supplier package from', partyDetails.currentPackage, 'to', selectedPackageId);
      
      if (partyDetails.supplierType === 'addon') {
        // Update addon - remove old and add new with different package
        await removeAddon(supplier.id);
        const addonData = {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
          image: supplier.image,
          category: supplier.category,
          duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
          rating: supplier.rating,
          reviewCount: supplier.reviewCount,
          popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
          limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
          packageId: selectedPkg?.id || null
        };
        result = await addAddon(addonData);
      } else {
        // Update main supplier slot
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: `Package updated to ${selectedPkg?.name || 'new package'}!`
        });
      }
    } else {
      // NEW SUPPLIER - use existing logic
      if (supplier.category === 'Venues') {
        result = await addSupplier(backendSupplier, selectedPkg);
      } 
      else if (supplier.category === 'Catering') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else if (supplier.category === 'Party Bags') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else if (supplier.category === 'Face Painting') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else if (supplier.category === 'Activities') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else if (supplier.category === 'Entertainment') {
        result = await addSupplier(backendSupplier, selectedPkg);
      }
      else {
        // Everything else goes to addons
        const addonData = {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          price: selectedPkg ? selectedPkg.price : supplier.priceFrom,
          image: supplier.image,
          category: supplier.category,
          duration: selectedPkg ? selectedPkg.duration : supplier.priceUnit,
          rating: supplier.rating,
          reviewCount: supplier.reviewCount,
          popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
          limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
          packageId: selectedPkg?.id || null
        };
        result = await addAddon(addonData);
      }
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: `${supplier.name} has been added to your party plan!`
        });
      }
    }

    setLoadingStep(3);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingStep(4);

    if (result.success) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate back based on context
      if (navigationContext === 'dashboard') {
        navigateWithContext('/dashboard', 'supplier-detail');
      } else {
        router.push('/dashboard');
      }
    } else {
      throw new Error(result.error || 'Failed to update party plan');
    }
    
  } catch (error) {
    console.error("Error updating party plan:", error);
    setNotification({
      type: 'error',
      message: 'Failed to update party plan. Please try again.'
    });
  } finally {
    setIsAddingToPlan(false); // Make sure to reset loading state
  }
}

const getAddToPartyButtonState = (packageId) => {
  const partyDetails = getSupplierInPartyDetails()
  const isLoading = isAddingToPlan && selectedPackageId === packageId
  
  // If loading this specific package
  if (isLoading) {
    return {
      disabled: true,
      className: "bg-primary-500",
      text: (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          {partyDetails.inParty ? 'Updating...' : 'Adding...'}
        </>
      )
    }
  }
  
  // If this package is currently in the party plan
  if (partyDetails.inParty && partyDetails.currentPackage === packageId) {
    return {
      disabled: true,
      className: "bg-green-500 hover:bg-green-500 text-white cursor-not-allowed",
      text: (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          In Plan
        </>
      )
    }
  }
  
  // For all other cases (new supplier, or different package for existing supplier)
  return {
    disabled: false,
    className: "bg-primary-500 hover:bg-primary-600 text-white",
    text: "Select Package"
  }
}

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
const AddingToPlanModal = ({ isAddingToPlan, loadingStep, theme = 'default' }) => {
  const [visibleImages, setVisibleImages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const partyImages = [
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473245/iStock-1150333197_bw6j3b.jpg",
      alt: "Kids enjoying party games"
    },
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473373/iStock-469207460_romywt.jpg", 
      alt: "Children celebrating at party"
    },
    {
      src: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749473689/iStock-1369813086_osxnjy.jpg",
      alt: "Fun party activities"
    }
  ];

  const themeEmojis = {
    'spiderman': '🕷️',
    'taylor-swift': '🎤',
    'princess': '👑',
    'dinosaur': '🦕',
    'unicorn': '🦄',
    'science': '🔬',
    'superhero': '🦸',
    'default': '🎉'
  };

  const stepMessages = [
    "Checking availability...",
    "Confirming package details...",
    "Updating your party plan...",
    "Finalizing your perfect party...",
    "🎉 Successfully added to your plan! 🎉"
  ];

  const currentEmoji = themeEmojis[theme] || themeEmojis['default'];
  const progress = Math.min((loadingStep + 1) * 25, 100);

  // Handle image popping animations
  useEffect(() => {
    if (!isAddingToPlan) {
      setVisibleImages([]);
      return;
    }

    const addRandomImage = () => {
      const randomImage = partyImages[Math.floor(Math.random() * partyImages.length)];
      
      // Calculate position to avoid center area
      let top, left;
      const placement = Math.random();
      
      if (placement < 0.4) {
        // Top area
        top = Math.random() * 20 + 5;
        left = Math.random() * 80 + 10;
      } else if (placement < 0.8) {
        // Bottom area
        top = Math.random() * 20 + 75;
        left = Math.random() * 80 + 10;
      } else {
        // Side areas
        top = Math.random() * 60 + 20;
        if (Math.random() < 0.5) {
          left = Math.random() * 15 + 2;
        } else {
          left = Math.random() * 15 + 83;
        }
      }
      
      const randomPosition = {
        top,
        left,
        size: Math.random() * 100 + 120, // 120px to 220px
        rotation: Math.random() * 20 - 10,
        id: Date.now() + Math.random()
      };

      setVisibleImages(prev => [...prev, { ...randomImage, ...randomPosition }]);

      setTimeout(() => {
        setVisibleImages(prev => prev.filter(img => img.id !== randomPosition.id));
      }, 4000);
    };

    setTimeout(addRandomImage, 200);
    
    const interval = setInterval(() => {
      addRandomImage();
    }, 1500);

    return () => clearInterval(interval);
  }, [isAddingToPlan]);

  // Handle message updates based on loading step
  useEffect(() => {
    if (loadingStep < stepMessages.length - 1) {
      setCurrentMessageIndex(loadingStep);
    } else {
      setCurrentMessageIndex(stepMessages.length - 1);
    }
  }, [loadingStep]);

  if (!isAddingToPlan) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
      
      {/* Animated party images popping around the screen */}
      {visibleImages.map((image) => (
        <div
          key={image.id}
          className="absolute pointer-events-none animate-bounce-in-scale z-30"
          style={{
            top: `${image.top}%`,
            left: `${image.left}%`,
            transform: `rotate(${image.rotation}deg)`,
            animationDuration: '0.6s',
            animationFillMode: 'forwards'
          }}
        >
          <div 
            className="rounded-2xl shadow-2xl border-4 border-white overflow-hidden opacity-85 hover:opacity-100 transition-opacity duration-500"
            style={{
              width: `${image.size}px`,
              height: `${image.size}px`
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>
      ))}

      {/* Main content container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 max-w-lg mx-4 text-center relative z-20">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">
            {loadingStep >= 4 ? '🎉' : currentEmoji}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {loadingStep >= 4 ? 'Added to Plan!' : 'Adding to Your Plan'}
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            {loadingStep >= 4 
              ? 'Your party selection has been successfully added!'
              : 'Securing your perfect party addition...'
            }
          </p>
        </div>

        {/* Progress section */}
        <div className="mb-8">
          <div className="bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#FF6B4A] to-[#FF8A70] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-2xl font-bold text-[#FF6B4A] mb-6">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Loading message */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
          <p className="text-base text-gray-700 font-medium leading-relaxed animate-pulse">
            {stepMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Step indicators */}
        <div className="w-full space-y-3 mb-8">
          {["Checking availability", "Confirming details", "Updating plan", "Finalizing"].map(
            (step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index < loadingStep
                      ? "bg-green-500 shadow-lg"
                      : index === loadingStep
                        ? "bg-[#FF6B4A] animate-pulse shadow-lg"
                        : "bg-gray-200"
                  }`}
                >
                  {index < loadingStep ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === loadingStep ? "bg-white animate-pulse" : "bg-gray-400"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    index < loadingStep
                      ? "text-green-600"
                      : index === loadingStep
                        ? "text-[#FF6B4A]"
                        : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            )
          )}
        </div>

        {/* Success Message */}
        {loadingStep >= 4 && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl w-full">
            <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
              <Check className="w-6 h-6" />
              <span className="font-bold text-lg">Success!</span>
            </div>
            <p className="text-sm text-green-600 font-medium">Redirecting to your dashboard...</p>
          </div>
        )}

        {/* Loading dots (only show when not complete) */}
        {loadingStep < 4 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-[#FF6B4A] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounce-in-scale {
          0% {
            transform: scale(0) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(${Math.random() * 20 - 10}deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) rotate(var(--final-rotation));
            opacity: 0.85;
          }
        }
        
        .animate-bounce-in-scale {
          animation: bounce-in-scale 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotation)); }
          50% { transform: translateY(-10px) rotate(var(--rotation)); }
        }
        
        .animate-bounce-in-scale:hover {
          animation: gentle-float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};


  const { navigateWithContext, navigationContext } = useContextualNavigation();

  // Loading state
  if (supplierLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }
// Error state
if (error || !supplier) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Supplier Not Found</h1>
        <p className="text-gray-600 mb-4">The supplier you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    <div className="pb-20 md:pb-8">
    <div className="px-4 py-3 bg-gray-50">
    <ContextualBreadcrumb currentPage="supplier-detail" />
  </div>
      {/* Mobile-First Supplier Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-8">
        
        <div className="space-y-4">
          
          {/* Mobile Layout */}
          <div className="md:hidden">
  {/* Mobile Header with Background Image */}
  <div className="relative rounded-lg overflow-hidden mb-4 min-h-[280px]">
    {/* Background Image */}
    <Image
      src={supplier?.image || "/placeholder.svg"}
      alt={supplier?.name || "Supplier"}
      fill
      className="object-cover"
    />
    {/* Dark overlay for text readability */}
    <div className="absolute inset-0 bg-black/40" />
    
    {/* Content on top of background */}
    <div className="relative z-10 p-4 text-white h-full flex flex-col">
      {/* Top section with avatar and basic info */}
      <div className="flex items-start space-x-4 mb-4">
        <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-white/30">
          <AvatarImage src={supplier?.avatar || "/placeholder.svg"} alt={supplier?.name} />
          <AvatarFallback className="text-white bg-white/20">
            {supplier?.name?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white drop-shadow-md mb-2">{supplier?.name}</h1>
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm text-white">{supplier?.rating}</span>
            <span className="text-sm text-white/80">({supplier?.reviewCount})</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{supplier?.location}</span>
          </div>
        </div>
      </div>

      {/* Mobile Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {supplier?.verified && (
          <Badge className="bg-gray-900/80 text-white text-xs border border-white/30">
            <Check className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
        {supplier?.highlyRated && (
          <Badge className="bg-yellow-500/80 text-white border border-yellow-300/50 text-xs">
            <Star className="w-3 h-3 mr-1 fill-yellow-300" />
            Highly Rated
          </Badge>
        )}
        {supplier?.fastResponder && (
          <Badge className="bg-green-500/80 text-white border border-green-300/50 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Fast Responder
          </Badge>
        )}
        {getSupplierInPartyDetails().inParty && (
          <Badge className="bg-primary-500/80 text-white text-xs border border-primary-300/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            In Party
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="flex-1 flex items-end">
        <p className="text-white/90 text-sm leading-relaxed line-clamp-3">{supplier?.description}</p>
      </div>
    </div>
  </div>
</div>
          {/* Desktop Layout */}
          {/* <div className="hidden md:block">

            <div className="flex items-start gap-6">
      
              <Avatar className="w-20 h-20">
                <AvatarImage src={supplier?.avatar || "/placeholder.svg"} alt={supplier?.name} />
                <AvatarFallback>MM</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{supplier?.name}</h1>
                  {supplier?.verified && (
                    <Badge className="bg-gray-900 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {supplier?.highlyRated && (
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                      Highly Rated
                    </Badge>
                  )}
                  {supplier?.fastResponder && (
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Fast Responder
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{supplier?.rating}</span>
                    <span className="text-gray-600">({supplier?.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier?.location}</span>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    Active since {supplier?.activeSince}
                  </Badge>
                </div>

                <p className="text-gray-700 mb-6 max-w-2xl">{supplier?.description}</p>

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
          </div> */}
          {/* Desktop Layout */}
<div className="hidden md:block">
  <div className="relative flex items-start gap-6 p-6 rounded-lg overflow-hidden min-h-[300px]">
    {/* Background Image */}
    <Image
      src={supplier?.image || "/placeholder.svg"}
      alt={supplier?.name || "Supplier"}
      fill
      className="object-cover"
    />
    {/* Dark overlay for text readability */}
    <div className="absolute inset-0 bg-black/20" />
    
    {/* Content on top of background */}
    <div className="relative z-10 flex items-start gap-6 w-full">
      <Avatar className="w-20 h-20">
        <AvatarImage src={supplier?.avatar || "/placeholder.svg"} alt={supplier?.name} />
        <AvatarFallback className="text-white bg-white/20">{supplier?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{supplier?.name}</h1>
          {supplier?.verified && (
            <Badge className="bg-gray-900 text-white">
              <Check className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {supplier?.highlyRated && (
            <Badge variant="outline" className="text-yellow-300 border-yellow-300 bg-yellow-300/20">
              <Star className="w-3 h-3 mr-1 fill-yellow-300" />
              Highly Rated
            </Badge>
          )}
          {getSupplierInPartyDetails().inParty && (
  <Badge className="bg-green-500 text-white text-xs">
    <CheckCircle className="w-3 h-3 mr-1" />
    In Party
  </Badge>
)}
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-white">{supplier?.rating}</span>
            <span className="text-white/90">({supplier?.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{supplier?.location}</span>
          </div>
        </div>

        <p className="text-white/90 mb-6 max-w-2xl">{supplier?.description}</p>

        <div className="flex gap-4">
        <Button
                        className={getAddToPartyButtonState("basic").className}
                        disabled={getAddToPartyButtonState("basic").disabled}
                        onClick={() => handleAddToPlan("basic")}
                      >
                        {getAddToPartyButtonState("basic").text}
                      </Button>
          <Button variant="outline" className="border-white/30 text-white bg-black hover:bg-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            Check Availability
          </Button>
        </div>
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
            {packages.map((pkg) => {
  const buttonState = getAddToPartyButtonState(pkg.id);
  const partyDetails = getSupplierInPartyDetails();
  const isCurrentPackage = partyDetails.inParty && partyDetails.currentPackage === pkg.id;
  
  return (
    <div
      key={pkg.id}
      className={`border-2 rounded-lg p-4 transition-all cursor-pointer bg-white ${
        selectedPackageId === pkg.id ? "border-primary-500 ring-2 ring-primary-200" : 
        isCurrentPackage ? "border-green-500 bg-green-50" :  // Highlight current package
        pkg.popular ? "border-orange-400" :
        "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => setSelectedPackageId(pkg.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{pkg.name}</h3>
        <div className="flex items-center gap-2">
          {pkg.popular && (
            <Badge className="bg-orange-500 text-white">Popular</Badge>
          )}
          {isCurrentPackage && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Current
            </Badge>
          )}
        </div>
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
  onClick={() => setSelectedPackageId(pkg.id)}  // ✅ Just selects
  variant={selectedPackageId === pkg.id ? "default" : "outline"}
  className={selectedPackageId === pkg.id ? "bg-primary-500 text-white" : ""}
>
  {selectedPackageId === pkg.id ? "✓ Selected" : "Select Package"}
</Button>
    </div>
  );
})}
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
                     className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                       pkg.popular ? "border-primary-500 bg-primary-50" : 
                       selectedPackageId === pkg.id ? "border-primary-500 bg-primary-100 ring-2 ring-primary-200" : 
                       "border-gray-200 hover:border-gray-300"
                     }`}
                     onClick={() => setSelectedPackageId(pkg.id)}  // Make whole card clickable
                   >
                        <div className="flex items-center justify-between mb-2">
  <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
  <div className="flex items-center gap-2">
    {pkg.popular && <Badge className="bg-primary-500 text-white">Popular</Badge>}
    {selectedPackageId === pkg.id && (
      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
    )}
  </div>
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
  onClick={() => setSelectedPackageId(pkg.id)}  // ✅ Just selects
  variant={selectedPackageId === pkg.id ? "default" : "outline"}
  className={selectedPackageId === pkg.id ? "bg-primary-500 text-white" : ""}
>
  {selectedPackageId === pkg.id ? "✓ Selected" : "Select Package"}
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
                      <span className="font-semibold">{supplier?.responseTime}</span>
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
            className={`flex-1 ${getAddToPartyButtonState("basic").className}`}
            onClick={() => handleAddToPlan("basic")}
            disabled={getAddToPartyButtonState("basic").disabled}
          >
            {getAddToPartyButtonState("basic").text}
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
