import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '6', 10)

    if (!query || query.length < 2) {
      return NextResponse.json({ suppliers: [] })
    }

    const searchTerm = `%${query.toLowerCase()}%`

    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select(`
        id,
        business_name,
        data
      `)
      .eq('is_active', true)
      .or(`business_name.ilike.${searchTerm},data->>name.ilike.${searchTerm},data->>category.ilike.${searchTerm},data->>location.ilike.${searchTerm}`)
      .limit(limit)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ suppliers: [] })
    }

    // Transform to match expected format
    const results = (suppliers || []).map(s => ({
      id: s.id,
      name: s.data?.name || s.business_name,
      category: s.data?.category || 'Unknown',
      location: s.data?.location || '',
      rating: s.data?.rating || 4.5,
      priceFrom: s.data?.priceFrom || 0,
      image: s.data?.image || s.data?.images?.[0] || null,
    }))

    return NextResponse.json({ suppliers: results })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ suppliers: [] })
  }
}
