// utils/partyBuilderBackend.js - Fixed to use unified pricing system


"use client"

import { useState } from 'react';
import { suppliersAPI } from './mockBackend';
import { LocationService } from './locationService';
import { partyDatabaseBackend } from './partyDatabaseBackend';
import { calculateFinalPrice } from './unifiedPricing'; // ✅ Import unified pricing

const THEMES = {
  'no-theme': {
    name: "No Theme",
    keywords: ["simple", "general", "basic", "standard", "no-theme"],
    colors: ["multicolor"],
    decorationStyle: "general",
    priority: "simple"
  },
  'spiderman': {
    name: "Spider-Man",
    keywords: ["spiderman", "spider", "web", "superhero", "marvel"],
    colors: ["red", "blue"],
    decorationStyle: "superhero",
    priority: "character"
  },
  'taylor-swift': {
    name: "Taylor Swift", 
    keywords: ["taylor", "swift", "pop", "star", "music", "concert", "eras"],
    colors: ["pink", "purple", "gold"],
    decorationStyle: "glamorous",
    priority: "music"
  },
  'princess': {
    name: "Princess",
    keywords: ["princess", "fairy", "castle", "royal", "crown", "dress", "magic", "elegant"],
    colors: ["pink", "purple", "gold"],
    decorationStyle: "elegant",
    priority: "character"
  },
  'dinosaur': {
    name: "Dinosaur",
    keywords: ["dinosaur", "dino", "prehistoric", "jurassic", "t-rex", "fossil", "adventure"],
    colors: ["green", "brown", "orange"],
    decorationStyle: "adventure",
    priority: "educational"
  },
  'unicorn': {
    name: "Unicorn",
    keywords: ["unicorn", "rainbow", "magical", "sparkle", "fantasy", "horn", "pastel"],
    colors: ["pink", "purple", "rainbow"],
    decorationStyle: "magical",
    priority: "fantasy"
  },
  'science': {
    name: "Science",
    keywords: ["science", "experiment", "laboratory", "chemistry", "stem", "educational"],
    colors: ["blue", "green", "white"],
    decorationStyle: "educational",
    priority: "educational"
  },
  'superhero': {
    name: "Superhero",
    keywords: ["superhero", "hero", "captain", "marvel", "batman", "super", "power"],
    colors: ["red", "blue", "yellow"],
    decorationStyle: "action-packed",
    priority: "character"
  }
};

class PartyBuilderBackend {
  
  // Budget calculation based on guest count
  getDefaultBudgetForGuests(guestCount) {
    const guests = parseInt(guestCount);
    
    if (guests <= 5) return 400;
    if (guests <= 10) return 500;
    if (guests <= 15) return 600;
    if (guests <= 20) return 700;
    if (guests <= 25) return 800;
    return 900;
  }

  // ✅ UPDATED: Get cheapest package for supplier (budget-conscious)
  getBasicPackageForSupplier(supplier, theme = 'no-theme') {
    console.log('🔍 DEBUG getBasicPackageForSupplier called with:', {
      supplierName: supplier.name,
      hasPackages: !!supplier.packages,
      packagesLength: supplier.packages?.length || 0,
      packages: supplier.packages,
      theme,
      supplierKeys: Object.keys(supplier)
    });
    // Check if supplier already has packages
    if (supplier.packages && supplier.packages.length > 0) {
      // Sort packages by price (cheapest first)
      const sortedPackages = [...supplier.packages].sort((a, b) => {
        const priceA = a.price || a.originalPrice || 0;
        const priceB = b.price || b.originalPrice || 0;
        return priceA - priceB;
      });
      
      // Try to find cheapest theme-specific package first
      const themePackages = sortedPackages.filter(pkg => 
        pkg.theme === theme || pkg.themes?.includes(theme)
      );
      
      if (themePackages.length > 0) {
        console.log(`📦 Using cheapest theme package for ${supplier.name}:`, themePackages[0].name, `(£${themePackages[0].price})`);
        return themePackages[0];
      }
      
      // Otherwise use the cheapest package overall
      const cheapestPackage = sortedPackages[0];
      console.log(`📦 Using cheapest package for ${supplier.name}:`, cheapestPackage.name, `(£${cheapestPackage.price || cheapestPackage.originalPrice})`);
      return cheapestPackage;
    }
    
    // Create a basic package if none exists
    const basicPackage = this.createBasicPackage(supplier, theme);
    console.log(`📦 Created basic package for ${supplier.name}:`, basicPackage.name);
    return basicPackage;
  }

  // ✅ NEW: Create basic package for supplier
  createBasicPackage(supplier, theme = 'no-theme') {
    const category = supplier.category?.toLowerCase() || '';
    
    // Define basic packages by category
    const packageTemplates = {
      'entertainment': {
        name: 'Standard Entertainment Package',
        duration: 2,
        description: 'Professional entertainment for your party',
        includes: ['Performance', 'Music system', 'Basic props']
      },
      'venues': {
        name: 'Basic Venue Package', 
        duration: 3,
        description: 'Venue hire with essential facilities',
        includes: ['Venue space', 'Tables and chairs', 'Basic decorations']
      },
      'cakes': {
        name: 'Custom Theme Cake',
        description: 'Themed cake for your celebration',
        includes: ['Custom design', 'Theme decorations', 'Delivery']
      },
      'catering': {
        name: 'Party Food Package',
        description: 'Delicious food for your guests',
        includes: ['Hot food', 'Drinks', 'Serving equipment']
      },
      'party bags': {
        name: 'Themed Party Bags',
        description: 'Fun party bags for all guests',
        includes: ['Themed items', 'Sweets', 'Small toys']
      },
      'decorations': {
        name: 'Basic Decoration Package',
        description: 'Transform your space with themed decorations',
        includes: ['Banners', 'Balloons', 'Table decorations']
      },
      'activities': {
        name: 'Fun Activities Package',
        description: 'Engaging activities for children',
        includes: ['Supervised activities', 'Equipment', 'Setup and cleanup']
      }
    };

    const template = packageTemplates[category] || packageTemplates['entertainment'];
    
    return {
      id: `${supplier.id}-basic-package`,
      name: template.name,
      description: template.description,
      price: supplier.priceFrom || supplier.price || 0,
      originalPrice: supplier.priceFrom || supplier.price || 0,
      duration: template.duration || 2,
      includes: template.includes,
      theme: theme !== 'no-theme' ? theme : null,
      isBasicPackage: true,
      supplierId: supplier.id,
      supplierName: supplier.name
    };
  }

  // ✅ UPDATED: Enhanced supplier selection with package setup and unified pricing
  selectBestSupplier(suppliers, category, theme, timeSlot, duration, date, location, categoryBudget, partyDetails) {
    console.log('🔍 DEBUG: selectBestSupplier called with:', {
      category,
      date,
      dateType: typeof date,
      partyDetails
    });
    if (!suppliers || suppliers.length === 0) {
      return { supplier: null, reason: 'no-suppliers-found' };
    }
    
    console.log(`Selecting ${category} from ${suppliers.length} candidates (budget: £${categoryBudget})`);
    
    // Filter by budget first (with some flexibility)
    const budgetFiltered = suppliers.filter(s => s.priceFrom <= categoryBudget * 1.3);
    
    if (budgetFiltered.length === 0) {
      return { supplier: null, reason: 'no-suppliers-in-budget' };
    }
    
    // Score all suppliers and set up packages
    const scoredSuppliers = budgetFiltered.map(supplier => {
     
      const availabilityCheck = this.checkSupplierAvailability(supplier, new Date(date), timeSlot);
      const locationCheck = this.checkSupplierLocation(supplier, location);
      const themeScore = this.scoreSupplierWithTheme(supplier, theme, timeSlot, duration);
      
      // ✅ NEW: Set up basic package for supplier
      const basicPackage = this.getBasicPackageForSupplier(supplier, theme);
      
      // ✅ NEW: Create enhanced supplier with package data
      const enhancedSupplier = {
        ...supplier,
        packageData: basicPackage,
        // Preserve original pricing for reference
        originalPrice: supplier.priceFrom || supplier.price || 0
      };
      
      // ✅ NEW: Calculate pricing using unified pricing system
      const pricingResult = calculateFinalPrice(enhancedSupplier, partyDetails, []);
      
      console.log(`💰 Pricing for ${supplier.name}:`, {
        originalPrice: enhancedSupplier.originalPrice,
        finalPrice: pricingResult.finalPrice,
        hasWeekendPremium: pricingResult.breakdown.weekend > 0,
        breakdown: pricingResult.breakdown
      });
      
      // ✅ NEW: Add enhanced pricing to supplier
      enhancedSupplier.enhancedPrice = pricingResult.finalPrice;
      enhancedSupplier.enhancedPricing = pricingResult;
      
      // Calculate composite score
      let compositeScore = themeScore;
      
      // Availability bonuses/penalties
      if (availabilityCheck.available) {
        compositeScore += availabilityCheck.confidence === 'high' ? 25 : 10;
      } else {
        compositeScore -= 30;
      }
      
      // Location bonuses/penalties
      if (locationCheck.canServe) {
        compositeScore += locationCheck.confidence === 'high' ? 15 : 5;
      } else {
        compositeScore -= 20;
      }
      
      return {
        ...enhancedSupplier,
        compositeScore,
        themeScore,
        availabilityCheck,
        locationCheck,
        isAvailable: availabilityCheck.available,
        canServeLocation: locationCheck.canServe
      };
    });
    
    // Sort by composite score
    const sorted = scoredSuppliers.sort((a, b) => b.compositeScore - a.compositeScore);
    
    // Try to find the best available supplier first
    const bestAvailable = sorted.find(s => s.isAvailable && s.canServeLocation);
    
    if (bestAvailable) {
      console.log(`✅ Selected available ${category}: ${bestAvailable.name} (score: ${bestAvailable.compositeScore}, price: £${bestAvailable.enhancedPrice})`);
      return { 
        supplier: bestAvailable, 
        reason: 'best-available-match',
        requiresConfirmation: false
      };
    }
    
    // Fallback: Best supplier regardless of availability
    const bestFallback = sorted[0];
    
    return { 
      supplier: {
        ...bestFallback,
        isFallbackSelection: true
      }, 
      reason: 'best-fallback-match',
      requiresConfirmation: true,
      availabilityIssue: !bestFallback.isAvailable,
      locationIssue: !bestFallback.canServeLocation
    };
  }

  // Comprehensive availability checking
  checkSupplierAvailability(supplier, date, timeSlot) {
    if (!supplier || !date) {
      return { available: true, reason: 'no-date-provided', confidence: 'low' };
    }
    
    try {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = date.toISOString().split('T')[0];
      
      // Check if supplier has any availability data
      const hasAvailabilityData = !!(
        supplier.workingHours || 
        supplier.unavailableDates || 
        supplier.busyDates ||
        supplier.availability
      );
      
      if (!hasAvailabilityData) {
        return { available: true, reason: 'no-availability-data', confidence: 'medium' };
      }
      
      // Check working hours
      if (supplier.workingHours && supplier.workingHours[dayName]) {
        const workingDay = supplier.workingHours[dayName];
        
        if (!workingDay.active) {
          return { available: false, reason: 'closed-day', confidence: 'high' };
        }
        
        if (workingDay.timeSlots && workingDay.timeSlots[timeSlot]) {
          if (!workingDay.timeSlots[timeSlot].available) {
            return { available: false, reason: 'time-slot-unavailable', confidence: 'high' };
          }
        }
      }
      
      // Check unavailable dates
      if (supplier.unavailableDates && Array.isArray(supplier.unavailableDates)) {
        for (const ud of supplier.unavailableDates) {
          const udDate = typeof ud === 'string' ? ud : ud.date;
          const udDateClean = udDate.includes('T') ? udDate.split('T')[0] : udDate;
          
          if (udDateClean === dateString) {
            if (typeof ud === 'string') {
              return { available: false, reason: 'date-blocked', confidence: 'high' };
            }
            if (ud.timeSlots && ud.timeSlots.includes(timeSlot)) {
              return { available: false, reason: 'time-slot-blocked', confidence: 'high' };
            }
          }
        }
      }
      
      // Check busy dates
      if (supplier.busyDates && Array.isArray(supplier.busyDates)) {
        for (const bd of supplier.busyDates) {
          const bdDate = typeof bd === 'string' ? bd : bd.date;
          const bdDateClean = bdDate.includes('T') ? bdDate.split('T')[0] : bdDate;
          
          if (bdDateClean === dateString) {
            if (typeof bd === 'string') {
              return { available: false, reason: 'date-busy', confidence: 'high' };
            }
            if (bd.timeSlots && bd.timeSlots.includes(timeSlot)) {
              return { available: false, reason: 'time-slot-busy', confidence: 'high' };
            }
          }
        }
      }
      
      // Check new availability structure
      if (supplier.availability) {
        if (supplier.availability.timeSlots && supplier.availability.timeSlots.length > 0) {
          if (!supplier.availability.timeSlots.includes(timeSlot)) {
            return { available: false, reason: 'time-slot-not-supported', confidence: 'high' };
          }
        }
        
        if (supplier.availability.blockedDates && Array.isArray(supplier.availability.blockedDates)) {
          const isBlocked = supplier.availability.blockedDates.some(blockedDateStr => {
            const blockedDate = new Date(blockedDateStr);
            return blockedDate.toDateString() === date.toDateString();
          });
          
          if (isBlocked) {
            return { available: false, reason: 'date-in-blocked-list', confidence: 'high' };
          }
        }
      }
      
      return { available: true, reason: 'available', confidence: 'high' };
      
    } catch (error) {
      console.error(`Error checking availability for ${supplier.name}:`, error);
      return { available: true, reason: 'error-default', confidence: 'low' };
    }
  }

  // Enhanced supplier scoring
  scoreSupplierWithTheme(supplier, theme, timeSlot = 'afternoon', duration = 2) {
    let score = 50; // Base score
    
    try {
      if (theme === 'no-theme') {
        if (!supplier?.themes || supplier.themes.length === 0) {
          score += 30;
        }
        if (supplier?.themes && supplier.themes.includes('general')) {
          score += 40;
        }
      } else {
        // Theme matching
        if (supplier?.themes && Array.isArray(supplier.themes)) {
          if (supplier.themes.includes(theme)) {
            score += 50;
          }
        }
        
        if (supplier?.serviceDetails?.themes && Array.isArray(supplier.serviceDetails.themes)) {
          if (supplier.serviceDetails.themes.includes(theme)) {
            score += 30;
          }
        }
        
        // Name and description matching
        if (supplier?.name && typeof supplier.name === 'string') {
          const lowerName = supplier.name.toLowerCase();
          const lowerTheme = theme?.toLowerCase() || '';
          if (lowerName.includes(lowerTheme)) {
            score += 20;
          }
        }
        
        if (supplier?.description && typeof supplier.description === 'string') {
          const lowerDescription = supplier.description.toLowerCase();
          const lowerTheme = theme?.toLowerCase() || '';
          if (lowerDescription.includes(lowerTheme)) {
            score += 10;
          }
        }
      }
      
      // Rating bonus
      if (supplier.rating) {
        score += (supplier.rating * 2);
      }
      
      return score;
      
    } catch (error) {
      console.error('Error in scoreSupplierWithTheme:', error);
      return 50;
    }
  }

  // Location checking with fallback
  checkSupplierLocation(supplier, partyLocation) {
    if (!supplier.location || !partyLocation) {
      return { canServe: true, reason: 'no-location-data', confidence: 'medium' };
    }
    
    try {
      const serviceRadius = LocationService.getServiceRadiusForSupplier(supplier);
      const canServe = LocationService.arePostcodesNearby(supplier.location, partyLocation, serviceRadius);
      
      return {
        canServe,
        reason: canServe ? 'location-within-range' : 'location-too-far',
        confidence: 'high'
      };
    } catch (error) {
      console.warn(`Location check failed for ${supplier.name}:`, error);
      return { canServe: true, reason: 'location-check-error', confidence: 'low' };
    }
  }

  // ✅ UPDATED: Improved supplier selection with package setup and unified pricing
  selectSuppliersForParty({
    suppliers, 
    themedEntertainment, 
    theme, 
    guestCount, 
    location, 
    budget, 
    childAge,
    timeSlot = 'afternoon',
    duration = 2,
    date
  }) {
    const selected = {};
    let remainingBudget = budget;
    const guests = parseInt(guestCount);
    const isLargeParty = guests >= 30;
    
    // ✅ NEW: Create party details object for pricing calculations
    const partyDetails = {
      date: new Date(date),
      duration,
      guestCount: guests,
      timeSlot,
      theme,
      location
    };
    
    // Define budget allocation based on budget size
    let budgetAllocation, includedCategories;
    
    if (budget <= 500) {
      includedCategories = ['venue', 'entertainment', 'cakes', ];
      budgetAllocation = { venue: 0.45, entertainment: 0.35, cakes: 0.15 };
    } else if (budget <= 700) {
      includedCategories = ['venue', 'entertainment', 'cakes'];
      budgetAllocation = { venue: 0.35, entertainment: 0.35, cakes: 0.25 };
    } else {
      includedCategories = ['venue', 'entertainment', 'cakes', 'decorations', 'activities', 'partyBags'];
      if (isLargeParty) {
        budgetAllocation = { venue: 0.25, entertainment: 0.25, cakes: 0.15, decorations: 0.08, activities: 0.15, partyBags: 0.04, softPlay: 0.08 };
        includedCategories.push('softPlay');
      } else {
        budgetAllocation = { venue: 0.25, entertainment: 0.30, cakes: 0.20, decorations: 0.15, activities: 0.06, partyBags: 0.04 };
      }
    }
    
    // 1. SELECT ENTERTAINMENT FIRST (theme priority)
    const entertainmentBudget = budget * budgetAllocation.entertainment;
    
    if (themedEntertainment && themedEntertainment.length > 0) {
      const entertainmentResult = this.selectBestSupplier(
        themedEntertainment, 'entertainment', theme, timeSlot, duration, date, location, entertainmentBudget, partyDetails
      );
      
      if (entertainmentResult.supplier) {
        selected.entertainment = entertainmentResult.supplier;
        remainingBudget -= entertainmentResult.supplier.enhancedPrice;
        console.log(`Entertainment selected: ${entertainmentResult.supplier.name} (Enhanced price: £${entertainmentResult.supplier.enhancedPrice})`);
      }
    }
    
    // Fallback to general entertainment if no themed entertainment selected
    if (!selected.entertainment) {
      const generalEntertainment = suppliers.filter(s => s.category === 'Entertainment');
      const entertainmentResult = this.selectBestSupplier(
        generalEntertainment, 'entertainment', theme, timeSlot, duration, date, location, entertainmentBudget, partyDetails
      );
      
      if (entertainmentResult.supplier) {
        selected.entertainment = entertainmentResult.supplier;
        remainingBudget -= entertainmentResult.supplier.enhancedPrice;
        console.log(`General entertainment selected: ${entertainmentResult.supplier.name} (Enhanced price: £${entertainmentResult.supplier.enhancedPrice})`);
      }
    }
    
    // 2. SELECT OTHER CATEGORIES
    for (const category of includedCategories) {
      if (category === 'entertainment') continue; // Already handled
      
      const categoryBudget = budget * budgetAllocation[category];
      let categorySuppliers = [];
      
      if (category === 'cakes') {
        categorySuppliers = suppliers.filter(s => s.category === 'Cakes');
      } else if (category === 'softPlay') {
        categorySuppliers = suppliers.filter(s => 
          s.category === 'Activities' &&
          (s.name.toLowerCase().includes('soft play') || 
           s.name.toLowerCase().includes('bouncy castle') ||
           s.name.toLowerCase().includes('inflatable'))
        );
      } else {
        const mappedCategory = this.mapCategoryToSupplierCategory(category);
        categorySuppliers = suppliers.filter(s => s.category === mappedCategory);
      }
      
      if (categorySuppliers.length > 0) {
        const result = this.selectBestSupplier(
          categorySuppliers, category, theme, timeSlot, duration, date, location, categoryBudget, partyDetails
        );
        
        if (result.supplier) {
          selected[category] = result.supplier;
          remainingBudget -= result.supplier.enhancedPrice;
          console.log(`${category} selected: ${result.supplier.name} (Enhanced price: £${result.supplier.enhancedPrice})`);
        }
      }
    }
    
    // Summary
    const totalCost = Object.values(selected).reduce((sum, supplier) => sum + (supplier.enhancedPrice || supplier.priceFrom || 0), 0);
    const budgetUsed = Math.round((totalCost / budget) * 100);
    
    console.log(`Party selection complete. Total cost: £${totalCost} (${budgetUsed}% of £${budget} budget)`);
    
    return selected;
  }

  convertSuppliersToPartyPlan(selectedSuppliers) {
    const partyPlan = {
      venue: null,
      entertainment: null,
      cakes: null,
      catering: null,
      facePainting: null,
      activities: null,
      partyBags: null,
      decorations: null,
      balloons: null,
      softPlay: null,
      einvites: {
        id: "digital-invites",
        name: "Digital Themed Invites",
        description: "Themed e-invitations with RSVP tracking",
        price: 25,
        status: "confirmed",
        image: "/placeholder.jpg",
        category: "Digital Services",
        priceUnit: "per set",
        addedAt: new Date().toISOString()
      },
      addons: []
    };
  
    Object.entries(selectedSuppliers).forEach(([category, supplier]) => {
      if (supplier && partyPlan.hasOwnProperty(category)) {
        
        console.log(`🔍 Converting ${supplier.name} to party plan:`, {
          originalPrice: supplier.originalPrice,
          enhancedPrice: supplier.enhancedPrice,
          hasWeekendPremium: !!supplier.weekendPremium,
          weekendPremiumConfig: supplier.weekendPremium
        });
        
        partyPlan[category] = {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description || '',
          
          // ✅ FIXED: Store base price for dynamic calculation, not enhanced price
          // To this (add debugging to see what's happening):
price: (() => {
  const finalPrice = supplier.enhancedPrice || supplier.priceFrom || 0;
  console.log(`💾 STORING ${supplier.name}: enhancedPrice=${supplier.enhancedPrice}, priceFrom=${supplier.priceFrom}, storing=${finalPrice}`);
  return finalPrice;
})(),
          originalPrice: supplier.originalPrice || supplier.priceFrom || 0,
          
          status: supplier.isFallbackSelection ? "needs_confirmation" : "pending",
          image: supplier.image || '',
          category: supplier.category || category,
          priceUnit: supplier.priceUnit || "per event",
          addedAt: new Date().toISOString(),
          
          // ✅ FIXED: Preserve ALL pricing configuration for dynamic calculation
          packageData: supplier.packageData,
          
          // ✅ CRITICAL: Preserve weekend premium configuration
          weekendPremium: supplier.weekendPremium,
          extraHourRate: supplier.extraHourRate || supplier.serviceDetails?.extraHourRate || 0,
          serviceDetails: supplier.serviceDetails,
          
          originalSupplier: {
            ...supplier,
            // ✅ CRITICAL: Ensure weekend premium is preserved in original supplier
            weekendPremium: supplier.weekendPremium,
            extraHourRate: supplier.extraHourRate,
            serviceDetails: supplier.serviceDetails
          },
          isFallbackSelection: supplier.isFallbackSelection || false
        };
        
        console.log(`✅ Stored ${supplier.name} with weekend premium:`, {
          storedWeekendPremium: partyPlan[category].weekendPremium,
          originalSupplierWeekendPremium: partyPlan[category].originalSupplier.weekendPremium
        });
      }
    });
    
    return partyPlan;
  }

  // Map dashboard categories to supplier categories
  mapCategoryToSupplierCategory(dashboardCategory) {
    const mapping = {
      venue: 'Venues',
      entertainment: 'Entertainment',
      catering: 'Catering',
      cakes: 'Cakes',
      decorations: 'Decorations',
      activities: 'Activities',
      partyBags: 'Party Bags'
    };
    return mapping[dashboardCategory] || dashboardCategory;
  }

  // ✅ UPDATED: Main party building method with enhanced pricing
  async buildParty(partyDetails) {
    try {
      const {
        date, theme, guestCount, location, budget,
        childAge = 6, childName = "Snappy The Crocodile",
        firstName = "Snappy", lastName = "The Crocodile",
        timeSlot, duration = 2, time
      } = partyDetails;

      // Smart budget handling
      let finalBudget = budget && budget > 0 ? budget : this.getDefaultBudgetForGuests(guestCount);
      
      // Handle time slot conversion
      let processedTimeSlot = timeSlot;
      if (!timeSlot && time) {
        const hour = parseInt(time.split(':')[0]);
        processedTimeSlot = hour < 13 ? 'morning' : 'afternoon';
      }
      if (!processedTimeSlot) {
        processedTimeSlot = 'afternoon';
      }

      // Handle name processing
      let processedFirstName = firstName;
      let processedLastName = lastName;
      if (!firstName && !lastName && childName) {
        const nameParts = childName.split(' ');
        processedFirstName = nameParts[0] || "Snappy";
        processedLastName = nameParts.slice(1).join(' ') || "The Crocodile";
      }

      console.log(`Building party for ${processedFirstName} ${processedLastName} - Budget: £${finalBudget}, Theme: ${theme}, Date: ${date}`);

      // Get suppliers
      const allSuppliers = await suppliersAPI.getAllSuppliers();
      const themedEntertainment = await suppliersAPI.getEntertainmentByTheme(theme);
      
      // Select suppliers with enhanced pricing
      const selectedSuppliers = this.selectSuppliersForParty({
        suppliers: allSuppliers,
        themedEntertainment,
        theme,
        guestCount,
        location,
        budget: finalBudget,
        childAge,
        timeSlot: processedTimeSlot,
        duration,
        date
      });

      // ✅ UPDATED: Create party plan with enhanced pricing
      const partyPlan = this.convertSuppliersToPartyPlan(selectedSuppliers);
      
      // Save to localStorage
      const enhancedPartyDetails = {
        ...partyDetails,
        budget: finalBudget,
        timeSlot: processedTimeSlot,
        duration,
        firstName: processedFirstName,
        lastName: processedLastName,
        childName: `${processedFirstName} ${processedLastName}`.trim(),
        time: time || this.convertTimeSlotToTime(processedTimeSlot),
        displayTimeSlot: this.formatTimeSlotForDisplay(processedTimeSlot),
        displayDuration: this.formatDurationForDisplay(duration)
      };

      this.savePartyDetailsToLocalStorage(enhancedPartyDetails);
      this.savePartyPlanToLocalStorage(partyPlan);

      const totalCost = this.calculateTotalCost(partyPlan);

      console.log(`Party built successfully! Total cost: £${totalCost} (Budget: £${finalBudget})`);

      return {
        success: true,
        partyPlan,
        selectedSuppliers,
        totalCost,
        theme: THEMES[theme] || { name: theme },
        budget: finalBudget,
        timeSlot: processedTimeSlot,
        duration,
        timeWindow: this.getTimeWindowForSlot(processedTimeSlot),
        fallbackSelections: Object.values(partyPlan).filter(s => s && s.isFallbackSelection).length,
        enhancedPricingUsed: true // ✅ NEW: Flag to indicate enhanced pricing was used
      };

    } catch (error) {
      console.error('Error building party:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ UPDATED: Calculate total cost using enhanced pricing
  calculateTotalCost(partyPlan) {
    let total = 0;
    Object.entries(partyPlan).forEach(([key, supplier]) => {
      if (supplier && supplier.price && key !== 'addons') {
        total += supplier.price; // This is now the enhanced price
      }
    });
    if (partyPlan.addons) {
      partyPlan.addons.forEach(addon => {
        if (addon && addon.price) total += addon.price;
      });
    }
    return total;
  }

  // Utility methods
  convertTimeSlotToTime(timeSlot) {
    return timeSlot === 'morning' ? '11:00' : '14:00';
  }

  formatTimeSlotForDisplay(timeSlot) {
    return timeSlot === 'morning' ? 'Morning Party' : 'Afternoon Party';
  }

  formatDurationForDisplay(duration) {
    if (!duration) return '2 hours';
    return duration === Math.floor(duration) ? `${duration} hours` : `${Math.floor(duration)}h ${(duration % 1) * 60}m`;
  }

  getTimeWindowForSlot(timeSlot) {
    const windows = {
      morning: { start: '10:00', end: '13:00', label: '10am-1pm' },
      afternoon: { start: '13:00', end: '17:00', label: '1pm-4pm' }
    };
    return windows[timeSlot] || windows.afternoon;
  }

  savePartyDetailsToLocalStorage(partyDetails) {
    try {
      localStorage.setItem('party_details', JSON.stringify(partyDetails));
    } catch (error) {
      console.error('Error saving party details:', error);
    }
  }

  savePartyPlanToLocalStorage(partyPlan) {
    try {
      localStorage.setItem('user_party_plan', JSON.stringify(partyPlan));
    } catch (error) {
      console.error('Error saving party plan:', error);
    }
  }

  // Get party details (database first, localStorage fallback)
  async getPartyDetails() {
    try {
      const currentPartyResult = await partyDatabaseBackend.getCurrentParty();
      if (currentPartyResult.success && currentPartyResult.party) {
        const party = currentPartyResult.party;
        return {
          childName: party.child_name,
          childAge: party.child_age,
          date: party.party_date,
          time: party.party_time,
          guestCount: party.guest_count,
          location: party.location,
          postcode: party.postcode,
          theme: party.theme,
          budget: party.budget,
          specialRequirements: party.special_requirements
        };
      }
    } catch (error) {
      console.log('No database party found, checking localStorage...');
    }

    try {
      const stored = localStorage.getItem('party_details');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting party details:', error);
      return null;
    }
  }

  getThemeSuggestions(childAge) {
    if (childAge <= 4) return ['unicorn', 'princess', 'dinosaur'];
    if (childAge <= 7) return ['spiderman', 'princess', 'dinosaur', 'unicorn'];
    if (childAge <= 10) return ['spiderman', 'taylor-swift', 'science', 'dinosaur'];
    return ['taylor-swift', 'science', 'spiderman'];
  }

  getAvailableThemes() {
    return Object.keys(THEMES).map(key => ({ id: key, ...THEMES[key] }));
  }

  // Find available suppliers for replacement
  async findAvailableSuppliers({ date, timeSlot, location, supplierType, excludeSupplierIds = [], budget, theme, guestCount }) {
    try {
      const allSuppliers = await suppliersAPI.getAllSuppliers();
      const categorySuppliers = allSuppliers.filter(s => s.category === supplierType);
      
      const availableSuppliers = [];
      const checkDate = date instanceof Date ? date : new Date(date);
      
      for (const supplier of categorySuppliers) {
        if (excludeSupplierIds.includes(supplier.id)) continue;
        
        const availabilityResult = this.checkSupplierAvailability(supplier, checkDate, timeSlot);
        const locationResult = this.checkSupplierLocation(supplier, location);
        
        if (availabilityResult.available && locationResult.canServe) {
          availableSuppliers.push({
            ...supplier,
            availabilityReason: availabilityResult.reason,
            matchScore: this.scoreSupplierWithTheme(supplier, theme, timeSlot, 2)
          });
        }
      }
      
      availableSuppliers.sort((a, b) => b.matchScore - a.matchScore);
      
      return {
        success: true,
        suppliers: availableSuppliers,
        totalFound: availableSuppliers.length
      };
      
    } catch (error) {
      console.error('Error finding available suppliers:', error);
      return { success: false, error: error.message };
    }
  }

  async getSuppliersByCategory(categoryName, filters = {}) {
    try {
      const allSuppliers = await suppliersAPI.getAllSuppliers();
      const categorySuppliers = allSuppliers.filter(s => s.category === categoryName);
      return { success: true, suppliers: categorySuppliers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const partyBuilderBackend = new PartyBuilderBackend();

// React hook for using the party builder
export function usePartyBuilder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildParty = async (partyDetails) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await partyBuilderBackend.buildParty(partyDetails);
      
      if (result.success) {
        return { success: true, data: result };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('usePartyBuilder error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getPartyDetails = async () => {
    return await partyBuilderBackend.getPartyDetails();
  };

  const getThemeSuggestions = (childAge) => {
    return partyBuilderBackend.getThemeSuggestions(childAge);
  };

  const getAvailableThemes = () => {
    return partyBuilderBackend.getAvailableThemes();
  };

  return {
    buildParty,
    getPartyDetails,
    getThemeSuggestions,
    getAvailableThemes,
    loading,
    error
  };
}