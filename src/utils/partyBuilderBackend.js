// utils/partyBuilderBackend.js - Enhanced with database integration

import { suppliersAPI } from './mockBackend';
// ✅ UPDATED: Replace localStorage backend with database backend
import { partyDatabaseBackend } from './partyDatabaseBackend';

const THEMES = {
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
 // Fixed buildParty function - NO DATABASE CALLS during party building
async buildParty(partyDetails) {
  try {
    const {
      date,
      theme,
      guestCount,
      location,
      budget = 500,
      childAge = 6,
      childName = "Your Child"
    } = partyDetails;

    console.log('🎪 Building themed party (localStorage only):', { theme, budget, guestCount, childName });

    // Get all available suppliers
    const allSuppliers = await suppliersAPI.getAllSuppliers();
    
    // Get theme-specific entertainment first
    const themedEntertainment = await suppliersAPI.getEntertainmentByTheme(theme);
    console.log(`🎭 Found ${themedEntertainment.length} ${theme} entertainment options`);
    
    // Score and select best suppliers for each category with theme priority
    const selectedSuppliers = this.selectSuppliersForParty({
      suppliers: allSuppliers,
      themedEntertainment,
      theme,
      guestCount,
      location,
      budget,
      childAge
    });

    console.log('🎉 Selected themed suppliers:', selectedSuppliers);

    // Create party plan for localStorage (no database yet)
    // ✅ Convert to proper format for your app
const partyPlan = {
  venue: selectedSuppliers.venue || null,
  entertainment: selectedSuppliers.entertainment || null,
  catering: selectedSuppliers.catering || null,
  facePainting: selectedSuppliers.facePainting || null,
  activities: selectedSuppliers.activities || null,
  partyBags: selectedSuppliers.partyBags || null,
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
    
    // Save to localStorage only - NO DATABASE OPERATIONS
    this.savePartyDetailsToLocalStorage(partyDetails);
    this.savePartyPlanToLocalStorage(partyPlan);

    console.log('✅ Party built and saved to localStorage');

    return {
      success: true,
      partyPlan,
      selectedSuppliers,
      totalCost: this.calculateTotalCost(partyPlan),
      theme: THEMES[theme] || { name: theme }
      // NO party database record here
    };

  } catch (error) {
    console.error('❌ Error building themed party:', error);
    return {
      success: false,
      error: error.message
    };
  }
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



savePartyPlanToLocalStorage(partyPlan) {
  try {
    localStorage.setItem('user_party_plan', JSON.stringify(partyPlan));
    console.log('💾 Party plan saved to localStorage');
  } catch (error) {
    console.error('❌ Error saving party plan to localStorage:', error);
  }
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
  
  createPartyPlanForLocalStorage(selectedSuppliers, partyDetails) {
    console.log('🔍 Creating party plan from:', selectedSuppliers);
    console.log('🚨 FUNCTION ENTRY - createPartyPlanForLocalStorage');
    console.log('🚨 selectedSuppliers type:', typeof selectedSuppliers);
    console.log('🚨 selectedSuppliers:', selectedSuppliers);
    
    
    // Handle object format (not array)
    const partyPlan = {};
    
    if (selectedSuppliers && typeof selectedSuppliers === 'object') {
      // Iterate over object entries instead of using forEach
      Object.entries(selectedSuppliers).forEach(([category, supplier]) => {
        if (supplier && supplier.name) {
          partyPlan[category] = {
            id: supplier.id,
            name: supplier.name,
            price: supplier.priceFrom || supplier.price || 0,
            image: supplier.image,
            category: supplier.category || category,
            description: supplier.description,
            supplierData: supplier
          };
        }
      });
    }
    
    console.log('✅ Created party plan:', partyPlan);
    return partyPlan;
  }

  // Enhanced supplier selection with theme prioritization
  selectSuppliersForParty({ suppliers, themedEntertainment, theme, guestCount, location, budget, childAge }) {
    const selected = {};
    const remainingBudget = { value: budget };
    
    console.log('🎯 Starting themed supplier selection:', { theme, budget });
    
    // Enhanced budget allocation
    let budgetAllocation;
    if (budget <= 400) {
      budgetAllocation = {
        venue: 0.35,
        entertainment: 0.35,
        catering: 0.20,
        decorations: 0.05,
        activities: 0.03,
        partyBags: 0.02
      };
    } else if (budget <= 700) {
      budgetAllocation = {
        venue: 0.30,
        entertainment: 0.30,
        catering: 0.20,
        decorations: 0.10,
        activities: 0.06,
        partyBags: 0.04
      };
    } else {this.scoreSupplierWithTheme(supplier, theme)
      budgetAllocation = {
        venue: 0.25,
        entertainment: 0.30,
        catering: 0.25,
        decorations: 0.10,
        activities: 0.06,
        partyBags: 0.04
      };
    }

    // PRIORITIZE ENTERTAINMENT FIRST (theme is most important)
    const entertainmentBudget = budget * budgetAllocation.entertainment;
    console.log(`🎭 Finding themed entertainment with budget: £${entertainmentBudget.toFixed(0)}`);
    
    if (themedEntertainment.length > 0) {
      const scoredEntertainment = themedEntertainment.map(supplier => ({
        ...supplier,
        score: this.scoreSupplierWithTheme(supplier, theme)
      })).sort((a, b) => b.score - a.score);
      
      console.log(`🏆 Top themed entertainment options:`, 
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
        console.log(`✅ Selected themed entertainment: ${bestEntertainment.name} (£${bestEntertainment.priceFrom})`);
      }
    }
    
    // If no themed entertainment found, fall back to general entertainment
    if (!selected.entertainment) {
      console.log('🔄 No themed entertainment found, selecting general entertainment...');
      const generalEntertainment = suppliers.filter(s => s.category === 'Entertainment');
      if (generalEntertainment.length > 0) {
        const scored = generalEntertainment.map(supplier => ({
          ...supplier,
          score: this.scoreSupplierWithTheme(supplier, theme)
        })).sort((a, b) => b.score - a.score);
        
        if (scored[0]) {
          selected.entertainment = scored[0];
          remainingBudget.value -= scored[0].priceFrom;
          console.log(`✅ Selected general entertainment: ${scored[0].name}`);
        }
      }
    }

    // Continue with other categories
    const otherCategories = ['venue', 'catering', 'decorations', 'activities', 'partyBags'];
    
    otherCategories.forEach(category => {
      const categoryBudget = budget * budgetAllocation[category];
      
      // 🔍 DEBUG: Check the mapping
      const mappedCategory = this.mapCategoryToSupplierCategory(category);
      console.log(`🔍 Looking for ${category} -> mapped to: ${mappedCategory}`);
      
      const categorySuppliers = suppliers.filter(s => 
        this.mapCategoryToSupplierCategory(category) === s.category
      );
      
      console.log(`🔍 Found ${categorySuppliers.length} suppliers for ${category}`);
      console.log(`🔍 Available categories in all suppliers:`, [...new Set(suppliers.map(s => s.category))]);
      
      if (categorySuppliers.length > 0) {
        const scoredSuppliers = categorySuppliers.map(supplier => ({
          ...supplier,
          score: this.scoreSupplierWithTheme(supplier, theme)
        })).sort((a, b) => b.score - a.score);
        
        const bestSupplier = scoredSuppliers[0];
        if (bestSupplier) {
          selected[category] = bestSupplier;
          remainingBudget.value -= bestSupplier.priceFrom;
          console.log(`✅ Selected ${category}: ${bestSupplier.name} (£${bestSupplier.priceFrom}) - Score: ${bestSupplier.score}`);
        }
      }
    });

    console.log('\n🎊 Final themed party selection:');
    Object.entries(selected).forEach(([category, supplier]) => {
      const themeMatch = supplier.themes ? supplier.themes.includes(theme) ? '🎯' : '⚪' : '⚪';
      console.log(`${themeMatch} ${category}: ${supplier.name} (£${supplier.priceFrom})`);
    });
    
    const totalCost = Object.values(selected).reduce((sum, supplier) => sum + supplier.priceFrom, 0);
    console.log(`💰 Total themed party cost: £${totalCost} / £${budget}`);

    return selected;
  }

 // Add this debug version to your scoreSupplierWithTheme function in partyBuilderBackend.js

scoreSupplierWithTheme(supplier, theme) {
  try {
    // Debug logging to see what's undefined
    console.log('🔍 Scoring supplier:', supplier?.name || 'Unknown');
    console.log('🔍 Theme:', theme);
    console.log('🔍 Supplier themes:', supplier?.themes);
    console.log('🔍 Supplier serviceDetails:', supplier?.serviceDetails);
    console.log('🔍 Supplier serviceDetails.themes:', supplier?.serviceDetails?.themes);

    let score = 0;

    // Check supplier.themes (if it exists and is an array)
    if (supplier?.themes && Array.isArray(supplier.themes)) {
      if (supplier.themes.includes(theme)) {
        score += 50;
        console.log('✅ Theme match in supplier.themes');
      }
    } else {
      console.log('⚠️ supplier.themes is missing or not an array:', supplier?.themes);
    }

    // Check supplier.serviceDetails.themes (if it exists and is an array)
    if (supplier?.serviceDetails?.themes && Array.isArray(supplier.serviceDetails.themes)) {
      if (supplier.serviceDetails.themes.includes(theme)) {
        score += 30;
        console.log('✅ Theme match in serviceDetails.themes');
      }
    } else {
      console.log('⚠️ supplier.serviceDetails.themes is missing or not an array:', supplier?.serviceDetails?.themes);
    }

    // Check supplier name for theme keywords
    if (supplier?.name && typeof supplier.name === 'string') {
      const lowerName = supplier.name.toLowerCase();
      const lowerTheme = theme?.toLowerCase() || '';
      
      if (lowerName.includes(lowerTheme)) {
        score += 20;
        console.log('✅ Theme match in supplier name');
      }
    } else {
      console.log('⚠️ supplier.name is missing or not a string:', supplier?.name);
    }

    // Check supplier description for theme keywords
    if (supplier?.description && typeof supplier.description === 'string') {
      const lowerDescription = supplier.description.toLowerCase();
      const lowerTheme = theme?.toLowerCase() || '';
      
      if (lowerDescription.includes(lowerTheme)) {
        score += 10;
        console.log('✅ Theme match in supplier description');
      }
    }

    console.log(`🎯 Final score for ${supplier?.name}: ${score}`);
    return score;

  } catch (error) {
    console.error('❌ Error in scoreSupplierWithTheme:', error);
    console.log('🔍 Supplier object:', supplier);
    console.log('🔍 Theme:', theme);
    return 0; // Return 0 score if there's an error
  }
}

  mapCategoryToSupplierCategory(dashboardCategory) {
    const mapping = {
      venue: 'Venues',
      entertainment: 'Entertainment', 
      catering: 'Catering',
      decorations: 'Decorations',
      activities: 'Activities',
      partyBags: 'Party Bags'
    };
    return mapping[dashboardCategory];
  }

  // ✅ UPDATED: Create party plan for database storage
  createPartyPlanForDatabase(selectedSuppliers, partyDetails) {
    const plan = {
      // Always include e-invites with theme
      einvites: {
        id: "digital-invites",
        name: `Digital ${partyDetails.theme?.charAt(0).toUpperCase() + partyDetails.theme?.slice(1)} Invites`,
        description: `Themed ${partyDetails.theme} e-invitations with RSVP tracking`,
        price: 25,
        status: "confirmed",
        image: "/placeholder.jpg",
        category: "Digital Services",
        priceUnit: "per set",
        addedAt: new Date().toISOString(),
        themes: [partyDetails.theme, "digital"]
      },
      // Initialize addons array
      addons: []
    };

    // Add selected suppliers
    Object.entries(selectedSuppliers).forEach(([category, supplier]) => {
      if (supplier) {
        plan[category] = {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          price: supplier.priceFrom,
          status: "pending",
          image: supplier.image,
          category: supplier.category,
          priceUnit: supplier.priceUnit,
          themes: supplier.themes || [],
          addedAt: new Date().toISOString(),
          originalSupplier: supplier
        };
      } else {
        plan[category] = null;
      }
    });

    return plan;
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

  // ✅ UPDATED: Backward compatibility - save to localStorage (can remove later)
  savePartyDetailsToLocalStorage(details) {
    try {
      localStorage.setItem('party_details', JSON.stringify({
        ...details,
        createdAt: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Error saving party details to localStorage:', error);
      return false;
    }
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
      
      console.log('🎪 usePartyBuilder: Starting database party build with:', partyDetails);
      
      const result = await partyBuilderBackend.buildParty(partyDetails);
      
      console.log('🎉 usePartyBuilder: Database build result:', result);
      
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