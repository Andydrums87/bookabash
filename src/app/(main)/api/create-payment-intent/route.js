// src/app/api/create-payment-intent/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

// Helper function to detect lead-time suppliers
const isLeadTimeSupplier = (supplier) => {
  const leadTimeCategories = ['cakes', 'party bags', 'decorations', 'partybags'];
  return leadTimeCategories.includes(supplier.category?.toLowerCase()) ||
         supplier.packageData?.paymentType === 'full_payment' ||
         supplier.packageData?.supplierType?.includes('lead_time');
};

// Calculate payment breakdown
const calculatePaymentBreakdown = (suppliers) => {
  let depositTotal = 0;
  let fullPaymentTotal = 0;
  const paymentDetails = [];

  suppliers.forEach(supplier => {
    const supplierPrice = supplier.price || 0;
    
    if (isLeadTimeSupplier(supplier)) {
      fullPaymentTotal += supplierPrice;
      paymentDetails.push({
        category: supplier.category,
        type: 'full_payment',
        amount: supplierPrice,
        supplier_id: supplier.id
      });
    } else {
      const deposit = Math.max(50, supplierPrice * 0.2);
      depositTotal += deposit;
      paymentDetails.push({
        category: supplier.category,
        type: 'deposit',
        amount: deposit,
        full_amount: supplierPrice,
        remaining: supplierPrice - deposit,
        supplier_id: supplier.id
      });
    }
  });

  return {
    depositTotal,
    fullPaymentTotal,
    totalDueToday: depositTotal + fullPaymentTotal,
    paymentDetails,
    hasDeposits: depositTotal > 0,
    hasFullPayments: fullPaymentTotal > 0
  };
};

export async function POST(request) {
  try {
    const { 
      amount, 
      currency, 
      partyDetails, 
      suppliers, 
      addons, 
      paymentType,
      enableKlarna = false 
    } = await request.json()

    // Calculate payment breakdown for metadata
    const paymentBreakdown = calculatePaymentBreakdown(suppliers);
    
    // Verify the amount matches our calculation
    const expectedAmount = paymentBreakdown.totalDueToday * 100; // Convert to pence
    if (Math.abs(amount - expectedAmount) > 1) { // Allow for 1p rounding difference
      console.warn(`Payment amount mismatch: received ${amount}, expected ${expectedAmount}`);
    }

    // MINIMAL metadata - only essential tracking info
    const metadata = {
      party_id: partyDetails.id?.toString() || 'unknown',
      payment_type: paymentType || 'mixed',
      supplier_count: suppliers.length.toString(),
      total_suppliers: suppliers.length.toString(),
      // Keep categories short and truncated if needed
      categories: suppliers.map(s => s.category.substring(0, 3)).join(',').substring(0, 100)
    };

    // Determine which payment methods to enable
    const paymentMethodTypes = ['card'];
    
    // Klarna requirements:
    // - Amount between £1 and £10,000 (100 pence to 1,000,000 pence)
    // - Currency must be GBP
    // - Customer billing details required
    if (enableKlarna && amount >= 100 && amount <= 1000000 && currency === 'gbp') {
      paymentMethodTypes.push('klarna');
      console.log('✅ Klarna enabled for payment intent');
    } else if (enableKlarna) {
      console.log('⚠️ Klarna not enabled - amount out of range or currency not GBP');
    }

    // Payment intent configuration
    const paymentIntentConfig = {
      amount,
      currency,
      description: `${partyDetails.childName || 'Party'}'s ${partyDetails.theme || 'party'} - ${paymentBreakdown.hasFullPayments ? 'Mixed' : 'Deposit'} payment`,
      metadata,
      // Add receipt email if available
      ...(partyDetails.email && { receipt_email: partyDetails.email }),
    };

    // Use automatic_payment_methods for modern approach (includes Apple/Google Pay)
    if (enableKlarna) {
      paymentIntentConfig.automatic_payment_methods = {
        enabled: true,
        allow_redirects: 'always' // Required for Klarna
      };
      
      // Klarna-specific options
      paymentIntentConfig.payment_method_options = {
        klarna: {
          preferred_locale: 'en-GB',
        }
      };
    } else {
      // Fallback to standard automatic payment methods
      paymentIntentConfig.automatic_payment_methods = {
        enabled: true,
      };
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    // Log payment breakdown for debugging
    console.log('💳 Payment Intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      payment_methods: enableKlarna ? ['card', 'klarna', 'wallet'] : ['card', 'wallet'],
      breakdown: paymentBreakdown,
      leadTimeSuppliers: suppliers.filter(isLeadTimeSupplier).length,
      depositSuppliers: suppliers.filter(s => !isLeadTimeSupplier(s)).length
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentBreakdown // Optional: return breakdown to frontend
    });

  } catch (error) {
    console.error('❌ Stripe PaymentIntent creation error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        type: 'stripe_error',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}