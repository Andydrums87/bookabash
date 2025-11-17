# How to Verify Webhooks Are Working

## For Local Development (Stripe CLI)

### ✅ Method 1: Check Events Tab in Stripe Dashboard

**This is where local test webhooks appear!**

1. Go to: https://dashboard.stripe.com/test/events
2. Look for your recent payment intent (should be at the top)
3. Click on the event (e.g., `payment_intent.succeeded`)
4. Scroll down to the **"Webhooks"** section
5. You should see: **"Sent to CLI"** with a timestamp

**Example:**
```
Event: payment_intent.succeeded
ID: evt_1ABC123xyz

Webhooks (1)
✓ Sent to CLI at 2025-11-17 09:29:54
```

### ✅ Method 2: Check Stripe CLI Terminal

Look for lines like this:

```bash
$ stripe listen --forward-to localhost:3000/api/webhooks/stripe

2025-11-17 09:29:54  --> payment_intent.succeeded [evt_1ABC123]
2025-11-17 09:29:54  <-- [200] POST http://localhost:3000/api/webhooks/stripe [evt_1ABC123]
```

**What each line means:**
- `-->` = Webhook sent to your local server
- `<-- [200]` = Your server responded with 200 OK (success!)
- `<-- [400]` or `<-- [500]` = Error (check logs)

### ✅ Method 3: Check Next.js Terminal Logs

Your `npm run dev` terminal should show detailed processing:

```bash
📨 Received webhook event: payment_intent.succeeded
✅ Payment succeeded: {
  id: 'pi_3ABC123xyz',
  amount: 5000,
  party_id: 'uuid-here',
  payment_method: ['card']
}
🔄 Processing payment for party uuid-here
✅ Updated party uuid-here status to 'planned' and payment_status
📝 Updating 2 existing enquiries
✅ Updated payment status for all enquiries
📧 Sending supplier notification emails...
✅ Email sent to Magic Entertainment
✅ Email sent to Birthday Cakes Co
✅ Customer confirmation email sent
✅ Payment processing complete for party uuid-here
✅ Payment processing completed successfully
```

### ✅ Method 4: Check Database (Supabase)

Verify the webhook actually updated your database:

**Query your parties table:**
```sql
SELECT
  id,
  status,
  payment_status,
  payment_intent_id,
  payment_date,
  updated_at
FROM parties
ORDER BY updated_at DESC
LIMIT 5;
```

**Expected result:**
- `status` should be `'planned'` (was `'draft'`)
- `payment_status` should be `'partial_paid'` or `'fully_paid'`
- `payment_intent_id` should match your Stripe payment intent

**Query enquiries table:**
```sql
SELECT
  id,
  party_id,
  status,
  payment_status,
  supplier_category,
  updated_at
FROM enquiries
WHERE party_id = 'your-party-id'
ORDER BY updated_at DESC;
```

**Expected result:**
- `status` should be `'accepted'`
- `payment_status` should be `'deposit_paid'` or `'fully_paid'`

### ✅ Method 5: Check Payment Processing Page

In your browser:
1. Complete a test payment
2. You should be redirected to `/payment/processing`
3. Watch the loading spinner (polls webhook status)
4. Should redirect to `/payment/success` within 1-3 seconds

**If it takes 30+ seconds:** Webhook might not be reaching your server

---

## For Production (Configured Webhook Endpoints)

### Setting Up Production Webhooks

**This is what the "Webhooks" tab in your screenshot is for!**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your production URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. Click **"Select events"**
5. Choose these events:
   - ✅ `payment_intent.succeeded` (required)
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.processing`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.refunded`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add to your production environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Viewing Production Webhooks

Once configured, the **"Webhooks"** tab will show:
- Your endpoint URL
- Recent webhook deliveries
- Success/failure rate
- Response times

**Click on your endpoint to see:**
- All webhook attempts
- Request/response details
- Retry attempts
- Error logs

---

## Common Confusion: Local vs Production Webhooks

### Local Development (Stripe CLI)
- ❌ Won't appear in "Webhooks" tab
- ✅ Appears in "Events" tab under each event
- ✅ Shows in Stripe CLI terminal
- ✅ Shows in Next.js terminal logs

### Production (Configured Endpoint)
- ✅ Appears in "Webhooks" tab
- ✅ Appears in "Events" tab under each event
- ✅ Shows in production server logs
- ✅ Monitored by Stripe dashboard

---

## Quick Checklist: Is My Webhook Working?

Run through this checklist:

### 1. Stripe CLI Shows Success
```bash
<-- [200] POST http://localhost:3000/api/webhooks/stripe
```
✅ If you see `[200]`, webhook reached your server

### 2. Next.js Logs Show Processing
```bash
✅ Payment processing completed successfully
```
✅ If you see this, webhook processed successfully

### 3. Database Updated
Check Supabase:
- Party status changed to `'planned'`
- Payment status set correctly
✅ If data changed, webhook worked!

### 4. User Experience
- User redirected to `/payment/processing`
- Then redirected to `/payment/success` within seconds
✅ If redirects work, full flow is working!

### 5. Emails Sent (Optional Check)
- Check Postmark dashboard for sent emails
- Or check email inbox for confirmation
✅ If emails arrive, full integration works!

---

## Troubleshooting: "I Don't See Any Evidence of Webhooks"

### Problem: No logs in Stripe CLI terminal

**Cause:** Stripe CLI not running or not connected

**Fix:**
```bash
# Make sure this is running in a separate terminal:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You should see:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

### Problem: No logs in Next.js terminal

**Cause:** Webhook secret mismatch or route error

**Fix:**
1. Check `.env.local` has correct webhook secret from Stripe CLI
2. Restart Next.js dev server: `npm run dev`
3. Check webhook route exists at `/api/webhooks/stripe/route.js`

### Problem: Stripe CLI shows `<-- [400]` or `<-- [500]`

**Cause:** Webhook processing error

**Fix:**
1. Check Next.js terminal for error details
2. Common issues:
   - Webhook secret mismatch (`<-- [400]`)
   - Database connection error (`<-- [500]`)
   - Missing environment variables (`<-- [500]`)

### Problem: Database not updating

**Cause:** Webhook receiving but processing logic failing

**Fix:**
1. Check Next.js logs for specific error:
   ```bash
   ❌ Error processing payment: [error details]
   ```
2. Common issues:
   - Missing `SUPABASE_SERVICE_ROLE_KEY`
   - Invalid party_id in payment metadata
   - Database permissions (RLS policies)

---

## Testing Without Making a Payment

You can test webhook handling directly:

```bash
stripe trigger payment_intent.succeeded
```

This creates a fake payment and sends the webhook to your local server.

**Check:**
1. Stripe CLI: `<-- [200]` response
2. Next.js logs: Processing messages
3. Note: Database won't update (fake party_id)

---

## Summary: Where to Look

**For Local Testing:**
1. 🔍 Stripe CLI terminal (`<-- [200]`)
2. 🔍 Next.js terminal (processing logs)
3. 🔍 Stripe Dashboard → **Events** tab (not Webhooks tab)
4. 🔍 Supabase database changes

**For Production:**
1. 🔍 Stripe Dashboard → **Webhooks** tab
2. 🔍 Production server logs
3. 🔍 Database changes
4. 🔍 Email confirmations

---

## Your Screenshot Explained

The "Webhooks" tab you're viewing is for **configured production endpoints**.

For local testing with Stripe CLI, check:
- **Dashboard → Events** (not Webhooks)
- **Stripe CLI terminal**
- **Next.js terminal**

Your webhooks ARE working if:
- ✅ Stripe CLI shows `<-- [200]`
- ✅ Next.js shows processing logs
- ✅ Database updates correctly
- ✅ User redirects to success page

The Webhooks tab will only show entries after you configure a production endpoint! 🎯
