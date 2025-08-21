// utils/partyBuilderBackend.js - Enhanced Party Builder with Cakes Priority

import { suppliersAPI } from './mockBackend';
import { LocationService } from './locationService';
// ✅ UPDATED: Replace localStorage backend with database backend
import { partyDatabaseBackend } from './partyDatabaseBackend';

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

  // NEW: Smart budget defaulting based on guest count
  getDefaultBudgetForGuests(guestCount) {
    const guests = parseInt(guestCount);
    
    // Budget calculations based on realistic per-person costs
    let baseBudget;
    
    if (guests <= 5) {
      baseBudget = 400;  // Small intimate party
    } else if (guests <= 10) {
      baseBudget = 500;  // Essential party
    } else if (guests <= 15) {
      baseBudget = 600;  // Complete party
    } else if (guests <= 20) {
      baseBudget = 700;  // Larger complete party
    } else if (guests <= 25) {
      baseBudget = 800;  // Premium party
    } else {
      baseBudget = 900;  // Large premium party
    }
    
    console.log(`💡 Auto-calculated budget for ${guests} guests: £${baseBudget}`);
    return baseBudget;
  }

  // UPDATED: Enhanced buildParty function with smart budget defaulting and location
  async buildParty(partyDetails) {
    try {
      const {
        date,
        theme,
        guestCount,
        location,
        budget, // This might be undefined from homepage form
        childAge = 6,
        childName = "Snappy The Crocodile",
        firstName ="Snappy",
        lastName = "The Crocodile",
        timeSlot,
        duration = 2,
        time,
        timePreference,
        specificTime
      } = partyDetails;

      // NEW: Smart budget handling
      let finalBudget;
      
      if (budget && budget > 0) {
        // Budget explicitly set (from dashboard form)
        finalBudget = budget;
        console.log(`💰 Using explicit budget: £${finalBudget}`);
      } else {
        // No budget set (from homepage form) - calculate smart default
        finalBudget = this.getDefaultBudgetForGuests(guestCount);
        console.log(`🤖 Auto-calculated budget: £${finalBudget} for ${guestCount} guests`);
      }

      // Handle backwards compatibility for existing data
      let processedTimeSlot = timeSlot;
      let processedDuration = duration;
      let processedFirstName = firstName;
      let processedLastName = lastName;

      if (!firstName && !lastName && childName) {
        const nameParts = childName.split(' ');
        processedFirstName = nameParts[0] || "Snappy";
        processedLastName = nameParts.slice(1).join(' ') || "The Crocodile";
        console.log(`🔄 Converted legacy childName "${childName}" to firstName: "${processedFirstName}", lastName: "${processedLastName}"`);
      }

      if (!timeSlot && time) {
        const hour = parseInt(time.split(':')[0]);
        processedTimeSlot = hour < 13 ? 'morning' : 'afternoon';
        console.log(`🔄 Converted legacy time ${time} to timeSlot: ${processedTimeSlot}`);
      }

      if (!processedTimeSlot) {
        processedTimeSlot = 'afternoon';
        console.log(`🔄 Defaulting to afternoon time slot`);
      }

      // Get all available suppliers
      const allSuppliers = await suppliersAPI.getAllSuppliers();
      
      // Get theme-specific entertainment first
      const themedEntertainment = await suppliersAPI.getEntertainmentByTheme(theme);
      
      // Score and select best suppliers for each category with theme priority
      const selectedSuppliers = this.selectSuppliersForParty({
        suppliers: allSuppliers,
        themedEntertainment,
        theme,
        guestCount,
        location,
        budget: finalBudget, // Use the calculated budget
        childAge,
        timeSlot: processedTimeSlot,
        duration: processedDuration,
        date
      });

      console.log('🎉 Selected themed suppliers:', selectedSuppliers);

      // ✅ UPDATED: Create party plan with cakes instead of catering by default
      const partyPlan = {
        venue: selectedSuppliers.venue || null,
        entertainment: selectedSuppliers.entertainment || null,
        cakes: selectedSuppliers.cakes || null, // ✅ CHANGED: cakes instead of catering
        catering: selectedSuppliers.catering || null, // Still available but not priority
        facePainting: selectedSuppliers.facePainting || null,
        activities: selectedSuppliers.activities || null,
        partyBags: selectedSuppliers.partyBags || null,
        softPlay: selectedSuppliers.softPlay || null, // NEW: Soft play for large parties
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

      // Convert supplier data to proper format
      Object.entries(selectedSuppliers).forEach(([category, supplier]) => {
        if (supplier && partyPlan.hasOwnProperty(category)) {
          partyPlan[category] = {
            id: supplier.id,
            name: supplier.name,
            description: supplier.description || '',
            price: supplier.priceFrom || 0,
            status: "pending",
            image: supplier.image || '',
            category: supplier.category || category,
            priceUnit: supplier.priceUnit || "per event",
            addedAt: new Date().toISOString(),
            originalSupplier: supplier
          };
        }
      });
      
      // Save enhanced party details to localStorage with calculated budget
      const enhancedPartyDetails = {
        ...partyDetails,
        budget: finalBudget, // Include the calculated budget
        timeSlot: processedTimeSlot,
        duration: processedDuration,
        firstName: processedFirstName,
        lastName: processedLastName,
        childName: `${processedFirstName} ${processedLastName}`.trim(),
        time: time || this.convertTimeSlotToTime(processedTimeSlot),
        displayTimeSlot: this.formatTimeSlotForDisplay(processedTimeSlot),
        displayDuration: this.formatDurationForDisplay(processedDuration)
      };

      this.savePartyDetailsToLocalStorage(enhancedPartyDetails);
      this.savePartyPlanToLocalStorage(partyPlan);

      console.log('✅ Party built and saved to localStorage with calculated budget and availability filtering');

      return {
        success: true,
        partyPlan,
        selectedSuppliers,
        totalCost: this.calculateTotalCost(partyPlan),
        theme: THEMES[theme] || { name: theme },
        budget: finalBudget, // Return the calculated budget
        timeSlot: processedTimeSlot,
        duration: processedDuration,
        timeWindow: this.getTimeWindowForSlot(processedTimeSlot)
      };

    } catch (error) {
      console.error('❌ Error building themed party:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ UPDATED: Enhanced supplier selection with cakes priority over catering
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
    const remainingBudget = { value: budget };
    const guests = parseInt(guestCount);
    
    console.log(`🕐 Selecting suppliers for ${timeSlot} party (${duration} hours) with £${budget} budget for ${guests} guests`);
    console.log(`📅 Party date: ${date}, Location: ${location}`);
    
    // NEW: Large party detection
    const isLargeParty = guests >= 30;
    if (isLargeParty) {
      console.log('🎪 Large party detected (30+ guests) - including premium extras');
    }

    // NEW: Availability filtering helper function
    const filterByAvailability = (supplierList, category) => {
      const available = supplierList.filter(supplier => {
        const hasAvailabilityData = supplier.availability && 
          (supplier.availability.timeSlots || supplier.availability.maxDuration || supplier.availability.blockedDates);
        
        // If no availability data, assume available (for mock suppliers)
        if (!hasAvailabilityData) {
          console.log(`📝 ${supplier.name}: No availability data - assuming available (mock supplier)`);
          
          // Still check location for mock suppliers if they have location data
          if (supplier.location && location) {
            const serviceRadius = LocationService.getServiceRadiusForSupplier(supplier);
            const canServe = LocationService.arePostcodesNearby(supplier.location, location, serviceRadius);
            
            if (!canServe) {
              console.log(`❌ ${supplier.name}: Location too far (${supplier.location} → ${location})`);
              return false;
            } else {
              console.log(`✅ ${supplier.name}: Can serve location (${supplier.location} → ${location})`);
            }
          }
          
          return true;
        }
        
        // Check time slot availability
        if (supplier.availability.timeSlots && supplier.availability.timeSlots.length > 0) {
          if (!supplier.availability.timeSlots.includes(timeSlot)) {
            console.log(`❌ ${supplier.name}: Not available for ${timeSlot} time slot`);
            return false;
          }
        }
        
        // Check duration compatibility
        if (supplier.availability.maxDuration && supplier.availability.maxDuration < duration) {
          console.log(`❌ ${supplier.name}: Can't handle ${duration}h duration (max: ${supplier.availability.maxDuration}h)`);
          return false;
        }
        
        // Check date availability (blocked dates)
        if (supplier.availability.blockedDates && date) {
          const partyDate = new Date(date);
          const blockedDates = supplier.availability.blockedDates.map(d => new Date(d));
          
          const isBlocked = blockedDates.some(blockedDate => 
            blockedDate.toDateString() === partyDate.toDateString()
          );
          
          if (isBlocked) {
            console.log(`❌ ${supplier.name}: Not available on ${date} (blocked date)`);
            return false;
          }
        }
        
        // NEW: Check location coverage
        if (supplier.location && location) {
          // Check if supplier has custom service areas defined
          if (supplier.availability.serviceAreas && supplier.availability.serviceAreas.length > 0) {
            const partyArea = LocationService.getPostcodeArea(location);
            const canServeArea = supplier.availability.serviceAreas.includes(partyArea);
            
            if (!canServeArea) {
              console.log(`❌ ${supplier.name}: Doesn't serve ${partyArea} area (serves: ${supplier.availability.serviceAreas.join(', ')})`);
              return false;
            }
          } else {
            // Use automatic distance checking
            const serviceRadius = supplier.availability.serviceRadius || 
              LocationService.getServiceRadiusForSupplier(supplier);
            
            const canServe = LocationService.arePostcodesNearby(
              supplier.location, 
              location, 
              serviceRadius
            );
            
            if (!canServe) {
              console.log(`❌ ${supplier.name}: Location too far (${supplier.location} → ${location})`);
              return false;
            }
          }
          
          console.log(`✅ ${supplier.name}: Can serve location (${supplier.location} → ${location})`);
        } else {
          console.log(`📍 ${supplier.name}: No location data - assuming can serve anywhere`);
        }
        
        console.log(`✅ ${supplier.name}: Available for ${timeSlot} on ${date} at ${location}`);
        return true;
      });
      
      console.log(`🔍 Availability + Location filtering for ${category}: ${available.length}/${supplierList.length} suppliers available`);
      return available;
    };
    
    // ✅ UPDATED: Budget-based category selection with cakes priority and large party enhancements
    let budgetAllocation;
    let includedCategories;
    
    if (budget <= 500) {
      // Essential Party - Core essentials only with cakes
      includedCategories = ['venue', 'cakes', 'partyBags']; // ✅ CHANGED: cakes instead of catering
      budgetAllocation = {
        venue: 0.55,        
        entertainment: 0.35, 
        cakes: 0.05,        // ✅ NEW: Cakes allocation
        partyBags: 0.05     
      };
      console.log('🎯 Essential Party Package: Venue + Entertainment + Cakes + Party Bags');
    } else if (budget <= 700) {
      // Complete Party - Add themed cakes
      includedCategories = ['venue', 'cakes', 'partyBags']; // ✅ CHANGED: cakes instead of catering
      budgetAllocation = {
        venue: 0.35,        
        entertainment: 0.35, 
        cakes: 0.25,        // ✅ CHANGED: More budget for themed cakes
        partyBags: 0.05     
      };
      console.log('🎯 Complete Party Package: Venue + Entertainment + Themed Cakes + Party Bags');
    } else {
      // Premium Party - All categories with cakes priority
      includedCategories = ['venue', 'cakes', 'decorations', 'activities', 'partyBags']; // ✅ CHANGED: cakes instead of catering
      
      if (isLargeParty) {
        // Large party gets adjusted allocation to make room for soft play
        budgetAllocation = {
          venue: 0.25,
          entertainment: 0.25,  // Slightly reduced
          cakes: 0.15,          // ✅ CHANGED: Cakes instead of catering
          decorations: 0.08,    // Reduced
          activities: 0.15,     // Increased for soft play
          partyBags: 0.04,
          softPlay: 0.08        // Increased soft play budget for large parties
        };
        includedCategories.push('softPlay');
        console.log('🎪 Large Premium Party Package: All categories + Themed Cakes + Soft Play for 30+ guests');
      } else {
        // Standard premium allocation with cakes
        budgetAllocation = {
          venue: 0.25,
          entertainment: 0.30,
          cakes: 0.20,          // ✅ CHANGED: Cakes instead of catering
          decorations: 0.15,    // Increased for themed decorations
          activities: 0.06,
          partyBags: 0.04
        };
        console.log('🎯 Premium Party Package: All categories with Themed Cakes included');
      }
    }

    // PRIORITIZE ENTERTAINMENT FIRST (theme is most important)
    const entertainmentBudget = budget * budgetAllocation.entertainment;

    if (themedEntertainment.length > 0) {
      console.log(`🎭 Checking availability for ${themedEntertainment.length} themed entertainment options...`);
      
      // NEW: Filter themed entertainment by availability first
      const availableThemedEntertainment = filterByAvailability(themedEntertainment, 'themed entertainment');
      
      if (availableThemedEntertainment.length > 0) {
        const scoredEntertainment = availableThemedEntertainment.map(supplier => ({
          ...supplier,
          score: this.scoreSupplierWithTheme(supplier, theme, timeSlot, duration)
        })).sort((a, b) => b.score - a.score);
        
        console.log(`🏆 Top available themed entertainment options:`, 
          scoredEntertainment.slice(0, 3).map(s => ({
            name: s.name,
            themes: s.themes,
            price: s.priceFrom,
            score: s.score.toFixed(1)
          }))
        );
        
        const bestEntertainment = scoredEntertainment[0];
        if (bestEntertainment && bestEntertainment.score > 0) {
          selected.entertainment = bestEntertainment;
          remainingBudget.value -= bestEntertainment.priceFrom;
          console.log(`✅ Selected available themed entertainment: ${bestEntertainment.name} (£${bestEntertainment.priceFrom})`);
        }
      } else {
        console.log('❌ No themed entertainment available for this time/date - trying general entertainment');
      }
    }
    
    // If no available themed entertainment, try general entertainment
    if (!selected.entertainment) {
      console.log('🔄 Checking general entertainment availability...');
      const generalEntertainment = suppliers.filter(s => s.category === 'Entertainment');
      const availableGeneralEntertainment = filterByAvailability(generalEntertainment, 'general entertainment');
      
      if (availableGeneralEntertainment.length > 0) {
        const scored = availableGeneralEntertainment.map(supplier => ({
          ...supplier,
          score: this.scoreSupplierWithTheme(supplier, theme, timeSlot, duration)
        })).sort((a, b) => b.score - a.score);
        
        if (scored[0]) {
          selected.entertainment = scored[0];
          remainingBudget.value -= scored[0].priceFrom;
          console.log(`✅ Selected available general entertainment: ${scored[0].name} (£${scored[0].priceFrom})`);
        }
      } else {
        console.log('❌ No entertainment available for this time/date - party will need manual entertainment booking');
      }
    }

    // ✅ UPDATED: Process other categories with availability and location filtering, prioritizing cakes
    includedCategories.forEach(category => {
      const categoryBudget = budget * budgetAllocation[category];
      
      // ✅ NEW: Special handling for cakes category with theme matching
      if (category === 'cakes') {
        console.log(`🎂 Looking for available themed cakes for "${theme}" theme (budget: £${Math.round(categoryBudget)})`);
        
        const cakeSuppliers = suppliers.filter(s => 
          s.category === 'Cakes' &&
          s.priceFrom <= categoryBudget * 1.3 // Allow slightly higher budget for themed cakes
        );
        
        console.log(`🎂 Found ${cakeSuppliers.length} cake suppliers:`, 
          cakeSuppliers.map(s => ({
            name: s.name,
            themes: s.themes,
            category: s.category,
            price: s.priceFrom
          }))
        );
        
        // Filter cakes by availability
        const availableCakes = filterByAvailability(cakeSuppliers, 'cakes');
        
        if (availableCakes.length > 0) {
          console.log(`🎂 About to score ${availableCakes.length} available cakes for theme "${theme}"`);
          
          const scoredCakes = availableCakes.map(supplier => {
            console.log(`🎂 Scoring supplier: ${supplier.name} with themes: ${JSON.stringify(supplier.themes)}`);
            const themeScore = this.scoreSupplierWithTheme(supplier, theme, timeSlot, duration);
            const totalScore = themeScore + 20; // Bonus for cake theme matching
            console.log(`🎂 ${supplier.name}: Theme score = ${themeScore}, Total score = ${totalScore}`);
            return {
              ...supplier,
              score: totalScore
            };
          }).sort((a, b) => b.score - a.score);
          
          console.log(`🏆 Top scored cakes:`, 
            scoredCakes.slice(0, 3).map(s => ({
              name: s.name,
              score: s.score,
              themes: s.themes
            }))
          );
          
          const bestCake = scoredCakes[0];
          if (bestCake) {
            selected.cakes = bestCake;
            remainingBudget.value -= bestCake.priceFrom;
            console.log(`🎂 Selected available themed cake: ${bestCake.name} (£${bestCake.priceFrom}) with score: ${bestCake.score}`);
          }
        } else {
          console.log(`❌ No themed cakes available for this time/date within budget`);
        }
        return;
      }
      
      // Special handling for soft play category
      if (category === 'softPlay') {
        console.log(`🎪 Looking for available soft play for large party (budget: £${Math.round(categoryBudget)})`);
        
        const softPlaySuppliers = suppliers.filter(s => 
          s.category === 'Activities' &&
          (s.name.toLowerCase().includes('soft play') || 
           s.name.toLowerCase().includes('bouncy castle') ||
           s.name.toLowerCase().includes('inflatable') ||
           s.description?.toLowerCase().includes('soft play')) &&
          s.priceFrom <= categoryBudget * 1.2
        );
        
        // Filter soft play by availability
        const availableSoftPlay = filterByAvailability(softPlaySuppliers, 'soft play');
        
        if (availableSoftPlay.length > 0) {
          const scoredSoftPlay = availableSoftPlay.map(supplier => ({
            ...supplier,
            score: this.scoreSupplierWithTheme(supplier, theme, timeSlot, duration) + 10
          })).sort((a, b) => b.score - a.score);
          
          const bestSoftPlay = scoredSoftPlay[0];
          if (bestSoftPlay) {
            selected.softPlay = bestSoftPlay;
            remainingBudget.value -= bestSoftPlay.priceFrom;
            console.log(`🎪 Selected available soft play: ${bestSoftPlay.name} (£${bestSoftPlay.priceFrom})`);
          }
        } else {
          console.log(`❌ No soft play available for this time/date within budget`);
        }
        return;
      }
      
      // Normal category processing with availability filtering
      const mappedCategory = this.mapCategoryToSupplierCategory(category);
      const categorySuppliers = suppliers.filter(s => 
        this.mapCategoryToSupplierCategory(category) === s.category &&
        s.priceFrom <= categoryBudget * 1.2
      );
      
      // Filter by availability before scoring
      const availableCategorySuppliers = filterByAvailability(categorySuppliers, category);
      
      if (availableCategorySuppliers.length > 0) {
        const scoredSuppliers = availableCategorySuppliers.map(supplier => ({
          ...supplier,
          score: this.scoreSupplierWithTheme(supplier, theme, timeSlot, duration)
        })).sort((a, b) => b.score - a.score);
        
        const bestSupplier = scoredSuppliers[0];
        if (bestSupplier) {
          selected[category] = bestSupplier;
          remainingBudget.value -= bestSupplier.priceFrom;
          console.log(`✅ Selected available ${category}: ${bestSupplier.name} (£${bestSupplier.priceFrom})`);
        }
      } else {
        console.log(`❌ No ${category} suppliers available for this time/date within budget`);
      }
    });

    console.log(`\n🎊 Final available party selection for ${timeSlot} on ${date}:`);
    Object.entries(selected).forEach(([category, supplier]) => {
      const themeMatch = supplier.themes ? supplier.themes.includes(theme) ? '🎯' : '⚪' : '⚪';
      const cakeIcon = category === 'cakes' ? '🎂' : '';
      const largePartyExtra = category === 'softPlay' ? '🎪' : '';
      const availabilityIcon = supplier.availability ? '✅' : '📝';
      console.log(`${availabilityIcon}${themeMatch}${cakeIcon}${largePartyExtra} ${category}: ${supplier.name} (£${supplier.priceFrom})`);
    });
    
    const totalCost = Object.values(selected).reduce((sum, supplier) => sum + supplier.priceFrom, 0);
    const budgetUsed = Math.round((totalCost / budget) * 100);
    console.log(`💰 Total available party cost: £${totalCost} / £${budget} (${budgetUsed}% of budget)`);
    
    const availabilityScore = Object.values(selected).filter(s => s.availability).length;
    const totalSelected = Object.keys(selected).length;
    console.log(`📅 Availability coverage: ${availabilityScore}/${totalSelected} suppliers have confirmed availability`);
    
    if (isLargeParty) {
      console.log(`🎪 Large party enhancements: ${selected.softPlay ? 'Soft play included!' : 'No soft play available within budget'}`);
    }
    
    console.log(`🎂 Themed cakes: ${selected.cakes ? `${selected.cakes.name} included!` : 'No themed cakes available within budget'}`);

    return selected;
  }

  // UPDATED: Enhanced scoring function with time slot awareness
  scoreSupplierWithTheme(supplier, theme, timeSlot = 'afternoon', duration = 2) {
    try {
      let score = 0;

      // Special handling for no-theme - prefer general suppliers
      if (theme === 'no-theme') {
        // Bonus for suppliers without specific themes (general suppliers)
        if (!supplier?.themes || supplier.themes.length === 0) {
          score += 30;
        }
        // Or suppliers that explicitly support "general" parties
        if (supplier?.themes && supplier.themes.includes('general')) {
          score += 40;
        }
      } else {
        // Theme matching for specific themes
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

      // Time slot availability bonus
      if (supplier?.availability?.timeSlots) {
        if (supplier.availability.timeSlots.includes(timeSlot)) {
          score += 15;
        }
      }

      // Duration compatibility bonus
      if (supplier?.availability?.maxDuration) {
        if (supplier.availability.maxDuration >= duration) {
          score += 10;
        }
      }

      // Time slot preference bonus
      if (supplier?.preferences?.preferredTimeSlots) {
        if (supplier.preferences.preferredTimeSlots.includes(timeSlot)) {
          score += 5;
        }
      }

      return score;

    } catch (error) {
      console.error('❌ Error in scoreSupplierWithTheme:', error);
      return 0;
    }
  }

  // ✅ UPDATED: Helper function to map dashboard categories to supplier categories
  mapCategoryToSupplierCategory(dashboardCategory) {
    const mapping = {
      venue: 'Venues',
      entertainment: 'Entertainment', 
      catering: 'Catering',
      cakes: 'Cakes',               // ✅ NEW: Cakes mapping
      decorations: 'Decorations',
      activities: 'Activities',
      partyBags: 'Party Bags'
    };
    return mapping[dashboardCategory];
  }

  // Helper functions for time slot handling
  convertTimeSlotToTime(timeSlot) {
    const timeSlotDefaults = {
      morning: '11:00',
      afternoon: '14:00'
    };
    return timeSlotDefaults[timeSlot] || '14:00';
  }

  formatTimeSlotForDisplay(timeSlot) {
    const displays = {
      morning: 'Morning Party',
      afternoon: 'Afternoon Party'
    };
    return displays[timeSlot] || 'Afternoon Party';
  }

  formatDurationForDisplay(duration) {
    if (!duration) return '2 hours';
    
    if (duration === Math.floor(duration)) {
      return `${duration} hours`;
    } else {
      const hours = Math.floor(duration);
      const minutes = (duration - hours) * 60;
      
      if (minutes === 30) {
        return `${hours}½ hours`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  }

  getTimeWindowForSlot(timeSlot) {
    const timeWindows = {
      morning: { start: '10:00', end: '13:00', label: '10am-1pm' },
      afternoon: { start: '13:00', end: '17:00', label: '1pm-4pm' }
    };
    return timeWindows[timeSlot] || timeWindows.afternoon;
  }

  // Helper functions for localStorage operations
  savePartyDetailsToLocalStorage(partyDetails) {
    try {
      localStorage.setItem('party_details', JSON.stringify(partyDetails));
      console.log('💾 Party details saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving party details to localStorage:', error);
    }
  }

  savePartyPlanToLocalStorage(partyPlan) {
    try {
      localStorage.setItem('user_party_plan', JSON.stringify(partyPlan));
      console.log('💾 Party plan saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving party plan to localStorage:', error);
    }
  }

  calculateTotalCost(partyPlan) {
    let total = 0;
    
    // Add supplier costs
    Object.entries(partyPlan).forEach(([key, supplier]) => {
      if (supplier && supplier.price && key !== 'addons') {
        total += supplier.price;
      }
    });
    
    // Add addon costs
    if (partyPlan.addons) {
      partyPlan.addons.forEach(addon => {
        if (addon && addon.price) {
          total += addon.price;
        }
      });
    }
    
    return total;
  }

  // ✅ UPDATED: Get party details from database first, fallback to localStorage
  async getPartyDetails() {
    try {
      // Try to get from database first
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

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('party_details');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting party details:', error);
      return null;
    }
  }

  getThemeSuggestions(childAge) {
    if (childAge <= 4) {
      return ['unicorn', 'princess', 'dinosaur'];
    } else if (childAge <= 7) {
      return ['spiderman', 'princess', 'dinosaur', 'unicorn'];
    } else if (childAge <= 10) {
      return ['spiderman', 'taylor-swift', 'science', 'dinosaur'];
    } else {
      return ['taylor-swift', 'science', 'spiderman'];
    }
  }

  // Get available themes
  getAvailableThemes() {
    return Object.keys(THEMES).map(key => ({
      id: key,
      ...THEMES[key]
    }));
  }
}

// Create singleton instance
export const partyBuilderBackend = new PartyBuilderBackend();

// ✅ UPDATED: React hook for party building with database integration
import { useState } from 'react';

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
      console.error('usePartyBuilder: Error:', err);
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