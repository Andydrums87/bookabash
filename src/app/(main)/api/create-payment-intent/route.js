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
  const leadTimeCategories = ['cakes', 'party bags', 'decorations'];
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
    const { amount, currency, partyDetails, suppliers, addons, paymentType } = await request.json()

    // Calculate payment breakdown for metadata
    const paymentBreakdown = calculatePaymentBreakdown(suppliers);
    
    // Verify the amount matches our calculation
    const expectedAmount = paymentBreakdown.totalDueToday * 100; // Convert to pence
    if (Math.abs(amount - expectedAmount) > 1) { // Allow for 1p rounding difference
      console.warn(`Payment amount mismatch: received ${amount}, expected ${expectedAmount}`);
    }

    // Create enhanced metadata
    const metadata = {
      party_id: partyDetails.id?.toString() || 'unknown',
      party_child_name: partyDetails.childName || 'Unknown',
      party_theme: partyDetails.theme || 'Party',
      party_date: partyDetails.date || 'TBD',
      supplier_count: suppliers.length.toString(),
      addon_count: (addons?.length || 0).toString(),
      payment_type: paymentType || 'mixed',
      
      // Payment breakdown
      deposit_total: Math.round(paymentBreakdown.depositTotal * 100).toString(),
      full_payment_total: Math.round(paymentBreakdown.fullPaymentTotal * 100).toString(),
      has_deposits: paymentBreakdown.hasDeposits.toString(),
      has_full_payments: paymentBreakdown.hasFullPayments.toString(),
      
      // Supplier categories and payment types
      supplier_categories: JSON.stringify(suppliers.map(s => s.category)),
      payment_details: JSON.stringify(paymentBreakdown.paymentDetails),
      
      // Lead-time suppliers specifically
      lead_time_suppliers: JSON.stringify(
        suppliers
          .filter(isLeadTimeSupplier)
          .map(s => ({ category: s.category, name: s.name, amount: s.price }))
      ),
      
      // Deposit suppliers specifically  
      deposit_suppliers: JSON.stringify(
        suppliers
          .filter(s => !isLeadTimeSupplier(s))
          .map(s => ({ 
            category: s.category, 
            name: s.name, 
            deposit: Math.max(50, s.price * 0.2),
            remaining: s.price - Math.max(50, s.price * 0.2)
          }))
      )
    };

    // Create PaymentIntent with enhanced metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      description: `${partyDetails.childName}'s ${partyDetails.theme} party - ${paymentBreakdown.hasFullPayments ? 'Mixed' : 'Deposit'} payment`,
      metadata,
      // Add receipt email if available
      ...(partyDetails.email && { receipt_email: partyDetails.email })
    });

    // Log payment breakdown for debugging
    console.log('Payment Intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      breakdown: paymentBreakdown,
      leadTimeSuppliers: suppliers.filter(isLeadTimeSupplier).length,
      depositSuppliers: suppliers.filter(s => !isLeadTimeSupplier(s)).length
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentBreakdown // Optional: return breakdown to frontend
    });

  } catch (error) {
    console.error('Stripe PaymentIntent creation error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        type: 'stripe_error'
      },
      { status: 500 }
    );
  }
}