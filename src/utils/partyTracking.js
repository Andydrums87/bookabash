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

    // Update with new timeline
    const { error } = await supabase
      .from('party_tracking')
      .update({
        current_step: step,
        party_data: data,
        action_timeline: timeline,
        last_activity: new Date().toISOString()
      })
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
 * @param {object} currentPartyPlan - Current state of party plan
 */
export const trackSupplierAdded = async (supplier, currentPartyPlan) => {
  try {
    const trackingData = {
      action: 'supplier_added',
      supplier: {
        id: supplier.id,
        name: supplier.data?.name || supplier.name,
        category: supplier.data?.category || supplier.category,
        price: supplier.data?.priceFrom || supplier.priceFrom
      },
      current_suppliers: extractSupplierSummary(currentPartyPlan),
      total_cost: calculateTotalFromPlan(currentPartyPlan),
      timestamp: new Date().toISOString()
    };

    await trackStep('supplier_added', trackingData);
  } catch (err) {
    console.log('Track supplier added error (non-critical):', err.message);
  }
};

/**
 * Track supplier removal
 * @param {string} supplierType - Type of supplier removed (e.g., 'entertainment')
 * @param {object} currentPartyPlan - Current state of party plan
 */
export const trackSupplierRemoved = async (supplierType, currentPartyPlan) => {
  try {
    const trackingData = {
      action: 'supplier_removed',
      supplier_type: supplierType,
      current_suppliers: extractSupplierSummary(currentPartyPlan),
      total_cost: calculateTotalFromPlan(currentPartyPlan),
      timestamp: new Date().toISOString()
    };

    await trackStep('supplier_removed', trackingData);
  } catch (err) {
    console.log('Track supplier removed error (non-critical):', err.message);
  }
};

/**
 * Link email to anonymous session (when user provides it)
 * @param {string} email - User's email address
 */
export const linkEmail = async (email) => {
  if (!sessionId) await initTracking();
  if (!sessionId) return;

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
 * Mark session as reached checkout
 * @param {object} partyPlan - Final party plan data
 */
export const trackCheckoutStarted = async (partyPlan) => {
  try {
    const trackingData = {
      action: 'checkout_started',
      suppliers: extractSupplierSummary(partyPlan),
      total_cost: calculateTotalFromPlan(partyPlan),
      party_details: {
        theme: partyPlan.theme,
        date: partyPlan.partyDate,
        guest_count: partyPlan.guestCount
      },
      timestamp: new Date().toISOString()
    };

    await trackStep('checkout_started', trackingData);
  } catch (err) {
    console.log('Track checkout error (non-critical):', err.message);
  }
};

/**
 * Mark session as paid
 */
export const markPaid = async () => {
  if (!sessionId) return;

  try {
    const { error } = await supabase
      .from('party_tracking')
      .update({
        status: 'paid',
        last_activity: new Date().toISOString()
      })
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
