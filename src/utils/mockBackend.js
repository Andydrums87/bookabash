// utils/mockBackend.js
// Clean version with proper async handling

import { supabase } from '@/lib/supabase'
import { create } from 'canvas-confetti';
import { useState, useEffect } from 'react';

const generateBusinessSlug = (businessName) => {
  const baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const timestamp = Date.now().toString().slice(-6)
  return `${baseSlug}-${timestamp}`
}

// Helper function for themes (keep your existing logic)
const getThemesFromServiceType = (serviceType) => {
  const themeMapping = {
    'magician': ['magic', 'superhero', 'general'],
    'clown': ['circus', 'comedy', 'general'],
    'entertainer': ['general', 'superhero', 'princess'],
    'dj': ['music', 'dance', 'general'],
    'musician': ['music', 'taylor-swift', 'general'],
    'face-painting': ['general', 'superhero', 'princess'],
    'decorations': ['general'],
    'venue': ['general'],
    'catering': ['general']
  }
  return themeMapping[serviceType] || ['general']
}

const createThemedBusiness = async (primaryBusinessId, themedBusinessData) => {
  try {
    console.log('🎭 Creating themed business for parent:', primaryBusinessId)

    const generateBusinessSlug = (businessName) => {
      const baseSlug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      const timestamp = Date.now().toString().slice(-6)
      return `${baseSlug}-${timestamp}`
    }

    // Get the primary business to inherit data
    const { data: primaryBusiness, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', primaryBusinessId)
      .single()

    if (fetchError) throw fetchError

    const inheritedData = primaryBusiness.data
    const businessSlug = generateBusinessSlug(themedBusinessData.name)

    // Create themed business data (inherits from primary)
const themedData = {
  // ✅ INHERITED SETTINGS (Shared across businesses)
  workingHours: inheritedData.workingHours,
  unavailableDates: inheritedData.unavailableDates,
  busyDates: inheritedData.busyDates,
  availabilityNotes: inheritedData.availabilityNotes,
  advanceBookingDays: inheritedData.advanceBookingDays,
  maxBookingDays: inheritedData.maxBookingDays,
  packages: inheritedData.packages,
  addOnServices: inheritedData.addOnServices || [],
  serviceDetails: {
    ...inheritedData.serviceDetails,
    // Keep most service details but allow theme-specific overrides
    performerType: inheritedData.serviceDetails?.performerType,
    ageGroups: inheritedData.serviceDetails?.ageGroups,
    equipment: inheritedData.serviceDetails?.equipment,
    travelRadius: inheritedData.serviceDetails?.travelRadius,
  },
  owner: inheritedData.owner, // Contact info stays the same
  location: inheritedData.location, // Service area
  
  // ✅ BUSINESS-SPECIFIC (Unique per business)
  name: themedBusinessData.name,
  description: themedBusinessData.description || `Professional ${themedBusinessData.serviceType} services specializing in ${themedBusinessData.theme} themes.`,
  serviceType: themedBusinessData.serviceType,
  themes: [themedBusinessData.theme],
  
  // Reset business-specific content
  coverPhoto: null, // Each business gets its own cover photo
  image: null,
  portfolioImages: [], // Each business gets its own portfolio
  portfolioVideos: [],
  
  // Reset metrics
  rating: 0,
  reviewCount: 0,
  bookingCount: 0,
  isComplete: false,
  
  // Timestamps
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

    // Insert themed business
    const { data: newThemedBusiness, error: insertError } = await supabase
      .from('suppliers')
      .insert({
        auth_user_id: primaryBusiness.auth_user_id,
        business_name: themedBusinessData.name,
        business_type: 'themed',
        is_primary: false,
        parent_business_id: primaryBusinessId,
        created_from_theme: themedBusinessData.theme,
        business_slug: businessSlug,
        data: themedData
      })
      .select()
      .single()

    if (insertError) throw insertError

    console.log('✅ Themed business created:', newThemedBusiness.id)

    return {
      success: true,
      business: newThemedBusiness,
      message: 'Themed business created successfully'
    }

  } catch (error) {
    console.error('❌ Error creating themed business:', error)
    return {
      success: false,
      error: error.message || 'Failed to create themed business'
    }
  }
}

// Add this function to your mockBackend.js file, near the top with other helper functions

const getDefaultPackagesForServiceType = (serviceType, theme = 'general') => {
  console.log('🎯 Creating default packages for:', serviceType, 'theme:', theme)
  
  const packageTemplates = {
    'entertainment': {
      'superhero': [
        {
          id: "superhero-basic",
          name: "Superhero Training Academy",
          price: 180,
          duration: "1 hour",
          priceType: "flat",
          features: [
            "Superhero character visit",
            "Basic training activities", 
            "Hero certificate ceremony",
            "Photo opportunities"
          ],
          description: "Transform your party into a superhero training academy with exciting activities and character interaction."
        },
        {
          id: "superhero-premium",
          name: "Ultimate Hero Mission",
          price: 300,
          duration: "1.5 hours", 
          priceType: "flat",
          features: [
            "2 superhero characters",
            "Mission-based games",
            "Face painting",
            "Hero training obstacles",
            "Villain defeat ceremony",
            "Take-home hero badges"
          ],
          description: "The complete superhero experience with multiple characters, interactive missions, and memorable takeaways."
        }
      ],
      'princess': [
        {
          id: "princess-basic",
          name: "Royal Princess Visit",
          price: 170,
          duration: "1 hour",
          priceType: "flat", 
          features: [
            "Princess character visit",
            "Royal storytelling",
            "Simple princess games",
            "Crowning ceremony"
          ],
          description: "A magical princess visit filled with enchanting stories and royal activities."
        },
        {
          id: "princess-deluxe",
          name: "Enchanted Royal Ball",
          price: 290,
          duration: "1.5 hours",
          priceType: "flat",
          features: [
            "Princess character",
            "Royal dress-up activities", 
            "Princess makeovers",
            "Royal dancing lessons",
            "Magic wand ceremony",
            "Princess photo session"
          ],
          description: "Transform your party into a magical royal ball with dress-up, dancing, and princess makeovers."
        }
      ],
      'general': [
        {
          id: "entertainment-standard",
          name: "Fun Party Entertainment",
          price: 160,
          duration: "1 hour",
          priceType: "flat",
          features: [
            "Professional entertainer",
            "Interactive games",
            "Music and dancing",
            "Balloon modelling"
          ],
          description: "High-energy entertainment perfect for keeping children engaged and having fun."
        },
        {
          id: "entertainment-deluxe", 
          name: "Ultimate Party Experience",
          price: 280,
          duration: "2 hours",
          priceType: "flat",
          features: [
            "Lead entertainer + assistant",
            "Themed games and activities",
            "Face painting",
            "Balloon creations",
            "Music system included",
            "Party games coordination"
          ],
          description: "Complete entertainment package with multiple entertainers and varied activities for an unforgettable party."
        }
      ]
    },

    'venue': [
      {
        id: "venue-basic",
        name: "2-Hour Party Venue",
        price: 200,
        duration: "2 hours",
        priceType: "flat",
        features: [
          "Private party room",
          "Tables and chairs setup",
          "Basic decorations included",
          "Kitchen access"
        ],
        description: "Perfect party space with everything you need for a memorable celebration."
      },
      {
        id: "venue-premium",
        name: "All-Day Celebration",
        price: 400,
        duration: "4 hours",
        priceType: "flat",
        features: [
          "Extended venue hire",
          "Premium room decorations",
          "Sound system included",
          "Dedicated party coordinator",
          "Catering preparation area",
          "Photo backdrop setup"
        ],
        description: "Complete venue package with extended time and premium amenities for the ultimate party experience."
      }
    ],

    'catering': [
      {
        id: "catering-basic",
        name: "Party Essentials",
        price: 12,
        duration: "Per child",
        priceType: "per_child",
        features: [
          "Sandwiches & wraps",
          "Crisps and snacks",
          "Juice boxes",
          "Birthday cake",
          "Paper plates & napkins"
        ],
        description: "Everything you need for a delicious party meal that kids will love."
      },
      {
        id: "catering-deluxe",
        name: "Premium Party Feast",
        price: 18,
        duration: "Per child",
        priceType: "per_child",
        features: [
          "Hot food buffet",
          "Healthy snack options",
          "Premium drinks selection",
          "Custom themed birthday cake",
          "Fresh fruit platter",
          "Party bags included"
        ],
        description: "Delicious hot food and premium treats for an unforgettable party dining experience."
      }
    ],

    'facePainting': [
      {
        id: "facepainting-basic",
        name: "Fun Face Painting",
        price: 120,
        duration: "1 hour",
        priceType: "flat",
        features: [
          "Professional face painter",
          "Basic designs & characters",
          "Safe, washable paints",
          "Up to 15 children"
        ],
        description: "Transform children into their favorite characters with professional face painting."
      },
      {
        id: "facepainting-premium",
        name: "Ultimate Face Art Studio",
        price: 200,
        duration: "2 hours",
        priceType: "flat",
        features: [
          "Professional face painting artist",
          "Detailed character designs",
          "Glitter and gem additions",
          "Temporary tattoos",
          "Up to 25 children",
          "Take-home stickers"
        ],
        description: "Professional face art with detailed designs and special effects for an amazing transformation experience."
      }
    ],

    'activities': [
      {
        id: "activities-basic",
        name: "Fun Party Activities",
        price: 150,
        duration: "1.5 hours",
        priceType: "flat",
        features: [
          "Organized party games",
          "Craft activities",
          "Basic equipment included",
          "Activity coordinator"
        ],
        description: "Engaging activities and games to keep children entertained throughout the party."
      },
      {
        id: "activities-premium",
        name: "Adventure Activity Zone",
        price: 280,
        duration: "2.5 hours",
        priceType: "flat",
        features: [
          "Multiple activity stations",
          "Themed craft workshops",
          "Interactive team games",
          "Take-home creations",
          "Professional activity leaders",
          "All materials included"
        ],
        description: "Complete activity experience with multiple stations and professional coordination for maximum fun."
      }
    ],

    'partyBags': [
      {
        id: "partybags-basic",
        name: "Classic Party Bags",
        price: 5,
        duration: "Per bag",
        priceType: "per_bag",
        features: [
          "Themed party bag",
          "Small toys and treats",
          "Stickers and pencils",
          "Sweet treats"
        ],
        description: "Traditional party bags filled with fun treats and small toys for party guests."
      },
      {
        id: "partybags-premium",
        name: "Deluxe Party Bags",
        price: 12,
        duration: "Per bag",
        priceType: "per_bag",
        features: [
          "Premium themed bags",
          "Quality toys and games",
          "Personalized items",
          "Healthy snack options",
          "Activity sheets",
          "Special keepsake item"
        ],
        description: "Premium party bags with high-quality items and personalized touches that guests will treasure."
      }
    ],

    'decorations': [
      {
        id: "decorations-basic",
        name: "Party Decoration Package",
        price: 80,
        duration: "Setup included",
        priceType: "flat",
        features: [
          "Themed banners and signs",
          "Table decorations",
          "Basic balloon arrangements",
          "Party streamers"
        ],
        description: "Beautiful themed decorations to transform your party space with color and excitement."
      },
      {
        id: "decorations-premium",
        name: "Complete Party Transformation",
        price: 180,
        duration: "Setup & takedown",
        priceType: "flat",
        features: [
          "Premium themed decorations",
          "Balloon arches and sculptures",
          "Photo backdrop setup",
          "Table centerpieces",
          "Lighting effects",
          "Setup and takedown service"
        ],
        description: "Complete venue transformation with premium decorations and professional setup for a stunning party atmosphere."
      }
    ],

    'balloons': [
      {
        id: "balloons-basic",
        name: "Balloon Decorations",
        price: 60,
        duration: "Delivery included",
        priceType: "flat",
        features: [
          "Themed balloon bunches",
          "Number balloons",
          "Basic balloon arrangements",
          "Delivery to venue"
        ],
        description: "Colorful balloon decorations to add fun and festivity to your party celebration."
      },
      {
        id: "balloons-premium",
        name: "Balloon Extravaganza",
        price: 150,
        duration: "Setup included",
        priceType: "flat",
        features: [
          "Custom balloon arches",
          "Balloon sculptures",
          "Themed balloon arrangements",
          "Giant number balloons",
          "Professional setup service",
          "Helium balloons for guests"
        ],
        description: "Spectacular balloon displays with custom designs and professional installation for maximum visual impact."
      }
    ],

    'photography': [
      {
        id: "photography-basic",
        name: "Party Photography",
        price: 250,
        duration: "2 hours",
        priceType: "flat",
        features: [
          "Professional photographer",
          "Candid party moments",
          "50+ edited photos",
          "Digital gallery delivery"
        ],
        description: "Capture all the special moments of your party with professional photography."
      },
      {
        id: "photography-premium",
        name: "Complete Photo Experience",
        price: 400,
        duration: "3 hours",
        priceType: "flat",
        features: [
          "Professional photographer",
          "Posed and candid shots",
          "100+ edited photos",
          "Print package included",
          "Photo booth setup",
          "Same-day preview gallery"
        ],
        description: "Comprehensive photography package with photo booth and professional editing for lasting memories."
      }
    ]
  }

  // Handle entertainment with themes
  if (serviceType === 'entertainment' && packageTemplates.entertainment[theme]) {
    return packageTemplates.entertainment[theme]
  }
  
  // Handle entertainment with general theme
  if (serviceType === 'entertainment') {
    return packageTemplates.entertainment.general
  }
  
  // Handle other service types
  if (packageTemplates[serviceType]) {
    return packageTemplates[serviceType]
  }
  
  // Fallback generic packages
  return [
    {
      id: "standard-basic",
      name: "Standard Service",
      price: 150,
      duration: "1-2 hours",
      priceType: "flat",
      features: [
        "Professional service",
        "All equipment included",
        "Setup and coordination"
      ],
      description: `Quality ${serviceType} service for your party celebration.`
    },
    {
      id: "standard-premium",
      name: "Premium Service",
      price: 250,
      duration: "2-3 hours", 
      priceType: "flat",
      features: [
        "Enhanced professional service",
        "Premium equipment",
        "Extended time",
        "Additional coordination"
      ],
      description: `Enhanced ${serviceType} service with premium features for an exceptional party experience.`
    }
  ]
}

// Get all suppliers from Supabase
// const getAllSuppliers = async () => {
//   try {
//     console.log('🔍 Fetching suppliers from Supabase...')
    
//     const { data, error } = await supabase
//       .from('suppliers')
//       .select('*')
//       .order('created_at', { ascending: false })
    
//     if (error) {
//       console.error('Supabase error:', error)
//       throw error
//     }
    
//     if (!data || data.length === 0) {
//       console.warn('No suppliers found in Supabase, returning empty array')
//       return []
//     }
    
//     // Transform the data from Supabase format to your existing format
//     const transformedSuppliers = data.map(supplier => {
//       try {
//         return {
//           ...supplier.data, // Spread the JSON data which contains all your original supplier fields
//           id: supplier.legacy_id || supplier.id // Use legacy_id for consistency
//         }
//       } catch (transformError) {
//         console.error('Error transforming supplier:', supplier.id, transformError)
//         return null
//       }
//     }).filter(Boolean) // Remove any null entries
    
//     console.log(`✅ Successfully loaded ${transformedSuppliers.length} suppliers from Supabase`)
//     return transformedSuppliers
    
//   } catch (error) {
//     console.error('💥 Error loading suppliers from Supabase:', error)
    
//     // Return empty array instead of mock data to avoid confusion
//     console.warn('Returning empty array due to Supabase error')
//     return []
//   }
// }
const getAllSuppliers = async () => {
  try {

    
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        id,
        business_name,
        business_type,
        is_primary,
        business_slug,
        data,
        created_at
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    if (!data || data.length === 0) {
      console.warn('No suppliers found in Supabase, returning empty array')
      return []
    }
    
    // Transform the data from Supabase format to your existing format
    const transformedSuppliers = data.map(supplier => {
      try {
        return {
          ...supplier.data, // Spread the JSON data which contains all your original supplier fields
          id: supplier.id, // Use the real UUID (not legacy_id anymore)
          businessSlug: supplier.business_slug, // Add business slug for URLs
          isPrimary: supplier.is_primary, // Add primary business flag
          businessType: supplier.business_type // Add business type
        }
      } catch (transformError) {
        console.error('Error transforming supplier:', supplier.id, transformError)
        return null
      }
    }).filter(Boolean) // Remove any null entries
    
   
    return transformedSuppliers
    
  } catch (error) {
    console.error('💥 Error loading suppliers from Supabase:', error)
    console.warn('Returning empty array due to Supabase error')
    return []
  }
}


function isValidUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)
}
// API functions
export const suppliersAPI = {
  createThemedBusiness,
  // Get all suppliers
  getAllSuppliers: async () => {
    await new Promise(resolve => setTimeout(resolve, 600)) // Keep UX delay
    return await getAllSuppliers()
  },

  getSupplierById: async (id) => {
    try {
      let query
      if (isValidUUID(id)) {
        query = supabase.from('suppliers').select('*').eq('id', id).limit(1)
      } else {
        query = supabase.from('suppliers').select('*').eq('legacy_id', id).limit(1)
      }

      const { data, error } = await query

      if (error) {
        console.error("❌ Supabase error:", error)
        return null
      }

      if (!data || data.length === 0) {
        console.warn(`⚠️ No supplier found with id or legacy_id: ${id}`)
        return null
      }

      return {
        id: data[0].id,
        legacyId: data[0].legacy_id,
        ...data[0].data ?? data[0], // Adjust for your schema
      }
    } catch (err) {
      console.error("💥 Exception in getSupplierById:", err)
      return null
    }
  },
  
  
  // Theme filtering functions
  getEntertainmentByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const allSuppliers = await getAllSuppliers()
      
      const entertainmentSuppliers = allSuppliers.filter(supplier => {
        const isEntertainment = supplier.category === 'Entertainment' || 
                               supplier.serviceType === 'entertainer' ||
                               supplier.serviceType === 'magician' ||
                               supplier.serviceType === 'clown' ||
                               supplier.serviceType === 'dj' ||
                               supplier.serviceType === 'musician';
        
        if (!isEntertainment) return false;
        
        const matchesTheme = 
          supplier.themes?.includes(theme) ||
          supplier.serviceType === theme ||
          supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
          supplier.description?.toLowerCase().includes(theme.toLowerCase()) ||
          (theme === 'spiderman' && (
            supplier.themes?.includes('superhero') ||
            supplier.name.toLowerCase().includes('spider') ||
            supplier.name.toLowerCase().includes('superhero')
          )) ||
          (theme === 'princess' && (
            supplier.themes?.includes('princess') ||
            supplier.themes?.includes('fairy') ||
            supplier.name.toLowerCase().includes('princess')
          )) ||
          (theme === 'taylor-swift' && (
            supplier.serviceType === 'musician' ||
            supplier.serviceType === 'dj' ||
            supplier.themes?.includes('music')
          )) ||
          (theme === 'pokemon' && (
            supplier.serviceType === 'pokemon' ||
            supplier.themes?.includes('pokemon')
          ));
        
        return matchesTheme;
      });
      
      return entertainmentSuppliers;
      
    } catch (error) {
      console.error('Error getting entertainment by theme:', error);
      return [];
    }
  },

  getVenuesByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const allSuppliers = await getAllSuppliers()
      
      const venueSuppliers = allSuppliers.filter(supplier => {
        const isVenue = supplier.category === 'Venues' || 
                       supplier.serviceType === 'venue';
        
        if (!isVenue) return false;
        
        const matchesTheme = supplier.themes?.includes(theme) ||
                           supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
                           supplier.description?.toLowerCase().includes(theme.toLowerCase());
        
        return matchesTheme;
      });
      
      console.log(`🏢 Found ${venueSuppliers.length} venues for theme: ${theme}`);
      return venueSuppliers;
      
    } catch (error) {
      console.error('Error getting venues by theme:', error);
      return [];
    }
  },

  getCateringByTheme: async (theme) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const allSuppliers = await getAllSuppliers()
      
      const cateringSuppliers = allSuppliers.filter(supplier => {
        const isCatering = supplier.category === 'Catering' || 
                          supplier.serviceType === 'catering';
        
        if (!isCatering) return false;
        
        const matchesTheme = supplier.themes?.includes(theme) ||
                           supplier.name.toLowerCase().includes(theme.toLowerCase()) ||
                           supplier.description?.toLowerCase().includes(theme.toLowerCase());
        
        return matchesTheme;
      });
      
      console.log(`🍰 Found ${cateringSuppliers.length} catering suppliers for theme: ${theme}`);
      return cateringSuppliers;
      
    } catch (error) {
      console.error('Error getting catering by theme:', error);
      return [];
    }
  },

  getSupplierByOwnerEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      const allSuppliers = await getAllSuppliers()
      return allSuppliers.find(supplier => supplier.owner?.email === email) || null
    } catch (error) {
      console.error('Error getting supplier by email:', error)
      return null
    }
  },

  addSupplierFromOnboarding: async (formData, authUserId = null) => {
    try {
      console.log('🚀 Creating PRIMARY business for new supplier:', formData)
  
      // Helper function for themes (keep your existing logic)
      const getThemesFromServiceType = (serviceType) => {
        const themeMapping = {
          'magician': ['magic', 'superhero', 'general'],
          'clown': ['circus', 'comedy', 'general'],
          'entertainer': ['general', 'superhero', 'princess'],
          'dj': ['music', 'dance', 'general'],
          'musician': ['music', 'taylor-swift', 'general'],
          'face-painting': ['general', 'superhero', 'princess'],
          'decorations': ['general'],
          'venue': ['general'],
          'catering': ['general']
        }
        return themeMapping[serviceType] || ['general']
      }
  
      // Helper function for business slug
      const generateBusinessSlug = (businessName) => {
        const baseSlug = businessName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        const timestamp = Date.now().toString().slice(-6)
        return `${baseSlug}-${timestamp}`
      }
  
      // Get current authenticated user
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
  
      const userId = authUser?.user?.id
      if (!userId) throw new Error("No authenticated user")
  
      // Create business slug
      const businessSlug = generateBusinessSlug(formData.businessName || formData.name)
  
      // ✅ NEW: Generate smart default packages based on service type and theme
      const serviceType = formData.supplierType || formData.serviceType
      const selectedTheme = formData.theme || 'general'
      
      console.log('🎯 Generating smart packages for:', serviceType, 'theme:', selectedTheme)
      const defaultPackages = getDefaultPackagesForServiceType(serviceType, selectedTheme)
      
      console.log('📦 Generated packages:', defaultPackages.map(pkg => ({ 
        id: pkg.id, 
        name: pkg.name, 
        price: pkg.price 
      })))
  
      // ✅ Calculate pricing from packages
      const hasPackages = defaultPackages.length > 0
      const priceFrom = hasPackages ? Math.min(...defaultPackages.map(p => p.price)) : 0
      const priceUnit = hasPackages ? (defaultPackages[0].priceType === 'per_child' ? 'per child' : 
                                      defaultPackages[0].priceType === 'per_bag' ? 'per bag' : 'per event') : 'per event'
  
      // Create the supplier data with smart defaults
      const supplierData = {
        name: formData.businessName || formData.name,
        owner: {
          name: formData.yourName || formData.ownerName,
          email: formData.email,
          phone: formData.phone
        },
        category: serviceType,
        subcategory: serviceType,
        serviceType: serviceType,
        image: "/placeholder.svg?height=300&width=400&text=" + encodeURIComponent(formData.businessName || formData.name),
        rating: 0,
        reviewCount: 0,
        bookingCount: 0,
        location: formData.postcode || "Location TBD",
        
        // ✅ NEW: Smart pricing from packages
        priceFrom: priceFrom,
        priceUnit: priceUnit,
        
        description: hasPackages ? 
          `Professional ${serviceType} services with ${defaultPackages.length} package option${defaultPackages.length > 1 ? 's' : ''} available.` :
          "New supplier - profile setup in progress",
        
        // ✅ NEW: Smart badges based on packages
        badges: hasPackages ? ["New Provider", "Packages Available"] : ["New Provider"],
        
        availability: "Contact for availability",
        themes: getThemesFromServiceType(serviceType),
        businessDescription: "",
        
        // ✅ NEW: Smart default packages instead of empty array
        packages: defaultPackages,
        
        portfolioImages: formData.portfolioImages || [],
        portfolioVideos: formData.portfolioVideos || [],
        
        // ✅ NEW: Set complete if packages exist
        isComplete: hasPackages,
        
        createdAt: new Date().toISOString(),
        workingHours: {
          Monday: { active: true, start: "09:00", end: "17:00" },
          Tuesday: { active: true, start: "09:00", end: "17:00" },
          Wednesday: { active: true, start: "09:00", end: "17:00" },
          Thursday: { active: true, start: "09:00", end: "17:00" },
          Friday: { active: true, start: "09:00", end: "17:00" },
          Saturday: { active: true, start: "10:00", end: "16:00" },
          Sunday: { active: false, start: "10:00", end: "16:00" },
        },
        unavailableDates: [],
        busyDates: [],
        availabilityNotes: "",
        advanceBookingDays: 7,
        maxBookingDays: 365
      }
  
      console.log('💾 Final supplier data:', {
        name: supplierData.name,
        serviceType: supplierData.serviceType,
        packagesCount: supplierData.packages.length,
        priceFrom: supplierData.priceFrom,
        priceUnit: supplierData.priceUnit,
        isComplete: supplierData.isComplete
      })
  
      // Insert using NEW multi-business structure
      const { data: newBusiness, error: insertError } = await supabase
        .from("suppliers")
        .insert({
          auth_user_id: userId,
          business_name: supplierData.name,
          business_type: 'primary',
          is_primary: true,
          parent_business_id: null,
          business_slug: businessSlug,
          data: supplierData
        })
        .select()
        .single()
  
      if (insertError) {
        console.error('❌ Supabase insert error:', insertError)
        throw insertError
      }
  
      // Save the real UUID for future queries
      localStorage.setItem('currentSupplierId', newBusiness.id)
  
      console.log('✅ New supplier added to Supabase with id:', newBusiness.id)
      console.log('🎉 Supplier created with', defaultPackages.length, 'smart default packages')
  
      return {
        success: true,
        supplier: {
          id: newBusiness.id,         // Supabase UUID
          ...newBusiness.data         // Flattened profile (same format as before)
        }
      }
  
    } catch (error) {
      console.error('💥 Error adding supplier to Supabase:', error)
      return {
        success: false,
        error: error.message || 'Failed to create supplier account'
      }
    }
  },
  

 
  // ✅ Update supplier using UUID `id`
// ===== 1. REWRITTEN updateSupplierProfile in mockBackend.js =====

updateSupplierProfile: async (supplierId, updatedData, packages = null) => {
  try {
    console.log('🔄 updateSupplierProfile called:', {
      supplierId,
      hasUpdatedData: !!updatedData,
      packagesProvided: packages !== null,
      packagesLength: Array.isArray(packages) ? packages.length : 'not provided'
    })

    // Fetch current supplier data
    const { data: row, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching supplier:', fetchError)
      throw fetchError
    }

    const current = row.data || {}
    console.log('📊 Current supplier data loaded, packages count:', current.packages?.length || 0)

    // ✅ SMART MERGING: Only update fields that are provided
    const shouldUpdatePackages = packages !== null && Array.isArray(packages)
    console.log('📦 Should update packages?:', shouldUpdatePackages)

    const merged = {
      // Core business info
      ...current,
      name: updatedData.name || current.name,
      description: updatedData.businessDescription || updatedData.description || current.description,
      location: updatedData.postcode || updatedData.location || current.location,
      serviceType: updatedData.serviceType || current.serviceType,

      // ✅ PACKAGES: Only update if explicitly provided
      packages: shouldUpdatePackages ? packages : (current.packages || []),

      // Media content
      portfolioImages: updatedData.portfolioImages !== undefined ? updatedData.portfolioImages : (current.portfolioImages || []),
      portfolioVideos: updatedData.portfolioVideos !== undefined ? updatedData.portfolioVideos : (current.portfolioVideos || []),
      coverPhoto: updatedData.coverPhoto !== undefined ? updatedData.coverPhoto : current.coverPhoto,
      image: updatedData.coverPhoto !== undefined ? updatedData.coverPhoto : (updatedData.image !== undefined ? updatedData.image : current.image),
      avatar: updatedData.avatar !== undefined ? updatedData.avatar : current.avatar,

      // Service details - Smart merging
      serviceDetails: updatedData.serviceDetails ? {
        ...current.serviceDetails,
        ...updatedData.serviceDetails,
        // Ensure arrays are properly handled
        addOnServices: updatedData.serviceDetails.addOnServices !== undefined ? 
          updatedData.serviceDetails.addOnServices : (current.serviceDetails?.addOnServices || []),
        ageGroups: updatedData.serviceDetails.ageGroups !== undefined ? 
          updatedData.serviceDetails.ageGroups : (current.serviceDetails?.ageGroups || []),
        themes: updatedData.serviceDetails.themes !== undefined ? 
          updatedData.serviceDetails.themes : (current.serviceDetails?.themes || [])
      } : (current.serviceDetails || {}),

      // Availability and scheduling
      workingHours: updatedData.workingHours || current.workingHours,
      unavailableDates: updatedData.unavailableDates !== undefined ? updatedData.unavailableDates : (current.unavailableDates || []),
      busyDates: updatedData.busyDates !== undefined ? updatedData.busyDates : (current.busyDates || []),
      availabilityNotes: updatedData.availabilityNotes !== undefined ? updatedData.availabilityNotes : (current.availabilityNotes || ''),
      advanceBookingDays: updatedData.advanceBookingDays || current.advanceBookingDays || 7,
      maxBookingDays: updatedData.maxBookingDays || current.maxBookingDays || 365,

      // ✅ PRICING: Only update if packages are being updated
      priceFrom: shouldUpdatePackages ? 
        (packages.length > 0 ? Math.min(...packages.map(p => p.price)) : 0) : 
        (current.priceFrom || 0),
      priceUnit: shouldUpdatePackages ? 
        (packages.length > 0 && packages[0]?.priceType === 'per_child' ? 'per child' : 
         packages.length > 0 && packages[0]?.priceType === 'per_bag' ? 'per bag' : 'per event') : 
        (current.priceUnit || 'per event'),

      // ✅ COMPLETION STATUS: Only update if packages are being updated OR business description is provided
      isComplete: shouldUpdatePackages ? 
        (packages.length > 0 && (updatedData.businessDescription || current.description)) : 
        (updatedData.businessDescription ? (current.packages?.length > 0) : current.isComplete),

      // ✅ BADGES: Only update if packages are being updated
      badges: shouldUpdatePackages ? [
        ...(packages.length > 0 ? ['Packages Available'] : ['New Provider']),
        ...(current.badges || []).filter(b => !['New Provider', 'Packages Available'].includes(b))
      ] : (current.badges || ['New Provider']),

      // Owner/Contact information
      owner: {
        ...current.owner,
        name: updatedData.contactName || updatedData.owner?.name || current.owner?.name,
        email: updatedData.email || updatedData.owner?.email || current.owner?.email,
        phone: updatedData.phone || updatedData.owner?.phone || current.owner?.phone,
        profilePhoto: updatedData.owner?.profilePhoto || current.owner?.profilePhoto,
        firstName: updatedData.owner?.firstName || current.owner?.firstName,
        lastName: updatedData.owner?.lastName || current.owner?.lastName,
        bio: updatedData.owner?.bio || current.owner?.bio,
        dateOfBirth: updatedData.owner?.dateOfBirth || current.owner?.dateOfBirth,
        address: updatedData.owner?.address || current.owner?.address
      },

      // Timestamps
      updatedAt: new Date().toISOString(),
      createdAt: current.createdAt || new Date().toISOString()
    }

    // ✅ LOGGING: What we're about to save
    console.log("💾 About to save merged data:", {
      packagesUpdated: shouldUpdatePackages,
      packagesCount: merged.packages?.length || 0,
      isComplete: merged.isComplete,
      badges: merged.badges,
      serviceDetailsUpdated: !!updatedData.serviceDetails,
      addOnServicesCount: merged.serviceDetails?.addOnServices?.length || 0
    })

    // Save to database
    const { data: updated, error: updateError } = await supabase
      .from('suppliers')
      .update({ data: merged })
      .eq('id', supplierId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Database update error:', updateError)
      throw updateError
    }

    console.log("✅ Supplier updated successfully:", {
      id: updated.id,
      packagesCount: updated.data?.packages?.length || 0,
      isComplete: updated.data?.isComplete,
      addOnServicesCount: updated.data?.serviceDetails?.addOnServices?.length || 0
    })

    return {
      success: true,
      supplier: updated
    }

  } catch (error) {
    console.error('💥 Error updating supplier in Supabase:', error)
    return {
      success: false,
      error: error.message || 'Failed to update supplier profile'
    }
  }
},


}

// Hooks that your components use
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await suppliersAPI.getAllSuppliers()
      setSuppliers(data)

    } catch (err) {
      setError(err.message)
      console.error('useSuppliers error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  return {
    suppliers,
    loading,
    error,
    refetch: loadSuppliers
  }
}

export function useSupplier(supplierId) {
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSupplier = async () => {
    if (!supplierId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
  
      const data = await suppliersAPI.getSupplierById(supplierId)
      setSupplier(data)
 
    } catch (err) {
      setError(err.message)
      console.error('useSupplier error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSupplier()
  }, [supplierId])

  return {
    supplier,
    loading,
    error,
    refetch: loadSupplier
  }
}


export function useSupplierDashboard() {
  const [currentSupplier, setCurrentSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCurrentSupplier = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('📥 useSupplierDashboard loading current supplier...')
        
        // Get current authenticated user
        const { data: userResult, error: userErr } = await supabase.auth.getUser()
        if (userErr) {
          console.error('❌ Auth error:', userErr)
          throw userErr
        }

        const userId = userResult?.user?.id
        if (!userId) {
          console.error('❌ No user ID found')
          throw new Error("No logged-in user")
        }

        console.log('👤 User ID:', userId)

        // Load user's PRIMARY business (for dashboard compatibility)
        const { data: primaryBusiness, error: primaryErr } = await supabase
          .from("suppliers")
          .select(`
            id,
            business_name,
            business_type,
            is_primary,
            data,
            auth_user_id
          `)
          .eq("auth_user_id", userId)
          .eq("is_primary", true)
          .maybeSingle()

        if (primaryErr) {
          console.error('❌ Database error:', primaryErr)
          throw primaryErr
        }

        console.log('🔍 Primary business query result:', primaryBusiness)

        if (!primaryBusiness) {
          console.log('❌ No primary business found for user')
          setError('No supplier account found - please complete onboarding first')
          setCurrentSupplier(null)
        } else {
          // ✅ Enhanced validation and logging
          console.log('📊 Primary business raw data:', {
            id: primaryBusiness.id,
            business_name: primaryBusiness.business_name,
            has_data: !!primaryBusiness.data,
            data_keys: primaryBusiness.data ? Object.keys(primaryBusiness.data) : 'No data object'
          })

          // Check if the data object exists and has essential fields
          if (!primaryBusiness.data) {
            console.warn('⚠️ Primary business has no data object')
            setError('Incomplete supplier account - please complete setup')
            setCurrentSupplier(null)
            return
          }

          // Convert NEW database format to OLD dashboard format
          const supplierForDashboard = {
            id: primaryBusiness.id, // Use the real UUID
            ...primaryBusiness.data // Spread all the business data
          }
          
          console.log('✅ Supplier for dashboard:', {
            id: supplierForDashboard.id,
            name: supplierForDashboard.name,
            owner: supplierForDashboard.owner,
            serviceType: supplierForDashboard.serviceType
          })
          
          setCurrentSupplier(supplierForDashboard)
          console.log('✅ Loaded primary business for dashboard:', supplierForDashboard.name)
        }
      } catch (err) {
        console.error('❌ Error loading current supplier:', err)
        setError(err.message || 'Failed to load supplier data')
        setCurrentSupplier(null)
      } finally {
        setLoading(false)
      }
    }

    loadCurrentSupplier()
  }, [])

  // Function to update the supplier profile - UPDATED for new structure
// Replace your updateSupplierProfile function in mockBackend.js with this:


const updateProfile = async (profileData, packages = null, specificBusinessId = null) => {
  if (!currentSupplier) {
    console.warn("⚠️ No currentSupplier in updateProfile")
    return { success: false, error: 'No current supplier loaded' }
  }

  console.log('🎯 updateProfile called:', {
    hasProfileData: !!profileData,
    packagesProvided: packages !== null,
    packagesLength: Array.isArray(packages) ? packages.length : 'not provided',
    specificBusinessId,
    currentSupplierId: currentSupplier.id
  })

  setSaving(true)
  setError(null)

  try {
    // Determine which business to update
    const businessIdToUpdate = specificBusinessId || currentSupplier.id
    console.log('🎯 Targeting business ID:', businessIdToUpdate)

    // Call the updated API function
    const result = await suppliersAPI.updateSupplierProfile(
      businessIdToUpdate,
      profileData,
      packages  // null means "don't update packages", array means "update packages"
    )

    console.log('📦 updateSupplierProfile result:', {
      success: result.success,
      error: result.error,
      packagesInResult: result.supplier?.data?.packages?.length || 0
    })

    if (result.success && result.supplier) {
      // Update local state with the result
      const updatedSupplierForDashboard = {
        id: result.supplier.id,
        ...result.supplier.data
      }
      
      setCurrentSupplier(updatedSupplierForDashboard)
      console.log('🎉 Local state updated successfully:', {
        businessId: businessIdToUpdate,
        packagesCount: updatedSupplierForDashboard.packages?.length || 0,
        isComplete: updatedSupplierForDashboard.isComplete
      })

      // Trigger global update event
      window.dispatchEvent(new CustomEvent('supplierUpdated', {
        detail: { supplierId: result.supplier.id }
      }))
    }

    return result

  } catch (error) {
    console.error("❌ updateProfile error:", error)
    setError(error.message)
    return { success: false, error: error.message }
  } finally {
    setSaving(false)
  }
}
  return {
    currentSupplier,
    loading,
    saving,
    error,
    updateProfile
  }
}