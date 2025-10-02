// utils/mockBackend.js
// Clean version with proper async handling
import { useRef } from 'react';
import { supabase } from '@/lib/supabase'
import { create } from 'canvas-confetti';
import { useState, useEffect } from 'react';
import { calculateProfileCompletion } from './profileCompletion'



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

    const themedData = {
      // ONLY inherit operational data
      workingHours: inheritedData.workingHours,
      unavailableDates: inheritedData.unavailableDates,
      busyDates: inheritedData.busyDates,
      availabilityNotes: inheritedData.availabilityNotes,
      advanceBookingDays: inheritedData.advanceBookingDays,
      maxBookingDays: inheritedData.maxBookingDays,
      owner: inheritedData.owner,
      location: inheritedData.location,
      avatar: inheritedData.avatar,
      verification: inheritedData.verification || {
        status: 'not_started',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        expiresAt: null,
        documents: {
          dbs: { status: 'not_submitted', documentUrl: null, metadata: {}, submittedAt: null, reviewFeedback: null },
          identity: { status: 'not_submitted', documentUrl: null, metadata: {}, submittedAt: null, reviewFeedback: null },
          address: { status: 'not_submitted', documentUrl: null, metadata: {}, submittedAt: null, reviewFeedback: null },
          insurance: { status: 'not_submitted', documentUrl: null, metadata: {}, submittedAt: null, reviewFeedback: null, required: false }
        },
        auditLog: [],
        adminNotes: '',
        verificationLevel: 'none'
      },
      isVerified: inheritedData.isVerified || false,    
      // FRESH business-specific data
      name: themedBusinessData.name,
      description: '',  // Empty - needs completion
      serviceType: themedBusinessData.serviceType,
      category: themedBusinessData.serviceType === 'venue' ? 'Venues' : 
           themedBusinessData.serviceType === 'catering' ? 'Catering' :
           themedBusinessData.serviceType === 'entertainer' ? 'Entertainment' :
           'Entertainment', // Default fallback
      themes: [themedBusinessData.theme],
      
      // EMPTY arrays/objects that need completion
      packages: [],  // Each business creates own packages
      addOnServices: [],  // Each business has own add-ons
      serviceDetails: {},  // Each business sets own service details
      portfolioImages: [],
      portfolioVideos: [],
      coverPhoto: '/placeholder.svg?height=400&width=800&text=Cover+Photo',
      image: '/placeholder.svg?height=300&width=400&text=' + encodeURIComponent(themedBusinessData.name),
      
      // Reset metrics
      rating: 0,
      reviewCount: 0, 
      bookingCount: 0,
      isComplete: false,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('🔍 NEW THEMED BUSINESS DATA BEING CREATED:', {
      'name': themedData.name,
      'serviceDetails empty?': Object.keys(themedData.serviceDetails || {}).length === 0,
      'has hourlyRate?': !!themedData.serviceDetails?.pricing?.hourlyRate,
      'has venueType?': !!themedData.serviceDetails?.venueType,
      'has aboutUs?': !!themedData.serviceDetails?.aboutUs,
      'portfolioImages count': themedData.portfolioImages?.length || 0,
      'coverPhoto': themedData.coverPhoto?.includes('placeholder') ? 'placeholder' : 'real'
    });

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

// Updated generateVenuePackages function with dynamic image and duration

// Replace the existing generateVenuePackages function in mockBackend.js

 const generateVenuePackages = (venueServiceDetails, supplierData = null) => {
  const hourlyRate = venueServiceDetails.pricing?.hourlyRate || 0
  const minimumHours = venueServiceDetails.availability?.minimumBookingHours || 4
  const setupTime = 1 // Always 1 hour
  const cleanupTime = 1 // Always 1 hour
  const capacity = venueServiceDetails.capacity?.max || 50
  const venueType = venueServiceDetails.venueType || 'Venue'
  
  console.log('🏢 Generating venue packages with:', {
    hourlyRate,
    minimumHours,
    setupTime,
    cleanupTime,
    totalHours: minimumHours + setupTime + cleanupTime
  })

  if (hourlyRate <= 0) {
    console.warn('⚠️ Cannot generate venue packages: No hourly rate set')
    return []
  }

  const totalVenueHours = minimumHours + setupTime + cleanupTime
  const packagePrice = hourlyRate * totalVenueHours
  
  // Use portfolio image if available, fallback to default venue image
  const packageImage = supplierData?.portfolioImages?.length > 0 
    ? supplierData.portfolioImages[0] 
    : "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361706/xpqvbguxzwdbtxnez0ew.png"

  const venuePackage = {
    id: "venue-standard",
    name: `${minimumHours}-Hour Party Package`,
    price: packagePrice,
    duration: `${minimumHours} hours party time`,
    priceType: "flat",
    features: [
      `${minimumHours} hours party time`,
      "1 hour setup time included",
      "1 hour cleanup time included", 
      `Total venue access: ${totalVenueHours} hours`,
      `Accommodates up to ${capacity} guests`,
      "Tables and chairs included",
      `Additional hours: £${hourlyRate}/hour`
    ],
    description: `Perfect for children's birthday parties. ${minimumHours}-hour celebration with setup and cleanup time included.`,
    image: packageImage,
    popular: true,
    venueSpecific: true,
    isGenerated: true,
    
    // Enhanced pricing breakdown for transparency
    pricing: {
      hourlyRate: hourlyRate,
      partyHours: minimumHours,
      setupHours: setupTime,
      cleanupHours: cleanupTime,
      totalHours: totalVenueHours,
      calculation: `£${hourlyRate} × ${totalVenueHours} hours = £${packagePrice}`,
      breakdown: {
        partyTime: `${minimumHours} hours × £${hourlyRate} = £${minimumHours * hourlyRate}`,
        setupTime: `${setupTime} hour × £${hourlyRate} = £${setupTime * hourlyRate}`,
        cleanupTime: `${cleanupTime} hour × £${hourlyRate} = £${cleanupTime * hourlyRate}`,
        total: `Total: £${packagePrice}`
      }
    }
  }

  console.log('✅ Generated venue package:', {
    name: venuePackage.name,
    price: venuePackage.price,
    duration: venuePackage.duration,
    totalHours: totalVenueHours
  })

  return [venuePackage]
}



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

  
      // Helper function for themes (keep your existing logic)
      const getThemesFromServiceType = (serviceType) => {
        const themeMapping = {
          'magician': ['magic', 'superhero', 'general'],
          'clown': ['circus', 'comedy', 'general'],
          'entertainer': ['general', 'superhero', 'princess'],
          'dj': ['music', 'dance', 'general'],
          'musician': ['music', 'taylor-swift', 'general'],
          'face-painting': ['general', 'superhero', 'princess'],
          'cakes' : ['cakes'],
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
      
 
      const defaultPackages = getDefaultPackagesForServiceType(serviceType, selectedTheme)
  
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
         // ADD THIS VERIFICATION STRUCTURE:
  verification: {
    status: 'not_started', // not_started | pending | verified | rejected | expired
    submittedAt: null,
    reviewedAt: null,
    reviewedBy: null,
    expiresAt: null,
    
    documents: {
      dbs: {
        status: 'not_submitted',
        documentUrl: null,
        metadata: {
          certificateNumber: '',
          issueDate: '',
          expiryDate: '',
          level: 'enhanced'
        },
        submittedAt: null,
        reviewFeedback: null
      },
      
      identity: {
        status: 'not_submitted',
        documentUrl: null,
        metadata: {
          documentType: 'passport',
          documentNumber: '',
          fullName: '',
          dateOfBirth: ''
        },
        submittedAt: null,
        reviewFeedback: null
      },
      
      address: {
        status: 'not_submitted',
        documentUrl: null,
        metadata: {
          documentType: 'utility_bill',
          address: '',
          documentDate: ''
        },
        submittedAt: null,
        reviewFeedback: null
      },
      
      insurance: {
        status: 'not_submitted',
        documentUrl: null,
        metadata: {
          policyNumber: '',
          provider: '',
          coverageAmount: '',
          expiryDate: ''
        },
        submittedAt: null,
        reviewFeedback: null,
        required: false
      }
    },
    
    auditLog: [],
    adminNotes: '',
    verificationLevel: 'none'
  },
  isVerified: false,
        subcategory: serviceType,
        serviceType: serviceType,
        image: "/placeholder.png",
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
        maxBookingDays: 365,
          // ADD THIS:
  googleCalendarSync: {
    enabled: false,
    connected: false,
    accessToken: null, // encrypted
    refreshToken: null, // encrypted  
    calendarId: 'primary',
    syncFrequency: 'daily',
    filterMode: 'all-day-events',
    lastSync: null,
    syncedEvents: []
  },
      }
  
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
    console.log('UPDATE PROFILE CALLED WITH:', {
      supplierId,
      updatedData,
      packages,
      serviceDetailsReceived: updatedData.serviceDetails
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

     // 🆕 NEW: Determine if this is a primary business
     const isPrimary = row.is_primary === true
    
     console.log('📝 Updating business:', {
       id: supplierId,
       name: current.name,
       isPrimary,
       businessType: row.business_type
     })


    // ✅ SMART MERGING: Only update fields that are provided
    const shouldUpdatePackages = packages !== null && Array.isArray(packages)
  

    const merged = {
      // Core business info
      ...current,
      name: updatedData.name || current.name,
      description: updatedData.businessDescription || updatedData.description || current.description,
      aboutUs: updatedData.aboutUs || current.aboutUs, // Add this field
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
      weekendPremium: updatedData.weekendPremium !== undefined ? updatedData.weekendPremium : (current.weekendPremium || { enabled: false, type: 'percentage', amount: 25 }), // ADD THIS LINE
 // ADD THIS:
 googleCalendarSync: updatedData.googleCalendarSync !== undefined ? updatedData.googleCalendarSync : (current.googleCalendarSync || {
  enabled: false,
  connected: false,
  accessToken: null,
  refreshToken: null,
  calendarId: 'primary',
  syncFrequency: 'daily',
  filterMode: 'all-day-events',
  lastSync: null,
  syncedEvents: [],
   // PRESERVE verification data unless explicitly updating it
   verification: updatedData.verification !== undefined ? 
   updatedData.verification : (current.verification || {
     status: 'not_started',
     submittedAt: null,
     reviewedAt: null,
     reviewedBy: null,
     expiresAt: null,
     documents: {
       dbs: { status: 'not_submitted', documentUrl: null, metadata: {}, submittedAt: null, reviewFeedback: null },
       identity: { status: 'not_submitted', documentUrl: null, metadata: {}, submittedAt: null, reviewFeedback: null },
       address: { status: 'not_submitted', documentUrl: null, metadata: {}, submittedAt: null, reviewFeedback: null },
       insurance: { status: 'not_submitted', documentUrl: null, metadata: {}, submittedAt: null, reviewFeedback: null, required: false }
     },
     auditLog: [],
     adminNotes: '',
     verificationLevel: 'none'
   }),
   isVerified: updatedData.isVerified !== undefined ? 
    updatedData.isVerified : (current.isVerified || false),
}),
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
      notifications: updatedData.notifications ? {
        ...current.notifications,
        ...updatedData.notifications
      } : (current.notifications || {}),
      // Timestamps
      updatedAt: new Date().toISOString(),
      createdAt: current.createdAt || new Date().toISOString()
    }
    const businessType = merged.serviceType || merged.category
    const completion = calculateProfileCompletion(merged, businessType, isPrimary)
    
    // Override with banner calculation if available
    if (typeof window !== 'undefined' && window.currentBannerCompletion) {
      completion.percentage = window.currentBannerCompletion.percentage
      completion.canGoLive = window.currentBannerCompletion.canGoLive
    }


    console.log('📊 Profile completion calculated:', {
      businessType,
      isPrimary,
      percentage: completion.percentage,
      canGoLive: completion.canGoLive,
      missingFields: completion.missingFields.map(f => f.field)
    })


          // 🆕 NEW: Add completion data to merged object
    merged.profileCompletionPercentage = completion.percentage
    merged.canGoLive = completion.canGoLive
    // 🆕 UPDATED: Different status logic for primary vs themed
  merged.profileStatus = completion.canGoLive ? 'ready_for_review' : 'draft'

  console.log('DEBUG COMPLETION CALCULATION:', {
    businessType,
    isPrimary,
    supplierDataFields: Object.keys(merged),
    aboutUs: merged.aboutUs?.length || 'missing',
    extraHourRate: merged.extraHourRate || 'missing',
    portfolioImages: merged.portfolioImages?.length || 'missing',
    dbsStatus: merged.verification?.documents?.dbs?.status || 'missing',
    calculatedCompletion: completion
  })
 // Save to database (PRIMARY BUSINESS)
const { data: updated, error: updateError } = await supabase
.from('suppliers')
.update({ 
  data: merged,
  profile_completion_percentage: completion.percentage,
  can_go_live: completion.canGoLive,
  // Preserve live status if already live, otherwise use completion logic
  profile_status: row.profile_status === 'live' ? 'live' : 
                 (completion.canGoLive ? 'ready_for_review' : 'draft')
})
.eq('id', supplierId)
.select()
.single()

    if (updateError) {
      console.error('❌ Database update error:', updateError)
      throw updateError
    }

    // 🚨 CRITICAL FIX: Update all themed businesses if this is a primary business
    if (row.is_primary) {
      console.log('🔄 INHERITANCE: This is a primary business, updating themed businesses')
      
      try {
        // Find all themed businesses that belong to this primary business
        const { data: themedBusinesses, error: themedError } = await supabase
          .from('suppliers')
          .select('*')
          .eq('parent_business_id', supplierId)
          .eq('is_primary', false)

        if (themedError) {
          console.error('⚠️ INHERITANCE: Error fetching themed businesses:', themedError)
          // Don't throw - primary business was updated successfully
        } else {
       
          
          // Update each themed business with availability data
          for (const themedBusiness of themedBusinesses) {
  
            
            const currentThemedData = themedBusiness.data || {}
            
            // Only copy availability-related data to themed businesses
            const availabilityData = {
              workingHours: merged.workingHours,
              unavailableDates: merged.unavailableDates,
              busyDates: merged.busyDates,
              availabilityNotes: merged.availabilityNotes,
              advanceBookingDays: merged.advanceBookingDays,
              maxBookingDays: merged.maxBookingDays,
              weekendPremium: merged.weekendPremium, // ADD THIS LINE
              googleCalendarSync: merged.googleCalendarSync,
              availabilityVersion: merged.availabilityVersion || '2.0',
              lastUpdated: merged.updatedAt,
              // Mark as inherited for debugging
              _availabilityInheritedFrom: supplierId,
              _availabilityInheritedAt: new Date().toISOString()
            }
            
            const updatedThemedData = {
              ...currentThemedData,
              ...availabilityData,
              updatedAt: new Date().toISOString()
            }
            
            // Update the themed business
            const { error: themedUpdateError } = await supabase
              .from('suppliers')
              .update({ data: updatedThemedData })
              .eq('id', themedBusiness.id)
            
            if (themedUpdateError) {
              console.error(`❌ INHERITANCE: Failed to update themed business ${themedBusiness.business_name}:`, themedUpdateError)
              // Continue with other themed businesses
            } else {
              console.log(`✅ INHERITANCE: Successfully updated themed business: ${themedBusiness.business_name}`)
            }
          }
          
          console.log('✅ INHERITANCE: All themed businesses updated successfully')
        }
      } catch (inheritanceError) {
        console.error('❌ INHERITANCE: Error in themed business update process:', inheritanceError)
        // Don't throw - primary business was updated successfully, this is just inheritance
      }
    } else {
      console.log('ℹ️ INHERITANCE: This is a themed business, no inheritance needed')
    }

    return {
      success: true,
  supplier: {
    id: updated.id,
    profile_status: updated.profile_status,    // Include database fields
    can_go_live: updated.can_go_live,
    profile_completion_percentage: updated.profile_completion_percentage,
    data: updated.data,
    isPrimary, // 🆕 NEW: Include isPrimary in response
  },
  completion
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

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const loadSuppliersRef = useRef(null)

  loadSuppliersRef.current = async () => {
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
    loadSuppliersRef.current()
    
    const subscription = supabase
      .channel('suppliers-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'suppliers' },
        (payload) => {
          console.log('Supplier data updated, refreshing...')
          loadSuppliersRef.current()
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    suppliers,
    loading,
    error,
    refetch: () => loadSuppliersRef.current()
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


// In your mockBackend.js - REPLACE the useSupplierDashboard hook

export function useSupplierDashboard() {
  const [currentSupplier, setCurrentSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

    // ADD THIS: Prevent multiple simultaneous loads
    const isLoadingRef = useRef(false)
    const loadedBusinessIdRef = useRef(null)

  useEffect(() => {
    const loadCurrentSupplier = async () => {
      try {
        setLoading(true)
        setError(null)
  
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
  
        // Get the currently selected business from localStorage
        const selectedBusinessId = localStorage.getItem('selectedBusinessId')
        
        let businessToLoad = null
  
        if (selectedBusinessId) {
          // Load the specific selected business
          console.log('🎯 Loading selected business:', selectedBusinessId)
          const { data: selectedBusiness, error: selectedErr } = await supabase
            .from("suppliers")
            .select(`*`)
            .eq("id", selectedBusinessId)
            .eq("auth_user_id", userId)
            .single()
  
          if (!selectedErr && selectedBusiness) {
            console.log('✅ Found selected business:', selectedBusiness.business_name)
            businessToLoad = selectedBusiness
          } else {
            console.warn('⚠️ Selected business not found, falling back to primary')
          }
        }
  
        // Fallback to primary business if no specific business selected or not found
        if (!businessToLoad) {
          console.log('🏢 Loading primary business as fallback')
          const { data: primaryBusiness, error: primaryErr } = await supabase
            .from("suppliers")
            .select(`*`)
            .eq("auth_user_id", userId)
            .eq("is_primary", true)
            .maybeSingle()
  
          if (primaryErr) {
            console.error('❌ Database error:', primaryErr)
            throw primaryErr
          }
  
          if (!primaryBusiness) {
            setError('No supplier account found - please complete onboarding first')
            setCurrentSupplier(null)
            return
          }
  
          businessToLoad = primaryBusiness
        }
  
        // Check if the data object exists and has essential fields
        if (!businessToLoad.data) {
          console.warn('⚠️ Business has no data object')
          setError('Incomplete supplier account - please complete setup')
          setCurrentSupplier(null)
          return
        }
  
        console.log('📊 Business to load:', {
          'id': businessToLoad.id,
          'name': businessToLoad.business_name,
          'is_primary': businessToLoad.is_primary,
          'profile_status': businessToLoad.profile_status,
          'can_go_live': businessToLoad.can_go_live,
          'completion_%': businessToLoad.profile_completion_percentage
        })
  
        // Use the actually selected business data
        const supplierForDashboard = {
          id: businessToLoad.id,
          ...businessToLoad.data, // Spread data first
          // Database values override JSON data values
          profile_status: businessToLoad.profile_status,
          can_go_live: businessToLoad.can_go_live,
          profile_completion_percentage: businessToLoad.profile_completion_percentage,
          // Also override any conflicting properties in the data object
          profileStatus: businessToLoad.profile_status,
          canGoLive: businessToLoad.can_go_live,
          profileCompletionPercentage: businessToLoad.profile_completion_percentage,
          // Add business metadata
          isPrimary: businessToLoad.is_primary,
          businessType: businessToLoad.business_type,
          parentBusinessId: businessToLoad.parent_business_id
        }
  
      
  
        setCurrentSupplier(supplierForDashboard)
  
      } catch (err) {
        console.error('❌ Error loading current supplier:', err)
        setError(err.message || 'Failed to load supplier data')
        setCurrentSupplier(null)
      } finally {
        setLoading(false)
      }
    }
  
    // Load initially
    loadCurrentSupplier()
  
    // Listen for business switches
    const handleBusinessSwitch = (event) => {
      console.log('🔄 Dashboard detected business switch, reloading data...')
      loadCurrentSupplier()
    }
  
    // ✅ NEW: Listen for supplier data updates
    const handleDataRefresh = (event) => {
      console.log('🔄 Dashboard detected supplier data update, reloading...', event.detail)
      loadCurrentSupplier()
    }
  
    // Add both event listeners
    window.addEventListener('businessSwitched', handleBusinessSwitch)
    window.addEventListener('supplierDataUpdated', handleDataRefresh) // This is the key one!
  
    // Cleanup listeners
    return () => {
      window.removeEventListener('businessSwitched', handleBusinessSwitch)
      window.removeEventListener('supplierDataUpdated', handleDataRefresh)
    }
  }, []) // No dependencies - listens to events instead

// In your updateProfile function in useSupplierDashboard, REPLACE the existing function with this:

const updateProfile = async (profileData, packages = null, specificBusinessId = null) => {
  if (!currentSupplier) {
    console.warn("⚠️ No currentSupplier in updateProfile")
    return { success: false, error: 'No current supplier loaded' }
  }

  setSaving(true)
  setError(null)

  try {
    // Determine which business to update
    const businessIdToUpdate = specificBusinessId || currentSupplier.id

    // Call the updated API function
    const result = await suppliersAPI.updateSupplierProfile(
      businessIdToUpdate,
      profileData,
      packages  // null means "don't update packages", array means "update packages"
    )
    
    if (result.success && result.supplier) {
      const updatedSupplierForDashboard = {
        id: result.supplier.id,
        profile_status: result.supplier.profile_status,
        can_go_live: result.supplier.can_go_live,
        profile_completion_percentage: result.supplier.profile_completion_percentage,
        ...result.supplier.data
      }
      
      // ✅ CRITICAL FIX: Update the local state immediately
      setCurrentSupplier(updatedSupplierForDashboard)
      
      if (result.completion) {
        console.log('Profile completion updated:', {
          percentage: result.completion.percentage,
          canGoLive: result.completion.canGoLive,
          missingFields: result.completion.missingFields.length
        })
      }

      // ✅ NEW: Force re-render of all components that depend on supplier data
      window.dispatchEvent(new CustomEvent('supplierDataUpdated', {
        detail: { 
          supplierId: result.supplier.id,
          completion: result.completion,
          updatedData: updatedSupplierForDashboard
        }
      }))

      console.log('🔄 Supplier data updated, dispatched refresh event')
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

export { generateVenuePackages }