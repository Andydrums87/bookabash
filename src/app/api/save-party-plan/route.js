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

// Generate a unique discount code
function generateDiscountCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SAVE20-${suffix}`;
}

export async function POST(request) {
  try {
    const { email, sessionId, partyDetails, partyPlan, marketingConsent, totalCost } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if this email already has a SAVE20 discount code
    let discountCode = null;
    const { data: existingCode } = await supabase
      .from('discount_codes')
      .select('code')
      .eq('email', normalizedEmail)
      .ilike('code', 'SAVE20-%')
      .single();

    if (existingCode) {
      // Use the existing code
      discountCode = existingCode.code;
      console.log('📋 Using existing discount code:', discountCode);
    } else {
      // Generate unique discount code
      discountCode = generateDiscountCode();

      // Ensure code is unique
      let attempts = 0;
      while (attempts < 5) {
        const { data: existingCodeCheck } = await supabase
          .from('discount_codes')
          .select('code')
          .eq('code', discountCode)
          .single();

        if (!existingCodeCheck) break;
        discountCode = generateDiscountCode();
        attempts++;
      }

      // Store discount code in Supabase
      const { error: codeError } = await supabase
        .from('discount_codes')
        .insert({
          code: discountCode,
          email: normalizedEmail,
          discount_type: 'fixed',
          discount_value: 20,
          is_active: true,
          source: 'save_plan_email',
          session_id: sessionId || null,
          created_at: new Date().toISOString()
        });

      if (codeError) {
        console.error('Error storing discount code:', codeError);
        // Continue anyway - we can still save the party
      } else {
        console.log('✅ Discount code created:', discountCode);
      }
    }

    // Update tracking record with saved party data (only if we have a sessionId)
    if (sessionId) {
      const { error: dbError } = await supabase
        .from('party_tracking')
        .update({
          email: normalizedEmail,
          status: 'saved',
          saved_party_details: partyDetails,
          saved_party_plan: partyPlan,
          save_plan_discount_code: discountCode,
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
        // Don't fail - we still have the discount code
      } else {
        console.log('✅ Party plan saved to database for:', normalizedEmail);
      }
    } else {
      console.log('⚠️ No sessionId - skipping party_tracking update, but discount code created');
    }

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
        guestCount,
        discountCode,
        discountAmount: 20
      }));

      await postmarkClient.sendEmail({
        From: 'hello@partysnap.co.uk',
        To: normalizedEmail,
        Subject: `Your £20 off code + ${childName}'s party plan 🎁`,
        HtmlBody: emailHtml,
        TextBody: `Your party plan for ${childName} has been saved! Use code ${discountCode} to get £20 off your booking. Return to partysnap.co.uk/dashboard to complete your booking.`
      });

      console.log('✅ Confirmation email sent to:', normalizedEmail);
    } catch (emailError) {
      // Don't fail the request if email fails - party is still saved
      console.error('Email error (non-critical):', emailError);
    }

    return NextResponse.json({ success: true, discountCode });
  } catch (error) {
    console.error('Save party plan error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
