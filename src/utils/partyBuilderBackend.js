// utils/partyBuilderBackend.js - Fixed to use unified pricing system


"use client"

import { useState } from 'react';
import { suppliersAPI } from './mockBackend';
import { LocationService } from './locationService';
import { partyDatabaseBackend } from './partyDatabaseBackend';
import { calculateFinalPrice } from './unifiedPricing'; // ✅ Import unified pricing

// ✅ Utility function to calculate total attendees (children + adults)
// For parties, assume 1.5 adults per child on average (1-2 parents, sometimes siblings)
const ADULTS_PER_CHILD_RATIO = 1.5;

export const calculateTotalAttendees = (childrenCount, options = {}) => {
  const children = parseInt(childrenCount) || 10;
  const adultsRatio = options.adultsRatio ?? ADULTS_PER_CHILD_RATIO;
  const adults = Math.ceil(children * adultsRatio);

  return {
    children,
    adults,
    total: children + adults,
    // For cake sizing, everyone wants cake
    forCake: children + adults,
    // For party bags, typically just children
    forPartyBags: children,
    // For venue capacity, total people
    forVenueCapacity: children + adults
  };
};

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

      // Helper to get preferred colourScheme based on gender
      const getPreferredColour = (gender) => {
        if (gender === 'boy') return 'blue';
        if (gender === 'girl') return 'pink';
        if (gender === 'neutral') return 'rainbow';
        return null;
      };

      const gender = partyDetails?.gender;
      const preferredColour = getPreferredColour(gender);
      const isNoTheme = theme === 'no-theme' || !theme;

      if (isCakeSupplier && partyDetails?.guestCount) {
        // For cakes, select based on total attendees (children + adults)
        // Adults want cake too!
        const attendees = calculateTotalAttendees(partyDetails.guestCount);
        const totalForCake = attendees.forCake;

        console.log(`🎂 Cake sizing: ${attendees.children} children + ${attendees.adults} adults = ${totalForCake} people`);

        let sortedByServings = [...supplier.packages].sort((a, b) => {
          const aServes = parseInt(a.serves) || parseInt(a.feeds) || parseInt(a.servings) || 10;
          const bServes = parseInt(b.serves) || parseInt(b.feeds) || parseInt(b.servings) || 10;
          return aServes - bServes;
        });

        // For no-theme parties, filter by colour scheme first
        if (isNoTheme && preferredColour) {
          const colourFilteredPackages = sortedByServings.filter(pkg =>
            pkg.colourScheme?.toLowerCase() === preferredColour
          );
          if (colourFilteredPackages.length > 0) {
            sortedByServings = colourFilteredPackages;
            console.log(`🎨 Filtered cakes by colour: ${preferredColour}`);
          }
        }

        selectedPackage = sortedByServings.find(pkg => {
          const serves = parseInt(pkg.serves) || parseInt(pkg.feeds) || parseInt(pkg.servings) || 10;
          return serves >= totalForCake;
        }) || sortedByServings[sortedByServings.length - 1];
      } else {
        // Sort packages by price (cheapest first)
        const sortedPackages = [...supplier.packages].sort((a, b) => {
          const priceA = a.price || a.originalPrice || 0;
          const priceB = b.price || b.originalPrice || 0;
          return priceA - priceB;
        });

        // For no-theme parties with gender, prefer colour-matching packages
        if (isNoTheme && preferredColour) {
          const colourPackages = sortedPackages.filter(pkg =>
            pkg.colourScheme?.toLowerCase() === preferredColour
          );
          if (colourPackages.length > 0) {
            console.log(`🎨 Selected ${preferredColour} package for ${supplier.category}`);
            selectedPackage = colourPackages[0];
          }
        }

        // If no colour match, try theme-specific package
        if (!selectedPackage) {
          const themePackages = sortedPackages.filter(pkg =>
            pkg.theme === theme || pkg.themes?.includes(theme)
          );
          selectedPackage = themePackages.length > 0 ? themePackages[0] : sortedPackages[0];
        }
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
          id: selectedPackage.id, // Store package ID for modal restoration
          price: selectedPackage.price,
          totalPrice: selectedPackage.price + deliveryFee,
          enhancedPrice: selectedPackage.price + deliveryFee,
          deliveryFee: deliveryFee,
          cakeCustomization: {
            packageId: selectedPackage.id, // Store package ID for modal restoration
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
      // Pass gender for no-theme parties to match colour schemes
      const gender = partyDetails?.gender || null;
      const themeScore = this.scoreSupplierWithTheme(supplier, theme, timeSlot, duration, gender);
      
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

    // No available supplier found - return null instead of fallback
    // This ensures we don't add suppliers that can't fulfill the order
    // (e.g., insufficient lead time, location too far, etc.)
    return {
      supplier: null,
      reason: 'no-available-suppliers',
      requiresConfirmation: false
    };
  }

// In partyBuilderBackend.js
// Replace the selectMultipleVenuesForCarousel method with this updated version:

async selectMultipleVenuesForCarousel(suppliers, theme, timeSlot, duration, date, location, budget, partyDetails, count = 50) {
  // Calculate total attendees for capacity matching
  const attendees = calculateTotalAttendees(partyDetails?.guestCount || 10);
  const requiredCapacity = attendees.forVenueCapacity;

  console.log(`👥 Capacity matching: ${attendees.children} children + ${attendees.adults} adults = ${requiredCapacity} total attendees`);

  // Filter venues by category first
  let venueSuppliers = suppliers.filter(s => s.category === 'Venues');

  // CAPACITY HARD FILTERS: Remove venues that are clearly wrong size
  venueSuppliers = venueSuppliers.filter(venue => {
    // Get capacity from all possible locations in the data structure
    const capacity = venue.capacity ||
                     venue.serviceDetails?.capacity ||
                     venue.data?.serviceDetails?.capacity ||
                     venue.serviceDetails?.venueDetails?.capacity ||
                     venue.data?.serviceDetails?.venueDetails?.capacity ||
                     null;

    // If no capacity data, include the venue (benefit of the doubt)
    if (!capacity) {
      return true;
    }

    const maxCapacity = capacity.max || capacity.maximum || null;
    const minCapacity = capacity.min || capacity.minimum || null;

    // Filter out venues that are too small (can't fit the party)
    if (maxCapacity && maxCapacity < requiredCapacity) {
      console.log(`  ❌ ${venue.name}: Too small (max ${maxCapacity} < ${requiredCapacity} required)`);
      return false;
    }

    // Filter out venues where party is too small for their minimum
    if (minCapacity && minCapacity > requiredCapacity) {
      console.log(`  ❌ ${venue.name}: Party too small (min ${minCapacity} > ${requiredCapacity} guests)`);
      return false;
    }

    return true;
  });

  console.log(`🏠 After capacity filtering: ${venueSuppliers.length} venues remain`);

  // Check if this is a toddler party (ages 1-2)
  const childAge = partyDetails?.childAge || 6;
  const isToddlerParty = childAge <= 2;

  console.log(`🏠 Venue selection: Looking for venues near "${location}"`);
  console.log(`📍 Found ${venueSuppliers.length} venue suppliers to score`);
  if (isToddlerParty) {
    console.log(`👶 Toddler party (age ${childAge}) - prioritizing venues with catering/restaurant type`);

    // Count venues with catering options for toddler parties
    const venuesWithCatering = venueSuppliers.filter(v => {
      const cp = v.cateringPackages || v.serviceDetails?.cateringPackages || v.data?.cateringPackages || v.data?.serviceDetails?.cateringPackages || [];
      return Array.isArray(cp) && cp.length > 0;
    });
    const restaurantVenues = venueSuppliers.filter(v => {
      const vt = (v.venueType || v.serviceDetails?.venueType || v.data?.venueType || v.data?.serviceDetails?.venueType || '').toLowerCase();
      return vt.includes('restaurant') || vt.includes('hotel') || vt.includes('pub');
    });
    console.log(`👶 Available: ${venuesWithCatering.length} with catering, ${restaurantVenues.length} restaurant/pub type`);
  }

  if (venueSuppliers.length === 0) {
    return { venues: [], mainVenue: null };
  }

  // Get target coordinates for distance calculation
  const targetCoords = await LocationService.getPostcodeCoordinates(location);
  console.log(`📍 Target location coordinates:`, targetCoords);

  // Score and sort all venues - LOCATION AND AVAILABILITY ONLY
  const scoredVenues = await Promise.all(venueSuppliers.map(async (venue) => {
    const availabilityCheck = this.checkSupplierAvailability(venue, new Date(date), timeSlot);

    // Get venue postcode
    const venuePostcode = venue.location ||
                          venue.venueAddress?.postcode ||
                          venue.serviceDetails?.venueAddress?.postcode ||
                          venue.contactInfo?.postcode ||
                          null;

    // Calculate real distance if we have coordinates
    let distanceKm = null;
    let locationScore = 50; // Default neutral score

    if (targetCoords && venuePostcode) {
      const venueCoords = await LocationService.getPostcodeCoordinates(venuePostcode);
      if (venueCoords) {
        distanceKm = LocationService.calculateDistance(
          targetCoords.lat, targetCoords.lng,
          venueCoords.lat, venueCoords.lng
        );
        // Convert distance to score (closer = higher score)
        // 0km = 100, 5km = 75, 10km = 50, 20km = 25, 30km+ = 0
        locationScore = Math.max(0, Math.round(100 - (distanceKm * 3.33)));
        console.log(`  📍 ${venue.name}: postcode="${venuePostcode}", distance=${distanceKm?.toFixed(1)}km, locationScore=${locationScore}`);
      } else {
        // Fallback to postcode-based scoring
        locationScore = LocationService.scoreByPostcode(venuePostcode, location);
        console.log(`  📍 ${venue.name}: postcode="${venuePostcode}", locationScore=${locationScore} (postcode fallback)`);
      }
    } else {
      console.log(`  📍 ${venue.name}: postcode="${venuePostcode || 'NO POSTCODE'}", locationScore=${locationScore} (no coords)`);
    }

    // Set up basic package
    const basicPackage = this.getBasicPackageForSupplier(venue, theme);

    // VENUE PRICING MODEL:
    // - minimumBookingHours = TOTAL venue hours (what venues set as "4 hour minimum")
    // - This INCLUDES setup and cleanup time
    // - Price = hourlyRate × minimumBookingHours
    const hourlyRate = venue.serviceDetails?.pricing?.hourlyRate || 0;
    const totalVenueHours = venue.serviceDetails?.pricing?.minimumBookingHours ||
                            venue.serviceDetails?.availability?.minimumBookingHours || 4;
    const venuePrice = hourlyRate * totalVenueHours;

    const enhancedVenue = {
      ...venue,
      packageData: basicPackage,
      originalPrice: venuePrice,
      price: venuePrice
    };

    // Calculate pricing
    const pricingResult = calculateFinalPrice(enhancedVenue, partyDetails, []);
    enhancedVenue.enhancedPrice = pricingResult.finalPrice;
    enhancedVenue.enhancedPricing = pricingResult;

    // ✅ NEW SCORING: Location is PRIMARY (based on real distance), then availability
    let compositeScore = 0;

    // LOCATION SCORING - Use the distance-based score (0-100)
    compositeScore += locationScore;

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

    // CAPACITY FIT SCORING - Only check minimum capacity (max capacity doesn't matter - extra room is fine)
    // Minimum capacity check is done earlier in the hard filter (lines 404-434)
    // No scoring penalty for large venues - extra space is a bonus, not a problem
    const venueCapacity = venue.capacity ||
                          venue.serviceDetails?.capacity ||
                          venue.data?.serviceDetails?.capacity ||
                          venue.serviceDetails?.venueDetails?.capacity ||
                          venue.data?.serviceDetails?.venueDetails?.capacity ||
                          null;

    let capacityFitScore = 0;
    let capacityFitReason = 'fits';

    if (venueCapacity) {
      const maxCapacity = venueCapacity.max || venueCapacity.maximum || null;

      if (maxCapacity) {
        console.log(`  📐 ${venue.name}: capacity ${maxCapacity} for ${requiredCapacity} guests → fits ✓`);
      }
    }

    // TODDLER PARTY BONUS: Prioritize venues with catering for ages 1-2
    // Pubs and restaurants with catering packages are ideal for toddler parties
    let hasCatering = false;
    let isRestaurantType = false;
    if (isToddlerParty) {
      // Check for catering packages in ALL possible locations in the data structure
      // After transformation from Supabase, data is spread to top level
      const cateringPackages = venue.cateringPackages ||
                               venue.serviceDetails?.cateringPackages ||
                               venue.data?.cateringPackages ||
                               venue.data?.serviceDetails?.cateringPackages || [];
      const hasExplicitCatering = Array.isArray(cateringPackages) && cateringPackages.length > 0;

      // Check venue type in ALL possible locations
      // venueType can be at top level OR inside serviceDetails
      const venueType = (
        venue.venueType ||
        venue.serviceDetails?.venueType ||
        venue.data?.venueType ||
        venue.data?.serviceDetails?.venueType ||
        ''
      ).toLowerCase();

      // Match "Restaurant Private Room", "Hotel Conference Room", "pub", etc.
      isRestaurantType = venueType.includes('pub') ||
                         venueType.includes('restaurant') ||
                         venueType.includes('hotel') ||
                         venueType.includes('function room');

      // For toddler parties, restaurant/hotel venue types implicitly have catering
      // (even if cateringPackages data isn't explicitly set)
      hasCatering = hasExplicitCatering || isRestaurantType;

      // SIGNIFICANT bonus for venues suitable for toddler parties
      // Priority: explicit catering > restaurant type > other venues
      if (hasExplicitCatering) {
        compositeScore += 150; // Highest priority - explicit catering packages
      } else if (isRestaurantType) {
        compositeScore += 100; // High priority - restaurant/pub/hotel type (implicit catering)
      }
    }

    return {
      ...enhancedVenue,
      compositeScore,
      locationScore,
      distanceKm, // Include actual distance for display
      availabilityScore: availabilityCheck.available ? (availabilityCheck.confidence === 'high' ? 50 : 25) : -50,
      availabilityCheck,
      isAvailable: availabilityCheck.available,
      canServeLocation: locationScore >= 25,
      hasCatering, // Track if venue has catering for toddler party display
      // Capacity fit info for UI display
      capacityFit: {
        score: capacityFitScore,
        reason: capacityFitReason,
        venueMax: venueCapacity?.max || venueCapacity?.maximum || null,
        requiredCapacity
      }
    };
  }));
  
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

  // Log the selection result
  if (topVenues.length > 0) {
    const mainVenue = topVenues[0];
    const distanceStr = mainVenue.distanceKm != null ? `${mainVenue.distanceKm.toFixed(1)}km` : 'unknown';
    const cateringInfo = mainVenue.hasCatering ? ' (has catering)' : '';
    console.log(`✅ Selected venue: "${mainVenue.name}" - ${distanceStr}${cateringInfo}`);
  }

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

      // Check lead time requirements FIRST
      // Check multiple possible locations for minimum lead time:
      // - supplier.advanceBookingDays (legacy)
      // - supplier.leadTimeSettings.minLeadTimeDays (party bags, etc.)
      // - supplier.data.serviceDetails.leadTime.minimum (cake suppliers)
      // - supplier.serviceDetails.leadTime.minimum (alternate)
      const minLeadTime =
        supplier.advanceBookingDays ||
        supplier.leadTimeSettings?.minLeadTimeDays ||
        supplier.data?.serviceDetails?.leadTime?.minimum ||
        supplier.serviceDetails?.leadTime?.minimum ||
        0;

      if (minLeadTime > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const daysUntilParty = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilParty < minLeadTime) {
          return {
            available: false,
            reason: 'insufficient-lead-time',
            confidence: 'high',
            requiredLeadTime: minLeadTime,
            daysUntilParty
          };
        }
      }

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
  // gender parameter: 'boy', 'girl', or 'neutral' - used for no-theme parties to match colour schemes
  scoreSupplierWithTheme(supplier, theme, timeSlot = 'afternoon', duration = 2, gender = null) {
    let score = 50; // Base score

    try {
      if (theme === 'no-theme' || !theme) {
        // For no-theme parties, boost suppliers with 'no-theme', 'general', or 'classic' themes
        if (!supplier?.themes || supplier.themes.length === 0) {
          score += 30;
        }
        if (supplier?.themes && (supplier.themes.includes('general') || supplier.themes.includes('no-theme') || supplier.themes.includes('classic'))) {
          score += 40;
        }

        // Gender-based matching for colour schemes
        if (gender && supplier?.themes) {
          if (gender === 'boy' && supplier.themes.includes('boy')) {
            score += 25; // Boost blue-themed suppliers
          } else if (gender === 'girl' && supplier.themes.includes('girl')) {
            score += 25; // Boost pink-themed suppliers
          } else if (gender === 'neutral' && (supplier.themes.includes('rainbow') || supplier.themes.includes('neutral'))) {
            score += 25; // Boost rainbow/neutral suppliers
          }
        }

        // Also check package colourSchemes if available
        if (gender && supplier?.packages && Array.isArray(supplier.packages)) {
          const hasMatchingColour = supplier.packages.some(pkg => {
            const colourScheme = pkg.colourScheme?.toLowerCase();
            if (gender === 'boy' && colourScheme === 'blue') return true;
            if (gender === 'girl' && colourScheme === 'pink') return true;
            if (gender === 'neutral' && (colourScheme === 'rainbow' || colourScheme === 'mixed')) return true;
            return false;
          });
          if (hasMatchingColour) {
            score += 15;
          }
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
  // Get supplier's postcode from all possible locations
  const supplierLocationRaw = supplier.location ||
                              supplier.venueAddress?.postcode ||
                              supplier.serviceDetails?.venueAddress?.postcode ||
                              supplier.contactInfo?.postcode ||
                              supplier.serviceDetails?.serviceArea?.postcode ||
                              supplier.serviceDetails?.location?.postcode;

  if (!supplierLocationRaw || !partyLocation) {
    return { canServe: true, reason: 'no-location-data', confidence: 'low', score: 50 };
  }

  // Use the new reliable scoring method
  const score = LocationService.scoreByPostcode(supplierLocationRaw, partyLocation);

  console.log(`🔍 Location check for "${supplier.name}": postcode="${supplierLocationRaw}" vs "${partyLocation}" → score=${score}`);

  // Convert score to confidence levels for compatibility
  let confidence, reason;
  if (score === 100) {
    confidence = 'exact';
    reason = 'same-district';
  } else if (score >= 75) {
    confidence = 'high';
    reason = 'same-area';
  } else if (score >= 50) {
    confidence = 'medium';
    reason = 'nearby';
  } else {
    confidence = 'low';
    reason = 'different-area';
  }

  return {
    canServe: score >= 25, // Allow if not completely different area
    reason,
    confidence,
    score // Include raw score for precise sorting
  };
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
    const age = parseInt(childAge) || 6;

    // AGE-BASED RECOMMENDATIONS: For ages 1-2, we recommend a simpler party
    // - Pub/restaurant with catering (no blank canvas venue)
    // - Cake and party bags
    // - NO entertainer (too young to engage)
    // - NO bouncy castles/activities (safety concern)
    const isToddlerParty = age <= 2;

    if (isToddlerParty) {
      console.log(`👶 Toddler party detected (age ${age}) - using simplified party recommendations`);
    }

    // Create party details object for pricing calculations
    const partyDetails = {
      date: new Date(date),
      duration,
      guestCount: guests,
      timeSlot,
      theme,
      location,
      childAge: age
    };

    // Define budget allocation based on budget size AND age
    let budgetAllocation, includedCategories;

    if (isToddlerParty) {
      // TODDLER PARTY (ages 1-2): Focus on venue with catering, cake, and party bags
      // No entertainment, activities, or bouncy castles
      includedCategories = ['venue', 'cakes', 'partyBags'];
      budgetAllocation = {
        venue: 0.50,     // More budget for venue with catering
        cakes: 0.35,     // Nice cake is important
        partyBags: 0.15  // Simple party bags
      };
      console.log(`👶 Toddler budget allocation:`, budgetAllocation);
    } else if (budget <= 500) {
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
    
    // 1. SELECT ENTERTAINMENT FIRST (theme priority) - SKIP FOR TODDLER PARTIES
    if (!isToddlerParty) {
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
    } else {
      console.log(`👶 Skipping entertainment selection for toddler party (age ${age})`);
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
    partyPlan.venueCarouselOptions = selectedSuppliers.venueCarouselOptions.map(venue => {
      // VENUE PRICING MODEL:
      // - minimumBookingHours = TOTAL venue hours (what venues set as "4 hour minimum")
      // - This INCLUDES setup and cleanup time
      // - Price = hourlyRate × minimumBookingHours
      const hourlyRate = venue.serviceDetails?.pricing?.hourlyRate || 0;
      const totalVenueHours = venue.serviceDetails?.pricing?.minimumBookingHours ||
                              venue.serviceDetails?.availability?.minimumBookingHours || 4;
      const fullBookingPrice = hourlyRate * totalVenueHours;

      return {
      id: venue.id,
      name: venue.name,
      description: venue.description || '',
      // Use calculated full booking price (hourly rate × total hours)
      price: venue.enhancedPrice || fullBookingPrice || 0,
      originalPrice: venue.originalPrice || fullBookingPrice || 0,
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
    }});

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
    const venueCarouselResult = await this.selectMultipleVenuesForCarousel(
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
export function scoreSupplierWithTheme(supplier, theme, timeSlot = 'afternoon', duration = 2, gender = null) {
  return partyBuilderBackend.scoreSupplierWithTheme(supplier, theme, timeSlot, duration, gender);
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