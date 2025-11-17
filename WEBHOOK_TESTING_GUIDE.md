# Quick Webhook Testing Guide

## Step-by-Step: Test Your Webhooks Locally

### 1. Start the Stripe CLI webhook listener

Open a **new terminal** and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You should see:
```
⣟ Getting ready...
> Ready! You are using Stripe API Version [2023-10-16]. Your webhook signing secret is whsec_xxxxx (^C to quit)
```

Copy the webhook secret (`whsec_xxxxx`) to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Keep this terminal open!** This forwards Stripe webhooks to your local server.

### 2. Start your Next.js dev server

In another terminal:

```bash
npm run dev
```

Watch for logs in this terminal.

### 3. Make a test payment

1. Go to your payment page: http://localhost:3000/payment
2. Use Stripe test card: **4242 4242 4242 4242**
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Postal: Any valid code (e.g., SW1A 1AA)
3. Click "Pay Securely"

### 4. Watch the logs! 👀

**Stripe CLI Terminal:**
```bash
2025-01-17 12:34:56  --> payment_intent.succeeded [evt_1ABC123]
2025-01-17 12:34:56  <-- [200] POST http://localhost:3000/api/webhooks/stripe [evt_1ABC123]
```

**Next.js Terminal:**
```bash
📨 Received webhook event: payment_intent.succeeded
✅ Payment succeeded: { id: 'pi_123ABC', amount: 5000, ... }
🔄 Processing payment for party abc-123
✅ Updated party abc-123 status to 'planned' and payment_status
📝 Updating 2 existing enquiries
✅ Updated payment status for all enquiries
📧 Sending supplier notification emails...
✅ Email sent to Magic Entertainment
✅ Email sent to SuperCakes Bakery
✅ Customer confirmation email sent
✅ Payment processing complete for party abc-123
✅ Payment processing completed successfully
```

**Browser:**
- You'll be on `/payment/processing` page
- Watch the loading spinner
- Should redirect to `/payment/success` within 1-3 seconds

### 5. Verify in Database

Check Supabase:

**Parties Table:**
```sql
SELECT id, status, payment_status, payment_intent_id
FROM parties
WHERE id = 'your-party-id';
```

Should show:
- `status`: `'planned'` (was `'draft'`)
- `payment_status`: `'partial_paid'` or `'fully_paid'`
- `payment_intent_id`: `'pi_123ABC...'`

**Enquiries Table:**
```sql
SELECT id, status, payment_status, supplier_category
FROM enquiries
WHERE party_id = 'your-party-id';
```

Should show:
- `status`: `'accepted'`
- `payment_status`: `'deposit_paid'` or `'fully_paid'`

---

## Troubleshooting

### ❌ "No webhook logs in terminal"

**Problem:** Stripe CLI not forwarding webhooks

**Solution:**
1. Check Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Make sure port 3000 matches your Next.js dev server
3. Check you're logged into Stripe CLI: `stripe login`

### ❌ "Webhook signature verification failed"

**Problem:** Wrong webhook secret or body parsing issue

**Solution:**
1. Copy the webhook secret from Stripe CLI terminal (starts with `whsec_`)
2. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
3. Restart Next.js dev server: `npm run dev`

**Check logs show:**
```bash
✅ Webhook signature verified
```

### ❌ "Payment stuck on processing page"

**Problem:** Webhook not reaching your server or webhook processing error

**Solution:**
1. Check **Next.js terminal** for webhook errors
2. Check **Stripe CLI terminal** shows `<-- [200]` (not 400/500)
3. Check database to see if party was updated:
   ```sql
   SELECT payment_status FROM parties WHERE id = 'your-party-id';
   ```
4. If payment_status is still `'pending'`, check for errors in webhook handler

### ❌ "Error: Failed to fetch party"

**Problem:** Supabase connection issue or wrong party_id

**Solution:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
2. Check party exists in database
3. Check webhook received correct `party_id` in metadata:
   ```bash
   # Look for this in Next.js logs:
   party_id: 'abc-123'
   ```

### ❌ "Emails not sending"

**Problem:** Postmark API issue or missing email templates

**Solution:**
1. Check `POSTMARK_API_TOKEN` is set
2. Check email API routes exist:
   - `/api/email/supplier-notification/route.js`
   - `/api/email/payment-confirmation/route.js`
3. **Note:** Webhook still succeeds even if emails fail (non-blocking)

---

## Test Different Payment Scenarios

### Test Successful Payment
**Card:** 4242 4242 4242 4242
**Expected:** Payment succeeds, webhook processes, booking confirmed

### Test Declined Card
**Card:** 4000 0000 0000 0002
**Expected:** Payment fails, webhook receives `payment_intent.payment_failed`

### Test 3D Secure (requires authentication)
**Card:** 4000 0025 0000 3155
**Expected:** Payment requires additional authentication, then succeeds

### Test Insufficient Funds
**Card:** 4000 0000 0000 9995
**Expected:** Payment fails with "insufficient funds" error

---

## Manually Trigger a Webhook (Testing without payment)

You can manually send a test webhook using Stripe CLI:

```bash
stripe trigger payment_intent.succeeded
```

This creates a fake payment intent and sends the webhook to your endpoint.

**Use case:** Test webhook handling without going through full payment flow.

---

## Check Webhook Status via API

You can also check webhook status programmatically:

```bash
curl "http://localhost:3000/api/check-payment-status?party_id=YOUR_PARTY_ID&payment_intent_id=pi_123ABC"
```

Response:
```json
{
  "status": "complete",
  "payment_status": "partial_paid",
  "party_status": "planned",
  "payment_intent_id": "pi_123ABC",
  "message": "Payment processed successfully"
}
```

---

## Production Webhook Monitoring

### Setup Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - ✅ `payment_intent.succeeded` (required)
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.processing`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to production environment variables

### Monitor Production Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. See all webhook deliveries:
   - ✅ Success (200 response)
   - ⏱️ Pending
   - ❌ Failed (with error details)
4. Click any delivery to see:
   - **Request body** sent to your server
   - **Response** your server returned
   - **Retry attempts** (if failed)

### Webhook Health Monitoring

Stripe provides webhook health metrics:
- **Success rate** (aim for >99%)
- **Average response time** (should be <5 seconds)
- **Failed deliveries** (investigate any failures)

---

## Summary: What You Should See

✅ **Stripe CLI Terminal:**
```
--> payment_intent.succeeded
<-- [200] POST http://localhost:3000/api/webhooks/stripe
```

✅ **Next.js Terminal:**
```
📨 Received webhook event: payment_intent.succeeded
✅ Payment processing completed successfully
```

✅ **Browser:**
- Redirected to `/payment/processing`
- Then redirected to `/payment/success`

✅ **Database:**
- Party: `status='planned'`, `payment_status='partial_paid'`
- Enquiries: `status='accepted'`, `payment_status='deposit_paid'`

✅ **Stripe Dashboard:**
- Event appears in Events tab
- Webhook delivery shows 200 OK

---

## Need Help?

Check logs in this order:
1. **Stripe CLI terminal** - Did webhook reach your server?
2. **Next.js terminal** - Any errors processing webhook?
3. **Stripe Dashboard** - Webhook delivery status
4. **Supabase** - Database changes
5. **Browser console** - Frontend errors

If webhook is failing, the detailed error logs will guide you to the issue!
