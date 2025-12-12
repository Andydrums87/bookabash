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

  // Get cheapest package for supplier (budget-conscious)
  getBasicPackageForSupplier(supplier, theme = 'no-theme', partyDetails = null) {
    // Check if supplier already has packages
    if (supplier.packages && supplier.packages.length > 0) {
      const isCakeSupplier = supplier.category === 'Cakes' ||
        supplier.category?.toLowerCase().includes('cake');

      let selectedPackage;

      if (isCakeSupplier && partyDetails?.guestCount) {
        // For cakes, select based on guest count (not cheapest)
        const guestCount = partyDetails.guestCount || 15;
        const sortedByServings = [...supplier.packages].sort((a, b) => {
          const aServes = parseInt(a.serves) || parseInt(a.feeds) || 10;
          const bServes = parseInt(b.serves) || parseInt(b.feeds) || 10;
          return aServes - bServes;
        });

        selectedPackage = sortedByServings.find(pkg => {
          const serves = parseInt(pkg.serves) || parseInt(pkg.feeds) || 10;
          return serves >= guestCount;
        }) || sortedByServings[sortedByServings.length - 1];
      } else {
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

        selectedPackage = themePackages.length > 0 ? themePackages[0] : sortedPackages[0];
      }

      // For cake suppliers, add delivery fee and customization
      if (isCakeSupplier) {
        const fulfilment = supplier.serviceDetails?.fulfilment || {};
        const deliveryFee = selectedPackage.deliveryFee ?? fulfilment.deliveryFee ?? 0;
        const flavours = supplier.serviceDetails?.flavours || supplier.flavours || [];
        const defaultFlavor = flavours.length > 0
          ? flavours[0].toLowerCase().replace(/\s+/g, '-')
          : 'vanilla';
        const defaultFlavorName = flavours.length > 0 ? flavours[0] : 'Vanilla Sponge';

        return {
          ...selectedPackage,
          price: selectedPackage.price,
          totalPrice: selectedPackage.price + deliveryFee,
          enhancedPrice: selectedPackage.price + deliveryFee,
          deliveryFee: deliveryFee,
          cakeCustomization: {
            size: selectedPackage.name,
            servings: selectedPackage.serves || selectedPackage.feeds || null,
            tiers: selectedPackage.tiers || 1,
            flavor: defaultFlavor,
            flavorName: defaultFlavorName,
            dietaryOptions: [],
            dietaryNames: [],
            dietaryName: 'Standard',
            customMessage: '',
            fulfillmentMethod: 'delivery',
            deliveryFee: deliveryFee,
            basePrice: selectedPackage.price,
            totalPrice: selectedPackage.price + deliveryFee,
          }
        };
      }

      return selectedPackage;
    }

    // Create a basic package if none exists
    const basicPackage = this.createBasicPackage(supplier, theme);
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

  // Enhanced supplier selection with package setup and unified pricing
  selectBestSupplier(suppliers, category, theme, timeSlot, duration, date, location, categoryBudget, partyDetails) {
    if (!suppliers || suppliers.length === 0) {
      return { supplier: null, reason: 'no-suppliers-found' };
    }
    
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
      
      // ✅ NEW: Set up basic package for supplier (pass partyDetails for cakes)
      const basicPackage = this.getBasicPackageForSupplier(supplier, theme, partyDetails);
      
      // ✅ NEW: Create enhanced supplier with package data
      const enhancedSupplier = {
        ...supplier,
        packageData: basicPackage,
        // Preserve original pricing for reference
        originalPrice: supplier.priceFrom || supplier.price || 0
      };

      // ✅ CRITICAL: For party bags, set the quantity based on guest count
      const isPartyBags = supplier.category === 'Party Bags' ||
                         supplier.category?.toLowerCase().includes('party bag');
      if (isPartyBags && partyDetails) {
        const guestCount = partyDetails.guestCount || 10;
        enhancedSupplier.partyBagsQuantity = guestCount;
        enhancedSupplier.partyBagsMetadata = {
          quantity: guestCount,
          pricePerBag: supplier.priceFrom || supplier.price || 5.00,
          totalPrice: (supplier.priceFrom || supplier.price || 5.00) * guestCount
        };
        // Update package data with quantity
        if (enhancedSupplier.packageData) {
          enhancedSupplier.packageData.partyBagsQuantity = guestCount;
          enhancedSupplier.packageData.totalPrice = enhancedSupplier.partyBagsMetadata.totalPrice;
        }
      }

      // ✅ NEW: Calculate pricing using unified pricing system
      const pricingResult = calculateFinalPrice(enhancedSupplier, partyDetails, []);

      // Add enhanced pricing to supplier
      enhancedSupplier.enhancedPrice = pricingResult.finalPrice;
      enhancedSupplier.enhancedPricing = pricingResult;

      // Check if this is a cake supplier that offers delivery
      const isCakeSupplier = supplier.category === 'Cakes' ||
        supplier.category?.toLowerCase().includes('cake');
      const offersDelivery = supplier.serviceDetails?.fulfilment?.offersDelivery ||
        supplier.fulfilment?.offersDelivery ||
        supplier.offersDelivery;

      // Calculate composite score
      let compositeScore = themeScore;

      // For cakes, boost theme score significantly - theme is most important
      if (isCakeSupplier && themeScore > 60) {
        compositeScore += 30; // Extra boost for themed cakes
      }

      // Availability bonuses/penalties
      if (availabilityCheck.available) {
        compositeScore += availabilityCheck.confidence === 'high' ? 25 : 10;
      } else {
        compositeScore -= 30;
      }

      // Location bonuses/penalties - relaxed for cake suppliers that deliver
      let effectiveCanServeLocation = locationCheck.canServe;
      if (isCakeSupplier && offersDelivery) {
        // Cake suppliers that deliver can serve anywhere (with delivery fee)
        effectiveCanServeLocation = true;
        // Small penalty for distance but don't disqualify
        if (!locationCheck.canServe) {
          compositeScore -= 5; // Minor penalty instead of -20
        } else {
          compositeScore += locationCheck.confidence === 'high' ? 15 : 5;
        }
      } else {
        // Standard location scoring for non-cake suppliers
        if (locationCheck.canServe) {
          compositeScore += locationCheck.confidence === 'high' ? 15 : 5;
        } else {
          compositeScore -= 20;
        }
      }

      return {
        ...enhancedSupplier,
        compositeScore,
        themeScore,
        availabilityCheck,
        locationCheck,
        isAvailable: availabilityCheck.available,
        canServeLocation: effectiveCanServeLocation,
        isCakeWithDelivery: isCakeSupplier && offersDelivery
      };
    });

    // Sort by composite score
    const sorted = scoredSuppliers.sort((a, b) => b.compositeScore - a.compositeScore);

    // Try to find the best available supplier first
    const bestAvailable = sorted.find(s => s.isAvailable && s.canServeLocation);
    
    if (bestAvailable) {
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

// In partyBuilderBackend.js
// Replace the selectMultipleVenuesForCarousel method with this updated version:

selectMultipleVenuesForCarousel(suppliers, theme, timeSlot, duration, date, location, budget, partyDetails, count = 5) {
  const venueSuppliers = suppliers.filter(s => s.category === 'Venues');
  
  if (venueSuppliers.length === 0) {
    return { venues: [], mainVenue: null };
  }
  
  // Score and sort all venues - LOCATION AND AVAILABILITY ONLY
  const scoredVenues = venueSuppliers.map(venue => {
    const availabilityCheck = this.checkSupplierAvailability(venue, new Date(date), timeSlot);
    const locationCheck = this.checkSupplierLocation(venue, location);
    
    // Set up basic package
    const basicPackage = this.getBasicPackageForSupplier(venue, theme);
    
    const enhancedVenue = {
      ...venue,
      packageData: basicPackage,
      originalPrice: venue.priceFrom || venue.price || 0
    };
    
    // Calculate pricing
    const pricingResult = calculateFinalPrice(enhancedVenue, partyDetails, []);
    enhancedVenue.enhancedPrice = pricingResult.finalPrice;
    enhancedVenue.enhancedPricing = pricingResult;
    
    // ✅ NEW SCORING: Location is PRIMARY, then availability
    let compositeScore = 0;
    
    // LOCATION SCORING (0-100 points)
    if (locationCheck.canServe) {
      if (locationCheck.confidence === 'exact') {
        compositeScore += 150; // Exact postcode match - highest priority
      } else if (locationCheck.confidence === 'high') {
        compositeScore += 100; // Same district or same area
      } else {
        compositeScore += 50; // Nearby
      }
    } else {
      compositeScore -= 100; // Cannot serve this location - major penalty
    }

    // AVAILABILITY SCORING (0-50 points)
    if (availabilityCheck.available) {
      if (availabilityCheck.confidence === 'high') {
        compositeScore += 50; // Definitely available
      } else {
        compositeScore += 25; // Might be available
      }
    } else {
      compositeScore -= 50; // Not available - penalty
    }

    // RATING BONUS (0-10 points) - minor factor
    if (venue.rating) {
      const ratingBonus = venue.rating * 2;
      compositeScore += ratingBonus;
    }
    
    return {
      ...enhancedVenue,
      compositeScore,
      locationScore: locationCheck.canServe ? 
      (locationCheck.confidence === 'exact' ? 150 : 
       locationCheck.confidence === 'high' ? 100 : 50) : -100,
      availabilityScore: availabilityCheck.available ? (availabilityCheck.confidence === 'high' ? 50 : 25) : -50,
      availabilityCheck,
      locationCheck,
      isAvailable: availabilityCheck.available,
      canServeLocation: locationCheck.canServe
    };
  });
  
  // Sort by composite score (location-first, then availability)
  const sortedVenues = scoredVenues.sort((a, b) => {
    // First sort by composite score
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore;
    }
    
    // If scores are equal, prefer higher rating
    return (b.rating || 0) - (a.rating || 0);
  });
  
  // Take top N venues
  const topVenues = sortedVenues.slice(0, Math.min(count, sortedVenues.length));

  return {
    venues: topVenues,
    mainVenue: topVenues[0]
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

 // In partyBuilderBackend.js - Replace checkSupplierLocation method

checkSupplierLocation(supplier, partyLocation) {
  if (!supplier.location || !partyLocation) {
    return { canServe: true, reason: 'no-location-data', confidence: 'medium' };
  }
  
  try {
    // Normalize postcodes for comparison
    const normalizePostcode = (pc) => pc.replace(/\s+/g, '').toUpperCase();
    const supplierPostcode = normalizePostcode(supplier.location);
    const partyPostcode = normalizePostcode(partyLocation);
    
    // Check for exact postcode match first
    if (supplierPostcode === partyPostcode) {
      return {
        canServe: true,
        reason: 'exact-postcode-match',
        confidence: 'exact'
      };
    }

    // Check for same district (e.g., W4 4BZ and W4 5XX)
    const supplierDistrict = LocationService.getPostcodeDistrict(supplier.location);
    const partyDistrict = LocationService.getPostcodeDistrict(partyLocation);

    if (supplierDistrict && partyDistrict && supplierDistrict === partyDistrict) {
      return {
        canServe: true,
        reason: 'same-district',
        confidence: 'high'
      };
    }

    // Check for same area (e.g., W4 and W3 - both West London)
    const supplierArea = LocationService.getPostcodeArea(supplier.location);
    const partyArea = LocationService.getPostcodeArea(partyLocation);

    if (supplierArea && partyArea && supplierArea === partyArea) {
      return {
        canServe: true,
        reason: 'same-area',
        confidence: 'high'
      };
    }

    // Use LocationService for other checks (adjacent areas, etc.)
    const serviceRadius = LocationService.getServiceRadiusForSupplier(supplier);
    const canServe = LocationService.arePostcodesNearby(supplier.location, partyLocation, serviceRadius);
    
    return {
      canServe,
      reason: canServe ? 'location-within-range' : 'location-too-far',
      confidence: canServe ? 'medium' : 'low'
    };
  } catch (error) {
    console.warn(`Location check failed for ${supplier.name}:`, error);
    return { canServe: true, reason: 'location-check-error', confidence: 'low' };
  }
}
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
    
    // Create party details object for pricing calculations
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
      includedCategories = ['venue', 'entertainment', 'cakes', 'partyBags'];
      budgetAllocation = { venue: 0.20, entertainment: 0.45, cakes: 0.25, partyBags: 0.05 };
    } else if (budget <= 700) {
      includedCategories = ['venue', 'entertainment', 'cakes', 'partyBags'];
      budgetAllocation = { venue: 0.20, entertainment: 0.40, cakes: 0.30, partyBags: 0.05 };
    } else {
      includedCategories = ['venue', 'entertainment', 'cakes', 'decorations', 'activities', 'partyBags'];
      if (isLargeParty) {
        budgetAllocation = {
          venue: 0.05,
          entertainment: 0.30,
          cakes: 0.20,
          decorations: 0.10,
          activities: 0.20,
          partyBags: 0.05,
          softPlay: 0.10
        };
        includedCategories.push('softPlay');
      } else {
        budgetAllocation = {
          venue: 0.05,
          entertainment: 0.30,
          cakes: 0.25,
          decorations: 0.20,
          activities: 0.10,
          partyBags: 0.05
        };
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
        }
      }
    }

    // Summary (excluding venue since it's handled separately)
    const totalCost = Object.values(selected).reduce((sum, supplier) => sum + (supplier.enhancedPrice || supplier.priceFrom || 0), 0);
    
    return selected;
  }

// partyBuilderBackend.js - COMPLETE convertSuppliersToPartyPlan method replacement

convertSuppliersToPartyPlan(selectedSuppliers) {
  const partyPlan = {
    venue: null,
    venueCarouselOptions: [], // NEW: Store all venue options for carousel
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

  // Store venue carousel options
  if (selectedSuppliers.venueCarouselOptions && selectedSuppliers.venueCarouselOptions.length > 0) {
    partyPlan.venueCarouselOptions = selectedSuppliers.venueCarouselOptions.map(venue => ({
      id: venue.id,
      name: venue.name,
      description: venue.description || '',
      price: venue.enhancedPrice || venue.priceFrom || 0,
      originalPrice: venue.originalPrice || venue.priceFrom || 0,
      status: "carousel_option",
      image: venue.image || '',
      category: venue.category || 'Venues',
      priceUnit: venue.priceUnit || "per event",
      location: venue.location,
      capacity: venue.capacity,
      rating: venue.rating,
      addedAt: new Date().toISOString(),
      
      // Preserve all pricing configuration for dynamic calculation
      packageData: venue.packageData,
      weekendPremium: venue.weekendPremium,
      extraHourRate: venue.extraHourRate || venue.serviceDetails?.extraHourRate || 0,
      serviceDetails: venue.serviceDetails,
      
      // Store the complete original supplier for full functionality
      originalSupplier: {
        ...venue,
        weekendPremium: venue.weekendPremium,
        extraHourRate: venue.extraHourRate,
        serviceDetails: venue.serviceDetails
      },
      
      // Store composite score for reference
      compositeScore: venue.compositeScore,
      isAvailable: venue.isAvailable,
      canServeLocation: venue.canServeLocation
    }));
    
  }

  // Process all other suppliers (including main venue)
  Object.entries(selectedSuppliers).forEach(([category, supplier]) => {
    // Skip the carousel options array itself
    if (category === 'venueCarouselOptions') return;

    if (supplier && partyPlan.hasOwnProperty(category)) {
      // Special handling for party bags - ensure quantity and metadata are preserved
      const isPartyBags = supplier.category === 'Party Bags' ||
                         supplier.category?.toLowerCase().includes('party bag');

      // Calculate the correct price for party bags
      const priceToStore = isPartyBags
        ? (supplier.partyBagsMetadata?.totalPrice || supplier.enhancedPrice || supplier.priceFrom || 0)
        : (supplier.enhancedPrice || supplier.priceFrom || 0);

      partyPlan[category] = {
        id: supplier.id,
        name: supplier.name,
        description: supplier.description || '',

        price: priceToStore,
        originalPrice: supplier.originalPrice || supplier.priceFrom || 0,

        status: supplier.isFallbackSelection ? "needs_confirmation" : "pending",
        image: supplier.image || '',
        category: supplier.category || category,
        priceUnit: isPartyBags ? "per bag" : (supplier.priceUnit || "per event"),
        addedAt: new Date().toISOString(),

        // Preserve ALL pricing configuration for dynamic calculation
        packageData: supplier.packageData,

        // CRITICAL: Preserve party bags metadata if present
        ...(isPartyBags && {
          partyBagsQuantity: supplier.partyBagsQuantity,
          partyBagsMetadata: supplier.partyBagsMetadata
        }),

        // CRITICAL: Preserve weekend premium configuration
        weekendPremium: supplier.weekendPremium,
        extraHourRate: supplier.extraHourRate || supplier.serviceDetails?.extraHourRate || 0,
        serviceDetails: supplier.serviceDetails,

        originalSupplier: {
          ...supplier,
          weekendPremium: supplier.weekendPremium,
          extraHourRate: supplier.extraHourRate,
          serviceDetails: supplier.serviceDetails,
          ...(isPartyBags && {
            partyBagsQuantity: supplier.partyBagsQuantity,
            partyBagsMetadata: supplier.partyBagsMetadata
          })
        },
        isFallbackSelection: supplier.isFallbackSelection || false
      };
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



async buildParty(partyDetails) {
  try {
    const {
      date, theme, guestCount, location, budget,
      childAge = 6, childName = "Your Child",
      firstName = "Your", lastName = "Child",
      timeSlot, duration = 2, time,
      hasOwnVenue = false // NEW: Extract this flag
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
    let processedChildName = childName; // Preserve original childName

    if (!firstName && !lastName && childName) {
      const nameParts = childName.split(' ');
      processedFirstName = nameParts[0] || "Your";
      processedLastName = nameParts.slice(1).join(' ') || "Child";
    }

    // Create enhanced party details for pricing
    const enhancedPartyDetails = {
      ...partyDetails,
      budget: finalBudget,
      timeSlot: processedTimeSlot,
      duration,
      firstName: processedFirstName,
      lastName: processedLastName,
      childName: processedChildName, // Use the original childName if provided, don't overwrite it
      time: time || this.convertTimeSlotToTime(processedTimeSlot),
      displayTimeSlot: this.formatTimeSlotForDisplay(processedTimeSlot),
      displayDuration: this.formatDurationForDisplay(duration),
      hasOwnVenue // NEW: Pass this through
    };

    // Get suppliers
    const allSuppliers = await suppliersAPI.getAllSuppliers();
    const themedEntertainment = await suppliersAPI.getEntertainmentByTheme(theme);
    
    // Always get venue options, but only set main venue if needed
    const venueCarouselResult = this.selectMultipleVenuesForCarousel(
      allSuppliers,
      theme,
      processedTimeSlot,
      duration,
      date,
      location,
      finalBudget * 0.35, // Venue budget allocation
      enhancedPartyDetails,
      5 // Get 5 venues for carousel
    );

    // Select other suppliers (entertainment, cakes, etc.)
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
      date,
      hasOwnVenue // NEW: Pass this flag
    });

    // Always set venue carousel options
    // Even if user has own venue, they can browse later
    if (!hasOwnVenue && venueCarouselResult.mainVenue) {
      selectedSuppliers.venue = venueCarouselResult.mainVenue;
    } else if (hasOwnVenue) {
      selectedSuppliers.venue = null; // Explicitly set to null
    }

    // Always store venue options
    selectedSuppliers.venueCarouselOptions = venueCarouselResult.venues || [];

    // Create party plan with venue carousel options
    const partyPlan = this.convertSuppliersToPartyPlan(selectedSuppliers);

    // Save to localStorage
    this.savePartyDetailsToLocalStorage(enhancedPartyDetails);
    this.savePartyPlanToLocalStorage(partyPlan);

    const totalCost = this.calculateTotalCost(partyPlan);

    // Include venue info in response
    const venueInfo = hasOwnVenue 
      ? 'User has own venue' 
      : (venueCarouselResult.mainVenue ? venueCarouselResult.mainVenue.name : 'No venue selected');

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
      enhancedPricingUsed: true,
      venueCarouselOptions: venueCarouselResult.venues,
      hasOwnVenue, // NEW: Include in response
      venueInfo // NEW: Include venue info
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
      // ✅ FIX: Exclude einvites and addons from cost calculation
      if (supplier && supplier.price && key !== 'addons' && key !== 'einvites') {
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
    } catch {
      // No database party found, fall through to localStorage
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

// Export standalone function for theme-based scoring
export function scoreSupplierWithTheme(supplier, theme, timeSlot = 'afternoon', duration = 2) {
  return partyBuilderBackend.scoreSupplierWithTheme(supplier, theme, timeSlot, duration);
}

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