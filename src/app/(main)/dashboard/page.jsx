"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePartyPlan } from '@/utils/partyPlanBackend';
import { useContextualNavigation } from '@/hooks/useContextualNavigation';
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
  PlusCircle,
  PackageIcon,
  Trash2, 
  Star,
  X
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


  const [loadingCards, setLoadingCards] = useState([])

  const [isBudgetDrawerOpen, setIsBudgetDrawerOpen] = useState(false)
  const [selectedSupplierModal, setSelectedSupplierModal] = useState({
    isOpen: false,
    category: "",
  })
  const [suppliersToDelete, setSuppliersToDelete] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const welcomePopupShownRef = useRef(false)

  // Party plan backend integration
  const { 
    partyPlan, 
    loading: planLoading, 
    error: planError, 
    totalCost, 
    addons,
    removeSupplier,
    addAddon, // New function to add add-ons
    removeAddon, // New function to remove add-ons
    hasAddon // New function to check if addon exists
  } = usePartyPlan();

  useEffect(() => {
    if (hasInitialized) return;
    
    console.log('🏁 Dashboard initializing...');
    
    const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
    const storedBudget = partyDetails.budget || 600;
    
    setTempBudget(storedBudget);
    setLastProcessedBudget(storedBudget); // Mark initial budget as processed
    setHasInitialized(true);
    
    console.log('✅ Dashboard initialized with budget:', storedBudget);
  }, []);

  // 4. Track the last processed budget to prevent loops:
const [lastProcessedBudget, setLastProcessedBudget] = useState(null)
// 4. Add this for budget changes (ONLY slider changes):
useEffect(() => {
  if (!hasInitialized || isUpdating) return;
  
  // Don't update if this budget was already processed
  if (tempBudget === lastProcessedBudget) {
    console.log('⏭️ Budget already processed, skipping...');
    return;
  }
  
  console.log('🎚️ Budget slider changed to:', tempBudget);
  
  const timeoutId = setTimeout(() => {
    console.log('🚀 Updating suppliers for budget:', tempBudget);
    setLastProcessedBudget(tempBudget); // Mark as processed
    updateSuppliersForBudget(tempBudget);
  }, 2000);
  
  return () => clearTimeout(timeoutId);
}, [tempBudget, hasInitialized, isUpdating, lastProcessedBudget]);

const MobileSupplierTabs = ({ 
  suppliers, 
  loadingCards,
  suppliersToDelete,
  openSupplierModal,
  handleDeleteSupplier,
  getSupplierDisplayName
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const tabsRef = useRef(null);

  // Extended tab configuration with decorations and balloons
  const tabs = [
    {
      name: 'Party Essentials',
      emoji: '🏰',
      icon: Building,
      color: 'from-blue-400 to-purple-500',
      bgColor: 'bg-blue-500',
      types: ['venue', 'entertainment']
    },
    {
      name: 'Fun Activities',
      emoji: '🎨',
      icon: Music, 
      color: 'from-pink-400 to-red-500',
      bgColor: 'bg-pink-500',
      types: ['facePainting', 'activities']
    },
    {
      name: 'Yummy Treats',
      emoji: '🍰',
      icon: Utensils,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-500',
      types: ['catering', 'partyBags']
    },
    {
      name: 'Pretty Decorations',
      emoji: '🎀',
      icon: Palette,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-500',
      types: ['decorations', 'balloons']
    },
    {
      name: 'Magic Invites',
      emoji: '✨',
      icon: Gift,
      color: 'from-green-400 to-blue-500',
      bgColor: 'bg-green-500',
      types: ['einvites']
    }
  ];

  // Swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
    if (isRightSwipe && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  // Navigation functions
  const goToPreviousTab = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const goToNextTab = () => {
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  // Auto-scroll tab navigation
  useEffect(() => {
    if (tabsRef.current) {
      const tabWidth = 120; // Approximate width of each tab
      const scrollPosition = activeTab * tabWidth - (tabsRef.current.clientWidth / 2) + (tabWidth / 2);
      tabsRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeTab]);

  // Your exact SupplierCard component (with mobile adjustments)
  const MobileSupplierCard = ({ type, supplier }) => {
    const isLoading = loadingCards.includes(type)
    const isDeleting = suppliersToDelete.includes(type)
    
    // Handle empty supplier slot - EXACT COPY
    if (!supplier && !isLoading) {
      return (
        <Card className="border-2 border-dashed border-gray-300 overflow-hidden rounded-lg">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">+</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Add {type.charAt(0).toUpperCase() + type.slice(1)}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Find the perfect {type} for your party
              </p>
              <Button 
                variant="outline" 
                onClick={() => openSupplierModal(type)}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Browse {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Special handling for einvites card - EXACT COPY
    if (type === "einvites") {
      const hasGeneratedInvite = supplier?.image && supplier.image !== "/placeholder.jpg" && supplier?.status === "created";
      
      return (
        <Card className="border-primary-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span className="font-medium text-gray-700">E-Invites</span>
              </div>
              <div className="flex items-center space-x-2">
                {hasGeneratedInvite && (
                  <button
                    onClick={() => handleDeleteSupplier(type)}
                    className="px-2 py-1 bg-white/90 hover:bg-white rounded text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 shadow-sm transition-colors"
                    title="Remove custom invite"
                  >
                    Remove
                  </button>
                )}
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
            
            <div className="relative w-full h-[160px] overflow-hidden">
              {hasGeneratedInvite ? (
                <img
                  src={supplier.image}
                  alt={supplier?.name || "Digital Invites"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                    <span className="text-primary font-medium text-lg">Digital Invites</span>
                  </div>
                </div>
              )}
              
              {hasGeneratedInvite && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-500 text-white shadow-lg">
                    ✨ Created
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{supplier?.name || "Digital Invites"}</h3>
              <p className="text-sm text-gray-600 mb-4">{supplier?.description || "Themed e-invitations"}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">£{supplier?.price || 25}</span>
                <Badge className={
                  hasGeneratedInvite 
                    ? "bg-green-500/10 text-green-700 border-green-200" 
                    : "bg-primary/10 text-primary border-primary/30"
                }>
                  {hasGeneratedInvite ? "Ready to Send" : "Create Invites"}
                </Badge>
              </div>
            </div>
            <div className="px-4 pb-4">
              <Button 
                className="w-full bg-primary hover:bg-primary-light text-primary-foreground"
                onClick={() => window.location.href = '/e-invites'}
              >
                {hasGeneratedInvite ? "Edit & Send Invites" : "Create & Send Invites"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Regular supplier card - EXACT COPY
    return (
      <Card className={`overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-300 ${
        isDeleting ? 'opacity-50 scale-95' : ''
      }`}>
        <div className="relative aspect-[3/2] w-full">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <>
              <div className="absolute top-[-24px] left-0 w-full h-full">
                <img
                  src={supplier.image || "/placeholder.svg"}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Category badge */}
              <div className="absolute px-4 py-2 top-0 bg-primary-500 rounded-full left-3 flex items-center space-x-2 text-white text-xs z-10">
                <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
              
              {/* Status indicator and Remove button */}
              <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteSupplier(type)}
                  className="px-2 py-1 bg-white/90 hover:bg-white rounded text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 shadow-sm transition-colors"
                  title={`Remove ${type} supplier`}
                >
                  Remove
                </button>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    supplier.status === "confirmed" ? "bg-green-400" : "bg-yellow-400"
                  }`}
                />
              </div>
            </>
          )}
        </div>
      
        <CardContent className="px-4 pt-4 pb-5">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.name}</h3>
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
              <Button
                variant="outline"
                className="w-full bg-primary-500 border-none text-white hover:text-white hover:bg-[hsl(var(--primary-700))]"
                onClick={() => openSupplierModal(type)}
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : `Change ${getSupplierDisplayName(type)}`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const currentTabTypes = tabs[activeTab]?.types || [];
  const currentSuppliers = currentTabTypes.map(type => ({
    type,
    supplier: suppliers[type]
  }));

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          const hasSuppliers = tab.types.some(type => suppliers[type]);
          
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 flex flex-col items-center justify-center px-2 py-3 rounded-md text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-1 mb-1">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-500' : ''}`} />
                {hasSuppliers && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </div>
              <span className="text-center leading-tight">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content - Show suppliers for active tab */}
      <div className="space-y-6">
        {currentSuppliers.map(({ type, supplier }) => (
          <MobileSupplierCard
            key={type}
            type={type}
            supplier={supplier}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          {currentSuppliers.filter(({supplier}) => supplier).length} of {currentSuppliers.length} selected in {tabs[activeTab].name}
        </p>
      </div>
    </div>
  );
};
  


// Replace your budget change useEffect with this improved version:




  // Helper function to get budget from party details
  const getBudgetFromPartyDetails = () => {
    try {
      const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
      return partyDetails.budget || 600;
    } catch {
      return 600;
    }
  }

  // const preventBudgetUpdateOnReturn = () => {
  //   // Mark current budget as processed when user navigates away
  //   const currentBudget = getBudgetFromPartyDetails();
  //   setLastProcessedBudget(currentBudget);
  //   console.log('🔒 Locked budget at £' + currentBudget + ' to prevent updates on return');
  // }
  
  // Add effect to lock budget when component is about to unmount
  // useEffect(() => {
  //   return () => {
  //     preventBudgetUpdateOnReturn();
  //   }
  // }, [])




  // Use totalCost from party plan backend
  const totalSpent = totalCost || 0;

  // Calculate budget percentage
  const budgetPercentage = tempBudget > 0 ? Math.round((totalSpent / tempBudget) * 100) : 0

  // Budget category helper
  const getBudgetCategory = (budget) => {
    if (budget < 500) return "Essential"
    if (budget < 700) return "Complete"
    return "Premium"
  }

  const budgetControlProps = {
    totalSpent,
    tempBudget,
    setTempBudget, // Direct setter - no wrapper
    budgetPercentage,
    getBudgetCategory,
    isUpdating, // Simple state
    showAdvancedControls,
    setShowAdvancedControls,
  }

  const suppliers = {
    venue: partyPlan.venue || null,
    entertainment: partyPlan.entertainment || null,
    catering: partyPlan.catering || null,
    facePainting: partyPlan.facePainting || null,
    activities: partyPlan.activities || null,
    partyBags: partyPlan.partyBags || null,
    decorations: partyPlan.decorations || null, // NEW
    balloons: partyPlan.balloons || null, // NEW
    einvites: partyPlan.einvites || null
  };

  const { navigateWithContext } = useContextualNavigation();

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

 
  const updateSuppliersForBudget = async (newBudget) => {
    console.log('🎯 updateSuppliersForBudget called with:', newBudget);
    
    setIsUpdating(true); // Simple state
    setLoadingCards(["venue", "entertainment", "catering", "facePainting", "partyBags"]);
    
    try {
      const partyDetails = {
        date: '2025-08-16',
        theme: 'superhero', 
        guestCount: 15,
        location: 'London',
        childName: 'Test Party',
        childAge: 6,
        budget: newBudget
      };
      
      localStorage.setItem('party_details', JSON.stringify(partyDetails));
      
      const { partyBuilderBackend } = await import('@/utils/partyBuilderBackend');
      const result = await partyBuilderBackend.buildParty(partyDetails);
      
      if (result.success) {
        console.log('✅ Party updated successfully!');
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error('❌ Error updating suppliers:', error);
    }
    
    // Reset loading state
    setTimeout(() => {
      setIsUpdating(false);
      setLoadingCards([]);
    }, 1500);
  };

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     if (tempBudget !== currentBudget && !isUpdating) {
  //       updateSuppliers(tempBudget)
  //     }
  //   }, 800)
  //   return () => clearTimeout(handler)
  // }, [tempBudget, currentBudget, isUpdating])



  const handleAddSupplier = () => {
    navigateWithContext('/browse', 'dashboard');
  };

  const openSupplierModal = (category) => {
    console.log('🔍 Opening supplier modal for category:', category)
    setSelectedSupplierModal({ isOpen: true, category })
  }
  
  const closeSupplierModal = () => {
    setSelectedSupplierModal({ isOpen: false, category: "" })
  }

  const handleSupplierSelection = (supplier) => {
    console.log("✅ Successfully selected supplier:", supplier.name)
    
    // Show success message (optional)
    // You could add a toast notification here
    
    // The supplier will automatically appear in the dashboard 
    // because usePartyPlan() will re-render with the new data
  }
  const getSupplierDisplayName = (type) => {
    const displayNames = {
      venue: 'Venue',
      entertainment: 'Entertainment', 
      catering: 'Catering',
      facePainting: 'Face Painting & Activities',
      partyBags: 'Party Bags',
      decorations: 'Decorations',
      photography: 'Photography'
    }
    return displayNames[type] || type
  }
  

// Update the handleAddAddon function
const handleAddAddon = async (addon) => {
  console.log("🎁 Adding addon to party:", addon.name)
  
  // Check if addon is already in party
  if (hasAddon(addon.id)) {
    console.log("⚠️ Add-on already in party")
    // You could show a notification here
    return
  }
  
  try {
    const result = await addAddon(addon)
    if (result.success) {
      console.log("✅ Add-on added successfully!")
      // Optional: Show success notification
      setNotification({
        type: 'success',
        message: `${addon.name} added to your party!`
      })
    } else {
      console.error("❌ Failed to add addon:", result.error)
      setNotification({
        type: 'error',
        message: `Failed to add ${addon.name}`
      })
    }
  } catch (error) {
    console.error("💥 Error adding addon:", error)
  }
}
// Delete functionality
const handleDeleteSupplier = (supplierType) => {
  setShowDeleteConfirm(supplierType)
}

const confirmDeleteSupplier = async (supplierType) => {
  setSuppliersToDelete(prev => [...prev, supplierType])
  setShowDeleteConfirm(null)
  
  // Simulate removal animation
  setTimeout(async () => {
    // Special handling for e-invites - reset to default instead of removing
    if (supplierType === 'einvites') {
      const currentPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
      
      // Reset to default e-invites structure
      currentPlan.einvites = {
        id: "digital-invites",
        name: "Digital Superhero Invites",
        description: "Themed e-invitations with RSVP tracking",
        price: 25,
        status: "confirmed",
        image: "/placeholder.jpg",
        category: "Digital Services",
        priceUnit: "per set",
        addedAt: new Date().toISOString()
      };
      
      // Save back to localStorage
      localStorage.setItem('user_party_plan', JSON.stringify(currentPlan));
      
      // Remove detailed invite data
      localStorage.removeItem('party_einvites');
      
      // Trigger events for real-time updates
      const event = new CustomEvent('partyPlanUpdated', { detail: currentPlan });
      window.dispatchEvent(event);
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user_party_plan',
        newValue: JSON.stringify(currentPlan)
      }));
      
      console.log('✅ E-invite reset to default state');
    } else {
      // Regular supplier removal for other types
      const result = await removeSupplier(supplierType);
      if (result.success) {
        console.log(`Removed ${supplierType} supplier`);
      } else {
        console.error(`Failed to remove ${supplierType}:`, result.error);
      }
    }
    
    // Remove from deletion animation list
    setTimeout(() => {
      setSuppliersToDelete(prev => prev.filter(type => type !== supplierType))
    }, 500)
  }, 300)
}

const cancelDeleteSupplier = () => {
  setShowDeleteConfirm(null)
}


  // Updated SupplierCard component
  const SupplierCard = ({ type, supplier }) => {
    const isLoading = loadingCards.includes(type)
    const isDeleting = suppliersToDelete.includes(type)
    
    // Handle empty supplier slot
    if (!supplier && !isLoading) {
      return (
        <Card className="border-2 border-dashed border-gray-300 overflow-hidden rounded-lg">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">+</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Add {type.charAt(0).toUpperCase() + type.slice(1)}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Find the perfect {type} for your party
              </p>
              <Button 
  variant="outline" 
  onClick={() => openSupplierModal(type)} // 👈 Use same function as "Change"
  className="border-gray-300 text-gray-600 hover:bg-gray-50"
>
  Browse {type.charAt(0).toUpperCase() + type.slice(1)}
</Button>
            </div>
          </CardContent>
        </Card>
      );
    }

// Special handling for einvites card
if (type === "einvites") {
  const hasGeneratedInvite = supplier?.image && supplier.image !== "/placeholder.jpg" && supplier?.status === "created";
  
  const handleRemoveInvite = () => {
    // Reset e-invites to default state in party plan
    const currentPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
    
    // Reset to default e-invites structure
    currentPlan.einvites = {
      id: "digital-invites",
      name: "Digital Superhero Invites",
      description: "Themed e-invitations with RSVP tracking",
      price: 25,
      status: "confirmed",
      image: "/placeholder.jpg",
      category: "Digital Services",
      priceUnit: "per set",
      addedAt: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('user_party_plan', JSON.stringify(currentPlan));
    
    // Also remove the detailed invite data
    localStorage.removeItem('party_einvites');
    
    // Trigger events for real-time updates
    const event = new CustomEvent('partyPlanUpdated', { detail: currentPlan });
    window.dispatchEvent(event);
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_party_plan',
      newValue: JSON.stringify(currentPlan)
    }));
    
    console.log('✅ E-invite removed, reset to default state');
  };

  return (
    <Card className="border-primary-200 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span className="font-medium text-gray-700">E-Invites</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Remove button - only show when invite is created */}
            {hasGeneratedInvite && (
                <button
                onClick={() => handleDeleteSupplier(type)}
                className="px-2 py-1 bg-white/90 hover:bg-white rounded text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 shadow-sm transition-colors"
                title={`Remove ${type} supplier`}
              >
                Remove
              </button>
            )}
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
        
        {/* Image section */}
        <div className="relative w-full h-[160px] overflow-hidden">
          {hasGeneratedInvite ? (
            // Show the generated invite image
            <img
              src={supplier.image}
              alt={supplier?.name || "Digital Invites"}
              className="w-full h-full object-cover"
            />
          ) : (
            // Show default state when no image generated yet
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                <span className="text-primary font-medium text-lg">Digital Invites</span>
              </div>
            </div>
          )}
          
          {/* Status overlay */}
          {hasGeneratedInvite && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white shadow-lg">
                ✨ Created
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{supplier?.name || "Digital Invites"}</h3>
          <p className="text-sm text-gray-600 mb-4">{supplier?.description || "Themed e-invitations"}</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-gray-900">£{supplier?.price || 25}</span>
            <Badge className={
              hasGeneratedInvite 
                ? "bg-green-500/10 text-green-700 border-green-200" 
                : "bg-primary/10 text-primary border-primary/30"
            }>
              {hasGeneratedInvite ? "Ready to Send" : "Create Invites"}
            </Badge>
          </div>
        </div>
        <div className="px-4 pb-4">
          <Button className="w-full bg-primary hover:bg-primary-light text-primary-foreground" asChild>
            <Link href="/e-invites">
              {hasGeneratedInvite ? "Edit & Send Invites" : "Create & Send Invites"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
    // Regular supplier card with delete functionality
    return (
      <Card className={`overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-300 ${
        isDeleting ? 'opacity-50 scale-95' : ''
      }`}>
        <div className="relative aspect-[3/2] w-full">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <>
              <div className="absolute top-[-24px] left-0 w-full h-full">
                <Image
                  src={supplier.image || "/placeholder.svg"}
                  alt={supplier.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Category badge */}
              <div className="absolute px-4 py-2 top-0 bg-primary-500 rounded-full left-3 flex items-center space-x-2 text-white text-xs z-10">
                <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
              
              {/* Status indicator and Remove button */}
              <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteSupplier(type)}
                  className="px-2 py-1 bg-white/90 hover:bg-white rounded text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 shadow-sm transition-colors"
                  title={`Remove ${type} supplier`}
                >
                  Remove
                </button>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    supplier.status === "confirmed" ? "bg-green-400" : "bg-yellow-400"
                  }`}
                />
              </div>
            </>
          )}
        </div>
      
        <CardContent className="px-4 pt-4 pb-5">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.name}</h3>
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
              <Button
  variant="outline"
  className="w-full bg-primary-500 border-none text-white hover:text-white hover:bg-[hsl(var(--primary-700))]"
  onClick={() => openSupplierModal(type)}
  disabled={isDeleting}
>
  {isDeleting ? "Removing..." : `Change ${getSupplierDisplayName(type)}`}
</Button>

            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const [partyTheme, setPartyTheme] = useState("superhero")
  const [themeLoaded, setThemeLoaded] = useState(false)
// Add remove addon handler
const handleRemoveAddon = async (addonId) => {
  try {
    const result = await removeAddon(addonId)
    if (result.success) {
      console.log("✅ Add-on removed successfully!")
      setNotification({
        type: 'success',
        message: 'Add-on removed from your party'
      })
    } else {
      console.error("❌ Failed to remove addon:", result.error)
    }
  } catch (error) {
    console.error("💥 Error removing addon:", error)
  }
}


const PartyHeader = ({ theme, partyDetails }) => {
  const themeConfig = {
    'spiderman': {
      name: "Spider-Man",
      image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=400&fit=crop&crop=center", 
      badgeClass: "bg-red-600 hover:bg-red-700 text-white shadow-lg",
      gradient: "from-red-600 via-red-500 to-blue-600",
      description: "Web-slinging superhero adventure"
    },
    'taylor-swift': {
      name: "Taylor Swift",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&crop=center",
      badgeClass: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg",
      gradient: "from-purple-600 via-pink-500 to-yellow-400",
      description: "Pop star concert experience"
    },
    'princess': {
      name: "Princess",
      image: "https://images.unsplash.com/photo-1595274013294-6946aac9eb22?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByaW5jZXNzfGVufDB8MHwwfHx8MA%3D%3D",
      badgeClass: "bg-pink-500 hover:bg-pink-600 text-white shadow-lg",
      gradient: "from-pink-400 via-purple-400 to-yellow-300",
      description: "Royal fairy tale adventure"
    },
    'dinosaur': {
      name: "Dinosaur",
      image: "https://plus.unsplash.com/premium_photo-1741048753391-c60c32b7d750?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGRpbm9zYXVyJTIwY2FydG9vbnxlbnwwfDB8MHx8fDA%3D",
      badgeClass: "bg-green-600 hover:bg-green-700 text-white shadow-lg", 
      gradient: "from-green-600 via-yellow-500 to-orange-500",
      description: "Prehistoric discovery adventure"
    },
    'unicorn': {
      name: "Unicorn", 
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center",
      badgeClass: "bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white shadow-lg",
      gradient: "from-pink-400 via-purple-400 to-blue-400",
      description: "Magical rainbow adventure"
    },
    'science': {
      name: "Science",
      image: "https://plus.unsplash.com/premium_photo-1663089905440-78880eab98c1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHNjaWVuY2UlMjBjYXJ0b29uJTIwbGFifGVufDB8MHwwfHx8MA%3D%3D",
      badgeClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg",
      gradient: "from-blue-600 via-cyan-500 to-green-500", 
      description: "Mad scientist laboratory"
    },
    'superhero': {
      name: "Superhero",
      image: "/superhero.webp",
      badgeClass: "bg-blue-500 hover:bg-blue-600 text-white shadow-lg",
      gradient: "from-blue-500 via-red-500 to-yellow-500",
      description: "Epic superhero adventure"
    },
    'default': {
      name: "Party",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=400&fit=crop&crop=center",
      badgeClass: "bg-gray-500 hover:bg-gray-600 text-white shadow-lg",
      gradient: "from-gray-500 to-gray-600",
      description: "Amazing party experience"
    }
  };

  const currentTheme = themeConfig[theme] || themeConfig['default'];
  
  return (
    <div className="relative rounded-xl shadow-2xl overflow-hidden mb-8 h-[150px] md:min-h-[250px]">
    {/* Background Image */}
    <img
      src={currentTheme.image}
      alt={`${currentTheme.name} party background`}
      className="absolute inset-0 w-full h-full object-cover"
    />
    
    {/* Gradient Overlay */}
    <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} opacity-60`} />
    <div className="absolute inset-0 bg-black/30" />
    
    {/* Content */}
    <div className="relative p-4 md:p-8 text-white h-full flex flex-col justify-center">
      <div className="space-y-0 md:space-y-4">
        {/* Theme Badge and Edit Button */}
        <div className="flex items-center justify-between">
          <Badge className={`${currentTheme.badgeClass} md:px-3 md:py-1 text-xs font-semibold`}>
            {currentTheme.name}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 md:p-2 h-auto text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            title="Edit party details"
          >
            <Edit className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
        
        {/* Party Title - Responsive sizing */}
        <div>
          <h1 className="text-lg md:text-5xl font-bold text-white drop-shadow-lg mb-1 md:mb-2 leading-tight">
            {partyDetails?.childName}'s {currentTheme.name} Party
          </h1>
          <p className="text-sm md:text-xl text-white/90 drop-shadow-md hidden md:block">
            {currentTheme.description}
          </p>
        </div>
        
        {/* Party Details - Compact mobile layout */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/95 pt-2 md:pt-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 md:p-2 bg-white/20 rounded-full">
              <Calendar className="w-3 h-3 md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90">Date</p>
              <p className="font-semibold text-xs md:text-sm">{partyDetails.date}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 md:p-2 bg-white/20 rounded-full">
              <Users className="w-3 h-3 md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90">Age</p>
              <p className="font-semibold text-xs md:text-sm">{partyDetails.childAge} years</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 md:p-2 bg-white/20 rounded-full">
              <MapPin className="w-3 h-3 md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90">Location</p>
              <p className="font-semibold text-xs md:text-sm truncate max-w-[100px] md:max-w-none">
                {partyDetails.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};


useEffect(() => {
  if (themeLoaded) return;
  
  console.log('🎨 Loading party theme from details...');
  
  try {
    const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
    const storedTheme = partyDetails.theme;
    
    if (storedTheme) {
      console.log('🎭 Found stored theme:', storedTheme);
      setPartyTheme(storedTheme);
    } else {
      console.log('🎪 No theme found, using default: superhero');
      setPartyTheme('superhero');
    }
    
    setThemeLoaded(true);
  } catch (error) {
    console.error('Error loading theme:', error);
    setPartyTheme('superhero');
    setThemeLoaded(true);
  }
}, [themeLoaded]);


  // Helper function to get party details
  const getPartyDetails = () => {
    try {
      const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');
      return {
        childName: partyDetails.childName || 'Emma',
        date: partyDetails.date || 'Saturday, June 14, 2025 • 2:00 PM - 4:00 PM',
        childAge: partyDetails.childAge || 6,
        location: 'Manchester, M1 4BT'
      };
    } catch {
      return {
        childName: 'Emma',
        date: 'Saturday, June 14, 2025 • 2:00 PM - 4:00 PM', 
        childAge: 6,
        location: 'Manchester, M1 4BT'
      };
    }
  };



  
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container min-w-screen px-4 sm:px-6 lg:px-8 py-8">
       

        {/* Party Header */}
        
        <PartyHeader theme={partyTheme} partyDetails={getPartyDetails()} />
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-8">
          <div className="hidden md:flex justify-end mb-4">
  <button 
    onClick={handleAddSupplier} 
    className="bg-primary-500 px-4 py-3 text-white hover:bg-[hsl(var(--primary-700))] rounded"
  >
    Add New Supplier
  </button>
</div>

            {/* Party Categories Grid */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
  <SupplierCard type="venue" supplier={suppliers.venue} />
  <SupplierCard type="entertainment" supplier={suppliers.entertainment} />
  <SupplierCard type="catering" supplier={suppliers.catering} />
  <SupplierCard type="facePainting" supplier={suppliers.facePainting} />
  <SupplierCard type="activities" supplier={suppliers.activities} />  
  <SupplierCard type="partyBags" supplier={suppliers.partyBags} />
  <SupplierCard type="decorations" supplier={suppliers.decorations} />
  <SupplierCard type="einvites" supplier={suppliers.einvites} />
</div>

{/* Mobile Tabs - ONLY show on mobile */}
<div className="md:hidden">
  <MobileSupplierTabs
    suppliers={suppliers}
    loadingCards={loadingCards}
    suppliersToDelete={suppliersToDelete}
    openSupplierModal={openSupplierModal}
    handleDeleteSupplier={handleDeleteSupplier}
    getSupplierDisplayName={getSupplierDisplayName}
  />
</div>
            {addons && addons.length > 0 && (
  <div className="mt-8">
    <div className="flex items-center justify-between mb-6">
      <div>
  
        <h2 className="text-2xl font-bold text-gray-900">Your Add-ons</h2>
        <p className="text-gray-600 mt-1">Extra services to make your party even more special</p>
      </div>
      <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200 px-3 py-1">
        {addons.length} {addons.length === 1 ? 'Add-on' : 'Add-ons'} Selected
      </Badge>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {addons.map((addon) => (
        <Card 
          key={addon.id} 
          onClick={() => console.log("h")} 
          className="group border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
        >
          <CardContent className="p-0">
            {/* Image Section */}
            <div className="relative h-40 bg-gray-100">
              <Image
                src={addon.image || "/placeholder.svg"}
                alt={addon.name}
                fill

                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Status badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {addon.popular && (
                  <Badge className="bg-primary-500 text-white text-xs px-2 py-1 shadow-sm">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {addon.limitedTime && (
                  <Badge className="bg-orange-500 text-white text-xs px-2 py-1 shadow-sm">
                    Limited Time
                  </Badge>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation() // Prevent card navigation
                  handleRemoveAddon(addon.id)
                }}
                className="no-navigate absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors group/remove"
                title="Remove add-on"
              >
                <X className="w-4 h-4 text-gray-600 group-hover/remove:text-red-600 transition-colors" />
              </button>
            </div>

            {/* Content Section */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">{addon.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{addon.rating}</span>
                      <span className="text-gray-500">({addon.reviewCount})</span>
                    </div>
                    <span>•</span>
                    <span>{addon.duration}</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-xl font-bold text-primary-600">£{addon.price}</div>
                  {addon.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">£{addon.originalPrice}</div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{addon.description}</p>

              {/* Status and category */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Added to Party
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {addon.category}
                </span>
              </div>

              {/* Click hint */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view details →
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Summary card - keep this unchanged */}
    <Card className="mt-6 bg-primary-50 border-primary-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add-ons Total</h3>
              <p className="text-sm text-gray-600">
                {addons.length} premium {addons.length === 1 ? 'service' : 'services'} selected
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-700">
              £{addons.reduce((sum, addon) => sum + addon.price, 0)}
            </div>
            <div className="text-sm text-gray-600">Total for add-ons</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}

  {/* Recommended Add-ons Section */}
  <div className="w-screen pr-6 md:pr-20">
    <RecommendedAddons 
      context="dashboard" 
      maxItems={4} 
      onAddToCart={handleAddAddon}
    />
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

      {/* <FloatingInviteButton daysUntilParty={30} showAfterScroll={true} /> */}
      <SupplierSelectionModal
  isOpen={selectedSupplierModal?.isOpen}
  onClose={closeSupplierModal}
  category={selectedSupplierModal?.category}
  theme="Superhero"
  date="June 15, 2025"
  onSelectSupplier={handleSupplierSelection}
/>
      <WelcomeDashboardPopup isOpen={showWelcomePopup} onClose={handleCloseWelcomePopup} />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Remove Supplier</h3>
              <button
                onClick={cancelDeleteSupplier}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove the {showDeleteConfirm} supplier from your party? 
              This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={cancelDeleteSupplier}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmDeleteSupplier(showDeleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}