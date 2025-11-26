// app/api/calendar/unlink-business/route.js
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Unlink a business from the shared calendar connection.
 * This removes the inherited connection so the business can use its own calendar or none.
 */
export async function POST(request) {
  try {
    const { supplierId, provider } = await request.json()

    if (!supplierId) {
      return NextResponse.json({ error: 'Supplier ID required' }, { status: 400 })
    }

    if (!provider || !['google', 'outlook'].includes(provider)) {
      return NextResponse.json({ error: 'Valid provider required (google or outlook)' }, { status: 400 })
    }

    console.log(`Unlinking business ${supplierId} from shared ${provider} calendar`)

    // Fetch the supplier
    const { data: supplier, error: fetchError } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .single()

    if (fetchError || !supplier) {
      console.error('Failed to fetch supplier:', fetchError)
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // Check if this supplier has an inherited connection
    const syncKey = provider === 'google' ? 'googleCalendarSync' : 'outlookCalendarSync'
    const currentSync = supplier.data?.[syncKey]

    if (!currentSync?.inherited) {
      return NextResponse.json({ error: 'Business does not have an inherited calendar connection' }, { status: 400 })
    }

    // Remove the inherited connection
    const updatedData = {
      ...supplier.data,
      [syncKey]: {
        connected: false,
        inherited: false,
        unlinkedAt: new Date().toISOString(),
        previouslyInherited: true,
        primarySupplierId: currentSync.primarySupplierId
      },
      // Also clear calendar-blocked dates from this provider
      unavailableDates: (supplier.data?.unavailableDates || []).filter(
        d => d.source !== `${provider}-calendar`
      ),
      updatedAt: new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplierId)

    if (updateError) {
      console.error('Failed to update supplier:', updateError)
      return NextResponse.json({ error: 'Failed to unlink calendar' }, { status: 500 })
    }

    console.log(`Successfully unlinked business ${supplierId} from shared ${provider} calendar`)

    return NextResponse.json({
      success: true,
      message: `Business unlinked from shared ${provider} calendar`,
      supplierId
    })

  } catch (error) {
    console.error('Unlink calendar error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
