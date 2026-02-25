"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { processReferralSignup } from '@/utils/referralUtils';
import SnappyLoader from '@/components/ui/SnappyLoader';
import PartyReadinessModal from '@/components/party-readiness-modal';
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
  Palette,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { useRouter } from "next/navigation"

// Import auth and database functions
import { supabase } from "@/lib/supabase";
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend";
import { partyPlanBackend } from "@/utils/partyPlanBackend";
import {
  calculateFinalPrice,
  isLeadBasedSupplier,
  getDisplayPrice,
  getPriceBreakdownText
} from '@/utils/unifiedPricing'
import { trackCheckoutStarted, trackReviewBookStarted, linkEmail } from '@/utils/partyTracking';

import DeleteConfirmDialog from '../../dashboard/components/Dialogs/DeleteConfirmDialog';
import { BookingTermsModal } from '@/components/booking-terms-modal';

// Check if we should prefill email
// Prefill if email exists and is NOT a private relay email
const shouldPrefillEmail = (email) => {
  if (!email) return false
  // Don't prefill Apple private relay emails - user needs to enter their real email
  if (email.includes('@privaterelay.appleid.com')) return false
  return true
}

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
  const [loadingError, setLoadingError] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [addedSupplierIds, setAddedSupplierIds] = useState(new Set());
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signupFieldErrors, setSignupFieldErrors] = useState({});

  // Supplier messages state - keyed by supplier ID for exact matching in enquiries
  const [supplierMessages, setSupplierMessages] = useState({});
  const [selectedMessageSupplier, setSelectedMessageSupplier] = useState("");

  // Signup form state
  const [signupFormData, setSignupFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // "signup" or "signin"
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'apple' | null
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    parentName: "",
    phoneNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
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
    childPhot: "",
  });

  const { navigateWithContext } = useContextualNavigation();

  // Chat steps - add signup step FIRST if user is not logged in
  const chatSteps = [
    // Add signup step FIRST if user is not authenticated
    ...(!user ? [{
      id: 'create-account',
      title: authMode === "signin" ? "Welcome Back!" : "Let's Get Started",
      description: authMode === "signin"
        ? "Sign in to continue with your party booking"
        : "Create your account and let's make it happen",
      showSignupForm: true
    }] : []),
    {
      id: 'main-form',
      title: "Review Your Party Details",
      description: "Please confirm all details before proceeding to payment",
      showMainForm: true
    },
    {
      id: 'supplier-messages',
      title: "Messages for Suppliers",
      description: "Add personalised notes to your suppliers (Optional)",
      showSupplierMessages: true,
      optional: true
    },
    {
      id: 'forgotten',
      title: "Anything Missing?",
      description: "Not ready to decide? You can always add more from your dashboard later.",
      showMissingSuppliers: true,
      optional: true
    }
  ];
  // Load data on mount
  useEffect(() => {
    loadPartyDataFromLocalStorage();
    checkAuthStatusAndLoadProfile();
    // Track that user reached the review-book page (Step 1 of checkout)
    trackReviewBookStarted();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const needsReadinessCheck = urlParams.get('check_readiness') === 'true';

    // Only show readiness modal if needed, don't force auth on page load
    if (!loadingProfile && !user && !authRequired && needsReadinessCheck && !showReadinessModal) {
      setShowReadinessModal(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (!loadingProfile && user && authRequired) {
      setAuthRequired(false);
      setShowAuthModal(false);
    }
  }, [loadingProfile, user, authRequired, showAuthModal, showReadinessModal]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restoreParam = urlParams.get('restore');
    const supplierAdded = urlParams.get('added');
    const supplierName = urlParams.get('supplier');
    
    if (restoreParam === 'step4') {
      setCurrentStep(1);
      
      if (supplierAdded === 'true' && supplierName) {
        toast.success(`${decodeURIComponent(supplierName)} added to your party!`);
      }
      
      sessionStorage.removeItem('reviewBookRestoreState');
      window.history.replaceState({}, '', '/review-book');
    }
  }, []);

  useEffect(() => {
    if (currentStep === 1) {
      setInitialSupplierCount(selectedSuppliers.length);
      setHasAddedOnCurrentStep(false);
      // Reset added suppliers tracking when entering the "anything missing" step
      setAddedSupplierIds(new Set());
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 1) {
      const currentCount = selectedSuppliers.length;
      const hasAdded = currentCount > initialSupplierCount;
      setHasAddedOnCurrentStep(hasAdded);
    }
  }, [selectedSuppliers, currentStep, initialSupplierCount]);

  const loadPartyDataFromLocalStorage = async () => {
    try {
      const details = JSON.parse(localStorage.getItem("party_details") || "{}");
 
      
      const formatDateForDisplay = (dateInput) => {
        if (!dateInput) return "TBD";
        let date;
        if (dateInput instanceof Date) {
          date = dateInput;
        } else if (typeof dateInput === 'string') {
          if (dateInput.includes('th ') || dateInput.includes('st ') || dateInput.includes('nd ') || dateInput.includes('rd ')) {
            return dateInput;
          }
          date = new Date(dateInput);
        } else {
          return "TBD";
        }
        if (isNaN(date.getTime())) return "TBD";
        
        const day = date.getDate();
        const suffix = day >= 11 && day <= 13 ? 'th' : ['st', 'nd', 'rd'][day % 10 - 1] || 'th';
        const month = date.toLocaleDateString('en-GB', { month: 'long' });
        const year = date.getFullYear();
        return `${day}${suffix} ${month}, ${year}`;
      };

      const formatTimeForDisplay = (details) => {
        if (details.startTime) {
          const duration = details.duration || 2;
          try {
            const [hours, minutes] = details.startTime.split(':');
            const startDate = new Date();
            startDate.setHours(parseInt(hours), parseInt(minutes || 0));
            const formattedStart = startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: minutes && minutes !== '00' ? '2-digit' : undefined,
              hour12: true,
            });
            const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000));
            const formattedEnd = endDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: endDate.getMinutes() > 0 ? '2-digit' : undefined,
              hour12: true,
            });
            return `${formattedStart} - ${formattedEnd}`;
          } catch (error) {
            return "TBD";
          }
        }
        if (details.time && details.time.includes('-')) return details.time;
        return "TBD";
      };

      setPartyDetails({
        date: formatDateForDisplay(details.date),
        time: formatTimeForDisplay(details),
        theme: details.theme || "Party",
        location: details.location || "TBD",
        age: details.childAge || "TBD",
        childName: details.childName || "Your Child",
        guestCount: details.guestCount || 15,
        rawDate: details.date,
        rawStartTime: details.startTime,
        startTime: details.startTime,
        duration: details.duration,
        postcode: details.postcode,
        childPhoto: details.childPhoto || null

      });

      const partyPlan = JSON.parse(localStorage.getItem("user_party_plan") || "{}");
      const suppliers = [];
      const fullSupplierData = {};

      const realSupplierTypes = [
        'venue', 'entertainment', 'catering', 'decorations', 
        'facePainting', 'activities', 'partyBags', 'balloons', 'cakes'
      ];

      realSupplierTypes.forEach((key) => {
        const supplier = partyPlan[key];
        if (supplier && supplier.name) {
          const iconMap = {
            venue: <Building className="w-4 h-4" />,
            entertainment: <Music className="w-4 h-4" />,
            catering: <Utensils className="w-4 h-4" />,
            decorations: <Palette className="w-4 h-4" />,
            facePainting: <Palette className="w-4 h-4" />,
            activities: <Music className="w-4 h-4" />,
            partyBags: <Palette className="w-4 h-4" />,
            balloons: <Palette className="w-4 h-4" />,
            cakes: <Palette className="w-4 h-4" />,
          };
      
          let supplierData;
          if (key === 'partyBags' || supplier.category === 'Party Bags') {
            const storedPrice = supplier.price || supplier.originalPrice || supplier.priceFrom || 0;
            const guestCount = details.guestCount || 15;
            const potentialPerBag = storedPrice / guestCount;
            
            supplierData = {
              id: supplier.id || key,
              name: supplier.name,
              category: 'Party Bags',
              icon: iconMap[key] || <Info className="w-4 h-4" />,
              image: supplier.image || supplier.imageUrl || supplier.originalSupplier?.image,
              description: supplier.description,
              supplierType: key,
              originalPrice: potentialPerBag >= 2 && potentialPerBag <= 15 ? potentialPerBag : 5.00,
              price: potentialPerBag >= 2 && potentialPerBag <= 15 ? potentialPerBag : 5.00,
              priceFrom: potentialPerBag >= 2 && potentialPerBag <= 15 ? potentialPerBag : 5.00,
              _originalStoredPrice: storedPrice,
              _calculatedPerBag: potentialPerBag >= 2 && potentialPerBag <= 15 ? potentialPerBag : 5.00
            };
          } else {
            supplierData = {
              id: supplier.id || key,
              name: supplier.name,
              category: supplier.category || key.charAt(0).toUpperCase() + key.slice(1),
              icon: iconMap[key] || <Info className="w-4 h-4" />,
              image: supplier.image || supplier.imageUrl || supplier.originalSupplier?.image,
              price: supplier.price,
              originalPrice: supplier.originalPrice,
              priceFrom: supplier.priceFrom,
              description: supplier.description,
              supplierType: key,
            };
          }
      
          suppliers.push(supplierData);
          fullSupplierData[key] = supplier;
        }
      });

      if (partyPlan.einvites) {
        delete partyPlan.einvites;
        localStorage.setItem("user_party_plan", JSON.stringify(partyPlan));
      }

      const addons = partyPlan.addons || [];
      setSelectedAddons(addons);
      setSelectedSuppliers(suppliers);
      setFullSupplierData(fullSupplierData);

      // Track checkout started
      await trackCheckoutStarted(partyPlan);
    } catch (error) {
      console.error("Error loading party data:", error);
    }
  };

  const checkAuthStatusAndLoadProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data: { user }, error } = await supabase.auth.getUser();
  
      if (user && !error) {
        const { data: supplierRecord } = await supabase
          .from("suppliers")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();
  
        if (supplierRecord) {
          setUser(null);
          setCustomerProfile(null);
          setLoadingProfile(false);
          return;
        }
  
        setUser(user);

        // Link email to tracking session when user authenticates
        if (user.email) {
          await linkEmail(user.email);
        }

        const result = await partyDatabaseBackend.getCurrentUser();
        if (result.success) {
          setCustomerProfile(result.user);
          // Prefill email if it's not a private relay email
          const emailToUse = result.user.email || user.email;
          setFormData((prev) => ({
            ...prev,
            parentName: `${result.user.first_name || ""} ${result.user.last_name || ""}`.trim() || prev.parentName,
            email: shouldPrefillEmail(emailToUse) ? emailToUse : prev.email,
            phoneNumber: result.user.phone || prev.phoneNumber,
            addressLine1: result.user.address_line_1 || prev.addressLine1,
            addressLine2: result.user.address_line_2 || prev.addressLine2,
            city: result.user.city || prev.city,
            postcode: result.user.postcode || prev.postcode,

          }));
        } else {
          // Prefill email if it's not a private relay email
          setFormData((prev) => ({
            ...prev,
            email: shouldPrefillEmail(user.email) ? user.email : prev.email,
            parentName: user.user_metadata?.full_name || prev.parentName,
            phoneNumber: user.user_metadata?.phone || prev.phoneNumber,
          }));
        }
      } else {
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (category, field, checked) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: checked },
    }));
  };

  const validateUKMobile = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const ukMobilePattern = /^(?:(?:\+44)|(?:0))7\d{9}$/;
    const cleanedPattern = /^7\d{9}$/;
    
    if (ukMobilePattern.test(phone) || cleanedPattern.test(cleaned)) {
      return { isValid: true, message: '' };
    }
    return { isValid: false, message: 'Please enter a valid UK mobile number (e.g., 07123 456789)' };
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phoneNumber: value }));
    if (value.length > 0) {
      const validation = validateUKMobile(value);
      setPhoneError(validation.isValid ? '' : validation.message);
    } else {
      setPhoneError('');
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    if (!email || email.trim().length === 0) {
      return { isValid: false, message: 'Email address is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: '' };
  };

  const handleEmailChange = (value) => {
    setFormData(prev => ({ ...prev, email: value }));
    if (value.length > 0) {
      const validation = validateEmail(value);
      setEmailError(validation.isValid ? '' : validation.message);
    } else {
      setEmailError('Email address is required');
    }
  };

  const migratePartyToDatabase = async (authenticatedUser) => {
    try {
      setIsMigrating(true);
      const partyDetailsLS = JSON.parse(localStorage.getItem("party_details") || "{}");
      const partyPlanLS = JSON.parse(localStorage.getItem("user_party_plan") || "{}");

      if (!formData.addressLine1 || !formData.city || !formData.postcode) {
        throw new Error("Please complete all required address fields");
      }

      const userResult = await partyDatabaseBackend.createOrGetUser({
        firstName: formData.parentName.split(" ")[0] || partyDetailsLS.childName || "Party Host",
        lastName: formData.parentName.split(" ").slice(1).join(" ") || "",
        email: formData.email, // Use the email from the form (user may have entered their real email)
        phone: formData.phoneNumber || authenticatedUser.user_metadata?.phone || "",
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || "",
        city: formData.city,
        postcode: formData.postcode,
        child_photo: partyDetailsLS.childPhoto || null
      });

      if (!userResult.success) {
        throw new Error(`Failed to create user profile: ${userResult.error}`);
      }

      const calculateEndTime = (startTime, duration) => {
        try {
          const [hours, minutes] = startTime.split(':');
          const startDate = new Date();
          startDate.setHours(parseInt(hours), parseInt(minutes || 0));
          const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000));
          return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        } catch (error) {
          return "16:00";
        }
      };

      const getTimeData = () => {
        if (partyDetailsLS.startTime) {
          const duration = partyDetailsLS.duration || 2;
          const endTime = calculateEndTime(partyDetailsLS.startTime, duration);
          return {
            time: partyDetailsLS.startTime,
            startTime: partyDetailsLS.startTime,
            endTime: endTime,
            duration: duration,
            timePreference: {
              type: 'specific',
              startTime: partyDetailsLS.startTime,
              duration: duration,
              endTime: endTime
            }
          };
        }
        return {
          time: "14:00",
          startTime: "14:00",
          endTime: "16:00",
          duration: 2,
          timePreference: { type: 'flexible', slot: 'afternoon', duration: 2, startTime: "14:00" }
        };
      };

      const timeData = getTimeData();

      const formatFullAddress = () => {
        const parts = [formData.addressLine1, formData.addressLine2, formData.city, formData.postcode].filter(Boolean);
        return parts.join(', ');
      };

      const dietaryRequirementsArray = [];
      if (formData.dietaryRequirements.vegetarian) dietaryRequirementsArray.push('Vegetarian');
      if (formData.dietaryRequirements.vegan) dietaryRequirementsArray.push('Vegan');
      if (formData.dietaryRequirements.glutenFree) dietaryRequirementsArray.push('Gluten-Free');
      if (formData.dietaryRequirements.nutAllergy) dietaryRequirementsArray.push('Nut Allergy');

      const accessibilityRequirementsArray = [];
      if (formData.accessibilityRequirements.wheelchairAccessible) accessibilityRequirementsArray.push('Wheelchair Accessible');
      if (formData.accessibilityRequirements.sensoryFriendly) accessibilityRequirementsArray.push('Sensory Friendly');

      const partyData = {
        childName: partyDetailsLS.childName || "Your Child",
        childAge: parseInt(partyDetailsLS.childAge) || 6,
        date: partyDetailsLS.date || new Date().toISOString().split("T")[0],
        childPhoto: partyDetailsLS.childPhoto || null,
        time: timeData.time,
        startTime: timeData.startTime,
        start_time: timeData.startTime,
        endTime: timeData.endTime,
        end_time: timeData.endTime,
        duration: timeData.duration,
        timePreference: timeData.timePreference,
        guestCount: parseInt(formData.numberOfChildren?.split("-")[0]) || parseInt(partyDetailsLS.guestCount) || 15,
        location: partyDetailsLS.location || formatFullAddress(),
        postcode: formData.postcode || partyDetailsLS.postcode || "",
        deliveryAddress: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          postcode: formData.postcode,
          fullAddress: formatFullAddress()
        },
        deliveryAddressLine1: formData.addressLine1,
        deliveryAddressLine2: formData.addressLine2,
        deliveryCity: formData.city,
        deliveryPostcode: formData.postcode,
        fullDeliveryAddress: formatFullAddress(),
        parentName: formData.parentName,
        parentEmail: formData.email,
        parentPhone: formData.phoneNumber,
        theme: partyDetailsLS.theme || "party",
        budget: parseInt(partyDetailsLS.budget) || 600,
        specialRequirements: formData.additionalMessage || "",
        // Supplier-specific messages keyed by supplier ID for exact matching in enquiries
        supplierMessages: Object.fromEntries(
          Object.entries(supplierMessages)
            .filter(([_, data]) => data?.message?.trim())
            .map(([supplierId, data]) => [supplierId, {
              supplierId: data.supplierId,
              supplierName: data.supplierName,
              supplierType: data.supplierType,
              message: data.message.trim()
            }])
        ),
        dietaryRequirements: formData.dietaryRequirements,
        dietaryRequirementsArray: dietaryRequirementsArray,
        hasDietaryRequirements: dietaryRequirementsArray.length > 0,
        accessibilityRequirements: formData.accessibilityRequirements,
        accessibilityRequirementsArray: accessibilityRequirementsArray,
        hasAccessibilityRequirements: accessibilityRequirementsArray.length > 0,
        termsAccepted: termsAccepted,
        termsAcceptedAt: new Date().toISOString(),
        marketingConsent: marketingConsent,
        submittedAt: new Date().toISOString(),
        status: 'draft'
      };

      const createResult = await partyDatabaseBackend.createParty(partyData, partyPlanLS);

      if (!createResult.success) {
        throw new Error(`Failed to create party: ${createResult.error}`);
      }

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
    setShowAuthModal(false);
    setAuthRequired(false);
    setUser(authenticatedUser);

    if (userData) {
      // Prefill email if it's not a private relay email
      setFormData((prev) => ({
        ...prev,
        parentName: userData.firstName && userData.lastName
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : userData.firstName || prev.parentName,
        email: shouldPrefillEmail(userData.email) ? userData.email : prev.email,
        phoneNumber: userData.phone || prev.phoneNumber,
      }));
    } else {
      const fullName = authenticatedUser.user_metadata?.full_name;
      // Prefill email if it's not a private relay email
      setFormData((prev) => ({
        ...prev,
        parentName: fullName || prev.parentName,
        email: shouldPrefillEmail(authenticatedUser.email) ? authenticatedUser.email : prev.email,
        phoneNumber: authenticatedUser.user_metadata?.phone || prev.phoneNumber,
      }));
    }

    // If user just authenticated while trying to pay, automatically proceed to payment
    // This happens when they click "Proceed to Payment" or "Secure My Dream Party Now!" without being logged in
    if (authRequired) {
      await handleSubmitEnquiry(authenticatedUser);
    }
  };

  const checkPasswordRequirements = (pwd) => {
    const requirements = {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    };
    setPasswordRequirements(requirements);
    return requirements;
  };

  const isPasswordValid = () => {
    return passwordRequirements.minLength &&
           passwordRequirements.hasUppercase &&
           passwordRequirements.hasLowercase &&
           passwordRequirements.hasNumber;
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSigninSubmit = async () => {
    setSignupError("");
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.email.trim() || !signupFormData.password.trim()) {
        throw new Error("Please enter your email and password");
      }

      console.log("🔐 Starting customer sign-in from review-book...");

      // Sign in with email/password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: signupFormData.password,
      });

      if (authError) throw authError;

      const authenticatedUser = authData.user;
      if (!authenticatedUser) throw new Error("Sign-in failed");

      console.log("✅ Customer signed in:", authenticatedUser.id);

      // Get customer profile
      const userResult = await partyDatabaseBackend.getCurrentUser();

      if (userResult.success && userResult.user) {
        setCustomerProfile(userResult.user);

        // Pre-fill form data with user info
        setFormData((prev) => ({
          ...prev,
          parentName: `${userResult.user.first_name || ""} ${userResult.user.last_name || ""}`.trim() || prev.parentName,
          email: userResult.user.email || prev.email,
          phoneNumber: userResult.user.phone || prev.phoneNumber,
          addressLine1: userResult.user.address_line_1 || prev.addressLine1,
          addressLine2: userResult.user.address_line_2 || prev.addressLine2,
          city: userResult.user.city || prev.city,
          postcode: userResult.user.postcode || prev.postcode,
        }));
      }

      // Set the user and proceed to next step
      setUser(authenticatedUser);

      // Link email to tracking session for CRM
      linkEmail(authenticatedUser.email);

      toast.success("Welcome back!", {
        duration: 3000
      });

      // IMPORTANT: After setting user, chatSteps array changes (signup step removed)
      // So we reset to step 0, which is now the party details form
      setIsSubmitting(false);
      setCurrentStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error("❌ Sign-in error:", err);

      if (err.message.includes("Invalid login credentials")) {
        setSignupError("Incorrect email or password. Please try again.");
      } else {
        const errorMessage = err.message || "Sign-in failed. Please try again.";
        setSignupError(errorMessage);
      }
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async () => {
    setSignupError("");
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.parentName.trim() || !formData.email.trim() || !signupFormData.password.trim()) {
        throw new Error("Please fill in all required fields");
      }

      if (!termsAccepted) {
        throw new Error("Please accept the Terms & Conditions to continue");
      }

      const passwordError = validatePassword(signupFormData.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (signupFormData.password !== signupFormData.confirmPassword) {
        throw new Error("Passwords do not match");
      }



      const [firstName, ...lastNameParts] = formData.parentName.trim().split(" ");
      const lastName = lastNameParts.join(" ");

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: signupFormData.password,
        options: {
          data: {
            full_name: formData.parentName.trim(),
            user_type: "customer",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback/customer`,
        },
      });

      if (authError) throw authError;

      const authenticatedUser = authData.user;
      if (!authenticatedUser) throw new Error("No user created");

     

      // Create customer profile
      const userResult = await partyDatabaseBackend.createOrGetUser({
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        phone: formData.phoneNumber || "",
        postcode: "",
      });

      if (!userResult.success) {
        console.error("❌ Failed to create customer profile:", userResult.error);
        throw new Error("Failed to create customer profile");
      }

      // Process referral if user came via referral link
      try {
        const referralResult = await processReferralSignup(authenticatedUser.id);
        if (referralResult.referralRecorded) {
          console.log("🎉 Referral recorded for new user!");
        }
      } catch (referralError) {
        console.warn("Referral processing error (non-critical):", referralError);
      }

      // Set the user and proceed to next step
      setUser(authenticatedUser);
      setCustomerProfile(userResult.user);

      // Link email to tracking session for CRM
      linkEmail(authenticatedUser.email);

      // Pre-fill form data with user info
      setFormData((prev) => ({
        ...prev,
        parentName: formData.parentName || `${firstName} ${lastName}`.trim(),
        email: formData.email,
        phoneNumber: formData.phoneNumber || userResult.user.phone || prev.phoneNumber,
      }));

      toast.success("Account created successfully!", {
        title: "Welcome to PartySnap!",
        duration: 3000
      });

      // IMPORTANT: After setting user, chatSteps array changes (signup step removed)
      // So we reset to step 0, which is now the party details form
      setIsSubmitting(false);
      setCurrentStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error("❌ Signup error:", err);

      if (err.message.includes("already registered")) {
        setSignupError("An account with this email already exists. Please sign in instead.");
      } else {
        const errorMessage = err.message || "Sign-up failed. Please try again.";
        setSignupError(errorMessage);
      }
      setIsSubmitting(false);
    }
  };

  const handleSubmitEnquiry = async (authenticatedUser = null) => {
    try {
      setIsSubmitting(true);
      setLoadingError(null);

      const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
      const supplierCount = Object.values(partyPlan).filter(supplier =>
        supplier && typeof supplier === 'object' && supplier.name
      ).length;

      // Use the passed authenticatedUser if available, otherwise use state
      const userToUse = authenticatedUser || user;

      if (!userToUse) {
        throw new Error('No authenticated user found');
      }

      const migratedParty = await migratePartyToDatabase(userToUse);

      if (!migratedParty || !migratedParty.id) {
        throw new Error('Failed to migrate party - no party ID returned');
      }

      await supabase.from('parties').update({ status: 'draft' }).eq('id', migratedParty.id);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const paymentUrl = `/payment/secure-party?party_id=${migratedParty.id}&suppliers=${supplierCount}`;
      console.log('🔄 Redirecting to payment:', paymentUrl);
      router.push(paymentUrl);
    } catch (error) {
      console.error("❌ Migration failed:", error);
      setLoadingError(error.message);
      setIsSubmitting(false);
    }
  };

  const handleRemoveSupplier = async (supplierType, supplierId) => {
    setSupplierToDelete({ type: supplierType, id: supplierId });
    setDeleteModalOpen(true);
  };

  const handleConfirmRemoveSupplier = async (supplierType) => {
    try {
      const result = await removeSupplier(supplierType);
      if (result.success) {
        loadPartyDataFromLocalStorage();
        if (toast) toast.success('Supplier removed from your party');
      } else {
        if (toast) toast.error('Failed to remove supplier. Please try again.');
      }
    } catch (error) {
      if (toast) toast.error('Something went wrong. Please try again.');
    } finally {
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleCancelRemoveSupplier = () => {
    setDeleteModalOpen(false);
    setSupplierToDelete(null);
  };
  
  const totalPrice = selectedSuppliers.reduce((sum, supplier) => {
    const pricingPartyDetails = {
      date: partyDetails.rawDate || partyDetails.date,
      duration: partyDetails.duration || 2,
      guestCount: partyDetails.guestCount || 15,
      startTime: partyDetails.startTime
    };
    const pricing = calculateFinalPrice(supplier, pricingPartyDetails, []);
    return sum + pricing.finalPrice;
  }, 0);
  
  const totalAddonsPrice = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const grandTotal = totalPrice + totalAddonsPrice;

  const canProceed = () => {
    const step = currentStepData;
    if (step.id === 'main-form') {
      // Phone must be present AND valid UK mobile format
      const phone = formData.phoneNumber;
      const cleanedPhone = phone.replace(/\D/g, '');
      const ukMobilePattern = /^(?:(?:\+44)|(?:0))7\d{9}$/;
      const cleanedPattern = /^7\d{9}$/;
      const phoneValid = phone.length > 0 && (ukMobilePattern.test(phone) || cleanedPattern.test(cleanedPhone));

      const addressValid = formData.addressLine1.trim().length > 0 &&
                          formData.city.trim().length > 0 &&
                          formData.postcode.trim().length > 0;
      // Email must be present AND valid format
      const emailValid = formData.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
      return formData.parentName.trim().length > 0 && phoneValid && emailValid && addressValid;
    }
    if (step.id === 'create-account') {
      if (authMode === "signin") {
        // Signin only needs email and password
        return formData.email.trim().length > 0 && signupFormData.password.length > 0;
      } else {
        // Signup needs name, email, passwords match, and terms accepted
        return formData.parentName.trim().length > 0 &&
               formData.email.trim().length > 0 &&
               signupFormData.password.length > 0 &&
               signupFormData.confirmPassword.length > 0 &&
               termsAccepted;
      }
    }
    return true;
  };

  // Validate signup fields and return error messages
  const validateSignupFields = () => {
    const errors = {};

    if (authMode === "signup") {
      const trimmedName = formData.parentName.trim();
      if (!trimmedName) {
        errors.name = "Please enter your name";
      } else if (/^\d+$/.test(trimmedName)) {
        errors.name = "Name cannot be only numbers";
      }
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!signupFormData.password || !signupFormData.password.trim()) {
      errors.password = "Please enter a password";
    } else if (/^\s+$/.test(signupFormData.password)) {
      errors.password = "Password cannot contain only spaces";
    }

    if (authMode === "signup") {
      if (!signupFormData.confirmPassword || !signupFormData.confirmPassword.trim()) {
        errors.confirmPassword = "Please confirm your password";
      } else if (/^\s+$/.test(signupFormData.confirmPassword)) {
        errors.confirmPassword = "Password cannot contain only spaces";
      }

      if (!termsAccepted) {
        errors.terms = "Please accept the Terms & Conditions";
      }
    }

    return errors;
  };

  // Handle clicking the submit button when fields are incomplete
  const handleSignupButtonClick = () => {
    const errors = validateSignupFields();

    if (Object.keys(errors).length > 0) {
      setSignupFieldErrors(errors);
      // Don't proceed, just show errors
      return;
    }

    // Clear errors and proceed
    setSignupFieldErrors({});
    if (authMode === "signin") {
      handleSigninSubmit();
    } else {
      handleSignupSubmit();
    }
  };

  const currentStepData = chatSteps[currentStep];

  const handleNext = async () => {
    if (currentStep < chatSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // On the last step - proceed to payment
      // If user is not logged in, they should have gone through the signup step first
      await handleSubmitEnquiry();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleAddMissingSupplier = async (supplier, supplierType) => {
    try {
      const result = partyPlanBackend.addSupplierToPlan(supplier);

      if (result.success) {
        // Track this supplier as added
        setAddedSupplierIds(prev => new Set([...prev, supplier.id]));

        loadPartyDataFromLocalStorage();
        setHasAddedOnCurrentStep(true);

        return Promise.resolve(true);
      }

      return Promise.resolve(false);
    } catch (error) {
      console.error('Error adding supplier:', error)
      return Promise.resolve(false);
    }
  };
  
  // Check if any supplier messages have been added
  const hasSupplierMessages = Object.values(supplierMessages).some(msg => msg?.message?.trim());

  const getButtonText = (stepData) => {
    if (stepData.id === 'forgotten') {
      return hasAddedOnCurrentStep ? 'Continue' : 'Skip this';
    }
    if (stepData.id === 'supplier-messages') {
      return hasSupplierMessages ? 'Continue' : 'Skip this';
    }
    if (stepData.optional) return 'Skip this';
    return 'Continue';
  };

  const getButtonIcon = (stepData) => {
    if (stepData.id === 'forgotten' && hasAddedOnCurrentStep) {
      return <ArrowRight className="w-4 h-4 ml-2" />;
    }
    if (stepData.id === 'supplier-messages' && hasSupplierMessages) {
      return <ArrowRight className="w-4 h-4 ml-2" />;
    }
    if (!stepData.optional) return <ArrowRight className="w-4 h-4 ml-2" />;
    return null;
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Setting up your party....." />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
        <ContextualBreadcrumb currentPage="Review & Book" />

        <div className="max-w-3xl mx-auto p-4 py-6">
          {!showFinalCTA && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Step {currentStep + 1} of {chatSteps.length}</span>
                  <span>{Math.round(((currentStep + 1) / chatSteps.length) * 100)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / chatSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Main Content Card */}
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="bg-[hsl(var(--primary-500))] p-6 rounded-t-lg">
                <div className="">
                    <h2 className="text-lg font-bold text-white mb-1">
                      {currentStepData.title}
                    </h2>
                    <p className="text-sm text-white font-light">
                      {currentStepData.description}
                    </p>
                    </div>
                    </CardHeader>
                <CardContent className="p-6">
                  {/* Step Header */}
            


             
                

                  {/* Form Content */}
                  <div className="space-y-5">
                    {/* MAIN FORM */}
                    {currentStepData.showMainForm && (
                      <div className="space-y-5">
                        {/* Contact Information */}
                        <div className=" rounded-lg ">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Contact Information
                          </h3>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Your name *</label>
                              <Input
                                placeholder="Your full name"
                                value={formData.parentName}
                                onChange={(e) => updateFormData('parentName', e.target.value)}
                                className="h-12 text-sm border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-md"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">UK Mobile number *</label>
                              <Input
                                placeholder="07123 456789"
                                value={formData.phoneNumber}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                className={`h-12 text-sm rounded-md ${
                                  phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[hsl(var(--primary-500))]'
                                }`}
                              />
                              {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address *</label>
                              <Input
                                placeholder="your.email@example.com"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                className={`h-12 text-gray-900 rounded-md ${
                                  emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[hsl(var(--primary-500))]'
                                }`}
                              />
                              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="rounded-lg ">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Delivery Address
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">
                          Where should items be delivered?
                          </p>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                              <Input
                                placeholder="House number and street"
                                value={formData.addressLine1}
                                onChange={(e) => updateFormData('addressLine1', e.target.value)}
                                className="h-12 text-sm border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-md"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 2 (optional)</label>
                              <Input
                                placeholder="Apartment, suite, floor"
                                value={formData.addressLine2}
                                onChange={(e) => updateFormData('addressLine2', e.target.value)}
                                className="h-12 text-sm border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-md"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">City *</label>
                                <Input
                                  placeholder="City"
                                  value={formData.city}
                                  onChange={(e) => updateFormData('city', e.target.value)}
                                  className="h-12 text-sm border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-md"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Postcode *</label>
                                <Input
                                  placeholder="SW1A 1AA"
                                  value={formData.postcode}
                                  onChange={(e) => updateFormData('postcode', e.target.value.toUpperCase())}
                                  className="h-12 text-sm border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-md"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dietary & Accessibility - TEMPORARILY COMMENTED OUT */}
                        {/* <div className=" rounded-lg ">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Dietary & Accessibility</h3>

                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-medium text-gray-700 mb-2">Dietary Requirements</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { key: "vegetarian", label: "Vegetarian", icon: "🥗" },
                                  { key: "vegan", label: "Vegan", icon: "🌱" },
                                  { key: "glutenFree", label: "Gluten-free", icon: "🌾" },
                                  { key: "nutAllergy", label: "Nut allergy", icon: "🥜" }
                                ].map((item) => (
                                  <div
                                    key={item.key}
                                    className="flex items-center space-x-2 p-2 bg-white rounded-md border border-gray-200 hover:border-[hsl(var(--primary-300))] transition-colors cursor-pointer"
                                    onClick={() => updateNestedFormData('dietaryRequirements', item.key, !formData.dietaryRequirements[item.key])}
                                  >
                                    <Checkbox
                                      checked={formData.dietaryRequirements[item.key]}
                                      className="data-[state=checked]:bg-[hsl(var(--primary-500))] w-4 h-4"
                                    />
                                    <span className="text-sm">{item.icon}</span>
                                    <label className="text-xs font-medium cursor-pointer flex-1">
                                      {item.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-medium text-gray-700 mb-2">Accessibility Needs</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {[
                                  { key: "wheelchairAccessible", label: "Wheelchair accessible", icon: "♿" },
                                  { key: "sensoryFriendly", label: "Sensory-friendly", icon: "🤫" }
                                ].map((item) => (
                                  <div
                                    key={item.key}
                                    className="flex items-center space-x-2 p-2 bg-white rounded-md border border-gray-200 hover:border-[hsl(var(--primary-300))] transition-colors cursor-pointer"
                                    onClick={() => updateNestedFormData('accessibilityRequirements', item.key, !formData.accessibilityRequirements[item.key])}
                                  >
                                    <Checkbox
                                      checked={formData.accessibilityRequirements[item.key]}
                                      className="data-[state=checked]:bg-[hsl(var(--primary-500))] w-4 h-4"
                                    />
                                    <span className="text-sm">{item.icon}</span>
                                    <label className="text-xs font-medium cursor-pointer flex-1">
                                      {item.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div> */}

                      </div>
                    )}

                    {/* Supplier Messages */}
                    {currentStepData.showSupplierMessages && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 mb-3">
                          Tap to add a message (optional)
                        </p>

                        {/* Simple list of all suppliers */}
                        {selectedSuppliers.length > 0 ? (
                          <div className="space-y-2">
                            {selectedSuppliers.map((supplier) => {
                              const supplierId = supplier.id || supplier.supplierId;
                              const supplierName = supplier.name || supplier.supplierName || 'Unknown Supplier';
                              const supplierType = supplier.type || supplier.supplierType || supplier.category || 'supplier';
                              const hasMessage = supplierMessages[supplierId]?.message?.trim();
                              const isExpanded = selectedMessageSupplier === supplierId;

                              return (
                                <div
                                  key={supplierId}
                                  className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                                    isExpanded
                                      ? 'border-gray-300 bg-white shadow-sm'
                                      : hasMessage
                                        ? 'border-green-200 bg-green-50/50'
                                        : 'border-gray-200 bg-white'
                                  }`}
                                >
                                  {/* Supplier header - always visible */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedMessageSupplier(isExpanded ? '' : supplierId)}
                                    className="w-full p-3 flex items-center justify-between text-left"
                                  >
                                    <span className="font-medium text-gray-900 text-sm">{supplierName}</span>
                                    <div className="flex items-center gap-2">
                                      {hasMessage && !isExpanded && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      )}
                                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </button>

                                  {/* Expanded message input */}
                                  {isExpanded && (
                                    <div className="px-3 pb-3">
                                      <Textarea
                                        placeholder="Add a note for this supplier..."
                                        value={supplierMessages[supplierId]?.message || ''}
                                        onChange={(e) => {
                                          setSupplierMessages(prev => ({
                                            ...prev,
                                            [supplierId]: {
                                              supplierId: supplierId,
                                              supplierName: supplierName,
                                              supplierType: supplierType,
                                              message: e.target.value
                                            }
                                          }));
                                        }}
                                        className="min-h-[100px] text-sm placeholder:text-gray-400 placeholder:text-sm border-gray-200 focus:border-gray-300 resize-none rounded-lg bg-gray-50"
                                        autoFocus
                                      />
                                      {hasMessage && (
                                        <div className="flex items-center justify-end mt-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSupplierMessages(prev => {
                                                const updated = { ...prev };
                                                delete updated[supplierId];
                                                return updated;
                                              });
                                            }}
                                            className="text-xs text-gray-400 hover:text-red-500"
                                          >
                                            Clear
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No suppliers selected yet. Add suppliers to your party first.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Missing Suppliers */}
                    {currentStepData.showMissingSuppliers && (
                      <div>
                        <MissingSuppliersSuggestions
                          partyPlan={fullSupplierData}
                          partyDetails={partyDetails}
                          onAddSupplier={handleAddMissingSupplier}
                          showTitle={false}
                          currentStep={currentStep}
                          navigateWithContext={navigateWithContext}
                          toast={toast}
                          addedSupplierIds={addedSupplierIds}
                          preventNavigation={true}
                          horizontalScroll={true}
                        />
                      </div>
                    )}

                    {/* Signup Form */}
                    {currentStepData.showSignupForm && (
                      <div className="max-w-md mx-auto">
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                          {/* Social Login Options - Full width stacked buttons */}
                          <div className="space-y-3">
                            {/* Google - Outlined */}
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full h-12 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-medium text-gray-700 text-base"
                              onClick={async () => {
                                try {
                                  setOauthLoading('google');
                                  localStorage.setItem('oauth_return_to', '/review-book');
                                  localStorage.setItem('oauth_preserve_party', 'true');
                                  localStorage.setItem('oauth_context', 'review_book');

                                  const { error } = await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                      redirectTo: `${window.location.origin}/auth/callback/customer?return_to=/review-book&preserve_party=true&context=review_book`,
                                    },
                                  });
                                  if (error) throw error;
                                } catch (err) {
                                  setOauthLoading(null);
                                  setSignupError("Failed to sign in with Google. Please try again.");
                                }
                              }}
                              disabled={isSubmitting || oauthLoading}
                            >
                              {oauthLoading === 'google' ? (
                                <>
                                  <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                  </svg>
                                  Continue with Google
                                </>
                              )}
                            </Button>

                            {/* Apple - White with black logo */}
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full h-12 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-medium text-gray-700 text-base"
                              onClick={async () => {
                                try {
                                  setOauthLoading('apple');
                                  localStorage.setItem('oauth_return_to', '/review-book');
                                  localStorage.setItem('oauth_preserve_party', 'true');
                                  localStorage.setItem('oauth_context', 'review_book');

                                  const { error } = await supabase.auth.signInWithOAuth({
                                    provider: 'apple',
                                    options: {
                                      redirectTo: `${window.location.origin}/auth/callback/customer?return_to=/review-book&preserve_party=true&context=review_book`,
                                    },
                                  });
                                  if (error) throw error;
                                } catch (err) {
                                  setOauthLoading(null);
                                  setSignupError("Failed to sign in with Apple. Please try again.");
                                }
                              }}
                              disabled={isSubmitting || oauthLoading}
                            >
                              {oauthLoading === 'apple' ? (
                                <>
                                  <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000000" />
                                  </svg>
                                  Continue with Apple
                                </>
                              )}
                            </Button>

                            {/* Passive T&Cs acceptance notice */}
                            <p className="text-[11px] text-center text-gray-400">
                              By continuing, you agree to PartySnap's{" "}
                              <BookingTermsModal partyDetails={partyDetails}>
                                <button type="button" className="text-[hsl(var(--primary-500))] hover:underline">
                                  Terms & Conditions
                                </button>
                              </BookingTermsModal>
                              {" "}and{" "}
                              <a href="/privacy-policy" target="_blank" className="text-[hsl(var(--primary-500))] hover:underline">
                                Privacy Policy
                              </a>
                            </p>

                            <div className="relative py-2">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                              </div>
                              <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-gray-400">or continue with email</span>
                              </div>
                            </div>
                          </div>

                          {/* Name (signup only) */}
                          {authMode === "signup" && (
                            <div>
                              <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-700">
                                Your Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="signup-name"
                                type="text"
                                placeholder="John Smith"
                                value={formData.parentName}
                                onChange={(e) => {
                                  updateFormData('parentName', e.target.value);
                                  setSignupFieldErrors(prev => ({ ...prev, name: '' }));
                                }}
                                disabled={isSubmitting}
                                className={`mt-1 ${signupFieldErrors.name ? 'border-red-500' : ''}`}
                              />
                              {signupFieldErrors.name && (
                                <p className="text-xs text-red-600 mt-1">{signupFieldErrors.name}</p>
                              )}
                            </div>
                          )}

                          {/* Email */}
                          <div>
                            <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">
                              Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={formData.email}
                              onChange={(e) => {
                                updateFormData('email', e.target.value);
                                setSignupFieldErrors(prev => ({ ...prev, email: '' }));
                              }}
                              disabled={isSubmitting}
                              className={`mt-1 ${signupFieldErrors.email ? 'border-red-500' : ''}`}
                            />
                            {signupFieldErrors.email && (
                              <p className="text-xs text-red-600 mt-1">{signupFieldErrors.email}</p>
                            )}
                          </div>

                          {/* Password */}
                          <div>
                            <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">
                              {authMode === "signup" ? "Choose a Password" : "Password"} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={signupFormData.password}
                                onChange={(e) => {
                                  const newPassword = e.target.value;
                                  setSignupFormData(prev => ({ ...prev, password: newPassword }));
                                  setSignupError("");
                                  setSignupFieldErrors(prev => ({ ...prev, password: '' }));
                                  if (authMode === "signup") {
                                    checkPasswordRequirements(newPassword);
                                  }
                                }}
                                disabled={isSubmitting}
                                className={`pr-20 ${signupFieldErrors.password ? 'border-red-500' : ''}`}
                                required
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {authMode === "signup" && signupFormData.password.length > 0 && isPasswordValid() && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            {authMode === "signup" && signupFormData.password.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.minLength ? "text-green-600" : "text-red-600"}`}>
                                  {passwordRequirements.minLength ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                  <span>At least 8 characters</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasUppercase ? "text-green-600" : "text-red-600"}`}>
                                  {passwordRequirements.hasUppercase ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                  <span>One uppercase letter</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasLowercase ? "text-green-600" : "text-red-600"}`}>
                                  {passwordRequirements.hasLowercase ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                  <span>One lowercase letter</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasNumber ? "text-green-600" : "text-red-600"}`}>
                                  {passwordRequirements.hasNumber ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                  <span>One number</span>
                                </div>
                              </div>
                            )}
                            {signupFieldErrors.password && !signupFormData.password && (
                              <p className="text-xs text-red-600 mt-1">{signupFieldErrors.password}</p>
                            )}
                          </div>

                          {/* Confirm Password (signup only) */}
                          {authMode === "signup" && (
                            <div>
                            <Label htmlFor="signup-confirm-password" className="text-sm font-semibold text-gray-700">
                              Confirm Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="signup-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={signupFormData.confirmPassword}
                                onChange={(e) => {
                                  setSignupFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                                  setSignupError("");
                                  setSignupFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                                }}
                                disabled={isSubmitting}
                                className={`pr-10 ${signupFieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {signupFieldErrors.confirmPassword && (
                              <p className="text-xs text-red-600 mt-1">{signupFieldErrors.confirmPassword}</p>
                            )}
                          </div>
                          )}

                          {/* T&Cs and Marketing Preferences (signup only) */}
                          {authMode === "signup" && (
                            <div className="space-y-3 pt-4">
                              {/* Booking Terms */}
                              <div>
                                <div className="flex items-start gap-2">
                                  <Checkbox
                                    id="booking-terms"
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) => {
                                      setTermsAccepted(checked);
                                      setSignupFieldErrors(prev => ({ ...prev, terms: '' }));
                                    }}
                                    className={`mt-0.5 rounded-full data-[state=checked]:bg-[hsl(var(--primary-500))] ${signupFieldErrors.terms ? 'border-red-500' : ''}`}
                                    required
                                  />
                                  <label htmlFor="booking-terms" className="text-sm cursor-pointer text-gray-700">
                                    I accept PartySnap's{" "}
                                    <BookingTermsModal partyDetails={partyDetails}>
                                      <button type="button" className="text-[hsl(var(--primary-600))] hover:underline font-medium">
                                        Terms & Conditions
                                      </button>
                                    </BookingTermsModal>
                                    {" "}<span className="text-red-500">*</span>
                                  </label>
                                </div>
                                {signupFieldErrors.terms && (
                                  <p className="text-xs text-red-600 mt-1 ml-6">{signupFieldErrors.terms}</p>
                                )}
                              </div>

                              {/* Marketing Preferences */}
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  id="marketing-consent"
                                  checked={marketingConsent}
                                  onCheckedChange={setMarketingConsent}
                                  className="mt-0.5 rounded-full data-[state=checked]:bg-[hsl(var(--primary-500))]"
                                />
                                <label htmlFor="marketing-consent" className="text-sm cursor-pointer text-gray-700">
                                  Send me party ideas and special offers
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {signupError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm text-red-700">{signupError}</p>
                            </div>
                          )}

                          {/* Toggle between signin/signup */}
                          <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              {authMode === "signup" ? (
                                <>
                                  Already have an account?{" "}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAuthMode("signin");
                                      setSignupError("");
                                      setSignupFieldErrors({});
                                      setSignupFormData({ password: "", confirmPassword: "" });
                                    }}
                                    className="text-[hsl(var(--primary-600))] hover:underline font-semibold"
                                  >
                                    Sign in
                                  </button>
                                </>
                              ) : (
                                <>
                                  Don't have an account?{" "}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAuthMode("signup");
                                      setSignupError("");
                                      setSignupFieldErrors({});
                                      setSignupFormData({ password: "", confirmPassword: "" });
                                    }}
                                    className="text-[hsl(var(--primary-600))] hover:underline font-semibold"
                                  >
                                    Create account
                                  </button>
                                </>
                              )}
                            </p>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className={`pt-4 mt-4 border-t border-gray-200 ${currentStepData.showSignupForm ? "max-w-md mx-auto" : ""}`}>
                    <div className="flex justify-between items-center gap-3">
                      {currentStep > 0 && (
                        <button
                          type="button"
                          onClick={handleBack}
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      )}

                      <div className={currentStep === 0 && !user ? "w-full" : "flex-1"}>
                      <Button
                          onClick={currentStepData.showSignupForm
                            ? handleSignupButtonClick
                            : handleNext}
                          disabled={isSubmitting || !canProceed()}
                          className={`w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white h-10 text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 px-4`}
                        >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            {currentStepData.showSignupForm
                              ? (authMode === "signin" ? 'Sign In & Continue' : 'Sign Up & Continue')
                              : currentStep === chatSteps.length - 1
                                ? 'Proceed to Payment'
                                : getButtonText(currentStepData)}
                            {currentStep === chatSteps.length - 1 || currentStepData.showSignupForm ? null : getButtonIcon(currentStepData)}
                          </>
                        )}
                      </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* {showFinalCTA && (
            <div className="animate-in slide-in-from-bottom duration-500">
              <Card className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="bg-primary-500 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Ready to Book!</h2>
                      <p className="text-white/90 text-sm">Secure {selectedSuppliers.length} suppliers</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="text-center mb-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {partyDetails.childName}'s {partyDetails.theme} Party
                    </h3>
                    
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
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
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900">Your Suppliers</h4>
                      <Badge className="bg-[hsl(var(--primary-500))] text-white px-2 py-0.5 rounded-full text-xs">
                        {selectedSuppliers.length}
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedSuppliers.map(supplier => {
                        const fullPartyDetails = {
                          date: partyDetails.rawDate,
                          duration: partyDetails.duration || 2,
                          guestCount: partyDetails.guestCount || 15,
                          startTime: partyDetails.startTime
                        };
                        
                        const pricing = calculateFinalPrice(supplier, fullPartyDetails, []);
                        const isLeadBased = isLeadBasedSupplier(supplier);
                        
                        let breakdownText = '';
                        if (supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')) {
                          const guestCount = fullPartyDetails.guestCount || 15;
                          const basePrice = supplier.originalPrice || supplier.price || supplier.priceFrom || 0;
                          const potentialPerBagPrice = basePrice / guestCount;
                          let perBagPrice;
                          
                          if (potentialPerBagPrice >= 2 && potentialPerBagPrice <= 15 && guestCount > 1) {
                            perBagPrice = potentialPerBagPrice;
                          } else if (basePrice >= 2 && basePrice <= 15) {
                            perBagPrice = basePrice;
                          } else {
                            perBagPrice = 5.00;
                          }
                          breakdownText = `${guestCount} bags × £${perBagPrice.toFixed(2)}`;
                        } else {
                          breakdownText = getPriceBreakdownText(supplier, fullPartyDetails, []);
                        }
                        
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
                                  {breakdownText && <span className="ml-1">- {breakdownText}</span>}
                                </div>
                                {isLeadBased && (
                                  <div className="text-xs text-orange-600 font-medium">
                                    Full payment required
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="font-bold text-[hsl(var(--primary-600))] text-xs flex-shrink-0">
                                £{pricing.finalPrice.toFixed(2)}
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
                        );
                      })}
                      
                      {selectedAddons.map(addon => (
                        <div key={addon.id} className="flex justify-between items-center bg-blue-50 rounded-md p-2 border border-blue-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-md bg-blue-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs">+</span>
                            </div>
                            <span className="text-xs text-gray-700 truncate">{addon.name}</span>
                          </div>
                          <span className="font-bold text-blue-600 text-xs">£{(addon.price || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-teal-100 rounded-lg p-4 mb-4 border border-teal-300">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-700">Total Party Cost:</span>
                      <span className="text-2xl font-black text-gray-900">£{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        // This button appears in alternate view - just proceed through normal flow
                        if (currentStep < chatSteps.length - 1) {
                          setCurrentStep(currentStep + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          handleSubmitEnquiry();
                        }
                      }}
                      disabled={isSubmitting || !canProceed()}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 text-sm font-bold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Preparing Payment...</span>
                        </div>
                      ) : (
                        <span>Continue</span>
                      )}
                    </Button>
                    
                    {loadingError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-xs font-medium">Something went wrong:</p>
                        <p className="text-red-600 text-xs">{loadingError}</p>
                        <Button
                          variant="outline"
                          onClick={() => setLoadingError(null)}
                          className="mt-2 text-xs"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowFinalCTA(false);
                        setCurrentStep(1);
                        setInitialSupplierCount(selectedSuppliers.length);
                        setHasAddedOnCurrentStep(false);
                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                      }}
                      className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 py-2 px-4 font-medium rounded-lg transition-all duration-200 text-sm"
                    >
                      Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )} */}
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 overflow-hidden" />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            // Just close the modal and stay on review-book page
            // User can try payment again when ready
            setShowAuthModal(false);
            setAuthRequired(false);
          }}
          onSuccess={handleAuthSuccess}
          returnTo={window.location.href}
          selectedSuppliersCount={selectedSuppliers.length}
          defaultEmail={formData.email}
        />
      )}

      <PartyReadinessModal
        isOpen={showReadinessModal}
        onClose={() => {
          setShowReadinessModal(false);
          router.push('/dashboard');
        }}
        onProceed={() => {
          setShowReadinessModal(false);
          setAuthRequired(true);
          setShowAuthModal(true);
        }}
        suppliers={fullSupplierData}
        partyDetails={partyDetails}
        totalCost={grandTotal}
      />

      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        supplierType={supplierToDelete?.type}
        onConfirm={handleConfirmRemoveSupplier}
        onCancel={handleCancelRemoveSupplier}
      />
    </>
  );
}