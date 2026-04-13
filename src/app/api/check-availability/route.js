import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const {
      name,
      email,
      phone,
      partyDate,
      notes,
      sessionId,
      partyDetails,
      suppliers,
      totalCost,
    } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Update the existing party_tracking row with contact info if we have a session
    if (sessionId) {
      const { error: trackingError } = await supabase
        .from('party_tracking')
        .update({
          email: normalizedEmail,
          status: 'saved',
          availability_check: {
            name,
            phone,
            email: normalizedEmail,
            partyDate,
            notes,
            suppliers,
            totalCost,
            partyDetails: {
              childName: partyDetails?.childName,
              childAge: partyDetails?.childAge,
              theme: partyDetails?.theme,
              guestCount: partyDetails?.guestCount,
              postcode: partyDetails?.postcode || partyDetails?.location,
              date: partyDetails?.date,
              timeSlot: partyDetails?.timeSlot,
            },
            requestedAt: new Date().toISOString(),
          },
        })
        .eq('session_id', sessionId);

      if (trackingError) {
        console.error('Error updating party_tracking:', trackingError);
        // Don't fail the request — still save as a standalone lead
      }
    }

    console.log(`✅ Availability check lead captured: ${normalizedEmail} (session: ${sessionId})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
