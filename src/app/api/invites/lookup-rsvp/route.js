// API route to lookup invite by RSVP code
// Uses admin client for database access (bypasses RLS)

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const rsvpCode = searchParams.get('code')

    if (!rsvpCode) {
      return NextResponse.json(
        { success: false, error: 'RSVP code is required' },
        { status: 400 }
      )
    }

    console.log('🔍 API: Looking up invite by RSVP code:', rsvpCode)

    // Use PostgreSQL JSONB query to search directly in the database
    // This is MUCH faster than fetching all parties and iterating through them
    // Query: Find parties where any guest in the guestList array has a matching rsvpCode
    const { data: parties, error: partiesError } = await supabaseAdmin
      .from('parties')
      .select('id, child_name, party_date, party_time, location, theme, party_plan, status')
      .not('status', 'eq', 'cancelled')
      .contains('party_plan', {
        einvites: {
          guestList: [{ rsvpCode }]
        }
      })
      .limit(1)

    if (partiesError) {
      console.error('❌ API: Error fetching parties:', partiesError)
      return NextResponse.json(
        { success: false, error: partiesError.message },
        { status: 500 }
      )
    }

    console.log(`📊 API: Query returned ${parties?.length || 0} matching parties`)

    if (!parties || parties.length === 0) {
      console.log('❌ API: No party found with RSVP code:', rsvpCode)
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired RSVP link',
        guest: null,
        party: null
      }, { status: 404 })
    }

    // Found the party, now extract the specific guest
    const matchedParty = parties[0]
    const guestList = matchedParty.party_plan?.einvites?.guestList || []
    const matchedGuest = guestList.find(g => g.rsvpCode === rsvpCode)

    if (!matchedGuest) {
      console.log('❌ API: Party found but guest not in list (shouldn\'t happen)')
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired RSVP link',
        guest: null,
        party: null
      }, { status: 404 })
    }

    console.log('✅ API: Found guest:', matchedGuest.childName, 'for party:', matchedParty.child_name)

    // Get the public invite for this party (if it exists)
    const { data: allInvites, error: inviteError } = await supabaseAdmin
      .from('public_invites')
      .select('*')
      .eq('is_active', true)

    if (inviteError) {
      console.error('⚠️ API: Error fetching public invites:', inviteError)
    }

    // Find the invite that matches this party ID
    let publicInvite = null
    if (allInvites && allInvites.length > 0) {
      publicInvite = allInvites.find(invite => {
        const inviteData = typeof invite.invite_data === 'string'
          ? JSON.parse(invite.invite_data)
          : invite.invite_data
        return inviteData?.partyId === matchedParty.id
      })
    }

    // Return the matched data
    return NextResponse.json({
      success: true,
      guest: matchedGuest,
      party: matchedParty,
      invite: publicInvite,
      inviteDetails: {
        id: publicInvite?.id,
        theme: publicInvite?.theme || matchedParty.theme,
        generatedImage: publicInvite?.generated_image,
        partyId: matchedParty.id,
        inviteData: {
          childName: matchedParty.child_name,
          age: matchedParty.party_plan?.child_age || '',
          date: matchedParty.party_date,
          time: matchedParty.party_time,
          venue: matchedParty.location
        }
      }
    })

  } catch (error) {
    console.error('❌ API: Error in RSVP lookup:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
