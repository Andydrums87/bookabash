/**
 * Party Tracking Utility
 *
 * Tracks user behavior through the party planning journey
 * for analytics and abandoned cart recovery.
 *
 * Features:
 * - Anonymous tracking (no email required initially)
 * - Links to email when provided
 * - Tracks supplier additions/removals
 * - Monitors checkout funnel
 * - Non-blocking (fails silently if issues)
 */

import { supabase } from '@/lib/supabase';

let sessionId = null;
let isInitialized = false;

/**
 * Initialize tracking session
 * Creates anonymous session on first visit
 */
export const initTracking = async () => {
  if (isInitialized) return sessionId;

  try {
    // Check if session already exists in localStorage
    sessionId = localStorage.getItem('tracking_session_id');

    if (!sessionId) {
      // Create new session
      sessionId = crypto.randomUUID();
      localStorage.setItem('tracking_session_id', sessionId);

      // Create database entry
      const { error } = await supabase
        .from('party_tracking')
        .insert({
          session_id: sessionId,
          status: 'browsing',
          device_info: {
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            platform: navigator.platform
          },
          referrer: document.referrer || null
        });

      if (error) {
        console.log('Tracking init failed (non-critical):', error.message);
      }
    }

    isInitialized = true;
    return sessionId;
  } catch (err) {
    console.log('Tracking init error (non-critical):', err.message);
    return null;
  }
};

/**
 * Track a step in the party planning journey
 * @param {string} step - The current step (e.g., 'theme_selected', 'supplier_added')
 * @param {object} data - Additional data about this step
 */
export const trackStep = async (step, data = {}) => {
  if (!sessionId) await initTracking();
  if (!sessionId) return; // Still null, tracking disabled

  try {
    // First, get the current timeline
    const { data: currentTracking } = await supabase
      .from('party_tracking')
      .select('action_timeline')
      .eq('session_id', sessionId)
      .single();

    const timeline = currentTracking?.action_timeline || [];

    // Append new action to timeline
    const newAction = {
      action: step,
      timestamp: new Date().toISOString(),
      data: data
    };

    timeline.push(newAction);

    // Build update object
    const updateObj = {
      current_step: step,
      party_data: data,
      action_timeline: timeline,
      last_activity: new Date().toISOString()
    };

    // If this is party_planning_started, also populate dedicated columns and update status
    // The data object has theme, guestCount, postcode directly from the form
    if (step === 'party_planning_started') {
      updateObj.status = 'started_planning'; // Change from 'browsing' to 'started_planning'
      if (data.theme) updateObj.party_theme = data.theme;
      if (data.guestCount) updateObj.guest_count = parseInt(data.guestCount) || null;
      if (data.postcode) updateObj.party_location = data.postcode;
    }

    // Update with new timeline and party columns
    const { error } = await supabase
      .from('party_tracking')
      .update(updateObj)
      .eq('session_id', sessionId);

    if (error) {
      console.log('Tracking step failed (non-critical):', error.message);
    }
  } catch (err) {
    console.log('Tracking error (non-critical):', err.message);
  }
};

/**
 * Track supplier addition
 * @param {object} supplier - The supplier that was added
 * @param {object} currentPartyPlan - Current state of party plan (kept for backward compat, but we use localStorage)
 */
export const trackSupplierAdded = async (supplier, currentPartyPlan) => {
  try {
    // Get complete party data from BOTH localStorage objects
    const completeData = getCompletePartyData();
    const supplierSummary = extractSupplierSummary(completeData);

    const trackingData = {
      action: 'supplier_added',
      supplier: {
        id: supplier.id,
        name: supplier.data?.name || supplier.name,
        category: supplier.data?.category || supplier.category,
        price: supplier.data?.priceFrom || supplier.priceFrom
      },
      current_suppliers: supplierSummary,
      total_cost: completeData.totalCost,
      timestamp: new Date().toISOString()
    };

    await trackStep('supplier_added', trackingData);

    // Update dedicated columns with complete data
    await updatePartyColumns({
      supplier_count: completeData.supplierCount,
      estimated_value: completeData.totalCost,
      party_theme: completeData.theme
    });
  } catch (err) {
    console.log('Track supplier added error (non-critical):', err.message);
  }
};

/**
 * Track supplier removal
 * @param {string} supplierType - Type of supplier removed (e.g., 'entertainment')
 * @param {object} currentPartyPlan - Current state of party plan (kept for backward compat)
 */
export const trackSupplierRemoved = async (supplierType, currentPartyPlan) => {
  try {
    // Get complete party data from BOTH localStorage objects
    const completeData = getCompletePartyData();
    const supplierSummary = extractSupplierSummary(completeData);

    const trackingData = {
      action: 'supplier_removed',
      supplier_type: supplierType,
      current_suppliers: supplierSummary,
      total_cost: completeData.totalCost,
      timestamp: new Date().toISOString()
    };

    await trackStep('supplier_removed', trackingData);

    // Update dedicated columns with complete data
    await updatePartyColumns({
      supplier_count: completeData.supplierCount,
      estimated_value: completeData.totalCost
    });
  } catch (err) {
    console.log('Track supplier removed error (non-critical):', err.message);
  }
};

/**
 * Link email to anonymous session (when user provides it)
 * Only links to EXISTING sessions - does NOT create new ones.
 * This prevents creating duplicate sessions after payment.
 * @param {string} email - User's email address
 */
export const linkEmail = async (email) => {
  // First try to get sessionId from memory or localStorage
  if (!sessionId) {
    sessionId = typeof window !== 'undefined'
      ? localStorage.getItem('tracking_session_id')
      : null;
  }

  // If no session exists, DON'T create a new one - just return
  // This prevents creating duplicate sessions after payment
  if (!sessionId) {
    console.log('linkEmail: No existing session to link, skipping (this is normal after payment)');
    return;
  }

  try {
    const { error } = await supabase
      .from('party_tracking')
      .update({
        email,
        status: 'checkout',
        last_activity: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (error) {
      console.log('Link email failed (non-critical):', error.message);
    }
  } catch (err) {
    console.log('Link email error (non-critical):', err.message);
  }
};

/**
 * Track when user reaches the review-book page (Step 1 of checkout)
 * This is when they're reviewing their party plan before proceeding
 */
export const trackReviewBookStarted = async () => {
  try {
    const completeData = getCompletePartyData();
    const supplierSummary = extractSupplierSummary(completeData);

    const trackingData = {
      action: 'review_book_started',
      suppliers: supplierSummary,
      total_cost: completeData.totalCost,
      party_details: {
        theme: completeData.theme,
        date: completeData.partyDate,
        guest_count: completeData.guestCount
      },
      timestamp: new Date().toISOString()
    };

    await trackStep('review_book_started', trackingData);

    // Update status to show they're in the review stage
    if (!sessionId) await initTracking();
    if (sessionId) {
      await supabase
        .from('party_tracking')
        .update({
          status: 'review_book',
          last_activity: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }

    // Update party columns
    await updatePartyColumns({
      party_theme: completeData.theme,
      party_date: completeData.partyDate,
      party_location: completeData.location,
      guest_count: completeData.guestCount,
      supplier_count: completeData.supplierCount,
      estimated_value: completeData.totalCost
    });
  } catch (err) {
    console.log('Track review book error (non-critical):', err.message);
  }
};

/**
 * Track when user reaches the payment page (Step 2 of checkout)
 * This is when they're about to enter payment details
 *
 * IMPORTANT: This handles both pre-booking (new party) and post-booking (adding suppliers) flows:
 * - Pre-booking: Uses session ID from localStorage (created on home page)
 * - Post-booking: Uses email lookup (session ID was cleared after initial payment)
 */
export const trackPaymentPageStarted = async () => {
  try {
    const completeData = getCompletePartyData();
    const supplierSummary = extractSupplierSummary(completeData);

    const trackingData = {
      action: 'payment_page_started',
      suppliers: supplierSummary,
      total_cost: completeData.totalCost,
      party_details: {
        theme: completeData.theme,
        date: completeData.partyDate,
        guest_count: completeData.guestCount
      },
      timestamp: new Date().toISOString()
    };

    // Check if we have an existing session in localStorage
    const existingSessionId = typeof window !== 'undefined'
      ? localStorage.getItem('tracking_session_id')
      : null;

    if (existingSessionId) {
      // PRE-BOOKING FLOW: Use session-based tracking
      // Restore the module variable if needed
      sessionId = existingSessionId;
      isInitialized = true;

      await trackStep('payment_page_started', trackingData);

      // Update status
      await supabase
        .from('party_tracking')
        .update({
          status: 'payment_page',
          last_activity: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      // Update party columns
      await updatePartyColumns({
        party_theme: completeData.theme,
        party_date: completeData.partyDate,
        party_location: completeData.location,
        guest_count: completeData.guestCount,
        supplier_count: completeData.supplierCount,
        estimated_value: completeData.totalCost
      });
    } else {
      // POST-BOOKING FLOW: Use email-based tracking (session was cleared after initial payment)
      // This appends to the existing tracking record found by email
      const email = await getCurrentUserEmail();
      if (email) {
        await appendToTrackingTimeline(email, 'payment_page_started', trackingData);
      } else {
        console.log('trackPaymentPageStarted: No session ID or email found, skipping (this may be normal)');
      }
    }
  } catch (err) {
    console.log('Track payment page error (non-critical):', err.message);
  }
};

/**
 * Mark session as reached checkout (legacy - kept for backward compatibility)
 * @param {object} partyPlan - Final party plan data (kept for backward compat, but we use localStorage)
 */
export const trackCheckoutStarted = async (partyPlan) => {
  try {
    // Get complete party data from BOTH localStorage objects
    const completeData = getCompletePartyData();
    const supplierSummary = extractSupplierSummary(completeData);

    const trackingData = {
      action: 'checkout_started',
      suppliers: supplierSummary,
      total_cost: completeData.totalCost,
      party_details: {
        theme: completeData.theme,
        date: completeData.partyDate,
        guest_count: completeData.guestCount
      },
      timestamp: new Date().toISOString()
    };

    await trackStep('checkout_started', trackingData);

    // Update all party columns at checkout (most complete data available)
    await updatePartyColumns({
      party_theme: completeData.theme,
      party_date: completeData.partyDate,
      party_location: completeData.location,
      guest_count: completeData.guestCount,
      supplier_count: completeData.supplierCount,
      estimated_value: completeData.totalCost
    });
  } catch (err) {
    console.log('Track checkout error (non-critical):', err.message);
  }
};

/**
 * Mark session as paid and log payment_completed event to timeline
 * @param {object} paymentData - Optional payment details (amount, partyId, etc.)
 */
export const markPaid = async (paymentData = {}) => {
  if (!sessionId) return;

  try {
    // First, get the current timeline
    const { data: currentTracking } = await supabase
      .from('party_tracking')
      .select('action_timeline')
      .eq('session_id', sessionId)
      .single();

    const timeline = currentTracking?.action_timeline || [];

    // Add payment_completed event to timeline
    const paymentEvent = {
      action: 'payment_completed',
      timestamp: new Date().toISOString(),
      data: {
        amount: paymentData.amount || null,
        party_id: paymentData.partyId || null,
        payment_method: paymentData.paymentMethod || null,
        ...paymentData
      }
    };

    timeline.push(paymentEvent);

    // Update status, timeline, and final value
    const updateData = {
      status: 'paid',
      action_timeline: timeline,
      last_activity: new Date().toISOString()
    };

    // Store final payment amount in estimated_value column
    if (paymentData.amount) {
      updateData.estimated_value = paymentData.amount;
    }

    // Store theme if provided
    if (paymentData.theme) {
      updateData.party_theme = paymentData.theme;
    }

    const { error } = await supabase
      .from('party_tracking')
      .update(updateData)
      .eq('session_id', sessionId);

    if (error) {
      console.log('Mark paid failed (non-critical):', error.message);
    }

    // Clear session after successful payment
    localStorage.removeItem('tracking_session_id');
    sessionId = null;
    isInitialized = false;
  } catch (err) {
    console.log('Mark paid error (non-critical):', err.message);
  }
};

/**
 * Helper: Get complete party data from both localStorage objects
 * Merges party_details (metadata) with user_party_plan (suppliers)
 * and calculates totals
 */
const getCompletePartyData = () => {
  if (typeof window === 'undefined') return {};

  try {
    const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
    const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}');

    // Count suppliers and calculate total
    const categories = ['venue', 'entertainment', 'cakes', 'facePainting',
                        'activities', 'partyBags', 'decorations', 'catering',
                        'balloons', 'photography', 'bouncyCastle'];

    let supplierCount = 0;
    let totalCost = 0;

    categories.forEach(cat => {
      if (partyPlan[cat]) {
        supplierCount++;
        const supplier = partyPlan[cat];
        // Get price from various possible locations
        const price = supplier.selectedPackage?.price
                   || supplier.data?.priceFrom
                   || supplier.priceFrom
                   || supplier.price
                   || 0;
        totalCost += Number(price) || 0;
      }
    });

    return {
      // Party metadata from party_details
      theme: partyDetails.theme || null,
      partyDate: partyDetails.date || null,
      location: partyDetails.location || partyDetails.postcode || null,
      guestCount: partyDetails.guestCount || null,
      childName: partyDetails.childName || null,

      // Calculated values
      supplierCount,
      totalCost,

      // Raw suppliers for timeline (spread partyPlan)
      ...partyPlan
    };
  } catch (err) {
    console.log('getCompletePartyData error (non-critical):', err.message);
    return {};
  }
};

/**
 * Helper: Update dedicated party columns (for easier CRM queries)
 * @param {object} columns - Object with column names and values to update
 */
const updatePartyColumns = async (columns) => {
  if (!sessionId) return;

  try {
    // Filter out null/undefined values but keep 0
    const updateData = {};
    Object.entries(columns).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        updateData[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) return;

    const { error } = await supabase
      .from('party_tracking')
      .update(updateData)
      .eq('session_id', sessionId);

    if (error) {
      console.log('Update party columns failed (non-critical):', error.message);
    }
  } catch (err) {
    console.log('Update party columns error (non-critical):', err.message);
  }
};

/**
 * Helper: Extract supplier summary from party plan
 */
const extractSupplierSummary = (partyPlan) => {
  if (!partyPlan) return [];

  const suppliers = [];
  const categories = ['venue', 'entertainment', 'cakes', 'facePainting', 'activities', 'partyBags', 'decorations'];

  categories.forEach(category => {
    if (partyPlan[category]) {
      suppliers.push({
        category,
        name: partyPlan[category].data?.name || partyPlan[category].name,
        id: partyPlan[category].id
      });
    }
  });

  return suppliers;
};

/**
 * Helper: Calculate total cost from party plan
 */
const calculateTotalFromPlan = (partyPlan) => {
  // You can integrate with your unifiedPricingEngine here
  // For now, return a simple count
  return partyPlan?.totalCost || 0;
};

/**
 * Get current session ID (useful for debugging)
 */
export const getSessionId = () => sessionId;

/**
 * Reset tracking (useful for testing)
 */
export const resetTracking = () => {
  localStorage.removeItem('tracking_session_id');
  sessionId = null;
  isInitialized = false;
};

// ============================================================
// POST-BOOKING TRACKING
// These functions track user engagement AFTER they've paid
// They append to the SAME party_tracking record using email lookup
// Events go into the same action_timeline array
// ============================================================

/**
 * Helper: Map post-booking actions to human-readable status
 */
const getStatusFromAction = (action) => {
  const statusMap = {
    'supplier_added_post_booking': 'adding_suppliers',
    'einvite_created': 'creating_invites',
    'einvite_shared': 'sharing_invites',
    'guest_added': 'managing_guests',
    'rsvp_received': 'receiving_rsvps',
    'gift_registry_created': 'setting_up_registry',
    'gift_item_added': 'adding_gifts',
    'gift_contribution': 'receiving_contributions'
  };
  return statusMap[action] || 'engaged';
};

/**
 * Helper: Find tracking record by email and append to its timeline
 * @param {string} email - User's email address
 * @param {string} action - The action name
 * @param {object} actionData - Data about the action
 */
const appendToTrackingTimeline = async (email, action, actionData = {}) => {
  console.log('📝 appendToTrackingTimeline called:', { email, action });

  if (!email) {
    console.log('⚠️ appendToTrackingTimeline: No email provided');
    return { success: false, error: 'No email provided' };
  }

  try {
    // Find the most recent tracking record for this email
    const { data: trackingRecord, error: fetchError } = await supabase
      .from('party_tracking')
      .select('id, action_timeline')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('🔍 Tracking record lookup result:', {
      found: !!trackingRecord,
      id: trackingRecord?.id,
      error: fetchError?.message
    });

    if (fetchError || !trackingRecord) {
      console.log('⚠️ No tracking record found for email:', email);
      return { success: false, error: 'No tracking record found' };
    }

    // Get existing timeline or start fresh
    const timeline = trackingRecord.action_timeline || [];

    // Create new event
    const newEvent = {
      action: action,
      timestamp: new Date().toISOString(),
      data: actionData
    };

    timeline.push(newEvent);

    // Determine the status based on the action (for post-booking activities)
    const newStatus = getStatusFromAction(action);

    // Update the record with new timeline, current_step, and status
    console.log('📤 Updating tracking record:', {
      id: trackingRecord.id,
      action,
      newStatus,
      timelineLength: timeline.length
    });

    const { error: updateError } = await supabase
      .from('party_tracking')
      .update({
        action_timeline: timeline,
        current_step: action,
        status: newStatus,
        last_activity: new Date().toISOString()
      })
      .eq('id', trackingRecord.id);

    if (updateError) {
      console.log('❌ Failed to update tracking timeline:', updateError.message);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Tracking timeline updated successfully');
    return { success: true };
  } catch (err) {
    console.log('appendToTrackingTimeline error (non-critical):', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Helper: Get user email from Supabase auth
 */
const getCurrentUserEmail = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('📧 getCurrentUserEmail:', user?.email || 'NO USER');
    return user?.email || null;
  } catch (err) {
    console.log('Get user email error (non-critical):', err.message);
    return null;
  }
};

/**
 * Track when a user adds a supplier after booking (from dashboard)
 * @param {string} partyId - The party ID (for reference in data)
 * @param {object} supplier - The supplier being added
 */
export const trackPostBookingSupplierAdded = async (partyId, supplier) => {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return;

    await appendToTrackingTimeline(email, 'supplier_added_post_booking', {
      party_id: partyId,
      supplier_id: supplier?.id,
      supplier_name: supplier?.name || supplier?.data?.name,
      supplier_category: supplier?.category || supplier?.data?.category
    });
  } catch (err) {
    console.log('Track post-booking supplier error (non-critical):', err.message);
  }
};

/**
 * Track when a user creates an e-invite
 * @param {string} partyId - The party ID
 * @param {object} inviteData - Details about the invite
 */
export const trackEInviteCreated = async (partyId, inviteData = {}) => {
  console.log('🎨 trackEInviteCreated called:', { partyId, inviteData });
  try {
    const email = await getCurrentUserEmail();
    if (!email) {
      console.log('⚠️ trackEInviteCreated: No user email, skipping');
      return;
    }

    const result = await appendToTrackingTimeline(email, 'einvite_created', {
      party_id: partyId,
      invite_id: inviteData.inviteId,
      invite_slug: inviteData.inviteSlug,
      theme: inviteData.theme,
      generation_type: inviteData.generationType,
      has_custom_image: !!inviteData.generatedImage
    });
    console.log('🎨 trackEInviteCreated result:', result);
  } catch (err) {
    console.log('Track e-invite error (non-critical):', err.message);
  }
};

/**
 * Track when a user shares their e-invite
 * @param {string} partyId - The party ID
 * @param {string} shareMethod - How they shared (whatsapp, email, copy_link)
 */
export const trackEInviteShared = async (partyId, shareMethod) => {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return;

    await appendToTrackingTimeline(email, 'einvite_shared', {
      party_id: partyId,
      share_method: shareMethod
    });
  } catch (err) {
    console.log('Track e-invite shared error (non-critical):', err.message);
  }
};

/**
 * Track when a user adds a guest to their RSVP list
 * @param {string} partyId - The party ID
 * @param {object} guestData - Details about the guest
 */
export const trackGuestAdded = async (partyId, guestData = {}) => {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return;

    await appendToTrackingTimeline(email, 'guest_added', {
      party_id: partyId,
      guest_type: guestData.type,
      guest_name: guestData.name
    });
  } catch (err) {
    console.log('Track guest added error (non-critical):', err.message);
  }
};

/**
 * Track when a guest RSVPs (responds to invite)
 * @param {string} partyId - The party ID
 * @param {object} rsvpData - Details about the RSVP
 */
export const trackRsvpReceived = async (partyId, rsvpData = {}) => {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return;

    await appendToTrackingTimeline(email, 'rsvp_received', {
      party_id: partyId,
      response: rsvpData.status,
      guest_name: rsvpData.guestName,
      adults_count: rsvpData.adultsCount || 0,
      children_count: rsvpData.childrenCount || 0
    });
  } catch (err) {
    console.log('Track RSVP error (non-critical):', err.message);
  }
};

/**
 * Track when a user creates a gift registry
 * @param {string} partyId - The party ID
 * @param {string} registryId - The registry ID
 */
export const trackGiftRegistryCreated = async (partyId, registryId) => {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return;

    await appendToTrackingTimeline(email, 'gift_registry_created', {
      party_id: partyId,
      registry_id: registryId
    });
  } catch (err) {
    console.log('Track gift registry error (non-critical):', err.message);
  }
};

/**
 * Track when a user adds an item to their gift registry
 * @param {string} partyId - The party ID
 * @param {object} itemData - Details about the item
 */
export const trackGiftItemAdded = async (partyId, itemData = {}) => {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return;

    await appendToTrackingTimeline(email, 'gift_item_added', {
      party_id: partyId,
      item_name: itemData.name,
      item_price: itemData.price,
      is_external: !!itemData.externalSource,
      external_source: itemData.externalSource || null
    });
  } catch (err) {
    console.log('Track gift item error (non-critical):', err.message);
  }
};

/**
 * Track when someone contributes to a gift
 * @param {string} partyId - The party ID
 * @param {object} contributionData - Details about the contribution
 */
export const trackGiftContribution = async (partyId, contributionData = {}) => {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return;

    await appendToTrackingTimeline(email, 'gift_contribution', {
      party_id: partyId,
      amount: contributionData.amount,
      item_name: contributionData.itemName
    });
  } catch (err) {
    console.log('Track gift contribution error (non-critical):', err.message);
  }
};
