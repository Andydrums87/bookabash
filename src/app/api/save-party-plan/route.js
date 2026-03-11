import { NextResponse } from 'next/server';
import { ServerClient } from 'postmark';
import { render } from '@react-email/render';
import SavedPartyPlanEmail from '../../../../emails/saved-party-plan';
import { createClient } from '@supabase/supabase-js';

const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN);

// Create Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, sessionId, partyDetails, partyPlan, marketingConsent, totalCost } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'No session found' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Update tracking record with saved party data
    const { error: dbError } = await supabase
      .from('party_tracking')
      .update({
        email: normalizedEmail,
        status: 'saved',
        saved_party_details: partyDetails,
        saved_party_plan: partyPlan,
        saved_at: new Date().toISOString(),
        marketing_consent: marketingConsent || false,
        child_name: partyDetails?.childName || partyDetails?.firstName,
        party_theme: partyDetails?.theme,
        party_date: partyDetails?.date,
        party_location: partyDetails?.postcode || partyDetails?.location,
        guest_count: partyDetails?.guestCount ? parseInt(partyDetails.guestCount) : null,
        estimated_value: totalCost || 0,
        last_activity: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (dbError) {
      console.error('Database error saving party:', dbError);
      return NextResponse.json({ error: 'Failed to save party plan' }, { status: 500 });
    }

    console.log('✅ Party plan saved to database for:', normalizedEmail);

    // Send confirmation email
    try {
      const childName = partyDetails?.childName || partyDetails?.firstName || 'your child';
      const theme = partyDetails?.theme;
      const partyDate = partyDetails?.date;
      const guestCount = partyDetails?.guestCount;

      // Extract suppliers from party plan for email breakdown
      const supplierCategories = ['venue', 'entertainment', 'cakes', 'facePainting', 'activities', 'partyBags', 'decorations', 'catering', 'balloons', 'photography', 'bouncyCastle'];
      const suppliers = [];

      if (partyPlan) {
        supplierCategories.forEach(category => {
          const supplier = partyPlan[category];
          if (supplier) {
            // Get supplier name from various possible locations
            const name = supplier.data?.name || supplier.name || 'Selected supplier';
            // Get price from various possible locations
            const price = supplier.selectedPackage?.price || supplier.data?.priceFrom || supplier.priceFrom || supplier.price || 0;

            suppliers.push({
              category,
              name,
              price: Number(price) || 0
            });
          }
        });
      }

      const emailHtml = await render(SavedPartyPlanEmail({
        childName,
        theme,
        partyDate,
        totalCost,
        suppliers,
        guestCount
      }));

      await postmarkClient.sendEmail({
        From: 'hello@partysnap.co.uk',
        To: normalizedEmail,
        Subject: `${childName}'s party plan is saved! 🎉`,
        HtmlBody: emailHtml,
        TextBody: `Your party plan for ${childName} has been saved! Return anytime to complete your booking at partysnap.co.uk/dashboard`
      });

      console.log('✅ Confirmation email sent to:', normalizedEmail);
    } catch (emailError) {
      // Don't fail the request if email fails - party is still saved
      console.error('Email error (non-critical):', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save party plan error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
