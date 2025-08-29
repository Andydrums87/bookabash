"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb";
import AuthModal from "@/components/AuthModal";

import { useContextualNavigation } from '@/hooks/useContextualNavigation';
import MissingSuppliersSuggestions from '@/components/MissingSuppliersSuggestions';
import { usePartyPlan } from "@/utils/partyPlanBackend";
import { useToast } from '@/components/ui/toast';
import Image from 'next/image';

import { 
  Send, 
  Calendar, 
  Clock, 
  MapPin, 
  Zap,
  Users, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Edit3,
  User,
  Phone,
  Mail,
  Heart,
  MessageSquare,
  Calculator,
  Info,
  Gift,
  Package,
  ArrowRight,
  X,
  Minimize2,
  Maximize2,
  Building,
  Music,
  Utensils,
  Palette
} from 'lucide-react';
import { useRouter } from "next/navigation"

// Import auth and database functions
import { supabase } from "@/lib/supabase";
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend";
import { calculateSupplierPrice, isLeadTimeSupplier } from '@/utils/supplierPricingHelpers'

import DeleteConfirmDialog from '../../dashboard/components/Dialogs/DeleteConfirmDialog';

export default function SnappyChatReviewPage() {
  const router = useRouter();
  const { removeSupplier } = usePartyPlan();
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalCTA, setShowFinalCTA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [partyDetails, setPartyDetails] = useState({});
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [authRequired, setAuthRequired] = useState(false);
  const [fullSupplierData, setFullSupplierData] = useState({});
  const [hasAddedOnCurrentStep, setHasAddedOnCurrentStep] = useState(false);
const [initialSupplierCount, setInitialSupplierCount] = useState(0);
const [ loadingError, setLoadingError] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const { toast } = useToast()

  
// Updated formData state initialization
const [formData, setFormData] = useState({
  parentName: "",
  phoneNumber: "",
  email: "",
  // New address fields
  addressLine1: "",
  addressLine2: "", // Optional
  city: "",
  postcode: "",
  numberOfChildren: "",
  dietaryRequirements: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    nutAllergy: false,
  },
  accessibilityRequirements: {
    wheelchairAccessible: false,
    sensoryFriendly: false,
  },
  additionalMessage: "",
});
const { navigateWithContext} = useContextualNavigation()
  // Load data on mount
  useEffect(() => {
    loadPartyDataFromLocalStorage();
    checkAuthStatusAndLoadProfile();
  }, []);

  // Show auth modal immediately if user is not signed in
  useEffect(() => {
    console.log("🔄 Auth effect triggered:", { 
      loadingProfile, 
      user: !!user, 
      authRequired, 
      showAuthModal 
    });
    
    if (!loadingProfile && !user && !authRequired) {
      console.log("🔐 User not authenticated, showing auth modal");
      setAuthRequired(true);
      setShowAuthModal(true);
    } else if (!loadingProfile && user && authRequired) {
      console.log("✅ User authenticated, clearing auth requirement");
      setAuthRequired(false);
      setShowAuthModal(false);
    }
  }, [loadingProfile, user, authRequired, showAuthModal]);


  useEffect(() => {
    // Check if we need to restore to a specific step
    const urlParams = new URLSearchParams(window.location.search)
    const restoreParam = urlParams.get('restore')
    const supplierAdded = urlParams.get('added')
    const supplierName = urlParams.get('supplier')
    
    if (restoreParam === 'step4') {
      const storedState = sessionStorage.getItem('reviewBookRestoreState')
      
      // Always restore to step 3 if the URL says so, even without stored state
      console.log('🔄 Restoring to step 4 (forgotten step)')
      setCurrentStep(3) // Set to step 3 (forgotten step) - array is 0-indexed so this is step 4
      
      // If we have supplier added info, show success
      if (supplierAdded === 'true' && supplierName) {
        console.log('✅ Supplier was added:', decodeURIComponent(supplierName))
        // You can add a toast notification here if you have one
        toast.success(`${decodeURIComponent(supplierName)} added to your party!`)
      }
      
      // Clear stored state if it exists
      if (storedState) {
        sessionStorage.removeItem('reviewBookRestoreState')
      }
      
      // Clean up URL
      window.history.replaceState({}, '', '/review-book')
    }
  }, [])
  useEffect(() => {
    if (currentStep === 3) { // Step 4 is the "forgotten/missing suppliers" step
      setInitialSupplierCount(selectedSuppliers.length);
      setHasAddedOnCurrentStep(false);
    }
  }, [currentStep]);
  useEffect(() => {
    if (currentStep === 3)  { // Only track on the missing suppliers step
      const currentCount = selectedSuppliers.length;
      const hasAdded = currentCount > initialSupplierCount;
      setHasAddedOnCurrentStep(hasAdded);
      
      console.log('📊 Supplier count tracking:', {
        initial: initialSupplierCount,
        current: currentCount,
        hasAdded: hasAdded
      });
    }
  }, [selectedSuppliers, currentStep, initialSupplierCount]);
    

  const loadPartyDataFromLocalStorage = () => {
    try {
      // Get party details
      const details = JSON.parse(localStorage.getItem("party_details") || "{}");
      
      // Format date for display
      const formatDateForDisplay = (dateInput) => {
        if (!dateInput) return "TBD";
        
        let date;
        
        if (dateInput instanceof Date) {
          date = dateInput;
        } else if (typeof dateInput === 'string') {
          // If it's already in display format, return as is
          if (dateInput.includes('th ') || dateInput.includes('st ') || dateInput.includes('nd ') || dateInput.includes('rd ')) {
            return dateInput;
          }
          date = new Date(dateInput);
        } else {
          return "TBD";
        }
        
        if (isNaN(date.getTime())) {
          return "TBD";
        }
        
        // Format as "12th July, 2025"
        const day = date.getDate();
        const suffix = getDaySuffix(day);
        const month = date.toLocaleDateString('en-GB', { month: 'long' });
        const year = date.getFullYear();
        
        return `${day}${suffix} ${month}, ${year}`;
      };

      const getDaySuffix = (day) => {
        if (day >= 11 && day <= 13) {
          return 'th';
        }
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      // Format time for display - prioritize startTime over timeSlot
      const formatTimeForDisplay = (details) => {
        // Priority 1: Check for startTime (new format)
        if (details.startTime) {
          const duration = details.duration || 2;
          
          try {
            // Format start time
            const [hours, minutes] = details.startTime.split(':');
            const startDate = new Date();
            startDate.setHours(parseInt(hours), parseInt(minutes || 0));
            
            const formattedStart = startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: minutes && minutes !== '00' ? '2-digit' : undefined,
              hour12: true,
            });
            
            // Calculate end time
            const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000));
            const formattedEnd = endDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: endDate.getMinutes() > 0 ? '2-digit' : undefined,
              hour12: true,
            });
            
            return `${formattedStart} - ${formattedEnd}`;
          } catch (error) {
            console.error('Error formatting startTime:', error);
            return "TBD";
          }
        }

        // Priority 2: Legacy time field (already formatted)
        if (details.time && details.time.includes('-')) {
          return details.time;
        }

        // Priority 3: Convert legacy timeSlot to time range (backwards compatibility)
        if (details.timeSlot && details.duration) {
          const timeSlotTimes = {
            morning: "10:00",
            afternoon: "14:00"
          };
          
          const startTime = timeSlotTimes[details.timeSlot];
          if (startTime) {
            try {
              const [hours, minutes] = startTime.split(':');
              const startDate = new Date();
              startDate.setHours(parseInt(hours), parseInt(minutes));
              
              const formattedStart = startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              
              const endDate = new Date(startDate.getTime() + (details.duration * 60 * 60 * 1000));
              const formattedEnd = endDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              
              return `${formattedStart} - ${formattedEnd}`;
            } catch (error) {
              console.error('Error converting timeSlot:', error);
            }
          }
        }
        
        // Priority 4: Legacy time field as-is
        if (details.time) {
          return details.time;
        }
        
        return "TBD";
      };

      // Set formatted party details
      setPartyDetails({
        date: formatDateForDisplay(details.date),
        time: formatTimeForDisplay(details),
        theme: details.theme || "Party",
        location: details.location || "TBD",
        age: details.childAge || "TBD",
        childName: details.childName || "Your Child",
        
        // Keep raw data for migration and PartySummaryCard
        rawDate: details.date,
        rawStartTime: details.startTime,
        startTime: details.startTime,
        duration: details.duration,
        postcode: details.postcode
      });

      // Process party plan and EXCLUDE einvites
      const partyPlan = JSON.parse(localStorage.getItem("user_party_plan") || "{}");
      const suppliers = [];
      const fullSupplierData = {};

      // Only process real supplier types, NOT einvites
      const realSupplierTypes = [
        'venue', 'entertainment', 'catering', 'decorations', 
        'facePainting', 'activities', 'partyBags', 'balloons', 'cakes'
      ];

      realSupplierTypes.forEach((key) => {
        const supplier = partyPlan[key];
        
        // Only include if supplier exists and has a name
        if (supplier && supplier.name) {
          const iconMap = {
            venue: <Building className="w-5 h-5" />,
            entertainment: <Music className="w-5 h-5" />,
            catering: <Utensils className="w-5 h-5" />,
            decorations: <Palette className="w-5 h-5" />,
            facePainting: <Palette className="w-5 h-5" />,
            activities: <Music className="w-5 h-5" />,
            partyBags: <Palette className="w-5 h-5" />,
            balloons: <Palette className="w-5 h-5" />,
            cakes: <Palette className="w-5 h-5" />,
          };
      
          suppliers.push({
            id: supplier.id || key,
            name: supplier.name,
            category: supplier.category || key.charAt(0).toUpperCase() + key.slice(1),
            icon: iconMap[key] || <Info className="w-5 h-5" />,
            image: supplier.image || supplier.imageUrl || supplier.originalSupplier?.image,
            price: supplier.price,
            description: supplier.description,
            supplierType: key, // Add this for removal functionality
          });
          
          fullSupplierData[key] = supplier;
        }
      });

      // Clean up any einvites from localStorage if it exists
      if (partyPlan.einvites) {
        console.log('🧹 Removing einvites from user_party_plan during review load');
        delete partyPlan.einvites;
        localStorage.setItem("user_party_plan", JSON.stringify(partyPlan));
      }

      // Get add-ons from party plan
      const addons = partyPlan.addons || [];
      setSelectedAddons(addons);
      setSelectedSuppliers(suppliers);
      setFullSupplierData(fullSupplierData);

      console.log("📋 Loaded party data from localStorage:", {
        details,
        suppliers: suppliers.length,
        addons: addons.length,
        formattedDate: formatDateForDisplay(details.date),
        formattedTime: formatTimeForDisplay(details),
        excludedEinvites: !!partyPlan.einvites
      });
    } catch (error) {
      console.error("❌ Error loading party data:", error);
    }
  };

  const checkAuthStatusAndLoadProfile = async () => {
    try {
      setLoadingProfile(true);
      console.log("Checking auth status...");
      
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
  
      console.log("Auth check result:", { user: !!user, error });
  
      if (user && !error) {
        console.log("Found authenticated user:", user.email);
  
        // Check if this is a SUPPLIER (not a customer) - suppliers have their own table
        const { data: supplierRecord } = await supabase
          .from("suppliers")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();
  
        if (supplierRecord) {
          // This is a supplier account, not a customer - treat as not signed in
          console.log("Detected supplier account, treating as not signed in for customer flow");
          setUser(null);
          setCustomerProfile(null);
          setLoadingProfile(false);
          return;
        }
  
        setUser(user);
  
        // Get or create customer profile from 'users' table
        const result = await partyDatabaseBackend.getCurrentUser();
        if (result.success) {
          console.log("Found user profile:", result.user);
          setCustomerProfile(result.user);
  
          // Auto-populate form with user data including address
          setFormData((prev) => ({
            ...prev,
            parentName: `${result.user.first_name || ""} ${result.user.last_name || ""}`.trim() || prev.parentName,
            email: result.user.email || user.email || prev.email,
            phoneNumber: result.user.phone || prev.phoneNumber,
            
            // Populate address fields if available in users table
            addressLine1: result.user.address_line_1 || prev.addressLine1,
            addressLine2: result.user.address_line_2 || prev.addressLine2,
            city: result.user.city || prev.city,
            postcode: result.user.postcode || prev.postcode,
          }));
  
          console.log("Form auto-populated with user data including address");
        } else {
          console.log("No user profile found, will create one during migration");
          // Still populate what we can from auth user
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
            parentName: user.user_metadata?.full_name || prev.parentName,
            phoneNumber: user.user_metadata?.phone || prev.phoneNumber,
          }));
        }
      } else {
        console.log("No authenticated user found");
        setUser(null);
        setCustomerProfile(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setCustomerProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (category, field, checked) => {
    console.log('🔄 Checkbox clicked:', { category, field, checked });
    console.log('📋 Current formData before update:', formData[category]);
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: checked,
        },
      };
      
      console.log('✅ Updated formData:', updated[category]);
      return updated;
    });
  };

  // Enhanced loading with debugging
  useEffect(() => {
    const loadAddons = () => {
      try {
        // Check both possible localStorage keys
        const partyPlan = localStorage.getItem('party_plan');
        const userPartyPlan = localStorage.getItem('user_party_plan');
        
        // Try party_plan first
        let addons = [];
        if (partyPlan) {
          const planData = JSON.parse(partyPlan);
          addons = planData.addons || [];
        }
        
        // If no addons, try user_party_plan
        if (addons.length === 0 && userPartyPlan) {
          const userPlanData = JSON.parse(userPartyPlan);
          addons = userPlanData.addons || [];
        }
        
        setSelectedAddons(addons);
      } catch (error) {
        console.error('❌ DEBUG: Error loading addons:', error);
        setSelectedAddons([]);
      }
    };
    
    loadAddons();
    
    // Enhanced storage listener
    const handleStorageChange = (e) => {
      console.log('🔄 DEBUG: Storage change event:', e.key, e.newValue);
      if (e.key === 'party_plan' || e.key === 'user_party_plan') {
        console.log('🔄 DEBUG: Party plan changed, reloading addons');
        loadAddons();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

 // Updated migration function to handle new time format and full address
// Updated migration function to handle new time format and full address
const migratePartyToDatabase = async (authenticatedUser) => {
  try {
    setIsMigrating(true);
    console.log("Starting party migration to database...");

    // Get localStorage data
    const partyDetailsLS = JSON.parse(localStorage.getItem("party_details") || "{}");
    const partyPlanLS = JSON.parse(localStorage.getItem("user_party_plan") || "{}");

    console.log("localStorage data:", { partyDetailsLS, partyPlanLS });

    // Validate required address fields before proceeding
    if (!formData.addressLine1 || !formData.city || !formData.postcode) {
      throw new Error("Please complete all required address fields");
    }

    // Ensure user profile exists in 'users' table with full address and contact details
    const userResult = await partyDatabaseBackend.createOrGetUser({
      firstName: formData.parentName.split(" ")[0] || partyDetailsLS.childName || "Party Host",
      lastName: formData.parentName.split(" ").slice(1).join(" ") || "",
      email: authenticatedUser.email,
      phone: formData.phoneNumber || authenticatedUser.user_metadata?.phone || "",
      
      // Full address information
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || "", // Optional field
      city: formData.city,
      postcode: formData.postcode,
      
      // Legacy postcode field (for backwards compatibility)
      postcode: formData.postcode || partyDetailsLS.postcode || partyDetailsLS.location || "",
    });

    if (!userResult.success) {
      throw new Error(`Failed to create user profile: ${userResult.error}`);
    }

    console.log("User profile ready with full address:", userResult.user.id);

    // Helper function to calculate end time
    const calculateEndTime = (startTime, duration) => {
      try {
        const [hours, minutes] = startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes || 0));
        
        const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000));
        
        return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      } catch (error) {
        console.error("Error calculating end time:", error);
        return "16:00"; // Default fallback
      }
    };

    // Handle time data - prioritize new format
    const getTimeData = () => {
      // Priority 1: Check for startTime (new format)
      if (partyDetailsLS.startTime) {
        console.log("Using new startTime format:", partyDetailsLS.startTime);
        const endTime = calculateEndTime(partyDetailsLS.startTime, partyDetailsLS.duration || 2);
        return {
          time: partyDetailsLS.startTime, // Keep for backwards compatibility
          startTime: partyDetailsLS.startTime, // New start_time column
          endTime: endTime, // New end_time column
          duration: partyDetailsLS.duration || 2,
          timePreference: {
            type: 'specific',
            startTime: partyDetailsLS.startTime,
            duration: partyDetailsLS.duration || 2,
            endTime: endTime
          }
        };
      }
      
      // Priority 2: Legacy timeSlot format
      if (partyDetailsLS.timeSlot) {
        console.log("Using legacy timeSlot format:", partyDetailsLS.timeSlot);
        const timeSlotToTime = {
          morning: "10:00",
          afternoon: "14:00"
        };
        const startTime = timeSlotToTime[partyDetailsLS.timeSlot] || "14:00";
        const endTime = calculateEndTime(startTime, partyDetailsLS.duration || 2);
        
        return {
          time: startTime, // Keep for backwards compatibility
          startTime: startTime, // New start_time column
          endTime: endTime, // New end_time column
          duration: partyDetailsLS.duration || 2,
          timePreference: {
            type: 'flexible',
            slot: partyDetailsLS.timeSlot,
            duration: partyDetailsLS.duration || 2,
            startTime: startTime
          }
        };
      }
      
      // Fallback
      console.log("No time data found, using default");
      return {
        time: "14:00", // Keep for backwards compatibility
        startTime: "14:00", // New start_time column
        endTime: "16:00", // New end_time column
        duration: 2,
        timePreference: {
          type: 'flexible',
          slot: 'afternoon',
          duration: 2,
          startTime: "14:00"
        }
      };
    };

    const timeData = getTimeData();
    console.log("Final time data for database:", timeData);

    // Format full address for display and storage
    const formatFullAddress = () => {
      const parts = [
        formData.addressLine1,
        formData.addressLine2,
        formData.city,
        formData.postcode
      ].filter(Boolean); // Remove empty parts
      
      return parts.join(', ');
    };

    // Build comprehensive dietary requirements object
    const dietaryRequirementsArray = [];
    if (formData.dietaryRequirements.vegetarian) dietaryRequirementsArray.push('Vegetarian');
    if (formData.dietaryRequirements.vegan) dietaryRequirementsArray.push('Vegan');
    if (formData.dietaryRequirements.glutenFree) dietaryRequirementsArray.push('Gluten-Free');
    if (formData.dietaryRequirements.nutAllergy) dietaryRequirementsArray.push('Nut Allergy');

    // Build accessibility requirements object
    const accessibilityRequirementsArray = [];
    if (formData.accessibilityRequirements.wheelchairAccessible) accessibilityRequirementsArray.push('Wheelchair Accessible');
    if (formData.accessibilityRequirements.sensoryFriendly) accessibilityRequirementsArray.push('Sensory Friendly');

    // Create comprehensive party data with all new fields
    const partyData = {
      // Basic party information
      childName: partyDetailsLS.childName || "Your Child",
      childAge: parseInt(partyDetailsLS.childAge) || 6,
      date: partyDetailsLS.date || new Date().toISOString().split("T")[0],
      
      // Time information (multiple formats for compatibility)
      time: timeData.time,
      startTime: timeData.startTime,
      start_time: timeData.startTime,
      endTime: timeData.endTime,
      end_time: timeData.endTime,
      duration: timeData.duration,
      timePreference: timeData.timePreference,
      
      // Guest and location information
      guestCount: parseInt(formData.numberOfChildren?.split("-")[0]) || parseInt(partyDetailsLS.guestCount) || 15,
      location: partyDetailsLS.location || formatFullAddress(), // Use full address as location fallback
      postcode: formData.postcode || partyDetailsLS.postcode || "",
      
      // Full delivery address information
      deliveryAddress: {
        line1: formData.addressLine1,
        line2: formData.addressLine2,
        city: formData.city,
        postcode: formData.postcode,
        fullAddress: formatFullAddress()
      },
      
      // Individual address fields for database columns
      deliveryAddressLine1: formData.addressLine1,
      deliveryAddressLine2: formData.addressLine2,
      deliveryCity: formData.city,
      deliveryPostcode: formData.postcode,
      fullDeliveryAddress: formatFullAddress(),
      
      // Contact information
      parentName: formData.parentName,
      parentEmail: formData.email,
      parentPhone: formData.phoneNumber,
      
      // Party preferences and requirements
      theme: partyDetailsLS.theme || "party",
      budget: parseInt(partyDetailsLS.budget) || 600,
      specialRequirements: formData.additionalMessage || "",
      
      // Dietary requirements (both as object and array)
      dietaryRequirements: formData.dietaryRequirements,
      dietaryRequirementsArray: dietaryRequirementsArray,
      hasDietaryRequirements: dietaryRequirementsArray.length > 0,
      
      // Accessibility requirements (both as object and array)
      accessibilityRequirements: formData.accessibilityRequirements,
      accessibilityRequirementsArray: accessibilityRequirementsArray,
      hasAccessibilityRequirements: accessibilityRequirementsArray.length > 0,
      
      // Additional metadata
      submittedAt: new Date().toISOString(),
      status: 'draft' // Always use draft status to match database constraint
    };

    console.log("Creating party with comprehensive data including:", {
      deliveryAddress: partyData.deliveryAddress,
      dietaryRequirements: dietaryRequirementsArray,
      accessibilityRequirements: accessibilityRequirementsArray,
      contactInfo: {
        name: partyData.parentName,
        email: partyData.parentEmail,
        phone: partyData.parentPhone
      }
    });

    // Create the party in the database
    const createResult = await partyDatabaseBackend.createParty(partyData, partyPlanLS);

    if (!createResult.success) {
      throw new Error(`Failed to create party: ${createResult.error}`);
    }

    console.log("Party migrated successfully to database with full address and requirements:", createResult.party.id);
    
    // Optional: Store party ID in localStorage for reference
    localStorage.setItem("migrated_party_id", createResult.party.id);
    
    return createResult.party;
    
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    setIsMigrating(false);
  }
};
  const handleAuthSuccess = async (authenticatedUser, userData = null) => {
    console.log("✅ Authentication successful, user can now access the review page");
    console.log("👤 User data received:", userData);

    // Close the modal and clear auth requirement
    setShowAuthModal(false);
    setAuthRequired(false);

    // Update the user state
    setUser(authenticatedUser);

    // Prefill form with user data if provided
    if (userData) {
      console.log("📝 Prefilling form with user data");
      setFormData((prev) => ({
        ...prev,
        parentName:
          userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : userData.firstName || prev.parentName,
        email: userData.email || prev.email,
        phoneNumber: userData.phone || prev.phoneNumber,
      }));
    } else {
      // Fallback: try to get data from the authenticated user
      const fullName = authenticatedUser.user_metadata?.full_name;
      setFormData((prev) => ({
        ...prev,
        parentName: fullName || prev.parentName,
        email: authenticatedUser.email || prev.email,
        phoneNumber: authenticatedUser.user_metadata?.phone || prev.phoneNumber,
      }));
    }
  };

  const handleSubmitEnquiry = async () => {
    console.log('Starting payment flow...');
    
    try {
      setIsSubmitting(true);
      setLoadingError(null);
      
      // Calculate supplier count
      const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
      const supplierCount = Object.values(partyPlan).filter(supplier => 
        supplier && typeof supplier === 'object' && supplier.name
      ).length;
  
      // Migrate party to database (no enquiries sent)
      console.log("Migrating party to database...");
      const migratedParty = await migratePartyToDatabase(user);
      console.log("Migration complete:", migratedParty);
      
      // NEW: Set status to 'draft' after migration
      await supabase
        .from('parties')
        .update({ status: 'draft' })
        .eq('id', migratedParty.id);
      
      console.log("Party status set to draft");
      
      // Small delay for UX, then redirect to payment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const paymentUrl = `/payment/secure-party?party_id=${migratedParty.id}&suppliers=${supplierCount}`;
      router.push(paymentUrl);
  
    } catch (error) {
      console.error("Migration failed:", error);
      setLoadingError(error.message);
      setIsSubmitting(false);
    }
  };

  // Handle removing suppliers in final CTA - show confirmation modal first
  const handleRemoveSupplier = async (supplierType, supplierId) => {
    console.log('🗑️ Opening delete confirmation for supplier:', supplierType, supplierId);
    setSupplierToDelete({ type: supplierType, id: supplierId });
    setDeleteModalOpen(true);
  };

  // Confirm supplier removal after user confirms in modal
  const handleConfirmRemoveSupplier = async (supplierType) => {
    try {
      console.log('✅ Confirming removal of supplier:', supplierType);
      
      const result = await removeSupplier(supplierType);
      
      if (result.success) {
        // Reload party data to update UI
        loadPartyDataFromLocalStorage();
        
        // Show success toast
        if (toast) {
          toast.success('Supplier removed from your party');
        }
      } else {
        console.error('❌ Failed to remove supplier:', result.error);
        if (toast) {
          toast.error('Failed to remove supplier. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error removing supplier:', error);
      if (toast) {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      // Close modal and reset state
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  };

  // Cancel supplier removal
  const handleCancelRemoveSupplier = () => {
    setDeleteModalOpen(false);
    setSupplierToDelete(null);
  };
  
  const totalPrice = selectedSuppliers.reduce((sum, supplier) => {
    const { price } = calculateSupplierPrice(supplier, partyDetails);
    return sum + price;
  }, 0);
  
  const totalAddonsPrice = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const grandTotal = totalPrice + totalAddonsPrice;

  const chatSteps = [
    
  
    {
      id: 'contact',
      title: "Contact Details",
      description: "Please confirm your contact information so suppliers can reach you easily.",
      showContactFields: true
    }, // Index 1 - No Snappy, direct form
    {
      id: 'dietary',
      title: "Dietary Requirements",
      description: "Any dietary requirements or accessibility needs we should mention to suppliers?",
      showDietary: true
    }, // Index 2 - No Snappy, direct form
    {
      id: 'message',
      title: "Special Requests",
      description: "Want to add any special requests or details about your party theme? (Optional)",
      placeholder: "Any special requests, theme details, or important information...",
      field: 'additionalMessage',
      optional: true,
      isTextarea: true
    }, // Index 3 - No Snappy, direct form
    {
      id: 'forgotten',
      title: "Anything Missing?",
      description: "One last thing! Here are some popular extras you might want to add. (Optional)",
      showMissingSuppliers: true,
      optional: true
    }, // Index 4 - No Snappy, direct form
    {
      id: 'complete',
      snappyMessage: "Perfect! I've got everything ready. Let me show you the final details before we send this to your suppliers! 🚀",
      hideInput: true,
      isComplete: true
    } // Index 5 - Keep Snappy message
  ];

// UK Mobile phone validation
const validateUKMobile = (phone) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // UK mobile patterns
  const ukMobilePattern = /^(?:(?:\+44)|(?:0))7\d{9}$/
  const cleanedPattern = /^7\d{9}$/
  
  // Check various formats
  if (ukMobilePattern.test(phone) || cleanedPattern.test(cleaned)) {
    return { isValid: true, message: '' }
  }
  
  return { 
    isValid: false, 
    message: 'Please enter a valid UK mobile number (e.g., 07123 456789)' 
  }
}

// Format phone number for display
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11 && cleaned.startsWith('07')) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  if (cleaned.length === 10 && cleaned.startsWith('7')) {
    return `07${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  
  return phone
}

// Add phone validation state
const [phoneError, setPhoneError] = useState('')

// Updated phone input handler
const handlePhoneChange = (value) => {
  setFormData(prev => ({
    ...prev,
    phoneNumber: value
  }))
  
  if (value.length > 0) {
    const validation = validateUKMobile(value)
    setPhoneError(validation.isValid ? '' : validation.message)
  } else {
    setPhoneError('')
  }
}

// Updated canProceed function
const canProceed = () => {
  const step = currentStepData;
  if (step.id === 'contact') {
    const phoneValid = phoneError === '' && formData.phoneNumber.length > 0;
    const addressValid = formData.addressLine1.length > 0 && 
                        formData.city.length > 0 && 
                        formData.postcode.length > 0;
    return formData.parentName.length > 0 && 
           phoneValid && 
           formData.email.length > 0 && 
           addressValid;
  }
  return true;
};




  const currentStepData = chatSteps[currentStep];

  const handleNext = () => {
    if (currentStep < chatSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // ✅ Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Show final CTA when we reach the complete step
      if (chatSteps[currentStep + 1]?.isComplete) {
        setTimeout(() => {
          setShowFinalCTA(true);
        }, 1000);
      }
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      
      // ✅ Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  const handleShowFinalCTA = () => {
    setShowFinalCTA(true);
    
    // ✅ Scroll to top when showing final summary
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100); // Small delay to ensure content is rendered
  };
  

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };


  const handleAddMissingSupplier = async (supplier, supplierType) => {
    try {
      console.log('🔄 Adding missing supplier:', supplier.name, 'to', supplierType);
      
      const result = partyPlanBackend.addSupplierToPlan(supplier);
      
      if (result.success) {
        console.log('✅ Successfully added missing supplier');
        
        // Reload the party data to update the selectedSuppliers state
        loadPartyDataFromLocalStorage();
        
        // ✅ Mark that user has added something on this step
        setHasAddedOnCurrentStep(true);
        
        // Optional: Show success message
        if (toast) {
          toast.success(`${supplier.name} added to your party!`);
        }
        
        // Scroll to top after adding supplier
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 200);
        
        return true;
      } else {
        console.error('❌ Failed to add supplier:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error adding missing supplier:', error);
      return false;
    }
  };
  
  const getButtonText = (stepData) => {
    // For the missing suppliers step (step 4)
    if (stepData.id === 'forgotten') {
      if (hasAddedOnCurrentStep) {
        return 'Continue ✨'; // User added something
      } else {
        return '⏭️ Skip this'; // User hasn't added anything
      }
    }
    
    // For other optional steps
    if (stepData.optional) {
      return '⏭️ Skip this';
    }
    
    // For required steps
    return 'Continue ✨';
  };
// 6. DYNAMIC BUTTON ICON FUNCTION
const getButtonIcon = (stepData) => {
  // For the missing suppliers step
  if (stepData.id === 'forgotten') {
    if (hasAddedOnCurrentStep) {
      return <ArrowRight className="w-4 h-4 ml-2" />; // Show arrow when continuing
    } else {
      return null; // No icon when skipping
    }
  }
  
  // For other steps
  if (!stepData.optional) {
    return <ArrowRight className="w-4 h-4 ml-2" />;
  }
  
  return null;
};  
  // Form validation - now only check required fields since user is always signed in
  const isFormValid = formData.parentName && formData.email && selectedSuppliers.length > 0;

  // Loading state - show loading until auth is resolved
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show the page with auth modal
  if (!user) {
    // The auth modal will be handled by the useEffect and showAuthModal state
    // Don't redirect here - let the modal show
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
        <ContextualBreadcrumb currentPage="Review & Book" />

        <div className="max-w-2xl mx-auto p-4">
          
        

          {!showFinalCTA && (
  <div className="space-y-6">
    
    {/* Progress Bar */}
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Step {currentStep + 1} of {chatSteps.length}</span>
        <span>{Math.round(((currentStep + 1) / chatSteps.length) * 100)}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] h-3 rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${((currentStep + 1) / chatSteps.length) * 100}%` }}
        />
      </div>
    </div>

    {/* CONDITIONAL RENDERING: Snappy Chat vs Direct Form */}
    {currentStepData.snappyMessage ? (
      // SNAPPY CHAT CARD (for welcome and final steps)
      <Card className="border-2 border-[hsl(var(--primary-200))] bg-white shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-6 text-white">
          <div className="flex items-center space-x-4">
            <img 
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755761506/kfrlxs2gy5zd2gadynhh.png" 
              alt="Snappy"
              className="w-16 h-16 object-contain bg-white rounded-full p-2"
            />
            <div>
              <h3 className="text-xl font-bold">Snappy</h3>
              <p className="text-primary-100">Your PartySnap Assistant</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="mb-6">
            <div className="bg-primary-50 rounded-2xl rounded-tl-sm p-6 border border-[hsl(var(--primary-200))]">
            <p className="text-gray-900 text-lg font-bold leading-relaxed">
                {currentStepData.snappyMessage}
              </p>
              
              {currentStepData.hideInput && (
                <div className="flex items-center space-x-1 mt-4 opacity-60">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">Snappy is thinking...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-6 border-t border-gray-100">
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white py-4 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 px-12"
            >
              {currentStepData.isComplete ? "Show me the details! 🎉" : "Let's get started! 🚀"}
            </Button>
          </div>
        </CardContent>
      </Card>
    ) : (
      // DIRECT FORM CARD (for input steps)
      <Card className="border-2 border-[hsl(var(--primary-200))] bg-white shadow-xl overflow-hidden">
        <CardContent className="p-8">
          
          {/* Step Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 text-lg">
              {currentStepData.description}
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-6 mb-8">
            
          
{currentStepData.showContactFields && (
  <div className="space-y-4 max-w-lg mx-auto">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Your name *</label>
      <Input
        placeholder="Your full name"
        value={formData.parentName}
        onChange={(e) => updateFormData('parentName', e.target.value)}
        className="h-12 text-base border-2 border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-lg"
        autoFocus
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">UK Mobile number *</label>
      <Input
        placeholder="Enter your phone number"
        value={formData.phoneNumber}
        onChange={(e) => handlePhoneChange(e.target.value)}
        className={`h-12 text-base border-2 rounded-lg placeholder:text-gray-400 placeholder:text-sm ${
          phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[hsl(var(--primary-500))]'
        }`}
      />
      {phoneError && (
        <p className="text-red-500 text-sm mt-1">{phoneError}</p>
      )}
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Email address *</label>
      <Input
        placeholder="your.email@example.com"
        type="email"
        value={formData.email}
        onChange={(e) => updateFormData('email', e.target.value)}
        className="h-12 border-2 border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-lg text-gray-700 text-sm"
        disabled={!!user}
      />
      {user && (
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed as you're signed in</p>
      )}
    </div>

    {/* NEW ADDRESS SECTION */}
    <div className="pt-4 border-t border-gray-200">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h4>
      <p className="text-sm text-gray-600 mb-4">
        Where should suppliers deliver items and set up for your party?
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
          <Input
            placeholder="House number and street name"
            value={formData.addressLine1}
            onChange={(e) => updateFormData('addressLine1', e.target.value)}
            className="h-12 text-base border-2 border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
          <Input
            placeholder="Apartment, suite, floor (optional)"
            value={formData.addressLine2}
            onChange={(e) => updateFormData('addressLine2', e.target.value)}
            className="h-12 text-base border-2 border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-lg"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <Input
              placeholder="City"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              className="h-12 text-base border-2 border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postcode *</label>
            <Input
              placeholder="SW1A 1AA"
              value={formData.postcode}
              onChange={(e) => updateFormData('postcode', e.target.value.toUpperCase())}
              className="h-12 text-base border-2 border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
)}


{currentStepData.showDietary && (
  <div className="max-w-2xl mx-auto">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 text-center">Dietary Requirements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { key: "vegetarian", label: "Vegetarian options needed", icon: "🥗" },
          { key: "vegan", label: "Vegan options needed", icon: "🌱" },
          { key: "glutenFree", label: "Gluten-free options needed", icon: "🌾" },
          { key: "nutAllergy", label: "Nut allergy considerations", icon: "🥜" }
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-[hsl(var(--primary-50))] rounded-lg border-2 border-gray-200 hover:border-[hsl(var(--primary-300))] transition-all duration-200 cursor-pointer"
            onClick={() => updateNestedFormData('dietaryRequirements', item.key, !formData.dietaryRequirements[item.key])}
          >
            <Checkbox
              checked={formData.dietaryRequirements[item.key]}
              className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))] w-5 h-5"
            />
            <span className="text-lg">{item.icon}</span>
            <label className="text-sm font-medium cursor-pointer flex-1">
              {item.label}
            </label>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">Accessibility Needs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: "wheelchairAccessible", label: "Wheelchair accessible venue needed", icon: "♿" },
            { key: "sensoryFriendly", label: "Sensory-friendly environment", icon: "🤫" }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-[hsl(var(--primary-50))] rounded-lg border-2 border-gray-200 hover:border-[hsl(var(--primary-300))] transition-all duration-200 cursor-pointer"
              onClick={() => updateNestedFormData('accessibilityRequirements', item.key, !formData.accessibilityRequirements[item.key])}
            >
              <Checkbox
                checked={formData.accessibilityRequirements[item.key]}
                className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))] w-5 h-5"
              />
              <span className="text-lg">{item.icon}</span>
              <label className="text-sm font-medium cursor-pointer flex-1">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}


{currentStepData.field === 'additionalMessage' && (
  <div className="max-w-lg mx-auto">
    <Textarea
      placeholder={currentStepData.placeholder}
      value={formData.additionalMessage}
      onChange={(e) => updateFormData('additionalMessage', e.target.value)}
      className="min-h-[100px] placeholder:text-gray-400 placeholder:text-xs text-base border-2 border-gray-300 focus:border-[hsl(var(--primary-500))] resize-none rounded-lg p-3"
      autoFocus
    />
    
  </div>
)}


            {/* Missing Suppliers */}
            {currentStepData.showMissingSuppliers && (
              <div>
                <MissingSuppliersSuggestions 
                  partyPlan={fullSupplierData}
                  onAddSupplier={handleAddMissingSupplier}
                  showTitle={false}
                  currentStep={currentStep}
                  navigateWithContext={navigateWithContext}
                  toast={toast}
                />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          {currentStep > 0 && (
  <Button
    variant="outline"
    onClick={handleBack} // ✅ Use new handler
    className="border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium text-base"
  >
    ← Back
  </Button>
)}

            <div className={currentStep === 0 ? "w-full" : "ml-auto"}>
            <Button
    onClick={handleNext}
    disabled={!canProceed()}
    className={`bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-6 py-2.5 text-base font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 ${
      hasAddedOnCurrentStep && currentStepData.id === 'forgotten' 
        ? 'bg-primary-500 hover:bg-[hsl(var(--primary-600))]' // Different color when user added something
        : ''
    }`}
  >
    {getButtonText(currentStepData)}
    {getButtonIcon(currentStepData)}
  </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
)}

{showFinalCTA && (
 <div className="animate-in slide-in-from-bottom duration-500">
 <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
   {/* Clean Header */}
   <div className="bg-primary-500 p-6 text-white">
     <div className="flex items-center gap-3 mb-2">
       <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
         <span className="text-2xl">🎉</span>
       </div>
       <div>
         <h2 className="text-2xl font-bold">Ready to Book Your Party!</h2>
         <p className="text-white/90">Secure {selectedSuppliers.length} amazing suppliers</p>
       </div>
     </div>
   </div>

   <CardContent className="p-6">
     {/* Party Summary Header */}
     <div className="text-center mb-6">
       <h3 className="text-xl font-bold text-gray-900 mb-4">
         {partyDetails.childName}'s {partyDetails.theme} Party
       </h3>
       
       {/* Minimal Party Details */}
       <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
         <div className="flex items-center gap-1">
           <Calendar className="w-4 h-4" />
           <span>{partyDetails.date}</span>
         </div>
         <span className="text-gray-300">•</span>
         <div className="flex items-center gap-1">
           <Clock className="w-4 h-4" />
           <span>{partyDetails.time}</span>
         </div>
         <span className="text-gray-300">•</span>
         <div className="flex items-center gap-1">
           <MapPin className="w-4 h-4" />
           <span>{partyDetails.location}</span>
         </div>
         <span className="text-gray-300">•</span>
         <div className="flex items-center gap-1">
           <Users className="w-4 h-4" />
           <span>Age {partyDetails.age}</span>
         </div>
       </div>
     </div>

     {/* Suppliers Section */}
     <div className="mb-6">
       <div className="flex items-center justify-between mb-4">
         <h4 className="text-lg font-bold text-gray-900">Your Dream Team</h4>
         <Badge className="bg-[hsl(var(--primary-500))] text-white px-3 py-1 rounded-full">
           {selectedSuppliers.length}
         </Badge>
       </div>
       
       <div className="mb-6">

<div className="bg-gray-50 rounded-lg p-2 space-y-1.5 max-h-48 overflow-y-auto">
{selectedSuppliers.map(supplier => {
  // Add this calculation for each supplier
  const pricingInfo = calculateSupplierPrice(supplier, partyDetails);
  const isLeadTime = isLeadTimeSupplier(supplier);
  
  return (
    <div key={supplier.id} className="flex justify-between items-center bg-white rounded-md p-2 border border-gray-100 group">
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={supplier.image || '/placeholder.svg'}
            alt={supplier.name}
            width={24}
            height={24}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 truncate text-xs">
            {supplier.name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            ({supplier.category})
            {/* Show breakdown for party bags */}
            {pricingInfo.breakdown && (
              <span className="ml-1">- {pricingInfo.breakdown}</span>
            )}
          </div>
          {/* Show payment type indicator */}
          {isLeadTime && (
            <div className="text-xs text-orange-600 font-medium">
              Full payment required
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="font-bold text-[hsl(var(--primary-600))] text-xs flex-shrink-0">
          £{pricingInfo.price.toFixed(2)}
        </div>
        <button
          onClick={() => handleRemoveSupplier(supplier.supplierType || supplier.category.toLowerCase(), supplier.id)}
          className="w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center"
          title="Remove supplier"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
})}
 
 {/* Inline Add-ons */}
 {selectedAddons.map(addon => (
   <div key={addon.id} className="flex justify-between items-center bg-blue-50 rounded-md p-2 border border-blue-100">
     <div className="flex items-center space-x-2">
       <div className="w-6 h-6 rounded-md bg-blue-200 flex items-center justify-center flex-shrink-0">
         <span className="text-xs">+</span>
       </div>
       <span className="text-xs text-gray-700 truncate">{addon.name}</span>
     </div>
     <span className="font-bold text-blue-600 text-xs">£{addon.price || 0}</span>
   </div>
 ))}
</div>
</div>

  
     </div>

     {/* Total Cost */}
     <div className="bg-teal-200 rounded-xl p-4 mb-6 border border-teal-400">
       <div className="flex justify-between items-center">
         <span className="text-lg font-bold text-gray-700">Total Party Cost:</span>
         <span className="text-3xl font-black text-gray-900">£{grandTotal}</span>
       </div>
     </div>

     <div className="space-y-3 mb-4">
{/* Main CTA Button */}
<Button
  onClick={handleSubmitEnquiry}
  disabled={isSubmitting}
  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 text-base font-bold rounded-xl shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
>
  {isSubmitting ? (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>Preparing Payment...</span>
    </div>
  ) : (
    <div className="flex items-center justify-center">
      <span className="text-lg mr-2">🎉</span>
      <span>Secure My Dream Party Now!</span>
    </div>
  )}
</Button>
{loadingError && (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-700 text-sm font-medium">Something went wrong:</p>
    <p className="text-red-600 text-sm">{loadingError}</p>
    <Button
      variant="outline"
      onClick={() => setLoadingError(null)}
      className="mt-3 text-sm"
    >
      Try Again
    </Button>
  </div>
)}


{/* Secondary Button */}
<Button
 variant="ghost"
 onClick={() => {
   setShowFinalCTA(false);
   setCurrentStep(3);
   setInitialSupplierCount(selectedSuppliers.length);
   setHasAddedOnCurrentStep(false);
   setTimeout(() => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
   }, 100);
 }}
 className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 py-2 px-4 font-medium rounded-lg transition-all duration-200 text-sm"
>
 ← Back 
</Button>
</div>



   </CardContent>
 </Card>
</div>
)}
        </div>
      </div>

      {/* Blur overlay when auth modal is open */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 overflow-hidden" />
      )}

      {/* Auth Modal - Outside the blur container */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            // If auth is required, don't allow closing - redirect to dashboard instead
            if (authRequired) {
              console.log("🔙 Auth required but modal closed, redirecting to dashboard");
              router.push('/dashboard');
            } else {
              setShowAuthModal(false);
            }
          }}
          onSuccess={handleAuthSuccess}
          returnTo={window.location.href}
          selectedSuppliersCount={selectedSuppliers.length}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        supplierType={supplierToDelete?.type}
        onConfirm={handleConfirmRemoveSupplier}
        onCancel={handleCancelRemoveSupplier}
      />

 
    </>
  );
}