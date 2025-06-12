// utils/partyBuilderBackend.js - Enhanced with theme matching

import { suppliersAPI } from './mockBackend';
import { partyPlanBackend } from './partyPlanBackend';

const THEMES = {
  'spiderman': {
    name: "Spider-Man",
    keywords: ["spiderman", "spider", "web", "superhero", "marvel"],
    colors: ["red", "blue"],
    decorationStyle: "superhero",
    priority: "character" // Prioritize character visits for specific characters
  },
  'taylor-swift': {
    name: "Taylor Swift", 
    keywords: ["taylor", "swift", "pop", "star", "music", "concert", "eras"],
    colors: ["pink", "purple", "gold"],
    decorationStyle: "glamorous",
    priority: "music" // Prioritize music/performance entertainment
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

      console.log('🎪 Building themed party:', { theme, budget, guestCount });

      // Get all available suppliers
      const allSuppliers = await suppliersAPI.getAllSuppliers();
      
      // NEW: Get theme-specific entertainment first
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

      // Create party plan
      const partyPlan = this.createPartyPlan(selectedSuppliers, partyDetails);
      
      // Save to backend
      partyPlanBackend.savePartyPlan(partyPlan);
      this.savePartyDetails(partyDetails);

      return {
        success: true,
        partyPlan,
        selectedSuppliers,
        totalCost: this.calculateTotalCost(partyPlan),
        theme: THEMES[theme] || { name: theme }
      };

    } catch (error) {
      console.error('Error building themed party:', error);
      return {
        success: false,
        error: error.message
      };
    }
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
        entertainment: 0.35, // Increased for theme importance
        catering: 0.20,
        decorations: 0.05,
        activities: 0.03,
        partyBags: 0.02
      };
    } else if (budget <= 700) {
      budgetAllocation = {
        venue: 0.30,
        entertainment: 0.30, // Keep high for theme matching
        catering: 0.20,
        decorations: 0.10,
        activities: 0.06,
        partyBags: 0.04
      };
    } else {
      budgetAllocation = {
        venue: 0.25,
        entertainment: 0.30, // Entertainment is key for themes
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
        score: this.scoreSupplierWithTheme(supplier, { theme, guestCount, location, budget: entertainmentBudget, childAge })
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
          score: this.scoreSupplierWithTheme(supplier, { theme, guestCount, location, budget: entertainmentBudget, childAge })
        })).sort((a, b) => b.score - a.score);
        
        selected.entertainment = scored[0];
        remainingBudget.value -= scored[0].priceFrom;
        console.log(`✅ Selected general entertainment: ${scored[0].name}`);
      }
    }

    // Continue with other categories
    const otherCategories = ['venue', 'catering', 'decorations', 'activities', 'partyBags'];
    
    otherCategories.forEach(category => {
      const categoryBudget = budget * budgetAllocation[category];
      const categorySuppliers = suppliers.filter(s => 
        this.mapCategoryToSupplierCategory(category) === s.category
      );
      
      if (categorySuppliers.length > 0) {
        const scoredSuppliers = categorySuppliers.map(supplier => ({
          ...supplier,
          score: this.scoreSupplierWithTheme(supplier, { theme, guestCount, location, budget: categoryBudget, childAge })
        })).sort((a, b) => b.score - a.score);
        
        const bestSupplier = scoredSuppliers[0];
        if (bestSupplier && bestSupplier.score > 0) {
          selected[category] = bestSupplier;
          remainingBudget.value -= bestSupplier.priceFrom;
          console.log(`✅ Selected ${category}: ${bestSupplier.name} (£${bestSupplier.priceFrom})`);
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

  // Enhanced scoring with theme prioritization
  scoreSupplierWithTheme(supplier, { theme, guestCount, location, budget, childAge }) {
    let score = 0;
    
    // THEME MATCHING (50% of score - increased importance!)
    if (theme && supplier.themes) {
      // Exact theme match gets full points
      if (supplier.themes.includes(theme)) {
        score += 50;
        console.log(`🎯 Perfect theme match: ${supplier.name} has ${theme} theme`);
      }
      // Partial theme match from theme keywords
      else if (THEMES[theme]) {
        const themeKeywords = THEMES[theme].keywords;
        const supplierThemes = supplier.themes.join(' ').toLowerCase();
        const matches = themeKeywords.filter(keyword => 
          supplierThemes.includes(keyword.toLowerCase())
        ).length;
        const themeScore = (matches / themeKeywords.length) * 40;
        score += themeScore;
        if (themeScore > 0) {
          console.log(`🎪 Partial theme match: ${supplier.name} (${themeScore.toFixed(1)} points)`);
        }
      }
      // Generic matches (superhero, general, etc.)
      else if (supplier.themes.includes('general') || supplier.themes.includes('superhero')) {
        score += 15;
      }
    }
    
    // Name/description theme matching (10% of score)
    if (theme && THEMES[theme]) {
      const themeKeywords = THEMES[theme].keywords;
      const supplierText = `${supplier.name} ${supplier.description}`.toLowerCase();
      const nameMatches = themeKeywords.filter(keyword => 
        supplierText.includes(keyword.toLowerCase())
      ).length;
      score += (nameMatches / themeKeywords.length) * 10;
    }

    // Price matching (25% of score)
    const priceRatio = supplier.priceFrom / budget;
    if (priceRatio <= 1.0) {
      if (priceRatio >= 0.7 && priceRatio <= 1.0) {
        score += 25; // Perfect budget utilization
      } else if (priceRatio >= 0.4 && priceRatio < 0.7) {
        score += 20; // Good value
      } else if (priceRatio >= 0.2 && priceRatio < 0.4) {
        score += 15; // Reasonable value
      } else {
        score += 10; // Very cheap
      }
    } else if (priceRatio <= 1.3) {
      score += 15 - ((priceRatio - 1.0) * 10); // Slight over budget penalty
    } else {
      score -= 10; // Way over budget
    }

    // Location matching (10% of score)
    if (location && supplier.location) {
      if (supplier.location.toLowerCase().includes(location.toLowerCase()) ||
          supplier.location.includes('UK Wide') ||
          supplier.location.includes('London')) {
        score += 10;
      }
    }

    // Quality/rating (10% of score)
    score += (supplier.rating / 5) * 10;

    // Availability (5% of score)
    if (supplier.availability.includes('Available') || 
        supplier.availability.includes('today') ||
        supplier.availability.includes('weekend')) {
      score += 5;
    }

    return Math.max(0, score);
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

  createPartyPlan(selectedSuppliers, partyDetails) {
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
      }
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
    return Object.values(partyPlan)
      .filter(supplier => supplier !== null)
      .reduce((total, supplier) => total + (supplier.price || 0), 0);
  }

  savePartyDetails(details) {
    try {
      localStorage.setItem('party_details', JSON.stringify({
        ...details,
        createdAt: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Error saving party details:', error);
      return false;
    }
  }

  getPartyDetails() {
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

  // NEW: Get available themes
  getAvailableThemes() {
    return Object.keys(THEMES).map(key => ({
      id: key,
      ...THEMES[key]
    }));
  }
}

// Create singleton instance
export const partyBuilderBackend = new PartyBuilderBackend();

// React hook for party building (enhanced)
import { useState } from 'react';

export function usePartyBuilder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildParty = async (partyDetails) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎪 usePartyBuilder: Starting themed party build with:', partyDetails);
      
      const result = await partyBuilderBackend.buildParty(partyDetails);
      
      console.log('🎉 usePartyBuilder: Themed build result:', result);
      
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

  const getPartyDetails = () => {
    return partyBuilderBackend.getPartyDetails();
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