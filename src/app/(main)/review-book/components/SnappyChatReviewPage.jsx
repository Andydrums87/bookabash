"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Palette
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
  const [loadingError, setLoadingError] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [addedSupplierIds, setAddedSupplierIds] = useState(new Set());

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

  // Chat steps - simplified to 2 steps
  const chatSteps = [
    {
      id: 'main-form',
      title: "Review Your Party Details",
      description: "Please confirm all details before proceeding to payment",
      showMainForm: true
    },
    {
      id: 'forgotten',
      title: "Anything Missing?",
      description: "Here are some popular extras you might want to add (Optional)",
      showMissingSuppliers: true,
      optional: true
    }
  ];
  // Load data on mount
  useEffect(() => {
    loadPartyDataFromLocalStorage();
    checkAuthStatusAndLoadProfile();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const needsReadinessCheck = urlParams.get('check_readiness') === 'true';
    
    if (!loadingProfile && !user && !authRequired) {
      if (needsReadinessCheck && !showReadinessModal) {
        setShowReadinessModal(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } else if (!needsReadinessCheck) {
        setAuthRequired(true);
        setShowAuthModal(true);
      }
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

  const loadPartyDataFromLocalStorage = () => {
    try {
      const details = JSON.parse(localStorage.getItem("party_details") || "{}");
      console.log('party_details from localStorage:', details);
      
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
        const result = await partyDatabaseBackend.getCurrentUser();
        if (result.success) {
          setCustomerProfile(result.user);
          setFormData((prev) => ({
            ...prev,
            parentName: `${result.user.first_name || ""} ${result.user.last_name || ""}`.trim() || prev.parentName,
            email: result.user.email || user.email || prev.email,
            phoneNumber: result.user.phone || prev.phoneNumber,
            addressLine1: result.user.address_line_1 || prev.addressLine1,
            addressLine2: result.user.address_line_2 || prev.addressLine2,
            city: result.user.city || prev.city,
            postcode: result.user.postcode || prev.postcode,
           
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
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
        email: authenticatedUser.email,
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
        dietaryRequirements: formData.dietaryRequirements,
        dietaryRequirementsArray: dietaryRequirementsArray,
        hasDietaryRequirements: dietaryRequirementsArray.length > 0,
        accessibilityRequirements: formData.accessibilityRequirements,
        accessibilityRequirementsArray: accessibilityRequirementsArray,
        hasAccessibilityRequirements: accessibilityRequirementsArray.length > 0,
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
      setFormData((prev) => ({
        ...prev,
        parentName: userData.firstName && userData.lastName
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : userData.firstName || prev.parentName,
        email: userData.email || prev.email,
        phoneNumber: userData.phone || prev.phoneNumber,
      }));
    } else {
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
    try {
      setIsSubmitting(true);
      setLoadingError(null);
      
      const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
      const supplierCount = Object.values(partyPlan).filter(supplier => 
        supplier && typeof supplier === 'object' && supplier.name
      ).length;

      const migratedParty = await migratePartyToDatabase(user);
      
      await supabase.from('parties').update({ status: 'draft' }).eq('id', migratedParty.id);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const paymentUrl = `/payment/secure-party?party_id=${migratedParty.id}&suppliers=${supplierCount}`;
      router.push(paymentUrl);
    } catch (error) {
      console.error("Migration failed:", error);
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
      const phoneValid = phoneError === '' && formData.phoneNumber.length > 0;
      const addressValid = formData.addressLine1.length > 0 && 
                          formData.city.length > 0 && 
                          formData.postcode.length > 0;
      return formData.parentName.length > 0 && phoneValid && formData.email.length > 0 && addressValid;
    }
    return true;
  };

  const currentStepData = chatSteps[currentStep];

  const handleNext = async () => {
    if (currentStep < chatSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If we're on the last step, go directly to payment
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
  
  const getButtonText = (stepData) => {
    if (stepData.id === 'forgotten') {
      return hasAddedOnCurrentStep ? 'Continue' : 'Skip this';
    }
    if (stepData.optional) return 'Skip this';
    return 'Continue';
  };

  const getButtonIcon = (stepData) => {
    if (stepData.id === 'forgotten' && hasAddedOnCurrentStep) {
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
                                onChange={(e) => updateFormData('email', e.target.value)}
                                className="h-12 text-gray-900 border-gray-300 focus:border-[hsl(var(--primary-500))] rounded-md"
                                disabled={!!user}
                              />
                              {user && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
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
                            Where should suppliers deliver and set up?
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

                        {/* Dietary & Accessibility */}
                        <div className=" rounded-lg ">
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
                        </div>

                        {/* Special Requests */}
                        <div className="rounded-lg ">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Special Requests (Optional)
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">
                            Any special requests or theme details for suppliers
                          </p>
                          
                          <Textarea
                            placeholder="e.g., 'Please set up by 1pm', 'Superhero theme', 'Child sensitive to loud noises'..."
                            value={formData.additionalMessage}
                            onChange={(e) => updateFormData('additionalMessage', e.target.value)}
                            className="min-h-[100px] placeholder:text-gray-400 placeholder:text-xs text-base border-gray-300 focus:border-[hsl(var(--primary-500))] resize-none rounded-md"
                          />
                        </div>
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
                          addedSupplierIds={addedSupplierIds}
                          preventNavigation={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-5 mt-5 border-t border-gray-200">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-md font-medium text-sm"
                      >
                        Back
                      </Button>
                    )}

                    <div className={currentStep === 0 ? "w-full" : "ml-auto"}>
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed() || isSubmitting}
                        className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-5 py-2 text-sm font-semibold rounded-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            {currentStep === chatSteps.length - 1 ? 'Proceed to Payment' : getButtonText(currentStepData)}
                            {currentStep === chatSteps.length - 1 ? null : getButtonIcon(currentStepData)}
                          </>
                        )}
                      </Button>
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
                          <span className="font-bold text-blue-600 text-xs">£{addon.price || 0}</span>
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
                      onClick={handleSubmitEnquiry}
                      disabled={isSubmitting}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 text-sm font-bold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Preparing Payment...</span>
                        </div>
                      ) : (
                        <span>Secure My Dream Party Now!</span>
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
            if (authRequired) {
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