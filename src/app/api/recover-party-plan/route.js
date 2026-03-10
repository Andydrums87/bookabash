import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Look up party_tracking where email matches and has saved party data
    const { data: savedParty, error: lookupError } = await supabase
      .from('party_tracking')
      .select('session_id, saved_party_details, saved_party_plan, saved_at, email')
      .eq('email', normalizedEmail)
      .not('saved_party_details', 'is', null)
      .order('saved_at', { ascending: false })
      .limit(1)
      .single()

    if (lookupError) {
      // No saved party found is not an error, just no results
      if (lookupError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'No saved party plan found for this email. Please check the email address and try again.'
          },
          { status: 404 }
        )
      }

      console.error('Error looking up saved party:', lookupError)
      return NextResponse.json(
        { success: false, error: 'Failed to look up party plan' },
        { status: 500 }
      )
    }

    if (!savedParty || !savedParty.saved_party_details) {
      return NextResponse.json(
        {
          success: false,
          error: 'No saved party plan found for this email. Please check the email address and try again.'
        },
        { status: 404 }
      )
    }

    // Return the saved party data
    return NextResponse.json({
      success: true,
      data: {
        partyDetails: savedParty.saved_party_details,
        partyPlan: savedParty.saved_party_plan,
        savedAt: savedParty.saved_at,
        sessionId: savedParty.session_id
      }
    })

  } catch (error) {
    console.error('Error in recover-party-plan:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
