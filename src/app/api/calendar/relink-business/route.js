// app/api/calendar/relink-business/route.js
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Re-link a business to the shared calendar connection from the primary business.
 * This restores the inherited connection so the business uses the shared calendar again.
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

    console.log(`Re-linking business ${supplierId} to shared ${provider} calendar`)

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

    // Find the primary business for this user to get the calendar connection
    const { data: primarySupplier, error: primaryError } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .eq('auth_user_id', supplier.auth_user_id)
      .eq('is_primary', true)
      .single()

    if (primaryError || !primarySupplier) {
      console.error('Failed to find primary supplier:', primaryError)
      return NextResponse.json({ error: 'Primary business not found' }, { status: 404 })
    }

    const syncKey = provider === 'google' ? 'googleCalendarSync' : 'outlookCalendarSync'
    const primarySync = primarySupplier.data?.[syncKey]

    if (!primarySync?.connected) {
      return NextResponse.json({ error: 'Primary business does not have a calendar connected' }, { status: 400 })
    }

    // Create inherited connection pointing to primary
    const inheritedSync = {
      inherited: true,
      connectedViaPrimary: true,
      primarySupplierId: primarySupplier.id,
      connected: true,
      webhooksEnabled: primarySync.webhooksEnabled || false,
      userEmail: primarySync.userEmail,
      userName: primarySync.userName,
      isWorkspaceAccount: primarySync.isWorkspaceAccount,
      lastSync: primarySync.lastSync,
      relinkedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Also copy over the blocked dates from the primary
    const primaryBlockedDates = (primarySupplier.data?.unavailableDates || []).filter(
      d => d.source === `${provider}-calendar`
    )

    // Merge with existing manual blocks
    const manualBlocks = (supplier.data?.unavailableDates || []).filter(
      d => d.source !== `${provider}-calendar`
    )

    const updatedData = {
      ...supplier.data,
      [syncKey]: inheritedSync,
      unavailableDates: [...manualBlocks, ...primaryBlockedDates],
      updatedAt: new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplierId)

    if (updateError) {
      console.error('Failed to update supplier:', updateError)
      return NextResponse.json({ error: 'Failed to relink calendar' }, { status: 500 })
    }

    console.log(`Successfully re-linked business ${supplierId} to shared ${provider} calendar`)

    return NextResponse.json({
      success: true,
      message: `Business re-linked to shared ${provider} calendar`,
      supplierId,
      blockedDatesImported: primaryBlockedDates.length
    })

  } catch (error) {
    console.error('Relink calendar error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
