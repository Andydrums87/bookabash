// lib/suppliers-api.js - Server-side data fetching using your existing backend (Pure JavaScript)
import { cache } from 'react'
import { supabase } from '@/lib/supabase'

// Cache the function to avoid duplicate requests during SSR
export const getSuppliers = cache(async () => {
  try {
    console.log('🔍 [SSR] Fetching suppliers from database...')
    
    // Use your existing Supabase setup to get suppliers
    const { data: supplierRecords, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true) // Assuming you have an is_active column
      .order('created_at', { ascending: false })
      .limit(100) // Reasonable limit for SSR

    if (error) {
      console.error('❌ [SSR] Database error:', error)
      // Return your mock data as fallback
      return getMockSuppliers()
    }

    if (!supplierRecords || supplierRecords.length === 0) {
      console.log('⚠️ [SSR] No suppliers in database, using mock data')
      return getMockSuppliers()
    }

    console.log(`✅ [SSR] Found ${supplierRecords.length} suppliers in database`)

    // Transform your database records to match the expected interface
    const transformedSuppliers = supplierRecords.map(record => transformSupplierRecord(record))
    
    // Filter out any invalid records
    const validSuppliers = transformedSuppliers.filter(supplier => 
      supplier && supplier.name && supplier.id
    )

    console.log(`✅ [SSR] Transformed ${validSuppliers.length} valid suppliers`)

    // If we have valid suppliers, return them; otherwise fallback to mock
    return validSuppliers.length > 0 ? validSuppliers : getMockSuppliers()
    
  } catch (error) {
    console.error('❌ [SSR] Exception fetching suppliers:', error)
    // Return mock data as fallback
    return getMockSuppliers()
  }
})

// Transform your database record to match the Supplier interface
function transformSupplierRecord(record) {
  try {
    const supplierData = record.data || record // Handle both nested and flat structures
    
    // Skip if missing essential data
    if (!supplierData.businessName && !supplierData.name) {
      console.log('⚠️ [SSR] Skipping supplier with no name:', record.id)
      return null
    }

    return {
      id: record.id,
      name: supplierData.businessName || supplierData.name || 'Unnamed Supplier',
      description: supplierData.description || 'Professional party supplier',
      category: supplierData.category || 'Entertainment',
      subcategory: supplierData.subcategory || null,
      location: supplierData.location || 'London',
      priceFrom: parseInt(supplierData.priceFrom) || parseInt(supplierData.price) || 100,
      priceUnit: supplierData.priceUnit || 'per event',
      rating: parseFloat(supplierData.rating) || 4.5,
      reviewCount: parseInt(supplierData.reviewCount) || 10,
      themes: Array.isArray(supplierData.themes) ? supplierData.themes : ['general'],
      image: supplierData.image || supplierData.coverPhoto || '/placeholder.jpg',
      availability: supplierData.availability || 'Available',
      badges: Array.isArray(supplierData.badges) ? supplierData.badges : ['Verified'],
      bookingCount: parseInt(supplierData.bookingCount) || 0,
      packages: supplierData.packages || [],
      portfolioImages: supplierData.portfolioImages || [],
      portfolioVideos: supplierData.portfolioVideos || [],
      coverPhoto: supplierData.coverPhoto || supplierData.image,
      workingHours: supplierData.workingHours,
      unavailableDates: supplierData.unavailableDates || [],
      busyDates: supplierData.busyDates || [],
      availabilityNotes: supplierData.availabilityNotes,
      advanceBookingDays: parseInt(supplierData.advanceBookingDays) || 7,
      maxBookingDays: parseInt(supplierData.maxBookingDays) || 365,
      serviceDetails: supplierData.serviceDetails,
      stats: supplierData.stats,
      ownerName: supplierData.ownerName,
      owner: supplierData.owner,
      verified: supplierData.verified !== false, // Default to true
      fastResponder: supplierData.fastResponder !== false,
      responseTime: supplierData.responseTime || 'Within 24 hours',
      phone: supplierData.phone || '+44 7xxx xxx xxx',
      email: supplierData.email || 'hello@supplier.co.uk',
      activeSince: supplierData.activeSince || '2020'
    }
  } catch (error) {
    console.error('❌ [SSR] Error transforming supplier record:', error, record.id)
    return null
  }
}

// Get individual supplier by ID
export const getSupplierById = cache(async (id) => {
  try {
    console.log('🔍 [SSR] Fetching supplier by ID:', id)
    
    // First try to get from database
    const { data: supplierRecord, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && supplierRecord) {
      console.log('✅ [SSR] Found supplier in database:', supplierRecord.id)
      return transformSupplierRecord(supplierRecord)
    }

    console.log('⚠️ [SSR] Supplier not found in database, trying mock data')
    
    // Fallback to mock data
    const allSuppliers = getMockSuppliers()
    const mockSupplier = allSuppliers.find(supplier => supplier.id === id)
    
    if (mockSupplier) {
      console.log('✅ [SSR] Found supplier in mock data')
      return mockSupplier
    }

    console.log('❌ [SSR] Supplier not found anywhere:', id)
    return null

  } catch (error) {
    console.error('❌ [SSR] Error fetching supplier by ID:', error)
    return null
  }
})

// Get related suppliers in same category
export const getRelatedSuppliers = cache(async (category, excludeId) => {
  try {
    const allSuppliers = await getSuppliers()
    return allSuppliers
      .filter(supplier => 
        supplier.category.toLowerCase() === category.toLowerCase() && 
        supplier.id !== excludeId
      )
      .slice(0, 4) // Limit to 4 related suppliers
  } catch (error) {
    console.error('❌ [SSR] Error fetching related suppliers:', error)
    return []
  }
})

// Get popular suppliers for static generation
export const getPopularSuppliers = cache(async (limit = 50) => {
  try {
    const allSuppliers = await getSuppliers()
    // Sort by rating and review count to get most popular
    return allSuppliers
      .sort((a, b) => {
        const scoreA = a.rating * Math.log(a.reviewCount + 1)
        const scoreB = b.rating * Math.log(b.reviewCount + 1)
        return scoreB - scoreA
      })
      .slice(0, limit)
  } catch (error) {
    console.error('❌ [SSR] Error fetching popular suppliers:', error)
    return []
  }
})

// Get suppliers by category
export const getSuppliersByCategory = cache(async (category) => {
  const allSuppliers = await getSuppliers()
  if (category === 'all') return allSuppliers
  return allSuppliers.filter(supplier => 
    supplier.category.toLowerCase() === category.toLowerCase()
  )
})

// Your mock data as fallback - using your existing supplier from the code
function getMockSuppliers() {
  return [
    {
      id: "50a14c17-3411-42c4-87ae-4bb483d9bde9",
      name: "Magic Mike's Parties",
      description: "Professional magician specializing in children's birthday parties with amazing tricks and interactive shows",
      category: "Entertainment",
      subcategory: "Magicians", 
      location: "Central London",
      priceFrom: 150,
      priceUnit: "per hour",
      rating: 4.8,
      reviewCount: 127,
      themes: ["princess", "superhero", "magic"],
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753435484/zivotubsexikuudyl55r.jpg",
      availability: "Available",
      badges: ["Verified", "Top Rated"],
      bookingCount: 89,
      verified: true,
      fastResponder: true,
      responseTime: "Within 2 hours",
      phone: "+44 7123 456 789",
      email: "hello@magicmike.co.uk",
      activeSince: "2020",
      packages: [
        {
          id: "basic",
          name: "Basic Magic Show",
          price: 150,
          duration: "45 minutes",
          features: ["Magic show", "Balloon animals", "Up to 15 children"],
          description: "Perfect starter package for smaller parties"
        },
        {
          id: "premium", 
          name: "Premium Magic Experience",
          price: 225,
          duration: "60 minutes", 
          features: ["Extended magic show", "Balloon animals", "Face painting", "Up to 25 children"],
          description: "Our most popular package with extra entertainment"
        },
        {
          id: "deluxe",
          name: "Deluxe Magic Spectacular", 
          price: 300,
          duration: "90 minutes",
          features: ["Full magic show", "Balloon modelling workshop", "Face painting", "Party games", "Up to 35 children"],
          description: "The ultimate magical experience for larger celebrations"
        }
      ],
      portfolioImages: [
        {
          id: "magic-1",
          title: "Magic Show in Action",
          image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753435484/zivotubsexikuudyl55r.jpg",
          alt: "Magician performing for children"
        }
      ],
      serviceDetails: {
        certifications: {
          dbsCertificate: true,
          publicLiability: true,
          firstAid: true
        }
      }
    },
    {
      id: "2",
      name: "Bounce Castle Kingdom",
      description: "Premium bouncy castle rentals with safety-first approach and amazing themed castles",
      category: "Bouncy Castles",
      location: "North London",
      priceFrom: 80,
      priceUnit: "per day",
      rating: 4.6,
      reviewCount: 203,
      themes: ["princess", "superhero", "unicorn", "pirate"],
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594952/bouncy-castle_gaq0z4.png",
      availability: "Available",
      badges: ["Verified", "Safety Certified"],
      bookingCount: 156,
      verified: true,
      fastResponder: true,
      responseTime: "Within 1 hour",
      phone: "+44 7234 567 890",
      email: "hello@bouncekingdom.co.uk",
      activeSince: "2019"
    },
    {
      id: "3", 
      name: "Face Paint Fantasy",
      description: "Professional face painters creating magical transformations for children's parties",
      category: "Face Painting",
      location: "South London",
      priceFrom: 60,
      priceUnit: "per hour",
      rating: 4.9,
      reviewCount: 89,
      themes: ["princess", "superhero", "animals", "fairy"],
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1750170767/hlz6iinsgj7abeu0nndx.png",
      availability: "Available",
      badges: ["Verified", "Highly Rated"],
      bookingCount: 67,
      verified: true,
      fastResponder: true,
      responseTime: "Within 3 hours",
      phone: "+44 7345 678 901",
      email: "hello@facepaintfantasy.co.uk",
      activeSince: "2021"
    },
    // Add more mock suppliers as needed...
  ]
}

// Generate sitemap data for all suppliers
export const getAllSuppliersForSitemap = cache(async () => {
  try {
    const suppliers = await getSuppliers()
    return suppliers.map(supplier => ({
      id: supplier.id,
      updatedAt: new Date() // In real app, use actual update timestamp
    }))
  } catch (error) {
    console.error('❌ [SSR] Error fetching suppliers for sitemap:', error)
    return []
  }
})