// /api/admin/seed/face-painting/route.js
// Seeds a face painting supplier with themed packages to the database

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request) {
  try {
    // Simple auth check - in production you'd want proper admin auth
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SEED_KEY}`) {
      // For development, allow without auth if no key is set
      if (process.env.ADMIN_SEED_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const facePaintingSupplier = {
      business_name: 'Fabulous Faces',
      business_type: 'seeded',
      is_primary: true,
      parent_business_id: null,
      business_slug: `fabulous-faces-${Date.now().toString().slice(-6)}`,
      is_active: true,
      profile_status: 'live',
      can_go_live: true,
      profile_completion_percentage: 100,
      data: {
        name: 'Fabulous Faces',
        category: 'facePainting',
        serviceType: 'facePainting',
        description: 'Professional face painting for children\'s parties. We bring the magic with themed design collections that transform kids into their favourite characters.',
        location: 'St Albans, Hertfordshire',
        priceFrom: 150,
        priceUnit: 'per party',
        rating: 4.9,
        reviewCount: 47,
        bookingCount: 156,
        badges: ['Top Rated', 'Quick Response'],

        // Cover photo for the supplier card
        coverPhoto: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
        image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',

        // Service details
        serviceDetails: {
          aboutUs: 'With over 10 years of experience painting little faces, we specialise in creating magical moments at children\'s parties. Our professional, hypoallergenic paints are safe for sensitive skin, and we bring all our own equipment. Each design takes 3-7 minutes depending on complexity, so everyone gets a turn!',
          paintsUsed: 'FDA-approved, hypoallergenic, water-based paints',
          avgTimePerChild: '3-7 minutes per design',
          maxChildren: 'Approximately 15-20 children per hour',
          equipmentProvided: true,
          setupRequirements: 'Small table and chair, good lighting preferred',
        },

        // Themed packages - each with unique image
        packages: [
          {
            id: 'superhero',
            name: 'Superhero Collection',
            price: 150,
            duration: '2 hours',
            priceType: 'flat',
            image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=800',
            description: 'Epic masks and hero designs that\'ll make every kid feel super!',
            designs: ['Spider-Man mask', 'Batman mask', 'Iron Man', 'Captain America shield', 'Hulk face', 'Wonder Woman tiara'],
            features: [
              'Full face superhero masks',
              'Arm designs available',
              'Glitter accents included',
              'All paints hypoallergenic'
            ],
            themeMatch: ['spiderman', 'superhero', 'avengers', 'batman', 'marvel', 'dc']
          },
          {
            id: 'princess',
            name: 'Princess & Fantasy',
            price: 150,
            duration: '2 hours',
            priceType: 'flat',
            image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800',
            description: 'Magical designs fit for royalty and fairy tale dreams',
            designs: ['Princess tiara', 'Butterfly wings', 'Unicorn horn', 'Rainbow swirls', 'Fairy sparkles', 'Frozen snowflakes'],
            features: [
              'Delicate tiara designs',
              'Glitter and gems included',
              'Arm butterflies available',
              'Unicorn and rainbow themes'
            ],
            themeMatch: ['princess', 'frozen', 'fairy', 'unicorn', 'rainbow', 'enchanted', 'disney']
          },
          {
            id: 'animals',
            name: 'Animal Kingdom',
            price: 150,
            duration: '2 hours',
            priceType: 'flat',
            image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=800',
            description: 'Roar, meow, or flutter with our popular animal transformations',
            designs: ['Tiger face', 'Lion mane', 'Butterfly', 'Puppy nose', 'Kitty whiskers', 'Panda eyes', 'Dinosaur scales'],
            features: [
              'Full face animal designs',
              'Realistic details',
              'Both cute and fierce options',
              'Dinosaurs available!'
            ],
            themeMatch: ['safari', 'jungle', 'zoo', 'animals', 'dinosaur', 'wild', 'nature']
          },
          {
            id: 'mixed',
            name: 'Party Mix',
            price: 150,
            duration: '2 hours',
            priceType: 'flat',
            image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
            description: 'Something for everyone - our most popular designs from all collections',
            designs: ['Spider-Man', 'Butterfly', 'Tiger', 'Princess tiara', 'Dinosaur', 'Rainbow', 'Puppy'],
            features: [
              'Best of all collections',
              'Perfect for mixed groups',
              'Boys and girls options',
              'Most requested designs'
            ],
            themeMatch: ['general', 'mixed', 'birthday', 'party']
          }
        ],

        // Add-on services
        addOnServices: [
          {
            id: 'glitter-tattoos',
            name: 'Glitter Tattoos',
            price: 30,
            description: 'Add sparkly temporary tattoos alongside face painting',
            duration: '30 mins extra'
          },
          {
            id: 'arm-designs',
            name: 'Arm & Hand Designs',
            price: 25,
            description: 'Extended designs on arms and hands',
            duration: 'Included in session'
          }
        ],

        // Owner info
        owner: {
          name: 'Sarah Mitchell',
          email: 'sarah@fabulousfaces.co.uk',
          phone: '07700 900123'
        },

        // Availability
        workingHours: {
          Monday: { active: true, start: '09:00', end: '18:00' },
          Tuesday: { active: true, start: '09:00', end: '18:00' },
          Wednesday: { active: true, start: '09:00', end: '18:00' },
          Thursday: { active: true, start: '09:00', end: '18:00' },
          Friday: { active: true, start: '09:00', end: '18:00' },
          Saturday: { active: true, start: '09:00', end: '18:00' },
          Sunday: { active: true, start: '10:00', end: '17:00' },
        },
        unavailableDates: [],
        busyDates: [],
        advanceBookingDays: 3,
        maxBookingDays: 180,

        // Verification
        isVerified: true,
        verification: {
          status: 'verified',
          verificationLevel: 'enhanced'
        },

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isComplete: true
      }
    }

    // Check if supplier already exists
    const { data: existing } = await supabaseAdmin
      .from('suppliers')
      .select('id')
      .eq('business_name', 'Fabulous Faces')
      .maybeSingle()

    if (existing) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from('suppliers')
        .update({
          data: facePaintingSupplier.data,
          is_active: true,
          profile_status: 'live',
          can_go_live: true
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Face painting supplier updated',
        supplier: { id: data.id, name: data.business_name }
      })
    }

    // Insert new supplier
    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .insert(facePaintingSupplier)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Face painting supplier created',
      supplier: { id: data.id, name: data.business_name }
    })

  } catch (error) {
    console.error('Error seeding face painting supplier:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
