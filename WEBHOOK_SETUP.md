# Stripe Webhook Payment System - Setup Guide

## Overview

Your payment system now uses **webhook-based payment confirmation** for maximum reliability. This means:

✅ **Payments work even if users close their browser**
✅ **All database updates happen server-side via webhooks**
✅ **Idempotent processing** (duplicate webhooks are handled gracefully)
✅ **Automatic email notifications** to customers and suppliers
✅ **Real-time status polling** for smooth user experience

---

## Architecture

### Payment Flow

```
1. Customer completes Stripe payment
   ↓
2. Stripe confirms payment (client-side)
   ↓
3. Customer redirected to /payment/processing
   ↓
4. Stripe sends webhook to /api/webhooks/stripe
   ↓
5. Webhook processes payment:
   - Updates party status (draft → planned)
   - Creates/updates enquiries
   - Marks enquiries as accepted
   - Sends emails to suppliers
   - Sends confirmation to customer
   ↓
6. Frontend polls /api/check-payment-status
   ↓
7. When complete, redirect to /payment/success
```

### Key Files

- **`/api/webhooks/stripe/route.js`** - Main webhook handler (processes payments)
- **`/api/check-payment-status/route.js`** - Status polling endpoint
- **`/api/create-payment-intent/route.js`** - Payment intent creation (with metadata)
- **`/payment/PaymentPageContent.jsx`** - Frontend payment form
- **`/payment/processing/page.js`** - Processing page with status polling

---

## Setup Instructions

### 1. Install Stripe CLI (for local testing)

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Chocolatey)
choco install stripe-cli

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate.

### 3. Get Webhook Secret for Local Development

Start the Stripe CLI webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copy this secret and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 4. Environment Variables

Ensure you have all required environment variables:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Postmark)
POSTMARK_API_TOKEN=xxxxx

# SMS (Twilio) - optional
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
```

### 5. Start Development Server

```bash
npm run dev
```

Keep the Stripe CLI running in another terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Testing the Webhook Flow

### Test Payment Success

1. Go to http://localhost:3000/payment (with a valid party in progress)
2. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any postal code
3. Complete the payment
4. You should be redirected to `/payment/processing`
5. Watch the terminal logs:
   - Stripe CLI terminal: See the webhook event
   - Next.js terminal: See webhook processing logs
6. Processing page should poll and redirect to success

### Test Failed Payment

Use Stripe test card for declined: `4000 0000 0000 0002`

### Test 3D Secure Payment

Use Stripe test card: `4000 0025 0000 3155`

### Verify Webhook Processing

Check these in your terminal logs:

```
✅ Webhook received
✅ Payment intent verified
✅ Party updated to 'planned'
✅ Enquiries created/updated
✅ Emails sent to suppliers
✅ Customer confirmation sent
```

### Check Database

Verify in Supabase:

1. **parties table**
   - `status` changed to `'planned'`
   - `payment_status` set to `'partial_paid'` or `'fully_paid'`
   - `payment_intent_id` matches Stripe payment intent

2. **enquiries table**
   - New enquiries created (if first payment)
   - Existing enquiries updated to `status = 'accepted'`
   - `payment_status` set correctly

---

## Production Deployment

### 1. Configure Stripe Webhook Endpoint

In Stripe Dashboard (https://dashboard.stripe.com/webhooks):

1. Click **Add endpoint**
2. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
3. Description: `BookABash Payment Webhooks`
4. Events to listen for:
   - `payment_intent.succeeded` ⭐ **Required**
   - `payment_intent.payment_failed`
   - `payment_intent.processing`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Click **Add endpoint**

### 2. Get Production Webhook Secret

After creating the endpoint, you'll see:

```
Signing secret: whsec_xxxxxxxxxxxxx
```

Add this to your production environment variables (Vercel/Railway/etc.):

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 3. Update App URL

Set production URL:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Test Production Webhooks

Stripe provides webhook testing in the dashboard:

1. Go to your webhook endpoint
2. Click **Send test webhook**
3. Select event type: `payment_intent.succeeded`
4. Click **Send test webhook**
5. Check response (should be 200 OK)

---

## Monitoring & Debugging

### View Webhook Logs in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click on your endpoint
3. See recent webhook attempts, status codes, and responses

### Common Issues

#### ❌ Webhook signature verification failed

**Cause:** Wrong `STRIPE_WEBHOOK_SECRET` or request body modified

**Fix:**
- Ensure you're using the correct webhook secret
- Don't parse request body before verification
- Check Next.js config: `export const runtime = 'nodejs'`

#### ❌ Payment processing timeout (polling exceeds 30s)

**Cause:** Webhook not reaching your server or processing error

**Fix:**
- Check webhook endpoint is accessible (use ngrok for local testing)
- Check server logs for webhook errors
- Verify Supabase service role key is correct

#### ❌ Duplicate payment processing

**Fix:** Already handled! The webhook has idempotency checks:

```javascript
if (existingParty.payment_intent_id === paymentIntent.id &&
    existingParty.payment_status !== 'pending') {
  console.log('Payment already processed. Skipping duplicate.')
  return { success: true, duplicate: true }
}
```

#### ❌ Emails not sending

**Cause:** Missing Postmark API token or email API error

**Fix:**
- Verify `POSTMARK_API_TOKEN` is set
- Check email template endpoints exist
- Webhook still succeeds even if emails fail (non-blocking)

---

## Webhook Security

### Signature Verification

Every webhook is verified using Stripe's signature:

```javascript
const event = stripe.webhooks.constructEvent(
  body,        // Raw request body
  signature,   // Stripe-Signature header
  webhookSecret // Your webhook secret
)
```

**Never skip signature verification in production!**

### Request Body Handling

The webhook route uses raw body for verification:

```javascript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

This ensures Next.js doesn't parse the body before signature verification.

---

## Testing Checklist

Before going live, test:

- [ ] Payment succeeds with test card
- [ ] Webhook receives `payment_intent.succeeded`
- [ ] Party status updates to `'planned'`
- [ ] Enquiries created/updated correctly
- [ ] Supplier emails sent
- [ ] Customer confirmation email sent
- [ ] Processing page polls and redirects
- [ ] Failed payment shows error correctly
- [ ] 3D Secure payments work
- [ ] Klarna payments work (if enabled)
- [ ] Duplicate webhook handled gracefully
- [ ] User can close browser mid-payment (booking still completes)

---

## Monitoring in Production

### Recommended Monitoring

1. **Stripe Dashboard**: Monitor webhook success rate
2. **Server Logs**: Track webhook processing errors
3. **Database**: Check for parties with `payment_status = 'processing'` older than 5 minutes
4. **Error Tracking**: Use Sentry or similar to catch webhook errors

### Webhook Retry Logic

Stripe automatically retries failed webhooks:
- Immediately
- After 1 hour
- After 3 hours
- After 6 hours
- After 12 hours
- After 24 hours

After 3 days of failures, the webhook is disabled.

**Important:** Always return 200 OK from your webhook handler, even if there's an error you want to log. Only return 4xx/5xx for signature verification failures.

---

## Migration from Old System

If you had client-side payment processing before:

### What Changed

**Before:**
- ❌ All logic in `handlePaymentSuccess` on client
- ❌ Database updates in browser
- ❌ Failed if browser closed

**After:**
- ✅ Minimal client-side logic (just redirect)
- ✅ All processing in webhook
- ✅ Works even if browser closed

### Data Migration

No database migration needed! The new system is backward compatible.

---

## Support

If you encounter issues:

1. Check server logs (webhook processing)
2. Check Stripe dashboard (webhook delivery)
3. Check Supabase logs (database errors)
4. Review this guide's troubleshooting section

For urgent issues, the webhook handler logs detailed error messages to help with debugging.

---

## Summary

You now have a **production-ready, webhook-based payment system** that:

✅ Handles payments reliably (even if users close browser)
✅ Processes all logic server-side (secure)
✅ Handles duplicates gracefully (idempotent)
✅ Sends automated emails (customer + suppliers)
✅ Provides real-time status updates (polling)
✅ Scales with your business (webhook architecture)

**Next Steps:**
1. Test locally with Stripe CLI
2. Deploy to production
3. Configure production webhook in Stripe Dashboard
4. Monitor webhook success rate
5. Celebrate reliable payments! 🎉
